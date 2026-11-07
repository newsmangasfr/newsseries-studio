"""Vidéo de présentation produit AchatBoo (HyperFrames, 1080x1920, verticale).
Lit tools/produit.json (boutique, produit, plans) et tools/vo.json (script), mesure la voix off (audio/vo/*.wav) et
génère index.html + tools/timing.json. Ensuite : clips.py (extraits vidéo), music.py, make_audio.py.
Usage (depuis le dossier du projet) : python3 tools/build.py
"""
import html
import re
import json
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = json.load(open(ROOT / "tools/produit.json", encoding="utf-8"))
VO = json.load(open(ROOT / "tools/vo.json", encoding="utf-8"))
B, P, C, PLANS = CFG["boutique"], CFG["produit"], CFG["couleurs"], CFG["plans"]
INTRO, OUTRO, HOLD, GAP = 2.6, 3.2, 1.0, 0.28
LEAD = INTRO + 0.25
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
    """Instant approximatif où le mot est prononcé (proportionnel à sa place dans la phrase)."""
    s, d = seg_t[sid]
    txt = TXT[sid]
    i = txt.lower().find(mot.lower())
    return round(s + d * max(i, 0) / len(txt), 3)


# --- plans : intro logo, un plan par phrase, logo de fin ---
shots = [{"kind": "intro", "start": 0.0}]
for sid, _ in SEGS:
    shots.append({"kind": sid, "start": LEAD - 0.25 if sid == SEGS[0][0] else seg_t[sid][0] - 0.12})
shots.append({"kind": "outro", "start": CTA_END})
for i, s in enumerate(shots):
    s["start"] = round(s["start"], 3)
    s["dur"] = round((shots[i + 1]["start"] if i + 1 < len(shots) else TOTAL) - s["start"], 3)
    if s["kind"] in PLANS:
        pl = PLANS[s["kind"]]
        s["clip"] = f"assets/clips/{s['kind']}.mp4"
        s["src"] = {"extraits": pl["extraits"], "cadre": pl.get("cadre", "carre"), "cx": pl.get("cx", 0.5), "teinte": pl.get("teinte", "")}

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
    w = w.strip(",.:…?!").lower()
    for p in ("d'", "l'", "s'", "c'"):
        if w.startswith(p):
            w = w[2:]
    return w


def cap_html(words):
    return " ".join(f'<span class="w{" hl" if core(w) in KEY else ""}">{esc(w)}</span>' for w in words)


def letters(text):
    return "".join(f"<span class=l>{esc(c) if c != ' ' else '&nbsp;'}</span>" for c in text)


CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
PIN = f'<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z" fill="{C["orange"]}"/></svg>'
CART = '<svg viewBox="0 0 24 24"><path d="M3 4h2.2l2.3 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L20.5 8H7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="19.5" r="1.7" fill="#fff"/><circle cx="17" cy="19.5" r="1.7" fill="#fff"/></svg>'
STAR = "".join(f"{540 + (330 if k % 2 == 0 else 285) * __import__('math').cos(__import__('math').pi * k / 14):.1f},"
               f"{540 + (330 if k % 2 == 0 else 285) * __import__('math').sin(__import__('math').pi * k / 14):.1f} " for k in range(28))

