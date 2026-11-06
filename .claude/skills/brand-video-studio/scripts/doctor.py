#!/usr/bin/env python3
"""Check the tools this skill needs and say how to install what is missing.
usage: doctor.py"""
import os
import shutil
import subprocess
import sys

TOOLS = [
    ("ffmpeg", True, "macOS: brew install ffmpeg | Debian/Ubuntu: apt install ffmpeg | Windows: winget install ffmpeg"),
    ("ffprobe", True, "comes with ffmpeg"),
    ("node", True, "https://nodejs.org (needed for npx hyperframes)"),
    ("npx", True, "comes with Node"),
    ("eyes", False, "uv tool install git+https://github.com/moritzkremb/claude-eyes && eyes setup --fix"),
    ("whisper-cli", False, "optional fallback; also set WHISPER_MODEL to a ggml model"),
]


def find(tool):
    if shutil.which(tool):
        return True
    return tool == "eyes" and os.path.exists(os.path.expanduser("~/.local/bin/eyes"))


def main():
    missing = False
    for tool, required, hint in TOOLS:
        ok = find(tool)
        print(f"{'ok  ' if ok else 'MISS' if required else 'skip'} {tool}" + ("" if ok else f"  -> {hint}"))
        missing |= required and not ok
    if find("npx"):
        done = subprocess.run(["npx", "--yes", "hyperframes", "--version"], capture_output=True, text=True)
        print("ok   hyperframes", done.stdout.strip() if done.returncode == 0 else "(could not run; check your network)")
    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    main()
