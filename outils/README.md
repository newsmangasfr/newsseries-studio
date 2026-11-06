# StudioFX : la boîte à outils de montage

Douze outils open source réunis derrière une seule commande en français : `outils/studiofx.py`.
Tout tourne sur le processeur, sans carte graphique, y compris dans une session Claude Code sur le web.

## Installation (une fois par machine ou par session cloud)

```bash
bash outils/installer.sh
```

L'installation se termine par `studiofx verifier`, qui teste chacun des 12 outils.

## Les commandes

| Étape | Commande | Outil |
|---|---|---|
| Trouver les plans | `outils/studiofx.py scenes rush.mp4 --decouper` | PySceneDetect |
| Couper les blancs | `outils/studiofx.py silences rush.mp4 --marge 0.1` | Auto-Editor |
| Stabiliser | `outils/studiofx.py stabiliser rush.mp4 --lissage 30` | vid.stab (dans FFmpeg) |
| Étalonner sur une référence | `outils/studiofx.py couleurs plan.mp4 --ref look.jpg` | color-matcher |
| Retirer le fond | `outils/studiofx.py detourer perso.png` (une vidéo sort en WebM avec transparence) | rembg |
| Ralenti fluide | `outils/studiofx.py ralenti plan.mp4 --facteur 2` | RIFE (ncnn), ou l'interpolation de FFmpeg |
| Agrandir | `outils/studiofx.py agrandir image.jpg --echelle 4` | Real-ESRGAN (ncnn) |
| Séparer la musique | `outils/studiofx.py pistes musique.mp3` | Demucs (`htdemucs`, par audio-separator) |
| Trouver le tempo | `outils/studiofx.py tempo musique.mp3` (JSON : BPM, temps, accents) | librosa |
| Décortiquer une vidéo de référence | `outils/studiofx.py analyser reference.mp4` (fiche de montage en français + rapport détaillé) | rea-video |
| Titres animés | `outils/studiofx.py titres video-projects/mon-titre` | HyperFrames |
| Exporter | `outils/studiofx.py exporter final.mp4 --format tiktok` (aussi `youtube`, `web`, `master`) | FFmpeg |

Chaque commande écrit un nouveau fichier à côté de l'original, ou là où `--sortie` l'indique. L'original n'est jamais
modifié.

## Le flux de travail conseillé

0. `analyser` : si tu as une vidéo de référence (un teaser fourni, une vidéo qui a bien marché), décortique-la avant de monter : nombre de plans, rythme, tempo.
1. `scenes` : découper les rushes en plans.
2. `silences` : retirer les pauses dans les plans parlés.
3. `stabiliser` : stabiliser les plans tremblés.
4. `couleurs` : donner à tous les plans le look d'une même image de référence.
5. `ralenti` : ralentir les moments forts.
6. `pistes` : séparer la voix et la musique d'un son, pour remixer.
7. `tempo` : récupérer les temps forts de la musique, pour couper dessus (le JSON se lit dans HyperFrames ou Remotion).
8. `titres` : faire les titres et les animations (HyperFrames, ou MotionLab dans `motionlab/`).
9. `exporter` : sortir la version finale pour la plateforme.

## Bon à savoir

- **Analyse** : `analyser` tourne hors ligne et gratuitement (environ 1 min 30 pour une vidéo d'1 minute). Au premier lancement,
  elle télécharge un modèle de séparation de la voix (67 Mo, depuis GitHub). Elle écrit `fiche.md` (la fiche de montage),
  `fiche.json` et le dossier `rea/` (rapport HTML, planche d'images, voix et musique séparées). La méthode de fabrication
  qu'elle devine (réel, IA, 3D) est peu fiable sur du dessin animé : ne t'y fie pas. Elle sert à s'inspirer de la structure
  d'une vidéo, jamais à reprendre les images, la musique ou les personnages d'un autre.
- **Détourage** : `u2net` est le plus fiable sur des visuels chargés comme les bannières d'anime. `isnet-anime` marche
  mieux sur un personnage seul, sur un fond simple.
- **Agrandissement** : `realesr-animevideov3` (par défaut) est fait pour l'animation. Pour de vraies photos, prends
  `realesrgan-x4plus`.
- **Tempo** : librosa se cale souvent sur la moitié du vrai tempo. Sous 80 BPM, la commande double donc le tempo et
  ajoute les temps intermédiaires. Change ce seuil avec `--min-bpm`.
- **Ralenti** : RIFE donne le meilleur résultat. Sans RIFE, `--methode ffmpeg` utilise l'interpolation de FFmpeg (sans
  IA), plus rapide mais moins propre sur les mouvements rapides.
- **Session cloud** : les modèles de Demucs et de RIFE sont normalement hébergés sur des sites bloqués là-bas. Les
  versions utilisées ici sont téléchargées depuis GitHub, qui reste accessible. Le premier lancement de rembg et de
  Demucs télécharge leur modèle (100 à 200 Mo).

## Transcription française

`outils/studiofx.py mots <audio|vidéo> --sortie mots.json` transcrit en français, mot à mot et hors ligne (Vosk). Elle écrit
`mots.json` (le format `{"words": [{start, end, text}]}`) et `mots.txt` (une ligne par phrase avec son instant). Le modèle
(1,4 Go) met environ 3 minutes à se charger la première fois. Elle se trompe sur les noms propres : à relire.
