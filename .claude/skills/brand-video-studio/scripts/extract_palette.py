#!/usr/bin/env python3
"""Extract dominant colors from logos and photos. Needs only ffmpeg.
usage: extract_palette.py image1 [image2 ...] [--k 8]
Prints JSON with hex, weight and contrast against white and black. It is a starting point:
whoever writes brand.json picks the roles, because a frequent color is not always the brand color."""
import json
import random
import subprocess
import sys


def pixels(path, size=96):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-frames:v", "1",
                                   "-vf", f"scale={size}:-2,format=rgba", "-f", "rawvideo", "-"])
    out = []
    for i in range(0, len(raw) - 3, 4):
        r, g, b, a = raw[i:i + 4]
        if a > 200:  # a logo's transparent background is not a brand color
            out.append((r, g, b))
    return out


def kmeans(px, k, rounds=14):
    rnd = random.Random(7)
    centers = rnd.sample(px, min(k, len(px)))
    groups = []
    for _ in range(rounds):
        groups = [[] for _ in centers]
        for p in px:
            best = min(range(len(centers)), key=lambda i: sum((a - b) ** 2 for a, b in zip(p, centers[i])))
            groups[best].append(p)
        centers = [tuple(sum(c) / len(g) for c in zip(*g)) if g else centers[i] for i, g in enumerate(groups)]
    return centers, [len(g) for g in groups]


def luminance(c):
    def f(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (f(v) for v in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return round((la + 0.05) / (lb + 0.05), 2)


def main():
    args = sys.argv[1:]
    k = 8
    if "--k" in args:
        i = args.index("--k")
        k = int(args[i + 1])
        del args[i:i + 2]
    if not args:
        sys.exit(__doc__)
    px = []
    for path in args:
        px += pixels(path)
    centers, sizes = kmeans(px, k)
    total = sum(sizes) or 1
    rows = sorted(zip(centers, sizes), key=lambda r: -r[1])
    print(json.dumps([{
        "hex": "#%02X%02X%02X" % tuple(round(v) for v in c),
        "weight": round(n / total, 3),
        "contrast_white": contrast(c, (255, 255, 255)),
        "contrast_black": contrast(c, (0, 0, 0)),
    } for c, n in rows if n], indent=1))


if __name__ == "__main__":
    main()
