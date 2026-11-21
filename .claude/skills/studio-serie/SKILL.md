---
name: studio-serie
description: "Chaîne de montage complète NewsSeries : du sujet série au short fini (storyboard, visuels, VFX, voix, musique, bruitages, montage, contrôle qualité). Sert de chef d'orchestre : il dit quel skill appeler à chaque étape. À utiliser pour « améliore le montage », « fais un montage pro », « storyboard », « ajoute des effets / du son », ou dès qu'un short ou un teaser série demande plus qu'un simple modèle."
---

# Studio NewsSeries : la chaîne complète

`short-actu-serie` fabrique le short standard. Ce skill ajoute tout ce qui le rend meilleur. On enchaîne les étapes
dans l'ordre et on saute celles dont le sujet n'a pas besoin.

| # | Étape | Skill à appeler | Sortie |
|---|---|---|---|
| 1 | **Accroche et script** : 3 premières secondes, une promesse, une chute qui relance (question au public) | `short-actu-serie` (étape 3) | `tools/vo.json` |
| 2 | **Storyboard** : liste de plans, durée de chaque plan, invites d'images clés | `cinematic-director` (court, une série) ; `short-drama-storyboard` (mini-épisode) ; `seedance-storyboard-generator` (plans vidéo IA) | liste de plans |
| 3 | **Visuels** : affiche, captures, personnages ; cadrages et agrandissement | `boite-a-outils` (`agrandir`, `detourer`) ; `short-drama-image-prompts` | `assets/src/` |
| 4 | **Effets** : transitions, particules, ambiances | `effects`, `hyperframes-registry` (blocs), `shader-art-coding` (GLSL), `webgpu-threejs-tsl` (3D), `pixelfx` (pixel art) | calques animés |
| 5 | **Voix** | voix HeyGen « Lucian » (`outils/voix_lucian.sh`) ; `elevenlabs-text-to-speech` seulement si le client l'accepte | `audio/vo/` |
| 6 | **Musique et bruitages** | `sound-effects` (passe mesurée, -16 LUFS) ; `elevenlabs-music`, `elevenlabs-sound-effects` | `audio/` |
| 7 | **Montage** | `short-actu-serie` (étapes 5-7), `video-storytelling` (caméra, rythme), `hyperframes` | `renders/*.mp4` |
| 8 | **Contrôle** | planche d'images, `ffprobe`, `ebur128` ; `short-drama-review` pour relire un storyboard | rapport |

## Options 3D, motion et export

| Besoin | Skill ou fiche |
|---|---|
| Timing, easing, 12 principes de Disney | `motion-design`, `motion-ai-kit` (ressorts CSS, audit de motion) |
| Figure linéaire interactive à partir d'une idée ou d'un SVG | `hairline-create`, `hairline-adopt` |
| Machine ou système en figure isométrique | `anatomy` |
| Vue éclatée d'un objet et vidéo de révélation MP4 | `anatomy-reveal` |
| Three.js, physique, post-traitement, particules, Tweakpane, Manim, Lottie, Openverse, WhisperX, FFmpeg, Blender | `bibliotheques-3d-fx-export` |

## Pack iart.ai (32 skills motion)

| Besoin | Skills |
|---|---|
| Sous-titres animés, compte à rebours, short vertical | `caption-animation`, `countdown-video`, `iart-short-form-video` |
| Rythme et coupes sur la musique | `beat-sync-editing`, `soundtrack` |
| Titres et logo | `kinetic-typography`, `logo-animation`, `lower-thirds`, `youtube-intro-outro` |
| Habillage de fond, couleur, cadrage | `motion-background`, `color-motion`, `shot-composition`, `motion-art-direction`, `animation-principles` |
| B-roll d'une vidéo face caméra | `talking-head-b-roll` |
| Chiffres, classements, audiences | `chart-animation`, `animated-infographic`, `presentation-video`, `wrapped-video` |
| Explications | `explainer-video`, `diagram-animation`, `isometric-animation`, `whiteboard-animation` |
| Pubs et bandes-annonces | `launch-video`, `ad-creative-video`, `testimonial-video`, `audiogram` |
| 3D et effets | `threejs-animation`, `shader-glsl`, `particle-system`, `javascript-animation`, `remotion-video` |

