"""Voix off avec la voix clonée du créateur (YourTTS, à partir de son propre extrait isolé par Demucs)."""
import json, subprocess
from TTS.api import TTS
D = "/home/user/studiofax/outils/bin/yourtts/tts_models--multilingual--multi-dataset--your_tts"
REF = "/home/user/studiofax/outils/_test/clone/ref.wav"
tts = TTS(model_path=D + "/model_file.pth", config_path=D + "/config.json")
for s in json.load(open("tools/vo_clone.json", encoding="utf-8")):
    raw = f"audio/vo-clone/{s['id']}.raw.wav"
    tts.tts_to_file(text=s["tts"], speaker_wav=REF, language="fr-fr", file_path=raw)
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-i", raw, "-ar", "24000", "-ac", "1", "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                    f"audio/vo-clone/{s['id']}.wav"], check=True)
    print(s["id"], subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"audio/vo-clone/{s['id']}.wav"], capture_output=True, text=True).stdout.strip(), flush=True)
