#!/usr/bin/env bash
# Reconstruit voice.wav, music.wav et mix.wav à partir de tools/timing.json.
# Usage (depuis le dossier du projet) : PY=<python avec numpy+soundfile> bash tools/make_audio.sh
set -euo pipefail
read TOTAL LEAD GAP VO IMPACTS < <(python3 -I -c "
import json;d=json.load(open('tools/timing.json'))
sh=d['shots'];imp=[sh[0]['start']+0.5, sh[-1]['start']+0.75]
print(d['total'],d['lead'],d['gap'],d['vo_dir'],','.join(f'{x:.3f}' for x in imp))")
D=audio/$VO
ffmpeg -y -v error -f lavfi -i anullsrc=r=44100:cl=mono -t "$GAP" "$D/gap.wav"
ffmpeg -y -v error -f lavfi -i anullsrc=r=44100:cl=mono -t "$LEAD" "$D/lead.wav"
{ echo "file 'lead.wav'"; for s in $(python3 -I -c "import json;print(' '.join(json.load(open('tools/timing.json'))['segments']))"); do echo "file '$s.wav'"; [ $s != cta ] && echo "file 'gap.wav'"; done; } > "$D/list.txt"
ffmpeg -y -v error -f concat -safe 0 -i "$D/list.txt" -ar 44100 -ac 1 audio/voice.wav
"$PY" -I tools/music.py "$TOTAL" audio/music.wav ${IMPACTS//,/ }
"$PY" -I tools/sfx_track.py
ffmpeg -y -v error -i audio/voice.wav -i audio/music.wav -i audio/sfx.wav -filter_complex "[0:a]aresample=44100,aformat=channel_layouts=stereo,apad=whole_dur=$TOTAL,asplit=2[v][sc];[1:a]volume=0.32[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[2:a]aformat=channel_layouts=stereo[fx];[v][md][fx]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]" -map "[out]" -ar 44100 audio/mix.wav
echo "mix ok : $TOTAL s, impacts $IMPACTS"
