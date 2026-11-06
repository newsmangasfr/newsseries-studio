# La vidéo, d’un seul coup

D’un script validé à cinq rendus finis, sans arrêt entre les deux. Dans Claude Code, cette page est le workflow
enregistré `full-visual-reel` (`.claude/workflows/full-visual-reel.js`) ; tout autre agent fait lui-même les mêmes
étapes, en lançant un sous-agent par rôle quand il le peut.

Entrées : le `slug` de la vidéo, le script validé (`reels/<slug>/script.txt`, ou le `transcript.md` du projet), le mot
clé de commentaire quand la fin en demande un, et le dossier du projet de l’espace de travail quand il y en a un.

Chaque agent lit `SKILL.md`, `taste.md` et l’exemple le plus proche dans `examples.md` avant sa propre page.

La vidéo entière se fait dans la langue de son `reel.json` (`"language"`, `"fr"` par défaut) : voix off, sous-titres,
légende.

## 1. Des mots au son (un agent)

1. `reels/<slug>/script.txt` est le script, mot pour mot. Il est validé : ne le réécris jamais.
2. La voix off, en une seule prise (`voice.md`).
3. `caption.txt` : scènes découpées par groupes de phrases, le premier id de scène est `hook` et ne contient que la
   phrase d’accroche (`engine.md`). `align.py`, puis `check.py plan` jusqu’à ce qu’il sorte avec 0.
4. `caption-post.txt`, la légende du post : l’accroche, puis ce que le spectateur apprend, puis la demande.

## 2. Le plan, puis son critique (deux agents)

**Plan.** `reels/<slug>/plan.md`. Une fois pour la vidéo : l’idée fausse du spectateur, le monde unique et ses
échelles, l’objet fil rouge, la seule couleur de l’invisible, les fonds. Puis par scène : ses mots, la vraie chose,
d’où viennent ses images, et `mot -> ce qui change`. L’accroche a droit à une ligne (« cinq variantes, construites
séparément »). Récupère maintenant les vraies références de chaque scène dans `reels/<slug>/assets/refs/` : photos,
démontages, coupes, écrans, logos, documents, images vidéo. Sois ultra créatif et ultra illustratif : le spectateur
doit ressortir en comprenant le mécanisme au niveau d’un expert.

**Critique (Critic)** (un agent neuf). Lis le plan face à `taste.md`, phrase par phrase. Traque : une image principale
qui en répète une précédente, une métaphore là où une chose réelle existe, une idée racontée au lieu d’être montrée en
marche, plus d’un point d’attention, une cause que les mots donnent et que l’image ne montre pas, dix premières
secondes trop minces, une scène avec trop peu de références. Réécris le plan sur place, puis liste les scènes du
corps avec un nom de composant chacune.

## 3. Squelette (un agent)

Un stub par scène et `HookX1` .. `HookX5`, `scenes/index.tsx` qui associe chaque id de scène (`hook` à `HookX1`), et
les cinq vidéos variantes `reels/<slug>-h1` .. `-h5` (même voix off, mêmes sous-titres, mêmes mots et même
`reel.json`, donc même `"language"` ; chaque index reprend les scènes de base et remplace l’accroche, `engine.md`).
La vérification des types passe et une image fixe sort au rendu.

## 4. Construire, tout en même temps

Toutes les scènes du corps et les cinq accroches démarrent ensemble.

- **Chaque scène du corps :** un constructeur (`builder.md`, sections 1 à 5), puis un relecteur au regard neuf
  (`builder.md`, « Relecture »). Quand le relecteur renvoie des remarques, un correcteur reprend le brief du
  constructeur plus les remarques et les applique.
- **Les accroches :** un agent invente cinq concepts d’accroche pour cette histoire, cinq grands mouvements vraiment
  différents sur son vrai matériel, chacun tombant sur le mot clé de l’accroche (`builder.md`, « L’accroche »). Puis
  cinq constructeurs, un par concept.

Plusieurs constructeurs partagent une seule machine sans risque grâce à la file de rendu et au verrou de la
vérification des types (`engine.md`), pas en construisant moins à la fois. Un agent sans sous-agents construit les
scènes l’une après l’autre, avec les mêmes étapes.

## 5. Livrer, Deliver (un agent)

1. La vérification des types passe.
2. Fais le rendu de `<slug>-h1` .. `-h5` l’un après l’autre, lance `check.py render` sur chacun, corrige ce qui échoue
   dans la scène qui en est responsable, refais le rendu. Regarde chaque transition accroche-corps en rafale à
   1/60 s.
3. Choisis l’accroche la plus forte face à `taste.md` et dis pourquoi en une ligne.
4. Livre : avec un projet de l’espace de travail, `workspace.md` ; sinon affiche les cinq chemins complets dans
   `output/`.

Pas de son : on le demande une seule fois au créateur, après qu’il a vu l’image.
