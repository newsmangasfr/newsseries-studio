# Origine

Ce dossier est une copie du skill **Brand Video Studio** de Carlos Santana
(https://github.com/CarlosSantana94/brand-video-studio, licence MIT, voir `LICENSE`), au commit
`a93b5667213ba4397556ce8284d59e9d912c73aa`.

## Modifications faites pour StudioFax

- `scripts/transcribe.py` : la transcription française passe d'abord par `outils/studiofx.py mots` (Vosk, hors ligne), puis
  par claude-eyes (`eyes`) s'il est installé, puis par whisper-cli. On n'a donc pas besoin d'installer claude-eyes.
- `scripts/doctor.py` : `eyes` n'est plus obligatoire.

Le reste est inchangé. Ce skill se lance par `long-video-en-cut-reel` (le raccourci de NewsSeries).
