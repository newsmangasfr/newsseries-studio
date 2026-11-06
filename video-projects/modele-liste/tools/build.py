"""Génère index.html (HyperFrames, 1080x1920) à partir des durées réelles de la voix off.
Usage (depuis le dossier du projet) : python3 tools/build.py
"""
import html
import json
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INTRO, OUTRO, HOLD = 2.6, 3.6, 3.0  # intro logo, outro logo, tenue de la fin
LEAD, GAP = INTRO + 0.25, 0.35
BEAT = 60 / 124  # la musique (tools/music.py) joue à 124 BPM dès 0 s : les coupes se posent sur ses temps
VO_DIR = "vo-lucian"  # HeyGen Voice Turbo, voix Lucian (outils/heygen_tts.py)
PANELS = "assets/panels-hd"  # les affiches agrandies x2 par Real-ESRGAN (outils/studiofx.py agrandir)
XF = 0.3  # durée des transitions (chevauchement des plans)


def wav_dur(p):
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


VO = json.load(open(ROOT / "tools" / "vo_long.json", encoding="utf-8"))  # une phrase par anime
SEGS = [(x["id"], x["cap"].replace(" :", ":").replace(" ?", "?")) for x in VO]  # la ponctuation reste collée à son mot

# (segment, mot-clé dans le texte, image, titre affiché, info, couleur d'accent)
ANIME = [
    ("jan", "Shangri-La", "01-shangri-la-frontier", "Shangri-La Frontier", "SAISON 3 · JANVIER", "#8fd3ff"),
    ("jan", "Mashle", "05-mashle", "Mashle", "SAISON 3 · JANVIER", "#c9a7ff"),
    ("jan", "Sakamoto", "11-sakamoto-days", "Sakamoto Days", "SAISON 2 · JANVIER", "#f5ecb0"),
    ("jan", "Medaka", "04-medaka-kuroiwa", "Medaka Kuroiwa", "SAISON 2 · JANVIER", "#6ec1ff"),
    ("jan", "Marriage", "06-marriage-toxin", "Marriage Toxin", "SAISON 2 · JANVIER", "#ff7a7a"),
    ("ete", "One Piece", "14-one-piece-god-valley", "One Piece : God Valley", "FILM · ÉTÉ", "#ffd166"),
    ("oct", "Frieren", "07-frieren", "Frieren", "SAISON 3 · OCTOBRE", "#ffc53d"),
    ("oct", "Delicious", "09-delicious-in-dungeon", "Delicious in Dungeon", "SAISON 2 · OCTOBRE", "#ffa46b"),
    ("films", "Solo", "10-solo-leveling", "Solo Leveling", "FILM · ATTENDU", "#8fb3ff"),
    ("films", "Eminence", "13-eminence-in-shadow", "The Eminence in Shadow", "FILM · DATE À VENIR", "#ffb3c6"),
    ("films", "Haikyu", "16-haikyu", "Haikyu!!", "FILM · DATE À VENIR", "#ffb020"),
    ("films", "Demon", "12-demon-slayer", "Demon Slayer : la Forteresse Infinie", "FILM 2 · RUMEUR", "#ff5a4a"),
    ("tba", "Shield", "02-shield-hero", "The Rising of the Shield Hero", "SAISON 5 · DATE À VENIR", "#7dff8a"),
    ("tba", "Alya", "03-alya", "Alya Sometimes Hides Her Feelings in Russian", "SAISON 2 · DATE À VENIR", "#ffb8c8"),
    ("tba", "World's", "08-worlds-finest-assassin", "The World's Finest Assassin", "SAISON 2 · DATE À VENIR", "#f3e7a6"),
    ("tba", "Lord", "15-lord-of-mysteries", "Lord of Mysteries", "SAISON 2 · DATE À VENIR", "#b9e5d0"),
]
CHAPTER = {
    "jan": ("JANVIER", "2027", "#8fd3ff"),
    "ete": ("ÉTÉ", "2027", "#ffd166"),
    "oct": ("OCTOBRE", "2027", "#ffc53d"),
    "films": ("LES FILMS", "2027", "#ff5a4a"),
    "tba": ("DATE", "À VENIR", "#7dff8a"),
}
HIGHLIGHT = {w.lower() for a in ANIME for w in a[3].replace(":", " ").split() if len(w) > 2 and w.lower() not in {"the", "la", "of", "in", "her", "forteresse", "infinie"}}

