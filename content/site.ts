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
  userTagline: "Product intern · Incoming MSc Mathematics (Big Data), CUHK",
  /** 搜索引擎摘要 */
  description:
    "Jiaqi Huang (77) — a product intern with a data science background. Ad monetization at Meituan, the Doubao AI shopping assistant at ByteDance, sales ops at NIO. A Windows XP you can actually boot up and play with.",
  /** 页面底部的致敬声明 */
  disclaimer: "A personal tribute project. Not affiliated with Microsoft.",
};

/** 「关于我」窗口，仿 XP 的「系统属性」面板 */
export const about = {
  headline: "Hi, I'm 77 (Jiaqi Huang)",
  /** 顶部照片墙区域：真实小时候的照片 + 一句怀旧开场白 */
  photo: "/photos/childhood.jpg",
  photoAlt: "77 at age three or four, on Tiger Hill in Suzhou with her dad",
  hook: "Hi, I'm 77. I was three or four, on Tiger Hill in Suzhou with my dad.",
  caption:
    "It wouldn't be the last time I stood at a railing looking out over a skyline that wasn't mine yet. Twenty-odd cities later, the habit's the same — find a vantage point ⛰️, watch how the place actually runs.",
  intro: [
    "I studied Data Science and Big Data Technology as an undergrad, and in September 2026 I start an MSc in Mathematics (Big Data) at the Chinese University of Hong Kong. Undergrad GPA 3.8/5, top 10% of my major, with 94+ in machine learning and deep learning, data structures, and database systems.",
    "The past year and a half has been product internships. On Meituan's monetization team I worked on decoupling the feed-ad pipeline, ranking strategy, and display frequency capping; on Doubao mobile at ByteDance I built the product cards for an AI shopping assistant; earlier, at NIO, I built a sales-ops reporting system from scratch. What they have in common is that you have to read the data and make a judgment call at the same time — turning a fuzzy problem into something measurable is the part I'm good at.",
    "My tooling is omnivorous: SQL, Python, and Power BI for the numbers; Figma, Axure, Modao, and XMind for turning ideas into pictures; Claude Code, Codex, and Cursor have become a permanent part of the daily workflow. This site was built that way too.",
    "Offline I'm an ESFP. I've been to 20-odd cities, some of them alone, and I've picked up the habit of watching how people and services actually behave on the road. I also make travel-guide decks and perler-bead art — I can sit still for a very long time on very small things.",
  ],
  /** 左边是标签，右边是内容，会渲染成 XP 系统属性那种两栏表格 */
  specs: [
    { label: "System", value: "77-OS Professional" },
    { label: "Status", value: "MSc student, CUHK" },
    {
      label: "School",
      value: "CUHK (Sep 2026 – Jun 2027) · Jiangsu Normal University (Sep 2022 – Jun 2026)",
    },
    {
      label: "Major",
      value: "MSc Mathematics (Big Data) · BSc Data Science and Big Data Technology",
    },
    { label: "Location", value: "Xuzhou, Jiangsu → Hong Kong" },
    {
      label: "Currently",
      value: "In Hong Kong for the new term, writing up past internships, building this site",
    },
  ],
};

export type ContactLink = {
  label: string;
  value: string;
  /** 有 href 就渲染成可点击链接，没有就是纯文本（比如微信号） */
  href?: string;
};

/**
 * Contact 窗口是写信表，只读这一条邮箱当 To。
 * 微信 / GitHub / 小红书有了再加回来；简历里的手机号不要放进这个会公开发布的文件。
 */
export const contacts: ContactLink[] = [
  {
    label: "Email",
    value: "1697429486@qq.com",
    href: "mailto:1697429486@qq.com",
  },
];

