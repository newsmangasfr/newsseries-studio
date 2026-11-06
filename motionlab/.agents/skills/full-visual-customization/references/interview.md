# L’entretien sur les préférences

Le but est une description utile du créateur, pas un formulaire rempli. Réutilise ce qu’il a déjà répondu dans le
contexte partagé du dossier. Propose deux ou trois directions concrètes à la fois et nomme toujours le réglage maison.
Ne pose une question de suivi que si la réponse change une décision. Reste à haut niveau : ce dont il a besoin, ce
qu’il veut, et s’il a une référence.

## 1. Public, objectif et références

Réutilise `audience.for` et `audience.need` de `context/answers.json`. Demande seulement ce qui manque : à qui
s’adressent les vidéos, et ce qu’un spectateur doit comprendre, ressentir ou faire après en avoir vu une.

Puis de quoi il parle : sa ligne éditoriale (le domaine qu’un spectateur nommerait) et sa position (le camp qu’il
prend, par exemple « les outils d’IA valent le coup d’être appris, voici leur vrai coût »). Si Instagram est connecté,
lis d’abord ses propres posts récents et propose à partir de ce qu’il fait déjà. Sinon, dis « tu peux le connecter avec
/start » et continue.

Demande : « Il y a un créateur ou une vidéo que tu aimerais copier ou dont tu aimerais t’inspirer ? » Demande **ce
qui** lui plaît dedans : les sous-titres, les couleurs, la voix, le rythme des mots, les sujets.

Pour une vidéo de référence (un lien ou un fichier) : regarde-la image par image et écoute-la. Décris en mots ses
sous-titres (allure de la police, taille, couleurs, apparition des mots, traitement du mot-clé), son fond (couleur,
texture, clair ou sombre) et sa voix (genre, rythme, énergie, accent, langue). Puis classe-la en trois listes et
dis-les simplement :

- Faisable tout de suite : les champs de thème de la carte des réglages, avec des valeurs proposées.
- Demande un changement du moteur : par exemple un marqueur souligné, une police non chargée, des sous-titres qui
  s’écrivent lettre par lettre. Dis ce que ça coûte.
- La méthode, qui reste la nôtre : ce que sont les images et comment elles bougent. Une référence apprend une
  propriété ; elle ne remplace pas le format.

Exemple : « Un fond bleu marine foncé, une police grasse et arrondie, les mots-clés en jaune dans un cadre doux, une
voix d’homme calme. » Faisable : `grounds.dark.bg` `#0E1626`, une police arrondie (demande `fonts.ts`, ou garder
Figtree, qui est proche), `marker.color` `#F5C542` avec `select`, une audition ElevenLabs de voix d’homme calmes. Les
images restent celles de Full Visual.

## 2. Look et comportement des sous-titres

Explique : les sous-titres affichent un mot par mot dit, le mot actif en gras et pleine encre, les mots déjà dits en
normal et gris, un mot-clé marqué par bloc. Cette grammaire reste. Son expression est la sienne.

| Choix | Réglage maison | Alternatives |
|---|---|---|
| Police | Figtree | Inter (déjà chargée) ; une autre police Google (un changement du moteur dans `fonts.ts`) |
| Taille | 74 px, deux lignes au plus | 66 à 82 ; plus grand veut dire plus de coupures entre blocs |
| Couleur du mot actif | blanc sur sombre, presque noir sur clair | toute couleur lisible sur les deux fonds |
| Gris des mots dits | `#6B6B6B` sur sombre, `#8E8E8E` sur clair | gris plus clair pour un contraste plus doux, plus foncé pour plus de contraste |
| Marqueur du mot-clé | cadre `select` bleu `#2E7AEA` avec poignées | `select` dans sa couleur d’accent ; `pill` (lavis doux dans la couleur de l’encre) ; `none` (gras seulement) |
| Emplacement | en haut (y 318), l’emplacement du bas utilisé par bloc quand le visuel a besoin du haut | petits déplacements dans la bande du haut seulement |
| Mouvement | `measured` (adouci, petite descente, cadre tracé en plusieurs temps) | `v1` (linéaire, la première version) |
| Avance | 80 ms avant la syllabe | 40 à 100 ms ; plus tôt paraît plus vif |
| Emoji avant les mots | utilisé quand un mot le mérite | aucun |

Montre le choix sur l’essai de look plutôt que de le décrire deux fois. Les vraies interfaces dessinées sous les
sous-titres gardent leurs propres polices et couleurs. En français, les mots sont un peu plus longs : à taille égale,
attends-toi à un peu plus de coupures.

