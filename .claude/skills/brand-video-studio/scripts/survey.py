#!/usr/bin/env python3
"""List and transcribe a set of videos, so they can be ordered or planned together.
usage: survey.py <folder or files...> --out source [--lang en] [--glossary "Names"] [--no-transcribe]

Writes <out>/sources.json and <out>/words/<id>.json. A finished transcript is kept, so an interrupted
run continues where it stopped. The list is sorted by recording time, which is only a first guess at
the order. It flags mixed framing, clips with no words and clips that look like retakes of each other."""
import argparse
import difflib
import json
import os
import re
import unicodedata

from media import load_words, loudness, probe
from transcribe import with_eyes, with_studiofx, with_whisper

VIDEO = (".mp4", ".mov", ".m4v", ".mkv", ".webm", ".avi")
RETAKE = 0.6


def find_videos(paths):
    found = []
    for path in paths:
        if os.path.isdir(path):
            found += [os.path.join(path, n) for n in sorted(os.listdir(path))
                      if n.lower().endswith(VIDEO) and not n.startswith(".")]
        else:
            found.append(path)
    return [os.path.abspath(p) for p in found]


def slug(name, taken):
    plain = unicodedata.normalize("NFD", os.path.splitext(os.path.basename(name))[0].lower())
    base = re.sub(r"[^a-z0-9]+", "-", "".join(c for c in plain if unicodedata.category(c) != "Mn")).strip("-") or "clip"
    sid, n = base, 2
    while sid in taken:
        sid, n = f"{base}-{n}", n + 1
    return sid


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--out", default="source")
    ap.add_argument("--lang", default="en")
    ap.add_argument("--glossary")
    ap.add_argument("--no-transcribe", action="store_true")
    a = ap.parse_args()

    os.makedirs(os.path.join(a.out, "words"), exist_ok=True)
    clips, taken = [], set()
    videos = find_videos(a.paths)
    if not videos:
        raise SystemExit("no videos found")
    for n, path in enumerate(videos, 1):
        sid = slug(path, taken)
        taken.add(sid)
        print(f"[{n}/{len(videos)}] {os.path.basename(path)}", flush=True)
        clip = {"id": sid, "path": path, **probe(path)}
        clip["created"] = clip["created"] or f"file:{os.path.getmtime(path):.0f}"
        clip["mean_db"] = loudness(path) if clip["audio"] else None
        file = os.path.join(a.out, "words", sid + ".json")
        if not os.path.exists(file) and clip["audio"] and not a.no_transcribe:
            words = with_studiofx(path, a.lang) or with_eyes(path, a.lang, a.glossary) or with_whisper(path, a.lang)
            if words:
                json.dump({"words": words}, open(file, "w"), ensure_ascii=False)
        said = load_words(file) if os.path.exists(file) else []
        clip["words"] = len(said)
        clip["text"] = " ".join(w[2].strip() for w in said)
        clips.append(clip)
    clips.sort(key=lambda c: (c["created"].startswith("file:"), c["created"], c["id"]))
    json.dump({"sources": clips}, open(os.path.join(a.out, "sources.json"), "w"), indent=1, ensure_ascii=False)

    for c in clips:
        print(f'{c["id"]:<24} {c["duration"]:>7.1f}s {c["width"]}x{c["height"]} {c["fps"]:g}fps '
              f'{c["words"]:>5} words  {c["text"][:60]}')
    print(f'total {sum(c["duration"] for c in clips):.1f}s in {len(clips)} videos -> {a.out}/sources.json')

    shapes = {c["width"] > c["height"] for c in clips}
    if len(shapes) > 1:
        print("flag: horizontal and vertical clips are mixed; some will lose their sides when cropped")
    for c in clips:
        if not c["audio"]:
            print(f'flag: {c["id"]} has no sound')
        elif not c["words"] and not a.no_transcribe:
            print(f'flag: {c["id"]} has sound but no words; check whether it is music, ambience or a failed transcript')
    levels = [c["mean_db"] for c in clips if c["words"] and c["mean_db"] is not None]
    if levels and max(levels) - min(levels) > 6:
        print(f"flag: speech volume differs by {max(levels) - min(levels):.0f} dB between clips; sequence.py evens it out")
    for i, x in enumerate(clips):
        for y in clips[i + 1:]:
            if x["words"] > 3 and y["words"] > 3:
                alike = difflib.SequenceMatcher(None, x["text"].lower(), y["text"].lower()).ratio()
                if alike >= RETAKE:
                    print(f'flag: {x["id"]} and {y["id"]} may be retakes ({alike:.0%} alike); watch both and keep the best')


if __name__ == "__main__":
    main()
