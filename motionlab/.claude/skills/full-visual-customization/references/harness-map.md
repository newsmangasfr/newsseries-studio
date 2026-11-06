# Ce qu’on peut personnaliser dans Full Visual aujourd’hui

Voici une carte de Full Visual tel qu’il est livré dans un dossier MotionLab, lue dans
`engine/full-visual/src/theme.ts`, `src/fonts.ts`, `src/engine/Caption.tsx`, `Ground.tsx`,
`Chrome.tsx`, `scripts/voice.py` et `scripts/align.py`. Revérifie le vrai consommateur avant de
te fier à un champ. Elle décrit le code actuel ; elle ne le modifie pas.

## Comment un choix arrive dans une vidéo

Le fichier `engine/full-visual/reels/<slug>/reel.json` d’une vidéo contient ces blocs :

- `"theme"` : un partiel profond de `Theme`, fusionné avec les valeurs par défaut de `theme.ts` par
  `withOverrides`. Seules les clés écrites changent. Une clé qui n’existe pas dans `Theme` ne fait
  rien : l’écrire n’est pas une personnalisation.
- `"voice"` : le choix ElevenLabs lu par `scripts/voice.py` (`id`, `name`, `model`, `speed`,
  `stability`, `similarity`, `style`). Un autre fournisseur, c’est un `voice.json` à côté, lu par
  `scripts/narrate.mjs`.
- `"chrome"` : l’unique élément épinglé, `{"type": "none"}`, une `pill` compte à rebours ou un `terminal`.
- `"language"` : la langue de la vidéo, en code ISO, recopiée du champ `language` du profil (`fr`
  par défaut). Le script, la voix off, l’alignement, les sous-titres et la légende la suivent.

Les choix par scène et par bloc (le fond d’une scène, l’emplacement des sous-titres, le mot-clé, un
emoji) sont écrits dans le `caption.txt` de la vidéo par le skill full-visual, pas dans le thème.

Les vidéos maison écrivent `"motion": "measured"` et `"caption": {"leadMs": 80}` dans chaque
`reel.json` ; ce sont les réglages maison ci-dessous, même là où `theme.ts` dit autre chose.

## Sous-titres

