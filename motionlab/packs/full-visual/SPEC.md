# Full Visual

## Objectif

Transformer tout ce qu’un créateur veut expliquer en reel explicatif animé plein écran : une voix off, des sous-titres
qui affichent chaque mot au moment où il est dit avec un mot clé encadré par ligne, et dessous la vraie chose dont
parle chaque phrase, dessinée avec soin et qui bouge sur le mot. Pas de présentateur, zéro coupe, 1080x1920 à 60 fps,
cinq accroches.

## Raisonnement

Les plus gros reels du vendeur ont toujours été faits de la même façon : le script d’abord, validé en mots, puis toute
la vidéo d’un coup par de nombreux agents, chaque scène dessinée d’après de vraies photos de la vraie chose et relue par
un regard neuf, avec cinq accroches construites côte à côte. Ce pack livre ce processus, le niveau d’exigence pour
lequel il a été conçu, et quatre de ces reels comme exemples commentés. La première version livrait l’ancienne méthode
(un plan validé, puis un premier passage, puis un constructeur à la fois), qui donnait des premiers résultats plus pauvres.

## Déroulé

- `/full-visual <ce que je veux>` : recherche, puis le script avec trois ou quatre phrases d’accroche
  (`full-visual-script`). Le créateur choisit une accroche et retouche les mots : c’est la seule validation.
- Puis la vidéo d’un coup (`references/workflow.md` ; dans Claude Code, le workflow enregistré `full-visual-reel`) :
  voix off, sous-titres, plan et critique, chaque scène et cinq accroches en parallèle, chaque scène avec un relecteur, rendus.
- L’app de l’espace de travail fait la même chose en trois étapes (recherche, script, vidéo) sur un seul dossier de
  projet (`references/workspace.md`).
- Le moteur est dans `engine/full-visual/`. Les reels sont des dossiers dans `engine/full-visual/reels/` et s’enregistrent
  d’eux-mêmes. Une mise à jour remplace le moteur et garde chaque reel, ressource et rendu fait par le client (`provides.keep`).
- `/full-visual-customization` est facultatif : il enregistre le look des sous-titres, le fond, la voix et les mots du créateur.

## Sortie

Cinq rendus 1080x1920, 60 fps, H.264 (un par accroche), la légende du post et une couverture. Voix off seule. Le son est
demandé une fois, après l’image.

## Limites

Vidéos dans la langue du client, le français par défaut. Aucun personnage ni présentateur n’est livré. Beaucoup d’agents
à la fois demandent une machine qui a de la marge : les rendus font la queue d’eux-mêmes, la vérification de types passe
à tour de rôle, et `slots` réduit le nombre d’agents qui construisent ensemble.

## Contre-exemples

Construire d’abord un passage et attendre. Demander la validation du plan. Un constructeur après l’autre quand les
sous-agents existent. Une scène dessinée de mémoire au lieu de vraies photos. Livrer le visage, le clone de voix ou le
personnage du vendeur.
