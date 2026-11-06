#!/usr/bin/env python3
"""Cap the pauses in a take without touching a word: voice.mp3 + voice.alignment.json, in place.

usage: tighten.py <slug> [--cap 0.30] [--min 0.45] [--keep "Ebola:0.40,Then comes:0.45"] [--margin 0.06]

Every silence longer than the cap (ffmpeg silencedetect, -40 dB, 0.2 s) keeps its first and last half-cap and loses
the middle; the tail pad at the end of the file is left alone. `--keep word:seconds` holds the pause right before that
word or phrase at its own length (a pause written on purpose, or a scene change), lengthening it, or inserting
it where the take ran straight through. The character times are shifted by exactly what
was removed before them, so align.py afterwards is exact. `--margin s` (v3 takes): every cut is placed inside the
silence measured in the audio (-45 dB), never closer than s to the sound on either side; forced-alignment times can sit
100 ms inside a soft onset ("One:", "None"), so without it a paragraph breath can eat the first letters of a word. The untouched take is kept as voice.raw.mp3 and
voice.alignment.raw.json; running this again starts from those.
"""
import json, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def silences(mp3, db=-40, d=0.2):
    out = subprocess.run(["ffmpeg", "-i", str(mp3), "-af", f"silencedetect=n={db}dB:d={d}", "-f", "null", "-"], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(starts, ends))


def duration(mp3):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)], capture_output=True, text=True).stdout)


