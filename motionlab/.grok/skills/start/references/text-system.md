# Le système de texte, mis par écrit

## Objectif

N’importe qui peut écrire la prochaine ligne pour ce compte sans poser de question au client et sans regarder un autre compte. Les mots à l’écran se lisent sur les propres posts du client, donc une nouvelle ligne tombe sur les mêmes lignes, à la même longueur, dans la même casse, au même endroit, et seuls les mots sont nouveaux.

## Raisonnement

Les mots à l’écran sont la seule chose sur laquelle un client accepterait volontiers qu’on l’interroge, et la seule qui ne doit jamais être demandée : quarante d’entre eux sont déjà dans les posts, chacun avec la portée qu’il a obtenue. Mais personne n’écrit une ligne à partir de `chars_per_row.p90 = 29`. Une mesure n’est pas un modèle. `scripts/textsystem.mjs` écrit `context/text-system.json` parce que les vérifications ont besoin de chiffres auxquels se comparer, et ce fichier est ce que l’agent en a compris : les mêmes faits, sous la forme à partir de laquelle une ligne s’écrit vraiment. Les scripts lisent le JSON. Celui qui écrit lit ce fichier. Les deux existent, et aucun ne remplace l’autre.

C’est un fichier à part, pas une section de `context/formats.md`, parce qu’il est lu à un autre moment, pour un autre travail. `formats.md` est lu pour décider quoi faire. Celui-ci est lu la seconde avant d’écrire une ligne, dans chaque format que possède le client, et c’est le fichier qui doit être juste quand le compte change de langue.

## Déroulé

`context/text-system.md`. Un court en-tête qui dit quand il a été lu, sur combien de posts, et par format combien ont été lus ligne par ligne. Puis une section par format, le meilleur format en premier, et chaque section dans cet ordre.

1. **Ce qu’est la ligne.** Une ou deux phrases : ce qu’elle fait dans le post, où elle se place, ce qu’elle porte, ce que le lecteur est censé en faire. Pas la typographie, que l’image a mesurée ; à quoi sert la ligne.
2. **Le budget.** Lignes, caractères par ligne à la médiane et au 90e centile, caractères au total, la casse, la ponctuation que le format utilise et celle qu’il n’utilise jamais. Chaque chiffre vient de la lecture, aucun inventé, aucun arrondi jusqu’au flou.
3. **Les formes, classées selon leur portée.** Les grands modèles dans lesquels ce compte écrit, chacun avec le nombre de lignes qui le portent et la portée médiane de ces lignes. Le classement est la valeur : une forme qui a touché deux fois plus de monde qu’une autre est une décision, une liste de formes est une anecdote.
4. **Les lignes qui ont marché**, en entier, avec leur portée et leurs lignes comptées. Puis deux ou trois lignes écrites selon le système, avec la longueur de leurs lignes entre crochets, pour prouver que le modèle s’écrit et ne fait pas que se décrire.
5. **Contre-exemples**, tirés de la même lecture : la longueur de ligne qui a fait un retour et poussé la prise vers le bas, la casse que ce format n’utilise jamais, la ligne sans nom ni chiffre et ce qu’elle a coûté en portée.
6. **Ce qui est fixe et ce qui est libre.** Une phrase, pour qu’un client qui veut du neuf sache quelle moitié peut bouger.

Reconstruit dès que la lecture l’est. Quand la langue du compte change, ce fichier change et chaque format suit, parce qu’aucun format n’en garde sa propre copie. Écris ce fichier dans la langue du client (le français par défaut) ; les lignes citées restent telles qu’elles sont dans les posts.

## Exemples

« Deux lignes, 24 caractères par ligne, jamais au-delà de 34, le 90e centile à 29. » Une phrase contre laquelle on peut écrire une ligne.

« Un chiffre sur un chiffre a touché une médiane de 16 400 sur cinq lignes ; une affirmation simple a touché 10 700 sur seize. » La forme est maintenant un choix avec un prix.

« Écrit selon le système : "Baidu vient d’offrir l’OCR / que chaque startup payait cher" [26+30]. » Le modèle prouvé sur une ligne qui n’existait pas avant.

## Contre-exemples

Écrire le fichier à partir du JSON sans lire les lignes, si bien qu’il dit ce qui a été mesuré et rien de ce que fait le compte. Garder le système de texte comme une section de `formats.md`, où on le lit en choisissant un format et pas en écrivant une ligne. Supprimer `context/text-system.json` parce que ce fichier existe : la vérification du budget de texte se compare au JSON, et une vérification qui ne peut pas tourner est un échec. Des chiffres qui ne viennent pas de la lecture. Une liste de formes sans portée à côté. Des exemples inventés au lieu d’être tirés des posts. Des conseils sur ce qu’est une bonne accroche en général : ce fichier parle de ce compte.
