---
name: footage
description: "Interne. Comment un dossier de clips du client est compris une fois puis plus jamais rouvert : mesurer chaque clip, regarder neuf images de chacun, écrire quatre ou cinq phrases dessus, et à partir de là construire les reels en choisissant des ids. Appelé par tout format dont l’entrée est un dossier rempli par le client, et avant tout montage qui doit savoir ce que sont ses clips. Aussi : 'read my clips', 'understand my footage'."
---

# Footage

## Objectif

Un dossier se lit une fois. Chaque clip finit avec un id court, un jeu de chiffres mesurés sur l’image et quatre ou cinq phrases qui disent ce qu’il est, et chaque reel ensuite se construit en choisissant des ids. Le client filme pendant un après-midi ; la lecture se fait une fois ; les montages sont gratuits.

## Raisonnement

Comprendre les rushes est la partie chère de ce genre de reel, et c’est la partie qu’on repaie encore et encore. Un passage qui ouvre le dossier pour construire un montage passe l’essentiel de son temps à regarder des clips déjà regardés la semaine précédente. Pire, il ne tombe jamais deux fois d’accord avec lui-même, donc le deuxième montage repose sur une autre compréhension des trente mêmes fichiers, et aucune des deux lectures ne survit. Les deux problèmes ont un seul remède : écrire la lecture, la lier au hash du contenu du clip pour qu’un renommage ne puisse pas la perdre, et traiter le fichier comme la mémoire.

La lecture a deux moitiés parce qu’elles échouent différemment. La durée, la lumière, la couleur et le mouvement se mesurent, parce qu’aucun œil ne peut dire qu’un clip est à 0,11 du blanc total alors qu’un script le peut, et parce que ce sont les chiffres sur lesquels trie un sélecteur. Ce qu’EST un clip ne se mesure pas du tout : aucun seuil ne sait que le rectangle bleu est un terminal, que les mains sont celles du client, ou que c’est la même pièce que le mois dernier sous une autre lampe. Cette moitié se voit, sur une planche de neuf images, et s’écrit en phrases simples. Une note doit être assez précise pour n’avoir pu être écrite sur aucun autre clip du dossier, parce qu’une note qui va à tout ne trie rien.

La dernière chose que fait la lecture, c’est refuser qu’on lui fasse confiance aveuglément. Deux fichiers exportés deux fois à partir d’une même prise ont des hashs différents et sont deux clips pour tout ce qui est en amont, mais c’est une seule image, et une coupe entre eux se lit comme pas de coupe du tout. La lecture le dit, et le sélecteur les compte comme un seul.

## Le déroulé

1. **Accueille-les.** `node scripts/intake.mjs <folder>`. Une copie de travail propre par clip, liée au hash du contenu. Les originaux ne sont jamais touchés.
2. **Mesure et étale.** `node scripts/footage.mjs read`. La durée, la lumière en part du blanc total, la couleur, combien ça bouge, combien ça change d’un bout à l’autre, quels clips sont la même image qu’un autre, et une planche de neuf images par clip.
3. **Regarde.** Ouvre chaque planche. Neuf images disent ce qu’est un clip ; une miniature dit ce qu’était un instant de ce clip.
4. **Écris.** Une note par clip, quatre ou cinq phrases : ce que c’est, ce qu’on y voit, de quelle couleur c’est, et où ça va dans un reel. Écris les notes dans la langue du client (le français par défaut). Puis `node scripts/footage.mjs note --from <notes.json>`, qui refuse une note trop courte pour avoir été écrite en regardant.
   Pour Beat Montage, note aussi `human: { visible: true, from: <seconds>, to: <seconds> }` pour une fenêtre nette où l’on voit une personne travailler, ou `{ visible: false }`. Examine cette fenêtre avant de la noter ; un nom de fichier ou la mention d’une main ne prouve pas qu’une personne est visible. Le sélecteur s’en sert pour l’ouverture.
5. **Dis ce qu’est le dossier.** `context/inputs/footage.md`, vu de haut, à côté de l’index : ce que sont ces rushes, ce qu’ils permettent de faire, et ce qu’ils ne permettent pas. Écrit une fois, pour que le prochain passage le lise.
6. **Construis à partir de l’index.** À partir de là, chaque reel nomme des ids. Le dossier n’est pas rouvert tant que le client n’y ajoute rien.

## Exemples

Dix-sept clips lus en un passage : trois paires reviennent signalées comme la même image sous des noms différents, donc le dossier compte quatorze clips, et le montage qui aurait coupé entre deux d’entre eux n’est pas construit. Une note qui marche : « Le bureau de dos, de nuit, une seule lampe allumée, trois écrans qui remplissent presque toute l’image. Sombre, bleu à cause des écrans, presque aucune autre couleur. Rien ne bouge sauf une main sur la souris. Bien sous un long plan fixe, et c’est le seul clip ici qui se lit comme le soir. » Un deuxième montage deux semaines plus tard, construit en une étape, parce que rien n’a dû être regardé à nouveau.

## Contre-exemples

Rouvrir le dossier parce qu’un nouveau montage a été demandé. Une note qui dit « plan de coupe d’un bureau », qui va à quatre clips du dossier. Lier la lecture à un nom de fichier, si bien que renommer un fichier la perd. Écrire les notes à partir des noms de fichiers et des mesures sans ouvrir une seule planche. Laisser un montage couper entre deux clips qui sont une seule image parce que leurs hashs diffèrent. Tirer les phrases des chiffres, ou les chiffres des phrases : une moitié se mesure, l’autre se voit, et aucune ne peut remplacer l’autre.
