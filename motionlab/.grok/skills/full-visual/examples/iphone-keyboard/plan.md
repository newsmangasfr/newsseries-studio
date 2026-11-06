# Plan visuel, iphone-keyboard ("Every key on your iPhone keyboard is smaller than your thumb...")

approved: (waiting)

Lis la colonne de droite seule : elle doit raconter à nouveau le script. Chaque événement est lié à un mot prononcé (« se pose sur » = un
événement sur le mot, « finit sur » = une construction qui s’achève dessus). Script : `script.txt`, son script, pris pour vrai.
Voix off : `voice.mp3` + `voice.alignment.json`, 78.6 s, une seule prise, verrouillée. Les ids de scène et les fonds sont ceux de
`caption.txt` (11 scènes, toutes sombres). Type de vidéo : explication du quotidien (`.agents/skills/full-visual/references/taste.md`) : ses
sections 3 à 5 sont le niveau exigé pour chaque scène ci-dessous et pour les cinq accroches.

L’idée fausse du spectateur, en cinq mots : "I'm just good at typing." (« Je tape juste bien. »)

Tout ce qui est nommé ci-dessous est déjà récupéré dans `reels/iphone-keyboard/assets/` (18 MB). Les constructeurs copient ce qu’une scène
utilise dans `full-visual/public/iphone-keyboard/`.

## Une fois pour toute la vidéo

- **Objet fil rouge : un clavier d’iPhone, et ce qu’il y a dessous.** Le vrai clavier iOS en mode sombre, redessiné à sa vraie
  géométrie d’après de vrais écrans (`refs/ios-keyboard-dark-quicktype.jpg`, 1179 x 2676, plus les jumeaux clairs
  `refs/ios-keyboard-light-quicktype.jpg`, `refs/ios-keyboard-light-lowercase.jpg`, et les images d’Apple elles-mêmes
  `refs/apple-support-onscreen-keyboard-1.png`, `-2.png`) : trois rangées de lettres, maj, effacer, 123, espace, retour, la
  barre QuickType avec ses trois cases et ses deux filets, le champ de texte au-dessus, l’indicateur d’accueil en dessous. La police est
  San Francisco (macOS l’a : `/System/Library/Fonts/SFNS.ttf`, CSS `-apple-system`). Il est dessiné, jamais collé,
  parce que chaque touche doit s’enfoncer, chaque capuchon doit se soulever et chaque zone doit bouger.
- **La chose invisible a une forme, une matière et une couleur pour toute la vidéo : la zone de frappe (hit region).** Une cellule
  de lumière ambre chaude sous le verre (orange système d’iOS, `#FF9F0A`), une par lettre, les 26 posées bord à bord
  sans espace. Une cellule est plus large et plus haute que son capuchon : elle possède aussi les bandes sombres autour de la touche. Elle a du poids :
  quand l’une gonfle, ses voisines sont poussées et se bombent, puis se stabilisent. Tout le reste à l’écran est dans les gris du
  clavier lui-même. L’ambre ne sert jamais à rien d’autre. Le nom du brevet lui-même, **"hit region"**, se pose une fois en étiquette avec un
  filet, après avoir été montré (`zone`).
- **La carte des zones est mesurée, pas inventée.** Pour chaque chose tapée à l’écran, la taille de la zone de chaque lettre suit
  la fréquence à laquelle cette lettre vient ensuite en anglais : `assets/data/next-letter.json`, compté à partir du
  `count_1w.txt` de Peter Norvig (les 333,333 mots les plus fréquents du corpus web de Google, `assets/data/count_1w.txt`). Les préfixes
  que le json ne contient pas encore sont comptés de la même façon à partir du même fichier avant qu’une scène ne les utilise (vérifié aujourd’hui :
  après "y", O 76% ; après "yo", U 96% ; après "h", A 28%, O 28%, E 24% ; après "he", A 33%, R 32%, L 25% ; après "what",
  E 70%, S 25% ; après "time", S 80% ; après "works", H 80%). Après "tim", E suit dans 96% des usages, puis B 1%
  (timber), O 1% (timothy), I 1% (timing) ; W s’arrondit à 0%. "timw" n’est pas une ligne de la liste ; "time" est la ligne 50, avec
  908,705,570 usages. Le vrai modèle d’Apple est le sien, donc l’étiquette honnête est à l’écran chaque fois que la carte y est.
- **Petites étiquettes honnêtes** (petit texte gris, un coin de la scène, pas de pastille, pas de point) :
  "Zones drawn visible. On a real iPhone they are invisible." / "Zone sizes from English word counts, not Apple's
  own model." / "Illustrative" (les zones du clavier de 2007) / "US Patent 8,232,973, fig. 8B. Colour added."
  (Zones rendues visibles, invisibles sur un vrai iPhone / tailles tirées de comptages de mots anglais, pas du modèle d’Apple /
  Illustratif / brevet, couleur ajoutée.)
- **Un seul monde, trois échelles, et la vidéo voyage entre elles et revient.**
  - MACRO : deux ou trois touches remplissent la scène (une touche fait environ 330 px de large). Là où un pouce, un point de contact et un bord
    de zone peuvent se lire.
  - SLAB : tout le clavier avec son champ de texte, environ 1000 px de large, y 560-1130. La position de repos, et la dernière
    image de l’accroche.
  - HAND : tout le téléphone, 430 x 930, le fil de Messages au-dessus du clavier. La scène vécue. C’est la seule chose
    autorisée à descendre sous y 1140.
