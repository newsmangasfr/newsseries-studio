#!/usr/bin/env python3
"""The mechanical review. Each check is a defect measured on the reference reels; it fails here so he never sees it.

  check.py plan <slug>            before any pixel: caption, blocks, scene boundaries, type sizes in the scenes
  check.py render <slug> <mp4>    after a render: dead holds and bare ground inside a handover
A format-2 reel (words.json "format": 2) is checked by check2.py instead.

Exit code 1 if anything is marked FAIL. WARN is a judgement call: read it, decide, move on.
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
from where import language, spoken, utf8_console, word_count

ROOT = Path(__file__).resolve().parent.parent
MIN_TYPE = 32       # px at 1080 wide: below this a claim is texture on a phone
MAX_BLOCK_WORDS = 8
MIN_SILENCE = 0.15  # s: a scene can only hand over in a real gap between sentences
MAX_STILL = 1.2     # s with nothing moving, caption included
PACE = (3.3, 3.5)   # words a second, the creator's touchscreen pace (2026-10-21), measured in English
# Words are counted the same way in every language: a French elision ("l’écran", "c’est") is two words, as its English
# twin ("the screen", "it is") is. The target stays 3.3 to 3.5 until a French take of the house voice measures otherwise;
# a language with its own measured pace gets its own line here, never a wider band for English.
PACES = {"en": PACE}
fails = 0


def say(level, msg):
    global fails
    fails += level == "FAIL"
    print(f"{level:4}  {msg}")


def pace(reel, d):
    """his voice rule (2026-10-21, touchscreen): 3.3 to 3.5 words a second, a 0.30 s breath at each paragraph start,
    every other pause 0.2 s. Paragraph starts come from the blank lines of script.txt."""
    words, dur = d["words"], d["duration"]
    lang = language(reel)
    lo, hi = PACES.get(lang, PACE)
    rate = word_count([w["w"] for w in words], lang) / dur
    ok = lo <= round(rate, 1) <= hi
    say("ok" if ok else "FAIL", f"rythme {rate:.2f} mots par seconde sur {dur:.1f} s ({lang})"
        + ("" if ok else f" : la cible est {lo} à {hi}. Des balises plus rapides et des virgules dans le script,"
           " ou un seul atempo uniforme sur la prise BRUTE avant tighten.py (full-visual references/voice.md, « Rythme »)"))
    script = reel / "script.txt"
    if not script.exists():
        return
    starts, n = set(), 0
    for para in re.split(r"\n\s*\n", script.read_text(encoding="utf-8").strip()):
        starts.add(n)
        n += sum(1 for t in para.split() if spoken(t))
    if n != len(words):
        say("WARN", f"script.txt a {n} mots, words.json {len(words)} : respirations de paragraphe non vérifiées")
        return
    for a, b in d["silences"]:
        nxt = next((i for i, x in enumerate(words) if x["t"] >= b - 0.06), None)
        if nxt is None or nxt < d["scenes"][1]["firstWord"] or b - a <= 0.25:  # the hook is never trimmed
            continue
        if nxt in starts and nxt > 1:
            if b - a > 0.45:
                say("WARN", f"respiration avant \"{words[nxt]['w']}\" à {a:.2f} s : {b - a:.2f} s, la respiration de paragraphe fait 0,30 s")
        else:
            say("WARN", f"pause avant \"{words[nxt]['w']}\" à {a:.2f} s : {b - a:.2f} s dans un paragraphe, toute pause hors respiration de paragraphe fait 0,2 s")


def plan(slug):
    reel = ROOT / "reels" / slug
    d = json.loads((reel / "words.json").read_text(encoding="utf-8"))
    words, blocks, scenes = d["words"], d["blocks"], d["scenes"]

    for a, b in zip(words, words[1:]):
        if b["t"] - a["t"] < 0.03:
            say("WARN", f"\"{a['w']}\" et \"{b['w']}\" commencent à {b['t'] - a['t']:.2f} s d’écart : vérifie l’alignement à cet endroit")
    since_key = 0
    for i, b in enumerate(blocks):
        text = " ".join(words[w]["w"] for w in b["words"])
        keys = sum(1 for w in b["words"] if words[w].get("key"))
        emoji = sum(1 for w in b["words"] if words[w].get("emoji"))
        if len(b["words"]) > MAX_BLOCK_WORDS:
            say("FAIL", f"le bloc {i} a {len(b['words'])} mots (\"{text}\") : {MAX_BLOCK_WORDS} au plus")
        if keys > 1:
            say("FAIL", f"le bloc {i} marque {keys} mots clés (\"{text}\") : un par bloc, sinon la marque ne veut plus rien dire")
        if emoji > 1:
            say("FAIL", f"le bloc {i} a {emoji} emoji (\"{text}\") : un par bloc")
        since_key = 0 if keys else since_key + 1
        if since_key == 3:
            say("WARN", f"trois blocs de suite sans mot clé, jusqu’à \"{text}\" : chaque nombre, nom et verbe d’obligation en reçoit un")

    for s, nxt in zip(scenes, scenes[1:]):
        a, b = words[nxt["firstWord"] - 1]["e"], words[nxt["firstWord"]]["t"]
        gap = max((min(b, y) - max(a, x) for x, y in d["silences"]), default=0)
        level = "FAIL" if gap < MIN_SILENCE else "ok"
        say(level, f"scène \"{s['id']}\" -> \"{nxt['id']}\" passe la main à {(a + b) / 2:.2f} s dans {max(gap, 0):.2f} s de silence"
            + ("" if level == "ok" else f" : il en faut {MIN_SILENCE} s. Commence la scène à une frontière de phrase"))

    pace(reel, d)

    scene_dir = reel / "scenes"
    known = {s["id"] for s in scenes}
    index = (scene_dir / "index.tsx").read_text(encoding="utf-8") if (scene_dir / "index.tsx").exists() else ""
    for sid in sorted(known):
        if not re.search(rf"\b{re.escape(sid)}\s*:", index):
            say("WARN", f"la scène \"{sid}\" n’a pas encore de composant dans scenes/index.tsx : elle sortira en sous-titre sur fond nu")
    for tsx in sorted(scene_dir.glob("*.tsx")):
        for n, line in enumerate(tsx.read_text(encoding="utf-8").splitlines(), 1):
            for size in re.findall(r"fontSize:\s*(\d+)", line):
                if int(size) < MIN_TYPE and "texture" not in line:
                    say("WARN", f"{tsx.name}:{n} texte à {size} px : sous {MIN_TYPE} px personne ne le lit sur un téléphone. Agrandis-le, ou termine la ligne par // texture")
    print(f"plan : {len(scenes)} scènes, {len(blocks)} blocs, {len(words)} mots, {d['duration']} s")


def frames(mp4, w=90, h=160, fps=30):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-vf", f"fps={fps},scale={w}:{h},format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.int16), fps


def render(slug, mp4):
    d = json.loads((ROOT / "reels" / slug / "words.json").read_text(encoding="utf-8"))
    a, fps = frames(mp4)
    diff = np.abs(a[1:] - a[:-1]).mean(axis=(1, 2))
    still, start, worst = diff < 0.12, None, (0.0, 0.0)
    for i, q in enumerate(list(still) + [False]):
        if q and start is None:
            start = i
        elif not q and start is not None:
            if (i - start) / fps > worst[0] and i < len(diff) - 2:  # the last frame may hold
                worst = ((i - start) / fps, start / fps)
            start = None
    say("FAIL" if worst[0] > MAX_STILL else "ok", f"plus long passage sans mouvement : {worst[0]:.2f} s à {worst[1]:.2f} s (limite {MAX_STILL} s)")

    # bare ground inside a handover: the stage band is flat for more than 2 frames
    stage = a[:, int(160 * 520 / 1920):int(160 * 1450 / 1920), :]
    for s, nxt in zip(d["scenes"], d["scenes"][1:]):
        mid = (d["words"][nxt["firstWord"] - 1]["e"] + d["words"][nxt["firstWord"]]["t"]) / 2
        lo, hi = max(0, int((mid - 0.4) * fps)), min(len(stage), int((mid + 0.4) * fps))
        bare = [i for i in range(lo, hi) if stage[i].std() < 2.0]
        run = max((len(g) for g in np.split(bare, np.where(np.diff(bare) != 1)[0] + 1)), default=0) if bare else 0
        say("FAIL" if run > 1 else "ok", f"passage vers \"{nxt['id']}\" à {mid:.2f} s : {run} images nues à 30 i/s (plus d’une se voit comme une image perdue)")


def is_v2(slug):
    f = ROOT / "reels" / slug / "words.json"
    return f.exists() and json.loads(f.read_text(encoding="utf-8")).get("format") == 2


if __name__ == "__main__":
    utf8_console()
    if len(sys.argv) >= 3 and sys.argv[1] == "plan":
        plan(sys.argv[2])
    elif len(sys.argv) >= 4 and sys.argv[1] == "render":
        render(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__)
    sys.exit(1 if fails else 0)
