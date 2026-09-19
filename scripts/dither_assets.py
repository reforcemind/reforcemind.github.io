"""Ordered Bayer dither + limited scientific palette for site assets."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT = ASSETS / "dither"
OUT.mkdir(parents=True, exist_ok=True)

PARCHMENT = (252, 239, 212)
INK = (0, 0, 0)
CRIMSON = (122, 26, 26)
FOREST = (45, 75, 50)
OCHRE = (212, 160, 23)
PALETTE = np.array([PARCHMENT, INK, CRIMSON, FOREST, OCHRE], dtype=np.float32)

BAYER8 = np.array(
    [
        [0, 32, 8, 40, 2, 34, 10, 42],
        [48, 16, 56, 24, 50, 18, 58, 26],
        [12, 44, 4, 36, 14, 46, 6, 38],
        [60, 28, 52, 20, 62, 30, 54, 22],
        [3, 35, 11, 43, 1, 33, 9, 41],
        [51, 19, 59, 27, 49, 17, 57, 25],
        [15, 47, 7, 39, 13, 45, 5, 37],
        [63, 31, 55, 23, 61, 29, 53, 21],
    ],
    dtype=np.float32,
)


def dither(im: Image.Image, scale: int = 1, max_side: int = 720) -> Image.Image:
    im = im.convert("RGB")
    im = ImageOps.contain(im, (max_side, max_side), Image.Resampling.BILINEAR)
    if scale != 1:
        small = (max(1, im.width // scale), max(1, im.height // scale))
        im = im.resize(small, Image.Resampling.BILINEAR)
        im = im.resize((small[0] * scale, small[1] * scale), Image.Resampling.NEAREST)

    arr = np.asarray(im, dtype=np.float32)
    h, w, _ = arr.shape
    tiled = np.tile(BAYER8, ((h + 7) // 8, (w + 7) // 8))[:h, :w]
    noise = (tiled / 64.0 - 0.5) * 48.0
    arr = np.clip(arr + noise[..., None], 0, 255)

    # Nearest palette color
    diff = arr[:, :, None, :] - PALETTE[None, None, :, :]
    dist = np.sum(diff * diff, axis=-1)
    idx = np.argmin(dist, axis=-1)
    out = PALETTE[idx].astype(np.uint8)
    return Image.fromarray(out, "RGB")


def save_png(im: Image.Image, name: str, max_side: int = 960):
    if max(im.size) > max_side:
        im = ImageOps.contain(im, (max_side, max_side), Image.Resampling.NEAREST)
    path = OUT / name
    im.save(path, "PNG", optimize=True)
    print(f"wrote {path} {im.size} {path.stat().st_size // 1024}KB")


def favicon(src: Image.Image):
    crop = ImageOps.fit(src, (256, 256), Image.Resampling.NEAREST)
    crop.save(ASSETS / "favicon.png", "PNG", optimize=True)
    crop.resize((32, 32), Image.Resampling.NEAREST).save(
        ASSETS / "favicon-32.png", "PNG", optimize=True
    )
    print("wrote favicon")


if __name__ == "__main__":
    jobs = [
        ("botanical-dither.png", "plant.png", 2, 720),
        ("robot-engraving.png", "robot.png", 3, 640),
        ("network-engraving.png", "network.png", 3, 640),
        ("flower.jpg", "flower-a.png", 3, 480),
        ("flower3.jpg", "flower-b.png", 3, 480),
        ("og-card.png", "og-dither.png", 2, 1200),
    ]
    plant = None
    for src_name, dest, scale, side in jobs:
        src = ASSETS / src_name
        if not src.exists():
            print("skip missing", src)
            continue
        im = Image.open(src)
        d = dither(im, scale=scale, max_side=side)
        save_png(d, dest, max_side=side)
        if dest == "plant.png":
            plant = d
    if plant is not None:
        favicon(plant)

    src = ASSETS / "og-card.png"
    d = dither(Image.open(src), scale=2, max_side=1200)
    d = ImageOps.contain(d, (1200, 675), Image.Resampling.NEAREST)
    canvas = Image.new("RGB", (1200, 630), PARCHMENT)
    canvas.paste(d, ((1200 - d.width) // 2, (630 - d.height) // 2))
    canvas.save(ASSETS / "og-card-dither.png", "PNG", optimize=True)
    print("wrote og-card-dither.png")
