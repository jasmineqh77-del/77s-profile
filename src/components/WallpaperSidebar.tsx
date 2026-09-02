"use client";

import { useEffect, useState } from "react";

import { useSystemStore } from "@/os/systemStore";

import styles from "./WallpaperSidebar.module.css";

/**
 * 桌面右侧 Vista 风格小工具：开关 canvas 网格活壁纸。
 * prefers-reduced-motion 时不渲染，避免动效入口本身也成干扰。
 */
export default function WallpaperSidebar() {
  const interactive = useSystemStore((s) => s.interactiveWallpaper);
  const toggle = useSystemStore((s) => s.toggleInteractiveWallpaper);
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const ok = !query.matches;
      setMotionOk(ok);
      // 系统后来开了减少动态效果：把已开启的活壁纸关掉
      if (!ok && useSystemStore.getState().interactiveWallpaper) {
        useSystemStore.getState().toggleInteractiveWallpaper();
      }
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!motionOk) return null;

  return (
    <aside className={styles.sidebar} aria-label="Wallpaper gadget">
      <div className={styles.title}>Wallpaper</div>
      <button
        type="button"
        className={`chrome-button ${styles.toggle}`}
        aria-pressed={interactive}
        onClick={toggle}
      >
        {interactive ? "Classic wallpaper" : "Live wallpaper"}
      </button>
    </aside>
  );
}