/** 「正在学习」窗口，仿 Winamp 的播放列表 */
export const nowPlaying = {
  status: "Now learning",
  items: [
    { title: "Claude Code / Codex / Cursor", meta: "Tools · daily driver" },
    { title: "CUHK Math (Big Data) prerequisites", meta: "Coursework · cramming before term" },
    { title: "Travel guide decks", meta: "Side quest · in progress" },
    { title: "Perler beads", meta: "Craft · anxiety management" },
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
    id: "doubao-shopping-card",
    name: "Doubao AI Shopping Cards",
    kind: "Internship · ByteDance",
    summary: "Turning an AI assistant from \"here's some advice\" into \"I can help you decide\"",
    body: [
      "Feb–May 2026, product intern on Doubao mobile at ByteDance. The problem was concrete: when someone asked Doubao \"what should I buy,\" the AI could only reply with a paragraph of text, and they still had to go search another app themselves — the decision path broke off halfway. What we wanted to validate was whether the minimum viable loop for AI-assisted shopping holds up once you put real, structured product data into the conversation: images, titles, prices, and a way through to checkout.",
      "My first piece was a tiered scheme for recognizing shopping intent. I split requests into four classes — strong intent, weak intent, non-shopping, and risk-sensitive — and defined the trigger conditions and routing logic for product cards under each. The hard part wasn't the classification itself but the principle of \"better to under-trigger than to trigger wrongly.\" We landed at 87.0% intent-recognition accuracy, with false triggers in non-shopping contexts held under 3%.",
      "The second piece was turning natural language into structured fields — category, budget, audience, scenario — while distinguishing explicit conditions from implicit ones. This is where I hit a wall: the model loves to reason. If a user only mentioned a budget, it would invent an audience and a scenario on its own, and the recall set narrowed with every inference. So the prompt went through several rounds, and we ended up requiring that every recommendation rationale contain exactly four things: basic product info, the match to the stated need, a trust signal, and a way to act.",
      "The third piece was trustworthy supply and risk fallbacks. Large models make up products; that's a hard failure. I helped build a pool of real product supply plus a multi-layer validation mechanism, hooked into live e-commerce data and fact-checking titles, prices, stock, and link validity, on top of downgrading anomalous items, blocking unsupported recommendations, and falling back in high-risk scenarios. The final product-fact error rate was 0.3%, under our 0.5% target.",
      "Last was experimental validation. I designed several A/B groups around how many cards to show, how to order them, and how to phrase them, and built an evaluation chain covering intent recognition, recall, card clicks, detail views, and negative feedback. The winner was \"one card above the fold plus horizontal swipe to expand\": 72% positive user acceptance and a 4.1% effective detail-view rate — enough to show the loop can ship.",
    ],
  },
  {
    id: "meituan-feed-ads",
    name: "Meituan Feed Ad Monetization",
    kind: "Internship · Meituan",
    summary: "Pipeline decoupling, multi-channel recall, ranking rework, frequency capping — all at once",
    body: [
      "Aug–Dec 2025, product intern on Meituan's monetization team, working on the homepage feed and local-services group buying. Two problems were unavoidable: ads and organic recommendations were coupled so deeply at the pipeline level that touching one moved the other; and low-frequency, high-ticket categories like medical aesthetics converted badly while carrying compliance risk. The goal was to lift monetization efficiency without hurting the user experience.",
      "Pipeline decoupling and multi-channel recall: I worked with engineering to push the decoupling through, and owned day-to-day maintenance and data validation for the ad recall index. To widen the candidate set we added text inverted-index recall, vector semantic recall, and an LBS-constrained geographic channel, plus a cold-start candidate pool to keep supply diverse. After launch, feed PVR rose 4.02% and ad load rose 27.8%.",
      "Ranking rework and price-band matching: with the algorithm team I reworked the ad ranking logic and shipped an \"estimated GMV × user price-band match factor,\" anchoring each user to a price tier from their purchase history, then pushed through a price-deviation penalty — ads outside a user's spending range get demoted outright. Ad ROI rose 7.41% in the food channel and 11.65% in medical aesthetics, with far fewer low-value impressions.",
      "AI intent detection and compliance controls for medical-aesthetics ads: a double filter of \"AI intent model plus hard rules.\" Behavioral sequences helped the model judge real purchase intent so we could screen out low-intent traffic; alongside that, OCR and NLP automatically flagged non-compliant imagery and false claims in creatives, with hard rules filtering out unlicensed advertisers. Revenue in the beauty-and-health channel grew 12.18% while complaint and refund rates did not move — that second half is the part I care about most.",
      "Frequency capping and A/B testing: I designed and rolled out \"one SKU per merchant, aggregated\" plus a cap of two ads per category, with fatigue decay on top, so the same person doesn't get hit with the same kind of ad over and over. I also owned traffic allocation and results analysis across several A/B tests. Once the strategy rolled out at scale, revenue rose 23.64% in food and 18.15% in medical aesthetics, with no regression in session length or click-through.",
      "The biggest thing I took away: monetization isn't \"cram in more ads.\" It's finding the narrow band where user experience and revenue can both still go up, then using experiments to keep checking that you aren't fooling yourself.",
    ],
  },
  {
    id: "nio-sales-ops",
    name: "NIO Sales-Ops Data System",
    kind: "Internship · NIO",
    summary: "Building process and outcome metrics for frontline sales from scratch",
    body: [
      "Mar–May 2025, sales-ops intern on NIO's User and Service Experience team, supporting frontline sales groups across northern Jiangsu.",
      "Three things, mainly. Data plumbing: I pulled together multiple sources — order locks, user operations, and others — and built a monitoring and reporting system from scratch covering both process metrics and outcome metrics, so product and sales ops could get numbers while they were still fresh. Metrics operations: I built a performance dashboard, tracked core conversion metrics like order-lock completion rate, and used a four-quadrant classification to segment the sales team and locate bottlenecks. Decision support: I put together a quantitative evaluation model and helped run monthly ratings and performance reviews, turning data into plans someone could act on directly.",
      "It wasn't a long stint, but it was the first time I really understood that the frontline doesn't want a pretty dashboard — it wants the two or three numbers it can immediately change its behavior on.",
    ],
  },
  {
    id: "clinic-ux-research",
    name: "Smart Outpatient UX Research",
    kind: "University project · Project lead",
    summary: "KANO + IPA + a SLOPE trend algorithm, turning \"experience\" into business metrics",
    body: [
      "Dec 2024 – May 2025, as project lead, studying the smart outpatient systems used across 13 cities in Jiangsu province. The problem was clear: the systems had shipped, but usage depth wasn't rising — and \"the experience is bad\" is not a statement you can iterate a product on.",
      "I designed a quantitative evaluation framework combining the KANO model with IPA analysis, translating subjective user experience into objective metrics that could guide product lifecycle operations. On the engineering side I implemented a SLOPE trend-quantification module in Python and wired up an end-to-end flow from raw data ingestion through model training; the final model reached an R² of 0.981.",
      "For output I produced a KANO attribute classification chart and an IPA four-quadrant matrix, identifying the must-have features and the pain points that genuinely drive visit frequency and satisfaction, then wrote a product operations report on that basis — data to back up registration-flow improvements and more targeted user guidance.",
      "Looking back, this project is where my product methodology started: work out what you're going to measure before you touch the solution.",
    ],
  },
];

