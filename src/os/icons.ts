/**
 * 图标是从原版 Windows 系统 DLL 里提取出来的位图，
 * 由 scripts/fetch-icons.py 下载并转成 PNG。
 *
 * 每个图标有两份：public/icons/ 下是 48 或 32 的大图，
 * public/icons/16/ 下是当年手工点的 16×16 小图。
 *
 * 想换某个图标：改 scripts/fetch-icons.py 里的 ICON_MAP 再重跑脚本，
 * 这里不用动。
 */
const ICON_FILES: Record<string, string> = {
  computer: "computer.png",
  folder: "folder.png",
  document: "document.png",
  notepad: "notepad.png",
  media: "media.png",
  pdf: "pdf.png",
  mail: "mail.png",
  recycle: "recycle.png",
  mine: "mine.png",
  paint: "paint.png",
  cmd: "cmd.png",
  error: "error.png",
  flag: "flag.png",
  logoff: "logoff.png",
  shutdown: "shutdown.png",
  default: "document.png",
};

export type IconVariant = "large" | "small";

export function iconFor(name: string, variant: IconVariant = "large"): string {
  const file = ICON_FILES[name] ?? ICON_FILES.default;
  return variant === "small" ? `/icons/16/${file}` : `/icons/${file}`;
}
