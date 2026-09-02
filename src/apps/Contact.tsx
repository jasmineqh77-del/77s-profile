"use client";

import { useEffect, useRef, useState } from "react";

import { contacts } from "@content/site";

import styles from "./Contact.module.css";
import appStyles from "./apps.module.css";

const DEFAULT_SUBJECT = "Hello from 77-OS";
const COPIED_MS = 1500;

function emailContact() {
  return contacts.find((item) => item.href?.startsWith("mailto:")) ?? contacts[0];
}

export default function Contact() {
  const mail = emailContact();
  const address = mail?.value ?? "";

  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [outboxOpen, setOutboxOpen] = useState(false);

  const addressRef = useRef<HTMLSpanElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (outboxOpen) okRef.current?.focus();
  }, [outboxOpen]);

  const selectAddress = () => {
    const el = addressRef.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const copyAddress = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        selectAddress();
        return;
      }
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      selectAddress();
    }
  };

  const send = () => {
    setOutboxOpen(true);
    const query = [`subject=${encodeURIComponent(subject)}`];
    if (body) query.push(`body=${encodeURIComponent(body)}`);
    window.location.href = `mailto:${address}?${query.join("&")}`;
  };

  if (!address) {
    return (
      <div className={appStyles.page}>
        <p className={appStyles.muted}>No email configured.</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <p className={appStyles.muted}>Write a message and hit Send.</p>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label className={styles.row}>
          <span className={styles.label}>To:</span>
          <span className={styles.toField}>
            <span ref={addressRef} className={styles.address}>
              {address}
            </span>
            <button
              type="button"
              className={`chrome-button ${styles.copy}`}
              onClick={() => void copyAddress()}
            >
              {copied ? "Copied." : "Copy address"}
            </button>
          </span>
        </label>

        <label className={styles.row}>
          <span className={styles.label}>Subject:</span>
          <input
            type="text"
            className={styles.subject}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            aria-label="Subject"
          />
        </label>

        <label className={styles.bodyRow}>
          <span className={styles.srOnly}>Message</span>
          <textarea
            className={styles.body}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-label="Message"
          />
        </label>

        <div className={styles.actions}>
          <button type="submit">Send</button>
        </div>
      </form>

      {outboxOpen && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="outbox-title">
          <div className={styles.dialog}>
            <p id="outbox-title" className={styles.dialogText}>
              Your message has been placed in the Outbox.
            </p>
            <button ref={okRef} type="button" onClick={() => setOutboxOpen(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
