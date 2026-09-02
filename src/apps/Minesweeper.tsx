"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "./Minesweeper.module.css";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

/** 接替经典的 🙂😎😵 三态黄脸 */
const FACES = {
  ready: "/ip/expr-happy.png",
  won: "/ip/expr-celebrate.png",
  lost: "/ip/expr-shocked.png",
} as const;

type Cell = {
  mine: boolean;
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
};

type Status = "ready" | "playing" | "won" | "lost";

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    })),
  );
}

function neighbours(row: number, col: number): [number, number][] {
  const result: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) result.push([r, c]);
    }
  }
  return result;
}

/** 第一次点击之后才布雷，保证首击永远不会踩雷 */
function placeMines(board: Cell[][], safeRow: number, safeCol: number): Cell[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  const forbidden = new Set(
    [[safeRow, safeCol], ...neighbours(safeRow, safeCol)].map(([r, c]) => `${r},${c}`),
  );

  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (next[r][c].mine || forbidden.has(`${r},${c}`)) continue;
    next[r][c].mine = true;
    placed++;
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      next[r][c].adjacent = neighbours(r, c).filter(([nr, nc]) => next[nr][nc].mine).length;
    }
  }

  return next;
}

/** 点到空白格时，用洪泛把连片的空白一次性翻开 */
function revealFrom(board: Cell[][], row: number, col: number): Cell[][] {
  const next = board.map((r) => r.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const cell = next[r][c];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.mine) {
      for (const [nr, nc] of neighbours(r, c)) {
        if (!next[nr][nc].revealed) stack.push([nr, nc]);
      }
    }
  }

  return next;
}

export default function Minesweeper() {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard);
  const [status, setStatus] = useState<Status>("ready");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = setInterval(() => setSeconds((s) => Math.min(s + 1, 999)), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const flagCount = useMemo(
    () => board.flat().filter((cell) => cell.flagged).length,
    [board],
  );

  const reset = useCallback(() => {
    setBoard(createEmptyBoard());
    setStatus("ready");
    setSeconds(0);
  }, []);

  const handleReveal = (row: number, col: number) => {
    if (status === "won" || status === "lost") return;
    if (board[row][col].flagged) return;

    let current = board;
    if (status === "ready") {
      current = placeMines(board, row, col);
      setStatus("playing");
    }

    if (current[row][col].mine) {
      const exploded = current.map((r) =>
        r.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell)),
      );
      setBoard(exploded);
      setStatus("lost");
      return;
    }

    const revealed = revealFrom(current, row, col);
    const hiddenSafe = revealed
      .flat()
      .filter((cell) => !cell.mine && !cell.revealed).length;

    setBoard(revealed);
    if (hiddenSafe === 0) setStatus("won");
  };

  const handleFlag = (event: React.MouseEvent, row: number, col: number) => {
    event.preventDefault();
    if (status === "won" || status === "lost") return;
    if (board[row][col].revealed) return;
    setBoard((prev) =>
      prev.map((r, ri) =>
        r.map((cell, ci) =>
          ri === row && ci === col ? { ...cell, flagged: !cell.flagged } : cell,
        ),
      ),
    );
  };

  const face = FACES[status === "lost" || status === "won" ? status : "ready"];

  return (
    <div className={styles.game}>
      <div className={styles.hud}>
        <span className={styles.counter}>
          {String(Math.max(0, MINES - flagCount)).padStart(3, "0")}
        </span>
        <button
          type="button"
          className={`chrome-button ${styles.face}`}
          onClick={reset}
          aria-label="New game"
        >
          <Image
            src={face}
            alt=""
            aria-hidden
            width={26}
            height={26}
            unoptimized
            draggable={false}
            className={styles.faceImage}
          />
        </button>
        <span className={styles.counter}>{String(seconds).padStart(3, "0")}</span>
      </div>

      <div className={styles.board} role="grid">
        {board.map((row, ri) => (
          <div key={ri} className={styles.row} role="row">
            {row.map((cell, ci) => (
              <button
                key={ci}
                type="button"
                role="gridcell"
                className={`chrome-button ${styles.cell} ${cell.revealed ? styles.revealed : ""}`}
                data-adjacent={cell.revealed && !cell.mine ? cell.adjacent : undefined}
                onClick={() => handleReveal(ri, ci)}
                onContextMenu={(e) => handleFlag(e, ri, ci)}
              >
                {cell.revealed
                  ? cell.mine
                    ? "💣"
                    : cell.adjacent || ""
                  : cell.flagged
                    ? "🚩"
                    : ""}
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className={styles.hint}>
        {status === "won"
          ? "All clear. Nicely done."
          : status === "lost"
            ? "Boom. Click the face for a new game."
            : "Left-click to reveal, right-click to flag."}
      </p>
    </div>
  );
}
