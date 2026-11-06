"""Découpe les extraits verticaux (1080x1920, 30 i/s, sans son) listés dans tools/timing.json, à la durée exacte de
chaque plan : recadrage plein écran (« full ») ou bandeau sur fond flou (« band »), teinte optionnelle, puis ralenti
(jusqu'à x1,6) et image figée si l'extrait est plus court que le plan.
Usage (depuis le dossier du projet) : python3 tools/clips.py"""
import json, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/src/source.mp4"
(ROOT / "assets/clips").mkdir(exist_ok=True)
TINT = {"": "", "dark": ",eq=brightness=-0.12:contrast=1.15:saturation=0.8",
        "red": ",colorchannelmixer=rr=1.1:rg=0.2:gg=0.45:bb=0.4,eq=contrast=1.2"}
for s in json.load(open(ROOT / "tools/timing.json"))["shots"]:
    if "src" not in s:
        continue
    parts, chains, total = [], [], 0.0
    for j, (a, b, mode, cx, tint) in enumerate(s["src"]):
        total += b - a
        x = int(max(0, min(1920 - 608, 1920 * cx - 304)))  # source 1920x1080
        if mode == "full":
            f = f"[{j}:v]crop=608:1080:{x}:0,scale=1080:1920:flags=lanczos{TINT[tint]},setsar=1,fps=30[p{j}]"
        else:
            f = (f"[{j}:v]split[a{j}][b{j}];[a{j}]crop=608:1080:{x}:0,scale=1080:1920,boxblur=30:2,eq=brightness=-0.25[bg{j}];"
                 f"[b{j}]scale=1080:-2:flags=lanczos{TINT[tint]}[fg{j}];[bg{j}][fg{j}]overlay=0:(H-h)/2-140,setsar=1,fps=30[p{j}]")
        parts += ["-ss", str(a), "-t", str(b - a), "-i", str(SRC)]
        chains.append(f)
    n = len(s["src"])
    slow = min(1.6, max(1.0, s["dur"] / total))
    pad = max(0.0, s["dur"] - total * slow) + 0.2
    fc = ";".join(chains) + ";" + "".join(f"[p{j}]" for j in range(n)) + f"concat=n={n}:v=1:a=0,setpts={slow:.4f}*PTS,fps=30,tpad=stop_mode=clone:stop_duration={pad:.3f}[out]"
    out = ROOT / s["clip"]
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", *parts, "-filter_complex", fc, "-map", "[out]", "-t", str(s["dur"]),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-g", "15", "-an", str(out)], check=True)
    print(s["kind"], s["dur"], f"ralenti x{slow:.2f}")
