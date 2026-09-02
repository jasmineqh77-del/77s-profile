"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import styles from "./ContextMenu.module.css";

export type MenuItem =
  | { kind: "separator" }
  | {
      kind: "item";
      label: string;
      disabled?: boolean;
      onSelect?: () => void;
    };

type Props = {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
};

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  // 靠近屏幕右/下边缘时向内翻转，避免菜单被裁掉
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPosition({
      left: x + width > window.innerWidth ? Math.max(0, x - width) : x,
      top: y + height > window.innerHeight ? Math.max(0, y - height) : y,
    });
  }, [x, y]);

  useEffect(() => {
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      // 点在菜单里面时这里绝对不能关：pointerdown 早于 click，这一步就把菜单卸载掉的话，
      // 按钮还没等到 click 事件就已经不在了，onSelect 永远跑不到。菜单项自己的 onClick 会负责关。
      if (menuRef.current?.contains(target)) return;
      onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    // 用捕获阶段：窗口的缩放柄按下时会 stopPropagation，而 React 会一并停掉原生事件的传播，
    // 挂在冒泡阶段的话，从缩放柄起手拖动时菜单就关不掉了
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ left: position.left, top: position.top }}
      role="menu"
    >
      {items.map((item, index) =>
        item.kind === "separator" ? (
          <div key={`sep-${index}`} className={styles.separator} />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className={`chrome-button ${styles.item}`}
            disabled={item.disabled}
            onClick={() => {
              item.onSelect?.();
              onClose();
            }}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
