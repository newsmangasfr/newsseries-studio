# Plan visuel, touchscreen ("Your phone screen reacts to the lightest brush of your finger")

approved: (waiting)

Lis la partie droite de chaque ligne seule : elle doit raconter à nouveau le script. Chaque événement est lié à un mot prononcé
(« se pose sur » = un événement sur le mot, « finit sur » = une construction qui s’achève dessus). Script : `script.txt`, son script,
mot pour mot, pris pour vrai. Les ids de scène et les fonds sont ceux de `caption.txt`. Les temps viennent de `words.json`
(voix off verrouillée, 84.5 s). Faits : `facts.md` (le bloc « Ajouté pour le plan visuel » contient chaque chiffre que ce plan met à
l’écran). Matière récupérée : `assets/refs/`, `assets/logos/`. Type de vidéo : explication du quotidien
(`.agents/skills/full-visual/references/taste.md`, les sections 3 à 5 sont le niveau exigé ; la coupe de l’Apple Watch est le modèle).

## Une fois pour toute la vidéo

- **L’idée fausse qu’on tue : « l’écran me sent appuyer ».** Chaque scène est la même preuve vue d’un autre côté : ce qui
  compte, c’est que de la charge quitte un croisement, jamais la force avec laquelle quoi que ce soit appuie.
- **Un seul monde, trois échelles, visitées tour à tour.**
  1. **La coupe** (l’intérieur) : l’iPhone ouvert vu par la tranche, comme dans la vidéo sur l’Apple Watch. De haut en bas : le verre de
     protection avec son bord biseauté et un vrai reflet, la fine couche tactile avec les fils vus en bout (les colonnes comme
     de petits points brillants, une ligne comme un long trait sous eux), la dalle OLED avec ses sous-pixels rouges, verts et bleus
     allumés, le cadre en acier. Ordre des couches lu sur `refs/rewa-iphone-x-oled-layers.jpg` (verre, dalle
     tactile, dalle OLED) et `refs/ifixit-iphone-x-screen.jpg`. Un bout de doigt au-dessus est un vrai bout de doigt : crêtes de la peau,
     ongle, le rose de la pulpe (`refs/wikimedia-fingertips-macro.jpg`).
  2. **La grille** (ce que le téléphone voit) : l’écran sans le verre, lignes et colonnes selon le vrai motif en losanges
     (`refs/canvys-pcap-diamond-sensor.jpg`, `refs/semanticscholar-electrode-patterns.png`,
     `refs/microtouch-capacitive-technology-chart.jpg`). À plat, vue de dessus, dans `grid` ; en trois-quarts bas dans
     `touch`, pour qu’on puisse lire la hauteur de la charge au-dessus de chaque croisement. L’image qu’a le téléphone d’un appui est la vraie :
     un nombre par croisement (`refs/mtkit-raw-capacitive-image.jpg`).
  3. **La main en hiver** (la scène vécue) : un vrai iPhone 17 (`refs/wikimedia-iphone-17-vector.svg`,
     `refs/apple-iphone-17-og.png`) tenu dans un gant en laine gris (`refs/glove-touchscreen-wirecutter.jpg`), la neige qui tombe,
     le vrai écran d’appel entrant verrouillé qui sonne (`refs/ios17-locked-slide-to-answer-gadgethacks.webp` : nom de l’appelant
     en haut à gauche avec un portrait, `slide to answer` avec le bouton blanc et le combiné vert). L’appelante est `Sofia`, avec
     le portrait `refs/face-sofia.jpg`. Cette scène revient quatre fois : le gant échoue (`winter`), l’appel est manqué
     (`glove`), elle rappelle (`thread`), le bouton glisse enfin (`close`).
- **L’objet fil rouge : l’appel auquel on ne peut pas répondre.** `slide to answer` est à l’écran dans `winter`, ne bouge pas
  dans `glove`, sonne à nouveau dans `thread` et glisse dans la première seconde de `close`. Le bouton est la barre de progression
  de la vidéo : le spectateur attend 57 secondes qu’il bouge.
- **La chose invisible a une forme et une couleur pour toute la vidéo : la charge est en or chaud (`#FFC233`).** Elle est dessinée comme un
  petit faisceau de filaments lumineux qui forment une arche depuis la ligne, montent à travers le verre et redescendent vers la colonne à chaque
  croisement (le champ de bord, comme dans `refs/atmel-mutual-capacitance-measurement.jpg`), avec une pulsation lente qui voyage
  le long. Les filaments ont du poids : ils s’affaissent, s’étirent et reviennent en place. Tout le reste est désaturé (verre graphite,
  laine grise, peau pâle), pour que l’or soit la seule chose qui attire l’œil. Les vraies couleurs d’interface (le combiné vert, les
  icônes d’apps) gardent leur couleur et restent petites. Pas de deuxième accent, pas de trait rouge.
- **Il n’y a pas de deuxième forme pour la charge.** Le creux que le téléphone voit, ce sont les mêmes filaments, moins hauts au-dessus des
  croisements touchés, avec un nombre plus bas sur chaque croisement. Pas de nappe dorée, pas de graphique de surface, pas de creux dans un matelas,
  pas de barres. Un appui que le téléphone a accepté est un fin anneau blanc sur l’écran, rien d’autre.
- **Le même squelette en quatre étapes pour chaque cas, et le dernier cas le casse.** Quelque chose s’approche du verre, les
  filaments se penchent vers lui ou pas, les nombres sur les croisements baissent ou restent, l’iPhone réagit
  ou pas. Doigt nu : se penchent, baissent, réagit. Gant : rien, rien, rien. Goutte de pluie : se penchent, baissent, réagit
  tout seul. Fil : la rupture, la charge voyage le long d’un fil à travers la laine jusqu’à la peau, et le bouton glisse.
