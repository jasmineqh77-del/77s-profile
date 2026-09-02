"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { site } from "@content/site";

import { APPS, type AppMeta } from "@/os/appMeta";
import { useSystemStore } from "@/os/systemStore";
import { useWindowStore } from "@/os/windowStore";

import AppIcon from "./AppIcon";
import IpAvatar from "./IpAvatar";
import styles from "./StartMenu.module.css";

export default function StartMenu() {
  const setStartMenuOpen = useSystemStore((s) => s.setStartMenuOpen);
  const setPhase = useSystemStore((s) => s.setPhase);
  const triggerBsod = useSystemStore((s) => s.triggerBsod);
  const open = useWindowStore((s) => s.open);
  const closeAll = useWindowStore((s) => s.closeAll);

  const menuRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  // 点菜单外面或按 Esc 都关掉
  useEffect(() => {
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      // 开始按钮自己会 toggle，别在这里重复关闭
      if ((target as HTMLElement).closest?.("[data-start-button]")) return;
      setStartMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStartMenuOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKey);
    };
  }, [setStartMenuOpen]);

  const { leftApps, rightApps } = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const keep = (a: AppMeta) => !needle || a.title.toLowerCase().includes(needle);
    return {
      leftApps: APPS.filter((a) => a.startMenu === "left" && keep(a)),
      rightApps: APPS.filter((a) => a.startMenu === "right" && keep(a)),
    };
  }, [query]);

  const launch = (appId: string) => {
    open(appId);
    setStartMenuOpen(false);
  };

  const renderApp = (app: AppMeta) => (
    <li key={app.id}>
      <button
        type="button"
        className={`chrome-button ${styles.item}`}
        onClick={() => launch(app.id)}
      >
        <AppIcon icon={app.icon} size={20} className={styles.itemIcon} />
        <span className={styles.itemLabel}>{app.title}</span>
      </button>
    </li>
  );

  return (
    <div className={styles.menu} ref={menuRef}>
      {/* 左栏：程序列表，底部是搜索框 */}
      <div className={styles.left}>
        <ul className={styles.items}>
          {leftApps.map(renderApp)}
          {leftApps.length > 0 && rightApps.length > 0 && <li className={styles.separator} />}
          {rightApps.map(renderApp)}
          {leftApps.length === 0 && rightApps.length === 0 && (
            <li className={styles.empty}>No programs match “{query.trim()}”</li>
          )}
        </ul>

        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.search}
            placeholder="Search programs and files"
            aria-label="Search programs and files"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 右栏：用户和系统项，头像悬在面板上沿之外 */}
      <div className={styles.right}>
        <div className={styles.user}>
          <IpAvatar variant="coffee" size={56} className={styles.userAvatar} />
          <span className={styles.userName}>{site.userName}</span>
        </div>

        <ul className={styles.places}>
          <li>
            <button
              type="button"
              className={`chrome-button ${styles.place}`}
              onClick={() => {
                setStartMenuOpen(false);
                triggerBsod();
              }}
            >
              Don&apos;t Click This
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`chrome-button ${styles.place}`}
              onClick={() => {
                closeAll();
                setPhase("login");
              }}
            >
              Log Off {site.userName}…
            </button>
          </li>
        </ul>

        <div className={styles.footer}>
          <button
            type="button"
            className={`chrome-button ${styles.shutdown}`}
            onClick={() => {
              closeAll();
              setPhase("shutdown");
            }}
          >
            Shut Down
          </button>
        </div>
      </div>
    </div>
  );
}
