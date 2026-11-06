#!/usr/bin/env python3
"""Write index.html and the scene compositions of one video from brand.json + spec.json.
usage: build.py <video_dir> --brand brand.json        (assets/clip.mp4 must already exist)

spec.json (only "layers" and friends you need; see references/spec.md):
  style: "pop-bounce"              overrides the brand's default preset
  format: "9:16" | "16:9" | "1:1"
  hook: {"lines": ["Line 1", "Line 2"], "pill": "context", "icon": "star"}     omit for no hook
  hook_end: 3.5
  closing: true                    false ends on the last clip frame
  cam: [{"t": 6, "d": 0.5, "s": 1.25, "x": 0, "y": -80}]    moves of #cam-inner
  layers: pill | stat | check | list | gauge
  sfx: [[t, "name-without-mp3", volume]]
  captions: true                   false for b-roll
  voice: true                      false mutes the clip
  music: {"src": "assets/music.mp3", "vol": 0.9, "dur": 30}
"""
import argparse
import html
import json
import os
import subprocess

FORMATS = {"9:16": (1080, 1920), "16:9": (1920, 1080), "1:1": (1080, 1080)}
HOOK_TOP = 300      # the first frame is the cover; TikTok crops it to about 3:4 on the profile grid
CARD_TOP, CARD_SIDE, CARD_BOTTOM = 720, 40, 200
CLOSING = 3.7       # seconds; it overlaps the clip by 0.6 s so the cut never shows a black frame

ICONS = {
    "star": '<path d="M60 14 L74 46 L108 50 L82 72 L90 106 L60 88 L30 106 L38 72 L12 50 L46 46 Z"/>',
    "bolt": '<path d="M68 10 L26 68 H56 L48 110 L94 48 H62 Z"/>',
    "heart": '<path d="M60 102 C20 74 12 54 18 38 C26 18 50 20 60 40 C70 20 94 18 102 38 C108 54 100 74 60 102 Z"/>',
    "pin": '<path d="M60 110 C34 76 24 60 24 44 A36 36 0 0 1 96 44 C96 60 86 76 60 110 Z"/><circle cx="60" cy="44" r="13"/>',
    "camera": '<rect x="14" y="38" width="92" height="62" rx="12"/><path d="M40 38 L48 24 H72 L80 38"/><circle cx="60" cy="68" r="18"/>',
    "money": '<circle cx="60" cy="60" r="44"/><path d="M74 42 Q70 34 60 34 Q46 34 46 46 Q46 56 60 58 Q74 60 74 72 Q74 84 60 84 Q48 84 44 76 M60 26 V94"/>',
    "check": '<circle cx="60" cy="60" r="46"/><path d="M38 62 L54 78 L84 44"/>',
    "play": '<circle cx="60" cy="60" r="46"/><path d="M48 40 L82 60 L48 80 Z"/>',
}

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("dir")
ap.add_argument("--brand", required=True)
args = ap.parse_args()

D = args.dir
HERE = os.path.dirname(os.path.abspath(__file__))
spec = json.load(open(os.path.join(D, "spec.json")))
brand = json.load(open(args.brand))
STYLE_NAME = spec.get("style", brand.get("style", "pop-bounce"))
S = json.load(open(os.path.join(HERE, "..", "assets", "styles.json")))[STYLE_NAME]
C = brand["colors"]
W, H = FORMATS[spec.get("format", "9:16")]
VERTICAL = H > W
esc = html.escape


def probe(path, field):
    return subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", field,
                                    "-of", "csv=p=0", path]).decode().strip().rstrip(",")


CLIP_PATH = os.path.join(D, "assets", "clip.mp4")
clip = round(float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                            CLIP_PATH]).decode().strip()), 3)
sw, sh = (int(v) for v in probe(CLIP_PATH, "stream=width,height").split(","))
vh = max(H, W * sh / sw)        # cover the frame; #cam-inner moves it, never the <video>
vw = vh * sw / sh
hook = spec.get("hook")
HE = spec.get("hook_end", 3.5) if hook else 0
closing = spec.get("closing", True)
CI = round(clip - 0.6, 3) if closing else clip
TOTAL = round(CI + CLOSING, 3) if closing else clip
caps = spec.get("captions", True)
CARD = S["layout"] == "card" and VERTICAL and bool(hook)
card_inset = f"inset({CARD_TOP}px {CARD_SIDE}px {CARD_BOTTOM}px {CARD_SIDE}px round {S['radius']}px)"
full_inset = "inset(0px 0px 0px 0px round 0px)"
CAP_TOP = 1220 if CARD else int(H * (0.75 if VERTICAL else 0.8))
CAP_DROP = 220 if CARD else 0
HARD = S["shadow"] == "hard"


