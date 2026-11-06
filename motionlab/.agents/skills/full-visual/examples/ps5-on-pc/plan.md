# Plan visuel, ps5-on-pc ("GTA 5, Spider-Man, Silent Hill 2.")

approved: (waiting)

Réplique en anglais de DeNZt-_Nlmu (decode : le décodage de la source française, tableau des chapitres = ce qui est
montré sur chaque phrase). Script : `script.txt`, son script, pris pour vrai. Les temps ci-dessous viennent de `words.json`
(104.7 s, 376 mots, 3.59 mots/s après l’atempo uniforme). Lis les colonnes de droite seules : elles racontent à nouveau le script.
« se pose sur » = un événement sur le mot, « finit sur » = une construction qui s’achève dessus.

Chaque chose réelle nommée ici est déjà dans `refs/` (index en bas). Rien n’est dessiné de mémoire.

## Une fois pour toute la vidéo

- **Cadence (la loi de la réplique).** Quelque chose de nouveau se pose sur presque chaque mot clé, environ une fois par seconde. UN SEUL changement
  de scène par chapitre (le passage de relais entre scènes de sous-titres) ; dans un chapitre, le même dessin continue de grandir, jamais une
  nouvelle carte par phrase.
- **L’objet fil rouge : le tableau de câblage.** Né dans `missing`, porté intact à travers `kyty` et `anyps5`, son dernier
  état est récompensé dans `onegame`. Un seul dessin, trois états :
  - à gauche : le jeu, une carte de jeu PS5 étiquetée `eboot.bin` (l’exécutable livré avec chaque jeu PS5), bande PS5 bleue en haut ;
  - trois câbles en sortent, chacun finissant par une prise qui porte la vraie fonction que le jeu appelle, avec son emoji :
    💾 `sceSaveDataMount3`, 🔊 `sceAudioOutOutput`, 🎮 `scePadReadState` (vrais noms, chacun avec le vrai code par lequel le
    jeu l’appelle réellement, son NID, tiré des tables d’export de KytyPS5 : `ZP4e7rlzOUk` dans `refs/kyty/libSaveData.cpp`
    l.1297, `QOQtbeDqsT4` dans `refs/kyty/libAudio.cpp` l.131, `YndgXqQVV7c` dans `refs/kyty/libPad.cpp` l.182 ; AnyPS5
    a les trois mêmes bibliothèques sous `core/libs/prx`) ;
  - à droite : le contour en pointillés de la PS5 (décalqué de `refs/hardware/ps5-console-dualsense.png`), vide, un « ? » dans
    chaque prise ;
  - en bas : une pile de trois cartes de shaders composées en vraies instructions RDNA 2 (l’ISA du GPU de la PS5, celle que le README de KytyPS5
    cite comme référence, doc AMD 70648) : `v_mul_f32 v0, s0, v1`, `image_sample v[0:3], v4, s[8:15], s[16:19]`,
    `exp mrt0 v0, v1, v2, v3 done`, câblées à une carte graphique (une simple carte PCIe décalquée de
    `refs/hardware/gtx1050ti.jpg`, pas encore de marque) avec un « ? ».
  - État 1 `missing` : tout en « ? » et en pointillés. État 2 `kyty` : un cadre KytyPS5 (logo sarcelle) entoure le tableau et
    répond EN DIRECT, les prises passent au vert une par une, une carte de shader devient Vulkan. État 3 `anyps5` : le cadre est décollé,
    le jeu lui-même est reconstruit AVANT : `eboot.bin` devient `GAME.EXE`, les prises deviennent des `libs/*.prx` soudées.
    Le spectateur voit la différence entre les deux projets comme deux choses différentes qui arrivent au même tableau.
    Dans l’état 3, la pile de shaders et la carte graphique ne sont pas le sujet de la phrase : elles restent atténuées à ~35 % dans leur
    état traduit (AnyPS5 recompile aussi le RDNA en SPIR-V pour Vulkan, `refs/anyps5/README.md` l.23 et
    ARCHITECTURE "Graphics"), jamais revenues à « ? », pour qu’il ne reste aucun « ? » en scène pendant que le jeu converti tourne.
  - Le tableau naît de la vraie matière du chapitre précédent : les trois appels à la console qui restent sur la
    feuille de code du jeu dans `why` (les lignes qui ne « tournent pas simplement ») deviennent ses trois câbles. C’est la cause de
    « ce qui manque », montrée.
  - C’est le héros de `missing`, de `kyty` (jusqu’à "works") et de `anyps5`, et il se met de côté (rétrécit en haut à gauche, ~45 %,
    atténué) chaque fois qu’un extrait de preuve GitHub ou l’écran du jeu prend la scène. Jamais deux héros à la fois. Une preuve
    qui appartient à une prise (la ligne `libPad.cpp`) s’ouvre dans cette prise au lieu de pousser le tableau :
    un rétrécissement-retour de 0.5 s est un accroc, pas un temps fort.
