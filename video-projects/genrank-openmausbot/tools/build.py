"""Vidéo d'actu IA GenRank.fr (HyperFrames, 1080x1920, verticale) : OpenMausBot, l'alternative open source à Grok Bot.
Lit tools/plans.json (marque, plans, médias) et tools/vo.json (script), mesure la voix off (audio/vo/*.wav) et génère
index.html + tools/timing.json. Ensuite : clips.py (extraits vidéo), music.py, make_audio.py.
Usage (depuis le dossier du projet) : python3 tools/build.py
"""
import html
import json
import re
import wave
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CFG = json.load(open(ROOT / "tools/plans.json", encoding="utf-8"))
VO = json.load(open(ROOT / "tools/vo.json", encoding="utf-8"))
M, C, PLANS = CFG["marque"], CFG["couleurs"], CFG["plans"]
INTRO, OUTRO, HOLD, GAP = 2.7, 3.4, 1.0, 0.26
LEAD = INTRO + 0.2
WW, WL, WT, RATIO = 960, 60, 360, 1.25  # fenêtre média : largeur, gauche, haut, rapport l/h par défaut
# espace insécable avant « ! ? : ; » pour qu'un signe ne reste jamais seul sur sa ligne
SEGS = [(x["id"], re.sub(r"(\d) (\d)", "\\1\u00a0\\2", re.sub(r" ([!?:;])", "\u00a0\\1", x["cap"]))) for x in VO]
TXT = dict(SEGS)
KEY = {k.lower() for k in CFG["mots_cles"]}


def wav_dur(p):
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


seg_t, t = {}, LEAD
for sid, _ in SEGS:
    d = wav_dur(ROOT / "audio/vo" / f"{sid}.wav")
    seg_t[sid] = (round(t, 3), d)
    t += d + GAP
CTA_END = round(t - GAP + HOLD, 3)
TOTAL = round(CTA_END + OUTRO, 3)


def at(sid, mot):
    """Instant approximatif où le mot est dit (proportionnel à sa place dans la phrase)."""
    s, d = seg_t[sid]
    i = TXT[sid].lower().find(mot.lower())
    if i < 0:
        raise SystemExit(f"mot introuvable dans « {sid} » : {mot}")
    return round(s + d * i / len(TXT[sid]), 3)


def win_h(pl):
    return round(WW / pl.get("ratio", RATIO) / 2) * 2


# --- plans : intro logo, un plan par phrase, logo de fin ---
shots = [{"kind": "intro", "start": 0.0}]
for sid, _ in SEGS:
    shots.append({"kind": sid, "start": INTRO if sid == SEGS[0][0] else seg_t[sid][0] - 0.12})
shots.append({"kind": "outro", "start": CTA_END})
for i, s in enumerate(shots):
    s["start"] = round(s["start"], 3)
    s["dur"] = round((shots[i + 1]["start"] if i + 1 < len(shots) else TOTAL) - s["start"], 3)
    pl = PLANS.get(s["kind"])
    if pl and pl.get("media", {}).get("kind") == "video":
        s["clip"] = f"assets/clips/{s['kind']}.mp4"
        s["media"] = dict(pl["media"], h=win_h(pl))

# --- sous-titres : groupes de 2-3 mots ---
caps = []
for sid, text in SEGS:
    s, d = seg_t[sid]
    groups, cur = [], []
    for w in text.split(" "):
        cur.append(w)
        if len(cur) >= 3 or w[-1] in ",.:…?!" or (len(cur) == 2 and len(" ".join(cur)) > 15):
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
    nb = caps[i + 1][0] if i + 1 < len(caps) else b + 0.4
    caps[i][1] = round(min(max(b, a + 0.4), nb), 3)


def esc(s):
    return html.escape(s, quote=True)


def core(w):
    w = w.strip(",.:…?!\u00a0").lower()
    for p in ("d'", "l'", "s'", "c'"):
        if w.startswith(p):
            w = w[2:]
    return w


def cap_html(words):
    return " ".join(f'<span class="w{" hl" if core(w) in KEY else ""}">{esc(w)}</span>' for w in words)


