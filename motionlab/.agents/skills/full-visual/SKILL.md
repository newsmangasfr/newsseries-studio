---
name: full-visual
description: "Fais une vidéo explicative animée plein écran sur n’importe quel sujet : d’abord le script (documenté, avec trois ou quatre phrases d’accroche au choix), puis toute la vidéo d’un coup : voix off, sous-titres mot à mot avec un mot clé encadré par ligne, la vraie chose dont parle chaque phrase redessinée avec soin et qui bouge sur son mot, cinq accroches visuelles, rendus. Sans présentateur, zéro coupe, 1080x1920 à 60 fps, dans la langue du client (français par défaut). À utiliser pour '/full-visual' suivi de ce qu’il veut, « fais une full visual sur X », « fais la vidéo à partir de transcript.md », ou pour modifier ou refaire le rendu d’une vidéo dans engine/full-visual/reels/. PAS pour le montage talking-head, PAS pour des slides fixes. Aussi : 'make a full visual about X', 'make the video from transcript.md', 're-render a reel'."
---

# Full Visual

Une voix explique ; l’écran est l’explication. Des sous-titres disent chaque mot au moment où il est prononcé, et
dessous, la vraie chose dont parle la phrase est dessinée avec soin et change sur le mot qui la change. Quelqu’un
sans le son suit tout le raisonnement. Quelqu’un qui l’a vue une fois peut l’expliquer à un ami.

## Comment une vidéo se fait

Deux moments, et une seule validation entre les deux.

La vidéo se fait dans la langue du client : `"language"` (code ISO) dans le `reel.json` de chaque vidéo et dans le
profil Full Visual enregistré, `"fr"` par défaut. Script, voix off, sous-titres et légende suivent cette langue.

1. **Le script.** Le créateur dit ce qu’il veut, sur n’importe quel sujet, avec ses mots (« /full-visual pourquoi
   l’écran de ton téléphone ignore un stylet »). S’il n’apporte qu’un sujet et que son profil ne dit pas déjà qui écrit
   (`resolved.words.script_source`), propose une fois, en une ligne : l’écrire lui-même avec ton aide (`mon-script`,
   conseillé : ce sont ses idées et sa façon de parler qui font qu’on le suit) ou un premier jet de ta part qu’il
   retouche. Enregistre sa réponse dans le profil pour ne plus la redemander. Documente-toi (`references/research.md`), puis écris le script avec
   le skill `full-visual-script` : trois ou quatre phrases d’accroche en haut avec ton choix, puis les mots prononcés.
   Montre-le. Le créateur choisit une accroche et retouche les mots. **C’est la seule validation.** Un script que le
   créateur apporte est vrai et gardé mot pour mot.
2. **La vidéo, en entier d’un coup.** Une fois les mots validés, plus rien n’attend personne : voix off, sous-titres,
   le plan visuel et son critique, chaque scène et cinq accroches visuelles construites en parallèle, chaque scène
   avec son propre relecteur, puis vérifications et rendus. Les étapes sont dans `references/workflow.md`. Dans Claude
   Code, lance le workflow enregistré
   (`Workflow({ name: "full-visual-reel", args: { slug, keyword, date, project } })`) ; tout autre agent suit la même
   page avec ses propres sous-agents, ou une étape après l’autre s’il n’en a pas.

Ne construis jamais un premier passage pour attendre, ne demande jamais de valider le plan, ne t’arrête jamais après
l’accroche. Ce que le créateur voit ensuite, c’est une vidéo finie avec cinq accroches.

Quand le prompt nomme un projet dans `workspace/projects/`, lis d’abord `references/workspace.md` et suis-le.

## À lire avant de commencer

Lire, c’est le travail, pas une formalité : ces pages et les vidéos vers lesquelles elles pointent sont ce qui rend
le résultat bon.

- `references/taste.md` : le niveau attendu, dans les mots du créateur qui a construit ce format. Tout le monde le lit.
- `references/examples.md` : quatre vidéos finies dans `examples/`. Ouvre celle la plus proche du sujet : son
  `script.txt`, son `plan.md`, ses `stills/` et le code de deux de ses scènes.
