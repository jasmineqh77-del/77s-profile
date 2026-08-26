"use client";

import { projects } from "@content/site";

import { useWindowStore } from "@/os/windowStore";

import styles from "./apps.module.css";

export default function Projects() {
  const open = useWindowStore((s) => s.open);

  return (
    <div className={styles.page}>
      <p className={styles.muted}>
        {projects.length} 个对象。双击打开。
      </p>

      <div className={styles.fileList}>
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className={styles.fileRow}
            onDoubleClick={() =>
              open("project-detail", {
                title: project.name,
                payload: { projectId: project.id },
                dedupeKey: project.id,
              })
            }
          >
            <span className={styles.fileIcon} aria-hidden>
              📄
            </span>
            <span>
              <span className={styles.fileName}>{project.name}</span>
              <br />
              <span className={styles.fileMeta}>
                {project.kind} · {project.summary}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