- **La scène vécue : tu écris à une amie.** Messages, vraie géométrie. Sa bulle : "dinner tonight?" (grise, à gauche,
  son portrait `people/friend-sofia.jpg`, nom "Sofia" dans l’en-tête). Tu tapes "what time works". Ça revient
  trois fois : `tim` (T, I, M), `same` (le E se pose, "what time"), `again` (" works", envoyé, "Delivered"). Sa réponse
  "8?" est dans le fil quand le clavier revient dans `close`, et c’est l’amie à qui la vidéo est envoyée dans `cta`.
- **Le pouce est réel.** Un vrai pouce, photographié, détouré, éclairé par le haut avec une ombre de contact douce qui se resserre
  à mesure qu’il descend. Références récupérées : `refs/thumbs-typing-pexels-6669813.jpg`, `refs/thumbs-typing-pexels-6669795.jpg`
  (Pexels, gratuites), `refs/thumb-on-touchscreen-ccby2-intel.jpg` (CC BY 2.0). **Point ouvert pour lui :** aucune des trois
  ne donne un pouce net à la taille MACRO. La meilleure solution, c’est dix secondes de son propre pouce filmé d’en haut sur une feuille blanche ;
  sinon les constructeurs le redessinent de façon photoréaliste à partir de ces trois. Ce que le verre ressent est dessiné comme le brevet
  le dessine : une zone de contact douce et un « + » blanc en son centre, le point de contact (la fig. 8B utilise le même « + »).
- **La bulle de lettre est un vrai comportement, donc elle est là à chaque appui** à partir de `tim`, à sa vraie taille. Avant
  `popup`, elle n’est jamais étiquetée, jamais montrée du doigt et jamais au centre d’une image ; en MACRO avec le pouce sur le
  verre, le cadre est coupé pour que la bulle soit au-dessus du bord haut. `popup` est l’endroit où on fait remarquer la bulle au spectateur.
- **Une nouvelle chose réelle par groupe de phrases, et aucune image principale deux fois :**

  | Scène | Son image unique | Vue nulle part ailleurs |
  |---|---|---|
  | `answer` | le clavier séparé en deux feuilles, inclinées | la séparation |
  | `zone` | un appui qui ne tombe sur aucune touche et qui est rattrapé | le « + » qui tombe à travers le verre |
  | `tim` | la vraie liste de mots, ses lignes qui volent vers la touche de leur lettre suivante | la liste, les piles, la barre de recherche |
  | `grow` | une cellule qui gonfle sous un pouce tenu en l’air | le gonflement, lent, de face |
  | `same` | la même image lumière éteinte, puis allumée : une égalité qui n’en est pas une | les pieds à coulisse, le raté E/W |
  | `again` | une carte du clavier qui en devient quinze, une par caractère du message | la planche de cartes |
  | `first` | l’iPhone de 2007, dix carrés de 44 px qui ne tiennent pas dans 320, puis le dessin du brevet lui-même | le vieux téléphone, le débordement, la fig. 8B |
  | `popup` | un pouce changé en verre, et le vrai interrupteur qui enlève la bulle | la ligne des Réglages |
  | `close` | trois appuis joués deux fois : comme l’œil les a vus, puis comme le clavier les a vus | le retour en arrière |
  | `cta` | son profil Instagram, la feuille de partage, la réponse de l’amie | Instagram |

  Le raté E/W arrive une seule fois, dans `same`. Le gonflement d’une seule cellule arrive une fois en grand, dans `grow`. La carte
  qui se reforme à chaque frappe est un aperçu lointain et incliné dans `answer` et une planche de copies dans `again`, jamais le même
  cadrage.
- **Fonds :** sombres partout, comme le dit `caption.txt`. Presque noir, légèrement chaud, pour que l’ambre soit la seule couleur
  qui attire l’œil. Le seul bleu est la bulle de Messages (et le bouton Follow d’Instagram tout à la fin). Le seul
  rouge est le débordement dans `first`.
- **Le seul grand mouvement (corps) :** dans `answer`, entre "see" et "touch,", le clavier se sépare en profondeur. La feuille des
  capuchons et des lettres se décolle d’un seul tenant comme une fine vitre et reste suspendue au-dessus ; dessous, les zones ambre sont posées là,
  serrées bord à bord. Deux feuilles plates, dessinées en 2D avec une inclinaison et une vraie parallaxe, lourdes, avec une stabilisation. Elles se referment
  à la fin de `zone`, et la vidéo ne refait plus jamais rien d’aussi fort. Ensuite, les zones se voient
  à travers les capuchons comme une radiographie, allumée et éteinte sur le mot.
- **Le seul virage :** à "Apple built this" (`first`), le téléphone moderne rétrécit sur le côté et l’iPhone de 2007 prend
  la scène. C’est la seule fois où le clavier en scène n’est pas celui d’aujourd’hui.
- **Le dernier plan est le premier plan, résolu :** `close` est l’image même de l’accroche (un pouce au-dessus de touches trop petites pour lui),
  jouée une fois comme l’œil la voit et une fois avec la radiographie allumée.
- Pas d’étiquettes en pastille, pas de badges à point, pas de lignes en pointillés, pas de rangées de barres colorées, pas de terminal, pas de flou dépoli, pas de pile
  de cartes. Les étiquettes sont du petit texte simple avec un filet vers la chose. Le texte de preuve fait 32 px ou plus. L’image la plus dense
  contient sept choses, et l’une d’elles est toujours clairement le sujet. Aucun tiret cadratin nulle part à l’écran.

## Scène par scène

