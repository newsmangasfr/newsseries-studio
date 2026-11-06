#!/usr/bin/env python3
"""Generate compositions/captions.html, word by word, styled by the brand and animation preset.
usage: capgen.py words cut.json out.html --brand brand.json --style STYLE --size WxH

words:      {"words": [{"start", "end", "text"}, ...]} in source seconds (`eyes transcript --words --json`).
            whisper.cpp JSON ({"transcription": [{"text", "offsets": {"from", "to"}}]}) also works.
            With several sources, a folder holding one <id>.json per source.
cut.json:   "ranges": [[start, end], ...]   source seconds, joined in order; [start, end, "id"] with sources
            "t0": 0                         where speech starts in the clip
            "fix": {"wrong": "right", "word@12.5": "only that one", "word@id:12.5": "in that source"}   "" removes it
            "add": [[start, end, "word"]]   words the transcriber missed; add the id as a fourth item with sources
            "drop": ["um", "uh"]            filler words
            "names": ["Lisbon"]             capitalized words that must not open a new caption group
"""
import argparse
import json
import os
import re

from media import parts, words_by_source

GROUP_WORDS = 4     # short groups are read at a glance on a phone
GROUP_CHARS = 18
PAUSE = 0.35


def place_words(by_source, cut):
    extra = {}
    for item in cut.get("add", []):
        extra.setdefault(item[3] if len(item) > 3 else "", []).append(tuple(item[:3]))
    at = []
    for key, value in cut.get("fix", {}).items():
        if "@" in key:
            word, where = key.rsplit("@", 1)
            sid, _, when = where.rpartition(":")
            at.append((word, float(when), sid, value))
    fix, drop = cut.get("fix", {}), {d.lower() for d in cut.get("drop", [])}
    out, t = [], cut.get("t0", 0)
    for ri, item in enumerate(cut["ranges"]):
        a, b, sid = parts(item)
        for s, e, raw in sorted(by_source.get(sid, []) + extra.get(sid, [])):
            if not a - 0.05 <= s < b - 0.12:
                continue
            txt = raw.strip()
            txt = next((v for k, when, where, v in at if k == txt and abs(when - s) < 0.3 and where in ("", sid)),
                       fix.get(txt, txt))
            if not re.search(r"\w", txt) or re.sub(r"\W", "", txt.lower()) in drop:
                continue
            out.append([round(t + max(s, a) - a, 3), round(t + min(e, b) - a, 3), txt, ri])
        t += b - a
    return out


def group_words(ws, names):
    groups, cur = [], []
    for w in ws:
        if cur:
            chars = sum(len(x[2]) + 1 for x in cur) + len(w[2])
            new_sentence = w[2][:1].isupper() and w[2].rstrip(",.?!") not in names
            if (w[3] != cur[-1][3] or new_sentence or w[0] - cur[-1][1] > PAUSE or chars > GROUP_CHARS
                    or len(cur) >= GROUP_WORDS or re.search(r"[.?!,]$", cur[-1][2])):
                groups.append(cur)
                cur = []
        cur.append(w)
    return groups + [cur] if cur else groups


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("words")
    ap.add_argument("cut")
    ap.add_argument("out")
    ap.add_argument("--brand", required=True)
    ap.add_argument("--style", required=True)
    ap.add_argument("--size", default="1080x1920")
    a = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    cut = json.load(open(a.cut))
    brand = json.load(open(a.brand))
    cap = json.load(open(os.path.join(here, "..", "assets", "styles.json")))[a.style]["caption"]
    c = brand["colors"]
    W, H = a.size.split("x")

    groups = group_words(place_words(words_by_source(a.words, cut), cut), set(cut.get("names", [])))
    upper = cap["case"] == "upper"
    clean = lambda s: (s.upper() if upper else s).rstrip(",.")
    markup = []
    for gi, g in enumerate(groups):
        spans = " ".join(f'<span class="w" id="cg{gi}w{wi}">{clean(w[2])}</span>' for wi, w in enumerate(g))
        markup.append(f'        <div class="cap" id="cg{gi}">{spans}</div>')
    data = [{"id": f"cg{gi}", "w": [[w[0], w[1]] for w in g]} for gi, g in enumerate(groups)]

    shadow = f'{cap["shadow"]}px {cap["shadow"] + 1}px 0 {c["ink_dark"]}' if cap["shadow"] else "none"
    html = open(os.path.join(here, "..", "assets", "captions.tpl.html")).read()
    for key, value in {
        "__FONT_FILE__": os.path.basename(brand["fonts"]["body"]["file"]),
        "__FONT__": brand["fonts"]["body"]["family"], "__SIZE__": cap["size"], "__STROKE__": cap["stroke"],
        "__SHADOW__": shadow, "__MODE__": cap["mode"], "__POP__": cap["pop"], "__W__": W, "__H__": H,
        "__TEXT__": "#FFFFFF", "__INK__": c["ink_dark"], "__HIGHLIGHT__": c["highlight"],
        "__MARKUP__": "\n".join(markup), "__DATA__": json.dumps(data),
    }.items():
        html = html.replace(key, str(value))
    open(a.out, "w").write(html)
    print(len(groups), "groups;", " / ".join(" ".join(clean(w[2]) for w in g) for g in groups[:12]))


if __name__ == "__main__":
    main()
