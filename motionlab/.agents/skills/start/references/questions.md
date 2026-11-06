# Ce que start lit, et le peu qu’il peut encore demander

Start sait avant de demander. Lis d’abord les réponses enregistrées et les notes du compte. Ne demande que lorsque la réponse manquante change ce qu’on peut faire. L’espace de travail montre une seule courte question à la fois, puis relit les réponses en cinq lignes. Les corrections de réglage et la confirmation passent par le chat. Le Markdown du compte peut aussi être modifié et enregistré directement.

Le public et ce pour quoi il a besoin d’aide appartiennent à la personne, une fois, pour tous les formats. Enregistre-les dans `context/answers.json` sous `audience.for` et `audience.need`, avec leur origine dans `read`, et explique-les dans `context/profile.md`. Utilise les ids de question `audience` et `audience_need`. Demande « Tes vidéos s’adressent à qui ? » ou « Sur quoi ont-ils besoin d’aide ? » seulement quand ce fait est encore inconnu. Propose jusqu’à trois suggestions pertinentes et laisse toujours la place à ses propres mots. Le réglage du compte n’a pas à attendre une direction de contenu détaillée ; un format à sujet peut ajouter une réponse manquante plus tard et tous les formats la réutilisent.

Une question répondue disparaît de l’espace de travail même si un ancien fichier de questions la contient encore. Pour revenir explicitement sur un fait que le client veut changer, mets `revisit: true` sur cette question. Un brouillon sur une page n’est jamais une réponse enregistrée. La ligne de contexte partagé dit ce qui est déjà enregistré et renvoie vers le compte, où on peut le relire.

Écris les questions et la relecture dans la langue du client, en français par défaut, en le tutoyant.

## Le contrat de la page

L’agent écrit `context/questions.json` : `{ questions: [{ id, ask, options?: [string] }], readback: [string] }`. `questions` ne contient que les questions non résolues, trois au plus, avec des ids stables qui nomment le fait qu’elles résolvent. Chaque question tient en une courte phrase. N’ajoute des choix que s’ils ont du sens ; une réponse libre reste possible. Retire une question dès que sa réponse est enregistrée dans `context/answers.json`, en gardant la provenance `read` de ce fichier. Un tableau vide veut dire qu’il n’y a rien à demander, pas que le réglage du compte est terminé.

`/setup/questions` lit ce fichier et prépare un prompt. Taper, choisir ou copier des réponses de réglage ne les enregistre pas. Une fois le prompt arrivé dans le chat, l’agent met à jour `context/answers.json`, les notes de compte concernées et `context/questions.json`. Relis le Markdown du compte avant de le mettre à jour ; Enregistrer sur une page Markdown a déjà écrit les modifications du client dans le vrai fichier. Garde son `readback` à cinq courtes lignes ne contenant que des faits réellement connus. Quand les lectures sont terminées, partage `/setup/readback` pour correction ou confirmation par le chat. Seul l’agent écrit done dans `context/start.json`, une fois les lectures et la confirmation faites.

## La lecture

| Fait | Lu dans | Sûr quand | Sinon |
|---|---|---|---|
| Une automatisation de commentaires existe et tourne sur les reels | Part des 20 dernières légendes dont la première ligne est « Commente MOT » ou "Comment WORD" (guillemets permis, casse libre) | Plus de 60 % (oui) ou moins de 20 % (non) | Demande : « Tu as une automatisation commentaire vers DM sur tes reels ? » |
| Ce que porte le DM | Les promesses de ces premières lignes : « les liens », « le guide », « le détail complet » | Au moins trois lignes de ce genre | Demande, seulement si l’automatisation est oui : « Tu envoies quoi aux gens : des liens, un guide, une liste ? » |
| Où vont les gens après Instagram | Le lien en bio, ou aucun | Toujours | Jamais demandé |
| Pour qui c’est, pour qui ce n’est pas | Les réponses enregistrées, la bio et les sujets récurrents des posts récents | Le public visé est dit ou déjà confirmé | Demande : « Tes vidéos s’adressent à qui ? » |
| Sur quoi ce public a besoin d’aide | Les réponses enregistrées, les guides du client et les questions ou problèmes récurrents dans les légendes | Un besoin concret est dit ou confirmé | Pour un reel à sujet seulement, demande : « Sur quoi ont-ils besoin d’aide ? » |
| Sur quoi le client est crédible | Le nombre d’abonnés, la bio, les affirmations des légendes à la première personne, les résultats cités | Vingt posts ou plus | Demande : « Sur quoi tu es crédible : des chiffres, des métiers, des résultats, une méthode qui porte un nom ? » |
| La voix | Mesurée sur les légendes des 90 derniers jours dans `context/voice.md` | Vingt légendes ou plus | Écrite à partir de la bio et des réponses du client, marquée comme mince |
| Ce qu’il publie | Les légendes et jusqu’à 12 miniatures des 90 derniers jours | Un sujet ou une présentation récurrents sont visibles | Note l’incertitude ; l’étude exacte des formats appartient à Trial Reels |
| Langue | Les légendes | Toujours | Jamais demandé |
| Rythme | L’historique de publication | Toujours | Jamais demandé |

## Ce que change chaque fait

L’automatisation décide de la première ligne de chaque légende et de l’écriture ou non d’un mot clé et d’un texte de DM. Le livrable décide de ce que la légende porte en entier et de ce que le DM ajoute. La destination décide si « lien en bio » est jamais écrit. Le public décide du thème que choisit chaque format. La crédibilité décide des affirmations qui peuvent être dites à la première personne. La voix et les formats décident de tout le reste.

## Jamais demandé

L’outil derrière l’automatisation (ManyChat, celui d’Instagram : rien de ce qu’on fait ne change avec ; le mot clé et le texte du DM sont des fichiers que le client colle), l’objectif, où sont les rushes (le réglage d’un format le demande quand il a besoin d’un fichier), combien de posts par semaine, visage ou pas, musique ou silence, langue, plateformes, couleurs, polices.

## La relecture

Cinq lignes, avec les mots du client, une par fait qui compte : « Tu as une automatisation de commentaires et elle envoie des liens, parfois un guide. Pas de lien en bio. Tes posts s’adressent aux développeurs et aux fondateurs qui font tourner de l’IA open source sur leur propre machine. Tu es crédible grâce à tes 67 912 abonnés sur ce sujet et parce que tu testes chaque outil toi-même. Deux formats portent le compte, le regard vers le haut et le bureau ; le regard vers le haut touche dix fois plus de monde par post. » Puis : « Corrige ce qui ne va pas, ou dis go. »
