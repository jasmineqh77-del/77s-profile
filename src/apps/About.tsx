"use client";

import Image from "next/image";

import { about, site } from "@content/site";

import styles from "./apps.module.css";

export default function About() {
  return (
    <div className={`${styles.page} ${styles.pageStack}`}>
      <h1 className={styles.pixelHeadline}>About {site.userName}</h1>

      <Image
        src={about.photo}
        alt={about.photoAlt}
        width={200}
        height={267}
        unoptimized
        draggable={false}
        className={styles.photo}
      />

      <p className={styles.hook}>{about.hook}</p>

      <p className={styles.paragraph}>{about.caption}</p>

      <fieldset>
        <legend>System</legend>
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
    </div>
  );
}
