---
name: long-video-en-cut-reel
description: "Raccourci NewsSeries « long video en cut reel » : transforme une longue vidéo (podcast, interview, review, live, vidéo YouTube) en plusieurs reels verticaux 9:16 pour TikTok, Facebook Reels et YouTube Shorts. Transcrit la vidéo en français, la regarde, propose les meilleurs moments avec leur accroche, coupe sur les mots, ajoute sous-titres animés, logo NewsSeries et fermeture, puis écrit les descriptions de chaque plateforme. À utiliser dès qu'on dit « long video en cut reel », « découpe cette vidéo en reels », « fais X reels de cette vidéo », « sors les meilleurs moments », « cut reel », ou qu'on fournit une vidéo longue à transformer en extraits courts."
---

# Long vidéo en cut reel

Ce raccourci lance le skill `brand-video-studio` (de Carlos Santana, licence MIT, copié dans `.claude/skills/brand-video-studio/`)
avec la charte NewsSeries et les outils de StudioFax. On parle au client en français, et tout texte à l'écran est en
français.

Les chemins ci-dessous partent de la racine du dépôt. `<bvs>` veut dire `.claude/skills/brand-video-studio`.

## 1. Recevoir la vidéo

- Une pièce jointe est limitée à 30 Mo. Au-delà, le client la met dans une « Release » GitHub du dépôt StudioFax
  (page Releases, « Draft a new release », fichier glissé dans « Attach binaries »). Télécharge-la ensuite avec
  `gh release download <tag> --repo newsmangasfr/StudioFax -D video-projects/<nom>/source/`.
- Si la vidéo vient de YouTube ou d'un réseau social, ne la télécharge pas toi-même : demande-la au client. Les sites
  de vidéo sont souvent bloqués ici, et il doit avoir les droits sur ce qu'il publie.
- Crée le projet : `video-projects/<nom>/` avec `source/`, `videos/`, `renders/`, et copie la charte :
  `cp -r .claude/skills/long-video-en-cut-reel/brand video-projects/<nom>/brand`.

## 2. Regarder avant de décider

Ne planifie jamais d'après la transcription seule : une phrase forte sur un plan sombre fait un mauvais reel.

```bash
outils/studiofx.py mots video-projects/<nom>/source/long.mp4 --sortie video-projects/<nom>/source/words.json
outils/studiofx.py scenes video-projects/<nom>/source/long.mp4        # les plans
outils/studiofx.py tempo video-projects/<nom>/source/long.mp4         # s'il y a de la musique
ffmpeg -i long.mp4 -vf "fps=1/10,scale=240:-1,tile=8x6" planche.jpg    # une image toutes les 10 s, à regarder
```

- La transcription française est faite hors ligne par Vosk (`outils/studiofx.py mots`, la même que celle de `transcribe.py`). La première fois, le modèle
  (1,4 Go) met environ 3 minutes à se charger. Elle écrit `words.json` (mot à mot) et `words.txt` (une ligne par phrase, avec l'instant). Elle se trompe sur les
  noms propres : relis `words.txt`, corrige les noms d'œuvres et de personnages dans `words.json` avant de t'en servir.
- Si le client donne une vidéo de référence à égaler, passe-la dans `outils/studiofx.py analyser` (voir `boite-a-outils`).

## 3. Proposer les reels

Lis `<bvs>/references/reels-from-long-video.md`. Propose le nombre demandé (7 à 10 si le client n'en donne pas) : pour
chacun un titre, le type (histoire, chiffres, avis, liste, conseils, humour, montage d'images), les passages de la vidéo
source (début–fin), l'accroche des 3 premières secondes, et pourquoi ça devrait marcher.

- Chaque reel dure 20 à 45 secondes. L'accroche arrive tout de suite (pas d'introduction avec logo de plus de 1 seconde).
  Elle doit se comprendre sans le son.
- Coupe entre deux mots, jamais au milieu : place les bornes dans les silences de `words.json`.
- Si le client a dit « fais le taf », « go » ou « fais-le », continue sans attendre sa réponse. Sinon, attends son accord
  avant de lancer les rendus, qui sont longs.

## 4. Fabriquer chaque reel

Suis « Build a video » de `<bvs>/SKILL.md` et `<bvs>/references/spec.md` : `cut.json` et `spec.json` dans
`video-projects/<nom>/videos/<NN-nom>/`, puis `make_video.py`, la resynchronisation des sous-titres, `hyperframes check`,
`snapshot`, `render`. Dans ce dépôt, utilise toujours **`npx --yes hyperframes@0.9.8`** (la version testée), pas la dernière.

Règles NewsSeries :
- Charte : `brand/brand.json` (style `kinetic-bold`, rouge du logo, Inter). Sous-titres en capitales, le mot dit en jaune.
- Format 1080x1920. Mixage final : `loudnorm=I=-14:TP=-1.5:LRA=11`. Chaque fichier doit faire moins de 100 Mo
  (limite de GitHub) : au besoin `-c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M`.
- Quand la voix du client est enregistrée, c'est elle qu'on garde : on ne la remplace pas par la voix HeyGen.
- N'ajoute aucune musique de tiers. Pour une ambiance, utilise la musique synthétisée de StudioFax (`tools/music.py`
  des projets de shorts) ou celle que le client fournit.
- Ne mets jamais de fait qui n'est pas dit dans la vidéo.

## 5. Vérifier avant de livrer

Pour chaque reel : une planche d'images (une toutes les 2 secondes), puis `<bvs>/references/review-checklist.md`
point par point. Mesure la durée et le volume. Corrige et refais le rendu tant qu'un point échoue. Un `check` sans erreur
prouve seulement que le fichier est valide, pas que le reel est bon.

## 6. Livrer

- Envoie chaque reel au client avec `SendUserFile`, avec un résumé : la durée, le passage de la source, l'accroche.
- Écris `COPY.md` avec les descriptions de chaque reel pour TikTok, Facebook Reel et YouTube Shorts, en suivant
  `.claude/skills/short-actu-serie/references/descriptions.md` et le ton de `brand/BRAND.md`. Ajoute le tableau du
  calendrier de publication proposé par `<bvs>/references/reels-from-long-video.md`.
- Commit et push sur la branche en cours. Ne publie jamais à la place du client.

## Pièges

- **Crochet trop large** : avec la police Inter ExtraBold, une ligne de plus de 14 caractères sort de l'écran à la taille
  par défaut. Mets `"size": 88` dans `hook` (testé : « LE GÉANT D'ELBAF » tient) ou coupe la ligne en deux.
- **Sous-titres en double** : si la vidéo source a déjà des sous-titres incrustés, les nôtres s'ajoutent par-dessus. Demande
  la version sans sous-titres, ou mets `"captions": false`.
- **Test fait** : un reel de 18,8 s construit (`make_video.py`), validé (`hyperframes check`) et rendu (1 min 10) avec
  `hyperframes@0.9.8`, à partir de 45 s de la review One Piece. Les chemins de polices de `brand.json` sont relatifs à
  `brand.json` (`assets/...`).

- Le premier lancement de la transcription est long (chargement du modèle). Lance-le en tâche de fond.
- La transcription mot à mot se décale jusqu'à 3 secondes sur une longue source : resynchronise sur chaque extrait
  avant de caler un élément sur la voix (étape 3 de « Build a video »).
- La voix du client reste dans la vidéo : on ne cite pas un tiers qui parle sans qu'il soit identifié sur l'image.
- Si l'exécution d'un script du skill est refusée par la session, dis-le au client et propose-lui d'ajouter une règle
  de permission pour `python3 .claude/skills/brand-video-studio/scripts/*`.