body, js, sfx = [], [], []
n_atout = sum(1 for p in PLANS.values() if p["type"] == "atout")
k_atout = 0
z = 10
for i, s in enumerate(shots):
    k, st, du = s["kind"], s["start"], s["dur"]
    sid = f"s{i:02d}"
    z += 2
    pl = PLANS.get(k, {})
    typ = pl.get("type", k)
    if "clip" in s:
        body.append(f'<video id="v{i:02d}" class="clip vid" data-start="{st}" data-duration="{du}" data-track-index="{1 + i % 2}" src="{s["clip"]}" muted playsinline style="z-index:{z}"></video>')
        js.append(f'tl.fromTo("#v{i:02d}", {{ scale: 1.1 }}, {{ scale: 1.0, duration: 0.45, ease: "power3.out" }}, {st});')
    attrs = f'id="{sid}" class="clip ov" data-start="{st}" data-duration="{du}" data-track-index="{3 + i % 2}" style="z-index:{z + 1}"'
    inner, ej = "", []
    if typ == "intro" or typ == "outro":
        extra = (f'<div class="lo-site">{esc(B["site"])}</div><div class="lo-ville">{PIN}<span>{esc(B["ville"])}</span></div>'
                 if typ == "outro" else "")
        inner = f'''<div class="lo-bg"></div><div class="lo-burst"></div><div class="lo-ring"></div>
  <div class="lo-lines"><i></i><i></i><i></i></div>
  <div class="lo-sac"><img src="assets/brand/sac.png" alt=""></div>
  <div class="lo-mask"><img class="lo-txt" src="assets/brand/texte.png" alt="{esc(B["nom"])}"></div>
  <div class="lo-slogan"><span>{esc(B["slogan"])}</span></div>{extra}'''
        t0 = st
        ej = [f'tl.fromTo("#{sid} .lo-burst", {{ scale: 0 }}, {{ scale: 1, duration: 0.5, ease: "expo.out" }}, {t0 + 0.05});',
              f'tl.fromTo("#{sid} .lo-ring", {{ scale: 0.2, opacity: 1 }}, {{ scale: 2.2, opacity: 0, duration: 0.8, ease: "power2.out" }}, {t0 + 0.55});',
              f'tl.from("#{sid} .lo-sac", {{ y: -1300, rotation: -25, duration: 0.6, ease: "bounce.out" }}, {t0 + 0.05});',
              f'tl.from("#{sid} .lo-lines i", {{ x: -700, opacity: 0, duration: 0.35, ease: "power3.out", stagger: 0.06 }}, {t0 + 0.5});',
              f'tl.to("#{sid} .lo-lines i", {{ x: -60, opacity: 0, duration: 0.4, ease: "power2.in", stagger: 0.05 }}, {t0 + 1.0});',
              f'tl.from("#{sid} .lo-txt", {{ x: -1000, duration: 0.5, ease: "power4.out" }}, {t0 + 0.7});',
              f'tl.from("#{sid} .lo-slogan", {{ scaleX: 0, duration: 0.4, ease: "back.out(1.8)" }}, {t0 + 1.15});',
              f'tl.to("#{sid} .lo-sac", {{ rotation: 6, duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: 3 }}, {t0 + 1.45});']
        sfx += [[t0 + 0.05, "whoosh-big", 0.45], [t0 + 0.55, "hit", 0.35], [t0 + 0.7, "whoosh-medium", 0.35], [t0 + 1.15, "pop-high", 0.5]]
        if typ == "outro":
            ej += [f'tl.from("#{sid} .lo-site", {{ y: 80, opacity: 0, duration: 0.4, ease: "back.out(2)" }}, {t0 + 1.4});',
                   f'tl.from("#{sid} .lo-ville", {{ y: 80, opacity: 0, duration: 0.4, ease: "back.out(2)" }}, {t0 + 1.6});']
            sfx += [[t0 + 1.45, "chime", 0.4]]
        else:
            ej += [f'tl.to("#{sid} .lo-sac, #{sid} .lo-mask, #{sid} .lo-slogan", {{ scale: 1.12, duration: 0.5, ease: "power2.in" }}, {t0 + du - 0.5});']
    elif typ == "hook":
        l1, l2 = pl["texte"]
        inner = f'''<div class="hk-shade"></div><div class="hk"><div class="hk-1">{letters(l1)}</div>
  <div class="hk-arrow"><svg viewBox="0 0 100 120"><path d="M50 5v90M15 62l35 38 35-38" fill="none" stroke="{C["orange"]}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="hk-2">{letters(l2)}</div></div><div class="hk-tag"><span>{esc(pl.get("tag", ""))}</span></div>'''
        t1, t2 = at(k, pl["mot1"]), at(k, pl["mot2"])
        ej = [f'tl.from("#{sid} .hk-1 .l", {{ y: 160, opacity: 0, duration: 0.3, ease: "back.out(2.2)", stagger: 0.035 }}, {max(st + 0.05, t1 - 0.25)});',
              f'tl.from("#{sid} .hk-arrow", {{ scaleY: 0, transformOrigin: "50% 0%", duration: 0.3, ease: "power3.out" }}, {t2 - 0.35});',
              f'tl.from("#{sid} .hk-2", {{ scale: 3, opacity: 0, duration: 0.28, ease: "expo.in" }}, {t2 - 0.2});',
              f'tl.fromTo("#{sid} .hk", {{ x: 0 }}, {{ x: 14, duration: 0.04, ease: "none", yoyo: true, repeat: 5, immediateRender: false }}, {t2 + 0.08});']
        sfx += [[t1 - 0.2, "whoosh-light", 0.35], [t2 + 0.08, "stamp", 0.55]]
        if pl.get("tag"):
            tt = at(k, pl.get("mot_tag", pl["tag"].split()[0]))
            ej.append(f'tl.from("#{sid} .hk-tag", {{ scaleX: 0, duration: 0.35, ease: "back.out(1.8)" }}, {tt - 0.1});')
            sfx.append([tt - 0.1, "swish-01", 0.4])
    elif typ == "titre":
        inner = f'''<div class="badge"><span>{esc(P["badge"])}</span></div>
  <div class="name"><div class="name-in">{"".join(f'<div class="nm">{letters(x)}</div>' for x in P["nom"])}<div class="name-sub">{esc(P["sous_titre"])}</div></div></div>'''
        ej = [f'tl.from("#{sid} .name", {{ y: 260, opacity: 0, duration: 0.45, ease: "power4.out" }}, {st + 0.1});',
              f'tl.from("#{sid} .nm .l", {{ y: 90, opacity: 0, duration: 0.3, ease: "back.out(2)", stagger: 0.03 }}, {st + 0.3});',
              f'tl.from("#{sid} .name-sub", {{ opacity: 0, x: -60, duration: 0.4, ease: "power3.out" }}, {at(k, "velours") - 0.1});',
              f'tl.from("#{sid} .badge", {{ scale: 0, rotation: -200, duration: 0.5, ease: "back.out(1.7)" }}, {st + 0.55});',
              f'tl.to("#{sid} .badge", {{ rotation: 10, duration: {round(du - 1.1, 3)}, ease: "none" }}, {st + 1.05});']
        sfx += [[st + 0.1, "whoosh-medium", 0.35], [st + 0.6, "shimmer", 0.35]]
    elif typ == "atout":
        k_atout += 1
        inner = f'''<div class="chk"><div class="chk-ic">{CHECK}</div><div class="chk-t">{esc(pl["label"])}</div><div class="chk-n">{k_atout}/{n_atout}</div></div>'''
        ej = [f'tl.from("#{sid} .chk", {{ x: -1100, duration: 0.45, ease: "power4.out" }}, {st + 0.08});',
              f'tl.from("#{sid} .chk-ic", {{ scale: 0, rotation: -90, duration: 0.35, ease: "back.out(2.5)" }}, {st + 0.4});',
              f'tl.from("#{sid} .chk-n", {{ opacity: 0, y: 30, duration: 0.3, ease: "power2.out" }}, {st + 0.5});']
        sfx += [[st + 0.08, "whoosh-light", 0.35], [st + 0.42, "pop-mid", 0.5]]
    elif typ == "prix":
        old = f'<div class="px-old">{esc(P["ancien_prix"])} {esc(P["devise"])}</div>' if P.get("ancien_prix") else ""
        inner = f'''<div class="px"><svg class="px-star" viewBox="0 0 1080 1080"><polygon points="{STAR}" fill="{C["orange"]}"/></svg>
  <div class="px-in"><div class="px-tag">PRIX CHOC</div>{old}<div class="px-val">{letters(P["prix"])}</div><div class="px-cur">{esc(P["devise"])}</div></div></div>'''
        tp = at(k, pl.get("mot", "seulement"))
        ej = [f'tl.from("#{sid} .px", {{ scale: 3, rotation: -40, opacity: 0, duration: 0.32, ease: "expo.in" }}, {tp - 0.3});',
              f'tl.from("#{sid} .px-val .l", {{ y: -120, opacity: 0, duration: 0.25, ease: "back.out(2.5)", stagger: 0.05 }}, {tp + 0.05});',
              f'tl.to("#{sid} .px-star", {{ rotation: 25, duration: {round(du, 3)}, ease: "none" }}, {st});',
              f'tl.fromTo("#{sid} .px", {{ x: 0 }}, {{ x: 16, duration: 0.04, ease: "none", yoyo: true, repeat: 5, immediateRender: false }}, {tp + 0.02});']
        sfx += [[tp - 1.0, "riser-1s", 0.35], [tp + 0.02, "cash-register", 0.6], [tp + 0.02, "hit-low", 0.4]]
    elif typ == "cta":
        tel = f'<div class="cta-row">{esc(B["telephone"])}</div>' if B.get("telephone") else ""
        inner = f'''<div class="cta"><div class="cta-btn">{CART}<span>COMMANDE MAINTENANT</span></div>
  <div class="cta-site">{esc(B["site"])}</div>{tel}<div class="cta-ville">{PIN}<span>{esc(B["ville"])}</span></div></div>'''
        ej = [f'tl.from("#{sid} .cta", {{ y: 400, opacity: 0, duration: 0.5, ease: "power4.out" }}, {st + 0.05});',
              f'tl.from("#{sid} .cta-site", {{ scale: 0.4, opacity: 0, duration: 0.4, ease: "back.out(2)" }}, {at(k, "AchatBoo") - 0.1});',
              f'tl.from("#{sid} .cta-ville", {{ y: 60, opacity: 0, duration: 0.4, ease: "back.out(2)" }}, {at(k, "Ghollamallah") - 0.2});',
              f'tl.to("#{sid} .cta-btn", {{ scale: 1.07, duration: 0.32, ease: "sine.inOut", yoyo: true, repeat: {max(1, int((du - 0.8) / 0.32) // 2 * 2 - 1)} }}, {st + 0.6});']
        sfx += [[st + 0.05, "whoosh-medium", 0.35], [at(k, "AchatBoo") - 0.1, "ding-01", 0.45], [at(k, "Ghollamallah") - 0.2, "pop-mid", 0.4]]
    body.append(f'<div {attrs}>\n  {inner}\n</div>')
    js += ej

