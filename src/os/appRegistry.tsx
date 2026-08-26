"use client";

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

type Props = AppProps & { appId: string };

/**
 * 把 appId 渲染成对应的窗口内容。
 *
 * 这里刻意用 switch 直接返回 JSX，而不是查一张 id → 组件的表：
 * 查表拿到组件再渲染的写法，React 静态分析认不出来，会当成「在渲染中创建组件」。
 *
 * 新增窗口：在 appMeta.ts 加元数据，再到这里加一个 case。
 */
export default function AppSurface({ appId, payload, windowId }: Props) {
  switch (appId) {
    case "about":
      return <About />;
    case "projects":
      return <Projects />;
    case "project-detail":
      return <ProjectDetail payload={payload} windowId={windowId} />;
    case "blog":
      return <Blog />;
    case "now":
      return <NowPlaying />;
    case "resume":
      return <Resume />;
    case "contact":
      return <Contact />;
    case "recycle":
      return <RecycleBin />;
    case "minesweeper":
      return <Minesweeper />;
    case "paint":
      return <Paint />;
    case "cmd":
      return <Cmd windowId={windowId} />;
    default:
      return <p>这个窗口还没做好。</p>;
  }
}
