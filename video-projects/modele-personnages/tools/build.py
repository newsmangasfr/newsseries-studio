"""Short « Oshi no Ko saison 3 en VF sur Crunchyroll » (HyperFrames, 1080x1920, plus d'une minute).
Génère index.html et tools/timing.json à partir des durées réelles de la voix off (audio/vo/*.wav).
Usage (depuis le dossier du projet) : python3 tools/build.py
"""
import html
import json
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INTRO, OUTRO, HOLD = 2.6, 3.4, 1.8
LEAD, GAP = INTRO + 0.2, 0.3
BEAT = 60 / 124
XF = 0.3
PINK, PURPLE, GOLD, CYAN, CR = "#ff3ea5", "#8b3dff", "#ffd23f", "#5ee7ff", "#f47521"
VO = json.load(open(ROOT / "tools" / "vo.json", encoding="utf-8"))
SEGS = [(x["id"], x["cap"].replace(" :", ":").replace(" ?", "?").replace(" !", "!")) for x in VO]
TXT = dict(SEGS)
HIGHLIGHT = {"oshi", "ko", "saison", "3", "française", "français", "crunchyroll", "vf", "vostfr", "ai", "hoshino", "aqua", "ruby", "kana",
             "arima", "akane", "kurokawa", "mem-cho", "b-komachi", "finale", "secret", "idole", "saisons", "showbiz", "inoubliable"}

# fiches personnages : image, nom, rôle, couleur
CHAR = {
    "ai": ("ai", "AI HOSHINO", "L'IDOLE N°1", PINK),
    "aqua": ("aqua", "AQUA", "EN QUÊTE DE VÉRITÉ", CYAN),
    "ruby": ("ruby", "RUBY", "FUTURE IDOLE", GOLD),
    "kana": ("kana", "KANA ARIMA", "EX-ENFANT STAR", "#ff4d6d"),
    "akane": ("akane", "AKANE KUROKAWA", "ACTRICE DE GÉNIE", "#5ea8ff"),
    "mem": ("mem", "MEM-CHO", "B-KOMACHI", "#ffe14d"),
}
# plans « affiche » : image, largeur/hauteur de la carte, haut de la carte
PANEL = {
    "hook": ("poster8", 1000, 752, 660),
    "crunchy": ("poster", 900, 1017, 250),
    "saisons": ("saisons", 1000, 561, 250),
    "revoir": ("saisons8", 900, 773, 260),
    "pitch": ("poster7", 900, 954, 300),
    "finale": ("scene", 1000, 616, 620),
    "acte": ("finale", 1000, 313, 760),
}


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


shots = [{"kind": "logo-in", "start": 0.0}]
for sid, _ in SEGS:
    st = seg_t[sid][0]
    shots.append({"kind": sid, "start": st - 0.25 if sid == "hook" else on_beat(st - 0.12, st - 0.35, st + 0.05)})
shots.append({"kind": "logo-out", "start": CTA_END})
for i, s in enumerate(shots):
    nxt = shots[i + 1]["start"] if i + 1 < len(shots) else TOTAL
    s["dur"] = round(nxt - s["start"] + (XF if i + 1 < len(shots) else 0), 3)
    s["start"] = round(s["start"], 3)

# --- sous-titres ---
caps = []
for sid, text in SEGS:
    if sid == "cta":
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


def core(w):
    return w.strip(",.:…?!").lower().replace("d'", "").replace("l'", "")


def cap_html(words):
    return " ".join(f'<span class="w{" hl" if core(w) in HIGHLIGHT else ""}">{esc(w)}</span>' for w in words)


def bg(img):
    return f'<div class="blur-bg"><img src="assets/crops/{img}.jpg" alt=""></div><div class="tint"></div>'


