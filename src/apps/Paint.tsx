"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./Paint.module.css";

const PALETTE = [
  "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200",
  "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#ffffff", "#c3c3c3",
];

const SIZES = [2, 5, 10, 18];

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(PALETTE[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);

  /** 画布尺寸跟随窗口，但重设尺寸会清空内容，所以先存像素再恢复 */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const width = Math.max(100, Math.floor(wrap.clientWidth));
    const height = Math.max(100, Math.floor(wrap.clientHeight));
    if (canvas.width === width && canvas.height === height) return;

    const ctx = canvas.getContext("2d");
    const snapshot =
      canvas.width > 0 && canvas.height > 0 && ctx
        ? ctx.getImageData(0, 0, canvas.width, canvas.height)
        : null;

    canvas.width = width;
    canvas.height = height;

    const nextCtx = canvas.getContext("2d");
    if (!nextCtx) return;
    nextCtx.fillStyle = "#ffffff";
    nextCtx.fillRect(0, 0, width, height);
    if (snapshot) nextCtx.putImageData(snapshot, 0, 0);
  }, []);

  useEffect(() => {
    resizeCanvas();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  const pointFrom = (event: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const strokeTo = (event: React.PointerEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointFrom(event);
    ctx.lineTo(x, y);
    ctx.strokeStyle = eraser ? "#ffffff" : color;
    ctx.lineWidth = eraser ? size * 2.5 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pointFrom(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // 单击也要留下一个点，不然点一下没反应
    strokeTo(event);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!drawing.current) return;
    strokeTo(event);
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
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
              aria-label={`颜色 ${swatch}`}
              className={`${styles.swatch} ${
                !eraser && color === swatch ? styles.swatchActive : ""
              }`}
              style={{ background: swatch }}
              onClick={() => {
                setColor(swatch);
                setEraser(false);
              }}
            />
          ))}
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
          <button
            type="button"
            className={eraser ? styles.toolActive : undefined}
            onClick={() => setEraser((e) => !e)}
          >
            橡皮
          </button>
          <button type="button" onClick={clear}>
            清空
          </button>
          <button type="button" onClick={download}>
            保存
          </button>
        </div>
      </div>

      <div className={styles.canvasWrap} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>
    </div>
  );
}
