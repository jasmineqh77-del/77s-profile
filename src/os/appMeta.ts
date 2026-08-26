/**
 * 所有「应用」的元数据。纯数据，不引入任何 React 组件，
 * 这样 windowStore 和 appRegistry 都能安全引用，不会形成循环依赖。
 *
 * 想加一个新窗口：在这里加一条，再去 appRegistry.tsx 里挂上组件即可，
 * 桌面图标和开始菜单会自动出现。
 */

export type AppMeta = {
  id: string;
  title: string;
  /** public/icons 下的文件名 */
  icon: string;
  defaultSize: { w: number; h: number };
  /** 是否在桌面上显示图标 */
  onDesktop?: boolean;
  /** 开始菜单分组：left = 常用（深色左栏），right = 系统项 */
  startMenu?: "left" | "right" | false;
  /** 点击后不开窗口，而是跳转外链 */
  externalHref?: string;
};

export const APPS: AppMeta[] = [
  {
    id: "about",
    title: "关于我",
    icon: "computer",
    defaultSize: { w: 560, h: 460 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "projects",
    title: "我的文件",
    icon: "folder",
    defaultSize: { w: 640, h: 440 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "project-detail",
    title: "项目详情",
    icon: "document",
    defaultSize: { w: 560, h: 460 },
    startMenu: false,
  },
  {
    id: "blog",
    title: "博客",
    icon: "notepad",
    defaultSize: { w: 720, h: 500 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "now",
    title: "正在学习",
    icon: "media",
    defaultSize: { w: 400, h: 320 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "resume",
    title: "简历.pdf",
    icon: "pdf",
    defaultSize: { w: 600, h: 560 },
    onDesktop: true,
    startMenu: "right",
  },
  {
    id: "contact",
    title: "联系我",
    icon: "mail",
    defaultSize: { w: 480, h: 380 },
    onDesktop: true,
    startMenu: "right",
  },
  {
    id: "recycle",
    title: "回收站",
    icon: "recycle",
    defaultSize: { w: 520, h: 400 },
    onDesktop: true,
    startMenu: false,
  },
  {
    id: "minesweeper",
    title: "扫雷",
    icon: "mine",
    defaultSize: { w: 300, h: 380 },
    onDesktop: true,
    startMenu: "right",
  },
  {
    id: "paint",
    title: "画图",
    icon: "paint",
    defaultSize: { w: 560, h: 460 },
    onDesktop: true,
    startMenu: "right",
  },
  {
    id: "cmd",
    title: "命令提示符",
    icon: "cmd",
    defaultSize: { w: 560, h: 360 },
    startMenu: "right",
  },
];

const BY_ID = new Map(APPS.map((a) => [a.id, a]));

export function getAppMeta(id: string): AppMeta | undefined {
  return BY_ID.get(id);
}

export const DESKTOP_APPS = APPS.filter((a) => a.onDesktop);
