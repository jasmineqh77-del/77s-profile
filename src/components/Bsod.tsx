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
          A problem has been detected and this portfolio has been shut down to prevent damage.
        </p>
        <p>CURIOSITY_NOT_HANDLED</p>
        <p>
          If this is the first time you&apos;ve seen this screen, restart your computer. I did tell
          you not to click it.
        </p>
        <p className={styles.tech}>
          *** STOP: 0x0000007B (0xF77A0524, 0xC0000034, 0x00000000, 0x00000000)
        </p>
        <p className={styles.dismiss}>Press any key to continue _</p>
      </div>
    </div>
  );
}
