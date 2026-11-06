#!/usr/bin/env python3
"""Join several clips into one video, in a chosen order, with their dead air removed.
usage: sequence.py source/sources.json <video_dir> --order a,b,c [--gap 0.45] [--pad 0.08]
                   [--fillers "um,uh"] [--silent 5] [--format 9:16] [--zoom 1.12] [--every 6]

Writes <video_dir>/cut.json and a starter spec.json. Clips with speech keep their spoken stretches.
Clips with no speech keep --silent seconds from their middle, as a starting point: watch them and
set the best stretch by hand. Pass --words <dir> to make_video.py using the source/words folder."""
import argparse
import json
import os
import re
import statistics

from autocut import jump_zooms, tighten

MAX_GAIN = 9


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("manifest")
    ap.add_argument("dir")
    ap.add_argument("--order", help="comma-separated source ids; leave clips out to drop them. Default: all, as listed")
    ap.add_argument("--gap", type=float, default=0.45, help="longest pause to keep, in seconds")
    ap.add_argument("--pad", type=float, default=0.08, help="air kept around each spoken stretch")
    ap.add_argument("--fillers", default="", help="comma-separated words to cut, in the video's language")
    ap.add_argument("--silent", type=float, default=5, help="seconds kept from a clip with no speech")
    ap.add_argument("--zoom", type=float, default=1.12)
    ap.add_argument("--every", type=float, default=6, help="seconds between jump zooms; 0 turns them off")
    ap.add_argument("--format", default="9:16")
    a = ap.parse_args()

    clips = {c["id"]: c for c in json.load(open(a.manifest))["sources"]}
    order = a.order.split(",") if a.order else list(clips)
    unknown = [sid for sid in order if sid not in clips]
    if unknown:
        raise SystemExit(f"unknown ids: {', '.join(unknown)}. Known: {', '.join(clips)}")
    if len(set(order)) < len(order):
        print("note: a clip appears twice in --order")

    words_dir = os.path.join(os.path.dirname(os.path.abspath(a.manifest)), "words")
    fillers = {f.strip().lower() for f in a.fillers.split(",") if f.strip()}
    plain = lambda s: re.sub(r"\W", "", s.lower())
    ranges, t, spoken = [], 0.0, 0
    for sid in order:
        clip, file = clips[sid], os.path.join(words_dir, sid + ".json")
        words = json.load(open(file))["words"] if os.path.exists(file) else []
        words = [w for w in words if plain(w["text"]) not in fillers]
        if words:
            kept = tighten(words, a.gap, a.pad)
            spoken += 1
        else:
            d = min(a.silent, clip["duration"])
            start = round((clip["duration"] - d) / 2, 3)
            kept = [[start, round(start + d, 3)]]
        ranges += [[s, e, sid] for s, e in kept]
        d = sum(e - s for s, e in kept)
        print(f'{t:7.2f}s  {sid:<24} {d:5.1f}s kept of {clip["duration"]:.1f}s{"" if words else "  (no speech: pick the stretch)"}')
        t += d

    levels = {sid: clips[sid]["mean_db"] for sid in set(order) if clips[sid]["words"] and clips[sid]["mean_db"] is not None}
    gain = {}
    if len(levels) > 1:
        middle = statistics.median(levels.values())
        gain = {sid: round(max(-MAX_GAIN, min(MAX_GAIN, middle - db)), 1) for sid, db in levels.items() if abs(middle - db) >= 1.5}

    cam, _ = jump_zooms(ranges, a.every, a.zoom)
    os.makedirs(a.dir, exist_ok=True)
    cut = {"sources": {sid: clips[sid]["path"] for sid in dict.fromkeys(order)}, "ranges": ranges,
           "fix": {}, "drop": sorted(fillers), "names": []}
    if gain:
        cut["gain"] = gain
    json.dump(cut, open(os.path.join(a.dir, "cut.json"), "w"), indent=1, ensure_ascii=False)
    json.dump({"format": a.format, "captions": spoken > 0, "closing": False, "cam": cam, "layers": [], "sfx": []},
              open(os.path.join(a.dir, "spec.json"), "w"), indent=1)
    print(f"{len(order)} clips, {t:.1f}s, {len(cam)} jump zooms, gain {gain or 'none'}")


if __name__ == "__main__":
    main()
