---
name: research
description: "Interne. Comment un format décide du sujet d’une vidéo : lire le compte et la direction choisie par le client, proposer des idées concrètes si besoin, donner à chaque chose son lieu d’origine et un moment qu’un inconnu reconnaît, vérifier chaque affirmation le jour où elle sort, et laisser le choix suivant bouger avec les chiffres. Appelé par chaque format avant un brief, et chaque fois que le client demande de quoi parler ou dit « trouve-moi un thème ». Aussi : 'what should I post about', 'find me a theme'."
---

# Recherche

## Objectif

La prochaine vidéo parle de quelque chose pour lequel le public de ce compte a déjà prouvé qu’il s’arrête, chaque nom et chaque chiffre y est vrai le jour de la publication, et le choix bouge tout seul la fois suivante parce que la dernière vidéo a été regardée.

## Raisonnement

Choisir, c’est l’essentiel de la valeur. La fabrication est la même à chaque fois. Ce qui change, c’est le sujet de la vidéo : un mauvais choix est donc la seule façon dont un format échoue, et aucun rendu ne le rattrape. Une liste de sujets irait à n’importe quel compte, et n’importe quel compte, c’est personne. Les propres posts du client disent déjà qui le suit, pour quoi ces gens se sont arrêtés et à quel point, donc le choix part de là quand la lecture est disponible. Pendant qu’elle tourne, un sujet et un public donnés explicitement par le client peuvent ancrer ce brief-là ; ne présente jamais ça comme une connaissance mesurée du compte.

Un thème, c’est un post ; une ligne éditoriale, c’est une série de posts. Une ligne est un domaine qu’un professionnel nommerait comme son propre métier, assez étroit pour que quatre réponses soient la réponse et pas un échantillon. Trois idées concrètes aident quand le client n’a pas de direction. Une idée choisie, son propre brief ou « Choisis pour moi » règlent déjà qui fait ce choix. Redemander n’apporte aucune preuve. La profondeur dans une ligne que le compte possède déjà vaut mieux qu’une nouvelle ligne choisie pour fuir des chiffres faibles, et des chiffres faibles méritent d’être relus deux fois avant d’y croire.

Un choix n’est pas fini quand la chose est nommée. Chaque chose a un lieu d’origine et un moment qu’un inconnu reconnaîtrait, et les choisir relève du même savoir-faire que choisir la chose. Si tu te trompes, la vidéo montre un résultat de recherche ou une page d’accueil, ce qui se lit comme l’agent au travail plutôt que comme une preuve. Le fichier qui porte ce jugement appartient au format, parce que ce qui compte comme lieu d’origine diffère entre un dépôt, un article scientifique et une vidéo.

Les affirmations sont relues le jour même, parce qu’un chiffre est une affirmation factuelle dite avec la voix du client, et un seul mensonge repéré coûte plus que ce que la vidéo a rapporté.

Et le compte bouge. Le choix suivant part de ce que la dernière vidéo a atteint, pas de là où le dernier choix était parti, sinon le format sort la même vidéo pour toujours pendant que les chiffres disent autre chose.

## La méthode

