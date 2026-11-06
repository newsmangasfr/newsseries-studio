#!/usr/bin/env bash
# Installe les 12 outils de StudioFX dans outils/.venv et outils/bin. Linux (session cloud) ; à relancer sans risque.
set -euo pipefail
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { sudo apt-get update && sudo apt-get install -y ffmpeg; }
ffmpeg -hide_banner -filters | grep -q vidstabdetect || echo "attention : ce FFmpeg n'a pas vid.stab (libvidstab)"
# Vulkan sur le processeur (llvmpipe) : RIFE et Real-ESRGAN (versions ncnn) tournent sans carte graphique
command -v vulkaninfo >/dev/null || apt-get install -y mesa-vulkan-drivers vulkan-tools || true
[ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q scenedetect opencv-python-headless auto-editor color-matcher "rembg[cpu,cli]" filetype librosa soundfile \
  torch torchaudio "audio-separator[cpu]" audioread
# rea-video (analyse d'une vidéo de référence), version figée ; sans l'option OCR, qui ne gère pas Python 3.13
.venv/bin/pip install -q "rea-video @ git+https://github.com/JuneYaooo/rea-video@d904b1e8328515dc95d9772cd2e65fb8acde996d"
mkdir -p bin && cd bin
if [ ! -x rife-ncnn-vulkan-20221029-ubuntu/rife-ncnn-vulkan ]; then
  curl -fsSL -o rife.zip https://github.com/nihui/rife-ncnn-vulkan/releases/download/20221029/rife-ncnn-vulkan-20221029-ubuntu.zip
  unzip -q -o rife.zip && rm rife.zip
  (cd rife-ncnn-vulkan-20221029-ubuntu && for d in rife rife-HD rife-UHD rife-v2 rife-v2.3 rife-v2.4 rife-v3.0 rife-v3.1 rife-v4; do rm -rf "$d"; done)
fi
if [ ! -x realesrgan-ncnn/realesrgan-ncnn-vulkan ]; then
  curl -fsSL -o esr.zip https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-ubuntu.zip
  unzip -q -o esr.zip -d realesrgan-ncnn && rm esr.zip && rm -f realesrgan-ncnn/*.jpg realesrgan-ncnn/*.mp4
fi
chmod +x rife-ncnn-vulkan-20221029-ubuntu/rife-ncnn-vulkan realesrgan-ncnn/realesrgan-ncnn-vulkan
cd .. && .venv/bin/python -I studiofx.py verifier
# Voix françaises natives (Piper), depuis les versions GitHub du projet
.venv/bin/pip install -q piper-tts
mkdir -p bin/piper-voices && for n in voice-fr-gilles-low voice-fr-siwis-medium; do
  [ -f "bin/piper-voices/$n/${n#voice-}.onnx" ] || { curl -fsSL -o /tmp/$n.tar.gz https://github.com/rhasspy/piper/releases/download/v0.0.2/$n.tar.gz && mkdir -p bin/piper-voices/$n && tar xzf /tmp/$n.tar.gz -C bin/piper-voices/$n && rm /tmp/$n.tar.gz; }
done
