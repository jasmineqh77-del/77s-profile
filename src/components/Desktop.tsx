"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Post } from "@/lib/posts";
import { DESKTOP_APPS } from "@/os/appMeta";
import { DESKTOP_WALLPAPER_URL } from "@/os/preloadAssets";
import { usePostsStore } from "@/os/postsStore";
import { useSystemStore } from "@/os/systemStore";
import { useIsMobile } from "@/os/useIsMobile";
import { useWindowStore } from "@/os/windowStore";

import Assistant from "./Assistant";
import Bsod from "./Bsod";
import { BootScreen, LoginScreen, ShutdownScreen } from "./BootScreen";
import ContextMenu, { type MenuItem } from "./ContextMenu";
import DesignFlyout from "./DesignFlyout";
import DesktopIcon from "./DesktopIcon";
import InteractiveWallpaper from "./InteractiveWallpaper";
import LoginFade from "./LoginFade";
import Taskbar from "./Taskbar";
import WallpaperSidebar from "./WallpaperSidebar";
import WelcomeBack from "./WelcomeBack";
import WindowFrame from "./WindowFrame";
import styles from "./Desktop.module.css";

/** 桌面左侧单独一列的文件夹（顺序固定） */
const FOLDER_COLUMN_IDS = ["projects", "design", "moments"] as const;

// 切走标签页超过这个时长再切回来，才算「离开了一段时间」，弹一次欢迎回来
const AWAY_THRESHOLD_MS = 20_000;

/*
 * globals.css 里 --cur-* 用到的全部指针，文件名就是角色名。
 * 浏览器要等第一次真正需要某个指针时才去取图，取到之前会先退回系统指针，
 * 于是第一次悬停按钮、第一次拖窗口边框都会闪一下。这里提前取回来，
 * 之后切换就只是换一张已经解好的图。11 张加起来不到 4KB。
 */
const CURSOR_ROLES = [
  "default",
  "pointer",
  "text",
  "crosshair",
  "ns-resize",
  "ew-resize",
  "nwse-resize",
  "nesw-resize",
  "not-allowed",
  "progress",
  "wait",
];

type IconSort = "default" | "name";