# --- minutage des segments ---
seg_t = {}
t = LEAD
for sid, _ in SEGS:
    d = wav_dur(ROOT / "audio" / VO_DIR / f"{sid}.wav")
    seg_t[sid] = (t, d)
    t += d + GAP


VO_END = t - GAP
CTA_END = VO_END + HOLD
TOTAL = round(CTA_END + OUTRO, 3)


def on_beat(t, lo, hi):
    """le temps de la musique le plus proche de t dans [lo, hi], sinon t : une coupe tombe sur le rythme sans
    jamais arriver après le mot qu'elle illustre"""
    k = round(t / BEAT)
    best = min((k - 1, k, k + 1), key=lambda j: abs(j * BEAT - t))
    tb = best * BEAT
    return tb if lo <= tb <= hi else t


def t_in_seg(sid, text, key):
    s, d = seg_t[sid]
    i = text.index(key)
    return s + d * i / len(text)


TXT = dict(SEGS)

# --- liste des plans ---
shots = [{"kind": "logo-in", "start": 0.0}, {"kind": "hook", "start": INTRO - XF}]
prev = None
for x in VO:
    sid = x["id"]
    if x["chap"] in CHAPTER and x["chap"] != prev:
        st = seg_t[sid][0]
        shots.append({"kind": "chapter", "sid": x["chap"], "start": on_beat(st - 0.1, st - 0.35, st + 0.05)})
    prev = x["chap"]
    if "anime" in x:
        a = next(a for a in ANIME if a[1] == x["anime"])
        tn = t_in_seg(sid, TXT[sid], a[1])
        lo = shots[-1]["start"] + 0.9 if shots[-1]["kind"] == "chapter" else tn - 0.45
        shots.append({"kind": "anime", "a": a, "start": max(lo, on_beat(tn - 0.2, tn - 0.45, tn))})
shots.append({"kind": "cta", "start": seg_t["cta"][0] - 0.15})
shots.append({"kind": "logo-out", "start": CTA_END})
for i, s in enumerate(shots):
    nxt = shots[i + 1]["start"] if i + 1 < len(shots) else TOTAL
    s["end"] = nxt
    s["dur"] = round(nxt - s["start"] + (XF if i + 1 < len(shots) else 0), 3)
    s["start"] = round(s["start"], 3)

# --- sous-titres (groupes de 2-3 mots, minutage proportionnel) ---
caps = []
for sid, text in SEGS:
    if sid == "cta":
        continue
    s, d = seg_t[sid]
    words = text.split()
    groups, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 3 or w[-1] in ",.:…?!" or (len(cur) == 2 and len(" ".join(cur)) > 14):
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    pos = 0
    for g in groups:
        chunk = " ".join(g)
        a = s + d * text.index(chunk, pos) / len(text)
        pos = text.index(chunk, pos) + len(chunk)
        b = s + d * pos / len(text)
        caps.append((round(a, 3), round(b, 3), g))
for i in range(len(caps)):
    a, b, g = caps[i]
    nb = caps[i + 1][0] if i + 1 < len(caps) else b + 0.3
    caps[i] = (a, round(min(max(b, a + 0.35), nb) if nb > a else b, 3), g)


def esc(s):
    return html.escape(s, quote=True)


def cap_html(words):
    out = []
    for w in words:
        core = w.strip(",.:…?!").lower()
        cls = "w hl" if core in HIGHLIGHT or core == "2027" else "w"
        out.append(f'<span class="{cls}">{esc(w)}</span>')
    return " ".join(out)


