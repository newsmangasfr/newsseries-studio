"""Assemble audio/voice.wav (voix off placée selon tools/timing.json), audio/sfx.wav (bruitages MotionLab),
puis audio/mix.wav : musique baissée sous la voix (sidechain), normalisée vers -14 LUFS.
Usage (depuis le dossier du projet) : python tools/make_audio.py   (après tools/music.py)"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
ROOT = Path(__file__).resolve().parent.parent
SFX = ROOT.parent.parent / "motionlab" / "sfx"
T = json.load(open(ROOT / "tools/timing.json"))
SR = 44100
N = int(T["total"] * SR)


def load(p):
    x, sr = sf.read(p, always_2d=True)
    if sr != SR:
        idx = np.arange(0, len(x), sr / SR); x = x[np.minimum(idx.astype(int), len(x) - 1)]
    return x.mean(axis=1) if x.shape[1] > 1 else x[:, 0]


voice = np.zeros(N)
for sid, t in T["vo"].items():
    x = load(ROOT / "audio/vo" / f"{sid}.wav"); i = int(t * SR)
    voice[i:i + len(x)] += x[: N - i]
sf.write(ROOT / "audio/voice.wav", voice.astype(np.float32), SR)

fx = np.zeros((N, 2)); cache = {}
for t, name, vol in T["sfx"]:
    if name not in cache:
        x, sr = sf.read(next(SFX.rglob(f"{name}.wav")), always_2d=True)
        if sr != SR:
            idx = np.arange(0, len(x), sr / SR); x = x[np.minimum(idx.astype(int), len(x) - 1)]
        cache[name] = x if x.shape[1] == 2 else np.repeat(x, 2, axis=1)
    x = cache[name] * vol; i = int(t * SR)
    if i < N:
        fx[i:i + len(x)] += x[: N - i]
sf.write(ROOT / "audio/sfx.wav", np.clip(fx, -1, 1).astype(np.float32), SR)

tot = T["total"]
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "audio/voice.wav", "-i", "audio/music.wav", "-i", "audio/sfx.wav", "-filter_complex",
                f"[0:a]aformat=channel_layouts=stereo,apad=whole_dur={tot},asplit=2[v][sc];[1:a]volume=0.45[m];"
                "[m][sc]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=300[md];[2:a]aformat=channel_layouts=stereo[fx];"
                "[v][md][fx]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]",
                "-map", "[out]", "-ar", str(SR), "audio/mix.wav"], cwd=ROOT, check=True)
print(f"mix ok : {tot} s, {len(T['sfx'])} bruitages")
