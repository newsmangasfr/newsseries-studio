---
name: style
description: "Choisir le look des vidéos : montrer la galerie des styles prêts (styles/, six looks avec un aperçu vidéo chacun), appliquer celui que le client choisit, ou étudier une vidéo de référence qu’il aime et en faire son propre style. À utiliser pour '/style', « montre-moi les styles », « style 02 », « je veux le style Papier », « copie le style de cette vidéo », « j’ai une vidéo de référence », « change le look ». Aussi : 'show me the styles', 'use style 3', 'copy this video’s style'."
---

# Style

Le look d’une vidéo, c’est la police et les couleurs des sous-titres, la façon dont le mot clé est marqué, et les
fonds. Ce skill le règle en une minute, de deux façons : choisir un style prêt, ou partir d’une vidéo que le client
aime. Les images des scènes et leur mouvement restent la méthode MotionLab dans tous les cas.

Le réglage s’enregistre dans le profil Full Visual, avec le skill `full-visual-customization` : lis-le avant d’écrire
(section « Deux emplacements, deux rôles » et `references/harness-map.md`).

## 1. Montrer la galerie

Ouvre `styles/galerie.html` (avec `node scripts/open.mjs styles/galerie.html`, sinon donne son chemin complet). Chaque
style a son dossier `styles/<id>/` : `apercu.mp4`, `apercu.jpg`, `style.md` (le look en mots, pour quels sujets), `style.json` (les réglages) et
`direction.md` (comment dessiner les scènes dans ce style). Résume-les dans le chat en une ligne chacun, lue dans `style.md`, puis donne le conseil :

« Si aucun ne te va, montre-moi une vidéo que tu adores : je l’étudie et j’en fais ton style. »

## 2. Appliquer un style prêt

Le client dit « style 02 », « Labo », ou décrit ce qu’il veut (« le sombre avec l’orange »). Puis :

1. Lis `styles/<id>/style.json`.
2. Dans `workspace/library/full-visual/profile.json` (crée-le depuis
   `.agents/skills/full-visual-customization/assets/profile-template.json` s’il manque) : fusionne `theme` dans
   `resolved.theme`, et écris `decisions.caption`, `decisions.marker` et `decisions.background` avec la valeur, la
   portée « toutes les vidéos », la raison « style <id> choisi dans la galerie » et `rationale_source`
   `user_explicit`. Note `tendency` comme tendance de fond pour le plan, et l’id du style dans `resolved.style` : les
   constructeurs de scènes lisent `styles/<id>/direction.md`. Retire `caption`, `marker` et `background`
   de `setup.open_topics`. Augmente `revision`.
3. Mets à jour `workspace/library/full-visual.preferences.md` : une phrase sur le look choisi et pourquoi.
4. Confirme en une ligne : « C’est noté : tes vidéos auront le style Labo. Tu pourras en changer quand tu veux. »

Les autres points du réglage (la voix, la langue, la demande de fin) restent au skill `full-visual-customization`.
Ne les redemande pas ici.

## 3. Partir d’une vidéo de référence

Le client donne un fichier vidéo ou le dépose dans `workspace/input/references/`. (Un lien Instagram ou TikTok :
demande-lui de télécharger la vidéo et de la déposer dans ce dossier ; ne lis jamais le compte d’un autre.)

1. Lance `node scripts/style-reference.mjs <la vidéo>`. Il écrit, dans `workspace/input/references/<nom>/study/`,
   une planche de toute la vidéo (`sheet.jpg`), douze images en taille réelle et les couleurs dominantes
   (`palette.json`).
2. Regarde la planche, puis chaque image en taille réelle. Écoute le son si besoin (voix, rythme, musique).
3. Décris en mots, en cinq lignes au plus : les sous-titres (police, taille, couleurs, mot clé), les fonds (couleur,
   clair ou sombre, texture), la voix, le rythme, ce qui frappe.
4. Classe ce que tu as vu en trois listes, simplement, comme le dit
   `.agents/skills/full-visual-customization/references/interview.md` section 1 :
   - **ce qu’on reprend tout de suite** (police chargée ou proche, couleurs, marqueur, fonds), avec les valeurs ;
   - **ce qui demanderait de modifier le moteur** (un marqueur souligné, un texte tapé lettre par lettre…) et ce que
     ça coûte ;
   - **ce qui reste la méthode MotionLab** : les images et le mouvement de chaque scène. Un personnage, un
     présentateur ou une musique sous la voix ne font pas partie du format ; dis-le en une phrase, sans le juger.
5. Crée `styles/perso-<nom>/` avec `style.json` (même forme que les styles prêts : `id`, `name`, `tendency`,
   `theme`), `style.md` (ta description et les trois listes) et `direction.md` (à quoi ressemblent les scènes :
   matières, couleurs, étiquettes, ce qu’on ne reprend pas). Les options possibles sont dans `harness-map.md`, section
   « Options des styles ». Prends les couleurs dans `palette.json` et sur les
   images, jamais au hasard. Les polices chargées sont listées dans `harness-map.md`. Une police plus large que
   Figtree demande une taille plus petite (`caption.size`, et `lineHeight` environ 1,11 fois la taille) ou une ligne
   plus large (`caption.wrap`, 820 au plus) : sinon un bloc qui tenait sur deux lignes en demande trois et le rendu
   échoue. Les styles prêts sont réglés pour occuper la même place que le réglage maison : prends-les comme repère.
6. Fais un essai court avant d’enregistrer : la section « On teste » de `full-visual-customization` (`reels/exemple-essai`
   rendue avec ce thème, environ 9 s, à côté du look par défaut). Montre les deux.
7. Le client valide ou corrige une propriété à la fois. Quand il dit que c’est le sien, applique-le comme un style
   prêt (section 2), copie l’essai rendu en `styles/perso-<nom>/apercu.mp4` et une image en `apercu.jpg`, puis
   reconstruis la galerie : `node scripts/style-gallery.mjs`.

## 4. Changer de style plus tard

Même chemin. L’ancien choix passe dans `superseded_decisions` du profil avec sa raison. Une vidéo déjà faite garde son
look ; seules les suivantes changent. Pour une seule vidéo, écris le thème dans le `reel.json` de cette vidéo sans
toucher au profil.
