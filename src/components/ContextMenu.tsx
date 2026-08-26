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
    const handlePointerDown = () => onClose();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    // 捕获阶段监听，保证点任何地方都能先关掉菜单
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
            className={styles.item}
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
