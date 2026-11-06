# X reels from one long video

For more than one source video, plan the batch with `references/multiple-videos.md`, then use this guide for each reel.

## 1. Propose first

After watching the video, propose the requested number of reels, or 7 to 10 if the user gave none. For each: title, type, source time ranges, why it should work. Wait for approval, since each render takes minutes.

Formats that repeat well:

1. **Story:** something that happened, opening on the turning point.
2. **Numbers:** "How much does X cost?", with price tags and a total.
3. **Honest review:** pros and cons with check marks.
4. **List or ranking:** "What to order at…", "I tried all of…".
5. **Tips:** "What nobody tells you about…".
6. **Humor:** plan versus reality.
7. **B-roll montage:** about 25 seconds, no voice, music, cuts on the beat.

Include one or two b-roll pieces when the source has clean footage. Confirm a stretch is really music by listening to it through its volume and beat data; silence in a transcript proves only that nobody spoke.

## 2. Structure of a reel

Aim for 20 to 45 seconds.

- **Hook, 0 to 3.5 s:** at most two lines and a context pill. It must make sense with the sound off. The title sits at `top: 300` so it survives the cover crop.
- **Body:** one idea, with a layer, a camera move or a new shot every few seconds.
- **Payoff:** end on the line that resolves the hook, not on trailing words.
- **Closing, about 3.7 s:** logo, name, call to action. The closing covers the clip's last 0.6 s, so extend the final range until the last word ends before it.

Cut to words: use `eyes transcript <id> --words --range 1:00-1:30` and place range edges in the gaps between words.

## 3. Show what is being said

This is the difference between a clip and a reel.

- When the speaker mentions something and the shot does not show it, set `vranges` to cover that part with matching footage while the audio keeps playing.
- Move `#cam-inner` toward the relevant side of a wide frame.
- Time each layer to its shot. A label must appear over the thing it names.

## 4. Copy

Write one block per reel in `COPY.md`:

```
## 01 · Working title — `01-name.mp4`

First line is the title, under 100 characters.
Three to six short lines with the value of the video.
One question that invites comments.
Where to watch the full video.
#seven #or #eight #relevant #hashtags
```

Keep the same copy across networks unless the user wants otherwise. On YouTube use the first line as the title and link the full video from the Short's "Related video" field.

## 5. Calendar

Offer a table of date, time, file and title. Spread reels from the same source over days, and do not stack them on top of another campaign. Check each platform's current limit on how far ahead it allows scheduling before promising dates: at the time of writing Meta allows 29 days and TikTok about 30, counted from the current time.
