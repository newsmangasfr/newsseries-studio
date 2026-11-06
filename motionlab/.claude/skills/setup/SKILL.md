---
name: setup
description: "Interne. La discipline de réglage que chaque format suit à sa première utilisation, appelée par les skills de format, pas par le client. À utiliser quand les réglages de bibliothèque d’un format manquent, ne sont pas faits ou sont en retard sur le setup_version du pack, ou quand le client demande le réglage d’un format ou veut changer son style, ses sons, ses plans ou son CTA. Aussi : 'format setup', 'change the style', 'change the sounds'."
---

# Setup

## Objectif

La direction d’abord. Le format apprend ses préférences une fois, à partir du contexte du client et de quelques questions, montre un exemple et enregistre les réponses pour que chaque passage suivant s’adapte sans demander.

## Raisonnement

La lecture du compte peut suggérer des valeurs par défaut ; le format a quand même des choix que lui seul peut faire : le style, les sons, les plans, le rythme, la forme du CTA. Les demander à chaque passage, c’est du bruit ; ne jamais les demander rend chaque reel générique. Le contexte suggère déjà la plupart des réponses (la couleur qu’utilise le compte, les sons qu’il a utilisés, sa densité de coupes), donc le client confirme des valeurs par défaut au lieu d’inventer. Un exemple fixe avant tout le reste transforme les réponses en quelque chose que le client peut voir, et une mauvaise réponse est corrigée avant de dépenser des rushes. L’enregistrement d’état porte une version, pour qu’une mise à jour du pack ne pose que ses nouvelles questions.

## Déroulé

1. Lis le `setup.json` du format : les questions, les règles par défaut, l’exemple à rendre.
   Partage d’abord la vue d’ensemble du format dans l’espace de travail, où un exemple complet montre le résultat avant toute question. Lis le `context/answers.json` partagé et les notes du compte. Le public et la direction de sujet y sont enregistrés une fois pour tous les formats ; ne les redemande jamais juste parce que le client a choisi un autre format.
2. Calcule les valeurs par défaut à partir du `context/` disponible. Pendant que le compte se lit, Talking Head et Quick Cuts utilisent leurs valeurs par défaut livrées et les rushes du client. N’attends jamais le réglage du compte juste pour choisir un look. Montre les valeurs par défaut et laisse le client les changer.
3. Pose six questions au plus, une à la fois, avec les mots du client, en disant ce qui change s’il répond autrement. Pose-les dans sa langue, en français par défaut.
4. Rends l’exemple : une image fixe de la composition du format avec les réponses comme props. Montre-la. Prends un tour de corrections.
5. La page de réglage prépare un prompt. Quand le client le colle dans le chat, l’agent enregistre `answers` et `setup: { done: true, at, version, example }` dans `workspace/library/<format>.json`. Quick Cuts les écrit sous `formats[formatId]`. Talking Head n’a pas de script d’enregistrement : son look passe par le skill `talking-head-customization`, qui traite les choix collés comme des réponses déjà données et écrit lui-même l’enregistrement de réglage. Préserve les autres formats et lis le Markdown de préférences actuel, que le client peut enregistrer directement sur la page. Un brouillon de réglage ou un jeu de réponses qui a l’air complet ne veut jamais dire que le réglage est fait.
6. Rends la main au skill du format, qui tourne sans autre question.

Revenir : « réglage <format> » (ou "<format> setup") rouvre une section. Un nouveau clip n’efface ni ne rouvre jamais un look enregistré. Pour les autres formats, une version en retard ne pose que les nouvelles questions. Talking Head réutilise toujours un look enregistré explicitement, y compris avec d’anciennes versions de réglage ; ne le change que par Modifier le look ou une demande explicite de réglage. Un gros changement de profil se propose, ne s’impose jamais.

## Exemples

Quick Cuts beat montage : chaque template enregistré montre son aperçu de résultat numéroté et son propre guide de tournage. Le client ajoute ses originaux ; l’agent prépare les recadrages correspondants et choisit une chanson éligible au moment de générer. Talking Head : la couleur d’accent par défaut est celle mesurée sur le texte des meilleurs posts ; l’image d’exemple montre une pile de sous-titres dans cette couleur.

## Contre-exemples

Poser les huit questions à un pack qui en a trois. Rendre la vidéo entière comme exemple. Écrire l’enregistrement d’état avant d’avoir montré l’exemple. Ranger les réponses sous `context/`, qui appartient à la personne, pas au format.
