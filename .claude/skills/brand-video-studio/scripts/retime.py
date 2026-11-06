#!/usr/bin/env python3
"""Re-sync compositions/captions.html to word timings measured on assets/clip.mp4.
usage: retime.py captions.html clip_words.json     (clip_words.json = `eyes transcript <clip> --words --json`)
Transcribing a long source drifts up to 3 s in passages with music. This keeps the corrected text from
capgen.py and only changes the timing: matched words take the measured start and end, and the rest are
interpolated from their matched neighbors."""
import json, re, sys, unicodedata, difflib

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn" and c.isalnum())

path = sys.argv[1]
h = open(path).read()
m = re.search(r"(\[\{\"id\".*?\}\])", h)
data = json.loads(m.group(1))
texts = dict(re.findall(r'id="(cg\d+w\d+)">([^<]*)<', h))
caps = [[g["id"], wi, a, b, texts[f'{g["id"]}w{wi}']] for g in data for wi, (a, b) in enumerate(g["w"])]
ew = [(w["start"], w["end"], w["text"]) for w in json.load(open(sys.argv[2]))["words"]]

A, B = [norm(c[4]) for c in caps], [norm(w[2]) for w in ew]
new = [None] * len(caps)
for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
    for k in range(blk.size):
        s, e, _ = ew[blk.b + k]
        new[blk.a + k] = (max(0.0, s - 0.05), e)
hitmask = [n is not None for n in new]
hits = sum(hitmask)

# Interpolation: shift unmatched words by the average offset of their matched neighbors.
for i, n in enumerate(new):
    if n: continue
    prv = next(((j, new[j]) for j in range(i - 1, -1, -1) if new[j]), None)
    nxt = next(((j, new[j]) for j in range(i + 1, len(new)) if new[j]), None)
    ds = [p[1][0] - caps[p[0]][2] for p in (prv, nxt) if p]
    d = sum(ds) / len(ds) if ds else 0.0
    new[i] = (caps[i][2] + d, caps[i][3] + d)

# Monotonic: every word starts after the previous one and lasts at least 0.1 s.
out, last = [], -1.0
for c, (s, e) in zip(caps, new):
    s = max(s, last + 0.02); e = max(e, s + 0.1); last = s
    out.append((c[0], c[1], round(s, 3), round(e, 3)))
for g in data:
    g["w"] = [[s, e] for gid, wi, s, e in out if gid == g["id"]]
open(path, "w").write(h[:m.start(1)] + json.dumps(data) + h[m.end(1):])
# [old_time, new_time] pairs of matched words, to move layers that were timed to the voice.
pares = [[c[2], round(n[0] + 0.05, 3)] for c, n, hit in zip(caps, new, hitmask) if hit]
json.dump(pares, open(re.sub(r"[^/]+$", "retime.json", path), "w"))
moved = [abs(n[0] + 0.05 - c[2]) for c, n in zip(caps, new)]
print(f"{hits}/{len(caps)} words matched; mean drift fixed {sum(moved) / len(moved):.2f}s, max {max(moved):.2f}s")
