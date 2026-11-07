"""Découpe les extraits vidéo de chaque plan « video » de tools/timing.json, à partir de assets/src/source.mp4 :
  - fenêtre (par défaut) : recadrage `box` [x, y, l, h] de la source, mis à l'échelle 960 de large, 30 i/s, sans son ;
  - mode « plein » : plein écran 1080x1920 centré sur cx (0-1), teinte « sombre » facultative.
Ralenti jusqu'à x1,5, puis image figée si l'extrait est plus court que le plan.
Usage (depuis le dossier du projet) : python3 tools/clips.py"""
import json, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/src/source.mp4"
(ROOT / "assets/clips").mkdir(exist_ok=True)
w, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                                "-of", "csv=p=0", str(SRC)], capture_output=True, text=True, check=True).stdout.strip().split(","))
TINT = {"": "", "sombre": ",eq=brightness=-0.22:saturation=0.8"}
for s in json.load(open(ROOT / "tools/timing.json"))["shots"]:
    if "clip" not in s:
        continue
    m = s["media"]
    parts, chains, total = [], [], 0.0
    for j, (a, b) in enumerate(m["extraits"]):
        total += b - a
        parts += ["-ss", str(a), "-t", str(b - a), "-i", str(SRC)]
        if m.get("mode") == "plein":
            sw = round(w * 1920 / h)
            x = int(max(0, min(sw - 1080, sw * m.get("cx", 0.5) - 540)))
            chains.append(f"[{j}:v:0]scale={sw}:1920:flags=lanczos,crop=1080:1920:{x}:0{TINT[m.get('teinte', '')]},setsar=1,fps=30[p{j}]")
        else:
            bx, by, bw, bh = m.get("box", [0, 0, w, h])
            chains.append(f"[{j}:v:0]crop={bw}:{bh}:{bx}:{by},scale=960:{m['h']}:flags=lanczos,setsar=1,fps=30[p{j}]")
    n = len(m["extraits"])
    slow = min(1.5, max(1.0, s["dur"] / total))
    pad = max(0.0, s["dur"] - total * slow) + 0.3
    fc = ";".join(chains) + ";" + "".join(f"[p{j}]" for j in range(n)) + \
        f"concat=n={n}:v=1:a=0,setpts={slow:.4f}*PTS,fps=30,tpad=stop_mode=clone:stop_duration={pad:.3f}[out]"
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", *parts, "-filter_complex", fc, "-map", "[out]", "-t", str(s["dur"]),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-g", "15", "-an",
                    str(ROOT / s["clip"])], check=True)
    print(s["kind"], s["dur"], f"ralenti x{slow:.2f}")
