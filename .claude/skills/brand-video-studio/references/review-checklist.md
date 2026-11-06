# Review checklist

Run `eyes index <render>.mp4`, read the contact sheets and check each point. Most of these rules come from reviewing real reels, where each caught a failure that a clean `check` had missed.

## Picture

- **What is said is seen.** If the voice mentions something and the shot is a dark selfie, cover it with `vranges` or move `cam` toward the subject.
- **Each label sits on its shot.** A label naming a place appears over that place.
- **No dark or ugly shots,** including close-ups of a chin or a blurred arm.
- **Nothing covers a face.** If a card hides the speaker's eyes, delay it or put b-roll under it.
- **Captions clear the face during the hook.** Card layouts shrink the frame, so a caption can land on the face. Move the frame with a `cam` entry at `t: 0`, then return it when the hook ends.
- **No burned-in text from the source** clashing with captions. Crop it with a punch-in or use another stretch.

## Joined clips

- **The order makes sense muted.** Each step follows from the one before.
- **Cropped clips still show the action,** especially horizontal footage in a vertical video.
- **Volume and color do not jump** between clips. Fix volume with `gain`, or tell the user about a clip that looks different.
- **Clips with no speech hold the best stretch,** not the placeholder from `sequence.py`.

## Cover

- **The first frame sells the video.** It works as the thumbnail, so the title must be visible from frame 0.
- **Title and pill fit the crop.** On a 1920 px tall video, keep them between y = 240 and y = 1680. TikTok crops covers to about 3:4 on the profile grid.

## Timing

- **Captions land on time,** at most 0.1 s before the word is said. If not, re-run the clip word sync.
- **Last words finish before the closing.** It starts 0.6 s before the end of the clip. A lost punchline ruins the reel.
- **Cards are never empty.**

## Text

- **Spelling of names** is right in captions. Transcribers guess them; pass `--glossary`.
- **A global `fix` did not change the wrong word.** Use `word@second` for words that appear twice.
- **Claims match the footage.** Prices, dates and names come from the video or the user, never from a guess. Flag anything to confirm.

## Sound

- **Loudness** is near -14 LUFS. If `loudnorm` undershoots, add a static gain with a limiter: `-af volume=2dB,alimiter=limit=0.84:level=false`.
- **Effects sit under the voice,** not over it.
- **Music in b-roll** is music you confirmed by listening to the data, with cuts on the beat.
- **Rights:** report any commercial music in the source, since platforms may mute it.
