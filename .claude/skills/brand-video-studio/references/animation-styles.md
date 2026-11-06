# Animation styles

Show the user this catalog when they choose a look. Recommend one with a reason, and offer to render the same 10 seconds in two styles when they are unsure.

## Ready-made presets

Set one in `brand.json` as `"style"`, or per video in `spec.json`. Each is defined in `assets/styles.json`.

| Preset | Look | Motion | Captions | Best for |
|---|---|---|---|---|
| `pop-bounce` | Video in a card with a hard shadow, soft shapes behind | Elastic overshoot, word-by-word title | Bold, active word in color | Travel, lifestyle, food, personality-led creators |
| `editorial-clean` | Sharp card, flat background, no shadow | Slow rises and fades | Small, no word highlight | Premium brands, architecture, fashion, consulting, health |
| `kinetic-bold` | Full-bleed video, huge uppercase type | Slams from scale, fast cuts | Uppercase, active word in a box | Fast education, opinion, finance, podcast clips |
| `tech-glitch` | Grid background, tight corners | Stepped, frame-snapped moves | Tight, active word in color | Software, AI, gaming, tutorials |
| `cinematic-minimal` | Full-bleed video, spaced uppercase titles | Long sine fades | Small, no highlight | Documentary, real estate, weddings, nature, b-roll |
| `scrapbook` | Dotted paper, tilted title | Playful spins and overshoot | Active word in a box | Family, DIY, recipes, warm brands |

## Building your own

Copy a preset in `assets/styles.json` and change these parts. Keep the combinations coherent: a slow caption over slam cuts reads as a mistake.

| Part | Options |
|---|---|
| `layout` | `card` (video in a frame during the hook, then full) or `full` |
| `shadow` | `hard` or `none` |
| `decor` | `blobs`, `grid`, `dots`, `plain` |
| `transition` | How a card opens: `clip`, `fade`, `cut` |
| `title` / `enter` | `from` state, `ease`, `dur`, `stagger`, `tilt`, `case` |
| `exit` | `to` state, `ease`, `dur`. Keep exits faster than entrances |
| `caption` | `mode` (`color`, `box`, `none`), `size`, `stroke`, `shadow`, `pop`, `case` |
| `camera_ease` | Easing for moves of the video frame |

## Motion vocabulary

Pick by feeling, then find the GSAP ease.

- **Energetic:** `back.out(2)`, `elastic.out(1, 0.5)`, `expo.out`
- **Calm:** `sine.inOut`, `power1.out`
- **Precise:** `power3.inOut`, `power4.inOut`
- **Mechanical:** `steps(4)`

## Camera moves

Add to `cam` in `spec.json`. Moving the frame keeps a talking head alive without new footage.

| Move | Values | Use |
|---|---|---|
| Punch-in | `s: 1.25` over 0.4 s | Stress a key line |
| Jump zoom | `s: 1.12`, `d: 0.01` on a cut | Hide a jump cut, reset attention |
| Pan to detail | `x` or `y` over 0.5 s | Show what the speaker mentions, at the edge of a wide frame |
| Slow push | `s: 1.08`, `d: 6`, `ease: "none"` | Add tension to a held shot |

Vertical output crops wide footage heavily, so `x` reaches about 1160 px each way. Use it to show the side of the frame that matters.

## Sound with motion

Pair each visible action with a quiet effect: `pop` for list rows, `click-pop` for pills, `whoosh` for transitions, `ding` or `sparkle` for a payoff. `build.py` adds these automatically; add more in `sfx`. Too many tire the ear, so favor the moments that matter.

## Going beyond the presets

For a named effect, such as glitch, film grain, a chart or a 3D title, search the `hyperframes-registry` skill and add it as a composition. For a look copied from a reference video, use `eyes dna` to measure it and turn the numbers into a new preset.
