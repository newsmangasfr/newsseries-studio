# Accès au compte

## Pourquoi

Le client approuve l’accès à son propre compte via Composio. La clé API de son projet va dans la page des clés locale, jamais dans le chat. L’accès au compte enrichit le contexte pendant que le client lance ses formats ; une clé manquante ou une validation en attente ne verrouille jamais Accueil.

## Réutiliser ce qui existe

Lis les vérifications de clé et de connexion de doctor avant de demander quoi que ce soit. Avec une clé et une connexion qui marchent, continue sans bruit. Si doctor signale une clé ailleurs sur la machine, dis au client où il a trouvé le réglage et ouvre la page des clés locale. Ne lis pas le secret à voix haute et ne le fais pas passer par le chat.

## La page des clés

L’agent lance `node scripts/keys/server.mjs`. La personne ouvre le tableau de bord Composio, choisit son espace de travail et son projet, ouvre **API Keys**, crée une clé de projet et la colle sur la page locale. La page enregistre `.env.local`. La commande revient à l’agent ; copier son secret dans le champ privé revient à la personne.

L’adresse du tableau de bord suit `https://dashboard.composio.dev/<workspace>/<project>/api-keys`. Les deux noms varient d’un client à l’autre. Mets un lien vers `https://dashboard.composio.dev` quand l’URL du projet actuel est inconnue ; ne code pas en dur l’espace de travail d’un autre client et n’ajoute pas deux champs de mise en route juste pour construire une URL. API Keys se trouve dans la barre latérale du projet, et aussi dans les réglages du projet. Utilise la clé de projet, pas la clé de connexion consommateur séparée.

Source : [navigation du tableau de bord Composio](https://docs.composio.dev/kb/guide/dashboard-navigation-overview).

## Connecter et identifier

Réutilise le pseudo Instagram ou le lien de profil déjà fourni. Passe-le à `node scripts/profile.mjs --handle <handle-or-link>`. Le lecteur vérifie le compte authentifié avant d’enregistrer les posts. Quand plusieurs connexions Composio existent, les champs de profil complémentaires et les requêtes de médias doivent utiliser le même compte vérifié.

Le script ouvre tout lien de validation nécessaire. La personne s’y connecte et valide quand elle est prête. Une nouvelle tentative fait partie de la tâche du compte ; Accueil et les formats restent accessibles. Instagram demande aujourd’hui un compte Professionnel ou Créateur. N’explique cette exigence que lorsqu’elle s’applique et laisse la personne décider de changer de type de compte. Ne promets pas qu’un changement n’a aucune conséquence visible.

Le nom, le pseudo, la bio, le lien, les abonnés et la photo du créateur viennent du compte connecté. La photo est téléchargée une fois par actualisation du profil et servie depuis le dossier local. Une photo manquante utilise l’image déjà en cache ou les initiales. Ne demande jamais d’envoyer un avatar quand le compte connecté peut le fournir.

## Exemples

Un client fournit `https://www.instagram.com/yourname/` : affiche `@yourname` dans l’espace de travail et réutilise le lien pour le lecteur. Le client lance un format pendant que l’accès au compte est en attente ; le valider plus tard reprend la tâche du compte. Un client déjà connecté voit sa photo enregistrée tout de suite, puis les données actualisées au fur et à mesure que le lecteur les écrit.

## Contre-exemples

Envoyer chaque client vers l’URL API Keys d’une seule personne. Demander une clé dans le chat. Demander au client de lancer des commandes. Attendre l’analyse du compte avant de montrer Accueil. Importer la première connexion Instagram qui se présente. Présenter une validation échouée comme un compte sans posts.
