#!/usr/bin/env python3
"""
下载 Windows XP「Hands（手掌）」指针方案并转成带透明通道的 PNG。

素材来自 https://github.com/bartekl1/windows-ui-assets —— 是 XP 系统
%WINDIR%\\Cursors 目录的完整拷贝，和图标用的 trapd00r/win95-winxp_icons
同性质，都是从系统里原样扒出来的。转好的 PNG 提交进仓库，运行时不依赖外部 CDN。

产出统一是 PNG 而不是原样搬 .cur，有两个原因：
  1. Safari 对 `cursor: url(*.cur)` 的支持一直不靠谱，PNG 三家浏览器都认。
  2. 热点坐标写进 CSS 里肉眼可核对，不用去猜文件头里存了什么。
热点由本脚本从原始文件里读出来打印，抄进 globals.css 的 --cur-* 变量。

hand.ani / handwait.ani 是动画指针。CSS 不支持 .ani（所有浏览器都不支持），
所以从 RIFF 容器里抽一帧当静态图用，取哪一帧见 CURSOR_MAP。

想换某个指针：改下面 CURSOR_MAP 里那一行，重跑本脚本，再同步 globals.css 的热点。
    python3 scripts/fetch-cursors.py

依赖 Pillow（pip install Pillow）。
"""

from __future__ import annotations

import io
import ssl
import struct
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image


def make_ssl_context() -> ssl.SSLContext | None:
    """
    macOS 自带的 Python 不带 CA 证书包，默认校验会直接失败。
    有 certifi 就用它的根证书，没有就交回给系统默认。
    """
    try:
        import certifi
    except ImportError:
        return None
    return ssl.create_default_context(cafile=certifi.where())


BASE_URL = "https://raw.githubusercontent.com/bartekl1/windows-ui-assets/master/Cursors/Windows%20XP"
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "cursors"

# 左边是 CSS 里的角色名（同时也是输出文件名），右边是源文件。
# .ani 要多给一个帧号，因为它是动画容器，得挑一帧当静态图。
#
# 关于 pointer：XP 原方案里没有单独的「链接手型」。这里借 hmove.cur 那只握拳手，
# 因为它和 default 的食指手形态区别够大，能保住「这里可以点」的反馈；而站点没有
# 任何地方用 CSS 的 move，借走它不会撞车。
CURSOR_MAP: dict[str, tuple[str, int | None]] = {
    "default": ("harrow.cur", None),  # 食指朝上的手
    "pointer": ("hmove.cur", None),  # 握拳
    "text": ("hibeam.cur", None),  # 握笔的手
    "crosshair": ("hcross.cur", None),  # 握笔 + 十字
    "ns-resize": ("hns.cur", None),  # 上下捏
    "ew-resize": ("hwe.cur", None),  # 左右捏
    "nwse-resize": ("hnwse.cur", None),  # 左上右下捏
    "nesw-resize": ("hnesw.cur", None),  # 右上左下捏
    "not-allowed": ("hnodrop.cur", None),  # 举手拒绝
    "progress": ("handwait.ani", 0),  # 握秒表，抽第 0 帧
    "wait": ("hand.ani", 0),  # 敲手指，抽第 0 帧（手指收得最拢的那帧）
}

# 这几个角色的热点要重算，不用原生值——原因见 align_hotspots()。
# 没列在这里的一律保持原生热点：resize 系列的热点在捏合点上、crosshair 在十字中心、
# text 在笔尖上，这些位置本身有含义，挪了会让缩放和画图对不准。
ALIGN_TO_DEFAULT = {"pointer", "progress", "wait"}


def ink_origin(image: Image.Image) -> tuple[int, int]:
    """非透明像素包围盒的左上角。"""
    box = image.getchannel("A").getbbox()
    return (box[0], box[1]) if box else (0, 0)


def align_hotspots(
    frames: dict[str, tuple[Image.Image, tuple[int, int]]],
) -> dict[str, tuple[int, int]]:
    """
    把 ALIGN_TO_DEFAULT 里那几个指针的热点重算，让它们的图案相对鼠标位置
    落在和 default 完全一样的地方。

    起因是原生热点是各自独立设计的：default（食指手）的热点在指尖，图案整个
    垂在鼠标下方；pointer 借用的 hmove（握拳）热点却在拳头正中间，图案有一半
    在鼠标上方。两者一切换，手就会整体往上跳 8 像素，看着像卡了一下。

    热点只决定图案画在哪，不影响点击落点（点击永远在鼠标真实坐标上），
    所以这么改纯粹是视觉对齐，没有副作用。
    """
    base_image, base_hotspot = frames["default"]
    bx, by = ink_origin(base_image)
    offset = (bx - base_hotspot[0], by - base_hotspot[1])

    aligned: dict[str, tuple[int, int]] = {}
    for role, (image, hotspot) in frames.items():
        if role not in ALIGN_TO_DEFAULT:
            aligned[role] = hotspot
            continue
        ix, iy = ink_origin(image)
        aligned[role] = (ix - offset[0], iy - offset[1])
    return aligned


