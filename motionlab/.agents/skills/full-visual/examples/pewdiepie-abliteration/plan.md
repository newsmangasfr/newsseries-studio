# Plan visuel, pewdiepie-abliteration v9 (la carte)

approved: ses mots du 2026-10-04 : "redo the whole thing ... ultra creative and super illustrative, the same way we did
for distillation and for Hugging Face ... On the map, for example, we should see it if we reduce that direction".
(Tout refaire, ultra créatif et très illustré, comme pour la distillation et Hugging Face ; sur la carte, on doit voir
ce qui se passe quand on réduit cette direction.)
Et sur la v7 : "I didn't get anything ... Token is like a huge map ... It shows a direction, and for everything that points
there, we need to delete it." "the position on the map is very weird and not good enough." "The explanation of each
layer is too much." "1:33 [the harmful/refuse lamps] is really bad." (Il n’a rien compris ; le token est comme une
immense carte, avec une direction à supprimer ; la position sur la carte ne va pas ; l’explication couche par couche est
de trop ; les lampes à 1:33 sont très mauvaises.) Ce qu’il a aimé dans la v7 : le graphique de Heretic (1:25), la baie
de serveurs (1:47), le CTA (2:00).

Script : script.txt (v9, 442 mots). Voix off : voice.mp3, 127.4 s. Les temps ci-dessous sont les vrais temps des mots (words.json).
Faits : facts.md. Ses retours sur distillation / HF / math-proof, avec les règles : build/FEEDBACK.md (lis-le).

## Une fois pour toute la vidéo

- **LA CARTE est l’élément continu** (scènes `map` à `catch`, plus `alarm`). Un seul monde 3D : chaque requête est un
  point lumineux, les mêmes points, les mêmes couleurs et la même caméra partout. Données + maths + caméra : `scenes/map.ts`.
  Rendu partagé : `scenes/MapSpace.tsx` (étends-le dans tes propres fichiers ; ne duplique pas les données). Le spectateur doit sentir
  que c’est UNE seule carte qu’on explore, qu’on tourne, qu’on mesure, qu’on écrase à plat et qu’on abîme, jamais un nouveau schéma par phrase.
- **Chaque scène de carte a quand même son propre grand événement nouveau** (sa règle : une nouvelle chose réelle par groupe de phrases). La carte est la
  scène ; les événements sont : des requêtes qui arrivent en vol et se posent, les 4,096 nombres d’une requête qui deviennent des coordonnées, les axes
  qui explosent puis se replient à trois, des groupes qui se forment avec de vraies cartes de requêtes, la carte qui tourne pour que refuser soit « en haut »,
  deux cents requêtes lancées et marquées, une presse hydraulique / une vitre qui écrase la carte à plat, le groupe des maths
  qui se fissure sous une pression trop forte.
- **Les points sont des requêtes, pas des points abstraits.** Chaque point était une vraie requête : montre-en quelques-unes comme de petites vraies bulles de chat
  (le texte lisible pour les requêtes normales : "Best carbonara recipe?", "Fix my Python loop", "Cheap flights to Rome?" ;
  les requêtes refusées sont toujours un cadenas + un flou illisible, jamais une requête nuisible lisible) qui se réduisent dans leur
  point en se posant. Les points héros gardent une minuscule étiquette bulle/emoji.
- **Continuité aux passages de relais :** les scènes de carte se passent le relais SUR PLACE (`MyScene.keep = true`, moteur : Stage.tsx). La scène
  sortante finit exactement sur l’état `HAND.*` de map.ts et la scène entrante commence exactement dessus. Les surcouches s’effacent avant
  la fin et arrivent après le début. Toutes les autres scènes utilisent le décollage normal.
