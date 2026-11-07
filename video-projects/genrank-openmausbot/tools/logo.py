"""Prépare le logo GenRank (assets/src/logo-source.*, fond bleu nuit) : fond rendu transparent d'après la luminosité,
logo complet (assets/brand/logo.png) et mot-symbole seul (assets/brand/mot.png) pour la barre du haut.
Usage (depuis le dossier du projet) : python3 tools/logo.py   (numpy + pillow)"""
from pathlib import Path
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
im = Image.open(next((ROOT / "assets/src").glob("logo-source.*"))).convert("RGB")
a = np.asarray(im).astype(float)
alpha = np.clip((a.max(axis=2) - 34) / 70, 0, 1)
out = np.dstack([a, alpha * 255]).astype(np.uint8)
img = Image.fromarray(out, "RGBA")
H, W = alpha.shape
# le visuel d'origine a des halos bleus dans les coins : on ne garde que le G (haut) et la ligne GenRank.fr (bas)
keep = np.zeros_like(alpha, dtype=bool)
sx, sy = W / 1254, H / 1254
keep[int(170 * sy):int(790 * sy), int(220 * sx):int(1040 * sx)] = True
keep[int(770 * sy):int(1060 * sy), int(60 * sx):int(1200 * sx)] = True
alpha = alpha * keep
img = Image.fromarray(np.dstack([a, alpha * 255]).astype(np.uint8), "RGBA")
ys, xs = np.where(alpha > 0.35)
box = (xs.min() - 10, ys.min() - 10, xs.max() + 10, ys.max() + 10)
img.crop(box).save(ROOT / "assets/brand/logo.png")
mot = img.crop((int(60 * sx), int(775 * sy), int(1200 * sx), int(1060 * sy)))
mot = mot.crop(mot.getbbox())
mot.save(ROOT / "assets/brand/mot.png")
print("logo", img.crop(box).size, "mot", mot.size)
