#!/usr/bin/env python3
"""Tighten raw footage: remove dead air and filler words, and add jump zooms to reset attention.
usage: autocut.py video.mp4 words.json <video_dir> [--gap 0.45] [--pad 0.08] [--fillers "um,uh"]
                  [--zoom 1.12] [--every 6] [--format 9:16]

Writes <video_dir>/cut.json and a starter spec.json with no hook and no closing. Review both: this only
removes silence and listed fillers, so bad takes and repeated sentences still need a human or Claude pass."""
import argparse
import json
import os
import re


def tighten(words, gap, pad):
    """Join words into spoken stretches, dropping pauses longer than `gap`."""
    ranges = [[words[0]["start"], words[0]["end"]]]
    for w in words[1:]:
        if w["start"] - ranges[-1][1] > gap:
            ranges.append([w["start"], w["end"]])
        else:
            ranges[-1][1] = w["end"]
    ranges = [[round(max(0, s - pad), 3), round(e + pad, 3)] for s, e in ranges]
    for prev, cur in zip(ranges, ranges[1:]):   # padding must not make neighboring ranges overlap
        cur[0] = max(cur[0], prev[1])
    return ranges


def jump_zooms(ranges, every, zoom):
    """A zoom change right on a cut hides the jump; alternate so the frame keeps moving."""
    cam, t, last, on = [], 0.0, 0.0, False
    for item in ranges:
        if every and t - last >= every:
            on = not on
            cam.append({"t": round(t, 3), "d": 0.01, "s": zoom if on else 1, "sfx": False})
            last = t
        t += item[1] - item[0]
    return cam, t


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("words")
    ap.add_argument("dir")
    ap.add_argument("--gap", type=float, default=0.45, help="longest pause to keep, in seconds")
    ap.add_argument("--pad", type=float, default=0.08, help="air kept around each spoken stretch")
    ap.add_argument("--fillers", default="", help="comma-separated words to cut, in the video's language")
    ap.add_argument("--zoom", type=float, default=1.12)
    ap.add_argument("--every", type=float, default=6, help="seconds between jump zooms; 0 turns them off")
    ap.add_argument("--format", default="9:16")
    a = ap.parse_args()

    fillers = {f.strip().lower() for f in a.fillers.split(",") if f.strip()}
    plain = lambda s: re.sub(r"\W", "", s.lower())
    words = [w for w in json.load(open(a.words))["words"] if plain(w["text"]) not in fillers]
    if not words:
        raise SystemExit("no words to keep")

    ranges = tighten(words, a.gap, a.pad)
    cam, t = jump_zooms(ranges, a.every, a.zoom)

    os.makedirs(a.dir, exist_ok=True)
    json.dump({"src": os.path.abspath(a.video), "ranges": ranges, "fix": {}, "drop": sorted(fillers), "names": []},
              open(os.path.join(a.dir, "cut.json"), "w"), indent=1, ensure_ascii=False)
    json.dump({"format": a.format, "closing": False, "cam": cam, "layers": [], "sfx": []},
              open(os.path.join(a.dir, "spec.json"), "w"), indent=1)
    total = words[-1]["end"] - words[0]["start"]
    print(f"{len(ranges)} ranges, {t:.1f}s kept of {total:.1f}s spoken span, {len(cam)} jump zooms")


if __name__ == "__main__":
    main()
