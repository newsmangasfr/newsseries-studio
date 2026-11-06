"""Short TikTok « Mashle : Magie et Muscles, le film live » (HyperFrames, 1080x1920).
Génère index.html et tools/timing.json à partir des durées réelles de la voix off (audio/vo/*.wav).
Usage (depuis le dossier du projet) : python3 tools/build.py
"""
import html
import json
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INTRO, OUTRO, HOLD = 2.6, 3.4, 1.6
LEAD, GAP = INTRO + 0.2, 0.3
BEAT = 60 / 124
XF = 0.3
GOLD = "#e9c46a"
VO = json.load(open(ROOT / "tools" / "vo.json", encoding="utf-8"))
SEGS = [(x["id"], x["cap"].replace(" :", ":").replace(" ?", "?").replace(" !", "!").replace("« ", "«").replace(" »", "»")) for x in VO]
TXT = dict(SEGS)
HIGHLIGHT = {"mashle", "mash", "officiel", "cinéma", "live", "19", "mars", "2027", "japon", "haltère", "emblème", "doré", "mystère", "réelle", "muscles", "magie"}


def wav_dur(p):
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


seg_t, t = {}, LEAD
for sid, _ in SEGS:
    d = wav_dur(ROOT / "audio" / "vo" / f"{sid}.wav")
    seg_t[sid] = (t, d)
    t += d + GAP
VO_END = t - GAP
CTA_END = VO_END + HOLD
TOTAL = round(CTA_END + OUTRO, 3)


def at(sid, key):
    s, d = seg_t[sid]
    txt = TXT[sid]
    return s + d * txt.index(key) / len(txt)


def on_beat(t, lo, hi):
    k = round(t / BEAT)
    tb = min((k - 1, k, k + 1), key=lambda j: abs(j * BEAT - t)) * BEAT
    return tb if lo <= tb <= hi else t


# --- plans : un par phrase, coupe calée sur le temps de musique le plus proche ---
shots = [{"kind": "logo-in", "start": 0.0}]
for sid, _ in SEGS:
    st = seg_t[sid][0]
    shots.append({"kind": sid, "start": st - 0.25 if sid == "hook" else on_beat(st - 0.12, st - 0.35, st + 0.05)})
shots.append({"kind": "logo-out", "start": CTA_END})
for i, s in enumerate(shots):
    nxt = shots[i + 1]["start"] if i + 1 < len(shots) else TOTAL
    s["dur"] = round(nxt - s["start"] + (XF if i + 1 < len(shots) else 0), 3)
    s["start"] = round(s["start"], 3)

# --- sous-titres (2-3 mots) ; pas de sous-titres sur le slogan (la carte citation les remplace) ni sur la fin ---
caps = []
for sid, text in SEGS:
    if sid in ("slogan", "cta"):
        continue
    s, d = seg_t[sid]
    groups, cur = [], []
    for w in text.split():
        cur.append(w)
        if len(cur) >= 3 or w[-1] in ",.:…?!" or (len(cur) == 2 and len(" ".join(cur)) > 14):
            groups.append(cur); cur = []
    if cur:
        groups.append(cur)
    pos = 0
    for g in groups:
        chunk = " ".join(g)
        i0 = text.index(chunk, pos)
        pos = i0 + len(chunk)
        caps.append([round(s + d * i0 / len(text), 3), round(s + d * pos / len(text), 3), g])
for i in range(len(caps)):
    a, b, g = caps[i]
    nb = caps[i + 1][0] if i + 1 < len(caps) else b + 0.3
    caps[i][1] = round(min(max(b, a + 0.35), nb) if nb > a else b, 3)


def esc(s):
    return html.escape(s, quote=True)


def cap_html(words):
    return " ".join(f'<span class="w{" hl" if w.strip(",.:…?!«»").lower() in HIGHLIGHT else ""}">{esc(w)}</span>' for w in words)


