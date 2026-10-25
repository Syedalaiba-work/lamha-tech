"""
Encode rendered film frames (art/blender/lamha_films.py output) for the web.

For each film directory of PNG frames it writes, into public/media/films/:
  <film>.mp4    H.264 (yuv420p, CRF, +faststart), the universal source
  <film>.webm   VP9 (CRF, two-pass off), smaller where supported
  <film>-m.mp4 / <film>-m.webm   480p variants for phones
  <film>.jpg    poster frame (the film's "hero" moment), also used without JavaScript and for reduced motion

Usage:
  FFMPEG=<path to ffmpeg> python art/encode_films.py <frames_root> [film ...] [--fps 25]
"""

import os
import subprocess
import sys

POSTER_AT = {"assembly": 0.5, "engineering": 0.3, "experience": 0.3, "growth": 0.4, "rnd": 0.35, "team": 0.5}
CRF_MP4 = {"assembly": 25}
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "media", "films")


def run(args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def encode(ffmpeg, root, film, fps):
    src = os.path.join(root, film)
    frames = sorted(f for f in os.listdir(src) if f.endswith(".png"))
    if not frames:
        print(f"{film}: no frames")
        return
    os.makedirs(OUT, exist_ok=True)
    pattern = os.path.join(src, "%04d.png")
    base = os.path.join(OUT, film)
    common = ["-y", "-framerate", str(fps), "-start_number", "1", "-i", pattern, "-an"]
    run([ffmpeg, *common, "-c:v", "libx264", "-preset", "slow", "-crf", str(CRF_MP4.get(film, 26)), "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", base + ".mp4"])
    run([ffmpeg, *common, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", base + ".webm"])
    # Phone variants: 480p, lower bitrate (selected with <source media> in the Film component).
    small = ["-vf", "scale=-2:480"]
    run([ffmpeg, *common, *small, "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", base + "-m.mp4"])
    run([ffmpeg, *common, *small, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", base + "-m.webm"])
    poster = frames[min(len(frames) - 1, int(POSTER_AT.get(film, 0.5) * len(frames)))]
    run([ffmpeg, "-y", "-i", os.path.join(src, poster), "-q:v", "4", base + ".jpg"])
    sizes = {ext: os.path.getsize(base + ext) // 1024 for ext in (".mp4", ".webm", "-m.mp4", "-m.webm", ".jpg")}
    print(f"{film}: {len(frames)} frames -> mp4 {sizes['.mp4']} KB, webm {sizes['.webm']} KB, phone mp4 {sizes['-m.mp4']} KB, phone webm {sizes['-m.webm']} KB, poster {sizes['.jpg']} KB")


def main():
    ffmpeg = os.environ.get("FFMPEG", "ffmpeg")
    args = sys.argv[1:]
    fps = 25
    if "--fps" in args:
        i = args.index("--fps")
        fps = int(args[i + 1])
        del args[i : i + 2]
    root, films = args[0], args[1:]
    films = films or sorted(d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d)))
    for film in films:
        encode(ffmpeg, root, film, fps)


main()
