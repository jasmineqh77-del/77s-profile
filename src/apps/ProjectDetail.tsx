"use client";

import { projects } from "@content/site";

import type { AppProps } from "./types";
import styles from "./apps.module.css";

export default function ProjectDetail({ payload }: AppProps) {
  const project = projects.find((p) => p.id === payload?.projectId);

  if (!project) {
    return <p>找不到这个项目。</p>;
  }

  return (
    <div className={styles.page}>
      <div>
        <p className={styles.headline}>{project.name}</p>
        <p className={styles.muted}>{project.kind}</p>
      </div>

      <div>
        {project.body.map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>

      {project.link && (
        <p>
          <a href={project.link.href} target="_blank" rel="noreferrer">
            {project.link.label} ↗
          </a>
        </p>
      )}
    </div>
  );
}
