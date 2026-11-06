"""Ressources « Chainsaw » synthétisées, sans aucun fichier externe (graine fixe : identiques à chaque fois) :
assets/sfx/chainsaw.wav, chainsaw-short.wav (moteur deux-temps qui monte en régime), assets/brand/splat.png (giclée rouge),
assets/brand/grain.png (grain de pellicule)."""
from pathlib import Path
import numpy as np, soundfile as sf
from PIL import Image, ImageDraw, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
SR = 44100
rng = np.random.default_rng(1)


def saw(length, f0, f1, rev=True):
    n = int(length * SR); tt = np.arange(n) / SR
    curve = np.clip(tt / (length * 0.45), 0, 1) ** 0.6 if rev else np.ones(n)
    f = f0 + (f1 - f0) * curve + 6 * np.sin(2 * np.pi * 7 * tt)  # régime qui monte, avec un léger vibrato
    ph = np.cumsum(f) / SR
    eng = 2 * (ph % 1) - 1  # dent de scie : très riche en harmoniques
    puls = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * ph * 0.5))  # explosions du deux-temps
    chain = np.diff(rng.standard_normal(n), prepend=0) * (0.25 + 0.2 * np.sin(2 * np.pi * f * 2 * tt) ** 2)  # chaîne
    x = eng * puls * 0.7 + chain * 0.5
    x = np.tanh(x * 2.5)  # saturation
    env = np.minimum(tt / 0.03, 1) * np.clip((length - tt) / 0.25, 0, 1)
    x = x * env
    return np.stack([x, np.roll(x, 40)], 1) * 0.6


(ROOT / "assets" / "sfx").mkdir(parents=True, exist_ok=True)
sf.write(ROOT / "assets/sfx/chainsaw.wav", saw(1.6, 55, 150).astype(np.float32), SR)
sf.write(ROOT / "assets/sfx/chainsaw-short.wav", saw(0.55, 110, 160).astype(np.float32), SR)

# giclée de sang : une tache centrale, des gouttes et des traînées
W = 1400
im = Image.new("RGBA", (W, W), (0, 0, 0, 0)); dr = ImageDraw.Draw(im)
red = (200, 16, 32, 255)
dr.ellipse((W / 2 - 230, W / 2 - 200, W / 2 + 230, W / 2 + 210), fill=red)
for k in range(46):
    a = rng.uniform(0, 2 * np.pi); r = rng.uniform(180, 640); s = rng.uniform(10, 70) * (1 - r / 800)
    x, y = W / 2 + r * np.cos(a), W / 2 + r * np.sin(a)
    dr.ellipse((x - s, y - s, x + s, y + s), fill=red)
    if k % 3 == 0:
        x0, y0 = W / 2 + 200 * np.cos(a), W / 2 + 200 * np.sin(a)
        dr.line((x0, y0, x, y), fill=red, width=int(max(6, s * 0.8)))
im = im.filter(ImageFilter.GaussianBlur(2))
im.save(ROOT / "assets/brand/splat.png")

g = (rng.standard_normal((540, 960)) * 40 + 128).clip(0, 255).astype(np.uint8)
Image.fromarray(g, "L").resize((1080, 1920), Image.NEAREST).save(ROOT / "assets/brand/grain.png")
print("ok")
