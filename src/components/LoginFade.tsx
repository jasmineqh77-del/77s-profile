"use client";

import { useEffect, useRef, useState, type TransitionEvent } from "react";

import { ensureWallpaperReady } from "@/os/preloadAssets";
import { useSystemStore } from "@/os/systemStore";

import styles from "./LoginFade.module.css";

/** 单段淡入/淡出时长；两段合计约 1s，比原版略快 */
const FADE_MS = 420;
const FAILSAFE_MS = FADE_MS + 250;
/** 黑场里最多再等多久壁纸；超时也淡出，别卡死在黑屏 */
const WALLPAPER_WAIT_MS = 2500;

type Stage = "toBlack" | "holdBlack" | "toClear";

/**
 * 模仿 SwitchDesktopWithFade：登录屏 → 全黑 → 桌面。
 * 挂在 phase 分支外，login→desktop 时遮罩不会被拆掉重挂。
 */
export default function LoginFade() {
  const setPhase = useSystemStore((s) => s.setPhase);
  const finishLoginFade = useSystemStore((s) => s.finishLoginFade);
  const [stage, setStage] = useState<Stage>("toBlack");
  const [opaque, setOpaque] = useState(false);
  const finished = useRef(false);
  const stageRef = useRef(stage);
  stageRef.current = stage;

  useEffect(() => {
    // 一点 Guest 就开始抢壁纸，黑场期间尽量下完
    void ensureWallpaperReady();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("desktop");
      const t = window.setTimeout(() => {
        if (!finished.current) {
          finished.current = true;
          finishLoginFade();
        }
      }, 120);
      return () => window.clearTimeout(t);
    }

    const kick = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setOpaque(true));
    });

    return () => window.cancelAnimationFrame(kick);
  }, [setPhase, finishLoginFade]);

  useEffect(() => {
    if (stage !== "toBlack" && stage !== "toClear") return;

    const failsafe = window.setTimeout(() => {
      const current = stageRef.current;
      if (current === "toBlack") void advanceToDesktop();
      else if (current === "toClear") complete();
    }, FAILSAFE_MS);

    return () => window.clearTimeout(failsafe);
  }, [stage]);

  function complete() {
    if (finished.current) return;
    finished.current = true;
    finishLoginFade();
  }

  async function advanceToDesktop() {
    if (finished.current || stageRef.current !== "toBlack") return;
    setPhase("desktop");
    setStage("holdBlack");

    // 黑屏里等壁纸就绪再淡出，避免先看到墨绿底再蹦出风景
    await Promise.race([
      ensureWallpaperReady(),
      new Promise<void>((r) => window.setTimeout(r, WALLPAPER_WAIT_MS)),
    ]);

    if (finished.current) return;
    // 再给浏览器一帧把 <img> 画上
    await new Promise<void>((r) => window.requestAnimationFrame(() => r()));
    if (finished.current) return;
    setStage("toClear");
    setOpaque(false);
  }

  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "opacity") return;
    if (e.target !== e.currentTarget) return;
    if (stageRef.current === "toBlack" && opaque) void advanceToDesktop();
    if (stageRef.current === "toClear" && !opaque) complete();
  };

  return (
    <div
      className={`${styles.fade}${opaque ? ` ${styles.opaque}` : ""}`}
      onTransitionEnd={onTransitionEnd}
      aria-hidden
    />
  );
}