- **Chaque retour à la coupe a un nouveau héros, avec un nouveau cadrage.** La coupe est le monde, jamais deux fois la même image :

  | Scène | Ce qui remplit le cadre | Ce qu’on voit pour la première fois |
  |---|---|---|
  | `answer` | la pointe en laiton du stylo sur le verre, puis le bout du doigt | appuyer ne fait rien, effleurer fait tout |
  | `finger` | l’intérieur du bout du doigt, puis la pulpe au-dessus de trois croisements | l’eau salée qui fait passer la charge ; les filaments qui partent vers la peau |
  | `glove` | le tricot, maille par maille, entre la peau et le verre | la charge qui s’arrête à la laine |
  | `rain` | une goutte bombée | l’eau qui fait exactement ce que le doigt faisait |
  | `thread` | un fil enrobé de métal qui traverse la laine | la charge qui trouve un passage |
  | `close` | un croisement, un filament | la seule chose qui a disparu |

- **Une comparaison, c’est la même image deux fois.** Le doigt à côté du stylo (`answer`), le gant à côté du fantôme du doigt nu
  (`glove`), la goutte à côté du fantôme du doigt (`rain`) : même coupe, même cadrage, seule la chose au-dessus du
  verre change.
- **Uniquement de vrais chiffres, chacun avec une petite ligne de source grise** (tirés de `facts.md`) : `120 scans a second` (Apple, iPhone X
  et plus récents), `less than 1 pF` (Texas Instruments). `10 x 15 = 150 crossings` n’est PAS utilisé à l’écran (on dessine la
  grille du téléphone, dont on ne connaît pas le vrai nombre). Les valeurs sur les croisements (`100`, `62`, `81`, `84`, `71`) sont
  illustratives et étiquetées comme telles. Aucune distance, épaisseur ou espace ne reçoit jamais de chiffre.
- **Petites étiquettes honnêtes**, en bas à gauche de la scène, une à la fois, 24 px gris : `Magnified illustration`,
  `Charge shown in gold, invisible to the eye`, `The wires are transparent in a real phone`, `Grid spacing
  illustrative`, `Values illustrative`.
- **Les étiquettes sont un mot et un filet, sur la chose, au moment du mot.** `ROW`, `COLUMN`, `CROSSING`, `CHARGE`, `WOOL`,
  `CONDUCTIVE THREAD`. Une seule étiquette se pose à la fois, et jamais dans la même demi-seconde qu’une étiquette de coin ou un chiffre. Pas de pastille,
  pas de point, pas de carte autour.
- **Fonds :** sombres toute la vidéo, un presque-noir avec une légère teinte bleue froide (nuit d’hiver). La coupe est éclairée par
  l’OLED en dessous, qui éclaire la scène comme un plateau de théâtre. Des flocons tombent lentement au fond de chaque
  plan d’extérieur et continuent de tomber, très atténués, derrière la coupe aussi, pour que le monde ne change jamais.
- **Le seul grand mouvement : `finger`, sur "pulls".** Le bout du doigt descend et les filaments sous lui s’arrachent de leur
  croisement et fouettent vers le haut à travers le verre jusque dans la peau, avec étirement, dépassement et un recul qui se propage dans les
  filaments voisins. C’est la réponse de la vidéo, jouée. Rien d’autre dans le corps n’est aussi fort.
- **Rien n’apparaît par magie.** Un gant est enfilé par une main ou arrive sur une main, la laine n’est jamais tricotée à partir de rien,
  un objet part en étant soulevé. La seule licence, c’est la coupe elle-même et les choses qui deviennent transparentes.
- **Mouvement :** quelque chose bouge dans chaque image : la pulsation le long des filaments, la ligne de lecture, la neige, l’écran
  qui sonne, les sous-titres. Le passage d’une échelle à l’autre est une seule poussée ou un seul recul continu dans le même monde (à travers le verre,
  hors du verre, en remontant le doigt jusqu’à la main), jamais une coupe, jamais un fondu vers un nouveau monde. Les douze premières
  secondes portent le plus d’événements : aucun creux de plus d’une demi-seconde sans un nouvel événement.
- **Habillage épinglé :** aucun (`reel.json`).

## Scène par scène

### 1. `hook`, sombre, 0.1 à 6.0 s
"Your phone screen reacts to the lightest brush of your finger and ignores a pen pressed as hard as you can."

Cinq variantes, construites séparément. Les cinq répondent au même niveau exigé (section 3 de l’explication du quotidien, l’ouverture
de l’Apple Watch) :

- L’image 0 est la coupe bord à bord, déjà vivante : sous-pixels OLED allumés, filaments dorés qui pulsent au-dessus de chaque
  croisement, un vrai bout de doigt déjà en train de descendre, la neige qui dérive loin derrière. Jamais un fond vide, jamais le
  téléphone en photo produit, jamais un titre.
- Le mécanisme se joue une fois dans la première seconde : entre 0.6 et 1.0 s, les filaments sous le doigt se sont penchés vers le haut
  dans la peau et les pixels en dessous se sont embrasés (l’écran a réagi), avant que "reacts" soit fini.
- Un nouvel événement toutes les 0.2 à 0.4 s pendant quatre secondes. Trois étiquettes à filet dans les 2.5 premières secondes, une à la fois : `GLASS`,
  `WIRES`, `CHARGE`. Étiquette de coin : `Magnified illustration`.
- Les mots joués sur l’objet : "lightest brush", c’est une pulpe qui effleure à peine le verre, "ignores", c’est le stylo qui arrive
  et les filaments sous lui qui restent à plat, "hard", c’est le corps du stylo qui plie.
