/**
 * 图标暂时用 emoji：不依赖任何素材文件，也没有版权问题。
 * 以后想换成真正的 XP 图标 PNG，只要把这里的值改成图片路径，
 * 再改 DesktopIcon 的渲染方式即可。
 */
export const ICONS: Record<string, string> = {
  computer: "🖥️",
  folder: "📁",
  document: "📄",
  notepad: "📝",
  media: "🎵",
  pdf: "📕",
  mail: "✉️",
  recycle: "🗑️",
  mine: "💣",
  paint: "🎨",
  cmd: "⌨️",
  default: "📦",
};

export function iconFor(name: string): string {
  return ICONS[name] ?? ICONS.default;
}
