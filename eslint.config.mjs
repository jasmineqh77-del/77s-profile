import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 换 distDir 调试时留下的 .next-isolated / .next-wallpaper 之类的构建产物
    ".next-*/**",
    // 原样照搬的静态资源：作品页存档、第三方压缩包，不按本项目的规矩写
    "public/**",
  ]),
]);

export default eslintConfig;
