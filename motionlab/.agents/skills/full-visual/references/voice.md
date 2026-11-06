# La voix off

La voix off porte la vidéo. Elle doit sonner vivante, avec une émotion qui suit chaque phrase, et rapide. Une prise
plate, lente ou « qui fait IA » gâche une bonne image. La référence est la prise de la vidéo touchscreen : environ
3,3 mots par seconde, vivante, balises dans `examples/touchscreen/script.v3.txt`.

La voix parle la langue de la vidéo : `"language"` dans `reel.json` (code ISO, `"fr"` par défaut), reprise du profil
Full Visual enregistré. Les exemples sont en anglais ; leur méthode vaut pour toutes les langues.

## Quelle voix

- **Une voix enregistrée par le créateur passe en premier** (`workspace/library/full-visual.preferences.md`,
  `full-visual/profile.json`).
- **Sinon, avec une clé ElevenLabs, la voix maison** : copie le bloc `"voice"` de `examples/touchscreen/reel.json`
  (Snap, `gWaDC0oXAheKoZfljzuI`, `eleven_v3`, stability 0.5, similarity 0.8, style 0). `eleven_v3` parle la langue du
  texte qu’on lui donne. Jamais `eleven_multilingual_v2` ici : il n’a pas d’émotion. Si le compte ne peut pas
  utiliser une voix de la bibliothèque, dis-le et prends une des voix du créateur avec le même modèle et les mêmes
  balises.
- **OpenAI ou Fish Audio** : pas de balises ; choisis une voix vivante et rapide et lance
  `node scripts/narrate.mjs --root ../.. --config reels/<slug>/voice.json --text-file reels/<slug>/script.txt --out reels/<slug>/voice.mp3`.
  `align.py` la cale par reconnaissance vocale, dans la langue de la vidéo. Dis une fois qu’ElevenLabs donne le
  meilleur résultat pour ce format.
- **Sa propre voix enregistrée** : un fichier `voice.mp3`, `.wav` ou `.m4a` qu’il a déposé (dans le dossier du projet
  ou dans `workspace/input/`). Copie-le en `reels/<slug>/voice.mp3` (converti avec ffmpeg si besoin), puis
  `tighten.py` et `align.py` comme pour OpenAI : ils le calent par reconnaissance vocale, sans clé. Il doit lire le
  script validé mot pour mot ; un mot ajouté ou sauté est signalé par `align.py`.
- Ni clé ni enregistrement : arrête-toi et demande l’un ou l’autre, en une ligne (la page des clés, ou un fichier
  à déposer).

## Une seule prise

- `script.v3.txt` est `script.txt` avec une balise légère au début de chaque paragraphe, choisie selon ce que fait le
  paragraphe : `[curious]` sur une question, `[emphasized]` sur la réponse et la fin, `[quickly]` sur une scène vécue
  ou une info, `[impressed]` sur une chute, `[matter-of-fact]` pour le seul long paragraphe de mécanisme, au plus. Les
  balises restent en anglais, quelle que soit la langue du texte. Copie `examples/touchscreen/script.v3.txt` et
  `examples/iphone-keyboard/script.v3.txt`. Des balises lentes sur beaucoup de paragraphes donnent une prise lente.
- Les nombres et les montants en toutes lettres dans `script.v3.txt`, dans la langue de la vidéo (« quarante-quatre
  pixels », « un million de dollars ») ; v3 avale les chiffres. Les sous-titres gardent les chiffres.
- L’accroche est simple et curieuse, son dernier mot descend. Quand une question monte à la fin, termine-la par un
  point dans `script.v3.txt` seulement.
- Annonce le coût avant de dépenser : le nombre de caractères de `script.v3.txt`, et le solde restant sur le compte.
- Une seule prise entière (`voice.py`), jamais découpée ni rapiécée. Garde-la sauf si elle a un défaut nommé (un mot
  sauté ou avalé, une accroche qui sonne faux, un rythme très à côté). Trois prises complètes au plus sans demander.

## Rythme : la seule règle

3,3 à 3,5 mots par seconde, avec une respiration de 0,30 s au début de chaque paragraphe et toutes les autres pauses
plafonnées à 0,2 s :

```bash
node ../../scripts/py.mjs scripts/tighten.py <slug> --cap 0.2 --keep "<premiers mots de chaque paragraphe>:0.30,..."
```

Le paragraphe de l’accroche n’est jamais coupé, ni un blanc à côté d’un nombre. `check.py plan` mesure le rythme et
échoue en dehors de 3,3 à 3,5.

- Si la prise est encore lente, accélère d’abord la prise brute : un seul `atempo` uniforme sur tout `voice.raw.mp3`,
  multiplie les temps de l’alignement par le même facteur, puis resserre. N’accélère jamais une partie seulement.
- `tighten.py` repart de `voice.raw.mp3` quand il existe : après une nouvelle prise, mets d’abord les anciens fichiers
  bruts de côté.
- Le rythme vient du script autant que de la prise : des phrases entières reliées par des virgules, moins de points.

Cinq accroches qui ne diffèrent que par l’image partagent cette seule prise.