- La page de ton rôle : les mots, `full-visual-script` ; la voix off, `references/voice.md` ; une scène ou une
  accroche, `references/builder.md` et les effets prêts de `references/effets.md` ; le moteur et ses commandes, `references/engine.md`.
- Le style choisi (`styles/<id>/style.json`, recopié dans `resolved.theme` par le skill `style`).
- Les choix enregistrés du créateur, quand ils existent : `workspace/library/full-visual.preferences.md` et
  `workspace/library/full-visual/profile.json` (écrits par `/full-visual-customization`). Ils habillent le format :
  le look des sous-titres, le fond, la voix, les mots, la langue. Ils ne changent jamais sa méthode.

## Ce qui ne change jamais

1. Pas de présentateur, pas de personnage, pas de musique. La voix est la seule horloge.
2. Trois bandes sur un même axe central : sous-titres y 300-500, scène y 520-1450, les 220 derniers px laissés à
   Instagram.
3. Les sous-titres affichent un mot par mot prononcé, et un mot pas encore dit n’existe pas. Un mot clé par bloc,
   encadré.
4. Une scène passe la main seulement dans un silence entre deux phrases, en un seul mouvement, et le fond n’est
   jamais nu.
5. Que des choses réelles : redessinées d’après de vraies photos et de vrais écrans, à leur vraie géométrie et avec
   leur vrai texte, ou de vraies images vidéo quand la chose est une vidéo (gameplay, un lancement). Jamais une
   métaphore là où une chose réelle existe, jamais une icône de banque d’images.
6. Un nombre n’est jamais statique : il compte, défile ou se remplit, et tombe sur son mot.
7. Un changement d’état arrive à l’objet déjà à l’écran. Il change de couleur, s’ouvre, casse, grandit. Il n’est
   pas remplacé.

Ce qu’une vidéo peut changer vit dans `src/theme.ts` et dans son `reel.json` : polices, fonds, le surligneur, les
couleurs par rôle, le verbe de transition, l’habillage fixe, la langue.

## Où sont les choses

Le moteur est `engine/full-visual/` ; chaque commande se lance depuis là (`references/engine.md`). Une vidéo est un
dossier, `reels/<slug>/`, et s’enregistre toute seule. Ses cinq variantes d’accroche sont `reels/<slug>-h1` .. `-h5`,
chacune partageant la voix off et les scènes du corps et ne changeant que l’accroche. Les rendus arrivent dans
`output/` ; les vidéos finies vont dans `workspace/output/<dossier du projet>/` quand la vidéo appartient à un projet
de l’espace de travail.

## Après la première version

La première version n’est pas toujours la bonne. Le créateur dit ce qu’il veut avec des mots simples, comme il le
dirait à un monteur : « l’accroche trois, plus réelle », « la scène à quarante secondes, plus de détails, plus de
mouvement », « sois plus créatif », « plus illustratif ». Pour chaque remarque :

1. Trouve ce qu’elle vise : une variante d’accroche, un moment (les secondes renvoient à une scène via `words.json`),
   ou toute la vidéo.
2. Rouvre seulement cette scène ou cette accroche, avec `references/builder.md` et la remarque : regarde à nouveau la
   vraie chose, cherche plus de références, puis fais la passe plus riche, en allant plus loin que ce que la remarque
   demande. Tout le reste reste intact.
3. Un relecteur au regard neuf la vérifie face à la remarque et à `taste.md`.
4. Refais le rendu seulement des vidéos qui la contiennent, lance les vérifications, et livre-les à la place des
   anciennes.

Une remarque sur une vidéo reste dans cette vidéo. Une remarque qui vaudrait pour toutes les vidéos (« toujours plus
de mouvement ») est aussi enregistrée dans `workspace/library/full-visual.preferences.md`.

Le son se demande une seule fois, après que le créateur a vu l’image : avec son ou sans.
Avec son : les bruitages viennent du pack `sfx/` à la racine (un dossier par usage, voir `sfx/README.md`), ou des fichiers du créateur s’il en donne. Dosage : partie 10 de GUIDE.pdf (whoosh sur les 3 ou 4 plus grands mouvements seulement, sons d’interface très bas ailleurs, un seul scintillement par vidéo, chaque pic calé sur son image).
