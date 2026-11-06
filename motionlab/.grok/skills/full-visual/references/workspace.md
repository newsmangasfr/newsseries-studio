# Travailler depuis l’espace de travail

L’appli de l’espace de travail fait une vidéo en trois étapes et donne au créateur un prompt pour chacune. Chaque
prompt nomme le dossier de projet de la vidéo. Suis cette page dès qu’un prompt nomme un projet dans
`workspace/projects/`.

## Une vidéo, un dossier

- Une vidéo est un dossier : `workspace/projects/<YYYY-MM-DD>-full-visual-<slug>/`, qui contient
  `project.json` : `{"format":"full-visual","title":"<le sujet>"}`.
- Le nom du dossier est le nom de la vidéo partout : dans `workspace/projects/` et dans `workspace/output/`.
- N’écris jamais dans `~/Downloads`.

## Étape 1 : Recherche

- Crée le dossier et `project.json` s’ils manquent.
- Documente-toi sur le sujet donné par le créateur (`research.md` dans les références de ce skill) : enregistre
  `research.md` et `facts.md` dans le dossier, chaque fait avec son lien, vérifié aujourd’hui.

## Étape 2 : Script (`/full-visual-script`)

- Lis `research.md` et `facts.md` dans le dossier.
- Enregistre les trois ou quatre options d’accroche avec ton choix dans `hooks.md`, et les mots prononcés, en
  commençant par l’accroche choisie, dans `transcript.md`. Seuls les mots prononcés vont dans `transcript.md` : pas
  de notes, pas de titres, pas de nombre de mots. Les deux s’écrivent dans la langue de la vidéo (celle du profil
  enregistré, français par défaut).
- Montre les deux dans le chat. Le créateur peut choisir une autre accroche ou retoucher les mots ; mets
  `transcript.md` à jour pour qu’il corresponde.
- Un script que le créateur a collé est enregistré mot pour mot dans `transcript.md`. Ne le réécris pas ; signale
  seulement les faits qui ont l’air faux.

## Étape 3 : Vidéo (`/full-visual`)

- Vérifie d’abord qu’il y a une voix : une clé `ELEVENLABS_API_KEY`, `OPENAI_API_KEY` ou `FISH_API_KEY` dans
  `.env.local` à la racine du dossier, ou sa propre voix enregistrée (`voice.mp3`, `.wav` ou `.m4a` dans le dossier du
  projet, copiée dans `reels/<slug>/` et minutée par `align.py`). S’il n’y a ni l’une ni l’autre, arrête-toi et dis au créateur d’en ajouter une sur la
  page de la vidéo dans l’espace de travail, puis de relancer l’étape.
- Crée la vidéo dans `engine/full-visual/reels/<slug>/` : copie `transcript.md` dans son `script.txt` mot pour mot,
  et le `facts.md` du projet à côté. Son `reel.json` porte `"language"` : la langue du profil enregistré, sinon
  `"fr"`.
- Fais toute la vidéo d’un coup (`workflow.md`). Dans Claude Code :
  `Workflow({ name: "full-visual-reel", args: { slug, keyword, date, project: "<le nom du dossier>" } })`.
- Livre dans `workspace/output/<le même nom de dossier>/` :
  - `<slug>-h1.mp4` .. `<slug>-h5.mp4`, les cinq accroches ;
  - `caption.txt`, la légende du post, écrite avec le skill `captions` et vérifiée par son `check-caption.mjs`
    (600 à 2 200 caractères par défaut) ;
  - `cover.jpg`, une image forte de la vidéo, pour la couverture ;
  - `<slug>.mp4`, une copie de l’accroche la plus forte, écrite en dernier, après que chaque vérification a passé.
    L’appli marque la vidéo comme faite quand ce fichier existe.
- Affiche les chemins complets.
