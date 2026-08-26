"use client";

import { useEffect, useRef } from "react";

import { site } from "@content/site";

import { APPS } from "@/os/appMeta";
import { iconFor } from "@/os/icons";
import { useSystemStore } from "@/os/systemStore";
import { useWindowStore } from "@/os/windowStore";

import styles from "./StartMenu.module.css";

export default function StartMenu() {
  const setStartMenuOpen = useSystemStore((s) => s.setStartMenuOpen);
  const setPhase = useSystemStore((s) => s.setPhase);
  const triggerBsod = useSystemStore((s) => s.triggerBsod);
  const open = useWindowStore((s) => s.open);
  const closeAll = useWindowStore((s) => s.closeAll);

  const menuRef = useRef<HTMLDivElement>(null);

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

  const leftApps = APPS.filter((a) => a.startMenu === "left");
  const rightApps = APPS.filter((a) => a.startMenu === "right");

  const launch = (appId: string) => {
    open(appId);
    setStartMenuOpen(false);
  };

  return (
    <div className={styles.menu} ref={menuRef}>
      <div className={styles.header}>
        <span className={styles.avatar} aria-hidden>
          🙂
        </span>
        <span className={styles.headerName}>{site.userName}</span>
      </div>

      <div className={styles.columns}>
        <ul className={styles.column}>
          {leftApps.map((app) => (
            <li key={app.id}>
              <button type="button" className={styles.item} onClick={() => launch(app.id)}>
                <span className={styles.itemIcon} aria-hidden>
                  {iconFor(app.icon)}
                </span>
                <span className={styles.itemLabel}>{app.title}</span>
              </button>
            </li>
          ))}
        </ul>

        <ul className={`${styles.column} ${styles.columnRight}`}>
          {rightApps.map((app) => (
            <li key={app.id}>
              <button type="button" className={styles.item} onClick={() => launch(app.id)}>
                <span className={styles.itemIcon} aria-hidden>
                  {iconFor(app.icon)}
                </span>
                <span className={styles.itemLabel}>{app.title}</span>
              </button>
            </li>
          ))}
          <li className={styles.separator} />
          <li>
            <button
              type="button"
              className={styles.item}
              onClick={() => {
                setStartMenuOpen(false);
                triggerBsod();
              }}
            >
              <span className={styles.itemIcon} aria-hidden>
                💥
              </span>
              <span className={styles.itemLabel}>别点这个</span>
            </button>
          </li>
        </ul>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.footerButton}
          onClick={() => {
            closeAll();
            setPhase("login");
          }}
        >
          <span aria-hidden>🔒</span> 注销
        </button>
        <button
          type="button"
          className={styles.footerButton}
          onClick={() => {
            closeAll();
            setPhase("shutdown");
          }}
        >
          <span aria-hidden>⏻</span> 关闭计算机
        </button>
      </div>
    </div>
  );
}
