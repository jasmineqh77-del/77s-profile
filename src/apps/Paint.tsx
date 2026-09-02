"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useWindowStore } from "@/os/windowStore";

import type { AppProps } from "./types";
import styles from "./Paint.module.css";

const PALETTE = [
  "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200",
  "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#ffffff", "#c3c3c3",
];

const SIZES = [2, 5, 10, 18];
const HISTORY_LIMIT = 40;

type Brush = "pencil" | "brush" | "spray";
type Tool = Brush | "eraser" | "sticker";

const STICKERS = [
  { id: "happy", src: "/ip/expr-happy.png", label: "Happy" },
  { id: "ok", src: "/ip/expr-ok.png", label: "OK" },
  { id: "puzzled", src: "/ip/expr-puzzled.png", label: "Puzzled" },
  { id: "celebrate", src: "/ip/expr-celebrate.png", label: "Celebrate" },
  { id: "shocked", src: "/ip/expr-shocked.png", label: "Shocked" },
  { id: "sleep", src: "/ip/sleep.png", label: "Sleep" },
] as const;

function stickerSize(px: number) {
  return Math.round(28 + px * 5.5);
}

export default function Paint({ windowId }: AppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const stickersRef = useRef<Record<string, HTMLImageElement>>({});
  const [color, setColor] = useState(PALETTE[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [tool, setTool] = useState<Tool>("pencil");
  const [brush, setBrush] = useState<Brush>("pencil");
  const [stickerId, setStickerId] = useState<(typeof STICKERS)[number]["id"]>("happy");
  const [canUndo, setCanUndo] = useState(false);

  const activeId = useWindowStore((s) => s.activeId);

  useEffect(() => {
    for (const sticker of STICKERS) {
      const img = new window.Image();
      img.src = sticker.src;
      stickersRef.current[sticker.id] = img;
    }
  }, []);

  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || canvas.width === 0) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
    setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const prev = historyRef.current.pop();
    if (!canvas || !ctx || !prev) return;
    if (prev.width !== canvas.width || prev.height !== canvas.height) {
      historyRef.current = [];
      setCanUndo(false);
      return;
    }
    ctx.putImageData(prev, 0, 0);
    setCanUndo(historyRef.current.length > 0);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const width = Math.max(100, Math.floor(wrap.clientWidth));
    const height = Math.max(100, Math.floor(wrap.clientHeight));
    if (canvas.width === width && canvas.height === height) return;

    const ctx = canvas.getContext("2d");
    const copy =
      canvas.width > 0 && canvas.height > 0 && ctx
        ? ctx.getImageData(0, 0, canvas.width, canvas.height)
        : null;

    canvas.width = width;
    canvas.height = height;

    const nextCtx = canvas.getContext("2d");
    if (!nextCtx) return;
    nextCtx.fillStyle = "#ffffff";
    nextCtx.fillRect(0, 0, width, height);
    if (copy) nextCtx.putImageData(copy, 0, 0);
    historyRef.current = [];
    setCanUndo(false);
  }, []);

  useEffect(() => {
    resizeCanvas();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (activeId !== windowId) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeId, undo, windowId]);

  const pointFrom = (event: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const sprayAt = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = size * 2.8;
    const dots = 8 + size;
    ctx.fillStyle = color;
    for (let i = 0; i < dots; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      ctx.globalAlpha = 0.35 + Math.random() * 0.35;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 0.8 + size * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const strokeTo = (event: React.PointerEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointFrom(event);

    if (tool === "spray") {
      sprayAt(ctx, x, y);
      lastPoint.current = { x, y };
      return;
    }

    ctx.lineTo(x, y);
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = size * 2.5;
      ctx.globalAlpha = 1;
    } else if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 2.4;
      ctx.globalAlpha = 0.38;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalAlpha = 1;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    lastPoint.current = { x, y };
  };

  const stamp = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = stickersRef.current[stickerId];
    if (!canvas || !ctx || !img?.complete || img.naturalWidth === 0) return;
    const dim = stickerSize(size);
    ctx.drawImage(img, x - dim / 2, y - dim / 2, dim, dim);
  };

  const chooseBrush = (next: Brush) => {
    setBrush(next);
    setTool(next);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    snapshot();
    const { x, y } = pointFrom(event);

    if (tool === "sticker") {
      stamp(x, y);
      return;
    }

    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    lastPoint.current = { x, y };
    ctx.beginPath();
    ctx.moveTo(x, y);
    strokeTo(event);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!drawing.current) return;
    strokeTo(event);
  };

  const stopDrawing = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    snapshot();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "untitled.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={styles.paint}>
      <div className={styles.toolbar}>
        <div className={styles.palette}>
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Color ${swatch}`}
              className={`chrome-button ${styles.swatch} ${
                tool !== "eraser" && tool !== "sticker" && color === swatch ? styles.swatchActive : ""
              }`}
              style={{ background: swatch }}
              onClick={() => {
                setColor(swatch);
                setTool(brush);
              }}
            />
          ))}
        </div>

        <div className={styles.brushes} role="toolbar" aria-label="Brushes">
          <button
            type="button"
            className={tool === "pencil" ? styles.toolActive : undefined}
            aria-label="Pencil"
            title="Pencil"
            onClick={() => chooseBrush("pencil")}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            className={tool === "brush" ? styles.toolActive : undefined}
            aria-label="Brush"
            title="Brush"
            onClick={() => chooseBrush("brush")}
          >
            <BrushIcon />
          </button>
          <button
            type="button"
            className={tool === "spray" ? styles.toolActive : undefined}
            aria-label="Spray"
            title="Spray"
            onClick={() => chooseBrush("spray")}
          >
            <SprayIcon />
          </button>
          <button
            type="button"
            className={tool === "eraser" ? styles.toolActive : undefined}
            aria-label="Eraser"
            title="Eraser"
            onClick={() => setTool("eraser")}
          >
            <EraserIcon />
          </button>
        </div>

        <div className={styles.tools}>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={size === s ? styles.toolActive : undefined}
              onClick={() => setSize(s)}
            >
              {s}px
            </button>
          ))}
          <button type="button" onClick={undo} disabled={!canUndo}>
            Undo
          </button>
          <button type="button" onClick={clear}>
            Clear
          </button>
          <button type="button" onClick={download}>
            Save
          </button>
        </div>
      </div>

      <div className={styles.stickerBar} role="toolbar" aria-label="Stickers">
        {STICKERS.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            className={`chrome-button ${styles.sticker} ${
              tool === "sticker" && stickerId === sticker.id ? styles.stickerActive : ""
            }`}
            aria-label={sticker.label}
            title={sticker.label}
            onClick={() => {
              setStickerId(sticker.id);
              setTool("sticker");
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- 工具栏缩略图，避免 AppIcon 的 pixelated */}
            <img src={sticker.src} alt="" draggable={false} />
          </button>
        ))}
      </div>

      <div className={styles.canvasWrap} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${tool === "sticker" ? styles.canvasStamp : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
        />
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path fill="#f2d36b" d="M4.2 13.2 2.4 14.2l1-1.8 7.6-7.6 1.8 1.8z" />
      <path fill="#3d2a1a" d="m11 3.2 1.8 1.8 1.1-1.1-1.8-1.8z" />
      <path fill="#e8a0b8" d="M2.4 14.2 4.2 13.2 3.4 14.8z" />
    </svg>
  );
}

function BrushIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path fill="#3f7ec8" d="M7.2 7.4 12.8 1.8l1.4 1.4-5.6 5.6z" />
      <path fill="#6b4423" d="M4.2 9.2c1.6-.2 2.8.4 3.4 1.6-.8 1.8-2.6 2.8-4.6 2.6-.2-1.8.2-3.4 1.2-4.2z" />
    </svg>
  );
}

function SprayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <ellipse cx="7.5" cy="10" rx="4.2" ry="3.2" fill="#d7eefc" stroke="#7aa7c9" strokeWidth="0.8" />
      <circle cx="11.5" cy="5.2" r="1.5" fill="#eef7ff" stroke="#7aa7c9" strokeWidth="0.7" />
      <circle cx="4.2" cy="5.8" r="1.1" fill="#eef7ff" stroke="#7aa7c9" strokeWidth="0.7" />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path fill="#f3c1d0" stroke="#c57a92" strokeWidth="0.8" d="M3.2 8.2 8.4 3l4.4 4.4-5.2 5.2z" />
      <path fill="#f7e9ee" d="M8.4 3 10.2 4.8 5 10 3.2 8.2z" />
    </svg>
  );
}
