---
name: boite-a-outils
description: "La boîte à outils de montage StudioFX (outils/studiofx.py), qui réunit 12 outils open source derrière une seule commande : découper les plans (PySceneDetect), couper les silences (Auto-Editor), stabiliser (vid.stab), étalonner sur une image de référence (color-matcher), détourer sans fond vert (rembg), ralenti fluide (RIFE), agrandir (Real-ESRGAN), séparer voix et musique (Demucs), tempo et temps forts (librosa), titres animés (HyperFrames), export final (FFmpeg), analyse d'une vidéo de référence (rea-video : plans, rythme, tempo, bruitages). À utiliser dès qu'une vidéo, une image ou un son du client doit être découpé, nettoyé, stabilisé, étalonné, détouré, ralenti, agrandi, séparé, calé sur la musique ou exporté, ou à décortiquer comme référence, ou pour « studiofx », « la boîte à outils », « le flux de montage »."
---

# La boîte à outils StudioFX

Tout passe par `outils/studiofx.py <commande>` (lancé depuis la racine du dépôt). Le détail de chaque commande est
dans `outils/README.md`.

## Avant la première commande d'une session

1. Lance `outils/studiofx.py verifier`.
2. Si un outil répond FAIL, ou si `outils/.venv` manque (nouvelle session cloud), lance `bash outils/installer.sh`
   (environ 10 minutes, PyTorch compris), puis vérifie à nouveau.

## Règles

- Ne modifie jamais un fichier du client : chaque commande écrit un nouveau fichier (`--sortie` pour choisir où).
- Regarde le résultat avant de le livrer : extrais des images avec ffmpeg et lis-les, mesure les durées avec ffprobe.
  Une commande qui a tourné n'est pas une preuve que le résultat est bon (un détourage peut effacer le sujet).
- Détourage : commence par `u2net`. Passe à `isnet-anime` seulement pour un personnage seul sur un fond simple.
  Regarde toujours le masque sur un fond vert.
- Ralenti : RIFE par défaut ; si son exécution est refusée ou échoue, `--methode ffmpeg`, et dis-le au client.
- Tempo : le JSON donne `tempo_bpm`, `temps` (chaque temps, en secondes) et `accents` (les attaques fortes). Cale les
  coupes sur `temps`, et les gros effets sur `accents`.
- Analyse : `outils/studiofx.py analyser <vidéo>` écrit `fiche.md` (plans, rythme par 10 s, tempo, coupes sur le temps,
  bruitages) et le dossier `rea/` (rapport HTML, planche d'images, voix et musique séparées). Lis la fiche, puis la
  planche d'images. La « méthode de fabrication » (réel, IA, 3D) est peu fiable sur du dessin animé : ne la cite jamais
  au client comme un fait. Elle sert à s'inspirer d'une structure, jamais à reprendre les images, la musique ou les
  personnages d'un autre.
- Export : `tiktok` (1080x1920, -14 LUFS), `youtube` (1920x1080), `web` (léger), `master` (qualité maximale).
- Dans une session cloud, Hugging Face, Google Drive et le serveur de modèles de Facebook sont bloqués : les modèles
  viennent de GitHub. N'essaie pas d'autres sources.

## Le flux de travail complet

analyser (si on a une référence) → scenes → silences → stabiliser → couleurs → ralenti → pistes → tempo → titres → exporter.
On ne fait que les étapes utiles à la vidéo : pas de stabilisation sur une capture d'écran, pas de séparation des pistes
sans musique à remixer.
