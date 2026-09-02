"use client";

import { useEffect, useState, type FormEvent } from "react";

import type { GuestbookEntry } from "@content/guestbookSeed";

import styles from "./Guestbook.module.css";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [handle, setHandle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/guestbook");
        const data = (await res.json()) as { entries?: GuestbookEntry[]; error?: string };
        if (!res.ok) {
          throw new Error(data.error || "Could not load guestbook.");
        }
        if (!cancelled) setEntries(data.entries ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load guestbook.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, message }),
      });
      const data = (await res.json()) as { entry?: GuestbookEntry; error?: string };
      if (!res.ok || !data.entry) {
        throw new Error(data.error || "Could not sign guestbook.");
      }
      setEntries((prev) => [data.entry!, ...prev]);
      setHandle("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign guestbook.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.quill} aria-hidden>
          ✒
        </span>
        <h2 className={styles.title}>Guestbook</h2>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.feed} aria-live="polite">
        {loading && <p className={styles.empty}>Loading messages…</p>}
        {!loading && entries.length === 0 && (
          <p className={styles.empty}>No messages yet. Be the first!</p>
        )}
        {entries.map((entry) => (
          <article key={entry.id} className={styles.entry}>
            <div className={styles.meta}>
              <span className={styles.handle}>{entry.handle}</span>
              <span className={styles.date}>{formatDate(entry.createdAt)}</span>
            </div>
            <p className={styles.message}>{entry.message}</p>
          </article>
        ))}
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <input
          type="text"
          className={styles.handleInput}
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Your handle..."
          maxLength={32}
          required
          aria-label="Your handle"
        />
        <textarea
          className={styles.messageInput}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave a message..."
          maxLength={280}
          rows={3}
          required
          aria-label="Your message"
        />
        <button type="submit" className={styles.sign} disabled={submitting}>
          {submitting ? "Signing…" : "Sign it ✒"}
        </button>
      </form>
    </div>
  );
}
