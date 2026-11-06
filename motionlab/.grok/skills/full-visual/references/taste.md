# Le niveau attendu

Le niveau de la maison, dans les mots du créateur qui a construit ce format et piloté chaque vidéo de
`references/examples.md`. Un créateur qui a enregistré son propre look, sa voix ou ses mots
(`workspace/library/full-visual.preferences.md`) garde ce niveau pour l’image et le mouvement, et le sien pour le
reste.

## Ce que le spectateur doit ressentir

Qu’il a vu l’intérieur de quelque chose. Les meilleures vidéos donnaient l’impression d’une coupe d’un objet que le
spectateur tient tous les jours, ou d’une carte d’une histoire qu’il avait déjà entendue, explorée sous plusieurs
angles jusqu’au déclic. Un sujet, beaucoup d’angles, chaque phrase avec sa propre image, de vraies choses dessinées
avec soin, la partie invisible rendue visible, et la première seconde qui dit déjà l’idée sans le son.

## L’image

- **Réel, détaillé, soigné.** La remarque la plus fréquente après un premier essai : « ça peut être plus réel, avec
  beaucoup plus de détails, beaucoup plus d’attention. Ça doit vraiment aller en profondeur. » Une vraie chose a des
  pièces, des matériaux, des étiquettes, de l’usure, une lumière et une échelle. Dessine tout ça, d’après de vraies
  photos, de vrais démontages et de vrais écrans. Des boîtes plates et des formes génériques font codé (« ça fait
  codé à l’arrache », « trop peu de pièces », « ça fait IA »).
- **Une nouvelle vraie chose pour chaque groupe de phrases.** Une interface, un document, une machine ouverte. Un
  objet fil rouge peut rester tout au long de la vidéo ; il n’est jamais deux fois l’image principale.
- **Montre le mécanisme en marche.** Une idée abstraite est dessinée en train de faire son travail, étape par étape
  sur les mots, avec de vrais nombres. Jamais de flou, de givré ou de panneau vague : « c’est flou, on ne voit
  aucune animation, rien ne bouge ».
- **Coupe à l’intérieur.** Quand le mécanisme est dedans, montre le dedans : l’écran en coupe vu de côté, la coque
  qui devient transparente, les couches qui se soulèvent comme sur une photo de démontage. Une photo produit seule
  n’explique rien.
- **Un monde, trois échelles.** L’intérieur de l’objet, l’objet dans la main, le lieu autour. Voyage entre les trois
  et reviens, pour que le spectateur ne perde jamais où il est.
- **L’invisible a une seule forme et une seule couleur pour toute la vidéo** (la charge, la zone de frappe, la
  direction du refus). Tout le reste garde ses vraies couleurs, pour que l’accent soit ce qui attire l’œil.
- **Remplis la scène.** Premier plan, sujet, profondeur derrière, mouvement secondaire. Jamais un petit objet seul
  sur un fond vide. Masse et matière : des milliers de petites choses réelles qui forment une seule structure, du
  détail à plusieurs échelles, une lumière qui se déplace sur les surfaces.
- **Chaque motif dit ce qu’il est.** Un morceau, un pic, une cellule : le mot qu’il représente est écrit dessus,
  petit, avec un trait fin. Un motif sans étiquette se lit comme de la déco.
- **Un seul point d’attention à la fois.** Grand et centré d’abord, puis il se décale quand le reste arrive. Clair
  vaut mieux que complet.
- **Le dernier plan est le premier plan, résolu.**

## Le mouvement

- Quelque chose de significatif bouge sur presque chaque mot, et ce mouvement est le mécanisme qui travaille, pas de
  la déco.
- Chaque changement appartient à un mot : un événement tombe dessus, une construction finit dessus. Lisible, puis un
  court temps de pause.
- Les dix premières secondes portent le plus de mouvement. Rien ne reste immobile plus d’environ une seconde.
- Une image tenue continue de vivre : une lente avancée, une lumière qui voyage, de petites pièces qui travaillent.
- Les transitions font partie du métier : vérifiées image par image, sans à-coup, sans saut, sans copie fantôme d’un
  objet partagé.

## L’accroche (les trois à quatre premières secondes)

La partie la plus importante de la vidéo, et la raison pour laquelle on en construit cinq.

- **La phrase décodée.** Un héros, seul, chaque nom qui entre comme une vraie chose sur son mot, chaque verbe
  appliqué physiquement au héros, une seule transformation continue, lisible sans le son. La référence est
  `examples/ps5-on-pc/` (l’accroche C, son code dans `code/HookVC*`) : la console décomposée, avec autour le code
  open source et les personnes qui l’ont reconstruite.
- **L’image 0 est pleine et bouge déjà.** Jamais un fond vide, un titre ou un objet qui attend. Le mécanisme se joue
  une fois, petit et rapide, dans la première seconde ; ensuite, quelque chose de nouveau toutes les 0,2 à 0,4 s.
- **Un seul grand mouvement physique avec du poids** sur le mot clé : profondeur, inertie, vraie matière. Puis la
  chute tient.
- Ce qui perd : une histoire d’interface, une pile de cartes, des acrobaties de caméra à la place de l’idée, tout ce
  qui fait codé.

## Jamais

Tout ça fait IA, et chaque point a été refusé sur une vraie vidéo :

- des pastilles et badges avec un point (« PENDANT QUE TU JOUES »), des étiquettes de statut colorées, des cartes
  numérotées par étape, un titre qui répète les sous-titres, une barre d’étapes fixe ;
- des rangées de barres colorées pour une comparaison ou un score (dessine le vrai objet) ;
- du texte, des nombres ou des lignes en bleu sur la scène (le surligneur des sous-titres appartient au moteur et
  reste) ;
- de faux jeux, de fausses applis, de faux documents quand le vrai existe (« prends de vraies vidéos ») ;
- un décor 3D qui remplace la vraie chose, des mannequins, des images IA qui ne passent pas pour des photos ;
- un terminal en bas, des lignes de liaison en pointillés, du flou givré comme contenu, quatre cartes à la fois ;
- couper un produit en deux d’un coup de hachoir, un mécanisme héros assombri pendant que la voix passe à autre
  chose.

## Les mots

La voix off est vivante et rapide, avec une émotion qui suit chaque phrase (`references/voice.md`). Elle parle la
langue de la vidéo (`"language"` dans `reel.json`, `"fr"` par défaut). Chaque affirmation à l’écran est dans le
`facts.md` de la vidéo. Aucun tiret cadratin nulle part à l’écran.
