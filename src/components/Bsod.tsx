"use client";

import { useEffect } from "react";

import { site } from "@content/site";

import { useSystemStore } from "@/os/systemStore";

import styles from "./Bsod.module.css";

export default function Bsod() {
  const dismiss = useSystemStore((s) => s.dismissBsod);

  useEffect(() => {
    const handle = () => dismiss();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [dismiss]);

  return (
    <div className={styles.bsod} onClick={dismiss} role="alert">
      <div className={styles.content}>
        <p className={styles.heading}>{site.osName}</p>
        <p>
          检测到一个问题，为防止你的作品集受损，系统已停止运行。
        </p>
        <p>CURIOSITY_NOT_HANDLED</p>
        <p>
          如果这是你第一次看到这个画面，请重启计算机。跟你说过别点了。
        </p>
        <p className={styles.tech}>
          *** STOP: 0x0000007B (0xF77A0524, 0xC0000034, 0x00000000, 0x00000000)
        </p>
        <p className={styles.dismiss}>按任意键继续 _</p>
      </div>
    </div>
  );
}