def letters(text):
    return "".join(f"<span class=l>{esc(c) if c != ' ' else '&nbsp;'}</span>" for c in text)


CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ENTER = '<svg viewBox="0 0 24 24"><path d="M19 5v7a2 2 0 0 1-2 2H6m0 0l4-4m-4 4l4 4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
IMG = {f.name: Image.open(f).size for f in (ROOT / "assets/src").glob("*.jpg")}

n_label = sum(1 for p in PLANS.values() if p.get("label"))
k_label = 0
body, js, sfx = [], [], []
z = 10
for i, s in enumerate(shots):
    k, st, du = s["kind"], s["start"], s["dur"]
    sid = f"s{i:02d}"
    z += 3
    pl = PLANS.get(k, {})
    typ = pl.get("type", k)
    med = pl.get("media")
    H = win_h(pl) if pl else 0
    block = H + (156 if pl.get("chips") else 0)  # fenêtre (+ pastilles) centrée entre l'étiquette et les sous-titres
    top = WT if typ in ("titre", "cta") else 330 + (1160 - block) // 2
    chips_top = top + H + 46
    # --- média : fenêtre vidéo ou image qui se déplace (type Ken Burns) ---
    if med and med["kind"] == "video":
        if med.get("mode") == "plein":
            body.append(f'<video id="v{i:02d}" class="clip vid" data-start="{st}" data-duration="{du}" data-track-index="{1 + i % 2}" src="{s["clip"]}" muted playsinline style="z-index:{z}"></video>')
            js.append(f'tl.fromTo("#v{i:02d}", {{ scale: 1.15 }}, {{ scale: 1.0, duration: 0.6, ease: "power3.out" }}, {st});')
        else:
            body.append(f'<video id="v{i:02d}" class="clip win" data-start="{st}" data-duration="{du}" data-track-index="{1 + i % 2}" src="{s["clip"]}" muted playsinline style="left:{WL}px;top:{top}px;width:{WW}px;height:{H}px;z-index:{z}"></video>')
            js.append(f'tl.fromTo("#v{i:02d}", {{ scale: 0.88, y: 90, opacity: 0 }}, {{ scale: 1, y: 0, opacity: 1, duration: 0.42, ease: "back.out(1.5)" }}, {st});')
    elif med and med["kind"] == "image":
        iw, ih = IMG[med["file"]]
        steps = med["steps"]
        sc = lambda b: WW / b[2]
        body.append(f'<div id="w{i:02d}" class="clip win" data-start="{st}" data-duration="{du}" data-track-index="{1 + i % 2}" style="left:{WL}px;top:{top}px;width:{WW}px;height:{H}px;z-index:{z}"><img id="im{i:02d}" src="assets/src/{med["file"]}" style="width:{iw}px;height:{ih}px"></div>')
        for b in steps:
            assert b[0] + b[2] <= iw + 1 and b[1] + b[2] / (WW / H) <= ih + 1, (k, b, iw, ih)
        b0 = steps[0]
        js.append(f'tl.fromTo("#w{i:02d}", {{ scale: 0.88, y: 90, opacity: 0 }}, {{ scale: 1, y: 0, opacity: 1, duration: 0.42, ease: "back.out(1.5)" }}, {st});')
        js.append(f'gsap.set("#im{i:02d}", {{ transformOrigin: "0 0", scale: {sc(b0):.4f}, x: {-b0[0] * sc(b0):.1f}, y: {-b0[1] * sc(b0):.1f} }});')
        seg_d = (du - 0.35) / (len(steps) - 1)
        for j, b in enumerate(steps[1:]):
            js.append(f'tl.to("#im{i:02d}", {{ scale: {sc(b):.4f}, x: {-b[0] * sc(b):.1f}, y: {-b[1] * sc(b):.1f}, duration: {seg_d:.3f}, ease: "sine.inOut" }}, {round(st + 0.2 + j * seg_d, 3)});')
    attrs = f'id="{sid}" class="clip ov" data-start="{st}" data-duration="{du}" data-track-index="{3 + i % 2}" style="z-index:{z + 1}"'
    inner, ej = "", []

    def label_html():
        global k_label
        k_label += 1
        return (f'<div class="chk"><div class="chk-ic">{CHECK}</div><div class="chk-t">{esc(pl["label"])}</div>'
                f'<div class="chk-n">{k_label}/{n_label}</div></div>')

    def label_tw():
        return [f'tl.from("#{sid} .chk", {{ x: -1100, duration: 0.45, ease: "power4.out" }}, {st + 0.08});',
                f'tl.from("#{sid} .chk-ic", {{ scale: 0, rotation: -90, duration: 0.35, ease: "back.out(2.5)" }}, {st + 0.4});',
                f'tl.from("#{sid} .chk-n", {{ opacity: 0, y: 30, duration: 0.3, ease: "power2.out" }}, {st + 0.5});']

    def chips_html():
        out = "".join(f'<div class="chip"><b style="background:{c}"></b>{esc(t)}</div>' for t, _, c in pl["chips"])
        return f'<div class="chips" style="top:{chips_top}px">{out}</div>'

    def chips_tw():
        tw = []
        for j, (_, mot, _) in enumerate(pl["chips"]):
            tc = max(st + 0.4, at(k, mot) - 0.1)
            tw.append(f'tl.from("#{sid} .chip:nth-child({j + 1})", {{ scale: 0, y: 40, opacity: 0, duration: 0.3, ease: "back.out(2.4)" }}, {tc});')
            sfx.append([round(tc, 3), "pop-mid", 0.5])
        return tw

    if typ in ("intro", "outro"):
        extra = ""
        if typ == "outro":
            extra = (f'<div class="in-site">{esc(M["site"])}</div>'
                     f'<div class="in-sub"><span>ABONNE-TOI POUR PLUS D\'ACTUS IA</span></div>')
        inner = f'''<div class="in-bg"></div><div class="in-rings"><i></i><i></i><i></i></div>
  <div class="in-streaks"><i></i><i></i><i></i><i></i></div>
  <div class="in-logo"><img src="assets/brand/logo.png" alt="{esc(M["nom"])}"></div>
  {'<div class="in-kick"><span>' + esc(M["kicker"]) + '</span></div>' if typ == "intro" else ""}{extra}'''
        t0 = st
        ej = [f'tl.fromTo("#{sid} .in-rings i", {{ scale: 0.3, opacity: 0.9 }}, {{ scale: 2.6, opacity: 0, duration: 1.1, ease: "power2.out", stagger: 0.22 }}, {t0 + 0.15});',
              f'tl.fromTo("#{sid} .in-streaks i", {{ x: -1300, opacity: 1 }}, {{ x: 1400, duration: 0.55, ease: "power3.inOut", stagger: 0.07 }}, {t0 + 0.05});',
              f'tl.fromTo("#{sid} .in-logo", {{ scale: 0.45, rotation: -8, opacity: 0 }}, {{ scale: 1, rotation: 0, opacity: 1, duration: 0.65, ease: "back.out(1.8)" }}, {t0 + 0.25});',
              f'tl.to("#{sid} .in-logo", {{ y: -16, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: 2 }}, {t0 + 0.95});']
        sfx += [[t0 + 0.05, "whoosh-big", 0.5], [t0 + 0.3, "hit", 0.4], [t0 + 0.9, "shimmer", 0.4]]
        if typ == "intro":
            ej += [f'tl.from("#{sid} .in-kick", {{ scaleX: 0, duration: 0.4, ease: "back.out(1.8)" }}, {t0 + 1.05});',
                   f'tl.to("#{sid} .in-logo, #{sid} .in-kick", {{ scale: 1.12, duration: 0.45, ease: "power2.in" }}, {t0 + du - 0.5});']
            sfx.append([t0 + 1.05, "pop-high", 0.5])
        else:
            ej += [f'tl.from("#{sid} .in-site", {{ y: 80, opacity: 0, duration: 0.45, ease: "back.out(2)" }}, {t0 + 1.2});',
                   f'tl.from("#{sid} .in-sub", {{ scaleX: 0, duration: 0.45, ease: "back.out(1.8)" }}, {t0 + 1.5});']
            sfx += [[t0 + 1.2, "chime", 0.45], [t0 + 1.5, "pop-high", 0.45]]
    elif typ == "hook":
        inner = f'''<div class="hk-shade"></div><div class="hk-top"><span>{esc(pl["tape"])}</span></div>
  <div class="hk"><div class="hk-1">{letters(pl["l1"])}</div>
  <div class="hk-arrow"><svg viewBox="0 0 100 120"><path d="M50 5v90M15 62l35 38 35-38" fill="none" stroke="{C["cyan"]}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="hk-2">{letters(pl["l2"])}</div></div><div class="hk-tag"><span>{esc(pl["tag"])}</span></div>'''
        t1, t2 = at(k, pl["mot1"]), at(k, pl["mot2"])
        tt = min(at(k, pl["mot_tag"]) + 0.15, st + du - 0.45)
        ej = [f'tl.from("#{sid} .hk-top", {{ scaleX: 0, duration: 0.35, ease: "back.out(1.8)" }}, {st + 0.1});',
              f'tl.from("#{sid} .hk-1 .l", {{ y: 170, opacity: 0, duration: 0.3, ease: "back.out(2.2)", stagger: 0.03 }}, {max(st + 0.4, t1 - 0.25)});',
              f'tl.from("#{sid} .hk-arrow", {{ scaleY: 0, transformOrigin: "50% 0%", duration: 0.3, ease: "power3.out" }}, {t2 - 0.45});',
              f'tl.from("#{sid} .hk-2 .l", {{ scale: 2.6, opacity: 0, duration: 0.26, ease: "expo.in", stagger: 0.025 }}, {t2 - 0.25});',
              f'tl.fromTo("#{sid} .hk", {{ x: 0 }}, {{ x: 14, duration: 0.04, ease: "none", yoyo: true, repeat: 5, immediateRender: false }}, {t2 + 0.2});',
              f'tl.from("#{sid} .hk-tag", {{ scaleX: 0, duration: 0.35, ease: "back.out(1.8)" }}, {tt});']
        sfx += [[st + 0.1, "swish-01", 0.4], [round(t1 - 0.2, 3), "whoosh-light", 0.4], [round(t2 + 0.2, 3), "stamp", 0.6], [round(tt, 3), "pop-high", 0.45]]
    elif typ == "titre":
        inner = f'''<div class="badge"><span>{esc(pl["badge"])}</span></div>
  <div class="name"><div class="name-in"><div class="nm">{letters(pl["nom"])}</div><div class="name-sub">{esc(pl["sous"])}</div></div></div>'''
        ej = [f'tl.from("#{sid} .name", {{ y: 280, opacity: 0, duration: 0.45, ease: "power4.out" }}, {st + 0.12});',
              f'tl.from("#{sid} .nm .l", {{ y: 90, opacity: 0, duration: 0.3, ease: "back.out(2)", stagger: 0.03 }}, {st + 0.3});',
              f'tl.from("#{sid} .name-sub", {{ opacity: 0, x: -60, duration: 0.4, ease: "power3.out" }}, {st + 0.8});',
              f'tl.from("#{sid} .badge", {{ scale: 0, rotation: -200, duration: 0.5, ease: "back.out(1.7)" }}, {at(k, pl["mot_badge"]) - 0.1});',
              f'tl.to("#{sid} .badge", {{ rotation: 10, duration: {round(du - 1.4, 3)}, ease: "none" }}, {st + 1.35});']
        sfx += [[st + 0.12, "whoosh-medium", 0.4], [round(at(k, pl["mot_badge"]) - 0.1, 3), "stamp", 0.5], [st + 0.6, "shimmer", 0.35]]
    elif typ == "atout":
        inner = label_html() + (chips_html() if pl.get("chips") else "")
        ej = label_tw() + (chips_tw() if pl.get("chips") else [])
        sfx += [[st + 0.08, "whoosh-light", 0.4], [st + 0.42, "pop-mid", 0.5]]
        if k == "secu":
            sfx.append([at(k, "accord") - 0.1, "notif-up", 0.5])
    elif typ == "terminal":
        cmd = pl["commande"]
        inner = label_html() + f'''<div class="term"><div class="term-bar"><i></i><i></i><i></i><span>Terminal</span></div>
  <div class="term-body"><span class="prompt">$</span><span class="cmd">{letters(cmd)}</span><span class="cur"></span></div></div>
  <div class="enter">{ENTER}<span>ENTRÉE</span></div>'''
        TY = 0.1
        tc = max(st + 0.9, at(k, pl["mot"]))  # la commande se tape pendant que la voix la annonce
        n = len(cmd)
        ej = label_tw() + [
            f'tl.from("#{sid} .term", {{ scale: 0.8, y: 120, opacity: 0, duration: 0.45, ease: "back.out(1.6)" }}, {st + 0.2});',
            f'tl.from("#{sid} .cmd .l", {{ opacity: 0, duration: 0.01, stagger: {TY} }}, {round(tc, 3)});',
            f'tl.to("#{sid} .cur", {{ opacity: 0, duration: 0.01, repeat: {int(du / 0.5)}, yoyo: true, repeatDelay: 0.25 }}, {st + 0.7});',
            f'tl.from("#{sid} .enter", {{ scale: 0, opacity: 0, duration: 0.35, ease: "back.out(2.4)" }}, {round(tc + n * TY + 0.25, 3)});',
            f'tl.to("#{sid} .enter", {{ scale: 1.1, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 5 }}, {round(tc + n * TY + 0.65, 3)});']
        sfx += [[st + 0.08, "whoosh-light", 0.4], [round(tc, 3), "typing-medium", 0.55],
                [round(tc + n * TY + 0.25, 3), "pop-high", 0.5]]
    elif typ == "cta":
        inner = f'''<div class="cta"><div class="cta-btn">{CHECK}<span>ABONNE-TOI</span></div>
  <div class="cta-site">{esc(M["site"])}</div><div class="cta-sub">PLUS D'ACTUS IA</div></div>'''
        ej = [f'tl.from("#{sid} .cta", {{ y: 420, opacity: 0, duration: 0.5, ease: "power4.out" }}, {st + 0.1});',
              f'tl.from("#{sid} .cta-site", {{ scale: 0.4, opacity: 0, duration: 0.4, ease: "back.out(2)" }}, {at(k, "GenRank") - 0.1});',
              f'tl.from("#{sid} .cta-sub", {{ y: 40, opacity: 0, duration: 0.35, ease: "power3.out" }}, {at(k, "GenRank") + 0.2});',
              f'tl.to("#{sid} .cta-btn", {{ scale: 1.07, duration: 0.32, ease: "sine.inOut", yoyo: true, repeat: {max(1, int((du - 0.9) / 0.32) // 2 * 2 - 1)} }}, {at(k, "Abonne") - 0.1});']
        sfx += [[st + 0.1, "whoosh-medium", 0.4], [round(at(k, "Abonne"), 3), "pop-high", 0.5], [round(at(k, "GenRank") - 0.1, 3), "ding-01", 0.5]]
    body.append(f'<div {attrs}>\n  {inner}\n</div>')
    js += ej
    if typ not in ("intro", "outro"):
        js.append(f'tl.fromTo("#flash", {{ opacity: 0.4 }}, {{ opacity: 0, duration: 0.25, ease: "power2.out", immediateRender: false }}, {st});')

