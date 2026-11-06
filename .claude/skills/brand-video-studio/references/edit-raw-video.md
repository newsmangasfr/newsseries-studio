# Editing raw footage for attention

Use this when the user has a single raw take, such as a talking head, a tutorial or a screen recording, and wants it tighter and more watchable. The result usually keeps the same story and format.

## 1. Ask what it is for

Ask the target platform, the target length and whether it stays horizontal. Use `"format": "16:9"` for YouTube, `"9:16"` for Shorts, TikTok and Reels, and `"1:1"` for feeds.

## 2. Remove dead air

```bash
python3 <skill>/scripts/transcribe.py raw.mp4 source/words.json --lang en
python3 <skill>/scripts/autocut.py raw.mp4 source/words.json videos/01-edit --fillers "um,uh,like" --format 16:9
```

`--fillers` depends on the language of the video, and a word may be a filler in one place and meaningful in another, so keep the list short and read the result. Use `--gap` to control pace: 0.3 is punchy, 0.6 is relaxed.

## 3. Do the editorial pass

The script only removes silence. Read the transcript and edit `ranges` in `cut.json` by hand:

- Delete false starts, keeping the last and cleanest take of a repeated sentence.
- Move the most interesting claim to the opening when the story allows it.
- Cut setup that the viewer does not need.

Check every cut with `eyes frames` at both ends, then tell the user what you removed and what you moved.

## 4. Add attention

Layer these in `spec.json` in this order, and stop when it feels busy:

1. **Captions:** on by default, because many people watch muted.
2. **Hook:** add `hook` when the opening needs a title.
3. **Jump zooms:** `autocut.py` adds them every 6 seconds on cuts; tune with `--every` and `--zoom`.
4. **Punch-ins** on the key lines of each section.
5. **Layers:** a `stat` for a number, a `list` for steps, a `check` for pros and cons.
6. **B-roll** through `vranges`, where the user has footage. Keep the audio.
7. **Closing:** set `"closing": true` for a branded ending.

A reset every 5 to 8 seconds is a reasonable default for short videos. Longer content can breathe more. Tutorials need calm while something is being shown, so leave screens uncovered.

## 5. Build and review

Follow "Build a video" in `SKILL.md`. Compare against the raw take with `eyes compare` if the user supplies a reference, and report the before and after duration.
