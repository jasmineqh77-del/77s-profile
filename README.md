# 77's profile

一个复古 Windows 风格的个人网站：能开机、能登录、能拖窗口、能玩扫雷。

技术栈是 Next.js 16 + TypeScript，没有 UI 框架。桌面、任务栏、开始菜单、窗口管理、控件皮肤全部是手写 CSS。

外观走的是 Windows Vista/7 的 Aero：半透明玻璃窗框、居中带外发光的标题、圆形开始球、双栏开始菜单。开机、登录、关机、蓝屏这四个画面刻意留在更早的年代，和桌面形成对比。

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

Guestbook 的种子留言在 `content/guestbookSeed.ts`（Redis 为空时自动灌入）。

### Guestbook / Visitor Counter（需要 Upstash）

桌面上的 **Moments** 文件夹里有 Guestbook 和 Visitor Counter。留言和访客数要跨用户共享，所以需要 [Upstash Redis](https://upstash.com/)：

1. 在 Upstash 新建一个 Redis 数据库
2. 复制 REST URL 和 REST TOKEN
3. 在项目根目录建 `.env.local`：

```bash
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxx
```

4. 部署到 Vercel 时，在项目 Environment Variables 里填同样两个变量

没配的话，网站其它部分照常跑；打开 Guestbook / Visitor Counter 会提示 offline，不会整站挂掉。

访客计数：进桌面后静默 `POST /api/visits`，同一浏览器用 cookie 大约 24 小时内只加一次。

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

桌面图标和开始菜单会自动出现，不用另外注册。`appMeta.ts` 里的 `icon` 字段填的是图标名，可选值见 `src/os/icons.ts`。想加新图标见下面「图标素材」。

## 代码结构

```
content/            你的内容（改这里）
  site.ts
  guestbookSeed.ts  Guestbook 空库时的种子留言
  posts/*.md
src/
  app/              Next.js 入口、全局样式、api/*
  os/               「操作系统」内核
    windowStore.ts    窗口状态：打开/关闭/聚焦/最小化/层级
    systemStore.ts    开机 → 登录 → 桌面 → 关机 的状态机
    appMeta.ts        应用元数据（纯数据，不含组件）
    appRegistry.tsx   appId → 窗口内容组件
    pointerDrag.ts    拖拽与缩放的底层实现
    icons.ts          图标名 → PNG 路径
  components/       桌面外壳：桌面、图标、窗口边框、任务栏、开始菜单、开机画面
  apps/             各个窗口的内容
  lib/
    posts.ts        构建时读取 Markdown
    redis.ts        Upstash Redis 客户端
```

`appMeta.ts` 刻意和 `appRegistry.tsx` 分开：前者是纯数据，`windowStore` 也要用它，拆开才不会形成循环依赖。

## 图标素材

`public/icons/` 下的 PNG 是从 Win98/2000 系统 DLL 里提取出来的原始位图，取自归档仓库 [trapd00r/win95-winxp_icons](https://github.com/trapd00r/win95-winxp_icons)。**这批图的著作权属于 Microsoft，这里只作个人非商用致敬用途。这个站如果哪天要商用，这些图标必须先换掉。**

每个图标有两份：`public/icons/` 下是 48 或 32 的大图（桌面用），`public/icons/16/` 下是当年手工点的 16×16 小图（任务栏和菜单用）。放大显示走 `image-rendering: pixelated` 保住硬边，缩小显示则交给浏览器平滑处理——最近邻缩小会丢掉一半像素。这套逻辑都在 `src/components/AppIcon.tsx` 里。

想换图标或者加新图标，改 `scripts/fetch-icons.py` 里的 `ICON_MAP`，然后：

```bash
python3 scripts/fetch-icons.py   # 需要 Pillow
```

脚本负责下载、选帧、转成带透明通道的 PNG。新增的图标名记得同步加进 `src/os/icons.ts`。

## 指针素材

`public/cursors/` 下是 Windows XP 的「Hands（手掌）」指针方案，取自 [bartekl1/windows-ui-assets](https://github.com/bartekl1/windows-ui-assets) —— 那是 XP 系统 `%WINDIR%\Cursors` 目录的完整拷贝。**和图标一样，著作权属于 Microsoft，这里只作个人非商用致敬用途。**

有两处和直觉不一样，写在这里免得下次踩：

**一、产出的是 PNG，不是原样搬 `.cur`。** 虽然 `.cur` 里的 AND 蒙版和热点坐标都是完好的，但 Safari 对 `cursor: url(*.cur)` 的支持一直不靠谱。转成 PNG 三家浏览器都认，热点改写进 CSS 里也方便肉眼核对。

**二、`hand.ani` / `handwait.ani` 是动画指针，得抽帧。** CSS 不支持 `.ani`（所有浏览器都不支持），所以脚本从 RIFF 容器里取一帧当静态图用。这两帧分别当 `wait`（开机画面）和 `progress`（简历窗口探测 PDF 的那一下）。

还有一处是有意偏离原方案的：XP 的 Hands 里没有单独的「链接手型」，`pointer` 这里借了 `hmove.cur` 那只握拳手。真实 Win98 鼠标移到按钮上是不变形的，但这个站要的就是悬停有反馈，所以凡是能点的都换握拳手——桌面图标、窗口里的按钮、任务栏、开始菜单、右键菜单、链接；空白桌面和正文保持食指手 `harrow.cur`，两者一眼能分开。而站点没有任何地方用 CSS 的 `move`，借走 `hmove.cur` 不会撞车。

只有三类东西刻意留着箭头：窗口和小助手的标题栏（拖动区，不是按钮）、扫雷已翻开的格子、右键菜单的禁用项。它们的选择器权重都比全局那条 `button` 高，所以不用额外处理。

指针路径和热点集中定义在 `src/app/globals.css` 的 `--cur-*` 变量里，各 CSS Module 只写 `cursor: var(--cur-pointer)`。每条变量末尾都留了系统关键字兜底，PNG 加载不到会退回系统指针。

### 切换时为什么不跳

有三处专门为了「切换顺滑」做的处理，改动前最好先理解它们要解决什么：

**一、`pointer` / `progress` / `wait` 的热点是重算过的，不是原件里的值。** 这批指针的原生热点各自独立设计：`default`（食指手）的热点在指尖上，图案整个垂在鼠标下方；而 `pointer` 借用的 `hmove`（握拳）热点在拳心，图案有一半在鼠标上方。两者一切换，手就会整体往上跳 8 像素，看着像卡了一下。`fetch-cursors.py` 的 `align_hotspots()` 会把这几个的热点重算成「图案落点和 `default` 一致」，切换时就只有形状变、位置不动。

热点只决定图案画在哪，**不影响点击落点**（点击永远落在鼠标真实坐标上），所以这么改没有副作用。`ALIGN_TO_DEFAULT` 之外的指针一律保持原生热点：resize 系列的热点在捏合点、`crosshair` 在十字中心、`text` 在笔尖，这些位置本身有含义，挪了会让缩放和画图对不准。

**二、指针图在开机时统一预热。** 浏览器要等第一次真正需要某个指针才去取图，取到之前会先退回系统指针，于是第一次悬停按钮、第一次拖窗口边框都会闪一下。`Desktop.tsx` 里有个 effect 趁开机动画那几秒把 11 张全取回来（加起来不到 4KB）。新增指针记得同步加进那个 `CURSOR_ROLES` 数组。

**三、拖拽期间形态锁死，不跟着鼠标底下的元素走。** 拖窗口时鼠标经常不在标题栏上——窗口靠 React state 跟随，慢一帧，快速拖动鼠标就跑到前面去了；坐标被夹住之后（拖到屏幕边缘、缩放到 `MIN_WINDOW_SIZE`）窗口干脆不动，鼠标彻底甩开，拖到底部还会压上任务栏。缩放柄只有 5px 宽，情况更明显。默认行为下这一路上形态会反复横跳。

`startPointerDrag()` 在按下的瞬间用 `getComputedStyle` 取出抓着的那个元素当前生效的指针，锁到 `body` 的内联样式上，并打一个 `data-dragging` 标记；`globals.css` 里 `body[data-dragging] *` 让所有后代 `cursor: inherit !important`，因为后代自己声明的权重比 `body` 高，光锁 `body` 压不住。松开即还原。用 `getComputedStyle` 而不是手写一张「方向 → 指针变量」的表，是因为 8 个缩放柄的形态已经在 CSS 里定义过一次，抄第二份迟早会和 CSS 对不上。

想换指针：改 `scripts/fetch-cursors.py` 里的 `CURSOR_MAP`，然后：

```bash
python3 scripts/fetch-cursors.py   # 需要 Pillow
```

脚本跑完会把新的热点坐标打印出来，**记得同步回 `globals.css`**——这两处目前是手工对齐的，改了素材不改 CSS 的话热点就会错位。

已知取舍：`.cur` 原件是 32×32，在高分屏上按 CSS 像素绘制会略糊。这是所有复古站的常态，想改善得补 2x 图走 `image-set()`，暂时没做。

## 个人 IP 素材

`public/ip/` 下是同一个萌粒风角色的一套图，用 [ip-illustration-for-yourself](https://github.com/EverettFish/ip_illustration_for_yourself) 这个 skill 从一张本人正面照生成。**这批图是原创角色，著作权归站主，和上面两节的微软素材不是一回事。**

原始 1024 见方的母版放在 `scripts/ip-source/`，交付图由脚本产出：

```bash
python3 scripts/cutout-ip.py     # 需要 Pillow 和 numpy
```

角色身份靠一段固定的「身份锁」维持——发型几何、脸型眼型、配色、比例都写死在提示词里，每张图复用同一段，否则批量生成出来会是十几个长得像但不是同一个的人。锚点和三视图在 `scripts/ip-source/ip-anchor-01.png` 和 `ip-anchor-turnaround.png`，要加新姿势就拿这两张当参考图。

抠图这一步有两个坑，都写在 `cutout-ip.py` 里了：

**一、背景只能从画布边缘往里 flood fill，不能按颜色全局抠白。** 角色的奶白上衣、裙子上的白色小花和眼白跟背景是同一个白，全局抠一遍人就成筛子了。只有跟画布边缘连通的白才算背景，被描边围住的白属于角色。

**二、生成器会给角色描一圈白色贴纸边，外面还带一层很淡的灰投影。** 那层灰不够白，会把 flood fill 挡在外面，于是白边留成了不透明——在浅色背景上看不出来，一放到黑色关机画面上就露成一圈白毛。所以抠完还要贴着背景再往里啃几层浅色像素。这一步必须限步数：萌粒风的钢笔描边本来就是断的，不封口就会顺着缺口一路漏进角色内部。

各处用哪张：

| 位置 | 资产 | 尺寸 | 背景 |
|---|---|---|---|
| 登录页用户块 | `avatar-heart.png` | 54 | 白底方图 |
| 开始菜单头像 | `avatar-coffee.png` | 56 | 白底方图 |
| About hero | `avatar-office.png` | 56 | 白底方图 |
| 关机画面 | `sleep.png` | 150 | 透明 |
| 桌面助手 | `expr-happy/puzzled/ok` 轮换 | 44 | 透明 |
| 扫雷三态脸 | `expr-happy/celebrate/shocked` | 26 | 透明 |
| 浏览器标签页 | `src/app/icon.png` | 512 | 透明，裁到头部 |

前三处是压在白描边方框里的用户图块，抠成透明反而会漏出底色，所以刻意保留白底，和真实 Windows 用户图片一个路子。

扫雷那三张用的是全身而不是头部特写：26 像素下五官已经糊了，能区分三种状态靠的是姿势轮廓——握拳、举双手、捂脸。

**别拿 `AppIcon` 渲染这批图。** 那个组件在 48px 以上会开 `image-rendering: pixelated`，是给 Win98 位图图标保硬边用的，手绘线条走那条路会糊成一团。头像走 `src/components/IpAvatar.tsx`，其余直接用 `next/image`。

### 壁纸里的人物

`public/wallpaper/bliss-peek.jpg` 是站主本人的照片，直接拿来当壁纸用（`scripts/ip-source/wallpaper-peek-src.jpg` 原样压缩，没有做任何抠图/合成/交互处理）。早期做过一版"眼球跟着鼠标转"的追踪效果——虹膜挖空后叠贴图动态偏移，实测下来观感生硬（羽化边缘在放大或特定角度下会露出接缝，追踪范围也很难调得自然），已经去掉了，改回最直接的静态照片。

## 关于 Aero 样式

`src/app/globals.css` 里有一层 Aero 变量，各 CSS Module 只引用变量、不写魔法数字。改配色改这一处就够了：

| 变量 | 用途 |
| --- | --- |
| `--glass-bg` / `--glass-bg-inactive` | 窗框和标题栏的浅色玻璃，后者是失焦态 |
| `--glass-dark` | 任务栏和开始菜单的深色玻璃 |
| `--glass-edge` / `--glass-edge-inner` | 玻璃的外圈亮线和内圈高光 |
| `--glass-blur` | `backdrop-filter` 的模糊半径 |
| `--ctl-face` / `--ctl-face-hover` / `--ctl-face-active` | 按钮三态的竖向渐变 |
| `--accent` / `--accent-soft` | 选中色，后者是列表和菜单的悬停底 |
| `--title-glow` | 标题文字的白色外发光 |

有四件事写代码时容易踩：

**一、只有外壳做模糊，窗口正文区是不透明的。** 原版 Aero 就是这么分的——玻璃只在边框和标题栏，客户区始终实心。照做既还原了原版，也避免每开一个窗口就多叠一层实时 `backdrop-filter`，那个是逐帧重算的，拖窗口时最先卡的就是它。全站只有五处有 `backdrop-filter`：窗框、任务栏、开始菜单、右键菜单、小助手。

**二、Aero 的边框永远是两条 1px 的线**——外面一条亮白 `--glass-edge`，紧贴着里面一条更淡的 `--glass-edge-inner`，靠 `box-shadow: inset 0 0 0 1px` 画。想加粗或者加深都会立刻不像：加粗像 XP 的蓝框，加深像 98 的斜角。

**三、全局 `button` 会被画成 Aero 对话框按钮，自绘控件要摘出去。** 窗口里的按钮正需要这个皮肤，但桌面图标、任务栏、开始菜单、标题栏按钮这些是自绘的，加 `chrome-button` 类退回白板。globals.css 里的规则写成 `button:not(.chrome-button)`，是排除而不是覆盖——覆盖要连 `:hover` / `:active` / `:disabled` 一起复写，漏一个态就露馅。

**四、`chrome-button` 是元素选择器权重（`button:not(.chrome-button)` 算 0-1-1），单个类名压不住。** 所以模块里给这类按钮补样式时要带上父级，比如 `WindowFrame.module.css` 写的是 `.controls .control`、`Paint.module.css` 写的是 `.tools .toolActive`，这样不依赖样式表的加载顺序。

## 部署

推荐 Vercel，因为 Next.js 就是它家的，零配置：

1. 把代码推到 GitHub
2. 打开 [vercel.com/new](https://vercel.com/new)，用 GitHub 登录，选这个仓库
3. 什么都不用改，直接 Deploy

之后每次 `git push`，Vercel 会自动重新部署。会先给一个 `xxx.vercel.app` 的免费域名，想绑自己的域名在项目设置里加就行。

## 版权说明

这是个人致敬作品，和 Microsoft 没有任何关系。

- `public/wallpaper/bliss.jpg` 是 Charles O'Rear 1996 年拍摄的 Bliss 原片，来自流出的 Corbis 4510×3627 扫描件（600dpi），裁切缩放后存下来的。**微软 2000 年买断了这张照片的全部版权**，所以它和图标是同一种性质：仅作个人非商用致敬。这个文件目前没有在站点里使用（保留作为将来切回原版场景的备份），实际部署的是下面这条
- `public/wallpaper/bliss-peek.jpg` 是站主本人的照片（本人拍摄/生成），裁切缩放后当作当前部署的壁纸，肖像权归站主，跟上面那条的版权性质不是一回事
- `public/wallpaper/memory-smile.jpg` 是站主童年照片（清晰化后），仅用于右侧 Sidebar「Live wallpaper」网格动效，肖像权归站主
- 图标是微软的原始系统位图，仅作个人非商用使用，详见上面「图标素材」
- 指针是微软 XP 的 Hands 方案原件，同上，详见「指针素材」
- 开机画面的四格旗、任务栏的开始球都是手绘 SVG/CSS，不是微软素材
- `public/ip/` 那套角色图是站主的原创个人 IP，著作权归站主，不受上面几条限制
- 窗框、任务栏、开始菜单、全部控件皮肤是照着 Aero 手写的 CSS，没有引入第三方主题包
- 「切走标签页再切回来」的欢迎回来过场，背景光管效果用的是 Kevin Levron 的 [TubesCursor](https://github.com/klevron/threejs-components)（[CodePen 示例](https://codepen.io/soju22/pen/qEbdVjK)），协议 **CC BY-NC-SA 4.0**（署名-非商用-相同方式共享）。代码在触发那一刻才从 jsDelivr CDN 动态拉取（`src/components/WelcomeBack.tsx`），不打进本地 bundle，本站作为个人非商用作品集使用符合该协议
- 桌面右侧 Sidebar 打开的「Live wallpaper」网格跟手效果，算法对齐 [jasmineqh77-del 的 Canvas Grid Mouse Effect](https://codepen.io/jasmineqh77-del/pen/ZYebOZj)（fork 自 Tom Miller / creativeocean 的 [emBOove](https://codepen.io/creativeocean/pen/emBOove)），使用 GSAP（`src/components/InteractiveWallpaper.tsx`），源图为 `public/wallpaper/memory-smile.jpg`


**这个站如果哪天要商用，壁纸、图标、指针这三样都必须先换掉。**
