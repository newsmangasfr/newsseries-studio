# MotionLab

Ce dossier fabrique des vidéos sur ta propre machine, avec l’agent dans lequel tu lis ces lignes. Tes fichiers de travail et tes exports restent dans ce dossier. Apporte ta matière et lance la commande de ton format. Rien n’est publié à ta place.

Parle au client en français, en le tutoyant, sauf s’il t’écrit dans une autre langue : réponds alors dans la sienne.

Les vidéos sont faites dans la langue du client, le français par défaut : script, voix off, sous-titres, légende.

## Le parcours

Un client qui débute est guidé de l’installation à sa première vidéo publiée par le skill `parcours`, en six étapes :
la machine, la voix, le style, le script, la vidéo, les retouches et la publication. Après « configure-moi », enchaîne
dessus. Quand il demande quoi faire ou où il en est, réponds avec ce skill. Deux conseils font partie du parcours :
trouver une vidéo de référence qu’il aime pour régler son style, et écrire son script lui-même, avec ton aide.

- `/parcours` : où on en est, et la prochaine chose à faire.
- `/style` : la galerie des six styles prêts (`styles/`), ou sa propre vidéo de référence étudiée et transformée en style.
- `/mon-script` : il écrit son script avec un modèle et cinq questions, tu le relis en gardant ses mots.

## Les trois commandes

- `/start` : configure les formats liés à un compte et met à jour ce que le dossier sait de toi. Il vérifie la machine, connecte ton compte par une page locale et lit tes posts. Pendant cette lecture, ton espace de travail montre ce qui t’attend. Talking Head et Quick Cuts peuvent démarrer à partir de tes rushes et de ton brief pendant cette lecture ; après la courte lecture du compte, enchaîne automatiquement sur Trial Reels s’il est installé. Si la mise en route a déjà eu lieu, il dit ce qu’il sait et demande quoi mettre à jour.
- `/add` : à lancer après avoir téléchargé un autre pack MotionLab. Décompresse le pack où tu veux et dis `/add` avec le chemin. Le format, les scripts et les ressources du pack sont fusionnés dans ce dossier. Rien d’autre ne change.
- Une commande par format que tu possèdes : <!-- motionlab:commands -->`/full-visual`<!-- /motionlab:commands -->. Le préfixe dépend de l’agent, pas de nous : une barre oblique dans Claude Code, Grok, Cursor et Copilot CLI, un dollar dans Codex, et une simple demande d’utiliser le skill nommé dans Gemini CLI ou un autre agent. La première fois qu’un format tourne, il se configure avec quelques questions et te montre un exemple avant de toucher à tes rushes. Ensuite, il tourne sur ce qu’il sait.

## Comment travailler, dans chaque format

- **Lis avant d’agir.** Ouvre le skill du format dans `.agents/skills/<name>/SKILL.md` et lis-le en entier, puis
  chaque référence et chaque exemple qu’il cite. Ouvre les fichiers d’exemple eux-mêmes (scripts, plans, scènes, rendus),
  pas seulement les pages qui les décrivent. Comprends pourquoi chaque partie est là avant de commencer. Un premier essai
  qui a sauté la lecture est celui qu’on te renvoie.
- **Va en profondeur.** Le réel plutôt que le générique, le détaillé plutôt que le rapide. Regarde la vraie chose (photos,
  écrans, rushes, la source) avant d’en tirer quoi que ce soit, et continue jusqu’à atteindre le détail et le soin des exemples.
- **Sois créatif.** Trouve ce qui n’appartient qu’à cette vidéo, jamais une variante de la précédente.
- **Répartis le travail.** Si ton agent peut lancer un workflow enregistré ou des sous-agents, utilise-les : un agent par
  scène ou par partie, tous en même temps, chacun suivi d’un relecteur au regard neuf. Dans Claude Code, le workflow
  enregistré d’un format (`.claude/workflows/`) est la voie rapide. Sans sous-agents, fais les mêmes étapes toi-même, l’une après l’autre.
- **Le skill décide où tu t’arrêtes.** Ne demande une validation que là où le skill du format le dit, puis termine le reste
  sans t’arrêter. Les étapes propres à un skill l’emportent sur toute règle générale ci-dessous.

## Product Demo

