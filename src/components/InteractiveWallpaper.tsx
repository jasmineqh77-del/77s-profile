"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

import styles from "./InteractiveWallpaper.module.css";

const SOURCE_URL = "/wallpaper/memory-smile.jpg";

/** 较长边的内部分辨率（对齐 CodePen 的 2000 质量档） */
const LONG_SIDE = 2000;
const T = Math.PI * 2;
/** 影响半径相对画布长边的比例；越小跟手光晕越紧（原版约等于 1） */
const RADIUS_SCALE = 0.58;
/** 静止时的基础影响半径系数（原版 1.5） */
const BASE_S = 1.0;
/** 鼠标移动时半径膨胀强度（原版 2） */
const VELOCITY_RADIUS = 1.1;

const PROPS = {
  boxSize: 85,
  fade: false,
  dots: true,
  dotColor: "#fff",
} as const;

type Box = { x: number; y: number; d: number; s: number };

type MouseState = {
  x: number;
  y: number;
  s: number;
  x2: number;
  y2: number;
};

/**
 * 把源图按 cover 画进 buffer，保证全屏铺满且采样坐标与画布一致
 * （CodePen 原图本身就是 2000×2000；我们这张是横图，必须先烤进 buffer）。
 */
function paintCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
) {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = cw / ch;
  let dw: number;
  let dh: number;
  let dx: number;
  let dy: number;
  if (ir > cr) {
    dh = ch;
    dw = ch * ir;
    dx = (cw - dw) / 2;
    dy = 0;
  } else {
    dw = cw;
    dh = cw / ir;
    dx = 0;
    dy = (ch - dh) / 2;
  }
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * 桌面活壁纸：CodePen ZYebOZj 的网格缩放算法；
 * 画布铺满整个桌面（不再用方画布留黑边），源图 cover 进内部 buffer。
 */
export default function InteractiveWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d");
    if (!bctx) return;

    let cw = LONG_SIDE;
    let ch = LONG_SIDE;
    let falloffBase = LONG_SIDE;
    let cRect = canvas.getBoundingClientRect();
    let sx = 1;
    let sy = 1;

    const m: MouseState = {
      x: cw / 2,
      y: ch / 2,
      s: BASE_S,
      x2: cw / 2,
      y2: ch / 2,
    };

    const xTo = gsap.quickTo(m, "x", { duration: 1, ease: "expo" });
    const yTo = gsap.quickTo(m, "y", { duration: 1, ease: "expo" });
    const sTo = gsap.quickTo(m, "s", { duration: 2, ease: "power2" });

    let boxes: Box[] = [];
    let tickerOn = false;
    let ready = false;

    ctx.fillStyle = PROPS.dotColor;

    const img = new Image();
    img.src = SOURCE_URL;

    const syncScale = () => {
      cRect = canvas.getBoundingClientRect();
      if (cRect.width > 0 && cRect.height > 0) {
        sx = cw / cRect.width;
        sy = ch / cRect.height;
      }
    };

    const buildBoxes = () => {
      boxes = [];
      for (let x = 0; x <= cw; x += PROPS.boxSize) {
        for (let y = 0; y <= ch; y += PROPS.boxSize) {
          boxes.push({ x, y, d: 0, s: 0 });
        }
      }
    };

    const layout = () => {
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      const aspect = cssW / Math.max(1, cssH);
      if (aspect >= 1) {
        cw = LONG_SIDE;
        ch = Math.max(1, Math.round(LONG_SIDE / aspect));
      } else {
        ch = LONG_SIDE;
        cw = Math.max(1, Math.round(LONG_SIDE * aspect));
      }
      falloffBase = Math.max(cw, ch);
      canvas.width = cw;
      canvas.height = ch;
      buffer.width = cw;
      buffer.height = ch;

      if (img.naturalWidth > 0) {
        paintCover(bctx, img, cw, ch);
        buildBoxes();
        m.x = m.x2 = cw / 2;
        m.y = m.y2 = ch / 2;
        ready = true;
      }
      syncScale();
    };

    const drawImg = (cell: Box) => {
      cell.d = Math.hypot(cell.x - m.x, cell.y - m.y);
      cell.s = 1 - gsap.utils.clamp(0, 1, cell.d / (falloffBase * RADIUS_SCALE) / m.s);
      if (cell.s < 0.001) return;
      const boxScaled = PROPS.boxSize * cell.s;
      const srcSize = PROPS.boxSize - boxScaled;
      if (srcSize < 0.5) return;
      if (PROPS.fade) ctx.globalAlpha = cell.s;
      // 从已 cover 好的 buffer 采样，坐标与画布一致
      ctx.drawImage(
        buffer,
        cell.x + boxScaled / 2,
        cell.y + boxScaled / 2,
        srcSize,
        srcSize,
        cell.x,
        cell.y,
        PROPS.boxSize,
        PROPS.boxSize,
      );
    };

    const drawDots = (cell: Box) => {
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, PROPS.boxSize * 0.15 * cell.s, 0, T);
      ctx.fill();
    };

    const update = () => {
      if (!ready) return;
      const d = Math.hypot(m.x - m.x2, m.y - m.y2);
      sTo((d / falloffBase) * VELOCITY_RADIUS);
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(buffer, 0, 0);
      boxes.forEach(drawImg);
      if (PROPS.fade) ctx.globalAlpha = 1;
      if (PROPS.dots) boxes.forEach(drawDots);
    };

    const startTicker = () => {
      if (tickerOn) return;
      gsap.ticker.add(update);
      tickerOn = true;
    };

    const stopTicker = () => {
      if (!tickerOn) return;
      gsap.ticker.remove(update);
      tickerOn = false;
    };

    const initImg = () => {
      layout();
      startTicker();
    };

    const onPointerMove = (e: PointerEvent) => {
      syncScale();
      m.x2 = (e.clientX - cRect.left) * sx;
      m.y2 = (e.clientY - cRect.top) * sy;
      xTo(m.x2);
      yTo(m.y2);
    };

    const onResize = () => {
      layout();
    };

    const onVisibility = () => {
      if (document.hidden) stopTicker();
      else if (ready) startTicker();
    };

    img.onload = initImg;
    if (img.complete && img.naturalWidth > 0) initImg();

    requestAnimationFrame(syncScale);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopTicker();
      img.onload = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className={styles.stage} aria-hidden>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
