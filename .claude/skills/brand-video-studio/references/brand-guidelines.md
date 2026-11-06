# Building a brand guide

The output is two files in `brand/`: `brand.json`, which the scripts read, and `BRAND.md`, which keeps the reasoning for people and for later sessions.

## 1. Gather

Use what exists and ask only for what is missing.

- **Logo:** file, preferably transparent PNG or SVG.
- **Photos and references:** feed, website screenshots, packaging, videos they admire. Index a reference video with `eyes index`, then run `eyes dna <id>` to measure pacing and captions.
- **Audience and feel:** ask for three adjectives and one brand they want to feel close to.

No materials at all? Ask for the name and what it sells, then propose two clearly different directions and let the user pick. If the user wants a logo, the `brandkit` skill or a designer can make one; a video needs only a wordmark to start.

## 2. Extract color

```bash
python3 <skill>/scripts/extract_palette.py brand/assets/logo.png photo1.jpg photo2.jpg --k 8
```

Treat the output as evidence, not a decision. In a photo the most frequent color is often sky or skin. View the images yourself and choose.

## 3. Assign roles

| Role | Job | Requirement |
|---|---|---|
| `ink` | Titles, pills, card borders | Contrast of at least 4.5 against `bg` and `light` |
| `ink_dark` | Caption outline, body text on cards | Darker than `ink` |
| `bg` | Background behind the video card | Calm enough that a title reads on it |
| `light` | Cards, text on `ink` | Near white, tinted toward the palette |
| `accent` | Hard shadows, gauges, details | Distinct from `bg` |
| `highlight` | The word being spoken in captions | Readable as text on video and behind `ink_dark` text |

Check contrast by rendering a snapshot. A palette that looks good as swatches can fail on footage.

A brand with many topics can keep `ink` fixed and vary the other colors per series or campaign, in separate brand files.

## 4. Pick type

Two families: a `display` face with character, and a `body` face that stays readable at caption size on a phone, with a bold weight. Prefer open-license fonts, and put the `.ttf` files in `brand/assets/`. Fredoka and Shrikhand ship with this skill as a starting point. If a brand has a licensed font, use the file the user owns and do not commit it to a public repo.

## 5. Write `brand.json`

```json
{
  "name": "Fieldnote",
  "handle": "@fieldnote",
  "url": "fieldnote.example",
  "cta": "Watch the full story",
  "logo": "assets/logo.svg",
  "style": "pop-bounce",
  "colors": {
    "ink": "#123C3A", "ink_dark": "#0A2221", "bg": "#F2E6C9",
    "light": "#FBF7EC", "accent": "#F2A541", "highlight": "#FFD27F"
  },
  "fonts": {
    "display": { "family": "Shrikhand", "file": "Shrikhand-Regular.ttf" },
    "body": { "family": "Fredoka", "file": "Fredoka.ttf", "weights": "300 700" }
  },
  "sfx_dir": "assets/sfx"
}
```

Paths are relative to `brand.json`. `logo`, `handle`, `url`, `cta` and `sfx_dir` are optional. `url` is the closing's headline; without it the closing shows `name`. Files in `sfx_dir` override generated sounds that share a name: `pop`, `click-pop`, `ding`, `sparkle`, `subscribe`, `impact`, `whoosh`, `swish`. Use sounds the user has the rights to.

## 6. Write `BRAND.md`

Keep it short: who it is for, the three adjectives, the palette with reasons, the fonts, the chosen animation style, voice rules for copy (tone, emoji use, the call to action, fixed hashtags) and what the brand never does. Add what you learn as the user corrects your videos, so the next session starts from it.
