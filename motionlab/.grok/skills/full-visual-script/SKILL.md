---
name: full-visual-script
description: "Écrire le script d’une vidéo explicative Full Visual sur n’importe quel sujet, avant toute fabrication : trois ou quatre phrases d’accroche au choix (chacune faite pour arrêter le scroll), ton choix et pourquoi, puis les mots dits : la réponse donnée tôt, une scène vécue, le mécanisme expliqué en profondeur mais très simplement, une deuxième couche, une fin qui fait écho à la première phrase, et quelque chose à enregistrer ou envoyer. Écrit dans la langue de la vidéo, français par défaut. Nettoie aussi, mot pour mot, un script apporté par le créateur. À utiliser pour '/full-visual-script', « écris le script », « donne-moi des accroches », une réécriture, ou la première moitié de '/full-visual' sur un sujet. PAS la fabrication (voix off, sous-titres, scènes, rendu : le skill full-visual). Aussi : 'write the transcript', 'give me hooks'."
---

# Le script

Le script, c’est la vidéo. Il s’écrit en premier, avant le moindre pixel, et c’est la seule chose que le créateur
approuve. On enregistre et on envoie ce qui nous a appris quelque chose de vrai : chaque vidéo laisse donc le
spectateur comprendre une chose qu’il utilise ou une histoire qu’il a entendue, assez à fond pour l’expliquer à un ami.

Il s’écrit dans la langue de la vidéo : `"language"` dans `reel.json`, repris du profil, français (`fr`) par défaut.

Lis les quatre scripts finis avant d’écrire : `.agents/skills/full-visual/examples/{touchscreen,iphone-keyboard,ps5-on-pc,pewdiepie-abliteration}/script.txt`,
le plus proche du sujet en premier. Ils sont en anglais : copie leur raisonnement, jamais leurs mots, et ne traduis
pas leurs phrases. Puis `references/hooks.md` et `references/shapes.md`.

## 1. Les mots du créateur d’abord

Quand le créateur apporte un script, il est vrai et c’est lui qui fait la structure : garde son accroche et son ordre,
rends-le fluide et clair, ne le remplace jamais par un modèle, ne coupe jamais ses explications pour tenir une durée.
Signale seulement les faits qui semblent faux. Garde sa langue. Quand il n’apporte qu’un sujet, fais la recherche
(`full-visual/references/research.md`) et écris.

## 2. Trouver la fausse image

Avant la moindre ligne, dis la fausse image du spectateur en cinq ou six mots : « l’écran sent que j’appuie », « les
touches font la taille affichée », « un émulateur fait juste tourner le jeu ». Le script existe pour la casser. Quand
un sujet n’a pas de fausse image, trouve la question que tout le monde a entendue et à laquelle personne ne sait
répondre (« Comment PewDiePie a fait une IA sans censure ? »).

## 3. Trois ou quatre accroches

L’accroche décide si quelqu’un entend la suite. Écris-en trois ou quatre vraiment différentes, chacune la première ou
les deux premières phrases exactement comme elles seront dites, puis choisis-en une et dis pourquoi en une ligne.
`references/hooks.md` réunit les types qui ont marché et nos vraies phrases.

- La chose est nommée dans les premiers mots (trois en anglais, trois ou quatre en français avec l’article ou le
  possessif : « L’écran de ton téléphone... »), avec les mots simples que les gens utilisent déjà.
- Elle arrête le scroll : quelque chose qui semble impossible, une croyance retournée, une nouvelle assez grosse pour
  qu’on s’arrête, ou une question que les gens se posent déjà. Une contradiction marche souvent ; ce n’est pas la seule
  façon.
- Une idée, jamais deux. Absolu et concret plutôt que mou et vague. Vrai, chaque mot.
- Elle se dessine : l’image de l’accroche est décodée mot à mot plus tard, donc chaque nom doit être une vraie chose.
- Elle s’écrit directement en français. Un jeu de mots ou une tournure anglaise qui ne passe pas se remplace par une
  tournure française qui fait le même effet, jamais par une traduction mot à mot.

## 4. Le corps

Choisis la forme que le sujet demande (`references/shapes.md`). Quelle que soit la forme :

- **Donne la réponse tôt**, vers la 8e à 10e seconde : « en fait, ce n’est pas X, c’est Y ». La nouvelle expression
  étrange devient la question suivante, donc rien n’est perdu.