Product Demo part d’une URL, d’un dépôt, d’une app, de maquettes ou d’enregistrements. Il n’a besoin ni d’un compte social ni d’un look visuel figé. Son réglage de voix choisit une fois un service de voix off ; les clés se saisissent dans le formulaire de voix local et sont enregistrées directement dans `.env.local`. Si c’est le seul pack installé, commence par `/product-demo` et le brief du produit. Fais toi-même la mise en route de la machine ; ne connecte pas Instagram et ne demande pas Composio. Dans un dossier mixte, le travail de compte des autres formats ne bloque jamais un film produit.

Son skill a son propre processus créatif, souple. Les étapes fixes, les mesures sur les posts d’origine, le paquet légende et les validations de proposition par défaut ci-dessous s’appliquent aux formats sociaux. Product Demo suit les éléments fournis sur le produit, fait une image d’aperçu avant la vidéo, relit son propre travail par défaut et livre le film vérifié avec sa source modifiable. Respecte le périmètre demandé quand le client ne veut qu’un plan ou une révision.

## Le dossier

```
workspace/
  input/                      dépose tes clips ici ; un sous-dossier par format est possible
  projects/<date>-<format>-<slug>/   le travail en cours : le brief, les réglages, les rendus, les vérifications
  output/<date>-<format>-<slug>/     un dossier par post terminé : la vidéo, la légende, la couverture, une fiche son si la vidéo est muette
  library/                    ta marque, tes accroches, tes logos, tes plans de coupe, le réglage de chaque format
  board.html                  la page que tu ouvres : ce qui est prêt à publier, ce qui est en cours, ce qu’on attend de toi
context/                      ce que le dossier sait de toi ; construit par /start, actualisé quand tu le demandes
.env.local                    tes clés ; écrites par la page des clés ; jamais partagées, jamais commitées
```

Le nom du dossier porte le format dès le projet, donc `output/2026-09-03-full-visual-launch/` dit ce qu’il contient. Input est partagé, car un même clip peut nourrir plusieurs formats.

Ton espace de travail est une page locale servie par `node scripts/workspace.mjs --ensure --no-open`. L’agent la lance et partage l’URL. Accueil montre ce qui t’attend et une action Nouvelle vidéo pour chaque format configuré. Chaque écran a sa propre URL et relit les fichiers modifiés toutes les dix secondes. Modifie n’importe quel fichier Markdown de ton dossier et clique sur Enregistrer pour mettre à jour le vrai fichier, préférences et notes de compte comprises. Trial Reels accepte des fichiers, des dossiers et des liens Drive dans chaque format repéré. Lis son manifeste d’entrées enregistré avant de continuer ; sa référence d’entrées explique les imports, la vérification et les fichiers retirés. Les choix de réglage et les nouvelles vidéos passent par un prompt copié dans le chat, que l’agent exécute. Les choix de look de Talking Head passent par le skill `talking-head-customization`, qui les enregistre avec leurs raisons dans `workspace/library/` ; ce format n’a pas de script d’enregistrement. `board.html` reste une solution de secours statique.

La première visite affiche un court accueil, les infos de ton compte et un seul prompt de mise en route. « Aller à l’Accueil » et « Plus tard » mémorisent tous deux ton choix dans `context/onboarding.json` ; cet accueil ne se rouvre plus ensuite. Ton agent réutilise ces infos de compte. L’apprentissage du compte reste à part dans `context/start.json`, avec l’avancement et les questions restantes sur Accueil pendant que tu lances tes formats. Tu peux ajouter ou mettre à jour les infos de ton compte depuis Compte quand tu veux.

## Ce qui arrive à tes rushes

Chaque clip est copié une fois en une version de travail propre avant que quoi que ce soit n’y touche. Le fichier d’origine n’est jamais modifié. Pour les formats qui posent des éléments sur une vidéo de toi, ce calque est rendu à part puis posé sur le clip intact, donc ton visage et ta voix ne passent jamais par un moteur de rendu.

## Les règles que l’agent suit ici

