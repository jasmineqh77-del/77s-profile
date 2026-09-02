"use client";

import { forwardRef } from "react";

import AppIcon from "./AppIcon";
import styles from "./DesktopIcon.module.css";

type Props = {
  label: string;
  icon: string;
  selected: boolean;
  /** 移动端单击即打开，桌面端要双击 */
  singleClickToOpen: boolean;
  onSelect: () => void;
  onOpen: () => void;
};

/**
 * 转发 button 的 ref 出去，方便 Desktop.tsx 量个别图标（比如 "design"）
 * 在屏幕上的实际坐标，用来定位从图标边上长出来的浮层。绝大多数调用方
 * 不传 ref，行为和以前完全一样。
 */
const DesktopIcon = forwardRef<HTMLButtonElement, Props>(function DesktopIcon(
  { label, icon, selected, singleClickToOpen, onSelect, onOpen },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`chrome-button ${styles.icon} ${selected ? styles.selected : ""}`}
      onClick={() => {
        onSelect();
        if (singleClickToOpen) onOpen();
      }}
      onDoubleClick={() => {
        if (!singleClickToOpen) onOpen();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
    >
      <AppIcon icon={icon} size={48} priority className={styles.glyph} />
      <span className={styles.label}>{label}</span>
    </button>
  );
});

export default DesktopIcon;
