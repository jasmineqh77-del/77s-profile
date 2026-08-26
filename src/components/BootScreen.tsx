"use client";

import { useEffect, useState } from "react";

import { site } from "@content/site";

import { useSystemStore } from "@/os/systemStore";

import styles from "./BootScreen.module.css";

export function BootScreen() {
  const setPhase = useSystemStore((s) => s.setPhase);
  const [skippable, setSkippable] = useState(false);

  useEffect(() => {
    const showSkip = setTimeout(() => setSkippable(true), 900);
    const done = setTimeout(() => setPhase("login"), 3200);
    return () => {
      clearTimeout(showSkip);
      clearTimeout(done);
    };
  }, [setPhase]);

  return (
    <div className={styles.boot}>
      <div className={styles.bootInner}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>{site.osName}</span>
          <span className={styles.logoEdition}>Professional</span>
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressBlocks} />
        </div>

        <p className={styles.bootHint}>正在启动…</p>
      </div>

      {skippable && (
        <button type="button" className={styles.skip} onClick={() => setPhase("login")}>
          跳过 →
        </button>
      )}

      <p className={styles.copyright}>{site.disclaimer}</p>
    </div>
  );
}

export function LoginScreen() {
  const setPhase = useSystemStore((s) => s.setPhase);

  return (
    <div className={styles.login}>
      <div className={styles.loginTop} />

      <div className={styles.loginMain}>
        <div className={styles.loginLeft}>
          <p className={styles.loginBrand}>{site.osName}</p>
          <p className={styles.loginTip}>点击你的用户名开始</p>
        </div>

        <div className={styles.loginDivider} />

        <div className={styles.loginRight}>
          <button
            type="button"
            className={styles.userTile}
            onClick={() => setPhase("desktop")}
            autoFocus
          >
            <span className={styles.userAvatar} aria-hidden>
              🙂
            </span>
            <span>
              <span className={styles.userName}>{site.userName}</span>
              <span className={styles.userNote}>{site.userTagline}</span>
            </span>
          </button>
        </div>
      </div>

      <div className={styles.loginBottom}>
        <p>开机后翻翻桌面图标和开始菜单，在电脑上还能拖动窗口、右键桌面。</p>
      </div>
    </div>
  );
}

export function ShutdownScreen() {
  const restart = useSystemStore((s) => s.restart);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!done) {
    return (
      <div className={styles.boot}>
        <div className={styles.bootInner}>
          <p className={styles.shutdownText}>正在关闭 {site.osName}…</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressBlocks} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.safeOff}>
      <p className={styles.safeOffText}>现在可以安全地关闭计算机了。</p>
      <button type="button" onClick={restart} className={styles.restartButton}>
        重新开机
      </button>
    </div>
  );
}
