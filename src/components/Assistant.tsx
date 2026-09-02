"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { assistantTips, site } from "@content/site";

import styles from "./Assistant.module.css";

/** 进桌面后先安静一会儿再冒出来，一上来就弹很烦人 */
const FIRST_APPEARANCE_DELAY = 6000;

/** 跟着提示一起轮换的表情，翻一条换一个，省得她一直保持同一张脸 */
const MOODS = ["/ip/expr-happy.png", "/ip/expr-puzzled.png", "/ip/expr-ok.png"] as const;

export default function Assistant() {
  const [visible, setVisible] = useState(false);
  const [tipOpen, setTipOpen] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), FIRST_APPEARANCE_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (assistantTips.length === 0 || !visible) return null;

  const tip = assistantTips[tipIndex];

  function advanceTip() {
    if (tipIndex >= assistantTips.length - 1) {
      setTipOpen(false);
      setTipIndex(0);
      return;
    }
    setTipIndex((i) => i + 1);
  }

  return (
    <div className={styles.assistant} role="status">
      {tipOpen && (
        <div className={styles.dialog}>
          <div className={styles.titleBar}>
            <div className={styles.titleText}>{site.osName} Assistant</div>
            <button
              type="button"
              className={`chrome-button ${styles.close}`}
              aria-label="Close"
              onClick={() => setTipOpen(false)}
            />
          </div>

          <div className={styles.body}>
            <p className={styles.tip}>{tip}</p>

            <div className={styles.actions}>
              <button type="button" onClick={advanceTip}>
                Next Tip
              </button>
              <button type="button" onClick={() => setTipOpen(false)}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`chrome-button ${styles.avatar}`}
        onClick={() => {
          if (!tipOpen) {
            setTipOpen(true);
            return;
          }
          advanceTip();
        }}
        aria-label={tipOpen ? "Show another tip" : "Show tips"}
      >
        <Image
          src={MOODS[tipIndex % MOODS.length]}
          alt=""
          aria-hidden
          width={44}
          height={44}
          unoptimized
          draggable={false}
          className={styles.avatarImage}
        />
      </button>
    </div>
  );
}
