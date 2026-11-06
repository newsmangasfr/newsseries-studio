"""Piste de bruitages : chaque [instant, nom, volume] de tools/timing.json « sfx », pris dans assets/sfx (tronçonneuse
synthétisée par tools/make_fx.py) ou dans le pack sfx de MotionLab."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
ROOT = Path(__file__).resolve().parent.parent
PACKS = [ROOT / "assets" / "sfx", Path("/home/user/studiofax/motionlab/sfx")]
d = json.load(open(ROOT / "tools" / "timing.json"))
SR = 44100
out = np.zeros((int(d["total"] * SR) + 3 * SR, 2))
cache = {}
for t, name, vol in d["sfx"]:
    if name not in cache:
        f = next(f for p in PACKS for f in p.rglob(f"{name}.wav"))
        x, sr = sf.read(f, always_2d=True)
        if sr != SR:
            idx = np.arange(0, len(x), sr / SR); x = x[np.minimum(idx.astype(int), len(x) - 1)]
        cache[name] = x if x.shape[1] == 2 else np.repeat(x, 2, axis=1)
    x = cache[name] * vol
    i = int(t * SR); out[i:i + len(x)] += x[: len(out) - i]
sf.write(ROOT / "audio" / "sfx.wav", np.clip(out[: int(d["total"] * SR)], -1, 1).astype(np.float32), SR)
print(len(d["sfx"]), "bruitages")
