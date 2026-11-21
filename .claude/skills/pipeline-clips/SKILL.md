---
name: pipeline-clips
description: "Fiche de la chaîne « vidéo longue → clips verticaux » pour NewsSeries : capturer, trouver le bon moment, couper, recadrer, sous-titrer, exporter, avec les outils open source (yt-dlp, Streamlink, TwitchDownloader, OBS, ClipsAI, FunClip, PySceneDetect, auto-editor, faster-whisper, WhisperX, Silero VAD, MediaPipe, OpenCV, Subtitle Edit, LosslessCut, MoviePy, OpenCut, Remotion, FFmpeg). À utiliser pour transformer une interview, un live, une conférence de presse ou une vidéo du client en Reels, TikToks et Shorts, et pour choisir l'outil de chaque étape."
---

# Chaîne de clips : stream → moment → coupe → recadrage → sous-titres → export

Pour produire les clips du client, le skill `long-video-en-cut-reel` mène tout le travail (transcription, choix des
moments, coupes, sous-titres animés, logo, descriptions). Cette fiche dit quel outil prendre à chaque étape quand il
faut aller plus loin ou remplacer une pièce.

| Étape | Outil | Dépôt | Remarque |
|---|---|---|---|
| Récupérer une vidéo (si les droits sont réglés) | yt-dlp | yt-dlp/yt-dlp | voir la règle sur les droits |
| VOD, clips et chat Twitch | TwitchDownloader | lay295/TwitchDownloader | idem |
| Capturer un direct | Streamlink | streamlink/streamlink | idem |
| Enregistrer le gameplay ou les réactions du client | OBS Studio | obsproject/obs-studio | sa propre source, sans souci de droits |
| Transcrire en local | faster-whisper | SYSTRAN/faster-whisper | français : modèle `large-v3` ou `medium` |
| Horodater mot à mot | WhisperX | m-bain/whisperX | sous-titres animés précis |
| Repérer la parole | Silero VAD | snakers4/silero-vad | découpage avant transcription |
| Choisir les clips depuis la transcription | FunClip, ClipsAI | modelscope/FunClip, ClipsAI/clipsai | proposent des moments ; le choix final se valide à la main |
| Changements de plan | PySceneDetect | Breakthrough/PySceneDetect | `outils/studiofx.py` |
| Silences et temps morts | auto-editor | WyattBlue/auto-editor | `outils/studiofx.py` |
| Suivre un visage, recadrer en 9:16 | MediaPipe + OpenCV | google-ai-edge/mediapipe, opencv/opencv | garder le locuteur dans le tiers central |
| Couper sans réencoder | LosslessCut | mifi/lossless-cut | coupes rapides, sans perte |
| Corriger et styliser les sous-titres | Subtitle Edit | SubtitleEdit/subtitleedit | relire les noms de séries et d'acteurs |
| Scripter un montage | MoviePy | Zulko/moviepy | assemblages simples |
| Timeline visuelle | OpenCut | OpenCut-app/OpenCut | retouche manuelle |
| Gabarit de clip réutilisable | Remotion | remotion-dev/remotion | skills `remotion-*` |
| Recadrer, mixer, exporter | FFmpeg | FFmpeg/FFmpeg | -14 LUFS, moins de 100 Mo (voir `short-actu-serie`) |

## Règle sur les droits (à lire avant de télécharger)

- Prendre seulement des sources que le client **possède** (ses lives, ses vidéos, ses enregistrements OBS) ou pour
  lesquelles il a une **autorisation écrite** (interview, extrait de promotion fourni par un diffuseur ou un
  distributeur pour la presse, vidéo d'un partenaire).
- Ne pas télécharger ni republier le live, la VOD ou la vidéo d'un autre créateur sans son accord. Un clip « réaction »
  ou un extrait court ne garantit pas le droit de citation : en cas de doute, demander au client et ne pas le faire.
- Les bandes-annonces et affiches officielles se reprennent selon les conditions de leur diffuseur ; garder le lien de
  la source et créditer dans la description.
- Ne pas contourner un blocage, un compte ou une protection de lecture pour récupérer une vidéo.

## Moments forts d'une vidéo (ce qu'on cherche)

Une phrase qui se comprend seule, une annonce (casting, date, renouvellement), un avis tranché, une réaction, un
retournement. Durée visée : 20 à 45 secondes ; l'accroche tient dans les 3 premières secondes (voir `studio-serie`).
