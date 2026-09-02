import Image from "next/image";

import { iconFor } from "@/os/icons";

import styles from "./AppIcon.module.css";

type Props = {
  /** appMeta 里的图标 key，比如 computer、recycle */
  icon: string;
  /** 显示边长，单位 px */
  size: number;
  className?: string;
  /** 首屏桌面图标：关掉懒加载，优先拉图 */
  priority?: boolean;
};

/**
 * 图标一律当装饰处理：旁边永远有文字标签，读屏念一遍图标名反而啰嗦。
 */
export default function AppIcon({ icon, size, className, priority = false }: Props) {
  // 16px 及以下用原生小帧，1:1 显示；再大就用大图，缩一点也比放大糊要好
  const variant = size <= 16 ? "small" : "large";
  // 大图的原始帧是 32 或 48：显示到 48 属于放大，得保住硬边；
  // 显示得更小属于缩小，平滑插值反而干净
  const pixelated = variant === "small" || size >= 48;

  return (
    <Image
      src={iconFor(icon, variant)}
      alt=""
      aria-hidden
      width={size}
      height={size}
      // 这是像素图，交给 Next 重新编码会把硬边磨圆
      unoptimized
      priority={priority}
      draggable={false}
      className={`${styles.icon} ${pixelated ? styles.pixelated : ""} ${className ?? ""}`}
    />
  );
}
