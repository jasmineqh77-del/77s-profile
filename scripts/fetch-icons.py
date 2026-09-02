#!/usr/bin/env python3
"""
下载原版 Windows 系统图标并转成带透明通道的 PNG。

素材来自 https://github.com/trapd00r/win95-winxp_icons —— 从 Win98/2000
系统 DLL 里提取出来的原始 .ico。转好的 PNG 会提交进仓库，运行时不依赖外部 CDN。

每个图标产出两份：public/icons/ 下的大图给桌面用，public/icons/16/ 下的
小图给任务栏和开始菜单用。

想换某个图标：改下面 ICON_MAP 里那一行，重跑本脚本即可。
    python3 scripts/fetch-icons.py

依赖 Pillow（pip install Pillow）。
"""

from __future__ import annotations

import io
import ssl
import sys
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


BASE_URL = "https://raw.githubusercontent.com/trapd00r/win95-winxp_icons/master/icons"
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "icons"
SMALL_DIR = OUT_DIR / "16"

# 桌面图标显示尺寸是 48px，所以优先取 48×48 那一帧，1:1 显示最锐利
PREFERRED_SIZE = 48
SMALL_SIZE = 16

# 左边是 src/os/icons.ts 里的 key，右边是源仓库的文件名
ICON_MAP = {
    "computer": "w98_computer_explorer.ico",
    "folder": "w98_directory_open_file_mydocs.ico",
    "document": "w98_document.ico",
    "notepad": "w98_notepad_file.ico",
    "media": "w98_cd_audio_cd.ico",
    "pdf": "w2k_write_document.ico",
    "mail": "w98_outlook_express.ico",
    "recycle": "w98_recycle_bin_full.ico",
    "mine": "w98_minesweeper.ico",
    "paint": "w98_paint.ico",
    "cmd": "w98_ms-dos.ico",
    "error": "w98_msg_error.ico",
    "flag": "w98_windows_slanted.ico",
    "logoff": "w2k_log_off.ico",
    "shutdown": "w98_shut_down_normal.ico",
}


def pick_frame(image: Image.Image, target: int) -> Image.Image:
    """
    .ico 是多帧容器，通常同时打包 16/32/48 三种尺寸。
    优先取正好等于目标尺寸的那帧，其次不超过目标的最大帧，都没有就用最大的那帧。
    """
    sizes = sorted(image.ico.sizes(), key=lambda wh: wh[0] * wh[1])
    chosen = next((s for s in sizes if s[0] == target), None)
    if chosen is None:
        under = [s for s in sizes if s[0] <= target]
        chosen = under[-1] if under else sizes[-1]
    return image.ico.getimage(chosen)


def make_small(image: Image.Image) -> tuple[Image.Image, bool]:
    """
    任务栏用 16px。有原生 16 帧就直接用——那是当年手工点出来的，
    比任何算法缩出来的都清楚。没有的话只能缩，缩小走 LANCZOS，
    用 pixelated 那种最近邻会丢掉一半像素，糊成一片。
    """
    frame = pick_frame(image, SMALL_SIZE)
    if frame.width == SMALL_SIZE:
        return frame.convert("RGBA"), True
    return frame.convert("RGBA").resize((SMALL_SIZE, SMALL_SIZE), Image.LANCZOS), False


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SMALL_DIR.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []
    context = make_ssl_context()

    for key, filename in ICON_MAP.items():
        url = f"{BASE_URL}/{filename}"
        try:
            with urllib.request.urlopen(url, timeout=30, context=context) as response:
                raw = response.read()
        except Exception as error:  # noqa: BLE001 - 想看到具体是哪个图标挂了
            failures.append(f"{key}: 下载失败 {filename} ({error})")
            continue

        try:
            with Image.open(io.BytesIO(raw)) as image:
                large = pick_frame(image, PREFERRED_SIZE).convert("RGBA")
                small, native_small = make_small(image)
        except Exception as error:  # noqa: BLE001
            failures.append(f"{key}: 解码失败 {filename} ({error})")
            continue

        large.save(OUT_DIR / f"{key}.png", "PNG", optimize=True)
        small.save(SMALL_DIR / f"{key}.png", "PNG", optimize=True)

        transparent = "有透明" if large.getchannel("A").getextrema()[0] < 255 else "不透明"
        small_note = "原生 16" if native_small else "缩放到 16"
        print(
            f"{key:9} <- {filename:40} "
            f"{large.width}x{large.height} {transparent}，小图 {small_note}"
        )

    if failures:
        print("\n以下图标没能处理：", file=sys.stderr)
        for line in failures:
            print(f"  {line}", file=sys.stderr)
        return 1

    print(f"\n全部完成，输出目录：{OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