## Montage vérifié et styles d'animation (video-studio-kit, brief2mp4)

| Besoin | Skill |
|---|---|
| Brief écrit → MP4 contrôlé ligne par ligne (REPORT.md), 30 styles, pack montage | `brief2mp4` |
| Refaire en projet modifiable une vidéo existante (celle du client) | `reverse-any-video`, `remotion-to-hyperframes` |
| Reels de typographie, aquarelle, styles prêts (pixel art, BD, argile…) | `kinetic-reel`, `painted-animation`, `claude-animation-styles`, `lemo-opuscar`, `animate`, `tvhead-video` |
| Sons réalistes, écoute et vérification du son, médias libres | `real-sound`, `earshot`, `media-use` |
| Nommer un effet, nouvel épisode dans un style éprouvé | `motion-prompt`, `style-sampling` |
| GSAP en détail | `gsap-core`, `gsap-timeline`, `gsap-utils`, `gsap-performance` |

`brief2mp4` est la meilleure base pour un montage exigeant : le brief fixe la durée, le format, les textes exacts et la
liste « terminé quand », et le rapport prouve chaque ligne avec une mesure ou une image.

## Montage automatique, DaVinci Resolve et design

| Besoin | Skill ou fiche |
|---|---|
| Rushes → final.mp4 (tics de langage, étalonnage, sous-titres) | `video-use` |
| Piloter DaVinci Resolve (montage, couleur, audio, export) | `resolve-mcp`, `resolve-rough-cut`, `resolve-edit`, `resolve-color`, `resolve-audio`, `resolve-delivery`, `resolve-session` (et `resolve-*`) |
| Affiches, miniatures, visuels PNG et PDF | `canvas-design`, `banner-design`, `brand`, `theme-factory` |
| Présentation (dossier de pitch, bilan) | `pptx` |
| Site et interface NewsSeries | `frontend-design`, `ui-ux-pro-max`, `design-system`, `design-md`, `taste-design`, `astryx`, `stitch-generate-design`, `enhance-prompt` |
| Vérifier une page dans un navigateur | `agent-browser` |
| MCP, auto-editor, MoviePy, Figma, Penpot, Excalidraw, tldraw | `outils-montage-design` |

## Références et idées

| Besoin | Skill |
|---|---|
| Trouver une idée de motion ou de teaser parmi 703 prompts | `bibliotheque-prompts-video` |
| Décortiquer une vidéo de référence (plans, rythme, moyens de fabrication) | `rea-video` |
| 99 styles de films faits en code | `lemo-opuscar` (version officielle ; le dépôt des styles se clone à la demande) |

## Clips à partir d'une vidéo longue

`long-video-en-cut-reel` fait le travail ; `pipeline-clips` liste les outils de chaque étape (capture, transcription,
recadrage, export) et fixe la règle sur les droits : seulement des sources du client ou autorisées.

## Règles de montage qui font la différence

- **Rythme** : un changement visuel (plan, zoom, texte, effet) toutes les 1,5 à 3 secondes ; jamais plus de 4 secondes
  sans mouvement. Caler les coupes sur les mots forts et sur les temps de la musique (`studiofx.py tempo`).
- **Accroche** : l'image la plus forte et la phrase la plus forte dans les 3 premières secondes, logo après, pas avant.
- **Texte à l'écran** : 6 mots maximum par carte, contraste fort, hors des zones de texte de l'affiche et de la zone
  d'interface TikTok (bas 20 %, droite 15 %).
- **Son** : voix au premier plan, musique 12 à 15 dB sous la voix, un bruitage par changement de plan important,
  pas plus. Mesurer le volume final (-14 LUFS pour les réseaux).
- **Fin** : une question au public, puis le logo NewsSeries et newsseries.fr tenus 1,5 seconde.
- **Faits** : ne rien affirmer que les visuels ou le client ne confirment pas. Une rumeur est présentée comme telle.
  Les visuels et la musique d'une autre chaîne ne se réutilisent jamais.

## Outils externes (avec l'accord du client)

`elevenlabs-*` demande une clé `ELEVENLABS_API_KEY` ; `pixelfx` propose d'installer `pch` ; `cartoon-3d-short` demande
Blender. On ne lance une installation (`curl ... | sh` compris) qu'après un oui explicite, et une clé ne s'écrit jamais
dans un fichier.
