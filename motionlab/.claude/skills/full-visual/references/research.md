# Recherche

N’importe quel sujet marche : la chose que le créateur nomme, comme il la dit. La recherche est là pour rendre le
script vrai et profond, pas pour choisir le sujet à sa place. Quand le créateur te demande de choisir, propose trois
sujets avec une ligne chacun et laisse-le choisir.

## Ce qu’il faut trouver

- **Comment ça marche vraiment**, au niveau d’un expert : le mécanisme, étape par étape, avec ses vrais termes et
  ses vrais nombres. Va aux sources primaires : l’article scientifique, le brevet, les mots de l’ingénieur lui-même,
  la documentation du fabricant, le démontage, le dépôt de code, le régulateur. Un article de seconde main est une
  piste, pas une source.
- **L’idée fausse du spectateur**, en cinq mots (« l’écran sent que j’appuie », « les touches font la taille que je
  vois »). Le script est construit pour la casser.
- **Le moment que le spectateur a vécu** : l’endroit où le mécanisme touche sa journée (les gants en hiver, un écran
  mouillé, une faute de frappe qui s’est corrigée toute seule).
- **La deuxième couche** : le cas où ça échoue, ou l’astuce par-dessus, qui prouve le mécanisme.
- **Quelque chose à enregistrer ou à envoyer** : une vérification à faire soi-même, un réglage, un outil, une
  solution, ou une compréhension assez profonde pour l’expliquer à un ami.
- **Le vrai matériel pour les images** : photos produit, démontages, coupes, la vraie interface, de vraies images
  vidéo. Note les liens ; le plan les récupère.

Les sources peuvent être dans n’importe quelle langue ; le script s’écrit dans la langue de la vidéo (`"language"`,
`"fr"` par défaut).

## facts.md

Chaque affirmation que fera le script, une ligne chacune, vérifiée aujourd’hui :

```
| affirmation | preuve (une citation mot pour mot) | URL |
```

Garde les mots qui bornent la portée (« jusqu’à », « dans une étude », « sur les iPhone compatibles »). Quand quelque
chose ne peut pas être confirmé, dis-le et laisse-le hors du script. N’invente jamais un nombre, un outil ou une
capacité. Année par défaut : l’année en cours.

Dans un projet de l’espace de travail, enregistre les résultats dans `research.md` et le tableau dans `facts.md`, dans
le dossier du projet.
