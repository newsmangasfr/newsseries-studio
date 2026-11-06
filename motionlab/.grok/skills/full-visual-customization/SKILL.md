---
name: full-visual-customization
description: "Apprendre une fois les préférences Full Visual d’un créateur (look des sous-titres, fond, voix off, langue, mots, direction de recherche, références à copier), les tester sur un court rendu d’essai, enregistrer ses choix et leurs raisons, et les réutiliser dans chaque vidéo suivante. À utiliser pour la première mise en route de Full Visual, pour changer le look, la voix, la langue ou les mots enregistrés, « fais-le à mon image », « utilise ma voix », « copie le style de ce créateur », ou pour apprendre d’un retour donné pendant une vidéo. Ne change ni la méthode Full Visual, ni le mouvement, ni les visuels, ni les vérifications. Aussi : 'make it mine', 'use my voice', 'copy this creator’s style'."
---

# Personnalisation Full Visual

## Objectif

Faire de Full Visual le format de ce créateur. Apprendre, une fois, à quoi servent ses vidéos et à quoi elles doivent
ressembler et sonner (les sous-titres, leurs couleurs et leur marqueur de mot-clé, le fond, la voix off, la langue,
les mots et la demande finale, les sujets et la position), comprendre pourquoi, et porter ces choix dans chaque vidéo
suivante. La méthode n’en fait jamais partie : quelle image explique une phrase, comment elle bouge sur le mot,
comment les scènes se passent le relais, les règles du moteur et les vérifications sont les mêmes pour tous les
créateurs. La personnalisation change le look et ce que dit le créateur.

## Raisonnement

Une couleur est un réglage ; la raison de ce choix est ce qui permet à la vidéo suivante de prendre la bonne décision.
« Un fond plus doux » ne doit pas griser en douce les scènes claires. « Des mots-clés en bleu » ne doit pas repeindre
les interfaces dessinées sous les sous-titres. « Comme ce créateur » veut souvent dire une ou deux propriétés (une voix
plus calme, des sous-titres plus grands), pas une reconstruction du format.

La force de Full Visual : une vraie chose pour chaque phrase, dessinée à sa propre géométrie et animée sur le mot, avec
la voix comme seule horloge. Ça survit à la personnalisation. La police, l’encre et le gris des sous-titres, le
marqueur, les couleurs de fond, la grille, la voix, la langue et la demande finale sont des choix du créateur. Garde
l’intention ; laisse le créateur choisir l’expression. Ne réduis pas les références du format à une palette ou à une
checklist.

## Deux emplacements, deux rôles

Dans un dossier MotionLab, la **source** est `.agents/skills/full-visual/SKILL.md` (avec `full-visual-script`) et le
moteur est dans `engine/full-visual/`. Les commandes se lancent depuis `engine/full-visual/` ; Python se lance avec
`node ../../scripts/py.mjs scripts/<x>.py`. Ne suppose pas un autre dépôt.

Les skills source, le moteur, ses scripts et ses vidéos d’exemple sont en lecture seule pour ce compagnon : une mise à
jour du format les remplace. Range ce que tu apprends dans `workspace/library/`, qui appartient à la personne et
survit à chaque mise à jour.

```text
workspace/library/
  full-visual/profile.json       valeurs choisies, portée, preuves, avancement du réglage, révision
  full-visual/overrides/         une copie de chaque fichier moteur changé pour son look, une ligne pourquoi
  full-visual.preferences.md     compréhension actuelle, objectifs, raisons et exemples utiles ; l’espace de travail affiche cette page
  full-visual.json               la trace, pour l’espace de travail, que le look est choisi
```

Lie le profil au créateur, à la chaîne, au format et au chemin source. Ne laisse pas le retour d’une personne changer
le profil d’une autre. Nomme le profil utilisé au début d’une exécution. Si le lien est ambigu, demande seulement pour
quel créateur c’est.

Sans profil, Full Visual garde ses réglages maison. L’existence de ce skill ne vaut pas réglage.

## Ce qui ne change jamais

L’image et le mouvement : `src/engine/` pour le plateau, les relais, les mouvements et la timeline, les règles du
moteur dans le skill full-visual, `scripts/check.py`, l’ordre des étapes, et la barre de
`.agents/skills/full-visual/references/taste.md`. Une préférence n’assouplit jamais une vérification. Si un look choisi
ne peut pas en passer une, dis exactement où ils se contredisent et laisse le créateur trancher sur le look, jamais sur
la vérification.

Un look que le moteur n’a pas (un nouveau style de marqueur, une animation de sous-titres qu’il n’a pas, une police
qu’il ne charge pas) ne se construit que si le créateur insiste après avoir entendu ce que ça coûte : un fichier moteur
changé, une copie gardée dans `workspace/library/full-visual/overrides/` avec une ligne pourquoi, et le changement
remis à la main après chaque mise à jour du format. Une demande qui casserait l’une des huit règles (des sous-titres
par phrase au lieu d’un mot par mot dit, une coupe, de la musique sous la voix, un présentateur) n’est pas un look ;
dis-le simplement et note-la comme demande refusée.

