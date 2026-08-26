"use client";

import { iconFor } from "@/os/icons";

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

export default function DesktopIcon({
  label,
  icon,
  selected,
  singleClickToOpen,
  onSelect,
  onOpen,
}: Props) {
  return (
    <button
      type="button"
      className={`${styles.icon} ${selected ? styles.selected : ""}`}
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
      <span className={styles.glyph} aria-hidden>
        {iconFor(icon)}
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
