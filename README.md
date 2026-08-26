# 77's profile

一个 Windows XP 风格的个人网站：能开机、能登录、能拖窗口、能玩扫雷。

技术栈是 Next.js 16 + TypeScript + [XP.css](https://github.com/botoxparty/XP.css)。桌面、任务栏、开始菜单、窗口管理这些都是自己写的（XP.css 只负责控件皮肤）。

## 本地跑起来

```bash
npm install
npm run dev
```

然后打开 http://localhost:3000 。

其他命令：

```bash
npm run build   # 生产构建，部署前可以先跑一遍确认没报错
npm run lint    # 代码检查
```

## 改内容：只要动 content/ 这个文件夹

**代码在 `src/`，内容在 `content/`。日常更新网站基本只会碰 `content/`。**

### `content/site.ts`

你的所有个人信息都在这里，每一项上面都有注释说明它显示在哪：

| 导出的变量 | 显示在哪 |
| --- | --- |
| `site` | 系统名、页面标题、登录页的用户名和一行简介 |
| `about` | 「关于我」窗口：开场白、几段自我介绍、系统属性表 |
| `contacts` | 「联系我」窗口的联系方式列表 |
| `nowPlaying` | 「正在学习」窗口（Winamp 播放列表样式） |
| `projects` | 「我的文件」窗口里的项目，双击打开详情 |
| `assistantTips` | 右下角回形针小助手念的提示 |
| `recycled` | 「回收站」里那些放弃掉的想法 |

改完存盘，`npm run dev` 会自动热更新，刷新浏览器就能看到。

### 加一篇博客文章

在 `content/posts/` 下新建一个 `.md` 文件，开头写上这三行：

```markdown
---
title: 文章标题
date: 2026-02-01
excerpt: 列表里显示的一句话摘要
---

正文从这里开始，正常写 Markdown 就行。
```

文件会按 `date` 倒序排列。加粗、列表、引用、代码块、图片都支持。图片放 `public/` 里，用 `![说明](/图片名.png)` 引用。

### 放简历

把 PDF 命名成 `resume.pdf` 丢进 `public/`，「简历.pdf」那个窗口就会自动变成 PDF 预览器（带下载按钮）。没放的话它会显示一句提示，不会报错。

## 加一个新窗口

需要改两个文件：

1. `src/os/appMeta.ts` — 加一条元数据（id、标题、图标、默认窗口尺寸、要不要出现在桌面/开始菜单）
2. `src/os/appRegistry.tsx` — 在 `switch` 里加一个 `case`，指向你的组件

桌面图标和开始菜单会自动出现，不用另外注册。图标目前用 emoji，对应关系在 `src/os/icons.ts`。

## 代码结构

```
content/            你的内容（改这里）
  site.ts
  posts/*.md
src/
  app/              Next.js 入口、全局样式
  os/               「操作系统」内核
    windowStore.ts    窗口状态：打开/关闭/聚焦/最小化/层级
    systemStore.ts    开机 → 登录 → 桌面 → 关机 的状态机
    appMeta.ts        应用元数据（纯数据，不含组件）
    appRegistry.tsx   appId → 窗口内容组件
    pointerDrag.ts    拖拽与缩放的底层实现
    icons.ts          图标表
  components/       桌面外壳：桌面、图标、窗口边框、任务栏、开始菜单、开机画面
  apps/             各个窗口的内容
  styles/           vendor 进来的 XP.css（见下）
  lib/posts.ts      构建时读取 Markdown
```

`appMeta.ts` 刻意和 `appRegistry.tsx` 分开：前者是纯数据，`windowStore` 也要用它，拆开才不会形成循环依赖。

## 关于 src/styles/xp.vendor.css

XP.css 最后一次发版是 2022 年，里面有 4 处 `:before:not([value])` 这样的写法——伪元素后面不能再跟选择器，现在的 CSS 解析器（Turbopack 用的 Lightning CSS）会直接报错，装了包也编译不过。

所以这里把它复制进项目并修掉了那几处，字体文件一起搬到了 `public/fonts/`。文件顶部有改动说明。XP.css 是 MIT 协议，可以这么用。

## 部署

推荐 Vercel，因为 Next.js 就是它家的，零配置：

1. 把代码推到 GitHub
2. 打开 [vercel.com/new](https://vercel.com/new)，用 GitHub 登录，选这个仓库
3. 什么都不用改，直接 Deploy

之后每次 `git push`，Vercel 会自动重新部署。会先给一个 `xxx.vercel.app` 的免费域名，想绑自己的域名在项目设置里加就行。

## 版权说明

这是个人致敬作品，和 Microsoft 没有任何关系。

- 壁纸是 AI 生成的「绿丘蓝天」，不是微软原版 Bliss
- 图标用的是 emoji，不是 XP 系统图标
- 控件样式来自 [XP.css](https://github.com/botoxparty/XP.css)（MIT）
