#!/usr/bin/env python3
"""caption.txt + the voice -> words.json. The caption is the script, never a transcription of the voice.

usage: align.py <slug>          (reads reels/<slug>/caption.txt and reels/<slug>/voice.*)

caption.txt, the one file that drives a reel:
  == signup | ground: light      a scene starts here (id = key in the reel's scene map; ground dark or light)
  It starts with your            one line = one caption block (two rendered lines at most)
  signup *form,*                 *word* = the block's key word, it gets the selection box
  which has no / 🎂 *age* question,   an emoji right before a word sits inline before it; " / " = break the line here
                                 (no " / ": the engine balances the two lines itself)
  @bottom / @top                 the caption slot from the next block on
  # ...                          comment

Word times come from reels/<slug>/voice.alignment.json when it exists (ElevenLabs "with timestamps": exact), else
from speech recognition in the reel's language (whisper.cpp: small.en for English, the multilingual small otherwise,
French by default; else auto-editor's Apple pass) matched to the caption's own words; a caption word the recogniser
missed is timed between its neighbours and reported. Words are matched with case, accents and apostrophes folded, so
"L’écran" in the caption and "l'ecran" heard are one word.

French typography: a mark set apart by a space ("vrai ?", "« mot »", "50 €") is neither a word nor an emoji. A closing
mark, a currency or a percent sign joins the word before it, an opening mark the word after it, with a no-break space:
the caption shows it where it was written and the timing ignores it.
"""
import difflib, json, re, subprocess, sys, tempfile, unicodedata, wave
from pathlib import Path
import numpy as np
from where import fold, language, utf8_console, whisper   # the folder's own speech model and engine, on every system

ROOT = Path(__file__).resolve().parent.parent
NBSP = " "
norm = lambda s: fold(s).replace(" ", "")
is_word = lambda tok: any(ch.isalnum() for ch in tok)
# a mark standing alone: punctuation, a currency, percent or degree sign. An emoji is a symbol too, but of another kind.
is_mark = lambda tok: bool(tok) and all(unicodedata.category(ch)[0] == "P" or unicodedata.category(ch) == "Sc" or ch in "%‰°" for ch in tok)
opens = lambda tok: all(unicodedata.category(ch) in ("Ps", "Pi") or ch in "¿¡" for ch in tok)
is_emoji = lambda tok: not is_word(tok) and not is_mark(tok)


def parse(text):
    scenes, blocks, words, slot = [], [], [], "top"
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("=="):
            head = [p.strip() for p in line[2:].split("|")]
            ground = next((p.split(":")[1].strip() for p in head[1:] if p.startswith("ground")), "dark")
            title = next((p.split(":", 1)[1].strip() for p in head[1:] if p.startswith("title")), None)  # shown by a hud
            scenes.append({"id": head[0], "ground": ground, "firstWord": len(words), **({"title": title} if title else {})})
            slot = "top"
            continue
        if line in ("@top", "@bottom"):
            slot = line[1:]
            continue
        if not scenes:
            sys.exit("caption.txt : la première ligne doit ouvrir une scène, par exemple '== hook | ground: dark'")
        idx, emoji, br, lead = [], None, None, ""
        for tok in line.split():
            # a keyword after a French elision, written l'*écran*, is the keyword *l'écran*
            tok = re.sub(r"^([^*\s]+['’])\*(.+)\*$", r"*\1\2*", tok)
            if tok == "/":
                br = len(words)
                continue
            bare = tok.strip("*")
            if is_mark(bare):
                if opens(bare) or not words:     # « ( “ : held for the next word
                    lead += bare + NBSP
                else:                            # ? ! : ; » € % : joins the word before it
                    words[-1]["w"] += NBSP + bare
                continue
            if is_emoji(bare):
                emoji = bare
                continue
            key = tok.startswith("*") and tok.endswith("*")
            words.append({"w": lead + bare, "key": key, "emoji": emoji})
            idx.append(len(words) - 1)
            emoji, lead = None, ""
        if lead and words:                       # an opening mark with no word after it on its line
            words[-1]["w"] += NBSP + lead.rstrip(NBSP)
        blocks.append({"words": idx, "slot": slot, "scene": len(scenes) - 1, **({"br": br} if br is not None else {})})
    return scenes, blocks, words


