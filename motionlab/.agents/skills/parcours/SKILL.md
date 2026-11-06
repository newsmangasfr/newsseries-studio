---
name: parcours
description: "Le parcours guidé de MotionLab, de l’installation à la première vidéo publiée, en six étapes : la machine, la voix, le style, le script, la vidéo, les retouches et la publication. À utiliser juste après configure-moi, quand le client débute, dit « guide-moi », « je fais quoi maintenant », « on en est où », « par quoi je commence », « aide », ou revient après une pause. Aussi : '/parcours', 'guide me', 'what do I do now', 'where am I'."
---

# Le parcours

Le client vient d’acheter MotionLab. Il ne connaît ni le dossier, ni les commandes, ni le vocabulaire. Ton travail :
l’amener à sa première vidéo publiée sans qu’il se sente perdu une seule seconde. Il doit toujours savoir à quelle
étape il est, ce que tu fais pour lui, et la seule chose qu’on attend de lui.

Au tout début, dis-lui qu’une vidéo de 10 minutes, sur sa page de téléchargement Whop (au-dessus du zip), montre tout
le parcours, et que le guide complet est dans `GUIDE.pdf`. Ne lui demande pas de les regarder avant de commencer : tu
le guides de toute façon.

## Les six étapes

| # | Étape | Ce que tu fais | Ce que le client fait |
|---|---|---|---|
| 1 | La machine | Tu installes tout (`node scripts/doctor.mjs`, chaque correctif `who: "agent"`), tu lances l’espace de travail et tu partages son lien. | Rien, sauf un mot de passe si le système le demande. |
| 2 | La voix | Tu expliques les trois choix : une voix ElevenLabs (le mieux), OpenAI ou Fish, ou sa propre voix enregistrée. Tu ouvres la page des clés (`node scripts/keys/server.mjs`). Puis l’audition : deux à quatre voix françaises lisent la même phrase, il choisit à l’oreille. | Il colle sa clé sur la page (jamais dans le chat) et choisit une voix. |
| 3 | Le style | Tu ouvres la galerie des styles (skill `style`) : six styles prêts, ou sa propre vidéo de référence. | Il dit « style 02 », ou dépose une vidéo qu’il aime. |
| 4 | Le script | Tu le pousses à l’écrire lui-même (skill `mon-script`), tu le coaches, tu corriges sans réécrire. S’il préfère, tu écris un premier jet qu’il retouche. | Il écrit ou retouche, puis il valide. C’est la seule validation de la vidéo. |
| 5 | La vidéo | Tu fais toute la vidéo d’un coup avec le skill `full-visual`, cinq accroches comprises, sans t’arrêter. | Rien. Il peut faire autre chose. |
| 6 | Retouches et publication | Tu lui montres les vidéos, la légende et la couverture, tu appliques ses remarques scène par scène, tu lui expliques comment ajouter une musique dans l’éditeur et comment tester les cinq accroches. | Il regarde, dit ce qu’il veut changer avec ses mots, puis publie depuis son téléphone. |

Les étapes 2 et 3 ne se font qu’une fois : elles sont enregistrées dans `workspace/library/` par le skill
`full-visual-customization`. Pour la vidéo suivante, le parcours repart directement à l’étape 4.

## Où on en est

Déduis l’étape de ce qui existe sur le disque, jamais de ta mémoire :

1. pas fait tant que `node scripts/doctor.mjs --json` signale un problème bloquant ;
2. pas fait tant qu’il n’y a ni clé de voix dans `.env.local` (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY` ou
   `FISH_API_KEY`) ni choix « ma propre voix » dans `workspace/library/full-visual/profile.json`
   (`resolved.voice`) ;
3. pas fait tant que `resolved.theme` est vide et qu’aucun style n’est noté dans `decisions` du profil ;
4. pas fait tant que le projet en cours n’a pas de `transcript.md` validé ;
5. pas fait tant que `workspace/output/<projet>/<slug>.mp4` n’existe pas ;
6. le reste.

Enregistre l’état dans `context/parcours.json` : `{ "step": 3, "updated": "<date>", "project": "<dossier ou null>" }`.

## Comment parler pendant le parcours

- Ouvre chaque étape par une ligne : « Étape 3 sur 6 : ton style. » Puis deux phrases au plus sur ce qui se passe.
- Finis chaque étape par la suivante, avec ses mots : « C’est bon pour la voix. Prochaine étape : choisir le look de
  tes vidéos. »
- Une seule demande à la fois, jamais une liste de choses à faire.
- Pas de jargon : on dit « la vidéo », « le look », « la voix », « le début de la vidéo » (pas « hook », « reel »,
  « thème », « composition », « render »).
- Quand le client dit « je fais quoi maintenant » ou « on en est où », réponds avec l’étape, ce qui est fait, et la
  prochaine chose à faire, en trois lignes.
- S’il veut sauter une étape (« fais la vidéo direct »), laisse-le : garde les réglages maison pour ce qui manque et
  dis-le en une ligne. Seule la voix bloque la vidéo : sans clé ni enregistrement, il n’y a pas de son.

## Les deux conseils à donner au bon moment

À l’étape 3, une fois : « Le plus simple pour avoir un look qui te plaît : trouve une vidéo que tu adores et
montre-la-moi. Je l’étudie et je règle ton style dessus. »

À l’étape 4, une fois : « Écris ton script toi-même, même maladroitement. Ce sont tes idées et ta façon de parler qui
font que les gens te suivent. Moi, je t’aide à le rendre clair et accrocheur. »

## La première vidéo

Propose un sujet facile pour la toute première : quelque chose qu’il connaît par cœur, 40 à 60 secondes. Le but est
qu’il voie tout le circuit marcher, pas de faire sa meilleure vidéo.

## Fin du parcours

Quand la première vidéo est livrée, dis ce qu’il a maintenant (ses réglages enregistrés, où sont ses vidéos) et comment
faire la suivante en une phrase : « La prochaine fois, dis juste /full-visual et ton sujet, ou /mon-script pour
l’écrire ensemble. »
