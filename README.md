# NewsSeries Studio

Projet de montage vidéo pour NewsSeries (newsseries.fr), copie de StudioFax adaptée aux séries.

Les skills de montage se trouvent dans `.claude/skills/`. Claude Code les charge tout seul quand une session s'ouvre sur ce dépôt, en local comme sur claude.ai/code.

Prérequis : Node.js, ffmpeg et Python.

## Boîte à outils de montage

`outils/` réunit 11 outils open source (PySceneDetect, Auto-Editor, vid.stab, color-matcher, rembg, RIFE,
Real-ESRGAN, Demucs, librosa, HyperFrames, FFmpeg) derrière une seule commande : `outils/studiofx.py`. Installation :
`bash outils/installer.sh`. Détails : `outils/README.md`.
