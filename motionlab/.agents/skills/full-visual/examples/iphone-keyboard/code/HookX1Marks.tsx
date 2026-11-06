// Hook X1: what is written on the section and what floats around it. In the cut plane (svg, same px as the
// section): the bracket that takes the E cap's width, its copy laid under the pad, the bracket across the flattened
// skin, the hairline label on the E's zone, the letter balloon, the dust the press lifts. On the frame: the far
// lights behind the phone and the two honest tags. Plain type and hairlines only.
import React from "react";
import { blurIn, blurOut, draw, ease, prog } from "../../../src/engine";
import { KEY, SF, cap } from "./KbSheetSplitKit";
import { HookX1BALLOON, hookX1Grow } from "./HookX1Board";
import { HookX1D as D, HookX1TAP, hookX1Bump, hookX1Lerp, hookX1Rnd, hookX1X, type HookX1Shape, type HookX1T } from "./HookX1Kit";

const E0 = hookX1X(cap("e").x), EW = KEY.w * 3;
const TAPX = hookX1X(HookX1TAP);

/** a measuring bracket: a hairline with a tick at each end. `up`: ticks point up instead of down */
const Bracket: React.FC<{ x0: number; x1: number; y: number; k: number; up?: boolean; heavy?: boolean }> = ({ x0, x1, y, k, up, heavy }) => {
  if (k <= 0) return null;
  const m = (x0 + x1) / 2, a = m + (x0 - m) * k, b = m + (x1 - m) * k, t = up ? -15 : 15;
  const d = `M${a.toFixed(1)} ${y + t} V${y} H${b.toFixed(1)} V${y + t}`;
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path d={d} stroke="#1A0F08" strokeWidth={heavy ? 11 : 8} opacity={heavy ? 0.55 : 0.35} />
      <path d={d} stroke="#FFFFFF" strokeWidth={heavy ? 5 : 3.5} />
    </g>
  );
};

/** the three brackets: the cap's, its copy under the pad, the pad's own */
export const HookX1Brackets: React.FC<{ f: number; T: HookX1T; s: HookX1Shape; cx: number; cy: number }> = ({ f, T, s, cx, cy }) => {
  const snap = (at: number) => prog(f, at, 6, ease.back);
  const go = prog(f, T.smaller, 12, ease.back);
  const out = 1 - prog(f, T.lift, 5);
  // the copy leaves the cap and lies down just under the glass's top face, centred under the pad
  const cxm = hookX1Lerp(E0, TAPX - EW / 2, go), cym = hookX1Lerp(D.glass - 22, 26, go);
  return (
    <g opacity={out}>
      <Bracket x0={E0} x1={E0 + EW} y={D.glass - 22} k={snap(T.key + 1)} />
      {f >= T.smaller && <Bracket x0={cxm} x1={cxm + EW} y={cym} k={1} up />}
      <Bracket x0={cx + s.L} x1={cx + s.R} y={cy - 26} k={snap(T.thumb)} heavy />
    </g>
  );
};

/** "touch zone, invisible", on a hairline that goes down between two caps to the E's zone */
export const HookX1Label: React.FC<{ f: number; T: HookX1T }> = ({ f, T }) => {
  if (f < T.label) return null;
  const x = 150;
  const o = prog(f, T.label, 6) * (1 - prog(f, T.lift, 6));
  return (
    <g opacity={o}>
      <path d={`M${x} -338 V${D.zoneT + 34}`} fill="none" stroke="#FFFFFF" strokeOpacity={0.75} strokeWidth={3} {...draw(f, T.label, 11)} />
      <circle cx={x} cy={D.zoneT + 34} r={8} fill="#FFFFFF" opacity={prog(f, T.label + 9, 4)} />
      <g fontFamily={SF} fontSize={40} fontWeight={600} fill="#FFFFFF" textAnchor="end" transform={`translate(0 ${(10 * (1 - prog(f, T.label, 8))).toFixed(1)})`}>
        <text x={x + 44} y={-400}>touch zone,</text>
        <text x={x + 44} y={-354}>invisible</text>
      </g>
    </g>
  );
};

/** the letter balloon as the cut shows it: it comes up out of the E cap, through the glass, and opens above it */
export const HookX1SideBalloon: React.FC<{ f: number; T: HookX1T }> = ({ f, T }) => {
  const g = hookX1Grow(f, T.pop, T.release + 2);
  if (g <= 0.01) return null;
  const wide = 0.52 + 0.48 * Math.min(1, Math.max(0, (g - 0.35) / 0.6)) + 0.6 * Math.max(0, g - 1);
  return (
    <g transform={`translate(${E0 + EW / 2} 0) scale(${wide.toFixed(4)} ${g.toFixed(4)})`}>
      <defs>
        <linearGradient id="hx1m-pop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#939396" />
          <stop offset="0.6" stopColor="#7C7C80" />
          <stop offset="1" stopColor="#6B6B6B" />
        </linearGradient>
        <clipPath id="hx1m-above"><rect x={-400} y={-700} width={800} height={700} /></clipPath>
        <filter id="hx1m-shadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="16" /></filter>
      </defs>
      <g clipPath="url(#hx1m-above)">
        <g transform={`translate(${-EW / 2} -18) scale(3)`}>
          <path d={HookX1BALLOON} fill="#000" opacity={0.5} transform="translate(0 6)" filter="url(#hx1m-shadow)" />
          <path d={HookX1BALLOON} fill="url(#hx1m-pop)" stroke="rgba(255,255,255,0.22)" strokeWidth={1.2} />
        </g>
        <text x={0} y={-262} textAnchor="middle" fontFamily={SF} fontSize={324} fontWeight={300} fill="#FFFFFF" opacity={Math.min(1, Math.max(0, (g - 0.5) / 0.4))}>e</text>
      </g>
    </g>
  );
};