def font_face(role):
    f = brand["fonts"][role]
    weight = f' font-weight: {f["weights"]};' if f.get("weights") else ""
    return f'@font-face {{ font-family: "{f["family"]}"; src: url("assets/fonts/{os.path.basename(f["file"])}");{weight} }}'


FONTS = "        " + font_face("display") + "\n        " + font_face("body")
DISPLAY = f'"{brand["fonts"]["display"]["family"]}", Georgia, serif'
BODY = f'"{brand["fonts"]["body"]["family"]}", sans-serif'


def enter(sel, t, extra=None):
    """Animate sel in with the preset's entrance."""
    e = S["enter"]
    start = dict(e["from"], **(extra or {}))
    end = {k: (1 if k in ("scale", "opacity") else 0) for k in start}
    return f'tl.fromTo({json.dumps(sel)}, {json.dumps(start)}, {json.dumps(dict(end, duration=e["dur"], ease=e["ease"]))}, {t});'


def leave(sel, t):
    e = S["exit"]
    return f'tl.to({json.dumps(sel)}, {json.dumps(dict(e["to"], duration=e["dur"], ease=e["ease"]))}, {round(t - e["dur"], 3)});'


def scene(comp_id, styles, body, script):
    return f"""<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>
{FONTS}
        #root {{ position: absolute; inset: 0; pointer-events: none; }}
{styles}
      </style>
      <div id="root" data-composition-id="{comp_id}" data-width="{W}" data-height="{H}">
{body}
      </div>
      <script>
        const tl = gsap.timeline({{ paused: true }});
{script}
        window.__timelines["{comp_id}"] = tl;
      </script>
    </template>
  </body>
</html>
"""


# ---------------------------------------------------------------- background
decor = {
    "blobs": f'<div class="d" style="left:-180px;top:120px;width:520px;height:520px;border-radius:50%;background:{C["light"]}"></div>'
             f'<div class="d" style="right:-140px;top:{H - 740}px;width:460px;height:460px;border-radius:50%;background:{C["light"]}"></div>',
    "grid": f'<div class="d" style="inset:0;background-image:linear-gradient({C["ink"]}22 2px,transparent 2px),linear-gradient(90deg,{C["ink"]}22 2px,transparent 2px);background-size:90px 90px"></div>',
    "dots": f'<div class="d" style="inset:0;background-image:radial-gradient({C["ink"]}33 6px,transparent 7px);background-size:64px 64px"></div>',
    "plain": "",
}[S["decor"]]
background = scene("background", f'        #root .d {{ position: absolute; }}\n        #root #base {{ position: absolute; inset: 0; background: {C["bg"]}; }}',
                   f'        <div id="base"></div>{decor}',
                   f'        tl.to("#root .d", {{ y: 26, duration: {max(TOTAL, 1)}, ease: "sine.inOut" }}, 0);')

