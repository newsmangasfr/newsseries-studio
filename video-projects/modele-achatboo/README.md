# Modèle AchatBoo : vidéo de présentation produit

Vidéo verticale 1080x1920 (TikTok, Reels, Shorts, statut WhatsApp) d'environ 40 secondes, avec la voix off HeyGen
« Lucian », de la musique libre de droits, des bruitages et des sous-titres animés.

**Déroulé :** logo AchatBoo animé → accroche → nom du produit → atouts cochés (1/5, 2/5…) → sticker prix → appel à
l'action (achatboo.com, Ghollamallah) → logo de fin. Le logo et le pied de page restent à l'écran du début à la fin.

## Faire la vidéo d'un nouveau produit

1. Copier ce dossier : `cp -r video-projects/modele-achatboo video-projects/<produit>`, puis supprimer `audio/vo/*.wav`,
   `assets/clips/*` et `renders/*`.
2. Mettre la vidéo du produit dans `assets/src/source.mp4`. Elle peut être carrée, horizontale ou verticale.
3. Écrire le script dans `tools/vo.json` : une phrase par plan. `cap` est le texte affiché. `tts` (facultatif) est le
   texte lu par la voix : on y écrit « Achat Bou point com », les nombres en toutes lettres, etc.
4. Remplir `tools/produit.json` :
   - `produit` : nom (une ligne par entrée), sous-titre, badge, prix, devise, ancien prix (barré s'il est rempli) ;
   - `plans` : pour chaque `id` du script, son `type` (`hook`, `titre`, `atout`, `prix`, `cta`), les
     `extraits` [début, fin] en secondes dans la vidéo source, le `cadre` (`carre` ou `plein`) et le `label` des atouts ;
   - `mots_cles` : les mots surlignés en orange dans les sous-titres.
5. Lancer, depuis le dossier du projet :

```bash
OPENROUTER_API_KEY=proxy-injected bash ../../outils/voix_lucian.sh
```

```bash
python3 tools/build.py && python3 tools/clips.py
```

```bash
../../outils/.venv/bin/python -I tools/music.py && ../../outils/.venv/bin/python -I tools/make_audio.py
```

```bash
npx --yes hyperframes@0.9.8 lint
```

```bash
npx --yes hyperframes@0.9.8 render -o renders/<produit>.mp4
```

Pour changer une seule phrase : `bash ../../outils/voix_lucian.sh --force <id>`, puis relancer à partir de `build.py`.

Couleurs de la marque : `couleurs` dans `produit.json`. Logo : remplacer `assets/src/logo-source.webp`, puis
`python3 tools/logo.py`.

Ne pas utiliser de vidéos ou de musiques dont on n'a pas les droits : filmer le produit soi-même ou utiliser les
vidéos fournies par le fournisseur pour la revente.
