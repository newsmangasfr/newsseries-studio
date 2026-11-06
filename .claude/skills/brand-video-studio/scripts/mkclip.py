#!/usr/bin/env python3
"""Build assets/clip.mp4 by joining ranges of one or more videos.
usage: mkclip.py cut.json outdir   -> prints where each range starts in the clip

One video:  "src": "/path/video.mp4", "ranges": [[start, end], ...] in source seconds.
Several:    "sources": {"id": "/path/a.mp4", ...}, "ranges": [[start, end, "id"], ...].
Optional "vranges": other ranges for the picture (same total duration as "ranges"), to cover dark
shots or burned-in text with b-roll while the audio of "ranges" keeps playing.
Optional "gain": {"id": dB}, to even out clips recorded at different volumes.
With several sources, each picture is scaled and center-cropped to fill the most used size, or
"size": "1080x1920". Sources with no sound stay silent."""
import json, subprocess, sys, os
from collections import Counter
from media import parts, probe, source_paths

cut = json.load(open(sys.argv[1])); out = sys.argv[2]
os.makedirs(os.path.join(out, "assets"), exist_ok=True)
PATHS = source_paths(cut)
MULTI = bool(cut.get("sources"))
R = [parts(r) for r in cut["ranges"]]
VR = [parts(r) for r in cut.get("vranges", cut["ranges"])]

used = list(dict.fromkeys(sid for _, _, sid in R + VR))
missing = [sid or "(none)" for sid in used if sid not in PATHS]
if missing:
    sys.exit(f"ranges use unknown sources: {', '.join(missing)}. With \"sources\", each range needs its id.")
INPUT = {sid: i for i, sid in enumerate(used)}
INFO = {sid: probe(PATHS[sid]) for sid in used}
for a, b, sid in R + VR:
    if b > INFO[sid]["duration"] + 0.1:
        sys.exit(f"range {a}-{b} of {sid or PATHS[sid]} ends after the video, which lasts {INFO[sid]['duration']}s")

fit = ""
if MULTI:
    seconds = Counter()
    for a, b, sid in VR:
        seconds[f'{INFO[sid]["width"]}x{INFO[sid]["height"]}'] += b - a
    size = cut.get("size") or seconds.most_common(1)[0][0]
    W, H = (int(n) // 2 * 2 for n in size.split("x"))
    fit = f",scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    for sid in used:
        if abs(INFO[sid]["width"] / INFO[sid]["height"] - W / H) > 0.02:
            print(f"note: {sid} is {INFO[sid]['width']}x{INFO[sid]['height']} and gets cropped to fill {W}x{H}; check its framing")

f, t = [], 0.0
for i, (a, b, sid) in enumerate(VR):
    f.append(f"[{INPUT[sid]}:v]trim={a}:{b},setpts=PTS-STARTPTS,fps=30{fit}[v{i}];")
for i, (a, b, sid) in enumerate(R):
    d = b - a
    gain = cut.get("gain", {}).get(sid, 0)
    chain = f"aformat=sample_rates=48000:channel_layouts=stereo,volume={gain}dB," if gain else "aformat=sample_rates=48000:channel_layouts=stereo,"
    fades = f"afade=t=in:d=0.03,afade=t=out:st={d-0.04:.3f}:d=0.04"
    if INFO[sid]["audio"]:
        f.append(f"[{INPUT[sid]}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,{chain}{fades}[a{i}];")
    else:
        f.append(f"anullsrc=r=48000:cl=stereo,atrim=0:{d:.3f},asetpts=PTS-STARTPTS[a{i}];")
    print(f"range {i}: {sid + ' ' if sid else ''}{a}-{b} -> clip {t:.3f}-{t+d:.3f}")
    t += d
tv = sum(b - a for a, b, _ in VR)
if abs(tv - t) > 0.05:
    sys.exit(f"vranges lasts {tv:.3f}s and ranges {t:.3f}s: they must match")
fc = ("".join(f) + "".join(f"[v{i}]" for i in range(len(VR))) + f"concat=n={len(VR)}:v=1:a=0[v];"
      + "".join(f"[a{i}]" for i in range(len(R))) + f"concat=n={len(R)}:v=0:a=1[a]")
cmd = ["ffmpeg", "-v", "error", "-y"]
for sid in used:
    cmd += ["-i", PATHS[sid]]
subprocess.run(cmd + ["-filter_complex", fc, "-map", "[v]", "-map", "[a]",
                      "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", "30",
                      "-c:a", "aac", "-b:a", "192k", os.path.join(out, "assets", "clip.mp4")], check=True)
print("total", round(t, 3))
