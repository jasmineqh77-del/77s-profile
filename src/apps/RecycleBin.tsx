"use client";

import { useState } from "react";

import { recycled } from "@content/site";

import styles from "./apps.module.css";

export default function RecycleBin() {
  const [restored, setRestored] = useState<string[]>([]);

  return (
    <div className={styles.page}>
      <p className={styles.muted}>
        放弃掉的想法都在这儿。留着提醒自己，砍掉需求也是一种能力。
      </p>

      <div className={styles.fileList}>
        {recycled.map((item) => {
          const isRestored = restored.includes(item.name);
          return (
            <div key={item.name} className={styles.fileRow}>
              <span className={styles.fileIcon} aria-hidden>
                {isRestored ? "📄" : "🗑️"}
              </span>
              <span>
                <span
                  className={styles.fileName}
                  style={{ textDecoration: isRestored ? "none" : "line-through" }}
                >
                  {item.name}
                </span>
                <br />
                <span className={styles.fileMeta}>
                  {isRestored ? "已还原 —— 也许可以再试一次" : item.reason}
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
                {isRestored ? "再删一次" : "还原"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