| Préférence | Chemin | Défaut | Ce que ça change | Changement du moteur ? |
|---|---|---|---|---|
| Police des sous-titres | `theme.font.caption` | `"Figtree, sans-serif"` | La police des sous-titres. La mise en page mesure le premier nom de famille et refuse une police non chargée. | Sont chargées : Figtree, Inter, JetBrains Mono, Geist, Bricolage Grotesque, Kode Mono et Poppins (les polices des styles prêts dans `styles/`). Une autre police : l’ajouter dans `src/fonts.ts` via `@remotion/google-fonts` en graisses 400 et 700, copier le fichier dans `overrides/`. Elle doit avoir les accents français. |
| Graisses | aucun (dans `Caption.tsx`) | mot actif et mot-clé 700, mots dits 400 | Mot actif en gras, mots dits en normal. | Oui, `Caption.tsx`. Ça fait partie de la règle 3 ; ne change que sur insistance. |
| Taille | `theme.caption.size`, `theme.caption.lineHeight` | 74, 82 | Taille du texte. Garde un rapport proche de 1,11 pour que les jambages ne touchent pas la ligne suivante. | Non. Un bloc qui ne tient plus sur deux lignes de `wrap` lève une erreur au rendu : il faut plus de coupures ou une taille plus petite. |
| Largeur de ligne | `theme.caption.wrap` | 740 | Où un bloc se coupe en deux lignes équilibrées. | Non. |
| Lignes par bloc | `theme.caption.maxLines` | 2 | Fixé par la règle 3. | Pas une préférence. |
| Couleur du mot actif | `theme.grounds.dark.ink`, `theme.grounds.light.ink` | `#FFFFFF`, `#0B0B0B` | Le mot en train d’être dit, le mot-clé, et le texte principal que nous créons. | Non. Une valeur par fond ; chacune doit se lire sur son fond. |
| Couleur des mots dits | `theme.grounds.dark.spoken`, `theme.grounds.light.spoken` | `#6B6B6B`, `#8E8E8E` | Les mots déjà dits du bloc. | Non. |
| Position verticale | `theme.caption.top`, `theme.caption.bottom` | 318, 1372 | Le y de la première ligne dans l’emplacement du haut et dans celui du bas. | Non, dans la bande des sous-titres de la règle 2 (y 300 à 500 pour l’emplacement du haut). Des sous-titres bas sur toutes les scènes déplacent la bande du visuel : ce n’est pas un look. |
| Emplacement par bloc | `caption.txt` `@top` / `@bottom` | haut | L’emplacement qu’un bloc utilise à partir de cette ligne. Choisi par vidéo par le skill full-visual quand le visuel a besoin du haut. | Pas un défaut du profil. |
| Avance | `theme.caption.leadMs` | 40 dans `theme.ts`, 80 dans les vidéos maison | L’avance d’un mot sur sa syllabe, pour qu’il soit net quand on l’entend. | Non. Petite plage, environ 40 à 100. |
| Apparition floue | `theme.caption.blurInFrames`, `theme.caption.blurPx` | 4, 10 | Combien de temps et avec quel flou un nouveau mot apparaît. | Non. Le mot apparaît toujours à sa place (règle 3). |
| Effacement du bloc | `theme.caption.clearFrames` | 3 | La vitesse à laquelle un bloc fini s’efface avant le suivant. | Non. |
| Comportement | `theme.motion` | `"v1"` dans `theme.ts`, `"measured"` dans les vidéos maison | `measured` : apparition floue adoucie avec une descente de 13 px, le cadre tracé en quatre temps, les blocs s’effacent en opacité. `v1` : la première version, linéaire. Ça change aussi les courbes de relais du plateau, donc c’est un réglage de toute la vidéo. | Non. Garde `measured`, sauf s’il préfère les sous-titres v1 après avoir vu les deux. |
| Emoji avant un mot | `caption.txt` | utilisé quand un mot le mérite | Un emoji en ligne qui grandit avant son mot. | Non. « Pas d’emoji » est une limite que l’auteur des sous-titres respecte. |

## Marqueur du mot-clé

| Préférence | Chemin | Défaut | Ce que ça change | Changement du moteur ? |
|---|---|---|---|---|
| Style | `theme.marker.style` | `"select"` | `select` : un cadre de sélection avec un fond teinté et deux poignées rondes. `pill` : un lavis doux et arrondi derrière le mot. `none` : le mot-clé reste en gras, sans cadre. | Tout autre style (souligné, surligneur, couleur seule) demande `Caption.tsx`. |
| Couleur | `theme.marker.color` | `#2E7AEA` | Contour, teinte du fond et poignées de `select`. | `pill` l’ignore : il utilise la couleur de l’encre à 10 %. Une pill colorée est un changement du moteur. |
| Intensité du fond | `theme.marker.fill` | 0.18 | Alpha du fond du cadre. | Non. |
| Contour et poignées | `theme.marker.stroke`, `theme.marker.handle` | 3, 22 | Épaisseur du contour et diamètre des poignées. Les poignées ont un liseré blanc. | Le liseré blanc est fixé dans `Caption.tsx`. |
| Minutage | `theme.marker.delayFrames`, `theme.marker.drawFrames` | 5, 5 | Le cadre arrive quelques images après son mot et se trace sur ce nombre d’images. | Non. Il doit toujours arriver après son mot (règle 3). |

## Fond

