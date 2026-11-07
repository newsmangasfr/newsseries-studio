"""Prépare le logo AchatBoo (assets/src/logo-source.*, fond blanc) : version détourée et sac seul pour l'intro.
Usage (depuis le dossier du projet) : python3 tools/logo.py"""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
src = next((ROOT / "assets/src").glob("logo-source.*"))
im = Image.open(src).convert("RGB")
w, h = im.size
px = im.load()
out = Image.new("RGBA", (w, h))
op = out.load()
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        m = min(r, g, b)                      # proche du blanc → transparent, avec bord adouci
        a = 255 if m < 215 else int(255 * (250 - m) / 35) if m < 250 else 0
        if 0 < a < 255:                       # retire le halo blanc des bords
            k = a / 255
            r, g, b = [max(0, min(255, int((c - 255 * (1 - k)) / k))) for c in (r, g, b)]
        op[x, y] = (r, g, b, max(0, a))
box = out.getbbox()
out = out.crop(box)
out.save(ROOT / "assets/brand/logo.png")
W, H = out.size
cut = int(W * 0.265)                          # le sac + panier occupent environ le quart gauche
bag = out.crop((0, 0, int(W * 0.31), H)); bp = bag.load()
for y in range(H):                            # retire le pied du « A » (sombre) collé au sourire orange
    for x in range(int(W * 0.245), bag.size[0]):
        r, g, b, a = bp[x, y]
        if a and (max(r, g, b) < 110 or not (r > 150 and r > b + 60)):
            bp[x, y] = (0, 0, 0, 0)
bag = bag.crop(bag.getbbox()); bag.save(ROOT / "assets/brand/sac.png")
word = out.crop((cut, 0, W, H)); wp = word.load()
for y in range(H):                            # retire la pointe du sourire sous le « A »
    for x in range(word.size[0]):
        r, g, b, a = wp[x, y]
        if a and (y > H * 0.86 or (x < 70 and r > b + 60)):
            wp[x, y] = (0, 0, 0, 0)
word = word.crop(word.getbbox()); word.save(ROOT / "assets/brand/texte.png")
print("logo", out.size, "sac", bag.size, "texte", word.size)
