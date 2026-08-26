"use client";

import { useSyncExternalStore } from "react";

import { iconFor } from "@/os/icons";
import { useSystemStore } from "@/os/systemStore";
import { useWindowStore } from "@/os/windowStore";

import StartMenu from "./StartMenu";
import styles from "./Taskbar.module.css";

function subscribeToMinute(onChange: () => void) {
  const timer = setInterval(onChange, 15_000);
  return () => clearInterval(timer);
}

/**
 * 快照必须是稳定值，否则 React 会认为状态一直在变而不停重渲染，
 * 所以这里取「第几分钟」而不是精确到毫秒的时间戳。
 */
function getMinuteBucket() {
  return Math.floor(Date.now() / 60_000);
}

/** 服务端渲染时没有时间，返回 null 让它显示占位符，避免 hydration 不一致 */
function getServerSnapshot(): number | null {
  return null;
}

function Clock() {
  const bucket = useSyncExternalStore(subscribeToMinute, getMinuteBucket, getServerSnapshot);

  return (
    <span className={styles.clock}>
      {bucket === null
        ? "--:--"
        : new Date(bucket * 60_000).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
    </span>
  );
}

export default function Taskbar() {
  const windows = useWindowStore((s) => s.windows);
  const activeId = useWindowStore((s) => s.activeId);
  const toggleFromTaskbar = useWindowStore((s) => s.toggleFromTaskbar);

  const startMenuOpen = useSystemStore((s) => s.startMenuOpen);
  const toggleStartMenu = useSystemStore((s) => s.toggleStartMenu);

  return (
    <>
      {startMenuOpen && <StartMenu />}

      <div className={styles.taskbar}>
        <button
          type="button"
          data-start-button
          className={`${styles.start} ${startMenuOpen ? styles.startOpen : ""}`}
          onClick={toggleStartMenu}
        >
          <span className={styles.startFlag} aria-hidden>
            ⊞
          </span>
          开始
        </button>

        <div className={styles.tasks}>
          {windows.map((win) => (
            <button
              key={win.id}
              type="button"
              className={`${styles.task} ${
                win.id === activeId && !win.minimized ? styles.taskActive : ""
              }`}
              onClick={() => toggleFromTaskbar(win.id)}
              title={win.title}
            >
              <span aria-hidden>{iconFor(win.icon)}</span>
              <span className={styles.taskLabel}>{win.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.tray}>
          <Clock />
        </div>
      </div>
    </>
  );
}