| Préférence | Chemin | Défaut | Ce que ça change | Changement du moteur ? |
|---|---|---|---|---|
| Fond sombre | `theme.grounds.dark.bg` | `#101010` | La couleur unie des scènes sombres. | Non. |
| Fond clair | `theme.grounds.light.bg` | `#FAFAFA` | La couleur unie des scènes claires. | Non. |
| Fond par scène | `caption.txt` `== id \| ground: dark` | choisi par scène selon l’histoire | Chaque scène repose sur un fond sombre ou clair ; le passage de l’un à l’autre se fait en fondu dans le silence entre deux scènes. | Pas un défaut du profil. Une tendance déclarée (« surtout sombre ») est notée et le plan en tient compte ; la scène choisit quand même selon son contenu. |
| Grille | `theme.grounds.dark.grid`, `theme.grounds.light.grid` | `rgba(255,255,255,0.022)`, `rgba(0,0,0,0.028)` | Fines lignes de grille de 1 px. Elle donne au flou de mouvement quelque chose à étirer. Désactivée = alpha 0, par exemple `rgba(255,255,255,0)`. | Non. |
| Pas de la grille | `theme.gridPitch` | 60 | Taille d’une case en px. | Non. |
| Surfaces créées | `theme.grounds.<g>.card`, `.hairline`, `.dim` | sombre `#161618`, `#2A2A2C`, `#8C8C8C` ; clair `#FFFFFF`, `#E6E6E6`, `#6B7280` | Cartes, filets et texte secondaire que les scènes dessinent à partir du thème. Les scènes qui redessinent une vraie interface gardent ses vraies couleurs. | Non, mais vérifie les images d’aperçu : une scène qui code une couleur en dur ne suivra pas. |

## Options des styles

Ajoutées pour les styles de `styles/`. Toutes facultatives : sans elles, le rendu est exactement celui d’avant.

| Préférence | Chemin | Défaut | Ce que ça change |
|---|---|---|---|
| Alignement | `theme.caption.align` | `"center"` | `"left"` : les lignes partent du bord gauche de `wrap`, comme un titre. |
| Capitales | `theme.caption.case` | `"none"` | `"upper"` : tout en capitales (la mise en page mesure les capitales). |
| Graisse des mots dits | `theme.caption.spokenWeight` | 400 | 700 : les mots déjà dits restent en gras. |
| Phrase visible à l’avance | `theme.caption.upcoming` | aucun | Une couleur : tout le bloc est affiché dès sa première image, les mots pas encore dits dans cette couleur. Ça assouplit la règle 3 (« un mot pas encore dit n’existe pas ») : seulement sur choix explicite du créateur. |
| Étiquettes par mot | `theme.caption.chip` | aucun | `{ bg, ink, keyBg, keyInk, padX, padY, radius, tilt }` : chaque mot sur son étiquette, légèrement de travers, le mot clé dans sa couleur. |
| Mot clé en couleur | `theme.marker.style` `"color"` | | Le mot clé en `marker.color`, sans cadre. |
| Mot clé en serif italique | `theme.marker.style` `"serif"` + `theme.font.accent` | | Le mot clé dans la serif italique (Instrument Serif), en `marker.color`. |
| Dégradé de fond | `theme.atmosphere.gradient.<dark|light>` | aucun | Deux couleurs, du haut vers le bas. |
| Vignettage | `theme.atmosphere.vignette` | 0 | 0 à 1 : assombrit les coins, sur fond sombre seulement. |
| Halo | `theme.atmosphere.glow` | aucun | `{ color, x, y, r }` : une lumière douce, sur fond sombre seulement. |
| Réseau de particules | `theme.atmosphere.particles` | aucun | `{ color, count, link, speed }` : des points qui dérivent, reliés quand ils sont proches. |
| Bandeau du haut | `theme.hud` | aucun | `{ kind: "label" | "tape", left, right, progress: "bar" | "segments", color, accent, top }`. `{n}`, `{total}`, `{scene}` et `{title}` sont remplacés. `tape` affiche `{title}` sur une bande de scotch. |
| Titre de scène | `caption.txt` `== id \| ground: dark \| title: MON TITRE` | aucun | Le texte de `{title}` pour le bandeau. |

