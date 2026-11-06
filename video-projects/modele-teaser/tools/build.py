"""Short « Chainsaw Man : l'arc des Assassins, nouvelles infos à la Jump Festa 2027 » (HyperFrames, 1080x1920).
Génère index.html et tools/timing.json (plans, extraits du teaser à découper, bruitages) à partir des durées réelles
de la voix off (audio/vo/*.wav). Ensuite : python3 tools/clips.py (découpe les extraits verticaux), puis make_audio.sh.
Usage (depuis le dossier du projet) : python3 tools/build.py
"""
import html
import json
import math
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INTRO, OUTRO, HOLD = 2.8, 3.6, 1.8
LEAD, GAP = INTRO + 0.2, 0.3
BEAT = 60 / 124
RED, ORANGE, BONE, INK = "#d7182a", "#ff6a13", "#f2efe6", "#0a0a0a"
VO = json.load(open(ROOT / "tools" / "vo.json", encoding="utf-8"))
SEGS = [(x["id"], x["cap"].replace(" :", ":").replace(" ?", "?").replace(" !", "!")) for x in VO]
TXT = dict(SEGS)
HIGHLIGHT = {"chainsaw", "man", "saigner", "assassins", "jump", "festa", "2027", "red", "super", "stage", "denji", "rouge", "sang",
             "production", "confirmée", "reze", "cœur", "japon", "quanxi", "santa", "claus", "allemagne", "power", "kishibe", "mappa",
             "sanglants", "trahisons", "fou", "teaser", "noir"}

