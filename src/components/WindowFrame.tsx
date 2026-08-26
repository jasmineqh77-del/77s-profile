"use client";

import { useCallback } from "react";

import AppSurface from "@/os/appRegistry";
import { MIN_WINDOW_SIZE, startPointerDrag, type ResizeDirection } from "@/os/pointerDrag";
import { TASKBAR_HEIGHT, useWindowStore, type WindowInstance } from "@/os/windowStore";

import styles from "./WindowFrame.module.css";

const RESIZE_DIRECTIONS: ResizeDirection[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

type Props = {
  win: WindowInstance;
  isActive: boolean;
  /** 移动端窗口一律全屏，禁用拖拽和缩放 */
  isMobile: boolean;
};

export default function WindowFrame({ win, isActive, isMobile }: Props) {
  // 逐个订阅 action，避免整个 store 变化时所有窗口一起重渲染
  const focus = useWindowStore((s) => s.focus);
  const close = useWindowStore((s) => s.close);
  const minimize = useWindowStore((s) => s.minimize);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const setRect = useWindowStore((s) => s.setRect);

  const handleTitlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      focus(win.id);
      if (isMobile || win.maximized) return;
      // 标题栏上的按钮不触发拖拽
      if ((event.target as HTMLElement).closest("button")) return;

      const originX = win.x;
      const originY = win.y;
      startPointerDrag(event, {
        onMove: (dx, dy) => {
          const maxX = window.innerWidth - 80;
          const maxY = window.innerHeight - TASKBAR_HEIGHT - 8;
          setRect(win.id, {
            // 允许拖出左右边界一点点，但始终留一截标题栏可以抓回来
            x: Math.min(Math.max(originX + dx, -win.w + 80), maxX),
            y: Math.min(Math.max(originY + dy, 0), maxY),
          });
        },
      });
    },
    [focus, isMobile, setRect, win.id, win.maximized, win.w, win.x, win.y],
  );

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent, dir: ResizeDirection) => {
      event.stopPropagation();
      focus(win.id);
      if (isMobile || win.maximized) return;

      const origin = { x: win.x, y: win.y, w: win.w, h: win.h };
      startPointerDrag(event, {
        onMove: (dx, dy) => {
          const next = { ...origin };

          if (dir.includes("e")) {
            next.w = Math.max(MIN_WINDOW_SIZE.w, origin.w + dx);
          }
          if (dir.includes("s")) {
            next.h = Math.max(MIN_WINDOW_SIZE.h, origin.h + dy);
          }
          if (dir.includes("w")) {
            // 往左拉时同时改 x 和宽度，保证右边缘不动
            const w = Math.max(MIN_WINDOW_SIZE.w, origin.w - dx);
            next.x = origin.x + (origin.w - w);
            next.w = w;
          }
          if (dir.includes("n")) {
            const h = Math.max(MIN_WINDOW_SIZE.h, origin.h - dy);
            next.y = origin.y + (origin.h - h);
            next.h = h;
          }

          setRect(win.id, next);
        },
      });
    },
    [focus, isMobile, setRect, win.h, win.id, win.maximized, win.w, win.x, win.y],
  );

  const maximized = win.maximized || isMobile;

  const frameStyle: React.CSSProperties = maximized
    ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${TASKBAR_HEIGHT}px)`, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <div
      className={`window ${styles.frame}`}
      style={frameStyle}
      onPointerDown={() => focus(win.id)}
      role="dialog"
      aria-label={win.title}
    >
      <div
        className={`title-bar ${isActive ? "" : "inactive"} ${styles.titleBar}`}
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={() => !isMobile && toggleMaximize(win.id)}
      >
        <div className="title-bar-text">{win.title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => minimize(win.id)} />
          {!isMobile && (
            <button
              aria-label={win.maximized ? "Restore" : "Maximize"}
              onClick={() => toggleMaximize(win.id)}
            />
          )}
          <button aria-label="Close" onClick={() => close(win.id)} />
        </div>
      </div>

      <div className={`window-body ${styles.body}`}>
        <AppSurface appId={win.appId} payload={win.payload} windowId={win.id} />
      </div>

      {!maximized &&
        RESIZE_DIRECTIONS.map((dir) => (
          <div
            key={dir}
            className={`${styles.resizeHandle} ${styles[`resize_${dir}`]}`}
            onPointerDown={(e) => handleResizePointerDown(e, dir)}
          />
        ))}
    </div>
  );
}
