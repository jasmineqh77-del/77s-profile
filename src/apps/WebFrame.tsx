"use client";

import { useEffect, useRef, useState } from "react";

import type { AppProps } from "./types";

import styles from "./WebFrame.module.css";

/** 超过这个时间还没等到 iframe 的 load，就认为这页多半出不来了 */
const LOAD_TIMEOUT = 4000;

/**
 * 把一个网页装进 77-OS 的窗口里浏览。
 *
 * href 指向 public 下的同源静态页，窗口里和「Open in new tab」打开的是同一个地址，
 * 后者只是把这一页从窗口里搬到整个浏览器标签页，方便看全。
 *
 * 万一这页迟迟出不来（文件没了、路径写错），超时后盖一层提示兜住，
 * 不然用户只会看到一块空白，不知道是加载慢还是坏了。
 */
export default function WebFrame({ payload }: Pick<AppProps, "payload">) {
  const href = typeof payload?.href === "string" ? payload.href : null;
  // 本地路径取不出 host，标题栏那种作品名更适合当这里的标识，由开窗方传进来
  const label = typeof payload?.label === "string" ? payload.label : "Web Page";

  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const dismissed = useRef(false);

  useEffect(() => {
    if (!href || loaded) return;
    const timer = window.setTimeout(() => {
      if (!dismissed.current) setTimedOut(true);
    }, LOAD_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [href, loaded]);

  if (!href) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>No address was passed to this window.</p>
      </div>
    );
  }

  const openInTab = () => window.open(href, "_blank", "noopener,noreferrer");

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <span className={styles.title}>{label}</span>
        <button type="button" onClick={openInTab} className={styles.openButton}>
          Open in new tab
        </button>
      </div>

      <div className={styles.viewport}>
        <iframe
          src={href}
          title={label}
          className={styles.frame}
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />

        {timedOut && !loaded && (
          <div className={styles.blocked}>
            <p className={styles.blockedTitle}>This page is taking its time</p>
            <p className={styles.blockedBody}>
              It hasn&apos;t finished loading inside the window. Try it in a full browser tab —
              same page, just without the window frame around it.
            </p>
            <button type="button" onClick={openInTab}>
              Open in new tab
            </button>
            <button
              type="button"
              className={styles.waitButton}
              onClick={() => {
                dismissed.current = true;
                setTimedOut(false);
              }}
            >
              Keep waiting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