# ---------------------------------------------------------------- hook
hook_html = None
if hook:
    size = hook.get("size", 116 if VERTICAL else 104)
    top = HOOK_TOP if VERTICAL else 150
    pill_top = top + int(size * 1.02 * len(hook["lines"])) + 34
    title = S["title"]
    # The opening frame is the cover, so the title may not start invisible or oversized.
    start = {k: v for k, v in title["from"].items() if k != "opacity"}
    if "scale" in start:
        start["scale"] = min(start["scale"], 1.15)
    upper = title["case"] == "upper"
    lines = "".join('<div class="hl" id="hl%d">%s</div>' % (i, "".join(
        f'<span class="hw">{esc(w.upper() if upper else w)}</span>' for w in line.split())) for i, line in enumerate(hook["lines"]))
    full = not CARD
    shadow = f"7px 7px 0 {C['accent']}" if HARD or S["shadow"] == "hard" else "none"
    title_color = "#FFFFFF" if full else C["ink"]
    stroke = f"-webkit-text-stroke: 10px {C['ink_dark']}; paint-order: stroke fill;" if full else ""
    styles = f"""        #root #scrim {{ position: absolute; inset: 0; background: linear-gradient({C['ink_dark']}cc, {C['ink_dark']}00 62%); opacity: {1 if full else 0}; }}
        #root #tilt {{ position: absolute; left: 70px; right: 70px; top: {top}px; transform: rotate({title['tilt']}deg); }}
        #root #title {{ text-align: center; }}
        #root .hl {{ font-family: {DISPLAY}; font-size: {size}px; line-height: 1.02; color: {title_color}; {stroke} text-shadow: {shadow}; white-space: nowrap; }}
        #root .hw {{ display: inline-block; margin: 0 16px; }}
        #root #pillw {{ position: absolute; left: 0; right: 0; top: {pill_top}px; text-align: center; }}
        #root #pill {{ display: inline-block; padding: 12px 34px; border-radius: 999px; background: {C['ink']}; color: {C['light']};
          font-family: {BODY}; font-weight: 600; font-size: 46px; }}
        #root #icon {{ position: absolute; right: 64px; top: {pill_top + 70}px; width: 150px; height: 150px; border-radius: 50%; background: {C['light']}; border: 6px solid {C['ink']}; }}
        #root #icon svg {{ position: absolute; left: 21px; top: 21px; width: 96px; height: 96px; }}"""
    pill = f'        <div id="pillw"><span id="pill">{esc(hook["pill"])}</span></div>' if hook.get("pill") else ""
    icon = ""
    if hook.get("icon") in ICONS:
        icon = (f'        <div id="icon"><svg viewBox="0 0 120 120" fill="{C["accent"]}" stroke="{C["ink"]}" stroke-width="7" '
                f'stroke-linecap="round" stroke-linejoin="round">{ICONS[hook["icon"]]}</svg></div>')
    js = [f'tl.fromTo("#root .hw", {json.dumps(start)}, {json.dumps(dict({k: (1 if k == "scale" else 0) for k in start}, duration=title["dur"], ease=title["ease"], stagger=title["stagger"]))}, 0);']
    if pill:
        js += [enter("#pill", 0.35), leave("#pill", HE - 0.15)]
    if icon:
        js += [enter("#icon", 0.5), leave("#icon", HE - 0.15)]
    js += [leave("#title", HE - 0.15), f'tl.to("#scrim", {{ opacity: 0, duration: 0.25 }}, {HE - 0.3});']
    hook_html = scene("hook", styles, f'        <div id="scrim"></div>\n        <div id="tilt"><div id="title">{lines}</div></div>\n{pill}\n{icon}',
                      "\n".join("        " + j for j in js))