export type DesignItem = {
  id: string;
  title: string;
  /** 缩略图，320×200 左右，风格是深色/影调，直接给人「设计作品」的观感 */
  thumbnail: string;
  /**
   * demo = 点击触发站内已有的交互效果
   * link = 点击后跳外链
   * site = 在 77-OS 里开一个内嵌网页窗口浏览（手机上直接开新标签看同一个页面）
   */
  kind: "demo" | "link" | "site";
  /** link 的外链地址；site 则是要内嵌的页面地址（public 下的同源静态页） */
  href?: string;
};

/**
 * 「design」文件夹里的作品，一件一件加，网格会自动排下去。
 * Welcome Back 点开是站内本来就有的全屏过场特效，可以现场演示；
 * 63 Days 是一份存档在 public 下的独立网页，装进窗口里看。
 */
export const designs: DesignItem[] = [
  {
    id: "welcome-back",
    title: "Welcome Back",
    thumbnail: "/design/welcome-back.jpg",
    kind: "demo",
  },
  {
    id: "63-days",
    title: "63 Days After Graduation",
    thumbnail: "/design/63-days.jpg",
    kind: "site",
    // 存档自 LootAI 上的原作品页；原站禁止被 iframe 内嵌，所以窗口里放同源副本
    href: "/design/63-days/index.html",
  },
];

/**
 * 右下角小助手随机念的提示，想加就往数组里塞一条。
 * 手机上没有双击和拖拽，所以涉及这些操作的提示要写明「在电脑上」。
 */
export const assistantTips = [
  "Every icon on the desktop opens a window. On a computer you can drag them around by the title bar.",
  "On a computer, window edges resize, and double-clicking the title bar maximizes.",
  "Try Minesweeper — it's the real thing, you can actually win.",
  "The Recycle Bin holds ideas I gave up on. More honest than the portfolio itself.",
  "Type help in the Command Prompt. There's a pile of commands to play with.",
  "That \"Don't Click This\" in the Start menu — really, don't.",
  "\"Shut Down\" at the bottom of the Start menu has a surprise waiting.",
];

/**
 * 「回收站」——放弃的想法。
 * 下面两条是占位示例，不是真事，建议换成你自己真正放弃过的东西，
 * 这个窗口最有个人味道，写得越具体越好看。
 */
export const recycled = [
  {
    name: "An app idea I never finished",
    reason: "Thought it through, realized nobody needed it, deleted it",
  },
  {
    name: "A newsletter that stopped after three posts",
    reason: "Overestimated how often I'd write",
  },
];
