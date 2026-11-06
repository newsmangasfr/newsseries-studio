"""Voix off HeyGen Voice Turbo (voix « lucian ») via outils/heygen_tts.py ; silences de début/fin retirés.
Usage (depuis le dossier du projet) : python3 tools/voix_heygen.py [--voice lucian]"""
import json, subprocess, sys
from pathlib import Path
voix = sys.argv[sys.argv.index("--voice") + 1] if "--voice" in sys.argv else "lucian"
OUT = Path("audio/vo-heygen"); OUT.mkdir(parents=True, exist_ok=True)
for s in json.load(open("tools/vo_heygen.json", encoding="utf-8")):
    raw = OUT / f"{s['id']}.raw.wav"
    subprocess.run([sys.executable, "../../outils/heygen_tts.py", s["tts"], str(raw), "--voice", voix], check=True)
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-i", str(raw), "-ar", "24000", "-ac", "1", "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                    str(OUT / f"{s['id']}.wav")], check=True)
    raw.unlink()
