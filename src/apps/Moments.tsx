"use client";

import AppIcon from "@/components/AppIcon";
import { useIsMobile } from "@/os/useIsMobile";
import { useWindowStore } from "@/os/windowStore";

import styles from "./apps.module.css";

const ITEMS = [
  {
    id: "guestbook",
    title: "Guestbook",
    icon: "notepad",
    meta: "Sign and read messages",
  },
  {
    id: "visitor-counter",
    title: "Visitor Counter",
    icon: "document",
    meta: "You are visitor number…",
  },
] as const;

export default function Moments() {
  const open = useWindowStore((s) => s.open);
  const isMobile = useIsMobile();

  const openItem = (id: (typeof ITEMS)[number]["id"]) =>
    open(id, {
      title: id === "guestbook" ? "Sign My Guestbook" : "Visitor Counter",
      dedupeKey: id,
    });

  return (
    <div className={styles.page}>
      <p className={styles.muted}>
        {ITEMS.length} object(s). {isMobile ? "Tap" : "Double-click"} to open.
      </p>

      <div className={styles.fileList}>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chrome-button ${styles.fileRow}`}
            onClick={() => {
              if (isMobile) openItem(item.id);
            }}
            onDoubleClick={() => {
              if (!isMobile) openItem(item.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openItem(item.id);
              }
            }}
          >
            <AppIcon icon={item.icon} size={32} className={styles.fileIcon} />
            <span>
              <span className={styles.fileName}>{item.title}</span>
              <br />
              <span className={styles.fileMeta}>{item.meta}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
