#!/usr/bin/env python3
"""Get word timings for a video as {"words": [{"start", "end", "text"}]}.
usage: transcribe.py video.mp4 words.json [--lang en] [--glossary "Names, Terms"]

Uses StudioFax (outils/studiofx.py mots, French only) first, then claude-eyes (it also indexes shots and on-screen text). If eyes returns no words, falls back
to whisper-cli when the WHISPER_MODEL environment variable points to a ggml model."""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile


def find_eyes():
    return shutil.which("eyes") or next((p for p in [os.path.expanduser("~/.local/bin/eyes")] if os.path.exists(p)), None)


def with_studiofx(video, lang):
    """StudioFax : transcription française hors ligne (Vosk) par outils/studiofx.py mots."""
    if lang != "fr":
        return []
    here = os.path.abspath(__file__)
    for _ in range(6):
        here = os.path.dirname(here)
        tool = os.path.join(here, "outils", "studiofx.py")
        if os.path.exists(tool):
            break
    else:
        return []
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "mots.json")
        if subprocess.run([sys.executable, tool, "mots", video, "--sortie", out], stdout=subprocess.DEVNULL).returncode:
            return []
        return json.load(open(out)).get("words", [])


def with_eyes(video, lang, glossary):
    eyes = find_eyes()
    if not eyes:
        return []
    cmd = [eyes, "index", video, "--lang", lang]
    if glossary:
        cmd += ["--glossary", glossary]
    if subprocess.run(cmd, stdout=subprocess.DEVNULL).returncode:
        return []
    done = subprocess.run([eyes, "transcript", video, "--words", "--json"], capture_output=True, text=True)
    return json.loads(done.stdout).get("words", []) if done.returncode == 0 else []


def with_whisper(video, lang):
    model = os.environ.get("WHISPER_MODEL")
    if not model or not shutil.which("whisper-cli"):
        return []
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "audio.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-ac", "1", "-ar", "16000", wav], check=True)
        subprocess.run(["whisper-cli", "-m", model, "-l", lang, "-mc", "0", "-ml", "1", "-sow", "-ojf", "-of",
                        os.path.join(tmp, "out"), "-f", wav], check=True, stdout=subprocess.DEVNULL)
        data = json.load(open(os.path.join(tmp, "out.json")))
    return [{"start": w["offsets"]["from"] / 1000, "end": w["offsets"]["to"] / 1000, "text": w["text"].strip()}
            for w in data["transcription"] if w["text"].strip()]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("out")
    ap.add_argument("--lang", default="en")
    ap.add_argument("--glossary")
    a = ap.parse_args()
    words = with_studiofx(a.video, a.lang) or with_eyes(a.video, a.lang, a.glossary) or with_whisper(a.video, a.lang)
    if not words:
        sys.exit("No words found. Run `eyes setup`, or set WHISPER_MODEL and install whisper-cli.")
    json.dump({"words": words}, open(a.out, "w"), ensure_ascii=False)
    print(len(words), "words ->", a.out)


if __name__ == "__main__":
    main()