# --- HTML ---
body, js = [], []
for i, s in enumerate(shots):
    sid = f"s{i:02d}"
    z = 10 + i
    attrs = f'id="{sid}" class="clip shot" data-start="{s["start"]}" data-duration="{s["dur"]}" data-track-index="{1 + i % 2}" style="z-index:{z}"'
    st = s["start"]
    if s["kind"] == "hook":
        body.append(f'''<div {attrs}>
  <div class="hook-bg"><img src="assets/source.jpg" alt=""></div>
  <div class="hook-shade"></div>
  <div class="hook-content">
    <div class="hook-kicker"><span class="cnt">16</span> ANIMES</div>
    <div class="hook-one">UNE SEULE ANNÉE</div>
    <div class="hook-year">{"".join(f'<span class="d">{c}</span>' for c in "2027")}</div>
    <div class="hook-sub">COMPLÈTEMENT FOLLE</div>
  </div>
</div>''')
        js += [
            f'tl.from("#{sid}", {{ scale: 1.6, opacity: 0, duration: {XF}, ease: "power3.out" }}, {st});',
            f'tl.fromTo("#{sid} .hook-bg img", {{ y: 0, scale: 1.08 }}, {{ y: -260, scale: 1.0, duration: {s["dur"]}, ease: "none" }}, {st});',
            f'tl.from("#{sid} .hook-kicker", {{ scale: 2.2, opacity: 0, duration: 0.35, ease: "expo.out" }}, {st + 0.1});',
            f'(function () {{ var o = {{ v: 0 }}, el = document.querySelector("#{sid} .cnt"); tl.fromTo(o, {{ v: 0 }}, {{ v: 16, duration: 0.9, ease: "power2.out", onUpdate: function () {{ el.textContent = Math.round(o.v); }} }}, {st + 0.15}); }})();',
            f'tl.from("#{sid} .hook-one", {{ x: -500, opacity: 0, duration: 0.4, ease: "power4.out" }}, {t_in_seg("hook", TXT["hook"], "Une") - 0.1});',
            f'tl.from("#{sid} .hook-year .d", {{ scale: 2.6, opacity: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.07 }}, {t_in_seg("hook", TXT["hook"], "2027") - 0.15});',
            f'tl.from("#{sid} .hook-sub", {{ y: 50, opacity: 0, duration: 0.45, ease: "back.out(1.8)" }}, {t_in_seg("hook", TXT["hook"], "folle") - 0.4});',
            f'tl.fromTo("#{sid} .hook-year", {{ scale: 1 }}, {{ scale: 1.06, duration: 0.24, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }}, {t_in_seg("hook", TXT["hook"], "folle")});',
        ]
    elif s["kind"] == "chapter":
        big, small, col = CHAPTER[s["sid"]]
        body.append(f'''<div {attrs}>
  <div class="ch-glow" style="background: radial-gradient(circle at 50% 45%, {col}55 0%, #07070c00 60%)"></div>
  <div class="ch-content">
    <div class="ch-line" style="background:{col}"></div>
    <div class="ch-big">{esc(big)}</div>
    <div class="ch-small" style="-webkit-text-stroke: 4px {col}">{esc(small)}</div>
  </div>
</div>''')
        js += [
            f'tl.from("#{sid}", {{ xPercent: 100, duration: {XF}, ease: "power4.out" }}, {st});',
            f'tl.from("#{sid} .ch-line", {{ scaleX: 0, duration: 0.5, ease: "expo.out" }}, {st + 0.1});',
            f'tl.from("#{sid} .ch-big", {{ y: 120, opacity: 0, duration: 0.5, ease: "power4.out" }}, {st + 0.12});',
            f'tl.from("#{sid} .ch-small", {{ scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(1.8)" }}, {st + 0.25});',
            f'tl.fromTo("#{sid} .ch-glow", {{ scale: 0.8 }}, {{ scale: 1.2, duration: {s["dur"]}, ease: "sine.out" }}, {st});',
        ]
    elif s["kind"] == "anime":
        _, _, img, title, info, col = s["a"]
        words = "".join(f'<span class="tw">{esc(w)}</span> ' for w in title.split())
        size = 104 if len(title) <= 14 else 88 if len(title) <= 24 else 70
        body.append(f'''<div {attrs}>
  <div class="an-bg"><img src="{PANELS}/{img}.jpg" alt=""></div>
  <div class="an-shade"></div>
  <div class="an-content">
    <div class="an-tag" style="color:{col}; border-color:{col}">2027</div>
    <div class="an-card" style="box-shadow: 0 30px 90px #000c, 0 0 0 4px {col}aa"><img src="{PANELS}/{img}.jpg" alt=""></div>
    <div class="an-title" style="font-size:{size}px">{words}</div>
    <div class="an-info" style="background:{col}">{esc(info)}</div>
  </div>
</div>''')
        js += [
            f'tl.from("#{sid}", {{ xPercent: 100, duration: {XF}, ease: "power4.out" }}, {st});',
            f'tl.fromTo("#{sid} .an-bg img", {{ scale: 1.5 }}, {{ scale: 1.25, duration: {s["dur"]}, ease: "none" }}, {st});',
            f'tl.from("#{sid} .an-tag", {{ y: -40, opacity: 0, duration: 0.4, ease: "power3.out" }}, {st + 0.1});',
            f'tl.from("#{sid} .an-card", {{ y: 140, rotationX: 35, scale: 0.85, opacity: 0, duration: 0.55, ease: "back.out(1.4)" }}, {st + 0.08});',
            f'tl.fromTo("#{sid} .an-card img", {{ scale: 1.0 }}, {{ scale: 1.08, duration: {s["dur"]}, ease: "sine.inOut" }}, {st});',
            f'tl.from("#{sid} .an-title .tw", {{ y: 60, opacity: 0, duration: 0.4, ease: "expo.out", stagger: 0.06 }}, {st + 0.2});',
            f'tl.from("#{sid} .an-info", {{ scale: 0.5, opacity: 0, duration: 0.5, ease: "elastic.out(1, 0.6)" }}, {st + 0.35});',
        ]
    elif s["kind"] == "cta":
        order = ["01-shangri-la-frontier", "02-shield-hero", "03-alya", "04-medaka-kuroiwa", "05-mashle", "06-marriage-toxin", "07-frieren", "08-worlds-finest-assassin", "09-delicious-in-dungeon", "10-solo-leveling", "11-sakamoto-days", "12-demon-slayer", "13-eminence-in-shadow", "14-one-piece-god-valley", "15-lord-of-mysteries", "16-haikyu"]
        cells = "".join(f'<div class="cell"><img src="{PANELS}/{o}.jpg" alt=""></div>' for o in order)
        body.append(f'''<div {attrs}>
  <div class="cta-content">
    <div class="cta-q">LEQUEL TU ATTENDS LE PLUS ?</div>
    <div class="cta-grid">{cells}</div>
    <div class="cta-c">Dis-le en commentaire <span class="arrow">↓</span></div>
    <div class="cta-credit">Visuels : @animespiritnews</div>
  </div>
</div>''')
        js += [
            f'tl.from("#{sid}", {{ xPercent: 100, duration: {XF}, ease: "power4.out" }}, {st});',
            f'tl.from("#{sid} .cta-q", {{ y: -80, opacity: 0, duration: 0.6, ease: "expo.out" }}, {st + 0.15});',
            f'tl.from("#{sid} .cell", {{ scale: 0.4, opacity: 0, duration: 0.45, ease: "back.out(1.7)", stagger: {{ each: 0.05, from: "center" }} }}, {st + 0.2});',
            f'tl.from("#{sid} .cta-c", {{ y: 60, opacity: 0, duration: 0.5, ease: "power3.out" }}, {st + 1.2});',
            f'tl.to("#{sid} .arrow", {{ y: 18, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 13 }}, {st + 1.6});',
            f'tl.from("#{sid} .cta-credit", {{ opacity: 0, duration: 0.6, ease: "sine.out" }}, {st + 1.8});',
        ]

    elif s["kind"] in ("logo-in", "logo-out"):
        rays = "".join(f'<div class="ray" style="transform: rotate({i * 360 / 18 + (7 if i % 2 else 0):.1f}deg)"><div class="ray-in" style="width:{520 + (i * 137) % 260}px"></div></div>' for i in range(18))
        if s["kind"] == "logo-in":
            line = '<div class="lg-line">L\'ACTU SÉRIES</div>'
        else:
            line = '<div class="lg-line">ABONNE-TOI POUR PLUS D\'ACTUS</div><div class="lg-site">newsseries.fr</div>'
        body.append(f'''<div {attrs}>
  <div class="lg-glow"></div>
  <div class="lg-rays">{rays}</div>
  <div class="lg-ring"></div>
  <div class="lg-content">
    <div class="lg-logo"><img src="assets/brand/logo.png" alt="NewsSeries"></div>
    {line}
  </div>
</div>''')
        imp = st + (0.5 if s["kind"] == "logo-in" else 0.75)  # instant de l'impact
        if s["kind"] == "logo-in":
            js.append(f'tl.from("#{sid} .lg-logo", {{ scale: 3.2, rotation: -14, opacity: 0, duration: 0.5, ease: "expo.in" }}, {st});')
        else:
            js += [f'tl.from("#{sid}", {{ yPercent: -100, duration: {XF}, ease: "power4.out" }}, {st});',
                   f'tl.from("#{sid} .lg-logo", {{ y: -1300, rotation: 10, duration: 0.75, ease: "bounce.out" }}, {st});']
        js += [
            f'tl.fromTo("#{sid} .lg-glow", {{ scale: 0.3, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.5, ease: "expo.out", immediateRender: false }}, {imp});',
            f'tl.to("#{sid} .lg-glow", {{ scale: 1.12, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: {int((s["dur"] - 1.2) / 0.5)} }}, {imp + 0.5});',
            f'tl.from("#{sid} .ray-in", {{ scaleX: 0, opacity: 0, duration: 0.45, ease: "expo.out", stagger: 0.012 }}, {imp});',
            f'tl.to("#{sid} .lg-rays", {{ rotation: 25, duration: {s["dur"]}, ease: "none" }}, {st});',
            f'tl.fromTo("#{sid} .lg-ring", {{ scale: 0.2, opacity: 1 }}, {{ scale: 3, opacity: 0, duration: 0.7, ease: "power2.out", immediateRender: false }}, {imp});',
            f'tl.fromTo("#{sid} .lg-logo", {{ x: 0 }}, {{ x: 14, duration: 0.04, ease: "none", yoyo: true, repeat: 5 }}, {imp});',
            f'tl.fromTo("#flash2", {{ opacity: 0.8 }}, {{ opacity: 0, duration: 0.35, ease: "power2.out", immediateRender: false }}, {imp});',
            f'tl.to("#{sid} .lg-logo img", {{ scale: 1.04, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: {max(1, int((s["dur"] - 1.0) / 0.6))} }}, {imp + 0.3});',
            f'tl.from("#{sid} .lg-line, #{sid} .lg-site", {{ y: 60, opacity: 0, duration: 0.5, ease: "back.out(1.6)", stagger: 0.15 }}, {imp + 0.35});',
        ]
        if s["kind"] == "logo-out":
            js.append(f'tl.to("#{sid} .lg-content, #{sid} .lg-rays, #{sid} .lg-glow", {{ opacity: 0, duration: 0.6, ease: "power2.in" }}, {round(TOTAL - 0.6, 3)});')