- **Preuve = vrais extraits GitHub**, découpés dans les captures de `refs/` (lignes de README, lignes de releases, tableaux de
  compatibilité, issue #810, le rapport hebdomadaire #887, captures d’écran), la phrase clé sous un cadre de surlignage qui balaie sur le
  mot, et une petite ligne de source grise sous chacun (`github.com/KytyPS5/KytyPS5 · README`). Seulement les lignes dont la phrase
  a besoin, texte jamais sous 32 px.
- **Vrais chiffres, en direct aujourd’hui (2026-10-09) :** KytyPS5 ★ 6,555 (affiche "6.6k"), GPL-2.0, 408 releases, 84 contributeurs ;
  AnyPS5 ★ 14,917 ("14.9k"), créé le 2026-08-03, 3,003 commits. Les chiffres défilent et se posent sur leur mot.
- **Fonds (d’après caption.txt) :** sombre pour l’accroche, le démarrage et toute la salle des machines (`missing`, `kyty`,
  `anyps5`, `legal`) ; clair (blanc GitHub) pour `why`, `onegame`, `speeding`. Le tableau ne vit que sur fond sombre, donc il ne
  traverse jamais un changement de fond. Accents : sarcelle KytyPS5 (le `#93D7C6` de son logo) pour « répondu en direct », rouge-bordeaux Vulkan pour la
  carte de shader une fois traduite, orange AnyPS5 (celui de son avatar) pour « converti avant ». Rouge uniquement pour le piège (bugs, "not",
  "emulator" barré).
- **Le seul grand mouvement :** dans `kyty` sur "translated on the fly", une carte de shader sort de la pile, sa ligne RDNA 2
  se réécrit glyphe par glyphe en SPIR-V (`%12 = OpFMul %float %10 %11`) pendant que la carte se retourne, se pose sur "Vulkan"
  avec le logo Vulkan tamponné au dos, et sur "speaks" glisse dans la carte graphique, dont le « ? » devient un ventilateur
  allumé et une image. Rien d’autre dans le corps n’est aussi fort.
- Pas de panneau de terminal en bas, pas de lignes de connexion en pointillés entre les cartes (le contour en pointillés de la PS5 est l’état « manquant »
  lui-même, il devient plein), pas de pile de cartes flottantes, pas de flou comme contenu.

## Scène par scène

### 1. `hook` (0-3.5 s, sombre)

Cinq variantes, construites séparément.

### 2. `boot` (3.5-10.2 s, sombre)
"Their PS5 versions already boot on a PC, with a free emulator called KytyPS5. And another project skips the emulator
entirely."

Choses réelles : les trois jaquettes PS5 transmises par l’accroche (`refs/covers/*-steam-600x900.jpg`, bande PS5 redessinée en
haut ; Spider-Man = Miles Morales, celui que le rapport hebdomadaire de KytyPS5 montre en jeu), la vraie console PS5
(`refs/hardware/ps5-console-dualsense.png`), un PC (écran + tour), les puces de dépôt GitHub de KytyPS5 et d’AnyPS5 (logo,
`owner / repo`, ★, d’après `refs/captures/kyty-repo.png`, `anyps5-repo.png`). Une seule route, de gauche à droite : PS5 → PC, et ce qui
se trouve sur cette route est toute l’histoire de la vidéo. Les 10 premières secondes portent le plus de mouvement : chaque mot clé fait bouger les
jaquettes ou la route.

| Mot | Ce qui change |
|---|---|
| PS5 (3.6) | se pose sur : une console PS5 blanche se dresse à gauche avec du poids (léger dépassement, ombre qui se stabilise) ; les trois jaquettes, encore grandes depuis l’accroche, tombent en pile devant elle et chacune s’enclenche sur la bande PS5 bleue |
| boot (4.8) | se pose sur : les jaquettes volent en arc, l’une après l’autre (60 ms d’écart), de la PS5 vers la droite, dans un écran de PC qui monte par le bas |
| PC (5.2) | l’écran s’allume quand elles se posent : trois tuiles à l’écran, un triangle de lecture blanc sur chacune, "BOOTS" se tamponne en vert ; la LED de la tour pulse |
| free (5.9) | se pose sur : une route se trace entre la PS5 et le PC (ligne sarcelle pleine), et une puce de dépôt KytyPS5 tombe en son milieu comme un pont (logo sarcelle, `KytyPS5 / KytyPS5`), puce de prix `$0 · GPL-2.0` |
| KytyPS5 (6.8) | finit sur : le nom finit de s’écrire, ★ compte de 0 → 6.6k ; une jaquette parcourt la route à travers la puce jusqu’au PC (l’émulateur se place entre le jeu et le PC) |
| another (8.1) | une deuxième puce tombe au-dessus de la route, maintenue : AnyPS5 (avatar orange, `boykopovar / AnyPS5`) |
| skips (8.8) | se pose sur : ★ compte jusqu’à 14.9k ; un arc orange part de PS5 → PC PAR-DESSUS la puce KytyPS5, une jaquette le chevauche et se pose directement dans le PC |
| entirely (9.5) | la puce KytyPS5 sous l’arc s’atténue à 40 % ; l’arc et la route tiennent, la scène passe le relais |

### 3. `why` (10.2-24.3 s, clair)
"But first, why is this even possible? On the PS3, the processor was so different from a PC's that every line of code
had to be translated. The PS5 uses the same family of processor as your PC, Intel or AMD. Same language. So most of
the game's code just runs, directly on your processor."

Choses réelles : la puce Cell de la PS3 (`refs/hardware/ps3-cell-chip.jpg`, redessinée en puce avec son vrai marquage "CELL"),
une puce x86 (PC), la puce AMD de la PS5, les logos Intel et AMD (`refs/logos/intel.svg`, `amd.svg`), une ligne de vrai
code machine dans chaque jeu d’instructions. Le mécanisme montré, pas un dessin animé de traducteur : le code lui-même.

| Mot | Ce qui change |
|---|---|
| why (10.8) | se pose sur : un grand « ? » entre deux puces, emplacement gauche vide, emplacement droit une puce de PC étiquetée `x86-64` |
| PS3 (12.2) | se pose sur : l’emplacement gauche se remplit avec la puce Cell (contour de la console PS3 derrière, d’après `ps3-console.jpg`) |
| different (13.7) | se pose sur : chaque puce « dit » une ligne de son propre code dans une bulle : Cell `lwz r3, 0(r4)` (PowerPC), PC `mov eax, [rsi]` (x86) ; les glyphes des deux bulles sont visiblement différents, un « ≠ » rouge tombe entre elles |
| translated (15.9) | finit sur : une rangée de lignes Cell coule vers la droite à travers une porte étroite, chaque ligne réécrite en x86 au passage ; le flux est lent, les lignes font la queue (le coût de la traduction, visible) |
| PS5 (16.7) | se pose sur : la puce Cell, sa porte et sa file glissent dehors ensemble (rien de la PS3 ne reste) ; la puce de la PS5 glisse dans l’emplacement gauche (logo AMD sur son capot, étiquette `x86-64 · Zen 2`) |
| same (17.6) | se pose sur : le « ≠ » bascule en « = » |
| Intel (19.3) | le capot de la puce du PC montre le logo Intel ; sur "AMD" (19.9), le même capot se retourne comme une pièce sur le logo AMD (une seule puce de PC, jamais deux) |
| language (20.6) | se pose sur : les deux bulles montrent maintenant la même ligne `mov eax, [rsi]`, les deux chaînes se surlignent ensemble |
| code (21.9) | les deux puces se posent en bas ; une feuille du code du jeu (douze lignes x86) monte au-dessus d’elles, centrée, les bulles s’effacent |
| runs (22.4) | se pose sur : les lignes se déversent tout droit dans la puce du PC, sans porte, vite, les broches de la puce s’allument ; trois lignes ne partent PAS : `call sceSaveDataMount3`, `call sceAudioOutOutput`, `call scePadReadState` restent sur la feuille et passent en ambre (« la plupart » du code, montré) |
| processor (23.6) | la puce du PC brille ; les trois lignes d’appel ambre sont la seule chose restée sur la feuille, elles se soulèvent et passent le relais (elles deviennent les trois câbles du tableau) |

### 4. `missing` (24.3-39.0 s, sombre) : le tableau naît
"What's missing is the rest of the console. A game spends its whole time asking the PS5 for things. Save my progress.
Play this sound. What is the controller doing? On a PC, nobody answers. And the game draws with tiny programs called
shaders, written in the PS5's own graphics language. Your graphics card can't read them."

Choses réelles : le tableau de câblage (voir plus haut), le contour de la PS5, les trois vrais noms de fonctions, de vraies lignes RDNA 2.

| Mot | Ce qui change |
|---|---|
| missing (24.5) | se pose sur : la feuille de code de `why` se plie en une carte, `eboot.bin`, à gauche de la scène, une coche verte sur son coin CPU (cette partie tourne) ; les trois lignes d’appel ambre pendent de son bord droit |
| console (25.5) | finit sur : le contour en pointillés d’une PS5 se dessine à droite, vide à l’intérieur |
| asking (27.3) | se pose sur : les trois lignes d’appel s’étirent en trois câbles qui filent vers le contour, chacun finissant par une tête de prise vide ; de petits paquets commencent à partir le long d’eux en boucle (le jeu demande tout le temps) |
| Save (28.6) | se pose sur : la prise 1 s’étiquette 💾 `sceSaveDataMount3`, son paquet parcourt le câble et s’arrête au contour |
| sound (29.9) | se pose sur : prise 2 🔊 `sceAudioOutOutput`, un paquet en forme d’onde voyage et s’arrête |
| controller (30.7) | se pose sur : prise 3 🎮 `scePadReadState`, un paquet en icône de DualSense voyage et s’arrête |
| PC (31.6) | une petite étiquette grise `on PC` sous le contour en pointillés : cet espace vide, c’est là où se trouve ton PC |
| nobody (32.1) | se pose sur : un « ? » surgit dans chaque prise, les trois paquets rebondissent sans réponse, les câbles se détendent et grisent |
| shaders (34.8) | se pose sur : une pile de trois cartes de shaders glisse vers le haut sous `eboot.bin` |
| language (36.9) | finit sur : les lignes RDNA 2 des cartes finissent de s’écrire (`v_mul_f32 v0, s0, v1` / `image_sample ...` / `exp mrt0 ...`), une petite étiquette `PS5 GPU · RDNA 2` |
| can't (38.1) | se pose sur : une carte graphique se dessine en bas à droite, la carte du dessus est poussée vers elle et rebondit ; un « ? » rouge sur la carte |
| them (38.5) | le tableau entier tient, complet, chaque « ? » visible : c’est l’image que les deux chapitres suivants réparent |

### 5. `kyty` (39.0-61.4 s, sombre) : le tableau répondu en direct
"KytyPS5 fixes that while you play. It launches the game, and every time the game asks the PS5 for something, KytyPS5
answers instead, with its own copy of that function. Every shader gets translated on the fly, into Vulkan, a language
your graphics card speaks. And it works. Big games already reach playable scenes. Silent Hill 2 runs, at 6 frames per
second. There are still bugs, crashes, and very uneven performance. Reaching a scene is not finishing the game."

Choses réelles : le logo KytyPS5, la vraie ligne de recherche tirée de son code source (`refs/kyty/libPad.cpp` ligne 182 :
`LIB_FUNC("YndgXqQVV7c", Controller::PadReadState);`, le jeu demande par un code, la table de KytyPS5 répond), le logo
Vulkan, les captures en jeu du README (`refs/kyty/readme-ps5-01.png` Astro Bot, `-02` Demon's Souls, `-06.jpg`
UFC 6, chacune légendée "... running in KytyPS5"), le rapport GTA V #810 (`refs/kyty/issue-810.json`, titre
`[GAME STATUS]: Grand Theft Auto V`, son tableau à trois modes : Performance "Starts and is playable ... pretty laggy",
Performance RT "characters are drawn as black silhouettes", Fidelity "Story mode does not load"), l’image de Silent Hill 2
avec sa vraie barre de titre (`refs/kyty/sh2-fps6.jpg`, "... frame: 2076, fps: 6"), la vraie ligne de plantage de #810
(`vkQueueSubmit failed: ErrorDeviceLost`). Après "works", le héros de la scène est l’écran du jeu que la carte graphique a allumé ; le
tableau attend, petit et atténué, en haut à gauche.