- Un seul changement d’échelle franc sur la deuxième proposition ("and ignores a pen", 3.5 à 4.4 s), dans la même coupe : de
  toute la largeur du téléphone à la pointe du stylo. Jamais un nouveau monde.

Relais : la coupe, serrée sur la moitié droite : le stylo (`refs/wikimedia-bic-cristal.jpg`) qui appuie, filaments
à plat sous lui ; le bout du doigt nu posé légèrement à gauche, ses filaments penchés dans la peau.

### 2. `answer`, sombre, 6.3 à 12.4 s
"So what is it actually feeling? It isn't really feeling pressure, it's measuring the electricity in your body."

La chose réelle : la pointe en laiton et la bille du stylo sur le verre (`refs/wikimedia-bic-cristal.jpg` : la pointe, le corps
hexagonal transparent, le tube d’encre), puis le bout du doigt à sa place. Verbe : appuyer contre mesurer. Déjà à l’écran : la
coupe de l’accroche. Onze événements en six secondes.

- "So" (6.30) → le bout du doigt à gauche se lève et sort du cadre ; ses filaments retombent sur leurs croisements avec un
  petit rebond. Le stylo est seul.
- "what" (6.50) → la vue avance jusqu’à ce que la pointe en laiton et sa bille remplissent la moitié haute, la couche tactile et les
  pixels la moitié basse.
- "actually" (7.26) → le stylo appuie de tout son poids : le corps plie, le tube d’encre se courbe dedans, la bille s’enfonce.
- "feeling?" (7.76) → se pose sur : un filet tracé le long de la face supérieure du verre sous la bille reste parfaitement droit.
  Le verre ne cède pas.
- "isn't" (8.46) → une deuxième poussée, plus forte ; la main derrière le stylo tremble. Les sous-pixels sous la pointe gardent leur
  couleur, inchangée.
- "really" (8.80) → l’œil est emmené vers l’or : les filaments juste sous la bille s’éclairent un peu pour qu’on
  les regarde. Ils gardent leur pulsation lente, parfaitement à plat.
- "pressure," (9.54) → se pose sur : le stylo se soulève et quitte le cadre. Un petit point d’encre bleue reste sur le verre.
  En dessous, rien n’a jamais bougé.
- "it's" (10.14) → le bout du doigt nu entre par le haut à gauche, déjà en train de descendre, lentement.
- "measuring" (10.38) → se pose sur : une fine ligne de lecture blanche court le long de la ligne sous le verre et chaque croisement
  clignote quand il est lu. Le téléphone lisait depuis le début.
- "electricity" (10.90) → se pose sur : la pulpe ne fait qu’effleurer le verre (elle s’aplatit à peine) et chaque filament sous elle
  se penche vers le haut dans la peau ; l’or passe au maximum pour la première fois, et les sous-pixels en dessous s’embrasent : l’écran
  a réagi. Même cadrage que le stylo, même verre, le résultat inverse.
- "your" (11.84) → la vue commence à reculer le long du doigt.
- "body." (12.00) → finit sur : l’or remonte faiblement à travers le bout du doigt, l’articulation, la main, le poignet, et
  s’efface dans une manche de manteau couverte de neige. Le corps fait partie du circuit.

Relais : la main droite nue au-dessus du téléphone, vue en entier pour la première fois, le téléphone tenu dans une main gauche gantée.

### 3. `winter`, sombre, 12.7 à 15.9 s
"Imagine it's winter and you're trying to answer a call with your gloves on."

La chose réelle : la main en hiver, échelle 3. Verbe : essayer de répondre. Déjà à l’écran : le téléphone dans une main gauche
gantée, la main droite nue au-dessus.

- "Imagine" (12.68) → la main droite nue s’éloigne et sort du cadre par la droite ; le recul se pose sur le
  téléphone dans le gant en laine gris.
- "winter" (13.24) → se pose sur : la neige s’épaissit, une buée de souffle traverse le cadre une fois, deux flocons se posent sur le verre
  et fondent.
- "trying" (14.00) → la main droite revient, maintenant dans son propre gant gris, pouce en premier.
- "call" (14.74) → se pose sur : l’écran s’allume avec le vrai écran d’appel verrouillé : `Sofia` et son portrait en haut à gauche,
  `mobile` dessous, `slide to answer` avec son reflet qui court de gauche à droite, le téléphone qui vibre (deux secousses courtes).
- "gloves" (15.32) → le pouce ganté se pose sur le bouton blanc et le fait glisser vers la droite. Le bouton ne suit pas. Le reflet
  continue de courir sous la laine.
- "on." (15.68) → le pouce glisse une deuxième fois, plus fort, la laine s’écrasant sur le verre. Rien.

Relais : le pouce appuyé sur le verre, le bouton toujours à gauche.

### 4. `grid`, sombre, 16.2 à 30.1 s
"Under the glass of your phone there's a grid of wires you can't see, rows going one way and columns going the other.
Everywhere a row crosses a column, the phone holds a tiny electric charge, and it checks every one of those crossings
over and over."

La chose réelle : la couche tactile de l’écran, échelle 2, à plat vue de dessus, puis un croisement en macro. Sources :
`refs/canvys-pcap-diamond-sensor.jpg`, `refs/semanticscholar-electrode-patterns.png`,
`refs/wikimedia-projected-capacitive-diagram.svg`, `refs/wikimedia-capacitive-touchscreen-phone.jpg` (un vrai capteur
dont on voit les losanges), fréquence de balayage tirée du tableau d’Apple. Verbe : garder, puis vérifier. Déjà à l’écran : le téléphone dans
le gant.

