"""Voix off locale (Kokoro) pour un reel Full Visual, sans clé ni reconnaissance vocale.

Remplace l'étape ElevenLabs de voice.py quand aucune clé n'est disponible (session cloud) : chaque bloc de
caption.txt est dit séparément, accéléré d'un seul facteur uniforme pour viser 3,35 mots/s, puis recollé avec des
pauses de 0,12 s (0,24 s au début de chaque scène), qui mesurent 0,2 et 0,3 s une fois les fins de souffle comptées. Sortie : voice.mp3 + voice.alignment.json au format ElevenLabs
« with timestamps », lu tel quel par align.py. Les temps de chaque bloc sont exacts ; à l'intérieur d'un bloc, chaque
caractère prend sa part de la partie parlée.

usage : python kokoro_voice.py <dossier du reel> [--voice am_michael] [--pace 3.35]
Le fichier <reel>/say.json (facultatif) donne la prononciation : {"mot écrit": "mot dit", ...}.
"""
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

CACHE = Path.home() / ".cache" / "hyperframes" / "tts"
SR = 24000
NUM = {"2027": "deux mille vingt-sept", "2": "deux", "3": "trois", "5": "cinq"}


def blocks(caption):
    out, scene = [], -1
    for line in caption.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("@"):
            continue
        if s.startswith("=="):
            scene += 1
            continue
        text = re.sub(r"\s+", " ", s.replace("*", "").replace(" / ", " ")).strip()
        out.append((scene, text))
    return out


def spoken(text, say):
    t = text
    for a, b in sorted(say.items(), key=lambda kv: -len(kv[0])):
        t = re.sub(rf"(?<!\w){re.escape(a)}(?!\w)", b, t)
    return re.sub(r"\d+", lambda m: NUM.get(m.group(0), m.group(0)), t)


def voiced(x, thr=0.02):
    env = np.convolve(np.abs(x), np.ones(240) / 240, mode="same")
    idx = np.where(env > thr * env.max())[0]
    return (idx[0], idx[-1] + 1) if len(idx) else (0, len(x))


def tempo(x, factor):
    if abs(factor - 1) < 1e-3:
        return x
    with tempfile.TemporaryDirectory() as d:
        a, b = Path(d) / "a.wav", Path(d) / "b.wav"
        sf.write(a, x, SR)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(a), "-filter:a", f"atempo={factor:.4f}", str(b)], check=True)
        return sf.read(b)[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("reel")
    ap.add_argument("--voice", default="am_michael")
    ap.add_argument("--pace", type=float, default=3.4)
    ap.add_argument("--speed", type=float, default=1.2, help="vitesse native de Kokoro, avant le tempo uniforme")
    a = ap.parse_args()
    reel = Path(a.reel)
    say = json.loads((reel / "say.json").read_text(encoding="utf-8")) if (reel / "say.json").exists() else {}
    tts = Kokoro(str(CACHE / "models" / "kokoro-v1.0.onnx"), str(CACHE / "voices" / "voices-v1.0.bin"))

    clips = []
    for scene, text in blocks(reel / "caption.txt"):
        x, sr = tts.create(spoken(text, say), voice=a.voice, speed=a.speed, lang="fr-fr")
        assert sr == SR
        s, e = voiced(x)
        clips.append((scene, text, x[max(0, s - 240): e + 240]))

    words = sum(len(re.findall(r"[\w’']+", t)) for _, t, _ in clips)
    pause = lambda i: 0.0 if i == 0 else (0.24 if clips[i][0] != clips[i - 1][0] else 0.12)
    speech = sum(len(c) for *_, c in clips) / SR
    gaps = sum(pause(i) for i in range(len(clips))) + 0.05
    factor = min(1.45, max(1.0, speech / max(0.1, words / a.pace - gaps)))
    print(f"{len(clips)} blocs, {words} mots, parole {speech:.2f}s, facteur de tempo {factor:.3f}")

    chars, starts, ends, parts, t = [], [], [], [np.zeros(int(0.05 * SR))], 0.05
    for i, (scene, text, x) in enumerate(clips):
        p = pause(i)
        parts.append(np.zeros(int(p * SR)))
        t += p
        y = tempo(x, factor)
        s, e = voiced(y)
        t0, t1 = t + s / SR, t + e / SR
        if i:
            chars.append(" "); starts.append(t0); ends.append(t0)
        n = len(text)
        for k, ch in enumerate(text):
            chars.append(ch)
            starts.append(round(t0 + (t1 - t0) * k / n, 3))
            ends.append(round(t0 + (t1 - t0) * (k + 1) / n, 3))
        parts.append(y)
        t += len(y) / SR
    parts.append(np.zeros(int(0.4 * SR)))
    audio = np.concatenate(parts)
    wav = reel / "voice.wav"
    sf.write(wav, audio / max(1e-6, np.abs(audio).max()) * 0.89, SR)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(wav), "-ar", "44100", "-b:a", "192k", str(reel / "voice.mp3")], check=True)
    wav.unlink()
    (reel / "voice.alignment.json").write_text(json.dumps({"alignment": {
        "characters": chars, "character_start_times_seconds": starts, "character_end_times_seconds": ends}}, ensure_ascii=False))
    print(f"voice.mp3 : {len(audio) / SR:.2f}s, {words / (len(audio) / SR - 0.45):.2f} mots/s")


if __name__ == "__main__":
    main()
