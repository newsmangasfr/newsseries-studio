---
name: bibliotheques-3d-fx-export
description: "Fiche de référence des bibliothèques 3D, VFX, motion, son et export utilisables dans un montage NewsSeries : Three.js, react-three-rapier, react-postprocessing, three.quarks, Tweakpane, GSAP, Remotion, Manim, Lottie, Openverse (sons et musiques libres), librosa (battements), WhisperX (sous-titres mot à mot), FFmpeg, et Blender via MCP. À utiliser quand on choisit un outil pour une scène 3D, un effet, une animation, un son libre de droits, des sous-titres synchronisés ou l'export final."
---

# Bibliothèques 3D, FX, son et export

Ce ne sont pas des skills : ce sont des bibliothèques. On les installe dans le projet vidéo qui en a besoin
(`npm i` ou `pip install`), jamais à la racine du dépôt. Choisir **un outil par besoin**, pas toute la pile.

| Besoin | Outil | Dépôt | Quand le prendre |
|---|---|---|---|
| Scène 3D, caméra qui bouge | **Three.js** | mrdoob/three.js | Décor 3D, logo en volume, travelling. Skill lié : `webgpu-threejs-tsl`, `cartoon-3d-short` |
| Physique réaliste | **react-three-rapier** | pmndrs/react-three-rapier | Objets qui tombent, rebondissent, s'empilent (React Three Fiber) |
| Bloom, profondeur de champ, grain | **react-postprocessing** | pmndrs/react-postprocessing | Donner un rendu « cinéma » à une scène 3D |
| Particules, traînées | **three.quarks** | Alchemist0823/three.quarks | Étincelles, fumée, traînées de lumière |
| Réglage en direct | **Tweakpane** | cocopon/tweakpane | Trouver les bons paramètres (vitesse, couleur) avant de les figer dans le code |
| Chronologies d'animation | **GSAP** | greensock/GSAP | Texte, logo, transitions. Skill lié : `gsap` |
| Vidéo en React | **Remotion** | remotion-dev/remotion | Montage en composants. Skills : `remotion-*` (la licence : `remotion-license`) |
| Schémas et équations animés | **Manim** | ManimCommunity/manim | Frise chronologique, graphique de sorties, explications |
| Animations vectorielles légères | **Lottie** | airbnb/lottie-web | Icônes et pictos animés, intégration dans HyperFrames ou Remotion |
| Sons, ambiances, musiques libres | **Openverse API** | api.openverse.org/v1/ | Bruitages et musiques sous licence ouverte (voir règle ci-dessous) |
| Temps forts de la musique | **librosa** | librosa/librosa | Caler les coupes sur les battements (déjà derrière `studiofx.py tempo`) |
| Sous-titres mot à mot | **WhisperX** | m-bain/whisperX | Horodatage précis de chaque mot pour sous-titres animés |
| Encodage et export | **FFmpeg** | FFmpeg/FFmpeg | Export final, réencodage < 100 Mo (voir `short-actu-serie`, étape 9) |
| Équipe 3D complète | **Blender via MCP** | scenario-labs/blender-plugin | Rendu 3D lourd. Demande Blender et le plugin installés sur la machine du client ; non inclus ici |
| Génération d'images par IA, graphes contrôlés | **ComfyUI** | Comfy-Org/ComfyUI | Images clés ou textures en local ; demande un GPU, hors de ce dépôt |
| Effets visuels sans logiciel payant | **EffectCraft** | storytold/effectcraft | Application Rust (60 Mo) : à installer côté machine, non incluse ici |
| Blender piloté par l'agent | **Blender MCP** | ahujasid/mcp-for-blender | Serveur MCP, demande Blender 4.2+ sur la machine du client |
| Décortiquer une vidéo de référence | **Rea-Video** | JuneYaooo/rea-video | Skill `rea-video` et `outils/studiofx.py analyser` |
| 703 prompts de vidéos en code | **awesome-opus5-5-videos** | yihui-dev/awesome-opus5-5-videos | Skill `bibliotheque-prompts-video` |

## Règles

- **Openverse** : garder la licence de chaque son ou musique (CC0, CC BY…). Une licence « BY » impose de citer l'auteur
  dans la description de la vidéo. Ne jamais prendre un son « NC » (usage non commercial) : la chaîne est monétisée.
  Noter source, auteur et licence dans `audio/CREDITS.md` du projet.
- **Musique** : mesurer le volume final (-14 LUFS) ; la musique 12 à 15 dB sous la voix.
- **WhisperX** : vérifier l'orthographe des noms de séries et d'acteurs après transcription.
- **3D** : tester d'abord une image fixe, puis l'animation ; un rendu 3D coûte cher, ne le lancer qu'une fois validé.
- **Pas de dépendance inutile** : si GSAP ou CSS suffisent, ne pas ajouter Three.js.