Une police plus large, des capitales ou des étiquettes prennent plus de place : vérifie que chaque bloc tient sur deux
lignes avec les images fixes avant le rendu complet.

## Polices hors sous-titres

| Préférence | Chemin | Défaut | Ce que ça change | Changement du moteur ? |
|---|---|---|---|---|
| Police d’interface | `theme.font.ui` | `"Inter, sans-serif"` | Le chrome pill et les étiquettes créées dans les scènes. Les vraies interfaces redessinées gardent leur vraie police. | Nouvelle police : `src/fonts.ts`, comme plus haut. En général on n’y touche pas. |
| Police mono | `theme.font.mono` | `"'JetBrains Mono', monospace"` | Le chrome terminal et le code créé. | Pareil. |

## Chrome et rôles de couleur

| Préférence | Chemin | Défaut | Ce que ça change | Changement du moteur ? |
|---|---|---|---|---|
| Élément épinglé | `reel.json` `"chrome"` | `{"type": "none"}` | Un élément pour toute la vidéo, ou aucun. Le skill full-visual le choisit par vidéo ; `taste.md` écarte le terminal. Une limite (« jamais de compte à rebours ») est un choix du profil. | Un nouveau type de chrome demande `Chrome.tsx`. |
| Rôle marque | `theme.roles.brand` | `#D97757` | Le remplissage de progression de la pill et sa marque. | Non. |
| Rôles de sens | `theme.roles.ok`, `.alarm`, `.positive`, `.link` | `#41F9D3`, `#D7253A`, `#34C759`, `#2E7CF6` | Les couleurs que les scènes utilisent pour un sens (succès, danger, lien). | Pas un look : garde-les, elles portent un sens. |

## Le profil de fin (la demande)

La dernière scène joue la demande dans la vraie interface du créateur : l’en-tête de son profil Instagram, un
commentaire ou son DM. Les vidéos d’exemple dessinent un remplaçant (`your.handle`, un portrait synthétique, des
compteurs inventés). Chaque nouvelle vidéo dessine la vraie identité du créateur à la place, jamais le remplaçant et
jamais une autre personne.

| Préférence | D’où ça vient | Défaut | Ce que ça change |
|---|---|---|---|
| Pseudo, nom, bio | `context/profile.json` (`handle`, `name`, `bio`), lu par `/start` via Composio | demandé une fois si Instagram n’est pas connecté | Le texte du profil, du commentaire et du DM dessinés |
| Photo de profil | `context/profile.json` `avatar.path` (un fichier en cache sous `context/profile/`) | demandée une fois en image ; jamais d’initiales ni de visage de remplacement | Copiée dans `public/<slug>/avatar-creator.png` de la vidéo par le constructeur de la scène de fin |
| Nombre d’abonnés | `context/profile.json` `followers`, écrit comme Instagram l’affiche (68,4 k sur un Instagram en français) | omis s’il est inconnu, jamais inventé | Le nombre sur l’en-tête du profil |

Enregistre l’identité résolue sous `resolved.identity` dans le profil. Ce sont des données, pas du goût : rafraîchis-la
depuis `context/profile.json` avant chaque vidéo quand ce fichier est plus récent.

## Pas des préférences

`theme.fps` (60), `theme.stage` (`width` 900, `top` 520, `bottom` 1450), `theme.handover`
(`"rise"`), `theme.minType` (32, le minimum pour tout texte qui porte une affirmation ; jamais abaissé),
`caption.maxLines`, tout ce qui est dans `src/engine/Stage.tsx`, `Motion.tsx`, `moves.ts` et
`timeline.ts`, et `scripts/check.py`. Ils sont la méthode et les vérifications.

## Voix off

