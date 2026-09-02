"use client";

import { useEffect, useId, useState } from "react";

import { site } from "@content/site";

import { preloadDesktopAssets } from "@/os/preloadAssets";
import { useSystemStore } from "@/os/systemStore";

import styles from "./BootScreen.module.css";
import IpAvatar from "./IpAvatar";

/** 每块面板向自身重心收缩的比例，用来空出面板之间的黑色缝隙 */
const PANE_SCALE = 0.94;

/**
 * 手绘的四格波浪旗，纯 SVG，不使用微软的位图素材。
 * 四块面板的顶边和底边都是二次贝塞尔：左列往上拱、右列往下垂，
 * 合起来就是那种旗子被风吹起的感觉。
 */
function BootFlag({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const gloss = `${uid}-gloss`;
  /**
   * axis 是每块面板的明暗轴（用户坐标，不是包围盒比例），方向顺着
   * 旗面的倾斜，这样高光带才会跟着面板一起往左下走。
   * stops 直接取自参考图上横穿面板的一行像素。
   */
  const panes = [
    {
      id: `${uid}-red`,
      d: "M66 12 Q111 -4 156 24 L128 116 Q80 88 31 107 Z",
      pivot: [95, 65],
      axis: [56.6, 15.9, 150.9, 42.3],
      stops: [
        [0, "#f2894a"],
        [14, "#faa353"],
        [23, "#fcb857"],
        [33, "#f9a950"],
        [44, "#f8964b"],
        [55, "#f58345"],
        [66, "#ee713b"],
        [78, "#e3603e"],
        [90, "#d94d3e"],
        [100, "#cd4038"],
      ],
    },
    {
      id: `${uid}-green`,
      d: "M164 35 Q216 63 268 39 L242 129 Q190 150 137 122 Z",
      pivot: [203, 81],
      axis: [158.7, 44.5, 258.7, 72.5],
      stops: [
        [0, "#6b8d49"],
        [10, "#75994f"],
        [20, "#7da952"],
        [30, "#84bb53"],
        [40, "#8fc758"],
        [50, "#93c759"],
        [60, "#99c95c"],
        [70, "#a0cb60"],
        [80, "#99c85e"],
        [90, "#90c75f"],
        [100, "#83c353"],
      ],
    },
    {
      id: `${uid}-blue`,
      d: "M28 121 Q79 97 130 124 L100 218 Q50 190 1 213 Z",
      pivot: [65, 169],
      axis: [56.3, 15.8, 152.8, 42.8],
      stops: [
        [0, "#3a86b7"],
        [9, "#5ca0cf"],
        [18, "#7eb7e2"],
        [27, "#a4cbec"],
        [36, "#9bc7ea"],
        [45, "#85bae4"],
        [55, "#71aedd"],
        [64, "#5aa1d7"],
        [73, "#5193cd"],
        [82, "#4d84c4"],
        [91, "#4777b9"],
        [100, "#4062ab"],
      ],
    },
    {
      id: `${uid}-yellow`,
      d: "M142 126 Q194 155 246 128 L215 233 Q160 256 105 226 Z",
      pivot: [177, 178],
      axis: [156.1, 43.8, 261.4, 73.3],
      stops: [
        [0, "#c48f43"],
        [11, "#d39f3c"],
        [22, "#e4b235"],
        [33, "#f3c42e"],
        [44, "#face37"],
        [55, "#fad046"],
        [66, "#fad455"],
        [77, "#f9d656"],
        [88, "#fbd23a"],
        [100, "#f9cd2c"],
      ],
    },
  ];

  return (
    <svg
      className={className}
      viewBox="-6 -6 288 258"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${site.osName} logo`}
    >
      <defs>
        {panes.map((pane) => (
          <linearGradient
            key={pane.id}
            id={pane.id}
            gradientUnits="userSpaceOnUse"
            x1={pane.axis[0]}
            y1={pane.axis[1]}
            x2={pane.axis[2]}
            y2={pane.axis[3]}
          >
            {pane.stops.map(([offset, color]) => (
              <stop key={offset} offset={`${offset}%`} stopColor={color as string} />
            ))}
          </linearGradient>
        ))}
        {/* 顶边一点点高光、底边一点点压暗，做出布面的厚度 */}
        <linearGradient id={gloss} x1="0.06" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="18%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          <stop offset="74%" stopColor="#000" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.13" />
        </linearGradient>
      </defs>

      {panes.map((pane) => {
        const [cx, cy] = pane.pivot;
        const shrink = `translate(${cx * (1 - PANE_SCALE)} ${cy * (1 - PANE_SCALE)}) scale(${PANE_SCALE})`;
        return (
          <g key={pane.id} transform={shrink}>
            <path
              d={pane.d}
              fill={`url(#${pane.id})`}
              stroke={`url(#${pane.id})`}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d={pane.d} fill={`url(#${gloss})`} />
          </g>
        );
      })}

      <text x="222" y="228" fill="#fff" fontSize="17" fontFamily="Arial, Helvetica, sans-serif">
        ™
      </text>
    </svg>
  );
}

