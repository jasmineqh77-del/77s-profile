import type { Metadata } from "next";

import { site } from "@content/site";

import "@/styles/xp.vendor.css";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