def to_wav(src, rate):
    out = Path(tempfile.mkdtemp()) / "a.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vn", "-ac", "1", "-ar", str(rate), str(out)], check=True)
    return out


def recognise(voice, lang):
    wav = to_wav(voice, 16000)
    found = None
    if sys.platform != "darwin":   # off a Mac there is no Apple speech: fetch whisper.cpp and the model for this language
        found = whisper(lang)
    else:
        import shutil
        from where import whisper_model
        # Apple speech goes through auto-editor; a fresh Mac does not have it, so fetch whisper.cpp and the model instead.
        if whisper_model(lang).exists() or not shutil.which("auto-editor"):
            found = whisper(lang)
    if found:
        cli, model = found
        base = wav.with_suffix("")
        if lang != "en":
            # One word a segment (-ml 1 -sow), read whole: a token of a multilingual model can hold half of an accented
            # letter's bytes, so tokens are never glued together here, words are.
            subprocess.run([cli, "-m", str(model), "-f", str(wav), "-l", lang, "-ml", "1", "-sow", "-oj", "-of", str(base), "-np"], check=True, capture_output=True)
            out = []
            for seg in json.loads(base.with_suffix(".json").read_text(encoding="utf-8", errors="replace"))["transcription"]:
                x = (seg.get("text") or "").strip()
                if x and not x.startswith("["):
                    out.append([x, seg["offsets"]["from"] / 1000, seg["offsets"]["to"] / 1000])
            return out
        subprocess.run([cli, "-m", str(model), "-f", str(wav), "-l", "en", "-ojf", "-of", str(base), "-np"], check=True, capture_output=True)
        out, cur = [], None
        for seg in json.loads(base.with_suffix(".json").read_text(encoding="utf-8", errors="replace"))["transcription"]:
            for tok in seg["tokens"]:
                x = tok["text"]
                if x.startswith("["):
                    continue
                if x.startswith(" ") or cur is None:
                    if cur:
                        out.append(cur)
                    cur = [x.strip(), tok["offsets"]["from"] / 1000, tok["offsets"]["to"] / 1000]
                else:
                    cur[0] += x
                    cur[2] = tok["offsets"]["to"] / 1000
        return out + ([cur] if cur else [])
    mp3 = wav.with_suffix(".jsonl")
    subprocess.run(["auto-editor", "whisper", str(wav), "apple", "-sw", "-f", "json", "-l", lang, "-o", str(mp3)], check=True, capture_output=True)
    return [[d["text"], d["start"] / 1000, d["end"] / 1000] for d in map(json.loads, mp3.read_text(encoding="utf-8").splitlines())]


def from_alignment(path):
    a = json.loads(path.read_text(encoding="utf-8"))
    a = a.get("alignment", a)
    out, cur = [], None
    for ch, s, e in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
        if ch.isspace():
            if cur:
                out.append(cur)
            cur = None
        elif cur is None:
            cur = [ch, s, e]
        else:
            cur[0] += ch
            cur[2] = e
    return out + ([cur] if cur else [])


def match(words, heard):
    heard = [h for h in heard if norm(h[0])]   # a mark said alone ("?", "»") times nothing
    a, b = [norm(w["w"]) for w in words], [norm(h[0]) for h in heard]
    missed = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag == "equal":
            for i, j in zip(range(i1, i2), range(j1, j2)):
                words[i]["t"], words[i]["e"] = heard[j][1], heard[j][2]
        elif i2 > i1:  # the caption says something the recogniser wrote differently: spread over the same span
            t0 = heard[j1][1] if j1 < len(heard) and j2 > j1 else None
            t1 = heard[j2 - 1][2] if j2 > j1 else None
            missed.append((i1, i2, " ".join(h[0] for h in heard[j1:j2]), t0, t1))
    for i1, i2, said, t0, t1 in missed:
        lo = t0 if t0 is not None else (words[i1 - 1]["e"] if i1 else 0.0)
        hi = t1 if t1 is not None else next((w["t"] for w in words[i2:] if "t" in w), lo + 0.3 * (i2 - i1))
        total = sum(len(words[i]["w"]) for i in range(i1, i2)) or 1
        t = lo
        for i in range(i1, i2):
            d = (hi - lo) * len(words[i]["w"]) / total
            words[i]["t"], words[i]["e"] = round(t, 3), round(t + d, 3)
            t += d
        print(f"  ! sous-titre \"{' '.join(words[i]['w'] for i in range(i1, i2))}\" / voix entendue \"{said}\" : calé sur ses voisins, à vérifier")
    return len(missed)


