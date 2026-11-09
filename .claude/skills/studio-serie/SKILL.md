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