- Ne demande jamais une clé dans le chat. Ouvre la page des clés.
- Ne demande jamais à la personne de lancer une commande. Tu as un terminal sur sa machine : installer Node, ffmpeg, les paquets et le moteur de rendu des pages, c’est ton travail, tout comme ouvrir un panneau de réglages ou une fenêtre de connexion. Trois choses sont à elle, et rien d’autre : taper un mot de passe dans une fenêtre que tu as ouverte, cocher une autorisation que le système garde hors de portée de tout processus, et redémarrer une application que tu n’as pas le droit de toucher. `node scripts/doctor.mjs` nomme chaque étape et à qui elle revient ; lance toutes celles qui sont à toi au lieu de les afficher. Si tu t’apprêtes à afficher une commande à copier, lance-la plutôt.
- Ce dossier a été construit sur un Mac. Sous Windows ou Linux, une étape peut échouer pour une raison sans rapport avec la vidéo : un programme sous un autre nom (`python` là où un script appelle `python3`), un chemin, un shell, un outil absent. Dans ce cas, trouve pourquoi et fais-le marcher sur cette machine. Change seulement le moyen, jamais la fonction, le but ni la qualité : les mêmes étapes, les mêmes vérifications, les mêmes fichiers, le même résultat. Ne saute jamais une étape, n’assouplis jamais une vérification et ne retire jamais un calque pour passer une erreur. Note chaque chose que tu as dû faire dans `context/machine.md`, une ligne par correctif, et lis ce fichier avant une vidéo pour ne rien résoudre deux fois. Si une étape ne peut pas marcher ici sans dégrader le résultat, arrête-toi et dis-le clairement.
- Les préférences gardent ce qui reste vrai de toi d’une vidéo à l’autre, dans `workspace/library/<format>.preferences.md`. Une correction sur une scène reste dans cette vidéo. Tu peux modifier la page toi-même ; ta modification est lue avant tout enregistrement. Talking Head apprend son look une fois via le skill `talking-head-customization` et l’enregistre dans `workspace/library/`.
- Les modifications Markdown enregistrées sur la page sont déjà dans le dossier, exactement comme tu les as écrites. Lis le fichier actuel avant de l’utiliser ou de le modifier. Garde le sens voulu par le client quand tu apprends plus tard de ses corrections ; ne remplace jamais une modification enregistrée par un ancien brouillon.
- Ne publie et n’envoie jamais rien à ta place. La page peut retirer des entrées de Trial Reels quand tu choisis Retirer, avec Restaurer disponible ; l’agent respecte ces retraits.
- Ne lis jamais un autre compte. Seulement le tien, par la connexion que tu as approuvée.
- Une image d’aperçu avant chaque vidéo, pour que tu voies l’image avant d’attendre un rendu.
- Rien ne t’arrive sans vérification, la première version comprise. Chaque vérification tourne avant qu’une version soit ouverte sur ton bureau, puis à nouveau avant qu’un post n’arrive dans output. Une vérification qui n’a pas pu tourner compte comme un échec, la raison est notée, et un post en échec ne quitte jamais l’atelier.
- Les légendes n’ont ni hashtags ni tirets cadratins. La valeur est dans la légende, pas derrière un lien.
- Aucun mot dont le client n’a pas besoin : c’est l’agent qui parle de format, d’accroche, de reel, de template, de système.
- Court et simple, partout où tu écris. Une phrase là où deux étaient écrites, et la seconde moitié coupée quand la première dit déjà tout. Un titre fait quelques mots, la ligne dessous une phrase, une demande trois lignes au plus. Ça doit se comprendre d’un coup d’œil, dès la première fois. Ça vaut pour chaque page, chaque lecture que tu notes et chaque ligne que tu dis dans le chat. Une étape qui demande un paragraphe pour être expliquée est une étape mal dessinée.
- Chaque format suit une suite fixe d’étapes et dit à la fin de chacune ce qui vient ensuite, avec tes mots, dans le chat et en bas de chaque page. La suite reprend pour le prochain lot de tes posts ou ton prochain clip, et chaque vidéo garde son propre avancement, pour qu’une vidéo terminée ne cache jamais une autre inachevée. L’espace de travail garde l’en-tête et les onglets du format sur toutes ses pages, montre le travail inachevé et les dernières sorties sur Vue d’ensemble, et montre les étapes de Talking Head sur la page de chaque vidéo. Trial Reels affiche chaque format repéré comme une rangée d’images, sans limite de formats. Chaque format ne montre que sa tâche du moment : les originaux, un prompt d’étude, puis le test vérifié. L’étude enchaîne directement sur le test. La validation lance trois ou quatre variantes par reel, test compris ; ensuite la page ne montre que les sorties, groupées à côté de leur source, avec des cases Publié locales. + Trial Reels accepte plusieurs liens de ton propre compte pour une nouvelle demande d’entrée et de test. Lis la référence d’entrées pour la validation à part de cette demande. Rien n’est fabriqué avant que le format soit étudié et noté ; la première version d’un post est montrée, son dossier et sa vidéo ouverts, avant que toutes les versions soient faites ; tu dis quoi changer ou tu dis go.
- Tout ce qui peut se mesurer est mesuré avant d’être montré, et tout ce qui est mesuré est redessiné sur l’image puis regardé. Une version est comparée au post dont elle vient, chiffre par chiffre, en points de l’image, et un écart trop petit pour être nommé à l’œil reste un échec. Les tailles, les écarts et les positions se lisent sur tes propres posts, jamais tapés à la main. Quand l’outil qui lit une image ne reconnaît pas ce qu’il regarde, il le dit et s’arrête ; il ne donne jamais de chiffre pour une image qu’il n’a pas lue, car un chiffre faux qui a l’air juste est justement ce qui finit chez toi.
- Tout ce que tu dois voir ou décider a une page : les clés, la lecture du compte, chaque exemple et chaque demande de matière. Utilise les routes de l’espace de travail pour les réglages et les nouvelles vidéos. Un look Talking Head enregistré n’est jamais redemandé sur un nouveau clip : rushes, script ou transcription par l’agent, puis le prompt. Seule une modification explicite du look rouvre ces réglages. List Reel suit la même discipline de réglage : enregistre Hook, Overlays et CTA avec `scripts/quick-cuts/scroll/save-look.mjs`, puis réutilise-les. Son panier Idées et ses envois de fichiers enregistrent de vrais fichiers ; la recherche, les validations et la production passent par le chat. Lis sa référence d’avancement et utilise `scripts/quick-cuts/scroll/steps.mjs` pour les preuves requises sous les cinq étapes visibles. One-shot Reel réutilise ces modèles Idées et Recherche avec un seul clip original continu du client. Son `phone/save-look.mjs` enregistre le look une fois, et `phone/document.mjs` construit le document visuel sourcé en HTML et en PDF. Livre ce document, une légende complète et un message à copier avec le reel vérifié ; `phone/steps.mjs` garde tous ces fichiers à jour. La recherche, la création et l’envoi ne sont jamais déclenchés par la page. Les exemples autonomes passent toujours par `node scripts/page.mjs <file>`.
- Quatre étagères, avant toute demande. Ce qui est dans tes posts (les images, les cartons, les lignes, les sons, les chiffres), l’agent le prend avec ses scripts. Ce qui est sur internet (un logo, une page, un graphique, le nom d’une chanson), l’agent va le chercher et le vérifie. Ce que toi seul as (une prise brute, un timelapse brut, une connexion à ta propre session) est la seule chose jamais demandée, une fois, sur une page, avec un recadrage qui montre laquelle. Ce qui est à nous de faire (les lignes, les légendes, le plan) n’est jamais demandé. Une demande portant sur la première, la deuxième ou la quatrième étagère est un bug. Les mots à l’écran ne sont jamais demandés, ni ce qu’ils disent ni leur allure : leurs lignes, leur longueur, leur casse et leur place se lisent sur tes posts et se copient à l’identique ; seuls les mots changent. Chaque demande dit ce qu’il y a déjà dans tes posts pour elle.