| Mot | Ce qui change |
|---|---|
| KytyPS5 (39.0) | se pose sur : le logo KytyPS5 se plaque sur le contour vide de la PS5, qui devient sarcelle plein : KytyPS5 prend la place de la console |
| play (40.6) | se pose sur : un badge `WHILE YOU PLAY` avec un point rouge d’enregistrement en direct ; une horloge dans le badge se met à tourner |
| launches (41.2) | se pose sur : le cadre entoure aussi `eboot.bin` ; la bande PS5 de la carte de jeu s’allume, une barre de démarrage se remplit |
| asks (42.9) | le paquet 💾 repart le long du câble 1 |
| answers (45.2) | se pose sur : le paquet atteint le cadre, une réponse sarcelle revient, le « ? » de la prise 1 devient une coche verte ; 🔊 et 🎮 partent et reçoivent une réponse à 45.5 et 45.8 |
| copy (46.5) | se pose sur : la prise 3 s’ouvre sur place (le tableau ne bouge pas) en une bande de la vraie table d’export de KytyPS5 : le paquet du jeu porte le code `YndgXqQVV7c`, la bande trouve la ligne `LIB_FUNC("YndgXqQVV7c", Controller::PadReadState);`, le code brille en sarcelle des deux côtés ; ligne de source `KytyPS5 · src/libs/libPad.cpp` |
| function (47.0) | finit sur : `Controller::PadReadState` (la propre copie de KytyPS5) se surligne, la bande tient jusqu’à 47.7 puis se referme dans la prise |
| shader (47.7) | se pose sur : la carte de shader du dessus sort de la pile (le seul grand mouvement commence) |
| fly (48.9) | la ligne RDNA 2 se réécrit glyphe par glyphe en SPIR-V `%12 = OpFMul %float %10 %11` pendant que la carte se retourne |
| Vulkan (49.4) | se pose sur : la carte se pose face visible, logo Vulkan tamponné dessus, la carte passe au bordeaux Vulkan |
| speaks (51.0) | finit sur : la carte glisse dans la carte graphique ; son « ? » devient un ventilateur qui tourne, et un petit écran au-dessus de la carte s’allume. Chaque « ? » du tableau a maintenant une réponse |
| works (51.8) | se pose sur : le tableau rétrécit en haut à gauche et s’atténue ; l’écran grandit au centre de la scène et montre les vraies captures en jeu de KytyPS5, Astro Bot, puis Demon's Souls, puis UFC 6 (une toutes les ~0.4 s), chacune avec sa légende du README "... running in KytyPS5" |
| playable (53.3) | se pose sur : l’extrait du rapport GTA V #810 glisse vers le haut sous l’écran, titre `[GAME STATUS]: Grand Theft Auto V`, la ligne `Performance` avec "Starts and is playable" surligné sur le mot ; source `KytyPS5 · issue #810` |
| Silent Hill 2 (54.2) | l’extrait glisse vers le bas hors du cadre ; l’image de l’écran devient la vraie image de Silent Hill 2 avec sa barre de titre (`SILENT HILL 2, PPSA08710 ... fps: 6`) |
| 6 (55.6) | se pose sur : le `fps: 6` de la barre de titre zoome et un anneau rouge se trace autour ; un grand « 6 » se pose à côté ; l’image saccade à 6 fps |
| bugs (57.0) | se pose sur : sous l’image, la vraie ligne d’erreur de #810 s’écrit en rouge `vkQueueSubmit failed: ErrorDeviceLost` |
| crashes (57.5) | la fenêtre de Silent Hill 2 se ferme d’un coup sur du noir avec une fermeture à la Windows |
| uneven (58.4) | se pose sur : la fenêtre noire devient le tableau à trois modes de #810, une ligne par temps : `Performance` jouable, assez saccadé (ambre) / `Performance RT` silhouettes noires (ambre) / `Fidelity` le mode histoire ne charge pas (rouge). Même jeu, trois résultats différents : inégal, d’après le vrai rapport |
| not (60.1) | se pose sur : le tableau s’efface ; une ligne de progression du jeu de START à END, une épingle sarcelle à "first scene" juste après START, le drapeau END barré du trait rouge de la vidéo |
| game (60.7) | la ligne s’efface ; le tableau revient au centre pour le passage de relais, le cadre KytyPS5 toujours dessus |

