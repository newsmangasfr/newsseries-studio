---
name: captions
description: "Interne. Écrire et vérifier la légende du post pour n’importe quel format, appelé par les skills de format à l’export. À utiliser chaque fois qu’un caption.txt est écrit, que le client demande une légende, un mot-clé de commentaire, un texte de DM, ou demande pourquoi une légende a échoué à la vérification. Deux formes, selon que le client a ou non une automatisation commentaire vers DM. Écrite dans la langue du client, français par défaut. Aussi : 'write the caption', 'comment keyword', 'why did my caption fail'."
---

# Légendes

## Objectif

Une légende qu’un inconnu comprend dès la première ligne, qui porte la valeur promise par la vidéo, nomme une action et l’obtient, et que la recherche peut lire. Écrite pour le lecteur ; il se trouve que c’est ce que la portée récompense. Elle est écrite dans la langue du client, celle de la vidéo (français par défaut), directement dans cette langue et non traduite.

## Raisonnement

La portée vient du temps de visionnage, des likes par personne atteinte et des envois par personne atteinte. Une légende ne peut pas ajouter de temps de visionnage, mais une légende qui vaut la peine d’être envoyée à un ami (une liste, une série de prompts, une checklist) ajoute des envois et des enregistrements. Le texte de la légende est lu par la recherche Instagram et par Google et Bing, donc les mots du sujet vont en prose simple dans les deux premières phrases, avec les mots que le public tape vraiment. Les hashtags ont été plafonnés à cinq et ne font que classer un post, donc on n’en met aucun ici. Les 125 premiers caractères s’affichent avant « plus », donc la première ligne est toute la légende pour la plupart des lecteurs.

La première ligne dépend d’un seul fait dans `context/answers.json` : l’existence ou non d’une automatisation commentaire vers DM. Avec, la légende demande un commentaire et livre par DM. Sans, elle ne demande jamais un commentaire auquel elle ne peut pas répondre. Ce sont deux légendes, pas une légende avec une ligne en moins.

## Méthode

Avec automatisation :
1. Ligne commentaire : le mot-clé, ce qui arrive, où. « Commente MEMO et je t’envoie le guide complet. » Un seul mot-clé, en capitales sans accent, propre à ce post, le même mot à l’écran et dans l’outil de DM. Moins de 125 caractères, rien avant.
2. Le pourquoi : deux à quatre phrases qui nomment le sujet avec des mots qu’on cherche : l’autorité, l’outil, la méthode, le résultat.
3. La valeur, complète : des prompts numérotés écrits en entier, une checklist à un élément par ligne, des outils avec une courte phrase chacun. Le DM ajoute la version longue ; la légende n’est pas un teaser.
4. La fin : quoi en faire. « Enregistre ça, puis lance le prompt 2 sur un message que tu as déjà envoyé. »
5. La ligne d’abonnement : « (abonne-toi d’abord pour que mon DM t’arrive) ».

Sans automatisation : la première ligne est la promesse (« Les 5 prompts qui font écrire Claude comme un consultant, juste en dessous »), puis le pourquoi, la valeur complète, et une fin qui demande un enregistrement ou un envoi. Pas de mot-clé, pas de ligne d’abonnement.

**Chaque chiffre ici est un défaut, et le compte l’emporte.** `context/captions.json` (écrit par `captions.mjs`) contient ce que ce client fait vraiment : la longueur, la première ligne, les blocs, les lignes de faits et le signe qu’elles portent, la fréquence d’un lien et d’un mot-clé, les ouvertures et les fins qui reviennent avec ce que chacune a atteint, et les signes que le compte utilise. Lis-le, par format quand le format en a un, avant d’écrire un mot. Les défauts ci-dessous valent pour un compte sans rien de mesuré : 600 à 2 200 caractères, une ligne vide entre les parties, une majuscule seulement en début de phrase, des chiffres pour les nombres, au plus un emoji à la fin de la première ligne. Un compte dont la médiane est 870 en reçoit 870, pas 1 400 ; un compte qui finit la moitié de ses posts par « Enregistre ça » finit celui-ci comme ça ; un compte qui n’utilise aucun emoji n’en reçoit aucun, et un compte qui en met dans un dixième de ses posts peut en avoir un.

Pour Trial Reels, suis la référence de légende propre à la source dans ce format. Garde l’appel à l’action de la source et son mot-clé qui marche quand la ressource reste la même ; reformule légèrement chaque variante au lieu d’imposer une nouvelle structure de légende.

La même mesure tourne sur ce que tu as écrit. `checks/captionfit.mjs` passe chaque légende dans `scripts/lib/caption.mjs`, la seule fonction qui a lu le compte, et la fait échouer face aux propres chiffres du compte. Deux mesures dériveraient et la vérification ne comparerait rien.

## Exemples

Voir `references/examples.md` : trois légendes de référence avec leurs mesures.

## Contre-exemples

Une première ligne qui répète l’accroche à l’écran. Prendre un chiffre sur cette page quand `context/captions.json` a ceux du client. Écrire une légende maison pour chaque compte : deux formats d’un même compte peuvent écrire différemment, et la lecture le dit par format. Des hashtags sur un compte qui n’en utilise jamais. Des tirets cadratins ou demi-cadratins, des puces en emoji, des phrases EN CAPITALES. « Lien en bio » pour quelque chose qui tient dans la légende. « La liste complète est dans mes DM » sans rien dans la légende. Un mot-clé déjà utilisé dans un post précédent. Une affirmation absente des sources du brief. « Like et partage ». Une légende traduite de l’anglais au lieu d’être écrite en français.
