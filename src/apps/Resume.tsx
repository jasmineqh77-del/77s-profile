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
    return <p className={styles.muted}>正在打开…</p>;
  }

  if (!exists) {
    return (
      <div className={styles.page}>
        <p className={styles.headline}>还没有简历文件</p>
        <p className={styles.paragraph}>
          把你的简历命名为 <code>resume.pdf</code>，放进项目的 <code>public/</code> 文件夹，
          这个窗口就会自动变成 PDF 预览器。
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <object data={RESUME_PATH} type="application/pdf" width="100%" height="100%">
        <p>
          浏览器打不开内嵌 PDF，<a href={RESUME_PATH}>点这里下载</a>。
        </p>
      </object>
      <p>
        <a href={RESUME_PATH} download>
          下载 PDF
        </a>
      </p>
    </div>
  );
}
