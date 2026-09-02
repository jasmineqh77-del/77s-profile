"use client";

import { projects } from "@content/site";

import AppIcon from "@/components/AppIcon";
import { useIsMobile } from "@/os/useIsMobile";
import { useWindowStore } from "@/os/windowStore";

import styles from "./apps.module.css";

export default function Projects() {
  const open = useWindowStore((s) => s.open);
  const isMobile = useIsMobile();

  const openProject = (id: string, name: string) =>
    open("project-detail", {
      title: name,
      payload: { projectId: id },
      dedupeKey: id,
    });

  return (
    <div className={styles.page}>
      <p className={styles.muted}>
        {projects.length} object(s). {isMobile ? "Tap" : "Double-click"} to open.
      </p>

      <div className={styles.fileList}>
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className={`chrome-button ${styles.fileRow}`}
            onClick={() => {
              if (isMobile) openProject(project.id, project.name);
            }}
            onDoubleClick={() => {
              if (!isMobile) openProject(project.id, project.name);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openProject(project.id, project.name);
              }
            }}
          >
            <AppIcon icon="document" size={32} className={styles.fileIcon} />
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
