---
name: short-actu-serie
description: "Fabrique un short vertical d'actu séries pour NewsSeries (TikTok, Reels, YouTube Shorts) à partir de visuels, d'une affiche ou d'un teaser vidéo et d'un texte d'annonce : script en français, voix HeyGen Lucian, logo NewsSeries animé au début et à la fin, sous-titres dynamiques, musique et bruitages, rendu HyperFrames 1080x1920, puis descriptions TikTok, Facebook, Reel Facebook et YouTube Shorts. À utiliser dès qu'on demande « crée-moi un short », « fais la vidéo », « fais un montage » sur une annonce série, ou une description pour ces vidéos."
---

# Short d'actu séries NewsSeries

Quatre modèles (hérités de StudioFax, à rhabiller aux couleurs des séries) servent de base. On ne repart jamais de zéro : on copie le modèle le plus proche,
puis on adapte le script, les visuels, les couleurs et les plans.

| Modèle | Projet copié | Quand le prendre |
|---|---|---|
| `liste` | `video-projects/modele-liste` | Une liste de titres (une infographie de plusieurs séries) : une affiche par série, des chapitres |
| `film` | `video-projects/modele-film` | Une annonce autour d'une seule affiche : date, slogan, détails de l'affiche |
| `personnages` | `video-projects/modele-personnages` | Une annonce avec des visuels de groupe : une fiche par personnage |
| `teaser` | `video-projects/modele-teaser` | Un teaser vidéo fourni : extraits recadrés en vertical, style sombre et brutal |

## Étapes

1. **Démarrer le projet** depuis la racine du dépôt :
   `bash outils/nouveau_short.sh <modèle> <nom-du-projet>`.
   Les visuels du client vont dans `assets/src/`. Une vidéo fournie y va sous le nom `source.mp4`.
2. **Regarder les visuels** avant d'écrire quoi que ce soit : extraire des images (`ffmpeg ... -vf tile`), les lire,
   repérer les plans (`ffmpeg -filter:v "select='gt(scene,0.25)',showinfo"`) et les zones de texte à éviter.
   Si le client fournit une vidéo (teaser, bande-annonce) ou cite une vidéo à égaler, lance
   `outils/studiofx.py analyser <vidéo>` : la fiche donne le nombre de plans, le rythme, le tempo de la musique et les
   instants de coupe, qui servent à caler le montage (voir `boite-a-outils`). Ne jamais reprendre les images ou la
   musique d'une vidéo qui n'est pas celle du client.
   Les cadrages se découpent avec PIL, puis s'agrandissent avec `outils/studiofx.py agrandir --echelle 4`.
3. **Écrire le script** dans `tools/vo.json` : une phrase par objet, avec un `id`, le texte affiché `cap` et, si la
   prononciation pose problème, un texte `tts` pour la voix (par exemple « Aï » pour Ai, « Kouan-chi » pour Quanxi,
   « Rézé » pour Reze, « Mappa » pour MAPPA). Une phrase finale `cta` pose une question au public.
   - Respecter la durée demandée. Le montage ajoute environ 8 secondes à la voix (logo, fin) : pour « 1 minute
     minimum », viser au moins 55 secondes de voix, soit environ 15 phrases.
   - N'écrire que des faits sûrs : ce que disent les visuels et le message du client, et ce qui est connu de
     l'œuvre. Une information non confirmée est présentée comme une rumeur ou laissée de côté. Ne jamais attribuer
     un nom à un personnage qu'on ne reconnaît pas avec certitude sur l'image.
4. **Enregistrer la voix** (depuis le dossier du projet) : `bash ../../outils/voix_lucian.sh`.
   C'est la voix HeyGen « Lucian », la seule que le client a validée. La clé `OPENROUTER_API_KEY` est déjà dans les
   variables d'environnement ; elle ne s'écrit jamais dans un fichier ni dans le chat.
   N'utilise pas les voix Piper (Siwis, Gilles), YourTTS ou Kokoro : le client les trouve mauvaises.
5. **Adapter le montage** dans `tools/build.py` (les plans, les textes à l'écran, l'instant de chaque animation
   calé sur un mot avec `at(id, "mot")`) et `tools/style.css` (les couleurs de la série, prises dans ses visuels).
   On garde toujours le logo NewsSeries animé au début (« L'ACTU SÉRIES ») et à la fin
   (« ABONNE-TOI POUR PLUS D'ACTUS », newsseries.fr), mais on l'habille dans l'univers de la série, comme la
   tronçonneuse du modèle `teaser`.
6. **Construire et mixer** (depuis le dossier du projet) :
   `python3 tools/build.py`, puis pour le modèle `teaser` `python3 tools/clips.py`, puis
   `PY=../../outils/.venv/bin/python bash tools/make_audio.sh`, puis `npx --yes hyperframes@0.9.8 lint`
   (0 erreur exigée).
7. **Rendre** : `npx --yes hyperframes@0.9.8 render -o renders/<nom>.mp4`, en tâche de fond (3 à 7 minutes).
8. **Vérifier avant de livrer** : une planche d'une image par plan (vers 75 % du plan), puis les plans dont le texte
   arrive tard. On corrige ce qui dépasse de l'écran, ce qui se chevauche et ce qui cache le texte des visuels.
   On mesure aussi la durée (`ffprobe`) et le volume (`ebur128`, environ -14 LUFS).
9. **Livrer** : la vidéo doit faire moins de 100 Mo (limite de GitHub). Sinon, réencoder :
   `-c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -c:a aac -b:a 192k -movflags +faststart`.
   Ensuite commit, push, et envoi de la vidéo au client avec un résumé des plans et de ce qui n'est pas vérifié.
10. **Descriptions** : quand le client les demande, suivre `references/descriptions.md`.

## Pour monter mieux

Pour un sujet qui mérite plus qu'un modèle (gros événement, bande-annonce, mini-histoire), suivre le skill `studio-serie` :
storyboard avant de monter, effets, passe de bruitages mesurée, contrôle qualité.

## Pièges déjà rencontrés

- Le texte en dégradé (`background-clip: text`) disparaît s'il est posé sur le parent de lettres animées une par
  une : le mettre sur chaque lettre.
- HyperFrames refuse d'animer `letterSpacing` : animer `scale` ou `x` à la place.
- Une police système doit être déclarée avec `@font-face { src: local("...") }` (IPAGothic pour le japonais,
  Liberation Serif pour l'élégant).
- Dans un filtre ffmpeg, les virgules d'une expression cassent la chaîne : calculer les valeurs en Python.
- Un `gsap.fromTo` sur un élément caché doit remettre `opacity: 1` dans la destination.
- Lucian lit « Ai » comme « è » : écrire « Aï » dans `tts`.
