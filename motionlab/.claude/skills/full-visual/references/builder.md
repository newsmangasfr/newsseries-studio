# Construire une scène

Tu construis une scène (ou une accroche) d’une vidéo, comme le ferait un motion designer senior. Le niveau attendu
est `taste.md` ; lis-le d’abord. Si le créateur a choisi un style (`resolved.style` dans
`workspace/library/full-visual/profile.json`), lis aussi `styles/<id>/direction.md` : il dit à quoi ressemblent les
choses dans ce style (matières, couleurs, étiquettes). Il habille ta scène, il ne remplace rien de cette page.
Neuf effets prêts (un compteur qui roule, un texte qui se décode, une carte au bord lumineux…) sont dans
`effets.md` : prends-en un quand il sert la phrase, jamais pour décorer.

La remarque qui revient après presque chaque premier essai est toujours la même : pas assez réel, pas assez
détaillé, pas assez d’attention, pas assez en profondeur. Un premier essai qui saute l’observation et la réflexion
ci-dessous reçoit cette remarque. Cette page, c’est le travail qui fait du premier essai le bon. Prends le temps qu’il
faut.

## 1. Regarde d’abord la vraie chose

Avant une seule ligne de code, trouve à quoi la chose ressemble vraiment.

- Pars de ce que le plan a déjà récupéré dans `reels/<slug>/assets/refs/`, puis creuse plus loin pour ta propre
  scène : photos produit, démontages (iFixit), coupes et schémas, brevets, captures de la vraie interface, les pages
  du fabricant, de vraies images vidéo. Enregistre chacune là, nommée d’après ce qu’elle montre
  (`ifixit-iphone-13-screen.jpg`).
- Ouvre chaque référence en taille réelle et regarde vraiment. Puis écris ce que tu vois, en quelques lignes simples
  en haut de `reels/<slug>/notes/<Component>.md` : les pièces et leur nombre, les matériaux, les étiquettes et la
  typo, la lumière et d’où elle vient, l’échelle, comment ça bouge en vrai, le détail qui trahirait un faux.

La vidéo touchscreen montre jusqu’où ça va : sa coupe de l’écran a été lue sur deux photos de démontage (verre,
couche tactile, OLED, châssis, dans cet ordre), sa grille sur de vrais motifs en losange de capteurs, son bout de
doigt sur une photo macro des crêtes de la peau, son gant sur une photo de fil conducteur. Lis
`examples/touchscreen/plan.md` et son `code/WireGrid*`.

## 2. Réfléchis avant de construire

Dans le même fichier de notes, avant le code :

- **la vraie chose** que montre cette scène, et de quelle référence vient chaque partie ;
- **chaque détail qui la rend réelle** : ceux qu’un spectateur ne remarquerait que s’ils manquaient ;
- **mot, puis changement** : pour chaque mot clé de tes phrases, ce qui se passe à l’écran (« tombe sur » pour un
  événement, « finit sur » pour une construction) ;
- **le test sans le son** : ce qu’un inconnu comprend avec les images seules, et pourquoi.

Si la scène pourrait être la scène de n’importe quelle autre vidéo, réfléchis encore. Elle ne doit appartenir qu’à
cette histoire.

## 3. Construis

- **Dessine d’après les références**, à leur géométrie et avec leur texte, en couches : premier plan, sujet,
  profondeur. Lumière, ombre, texture, reflets, usure, vrais nombres de pièces, vraies étiquettes. Là où la vraie
  chose est faite de milliers de petites parties (pixels, fils, personnes, requêtes), dessines-en des milliers.
- **Fais fonctionner le mécanisme sur les mots.** Quelque chose de significatif change sur presque chaque mot clé ;
  rien ne reste immobile plus d’environ une seconde. Utilise `cue()` et `endsOn()` (`engine.md`), jamais des
  secondes tapées à la main.
- **Les choses spatiales ont droit à un monde.** Une coupe, une carte, une ville, un empilement de puces : construis
  un petit monde 3D avec une seule caméra, une vraie projection et une vraie lumière, sur un canvas
  (`examples/pewdiepie-abliteration/code/map.ts` et `MapSpace.tsx` sont toute une explication portée par une seule
  carte 3D), ou avec three.js (`@remotion/three`, `three` et `@react-three/fiber` sont installés ; rendu avec
  `--gl angle`). La 3D sert une chose réelle vue en profondeur ou une caméra qui traverse un seul monde. Elle ne
  remplace jamais la vraie chose par un décor.