### 6. `anyps5` (61.4-75.5 s, sombre) : le tableau converti avant
"AnyPS5 does that work before you play. It converts the game itself into a normal Windows or Linux program, already
wired to rewritten PS5 functions. No emulator to open. You double-click the game, and it starts, like any app. That's
why AnyPS5 calls itself a porting tool, not an emulator."

Choses réelles : le logo AnyPS5, sa vraie commande de conversion (`relinker --windows source/input.elf app.exe`, tirée de
`refs/anyps5/USAGE.md`), les logos Windows et Tux, les vrais noms des bibliothèques réécrites (`libSceSaveData.prx`,
`libSceAudioOut.prx`, `libScePad.prx`, le dossier d’exécution `libs/` d’après USAGE.md), une icône de bureau Windows et une
fenêtre, les lignes du README "Tool for automatic PS5 executables porting to Linux and Windows" et "No emulation or
separate runtime process." (`refs/anyps5/README.md`, `refs/captures/anyps5-repo.png`).

| Mot | Ce qui change |
|---|---|
| AnyPS5 (61.4) | se pose sur : le cadre KytyPS5 se décolle du tableau comme un ruban adhésif ; le logo AnyPS5 se pose à sa place ; les trois prises retombent à « ? » (plus personne ne répond en direct) ; la pile de shaders et la carte graphique s’atténuent à ~35 % et restent floues pendant tout le chapitre |
| before (62.7) | se pose sur : badge `BEFORE YOU PLAY`, le point d’enregistrement éteint, une frise dessous `convert ▸ play` avec la tête de lecture sur `convert` |
| converts (63.5) | se pose sur : `eboot.bin` tombe dans une fente sous le logo AnyPS5 ; la vraie commande s’écrit sur une ligne au-dessus, `relinker --windows source/input.elf app.exe` |
| Windows (65.2) | se pose sur : la carte ressort de l’autre côté en `GAME.EXE`, logo Windows dessus, la bande PS5 disparue |
| Linux (65.7) | la carte se retourne une fois et montre `GAME.elf` avec Tux, puis revient (les deux sorties sont réelles : `app.exe` / `app.elf`) |
| wired (66.7) | se pose sur : les trois câbles s’enclenchent dans `GAME.EXE` comme des broches soudées, plus aucun contour de PS5 à droite |
| functions (68.2) | finit sur : les trois prises deviennent de petits fichiers de bibliothèque, `libSceSaveData.prx`, `libSceAudioOut.prx`, `libScePad.prx`, dans un dossier `libs/` à côté de l’exe, chacun avec une marque de crayon orange "rewritten" (réécrit) et une coche verte |
| No (68.7) | se pose sur : le fantôme du cadre KytyPS5 du chapitre précédent apparaît un éclair et est barré en rouge |
| double-click (69.9) | se pose sur : le tableau se compacte en une icône de bureau Windows `GAME.EXE` ; un curseur double-clique dessus, deux ondes |
| starts (71.0) | se pose sur : une fenêtre s’ouvre depuis l’icône avec une vraie barre de titre Windows `GAME.EXE`, et l’image du jeu la remplit (l’illustration d’en-tête Steam de Dreaming Sarah, `refs/covers/dreaming-sarah-steam-header.jpg`, pas nommé ici : le nom se pose au chapitre suivant) ; pas de lanceur, aucune autre fenêtre sur le bureau |
| app (71.8) | la fenêtre tient seule sur le bureau, la barre des tâches montre un seul élément, `GAME.EXE` |
| porting (73.9) | se pose sur : la fenêtre se pousse sur le côté ; l’extrait du README d’AnyPS5, "porting" surligné dans "Tool for automatic PS5 executables porting to Linux and Windows" |
| emulator (74.8) | se pose sur : la ligne suivante du README, "No emulation or separate runtime process.", "No emulation" surligné ; une puce de mot `emulator` à côté, barrée en rouge |