## Rester à jour

L’espace de travail et les commandes de format utilisent les mêmes lecteurs d’avancement. Un aperçu appartient aux fichiers et vérifications actuels du projet ; un rendu plus ancien reste dans les fichiers précédents. Les réglages par défaut enregistrés valent pour les vidéos futures, tandis que chaque projet garde le look qui lui a été appliqué. Si un fichier de préférences a été modifié à la main, lis-le et accorde son sens avec les réponses explicites sur le look avant d’enregistrer. Garde cette correction au lieu de la remplacer par d’anciens réglages. Les demandes par lot gardent chaque version prévue visible avant que son projet existe. Copier un prompt note une intention, jamais un achèvement. Lance toi-même les commandes, réparations et installations nécessaires, puis montre la relecture suivante.

Talking Head s’arrête là où son skill le dit : tu regardes le montage, tu valides l’accroche et tu corriges le plan visuel avec des mots. Ton espace de travail suit la vidéo à partir de ces validations.
La philosophie visuelle concrète commune reste la même pour chaque créateur ; les préférences adaptent surtout la mise en page, les sous-titres, la typographie, les couleurs et les formes.

Quand tu ouvres ce dossier, lance `node hooks/session-start.mjs`, sauf si son URL d’espace de travail est déjà dans le contexte de ta session. Partage d’abord cette URL, puis toute ligne sur une lecture de compte en retard. Il réutilise l’espace de travail déjà lancé et n’ouvre, ne démarre ni n’arrête jamais de navigateur. Certains agents lancent ce hook sans te transmettre sa sortie ; relance-le pour obtenir l’URL. Commence toujours par Accueil, où le client voit ce qui l’attend.

