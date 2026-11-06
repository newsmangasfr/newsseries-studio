#!/usr/bin/env python3
"""Report where a batch of videos stands and catch repeats across it.
usage: batch.py <project>

Reads <project>/plan.json. Progress comes from the files on disk, so it survives an interrupted run:
  planned  no cut.json yet        cut       cut.json written       built  assets/clip.mp4 exists
  rendered renders/<name>.mp4     stale     edited after rendering reviewed "reviewed": true in the plan
plan.json: {"per_source_max": 2, "videos": [{"name": "01-tip", "sources": ["a"], "title": "...", "reviewed": false}]}"""
import json
import os
import sys

from media import parts, source_paths

MIN_OVERLAP = 1.0


def state(root, item):
    d = os.path.join(root, "videos", item["name"])
    cut, spec = os.path.join(d, "cut.json"), os.path.join(d, "spec.json")
    render = os.path.join(root, "renders", item["name"] + ".mp4")
    if not os.path.exists(cut):
        return "planned"
    if os.path.exists(render):
        edited = max(os.path.getmtime(p) for p in (cut, spec) if os.path.exists(p))
        if edited > os.path.getmtime(render):
            return "stale"
        return "reviewed" if item.get("reviewed") else "rendered"
    return "built" if os.path.exists(os.path.join(d, "assets", "clip.mp4")) else "cut"


def used_ranges(root, name):
    file = os.path.join(root, "videos", name, "cut.json")
    if not os.path.exists(file):
        return []
    cut = json.load(open(file))
    paths = source_paths(cut)
    found = []
    for item in cut["ranges"]:
        a, b, sid = parts(item)
        found.append((paths.get(sid, sid), a, b))
    return found


def main():
    root = sys.argv[1]
    plan = json.load(open(os.path.join(root, "plan.json")))
    videos = plan["videos"]
    counts, per_source = {}, {}
    for item in videos:
        s = state(root, item)
        counts[s] = counts.get(s, 0) + 1
        print(f'{s:<9} {item["name"]:<28} {",".join(item.get("sources", [])):<20} {item.get("title", "")}')
        for sid in item.get("sources", []):
            per_source[sid] = per_source.get(sid, 0) + 1
    print(" ".join(f"{k}={v}" for k, v in counts.items()), f"of {len(videos)}")

    names = [v["name"] for v in videos]
    for name in {n for n in names if names.count(n) > 1}:
        print(f"flag: the name {name} is used twice")
    limit = plan.get("per_source_max")
    for sid, n in per_source.items():
        if limit and n > limit:
            print(f"flag: {n} videos use {sid}, over the limit of {limit}")
    manifest = os.path.join(root, "source", "sources.json")
    if os.path.exists(manifest):
        for clip in json.load(open(manifest))["sources"]:
            if clip["id"] not in per_source:
                print(f'flag: {clip["id"]} is not used by any video')
    used = {n: used_ranges(root, n) for n in names}
    for i, x in enumerate(names):
        for y in names[i + 1:]:
            shared = sum(max(0, min(b, d) - max(a, c)) for p, a, b in used[x] for q, c, d in used[y] if p == q)
            if shared >= MIN_OVERLAP:
                print(f"flag: {x} and {y} share {shared:.1f}s of the same footage")


if __name__ == "__main__":
    main()
