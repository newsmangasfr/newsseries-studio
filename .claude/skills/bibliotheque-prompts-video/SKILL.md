---
name: bibliotheque-prompts-video
description: "Bibliothèque de 703 prompts de vidéos animées en code (HTML, Canvas, SVG, Three.js), tirés de vidéos virales faites avec Claude Opus 5.5 (awesome-opus5-5-videos). À utiliser pour trouver une idée de motion, un style de teaser ou un enchaînement de scènes avant de monter un short série, ou quand le client dit « fais quelque chose comme cette vidéo »."
---

# Bibliothèque de prompts vidéo

- `prompts/` : un fichier Markdown par vidéo (auteur et identifiant dans le nom), avec le prompt partagé par son créateur.
- `data/videos.json` : l'index (catégorie, auteur, lien du post d'origine). Catégories : motion graphics, explainers,
  scènes 3D, jeux et interactif.

## Comment s'en servir

1. Chercher : `grep -ril "teaser\|trailer\|countdown\|ranking" prompts | head` ou `jq` sur `data/videos.json`.
2. Lire 2 ou 3 prompts proches du besoin ; en retenir **la structure** (accroche, rythme, effets, durée), pas le texte.
3. Réécrire un prompt original pour la série du client, avec ses visuels et la charte NewsSeries
   (voir `studio-serie`), puis produire avec `hyperframes`, `brief2mp4` ou `motion-graphics`.

## Règles

- Ces prompts appartiennent à leurs créateurs (dépôt sous licence MIT, liens d'origine dans l'index). Ne pas republier
  une vidéo à l'identique ni reprendre le nom, les personnages ou l'identité d'un autre : s'en inspirer seulement.
- Un prompt ne remplace pas le contrôle qualité de `studio-serie` (rythme, texte lisible, son, faits vérifiés).
