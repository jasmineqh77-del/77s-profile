"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useSystemStore } from "@/os/systemStore";
import { useWindowStore } from "@/os/windowStore";

import AppIcon from "./AppIcon";
import StartMenu from "./StartMenu";
import StartOrb from "./StartOrb";
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

function formatCount(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(6, "0");
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = Array.from({ length: first }, () => null);
  for (let day = 1; day <= days; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M2 6h2.2L8 3.2v9.6L4.2 10H2z"
      />
      {muted ? (
        <path fill="none" stroke="currentColor" strokeWidth="1.4" d="M10 5.2 14.2 10.8M14.2 5.2 10 10.8" />
      ) : (
        <>
          <path fill="none" stroke="currentColor" strokeWidth="1.2" d="M9.6 6.2a2.4 2.4 0 0 1 0 3.6" />
          <path fill="none" stroke="currentColor" strokeWidth="1.2" d="M11.4 4.6a4.4 4.4 0 0 1 0 6.8" />
        </>
      )}
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        d="M2.5 11.2a6.5 6.5 0 0 1 11 0M4.4 9.4a4 4 0 0 1 7.2 0M6.4 7.6a1.8 1.8 0 0 1 3.2 0"
      />
      <circle cx="8" cy="13" r="1.1" fill="currentColor" />
    </svg>
  );
}

function Clock({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const bucket = useSyncExternalStore(subscribeToMinute, getMinuteBucket, getServerSnapshot);
  const now = bucket === null ? null : new Date(bucket * 60_000);
  const label =
    now === null
      ? "--:--"
      : now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const title =
    now === null
      ? undefined
      : now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <button
      type="button"
      data-tray-clock
      className={`chrome-button ${styles.clock} ${open ? styles.trayActive : ""}`}
      aria-expanded={open}
      aria-label="Clock"
      title={title}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}

function Calendar({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const cells = monthCells(year, month);
  const heading = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (panelRef.current?.contains(target)) return;
      if (target.closest?.("[data-tray-clock]")) return;
      onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div ref={panelRef} className={styles.calendar} role="dialog" aria-label={heading}>
      <p className={styles.calendarHeading}>{heading}</p>
      <div className={styles.calendarGrid}>
        {WEEKDAYS.map((day) => (
          <span key={day} className={styles.calendarDow}>
            {day}
          </span>
        ))}
        {cells.map((day, index) => (
          <span
            key={index}
            className={`${styles.calendarDay} ${day === today ? styles.calendarToday : ""}`}
          >
            {day ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Taskbar() {
  const windows = useWindowStore((s) => s.windows);
  const activeId = useWindowStore((s) => s.activeId);
  const toggleFromTaskbar = useWindowStore((s) => s.toggleFromTaskbar);
  const open = useWindowStore((s) => s.open);

  const startMenuOpen = useSystemStore((s) => s.startMenuOpen);
  const toggleStartMenu = useSystemStore((s) => s.toggleStartMenu);
  const setStartMenuOpen = useSystemStore((s) => s.setStartMenuOpen);

  const [muted, setMuted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    if (startMenuOpen) setCalendarOpen(false);
  }, [startMenuOpen]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/visits")
      .then((res) => res.json())
      .then((data: { count?: number }) => {
        if (!cancelled && typeof data.count === "number") setVisitCount(data.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCalendar = () => {
    setCalendarOpen((openNow) => {
      const next = !openNow;
      if (next) setStartMenuOpen(false);
      return next;
    });
  };

  return (
    <>
      {startMenuOpen && <StartMenu />}
      {calendarOpen && <Calendar onClose={() => setCalendarOpen(false)} />}

      <div className={styles.taskbar}>
        <button
          type="button"
          data-start-button
          aria-label="Start"
          className={`chrome-button ${styles.start} ${startMenuOpen ? styles.startOpen : ""}`}
          onClick={toggleStartMenu}
        >
          <span className={styles.startOrbInner}>
            <StartOrb />
          </span>
        </button>

        <div className={styles.tasks}>
          {windows.map((win) => (
            <button
              key={win.id}
              type="button"
              className={`chrome-button ${styles.task} ${
                win.id === activeId && !win.minimized ? styles.taskActive : ""
              }`}
              onClick={() => toggleFromTaskbar(win.id)}
              title={win.title}
            >
              <AppIcon icon={win.icon} size={16} />
              <span className={styles.taskLabel}>{win.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.tray}>
          <button
            type="button"
            className={`chrome-button ${styles.trayIcon} ${styles.trayHideMobile}`}
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={muted}
            title={muted ? "Muted" : "Volume"}
            onClick={() => setMuted((value) => !value)}
          >
            <SpeakerIcon muted={muted} />
          </button>
          <button
            type="button"
            className={`chrome-button ${styles.trayIcon} ${styles.trayHideMobile}`}
            aria-label="Network"
            title="Local Area Connection: Connected"
          >
            <NetworkIcon />
          </button>
          <button
            type="button"
            className={`chrome-button ${styles.visitCount}`}
            aria-label="Visitor count"
            title="Visitor Counter"
            onClick={() =>
              open("visitor-counter", { title: "Visitor Counter", dedupeKey: "visitor-counter" })
            }
          >
            {visitCount === null ? "------" : formatCount(visitCount)}
          </button>
          <Clock open={calendarOpen} onToggle={toggleCalendar} />
        </div>
      </div>
    </>
  );
}