- "Under" (16.20) → la vue plonge vers l’écran : les pixels de l’écran d’appel grossissent, et le téléphone se met à plat face à nous.
- "glass" (16.52) → se pose sur : le verre de protection se soulève vers nous comme une seule dalle épaisse et transparente (biseau, reflet, les deux
  flocons fondus toujours dessus). Le pouce ganté part avec elle.
- "phone" (17.08) → la dalle glisse vers le haut et se range, fine, le long du haut de la scène. L’écran d’appel reste à nu.
- "grid" (17.86) → se pose sur : une barre de lumière rasante balaie l’écran, et dans la barre tout le réseau de
  losanges apparaît, net, pendant un tiers de seconde (le vrai aspect de `wikimedia-capacitive-touchscreen-phone.jpg`
  incliné sous une lampe).
- "wires" (18.30) → la lumière avance ; derrière elle, le réseau s’amincit jusqu’à un simple reflet.
- "can't" (18.88) → se pose sur : la lumière est partie et la grille aussi. Seul l’écran d’appel, qui sonne.
- "see," (19.20) → l’écran d’appel s’atténue à 15 % et le réseau se rallume en gris pâle, pour rester. Étiquette de coin : `The wires are
  transparent in a real phone`.
- "rows" (19.62) → finit sur "way" : les lignes se tracent de gauche à droite, l’une après l’autre depuis le haut, chacune une chaîne de
  petits losanges. Étiquette `ROW` sur l’une d’elles.
- "columns" (21.10) → finit sur "other." : les colonnes se tracent de haut en bas, leurs losanges s’emboîtant entre ceux des lignes.
  Étiquette `COLUMN`.
- "Everywhere" (22.40) → chaque croisement reçoit un point lumineux, en vague du coin haut gauche au coin bas droit.
- "crosses" (23.34) → se pose sur : une avancée franche sur un croisement, quarante fois plus près, incliné pour avoir de la profondeur : deux losanges
  de ligne reliés par un col fin, la colonne passant par-dessus sur un minuscule pont, un espace net entre eux. Étiquette
  `CROSSING`, finit sur "column,". Étiquette de coin ensuite : `Magnified illustration`.
- "holds" (24.98) → la ligne s’allume depuis la gauche : une pulsation dorée arrive le long d’elle.
- "tiny" (25.34) → le premier filament sort du losange de la ligne et forme une arche au-dessus de l’espace.
- "charge," (26.34) → finit sur : une douzaine de filaments forment maintenant une arche depuis les losanges de la ligne jusqu’aux losanges de la colonne,
  légèrement affaissés, la pulsation courant le long de chacun. Étiquette `CHARGE`. Étiquette de coin ensuite : `Charge shown in gold, invisible to
  the eye`.
- "checks" (27.24) → se pose sur : une fine ligne de lecture blanche passe sur le croisement et y laisse un petit nombre :
  `100`. C’est ce que le téléphone a retenu de ce coup d’œil.
- "every" (27.66) → recul jusqu’à la grille entière : chaque croisement porte sa petite arche d’or ; la ligne de lecture
  descend ligne par ligne et laisse un `100` sur chaque croisement en passant. Finit sur "crossings". Étiquette de coin : `Values
  illustrative`.
- "over" (29.12) → le balayage atteint le bas et repart du haut, deux fois plus vite.
- "over." (29.82) → finit sur : le balayage devient un scintillement trop rapide pour être suivi ; un compteur à côté de la grille défile et se pose
  sur `120 scans a second`, ligne grise `Apple, iPhone X and later`.

Relais : la grille entière, qui scintille, chaque croisement à `100`.

### 5. `finger`, sombre, 30.4 à 40.0 s
"Your body is mostly salty water, so it conducts electricity. When your bare fingertip gets close to the glass, it
pulls a little of that charge away from the crossings right under it."

La chose réelle : l’intérieur d’un bout de doigt, puis la pulpe au-dessus de trois croisements, échelle 1, plus près que `answer` n’est jamais
allé. Sources : `refs/wikimedia-fingertips-macro.jpg`, `refs/atmel-mutual-capacitance-measurement.jpg` (les lignes de
champ qui se courbent vers le doigt), lignes TI et MicroTouch dans `facts.md`. Verbe : arracher. Déjà à l’écran : la grille.

- "body" (30.58) → la grille bascule en arrière dans la coupe (on est de nouveau par la tranche, le verre rangé redescend sur
  les couches et les scelle), et un bout de doigt nu entre par le haut, grand, s’arrêtant bien au-dessus du verre.
- "salty" (31.40) → se pose sur : la peau du bout du doigt devient vitreuse et on voit dedans : de l’eau, avec de petits ions
  qui y dérivent, chacun marqué `Na+` ou `Cl−`, lentement, dans toutes les directions. Étiquette de coin : `Magnified illustration`.
- "water," (31.80) → une ondulation la traverse ; les ions dansent.
- "conducts" (32.54) → se pose sur : une légère poussée dorée entre par le haut du doigt et tous les ions se décalent dans le même
  sens d’un coup, faisant passer la poussée jusqu’à la pulpe, qui s’illumine. La cause est à l’écran : parce qu’il y a
  du sel dans l’eau, la charge peut te traverser.
- "electricity." (32.98) → la peau se referme en vraie peau, seule la pulpe garde une légère chaleur dorée.
- "bare" (34.14) → les crêtes de l’empreinte deviennent nettes, un fil de lumière sur l’ongle.
- "fingertip" (34.46) → le bout du doigt commence à descendre ; la vue se resserre sur la pulpe et les trois croisements dessous.
- "close" (35.30) → se pose sur : la pulpe s’arrête avec un espace d’air net au-dessus du verre, et les filaments sous elle
  se penchent déjà vers elle, s’étirant vers le haut dans le verre. Rien n’a encore rien touché.