# --- éléments permanents ---
LEN = round(CTA_END - LEAD + 0.2, 3)
body.append(f'<div id="brandbar" class="clip" data-start="{LEAD - 0.2}" data-duration="{LEN}" data-track-index="6" style="z-index:80"><img src="assets/brand/mot.png" alt=""></div>')
body.append(f'<div id="footer" class="clip" data-start="{LEAD - 0.2}" data-duration="{LEN}" data-track-index="7" style="z-index:80"><span>{esc(M["site"])}</span><b>·</b><span>{esc(M["kicker"])}</span></div>')
js.append(f'tl.from("#brandbar", {{ y: -220, duration: 0.5, ease: "back.out(1.6)" }}, {LEAD});')
js.append(f'tl.from("#footer", {{ y: 120, opacity: 0, duration: 0.5, ease: "power3.out" }}, {LEAD + 0.2});')
body.append(f'<div id="flash" class="clip" data-start="{INTRO}" data-duration="{round(CTA_END - INTRO, 3)}" data-track-index="9" style="z-index:92"></div>')

for j, tw in enumerate((INTRO, CTA_END)):
    body.append(f'<div id="wipe{j}" class="clip wipe" data-start="{round(tw - 0.35, 3)}" data-duration="0.7" data-track-index="{10 + j}" style="z-index:95"><div class="wp a"></div><div class="wp b"></div></div>')
    js.append(f'tl.fromTo("#wipe{j} .wp", {{ x: 1400 }}, {{ x: 0, duration: 0.33, ease: "power3.in", stagger: 0.04 }}, {round(tw - 0.35, 3)});')
    js.append(f'tl.to("#wipe{j} .wp", {{ x: -1400, duration: 0.33, ease: "power3.out", stagger: 0.04 }}, {round(tw, 3)});')
    sfx.append([round(tw - 0.3, 3), "swish-02", 0.45])