if __name__ == "__main__":
    reel = ROOT / "reels" / sys.argv[1]
    cap = float(sys.argv[sys.argv.index("--cap") + 1]) if "--cap" in sys.argv else 0.30
    floor = float(sys.argv[sys.argv.index("--min") + 1]) if "--min" in sys.argv else cap  # only pauses longer than this are touched
    margin = float(sys.argv[sys.argv.index("--margin") + 1]) if "--margin" in sys.argv else None
    keep = dict(re.findall(r"\s*(.+?):([\d.]+)(?:,|$)", sys.argv[sys.argv.index("--keep") + 1])) if "--keep" in sys.argv else {}  # a phrase may hold a comma ("Then, live:0.30")
    raw, raw_al = reel / "voice.raw.mp3", reel / "voice.alignment.raw.json"
    if not raw.exists():
        if not (reel / "voice.alignment.json").exists():
            # A take that did not come from ElevenLabs (the creator's own voice, OpenAI, Fish) has no character times:
            # make them from speech recognition, word by word, spread evenly over each heard word.
            sys.path.insert(0, str(ROOT / "scripts"))
            import numpy  # noqa: F401  align.py needs it, and py.mjs installs what this file imports
            from align import recognise
            from where import language
            chars_, st_, en_ = [], [], []
            for w, a, z in recognise(reel / "voice.mp3", language(reel)):
                if chars_:
                    chars_.append(" "); st_.append(en_[-1]); en_.append(a)
                step = (z - a) / max(len(w), 1)
                for k, ch in enumerate(w):
                    chars_.append(ch); st_.append(a + k * step); en_.append(a + (k + 1) * step)
            (reel / "voice.alignment.json").write_text(json.dumps({"alignment": {"characters": chars_,
                "character_start_times_seconds": st_, "character_end_times_seconds": en_}}, ensure_ascii=False), encoding="utf-8")
        shutil.copy(reel / "voice.mp3", raw)
        shutil.copy(reel / "voice.alignment.json", raw_al)
    doc = json.loads(raw_al.read_text(encoding="utf-8"))
    al = doc["alignment"]
    chars = "".join(al["characters"])
    total = duration(raw)
    # eleven_v3's own character times run straight through pauses: a v3 take is timed by forced alignment instead
    sys.path.insert(0, str(ROOT / "scripts"))
    from voice import force_align
    from where import utf8_console
    utf8_console()
    v3 = doc.get("voice", {}).get("model") == "eleven_v3"
    text = re.sub(r"\n{2,}", "\n\n", (reel / "script.txt").read_text(encoding="utf-8").strip())
    if v3:
        al = doc["alignment"] = force_align(raw, text)
        chars = "".join(al["characters"])
    # the pauses written on purpose, placed by the first character of the phrase. A phrase typed with a straight
    # apostrophe finds the script's curly one (and the other way round); a phrase not in the take stops here, because
    # find() returning -1 would hold the pause at the last character of the take without a word.
    def place(phrase):
        for p in (phrase, phrase.replace("'", "’"), phrase.replace("’", "'")):
            if chars.find(p) >= 0:
                return chars.find(p)
        sys.exit(f"--keep \"{phrase}\" : cette phrase n’est pas dans la prise. Copie ses premiers mots depuis script.txt")
    held = {phrase: (al["character_start_times_seconds"][place(phrase)], float(sec)) for phrase, sec in keep.items()}

    cuts, adds = [], []  # removed (from, to) and inserted (at, seconds), in raw time
    if v3:
        # v3 voices breathe between sentences and a breath reads as sound to an energy detector: the pauses are the
        # gaps between words in the forced alignment. At a held pause the whole gap is replaced by clean silence.
        st, en = al["character_start_times_seconds"], al["character_end_times_seconds"]
        hook_end = chars.find("\n\n") if "\n\n" in chars else 0
        sil = []
        for k in range(1, len(chars)):
            if chars[k].isspace() or not chars[k - 1].isspace():
                continue
            p = k - 1
            while p > 0 and chars[p].isspace():
                p -= 1
            # the hook (first paragraph) is never cut, and neither is a gap beside a number: the alignment is made
            # against digits ("700") while the voice says words ("seven hundred"), so its timing there is unreliable
            near = chars[max(0, chars.rfind(" ", 0, p) + 1):chars.find(" ", k) if chars.find(" ", k) > 0 else len(chars)]
            if k < hook_end or any(ch.isdigit() for ch in near):
                continue
            if p > 0 and st[k] - en[p] > 0.12:
                sil.append((en[p], st[k]))
        quiet, used = (silences(raw, -45, 0.05) if margin is not None else []), set()
        for a, b in sil:
            sec = next((sec for t, sec in held.values() if abs(b - t) < 0.05), None)
            if margin is not None:  # the measured silence that overlaps this gap most, the cut kept inside it
                x, y = max(quiet, key=lambda q: min(b, q[1]) - max(a, q[0]), default=(a, a))
                if min(b, y) - max(a, x) <= 0 or (x, y) in used:  # one cut per silence
                    continue
                used.add((x, y))
                if sec is not None:
                    if y - x > 2 * margin:
                        cuts.append((x + margin, y - margin))
                    adds.append(((x + margin) if y - x > 2 * margin else (x + y) / 2, max(0.0, sec - min(y - x, 2 * margin))))
                elif y - x > max(floor, cap, 2 * margin):
                    keep_side = max(cap / 2, margin)
                    cuts.append((x + keep_side, y - keep_side))
                continue
            if sec is not None:
                cuts.append((a + 0.02, b - 0.02))
                adds.append((b - 0.02, sec))
            elif b - a > floor:
                cuts.append((a + cap / 2, b - cap / 2))
        held = {}  # already placed
        sil = []
    else:
        sil = [(a, b) for a, b in silences(raw) if a > 0.05 and b < total - 0.05]  # the lead-in and the tail pad are left alone
    for a, b in sil:
        c = next((sec for t, sec in held.values() if abs(b - t) < 0.35), cap)
        if b - a > max(c, floor if c == cap else c):
            cuts.append((a + c / 2, b - c / 2))
        elif c > cap:
            adds.append(((a + b) / 2, c - (b - a)))
    for t, sec in held.values():  # a pause held on purpose where the take has none: insert it just before the phrase
        if not any(abs(b - t) < 0.35 for _, b in sil):
            adds.append((t - 0.01, sec))

    def shift(t):
        return t - sum(min(b, max(a, t)) - a for a, b in cuts) + sum(d for at, d in adds if at <= t)

    edges = sorted([(a, "cut", b) for a, b in cuts] + [(at, "add", d) for at, d in adds])
    keepseg, last = [], 0.0
    for at, kind, x in edges:
        keepseg.append((last, at))
        if kind == "add":
            keepseg.append(("gap", x))
            last = at
        else:
            last = x
    keepseg.append((last, total))
    keepseg = [(a, b) for a, b in keepseg if a == "gap" or b - a > 0.001]
    parts = "".join(
        f"anullsrc=r=44100:cl=mono,atrim=0:{b:.4f},asetpts=PTS-STARTPTS[s{i}];" if a == "gap" else f"[0:a]atrim={a:.4f}:{b:.4f},aformat=channel_layouts=mono,asetpts=PTS-STARTPTS,afade=t=in:d=0.008,areverse,afade=t=in:d=0.008,areverse[s{i}];"
        for i, (a, b) in enumerate(keepseg))
    graph = parts + "".join(f"[s{i}]" for i in range(len(keepseg))) + f"concat=n={len(keepseg)}:v=0:a=1[out]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-filter_complex", graph, "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "192k", str(reel / "voice.mp3")], check=True)

    if v3:
        doc["alignment"] = force_align(reel / "voice.mp3", text)
    else:
        for k in ("character_start_times_seconds", "character_end_times_seconds"):
            al[k] = [round(shift(t), 4) for t in al[k]]
    doc["tightened"] = {"cap": cap, "keep": keep, "removed": round(sum(b - a for a, b in cuts), 3), "cuts": len(cuts), "inserted": [[round(a, 3), round(d, 3)] for a, d in adds]}
    (reel / "voice.alignment.json").write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")
    print(f"{reel.name} : {total:.2f} s -> {duration(reel / 'voice.mp3'):.2f} s, {len(cuts)} pauses ramenées à {cap} s, {doc['tightened']['removed']} s retirées, {len(adds)} pauses tenues allongées ou insérées")