### 1. `hook`, sombre, 0.3-5.7 s
"Every key on your iPhone keyboard is smaller than your thumb and you still hit the right letter almost every time."

Cinq variantes, construites séparément. Ce que les cinq doivent aux quatre premières secondes (section 3 de l’explication du quotidien) :

- **L’image 0 est pleine et bouge déjà.** Le vrai clavier bord à bord en MACRO ou plus près, le vrai pouce déjà
  en train de descendre, son ombre déjà en train de se resserrer, l’ambre déjà vivant sous le verre. Pas de fond vide, pas de
  titre, pas de clavier qui attend d’être touché.
- **Le mécanisme se joue une fois dans la première seconde.** Entre 0.6 et 1.0 s, un appui s’est posé à côté de sa touche, une cellule
  ambre gonflée l’a rattrapé et la lettre est entrée dans le champ. Le spectateur voit la réponse fonctionner avant que la voix
  ait fini "Every key on your iPhone".
- **La chose cachée est nommée sur un filet vers 1.2 s :** "touch zone, invisible". (Le terme du brevet "hit
  region" est gardé pour `zone`.) L’étiquette "Zones drawn visible. On a real iPhone they are invisible." est dans un coin
  dès l’image 0.
- **Chaque nom est joué sur son mot :** "key" un capuchon allumé, "smaller" et "thumb" le pouce à côté ou au-dessus de ce capuchon,
  clairement plus large que lui, "right letter" la lettre qui se pose, "every time" d’autres lettres qui se posent.
- **Un seul changement d’échelle franc entre la seconde 3 et 4, sur "and you still hit"**, dans le même clavier. Jamais un nouveau monde.
- **Quelque chose de nouveau toutes les 0.2 à 0.4 s** ; deux images ne se ressemblent jamais sur une planche à 5 images par seconde.
- **Gardé pour le corps, donc aucune accroche ne le fait :** la zone de contact avec cinq capuchons qui s’allument à tour de rôle (`answer`), et le
  clavier qui se sépare en deux feuilles (`answer`).
- **Passage de relais commun aux cinq :** la dernière image est le clavier SLAB de face, mode sombre, le champ de texte vide au-dessus,
  l’ambre éteint, un vrai pouce tout juste levé du verre au-dessus du E.

### 2. `answer`, sombre, 6.0-12.7 s
"So how is that possible? Because the keys you see are not the keys you touch, and the ones you touch change size
while you type."

Choses réelles : la surface de peau qu’un pouce pose vraiment sur le verre, la feuille des capuchons, la feuille des zones de frappe.
À l’écran depuis l’accroche : le SLAB et le pouce. Cette scène porte le seul grand mouvement de la vidéo et donne la réponse.
Elle montre tout le plateau, de loin et incliné ; aucune cellule seule n’est le sujet ici.

| Mot | Ce qui change |
|---|---|
| So how | le pouce s’éloigne et laisse son empreinte sur les touches : une zone de contact ovale et douce avec un « + » blanc en son centre. Elle couvre E en entier et la moitié de W, R, S et D |
| possible? | les cinq capuchons couverts s’allument l’un après l’autre, en boucle, W, E, R, S, D : le clavier ne peut pas savoir lequel. Finit sur "possible?" avec les cinq allumés |
| Because | les cinq s’éteignent. Tout le bloc bascule en arrière, son bord proche venant vers le spectateur, lourd |
| see | la feuille des capuchons et des lettres se décolle du bloc comme une fine vitre et monte. Étiquette avec un filet dessus : "what you see". Se pose sur "see" |
| are not | la vitre continue de monter, et le capuchon du E laisse tomber son propre contour tout droit, un fin fantôme blanc : il se pose à l’intérieur de quelque chose de plus large que lui |
| touch, | ce quelque chose s’allume : 26 cellules ambre restées sur le bloc, une par lettre, serrées bord à bord, chacune plus grande que le contour de capuchon posé dessus. Étiquette : "what you touch". Se pose sur "touch,". Étiquette de coin : "Zones drawn visible. On a real iPhone they are invisible." |
| the ones you touch | le contour fantôme s’efface. Un gonflement lent démarre au bord gauche du plateau |
| change | il traverse : chaque cellule monte quand le gonflement l’atteint et ses voisines se bombent pour lui laisser la place |
| size | le gonflement atteint le bord droit et le plateau redevient plat. Se pose sur "size" |
| while you type. | sur la vitre du haut, trois touches s’enfoncent à tour de rôle, h, e, y. À chaque appui, tout le plateau dessous se reforme d’un coup, d’après les comptages mesurés (après "h" : A, O et E grands ; après "he" : A, R et L). Finit sur "type." |

Relais : les deux feuilles restent, séparées, la carte ambre au repos avec toutes les cellules de la même taille.

### 3. `zone`, sombre, 13.0-17.6 s
"Under every letter there's an invisible zone, and that zone is what actually catches your tap."

Choses réelles : une touche et sa zone de frappe, un point de contact. Changement d’échelle : les deux feuilles avancent en MACRO sur une partie
du clavier pas encore vue, trois capuchons sur la vitre du haut (J, K, L), leurs trois cellules dessous. Le mécanisme se joue
une fois, lentement, sur un appui qui ne tombe sur aucune touche.

| Mot | Ce qui change |
|---|---|
| Under every | un filet descend du capuchon du K tout droit jusqu’à sa cellule ambre, puis du J, puis du L, puis, quand la vue recule d’un pas, des 26 à la fois, un peigne de 26 lignes |
| letter | le pied de chaque ligne allume sa cellule un instant, une vague qui traverse les trois rangées, finit sur "letter" |
| invisible | l’ambre se vide de la feuille du bas jusqu’à ce qu’il ne reste que les bords des cellules, fins comme un cheveu, presque disparus. Se pose sur "invisible" |
| zone, | il revient à pleine intensité. Retour en MACRO sur J, K, L |
| that zone | une étiquette se pose sur la cellule du K avec un filet : "hit region". Deuxième ligne dessous, petite et grise : "Apple's name for it, US Patent 8,232,973" |
| actually | le vrai pouce descend sur la vitre du haut et rate toutes les touches : son « + » se pose sur la bande sombre juste sous le capuchon du K, sur le verre nu |
| catches | le « + » tombe à travers la vitre comme une pièce dans l’eau et atterrit dans la cellule du K, qui s’étend aussi sous cette bande. La cellule cède sous lui et rebondit, allumée. Se pose sur "catches" |
| your tap. | la lumière de la cellule remonte le filet jusqu’au capuchon du K, le capuchon s’enfonce, et un "k" minuscule apparaît dans le champ de texte en bas à gauche. Finit sur "tap." |

Relais : les deux feuilles se referment l’une sur l’autre (la vitre retombe sur le plateau avec un bruit sourd doux et une stabilisation), l’ambre
encore légèrement visible à travers les capuchons. Le champ de texte se vide.

### 4. `tim`, sombre, 17.9-27.3 s
"Imagine you're texting a friend and you've just typed T, I, M. Your iPhone already has a guess about what comes
next, because "time" is a word and "timw" is not."

Choses réelles : Messages (le fil, le champ, la flèche d’envoi), la barre QuickType, et la liste de mots anglais elle-même,
montrée comme le simple fichier à deux colonnes qu’elle est (mot, nombre). Changement d’échelle : le bloc refermé rétrécit dans le téléphone entier,
HAND, à gauche du centre. La scène vécue commence. Deux moitiés, un sujet chacune : d’abord le téléphone, puis la liste qui alimente
les touches.

| Mot | Ce qui change |
|---|---|
| Imagine | le téléphone se complète autour du clavier : barre d’état 9:41, l’en-tête de Messages avec le portrait et le nom de Sofia |
| texting | sa bulle grise monte dans le fil : "dinner tonight?". Se pose sur "texting" |
| a friend | le champ affiche déjà "what " avec le curseur qui clignote |
| T, | la touche T s’enfonce, "t" entre dans le champ. Se pose sur "T," |
| I, | pareil sur I. "what ti". Se pose sur "I," |
| M. | pareil sur M. "what tim". Se pose sur "M." |
| guess | la barre QuickType se remplit : sa case du milieu affiche "time", les cases latérales "times" et "timing". Celle du milieu se soulève un peu. Se pose sur "guess" |
| what comes | le clavier grandit pour remplir la scène (SLAB), le fil glisse vers le haut et sort, le champ "what tim" gardé juste au-dessus des touches. Dans le coin en bas à gauche, la liste de mots s’ouvre, défilée en douceur à la Apple jusqu’à ses sept lignes qui commencent par t-i-m, vraies lignes, vrais nombres : `time 908705570`, `times 202950880`, `timing 11283175`, `timely 9583522`, `timber 8205739`, `timothy 8103385`, `timer 7488669`. Dans chaque ligne, la quatrième lettre s’allume |
| next, | les lignes quittent la liste une par une et s’envolent, chacune vers la touche de sa lettre allumée : "time", "times", "timely", "timer" s’empilent sur E ; "timber" tombe sur B, "timothy" sur O, "timing" sur I. Un compteur sur E monte et se pose : "96%". B, O et I affichent "1%". Ligne de source grise : "How often each letter follows t-i-m. English web word counts." Finit sur "next," |
| "time" | les piles s’enfoncent dans leurs touches, les pourcentages restent. Une barre de recherche sur la liste tape "time" : une ligne trouvée, allumée, et son nombre espacé à côté, "908,705,570 uses". Dans le champ, le mot se complète en gris : "what time" |
| is a word | la ligne tient, le "e" gris passe en encre pleine un instant |
| "timw" | la barre de recherche s’efface et tape "timw". Dans le champ, la dernière lettre bascule en "w". Sur le clavier, la touche W, voisine du E, montre ce qui est tombé dessus : rien, "0%" |
| is not. | la barre de recherche renvoie "0 of 333,333 words". "timw" tremble une fois et le "w" tombe du champ. Finit sur "not." |

Relais : le champ garde "what tim" et le curseur. "96%" reste sur le capuchon du E et "0%" sur celui du W, en petit. La liste
et la barre de recherche partent.

### 5. `grow`, sombre, 27.6-33.4 s
"So before your thumb even comes down, the invisible zone around the E gets bigger, and the zones around it get
squeezed."

Chose réelle : le même clavier, radiographie allumée, et un pouce qui n’est pas encore arrivé. Le SLAB se rapproche doucement de la moitié gauche des
deux rangées du haut (Q W E R T au-dessus de A S D F), pour que la cellule du E fasse environ 260 px de large. C’est le mécanisme lui-même, l’image
pour laquelle toute la vidéo existe : elle se joue lente et lourde, et c’est la seule fois qu’une cellule gonfle à cette taille.

| Mot | Ce qui change |
|---|---|
| before | le vrai pouce entre dans le cadre par le bas à gauche, haut au-dessus du verre, son ombre large et douce sur les touches |
| thumb | il continue d’avancer, l’ombre se resserre |
| down, | il s’arrête en l’air, l’ombre encore large d’une main sous lui. Le temps est suspendu : le curseur dans le champ arrête de clignoter. Se pose sur "down," |
| invisible zone | la radiographie s’allume : les cellules ambre se voient à travers les capuchons, toutes les neuf de la même taille, chacune centrée sous sa touche. Étiquette de coin comme avant |
| E | la cellule du E seule s’éclaire ; un filet la relie au "96%" posé sur son capuchon. Se pose sur "E" |
| bigger, | la cellule gonfle, lentement puis d’un coup : au-delà des bords de son propre capuchon, sur la moitié proche du capuchon du W et de celui du R, et vers le bas sur le haut de S et D. Elle dépasse et se stabilise. Le capuchon posé dessus n’a pas bougé d’un pixel. Finit sur "bigger," |
| zones around it | les bords des quatre voisines s’allument l’un après l’autre, W, R, S, D |
| squeezed. | elles sont amincies : la cellule du W, celle avec "0%" sur son capuchon, est écrasée contre celle du Q, celle du R contre celle du T, S et D aplaties vers le bas, leurs côtés se bombant comme des coussins sous un poids. Le deuxième anneau (Q, T, A, F) cède un peu aussi. Finit sur "squeezed." Deuxième étiquette de coin : "Zone sizes from English word counts, not Apple's own model." |

Relais : le pouce est toujours suspendu en l’air ; la carte gonflée reste. La radiographie s’atténue jusqu’à rien pendant le passage de relais,
et les deux pourcentages quittent les capuchons avec elle.

### 6. `same`, sombre, 33.7-42.7 s
"On the screen, nothing moves. Every key looks exactly the same size. But if your thumb lands a little off, halfway
between the E and the W, the iPhone gives it to the E."

Choses réelles : les capuchons mesurés, puis le raté. Même cadrage que `grow`, radiographie éteinte : ce que les yeux du spectateur
voient. Puis la radiographie revient pour expliquer ce qui vient de se passer. La comparaison, c’est la même image deux fois : lumière
éteinte, lumière allumée. C’est la seule fois où le pouce se pose entre le E et le W.

| Mot | Ce qui change |
|---|---|
| On the screen, | l’ambre a disparu. Un simple clavier sombre, exactement comme sur son téléphone. Le pouce est toujours suspendu au-dessus |
| nothing moves. | le curseur clignote à nouveau, seul. Le seul mouvement sur les touches est l’ombre du pouce qui respire |
| Every key | un fin pied à coulisse blanc se referme sur le capuchon du W, bord à bord |
| same | un deuxième pied à coulisse se referme sur le capuchon du E ; on les fait glisser l’un sous l’autre et ils ont la même longueur au pixel près, un « = » entre eux. Se pose sur "same" |
| size. | les pieds à coulisse se replient |
| But if | le pouce recommence à descendre |
| off, | il se pose, et pas sur le E : la zone de contact s’étale sur la bande entre deux capuchons, le « + » blanc en son centre. Se pose sur "off," |
| halfway | un seul trait fin marque le milieu de la bande entre le capuchon du W et celui du E ; le « + » est posé dessus. Se pose sur "halfway" |
| the E and the W, | le capuchon du E s’allume, puis celui du W : d’après ce que l’œil voit, c’est pile ou face |
| the iPhone | la radiographie s’allume d’un coup sous le pouce : le « + » n’est sur aucun bord. Il est bien à l’intérieur de la cellule gonflée du E, la cellule écrasée du W loin sur sa gauche |
| gives it to the | la cellule du E le rattrape, cède, rebondit |
| E. | le capuchon du E s’enfonce sous le pouce et le champ affiche "what time". Se pose sur "E." |

Relais : le pouce se lève. La radiographie reste allumée. La vue recule doucement au SLAB, le champ "what time" au-dessus des touches.

### 7. `again`, sombre, 43.0-47.5 s
"Then you type the next letter and every zone changes again, for every single letter you type."

Chose réelle : chaque carte dont ce seul message a eu besoin, posées côte à côte. Elle se multiplie : la carte unique devient une planche
de quinze, une par caractère de "what time works", chacune un petit clavier ambre d’environ 180 px de large, chacune visiblement
différente parce que chacune est la carte mesurée pour ce qui avait été tapé jusque-là. La planche est le sujet ; le clavier
dessous est d’où viennent les copies. Cinq par rangée, trois rangées, dans le haut de la scène ; clavier SLAB en dessous, radiographie allumée.

| Mot | Ce qui change |
|---|---|
| Then you type | les neuf caractères déjà dans le champ, w, h, a, t, l’espace, t, i, m, e, déposent chacun une copie de la carte que le clavier avait quand il a été tapé. Elles sont distribuées depuis le champ dans les deux premières rangées, leur lettre en petit sous chacune. Celle sous "m" est la carte qu’on vient de voir, E énorme |
| next letter | la barre d’espace s’enfonce. La carte vivante sous les touches se reforme, et une copie se soulève du clavier et vient se ranger en dixième |
| every zone | W s’enfonce, O s’enfonce : deux cartes de plus se soulèvent et se rangent, chacune avec une cellule différente gonflée (après "wo" : R, 59%) |
| changes again, | R s’enfonce : la treizième, K grand (50%), L (29%), D (12%). Se pose sur "again," |
| for every | K s’enfonce : la quatorzième |
| single letter | S s’enfonce : la quinzième. Le champ affiche "what time works". Sous la planche, petit et gris : "15 characters, 15 maps". Se pose sur "single" |
| you type. | la flèche d’envoi s’enfonce. Les quinze se replient d’un bloc dans le clavier et l’ambre se détend, uniforme. Finit sur "type." |

Relais : le téléphone recule en HAND et le message se pose en bleu dans le fil sous le sien, "what time works",
"Delivered" en dessous. Le téléphone continue de rétrécir jusqu’à la taille SIDE (300 x 652), en bas à droite, atténué, la bulle bleue
encore lisible.

### 8. `first`, sombre, 47.8-61.1 s
"Apple built this into the very first iPhone, because a comfortable button needed 44 pixels and the whole screen was
only 320 pixels wide. Ken Kocienda, the engineer who made that keyboard, tells the story in his book, and Apple
later patented it."

Choses réelles, trois à la suite, une seule en scène à la fois, chacune partant quand la suivante arrive : l’iPhone de 2007 et
le calcul qui a imposé l’astuce ; l’homme et son livre ; le dessin du brevet lui-même. C’est le seul virage de la vidéo et son
« montrer le pourquoi » : les carrés qui ne tiennent pas sont la cause, et l’ambre est ce qu’Apple a fait pour y répondre.
Sources : `refs/iphone-original-front-a-ccbysa2.jpg`, `refs/iphone-original-docked-ccbysa2.jpg`,
`refs/iphone-1st-gen-ccbysa4.svg` (le boîtier), `refs/iphone-os-2008-keyboard-320x480.png` (une vraie capture d’écran 320 x 480
de ce clavier, la référence en pixels), `people/ken-kocienda.jpg` (sa propre photo, creativeselection.io),
`refs/creative-selection-cover.jpg`, `refs/patent-US8232973.pdf` (planche de dessins 9 sur 16, qui porte le vrai
en-tête "U.S. Patent, Jul. 31, 2012, Sheet 9 of 16, US 8,232,973 B2" ; la figure seule est
`refs/patent-figs/US08232973-20120731-D00009-12-9f-99.png`), `refs/patent-US8232973.txt`.
Ce que la fig. 8B montre vraiment, vérifié sur la planche : "Go" dans le champ de saisie, des contours en pointillés plus grands que leurs touches
autour de A, D et O, un plus petit sur K, un « + » sur le bord gauche de la touche F, et l’étiquette "Hidden hit regions".
Le texte du brevet : D grandit "because God is a common English word", donc le « + » sur F va au D.

| Mot | Ce qui change |
|---|---|
| Apple built this | l’iPhone de 2007 monte au centre avec du poids : bord arrière en aluminium, cadre noir, le bouton d’accueil rond, son ancien clavier gris clair sur le verre. L’ambre quitte le petit téléphone moderne et passe dedans : les anciennes touches ont aussi des cellules dessous, une gonflée. Étiquette : "Illustrative" |
| first iPhone, | "2007" se pose dessous, en petit. Se pose sur "first" |
| because | l’ambre s’éteint. L’ancien clavier tel que les gens le voyaient |
| comfortable button | un contour carré de la taille d’un doigt arrive par-dessus l’écran |
| 44 | un compteur à l’intérieur défile jusqu’à "44 px". Posé sur la touche Q, il est clairement plus large que la touche. Se pose sur "44" |
| and the whole screen | une règle se trace en haut du verre, du bord gauche au bord droit, pendant que neuf autres carrés de 44 px s’alignent à côté du premier, un par touche de la rangée du haut, de Q à P. La rangée déborde du côté droit du téléphone |
| 320 | le compteur de la règle se pose : "320 px". Les trois derniers carrés dépassent sur le cadre dans le seul rouge de la vidéo, et la somme se pose sous le téléphone : "10 x 44 = 440". Se pose sur "320" |
| pixels wide. | les dix carrés sont écrasés pour rentrer dans le verre, chacun faisant maintenant la largeur d’une touche, plus étroit qu’un doigt. Sous l’un d’eux, la cellule ambre revient et gonfle jusqu’à la taille qu’avait le carré : la place que la touche a perdue, rendue là où on ne peut pas la voir. Finit sur "wide." |
| Ken Kocienda, | le téléphone rétrécit vers le haut et la droite, carrés et ambre disparus. Son portrait arrive en grand, son nom dessous, puis la ligne de la couverture de son propre livre : "Principal Engineer of iPhone Software, Apple". Se pose sur "Kocienda," |
| made that keyboard, | un filet va de lui jusqu’au clavier du petit téléphone de 2007 |
| book, | le téléphone part ; la vraie couverture de "Creative Selection" glisse à côté de lui, "2018" dessous. Se pose sur "book," |
| and Apple later | le portrait et le livre partent vers le haut. La planche de dessins du brevet monte, réelle, blanche, seule en scène, sa ligne d’en-tête lisible : "U.S. Patent, Jul. 31, 2012, Sheet 9 of 16, US 8,232,973 B2". Elle défile en douceur à la Apple jusqu’à la FIG. 8B |
| patented | l’ambre de la vidéo remplit les zones que le dessin trace : A, D et O plus grands que leurs touches, K plus petit. Les mots du brevet lui-même sur un filet : "Hidden hit regions". Se pose sur "patented" |
| it. | le « + » du dessin, posé sur le bord de la touche F, est rattrapé par la zone du D ; la touche D s’allume et le champ au-dessus passe de "Go" à "God". Finit sur "it." Étiquette de coin : "US Patent 8,232,973, fig. 8B. Colour added." |

Relais : l’ambre quitte la figure du brevet et descend dans le clavier moderne qui revient ; la planche
part avec le passage de relais.

### 9. `popup`, sombre, 61.4-68.4 s
"And it comes with a second trick. Your thumb hides the key you're pressing, which is why the letter pops up above
your finger, so you can see what you actually hit."

Choses réelles : la bulle de lettre (iOS l’appelle Character Preview, « Aperçu des caractères ») et le vrai interrupteur qui la contrôle.
Sources : `refs/ios-character-preview-on-off.png`, `refs/ios-settings-character-preview.png` (Réglages, Général,
Clavier, "Character Preview"), `refs/apple-support-onscreen-keyboard-1.png`. MACRO sur T, Y, U au-dessus de G, H, J, radiographie
éteinte : cette astuce-là, le spectateur peut la voir, et la voit depuis `tim` sans qu’on le lui ait dit.

| Mot | Ce qui change |
|---|---|
| second trick. | le clavier moderne est de retour, MACRO, six capuchons, et l’ambre de la première astuce s’éteint dessous. Se pose sur "second" |
| Your thumb | le vrai pouce descend par le bas à droite au-dessus du H |
| hides | il se pose. Le capuchon du H a disparu dessous, et la moitié de G et de J avec : vu d’en haut, le spectateur ne peut pas dire ce qui est enfoncé. Se pose sur "hides" |
| the key you're pressing, | le pouce devient du verre un instant : son contour seulement, le capuchon du H enfoncé dessous, allumé. Puis il redevient de la peau et la touche est de nouveau cachée |
| pops up | la bulle pousse de dessous le bout du pouce, monte par son col étroit et s’ouvre au-dessus de l’ongle : un grand "H" dessus, la vraie forme. Se pose sur "pops" |
| above your finger, | une étiquette à filet dessus : "Character Preview" |
| so you can | l’étiquette descend et devient la vraie ligne des Réglages dont elle est le nom, avec son interrupteur, activé. L’interrupteur bascule sur désactivé : la bulle a disparu, le pouce est là, rien à lire |
| see | l’interrupteur se réactive : le "H" est de retour au-dessus de l’ongle. Se pose sur "see" |
| what you actually hit. | la ligne des Réglages part. Le pouce se lève, la bulle retombe dans sa touche, et "h" se pose dans le champ de texte. Finit sur "hit." |

Relais : la vue recule doucement au SLAB, de face, le champ vidé, le pouce au-dessus : l’image de l’accroche. Dans le
fil au-dessus du champ, sous le bleu "what time works", sa réponse est arrivée : "8?".

### 10. `close`, sombre, 68.7-74.3 s
"So you're not that accurate with your thumbs. Your keyboard is quietly moving the target to where your thumb was
about to land."

Chose réelle : le premier plan de la vidéo, résolu. SLAB, le vrai pouce, le champ vide. Les trois mêmes appuis sont
joués deux fois : une fois comme l’œil les a vus, une fois comme le clavier les a vus. Un nouveau mot et de nouvelles touches (Y, O, U, à droite
de la rangée du haut), pour que rien de `same` ne soit remontré. L’ordre dans le deuxième passage est tout l’intérêt : la cellule
bouge d’abord, le pouce vient après.

| Mot | Ce qui change |
|---|---|
| So you're not | radiographie éteinte. Le pouce tape trois touches vite, Y, O, U, et laisse à chaque fois son « + » blanc sur le verre |
| accurate | un fin anneau marque le vrai centre de chacun des trois capuchons. Aucun « + » n’est dans son anneau : le deuxième est sur la bande entre I et O, le troisième sur le bord du Y. Se pose sur "accurate" |
| with your thumbs. | le champ affiche "you" quand même |
| Your keyboard | le temps revient en arrière : les trois « + » se décollent du verre, le champ se vide lettre par lettre. La radiographie s’allume, les cellules égales. Le premier « + » redescend sur le Y, décentré, à l’intérieur de sa cellule |
| quietly | rien n’a encore touché le verre pour le deuxième appui, et la cellule du O gonfle déjà, par-dessus la bande vers le I (après "y", O suit 76% du temps) |
| moving | la cellule a fini de bouger. Alors seulement le deuxième « + » descend, sur la bande, et il est à l’intérieur de l’ambre. Se pose sur "moving" |
| the target | étiquette à filet sur la cellule gonflée : "the target" |
| to where your thumb | la carte se reforme pour le troisième appui : la cellule du U gonfle par-dessus le bord du Y (après "yo", U suit 96% du temps) |
| about to land. | le pouce lui-même descend pour le troisième, lentement, sur le bord du Y, et son « + » est en plein centre de la cellule du U. Le champ affiche "you". Tout sauf cette cellule, le pouce et le mot s’atténue. Finit sur "land." |

Relais : le clavier glisse vers le bas et sort, son ambre s’éteignant ; l’en-tête de son profil Instagram arrive déjà
par le haut.

### 11. `cta`, sombre, 74.6-77.8 s
"Follow me, and send this to the friend who blames autocorrect for everything."

Choses réelles : l’en-tête de son profil Instagram (avatar `people/avatar-creator.png`, "your.handle", le bouton Follow,
logo `logos/si-instagram.svg`), la feuille de partage de la vidéo, les messages privés de Sofia. Redessinés à la géométrie d’Instagram (le
redessin de la dernière fois est dans `ps5-on-pc/scenes/LegalCtaIg.tsx`). La demande est jouée par le même vrai pouce, et sa
récompense est montrée. Trois secondes, donc quatre événements et pas plus.

| Mot | Ce qui change |
|---|---|
| Follow | le pouce tape le bouton bleu Follow, avec une zone de contact et un « + », en plein centre cette fois. Se pose sur "Follow" |
| me, | le bouton devient "Following" |
| send | la feuille de partage monte par-dessus le profil, le portrait de Sofia en premier dans sa rangée ; le pouce la tape et une coche se pose sur son portrait. Se pose sur "send" |
| to the friend | la feuille redescend et son fil est là, cette vidéo posée dedans comme une carte envoyée |
| autocorrect | sa réponse arrive dessous : "ok so it was never autocorrect". Se pose sur "autocorrect" |
| for everything. | l’image tient et se lit toute seule si on la met en pause |

## Ce qui est récupéré (`reels/iphone-keyboard/assets/`)

- `refs/ios-keyboard-dark-quicktype.jpg`, `ios-keyboard-light-quicktype.jpg`, `ios-keyboard-light-lowercase.jpg` :
  de vrais écrans d’iPhone avec le clavier système, 1179 x 2676 (Mobbin). Référence de géométrie, jamais montrée.
- `refs/apple-support-onscreen-keyboard-1.png`, `-2.png` : Assistance Apple, "Type with the onscreen keyboard on iPhone".
- `refs/ios26-liquid-glass-mainframe.jpg` : surfaces d’iOS 26, pour l’habillage du téléphone.
- `refs/ios-character-preview-on-off.png`, `refs/ios-settings-character-preview.png` : la bulle de lettre activée et désactivée,
  et sa ligne dans les Réglages (iDownloadBlog).
- `refs/iphone-os-2008-keyboard-320x480.png` : une vraie capture d’écran 320 x 480 du premier clavier.
  `refs/iphone-original-front-a-ccbysa2.jpg`, `iphone-original-docked-ccbysa2.jpg`, `iphone-2g-8gb-11-ccbysa3.jpg`,
  `iphone-original-2007-back-cc0.png`, `iphone-macworld-2007-ccbysa4.jpg`, `iphone-1st-gen-ccbysa4.svg` : l’iPhone
  de 2007 (Wikimedia Commons, licence dans chaque nom de fichier).
- `refs/commoncog-keyboard-1.png`, `-2.png` : les premiers prototypes de clavier de Kocienda, en contexte seulement, pas prévus
  à l’écran.
- `refs/patent-US8232973.pdf` (31 pages), `patent-US8232973-p1.png`, `patent-US8232973.txt`, `refs/patent-figs/`
  (32 PNG, fig. 1 à 12 ; les FIG. 8A à 8C sont `US08232973-20120731-D00009-12-9f-99.png`) : "Method, device, and
  graphical user interface providing word recommendations for text input", Kocienda et al., déposé le 30 juin 2008,
  accordé le 31 juillet 2012 (Google Patents).
- `refs/creative-selection-cover.jpg` : la couverture du livre. `people/ken-kocienda.jpg` (creativeselection.io),
  `people/ken-kocienda-macmillan.jpg` (page auteur Macmillan).
- `refs/thumbs-typing-pexels-6669813.jpg`, `thumbs-typing-pexels-6669795.jpg`, `thumb-on-touchscreen-ccby2-intel.jpg`.
- `people/friend-sofia.jpg` (le visage synthétique déjà utilisé dans lg-tv-spy), `people/avatar-creator.png`.
- `logos/si-apple.svg`, `si-ios.svg`, `si-instagram.svg`.
- `data/count_1w.txt`, `data/next-letter.json` : les comptages de mots et la part mesurée de chaque lettre suivante pour chaque
  préfixe de "what", "time" et "works". Les préfixes "h", "he", "y", "yo", "what", "time" et "works" ne sont pas encore dans le
  json : le constructeur qui en a besoin le compte à partir de `count_1w.txt` de la même façon (part de tous les usages des mots qui
  commencent par le préfixe, selon la lettre qui suit).

## Pas à l’écran, exprès

- Aucune taille en millimètres ou en points pour une touche ou un pouce : `facts.md` n’en a aucune. « Plus petite que ton pouce » se montre par la
  zone de contact qui couvre cinq capuchons, ce qui ne demande aucun chiffre.
- Aucune affirmation sur les mots de passe ni sur la façon dont l’iOS actuel pondère les zones : `facts.md` marque les deux comme non vérifiées. Les
  étiquettes de coin disent ce qu’est la carte ambre et ce qu’elle n’est pas.
- Pas de soulignement rouge d’orthographe sous "timw" : iOS n’en dessine pas tant qu’un mot est encore en train d’être tapé. La barre de recherche sur
  la liste de mots porte "is not".
- La zone ne suit jamais le pouce. Dans chaque scène, elle bouge à cause de ce qui a été tapé, et elle a fini de bouger
  avant que l’appui n’arrive (`grow`, `close`).
- Pas de "32 px" : les carrés écrasés le montrent, et le script ne donne que deux chiffres.
- "96%", "1%", "0%", "908,705,570", "0 of 333,333", "59%", "50%, 29%, 12%", "15 characters, 15 maps" sont nos
  propres comptages à partir de la liste de mots et du message, et sont étiquetés comme des comptages de mots anglais, jamais comme des chiffres d’Apple.
  Le W après "tim", c’est 49,414 usages sur 1.2 milliard ("timwn", "timwi"), ce qui s’arrondit à 0%. "44", "320", "440" sont les
  deux chiffres du script et leur produit.