for n, (a, b, g) in enumerate(caps):
    body.append(f'<div id="c{n:03d}" class="clip cap" data-start="{a}" data-duration="{round(b - a, 3)}" data-track-index="{20 + n % 2}" style="z-index:70"><div class="cap-in">{cap_html(g)}</div></div>')
    js.append(f'tl.from("#c{n:03d} .cap-in", {{ scale: 0.75, y: 30, opacity: 0, duration: 0.16, ease: "back.out(2.5)" }}, {a});')

js.append(f'tl.fromTo("#progress", {{ scaleX: 0 }}, {{ scaleX: 1, duration: {TOTAL}, ease: "none" }}, 0);')
js.append(f'tl.fromTo("#grid", {{ y: 0 }}, {{ y: -240, duration: {TOTAL}, ease: "none" }}, 0);')
js.append(f'tl.fromTo("#orb1", {{ x: -100, y: 0 }}, {{ x: 160, y: 140, duration: {TOTAL}, ease: "sine.inOut" }}, 0);')
js.append(f'tl.fromTo("#orb2", {{ x: 100, y: 0 }}, {{ x: -160, y: -160, duration: {TOTAL}, ease: "sine.inOut" }}, 0);')

CSS = (ROOT / "tools/style.css").read_text(encoding="utf-8")
for key, val in {"@BLUE@": C["bleu"], "@CYAN@": C["cyan"], "@NAVY@": C["marine"], "@NIGHT@": C["nuit"]}.items():
    CSS = CSS.replace(key, val)

timing = {"total": TOTAL, "lead": LEAD, "gap": GAP, "segments": [sid for sid, _ in SEGS],
          "vo": {sid: seg_t[sid][0] for sid, _ in SEGS}, "shots": shots,
          "sfx": sorted([[round(a, 3), n, v] for a, n, v in sfx if a >= 0])}
json.dump(timing, open(ROOT / "tools/timing.json", "w"), indent=1, ensure_ascii=False)

page = f"""<!doctype html>
<html lang="fr" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>{CSS}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
      <div id="ground" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="0"><div id="grid"></div><div id="orb1"></div><div id="orb2"></div></div>
{chr(10).join(body)}
      <div id="progress" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="30"></div>
      <audio id="mix" data-start="0" data-duration="{TOTAL}" data-track-index="50" src="audio/mix.wav" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      {(chr(10) + '      ').join(js)}
      tl.to({{}}, {{ duration: {TOTAL} }}, 0);
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
"""
(ROOT / "index.html").write_text(page, encoding="utf-8")
print(f"index.html : {len(shots)} plans, {len(caps)} sous-titres, {len(timing['sfx'])} bruitages, durée {TOTAL} s")