- **Couleurs :** le rouge `NO` (#FF3B30) sert UNIQUEMENT au refus (le groupe refusé, la flèche, « non »). L’ambre, c’est « nuisible » (alarm).
  Les couleurs des groupes sont dans map.ts. Fond sombre pour la carte et l’intérieur du modèle ; clair pour les documents (page Ajax, HF,
  le CTA).
- **Matière réelle :** la vraie miniature de PewDiePie (public/pewdiepie-abliteration/pewdiepie-thumb.jpg), la vraie page Ajax
  (build/ref-ajax-page.jpg), les vrais logos (parts.tsx `Logo` : qwenlm, openai, huggingface, github...), la vraie recherche Hugging
  Face (ref-hf-search), le vrai dépôt Heretic (ref-heretic), le vrai article (ref-arxiv). Redessinés à leur vraie
  géométrie, jamais une capture d’écran collée à plat.
- **Réutilise ce qu’il a aimé dans la v7** (copies dans `scenes-v7/`) : dépôt Heretic + graphique (`Heretic*.tsx`), la baie de serveurs +
  l’affichage du nom du modèle (`OpenRack.tsx`, `Open.tsx`, partie « company/servers/check name »), le CTA (`Cta*.tsx`). Améliore,
  ne dégrade pas. Tout le reste de la v7 est du matériel rejeté : ne réutilise pas le carnet, les piles, le stylo, les lampes.

## Scène par scène (qui la construit, entre crochets)

### hook, sombre, 0.16-3.42 [5 constructeurs d’accroche, voir build/HOOK-BRIEF.md]
"How did PewDiePie make an uncensored AI that never says no?"

### ajax, clair, 3.62-12.10 [B1]
"This week, he announced Ajax, his own AI model that runs on your computer, and OpenAI banned him twice while he built
it. And I wanted to understand how you create one."
L’actu, comme un film de lancement : sa vraie miniature et le vrai logo/la vraie page Ajax (crème #F9F8F4, serif noir). "Ajax" = le
logo qui s’assemble avec du poids ; "computer" = il se pose sur un vrai portable / son bureau ; "OpenAI" + "twice" = deux bannissements tombent
(vrai logo OpenAI, nu) ; "understand / create" = on ouvre Ajax : le logo se démonte pour montrer qu’il y a un modèle dedans
(ce qui mène à `open`). Grand, centré, mouvement profond, jamais une histoire d’interface.

### open, clair, 12.30-21.74 [B1]
"The method is called abliteration. You take an open model, one whose weights anyone can download: the billions of
numbers it calculates with. Ajax started from Qwen, Alibaba's open model."
"abliteration" = le mot se forme (ablate + obliterate est un fait, FailSpy). "open model" / "download" = une vraie page de modèle Hugging
Face (Qwen/Qwen3.5-9B) et ses fichiers de poids qui se téléchargent vraiment sur la machine (les vrais noms et tailles de fichiers
sont dans OpenFinder.tsx de la v7). "billions" = on ouvre un fichier : ce sont littéralement des milliards de nombres, un compteur défile jusqu’à
9,000,000,000 pendant qu’un mur de nombres réalistes défile. "Qwen" = le vrai logo Qwen ; le logo d’Ajax est montré posé
dessus ("Ajax started from Qwen").

### numbers, sombre, 21.94-28.98 [B2]
"Computers only work with numbers, so Qwen turns your request into a list of 4,096 numbers. Think of those numbers as
coordinates."
Une vraie requête tapée dans une boîte de chat ("Best carbonara recipe?"). "request" = elle est envoyée dans le logo Qwen ;
"4,096" = il en sort une longue liste de nombres qui se déroule et compte jusqu’à 4,096 (montre les premiers nombres, puis la longueur).
"coordinates" = les deux premiers nombres se détachent, brillent et deviennent une paire (x, y) : cela prépare la carte.

### map, sombre, 29.18-41.74 [B2]  (finit sur HAND.empty, `keep`)
"On a normal map, two numbers give you a position: left-right and up-down. Here, 4,096 numbers give your request a
position on a map with 4,096 dimensions. Nobody can picture that, so let's shrink it to three, like a 3D model."
"map" = une carte réaliste (vue de dessus, vraies couleurs, rues/relief) ; "left-right" / "up-down" = les deux coordonnées
glissent le long de leurs axes et une épingle tombe exactement à leur croisement. "4,096 dimensions" = depuis l’épingle, des axes jaillissent dans
toutes les directions, des centaines puis des milliers, un compteur qui fonce vers 4,096, impossible à suivre (ça doit sembler écrasant,
c’est le « oh wow »). "picture" = tout se tend ; "three" = les axes s’effondrent en trois axes colorés ; "3D" = la
carte plate bascule et devient un espace 3D vu en profondeur (sol quadrillé, trois axes), l’épingle est maintenant UN point blanc, « ta
requête ». Finit sur HAND.empty.

### clusters, sombre, 41.96-50.42 [B3]  (commence sur HAND.empty, finit sur HAND.cloud, `keep`)
"On that map, similar requests land close together. Cooking questions end up in one area, coding questions in another,
and requests the model refuses gather in their own corner."
Des requêtes pleuvent comme de vraies bulles de chat et se posent en points (le point blanc rejoint son groupe cuisine). "Cooking" = le
groupe cuisine s’allume, ses bulles lisibles ; "coding" = celui du code ; "refuses" + "corner" = les requêtes refusées
(cadenassées, floutées) se rassemblent dans un coin rouge, la caméra fait sentir à quel point il est loin. Les groupes voyage/musique/maths se remplissent
discrètement. Finit sur HAND.cloud (étiquettes et bulles disparues).

### direction, sombre, 50.62-60.20 [B3]  (commence sur HAND.cloud, finit sur HAND.turned, `keep`)
"And in 2024, researchers found that refusing is just one direction on that map. Turn the map so that direction points
up, and the higher a request lands, the more likely the model says no."
"2024" = le vrai article se pose brièvement (arXiv 2406.11717 "Refusal in Language Models Is Mediated by a Single
Direction", ref-arxiv), puis s’efface. "direction" = une seule ligne droite traverse le nuage des requêtes
normales jusqu’au coin rouge, comme un cap de boussole. "up" = TOUTE LA CARTE TOURNE (`turn` dans map.ts) jusqu’à ce que cette ligne
pointe droit vers le haut : le coin rouge est maintenant au sommet. "higher" = une règle de hauteur / échelle d’altitude apparaît le long ; une
requête monte le long et sa réponse passe d’une vraie réponse à "I can't help with that." sur "no". Finit sur HAND.turned.

### find, sombre, 60.54-72.90 [B4]  (commence sur HAND.turned, finit sur HAND.arrow, `keep`)
"So how do you find that direction? You send the model hundreds of requests it refuses, and hundreds of normal ones,
and mark where each one lands. Then you find the middle of each group, and draw an arrow from one to the other. That
arrow is the refusal direction."
"hundreds" = un flot de centaines de bulles de requêtes lancées sur le modèle ; "refuses" = celles avec cadenas se posent en rouge,
"normal" = les autres se posent dans leurs couleurs ; "mark" = chaque atterrissage laisse une épingle. "middle" = chaque groupe se resserre
vers son centre et un repère de centre tombe avec du poids sur chacun (calculé par `middle()` dans map.ts). "arrow" = la
flèche rouge SE DESSINE du centre normal jusqu’au centre refusé. "refusal" = elle se verrouille, brille, étiquetée "refusal
direction". Finit sur HAND.arrow.

### flatten, sombre, 73.12-85.20 [B4]  (commence sur HAND.arrow, finit sur HAND.flat, `keep`)
"Then you change the weights, because they decide where each request lands. You edit them so every request stays at the
same height, like pressing the map flat. Everything else stays where it was, so the model keeps what it knows. It just
can't climb to "no" anymore."
"weights" = les poids apparaissent comme la machinerie sous la carte (une matrice de nombres réaliste / les couches du modèle)
dont les nombres décident où chaque point se pose ; "decide" = une requête est aiguillée par eux jusqu’à sa place. "same height" /
"flat" = une lourde vitre / presse hydraulique descend le long de la flèche et écrase toute la carte à plat (`flatten`
s 0 -> 1) : le coin rouge est écrasé jusqu’à la même hauteur que tout le reste, les nombres des poids changent visiblement.
"Everything else" = les positions gauche-droite/avant-arrière des groupes ne bougent pas (montre-le : leurs empreintes restent
identiques). "climb" = une requête refusée essaie de monter le long de la flèche et est arrêtée par la vitre ; sa réponse est maintenant une
vraie réponse. Finit sur HAND.flat.

### catch, sombre, 85.42-96.58 [B5]  (commence sur HAND.flat, décollage normal à la fin)
"But here's the catch. That arrow isn't perfectly clean, so flatten it too hard and you damage other skills too. In one
study, math scores dropped by up to 18.8 points. That's what PewDiePie calls brain damage."
"clean" = zoom sur la flèche : le groupe des maths était en partie le long d’elle (map.ts place exprès les maths un peu plus haut sur la flèche).
"too hard" = la presse appuie plus fort ; "damage" = le groupe des maths se fissure, ses points s’étalent et se dispersent dans les
autres. "math" / "18.8" = une feuille d’examen de maths réaliste (style GSM8K) reçoit des marques rouges, une note chute de 18.8 points
qui tombe sur le mot (étude : arXiv 2512.13655, "up to"). "PewDiePie" + "brain damage" = sa vraie photo et sa citation,
l’idée du cerveau dessinée comme la carte abîmée (pas d’IRM de banque d’images).

### heretic, sombre, 96.80-106.22 [B5]
"That's why free tools like Heretic test the edit again and again, until they find the fewest refusals with the least
damage. Obviously, you shouldn't do anything illegal, but this is just a teaching video."
Réutilise et améliore la scène Heretic de la v7 qu’il a aimée (carte du dépôt, 33.1k stars, puis les essais qui se posent sur un graphique refus contre dégâts
jusqu’au meilleur, Gemma 3 12B : 97/100 -> 3/100, KL 0.16 contre 1.04 à la main). L’avertissement est une note calme et nette,
ses mots tels quels.

### alarm, sombre, 106.42-115.18 [B6]
"And here's the strange part: the model still knows your request is harmful, because "harmful" is a different
direction, and it stays untouched. Like a smoke alarm with its siren unplugged."
Retour sur la carte (dessine-la avec MapSpace, aplatie, CAM_UP) : "knows" / "harmful" = une deuxième direction `H`, AMBRE, s’allume
à travers les requêtes refusées, pointée sur le côté ; "different" = elle n’est clairement pas la rouge (montre l’angle entre les deux) ;
"untouched" = la presse/le plan aplati n’a aucun effet le long d’elle, l’ambre reste allumé. "smoke alarm" = un vrai détecteur de fumée,
magnifiquement construit (l’appareil de la v7 était bon), avec son voyant toujours clignotant en ambre et sa sirène débranchée. PAS le
panneau à deux lampes de la v7 (rejeté).

### servers, clair, 115.40-123.14 [B6]
"So if your company runs an open model on its own servers, check the model's name, because over 8,000 models on Hugging
Face have "abliterated" in theirs."
Réutilise et améliore la baie de serveurs de la v7 qu’il a aimée : la baie, l’écran avant sorti qui affiche le nom du modèle avec
"-abliterated" marqué en rouge sur "name" ; puis la vraie recherche Hugging Face, le compteur qui défile jusqu’à 8,305 sur "8,000",
"abliterated" qui s’allume dans chaque nom de modèle.

### cta, clair, 123.34-126.64 [B6]
"And if you want more breakdowns like this, follow me, and share this video."
Le CTA de la v7 qu’il a aimé (profil, Follow, feuille de partage, Sent), avec l’affiche de cette vidéo.
