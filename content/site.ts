/**
 * 站点的全部个人信息都在这个文件里。
 * 改这里就能改网站，不需要动 src/ 下的任何代码。
 */

export const site = {
  /** 系统名，出现在开机画面、登录页、开始菜单 */
  osName: "77-OS",
  /** 浏览器标签页标题 */
  title: "77's profile",
  /** 登录画面和开始菜单顶部显示的用户名 */
  userName: "77",
  /** 登录画面用户名下面的一行小字 */
  userTagline: "产品实习生 · 在读学生",
  /** 搜索引擎摘要 */
  description: "77 的个人主页，一台可以开机、可以玩的 Windows XP。",
  /** 页面底部的致敬声明 */
  disclaimer: "纯属个人致敬作品，与 Microsoft 无关。",
};

/** 「关于我」窗口，仿 XP 的「系统属性」面板 */
export const about = {
  headline: "你好，我是 77",
  intro: [
    "在读学生，目前在做产品实习。",
    "喜欢把想法做成能点开的东西，这个网站本身就是一个。",
    "这段介绍先随便写着，等你把真实内容给我，我再替换掉。",
  ],
  /** 左边是标签，右边是内容，会渲染成 XP 系统属性那种两栏表格 */
  specs: [
    { label: "系统", value: "77-OS Professional" },
    { label: "身份", value: "在读学生 / 产品实习生" },
    { label: "学校", value: "（待补充）" },
    { label: "专业", value: "（待补充）" },
    { label: "所在地", value: "（待补充）" },
    { label: "在忙什么", value: "做产品、写东西、做这个网站" },
  ],
};

export type ContactLink = {
  label: string;
  value: string;
  /** 有 href 就渲染成可点击链接，没有就是纯文本（比如微信号） */
  href?: string;
};

export const contacts: ContactLink[] = [
  { label: "邮箱", value: "（待补充）", href: "mailto:" },
  { label: "微信", value: "（待补充）" },
  { label: "GitHub", value: "（待补充）", href: "https://github.com/" },
  { label: "小红书", value: "（待补充）" },
];

/** 「正在学习」窗口，仿 Winamp 的播放列表 */
export const nowPlaying = {
  status: "正在学习",
  items: [
    { title: "（在读的书）", meta: "书 · 读到一半" },
    { title: "（在学的技能）", meta: "技能 · 入门中" },
    { title: "（在追的产品）", meta: "产品 · 天天在用" },
  ],
};

export type Project = {
  id: string;
  name: string;
  /** 文件夹窗口里显示的文件类型，比如「实习项目」「课程作业」 */
  kind: string;
  /** 一句话说明，列表里显示 */
  summary: string;
  /** 详情窗口的正文，每个字符串是一段 */
  body: string[];
  /** 可选的外链 */
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    id: "internship",
    name: "产品实习",
    kind: "实习项目",
    summary: "在实习里做的第一个真需求",
    body: [
      "这里写你实习期间负责的事情：背景是什么、你做了什么、结果如何。",
      "作品少不要紧，把一件事讲透比列十件事有说服力得多。建议写清楚：你发现了什么问题、你怎么定义的、最后数据或反馈是什么。",
    ],
  },
  {
    id: "coursework",
    name: "课程作业",
    kind: "课程作业",
    summary: "一个还挺喜欢的课程项目",
    body: [
      "课程项目同样可以写成 case study。",
      "重点写你的思考过程，而不是最终交付物有多漂亮。",
    ],
  },
];

/** 「回收站」——放弃的想法。这个窗口最有个人味道，建议认真写 */
export const recycled = [
  {
    name: "一个没做完的 App 想法",
    reason: "想清楚之后发现没人需要，先删了",
  },
  {
    name: "写了三篇就断更的公众号",
    reason: "高估了自己的更新频率",
  },
];
