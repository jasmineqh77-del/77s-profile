"use client";

import { useEffect, useState } from "react";

import styles from "./VisitorCounter.module.css";

function formatCount(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(6, "0");
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const res = await fetch("/api/visits");
        const data = (await res.json()) as { count?: number; error?: string };
        if (!res.ok) {
          throw new Error(data.error || "Could not load visitor count.");
        }
        if (!cancelled) setCount(typeof data.count === "number" ? data.count : 0);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load visitor count.");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.root}>
      <p className={styles.headline}>✦ You are visitor number ✦</p>
      <div className={styles.display} aria-live="polite">
        {error ? "------" : count === null ? "------" : formatCount(count)}
      </div>
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <p className={styles.footer}>Thanks for stopping by! Tell a friend.</p>
      )}
    </div>
  );
}
