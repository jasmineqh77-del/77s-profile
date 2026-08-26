"use client";

import { useEffect, useState } from "react";

import type { Post } from "@/lib/posts";
import { DESKTOP_APPS } from "@/os/appMeta";
import { usePostsStore } from "@/os/postsStore";
import { useSystemStore } from "@/os/systemStore";
import { useWindowStore } from "@/os/windowStore";

import Bsod from "./Bsod";
import { BootScreen, LoginScreen, ShutdownScreen } from "./BootScreen";
import DesktopIcon from "./DesktopIcon";
import Taskbar from "./Taskbar";
import WindowFrame from "./WindowFrame";
import styles from "./Desktop.module.css";

const MOBILE_BREAKPOINT = 720;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

export default function Desktop({ posts }: { posts: Post[] }) {
  const phase = useSystemStore((s) => s.phase);
  const bsod = useSystemStore((s) => s.bsod);
  const setStartMenuOpen = useSystemStore((s) => s.setStartMenuOpen);

  const windows = useWindowStore((s) => s.windows);
  const activeId = useWindowStore((s) => s.activeId);
  const open = useWindowStore((s) => s.open);

  const setPosts = usePostsStore((s) => s.setPosts);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // 文章在服务端构建时读好，这里灌进 store 给博客窗口用
  useEffect(() => {
    setPosts(posts);
  }, [posts, setPosts]);

  if (phase === "boot") return <BootScreen />;
  if (phase === "login") return <LoginScreen />;
  if (phase === "shutdown") return <ShutdownScreen />;

  return (
    <div
      className={styles.desktop}
      onPointerDown={(e) => {
        // 点空白处取消图标选中，并收起开始菜单
        if (e.target === e.currentTarget) {
          setSelectedIcon(null);
          setStartMenuOpen(false);
        }
      }}
    >
      <div className={styles.iconGrid}>
        {DESKTOP_APPS.map((app) => (
          <DesktopIcon
            key={app.id}
            label={app.title}
            icon={app.icon}
            selected={selectedIcon === app.id}
            singleClickToOpen={isMobile}
            onSelect={() => setSelectedIcon(app.id)}
            onOpen={() => open(app.id)}
          />
        ))}
      </div>

      {windows
        .filter((win) => !win.minimized)
        .map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            isActive={win.id === activeId}
            isMobile={isMobile}
          />
        ))}

      <Taskbar />

      {bsod && <Bsod />}
    </div>
  );
}
