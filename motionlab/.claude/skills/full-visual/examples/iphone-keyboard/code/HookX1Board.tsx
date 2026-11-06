// Hook X1: the keyboard itself, the top face of the cut. The reel's own keyboard (KbSheetSplitPane, same geometry,
// same greys) drawn at 3 px a unit so it is sharp at MACRO, with the touch zones seen through the caps: the same
// tiling as "answer" (KbSheetSplitMap), sized by what was just typed. Mid-word the keys are lower case; when the
// message is gone the keyboard is back on capitals, which is the frame "answer" starts on.
import React from "react";
import { Easing } from "remotion";
import { mix, prog } from "../../../src/engine";
import { AMBER, CAPS, KB_H, KB_TOP, KEY, SF, SHEET, cap, type Cap } from "./KbSheetSplitKit";
import { LETTERS, cells, type Weights } from "./KbSheetSplitMap";
import { HookX1K as K, hookX1Bump, type HookX1T } from "./HookX1Kit";

// share of English uses by the letter that follows (Norvig's count_1w.txt, counted as assets/data/next-letter.json)
const SHARES: Record<string, Record<string, number>> = {
  tim: { e: 0.96, b: 0.01, o: 0.01, i: 0.01 },
  time: { s: 0.8, l: 0.08, r: 0.04, t: 0.02, o: 0.02, d: 0.01 },
  times: { h: 0.48, t: 0.25, c: 0.08, s: 0.07, l: 0.04, p: 0.03, a: 0.02, e: 0.01 },
};
/** the three taps of the face-on half: where the "+" lands (sheet px, never on its key) and the key that gets it */
export const HookX1TAPS = [
  { id: "e", x: 199, y: 298 },
  { id: "s", x: 262, y: 368 },
  { id: "h", x: 538, y: 440 },
];
const SPRING = Easing.out(Easing.back(2.2));
const u = (n: number) => n * K;

export const hookX1TapAt = (T: HookX1T) => [T.right, T.every, T.time];
/** frames each of the three keys is held */
const hookX1Held = (T: HookX1T) => [[T.right, T.letter + 18], [T.every, T.every + 8], [T.time, T.time + 7]];

function weights(f: number, T: HookX1T): Weights {
  const of = (key: string, c: string) => 1.7 * Math.pow(SHARES[key][c] ?? 0.0005, 0.6);
  const k1 = prog(f, T.typedE, 10, SPRING), k2 = prog(f, T.typedS, 9, SPRING), rest = 1 - prog(f, T.dark, 14);
  const out: Weights = {};
  for (const c of LETTERS) {
    const a = of("tim", c), b = of("time", c), d = of("times", c);
    out[c] = 1 + rest * (a + (b - a) * k1 + (d - b) * k2);
  }
  return out;
}

/** the cells, under the caps: lit amber, the one that has just caught a touch flashing */
const Zones: React.FC<{ f: number; T: HookX1T; xray: number; caught: number }> = ({ f, T, xray, caught }) => {
  if (xray <= 0.004) return null;
  const at = hookX1TapAt(T);
  return (
    <svg width={u(SHEET.w)} height={u(SHEET.h)} viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: xray }}>
      <defs>
        <radialGradient id="hx1b-amber" cx="50%" cy="46%" r="72%">
          <stop offset="0%" stopColor="#FFD587" />
          <stop offset="38%" stopColor="#FFB02E" />
          <stop offset="78%" stopColor={AMBER} />
          <stop offset="100%" stopColor="#C66F00" />
        </radialGradient>
      </defs>
      {cells(weights(f, T)).map((c, i) => {
        const t = HookX1TAPS.findIndex((x) => x.id === c.letter);
        const flash = Math.max(t >= 0 ? hookX1Bump(f, at[t], 18) : 0, c.letter === "e" ? caught : 0);
        const swell = Math.max(0, Math.min(1, (c.w - 1) / 0.9));
        return (
          <g key={c.letter}>
            <path d={c.d} fill="url(#hx1b-amber)" fillOpacity={0.8 + 0.16 * swell + 0.04 * Math.sin(f / 9 + i * 1.7)} stroke="#2A1700" strokeWidth={3.5} strokeLinejoin="round" />
            <path d={c.d} fill="#fff" fillOpacity={0.22 * swell + 0.7 * flash} />
          </g>
        );
      })}
    </svg>
  );
};

const Glyph: React.FC<{ id: string; on: number }> = ({ id, on }) =>
  id === "shift" ? (
    <svg width={u(54)} height={u(50)} viewBox="0 0 54 50">
      <path d="M27 4 L49 26 H37 V44 H17 V26 H5 Z" fill="#111" fillOpacity={on} stroke={mix(on, 0, 1, "#ffffff", "#111111")} strokeWidth={3.6} strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width={u(62)} height={u(46)} viewBox="0 0 62 46">
      <path d="M21 3 H52 a7 7 0 0 1 7 7 V36 a7 7 0 0 1 -7 7 H21 L3 23 Z" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinejoin="round" />
      <path d="M29 15 L45 31 M45 15 L29 31" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" />
    </svg>
  );

