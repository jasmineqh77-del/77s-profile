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
    title: "About Me",
    icon: "computer",
    // 照片故事 + 六行规格表，尽量打开就能看全
    defaultSize: { w: 560, h: 660 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "projects",
    title: "My Documents",
    icon: "folder",
    defaultSize: { w: 640, h: 440 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "project-detail",
    title: "Project Details",
    icon: "document",
    defaultSize: { w: 560, h: 460 },
    startMenu: false,
  },
  {
    id: "design",
    title: "design",
    icon: "folder",
    // 不再开窗口了（原地展开缩略图），这个字段留着只是满足类型要求
    defaultSize: { w: 460, h: 360 },
    onDesktop: true,
    startMenu: false,
  },
  {
    id: "web-frame",
    // 标题由 open() 时传进来的作品名覆盖，这里只是没传时的兜底
    title: "Web Page",
    icon: "document",
    // 装的是整个外部网站，给到接近满屏；windowStore.open 会按视窗收口，小屏不会开出界
    defaultSize: { w: 1180, h: 780 },
    startMenu: false,
  },
  {
    id: "moments",
    title: "Moments",
    icon: "folder",
    defaultSize: { w: 420, h: 320 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "guestbook",
    title: "Sign My Guestbook",
    icon: "notepad",
    defaultSize: { w: 420, h: 480 },
    startMenu: false,
  },
  {
    id: "visitor-counter",
    title: "Visitor Counter",
    icon: "document",
    defaultSize: { w: 360, h: 260 },
    startMenu: false,
  },
  {
    id: "blog",
    title: "Blog",
    icon: "notepad",
    defaultSize: { w: 720, h: 500 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "now",
    title: "Now Learning",
    icon: "media",
    defaultSize: { w: 400, h: 320 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "music",
    title: "Music",
    icon: "media",
    defaultSize: { w: 900, h: 620 },
    onDesktop: true,
    startMenu: "left",
  },
  {
    id: "resume",
    title: "resume.pdf",
    icon: "pdf",
    defaultSize: { w: 600, h: 560 },
    onDesktop: true,
    startMenu: "right",
  },
  {
    id: "contact",
    title: "Contact Me",
    icon: "mail",
    defaultSize: { w: 500, h: 460 },
    onDesktop: true,
    startMenu: "right",
  },
  {
    id: "recycle",
    title: "Recycle Bin",
    icon: "recycle",
    defaultSize: { w: 520, h: 400 },
    onDesktop: true,
    startMenu: false,
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    icon: "mine",
    defaultSize: { w: 300, h: 380 },
    onDesktop: true,
    startMenu: "right",
  },
  {
    id: "paint",
    title: "Paint",
    icon: "paint",
    defaultSize: { w: 560, h: 520 },
    onDesktop: true,
    startMenu: "right",
  },
  {
    id: "cmd",
    title: "Command Prompt",
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