La vidéo est faite dans la langue du créateur : le champ `language` du profil (code ISO, `fr` par défaut), recopié dans
le `reel.json` de chaque vidéo. Le script, la voix off, les sous-titres et la légende suivent cette langue.

## Lire ce qui existe avant de demander

Lis le skill full-visual et ses références, `taste.md`, `full-visual-script`, et les vrais champs de thème dans
`engine/full-visual/src/theme.ts`, `src/fonts.ts`, `src/engine/Caption.tsx`, `Ground.tsx` et `Chrome.tsx`. Utilise
[harness-map.md](references/harness-map.md) pour chaque champ, sa valeur par défaut et si un changement demande le
moteur.

Lis le contexte partagé du dossier avant de demander quoi que ce soit qu’il contient déjà : `context/profile.md`,
`context/answers.json` (`audience.for`, `audience.need`), `context/voice.md`, et le skill de recherche
(`.agents/skills/research/SKILL.md`) avec la façon de chercher de ce format dans
`.agents/skills/full-visual/references/research.md`. Ne redemande jamais le contexte partagé.

Lis un profil existant et sa page de préférences avant tout le reste sur le goût. Préserve les modifications directes
de la page. Si la page et le JSON diffèrent, réconcilie ce choix-là avant de l’appliquer ; ne remets pas une ancienne
valeur machine par-dessus les mots de l’utilisateur.

Instagram se lit via Composio, configuré par `/start`. S’il est connecté, lis ses propres posts récents pour voir ce
qu’il fait déjà et ce qui a porté. Sinon, dis une fois « tu peux le connecter avec /start » et continue à partir de ses
réponses. Ne demande jamais une clé dans le chat. Il ajoute la clé sur la page de la vidéo dans son espace de travail
(l’étape Vidéo), ou la met dans `.env.local` à la racine du dossier.

Distingue : l’objectif durable, une préférence explicite, un fait mesuré, une correction locale et une déduction
provisoire. Les choix explicites actuels passent avant les anciens exemples. Le look des vidéos d’exemple est le
réglage maison, pas la préférence de ce créateur.

## Première mise en route : une conversation, enregistrée au fur et à mesure

Si `setup.status` vaut `complete`, réutilise-le. Ne rouvre pas l’entretien pour une nouvelle vidéo. S’il vaut
`in_progress`, reprends seulement les points non résolus. Une nouvelle version du skill ne le remet pas à zéro.

Pour le look (sous-titres, marqueur, fond), commence par la galerie : le skill `style` montre six styles prêts et
sait transformer sa vidéo de référence en style. Un style choisi règle ces trois points d’un coup ; ne pose les
questions détaillées de l’entretien que s’il veut ajuster un détail.

Reste à haut niveau. Demande ce dont il a besoin, ce qu’il veut que le spectateur retienne, et s’il a une référence
qu’il aimerait copier. Utilise [interview.md](references/interview.md) par petits groupes : public et références,
sous-titres, fond, langue, voix off, mots, recherche. Explique ce que change un choix et donne des alternatives
concrètes en nommant le réglage maison. Laisse l’utilisateur répondre librement, garder le défaut ou déléguer. Note un
« choisis pour moi » explicite comme une délégation, avec sa portée. Un point optionnel peut être reporté. Le silence
ne veut jamais dire qu’un choix est accepté.

Une vidéo de référence (un lien ou un fichier) : regarde-la, décris en mots ses sous-titres, son fond et sa voix,
relie aux champs de thème ce qui peut l’être, et dis clairement quelles parties demanderaient un changement du moteur
et lesquelles relèvent de la méthode (ses images et son mouvement), qui reste la nôtre.

Utilise [profile-template.json](assets/profile-template.json) comme structure de départ. Chaque choix réglé va sous
`decisions.<key>` (`caption`, `marker`, `background`, `voice`, `words`, `research`) avec sa valeur, sa portée, son
objectif, une raison courte, `rationale_source` (`user_explicit`, `editorial_interpretation` ou `delegated`), un
exemple utile et ses preuves ; le thème qui en découle va dans `resolved.theme`. La langue va dans le champ `language`
du profil (code ISO, `fr` par défaut). Enregistre l’avancement après chaque réponse. Ne repose pas les questions déjà
répondues.

## On teste

Après les choix de look, fais un court rendu d’essai au lieu de le décrire. Depuis `engine/full-visual/` :

1. Copie `reels/exemple-essai` (une courte vidéo française livrée pour ça, avec une voix de synthèse provisoire)
   vers deux slugs de brouillon, `reels/_look-default` intact et `reels/_look-test`. Chacune s’enregistre seule :
   `reels/index.ts` trouve chaque `reels/<slug>/scenes/index.tsx`.