# flash blanc à chaque transition
flash_times = [s["start"] for s in shots[1:]]
SFX = [[round(s["start"], 3), "whoosh-short-low", 0.35] for s in shots[2:]]
for i, s in enumerate(shots):
    if s["kind"] == "anime":
        SFX.append([round(s["start"] + 0.35, 3), "pop-mid", 0.25])
        k0, k1 = int(s["start"] / BEAT) + 2, int((s["start"] + s["dur"] - XF) / BEAT)
        for k in range(k0, k1 + 1, 2):
            js.append(f'tl.fromTo("#s{i:02d} .an-card", {{ scale: 1.035 }}, {{ scale: 1, duration: 0.22, ease: "power2.out", immediateRender: false }}, {round(k * BEAT, 3)});')
SFX.append([round(t_in_seg("hook", TXT["hook"], "2027") - 0.05, 3), "hit", 0.45])
js.append(f'tl.fromTo("#progress", {{ scaleX: 0 }}, {{ scaleX: 1, duration: {TOTAL}, ease: "none" }}, 0);')
js.append(f'[{",".join(str(x) for x in flash_times)}].forEach(function (ft) {{ tl.fromTo("#flash", {{ opacity: 0.55 }}, {{ opacity: 0, duration: 0.25, ease: "power2.out", immediateRender: false }}, ft); }});')

