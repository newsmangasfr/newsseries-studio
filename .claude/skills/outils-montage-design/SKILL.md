---
name: outils-montage-design
description: "Fiche de référence des outils de montage et de design qui ne sont pas des skills : DaVinci Resolve MCP, auto-editor, PySceneDetect, MoviePy, Remotion, Magic MCP, Figma Context MCP, Penpot, Excalidraw, tldraw, DESIGN.md. À utiliser pour choisir un outil de montage automatique, piloter DaVinci Resolve, préparer des visuels, une maquette ou un schéma pour un short ou le site NewsSeries."
---

# Outils de montage et de design

Ce sont des outils (logiciels, serveurs MCP, bibliothèques) : on les installe côté machine ou dans le projet qui en a
besoin, après accord du client. Les skills correspondants sont déjà dans `.claude/skills/`.

| Besoin | Outil | Dépôt | Déjà couvert par |
|---|---|---|---|
| Piloter DaVinci Resolve (montage, étalonnage, export) | DaVinci Resolve MCP | samuelgursky/davinci-resolve-mcp | skills `resolve-*` (demandent Resolve Studio et le serveur MCP installés sur la machine) |
| Couper les silences | auto-editor | WyattBlue/auto-editor | `boite-a-outils` (`studiofx.py`), `cut-silences` |
| Détecter chaque changement de plan | PySceneDetect | Breakthrough/PySceneDetect | `boite-a-outils` |
| Montage vidéo en Python | MoviePy | Zulko/moviepy | à utiliser pour des assemblages simples sans HyperFrames |
| Montage vidéo en React | Remotion | remotion-dev/remotion | skills `remotion-*`, `stitch-remotion` |
| Rushes → final.mp4 (tics de langage, étalonnage, sous-titres) | video-use | browser-use/video-use | skill `video-use` |
| Composants d'interface générés | Magic MCP | 21st-dev/magic-mcp | outil MCP, pour le site |
| Maquettes Figma vers l'agent | Figma Context MCP | GLips/Figma-Context-MCP | outil MCP (clé Figma du client) |
| Maquettes open source | Penpot | penpot/penpot | alternative à Figma, MCP officiel |
| Vérifier une page dans un navigateur | agent-browser | vercel-labs/agent-browser | skill `agent-browser` |
| Identité visuelle lisible par l'agent | DESIGN.md | google-labs-code/design.md | skill `design-md` : y noter le bleu, le rouge et le noir du logo NewsSeries |
| Système de design pour agents | Astryx | meta/astryx | skill `astryx` |
| Schémas et wireframes dessinés à la main | Excalidraw | excalidraw/excalidraw | pour les storyboards et plans de page |
| Canevas infini intégrable | tldraw | tldraw/tldraw | idem, si on veut un outil de storyboard dans le site |

## Règles

- **DaVinci Resolve** : ne jamais lancer un rendu ni écraser un projet du client sans accord ; travailler sur une copie.
- **Clés** (Figma, Magic) : fournies par le client dans ses variables d'environnement, jamais écrites dans un fichier.
- **Charte NewsSeries** : noir `#000`, bleu et rouge du logo ; les skills de design (`theme-factory`, `ui-ux-pro-max`,
  `brand`, `design-md`) doivent partir de cette charte, pas d'un thème au hasard.