# extraits du teaser (début, fin, cadrage, centre horizontal du recadrage 0-1, teinte)
# A salle de cinéma 0-18.4 · B toile rouge 18.6-22.3 · B2 personnages sur fond vert 22.3-27.4 · C Denji rose 27.5-33.8
# D Denji yeux rouges 33.8-36.4 · E titre 36.4-41.1 · F « production décidée » 41.1-45.5
CLIPS = {
    "hook": [(33.85, 36.35, "full", 0.45, "")],
    "festa": [(0.2, 5.0, "full", 0.5, "dark")],
    "stage": [(5.0, 9.0, "full", 0.62, "red")],
    "teaser": [(9.0, 18.4, "full", 0.55, "")],
    "toile": [(18.6, 22.3, "full", 0.5, "")],
    "titre": [(36.4, 40.0, "band", 0.5, ""), (41.15, 43.5, "full", 0.5, "")],
    "reze": [(22.3, 27.4, "band", 0.5, "")],
    "coeur": [(27.5, 31.8, "full", 0.5, "")],
    "tueurs": [(9.5, 14.0, "full", 0.6, "dark")],
    "quanxi": [(14.0, 18.3, "full", 0.5, "red")],
    "santa": [(18.6, 22.0, "full", 0.5, "dark")],
    "kishibe": [(23.2, 27.4, "full", 0.83, "")],
    "mappa": [(41.15, 45.5, "full", 0.68, "")],
    "combats": [(33.85, 34.8, "full", 0.45, ""), (11.5, 12.5, "full", 0.6, ""), (19.0, 20.0, "full", 0.5, ""), (28.5, 29.5, "full", 0.5, ""),
                (25.5, 26.5, "full", 0.3, ""), (12.8, 13.8, "full", 0.45, ""), (34.8, 36.3, "full", 0.45, "")],
    "cta": [(33.85, 36.35, "full", 0.45, "dark")],
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
    shots.append({"kind": sid, "start": INTRO if sid == "hook" else on_beat(st - 0.12, st - 0.35, st + 0.05)})
shots.append({"kind": "logo-out", "start": CTA_END})
for i, s in enumerate(shots):
    s["start"] = round(s["start"], 3)
    s["dur"] = round((shots[i + 1]["start"] if i + 1 < len(shots) else TOTAL) - s["start"], 3)  # coupes franches
    if s["kind"] in CLIPS:
        s["clip"] = f"assets/clips/{s['kind']}.mp4"
        s["src"] = CLIPS[s["kind"]]

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
    w = w.strip(",.:…?!").lower()
    for p in ("d'", "l'", "s'", "c'"):
        if w.startswith(p):
            w = w[2:]
    return w


def cap_html(words):
    return " ".join(f'<span class="w{" hl" if core(w) in HIGHLIGHT else ""}">{esc(w)}</span>' for w in words)


def tape(text, cls="", style=""):
    return f'<div class="tape {cls}" style="{style}"><span>{esc(text)}</span></div>'


def big(text, cls=""):
    return f'<div class="big rough {cls}">{"".join(f"<span class=l>{esc(c) if c != chr(32) else chr(160)}</span>" for c in text)}</div>'


def namecard(name, role, origin):
    return f'''<div class="nc">
    <div class="nc-cross"><div class="ch h"></div><div class="ch v"></div><div class="ring"></div></div>
    <div class="nc-tag">CIBLE · {esc(origin)}</div>
    {big(name, "nc-name" + (" long" if len(name) > 8 else ""))}
    {tape(role, "white")}
  </div>'''


body, js, sfx = [], [], []
z = 10
for i, s in enumerate(shots):
    k, st, du = s["kind"], s["start"], s["dur"]
    sid = f"s{i:02d}"
    z += 2
    if "clip" in s:
        body.append(f'<video id="v{i:02d}" class="clip vid" data-start="{st}" data-duration="{du}" data-track-index="{1 + i % 2}" src="{s["clip"]}" muted playsinline style="z-index:{z}"></video>')
        js.append(f'tl.fromTo("#v{i:02d}", {{ scale: 1.12 }}, {{ scale: 1.0, duration: 0.35, ease: "power3.out" }}, {st});')
    attrs = f'id="{sid}" class="clip ov" data-start="{st}" data-duration="{du}" data-track-index="{3 + i % 2}" style="z-index:{z + 1}"'
    inner, ej = "", []
    if k == "hook":
        inner = f'''<div class="splat-bg"><img src="assets/brand/splat.png" alt=""></div>
  <div class="hk">{big("CHAINSAW", "hk-1")}{big("MAN", "hk-2")}{tape("L'ARC DES ASSASSINS", "red hk-t")}<div class="hk-jp">刺客篇</div></div>'''
        ej = [f'tl.from("#{sid} .hk-1 .l", {{ y: -200, rotation: (i) => (i % 2 ? 12 : -12), opacity: 0, duration: 0.3, ease: "power4.out", stagger: 0.04 }}, {st + 0.1});',
              f'tl.from("#{sid} .hk-2", {{ scale: 3, opacity: 0, duration: 0.3, ease: "expo.in" }}, {at("hook", "Man") - 0.2});',
              f'tl.fromTo("#{sid} .splat-bg img", {{ scale: 0.2, opacity: 0 }}, {{ scale: 1, opacity: 0.85, duration: 0.25, ease: "expo.out", immediateRender: false }}, {at("hook", "saigner") - 0.05});',
              f'tl.from("#{sid} .hk-t", {{ scaleX: 0, duration: 0.35, ease: "power4.out" }}, {at("hook", "L'arc") - 0.1});',
              f'tl.from("#{sid} .hk-jp", {{ opacity: 0, scale: 1.4, duration: 0.5, ease: "power2.out" }}, {at("hook", "Assassins")});']
        sfx += [[round(st + 0.05, 3), "chainsaw-short", 0.5], [round(at("hook", "saigner") - 0.05, 3), "hit", 0.5], [round(at("hook", "L'arc") - 0.1, 3), "whoosh-medium", 0.35]]
    elif k == "festa":
        inner = f'<div class="fs">{tape("NOUVELLES INFOS", "red")}{big("JUMP", "fs-1")}{big("FESTA", "fs-2")}<div class="fs-y rough">2027</div></div>'
        tj = at("festa", "Jump")
        ej = [f'tl.from("#{sid} .tape", {{ scaleX: 0, duration: 0.35, ease: "power4.out" }}, {st + 0.1});',
              f'tl.from("#{sid} .fs-1 .l, #{sid} .fs-2 .l", {{ y: 150, opacity: 0, duration: 0.3, ease: "back.out(2)", stagger: 0.04 }}, {st + 0.25});',
              f'tl.from("#{sid} .fs-y", {{ scale: 2.6, opacity: 0, duration: 0.3, ease: "expo.in" }}, {at("festa", "2027") - 0.25});']
        sfx += [[round(at("festa", "2027") + 0.05, 3), "hit-low", 0.5]]
    elif k == "stage":
        inner = f'<div class="spot"></div><div class="stg">{tape("RENDEZ-VOUS SUR LA", "white")}{big("RED SUPER", "stg-1")}{big("STAGE", "stg-2")}</div>'
        ej = [f'tl.from("#{sid} .tape", {{ scaleX: 0, duration: 0.35, ease: "power4.out" }}, {st + 0.1});',
              f'tl.from("#{sid} .stg-1", {{ x: -900, duration: 0.35, ease: "power4.out" }}, {at("stage", "Red") - 0.15});',
              f'tl.from("#{sid} .stg-2", {{ x: 900, duration: 0.35, ease: "power4.out" }}, {at("stage", "Stage") - 0.2});',
              f'tl.fromTo("#{sid} .spot", {{ opacity: 0, scale: 0.6 }}, {{ opacity: 1, scale: 1, duration: 0.6, ease: "power2.out", immediateRender: false }}, {at("stage", "Red") - 0.1});']
        sfx += [[round(at("stage", "Red") - 0.1, 3), "whoosh-big", 0.4]]
    elif k == "teaser":
        inner = tape("TEASER OFFICIEL", "white corner")
        ej = [f'tl.from("#{sid} .tape", {{ x: -500, duration: 0.4, ease: "power4.out" }}, {st + 0.2});']
    elif k == "toile":
        inner = tape("DENJI", "red corner")
        ej = [f'tl.from("#{sid} .tape", {{ x: -500, duration: 0.4, ease: "power4.out" }}, {at("toile", "Denji") - 0.1});']
    elif k == "titre":
        inner = f'<div class="stamp rough">PRODUCTION<br>CONFIRMÉE</div>'
        tp = at("titre", "Production")
        ej = [f'tl.from("#{sid} .stamp", {{ scale: 3.2, rotation: -25, opacity: 0, duration: 0.3, ease: "expo.in" }}, {tp - 0.3});',
              f'tl.fromTo("#{sid}", {{ x: 0 }}, {{ x: 18, duration: 0.04, ease: "none", yoyo: true, repeat: 5, immediateRender: false }}, {tp});']
        sfx += [[round(tp, 3), "stamp", 0.7], [round(at("titre", "titre") - 0.05, 3), "boom", 0.45]]
    elif k == "reze":
        inner = f'<div class="rz">{tape("APRÈS LE FILM", "white")}{big("REZE", "rz-1")}</div><div class="rz-b">{tape("LA SUITE DIRECTE", "red")}</div>'
        ej = [f'tl.from("#{sid} .rz .tape", {{ scaleX: 0, duration: 0.35, ease: "power4.out" }}, {st + 0.1});',
              f'tl.from("#{sid} .rz-1 .l", {{ y: -160, opacity: 0, duration: 0.3, ease: "back.out(2)", stagger: 0.05 }}, {at("reze", "Reze") - 0.15});',
              f'tl.from("#{sid} .rz-b .tape", {{ scaleX: 0, duration: 0.35, ease: "power4.out" }}, {at("reze", "suite") - 0.1});']
    elif k == "coeur":
        inner = f'''<div class="cross"><div class="ch h"></div><div class="ch v"></div><div class="ring"></div><div class="ring r2"></div></div>
  <div class="heart">❤</div><div class="cr-t">{tape("CIBLE : SON CŒUR", "red")}</div>'''
        tc = at("coeur", "cœur")
        ej = [f'tl.from("#{sid} .cross", {{ scale: 2.5, rotation: 90, opacity: 0, duration: 0.5, ease: "power3.out" }}, {at("coeur", "monde") - 0.1});',
              f'tl.to("#{sid} .ring", {{ rotation: 180, duration: {du}, ease: "none" }}, {st});',
              f'tl.from("#{sid} .heart", {{ scale: 0, duration: 0.3, ease: "back.out(3)" }}, {tc - 0.1});',
              f'tl.to("#{sid} .heart", {{ scale: 1.25, duration: {BEAT / 2:.3f}, ease: "power2.out", yoyo: true, repeat: 5 }}, {tc + 0.2});',
              f'tl.from("#{sid} .cr-t .tape", {{ scaleX: 0, duration: 0.35, ease: "power4.out" }}, {tc - 0.2});']
        sfx += [[round(at("coeur", "monde") - 0.1, 3), "scan" if False else "blip-02", 0.35], [round(tc - 0.1, 3), "hit-low", 0.5]]
    elif k == "tueurs":
        pins = [("ALLEMAGNE", 140, 520), ("CHINE", 600, 760), ("ÉTATS-UNIS", 110, 1010), ("URSS", 640, 1220)]
        inner = "".join(f'<div class="pin" style="left:{x}px; top:{y}px"><div class="dot"></div>{tape(n, "red" if j % 2 else "white")}</div>' for j, (n, x, y) in enumerate(pins))
        inner += f'<div class="tu-t">{big("TUEURS", "tu-1")}</div>'
        tp = at("tueurs", "plusieurs")
        ej = [f'tl.from("#{sid} .tu-1 .l", {{ y: -150, opacity: 0, duration: 0.3, ease: "back.out(2)", stagger: 0.04 }}, {at("tueurs", "tueurs") - 0.2});',
              f'tl.from("#{sid} .pin", {{ scale: 0, opacity: 0, duration: 0.3, ease: "back.out(3)", stagger: 0.28 }}, {tp - 0.1});']
        sfx += [[round(tp - 0.05 + j * 0.28, 3), "pop-low", 0.35] for j in range(4)]
    elif k in ("quanxi", "santa", "kishibe"):
        name, role, origin = {"quanxi": ("QUANXI", "1RE CHASSEUSE DE DÉMONS", "CHINE"), "santa": ("SANTA CLAUS", "L'ASSASSIN ALLEMAND", "ALLEMAGNE"),
                              "kishibe": ("KISHIBE", "L'ENTRAÎNEUR", "JAPON")}[k]
        if k == "kishibe":
            origin = "ALLIÉ"
        inner = namecard(name, role, origin)
        key = {"quanxi": "Quanxi", "santa": "Santa", "kishibe": "Kishibe"}[k]
        tn = at(k, key)
        ej = [f'tl.from("#{sid} .nc-cross", {{ scale: 2.2, rotation: -90, opacity: 0, duration: 0.45, ease: "power3.out" }}, {st + 0.05});',
              f'tl.to("#{sid} .nc-cross .ring", {{ rotation: 120, duration: {du}, ease: "none" }}, {st});',
              f'tl.from("#{sid} .nc-tag", {{ x: -400, duration: 0.35, ease: "power4.out" }}, {st + 0.15});',
              f'tl.from("#{sid} .nc-name .l", {{ y: 140, opacity: 0, duration: 0.28, ease: "back.out(2.2)", stagger: 0.04 }}, {tn - 0.15});',
              f'tl.from("#{sid} .nc .tape", {{ scaleX: 0, duration: 0.35, ease: "power4.out" }}, {tn + 0.3});']
        sfx += [[round(tn - 0.1, 3), "thud-metal", 0.45]]
    elif k == "mappa":
        inner = f'<div class="mp">{tape("STUDIO", "red")}{big("MAPPA", "mp-1")}{tape("TOUJOURS AUX COMMANDES", "white")}</div>'
        ej = [f'tl.from("#{sid} .mp .tape", {{ scaleX: 0, duration: 0.35, ease: "power4.out", stagger: 0.4 }}, {at("mappa", "studio") - 0.15});',
              f'tl.from("#{sid} .mp-1 .l", {{ y: 120, opacity: 0, duration: 0.3, ease: "back.out(2)", stagger: 0.05 }}, {at("mappa", "MAPPA") - 0.15});']
        sfx += [[round(at("mappa", "MAPPA") - 0.1, 3), "hit", 0.4]]
    elif k == "combats":
        words = [("COMBATS", "Combats", "white"), ("TRAHISONS", "trahisons", "red"), ("HUMOUR FOU", "humour", "white")]
        inner = "".join(f'<div class="cb cb{j}">{big(w, "cb-w " + c)}</div>' for j, (w, _, c) in enumerate(words))
        for j, (w, key, c) in enumerate(words):
            tw = at("combats", key)
            ej += [f'tl.fromTo("#{sid} .cb{j}", {{ scale: 2.4, opacity: 0, rotation: {(-8, 6, -4)[j]} }}, {{ scale: 1, opacity: 1, duration: 0.22, ease: "expo.out", immediateRender: false }}, {tw - 0.1});']
            sfx += [[round(tw - 0.08, 3), "chainsaw-short" if j == 0 else "hit", 0.4]]
        ej.append(f'tl.fromTo("#{sid}", {{ x: 0 }}, {{ x: 14, duration: 0.05, ease: "none", yoyo: true, repeat: 7, immediateRender: false }}, {at("combats", "Combats")});')
    elif k == "cta":
        inner = f'''<div class="ct">{big("TU AS HÂTE ?", "ct-q")}
    <div class="ct-btns"><div class="btn yes rough">OUI 🔥</div><div class="btn no rough">GRAVE 🪚</div></div>
    <div class="ct-c">Dis-le en commentaire <span class="arrow">↓</span></div>
    {tape("JUMP FESTA 2027 · RED SUPER STAGE", "white")}</div>'''
        ej = [f'tl.from("#{sid} .ct-q .l", {{ y: -150, opacity: 0, duration: 0.3, ease: "back.out(2)", stagger: 0.03 }}, {st + 0.1});',
              f'tl.from("#{sid} .btn", {{ scale: 0.3, opacity: 0, duration: 0.4, ease: "back.out(2.2)", stagger: 0.15 }}, {st + 0.7});',
              f'tl.to("#{sid} .btn", {{ scale: 1.07, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 7, stagger: 0.25 }}, {st + 1.3});',
              f'tl.from("#{sid} .ct-c", {{ y: 60, opacity: 0, duration: 0.45, ease: "power3.out" }}, {at("cta", "Dis") - 0.1});',
              f'tl.to("#{sid} .arrow", {{ y: 18, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 9 }}, {at("cta", "Dis") + 0.4});',
              f'tl.from("#{sid} .ct .tape", {{ scaleX: 0, duration: 0.4, ease: "power4.out" }}, {at("cta", "Jump") - 0.3});']
        sfx += [[round(st + 0.7, 3), "pop-high", 0.3]]
    elif k in ("logo-in", "logo-out"):
        teeth = "".join(f'<div class="tooth" style="transform: rotate({j * 9}deg)"></div>' for j in range(40))
        links = "".join(f'<div class="link" style="transform: rotate({j * 9 + 4.5}deg)"></div>' for j in range(40))
        line = tape("L'ACTU SÉRIES", "white lg-t") if k == "logo-in" else tape("ABONNE-TOI POUR PLUS D'ACTUS", "white lg-t") + tape("newsseries.fr", "red lg-t")
        inner = f'''<div class="lg-bg"></div>
  <div class="lg-splat"><img src="assets/brand/splat.png" alt=""></div>
  <div class="saw"><div class="saw-ring">{teeth}{links}</div></div>
  <div class="lg-slash a"></div><div class="lg-slash b"></div>
  <div class="lg-logo"><img src="assets/brand/logo.png" alt="NewsSeries"></div>
  <div class="lg-lines">{line}</div>'''
        imp = st + (0.75 if k == "logo-in" else 0.6)
        ej = [f'tl.fromTo("#{sid} .saw-ring", {{ rotation: 0 }}, {{ rotation: {int(du * 400)}, duration: {du}, ease: "none" }}, {st});',
              f'tl.from("#{sid} .saw", {{ scale: 0.2, opacity: 0, duration: 0.45, ease: "back.out(1.6)" }}, {st + 0.05});',
              f'tl.from("#{sid} .lg-logo", {{ scale: 3.2, rotation: -16, opacity: 0, duration: 0.4, ease: "expo.in" }}, {imp - 0.4});',
              f'tl.fromTo("#{sid} .lg-splat img", {{ scale: 0.1, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.22, ease: "expo.out", immediateRender: false }}, {imp});',
              f'tl.fromTo("#{sid} .lg-slash.a", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.18, ease: "power4.out", immediateRender: false }}, {imp - 0.05});',
              f'tl.fromTo("#{sid} .lg-slash.b", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.18, ease: "power4.out", immediateRender: false }}, {imp + 0.08});',
              f'tl.fromTo("#{sid} .lg-logo, #{sid} .saw", {{ x: 0 }}, {{ x: 16, duration: 0.035, ease: "none", yoyo: true, repeat: 9, immediateRender: false }}, {imp});',
              f'tl.fromTo("#flash2", {{ opacity: 0.85 }}, {{ opacity: 0, duration: 0.3, ease: "power2.out", immediateRender: false }}, {imp});',
              f'tl.to("#{sid} .lg-logo img", {{ scale: 1.04, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: {max(1, int((du - 1.2) / 0.45))} }}, {imp + 0.3});',
              f'tl.from("#{sid} .lg-t", {{ scaleX: 0, duration: 0.35, ease: "power4.out", stagger: 0.2 }}, {imp + 0.35});']
        if k == "logo-out":
            ej.append(f'tl.to("#{sid} .lg-logo, #{sid} .saw, #{sid} .lg-lines, #{sid} .lg-splat", {{ opacity: 0, duration: 0.6, ease: "power2.in" }}, {round(TOTAL - 0.6, 3)});')
        sfx += [[round(st + 0.02, 3), "chainsaw", 0.55], [round(imp, 3), "boom-deep", 0.6], [round(imp, 3), "stamp", 0.4]]
    body.append(f'<div {attrs}>\n  {inner}\n</div>')
    js += ej

# coupe franche + griffure rouge à chaque changement de plan
cuts = [s["start"] for s in shots[1:]]
sfx += [[round(c - 0.05, 3), "whoosh-short-low", 0.3] for c in cuts[1:]]
js.append(f'[{",".join(str(c) for c in cuts)}].forEach(function (c, i) {{ var r = i % 2 ? 1 : -1; tl.fromTo("#slash", {{ xPercent: -130 * r, opacity: 1 }}, {{ xPercent: 130 * r, opacity: 1, duration: 0.22, ease: "power3.inOut", immediateRender: false }}, c - 0.11); tl.fromTo("#flash", {{ opacity: 0.5 }}, {{ opacity: 0, duration: 0.2, ease: "power2.out", immediateRender: false }}, c); }});')
js.append(f'tl.fromTo("#progress", {{ scaleX: 0 }}, {{ scaleX: 1, duration: {TOTAL}, ease: "none" }}, 0);')
# grain : une position par image (12 positions qui tournent), sans hasard
js.append(f'(function () {{ var g = document.getElementById("grain"); for (var f = 0; f < {int(TOTAL * 12)}; f++) {{ tl.set(g, {{ x: ((f * 37) % 60) - 30, y: ((f * 53) % 80) - 40 }}, f / 12); }} }})();')

cap_divs = []
for i, (a, b, g) in enumerate(caps):
    cid = f"c{i:03d}"
    cap_divs.append(f'<div id="{cid}" class="clip cap" data-start="{a}" data-duration="{round(b - a, 3)}" data-track-index="{20 + i % 2}"><div class="cap-in">{cap_html(g)}</div></div>')
    js.append(f'tl.from("#{cid} .cap-in", {{ scale: 0.7, rotation: -3, opacity: 0, duration: 0.14, ease: "back.out(2.5)" }}, {a});')

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
    <svg width="0" height="0" style="position:absolute"><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="9" /></filter></svg>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
      <div id="ground" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="0"></div>
{chr(10).join(body)}
{chr(10).join(cap_divs)}
      <div id="grainwrap" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="30"><img id="grain" src="assets/brand/grain.png" alt=""></div>
      <div id="vignette" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="31"></div>
      <div id="slashwrap" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="39"><div id="slash"></div></div>
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