export default function Desktop({ posts }: { posts: Post[] }) {
  const phase = useSystemStore((s) => s.phase);
  const bsod = useSystemStore((s) => s.bsod);
  const welcomeBack = useSystemStore((s) => s.welcomeBack);
  const welcomeBackShown = useSystemStore((s) => s.welcomeBackShown);
  const interactiveWallpaper = useSystemStore((s) => s.interactiveWallpaper);
  const loginFade = useSystemStore((s) => s.loginFade);
  const triggerWelcomeBack = useSystemStore((s) => s.triggerWelcomeBack);
  const setStartMenuOpen = useSystemStore((s) => s.setStartMenuOpen);

  const windows = useWindowStore((s) => s.windows);
  const activeId = useWindowStore((s) => s.activeId);
  const open = useWindowStore((s) => s.open);

  const setPosts = usePostsStore((s) => s.setPosts);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null);
  const [iconSort, setIconSort] = useState<IconSort>("default");
  // 变一次值就让图标重新挂载，播一遍淡入，模拟「刷新」
  const [refreshKey, setRefreshKey] = useState(0);

  // "design" 文件夹原地展开的缩略图浮层：不开窗口，直接从图标坐标边上长出来
  const [designExpanded, setDesignExpanded] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState<{ left: number; top: number } | null>(null);
  const designIconRef = useRef<HTMLButtonElement>(null);

  const isMobile = useIsMobile();

  // 文章在服务端构建时读好，这里灌进 store 给博客窗口用
  useEffect(() => {
    setPosts(posts);
  }, [posts, setPosts]);

  // 进桌面后静默记一次访客（cookie 去重，失败就忽略，不影响桌面）
  useEffect(() => {
    if (phase !== "desktop") return;
    void fetch("/api/visits", { method: "POST" }).catch(() => {});
  }, [phase]);

  // 趁开机动画那几秒把指针图都预热掉，省得后面第一次悬停时闪一下
  useEffect(() => {
    for (const role of CURSOR_ROLES) {
      const image = new Image();
      image.src = `/cursors/${role}.png`;
    }
  }, []);

  // 切走标签页/切到别的网址再切回来，离开够久就弹一次「欢迎回来」。
  // 监听器只挂一次，用 ref 存最新的 phase/bsod/welcomeBackShown，
  // 避免闭包拿到挂载那一刻的旧值。
  const latestRef = useRef({ phase, bsod, welcomeBackShown });
  useEffect(() => {
    latestRef.current = { phase, bsod, welcomeBackShown };
  }, [phase, bsod, welcomeBackShown]);

  useEffect(() => {
    let hiddenAt: number | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt === null) return;

      const awayMs = Date.now() - hiddenAt;
      hiddenAt = null;

      const { phase: currentPhase, bsod: currentBsod, welcomeBackShown: shown } = latestRef.current;
      if (awayMs >= AWAY_THRESHOLD_MS && currentPhase === "desktop" && !currentBsod && !shown) {
        triggerWelcomeBack();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [triggerWelcomeBack]);

  const FLYOUT_GAP = 8;
  const FLYOUT_WIDTH = 100; // 跟 DesignFlyout.module.css 里 .tile 的宽度对齐

  const toggleDesignFolder = () => {
    if (designExpanded) {
      setDesignExpanded(false);
      return;
    }
    const rect = designIconRef.current?.getBoundingClientRect();
    if (!rect) return;
    const overflowsRight = rect.right + FLYOUT_GAP + FLYOUT_WIDTH > window.innerWidth - 8;
    setFlyoutPos(
      overflowsRight
        ? { left: rect.left, top: rect.bottom + FLYOUT_GAP } // 横向放不下就往下长，防止在窄屏上跑出视口
        : { left: rect.right + FLYOUT_GAP, top: rect.top },
    );
    setDesignExpanded(true);
  };

  // 窗口尺寸变化时之前量好的坐标就作废了，直接收起，比持续重算更省事也更不容易出 bug
  useEffect(() => {
    const onResize = () => setDesignExpanded(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { folderIcons, appIcons } = useMemo(() => {
    const folderIdSet = new Set<string>(FOLDER_COLUMN_IDS);
    const folders = FOLDER_COLUMN_IDS.map((id) =>
      DESKTOP_APPS.find((app) => app.id === id),
    ).filter((app): app is (typeof DESKTOP_APPS)[number] => Boolean(app));
    const rest = DESKTOP_APPS.filter((app) => !folderIdSet.has(app.id));
    if (iconSort === "name") {
      const byName = (a: (typeof DESKTOP_APPS)[number], b: (typeof DESKTOP_APPS)[number]) =>
        a.title.localeCompare(b.title, "en");
      return {
        folderIcons: [...folders].sort(byName),
        appIcons: [...rest].sort(byName),
      };
    }
    return { folderIcons: folders, appIcons: rest };
  }, [iconSort]);

  const renderDesktopIcon = (app: (typeof DESKTOP_APPS)[number]) => (
    <DesktopIcon
      key={app.id}
      ref={app.id === "design" ? designIconRef : undefined}
      label={app.title}
      icon={app.icon}
      selected={selectedIcon === app.id || (app.id === "design" && designExpanded)}
      singleClickToOpen={isMobile}
      onSelect={() => setSelectedIcon(app.id)}
      onOpen={() => (app.id === "design" ? toggleDesignFolder() : open(app.id))}
    />
  );

  const menuItems: MenuItem[] = [
    {
      kind: "item",
      label: iconSort === "name" ? "Arrange Icons (Restore Default)" : "Arrange Icons (by Name)",
      onSelect: () => setIconSort((s) => (s === "name" ? "default" : "name")),
    },
    { kind: "item", label: "Refresh", onSelect: () => setRefreshKey((k) => k + 1) },
    { kind: "separator" },
    { kind: "item", label: "New", disabled: true },
    { kind: "item", label: "Paste", disabled: true },
    { kind: "separator" },
    { kind: "item", label: "Properties", onSelect: () => open("about") },
  ];

  const shell =
    phase === "boot" ? (
      <BootScreen />
    ) : phase === "login" ? (
      <LoginScreen />
    ) : phase === "shutdown" ? (
      <ShutdownScreen />
    ) : (
      <div
        className={`${styles.desktop}${interactiveWallpaper ? ` ${styles.desktopLive}` : ""}`}
        onPointerDown={(e) => {
          // 点空白处取消图标选中，收起开始菜单，也收起 design 文件夹的展开浮层
          if (e.target === e.currentTarget) {
            setSelectedIcon(null);
            setStartMenuOpen(false);
            setDesignExpanded(false);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setSelectedIcon(null);
          setStartMenuOpen(false);
          setMenuAt({ x: e.clientX, y: e.clientY });
        }}
      >
        {!interactiveWallpaper && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- 壁纸要原生 decode/priority，不走 next/image 管道 */}
            <img
              src={DESKTOP_WALLPAPER_URL}
              alt=""
              aria-hidden
              className={styles.wallpaper}
              draggable={false}
              decoding="async"
              fetchPriority="high"
            />
            <div className={styles.vignette} aria-hidden />
          </>
        )}

        {interactiveWallpaper && <InteractiveWallpaper />}

        <div className={styles.iconGrid} key={refreshKey}>
          <div className={`${styles.iconColumn} ${styles.iconColumnApps}`}>
            {appIcons.map(renderDesktopIcon)}
          </div>
          <div className={`${styles.iconColumn} ${styles.iconColumnFolders}`}>
            {folderIcons.map(renderDesktopIcon)}
          </div>
        </div>

        <WallpaperSidebar />

        {designExpanded && flyoutPos && (
          <DesignFlyout
            left={flyoutPos.left}
            top={flyoutPos.top}
            isMobile={isMobile}
            onOpened={() => setDesignExpanded(false)}
          />
        )}

        {windows.map((win) => (
            <WindowFrame
              key={win.id}
              win={win}
              isActive={win.id === activeId}
              isMobile={isMobile}
            />
          ))}

        <Assistant />

        <Taskbar />

        {menuAt && (
          <ContextMenu
            x={menuAt.x}
            y={menuAt.y}
            items={menuItems}
            onClose={() => setMenuAt(null)}
          />
        )}

        {bsod && <Bsod />}
        {welcomeBack && <WelcomeBack />}
      </div>
    );

  // LoginFade 必须挂在 phase 分支外：login→desktop 切换时不能卸载，否则黑场会重头播
  return (
    <>
      {shell}
      {loginFade && <LoginFade />}
    </>
  );
}
