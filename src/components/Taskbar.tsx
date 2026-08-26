"use client";

import { useEffect, useState } from "react";

import { iconFor } from "@/os/icons";
import { useSystemStore } from "@/os/systemStore";
import { useWindowStore } from "@/os/windowStore";

import StartMenu from "./StartMenu";
import styles from "./Taskbar.module.css";

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  // 服务端渲染不出时间，挂载后再显示，避免 hydration 不一致
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={styles.clock}>
      {now
        ? now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "--:--"}
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
