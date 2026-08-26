"use client";

import { about, site } from "@content/site";

import styles from "./apps.module.css";

export default function About() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroAvatar} aria-hidden>
          🙂
        </div>
        <div>
          <p className={styles.headline}>{about.headline}</p>
          <p className={styles.muted}>{site.userTagline}</p>
        </div>
      </div>

      <div>
        {about.intro.map((line) => (
          <p key={line} className={styles.paragraph}>
            {line}
          </p>
        ))}
      </div>

      <fieldset>
        <legend>系统信息</legend>
        <table className={styles.specTable}>
          <tbody>
            {about.specs.map((spec) => (
              <tr key={spec.label}>
                <th scope="row">{spec.label}:</th>
                <td>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>

      <div className={styles.spacer} />
      <p className={styles.muted}>{site.disclaimer}</p>
    </div>
  );
}