| Préférence | Où | Défaut | Notes |
|---|---|---|---|
| Voix ElevenLabs | `reel.json` `"voice"`, lancer `node ../../scripts/py.mjs scripts/voice.py <slug>` | Recette maison de l’exemple `hf-incident-h5` : id `gWaDC0oXAheKoZfljzuI` (voix de bibliothèque « Snap »), `eleven_v3`, vitesse 1.0, stabilité 0.5, similarité 0.8, style 0.0 | Minutage exact des mots par le fournisseur. Avec `eleven_v3`, `script.v3.txt` (les mêmes mots plus des balises audio) pilote l’interprétation et la prise est minutée par alignement forcé. Pauses coupées à 0,2 s avec `tighten.py`, l’accroche jamais coupée. Une prise n’est jamais raboutée : régénère-la en entier. La voix lit le script dans la langue de la vidéo ; choisis-la à l’audition dans cette langue. |
| Audition (ElevenLabs) | `node ../../scripts/py.mjs scripts/voice.py <slug> --audition id:label,id:label` | 2 à 4 voix | Lit les deux premières phrases de `reels/<slug>/script.txt` pour chaque voix, dans `reels/<slug>/voices/`. |
| Voix OpenAI ou Fish | `reels/<slug>/voice.json` `{provider, voice, model, settings}`, lancer `node scripts/narrate.mjs --root ../.. --config reels/<slug>/voice.json --text-file reels/<slug>/script.txt --out reels/<slug>/voice.mp3` | aucun | Puis `align.py` minute la prise par reconnaissance vocale dans la langue de la vidéo (`reel.json` `"language"`). Pas de balises audio, pas de minutage des mots par le fournisseur ; la synchro se vérifie sur des images d’aperçu comme pour toute vidéo. Pour une audition, lance-le une fois par configuration candidate sur un fichier texte de deux phrases, avec un nom `--out` différent à chaque fois. |
| Sa propre voix enregistrée | `reels/<slug>/voice.mp3` (ou `.wav`, `.m4a`) | aucun | Minutée par `align.py` de la même façon. Jamais raboutée. |
| Clés | ajoutées sur la page de la vidéo dans l’espace de travail (l’étape Vidéo), ou mises dans `.env.local` à la racine du dossier | | `ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `FISH_API_KEY`. Jamais dans le chat, jamais dans une config. |

## Mots et recherche

| Préférence | Où elle sert | Défaut |
|---|---|---|
| Source du script | `full-visual-script` écrit `script.txt`, ou son script est enregistré tel quel en `script.txt` | Conseillé : il l’écrit lui-même avec `mon-script`. Sinon la méthode de script maison : trois ou quatre accroches au choix, 120 à 280 mots selon la durée, du liant parlé, chaque fait dans `facts.md`. Son propre script est pris pour vrai et jamais réécrit. |
| Demande finale | Dernière phrase du script | `commente « MOT »` avec la chose exacte qu’il enverra. |
| Légende | `caption-post.txt` à côté de la vidéo | S’ouvre sur `Commente MOT et je t’envoie …`. |
| Sujets et position | Le skill de recherche avec `.agents/skills/full-visual/references/research.md` | Tout sujet qu’il apporte, ou les sujets qu’il a enregistrés. |
| Langue | Champ `language` du profil, recopié dans `reel.json` `"language"` ; lu par la voix off, `align.py` et le modèle de reconnaissance vocale | `fr`. Le script, les sous-titres et la légende sont écrits dans cette langue. |

## Changements du moteur, quand il insiste

Chaque fichier changé ou ajouté est copié dans `workspace/library/full-visual/overrides/` à son chemin sous
`engine/full-visual/`, avec une ligne dans `overrides/README.md` qui dit quoi et pourquoi. Une mise à jour remplace le
moteur ; les overrides sont remis à la main et vérifiés avec `./node_modules/.bin/tsc --noEmit -p .` et une image
d’aperçu avant toute vidéo.
