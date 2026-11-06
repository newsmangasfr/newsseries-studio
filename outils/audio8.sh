#!/usr/bin/env bash
# Voix clonée avec Audio8-TTS-Realistic (Edge0, Apache 2.0), sur le processeur.
# usage : bash outils/audio8.sh <référence.wav> "<texte de la référence>" "<texte à dire>" <sortie.wav>
set -euo pipefail
ICI="$(cd "$(dirname "$0")" && pwd)"
REPO="${AUDIO8_REPO:-/home/user/Edge0-AI/Audio8_TTS}"
[ -d "$REPO" ] || GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 https://github.com/Edge0-AI/Audio8_TTS "$REPO"
[ -f "$ICI/bin/audio8-realistic/model.safetensors" ] || "$ICI/.venv/bin/python" -I -c "from huggingface_hub import snapshot_download; snapshot_download('Edge0/Audio8-TTS-Realistic-0.6b', local_dir='$ICI/bin/audio8-realistic')"
cd "$REPO"
"$ICI/.venv/bin/python" audio8_tts_infer.py --model "$ICI/bin/audio8-realistic" --device cpu \
  --reference-audio "$(realpath "$OLDPWD/$1" 2>/dev/null || realpath "$1")" --reference-text "$2" --text "$3" \
  --output "$(realpath -m "$OLDPWD/$4")" "${@:5}"
