#!/usr/bin/env python3
"""Assemble one video project: assets, clip, captions and compositions.
usage: make_video.py <video_dir> --brand brand.json [--words words.json]

<video_dir> must contain cut.json and spec.json. If compositions/clip_words.json exists (word timings
measured on the clip), captions are re-synced with it. Run with no clip_words.json first, measure the
clip, save the file and run again."""
import argparse
import json
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FORMATS = {"9:16": "1080x1920", "16:9": "1920x1080", "1:1": "1080x1080"}


def run(*cmd):
    subprocess.run([sys.executable, *cmd], check=True)


def copy_assets(d, brand, brand_dir):
    for sub in ("assets/fonts", "assets/img", "assets/sfx", "compositions"):
        os.makedirs(os.path.join(d, sub), exist_ok=True)
    for role in ("display", "body"):
        src = brand["fonts"][role]["file"]
        path = os.path.join(brand_dir, src)
        if not os.path.exists(path):
            path = os.path.join(HERE, "..", "assets", "fonts", os.path.basename(src))
        shutil.copy(path, os.path.join(d, "assets", "fonts"))
    if brand.get("logo"):
        shutil.copy(os.path.join(brand_dir, brand["logo"]), os.path.join(d, "assets", "img"))
    sfx = os.path.join(d, "assets", "sfx")
    run(os.path.join(HERE, "make_sfx.py"), sfx)
    if brand.get("sfx_dir"):
        custom = os.path.join(brand_dir, os.path.expanduser(brand["sfx_dir"]))
        for name in os.listdir(custom):
            if name.endswith(".mp3"):
                shutil.copy(os.path.join(custom, name), sfx)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dir")
    ap.add_argument("--brand", required=True)
    ap.add_argument("--words", help="word timings of the source, or a folder of <id>.json with several sources; required with captions")
    a = ap.parse_args()

    brand = json.load(open(a.brand))
    spec = json.load(open(os.path.join(a.dir, "spec.json")))
    copy_assets(a.dir, brand, os.path.dirname(os.path.abspath(a.brand)))
    run(os.path.join(HERE, "mkclip.py"), os.path.join(a.dir, "cut.json"), a.dir)
    if spec.get("captions", True):
        if not a.words:
            sys.exit("--words is required unless spec.json sets captions to false")
        style = spec.get("style", brand.get("style", "pop-bounce"))
        html = os.path.join(a.dir, "compositions", "captions.html")
        run(os.path.join(HERE, "capgen.py"), a.words, os.path.join(a.dir, "cut.json"), html, "--brand", a.brand,
            "--style", style, "--size", FORMATS[spec.get("format", "9:16")])
        measured = os.path.join(a.dir, "compositions", "clip_words.json")
        if os.path.exists(measured):
            run(os.path.join(HERE, "retime.py"), html, measured)
    run(os.path.join(HERE, "build.py"), a.dir, "--brand", a.brand)


if __name__ == "__main__":
    main()
