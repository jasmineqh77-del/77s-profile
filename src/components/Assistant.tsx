"use client";

import { useEffect, useState } from "react";

import { assistantTips } from "@content/site";

import styles from "./Assistant.module.css";

/** 进桌面后先安静一会儿再冒出来，一上来就弹很烦人 */
const FIRST_APPEARANCE_DELAY = 6000;

export default function Assistant() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), FIRST_APPEARANCE_DELAY);
    return () => clearTimeout(timer);
  }, [dismissed]);

  if (assistantTips.length === 0 || dismissed || !visible) return null;

  const tip = assistantTips[tipIndex % assistantTips.length];

  return (
    <div className={styles.assistant} role="status">
      <div className={styles.bubble}>
        <button
          type="button"
          className={styles.close}
          onClick={() => setDismissed(true)}
          aria-label="关掉小助手"
        >
          ✕
        </button>

        <p className={styles.tip}>{tip}</p>

        <div className={styles.actions}>
          <button type="button" onClick={() => setTipIndex((i) => i + 1)}>
            下一条 →
          </button>
          <button type="button" onClick={() => setDismissed(true)}>
            知道了
          </button>
        </div>
      </div>

      <button
        type="button"
        className={styles.avatar}
        onClick={() => setTipIndex((i) => i + 1)}
        aria-label="换一条提示"
      >
        📎
      </button>
    </div>
  );
}
