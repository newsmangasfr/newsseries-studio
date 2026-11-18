# NewsSeries Studio

Projet de montage vidéo pour NewsSeries (newsseries.fr), copie de StudioFax adaptée aux séries.

Les skills de montage se trouvent dans `.claude/skills/`. Claude Code les charge tout seul quand une session s'ouvre sur ce dépôt, en local comme sur claude.ai/code.

Prérequis : Node.js, ffmpeg et Python.

## Boîte à outils de montage

`outils/` réunit 11 outils open source (PySceneDetect, Auto-Editor, vid.stab, color-matcher, rembg, RIFE,
Real-ESRGAN, Demucs, librosa, HyperFrames, FFmpeg) derrière une seule commande : `outils/studiofx.py`. Installation :
`bash outils/installer.sh`. Détails : `outils/README.md`.

## Skills ajoutés (storyboard, VFX, son)

`studio-serie` orchestre la chaîne complète. Skills tiers inclus, avec leur licence : `cinematic-director`
(wuwangzhang1216/DirectorSKILL), `short-drama-*` (zenstory-ai/drama-skills), `seedance-storyboard-generator`
(liangdabiao), `pixelfx` (patch-gg), `shader-art-coding` (gokayfem), `webgpu-threejs-tsl` (dgreenheck),
`cartoon-3d-short` (mromidev/claude-animated-shorts), `elevenlabs-*` (elevenlabs/skills). HyperFrames et Remotion
étaient déjà là. Non repris : `comfyui-mcp` (serveur MCP, pas un skill) et `claude-ai-music-skills` (album Suno).

Deuxième lot : `motion-design` (LottieFiles), `motion-ai-kit` (motiondivision/ai-kit), `hairline-create` et
`hairline-adopt` (lucasmarkes), `anatomy` (wheresryan22), `anatomy-reveal` (annnguyentt), `remotion-license`, et la fiche
`bibliotheques-3d-fx-export` pour les bibliothèques (Three.js, GSAP, Manim, Lottie, Openverse, WhisperX, FFmpeg…).
Non repris : `scenario-labs/blender-plugin` (plugin Blender de 163 Mo, à installer côté machine).

Troisième lot : 32 skills du pack iart.ai (iart-ai/motion-skills, licence MIT, voir `.claude/skills/LICENSE-iart-motion-skills`) :
sous-titres, rythme, titres, habillage, graphiques, explications, pubs, 3D. `short-form-video` d'iart est renommé
`iart-short-form-video` (le nom existait déjà). Non repris : packs e-commerce, SMS, cartes, freelance, web, Manim,
illustration générative, talking-head IA, et le skill After Effects.

Quatrième lot : `brief2mp4` (qualixar, MIT) et 17 skills de video-studio-kit (owlinthebarnai, qui regroupe des projets
MIT/Apache-2.0 : voir son THIRD_PARTY.md) : `kinetic-reel`, `painted-animation`, `claude-animation-styles`, `lemo-opuscar`,
`animate`, `tvhead-video`, `reverse-any-video`, `remotion-to-hyperframes`, `real-sound`, `earshot`, `media-use`,
`motion-prompt`, `style-sampling`, `gsap-core/timeline/utils/performance`. Non repris : l'application Video Studio,
les skills scientifiques et Blender, `figma`, `slideshow`, et deux skills rédigés en russe (`motion-studio`, `ai-montage`).