1. **Lis d’abord le contexte disponible.** Utilise `context/profile.md`, `context/formats.md`, `context/voice.md` et `context/answers.json`. Réutilise `audience.for` et `audience.need` dans tous les formats. Si l’un manque et que cette vidéo en a besoin, demande « Tes vidéos sont pour qui ? » ou « Ils ont besoin d’aide pour quoi ? », une question à la fois, avec des suggestions pertinentes. Enregistre la réponse une fois dans `context/answers.json` avec sa provenance client et mets à jour `profile.md`. Garde l’idée choisie du jour dans le `brief.md` du projet. Ne redemande jamais le contexte partagé en changeant de format, et ne présente jamais une réponse donnée par le client comme une preuve mesurée du public.
2. **Pars de la dernière vidéo quand les lectures du compte existent.** `node scripts/reach.mjs` donne chaque forme de post du compte face à la médiane du compte lui-même, et ce que ce dossier a publié depuis. Lis un petit groupe en regard de son nombre de posts avant d’y croire : deux posts à 17x, c’est une coïncidence avec une décimale. Au premier passage, il dit que rien de nous n’a encore été mesuré, et la méthode continue.
3. **Utilise la direction déjà donnée.** Une idée choisie ou un brief explicite part directement en recherche. « Choisis pour moi » autorise ton choix à partir du contexte et des idées enregistrés. Sinon, propose trois idées concrètes, chacune avec un résultat utile, une raison courte tirée des preuves disponibles et assez de candidats vivants pour porter le format ; demande une fois. Enregistre les suggestions non utilisées dans la réserve d’idées du format quand il en a une. Une direction n’approuve pas la liste finale, sauf si le client a aussi approuvé ce contenu exact.
4. **Trouve les choses dans la ligne, un terme à la fois.** Cherche une chose par son seul nom, jamais son nom plus un mot de catégorie, pour que le vrai projet et ses copies abandonnées remontent tous les deux. La popularité est un filtre, pas le choix. Ouvre les pages. Cherche dans la langue où la chose vit : un projet anglais se cherche en anglais, même pour une vidéo en français.
5. **Donne à chaque chose un lieu d’origine, un moment et une forme.** Son propre lieu d’origine, jamais une page qui en parle. Le moment qu’un inconnu reconnaît, jamais le haut d’une page. Puis la forme qui l’enregistre. La référence propre au format porte ce jugement et se lit avant toute capture.
6. **Vérifie le jour de la publication, pas le jour où tu as trouvé.** `references/verify.md` dit ce qui compte. Invérifiable veut dire inutilisé : dis-le au lieu d’adoucir la phrase. La plus grosse chose de la ligne qui s’avère morte vaut plus qu’un cinquième choix : elle va dans `avoid` et devient la meilleure ligne de la légende. La vérification du format est la barrière, et une vérification qui n’a pas pu tourner est un échec.
7. **Adapte-la au format qui l’a demandée, puis écris `brief.md` :** la direction choisie et pourquoi elle va à ce public, chaque chose avec son lieu d’origine, son moment et sa preuve, les sources une ligne chacune, et tout résultat antérieur réel qui a changé ce choix. Garde l’ID et la provenance de l’idée quand elle vient d’une réserve enregistrée.

## Exemples

Un compte de 52 400 abonnés dont le public fait tourner des modèles open source sur sa propre machine. Reach dit que la forme qui pose des cartes changeantes sur un clip tourne à 3,2 fois la médiane du compte sur 48 posts, alors que la forme panneau fixe tourne à 0,6 sur 96. Les trois lignes sont donc proposées à l’intérieur de la première, pas loin d’elle, et les quatre choses de la ligne retenue sont trouvées par leur nom, chacune vivant dans son propre dépôt, chacune avec un moment différent : un tableau de benchmark, une démo dans le readme, un tableau d’outils, un bloc d’installation. Les chiffres sont relus le matin de la sortie.

Une coach carrière dont le public veut mieux écrire. La ligne n’est pas « les meilleurs outils d’écriture », ce sont les méthodes que les consultants apprennent vraiment. L’une des quatre est une explication en vidéo de l’écriture « réponse d’abord », donc le lieu d’origine est la vidéo, le moment est les quatre-vingt-dix secondes où la structure est dessinée, et la forme est `play`.

Un deuxième passage sur le même compte. La dernière vidéo est restée sous la médiane et les candidats de cette ligne étaient maigres, donc la ligne est fermée en une phrase dans `brief.md` et les trois suivantes sont proposées à partir des deux qui ont porté.

## Contre-exemples

Un thème qui pourrait aller à n’importe quel compte. Un seul thème proposé là où trois lignes étaient demandées. Une ligne déclarée forte sur deux posts. Une ligne abandonnée pour des chiffres faibles qui venaient d’un partenariat sponsorisé. Quatre choses renvoyées par un moteur de recherche. Un agrégateur, un article-liste ou une page d’accueil à la place de la chose. Un moment choisi avant d’ouvrir la page. Un chiffre pris dans un extrait de recherche, dans un readme ou de mémoire. Un chiffre vérifié il y a deux jours. Une affirmation que le client ne pourrait pas défendre en commentaire. Un deuxième passage qui part exactement d’où le premier était parti, comme si rien n’avait été publié entre-temps. Chercher sans contexte de compte disponible ni brief explicite du client.