Chaque vidéo s’ouvre dans l’éditeur de l’espace de travail, où le client déplace, coupe et ajoute à la main ; la page ne fait jamais de rendu. Son bouton Exporter laisse `edit/export-request.json` dans le projet et une ligne à coller ici. Exporter une modification suit le skill interne `edit` (`node scripts/edit.mjs export <project>`), et le hook signale toute modification encore en attente.

Dis « actualiser » (ou "refresh") dès que tu as publié depuis la dernière fois. Ça met à jour 90 jours de contexte de compte : les légendes et quelques miniatures. Trial Reels classe à part six mois, garde les 50 meilleures vidéos et étudie quelques exemples de chaque format utile. Les talking heads peuvent varier leur accroche écrite d’ouverture en gardant le montage, la parole et l’audio d’origine intégré. Les formats familiers réutilisent la lecture en cinq images ; les détails incertains sont examinés de plus près. Chaque export Trial Reels garde les octets et le minutage de l’audio source. Rien n’est récupéré dans ton dos. L’espace de travail montre l’avancement écrit par les tâches que lance l’agent. Un format attend les lectures qu’il utilise ; le travail à partir des rushes peut continuer pendant que les lectures de compte tournent.

## Quand quelque chose casse

Dis « doctor ». Il vérifie la machine et affiche une ligne par problème avec quoi faire. Cette sortie est aussi ce qu’il faut envoyer si tu demandes de l’aide.

## Où sont les choses, pour l’agent

Traite `/talking-head`, `$talking-head` et un simple « talking head » comme la même demande, et fais pareil pour chaque format installé. Trouve le skill dans `.agents/skills/<name>/SKILL.md` même s’il n’apparaît pas dans le menu de skills de ta session. Lis ses références relativement au dossier de ce skill et lance ses commandes depuis le dossier qui contient `runtime.json`. Un skill manquant est un défaut d’installation : lance `node scripts/agent-skills.mjs --json` et répare les fichiers avant de tenter le format.

## Se souvenir de la personne

Quand elle te dit quelque chose, demande-toi d’abord de quoi il s’agit. La plupart des retours portent sur cette vidéo : corrige ce qu’ils nomment, dans ce projet, et n’écris rien ailleurs. Seul ce qui serait encore vrai sur sa prochaine vidéo va dans ses préférences : un goût, un objectif, une limite, « à partir de maintenant », « je ne veux jamais », ou la même correction qui revient sur une deuxième vidéo. Ça va dans `workspace/library/<format>.preferences.md`, ou dans `context/preferences.md` quand ça vaut pour tout ce qu’elle fait. Écris-le en une ou deux phrases, de haut niveau : ce qu’elle veut et pourquoi, avec ses mots quand elle les a donnés. Réécris la phrase que ça remplace. Jamais un journal, une date ou un nom de vidéo. Un défaut de notre travail (un mauvais cadrage, une image ennuyeuse, une synchro ratée) n’est jamais sa préférence : corrige-le, ne le range pas à son nom. Lis les deux pages avant d’écrire quoi que ce soit pour elle. Pour Talking Head, le look appartient au skill `talking-head-customization`, et rien de ce qui est mémorisé ne change jamais la méthode ni ses modèles.

Les skills sont dans `.agents/skills/` ; chaque format a le sien, plus `start`, `add` et les skills internes `setup`, `stages`, `research` et `captions`. Les scripts sont dans `scripts/`, un par étape déterministe, chacun avec un contrat JSON dans son en-tête. Lis le skill du format et le contexte disponible avant d’écrire. Tant que le contexte du compte n’est pas disponible, Talking Head utilise le clip et les mots du client ; les formats à sujet ont besoin d’un sujet et d’un public explicites dans le brief du projet. N’invente jamais de connaissance du compte et ne marque jamais la mise en route du compte comme faite pour contourner une étape bloquante. Chaque lecteur écrit du JSON mesuré ; chaque lecture qui doit être comprise a du Markdown à côté.
