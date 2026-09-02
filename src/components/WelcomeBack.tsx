"use client";

import { useEffect, useRef, useState } from "react";

import { site } from "@content/site";

import { useSystemStore } from "@/os/systemStore";

import styles from "./WelcomeBack.module.css";

const TUBES_CDN_URL =
  "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

// 光管的配色，和 CodePen 原版一致（出处见 README）
const TUBES_CONFIG = {
  tubes: {
    colors: ["#f967fb", "#53bc28", "#6958d5"],
    lights: {
      intensity: 200,
      colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
    },
  },
};

type TubesApp = { dispose?: () => void };

/**
 * 用 Function 包一层再 import，是为了不让 webpack/turbopack 在构建时
 * 尝试静态分析并打包这个 https:// 字符串——它既不是本地文件也不是
 * node_modules 里的包，硬解析只会报错。这样写运行时就是浏览器原生的
 * dynamic import，构建期完全不碰它，首屏 bundle 也不会多一个字节。
 */
function importFromCdn(url: string): Promise<{ default: (el: HTMLCanvasElement, config: unknown) => TubesApp }> {
  return new Function("u", "return import(u)")(url);
}

const SKIP_DELAY_MS = 500;
const AUTO_DISMISS_MS = 2600;

export default function WelcomeBack() {
  const dismiss = useSystemStore((s) => s.dismissWelcomeBack);
  const autoClose = useSystemStore((s) => s.welcomeBackAutoClose);
  const [canSkip, setCanSkip] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let app: TubesApp | undefined;
    let cancelled = false;

    importFromCdn(TUBES_CDN_URL)
      .then((mod) => {
        if (cancelled || !canvasRef.current) return;
        app = mod.default(canvasRef.current, TUBES_CONFIG);
      })
      .catch(() => {
        // CDN 拉不到或者 WebGL 不可用，就静默留在纯色背景上，不影响文字和自动消失
      });

    const skipTimer = setTimeout(() => setCanSkip(true), SKIP_DELAY_MS);
    // 演示模式（design 文件夹里点开的那个）不设自动关闭定时器，只能靠点击退出
    const autoTimer = autoClose ? setTimeout(dismiss, AUTO_DISMISS_MS) : undefined;

    return () => {
      cancelled = true;
      clearTimeout(skipTimer);
      if (autoTimer) clearTimeout(autoTimer);
      app?.dispose?.();
    };
  }, [dismiss, autoClose]);

  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="polite"
      onClick={() => canSkip && dismiss()}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
      <div className={styles.hero}>
        <p className={styles.title}>
          Welcome back to {site.userName}, holding
          <span className={styles.dots} aria-hidden>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
        {canSkip && (
          <p className={styles.hint}>
            {autoClose ? "click anywhere to skip" : "click anywhere to close"}
          </p>
        )}
      </div>
    </div>
  );
}