# --- éléments permanents ---
body.append(f'<div id="brandbar" class="clip" data-start="{LEAD - 0.25}" data-duration="{round(CTA_END - LEAD + 0.25, 3)}" data-track-index="6" style="z-index:80"><img src="assets/brand/logo.png" alt=""></div>')
body.append(f'<div id="footer" class="clip" data-start="{LEAD - 0.25}" data-duration="{round(CTA_END - LEAD + 0.25, 3)}" data-track-index="7" style="z-index:80">{PIN}<span>{esc(B["ville"])}</span><b>·</b><span>{esc(B["site"])}</span></div>')
js.append(f'tl.from("#brandbar", {{ y: -200, duration: 0.5, ease: "back.out(1.6)" }}, {LEAD});')
js.append(f'tl.from("#footer", {{ y: 120, opacity: 0, duration: 0.5, ease: "power3.out" }}, {LEAD + 0.2});')

# transitions : volet orange à la sortie de l'intro et avant le logo de fin
for j, tw in enumerate((LEAD - 0.25, CTA_END)):
    body.append(f'<div id="wipe{j}" class="clip wipe" data-start="{round(tw - 0.35, 3)}" data-duration="0.7" data-track-index="{8 + j}" style="z-index:95"><div class="wp a"></div><div class="wp b"></div></div>')
    js.append(f'tl.fromTo("#wipe{j} .wp", {{ x: 1400 }}, {{ x: 0, duration: 0.33, ease: "power3.in", stagger: 0.04 }}, {round(tw - 0.35, 3)});')
    js.append(f'tl.to("#wipe{j} .wp", {{ x: -1400, duration: 0.33, ease: "power3.out", stagger: 0.04 }}, {round(tw + 0.0, 3)});')
    sfx.append([round(tw - 0.3, 3), "swish-02", 0.45])

