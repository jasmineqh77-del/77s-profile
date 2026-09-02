"use client";

import { useState } from "react";

import { recycled } from "@content/site";

import AppIcon from "@/components/AppIcon";

import styles from "./apps.module.css";

export default function RecycleBin() {
  const [restored, setRestored] = useState<string[]>([]);

  return (
    <div className={styles.page}>
      <p className={styles.muted}>
        Ideas I gave up on live here. I keep them around as a reminder that cutting scope is a
        skill too.
      </p>

      <div className={styles.fileList}>
        {recycled.map((item) => {
          const isRestored = restored.includes(item.name);
          return (
            <div key={item.name} className={styles.fileRow}>
              <AppIcon
                icon={isRestored ? "document" : "recycle"}
                size={32}
                className={styles.fileIcon}
              />
              <span>
                <span
                  className={styles.fileName}
                  style={{ textDecoration: isRestored ? "none" : "line-through" }}
                >
                  {item.name}
                </span>
                <br />
                <span className={styles.fileMeta}>
                  {isRestored ? "Restored — maybe worth another try" : item.reason}
                </span>
              </span>
              <span className={styles.spacer} />
              <button
                type="button"
                onClick={() =>
                  setRestored((prev) =>
                    isRestored ? prev.filter((n) => n !== item.name) : [...prev, item.name],
                  )
                }
              >
                {isRestored ? "Delete Again" : "Restore"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