## 3. Fond

| Choix | Réglage maison | Alternatives |
|---|---|---|
| Fond sombre | `#101010` | presque noir teinté (marine `#0E1626`, chaud `#14110F`) |
| Fond clair | `#FAFAFA` | papier `#F6F3EC`, froid `#F4F6F9` |
| Grille | activée, très discrète, 60 px | désactivée (alpha 0) ; un pas plus large |
| Sombre ou clair | chaque scène choisit selon son contenu | une tendance (« surtout sombre ») notée pour le plan |

Explique que la grille donne au mouvement quelque chose à étirer ; sans elle, les mouvements rapides paraissent un peu
plus durs. Les fonds doivent garder l’encre et le gris des sous-titres lisibles ; les images d’aperçu le vérifient.

## 4. Langue

Une seule question : « Tes vidéos sont en quelle langue ? Français par défaut. » Elle vaut pour le script, la voix off,
les sous-titres et la légende. Enregistre-la dans le champ `language` du profil, en code ISO (`fr`, `en`, `es`...).
S’il ne tranche pas, garde `fr`, le réglage maison, et dis-le dans la relecture.

## 5. Voix off

Explique la différence : ElevenLabs donne le minutage exact de chaque mot, donc la synchro est la plus serrée et la
recette maison (des balises audio qui suivent la phrase, des pauses coupées à 0,2 s, l’accroche jamais coupée)
marche. OpenAI et Fish marchent aussi ; leur prise est minutée par reconnaissance vocale. Sa propre voix enregistrée
marche de la même façon.

1. Fournisseur. Réglage maison : ElevenLabs, la voix de bibliothèque « Snap », `eleven_v3`, stabilité 0,5. S’il
   choisit un autre fournisseur, il ajoute la clé sur la page de la vidéo dans son espace de travail (l’étape Vidéo),
   ou la met dans `.env.local`. Jamais dans le chat.
2. Audition : deux à quatre voix qui lisent ses deux premières phrases (son script, ou les deux premières phrases de la
   vidéo d’exemple, réécrites dans sa langue), enregistrées dans des fichiers séparés. Il choisit à l’oreille. Note le
   choix et ce qui lui a plu.
3. Ton : vif et expressif par défaut ; plus calme, plus lent ou plus neutre sont des choix.

Ne laisse jamais entendre qu’une voix qu’il n’a pas écoutée est validée. Nommer une voix n’autorise pas à cloner une
personne.

## 6. Mots

| Choix | Réglage maison | Alternative |
|---|---|---|
| Script | il l’écrit lui-même avec `mon-script` (conseillé), ou la méthode maison (`full-visual-script`) : trois ou quatre accroches au choix, 120 à 280 mots selon la durée, chaque fait sourcé | son propre script, pris pour vrai et jamais réécrit |
| Demande finale | `commente « MOT »` et la chose exacte qu’il envoie | abonnement, enregistrement ou rien, lié à sa vraie offre |
| Légende | s’ouvre sur `Commente MOT et je t’envoie …` | sa propre ouverture, sa longueur, des hashtags ou non |

Son script, ce sont ses mots : note-le comme choix permanent, puis chaque vidéo prend le script qu’il donne.

## 7. Recherche par défaut

Tout sujet marche dans ce format (`.agents/skills/full-visual/references/research.md`). Demande de quoi il fait
d’habitude ses vidéos et sa position, ou prends « tout ce que j’apporte ». Demande si « choisis pour moi » est permis
quand il arrive sans sujet. Enregistre ses lignes éditoriales, sa position, les sujets qu’il ne veut jamais, et les
créateurs dont il veut apprendre.

## Une seule relecture

Montre : « Tes vidéos sont pour ... Les sous-titres sont en ... en ... avec des mots-clés ... Les scènes reposent sur
... avec la grille ... Tes vidéos sont en ... La voix est ... Les mots viennent de ... et finissent sur ... Les sujets
viennent de ... Les images et le mouvement restent ceux de Full Visual. Je ne te redemanderai que ... » Montre l’essai
de look et l’extrait d’audition choisi. Demande s’il faut l’enregistrer comme son réglage par défaut. Laisse-le
corriger avant de marquer le réglage terminé.

Chaque choix a besoin d’une raison courte qu’un autre monteur peut appliquer. Si le créateur n’a donné que le choix,
écris « interprétation éditoriale » à côté de la raison proposée ; ne prétends pas qu’il l’a dit. Un goût non tranché
peut rester ouvert sans bloquer les couleurs et polices réglées.
