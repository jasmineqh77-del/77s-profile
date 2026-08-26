"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

type DragHandlers = {
  /** dx / dy 是相对按下时的累计位移 */
  onMove: (dx: number, dy: number) => void;
  onEnd?: () => void;
};

/**
 * 在 window 上挂监听而不是元素本身，这样鼠标移出窗口边界也不会断掉拖拽。
 * 拖拽期间禁掉文字选中，否则拖标题栏会把整个页面的文字刷蓝。
 */
export function startPointerDrag(
  event: ReactPointerEvent,
  { onMove, onEnd }: DragHandlers,
) {
  event.preventDefault();

  const startX = event.clientX;
  const startY = event.clientY;

  const previousUserSelect = document.body.style.userSelect;
  const previousCursor = document.body.style.cursor;
  document.body.style.userSelect = "none";

  const handleMove = (e: globalThis.PointerEvent) => {
    onMove(e.clientX - startX, e.clientY - startY);
  };

  const handleUp = () => {
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleUp);
    window.removeEventListener("pointercancel", handleUp);
    document.body.style.userSelect = previousUserSelect;
    document.body.style.cursor = previousCursor;
    onEnd?.();
  };

  window.addEventListener("pointermove", handleMove);
  window.addEventListener("pointerup", handleUp);
  window.addEventListener("pointercancel", handleUp);
}

export type ResizeDirection = "e" | "s" | "se" | "w" | "n" | "nw" | "ne" | "sw";

export const MIN_WINDOW_SIZE = { w: 260, h: 160 };
