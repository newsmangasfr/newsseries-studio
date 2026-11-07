"""Musique de fond synthétisée, libre de droits : tech entraînante 124 BPM, accords Am–F–C–G.
Démarre en douceur pendant l'intro, groove complet ensuite, coupure d'un temps avant le plan « lancer », fin sur un accord.
Usage : python music.py   (lit tools/timing.json, écrit audio/music.wav)"""
import json
from pathlib import Path
import numpy as np, soundfile as sf
ROOT = Path(__file__).resolve().parent.parent
T = json.load(open(ROOT / "tools/timing.json"))
SR, BPM = 44100, 124
dur = T["total"]
beat = 60 / BPM
n = int(SR * (dur + 1))
mix = np.zeros((n, 2))
rng = np.random.default_rng(3)
lead = T["lead"]
prix = next((s["start"] for s in T["shots"] if s["kind"] == "lancer"), None)
outro = T["shots"][-1]["start"]


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= n or i < 0:
        return
    sig = sig[: n - i] * gain
    mix[i:i + len(sig), 0] += sig * np.sqrt((1 - pan) / 2) * 1.414
    mix[i:i + len(sig), 1] += sig * np.sqrt((1 + pan) / 2) * 1.414


def env(length, a=0.004, d=0.2):
    tt = np.arange(int(length * SR)) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)


def lp(x, k):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += k * (v - acc); y[i] = acc
    return y


def note(f):
    return 440 * 2 ** ((f - 69) / 12)


tt = np.arange(int(0.45 * SR)) / SR
KICK = np.sin(2 * np.pi * (50 * tt + 90 * (1 - np.exp(-tt * 30)) / 30)) * env(0.45, 0.002, 0.16)
CLAP = lp(rng.standard_normal(int(0.25 * SR)), 0.35) * env(0.25, 0.002, 0.07)
HAT = (rng.standard_normal(int(0.06 * SR)) - lp(rng.standard_normal(int(0.06 * SR)), 0.3)) * env(0.06, 0.001, 0.018)
CH = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]]  # Am F C G
BASS = [33, 29, 36, 31]


def pluck(f, length=0.32):
    t = np.arange(int(length * SR)) / SR
    ph = (f * t) % 1
    saw = 2 * ph - 1
    return lp(saw, 0.18) * env(length, 0.003, 0.11)


def pad(fs, length):
    t = np.arange(int(length * SR)) / SR
    s = sum(np.sin(2 * np.pi * note(m) * t) + 0.4 * np.sin(2 * np.pi * note(m) * 2.003 * t) for m in fs)
    e = np.minimum(t / 0.3, 1) * np.minimum((length - t) / 0.3, 1)
    return s * e / len(fs)


nb = int(dur / beat) + 2
for b in range(nb):
    t0 = b * beat
    if t0 > dur:
        break
    bar, pos = divmod(b, 4)
    chord = CH[bar % 4]
    full = lead - 0.05 <= t0 < outro
    brk = prix is not None and prix - beat - 0.05 <= t0 < prix - 0.05
    if pos == 0:
        add(pad(chord, 4 * beat), t0, 0.10 if full else 0.16)
    if brk:
        continue
    if full or t0 >= outro:
        add(KICK, t0, 0.55)
        if pos in (1, 3):
            add(CLAP, t0, 0.22, 0.1)
        for h in range(2):
            add(HAT, t0 + h * beat / 2, 0.10 if h else 0.06, -0.3)
        bf = note(BASS[bar % 4])
        for h in range(2):
            tb = np.arange(int(beat / 2 * SR)) / SR
            add(np.tanh(2 * np.sin(2 * np.pi * bf * (2 if h else 1) * tb)) * env(beat / 2, 0.005, 0.12), t0 + h * beat / 2, 0.16)
    arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12]
    for q in range(4 if full else 2):
        add(pluck(note(arp[(q + pos) % 4])), t0 + q * beat / (4 if full else 2), 0.07 if full else 0.09, 0.35 if q % 2 else -0.35)
# accord final
add(pad(CH[0], 2.5) * 1.6, outro + 0.05, 0.22)
add(KICK, outro + 0.05, 0.6)
end = int(dur * SR)
fade = np.ones(n); fade[end - int(0.8 * SR):end] = np.linspace(1, 0, int(0.8 * SR)); fade[end:] = 0
mix *= fade[:, None]
mix = mix[:end] / max(1e-6, np.abs(mix).max()) * 0.8
sf.write(ROOT / "audio/music.wav", mix.astype(np.float32), SR)
print(f"musique {dur:.1f} s")