function ProgressBar() {
  return (
    <div className={styles.progressTrack}>
      <div className={styles.progressBlocks}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function BootScreen() {
  const setPhase = useSystemStore((s) => s.setPhase);
  const [skippable, setSkippable] = useState(false);

  useEffect(() => {
    // 开机这几秒把桌面图标/壁纸/指针塞进缓存，进桌面时不会一块一块蹦出来
    void preloadDesktopAssets();
    const showSkip = setTimeout(() => setSkippable(true), 900);
    const done = setTimeout(() => setPhase("login"), 3200);
    return () => {
      clearTimeout(showSkip);
      clearTimeout(done);
    };
  }, [setPhase]);

  return (
    <div className={styles.boot}>
      <div className={styles.brand}>
        <BootFlag className={styles.flag} />
        <p className={styles.vendor}>
          {site.userName}
          <sup>®</sup>
        </p>
        <p className={styles.osLine}>
          {site.osName}
          <span className={styles.xp}>xp</span>
        </p>
        <p className={styles.edition}>Professional</p>
      </div>

      <ProgressBar />

      {skippable && (
        <button
          type="button"
          className={`chrome-button ${styles.skip}`}
          onClick={() => setPhase("login")}
        >
          Skip →
        </button>
      )}

      <p className={styles.copyright}>{site.disclaimer}</p>
    </div>
  );
}

export function LoginScreen() {
  // 进桌面走 beginDesktopEntry（黑场），不再直接 setPhase
  useEffect(() => {
    // 跳过开机或缓存被清掉时，登录页再补一次；壁纸也提前抢
    void preloadDesktopAssets();
  }, []);

  return (
    <div className={styles.login}>
      <div className={styles.loginTop} />

      <div className={styles.loginMain}>
        <div className={styles.loginLeft}>
          <p className={styles.loginBrand}>{site.osName}</p>
          <p className={styles.loginTip}>To begin, click your user name</p>
        </div>

        <div className={styles.loginDivider} />

        <div className={styles.loginRight}>
          <button
            type="button"
            className={`chrome-button ${styles.userTile}`}
            onClick={() => useSystemStore.getState().beginDesktopEntry()}
            autoFocus
          >
            <IpAvatar variant="heart" size={54} priority className={styles.userAvatar} />
            <span>
              <span className={styles.userName}>Guest</span>
              <span className={styles.userNote}>Sign in as guest</span>
            </span>
          </button>
        </div>
      </div>

      <div className={styles.loginBottom}>
        <p>
          Once you&apos;re in, poke around the desktop icons and the Start menu. On a computer you
          can also drag windows and right-click the desktop.
        </p>
      </div>
    </div>
  );
}

export function ShutdownScreen() {
  const restart = useSystemStore((s) => s.restart);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!done) {
    return (
      <div className={styles.boot}>
        <div className={styles.shutdownBrand}>
          <IpAvatar variant="sleep" size={150} className={styles.shutdownIp} />
          <BootFlag className={styles.flagSmall} />
          <p className={styles.shutdownText}>Shutting down {site.osName}…</p>
        </div>

        <ProgressBar />
      </div>
    );
  }

  return (
    <div className={styles.safeOff}>
      <p className={styles.safeOffText}>It is now safe to turn off your computer.</p>
      <button type="button" onClick={restart} className={`chrome-button ${styles.restartButton}`}>
        Restart
      </button>
    </div>
  );
}