def silences(voice, floor_db=-42, min_len=0.12):
    with wave.open(str(to_wav(voice, 16000))) as wf:
        x = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
    n = 160  # 10 ms
    rms = np.array([np.sqrt(np.mean(x[i:i + n] ** 2) + 1e-12) for i in range(0, len(x) - n, n)])
    quiet, out, start = 20 * np.log10(rms) < floor_db, [], None
    for i, q in enumerate(list(quiet) + [False]):
        if q and start is None:
            start = i
        elif not q and start is not None:
            if (i - start) * 0.01 >= min_len:
                out.append([round(start * 0.01, 2), round(i * 0.01, 2)])
            start = None
    return out, round(len(x) / 16000, 3)


def clamp_to_silences(words, sil, window=1.2):
    """Nobody speaks inside a silence. Recognisers stretch a sentence's last word into the gap after it and start
    the next sentence early; pull the words on each side back out, spreading the correction over about a second."""
    moved = 0
    for s0, s1 in sil:
        if s1 - s0 < 0.2:
            continue
        # words the recogniser placed over the gap: the ones up to a closing punctuation mark belong before it
        over = [i for i, w in enumerate(words) if w["t"] < s1 and w["e"] > s0]
        if not over:
            continue  # nothing was placed over this gap: nothing to pull out
        closing = [i for i in over if words[i]["w"][-1] in ".!?…»)"] or [i for i in over if words[i]["w"][-1] in ",;:"]
        mid = (s0 + s1) / 2
        cut = closing[-1] + 1 if closing else next((i for i in over if (words[i]["t"] + words[i]["e"]) / 2 >= mid), (over[-1] + 1) if over else 0)
        before, after = (words[:cut] if s0 > 0.05 else []), words[cut:]
        if before and before[-1]["e"] > s0 + 0.02:
            end, lo = before[-1]["e"], max(0.0, s0 - window)
            k = (s0 - lo) / (end - lo)
            for w in before:
                for key in ("t", "e"):
                    if w[key] > lo:
                        w[key] = round(lo + (w[key] - lo) * k, 3)
            moved += 1
        if after and after[0]["t"] < s1 - 0.02:
            start, hi = after[0]["t"], s1 + window / 2
            k = (hi - s1) / (hi - start)
            for w in after:
                for key in ("t", "e"):
                    if w[key] < hi:
                        w[key] = round(hi - (hi - w[key]) * k, 3)
            moved += 1
    return moved


if __name__ == "__main__":
    utf8_console()
    reel = ROOT / "reels" / sys.argv[1]
    voice = next((reel / f"voice{x}" for x in (".mp3", ".wav", ".m4a") if (reel / f"voice{x}").exists()), None)
    if not voice:
        sys.exit(f"pas de voice.mp3 / .wav / .m4a dans {reel}")
    text = (reel / "caption.txt").read_text(encoding="utf-8")
    lang = language(reel)
    v2 = False
    scenes, blocks, words = parse(text)
    exact = reel / "voice.alignment.json"
    heard = from_alignment(exact) if exact.exists() else recognise(voice, lang)
    print(f"{len(words)} mots de sous-titre, {len(heard)} entendus ({'horodatage exact' if exact.exists() else f'reconnaissance vocale ({lang}), ±0,1 s'})")
    n_missed = match(words, heard)
    sil, dur = silences(voice)
    if not exact.exists():
        print(f"  {clamp_to_silences(words, sil)} bords de phrase sortis d’un silence")
    for a, b in zip(words, words[1:]):
        if b["t"] < a["t"]:
            sys.exit(f"l’ordre des mots casse entre \"{a['w']}\" et \"{b['w']}\" : le sous-titre et la voix divergent trop")
    out = {"duration": dur, "silences": sil, "scenes": scenes, "blocks": blocks, "words": words}
    (reel / "words.json").write_text(json.dumps({"format": 2, **out} if v2 else out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"écrit {reel / 'words.json'} : {len(scenes)} scènes, {len(blocks)} blocs, {len(sil)} silences, {n_missed} passages à vérifier, {dur} s ({lang})")
