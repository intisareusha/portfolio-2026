#!/usr/bin/env python3
"""Generate lightweight abstract placeholder reels + poster frames.

These are stand-ins so the Work section is fully playable before real client
clips are dropped in. Replace the MP4s/JPGs in assets/video/ and
assets/img/work/ with real footage (same filenames) and nothing else changes.

Run:  .venv/bin/python tools/gen_reels.py
Requires: numpy + the ffmpeg binary bundled by imageio-ffmpeg.
"""
import math
import os
import subprocess

import numpy as np
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_DIR = os.path.join(ROOT, "assets", "video")
POSTER_DIR = os.path.join(ROOT, "assets", "img", "work")
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(POSTER_DIR, exist_ok=True)

W, H = 240, 426  # rendered small, upscaled by ffmpeg (pure gradients scale cleanly)
FPS = 24
SECONDS = 4
FRAMES = FPS * SECONDS

REELS = [
    ("reel-01", "violet", [(124, 58, 237), (192, 132, 252), (34, 211, 238)], (18, 8, 38)),
    ("reel-02", "mint", [(45, 212, 191), (167, 243, 208), (13, 148, 136)], (5, 26, 27)),
    ("reel-03", "peach", [(251, 146, 60), (253, 164, 175), (124, 45, 18)], (28, 9, 16)),
    ("reel-04", "lime", [(190, 242, 100), (52, 211, 153), (20, 83, 45)], (8, 20, 12)),
    ("reel-05", "amber", [(251, 191, 36), (251, 113, 133), (69, 10, 10)], (26, 10, 8)),
    ("reel-06", "sky", [(56, 189, 248), (129, 140, 248), (12, 74, 110)], (7, 14, 34)),
]


def render_reel(name, palette, base):
    ys, xs = np.mgrid[0:H, 0:W]
    xs = xs / W
    ys = ys / H
    rng = np.random.default_rng(abs(hash(name)) % (2**32))

    blobs = []
    for i, colour in enumerate(palette):
        blobs.append(
            {
                "colour": np.array(colour, dtype=np.float32) / 255.0,
                "cx": 0.5 + 0.26 * math.cos(i * 2.1),
                "cy": 0.42 + 0.24 * math.sin(i * 1.7),
                "ax": 0.16 + 0.06 * i,
                "ay": 0.13 + 0.05 * i,
                "radius": 0.34 + 0.07 * i,
                "speed": 0.55 + 0.22 * i,
                "phase": i * 1.9,
            }
        )

    base = np.array(base, dtype=np.float32) / 255.0
    cmd = [
        FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-vf", "scale=540:960:flags=bicubic,format=yuv420p",
        "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-movflags", "+faststart",
        os.path.join(VIDEO_DIR, f"{name}.mp4"),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(FRAMES):
        t = f / FPS
        acc = np.zeros((H, W, 3), dtype=np.float32)
        for b in blobs:
            cx = b["cx"] + b["ax"] * math.sin(t * b["speed"] + b["phase"])
            cy = b["cy"] + b["ay"] * math.cos(t * b["speed"] * 0.8 + b["phase"] * 1.4)
            d2 = (xs - cx) ** 2 + (ys - cy) ** 2
            w = np.exp(-d2 / (b["radius"] ** 2))
            acc += w[..., None] * b["colour"]

        # slow diagonal light sweep
        sweep_pos = ((t / SECONDS) * 1.8 - 0.4)
        band = np.exp(-(((xs * 0.7 + ys * 0.3) - sweep_pos) ** 2) / 0.012)
        acc += band[..., None] * np.array([1.0, 0.95, 1.0], dtype=np.float32) * 0.22

        # vignette + film grain
        vig = np.clip(1.15 - 1.25 * ((xs - 0.5) ** 2 * 0.9 + (ys - 0.5) ** 2 * 1.15), 0.25, 1.0)
        grain = rng.normal(0, 0.016, (H, W, 1)).astype(np.float32)

        img = base * (0.55 + 0.45 * vig[..., None]) + acc * 0.42 * vig[..., None]
        img = img + grain
        img = np.clip(img, 0, 1) ** 0.92
        frame = (img * 255).astype(np.uint8)
        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    proc.wait()

    poster = os.path.join(POSTER_DIR, f"{name}.jpg")
    subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-ss", "1.1",
         "-i", os.path.join(VIDEO_DIR, f"{name}.mp4"), "-frames:v", "1",
         "-vf", "scale=720:-2:flags=bicubic", "-q:v", "4", poster],
        check=True,
    )
    print("wrote", name)


if __name__ == "__main__":
    for name, _slug, palette, base in REELS:
        render_reel(name, palette, base)