# ---------------------------------------------------------------- info layers
sfx, mk, js = [], [], []
default_top = int(H * 0.12)
for i, L in enumerate(spec.get("layers", [])):
    lid, t, d, kind = f"L{i}", L["t"], L["d"], L["type"]
    top = L.get("top", default_top)
    if kind in ("check", "list") and L["items"] and L["items"][0][0] - t > 0.5:
        # An empty card looks broken: it enters just before its first row; its end does not change.
        d -= L["items"][0][0] - 0.35 - t
        t = L["items"][0][0] - 0.35
    if kind == "pill":
        mk.append(f'<div class="lay pillw" id="{lid}" style="top:{top}px"><span id="{lid}i">{esc(L["text"])}</span></div>')
        js.append(enter(f"#{lid}i", t))
        sfx.append((t, "click-pop", 0.4))
    elif kind == "stat":
        mk.append(f'<div class="lay" id="{lid}" style="top:{top}px"><div class="big" id="{lid}b" style="font-size:{L.get("size", 150)}px">{esc(L["big"])}</div>'
                  f'<div class="pillw2"><span id="{lid}s">{esc(L["sub"])}</span></div></div>')
        js += [enter(f"#{lid}b", t), enter(f"#{lid}s", round(t + 0.25, 3))]
        sfx.append((t, "ding", 0.4))
    elif kind in ("check", "list"):
        rows = []
        for k, it in enumerate(L["items"]):
            if kind == "check":
                good = (it[2] if len(it) > 2 else "ok") == "ok"
                mark = (f'<svg viewBox="0 0 40 40"><path d="M10 21 L18 29 L31 12" fill="none" stroke="{C["ink"]}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>' if good else
                        f'<svg viewBox="0 0 40 40"><path d="M12 12 L28 28 M28 12 L12 28" fill="none" stroke="{C["light"]}" stroke-width="6" stroke-linecap="round"/></svg>')
                head = f'<span class="mk {"ok" if good else "no"}">{mark}</span>'
            else:
                head = f'<span class="num">{k + 1}</span>'
            rows.append(f'<div class="row" id="{lid}r{k}">{head}<span class="tx">{esc(it[1])}</span></div>')
            js.append(enter(f"#{lid}r{k}", it[0]))
            sfx.append((it[0], "pop", 0.4))
        ttl = f'<div class="ttl">{esc(L["title"])}</div>' if L.get("title") else ""
        mk.append(f'<div class="lay card" id="{lid}" style="top:{top}px">{ttl}<div class="rows">{"".join(rows)}</div></div>')
        js.insert(len(js) - len(rows), enter(f"#{lid}", t))
        sfx.append((t, "click-pop", 0.4))
    elif kind == "gauge":
        v = max(0.0, min(1.0, L["value"]))
        mk.append(f'''<div class="lay card gauge" id="{lid}" style="top:{top}px"><div class="ttl">{esc(L["title"])}</div>
          <div class="gwrap"><svg viewBox="0 0 400 230" width="560" height="322"><path d="M40 200 A160 160 0 0 1 360 200" fill="none" stroke="{C['ink']}" stroke-opacity="0.25" stroke-width="24" />
          <path id="{lid}arc" d="M40 200 A160 160 0 0 1 360 200" fill="none" stroke="{C['accent']}" stroke-width="24" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100"/></svg>
          <div class="needle" id="{lid}n"></div><div class="hub"></div></div>
          <div class="glabel" id="{lid}l">{esc(L["label"])}</div></div>''')
        js.append(enter(f"#{lid}", t))
        js.append(f'tl.fromTo("#{lid}n", {{ rotation: -90 }}, {{ rotation: {-90 + 180 * v:.1f}, duration: 1.1, ease: "elastic.out(1, 0.5)" }}, {t + 0.3});')
        js.append(f'tl.fromTo("#{lid}arc", {{ strokeDashoffset: 100 }}, {{ strokeDashoffset: {100 - 100 * v:.1f}, duration: 1.1, ease: "power3.out" }}, {t + 0.3});')
        js.append(enter(f"#{lid}l", round(t + 1.1, 3)))
        sfx += [(t, "click-pop", 0.4), (t + 0.3, "swish", 0.4), (t + 1.1, "sparkle", 0.35)]
    js.append(leave(f"#{lid}", t + d))

card_shadow = f"box-shadow: 14px 14px 0 {C['accent']};" if HARD else ""
side = 90 if VERTICAL else 420
info = scene("info", f"""        #root .lay {{ position: absolute; left: 0; right: 0; text-align: center; }}
        #root .pillw span, #root .pillw2 span {{ display: inline-block; padding: 12px 34px; border-radius: 999px; background: {C['ink']};
          color: {C['light']}; font-family: {BODY}; font-weight: 600; font-size: 50px; }}
        #root .pillw2 {{ margin-top: 18px; }}
        #root .big {{ display: inline-block; font-family: {DISPLAY}; line-height: 1; color: {C['light']};
          -webkit-text-stroke: 12px {C['ink']}; paint-order: stroke fill; {'text-shadow: 9px 9px 0 ' + C['ink'] + ';' if HARD else ''} }}
        #root .card {{ left: {side}px; right: {side}px; padding: 30px 40px 34px; background: {C['light']}; border: 5px solid {C['ink']}; border-radius: {max(S['radius'], 8)}px;
          {card_shadow} text-align: left; }}
        #root .ttl {{ font-family: {DISPLAY}; font-size: 66px; line-height: 1.05; color: {C['ink']}; text-align: center; margin-bottom: 14px; }}
        #root .row {{ display: flex; align-items: center; gap: 22px; margin-top: 14px; }}
        #root .mk, #root .num {{ flex: none; width: 66px; height: 66px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }}
        #root .mk.ok {{ background: {C['highlight']}; border: 4px solid {C['ink']}; }}
        #root .mk.no, #root .num {{ background: {C['ink']}; }}
        #root .mk svg {{ width: 44px; height: 44px; }}
        #root .num {{ color: {C['light']}; font-family: {BODY}; font-weight: 700; font-size: 40px; }}
        #root .tx {{ font-family: {BODY}; font-weight: 600; font-size: 50px; line-height: 1.1; color: {C['ink_dark']}; }}
        #root .gauge {{ text-align: center; }}
        #root .gwrap {{ position: relative; width: 560px; height: 322px; margin: 0 auto; }}
        #root .gwrap svg {{ position: absolute; left: 0; top: 0; }}
        #root .needle {{ position: absolute; left: 272px; top: 88px; width: 16px; height: 200px; border-radius: 8px; background: {C['ink']}; transform-origin: 8px 192px; }}
        #root .hub {{ position: absolute; left: 252px; top: 252px; width: 56px; height: 56px; border-radius: 50%; background: {C['ink']}; }}
        #root .glabel {{ display: inline-block; margin-top: -10px; padding: 8px 30px; border-radius: 999px; background: {C['ink']}; color: {C['light']};
          font-family: {BODY}; font-weight: 700; font-size: 48px; }}""",
             "\n".join("        " + m for m in mk), "\n".join("        " + j for j in js))