### 7. `onegame` (75.5-83.1 s, clair)
"For now, its official list has exactly one game. Dreaming Sarah, a small 2D platformer, at 60 frames per second on a
GTX 1050 Ti."

Choses réelles : le tableau `docs/user/COMPATIBILITY.md` d’AnyPS5 (`refs/captures/anyps5-compat.png`, une ligne : Dreaming Sarah,
PPSA02929, In game, playable, 60 FPS, 36 FPS), l’illustration principale de Dreaming Sarah (`refs/covers/dreaming-sarah-steam-600x900.jpg`),
la GTX 1050 Ti (`refs/hardware/gtx1050ti.jpg`), la ligne du README "runs at a stable 60 fps on a GTX 1050 Ti".

| Mot | Ce qui change |
|---|---|
| list (76.4) | se pose sur : la vue de fichier GitHub `AnyPS5 / docs / user / COMPATIBILITY.md` glisse, titre "Tested compatibility" |
| one (77.3) | se pose sur : le tableau trace son unique ligne ; un grand « 1 » se tamponne à côté ; les lignes vides en dessous restent fantômes |
| Dreaming (77.9) | se pose sur : la cellule de jeu de la ligne, `Dreaming Sarah`, se surligne ; la fenêtre `GAME.EXE` de `anyps5` arrive en petit et s’amarre à côté de la ligne, sa barre de titre affiche maintenant `Dreaming Sarah` : la récompense de l’objet fil rouge, le jeu converti a un nom |
| 2D (79.3) | se pose sur : la ligne du README "Dreaming Sarah (2D platformer) runs at a stable 60 fps on a GTX 1050 Ti" glisse sous le tableau, "(2D platformer)" surligné ; source `AnyPS5 · README` |
| 60 (80.5) | se pose sur : "60 fps" se surligne dans la ligne du README, un compteur défile de 0 → 60 en taille héros, tout ce qui est au-dessus s’atténue |
| GTX (81.7) | se pose sur : la carte GTX 1050 Ti (`refs/hardware/gtx1050ti.jpg`) glisse sous le compteur, "GTX 1050 Ti" se surligne dans la ligne ; source `AnyPS5 · README` |

