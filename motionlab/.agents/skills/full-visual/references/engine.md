# Le moteur

`engine/full-visual/`. Chaque commande ci-dessous se lance depuis là. Python passe par le lanceur du dossier, donc
pas besoin de `python3` dans le PATH.

```bash
node ../../scripts/py.mjs scripts/voice.py <slug>          # script.v3.txt -> voice.mp3 + voice.alignment.json, une seule prise entière
node ../../scripts/py.mjs scripts/tighten.py <slug> --cap 0.2 --keep "<débuts de paragraphe>:0.30,..."
node ../../scripts/py.mjs scripts/align.py <slug>          # caption.txt + voix off -> words.json
node ../../scripts/py.mjs scripts/check.py plan <slug>     # avant tout pixel : sous-titres, mots clés, rythme, transitions dans un silence
node render.mjs <slug> --stills 1.2,3.45,9                 # reels/<slug>/stills/, en secondes ; toutes les images fixes nécessaires en un seul appel
node render.mjs <slug> --guides --stills 9                 # les bandes et les zones d’Instagram dessinées par-dessus
node render.mjs <slug> [--from s --to s] [--out path]      # output/YYYY-MM-DD/NN-<slug>.mp4
node render.mjs <slug> --gl angle ...                      # une scène qui utilise WebGL (three.js)
node render.mjs <slug> --full-public ...                   # une vidéo dont les scènes chargent le dossier public/ d’une autre vidéo
node ../../scripts/py.mjs scripts/check.py render <slug> <mp4>   # images figées trop longues, fond nu dans une transition
node ../../node_modules/typescript/bin/tsc --noEmit -p .   # les types, avant tout rendu
```

## Une vidéo

```
reels/<slug>/
  script.txt          les mots prononcés, en texte brut
  script.v3.txt       les mêmes mots avec les balises de voix, nombres écrits en lettres (voice.md)
  voice.mp3 + voice.alignment.json
  caption.txt         le script découpé en blocs de sous-titres et en scènes (ci-dessous)
  words.json          généré par align.py
  reel.json           la voix, la langue ("language", code ISO, "fr" par défaut), les surcharges du thème, l’habillage fixe
  facts.md            chaque affirmation : affirmation | preuve | URL, vérifiée le jour où elle a été écrite
  plan.md             le plan visuel
  assets/refs/        les vraies photos, écrans et images vidéo d’après lesquels les scènes sont dessinées
  notes/              l’observation et la réflexion de chaque constructeur (builder.md)
  scenes/index.tsx    id de scène -> composant ; scenes/*.tsx un fichier par scène, helpers préfixés par son nom
public/<slug>/        ce que les scènes chargent avec staticFile("<slug>/<file>")
```

Le `"language"` de `reel.json` est la langue de la vidéo : la voix off la parle, `align.py` la transcrit dans cette
langue, les sous-titres et la légende sont écrits dedans. Sans ce champ, c’est `"fr"`.

Une vidéo s’enregistre toute seule : `reels/index.ts` trouve chaque `reels/<slug>/scenes/index.tsx`. Une variante
d’accroche `reels/<slug>-hN` contient les mêmes `caption.txt`, `words.json`, `reel.json` et voix off, et un
`scenes/index.tsx` qui reprend la table de base et remplace l’accroche :

```tsx
import type { SceneMap } from "../../../src/engine/Stage";
import { scenes as base } from "../../<slug>/scenes";
import { HookX2 } from "../../<slug>/scenes/HookX2";

export const scenes: SceneMap = { ...base, hook: HookX2 };
```

## caption.txt

```
== hook | ground: dark                 une scène : son id (la clé dans scenes/index.tsx) et son fond, dark ou light
L’écran de ton téléphone / réagit au   une ligne = un bloc de sous-titres, " / " coupe la ligne affichée
plus léger *effleurement* de ton doigt *mot* = le mot clé, encadré
== answer | ground: dark
💬 Alors, qu’est-ce qu’il *sent* vraiment?    un emoji juste avant un mot se place en ligne devant lui
@bottom                                le sous-titre passe sous la scène à partir du bloc suivant (@top pour revenir)
```

- Un bloc est une respiration de 2 à 7 mots, jamais plus de deux lignes. Il finit en fin de proposition, ou juste
  avant le mot que l’image va montrer, pour que ce mot ouvre une nouvelle ligne.
- Un mot clé par bloc au plus : les nombres, les noms, le verbe qui porte l’idée. Lus seuls, de haut en bas, les mots
  clés sont le raisonnement. Après une élision, les étoiles prennent tout le mot : `*l’écran*` (`l’*écran*` est
  accepté et corrigé par `align.py`).
- En français, les lignes sont plus longues : une ligne affichée tient en 22 à 24 caractères environ à la taille
  maison (moins avec une police large comme Poppins ou Kode Mono). Un bloc trop large pour deux lignes ne se voit
  qu’au rendu (« caption block N needs 3 lines ») : avant le rendu complet, fais les images fixes
  (`node render.mjs <slug> --stills <les secondes de chaque bloc long>`) et coupe ou raccourcis ce qui déborde.
