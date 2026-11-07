# GenRank.fr : vidéo d'actu IA (OpenMausBot)

Vidéo verticale 1080x1920 d'environ 60 secondes pour TikTok, Reels et Shorts : voix off HeyGen « Lucian », musique
synthétisée libre de droits, bruitages, sous-titres animés. Habillage GenRank.fr (bleu nuit et cyan), logo animé au début
et à la fin, barre GenRank en haut, étiquettes numérotées (1/9 … 9/9) et fenêtres qui montrent la démo du projet.

Sources fournies par le client, dans `assets/src/` : `source.mp4` (démo OpenMausBot), `readme.jpg` (page GitHub),
`app.jpg` (capture de l'appli) et `logo-source.webp` (logo GenRank).

## Faire une nouvelle vidéo d'actu IA

1. Copier ce dossier, vider `audio/vo/`, `assets/clips/`, `renders/`, et remplacer les fichiers de `assets/src/`.
2. Écrire le script dans `tools/vo.json` : une phrase par plan. `cap` est le texte affiché, `tts` (facultatif) est le
   texte lu par la voix (« I A », « N P X », nombres en toutes lettres).
3. Décrire les plans dans `tools/plans.json` (un plan par `id` du script) :
   - `atout` : une étiquette (`label`), une fenêtre média et, si on veut, des pastilles (`chips`) qui apparaissent quand
     la voix dit le mot ;
   - média `video` : `extraits` [début, fin] en secondes et `box` [x, y, largeur, hauteur] de recadrage dans la source ;
   - média `image` : `steps` [x, y, largeur] successifs, l'image glisse et zoome d'une étape à l'autre ;
   - `terminal` : une commande tapée lettre par lettre ; `hook`, `titre` et `cta` : plans de début et de fin.
4. Lancer, depuis le dossier du projet (`PY` = un Python avec numpy, soundfile et pillow) :

```bash
OPENROUTER_API_KEY=proxy-injected bash ../../outils/voix_lucian.sh
```

```bash
python3 tools/logo.py && python3 tools/build.py && python3 tools/clips.py
```

```bash
$PY -I tools/music.py && $PY -I tools/make_audio.py
```

```bash
npx --yes hyperframes@0.9.8 lint && npx --yes hyperframes@0.9.8 render -o renders/<nom>.mp4
```

Pour changer une seule phrase : `bash ../../outils/voix_lucian.sh --force <id>`, puis relancer à partir de `build.py`.

## À vérifier avant de publier

- Les affirmations du script viennent de la page GitHub, de la démo vidéo et du texte du client. La commande
  `npx openmausbot` et les connecteurs Gmail, GitHub et Notion sont repris du texte du client : à confirmer sur le dépôt.
- Le projet se dit indépendant et non affilié à xAI, Meta, OpenAI ou Manus : la vidéo le dit aussi.
- Les images de la démo et de la page GitHub appartiennent au projet OpenMausBot : citer le projet en description.