- "glass," (35.78) → la pulpe se pose et s’aplatit légèrement sur le verre. Les fils sont toujours à une épaisseur de verre entière
  en dessous : le doigt ne touche jamais un fil.
- "pulls" (36.60) → se pose sur : LE GRAND MOUVEMENT. Les filaments des croisements sous la pulpe s’arrachent de leurs losanges de
  colonne et fouettent vers le haut à travers le verre jusque dans la peau, s’étirant, dépassant, se stabilisant. La lueur dans la pulpe
  bondit. Une onde de recul court le long des filaments voisins à gauche et à droite, qui restent sur leurs croisements.
- "little" (37.02) → pas tous : à chaque croisement sous le doigt, trois ou quatre filaments sont montés, les autres
  forment toujours une arche de la ligne à la colonne, plus fins et plus bas.
- "away" (38.16) → finit sur : les nombres sur ces croisements descendent, `100` à `62` au centre, `81` et `84`
  à côté. Étiquette de coin : `Values illustrative`.
- "under" (39.64) → se pose sur : un crochet doux marque les trois croisements sous la pulpe ; tous les autres croisements de la
  ligne affichent toujours `100`, à plat, en pulsation.

Relais : la pulpe posée sur le verre, trois croisements avec des nombres plus bas.

### 6. `touch`, sombre, 40.4 à 50.9 s
"The phone sees a small dip at those exact crossings and says, that's a touch. And because it measures every crossing
separately, it can follow two fingers at once, which is how you pinch to zoom."

La chose réelle : la grille en trois-quarts bas sans le verre, un nombre et ses arches dorées sur chaque
croisement (l’image tactile brute du téléphone, `refs/mtkit-raw-capacitive-image.jpg`), puis la vraie app Photos sous deux
vrais bouts de doigts (`logos/apple-photos-icon.png`). Verbe : voir, puis suivre. Déjà à l’écran : la pulpe et trois nombres
plus bas. Nouveau ici : la charge vue comme un champ avec un creux dedans, et ce que le téléphone fait de ce creux.

- "phone" (40.54) → la vue sort de la coupe en montant et pivote vers un angle bas au-dessus de la grille : un champ de
  petites arches dorées, toutes de la même hauteur, un `100` sur chaque croisement. Le doigt s’amincit en un léger contour : le téléphone
  n’a aucune image d’un doigt, seulement de ce champ.
- "sees" (40.92) → la ligne de lecture balaie le champ une fois.
- "dip" (41.64) → se pose sur : sous le contour, les arches sont moins hautes, celle du centre plus basse d’un tiers avec `62`,
  l’anneau autour à `81` et `84`. Sous cet angle, c’est un creux dans le champ. C’est ça, le creux, fait de la
  charge elle-même.
- "exact" (42.20) → finit sur "crossings" : les losanges des neuf croisements qui ont bougé pâlissent sur la grille ; le
  reste de la grille s’atténue d’un cran.
- "says," (43.54) → le téléphone calcule le milieu du creux : deux filets se resserrent depuis les bords, l’un le long
  des lignes, l’autre le long des colonnes, et se croisent entre les fils, plus fin que la grille.
- "touch." (44.34) → se pose sur : un fin anneau blanc s’accroche sur ce point de croisement. L’écran se réveille sous la grille pendant
  une demi-seconde : l’anneau est posé sur le bouton de `slide to answer`, et le bouton s’allume dessous. C’est ce que le
  gant doit produire.
- "measures" (45.46) → l’écran s’atténue à nouveau ; la ligne de lecture ralentit nettement.
- "every" (45.94) → finit sur "separately," : elle s’arrête sur un croisement à la fois et chacun répond avec son propre nombre :
  `100`, `100`, `84`, `62`, `81`, `100`. Aucun croisement ne partage une lecture avec son voisin.
- "two" (48.10) → se pose sur : parce que chacun est lu seul, un deuxième creux peut exister dans le même champ : il se creuse
  en bas à droite, avec ses propres nombres bas et son propre anneau. Deux contours de doigts au-dessus.
- "once," (48.92) → les deux anneaux dérivent un peu, indépendamment ; chaque creux voyage sous son anneau, les arches
  raccourcissant devant lui et regrandissant derrière.
- "pinch" (50.02) → se pose sur : l’écran revient à pleine luminosité et la grille s’efface à un dixième : la vraie app
  Photos, une photo en plein écran (une rue enneigée). Les deux contours se remplissent en un vrai pouce et un vrai index, pulpes sur les
  deux anneaux, qui s’écartent.
- "zoom." (50.56) → finit sur : la photo s’agrandit avec les doigts, exactement autant qu’ils se déplacent.

Relais : le téléphone, de face, la photo zoomée, deux bouts de doigts dessus.

### 7. `glove`, sombre, 51.2 à 59.3 s
"But your glove doesn't conduct anything. So your finger is right there, pressing on the glass, and the charge never
moves. For the phone, nobody touched it."

La chose réelle : le tricot d’un gant en laine en macro, maille par maille, entre la peau et le verre (même coupe que `finger`,
mais la laine est le héros et remplit le cadre) ; puis l’écran d’appel. Sources : `refs/glove-touchscreen-wirecutter.jpg`,
`refs/wikimedia-isotoner-touch-gloves.jpg` (le tricot), la ligne ktcplay dans `facts.md`. Verbe : rien ne bouge (chaque
étape du squelette échoue). Déjà à l’écran : le téléphone de face.

