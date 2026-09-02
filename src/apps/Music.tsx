"use client";

import styles from "./Music.module.css";

const MUSIC_HREF = "/music/index.html";

/**
 * 桌面 Music：客户区全幅 iframe 加载 public/music 里的胶片架场景。
 * sandbox 与 WebFrame 一致，保证 import map / Three / 音频能跑。
 */
export default function Music() {
  return (
    <div className={styles.root}>
      <iframe
        src={MUSIC_HREF}
        title="Music"
        className={styles.frame}
        referrerPolicy="no-referrer-when-downgrade"
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