- Une ponctuation isolée (« ? », « ! », « : », « ; », guillemets) est lue comme un emoji, car un mot sans lettre
  ni chiffre en est un : en français aussi, colle-la au mot, sans espace (`vraiment?`, `«Stop»`).
- Une scène commence là où commence une phrase. `check.py plan` refuse une limite avec moins de 0,15 s de silence.
- Lis chaque ligne « ! » qu’affiche `align.py` : chacune est un endroit où le spectateur lirait une chose et en
  entendrait une autre.

## Une scène

Un composant React qui lit `useScene()` : `f` (l’image courante), `cue("word")` (l’image où ce mot commence, dans
cette scène ; `"it#2"` pour la deuxième occurrence ; elle lève une erreur quand le mot n’est pas dans les
sous-titres), `cueEnd`, `endsOn("word", dur)` (où une construction de `dur` images doit commencer pour finir sur le
mot), `scene.from`, le fond et le thème. Le mot passé à `cue()` est écrit dans la langue de la vidéo, tel qu’il est
dans `caption.txt`. Le composant dessine à l’intérieur de `<Column>`. La scène suivante est montée 6 images plus tôt
(`LEAD`) : commence sa première entrée à `scene.from - LEAD`. Une scène avec `MyScene.keep = true` passe la main sur
place, la suivante démarrant sur la même image (la carte PewDiePie fait ça).

Le kit (`src/engine/moves.ts`, `Motion.tsx`), durées en images à 60 fps : `blurIn` (7 f, l’arrivée par défaut),
`pop` (8 f, léger dépassement), `<Travel>` (entrée en 12 f sur 260 px, flou le long du trajet), `blurOut`, `typeOn`
(36 ms par caractère), `countTo` avec `jitter` (chaque nombre), `stagger` (4, 6, 8 ou 12 f entre éléments voisins),
`mix` (changer de couleur sur place), `draw` (le long d’un tracé), `<Cursor>` (arcs adoucis, s’arrête avant un clic).
Le kit, ce sont des verbes : ce qu’une vidéo dessine est écrit pour cette vidéo.

## Synchro

- Un événement tombe sur son mot, à une image ou deux près : `at={cue("touch")}`.
- Une construction finit sur son mot : `at={endsOn("300", 17)}` lance une construction de 17 images pour qu’elle
  arrive au moment où « 300 » est dit.
- Un compteur finit avant sa phrase. Une couleur bascule sur l’image où la donnée franchit le seuil, pas sur un mot.
- Le cadre du mot clé suit son mot d’environ 5 images. Le moteur avance un peu le mot des sous-titres, pour qu’il soit
  net sur la syllabe.
- `check.py render` fait échouer une portion immobile de plus de 1,2 s et toute image de fond nu dans une transition.

## Matériel réel

- Récupère les vrais logos nus (sans tuile, sans rond blanc). Redessine les interfaces à leur vraie géométrie, avec
  leur vraie typo et leur vrai texte.
- Images vidéo : H.264, `-c:v libx264 -g 1 -crf 18 -preset slow -pix_fmt yuv420p`, sans son, dans `public/<slug>/`.
- Les personnes sont de vrais portraits ou des visages synthétiques réalistes avec un nom, les mêmes d’une scène à
  l’autre. Jamais des initiales.
- Un texte sous 32 px est une texture, pas une preuve. Moins de lignes, plus grandes.

## Profondeur et 3D

Le Canvas 2D porte la plupart des mondes : une caméra en unités réelles, une projection, une lumière, dessinées à
chaque image (`examples/pewdiepie-abliteration/code/map.ts`, `MapSpace.tsx`, `HookX2World.ts`). three.js est installé
(`@remotion/three`, `three`, `@react-three/fiber`) pour un objet réel tourné dans la lumière ; fais leur rendu avec
`--gl angle`.

## Plusieurs constructeurs à la fois (Many builders at once)

La machine est partagée par tous les constructeurs de la vidéo. Les rendus se mettent en file d’attente dans
`render.mjs` ; chaque appel de rendu empaquette le projet, donc demande toutes tes images fixes en un seul appel. Ne
lance jamais un rendu ou la vérification des types en arrière-plan. Passe la vérification des types chacun son tour :

```bash
until mkdir .tsc.lock 2>/dev/null; do sleep 4; done; node ../../node_modules/typescript/bin/tsc --noEmit -p .; rmdir .tsc.lock
```

Un `.tsc.lock` de plus de dix minutes appartient à un agent mort : supprime-le. Disque : les rendus et les images
fixes sont lourds ; supprime tes anciennes images fixes, et arrête-toi en le disant quand le disque a moins de 2 Go
libres.