- "But" (51.22) → les deux doigts se lèvent, la photo se ferme, le téléphone bascule par la tranche : la coupe, filaments de retour
  sur leurs croisements, chaque nombre revenu à `100`.
- "glove" (51.54) → se pose sur : un bout de doigt ganté descend dans le cadre par le haut et s’arrête au-dessus du verre, assez
  près pour que le tricot remplisse la moitié haute : du vrai fil, duveteux, des mailles avec de l’air entre les fibres. Étiquette `WOOL`.
- "conduct" (52.20) → la laine devient assez transparente pour montrer la pulpe dedans ; la chaleur dorée de la pulpe atteint
  la face intérieure de la laine et s’arrête là : elle s’étale le long de la peau et ne peut entrer dans aucune fibre.
- "anything." (52.60) → se pose sur : le bout de doigt ganté descend et se pose sur le verre.
- "finger" (53.56) → la vue se resserre sur le contact : peau, quelques mailles de fil, verre.
- "there," (54.32) → se pose sur : un crochet à filet couvre la laine de la peau au verre. Quelques fibres, pas plus.
  Les filaments en dessous restent droits.
- "pressing" (54.78) → finit sur "glass," : le doigt appuie : la laine se comprime à la moitié de son épaisseur, le crochet
  se referme avec elle, la pulpe s’aplatit, l’articulation plie sous l’effort, exactement le tremblement du stylo dans `answer`.
- "charge" (56.22) → la ligne de lecture passe dessous ; chaque croisement clignote quand il est lu.
- "never" (56.70) → se pose sur : `100`, `100`, `100`.
- "moves." (56.98) → finit sur : la même image deux fois : le bout du doigt nu de `finger` apparaît à côté du gant à
  40 %, ses filaments montés dans la peau et `62` dessous. Sous le gant, pas un seul filament ne se penche.
- "phone," (57.90) → le fantôme part ; la vue monte tout droit à travers le gant jusqu’à l’écran sur lequel il appuie.
- "nobody" (58.48) → se pose sur : le vrai écran d’appel : le pouce ganté qui glisse sur `slide to answer`, aucun anneau
  dessous, le bouton toujours à gauche.
- "it." (59.16) → l’écran d’appel abandonne : il glisse et le vrai écran verrouillé affiche `Missed Call`, `Sofia`,
  `now`.

Relais : l’écran verrouillé avec l’appel manqué, de la neige sur le verre.

### 8. `rain`, sombre, 59.6 à 65.3 s
"That's also why your screen goes crazy in the rain. Water conducts too, so every drop looks like a finger."

La chose réelle : l’écran d’accueil de l’iPhone sous la pluie, puis une goutte en coupe à côté du doigt, puis l’écran d’accueil
à nouveau. Sources : `refs/wet-phone-freerange.jpg` (comment les gouttes perlent sur le verre), la ligne touchpro dans `facts.md`, les
vraies icônes dans `logos/` (Téléphone, Messages, Plans, Photos, Météo, Instagram). Verbe : ressembler à. Déjà à l’écran : l’écran
verrouillé.

- "That's" (59.64) → la main gantée part ; la neige sur le verre fond en perles.
- "screen" (60.54) → l’écran verrouillé s’ouvre sur le vrai écran d’accueil, six icônes.
- "crazy" (61.12) → se pose sur : une goutte tombe sur Plans et Plans s’ouvre tout seul. Personne ne touche le téléphone.
- "the" (61.64) → une deuxième goutte tombe bas sur l’écran ; Plans se ferme et la page glisse à moitié vers la suivante puis revient.
- "rain." (61.76) → finit sur : une vraie pluie : une douzaine de gouttes qui perlent sur le verre, chacune une vraie lentille qui grossit les
  pixels dessous. Météo se met à trembler comme si on la maintenait appuyée.
- "Water" (62.32) → le téléphone bascule par la tranche, la coupe, serrée sur une goutte : bombée, avec son reflet, les pixels
  déformés dedans.
- "conducts" (62.68) → se pose sur : les filaments sous la goutte se penchent vers le haut dedans, exactement comme pour le doigt,
  et l’or brille dans l’eau.
- "too," (63.18) → le bout du doigt nu de `finger` apparaît à côté de la goutte à 40 %, à la même hauteur : la même
  image deux fois. Sous les deux, les trois mêmes nombres, `81`, `62`, `84`.
- "every" (63.86) → le fantôme part ; la vue remonte vers l’écran d’accueil vu de dessus, une douzaine de perles dessus.
- "drop" (64.18) → des anneaux tactiles blancs commencent à s’accrocher sur les perles, l’un après l’autre.
- "finger." (65.00) → se pose sur : le dernier anneau se pose : chaque goutte porte l’anneau qu’obtient un bout de doigt, et l’écran
  tressaille sous toutes à la fois.

Relais : l’écran d’accueil, une douzaine de gouttes avec anneau sur le verre.

### 9. `thread`, sombre, 65.7 à 72.5 s
"And it's why touchscreen gloves work. They have a thread in the fingertips that conducts, and it carries your body's
electricity to the glass."

La chose réelle : le bout du doigt d’un gant tactile, où le tricot gris devient une pièce métallique plus claire, puis un
fil enrobé d’argent qui traverse la laine en coupe. Sources : `refs/glove-mackweldon-silver-swipe.png` (les pièces pâles
du bout des doigts), `refs/glove-conductive-yarn-etsy.jpg` et `refs/conductive-thread-spool.jpg` (l’aspect du fil),
la ligne Olympia dans `facts.md`. Verbe : transporter. Déjà à l’écran : l’écran d’accueil avec les gouttes à anneau.