### 8. `speeding` (83.1-94.9 s, clair)
"And it's speeding up. At the end of July, KytyPS5 shipped 2 to 3 new versions a day. Since mid-September, more than 7.
More than 80 people have worked on its code, and its last weekly report shows progress on about fifteen games, in one
week."

Choses réelles : la page Releases de KytyPS5 (`refs/captures/kyty-releases.png`), les vrais tags de deux vrais jours tirés de
`refs/kyty/releases.tsv` (2026-07-30 : `ecb48f9`, `d04938c`, `77aa28b` ; 2026-10-08 : onze tags `aa3b2cd` ...
`2f4b8a3`), les 84 vrais avatars de contributeurs (`refs/kyty/contributors/`), la mise à jour hebdomadaire #887
(`refs/captures/kyty-weekly-887.png`, "KytyPS5 weekly update , September 28,October 4, 2026", auteur Nmzik).
Pas de barres colorées : la pile des vraies lignes de releases est le graphique.

| Mot | Ce qui change |
|---|---|
| speeding (83.4) | se pose sur : l’en-tête de la page Releases glisse, "Release list", un compteur de releases qui monte jusqu’à 408 |
| July (84.4) | se pose sur : une colonne de jour `Jul 30` s’ouvre à gauche |
| 2 (86.2) | se pose sur : des lignes de releases tombent dans la colonne, `KytyPS5-2026-07-30-ecb48f9`, puis `d04938c` |
| day (87.2) | la troisième ligne `77aa28b` se pose ; la colonne est courte |
| mid-September (87.8) | une deuxième colonne `Oct 8` s’ouvre à droite |
| 7 (89.1) | se pose sur : onze vraies lignes pleuvent dedans, bien plus haute que la colonne de juillet ; une puce `7+ / day since mid-Sept` |
| 80 (89.7) | se pose sur : les colonnes glissent vers le haut ; 84 vrais avatars de contributeurs remplissent une grille ligne par ligne, un compteur qui monte jusqu’à 84, il se pose sur "80+" |
| weekly (91.6) | se pose sur : la grille rétrécit ; la carte de la mise à jour hebdomadaire #887 glisse, titre et plage de dates surlignés |
| fifteen (93.2) | se pose sur : des puces de noms de jeux tirées du rapport se tamponnent vite dessous (UFC 5, UFC 6, Dragon Ball FighterZ, Hi-Fi RUSH, Hades II, GTA V, Silent Hill 2, Silent Hill f, Miles Morales, Stray, MotoGP 23, Astro's Playroom, Beast of Reincarnation, God of War: Sons of Sparta, New Super Lucky's Tale), un compteur jusqu’à 15 |
| one (94.3) | se pose sur : la plage de dates "September 28,October 4" se surligne : une semaine |