# sous-titres
for n, (a, b, g) in enumerate(caps):
    body.append(f'<div id="c{n:03d}" class="clip cap" data-start="{a}" data-duration="{round(b - a, 3)}" data-track-index="{20 + n % 2}" style="z-index:70"><div class="cap-in">{cap_html(g)}</div></div>')
    js.append(f'tl.from("#c{n:03d} .cap-in", {{ scale: 0.75, y: 30, opacity: 0, duration: 0.16, ease: "back.out(2.5)" }}, {a});')

js.append(f'tl.fromTo("#progress", {{ scaleX: 0 }}, {{ scaleX: 1, duration: {TOTAL}, ease: "none" }}, 0);')

O, O2, M, CR = C["orange"], C["orange2"], C["marine"], C["creme"]
CSS = f"""
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: {M}; }}
#root {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; font-family: "Inter", sans-serif; color: #fff; }}
#ground {{ position: absolute; inset: 0; background: {M}; }}
.vid {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }}
.ov {{ position: absolute; inset: 0; overflow: hidden; }}
.l {{ display: inline-block; }}
img {{ display: block; }}

/* logo intro / fin */
.lo-bg {{ position: absolute; inset: 0; background: radial-gradient(circle at 50% 42%, #ffffff 0%, {CR} 60%, #ffe3c7 100%); }}
.lo-burst {{ position: absolute; left: 540px; top: 760px; width: 1500px; height: 1500px; margin: -750px 0 0 -750px; border-radius: 50%;
  background: repeating-conic-gradient(from 0deg, #ff6a0014 0deg 8deg, #ff6a0000 8deg 16deg); }}
.lo-ring {{ position: absolute; left: 540px; top: 700px; width: 600px; height: 600px; margin: -300px 0 0 -300px; border-radius: 50%; border: 18px solid {O}; opacity: 0; }}
.lo-sac {{ position: absolute; left: 540px; top: 470px; width: 470px; margin-left: -235px; transform-origin: 50% 100%; }}
.lo-sac img {{ width: 470px; }}
.lo-lines {{ position: absolute; left: 90px; top: 640px; }}
.lo-lines i {{ display: block; width: 230px; height: 16px; border-radius: 8px; background: {O}; margin-bottom: 34px; }}
.lo-lines i:nth-child(2) {{ width: 170px; margin-left: 50px; }}
.lo-mask {{ position: absolute; left: 60px; top: 1010px; width: 960px; overflow: hidden; }}
.lo-txt {{ width: 960px; }}
.lo-slogan {{ position: absolute; left: 0; right: 0; top: 1230px; text-align: center; }}
.lo-slogan span {{ display: inline-block; background: {M}; color: #fff; font-weight: 900; font-size: 62px; letter-spacing: 3px; padding: 14px 40px; border-radius: 60px; box-shadow: 0 10px 0 {O}; }}
.lo-site {{ position: absolute; left: 0; right: 0; top: 1420px; text-align: center; font-weight: 900; font-size: 84px; color: {O}; }}
.lo-ville {{ position: absolute; left: 0; right: 0; top: 1550px; display: flex; justify-content: center; align-items: center; gap: 14px; font-weight: 800; font-size: 56px; color: {M}; }}
.lo-ville svg {{ width: 64px; height: 64px; }}

/* bandeau logo et pied de page */
#brandbar {{ position: absolute; left: 50%; top: 56px; width: 600px; margin-left: -300px; padding: 22px 34px; background: #fff; border-radius: 40px; box-shadow: 0 14px 40px #0006; }}
#brandbar img {{ width: 532px; }}
#footer {{ position: absolute; left: 0; right: 0; top: 1826px; display: flex; justify-content: center; align-items: center; gap: 14px; font-weight: 800; font-size: 38px; color: #fff; text-shadow: 0 3px 10px #000a; }}
#footer svg {{ width: 42px; height: 42px; }}
#footer b {{ color: {O}; }}
#progress {{ position: absolute; left: 0; top: 0; width: 1080px; height: 14px; background: linear-gradient(90deg, {O2}, {O}); transform-origin: 0 50%; z-index: 120; }}

/* accroche */
.hk-shade {{ position: absolute; inset: 0; background: linear-gradient(180deg, #0000 25%, #000a 50%, #0000 75%); }}
.hk {{ position: absolute; left: 0; right: 0; top: 560px; display: flex; flex-direction: column; align-items: center; gap: 4px; }}
.hk-1 {{ font-weight: 900; font-size: 150px; line-height: 1; letter-spacing: -3px; color: #fff; text-shadow: 0 8px 0 {M}, 0 0 40px #0008; white-space: nowrap; }}
.hk-arrow svg {{ width: 120px; height: 150px; display: block; }}
.hk-2 {{ font-weight: 900; font-size: 300px; line-height: 0.9; letter-spacing: -8px; color: {O}; text-shadow: 0 12px 0 {M}, 0 0 60px #0009; white-space: nowrap; }}
.hk-tag {{ position: absolute; left: 0; right: 0; top: 1240px; text-align: center; }}
.hk-tag span {{ display: inline-block; background: #fff; color: {M}; font-weight: 900; font-size: 60px; padding: 12px 36px; border-radius: 14px; transform: rotate(-3deg); box-shadow: 0 10px 0 {O}; }}

/* nom du produit */
.badge {{ position: absolute; left: 790px; top: 300px; width: 240px; height: 240px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, {O2}, {O}); display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px #0007; border: 8px solid #fff; }}
.badge span {{ font-weight: 900; font-size: 42px; color: #fff; transform: rotate(-12deg); }}
.name {{ position: absolute; left: 60px; right: 60px; top: 1110px; }}
.name-in {{ background: #fff; border-radius: 34px; padding: 30px 40px 34px; box-shadow: 0 20px 50px #0008; border-bottom: 14px solid {O}; }}
.nm {{ font-weight: 900; font-size: 104px; line-height: 0.98; letter-spacing: -2px; color: {M}; white-space: nowrap; }}
.name-sub {{ margin-top: 12px; font-weight: 800; font-size: 54px; color: {O}; }}

/* atouts */
.chk {{ position: absolute; left: 50px; right: 50px; top: 222px; height: 120px; display: flex; align-items: center; gap: 24px; background: {M}; border: 5px solid {O}; border-radius: 30px; padding: 0 30px 0 18px; box-shadow: 0 14px 30px #0008; }}
.chk-ic {{ flex: none; width: 88px; height: 88px; border-radius: 50%; background: {O}; display: flex; align-items: center; justify-content: center; }}
.chk-ic svg {{ width: 62px; height: 62px; }}
.chk-t {{ flex: 1; font-weight: 900; font-size: 54px; letter-spacing: -0.5px; color: #fff; white-space: nowrap; }}
.chk-n {{ flex: none; font-weight: 800; font-size: 40px; color: {O2}; }}

/* prix */
.px {{ position: absolute; left: 540px; top: 900px; width: 760px; height: 760px; margin: -380px 0 0 -380px; transform: rotate(-6deg); }}
.px-star {{ position: absolute; inset: 0; width: 760px; height: 760px; filter: drop-shadow(0 20px 30px #0009); }}
.px-in {{ position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
.px-tag {{ background: {M}; color: #fff; font-weight: 900; font-size: 52px; letter-spacing: 3px; padding: 8px 30px; border-radius: 12px; }}
.px-old {{ margin-top: 10px; font-weight: 800; font-size: 56px; color: #fff; opacity: 0.85; text-decoration: line-through; text-decoration-thickness: 6px; }}
.px-val {{ font-weight: 900; font-size: 148px; line-height: 1; letter-spacing: -5px; color: #fff; text-shadow: 0 8px 0 #b33f00; white-space: nowrap; margin-top: 8px; }}
.px-cur {{ font-weight: 900; font-size: 90px; line-height: 1; color: {M}; }}

/* appel à l'action */
.cta {{ position: absolute; left: 60px; right: 60px; top: 560px; background: #fff; border-radius: 40px; padding: 50px 40px 46px; display: flex; flex-direction: column; align-items: center; gap: 30px; box-shadow: 0 24px 60px #000a; border-bottom: 16px solid {O}; }}
.cta-btn {{ display: flex; align-items: center; gap: 20px; background: linear-gradient(180deg, {O2}, {O}); color: #fff; font-weight: 900; font-size: 54px; padding: 26px 40px; border-radius: 70px; box-shadow: 0 10px 0 #b33f00; white-space: nowrap; }}
.cta-btn svg {{ width: 66px; height: 66px; }}
.cta-site {{ font-weight: 900; font-size: 92px; letter-spacing: -2px; color: {M}; }}
.cta-row {{ font-weight: 800; font-size: 56px; color: {M}; }}
.cta-ville {{ display: flex; align-items: center; gap: 14px; font-weight: 800; font-size: 56px; color: {M}; }}
.cta-ville svg {{ width: 64px; height: 64px; }}

/* sous-titres */
.cap {{ position: absolute; left: 40px; right: 40px; top: 1500px; height: 280px; display: flex; align-items: center; justify-content: center; }}
.cap-in {{ text-align: center; font-weight: 900; font-size: 84px; line-height: 1.08; letter-spacing: -1px; color: #fff; text-shadow: 0 6px 0 #000, 0 0 24px #000c; }}
.cap .hl {{ color: {O2}; }}

/* volet de transition */
.wipe {{ position: absolute; inset: 0; overflow: hidden; pointer-events: none; }}
.wp {{ position: absolute; top: -200px; left: -300px; width: 1700px; height: 2400px; transform-origin: 50% 50%; }}
.wp.a {{ background: {O2}; }}
.wp.b {{ background: {O}; }}
"""


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
      <div id="ground" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="0"></div>
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
