#!/usr/bin/env python3
"""把萌粒风 IP 原图处理成站点直接能用的资产。

生图工具只能吐纯白底的 1024 见方 RGB 图，透明通道得在这里还原。

关键点是背景必须从画布四边往里 flood fill，不能按颜色全局抠白：角色身上的
奶白色上衣、裙子上的白色小花和眼白都跟背景同色，全局抠白会把她打成筛子。
只有跟画布边缘连通的白才是背景，被黑色描边围起来的白属于角色。

用法:
    python3 scripts/cutout-ip.py                    # 全量重跑
    python3 scripts/cutout-ip.py --only expr-happy  # 只跑一个
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass, field
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageDraw, ImageOps
except ImportError as exc:  # pragma: no cover
    sys.exit(f"缺依赖: {exc}. 先装 pillow 和 numpy。")

REPO = Path(__file__).resolve().parent.parent
SOURCE_DIR = REPO / "scripts" / "ip-source"

# 低于这个亮度就不算背景白。生成图的白底是纯 255,留一点余量吃掉 PNG 压缩噪点
WHITE_THRESHOLD = 244
# 描边外侧那一圈半透明像素:直接留成不透明会在深色背景上镶一道白边
RIM_WIDTH = 2
# 生成器爱给角色描一圈白色贴纸边,外面还带一层很淡的灰投影。那层灰不够白,
# 会把 flood fill 挡在外面,于是白边留成了不透明,在黑色关机画面上露成一圈白毛。
# 所以贴着背景再往里啃几层浅色像素。必须限步数:钢笔描边本来就是断的,
# 不封口就会顺着缺口一路漏进角色内部。
KEYLINE_THRESHOLD = 222
KEYLINE_STEPS = 6


@dataclass(frozen=True)
class Asset:
    """一个源文件 -> 一个交付文件。"""

    source: str
    out: str
    size: int
    transparent: bool
    # 画布留白比例,避免角色顶到边框上
    margin: float = 0.04
    # 只取内容框上部这个比例(favicon 要的是脑袋,不是半身)
    head_fraction: float | None = None
    # 降到调色板 PNG。平涂线稿本来就没几个色,肉眼看不出来,体积能砍掉大半
    colors: int | None = None


ASSETS: list[Asset] = [
    # 登录页 / 开始菜单 / About 的用户块。三处都是白描边方框压在有色背景上,
    # 挖成透明反而会漏出蓝底,所以保持白底不动,跟真实 Win7 用户图块一致。
    Asset("ip-avatar-heart.png", "public/ip/avatar-heart.png", 112, transparent=False),
    Asset("ip-avatar-coffee.png", "public/ip/avatar-coffee.png", 112, transparent=False),
    Asset("ip-avatar-office.png", "public/ip/avatar-office.png", 112, transparent=False),
    # 关机画面是纯黑底,必须真透明
    Asset("ip-avatar-sleep.png", "public/ip/sleep.png", 240, transparent=True, colors=128),
    # 助手浮在壁纸上、扫雷脸嵌在按钮里,都要真透明
    Asset("ip-expr-happy.png", "public/ip/expr-happy.png", 96, transparent=True),
    Asset("ip-expr-ok.png", "public/ip/expr-ok.png", 96, transparent=True),
    Asset("ip-expr-puzzled.png", "public/ip/expr-puzzled.png", 96, transparent=True),
    Asset("ip-expr-celebrate.png", "public/ip/expr-celebrate.png", 96, transparent=True),
    Asset("ip-expr-shocked.png", "public/ip/expr-shocked.png", 96, transparent=True),
    # 浏览器标签页只有十几个像素,得裁到脑袋才认得出来。
    # 这张每次开页面都要下载,是全套里唯一算进首屏体积的,所以压得比别的狠
    Asset(
        "ip-avatar-heart.png",
        "src/app/icon.png",
        256,
        transparent=True,
        margin=0.06,
        head_fraction=0.62,
        colors=128,
    ),
]


def background_mask(rgb: np.ndarray) -> np.ndarray:
    """从四边往里 flood fill,返回「这个像素是背景」的布尔图。"""
    near_white = rgb.min(axis=2) >= WHITE_THRESHOLD

    # padding 一圈白,这样一个种子点就能连通所有边缘背景,不用四条边各撒一遍
    mask = Image.fromarray(np.where(near_white, 255, 0).astype(np.uint8), "L")
    padded = ImageOps.expand(mask, border=1, fill=255)
    ImageDraw.floodfill(padded, (0, 0), 128, thresh=0)

    return np.asarray(padded)[1:-1, 1:-1] == 128


def _dilate(mask: np.ndarray, width: int) -> np.ndarray:
    """四邻域膨胀 width 次。只用来圈出描边外侧那一圈,没必要上形态学库。"""
    out = mask.copy()
    for _ in range(width):
        grown = out.copy()
        grown[1:, :] |= out[:-1, :]
        grown[:-1, :] |= out[1:, :]
        grown[:, 1:] |= out[:, :-1]
        grown[:, :-1] |= out[:, 1:]
        out = grown
    return out


def trim_keyline(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    """把紧贴背景的那几层浅色像素也算成背景,削掉白色贴纸边。"""
    light = rgb.min(axis=2) >= KEYLINE_THRESHOLD
    out = bg.copy()
    for _ in range(KEYLINE_STEPS):
        fringe = _dilate(out, 1) & ~out & light
        if not fringe.any():
            break
        out |= fringe
    return out


def build_alpha(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    """背景全透,描边外圈按「有多白」给部分透明度,其余全不透明。

    不做这圈羽化的话,抗锯齿产生的浅色像素会留成实心,在黑色关机画面上
    沿着角色轮廓镶一道白边。
    """
    alpha = np.where(bg, 0.0, 1.0)

    rim = _dilate(bg, RIM_WIDTH) & ~bg
    # 亮度 250 以上当全透,225 以下当全实,中间线性过渡
    luminance = rgb.mean(axis=2)
    soft = np.clip((250.0 - luminance) / 25.0, 0.0, 1.0)
    alpha = np.where(rim, soft, alpha)

    return (alpha * 255).round().astype(np.uint8)


def content_box(alpha: np.ndarray, head_fraction: float | None = None) -> tuple[int, int, int, int]:
    """角色的紧包围盒。原图留白很多,不裁的话缩到 40px 人就只剩几个像素了。"""
    rows = np.any(alpha > 8, axis=1)
    cols = np.any(alpha > 8, axis=0)
    if not rows.any() or not cols.any():
        raise ValueError("整张图都是背景,抠图阈值可能不对")
    top, bottom = (int(v) for v in np.where(rows)[0][[0, -1]])
    left, right = (int(v) for v in np.where(cols)[0][[0, -1]])
    bottom += 1
    right += 1

    if head_fraction is not None:
        # 只保留上半段,并且在这一段里重新求横向包围盒:整图的宽度是被披散的
        # 头发和抬起的手撑开的,拿它当中线会把脸挤到一边去
        bottom = top + int((bottom - top) * head_fraction)
        sub_cols = np.any(alpha[top:bottom] > 8, axis=0)
        left, right = (int(v) for v in np.where(sub_cols)[0][[0, -1]])
        right += 1

    return left, top, right, bottom


def square_box(
    box: tuple[int, int, int, int],
    margin: float,
) -> tuple[int, int, int, int]:
    """把内容框扩成带留白的正方形,居中对齐。"""
    left, top, right, bottom = box

    cx = (left + right) / 2
    cy = (top + bottom) / 2
    side = max(right - left, bottom - top) * (1 + margin * 2)
    half = side / 2

    return (round(cx - half), round(cy - half), round(cx + half), round(cy + half))


def render(asset: Asset, source_dir: Path) -> tuple[str, str]:
    src_path = source_dir / asset.source
    if not src_path.exists():
        raise FileNotFoundError(f"缺原图: {src_path}")

    rgb = np.asarray(Image.open(src_path).convert("RGB"))
    bg = trim_keyline(rgb, background_mask(rgb))
    alpha = build_alpha(rgb, bg)

    rgba = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")
    box = square_box(content_box(alpha, asset.head_fraction), asset.margin)

    # crop 超出原图的部分会自动补全透明,正好当留白用
    cropped = rgba.crop(box).resize((asset.size, asset.size), Image.LANCZOS)

    if not asset.transparent:
        flattened = Image.new("RGB", cropped.size, (255, 255, 255))
        flattened.paste(cropped, mask=cropped.split()[3])
        cropped = flattened

    if asset.colors:
        # FASTOCTREE 是这几个量化算法里唯一认 alpha 的,换成默认的会把透明区压成黑块
        cropped = cropped.quantize(colors=asset.colors, method=Image.Quantize.FASTOCTREE)

    out_path = REPO / asset.out
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(out_path, "PNG", optimize=True)

    kb = out_path.stat().st_size / 1024
    kind = "RGBA" if asset.transparent else "RGB "
    return asset.out, f"{kind} {cropped.width}x{cropped.height}  {kb:6.1f} KB"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", help="只处理输出名里包含这个字符串的资产")
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=SOURCE_DIR,
        help=f"原图目录 (默认 {SOURCE_DIR.relative_to(REPO)})",
    )
    args = parser.parse_args()

    targets = [a for a in ASSETS if not args.only or args.only in a.out]
    if not targets:
        return print(f"没有匹配 {args.only!r} 的资产") or 1

    for asset in targets:
        out, detail = render(asset, args.source_dir)
        print(f"[ok] {out:<34} {detail}")

    print(f"\n完成 {len(targets)} 个资产。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