# ---------------------------------------------------------------- closing
closing_html = None
if closing:
    logo = brand.get("logo")
    logo_tag = f'<img id="logo" src="assets/img/{os.path.basename(logo)}" alt="" />' if logo else ""
    letters = "".join(f'<span class="ch">{esc(c) if c != " " else "&nbsp;"}</span>' for c in brand.get("url") or brand["name"])
    handle = f'<div id="handle"><span id="handlep">{esc(brand["handle"])}</span></div>' if brand.get("handle") else ""
    cta = f'<div id="cta">{esc(brand["cta"])}</div>' if brand.get("cta") else ""
    js = ['tl.fromTo("#ground", { clipPath: "circle(0% at 50% 45%)" }, { clipPath: "circle(120% at 50% 45%)", duration: 0.6, ease: "power3.inOut" }, 0);']
    if logo:
        js.append(enter("#logo", 0.42))
    js.append(f'tl.fromTo("#root .ch", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.3, ease: "{S["enter"]["ease"]}", stagger: 0.03 }}, 0.75);')
    if cta:
        js.append(enter("#cta", 1.5))
    if handle:
        js.append(enter("#handlep", 1.9))
    closing_html = scene("closing", f"""        #root #ground {{ position: absolute; inset: 0; background: {C['bg']}; }}
        #root #stack {{ position: absolute; left: 60px; right: 60px; top: {int(H * 0.27)}px; text-align: center; }}
        #root #logo {{ width: 300px; height: 300px; object-fit: contain; margin-bottom: 40px; }}
        #root #name {{ font-family: {DISPLAY}; font-size: 96px; line-height: 1.1; color: {C['ink']}; white-space: nowrap; }}
        #root .ch {{ display: inline-block; }}
        #root #cta {{ margin-top: 30px; font-family: {BODY}; font-weight: 600; font-size: 52px; color: {C['ink_dark']}; }}
        #root #handle {{ margin-top: 44px; }}
        #root #handlep {{ display: inline-block; padding: 14px 40px; border-radius: 999px; background: {C['ink']}; color: {C['light']};
          font-family: {BODY}; font-weight: 700; font-size: 54px; }}""",
                         f'        <div id="ground"><div id="stack">{logo_tag}<div id="name">{letters}</div>{cta}{handle}</div></div>',
                         "\n".join("        " + j for j in js))

# ---------------------------------------------------------------- index
sfx = [(round(t, 3), f, v) for t, f, v in sfx]
if hook:
    sfx += [(0.35, "click-pop", 0.5), (round(HE - 0.35, 3), "whoosh", 0.45)]
if closing:
    sfx += [(CI, "whoosh", 0.45), (round(CI + 0.42, 3), "subscribe", 0.45)]
sfx += [(c["t"], "swish", 0.3) for c in spec.get("cam", []) if c.get("sfx", True) and c["t"] > 0]
sfx += [tuple(x) for x in spec.get("sfx", [])]
sfx.sort()
lengths = {}


def sfx_len(name):
    if name not in lengths:
        path = os.path.join(D, "assets", "sfx", name + ".mp3")
        lengths[name] = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode())
    return lengths[name]


audio = [f'      <audio id="sfx{k}" class="clip" src="assets/sfx/{f}.mp3" data-start="{t}" data-duration="{round(min(sfx_len(f), TOTAL - t), 3)}" data-track-index="{10 + k % 4}" data-volume="{v}"></audio>'
         for k, (t, f, v) in enumerate(sfx)]
music = spec.get("music")
if music:
    audio.append(f'      <audio id="music" class="clip" src="{music["src"]}" data-start="0" data-duration="{min(TOTAL, music["dur"])}" data-track-index="9" data-volume="{music.get("vol", 1)}"></audio>')