2. Écris ses choix dans `reels/_look-test/reel.json` sous `"theme"`, en partiel profond. Ne change rien d’autre : mêmes
   mots, même voix, mêmes scènes, même chrome. L’essai juge le look, pas la voix ni les images.
3. Regarde d’abord : `node render.mjs _look-test --stills 1.5,4.5,30` et les mêmes instants sur `_look-default`
   (vers 30 s, la scène est sur fond clair : les deux fonds sont vus). Lis
   toi-même les images en taille réelle : sous-titres tenant sur deux lignes, contraste de l’encre, du gris et du
   marqueur sur les deux fonds, la grille. Un bloc de sous-titres qui ne tient plus sur deux lignes fait échouer le
   rendu ; dis-le et propose une taille qui tient.
4. Crée d’abord `workspace/output/<date>-full-visual-look-test/`. Rends environ 9 s : `node render.mjs _look-test --from 0 --to 9 --out ../../workspace/output/<date>-full-visual-look-test/look-test.mp4` (ajoute `--from 28.3 --to 33.2` dans un second rendu pour voir le fond clair),
   le défaut de la même façon vers `look-default.mp4` dans ce dossier, et montre les deux à côté des images.
5. Itère sur ses mots, une propriété à la fois. N’enregistre le look que quand il dit que c’est le sien.

Un essai de voix, c’est l’audition (voir l’entretien) : deux à quatre voix qui lisent ses deux premières phrases, dans
sa langue, choisies à l’oreille. Supprime les deux dossiers de brouillon quand le réglage se termine.

## Terminer le réglage

Avant de terminer, montre une seule relecture : pour qui c’est, les sous-titres (police, taille, encre, gris des mots
dits, marqueur), les fonds et la grille, la langue, la voix, les mots (script maison ou son script, la demande finale,
la forme de la légende), et les lignes éditoriales et la position. Montre le rendu d’essai. Demande une fois si c’est
le réglage par défaut qu’il veut enregistrer. S’il a déjà demandé explicitement de l’enregistrer, cette demande vaut
confirmation.

Marque le réglage terminé avec la vraie confirmation. Écris `workspace/library/full-visual.json` sous la forme
`{"setup": {"done": true, "version": 1}}`, en gardant les `answers` déjà présentes. Écris `full-visual.preferences.md`
en français, comme un court portrait de son goût : objectif, direction choisie, préférences réglées, limites et choix
ouverts. Les preuves et révisions vont dans le JSON, pas sur la page. N’invente pas de préférence pour un point sans
réponse.

## Réutiliser dans une vidéo demandée

Le réglage ne lance pas de vidéo. Quand une vidéo est demandée, le skill full-visual la fait comme il est écrit ; ce
profil ne fait que l’alimenter. Avant le script : la langue du profil recopiée dans `"language"` du `reel.json`, le
choix de mots enregistré, les lignes éditoriales et la position. Avant la voix : la voix enregistrée (`reel.json`
`"voice"` pour ElevenLabs, ou `reels/<slug>/voice.json` pour un autre fournisseur). Avant les sous-titres et le rendu :
le thème enregistré écrit dans `"theme"` du `reel.json` de la nouvelle vidéo, et toute limite de chrome.

Un changement propre à un projet reste dans le `reel.json` de cette vidéo ; le profil ne change pas. Les vraies
interfaces, logos, documents et chiffres gardent leur vraie apparence et leurs vraies données ; le thème habille
seulement les sous-titres, les fonds et la présentation que nous créons. Les constructeurs reçoivent le thème résolu et
les contraintes utiles avec leur tâche, pas le profil brut. Ne change pas l’orchestration des constructeurs, les arrêts
de relecture ou les validations au titre de la personnalisation. Ne fabrique jamais une validation.

## Apprendre de ce qu’il dit pendant le travail

Applique une correction à la chose qu’elle nomme. « Ce mot-clé ne devrait pas être encadré » est local. « Plus de
cadres à partir de maintenant » met à jour tout de suite le défaut concerné ; ne redemande pas de validation quand la
consigne est explicite. Un refus sans raison appelle une seule question ciblée.

Pour une réaction récurrente ambiguë, propose la préférence déduite et garde-la provisoire jusqu’à confirmation.
Généralise seulement aussi loin que les preuves le permettent. Réécris le paragraphe de préférence concerné, garde le
raisonnement sans rapport, et garde les choix remplacés comme preuves dans le profil, pas comme directions
concurrentes.

Montre les chemins des fichiers enregistrés. Dis si un réglage a été enregistré, appliqué, vérifié sur des images
d’aperçu, ou demande encore un changement du moteur ; ce sont des résultats différents.
