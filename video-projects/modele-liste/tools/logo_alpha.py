"""Rend transparent le fond noir du logo (clé de luminance douce)."""
import sys
import numpy as np
from PIL import Image
im = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(np.float32)
m = im.max(axis=2)
a = np.clip((m - 18) / 30, 0, 1) * 255
Image.fromarray(np.dstack([im, a]).astype(np.uint8), "RGBA").save(sys.argv[2])
print(im[5,5], im[600,5])