const CapView: React.FC<{ c: Cap; lit: number; upper: number; xray: number }> = ({ c, lit, upper, xray }) => {
  const shift = c.id === "shift" ? upper : 0;
  const base = c.kind === "dark" ? mix(shift, 0, 1, "#464646", "#D4D4D4") : "#6B6B6B";
  const face = mix(lit, 0, 1, base, "#F2F2F4");
  const see = c.kind === "letter" ? 1 - 0.4 * xray * (1 - lit) : 1; // the zones show through the letter caps
  const ink = lit > 0.55 ? "#111" : "#fff";
  const letter = (text: string, size: number, pad: number, o: number) => (
    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: u(size), paddingBottom: u(pad), boxSizing: "border-box", opacity: o }}>{text}</span>
  );
  return (
    <div style={{ position: "absolute", left: u(c.x), top: u(c.y), width: u(c.w), height: u(KEY.h), borderRadius: u(KEY.r), boxShadow: `0 ${u(3)}px 0 #1B1B1B${lit > 0 ? `, 0 0 ${(u(26) * lit).toFixed(0)}px ${(u(4) * lit).toFixed(1)}px rgba(255,255,255,${(0.5 * lit).toFixed(2)})` : ""}` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: u(KEY.r), background: face, opacity: see }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: ink, fontFamily: SF, fontSize: u(40), fontWeight: 400, lineHeight: 1 }}>
        {c.kind === "letter" ? <>{letter(c.label, 64, 8, 1 - upper)}{letter(c.label.toUpperCase(), 58, 0, upper)}</> : c.label || <Glyph id={c.id} on={shift} />}
      </div>
    </div>
  );
};