- "touchscreen" (66.18) → une main gantée essuie les gouttes du verre d’un seul passage, les anneaux partant avec elles : le
  même gant gris, mais le bout du pouce et de l’index est un tricot plus pâle, légèrement brillant.
- "gloves" (66.72) → le téléphone vibre : le vrai écran d’appel à nouveau, `Sofia`, `slide to answer`. Elle rappelle.
- "work." (67.08) → le pouce va vers le bouton, et la vue avance sur son bout jusqu’à ce que de simples mailles de fil remplissent
  la scène.
- "thread" (67.98) → se pose sur : parmi les mailles de laine grise, un fil est différent : une âme enrobée d’un fin filament
  métallique brillant, qui scintille en tournant. Étiquette `CONDUCTIVE THREAD`.
- "fingertips" (68.52) → la vue bascule vers la coupe, le cadrage de `glove` : peau, laine, verre, et maintenant le fil
  brillant qui traverse le tricot du côté de la peau jusqu’au côté du verre.
- "conducts," (69.26) → se pose sur : la chaleur dorée qui s’arrêtait à la laine dans `glove` trouve le métal et y entre.
- "carries" (70.24) → finit sur "electricity" : l’or descend le long du fil, maille par maille, à travers toute
  l’épaisseur de la laine, et arrive à sa face extérieure.
- "glass." (72.06) → se pose sur : le bout du fil est sur le verre, et les filaments en dessous fouettent vers lui ; le nombre
  dessous baisse, `100` à `71`. Les deux premières étapes du squelette se produisent enfin à travers un gant.

Relais : la coupe, un chemin doré de la peau à travers la laine jusqu’aux fils.

### 10. `close`, sombre, 72.9 à 79.6 s
"So your screen never felt your finger. It felt a tiny bit of charge go missing, and your finger was just the thing
that took it."

La chose réelle : le bouton qui glisse enfin, puis le premier plan de la vidéo, résolu : un bout de doigt, un croisement,
un filament. Source : TI, "less than 1pF". Verbe : prendre. Déjà à l’écran : la coupe avec le fil. "felt",
"your" et "finger" sont chacun prononcés plus d’une fois ici : les temps ci-dessous disent lequel.

- "So" (72.86) → la vue recule en remontant le pouce jusqu’à la main et au téléphone : un anneau sous le pouce, le pouce
  glisse, et le bouton de `slide to answer` le suit jusqu’au bout à droite.
- "screen" (73.24) → se pose sur : l’appel se connecte : `Sofia`, `00:01`. L’attente est finie.
- "never" (73.84) → la vue replonge sous le pouce dans la coupe : la pulpe appuie fort, et le filet
  le long du haut du verre reste parfaitement droit, comme sous le stylo. La laine et son fil s’amincissent jusqu’à un
  contour.
- "finger." (74.58) → se pose sur : le doigt s’amincit aussi jusqu’à un contour pâle. Ce qui reste lumineux, c’est seulement l’or qui
  est monté du croisement. C’est tout ce que le téléphone a jamais eu.
- "tiny" (75.62) → avancée sur un seul croisement : de son faisceau de filaments, exactement un s’est soulevé. Étiquette
  à filet dessus : `less than 1 pF`, ligne grise `Texas Instruments`.
- "charge" (76.30) → le nombre sur ce croisement commence à descendre.
- "missing," (76.92) → se pose sur : le nombre s’arrête, et dans le faisceau il y a un vide net là où était le filament.
  Tout le reste du cadre s’atténue ; le vide est la seule chose lumineuse.
- "finger" (77.80, le second) → la vue suit le filament soulevé vers le haut à travers le verre ; le contour se remplit
  à nouveau pour devenir le bout du doigt nu du premier plan, en vraie peau.
- "took" (79.24) → se pose sur : l’unique filament doré est dans le bout du doigt, enroulé, lumineux, retenu là.

Relais : le bout du doigt avec son filament, le téléphone dessous.

### 11. `cta`, sombre, 79.9 à 83.7 s
"Follow me, and send this to someone whose phone never works with wet hands."

La chose réelle : cette vidéo sur Instagram, sur le même iPhone (`logos/instagram-logo.png`, `assets/avatar-creator.png` ;
la géométrie de la page de la vidéo telle que construite dans `lg-tv-spy/scenes/CommentCtaSheet.tsx` : ligne du compte avec `Follow`, la colonne
d’actions, la feuille de partage). Le curseur est le vrai bout du doigt, et chaque appui porte l’anneau tactile blanc. Verbe : suivre,
envoyer.

- "Follow" (79.90) → se pose sur : le téléphone se tourne de face, la page de la vidéo dessus ; le bout du doigt nu (portant toujours son
  filament doré) tape `Follow` à côté de `your.handle`. Un anneau clignote sous l’appui, le bouton devient `Following`.
- "send" (80.80) → se pose sur : le bout du doigt tape l’avion en papier ; la feuille de partage monte avec une rangée de portraits.
- "someone" (81.28) → il tape le premier portrait (`Sofia`), une coche se pose sur elle, `Send` s’allume.
- "never" (82.30) → des gouttes tombent sur le verre par-dessus la feuille.
- "wet" (83.12) → se pose sur : le bout du doigt, mouillé maintenant, va vers `Send` : des anneaux surgissent sous les gouttes autour de lui et la
  feuille tressaute une fois. Son propre appui passe : `Sent`.
- dernière image, en pause : le téléphone avec `Following` et `Sent`, des gouttes sur le verre portant chacune un petit anneau.

## Ce qu’un constructeur ne doit pas faire

