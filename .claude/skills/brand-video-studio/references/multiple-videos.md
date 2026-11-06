# Working with several videos

Two jobs start the same way, and it is worth asking which one the user means:

- **Many clips, one video:** ten files from a recipe, a trip or a tutorial, recorded in pieces. Go to "Put clips in sequence".
- **Many videos, many reels:** fifteen long videos become a batch of reels. Go to "Plan a batch".

## 1. Survey everything

```bash
python3 <skill>/scripts/survey.py ./footage --out source --lang en --glossary "Names, Terms"
```

This writes `source/sources.json` and `source/words/<id>.json`. It keeps finished transcripts, so run it again if it stops. It flags mixed framing, clips with no sound, different volumes, clips with sound but no words, and likely retakes.

A clip flagged with sound but no words may be music, ambience or a failed transcript. Listen through `eyes` before treating it as silent.

Then watch them. Run `eyes frames <clip> --fps 1` on every clip, because a recipe filmed with no voice has a transcript of nothing and the footage is the only evidence.

## 2. Put clips in sequence

**Propose the order first.** Recording time is a first guess, not the story. People film the finished dish first or redo a step later. Decide from what each clip shows and says:

1. Name what each clip contains in one line.
2. Group retakes and pick the best one. Prefer the clean delivery and the steady shot, and say which you dropped.
3. Order by the logic of the content: for a recipe, ingredients, then each step in the order the food changes, then the result. A step cannot show food that the previous step has not made yet.
4. List any gap, such as a step mentioned but never filmed. Ask the user instead of hiding it.

Show the user a table of position, clip, what happens and any clip dropped, and wait for a yes. Their order wins, since they were there.

**Then assemble it:**

```bash
python3 <skill>/scripts/sequence.py source/sources.json videos/01-recipe --order intro,mash,mix,oven,result --format 9:16
python3 <skill>/scripts/make_video.py videos/01-recipe --brand brand/brand.json --words source/words
```

`sequence.py` removes dead air from clips with speech, evens out speech volume with `gain`, and keeps a few seconds from the middle of clips with no speech. Those are placeholders: replace them in `cut.json` with the best stretch you saw.

**Give it a thread.** Joined clips feel like a list until something connects them:

- Open on the result when the content allows it: show the finished dish, then go back to the start.
- Add a `pill` for each step, so a muted viewer can follow.
- Cut on action: end a clip as the hand moves and start the next as it lands.
- For clips with no voice, set `"captions": false`, add `music` and use `list` or `pill` layers to carry the steps. Offer a voiceover if the steps need explaining.

## 3. Plan a batch

Write `plan.json` in the project and show it as a table before cutting anything:

```json
{
  "per_source_max": 2,
  "videos": [
    { "name": "01-first-tip", "sources": ["ep03"], "title": "The mistake nobody mentions", "type": "tips", "reviewed": false }
  ]
}
```

- **Agree on the total.** "20 reels from 15 videos" and "3 from each" are different jobs, so confirm it, and set `per_source_max` to keep one video from taking over.
- **Pick the strongest moments overall,** instead of filling a quota per video. Leaving a weak video out is a good outcome.
- **Vary the types** from `references/reels-from-long-video.md`, and keep neighboring reels from telling the same story.
- A reel can mix sources, such as "the best moment of every episode". Use `sources` in `cut.json`, covered in `references/spec.md`.

Check the plan at any time, and always before reporting progress:

```bash
python3 <skill>/scripts/batch.py .
```

It reports the state of each video from the files on disk and flags repeated footage, overused sources and sources nobody used. After a video passes `references/review-checklist.md`, set its `"reviewed": true`. To resume an interrupted batch, run it and carry on from the first video that is not `reviewed`. A `stale` video was edited after its render, so render it again.

Say how long the batch will take before starting, because each render takes minutes. Review the first finished video with the user before making the rest: a wrong caption size or hook repeated twenty times is expensive.
