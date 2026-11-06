---
name: edit
description: "Interne. Exporte une vidéo que le client a modifiée à la main dans l’éditeur de l’espace de travail, la vérifie et la lui rend. À utiliser quand le client colle la ligne d’export de l’éditeur (« Exporte mon montage ... » ou \"Export my edit of ...\"), dit exporte ma modif ou fais le rendu de mes changements, quand le hook de session signale une vidéo modifiée en attente, ou quand un format doit ouvrir sa vidéo comme une modification (node scripts/edit.mjs read). Aussi : 'export my edit', 'render my changes'."
---

# Edit

## Objectif

Ce que le client a arrangé dans l’éditeur est ce qu’il obtient, image par image, sans que ses propres rushes soient jamais redessinés, et vérifié avant qu’il le voie.

## Raisonnement

L’éditeur ne fait jamais de rendu. Chaque vidéo, quel que soit son format ou même partie de zéro, s’ouvre comme un seul document de montage (`workspace/projects/<id>/edit/timeline.json`) : clips, sons, images, mots, sous-titres et graphismes sur des pistes, en images. Appuyer sur Exporter écrit `edit/export-request.json` et donne au client une ligne à coller ici. Le rendu est à nous, comme tous les autres rendus, parce que seul l’agent peut regarder le résultat et dire qu’il est juste.

L’export garde la garantie du runtime sans qu’aucun format ait à la connaître. Un clip qui remplit l’image exactement comme son fichier passe par ffmpeg sans être touché ; tout le reste (mots, sous-titres, graphismes, clips dans une boîte ou tournés) est dessiné par la même composition `Edit` que joue l’éditeur, sur une piste transparente posée sur le clip en une seule passe ffmpeg. Chaque son est mixé à partir des fichiers. Donc l’export ne bifurque jamais selon le format : un talking head, un montage et un projet 16:9 vierge sont les mêmes quelques types d’éléments.

Ce sont les vérifications qui rendent l’export fiable, donc aucune n’est facultative : la durée à l’image près, la taille, la cadence, le son (présent exactement quand le montage a du son, jamais saturé), et trois images de la vidéo comparées aux mêmes images de `Edit` dessiné en entier, y compris un moment de sous-titres quand le montage en a. Une vidéo en échec n’arrive jamais dans le dossier de sortie.

## Déroulé

1. Lis la demande, pas le chat : `node scripts/edit.mjs status` liste ce qui attend. Le document fait foi ; exporte sa révision actuelle même si le client a continué à modifier après avoir appuyé sur Exporter. Une version Trial Reels s’écrit `<project>@<version>` : sa modification est dans `edit/<version>/`, sa vidéo est `<version>-edit-r<n>.mp4` avec la légende de la version à côté.
   - **Le travail que toi seul peux faire.** Un élément qui porte `agent: { task, note, ref }` a d’abord besoin de toi ; status les liste et l’export refuse tant qu’ils ne sont pas faits. Fais la tâche comme le dit le pack (`ref`, par exemple `editor/trial-reels/README.md` : les nouveaux mots composés dans les propres lettres du créateur avec words.py), puis `node scripts/edit.mjs resolve <project> <item> [--src <new file> --on <clip item>]` la marque comme faite. Quand la note dit que le changement est impossible (un nombre de lignes, une lettre absente des fichiers), dis-le au client avec ses mots et laisse-le changer ça dans l’éditeur. Ne marque jamais comme faite une tâche que tu n’as pas faite.
   - **Ce qui est laissé de côté.** Un élément qui porte `missing: '<reason>'` ne peut pas être dessiné ici (par exemple une carte Talking Head d’un moteur plus récent). L’export le laisse de côté et le liste sous `leftOut` ; dis-le au client en le nommant, en une ligne, avant qu’il regarde.
2. Dis une ligne (ce qui va être fait, combien de temps ça prend), puis lance `node scripts/edit.mjs export <project>`. Il refuse un document qui échoue à sa propre vérification, et refuse quand le disque manque de place ; corrige la cause, jamais la vérification.
3. L’image d’aperçu d’abord : `workspace/output/<project>/edit-r<revision>.jpg`. Regarde-la. `--still-only` s’arrête là quand le client veut seulement voir une image.
4. Quand c’est fini, ouvre `edit/checks/r<revision>/f<frame>.jpg` (l’image de l’éditeur à gauche, l’export à droite) et regarde chaque paire toi-même. Une réussite avec une image que tu n’as pas regardée n’est pas une réussite.
5. En cas de réussite, présente-la à la manière des étapes : ce qui a changé, la vidéo et son dossier ouverts avec `node scripts/open.mjs`, ce qu’il peut dire ensuite (changer quelque chose dans l’éditeur et exporter à nouveau). En cas d’échec, la raison est dans `edit/exports.json` ; dis-la en mots simples, corrige ce qui est de notre fait, exporte à nouveau.
6. `node scripts/edit.mjs read <project> --fresh` reconstruit la modification à partir des propres fichiers du format (après un nouveau rendu du format). Il garde l’ancien document dans `edit/versions/` et augmente la révision. Ne le lance jamais par-dessus les modifications à la main du client sans le dire.

Détails du plan, des vérifications et de leurs seuils : `references/export.md`.

## Exemples

Le client colle « Exporte mon montage « Still making every ad » (révision 3) ». Status la montre en attente ; l’export écrit l’image d’aperçu, puis `edit-r3.mp4` ; les trois paires correspondent, le moment de sous-titres montre les mots des deux côtés ; la vidéo et le dossier s’ouvrent : « Ta modification est exportée : l’accroche apparaît maintenant en fondu et le milieu est 1,5 fois plus rapide. Change ce que tu veux dans l’éditeur et exporte à nouveau. »

Un projet 1:1 vierge avec trois clips de téléphone et une chanson : même commande, mêmes vérifications. Les clips sont recadrés pour couvrir le carré comme l’éditeur les montrait.

## Contre-exemples

Faire le rendu depuis la page, ou demander au client de lancer la commande. Refaire le rendu par la chaîne propre du format au lieu de la modification. Baisser un seuil parce qu’une paire d’images diffère : trouve pourquoi elles diffèrent. Dire « exporté » avant d’avoir regardé les paires. Laisser une vidéo en échec dans le dossier de sortie. Exporter une ancienne révision parce que la demande la nommait. Effacer la modification du client avec une lecture fraîche sans la garder.
