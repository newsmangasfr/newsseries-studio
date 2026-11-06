# Ce que fait une fusion

Elle lit `pack.json` :

```json
{ "name": "quick-cuts", "kind": "format", "version": "0.1.0", "runtime": ">=0.1.0", "setup_version": 1, "command": "/quick-cuts",
  "first_run": { "rank": 3, "why": "il lui faut un dossier de clips et une chanson, ou un sujet à rechercher" },
  "provides": { "formats": ["quick-cuts"], "skills": [".agents/skills/quick-cuts"], "scripts": ["scripts/*.mjs"], "compositions": ["remotion/*.tsx"], "assets": ["assets/**"], "hooks": [] },
  "needs": { "keys": ["COMPOSIO_API_KEY"], "inputs": ["a folder of clips"], "deps": {} } }
```

Puis, dans l’ordre :

1. Refuse si `runtime` n’est pas satisfait par la version de `runtime.json`, ou si un pack du même nom avec une version plus récente est déjà installé.
2. Copie chaque dossier de skill dans `.agents/skills/<name>/`.
3. Copie les scripts dans `scripts/<format>/`, en gardant leur organisation relative.
4. Copie les compositions dans `remotion/<format>/` et ajoute leurs chemins à `runtime.json.compositions`.
5. Copie les ressources dans `assets/<format>/`.
6. Enregistre les hooks en les ajoutant à `hooks/registry.json`.
7. Ajoute `{ name, version, setup_version, command, first_run, needs, at }` à `runtime.json.packs` et écris `.installed/<format>.json` avec la liste complète des fichiers. `first_run` est la façon dont un pack dit ce dont il a besoin avant de pouvoir faire quoi que ce soit, et c’est ce qui décide de l’ordre quand plusieurs formats sont installés et qu’aucun n’a commencé : le rang le plus bas passe en premier et son `why` est la phrase qu’entend le client. Un pack qui l’omet passe en dernier. Rien d’autre ne le lit, et il ne passe jamais devant un format déjà engagé dans ses étapes.
8. N’écris jamais sous `workspace/`, `context/` ni `.env.local`.

Le retrait lit `.installed/<format>.json`, supprime ces fichiers, retire les entrées du registre et laisse `workspace/library/<format>.json` en place pour qu’une réinstallation garde le réglage.

## Quand le téléchargement est un dossier, pas un pack

Ce qu’un client télécharge pour un deuxième format est un dossier MotionLab entier dans lequel ce format est déjà fusionné. Il n’a pas de `pack.json` à sa racine, donc la fusion lit son `runtime.json` pour les formats qu’il porte et son `.installed/<format>.json` pour chaque chemin que possède chacun, et copie exactement ceux-là. Les formats que ce dossier a déjà, à la même version ou plus récente, sont sautés, et la fusion le dit au lieu de ne rien faire en silence.

Avant tout ça, les versions sont comparées. Si le dossier téléchargé est le plus récent des deux, la partie commune est d’abord copiée : tout ce qu’il contient qui n’est ni un format ni à l’usage propre du client, c’est-à-dire jamais `workspace/`, `context/`, `.env.local` ni les enregistrements d’installation. C’est ce qui permet à un format vendu en décembre de demander un dossier qui n’existait pas en octobre sans que le client ait à savoir lequel des deux il tient.

`VERSION` est écrit après chaque changement, et liste le runtime et chaque format installé.
