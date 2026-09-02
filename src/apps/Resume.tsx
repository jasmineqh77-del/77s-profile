"use client";

import { useEffect, useState } from "react";

import styles from "./apps.module.css";

const RESUME_PATH = "/resume.pdf";

export default function Resume() {
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(RESUME_PATH, { method: "HEAD" })
      .then((res) => {
        // 开发服务器对不存在的静态文件会返回 HTML 404 页
        const isPdf = res.ok && res.headers.get("content-type")?.includes("pdf");
        if (!cancelled) setExists(Boolean(isPdf));
      })
      .catch(() => {
        if (!cancelled) setExists(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (exists === null) {
    return (
      <div className={`${styles.page} ${styles.loading}`}>
        <p className={styles.muted}>Opening…</p>
      </div>
    );
  }

  if (!exists) {
    return (
      <div className={styles.page}>
        <p className={styles.headline}>No resume file yet</p>
        <p className={styles.paragraph}>
          Name your resume <code>resume.pdf</code> and drop it into the project&apos;s{" "}
          <code>public/</code> folder, and this window turns into a PDF viewer.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <object data={RESUME_PATH} type="application/pdf" width="100%" height="100%">
        <p>
          Your browser can&apos;t display embedded PDFs.{" "}
          <a href={RESUME_PATH}>Download it here</a>.
        </p>
      </object>
      <p>
        <a href={RESUME_PATH} download>
          Download PDF
        </a>
      </p>
    </div>
  );
}
