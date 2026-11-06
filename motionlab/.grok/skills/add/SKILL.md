---
name: add
description: "Fusionne un pack MotionLab qui vient d’être téléchargé dans ce dossier. À utiliser chaque fois que le client dit ajouter, installer, j’ai téléchargé un autre pack, j’ai acheté un nouveau format, fusionne ça, ou désigne un dossier décompressé ou un zip. Aussi pour retirer un pack quand il le demande, et pour lister ce qui est installé. Aussi : 'add', 'install', 'I downloaded another pack', 'I bought a new format', 'merge this', 'what do I have installed'."
---

# Add

## Objectif

Un seul dossier, un seul runtime. Un nouveau pack ajoute ici son format, son skill, ses scripts et ses ressources, et rien d’autre ne change. Le retirer, c’est le même manifeste lu à l’envers.

## Raisonnement

Un client qui possède trois packs ne doit pas avoir trois dossiers, trois contextes et trois tableaux. Chaque pack déclare ce qu’il apporte, dans `pack.json` quand c’est un pack nu et dans `.installed/<format>.json` quand c’est un dossier que quelqu’un a acheté, donc la fusion est déterministe et réversible, et le contexte et les rushes du client ne sont jamais touchés. Un dossier acheté plus tard peut être plus récent que celui acheté en premier, donc la partie commune est mise à jour avant que le format n’entre.

## Déroulé

1. Trouve ce qu’il a téléchargé : le chemin qu’il a donné, ou le dossier le plus récent de Téléchargements qui contient un `AGENTS.md` ou un `pack.json`. Décompresse-le d’abord si c’est un zip. Les deux formes marchent, et ce qu’il a acheté est normalement la première : un dossier entier avec un format déjà dedans, ou un pack nu.
2. Lance `node scripts/add.mjs <path>`. Il prend le format et rien d’autre : le skill, les scripts, les ressources, les compositions et l’enregistrement d’installation. Quand le dossier téléchargé est plus récent que celui-ci, la partie commune est d’abord mise à jour. Ses rushes, son contexte et ses clés ne sont jamais touchés.
3. Lance `node scripts/doctor.mjs`. Le nouveau format peut avoir besoin d’une clé ; dans ce cas, ouvre la page des clés.
4. Dis au client la seule commande qu’il a gagnée et que le premier passage la configure. Le téléchargement peut aller à la corbeille.

Retrait : `node scripts/add.mjs --remove <format>` utilise l’enregistrement d’installation pour supprimer exactement ce qui a été ajouté.

## Exemples

« J’ai acheté quick cuts, c’est dans mes téléchargements » : décompresse-le, fusionne-le, dis que `/quick-cuts` existe maintenant et posera quelques questions de réglage à son premier passage. « J’ai quoi d’installé ? » : lis `runtime.json` et liste les packs avec leurs versions.

## Contre-exemples

Copier les fichiers d’un pack à la main. Dire au client que son téléchargement est mauvais parce qu’il n’y a pas de `pack.json` à sa racine : un dossier acheté n’en a jamais, et c’est la forme qu’il aura toujours. Écraser le `workspace/library/` ou le `context/` du client pendant une fusion. Relancer `/start` après une fusion alors que rien n’a changé sur la personne.

Lis `references/merge.md` pour ce qui est fusionné et où.