body, js, sfx = [], [], []
for i, s in enumerate(shots):
    sid, k, st, du = f"s{i:02d}", s["kind"], s["start"], s["dur"]
    attrs = f'id="{sid}" class="clip shot" data-start="{st}" data-duration="{du}" data-track-index="{1 + i % 2}" style="z-index:{10 + i}"'
    enter = f'tl.from("#{sid}", {{ xPercent: 100, duration: {XF}, ease: "power4.out" }}, {st});'
    if k == "hook":
        body.append(f'''<div {attrs}>
  <div class="bg-poster"><img src="assets/src/poster.jpg" alt=""></div>
  <div class="shade"></div>
  <div class="hk">
    <div class="stamp">C'EST OFFICIEL</div>
    <div class="gold-title">{"".join(f'<span class="l">{c}</span>' for c in "MASHLE")}</div>
    <div class="hk-sub">MAGIE ET MUSCLES</div>
    <div class="hk-film"><span>LE FILM</span> <span class="live">LIVE</span></div>
  </div>
</div>''')
        js += [
            f'tl.from("#{sid}", {{ scale: 1.5, opacity: 0, duration: {XF}, ease: "power3.out" }}, {st});',
            f'tl.fromTo("#{sid} .bg-poster img", {{ scale: 1.25 }}, {{ scale: 1.05, duration: {du}, ease: "none" }}, {st});',
            f'tl.from("#{sid} .stamp", {{ scale: 3, rotation: -18, opacity: 0, duration: 0.35, ease: "expo.in" }}, {st + 0.05});',
            f'tl.from("#{sid} .gold-title .l", {{ y: 120, opacity: 0, duration: 0.45, ease: "back.out(2)", stagger: 0.06 }}, {at("hook", "Mashle") - 0.1});',
            f'tl.from("#{sid} .hk-sub", {{ scaleX: 1.6, opacity: 0, duration: 0.6, ease: "expo.out" }}, {at("hook", "Mashle") + 0.35});',
            f'tl.from("#{sid} .hk-film span", {{ scale: 0.3, opacity: 0, duration: 0.4, ease: "back.out(2.2)", stagger: 0.15 }}, {at("hook", "cinéma") - 0.1});',
        ]
        sfx += [[round(st + 0.4, 3), "stamp", 0.6], [round(at("hook", "Mashle"), 3), "whoosh-medium", 0.35], [round(at("hook", "cinéma"), 3), "hit", 0.4]]
    elif k in ("live", "cape", "visage"):
        img = {"live": "p1", "cape": "p2", "visage": "p3"}[k]
        badge = {"live": ("FILM EN", "PRISE DE VUE RÉELLE"), "cape": ("PREMIÈRE", "AFFICHE"), "visage": ("VISAGE", "ENCORE SECRET")}[k]
        extra = '<div class="qmarks"><span>?</span><span>?</span><span>?</span></div>' if k == "visage" else ""
        body.append(f'''<div {attrs}>
  <div class="full"><img src="assets/{img}.jpg" alt=""></div>
  <div class="shade-soft"></div>
  {extra}
  <div class="badge"><div class="b1">{badge[0]}</div><div class="b2">{badge[1]}</div></div>
</div>''')
        zoom = {"live": (1.0, 1.12, 0, -60), "cape": (1.45, 1.3, 0, 0), "visage": (1.0, 1.35, 0, 80)}[k]
        js += [
            enter,
            f'tl.fromTo("#{sid} .full img", {{ scale: {zoom[0]}, y: 0, transformOrigin: "50% {'25%' if k == 'cape' else '50%'}" }}, {{ scale: {zoom[1]}, y: {zoom[3]}, duration: {du}, ease: "sine.inOut" }}, {st});',
            f'tl.from("#{sid} .badge .b1", {{ x: -400, opacity: 0, duration: 0.4, ease: "power4.out" }}, {st + 0.25});',
            f'tl.from("#{sid} .badge .b2", {{ x: -500, opacity: 0, duration: 0.45, ease: "power4.out" }}, {st + 0.35});',
        ]
        if k == "visage":
            js += [f'tl.from("#{sid} .qmarks span", {{ scale: 0, rotation: -30, opacity: 0, duration: 0.5, ease: "back.out(2.5)", stagger: 0.18 }}, {at("visage", "mystère") - 0.3});',
                   f'tl.to("#{sid} .qmarks span", {{ y: -20, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 5, stagger: 0.1 }}, {at("visage", "mystère") + 0.3});']
            sfx.append([round(at("visage", "mystère") - 0.2, 3), "riser-1s", 0.3])
        if k == "cape":
            js.append(f'tl.fromTo("#{sid} .glint", {{ xPercent: -150 }}, {{ xPercent: 250, duration: 0.9, ease: "power2.inOut" }}, {at("cape", "emblème") - 0.2});')
            body[-1] = body[-1].replace('<div class="shade-soft"></div>', '<div class="shade-soft"></div><div class="glint"></div>')
            sfx.append([round(at("cape", "emblème") - 0.1, 3), "shimmer", 0.35])
    elif k == "date":
        body.append(f'''<div {attrs}>
  <div class="bg-poster dim"><img src="assets/src/poster.jpg" alt=""></div>
  <div class="shade"></div>
  <div class="dt">
    <div class="dt-k">SORTIE PRÉVUE LE</div>
    <div class="dt-day"><span class="cnt">19</span></div>
    <div class="dt-month">MARS</div>
    <div class="dt-year">{"".join(f'<span class="d">{c}</span>' for c in "2027")}</div>
    <div class="dt-jp"><span class="flag"><span class="sun"></span></span> AU JAPON</div>
  </div>
</div>''')
        t19 = at("date", "19")
        js += [
            enter,
            f'tl.from("#{sid} .dt-k", {{ y: -50, opacity: 0, duration: 0.4, ease: "power3.out" }}, {st + 0.15});',
            f'tl.from("#{sid} .dt-day", {{ scale: 2.5, opacity: 0, duration: 0.4, ease: "expo.out" }}, {t19 - 0.25});',
            f'(function () {{ var o = {{ v: 1 }}, el = document.querySelector("#{sid} .cnt"); tl.fromTo(o, {{ v: 1 }}, {{ v: 19, duration: 0.6, ease: "power2.out", onUpdate: function () {{ el.textContent = Math.round(o.v); }} }}, {t19 - 0.25}); }})();',
            f'tl.from("#{sid} .dt-month", {{ x: 600, opacity: 0, duration: 0.45, ease: "power4.out" }}, {at("date", "mars") - 0.15});',
            f'tl.from("#{sid} .dt-year .d", {{ y: 90, opacity: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.07 }}, {at("date", "2027") - 0.15});',
            f'tl.from("#{sid} .dt-jp", {{ scale: 0.4, opacity: 0, duration: 0.5, ease: "elastic.out(1, 0.6)" }}, {at("date", "Japon") - 0.15});',
            f'tl.from("#{sid} .sun", {{ scale: 0, duration: 0.5, ease: "back.out(3)" }}, {at("date", "Japon")});',
        ]
        sfx += [[round(t19 - 0.25, 3), "ticker-fast-1s", 0.25], [round(at("date", "2027") - 0.1, 3), "hit-low", 0.45], [round(at("date", "Japon"), 3), "pop-mid", 0.3]]
    elif k == "halt":
        body.append(f'''<div {attrs}>
  <div class="poster-zoom"><img src="assets/src/poster.jpg" alt=""></div>
  <div class="ring-target"></div>
  <div class="badge right"><div class="b1">LA MAGIE ?</div><div class="b2">NON : LES MUSCLES</div></div>
</div>''')
        th = at("halt", "haltère")
        js += [
            enter,
            f'tl.fromTo("#{sid} .poster-zoom img", {{ scale: 1, x: 0, y: 0 }}, {{ scale: 2.1, x: -380, y: 60, duration: 0.7, ease: "expo.inOut" }}, {th - 0.35});',
            f'tl.to("#{sid} .poster-zoom img", {{ scale: 2.25, duration: {round(du - 1.2, 3)}, ease: "none" }}, {th + 0.35});',
            f'tl.fromTo("#{sid} .ring-target", {{ scale: 2.5, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.35, ease: "power3.out", immediateRender: false }}, {th + 0.3});',
            f'tl.to("#{sid} .ring-target", {{ scale: 1.1, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 3 }}, {th + 0.65});',
            f'tl.from("#{sid} .badge .b1", {{ x: 400, opacity: 0, duration: 0.4, ease: "power4.out" }}, {st + 0.2});',
            f'tl.from("#{sid} .badge .b2", {{ x: 500, opacity: 0, duration: 0.45, ease: "power4.out" }}, {th + 0.2});',
            f'tl.fromTo("#{sid} .poster-zoom", {{ x: 0 }}, {{ x: 16, duration: 0.04, ease: "none", yoyo: true, repeat: 5, immediateRender: false }}, {th + 0.35});',
        ]
        sfx += [[round(th - 0.35, 3), "whoosh-big", 0.4], [round(th + 0.33, 3), "thud-metal-heavy", 0.55]]
    elif k == "slogan":
        body.append(f'''<div {attrs}>
  <div class="bg-poster top"><img src="assets/src/poster.jpg" alt=""></div>
  <div class="shade"></div>
  <div class="qt">
    <div class="qt-k">LE SLOGAN</div>
    <div class="qt-jp">“ついに映画化の時だ、マッシュ”</div>
    <div class="qt-line"></div>
    <div class="qt-fr">{"".join(f'<span class="qw">{esc(w)}</span> ' for w in "« Il est enfin temps de passer au cinéma, Mash. »".split())}</div>
  </div>
</div>''')
        t0 = at("slogan", "«Il")
        js += [
            enter,
            f'tl.fromTo("#{sid} .bg-poster img", {{ scale: 1.1 }}, {{ scale: 1.25, duration: {du}, ease: "none" }}, {st});',
            f'tl.from("#{sid} .qt-k", {{ y: -40, opacity: 0, duration: 0.4, ease: "power3.out" }}, {st + 0.15});',
            f'tl.from("#{sid} .qt-jp", {{ opacity: 0, scale: 1.3, duration: 0.7, ease: "expo.out" }}, {st + 0.3});',
            f'tl.from("#{sid} .qt-line", {{ scaleX: 0, duration: 0.5, ease: "expo.out" }}, {t0 - 0.2});',
            f'tl.from("#{sid} .qt-fr .qw", {{ y: 40, opacity: 0, duration: 0.3, ease: "power3.out", stagger: {round((seg_t["slogan"][0] + seg_t["slogan"][1] - t0) / 11, 3)} }}, {t0});',
        ]
        sfx.append([round(st + 0.3, 3), "shimmer", 0.3])
    elif k == "cta":
        body.append(f'''<div {attrs}>
  <div class="bg-poster dim"><img src="assets/src/poster.jpg" alt=""></div>
  <div class="shade"></div>
  <div class="ct">
    <div class="ct-q">TU IRAS LE VOIR ?</div>
    <div class="ct-btns"><div class="btn yes">OUI 💪</div><div class="btn no">NON</div></div>
    <div class="ct-c">Dis-le en commentaire <span class="arrow">↓</span></div>
    <div class="ct-date">19.03.2027 · JAPON</div>
  </div>
</div>''')
        js += [
            enter,
            f'tl.from("#{sid} .ct-q", {{ y: -80, opacity: 0, duration: 0.5, ease: "expo.out" }}, {st + 0.15});',
            f'tl.from("#{sid} .btn", {{ scale: 0.3, opacity: 0, duration: 0.45, ease: "back.out(2)", stagger: 0.12 }}, {st + 0.45});',
            f'tl.to("#{sid} .btn.yes", {{ scale: 1.08, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 5 }}, {st + 1.0});',
            f'tl.from("#{sid} .ct-c", {{ y: 60, opacity: 0, duration: 0.5, ease: "power3.out" }}, {at("cta", "Dis") - 0.1});',
            f'tl.to("#{sid} .arrow", {{ y: 18, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 7 }}, {at("cta", "Dis") + 0.4});',
            f'tl.from("#{sid} .ct-date", {{ opacity: 0, duration: 0.6, ease: "sine.out" }}, {st + 1.2});',
        ]
        sfx.append([round(st + 0.5, 3), "pop-high", 0.3])
    elif k in ("logo-in", "logo-out"):
        rays = "".join(f'<div class="ray" style="transform: rotate({j * 20 + (7 if j % 2 else 0)}deg)"><div class="ray-in" style="width:{520 + (j * 137) % 260}px"></div></div>' for j in range(18))
        line = '<div class="lg-line">L\'ACTU ANIME &amp; MANGA</div>' if k == "logo-in" else '<div class="lg-line">ABONNE-TOI POUR PLUS D\'ACTUS</div><div class="lg-site">newsseries.fr</div>'
        body.append(f'''<div {attrs}>
  <div class="lg-glow"></div><div class="lg-rays">{rays}</div><div class="lg-ring"></div>
  <div class="lg-content"><div class="lg-logo"><img src="assets/brand/logo.png" alt="NewsSeries"></div>{line}</div>
</div>''')
        imp = st + (0.5 if k == "logo-in" else 0.75)
        if k == "logo-in":
            js.append(f'tl.from("#{sid} .lg-logo", {{ scale: 3.2, rotation: -14, opacity: 0, duration: 0.5, ease: "expo.in" }}, {st});')
        else:
            js += [f'tl.from("#{sid}", {{ yPercent: -100, duration: {XF}, ease: "power4.out" }}, {st});',
                   f'tl.from("#{sid} .lg-logo", {{ y: -1300, rotation: 10, duration: 0.75, ease: "bounce.out" }}, {st});']
        js += [
            f'tl.fromTo("#{sid} .lg-glow", {{ scale: 0.3, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.5, ease: "expo.out", immediateRender: false }}, {imp});',
            f'tl.from("#{sid} .ray-in", {{ scaleX: 0, opacity: 0, duration: 0.45, ease: "expo.out", stagger: 0.012 }}, {imp});',
            f'tl.to("#{sid} .lg-rays", {{ rotation: 25, duration: {du}, ease: "none" }}, {st});',
            f'tl.fromTo("#{sid} .lg-ring", {{ scale: 0.2, opacity: 1 }}, {{ scale: 3, opacity: 0, duration: 0.7, ease: "power2.out", immediateRender: false }}, {imp});',
            f'tl.fromTo("#{sid} .lg-logo", {{ x: 0 }}, {{ x: 14, duration: 0.04, ease: "none", yoyo: true, repeat: 5 }}, {imp});',
            f'tl.fromTo("#flash2", {{ opacity: 0.8 }}, {{ opacity: 0, duration: 0.35, ease: "power2.out", immediateRender: false }}, {imp});',
            f'tl.to("#{sid} .lg-logo img", {{ scale: 1.04, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: {max(1, int((du - 1.0) / 0.6))} }}, {imp + 0.3});',
            f'tl.from("#{sid} .lg-line, #{sid} .lg-site", {{ y: 60, opacity: 0, duration: 0.5, ease: "back.out(1.6)", stagger: 0.15 }}, {imp + 0.35});',
        ]
        if k == "logo-out":
            js.append(f'tl.to("#{sid} .lg-content, #{sid} .lg-rays, #{sid} .lg-glow", {{ opacity: 0, duration: 0.6, ease: "power2.in" }}, {round(TOTAL - 0.6, 3)});')

sfx = [x for x in sfx if x[2] > 0]
sfx += [[s["start"], "whoosh-short-low", 0.35] for s in shots[2:]]
flash_times = [s["start"] for s in shots[1:]]
js.append(f'tl.fromTo("#progress", {{ scaleX: 0 }}, {{ scaleX: 1, duration: {TOTAL}, ease: "none" }}, 0);')
js.append(f'[{",".join(str(x) for x in flash_times)}].forEach(function (ft) {{ tl.fromTo("#flash", {{ opacity: 0.5 }}, {{ opacity: 0, duration: 0.25, ease: "power2.out", immediateRender: false }}, ft); }});')

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
      <div id="flash2" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="41"></div>
      <div id="progress" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="42"></div>
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
json.dump({"sfx": sfx, "total": TOTAL, "lead": LEAD, "gap": GAP, "vo_dir": "vo", "segments": seg_t, "shots": shots},
          open(ROOT / "tools" / "timing.json", "w"), ensure_ascii=False, indent=1)
print(f"{len(shots)} plans, {len(caps)} sous-titres, durée {TOTAL}s")