/** dust: the tap raises a little, the full press a lot, off both ends of the flat, lit by the zones */
export const HookX1Dust: React.FC<{ f: number; T: HookX1T; cx: number; s: HookX1Shape }> = ({ f, T, cx, s }) => (
  <g>
    {Array.from({ length: 46 }, (_, i) => {
      const big = i >= 10;
      const born = (big ? T.press + 2 : T.touch + 1) + Math.floor(hookX1Rnd(i) * 5);
      const d = f - born;
      const life = 34 + hookX1Rnd(i + 5) * 40;
      if (d < 0 || d > life) return null;
      const side = i % 2 ? 1 : -1;
      const half = big ? 300 : 110;
      const v = (big ? 9 : 4) * (0.35 + hookX1Rnd(i + 11));
      const drag = 1 - Math.exp(-d / 9);
      const x = cx + (big ? (s.L + s.R) / 2 : 0) + side * (half + 20 * hookX1Rnd(i + 3)) + side * v * 9 * drag + 6 * Math.sin(d / 7 + i);
      const y = -4 - (5 + 11 * hookX1Rnd(i + 17)) * 9 * drag * (big ? 1 : 0.5) + 0.012 * d * d;
      const r = 1.6 + 3.2 * hookX1Rnd(i + 23);
      return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? "#FFE3B0" : "#FFFFFF"} opacity={0.85 * (1 - d / life) * Math.min(1, d / 2)} />;
    })}
    {/* the shock of the press running out along the glass */}
    {f >= T.press && f < T.press + 16 && [-1, 1].map((side) => (
      <rect key={side} x={cx + (s.L + s.R) / 2 + side * (300 + 46 * (f - T.press)) - 60} y={-5} width={120} height={5} rx={2.5} fill="#FFFFFF" opacity={0.7 * hookX1Bump(f, T.press, 16)} />
    ))}
  </g>
);

/** far behind the phone, out of focus: a few lights, drifting. The frame is never an empty ground */
export const HookX1Backdrop: React.FC<{ f: number; shift: number; o: number }> = ({ f, shift, o }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
    <defs>
      <filter id="hx1m-far"><feGaussianBlur stdDeviation="9" /></filter>
      <radialGradient id="hx1m-haze" cx="50%" cy="56%" r="60%">
        <stop offset="0" stopColor="#3A2A18" stopOpacity="0.55" />
        <stop offset="1" stopColor="#101010" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x={0} y={420} width={1080} height={1100} fill="url(#hx1m-haze)" />
    <g filter="url(#hx1m-far)">
      {Array.from({ length: 34 }, (_, i) => {
        const depth = 0.3 + 0.7 * hookX1Rnd(i);
        const x = (((hookX1Rnd(i + 50) * 1300 + shift * 0.25 * depth + Math.sin(f / (40 + i) + i) * 14) % 1300) + 1300) % 1300 - 110;
        const y = 500 + hookX1Rnd(i + 90) * 470 - (f * 0.25 * depth) % 40;
        return <circle key={i} cx={x} cy={y} r={7 + 20 * depth} fill={i % 4 === 0 ? "#FFB347" : "#D8E6EE"} opacity={(0.05 + 0.1 * depth) * (0.7 + 0.3 * Math.sin(f / 17 + i * 2.1))} />;
      })}
    </g>
  </svg>
);

/** the tags: small grey type in the bottom corners, from frame 0 */
export const HookX1Tags: React.FC<{ f: number; T: HookX1T; dim: string }> = ({ f, T, dim }) => (
  <>
    <div style={{ position: "absolute", right: 48, top: 1574, textAlign: "right", fontFamily: SF, fontSize: 28, lineHeight: "37px", color: dim, ...blurOut(f, T.dark, { dur: 10, blur: 0 }) }}>
      Zones drawn visible.<br />On a real iPhone they are invisible.
    </div>
    <div style={{ position: "absolute", left: 48, top: 1611, fontFamily: SF, fontSize: 28, lineHeight: "37px", color: dim, ...(f < T.and ? blurIn(f, -1, { dur: 1 }) : blurOut(f, T.and, { dur: 10, blur: 0 })) }}>Magnified illustration</div>
  </>
);