- **Une scène vécue** porte le mécanisme : « Imagine : c’est l’hiver et tu essaies de décrocher avec tes gants. » Elle
  revient, pour que le spectateur ne perde jamais où il en est.
- **Va au fond, reste simple.** Les vrais termes, chacun ancré à partir de zéro la première fois avec quelque chose de
  familier. Un événement physique par phrase, chacun causé par le précédent. Le pourquoi avant le comment. Chaque mise
  en place payée.
- **Une seule image tenue jusqu’au bout.** Pose chaque nouvelle idée sur la même image (la grille, la carte). Changer
  de métaphore à chaque phrase perd les gens.
- **Une deuxième couche** : « Mais ton gant ne conduit rien du tout », le cas où ça échoue ou l’astuce en plus, qui
  prouve le mécanisme. Puis « C’est aussi pour ça que... » le paie dans la vie du spectateur.
- **La fin fait écho à la première phrase**, résolue : « Donc ton écran n’a jamais senti ton doigt. »
- **Quelque chose à enregistrer ou envoyer**, tissé dedans : une vérification qu’il peut faire, un réglage, un outil,
  une solution, ou la compréhension elle-même. La demande nomme à qui l’envoyer : « envoie ça à quelqu’un dont le
  téléphone ne marche jamais avec les mains mouillées. » Elle demande le partage avant l’abonnement, ou
  `commente « MOT »` quand il y a une vraie chose à envoyer. Le mot-clé s’écrit en capitales, sans accent.

## 5. Parlé, pas écrit

Ça sonne comme quelqu’un qui parle à un ami. Des phrases entières qui coulent avec des virgules, « tu » et « ton »
souvent. Le français qu’on dit, pas celui qu’on écrit : « on » plutôt que « nous », « Comment c’est possible ? » plutôt
que « Comment est-ce possible ? ». Le liant est bon quand il donne voix à la question du spectateur (« Mais alors,
comment c’est possible ? ») ou porte un fait ; il est mauvais quand il ne fait qu’annoncer (« alors voilà le truc »).
Pas de « première étape, deuxième étape », pas de fragments pour le rythme, pas de tirets cadratins.

Environ 280 mots en 18 à 20 phrases donnent 80 à 85 s au rythme maison (3,3 à 3,5 mots par seconde) ; une histoire qui
en demande plus en a plus. En français, la même idée prend 10 à 15 % de mots en plus : garde la durée comme cible,
resserre plutôt que d’allonger, et vérifie-la sur la prise de voix plutôt que sur le compte de mots. La clarté passe
avant le compte.

## 6. Les faits

Chaque affirmation est une ligne dans `facts.md` (l’affirmation, une citation mot pour mot, l’URL, vérifiée
aujourd’hui). Les sources peuvent être dans n’importe quelle langue ; la citation reste dans la langue de la source.
Garde les mots de portée (« jusqu’à », « sur les iPhone compatibles »). N’invente jamais un chiffre, un outil ou une
capacité ; coupe ce qui ne peut pas être confirmé et dis-le.

## Ce que tu rends

Montre-le en entier dans le chat, dans cet ordre : la fausse image, les accroches avec ton choix et pourquoi, le
script, puis une ligne qui dit ce que le spectateur enregistre ou envoie. Enregistre-le dans le dossier du projet
quand il y en a un (`hooks.md`, `transcript.md`, `facts.md`, selon `full-visual/references/workspace.md`), sinon dans
`engine/full-visual/reels/<slug>/script.txt` à côté de `facts.md`. Le créateur choisit une accroche et retouche les
mots ; une fois qu’il approuve, le skill full-visual fait toute la vidéo sans autre arrêt.

## Avant de le montrer, lis-le comme un spectateur

1. Quelqu’un qui n’a jamais pensé à ça s’arrêterait-il sur la première phrase ?
2. Après la vidéo, pourrait-il expliquer le mécanisme à un ami ?
3. Y a-t-il un mot où il penserait « attends, c’est quoi ça ? » Ancre-le.
4. Qu’est-ce qu’il enregistre ou envoie, et à qui ?
5. Lis-le à voix haute : chaque phrase découle-t-elle de la précédente ?
