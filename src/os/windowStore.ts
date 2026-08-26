"use client";

import { create } from "zustand";

import { getAppMeta } from "./appMeta";

export type Rect = { x: number; y: number; w: number; h: number };

export type WindowInstance = Rect & {
  /** 实例 id，同一个应用可以开多个窗口 */
  id: string;
  /** 对应 appRegistry 里的 key */
  appId: string;
  title: string;
  icon: string;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** 最大化之前的位置，还原时用 */
  restore?: Rect;
  /** 传给应用组件的参数，比如要展示哪个项目 */
  payload?: Record<string, unknown>;
};

export type OpenOptions = {
  title?: string;
  icon?: string;
  payload?: Record<string, unknown>;
  /** 同一 appId + 同一 dedupeKey 只允许开一个窗口 */
  dedupeKey?: string;
};

type WindowStore = {
  windows: WindowInstance[];
  activeId: string | null;
  topZ: number;
  open: (appId: string, options?: OpenOptions) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  /** 任务栏按钮：已聚焦则最小化，否则还原并聚焦 */
  toggleFromTaskbar: (id: string) => void;
  toggleMaximize: (id: string) => void;
  setRect: (id: string, rect: Partial<Rect>) => void;
  closeAll: () => void;
};

const TASKBAR_HEIGHT = 40;

/**
 * 新窗口做阶梯式偏移，避免完全重叠。
 * 同时兜底：窗口不能超出可视区域。
 */
function nextPosition(count: number, w: number, h: number): { x: number; y: number } {
  const viewportW = typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportH = typeof window === "undefined" ? 800 : window.innerHeight - TASKBAR_HEIGHT;

  const step = 28;
  const offset = (count % 6) * step;
  const baseX = Math.max(8, (viewportW - w) / 2 - 60);
  const baseY = Math.max(8, (viewportH - h) / 2 - 40);

  return {
    x: Math.min(Math.max(8, baseX + offset), Math.max(8, viewportW - w - 8)),
    y: Math.min(Math.max(8, baseY + offset), Math.max(8, viewportH - h - 8)),
  };
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeId: null,
  topZ: 10,

  open: (appId, options = {}) => {
    const { windows, topZ } = get();

    const dedupeKey = options.dedupeKey ?? appId;
    const existing = windows.find(
      (w) => w.appId === appId && (w.payload?.__key ?? w.appId) === dedupeKey,
    );
    if (existing) {
      get().focus(existing.id);
      set((s) => ({
        windows: s.windows.map((w) =>
          w.id === existing.id ? { ...w, minimized: false } : w,
        ),
      }));
      return;
    }

    const app = getAppMeta(appId);
    if (!app) return;

    const viewportW = typeof window === "undefined" ? 1280 : window.innerWidth;
    const viewportH = typeof window === "undefined" ? 800 : window.innerHeight - TASKBAR_HEIGHT;

    const w = Math.min(app.defaultSize.w, viewportW - 16);
    const h = Math.min(app.defaultSize.h, viewportH - 16);
    const { x, y } = nextPosition(windows.length, w, h);

    const id = `${appId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const z = topZ + 1;

    set({
      topZ: z,
      activeId: id,
      windows: [
        ...windows,
        {
          id,
          appId,
          title: options.title ?? app.title,
          icon: options.icon ?? app.icon,
          x,
          y,
          w,
          h,
          z,
          minimized: false,
          maximized: false,
          payload: { ...options.payload, __key: dedupeKey },
        },
      ],
    });
  },

  close: (id) =>
    set((s) => {
      const windows = s.windows.filter((w) => w.id !== id);
      const activeId =
        s.activeId === id
          ? windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]?.id ?? null
          : s.activeId;
      return { windows, activeId };
    }),

  focus: (id) =>
    set((s) => {
      if (s.activeId === id) return s;
      const z = s.topZ + 1;
      return {
        topZ: z,
        activeId: id,
        windows: s.windows.map((w) => (w.id === id ? { ...w, z } : w)),
      };
    }),

  minimize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
      activeId:
        s.activeId === id
          ? s.windows.filter((w) => w.id !== id && !w.minimized).sort((a, b) => b.z - a.z)[0]
              ?.id ?? null
          : s.activeId,
    })),

  toggleFromTaskbar: (id) => {
    const { activeId, windows } = get();
    const target = windows.find((w) => w.id === id);
    if (!target) return;
    if (target.minimized) {
      set((s) => ({
        windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: false } : w)),
      }));
      get().focus(id);
      return;
    }
    if (activeId === id) {
      get().minimize(id);
      return;
    }
    get().focus(id);
  },

  toggleMaximize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          const r = w.restore ?? { x: w.x, y: w.y, w: w.w, h: w.h };
          return { ...w, ...r, maximized: false, restore: undefined };
        }
        return {
          ...w,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          maximized: true,
        };
      }),
    })),

  setRect: (id, rect) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, ...rect } : w)),
    })),

  closeAll: () => set({ windows: [], activeId: null }),
}));

export { TASKBAR_HEIGHT };
