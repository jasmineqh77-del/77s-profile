"use client";

import { create } from "zustand";

/**
 * boot     开机自检 + 加载条
 * login    登录画面，点头像进桌面
 * desktop  正常使用
 * shutdown 关机画面
 */
export type SystemPhase = "boot" | "login" | "desktop" | "shutdown";

type SystemStore = {
  phase: SystemPhase;
  startMenuOpen: boolean;
  bsod: boolean;
  setPhase: (phase: SystemPhase) => void;
  setStartMenuOpen: (open: boolean) => void;
  toggleStartMenu: () => void;
  triggerBsod: () => void;
  dismissBsod: () => void;
  restart: () => void;
};

export const useSystemStore = create<SystemStore>((set) => ({
  phase: "boot",
  startMenuOpen: false,
  bsod: false,

  setPhase: (phase) => set({ phase, startMenuOpen: false }),
  setStartMenuOpen: (startMenuOpen) => set({ startMenuOpen }),
  toggleStartMenu: () => set((s) => ({ startMenuOpen: !s.startMenuOpen })),

  triggerBsod: () => set({ bsod: true, startMenuOpen: false }),
  dismissBsod: () => set({ bsod: false }),

  restart: () => set({ phase: "boot", startMenuOpen: false, bsod: false }),
}));
