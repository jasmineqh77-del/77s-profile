"use client";

import About from "@/apps/About";
import Blog from "@/apps/Blog";
import Cmd from "@/apps/Cmd";
import Contact from "@/apps/Contact";
import Guestbook from "@/apps/Guestbook";
import Minesweeper from "@/apps/Minesweeper";
import Moments from "@/apps/Moments";
import Music from "@/apps/Music";
import NowPlaying from "@/apps/NowPlaying";
import Paint from "@/apps/Paint";
import ProjectDetail from "@/apps/ProjectDetail";
import Projects from "@/apps/Projects";
import RecycleBin from "@/apps/RecycleBin";
import Resume from "@/apps/Resume";
import VisitorCounter from "@/apps/VisitorCounter";
import WebFrame from "@/apps/WebFrame";
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
    case "moments":
      return <Moments />;
    case "guestbook":
      return <Guestbook />;
    case "visitor-counter":
      return <VisitorCounter />;
    case "blog":
      return <Blog />;
    case "now":
      return <NowPlaying />;
    case "music":
      return <Music />;
    case "resume":
      return <Resume />;
    case "contact":
      return <Contact />;
    case "recycle":
      return <RecycleBin />;
    case "minesweeper":
      return <Minesweeper />;
    case "paint":
      return <Paint windowId={windowId} />;
    case "cmd":
      return <Cmd windowId={windowId} />;
    case "web-frame":
      return <WebFrame payload={payload} />;
    default:
      return <p>This window isn&apos;t built yet.</p>;
  }
}