body, js, sfx = [], [], []
for i, s in enumerate(shots):
    sid, k, st, du = f"s{i:02d}", s["kind"], s["start"], s["dur"]
    attrs = f'id="{sid}" class="clip shot" data-start="{st}" data-duration="{du}" data-track-index="{1 + i % 2}" style="z-index:{10 + i}"'
    enter = f'tl.from("#{sid}", {{ xPercent: 100, duration: {XF}, ease: "power4.out" }}, {st});'
    pop = f'tl.from("#{sid} .card", {{ y: 160, scale: 0.85, rotation: -3, opacity: 0, duration: 0.55, ease: "back.out(1.5)" }}, {st + 0.08});'
    if k in PANEL:
        img, w, h, top = PANEL[k]
        over = ""
        extra_js = []
        if k == "hook":
            over = f'''<div class="hk">
    <div class="hk-k">GRANDE NOUVELLE</div>
    <div class="hk-s">{"".join(f'<span class="l">{c}</span>' for c in "SAISON 3")}</div>
    <div class="hk-vf"><span class="flag"><i></i><i></i><i></i></span><span>EN VERSION FRANÇAISE</span></div>
  </div>'''
            extra_js = [
                f'tl.from("#{sid} .hk-k", {{ y: -60, opacity: 0, duration: 0.4, ease: "power3.out" }}, {st + 0.1});',
                f'tl.from("#{sid} .hk-s .l", {{ y: 140, scale: 1.6, opacity: 0, duration: 0.45, ease: "back.out(2)", stagger: 0.05 }}, {at("hook", "saison 3") - 0.15});',
                f'tl.from("#{sid} .hk-vf", {{ scale: 0.3, opacity: 0, duration: 0.55, ease: "elastic.out(1, 0.6)" }}, {at("hook", "version") - 0.15});',
                f'tl.from("#{sid} .flag i", {{ scaleY: 0, duration: 0.3, ease: "power3.out", stagger: 0.08 }}, {at("hook", "version")});',
            ]
            sfx += [[round(at("hook", "saison 3") - 0.1, 3), "hit", 0.45], [round(at("hook", "version"), 3), "shimmer", 0.35]]
        elif k == "crunchy":
            over = f'<div class="cr" style="top:{top + h + 40}px"><span class="cr-k">DÉSORMAIS SUR</span><span class="cr-n">Crunchyroll</span></div>'
            extra_js = [f'tl.from("#{sid} .cr", {{ y: 80, scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)" }}, {at("crunchy", "Crunchyroll") - 0.2});',
                        f'tl.to("#{sid} .cr", {{ scale: 1.05, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 3 }}, {at("crunchy", "Crunchyroll") + 0.4});']
            sfx.append([round(at("crunchy", "Crunchyroll") - 0.1, 3), "pop-high", 0.35])
        elif k == "saisons":
            rows = "".join(f'<div class="ck-row"><span class="ck-s">SAISON {n}</span><span class="ck-vf">VF</span><span class="ck-ok">✓</span></div>' for n in (1, 2, 3))
            over = f'<div class="ck" style="top:{top + h + 50}px">{rows}</div>'
            t0 = at("saisons", "toutes")
            extra_js = [f'tl.from("#{sid} .ck-row", {{ x: -700, opacity: 0, duration: 0.45, ease: "power4.out", stagger: 0.35 }}, {t0});',
                        f'tl.from("#{sid} .ck-ok", {{ scale: 0, rotation: -90, duration: 0.4, ease: "back.out(3)", stagger: 0.35 }}, {t0 + 0.3});']
            sfx += [[round(t0 + 0.3 + j * 0.35, 3), "confirm", 0.3] for j in range(3)]
        elif k == "revoir":
            over = f'<div class="ep" style="top:{top + h + 50}px"><span class="play">▶</span><span>DEPUIS L\'ÉPISODE 1</span></div>'
            extra_js = [f'tl.from("#{sid} .ep", {{ scale: 0.4, opacity: 0, duration: 0.5, ease: "back.out(2)" }}, {at("revoir", "depuis") - 0.2});',
                        f'tl.fromTo("#{sid} .play", {{ scale: 1 }}, {{ scale: 1.25, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }}, {at("revoir", "depuis") + 0.3});']
            sfx.append([round(at("revoir", "depuis") - 0.1, 3), "pop-mid", 0.3])
        elif k == "pitch":
            over = '<div class="kick" style="top:150px">DANS LES COULISSES<br><b>DU SHOWBIZ</b></div>'
            extra_js = [f'tl.from("#{sid} .kick", {{ y: -60, opacity: 0, duration: 0.5, ease: "power3.out" }}, {at("pitch", "coulisses") - 0.2});']
        elif k == "finale":
            over = '<div class="fin"><div class="fin-k">LA SAISON</div><div class="fin-b">FINALE</div><div class="fin-s">PROCHAINEMENT</div></div>'
            tf = at("finale", "saison finale")
            extra_js = [f'tl.from("#{sid} .fin-k", {{ y: -50, opacity: 0, duration: 0.4, ease: "power3.out" }}, {tf - 0.2});',
                        f'tl.from("#{sid} .fin-b", {{ scale: 2.4, opacity: 0, duration: 0.45, ease: "expo.out" }}, {tf + 0.15});',
                        f'tl.from("#{sid} .fin-s", {{ y: 60, opacity: 0, duration: 0.45, ease: "back.out(2)" }}, {at("finale", "prochainement") - 0.2});',
                        f'tl.fromTo("#{sid} .fin-b", {{ scale: 1 }}, {{ scale: 1.06, duration: 0.24, ease: "sine.inOut", yoyo: true, repeat: 5, immediateRender: false }}, {tf + 0.7});']
            sfx += [[round(tf + 0.15, 3), "boom", 0.5]]
        elif k == "acte":
            over = '<div class="acte"><div class="acte-k">LE DERNIER</div><div class="acte-b">ACTE</div><div class="acte-s">APPROCHE…</div></div>' + "".join(
                f'<div class="burst" style="left:{540 + 380 * __import__("math").cos(j * 0.785):.0f}px; top:{500 + 300 * __import__("math").sin(j * 0.785):.0f}px">✦</div>' for j in range(8))
            extra_js = [f'tl.from("#{sid} .acte-k", {{ y: -50, opacity: 0, duration: 0.4, ease: "power3.out" }}, {st + 0.2});',
                        f'tl.from("#{sid} .acte-b", {{ scale: 0.3, opacity: 0, duration: 0.5, ease: "back.out(2)" }}, {at("acte", "acte") - 0.15});',
                        f'tl.from("#{sid} .burst", {{ scale: 0, rotation: 180, opacity: 0, duration: 0.6, ease: "back.out(3)", stagger: 0.05 }}, {at("acte", "acte")});',
                        f'tl.from("#{sid} .acte-s", {{ opacity: 0, duration: 0.6, ease: "sine.out" }}, {at("acte", "inoubliable") - 0.6});']
            sfx.append([round(at("acte", "acte"), 3), "glitter", 0.35])
        body.append(f'''<div {attrs}>
  {bg(img)}
  <div class="card" style="left:{(1080 - w) // 2}px; top:{top}px; width:{w}px; height:{h}px"><img src="assets/crops/{img}.jpg" alt=""></div>
  {over}
</div>''')
        js += [enter, pop,
               f'tl.fromTo("#{sid} .card img", {{ scale: 1.0 }}, {{ scale: 1.08, duration: {du}, ease: "sine.inOut" }}, {st});',
               f'tl.fromTo("#{sid} .blur-bg img", {{ scale: 1.3 }}, {{ scale: 1.15, duration: {du}, ease: "none" }}, {st});'] + extra_js
    elif k in CHAR:
        img, name, role, col = CHAR[k]
        trio = ""
        if k == "mem":
            trio = '<div class="trio">' + "".join(f'<div class="bub" style="border-color:{CHAR[c][3]}"><img src="assets/crops/{c}.jpg" alt=""></div>' for c in ("ruby", "kana", "mem")) + '</div>'
        zoom = ' style="transform-origin: 0 0"' if k in ("kana", "akane") else ""
        size = 120 if len(name) <= 10 else 96
        body.append(f'''<div {attrs}>
  {bg(img)}
  <div class="beam" style="background: conic-gradient(from 180deg at 50% 0%, #0000 0deg, {col}33 20deg, #0000 40deg, #0000 320deg, {col}33 340deg, #0000 360deg)"></div>
  <div class="card sq" style="box-shadow: 0 30px 90px #000c, 0 0 0 8px {col}, 0 0 80px {col}aa"><img src="assets/crops/{img}.jpg" alt=""{zoom}></div>
  <div class="spark s1" style="color:{col}">✦</div><div class="spark s2" style="color:{col}">✦</div><div class="spark s3">✦</div>
  <div class="nm" style="font-size:{size}px">{"".join(f'<span class="l">{esc(c) if c != " " else "&nbsp;"}</span>' for c in name)}</div>
  <div class="role" style="background:{col}">{esc(role)}</div>
  {trio}
</div>''')
        tn = st + 0.3
        js += [enter, pop,
               f'tl.fromTo("#{sid} .card img", {{ scale: {1.18 if zoom else 1.0} }}, {{ scale: {1.26 if zoom else 1.1}, duration: {du}, ease: "sine.inOut" }}, {st});',
               f'tl.fromTo("#{sid} .blur-bg img", {{ scale: 1.3 }}, {{ scale: 1.15, duration: {du}, ease: "none" }}, {st});',
               f'tl.fromTo("#{sid} .beam", {{ rotation: -8 }}, {{ rotation: 8, duration: {du}, ease: "sine.inOut" }}, {st});',
               f'tl.from("#{sid} .nm .l", {{ y: 80, opacity: 0, duration: 0.35, ease: "back.out(2.2)", stagger: 0.03 }}, {tn});',
               f'tl.from("#{sid} .role", {{ scale: 0.4, opacity: 0, duration: 0.5, ease: "elastic.out(1, 0.6)" }}, {tn + 0.3});',
               f'tl.from("#{sid} .spark", {{ scale: 0, rotation: -120, duration: 0.5, ease: "back.out(3)", stagger: 0.1 }}, {st + 0.4});',
               f'tl.to("#{sid} .spark", {{ scale: 1.3, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: {max(1, int(du / 0.4) - 2)}, stagger: 0.13 }}, {st + 0.9});']
        sfx += [[round(st + 0.35, 3), "pop-mid", 0.25], [round(st + 0.45, 3), "sparkle-chime", 0]]
        if k == "mem":
            tb = at("mem", "B-Komachi")
            js.append(f'tl.from("#{sid} .bub", {{ scale: 0, opacity: 0, duration: 0.45, ease: "back.out(2.5)", stagger: 0.12 }}, {tb - 0.35});')
            sfx.append([round(tb - 0.3, 3), "bubble-01", 0.35])
    elif k == "jumeaux":
        body.append(f'''<div {attrs}>
  {bg("groupe")}
  <div class="tw">
    <div class="twc" style="box-shadow: 0 0 0 7px {CYAN}, 0 0 60px {CYAN}99"><img src="assets/crops/aqua.jpg" alt=""><div class="twn" style="background:{CYAN}">AQUA</div></div>
    <div class="twc" style="box-shadow: 0 0 0 7px {GOLD}, 0 0 60px {GOLD}99"><img src="assets/crops/ruby.jpg" alt=""><div class="twn" style="background:{GOLD}">RUBY</div></div>
  </div>
  <div class="twk">LES JUMEAUX</div>
  <div class="secret">🤫 UN SECRET</div>
  <div class="past">NÉS AVEC LES SOUVENIRS<br><b>D'UNE VIE PASSÉE</b></div>
</div>''')
        ts = at("jumeaux", "secret")
        js += [enter,
               f'tl.fromTo("#{sid} .blur-bg img", {{ scale: 1.3 }}, {{ scale: 1.15, duration: {du}, ease: "none" }}, {st});',
               f'tl.from("#{sid} .twk", {{ y: -50, opacity: 0, duration: 0.4, ease: "power3.out" }}, {st + 0.15});',
               f'tl.from("#{sid} .twc", {{ y: 200, rotation: (i) => (i ? 8 : -8), opacity: 0, duration: 0.55, ease: "back.out(1.6)", stagger: 0.15 }}, {at("jumeaux", "Aqua") - 0.2});',
               f'tl.from("#{sid} .secret", {{ scale: 3, rotation: -15, opacity: 0, duration: 0.35, ease: "expo.in" }}, {ts - 0.3});',
               f'tl.from("#{sid} .past", {{ y: 60, opacity: 0, duration: 0.5, ease: "power3.out" }}, {at("jumeaux", "souvenirs") - 0.3});']
        sfx += [[round(ts + 0.05, 3), "stamp", 0.5], [round(at("jumeaux", "souvenirs") - 0.2, 3), "shimmer-long", 0.3]]
    elif k == "cta":
        cells = "".join(f'<div class="cell" style="border-color:{CHAR[c][3]}"><img src="assets/crops/{c}.jpg" alt=""></div>' for c in ("ai", "aqua", "ruby", "kana", "akane", "mem"))
        body.append(f'''<div {attrs}>
  {bg("poster8")}
  <div class="ct">
    <div class="ct-grid">{cells}</div>
    <div class="ct-q">TU PRÉFÈRES…</div>
    <div class="ct-btns"><div class="btn vf"><span class="flag"><i></i><i></i><i></i></span> VF</div><div class="btn vo">VOSTFR</div></div>
    <div class="ct-c">Dis-le en commentaire <span class="arrow">↓</span></div>
  </div>
</div>''')
        js += [enter,
               f'tl.from("#{sid} .cell", {{ scale: 0.3, opacity: 0, duration: 0.45, ease: "back.out(2)", stagger: {{ each: 0.07, from: "center" }} }}, {st + 0.15});',
               f'tl.from("#{sid} .ct-q", {{ y: 60, opacity: 0, duration: 0.45, ease: "power3.out" }}, {st + 0.4});',
               f'tl.from("#{sid} .btn", {{ scale: 0.3, opacity: 0, duration: 0.45, ease: "back.out(2)", stagger: 0.15 }}, {at("cta", "VF") - 0.15});',
               f'tl.to("#{sid} .btn", {{ scale: 1.07, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 7, stagger: 0.25 }}, {at("cta", "VF") + 0.6});',
               f'tl.from("#{sid} .ct-c", {{ y: 60, opacity: 0, duration: 0.5, ease: "power3.out" }}, {at("cta", "Dis") - 0.1});',
               f'tl.to("#{sid} .arrow", {{ y: 18, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 9 }}, {at("cta", "Dis") + 0.4});']
        sfx += [[round(at("cta", "VF") - 0.1, 3), "pop-high", 0.3], [round(at("cta", "VOSTFR") - 0.1, 3), "pop-mid", 0.3]]
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
js.append(f'[{",".join(str(x) for x in flash_times)}].forEach(function (ft) {{ tl.fromTo("#flash", {{ opacity: 0.45 }}, {{ opacity: 0, duration: 0.25, ease: "power2.out", immediateRender: false }}, ft); }});')
# étoiles qui scintillent sur toute la vidéo (calque au-dessus des plans)
stars = []
for j in range(22):
    x, y, sz = (j * 397) % 1040 + 20, (j * 613) % 1400 + 120, 22 + (j * 7) % 26
    stars.append(f'<div class="star" style="left:{x}px; top:{y}px; font-size:{sz}px">✦</div>')
    js.append(f'tl.fromTo("#stars .star:nth-child({j + 1})", {{ opacity: 0, scale: 0.4 }}, {{ opacity: 0.85, scale: 1, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: {int(TOTAL / 0.7) - 1} }}, {round((j * 0.37) % 1.4, 2)});')

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
      <div id="stars" class="clip" data-start="{INTRO}" data-duration="{round(CTA_END - INTRO, 3)}" data-track-index="30">{"".join(stars)}</div>
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