/** the QuickType bar and the message field, as the keyboard had them at each moment */
const Top: React.FC<{ f: number; T: HookX1T }> = ({ f, T }) => {
  const n = f >= T.flip ? 3 : f >= T.typedS ? 2 : f >= T.typedE ? 1 : 0;
  const words = [["“tim”", "time", "times"], ["“time”", "times", "timeline"], ["“times”", "timeshare", "timestamp"], ["I", "The", "I’m"]][n];
  const text = ["tim", "time", "times", ""][n];
  return (
    <>
      <div style={{ position: "absolute", left: u(10), top: u(9), width: u(72), height: u(72), borderRadius: u(36), background: "#2A2A2C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={u(34)} height={u(34)} viewBox="0 0 34 34"><path d="M17 4 V30 M4 17 H30" stroke="#A9A9AE" strokeWidth={4} strokeLinecap="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: u(100), top: u(5), width: u(890), height: u(80), borderRadius: u(40), boxShadow: `inset 0 0 0 ${u(2.5)}px #3A3A3C`, background: "#111113", display: "flex", alignItems: "center", paddingLeft: u(30), boxSizing: "border-box", fontFamily: SF, fontSize: u(42) }}>
        <span style={{ color: "#fff" }}>{text}</span>
        <span style={{ width: u(4), height: u(50), borderRadius: u(2), background: "#0A84FF", opacity: n < 3 || Math.floor(f / 30) % 2 === 0 ? 1 : 0, marginLeft: u(2), marginRight: u(7) }} />
        {n === 3 && <span style={{ color: "#5B5B60" }}>iMessage</span>}
      </div>
      {words.map((w, i) => (
        <div key={i} style={{ position: "absolute", left: u((i * SHEET.w) / 3), width: u(SHEET.w / 3), top: u(KB_TOP + 34), height: u(66), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF, fontSize: u(42), color: "#fff" }}>{w}</div>
      ))}
      {[1, 2].map((i) => <div key={i} style={{ position: "absolute", left: u((i * SHEET.w) / 3 - 1), top: u(KB_TOP + 38), width: u(2), height: u(60), background: "#404040" }} />)}
    </>
  );
};

// the letter balloon, in a cap's own units (0, 0 = the cap's top-left): the real shape, as "popup" draws it
const B = { l: -31, r: KEY.w + 31, top: -172, hb: -46, nb: 6, r0: 20 };
export const HookX1BALLOON = `M${B.l + B.r0} ${B.top} H${B.r - B.r0} Q${B.r} ${B.top} ${B.r} ${B.top + B.r0} V${B.hb} C${B.r} ${B.hb + 30} ${KEY.w} ${B.nb - 30} ${KEY.w} ${B.nb} V${KEY.h - KEY.r} Q${KEY.w} ${KEY.h} ${KEY.w - KEY.r} ${KEY.h} H${KEY.r} Q0 ${KEY.h} 0 ${KEY.h - KEY.r} V${B.nb} C0 ${B.nb - 30} ${B.l} ${B.hb + 30} ${B.l} ${B.hb} V${B.top + B.r0} Q${B.l} ${B.top} ${B.l + B.r0} ${B.top} Z`;
/** how far a balloon is out of its key: a spring up, a quick drop */
export const hookX1Grow = (f: number, from: number, to: number) => {
  if (f < from) return 0;
  if (f >= to) return 1 - prog(f, to, 5);
  const d = f - from;
  return 1 - Math.exp(-d / 2.6) * Math.cos(d / 2.9);
};

const Balloon: React.FC<{ id: string; g: number }> = ({ id, g }) => {
  if (g <= 0.01) return null;
  const c = cap(id);
  const wide = 0.52 + 0.48 * Math.min(1, Math.max(0, (g - 0.35) / 0.6)) + 0.6 * Math.max(0, g - 1);
  return (
    <div style={{ position: "absolute", left: u(c.x), top: u(c.y), width: u(KEY.w), height: u(KEY.h), transformOrigin: `${u(KEY.w / 2)}px ${u(KEY.h)}px`, transform: `scale(${wide.toFixed(4)}, ${g.toFixed(4)})` }}>
      <svg width={u(KEY.w)} height={u(KEY.h)} viewBox={`0 0 ${KEY.w} ${KEY.h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: `drop-shadow(0 ${u(5)}px ${u(9)}px rgba(0,0,0,0.55))` }}>
        <defs>
          <linearGradient id={`hx1b-pop-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B8B8E" />
            <stop offset="55%" stopColor="#7A7A7D" />
            <stop offset="100%" stopColor="#6B6B6B" />
          </linearGradient>
        </defs>
        <path d={HookX1BALLOON} fill={`url(#hx1b-pop-${id})`} stroke="rgba(255,255,255,0.16)" strokeWidth={1.2} />
      </svg>
      <div style={{ position: "absolute", left: u(B.l), width: u(B.r - B.l), top: u(B.top), height: u(B.hb - B.top + 8), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF, fontSize: u(108), fontWeight: 300, lineHeight: 1, color: "#fff", paddingBottom: u(14), boxSizing: "border-box", opacity: Math.min(1, Math.max(0, (g - 0.5) / 0.4)) }}>{id}</div>
    </div>
  );
};

/** xray: how much the zones show. sideLit: the E cap while the section is side on. caught: the side-on catch. */
export const HookX1Board: React.FC<{ f: number; T: HookX1T; xray: number; sideLit: number; caught: number }> = ({ f, T, xray, sideLit, caught }) => {
  const at = hookX1TapAt(T), held = hookX1Held(T);
  const upper = prog(f, T.flip, 6);
  const litOf = (id: string) => {
    const t = HookX1TAPS.findIndex((x) => x.id === id);
    const tap = t < 0 ? 0 : prog(f, held[t][0], 2) * (1 - prog(f, held[t][1], 6));
    return Math.max(tap, id === "e" ? sideLit : 0);
  };
  return (
    <>
      <div style={{ position: "absolute", left: u(-14), top: u(KB_TOP - 6), width: u(SHEET.w + 28), height: u(KB_H + 20), borderRadius: u(34), background: "#2B2B2B", boxShadow: `inset 0 0 0 ${u(2)}px rgba(255,255,255,0.05)` }} />
      <Zones f={f} T={T} xray={xray} caught={caught} />
      {CAPS.map((c) => <CapView key={c.id} c={c} lit={litOf(c.id)} upper={upper} xray={xray} />)}
      <Top f={f} T={T} />
      {/* each touch point stays where it fell: not one of them is on its key */}
      <svg width={u(SHEET.w)} height={u(SHEET.h)} viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - prog(f, T.dark, 12) }}>
        {HookX1TAPS.map((p, i) => f >= at[i] && (
          <g key={p.id} transform={`translate(${p.x} ${p.y}) scale(${(1 + 0.5 * hookX1Bump(f, at[i], 9)).toFixed(3)})`} strokeLinecap="round">
            <path d="M-13 0 H13 M0 -13 V13" stroke="#2A1700" strokeWidth={8} opacity={0.75} />
            <path d="M-13 0 H13 M0 -13 V13" stroke="#fff" strokeWidth={4} />
          </g>
        ))}
      </svg>
      <Balloon id="e" g={hookX1Grow(f, T.letter, held[0][1])} />
      <Balloon id="s" g={hookX1Grow(f, held[1][0] + 2, held[1][1])} />
      <Balloon id="h" g={hookX1Grow(f, held[2][0] + 2, held[2][1])} />
    </>
  );
};
