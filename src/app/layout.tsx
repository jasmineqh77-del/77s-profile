import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import { preload } from "react-dom";

import { site } from "@content/site";

import { DESKTOP_APPS } from "@/os/appMeta";
import { iconFor } from "@/os/icons";
import { DESKTOP_WALLPAPER_URL } from "@/os/preloadAssets";

import "./globals.css";

// 只用在 About 页面的像素字体标题，走 CSS 变量，不影响全站字体栈
const pixelFont = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // 桌面隐喻在缩放后会错位，固定住比较稳
  maximumScale: 1,
};

/** 桌面大图标去重后的 preload，HTML 一到就开始拉，不等开机动画 JS */
const DESKTOP_ICON_PRELOADS = [
  ...new Set(DESKTOP_APPS.map((app) => iconFor(app.icon, "large"))),
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  for (const href of DESKTOP_ICON_PRELOADS) {
    preload(href, { as: "image" });
  }
  preload(DESKTOP_WALLPAPER_URL, { as: "image" });
  // 登录 Guest 头像：开机动画期间就要进缓存，进登录页不能空白一块
  preload("/ip/avatar-heart.png", { as: "image" });

  return (
    <html lang="en" className={pixelFont.variable}>
      <body>{children}</body>
    </html>
  );
}