### 9. `legal` (94.9-104.7 s, sombre)
"Neither one gives you games. You need your own, dumped from your own PS5, legally. Send this to the friend still
waiting for a PC port. And comment "PS5", I'll send you both official GitHub pages."

Choses réelles : l’encadré IMPORTANT du README de KytyPS5 ("The project does not distribute games or copyrighted system software.
Use only game files that you have obtained legally.", `refs/kyty/README.md` l.20-22), la syntaxe d’usage d’AnyPS5
(`refs/anyps5/USAGE.md` l.15), la console PS5, un dossier de jeu nommé par son vrai ID (`PPSA08710`), la feuille de partage
Instagram, la zone de commentaire et le message privé. Les puces de dépôt de `boot` ne sont pas remontrées en image : elles ne reviennent que dans
le message privé final, comme récompense.

| Mot | Ce qui change |
|---|---|
| Neither (94.9) | se pose sur : deux vrais extraits empilés, un par projet, chacun sous son petit logo : l’encadré IMPORTANT du README de KytyPS5, et la ligne USAGE d’AnyPS5 `relinker [options] <input.elf> <output>` |
| games (95.6) | "does not distribute games" se surligne dans l’encadré KytyPS5, et `<input.elf>` se surligne dans la ligne AnyPS5 : le jeu est une entrée que tu apportes, aucun des deux n’en fournit |
| own (96.5) | se pose sur : les extraits rétrécissent vers le haut ; une vraie console PS5 (`ps5-console-dualsense.png`) glisse au centre |
| PS5 (97.5) | se pose sur : un dossier de jeu `PPSA08710` glisse de la console vers un dossier du PC `Your games` |
| legally (98.4) | se pose sur : "Use only game files that you have obtained legally." surligné, une coche verte sur le dossier |
| port (100.5) | se pose sur : une feuille de partage Instagram monte, une rangée de visages réalistes d’amis (jamais des initiales), la flèche d’envoi se remplit sur l’un d’eux |
| PS5 (101.5) | se pose sur : une zone de commentaire, le curseur tape `PS5` et envoie ; le commentaire apparaît avec son avatar |
| GitHub (103.3) | se pose sur : la récompense, une bulle de message privé arrive avec les deux liens, `github.com/KytyPS5/KytyPS5` et `github.com/boykopovar/AnyPS5`, chacun avec son logo et son nombre d’étoiles ; la dernière image se lit toute seule |

## Notes pour lui

- **Le chiffre de juillet.** Le script dit 2 à 3 versions par jour fin juillet. La liste des releases telle qu’elle est aujourd’hui en a
  davantage la plupart des jours de fin juillet (27-31 juil. : 7, 4, 9, 3, 7), avec 3 le 2026-07-30. Le plan montre les trois vrais
  tags du 30 juillet pour que l’écran colle à la voix et reste vrai. À partir de mi-septembre, ça se vérifie : 187 releases en 24 jours, 7.8
  par jour. 84 contributeurs, 16 noms de jeux dans le rapport #887.
- **Spider-Man** à l’écran est Miles Morales (la jaquette que la vidéo française utilisait et celle que le rapport #887 montre en jeu).
- **GAME.EXE** est l’étiquette que sa direction demandait ; la propre doc d’AnyPS5 nomme la sortie `app.exe`, c’est ce que
  montre la commande tapée.
- **Fonction de sauvegarde.** Sur PS5, l’appel de sauvegarde que KytyPS5 exporte est `sceSaveDataMount3` (NID `ZP4e7rlzOUk`), donc la prise
  montre celui-là, pas le `sceSaveDataMount` de l’époque PS4.
- **AnyPS5 et les shaders.** Le script ne dit rien des shaders pour AnyPS5. Sa doc montre qu’il recompile le RDNA en SPIR-V
  à l’exécution avec un cache disque, donc la carte graphique du tableau reste dans son état traduit, atténuée, plutôt que
  de prétendre à une conversion « avant » des shaders.
- **Passage du critique (2026-10-09).** Corrigé : `boot` avait des flèches partant d’une PS5 qui n’était pas en scène (la console y est maintenant,
  la route porte l’histoire) ; la preuve `copy` rétrécissait le tableau pendant 0.5 s (elle s’ouvre maintenant dans la prise 3) ; la trace de temps d’image
  "uneven" était une donnée inventée (c’est maintenant le vrai tableau à trois modes de #810) ; "works" ne montrait rien de réel (ce sont maintenant les captures en jeu du
  README de KytyPS5) ; la fenêtre de `anyps5` utilisait une capture de KytyPS5 comme sortie d’AnyPS5 (c’est maintenant l’illustration du jeu,
  nommé dans `onegame`) ; `onegame` rouvrait la même illustration comme un faux sprite en mouvement (c’est maintenant la ligne "(2D platformer)"
  du README) ; `legal` remontrait les en-têtes de dépôt de `boot` (ce sont maintenant les deux vraies preuves « pas de jeux ») ; `why` a gagné la cause de
  `missing` (trois appels à la console restés sur la feuille de code deviennent les câbles du tableau) et a perdu la deuxième puce de PC
  et la porte PS3 restante.

## Index de refs/ (récupéré le 2026-10-09)

- `refs/covers/` : GTA V, Spider-Man Miles Morales, Silent Hill 2, illustration principale de Dreaming Sarah (Steam 600x900 @2x), plus
  les jaquettes d’édition PS de Wikipédia (basse résolution, pour la référence de la bande PS5).
- `refs/logos/` : logo de l’organisation KytyPS5, avatar d’AnyPS5 (boykopovar), PlayStation, logotype PS5, Vulkan, Windows, Tux,
  Intel, AMD, NVIDIA, GitHub (svg de Wikimedia, png de logo.dev).
- `refs/captures/` : page du dépôt KytyPS5, page du dépôt AnyPS5, Releases de KytyPS5, kytyps5.github.io, COMPATIBILITY.md
  d’AnyPS5, mise à jour hebdomadaire #887, graphique des contributeurs (captures Jina, 1280 px).
- `refs/kyty/` : README.md, releases.tsv (les 408 tags + dates), contributors.tsv + 84 avatars, weekly-862/887.json,
  sh2-fps6.jpg (barre de titre fps: 6), sh2-pr654-a/b.png, ufc5-weekly.jpg, captures du README ps5-01..06, libPad.cpp,
  libSaveData.cpp, libAudio.cpp, audio.cpp, issue-810.json (rapport GTA V), tree.txt.
- `refs/anyps5/` : README.md, COMPATIBILITY.md, USAGE.md, ARCHITECTURE.md, badges de statut + progress.svg.
- `refs/hardware/` : puce Cell de la PS3, console PS3, PS5 + DualSense, GTX 1050 Ti (Wikimedia Commons).

## Révision du corps 2026-10-09 (sa note sur 26-60 s : pas de pastilles, de vrais jeux)

- Aucune pastille de statut nulle part : `WHILE YOU PLAY` et `BEFORE YOU PLAY` ont disparu, `on PC` et `$0 · GPL-2.0` sont du texte simple.
- `missing` : la vraie photo de la PS5 se tient dans le contour sur "console", puis part, laissant le contour en pointillés ; sur "PC", l’écran
  du PC monte sous le tableau, éteint ; la carte graphique y est câblée.
- `kyty` : le même écran s’allume sur "play" (le vrai lanceur de KytyPS5, puis Astro Bot qui tourne, vraie capture) et le
  jeu continue de tourner pendant que les appels reçoivent une réponse : c’est ça, "while you play". La carte de shader se soulève au-dessus du tableau
  atténué ; sur "speaks", le câble d’affichage s’allume. À partir de "works" : de vraies captures de KytyPS5 par mot (Astro Bot, God of War
  Sons of Sparta sur "games", GTA V sur "playable" à côté de #810), Silent Hill 2 sur "Silent" avec la propre barre de titre de la fenêtre
  qui affiche fps 6 sur "6" (la loupe est la même capture zoomée). "not" : la première scène est une vraie miniature d’Astro Bot.
- `anyps5` : "before" est une frise, le bloc de conversion d’abord et la marque de lecture après ; la tête de lecture reste dans la
  conversion et atteint la lecture sur "double-click".
- Clips (assets/kyty-clip-*.mp4, H.264 -g 1, sans le son) : KSd7ZDaWMXk 30.4-31.45 + 31.4-44.2 (Christo Gevedjov),
  1uc2yO7L4Zs 95.0-97.6 (Zatt), KEmNUR46uCI 532.0-535.5 (KimiSha19), eQ7PKfK4q_w 309.6-313.8 (PSXTech, 1080p).
