"use client";

import Image from "next/image";

/**
 * 同一个角色的几张场景图,按位置挑一张用。
 * sleep 是透明的,专门给关机那个黑底画面;其余三张是白底方图,压在
 * 有色背景上的白描边方框里,和真实 Windows 用户图块一个路子。
 */
export const IP_AVATAR_SOURCES = {
  heart: "/ip/avatar-heart.png",
  coffee: "/ip/avatar-coffee.png",
  office: "/ip/avatar-office.png",
  sleep: "/ip/sleep.png",
} as const;

export type IpAvatarVariant = keyof typeof IP_AVATAR_SOURCES;

type Props = {
  variant: IpAvatarVariant;
  /** 交给 next/image 的固有尺寸,实际显示尺寸由 CSS 决定 */
  size: number;
  className?: string;
  /** 登录 Guest 等首屏头像：关掉懒加载 */
  priority?: boolean;
};

/**
 * 头像一律当装饰处理:这几处旁边都有名字或说明文字,读屏再念一遍是噪音。
 *
 * 注意别图省事走 AppIcon —— 那个在 48px 以上会开 image-rendering: pixelated,
 * 那是给 Win98 位图图标保硬边用的,手绘线条走那条路会糊成一团。
 */
export default function IpAvatar({ variant, size, className, priority = false }: Props) {
  return (
    <Image
      src={IP_AVATAR_SOURCES[variant]}
      alt=""
      aria-hidden
      width={size}
      height={size}
      unoptimized
      priority={priority}
      draggable={false}
      className={className}
    />
  );
}
