#!/usr/bin/env python3
"""Voix off HeyGen Voice Turbo via OpenRouter (gratuit jusqu'au 30/11/2026 : heygen/heygen-voice-1-turbo:free).
La clé est lue dans la variable d'environnement OPENROUTER_API_KEY (réglages de l'environnement), jamais en dur.

L'API ne renvoie que du PCM brut (s16le mono, débit indiqué dans Content-Type) et exige une voix :
le script le demande en PCM puis le convertit avec ffmpeg selon l'extension de sortie.

usage : python3 outils/heygen_tts.py "<texte>" <sortie.mp3|.wav|.pcm> [--voice NOM] [--model ID]
"""
import argparse, json, os, re, subprocess, sys, urllib.request, urllib.error

VOIX = ["nadine", "tabitha", "bram", "gareth", "noelle", "meredith", "sabrina", "lucian", "weston", "vincent"]
p = argparse.ArgumentParser()
p.add_argument("texte"); p.add_argument("sortie")
p.add_argument("--voice", default="lucian", help="une des voix par défaut : " + ", ".join(VOIX))
p.add_argument("--model", default="heygen/heygen-voice-1-turbo:free")
a = p.parse_args()
cle = os.environ.get("OPENROUTER_API_KEY")
if not cle:
    sys.exit("OPENROUTER_API_KEY manque : ajoute-la dans les réglages de l'environnement, puis ouvre une nouvelle session.")
corps = {"model": a.model, "input": a.texte, "response_format": "pcm", "voice": a.voice}
req = urllib.request.Request("https://openrouter.ai/api/v1/audio/speech", data=json.dumps(corps).encode(),
                             headers={"Authorization": f"Bearer {cle}", "Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req, timeout=180) as r:
        pcm, ctype = r.read(), r.headers.get("Content-Type", "")
except urllib.error.HTTPError as e:
    sys.exit(f"OpenRouter a répondu {e.code} : {e.read().decode(errors='replace')[:500]}")
m = re.search(r"rate=(\d+)", ctype)
taux = m.group(1) if m else "44100"
if a.sortie.endswith(".pcm"):
    open(a.sortie, "wb").write(pcm)
else:
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-f", "s16le", "-ar", taux, "-ac", "1", "-i", "pipe:0", a.sortie],
                   input=pcm, check=True)
print("→", a.sortie, f"({len(pcm) / 2 / int(taux):.2f} s, {taux} Hz)")
