# MotionLab

Des vidéos animées prêtes à poster, faites sur ta machine par l’agent que tu utilises déjà (Claude Code, Codex,
Cursor, Grok ou Gemini CLI). En français par défaut.

La vidéo tuto (10 min) est sur ta page de téléchargement Whop, juste au-dessus du zip : regarde-la en premier. Le guide complet, avec tous les détails : **GUIDE.pdf**.

## Démarrer (une seule fois)

1. Décompresse ce dossier où tu veux.
2. Ouvre-le dans ton agent.
3. Écris : **configure-moi**

C’est tout. L’agent installe ce qu’il faut, puis te guide pas à pas jusqu’à ta première vidéo :

| Étape | Ce qui se passe |
|---|---|
| 1. La machine | L’agent installe tout. Tu n’as rien à taper. |
| 2. La voix | Tu choisis une voix (ElevenLabs conseillé) ou tu enregistres la tienne. |
| 3. Le style | Tu choisis un des six styles du dossier `styles/`, ou tu montres une vidéo que tu adores. |
| 4. Le script | Tu l’écris, l’agent t’aide à le rendre clair et accrocheur. |
| 5. La vidéo | L’agent fait tout, avec cinq débuts différents à tester. |
| 6. Publier | Tu regardes, tu demandes des retouches avec tes mots, tu publies. |

Perdu à un moment ? Écris **/parcours** : l’agent te dit où tu en es et quoi faire.

## Deux conseils qui changent tout

- **Trouve une vidéo de référence.** Une vidéo dont tu adores le look : dépose-la dans `workspace/input/references/`
  et dis « copie ce style ». L’agent l’étudie et règle tes vidéos dessus. Sinon, ouvre `styles/galerie.html` et
  choisis un style prêt.
- **Écris ton script toi-même.** Ce sont tes idées et ta façon de parler qui font qu’on te suit. Écris
  **/mon-script** : un modèle à remplir, cinq questions, puis l’agent relit en gardant tes mots.

## Les commandes

| Tu écris | Ça fait |
|---|---|
| configure-moi | La mise en route, puis le parcours guidé |
| /parcours | Où tu en es et la prochaine étape |
| /style | Les styles prêts, ou ta vidéo de référence transformée en style |
| /mon-script | Écrire ton script avec l’aide de l’agent |
| <!-- motionlab:commands -->`/full-visual`<!-- /motionlab:commands --> + ton sujet | Une vidéo complète |
| doctor | Vérifie et répare la machine |

Dans Codex, remplace la barre `/` par `$`. Dans Gemini CLI, demande simplement « utilise le skill style ».

## Les effets

Neuf effets prêts (un compteur qui roule, un texte qui se décode, un mot qui part en poussière…) : regarde
`effets/apercu.mp4`. L’agent les pose quand ils servent une phrase, et tu peux en demander un avec tes mots.

## Les bruitages

58 bruitages prêts dans `sfx/` (whoosh, clics, compteurs, caisse, scintillements…), libres d’usage dans toutes tes
vidéos. Écoute `sfx/_preview.mp3`. Quand l’agent te demande « avec son ou sans ? », dis « avec son, utilise le pack
sfx ». Ils sont aussi dans l’éditeur.

## Où sont tes vidéos

Dans `workspace/output/`, un dossier par vidéo : les cinq versions, la légende et l’image de couverture. Publie
depuis ton téléphone.

## Si quelque chose ne va pas

Écris **doctor**. L’agent vérifie la machine et répare ce qu’il peut.

## Ce qui n’arrive jamais

Rien n’est publié à ta place. Aucun autre compte n’est lu. Tes fichiers d’origine ne sont jamais modifiés. Tes clés
restent dans `.env.local`, sur ta machine.