cap_divs = []
for i, (a, b, g) in enumerate(caps):
    cid = f"c{i:03d}"
    cap_divs.append(f'<div id="{cid}" class="clip cap" data-start="{a}" data-duration="{round(b - a, 3)}" data-track-index="{20 + i % 2}"><div class="cap-in">{cap_html(g)}</div></div>')
    js.append(f'tl.from("#{cid} .cap-in", {{ scale: 0.75, y: 20, opacity: 0, duration: 0.16, ease: "back.out(2.5)" }}, {a});')

CSS = (ROOT / "tools" / "style.css").read_text()
doc = f'''<!doctype html>
<html lang="fr" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
{CSS}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
      <div id="ground" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="0"></div>
{chr(10).join(body)}
{chr(10).join(cap_divs)}
      <div id="flash" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="40"></div>
      <div id="progress" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="42"></div>
      <div id="flash2" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="41"></div>
      <audio id="mix" data-start="0" data-duration="{TOTAL}" data-track-index="50" src="audio/mix.wav" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      {(chr(10) + "      ").join(js)}
      tl.to({{}}, {{ duration: {TOTAL} }}, 0);
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
'''
(ROOT / "index.html").write_text(doc)
json.dump({"sfx": SFX, "total": TOTAL, "lead": LEAD, "gap": GAP, "vo_dir": VO_DIR, "segments": seg_t, "shots": [{k: v for k, v in s.items() if k != "a"} | ({"anime": s["a"][3]} if "a" in s else {}) for s in shots]}, open(ROOT / "tools" / "timing.json", "w"), ensure_ascii=False, indent=1)
print(f"{len(shots)} plans, {len(caps)} sous-titres, durée {TOTAL}s")
