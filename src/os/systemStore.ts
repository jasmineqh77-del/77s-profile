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
  /** 「返场欢迎」覆盖层是否正在展示 */
  welcomeBack: boolean;
  /** 当前这次展示是否要倒计时自动关闭；false = 演示模式，只能点击退出 */
  welcomeBackAutoClose: boolean;
  /** 一次会话只展示一次，展示过就锁住，刷新页面才会重置；只受「自动」触发影响 */
  welcomeBackShown: boolean;
  /** 桌面右侧 Sidebar 打开的 canvas 网格「活壁纸」；默认关，会话内有效 */
  interactiveWallpaper: boolean;
  /**
   * Vista/7 SwitchDesktopWithFade：登录 → 黑场 → 桌面。
   * true 时叠全黑遮罩；先盖住登录屏淡入黑，再切桌面并淡出。
   */
  loginFade: boolean;
  setPhase: (phase: SystemPhase) => void;
  setStartMenuOpen: (open: boolean) => void;
  toggleStartMenu: () => void;
  triggerBsod: () => void;
  dismissBsod: () => void;
  triggerWelcomeBack: (options?: { autoClose?: boolean }) => void;
  dismissWelcomeBack: () => void;
  toggleInteractiveWallpaper: () => void;
  /** 点 Guest：开黑场过渡（phase 仍为 login，全黑后再切 desktop） */
  beginDesktopEntry: () => void;
  /** 黑场淡出结束，卸掉遮罩 */
  finishLoginFade: () => void;
  restart: () => void;
};

export const useSystemStore = create<SystemStore>((set) => ({
  phase: "boot",
  startMenuOpen: false,
  bsod: false,
  welcomeBack: false,
  welcomeBackAutoClose: true,
  welcomeBackShown: false,
  interactiveWallpaper: false,
  loginFade: false,

  setPhase: (phase) => set({ phase, startMenuOpen: false }),
  setStartMenuOpen: (startMenuOpen) => set({ startMenuOpen }),
  toggleStartMenu: () => set((s) => ({ startMenuOpen: !s.startMenuOpen })),

  triggerBsod: () => set({ bsod: true, startMenuOpen: false }),
  dismissBsod: () => set({ bsod: false }),

  // 演示模式（design 文件夹里点开的那个）不标记 welcomeBackShown，
  // 不然先点了一次演示，这次会话就再也不会自动弹出真实的欢迎回来了
  triggerWelcomeBack: (options) =>
    set((s) => {
      const autoClose = options?.autoClose ?? true;
      return {
        welcomeBack: true,
        startMenuOpen: false,
        welcomeBackAutoClose: autoClose,
        welcomeBackShown: autoClose ? true : s.welcomeBackShown,
      };
    }),
  dismissWelcomeBack: () => set({ welcomeBack: false }),

  toggleInteractiveWallpaper: () =>
    set((s) => ({ interactiveWallpaper: !s.interactiveWallpaper })),

  beginDesktopEntry: () => set({ loginFade: true, startMenuOpen: false }),
  finishLoginFade: () => set({ loginFade: false }),

  restart: () =>
    set({ phase: "boot", startMenuOpen: false, bsod: false, loginFade: false }),
}));
