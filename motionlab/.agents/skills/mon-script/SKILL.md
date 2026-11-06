---
name: mon-script
description: "Coacher le client pour qu’il écrive lui-même le script de sa vidéo : un modèle à remplir, cinq questions pour trouver l’angle, puis une relecture ligne par ligne qui garde ses mots et rend le texte clair, parlé et accrocheur. À utiliser pour '/mon-script', « aide-moi à écrire mon script », « je veux écrire moi-même », « relis mon script », « c’est bien ce que j’ai écrit ? », ou quand le client arrive avec un sujet et veut l’écrire. Ensuite le skill full-visual fait la vidéo. Pour un script écrit entièrement par l’agent, c’est le skill full-visual-script. Aussi : 'help me write my script', 'review my script'."
---

# Mon script

Un script écrit par le créateur bat presque toujours un script écrit pour lui : ce sont ses idées, ses exemples, sa
façon de parler, et c’est ce qui fait qu’on le reconnaît et qu’on le suit. Ton rôle n’est pas d’écrire à sa place.
C’est de l’aider à trouver l’angle, puis de rendre son texte clair, parlé et accrocheur, en gardant ses mots.

Lis d’abord `.agents/skills/full-visual-script/SKILL.md` et ses références (`hooks.md`, `shapes.md`) : c’est la
méthode que tu enseignes ici. Lis aussi le profil (`workspace/library/full-visual/profile.json`,
`workspace/library/full-visual.preferences.md`) pour la langue, le public et la demande de fin.

## 1. Le dossier de la vidéo

Crée le projet comme le dit `.agents/skills/full-visual/references/workspace.md` (`workspace/projects/<date>-full-visual-<slug>/`
avec `project.json`). Copie-y `assets/modele-script.md` sous le nom `mon-script.md`. Donne son chemin complet : il
peut l’écrire dans ce fichier, ou directement dans le chat.

## 2. Trouver l’angle : cinq questions

Pose-les toutes d’un coup, courtes, et dis qu’une ligne par réponse suffit :

1. Ta vidéo parle de quoi, en une phrase ?
2. Elle est pour qui ? (« les gens qui… »)
3. Qu’est-ce que la plupart des gens croient de faux là-dessus ?
4. Quelle est la vraie réponse, ce que le spectateur doit avoir compris à la fin ?
5. Qu’est-ce qu’il doit faire après : l’enregistrer, l’envoyer à quelqu’un, commenter un mot pour recevoir quelque chose ?

Avec ses réponses, propose trois débuts de vidéo possibles (une à deux phrases chacun, de types différents, voir
`full-visual-script/references/hooks.md`) et dis lequel tu prendrais et pourquoi, en une ligne. Il choisit, ou il
écrit le sien.

## 3. Il écrit

Rappelle le plan en six morceaux, une ligne chacun (il est aussi dans `mon-script.md`) :

1. **Le début** : la chose nommée dans les premiers mots, et une raison de rester.
2. **La réponse tôt** : vers la 8e seconde, « en fait, ce n’est pas X, c’est Y ».
3. **Un exemple vécu** : « Imagine : tu es… ». Une situation que tout le monde connaît.
4. **Le pourquoi**, simplement : une idée par phrase, chacune qui découle de la précédente.
5. **La surprise en plus** : le cas où ça ne marche pas, ou l’astuce que personne ne connaît.
6. **La fin** : elle répond à la première phrase, et dit quoi enregistrer ou à qui l’envoyer.

Donne la cible : 120 à 200 mots pour 40 à 60 secondes, jusqu’à 280 mots pour 80 secondes. Écrire comme on parle à un
ami : « tu », des phrases entières, pas de liste.

S’il bloque, aide morceau par morceau avec des questions (« tu as un exemple de ta vie là-dessus ? »), jamais en
écrivant le morceau à sa place. S’il demande explicitement que tu l’écrives, fais-le avec le skill `full-visual-script`
en partant de ses cinq réponses, et dis-lui qu’il peut le retoucher.

## 4. La relecture

Quand il a écrit, relis avec la grille de `full-visual-script` (« Avant de le montrer, lis-le comme un spectateur »)
et rends trois choses, dans cet ordre :

1. **Ce qui marche déjà**, en deux lignes au plus, précis (« ton exemple de la clé USB est parfait, on le voit »).
2. **Les corrections**, dans un tableau : la phrase telle qu’il l’a écrite, ta proposition, la raison en quelques
   mots. Cinq à dix lignes au plus. Les seules raisons valables : on ne comprend pas, ça ne se dit pas à voix haute,
   c’est trop long, le début n’accroche pas, la réponse arrive trop tard, un fait semble faux, la fin ne répond pas
   au début, il manque la demande.
3. **Le script complet corrigé**, prêt à être lu, avec ses mots partout où ils marchaient.

Ne change jamais son avis, son camp, ses exemples ni ses blagues. Ne rallonge pas. Garde ses tournures quand elles
sont seulement familières. Un fait que tu ne peux pas confirmer : signale-le, ne l’invente pas et ne le supprime pas
sans lui dire.

Il accepte, refuse ou retouche chaque ligne. Quand il dit que c’est bon, enregistre les mots finaux dans
`transcript.md` du projet (seulement les mots dits) et les débuts proposés dans `hooks.md`, puis enchaîne sur le skill
`full-visual` étape 3 sans autre question. C’est la seule validation de la vidéo.

## Ce que tu ne fais pas

- Écrire le script à sa place sans qu’il l’ait demandé.
- Rendre un texte « parfait » qui ne sonne plus comme lui.
- Corriger chaque virgule : seulement ce qui change ce que le spectateur comprend ou ressent.
- Faire une leçon d’écriture. Un conseil n’a sa place que s’il est attaché à une de ses phrases.
