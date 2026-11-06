# full-visual

Des reels explicatifs animés plein écran, le format de référence : pas de présentateur, une voix off, des sous-titres
mot à mot en haut, et dessous la vraie chose dont parle chaque phrase, redessinée et qui bouge sur le mot. Zéro coupe.
1080x1920, 60 fps. Les vidéos sont dans la langue du client, le français par défaut.

Comment en faire un, et pourquoi chaque règle existe : `.agents/skills/full-visual/` (le skill est le manuel). D’où
viennent les règles : l’étude de référence.

## L’idée

Un seul fichier texte par reel, `caption.txt`, contient le script, les sous-titres, les mots clés, les emoji, les scènes
et les fonds. `scripts/align.py` le cale sur la voix off. Le moteur (`src/engine/`, environ 600 lignes) contient ce qui
ne change jamais. Les scènes s’écrivent pour chaque reel avec un petit kit de verbes, et chaque mouvement est lié à un
mot prononcé par `cue("word")`, jamais à un temps tapé à la main. Deux scripts refusent les défauts mesurés sur les références.

```
script.txt ──voice.py──▶ voice.mp3 + voice.alignment.json
caption.txt + voice.mp3 ──align.py──▶ words.json ──┐
reel.json (theme overrides, pinned chrome) ────────┼──▶ render.mjs ──▶ output/YYYY-MM-DD/NN-slug.mp4
scenes/*.tsx (what this reel draws) ───────────────┘
```

## Organisation

```
full-visual/
  render.mjs                 images fixes, repères, un extrait ou le reel entier (sandbox désactivée)
  scripts/voice.py           script.txt -> voice.mp3 + voice.alignment.json (ElevenLabs avec horodatage ; voix dans reel.json)
  scripts/align.py           caption.txt + voix -> words.json (exact quand voice.alignment.json existe)
  scripts/check.py           plan : sous-titres, mots clés, passages de relais dans le silence, taille minimale. render : temps morts, fond nu
  src/theme.ts               tout ce qu’un reel peut changer : polices, fonds, marqueur, rôles, scène, passage de relais
  src/engine/                la grammaire fixe : timeline, Ground, Caption, Stage (passage de relais), Chrome (pill, terminal),
                             moves + Motion (le kit), context (useScene : f, cue, cueEnd, endsOn)
  reels/index.ts             généré : trouve tout seul chaque reels/<slug>/scenes/index.tsx
  reels/<slug>/              voice.*, caption.txt, reel.json, words.json (généré), plan.md, scenes/, assets/, stills/
  output/YYYY-MM-DD/         NN-slug.mp4, copié une fois final dans workspace/output/<dossier du projet>/<slug>.mp4
```

Les paquets sont ceux du dossier MotionLab lui-même (`npm ci` à sa racine) ; Remotion récupère son propre navigateur.

## Commandes

```bash
node ../../scripts/py.mjs scripts/voice.py <slug> --audition id:label,id:label   # les deux premières phrases par voix -> reels/<slug>/voices/
node ../../scripts/py.mjs scripts/voice.py <slug>                                  # la prise entière, une requête, dernière ligne vérifiée
node ../../scripts/py.mjs scripts/align.py <slug>
node ../../scripts/py.mjs scripts/check.py plan <slug>
node render.mjs <slug> --stills 1.2,3.45,9        # reels/<slug>/stills/t_001.20.png
node render.mjs <slug> --guides --stills 9        # bandes et zones d’Instagram dessinées par-dessus
node render.mjs <slug> [--from s --to s] [--out path]
node ../../scripts/py.mjs scripts/check.py render <slug> <mp4>
node ../../node_modules/typescript/bin/tsc --noEmit -p .
```

## caption.txt

```
== signup | ground: light          id de scène (clé dans scenes/index.tsx) et fond ; elle commence dans le silence qui la précède
It starts with your / signup *form,*   une ligne = un bloc de sous-titres ; *mot clé* ; " / " = retour à la ligne voulu
which has no / 🎂 *age* question,      un emoji juste avant un mot se place en ligne devant lui
@bottom                            sous-titres sous la scène à partir du bloc suivant (@top pour revenir)
```

## reel.json

```json
{ "chrome": { "type": "pill", "label": "the prompt · at the end", "from": "scene:signup", "to": 58.1 },
  "theme": { "font": { "caption": "Figtree, sans-serif" }, "marker": { "style": "select", "color": "#2E7AEA" }, "handover": "rise" } }
```

`from` / `to` / le `at` d’une ligne de terminal prennent des secondes, un mot prononcé (`"prompt"`, `"it#2"` pour le
deuxième) ou `"scene:<id>"`. Types de chrome : `pill`, `terminal` (`title`, `squares`, `lines: [{at, text, tone, square}]`), `none`.
Une nouvelle police : charge-la dans `src/fonts.ts`, nomme-la dans `theme.font`.

## Exemples commentés

Les quatre grands exemples (`touchscreen`, `iphone-keyboard`, `ps5-on-pc`, `pewdiepie-abliteration`) sont à lire dans
`.agents/skills/full-visual/examples/` : script, plan, images fixes et le code de deux scènes. Ils ne se rendent pas
ici. Lis le plus proche avant d’écrire une scène.

`reels/exemple-essai/` est une courte vidéo française complète, qui se rend : elle sert à l’essai de look et aux
aperçus des styles (`node render.mjs exemple-essai --from 0 --to 9`). Sa voix est une voix de synthèse provisoire et
ses scènes sont volontairement simples : ce n’est pas le niveau visé, c’est un banc d’essai.