- Pas d’étiquettes en pastille, pas de point devant une étiquette, pas de cartes, pas de lignes en pointillés, pas de panneau dépoli, pas de graphique en barres colorées pour les
  nombres, pas de nappe dorée ni de graphique de surface (le creux, ce sont des filaments plus courts et des nombres plus bas sur la vraie grille).
- Pas de deuxième couleur d’accent, pas de rature rouge. La négation se montre par l’immobilité à côté de l’effort, et par une ligne qui reste
  droite.
- Pas de main dessinée à la place d’une vraie : bout de doigt, gant, stylo et gouttes ont l’air réels, éclairés par l’écran.
- Rien de tricoté, de poussé ou de matérialisé à partir de rien : les gants arrivent sur des mains.
- Aucun nombre de lignes et de colonnes de l’iPhone, aucune épaisseur de verre, aucun écart entre les fils, aucune distance d’espace écrite à l’écran.
- Un doigt nu sur le verre arrache toujours de la charge. Les filaments ne restent à plat que sous le stylo et sous le gant ordinaire.
- Jamais plus d’une étiquette, étiquette de coin ou nombre qui se pose dans la même demi-seconde.
- Aucun tiret cadratin dans le texte à l’écran. Pas de "reel" dans le texte à l’écran.
- `Sofia` est une appelante inventée avec un portrait synthétique ; aucun vrai nom n’est utilisé.

## Récupéré dans le dossier de la vidéo

`assets/logos/` : `apple.svg`, `apple-phone-icon.png`, `apple-messages-icon.jpg`, `apple-maps-icon.png`,
`apple-photos-icon.png`, `apple-weather-icon.jpg`, `instagram-logo.png`. `assets/avatar-creator.png`.

`assets/refs/` : le téléphone (`wikimedia-iphone-17-vector.svg`, `wikimedia-iphone-16-vector.svg`,
`apple-iphone-17-og.png`), ses couches (`ifixit-iphone-x-screen.jpg`, `ifixit-iphone-13-screen.jpg`,
`rewa-iphone-x-oled-layers.jpg`), la grille (`canvys-pcap-diamond-sensor.jpg`,
`semanticscholar-electrode-patterns.png`, `microtouch-capacitive-technology-chart.jpg`,
`wikimedia-projected-capacitive-diagram.svg`, `wikimedia-capacitive-touchscreen-phone.jpg`), le champ et le creux
(`atmel-mutual-capacitance-measurement.jpg`, `3ds-capacitive-field-simulation.png`,
`mtkit-raw-capacitive-image.jpg`), les écrans d’appel (`ios17-locked-slide-to-answer-gadgethacks.webp`,
`ios14-unlocked-accept-decline-macrumors.png`, `ios17-in-call-screen-reddit.jpg`,
`ios9-incoming-call-slide-to-answer-a.jpg`, `-b.jpg`), le doigt, le stylo et le stylet
(`wikimedia-fingertips-macro.jpg`, `wikimedia-bic-cristal.jpg`, `wikimedia-capacitive-stylus.jpg`), les gants et le
fil (`glove-touchscreen-wirecutter.jpg`, `glove-mackweldon-silver-swipe.png`,
`wikimedia-isotoner-touch-gloves.jpg`, `glove-conductive-yarn-etsy.jpg`, `conductive-thread-spool.jpg`), la pluie
(`wet-phone-freerange.jpg`), l’appelante (`face-sofia.jpg`).

## Passage du critique (2026-10-11), ce qui a changé et pourquoi

- **Répétition :** la nappe dorée avec des creux était l’image principale trois fois (`touch`, `glove`, `rain`) et était une
  métaphore (« des creux dans un matelas ») là où une chose réelle existe. Elle a disparu. Le creux, ce sont les filaments eux-mêmes,
  moins hauts sur la vraie grille, vus une fois sous un angle bas dans `touch` ; `glove` et `rain` finissent sur le vrai écran.
- **Répétition :** la coupe revenait six fois avec le même cadrage. Chaque visite a maintenant son propre héros et son propre cadrage (tableau
  ci-dessus).
- **Dit, pas montré :** "grid" se posait sur un écran vide ; il se pose maintenant sur le réseau pris dans une lumière rasante, perdu sur
  "can't". "never felt" dans `close` montrait un doigt nu qui appuie avec des filaments à plat, ce qui contredisait le
  mécanisme ; la ligne du verre reste droite et le doigt passe en contour à la place.
- **Magie :** le gant qui se tricotait tout seul sur la main (deux fois) est remplacé par des mains gantées qui arrivent.
- **Encombrement :** étiquette, étiquette de coin et nombre ne se posent plus ensemble (`grid` "charge,") ; `CHARGE` et `COVER GLASS` sont sortis
  de `answer` ; la jauge d’espace avec des chiffres inventés est sortie de `finger` ; les neuf traits de rappel sont sortis de `touch` ; `thread`
  ne fait plus le fouet et le bouton sur un seul mot (le bouton ouvre `close`) ; `rain` déclenche une chose par goutte.
- **Cause :** "because it measures every crossing separately" est lu croisement par croisement avant que le deuxième
  doigt n’arrive ; "so it conducts" garde ses ions ; la comparaison doigt nu à côté du gant, promise mais absente, est
  sur "moves.".
- **10 premières secondes :** `answer` passe de six événements à douze, et l’écran lui-même réagit maintenant sous le doigt et non
  sous le stylo. Le niveau exigé de l’accroche est écrit pour les cinq variantes.
- **Histoire :** l’appel était manqué à 59 s et répondu à 72 s sans deuxième appel ; `Sofia` rappelle maintenant sur
  "gloves".
