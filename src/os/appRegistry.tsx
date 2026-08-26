"use client";

import type { ComponentType } from "react";

import About from "@/apps/About";
import Blog from "@/apps/Blog";
import Cmd from "@/apps/Cmd";
import Contact from "@/apps/Contact";
import Minesweeper from "@/apps/Minesweeper";
import NowPlaying from "@/apps/NowPlaying";
import Paint from "@/apps/Paint";
import ProjectDetail from "@/apps/ProjectDetail";
import Projects from "@/apps/Projects";
import RecycleBin from "@/apps/RecycleBin";
import Resume from "@/apps/Resume";
import type { AppProps } from "@/apps/types";

/**
 * appId → 窗口内容组件。
 * 元数据（标题、图标、默认尺寸）在 appMeta.ts 里，两边的 id 要对得上。
 */
const COMPONENTS: Record<string, ComponentType<AppProps>> = {
  about: About,
  projects: Projects,
  "project-detail": ProjectDetail,
  blog: Blog,
  now: NowPlaying,
  resume: Resume,
  contact: Contact,
  recycle: RecycleBin,
  minesweeper: Minesweeper,
  paint: Paint,
  cmd: Cmd,
};

export function getAppComponent(appId: string): ComponentType<AppProps> | undefined {
  return COMPONENTS[appId];
}