cam = []
for c in spec.get("cam", []):
    if c["t"] == 0:     # opening framing: visible from frame 0
        cam.append(f'gsap.set("#cam-inner", {{ scale: {c.get("s", 1)}, x: {c.get("x", 0)}, y: {c.get("y", 0)} }});')
    else:
        cam.append(f'tl.to("#cam-inner", {{ scale: {c.get("s", 1)}, x: {c.get("x", 0)}, y: {c.get("y", 0)}, duration: {c.get("d", 0.5)}, ease: "{c.get("ease", S["camera_ease"])}" }}, {c["t"]});')

opening = []
if CARD:
    at = round(HE - 0.3, 3)
    if S["transition"] == "clip":
        opening.append(f'tl.fromTo("#cam", {{ clipPath: {json.dumps(card_inset)} }}, {{ clipPath: {json.dumps(full_inset)}, duration: 0.6, ease: "power3.inOut" }}, {at});')
    else:
        fade = 0.3 if S["transition"] == "fade" else 0.001
        opening += [f'tl.to("#cam", {{ opacity: 0, duration: {fade} }}, {at});',
                    f'tl.set("#cam", {{ clipPath: {json.dumps(full_inset)} }}, {round(at + fade, 3)});',
                    f'tl.to("#cam", {{ opacity: 1, duration: {fade} }}, {round(at + fade, 3)});']
    opening.append(f'tl.to("#cam-shadow", {{ opacity: 0, duration: 0.3 }}, {at});')
    if caps:
        opening.append(f'tl.fromTo("#caps-wrap", {{ y: 0 }}, {{ y: {CAP_DROP}, duration: 0.6, ease: "power3.inOut" }}, {at});')

host = lambda cid, start, dur, track, kind, z, extra="": (
    f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" class="clip" data-start="{start}" '
    f'data-duration="{dur}" data-track-index="{track}" data-track-kind="{kind}" data-width="{W}" data-height="{H}" style="z-index: {z}{extra}"></div>')
caps_host = ""
if caps:
    caps_host = '      <div id="caps-wrap">\n  ' + host("captions", 0, CI, 5, "captions", 6, f"; --cap-top: {CAP_TOP}px") + "\n      </div>"
shadow_div = '<div id="cam-shadow"></div>' if CARD and HARD else ""
index = f"""<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
    <style>
      body {{ margin: 0; }}
      #cam-shadow {{ position: absolute; left: {CARD_SIDE + 22}px; top: {CARD_TOP + 22}px; width: {W - 2 * CARD_SIDE}px; height: {H - CARD_TOP - CARD_BOTTOM}px; border-radius: {S['radius']}px; background: {C['accent']}; z-index: 1; }}
      #cam {{ position: absolute; inset: 0; overflow: hidden; clip-path: {card_inset if CARD else full_inset}; z-index: 2; }}
      #cam-inner {{ position: absolute; inset: 0; }}
      #main-video {{ position: absolute; left: {round((W - vw) / 2, 1)}px; top: {round((H - vh) / 2, 1)}px; width: {round(vw, 1)}px; height: {round(vh, 1)}px; object-fit: cover; }}
      #caps-wrap {{ position: absolute; inset: 0; z-index: 6; pointer-events: none; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}">
{host("background", 0, TOTAL, 0, "graphics", 0)}
      {shadow_div}
      <div id="cam">
        <div id="cam-inner">
          <video id="main-video" class="clip" src="assets/clip.mp4" data-start="0" data-duration="{clip}" data-track-index="1" playsinline {'data-has-audio="true"' if spec.get("voice", True) else "muted"}></video>
        </div>
      </div>
{host("hook", 0, HE, 3, "graphics", 4) if hook else ""}
{host("info", 0, CI, 4, "graphics", 5)}
{caps_host}
{host("closing", CI, round(TOTAL - CI, 3), 7, "graphics", 8) if closing else ""}
{chr(10).join(audio)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      {chr(10).join("      " + j for j in opening + cam)}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
comps = os.path.join(D, "compositions")
os.makedirs(comps, exist_ok=True)
open(os.path.join(D, "index.html"), "w").write(index)
for name, content in {"background": background, "hook": hook_html, "info": info, "closing": closing_html}.items():
    if content:
        open(os.path.join(comps, name + ".html"), "w").write(content)
print(f"{STYLE_NAME} {W}x{H}  clip {clip}s  closing at {CI}s  total {TOTAL}s  sfx {len(sfx)}")
