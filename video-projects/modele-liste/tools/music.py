"""Musique de fond synthétisée (libre de droits) : 124 BPM, Am–F–C–G.
Usage : python music.py <durée_s> <sortie.wav> [instants des impacts en s...]
"""
import sys
import numpy as np
import soundfile as sf

SR = 44100
BPM = 124
dur = float(sys.argv[1])
out = sys.argv[2]
beat = 60 / BPM
n = int(SR * dur)
t = np.arange(n) / SR
mix = np.zeros((n, 2))


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= n:
        return
    sig = sig[: n - i] * gain
    mix[i : i + len(sig), 0] += sig * (1 - pan) ** 0.5
    mix[i : i + len(sig), 1] += sig * (1 + pan) ** 0.5


def env(length, a=0.005, d=0.2):
    tt = np.arange(int(length * SR)) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)


def kick():
    tt = np.arange(int(0.45 * SR)) / SR
    f = 45 + 110 * np.exp(-tt * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 7.5)


rng = np.random.default_rng(2027)  # graine fixe : rendu identique à chaque fois


def hat():
    s = rng.standard_normal(int(0.08 * SR))
    s = np.diff(s, prepend=0)  # passe-haut grossier
    return s * env(0.08, 0.001, 0.02) * 0.25


def clap():
    s = rng.standard_normal(int(0.25 * SR))
    return s * env(0.25, 0.002, 0.06) * 0.35


def tone(freq, length, kind="saw", a=0.01, d=0.5):
    tt = np.arange(int(length * SR)) / SR
    if kind == "saw":
        s = sum(np.sin(2 * np.pi * freq * k * tt) / k for k in range(1, 9))
    else:
        s = np.sin(2 * np.pi * freq * tt)
    return s * env(length, a, d)


NOTE = {"A": 55.0, "F": 43.65, "C": 65.41, "G": 49.0}
CHORDS = [("A", [0, 3, 7]), ("F", [0, 4, 7]), ("C", [0, 4, 7]), ("G", [0, 4, 7])]

intro = 4 * beat  # 1 mesure plus calme pour l'accroche
nbeats = int(dur / beat) + 1
for b in range(nbeats):
    tb = b * beat
    bar = b // 4
    root, iv = CHORDS[bar % 4]
    f0 = NOTE[root]
    if tb >= intro:
        add(kick(), tb, 0.9)
        add(hat(), tb + beat / 2, 1.0, 0.3)
        add(hat(), tb + beat / 4 * 3, 0.5, -0.3)
        if b % 2 == 1:
            add(clap(), tb, 1.0)
        # basse en croches
        for k in range(2):
            add(tone(f0, beat / 2, "saw", 0.005, 0.12), tb + k * beat / 2, 0.18)
    if b % 4 == 0:
        # nappe d'accord sur la mesure
        for semi in iv:
            fr = f0 * 4 * 2 ** (semi / 12)
            add(tone(fr, beat * 4, "saw", 0.3, 2.5), tb, 0.035, 0.4 * (semi / 7 - 0.5))
    # arpège léger
    root_hi = f0 * 8
    for k in range(4):
        semi = iv[(b + k) % 3] + (12 if k == 3 else 0)
        add(tone(root_hi * 2 ** (semi / 12), 0.2, "sine", 0.003, 0.12), tb + k * beat / 4, 0.06, 0.5 if k % 2 else -0.5)

# impacts (apparition du logo) : boum grave + souffle
for ti in [float(x) for x in sys.argv[3:]]:
    tt = np.arange(int(1.2 * SR)) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-tt * 10)) / SR) * np.exp(-tt * 3.2)
    air = rng.standard_normal(len(tt)) * np.exp(-tt * 6) * 0.25
    add(boom * 2.2 + air, ti, 1.0)
    pre = rng.standard_normal(int(0.45 * SR)) * np.linspace(0, 1, int(0.45 * SR)) ** 2 * 0.18
    add(np.diff(pre, prepend=0), ti - 0.45, 1.0)  # montée avant l'impact

# fondu de sortie sur 2 s
fade = np.clip((dur - t) / 2.0, 0, 1)[:, None]
mix *= fade
mix /= np.max(np.abs(mix)) + 1e-9
sf.write(out, (mix * 0.89).astype(np.float32), SR)