- **De vraies images vidéo quand la chose est une vidéo.** Gameplay, un lancement, une démo : découpe le vrai clip
  (H.264, `-g 1`, sans son) et place-le dans son vrai cadre, avec une petite ligne de source.
- Garde tout dans tes propres fichiers (`<Component>*.tsx`, helpers préfixés par le nom de ton composant).

## 4. Compare, côte à côte

Fais le rendu d’images fixes sur toute ta scène (`engine.md`, toutes en un seul appel) et lis chacune en taille
réelle. Mets-la à côté de tes références et à côté d’une image fixe de la scène d’exemple la plus proche
(`examples.md`), et demande-toi :

- La mienne est-elle aussi détaillée que la photo ? Le propriétaire de cette chose la reconnaîtrait-il ?
- Est-elle aussi vivante que l’exemple ? Quelque chose change-t-il sur chaque mot clé ?
- Est-ce que je peux suivre l’idée sans le son ?

Si une seule réponse est non, ce n’est pas fini.

## 5. La passe plus riche

Une fois que ça marche, fais exprès une passe de plus : plus de vrais détails, plus de choses qui se passent, plus
de profondeur, plus d’attention aux petites choses (un reflet, une étiquette, un câble, un second mouvement derrière
le premier). C’est la passe que le créateur demanderait sinon. Garde les mots, les repères et les transitions
exactement tels quels.

## L’accroche (The hook)

Tu construis une des cinq variantes d’accroche. Chacune est une idée différente, pas une version d’une autre.

- **Décode d’abord la phrase.** Écris un tableau dans tes notes : chaque mot de l’accroche, la vraie chose qu’il
  nomme, le verbe appliqué au héros. Puis construis ce tableau comme une seule transformation continue sur un seul
  héros.
- L’image 0 est toute la scène, déjà vivante. Le mécanisme se joue une fois dans la première seconde. Quelque chose
  de nouveau toutes les 0,2 à 0,4 s. Un seul grand mouvement physique avec du poids sur le mot clé, puis la chute
  tient.
- Elle passe la main proprement à la scène suivante. Vérifie cette transition avec une rafale d’images fixes à
  1/60 s.
- Étudie `examples/ps5-on-pc/code/HookVC*` (le niveau attendu), puis `examples/touchscreen/code/HookX1*` et
  `examples/iphone-keyboard/code/HookX1*`, avec les premières images fixes de chaque exemple.

## Relecture, avec un regard neuf (Review, with fresh eyes)

Quand tu relis une scène que tu n’as pas construite :

1. Lis le plan qui la concerne et ouvre ses références.
2. Fais le rendu d’images fixes toutes les ~0,4 s sur toute la scène et lis chacune en taille réelle à côté des
   références.
3. Juge-la comme le créateur le ferait au premier visionnage. Ses remarques récurrentes au premier tour sont ta
   liste de contrôle : « ça devrait être plus réel », « plus de détails », « pas aussi détaillé que je veux »,
   « manque de créativité », « n’explique pas vraiment », « il ne se passe pas grand-chose », « ça fait trop IA »,
   « faux jeux, prends de vraies vidéos », « ça fait codé à l’arrache ».
4. Corrige toi-même les petites choses : un accroc de transition, un texte illisible, une image où rien ne bouge.
5. Renvoie **pass**, ou des remarques concrètes pour le constructeur : quoi, où, et à quoi ressemble la vraie chose
   à la place.

## Travailler à côté d’autres constructeurs (Working beside other builders)

D’autres agents écrivent d’autres scènes en même temps. Tu ne possèdes que tes fichiers. Si une vérification échoue
à cause d’un fichier qui n’est pas à toi, attends une minute et réessaie ; ne le modifie jamais. Les rendus se mettent
en file d’attente tout seuls ; demande toutes tes images fixes en un seul appel, ne lance jamais un rendu ou la
vérification des types en arrière-plan, et passe la vérification des types chacun son tour (`engine.md`, « Plusieurs
constructeurs à la fois »). Supprime tes anciennes images fixes quand tu en as fini.

Renvoie : ce que tu as regardé, ce que tu as construit (par mot repère), les images fixes que tu as vérifiées.
