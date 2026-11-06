# Quatre vidéos dont apprendre

Les plus grosses vidéos que ce format a faites, comme matière à lire dans le dossier `examples/` de ce skill
(`.agents/skills/full-visual/examples/<slug>/`). Chacune contient :

- `script.txt` (les mots), `script.v3.txt` (les mêmes mots avec leurs balises de voix), `caption.txt` (les
  sous-titres et leurs scènes), `reel.json` (la voix et le thème), `facts.md` quand il a été écrit ;
- `plan.md`, le plan visuel d’après lequel les constructeurs ont travaillé ;
- `stills/`, huit images de la vidéo finie (le nom du fichier est la seconde où elle a été prise) : le niveau à
  atteindre ;
- `code/`, le code de deux de ses scènes, l’accroche et une scène phare, avec leurs fichiers helpers.

Ce ne sont pas des vidéos dont tu peux faire le rendu ici : leurs voix, leurs images vidéo et leurs autres scènes
restent chez leur créateur. Lis le plan à côté des images fixes, puis le code : c’est comme ça qu’une phrase est
devenue une image.

Ces quatre vidéos sont en anglais ; leurs phrases citées ci-dessous restent telles quelles. Une nouvelle vidéo se fait
dans la langue de son `reel.json` (`"language"`, `"fr"` par défaut) : reprends la construction et le rythme d’une
phrase, jamais sa traduction mot à mot.

Copie leur façon de penser et leur soin, jamais leurs images ni leurs mots. Chaque plan a été écrit pour le créateur
qui a construit le format : « his » (ou « il », « son ») dans un plan désigne ce créateur, et les notes d’un plan sur un présentateur ou
sur un fichier qui n’est pas ici ne s’appliquent pas.

## touchscreen : pourquoi ton écran ignore un stylet

L’objet du quotidien, l’exploit qui paraît impossible, et un seul mécanisme caché. "Your phone screen reacts to the
lightest brush of your finger and ignores a pen pressed as hard as you can. So what is it actually feeling? It isn't
really feeling pressure, it's measuring the electricity in your body."

- Un monde, trois échelles : l’écran ouvert vu de côté (verre, couche tactile, OLED, châssis, lus sur des photos de
  démontage), la grille de fils telle que le téléphone la voit, une main gantée qui décroche un appel dans la neige.
- L’invisible (la charge à chaque croisement) a un seul look pour toute la vidéo, pour que l’œil le suive.
- Chaque phrase change une seule vraie chose ; « that’s also why » paie la pluie et les gants tactiles ; le dernier
  plan résout le premier.
- Code : `HookX1*` (l’accroche : le doigt contre le stylet sur la coupe) et `WireGrid*` (la grille de fils,
  construite et lue).

## iphone-keyboard : les touches que tu touches ne sont pas celles que tu vois

Même forme, une autre idée fausse : "Every key on your iPhone keyboard is smaller than your thumb and you still hit
the right letter almost every time."

- Un objet fil rouge, le vrai clavier iOS redessiné à sa vraie géométrie, et une chose invisible dessous : les zones
  de frappe, en ambre, qui gonflent et se resserrent à mesure que la lettre suivante devient probable.
- Une vraie source à l’écran (le livre de l’ingénieur, la page du brevet), de vrais nombres (44 pixels, 320 de
  large).
- Code : `HookX1*` (l’accroche) et `KbZoneGrow*` (la zone autour de la lettre suivante qui grandit sous le pouce).

## ps5-on-pc : des jeux PS5 qui démarrent sur un PC

L’info dite simplement, puis le mécanisme. L’accroche que le format tient pour référence : "Sony wants you to stop
owning your games. So the community rebuilt the PS5 in open source." (`script.txt` contient le corps avec sa première
accroche, "GTA 5, Spider-Man, Silent Hill 2. Their PS5 versions already boot on a PC, with a free emulator called
KytyPS5.")

- Du matériel réel partout : les vrais jeux, de vraies images de gameplay, les vrais noms de fonctions qu’un jeu
  appelle, les vraies instructions GPU, les vrais dépôts.
- Un seul tableau de câblage porté sur trois scènes, ses prises remplies une à une à mesure que l’explication monte.
- Code : `HookVC*` (la console décomposée, chaque nom une vraie chose sur son mot, avec autour le code et les
  personnes qui l’ont reconstruite) et `KytyLive*` (l’émulateur qui répond aux appels du jeu, en direct).

## pewdiepie-abliteration : comment on fait une IA qui ne dit jamais non

Une histoire que les gens ont déjà entendue, expliquée en profondeur. "How did PewDiePie make an uncensored AI that
never says no?"

- Une seule image tenue jusqu’au bout : une carte 3D où chaque requête est un point. Elle est tournée, mesurée,
  aplatie et abîmée, pour qu’une idée difficile (une direction dans l’espace d’un modèle) devienne quelque chose qu’on
  regarde se produire.
- Le revers et son chiffre (les scores en maths qui chutent), un outil gratuit, et une vérification que le spectateur
  peut faire lui-même.
- Code : `map.ts` et `MapSpace.tsx` (une caméra, une vraie projection, un seul monde), `HookX2*` (une accroche
  construite dans ce monde) et `Flatten*` (la carte aplatie).

## Ce qu’elles ont en commun

La chose nommée dès les premiers mots, un exploit ou une histoire que le spectateur connaît déjà, la réponse donnée
tôt, une scène vécue, une chaîne de vrais événements chacun causé par le précédent, une deuxième couche, une fin qui
fait écho à la première phrase, et quelque chose à enregistrer ou à envoyer. À l’écran : de vraies choses dessinées
avec soin, un seul monde, l’invisible rendu visible, du nouveau sur chaque mot clé, et une première seconde qui dit
déjà l’idée sans le son.
