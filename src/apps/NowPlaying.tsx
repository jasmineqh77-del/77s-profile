"use client";

import { nowPlaying } from "@content/site";

import styles from "./apps.module.css";
import nowStyles from "./NowPlaying.module.css";

export default function NowPlaying() {
  return (
    <div className={styles.page}>
      <div className={nowStyles.display}>
        <div className={nowStyles.status}>▶ {nowPlaying.status}</div>
        <div className={nowStyles.marquee}>
          <span>{nowPlaying.items.map((i) => i.title).join(" ··· ")} ··· </span>
        </div>
      </div>

      <ol className={nowStyles.playlist}>
        {nowPlaying.items.map((item, index) => (
          <li key={item.title} className={nowStyles.track}>
            <span className={nowStyles.trackIndex}>{String(index + 1).padStart(2, "0")}</span>
            <span>
              <span className={styles.fileName}>{item.title}</span>
              <br />
              <span className={styles.fileMeta}>{item.meta}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
