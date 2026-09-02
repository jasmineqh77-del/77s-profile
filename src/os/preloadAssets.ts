import { APPS } from "@/os/appMeta";
import { iconFor } from "@/os/icons";

/** 经典桌面壁纸；CSS / <img> / 预加载共用这一条路径 */
export const DESKTOP_WALLPAPER_URL = "/wallpaper/bliss-peek.jpg";

/** 桌面 / 开始菜单会用到的大图 + 16px 小图，去重后预加载 */
export function criticalIconUrls(): string[] {
  const names = new Set(APPS.map((app) => app.icon));
  names.add("default");
  names.add("error");
  names.add("flag");
  names.add("logoff");
  names.add("shutdown");

  const urls: string[] = [];
  for (const name of names) {
    urls.push(iconFor(name, "large"));
    urls.push(iconFor(name, "small"));
  }
  return urls;
}

/** 首屏就会用到的壁纸、指针、登录头像，避免进页时一块一块蹦出来 */
export function criticalChromeUrls(): string[] {
  return [
    DESKTOP_WALLPAPER_URL,
    "/ip/avatar-heart.png",
    "/ip/avatar-coffee.png",
    "/ip/sleep.png",
    "/cursors/default.png",
    "/cursors/pointer.png",
    "/cursors/progress.png",
    "/cursors/wait.png",
  ];
}

/**
 * 用浏览器原生 Image 把资源塞进 HTTP 缓存。
 * 失败也 resolve，别堵住开机流程。
 */
export function preloadImages(urls: string[]): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.decoding = "async";
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}

let wallpaperReady: Promise<void> | null = null;

/**
 * 保证桌面壁纸已下载并尽量 decode 完成。
 * 黑场淡出前等它，避免露青绿底色再闪出风景。
 */
export function ensureWallpaperReady(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (wallpaperReady) return wallpaperReady;

  wallpaperReady = new Promise<void>((resolve) => {
    const img = new window.Image();
    img.decoding = "async";
    // 提高优先级，和登录页抢带宽时先保壁纸
    try {
      img.fetchPriority = "high";
    } catch {
      /* older browsers */
    }
    const done = () => {
      if (typeof img.decode === "function") {
        img.decode().then(() => resolve(), () => resolve());
      } else {
        resolve();
      }
    };
    img.onload = done;
    img.onerror = () => resolve();
    img.src = DESKTOP_WALLPAPER_URL;
    if (img.complete && img.naturalWidth > 0) done();
  });

  return wallpaperReady;
}

export function preloadDesktopAssets(): Promise<void> {
  // 壁纸单独走高优先通道，其它资源并行
  void ensureWallpaperReady();
  return preloadImages([...criticalIconUrls(), ...criticalChromeUrls()]);
}
