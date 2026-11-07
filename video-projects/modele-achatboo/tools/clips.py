"""Découpe les extraits verticaux (1080x1920, 30 i/s, sans son) de chaque plan listé dans tools/timing.json, à partir de
assets/src/source.mp4. Cadre « carre » : la vidéo entière au centre (y=360) sur un fond flou ; « plein » : recadrage
plein écran centré sur cx (0-1). Teinte « sombre » facultative. Ralenti jusqu'à x1,5 puis image figée si besoin.
Usage (depuis le dossier du projet) : python3 tools/clips.py"""
import json, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/src/source.mp4"
(ROOT / "assets/clips").mkdir(exist_ok=True)
w, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                                "-of", "csv=p=0", str(SRC)], capture_output=True, text=True, check=True).stdout.strip().split(","))
TINT = {"": "", "sombre": ",eq=brightness=-0.18:saturation=0.8"}
for s in json.load(open(ROOT / "tools/timing.json"))["shots"]:
    if "src" not in s:
        continue
    src = s["src"]
    tint = TINT[src.get("teinte", "")]
    parts, chains, total = [], [], 0.0
    for j, (a, b) in enumerate(src["extraits"]):
        total += b - a
        parts += ["-ss", str(a), "-t", str(b - a), "-i", str(SRC)]
        if src["cadre"] == "plein":
            sw = round(w * 1920 / h)  # largeur après mise à l'échelle sur 1920 de haut
            x = int(max(0, min(sw - 1080, sw * src["cx"] - 540)))
            chains.append(f"[{j}:v]scale={sw}:1920:flags=lanczos,crop=1080:1920:{x}:0{tint},setsar=1,fps=30[p{j}]")
        else:
            fh = round(h * 1080 / w / 2) * 2
            y = 360 + max(0, (1080 - fh) // 2)
            chains.append(f"[{j}:v]split[a{j}][b{j}];[a{j}]scale=-2:1920,crop=1080:1920,boxblur=40:3,eq=brightness=-0.32:saturation=0.7[bg{j}];"
                          f"[b{j}]scale=1080:{fh}:flags=lanczos{tint}[fg{j}];[bg{j}][fg{j}]overlay=0:{y},setsar=1,fps=30[p{j}]")
    n = len(src["extraits"])
    slow = min(1.5, max(1.0, s["dur"] / total))
    pad = max(0.0, s["dur"] - total * slow) + 0.3
    fc = ";".join(chains) + ";" + "".join(f"[p{j}]" for j in range(n)) + \
        f"concat=n={n}:v=1:a=0,setpts={slow:.4f}*PTS,fps=30,tpad=stop_mode=clone:stop_duration={pad:.3f}[out]"
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", *parts, "-filter_complex", fc, "-map", "[out]", "-t", str(s["dur"]),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-g", "15", "-an",
                    str(ROOT / s["clip"])], check=True)
    print(s["kind"], s["dur"], f"ralenti x{slow:.2f}")