def fetch(filename: str, context: ssl.SSLContext | None) -> bytes:
    url = f"{BASE_URL}/{urllib.parse.quote(filename)}"
    with urllib.request.urlopen(url, timeout=30, context=context) as response:
        return response.read()


def decode_cursor(raw: bytes) -> tuple[Image.Image, tuple[int, int]]:
    """
    .cur 和 .ico 是同一种容器，只差 header 第 3-4 字节的 type（2 是光标，1 是图标），
    而且 .cur 把热点坐标塞在 .ico 存 planes/bpp 的那两个字段里。

    改掉 type 就能交给 Pillow 的 ICO 解码器 —— 值得绕这一下，因为它会正确套用
    AND 蒙版（这批图是 16 色 DIB，透明区全靠蒙版，自己解容易漏）。
    """
    kind = struct.unpack("<H", raw[2:4])[0]
    if kind == 2:
        hotspot = struct.unpack("<HH", raw[10:14])
        raw = raw[:2] + b"\x01\x00" + raw[4:]
    else:
        hotspot = (0, 0)
    with Image.open(io.BytesIO(raw)) as image:
        return image.convert("RGBA"), hotspot


def ani_frames(data: bytes) -> list[bytes]:
    """
    .ani 是 RIFF 容器：RIFF/ACON 下挂一个 LIST 'fram'，里面每个 'icon' chunk
    就是一个完整的 .cur 文件。走一遍 chunk 把它们捡出来即可。
    """
    if data[:4] != b"RIFF" or data[8:12] != b"ACON":
        raise ValueError("不是 ANI 文件")

    frames: list[bytes] = []

    def walk(pos: int, end: int) -> None:
        end = min(end, len(data))
        while pos + 8 <= end:
            chunk_id = data[pos : pos + 4]
            size = struct.unpack("<I", data[pos + 4 : pos + 8])[0]
            body = pos + 8
            if body + size > len(data):
                break
            if chunk_id == b"LIST" and data[body : body + 4] == b"fram":
                walk(body + 4, body + size)
            elif chunk_id == b"icon":
                frames.append(data[body : body + size])
            pos = body + size + (size & 1)  # chunk 按偶数字节对齐

    walk(12, 8 + struct.unpack("<I", data[4:8])[0])
    return frames


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    context = make_ssl_context()
    failures: list[str] = []
    decoded: dict[str, tuple[Image.Image, tuple[int, int]]] = {}

    for role, (filename, frame_index) in CURSOR_MAP.items():
        try:
            raw = fetch(filename, context)
        except Exception as error:  # noqa: BLE001 - 想看到具体是哪个指针挂了
            failures.append(f"{role}: 下载失败 {filename} ({error})")
            continue

        try:
            if frame_index is None:
                image, hotspot = decode_cursor(raw)
                source_note = filename
            else:
                frames = ani_frames(raw)
                image, hotspot = decode_cursor(frames[frame_index])
                source_note = f"{filename} #{frame_index}/{len(frames)}"
        except Exception as error:  # noqa: BLE001
            failures.append(f"{role}: 解码失败 {filename} ({error})")
            continue

        image.save(OUT_DIR / f"{role}.png", "PNG", optimize=True)
        decoded[role] = (image, hotspot)
        print(f"{role:12} <- {source_note:22} {image.width}x{image.height} 原生热点 {hotspot[0]},{hotspot[1]}")

    if failures:
        print("\n以下指针没能处理：", file=sys.stderr)
        for line in failures:
            print(f"  {line}", file=sys.stderr)
        return 1

    hotspots = align_hotspots(decoded)
    moved = [r for r in hotspots if hotspots[r] != decoded[r][1]]
    if moved:
        print("\n为了切换时图案不跳，下面几个热点做了对齐（不影响点击落点）：")
        for role in moved:
            old, new = decoded[role][1], hotspots[role]
            print(f"  {role:12} {old[0]},{old[1]} -> {new[0]},{new[1]}")

    print(f"\n全部完成，输出目录：{OUT_DIR}")
    print("下面这段要和 src/app/globals.css 里的 --cur-* 保持一致：\n")
    for role, (hx, hy) in hotspots.items():
        print(f'  --cur-{role}: url("/cursors/{role}.png") {hx} {hy}, {role};')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
