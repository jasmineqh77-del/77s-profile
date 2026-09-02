import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许多个 next dev 互不踩 .next（本机偶发开了两个实例时，旧进程会删掉对方的 .next/dev）
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
