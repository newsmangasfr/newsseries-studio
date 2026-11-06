#!/usr/bin/env bash
# Voix off HeyGen Lucian pour un projet de short : une phrase de tools/vo.json = un fichier audio/vo/<id>.wav,
# silences de début et de fin retirés. Le champ « tts » (facultatif) remplace « cap » pour la prononciation
# (ex. « Aï » pour Ai, « Kouan-chi » pour Quanxi). Les fichiers déjà faits sont gardés, sauf avec --force.
# Usage (depuis le dossier du projet) : bash ../../outils/voix_lucian.sh [--force] [id ...]
set -euo pipefail
FORCE=0; [ "${1:-}" = "--force" ] && { FORCE=1; shift; }
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p audio/vo
python3 -I -c "
import json,sys
want=set(sys.argv[1:])
for s in json.load(open('tools/vo.json',encoding='utf-8')):
    if not want or s['id'] in want: print(s['id']+'\t'+s.get('tts',s['cap']))" "$@" | while IFS=$'\t' read -r id txt; do
  out="audio/vo/$id.wav"
  if [ -f "$out" ] && [ $FORCE = 0 ]; then echo "$id (déjà fait)"; continue; fi
  ok=0
  for essai in 1 2 3; do
    if python3 -I "$HERE/heygen_tts.py" "$txt" "audio/vo/$id.raw.wav" --voice lucian </dev/null >/dev/null; then ok=1; break; fi
    sleep 3
  done
  [ $ok = 1 ] || { echo "ÉCHEC : $id" >&2; exit 1; }
  ffmpeg -nostdin -y -v error -i "audio/vo/$id.raw.wav" -ar 44100 -ac 1 \
    -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse" "$out"
  rm "audio/vo/$id.raw.wav"
  printf "%s %.2f s\n" "$id" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")"
done
