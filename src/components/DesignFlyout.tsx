"use client";

import Image from "next/image";

import { designs, type DesignItem } from "@content/site";

import { useSystemStore } from "@/os/systemStore";
import { useWindowStore } from "@/os/windowStore";

import styles from "./DesignFlyout.module.css";

type Props = {
  left: number;
  top: number;
  /** 手机没有双击，单击就打开；顺带让 site 类作品退回跳外链，别挤在小窗口里 */
  isMobile: boolean;
  /** 打开之后通知桌面收起浮层 */
  onOpened: () => void;
};

export default function DesignFlyout({ left, top, isMobile, onOpened }: Props) {
  const triggerWelcomeBack = useSystemStore((s) => s.triggerWelcomeBack);
  const openWindow = useWindowStore((s) => s.open);

  const openExternally = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

  const handleOpen = (item: DesignItem) => {
    if (item.kind === "demo" && item.id === "welcome-back") {
      // 文件夹里是随时可以重复看的演示，不设倒计时，让用户自己点掉
      triggerWelcomeBack({ autoClose: false });
    } else if (item.kind === "link" && item.href) {
      openExternally(item.href);
    } else if (item.kind === "site" && item.href) {
      if (isMobile) {
        openExternally(item.href);
      } else {
        openWindow("web-frame", {
          title: item.title,
          payload: { href: item.href, label: item.title },
          dedupeKey: item.id,
        });
      }
    }
    onOpened();
  };

  return (
    <div className={styles.flyout} style={{ left, top }}>
      {designs.map((item, i) => (
        <button
          key={item.id}
          type="button"
          className={`chrome-button ${styles.tile}`}
          style={{ animationDelay: `${i * 90}ms` }}
          onClick={isMobile ? () => handleOpen(item) : undefined}
          onDoubleClick={isMobile ? undefined : () => handleOpen(item)}
        >
          <span className={styles.thumbWrap}>
            <Image
              src={item.thumbnail}
              alt={item.title}
              width={140}
              height={88}
              unoptimized
              draggable={false}
              className={styles.thumb}
            />
            <span className={styles.badge} aria-hidden>
              {/* 内联 SVG 箭头，跟站内旗子/头像一样手绘，不用额外图片素材 */}
              <svg viewBox="0 0 16 16" width="9" height="9">
                <path d="M3 13 13 3M6 3h7v7" fill="none" stroke="#fff" strokeWidth="1.6" />
              </svg>
            </span>
          </span>
          <span className={styles.label}>{item.title}</span>
        </button>
      ))}
    </div>
  );
}
