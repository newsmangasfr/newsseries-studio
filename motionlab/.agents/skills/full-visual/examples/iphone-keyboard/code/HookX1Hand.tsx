// Hook X1: the same thumb once the keyboard is face on, seen from above. It is the thumb "answer" starts on
// (KbSheetSplitTouch: same drawing, same 31 degrees, same size against the keys), with its own ids. It comes in from
// the lower left as the section finishes turning, taps three times, never on a key's centre, and ends pressed where
// "answer" finds it. Screen coordinates, off the hook's camera.
import React from "react";
import { ease, prog } from "../../../src/engine";
import { PATCH } from "./KbSheetSplitKit";
import { HookX1TAPS } from "./HookX1Board";
import { HookX1K, hookX1Lerp, hookX1Screen, type HookX1Cam, type HookX1T } from "./HookX1Kit";

const OUTLINE = "M30 172 C30 62 98 6 160 6 C222 6 290 62 290 172 C296 380 310 470 306 560 C302 700 318 900 340 1300 L-20 1300 C0 900 18 700 14 560 C10 470 24 380 30 172 Z";
const NAIL = "M78 196 C78 92 108 46 160 46 C212 46 242 92 242 196 L238 266 C200 286 120 286 82 266 Z";

const Art: React.FC = () => (
  <svg width={320} height={1300} viewBox="0 0 320 1300" style={{ overflow: "visible", display: "block" }}>
    <defs>
      <linearGradient id="hx1h-skin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8E563E" />
        <stop offset="13%" stopColor="#C58A6C" />
        <stop offset="42%" stopColor="#E4B397" />
        <stop offset="72%" stopColor="#D29C7E" />
        <stop offset="100%" stopColor="#8A5139" />
      </linearGradient>
      <linearGradient id="hx1h-skin-tip" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7A452F" stopOpacity={0.55} />
        <stop offset="9%" stopColor="#B4755A" stopOpacity={0.15} />
        <stop offset="30%" stopColor="#B4755A" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="hx1h-nail" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F3D3C6" />
        <stop offset="55%" stopColor="#E6B5A3" />
        <stop offset="100%" stopColor="#D49C88" />
      </linearGradient>
      <clipPath id="hx1h-nail-clip"><path d={NAIL} /></clipPath>
      <filter id="hx1h-soft"><feGaussianBlur stdDeviation="3" /></filter>
      <filter id="hx1h-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55 0.18" numOctaves={3} seed={7} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.24  0 0 0 0 0.16  0.9 0 0 -0.32 0" result="g" />
        <feComposite in="g" in2="SourceGraphic" operator="in" />
      </filter>
      <radialGradient id="hx1h-skin-light" cx="46%" cy="9%" r="20%">
        <stop offset="0%" stopColor="#FFE4D2" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#FFE4D2" stopOpacity={0} />
      </radialGradient>
    </defs>
    <path id="hx1h-thumb" d={OUTLINE} fill="url(#hx1h-skin)" />
    <use href="#hx1h-thumb" fill="url(#hx1h-skin-tip)" />
    <use href="#hx1h-thumb" fill="url(#hx1h-skin-light)" />
    <use href="#hx1h-thumb" fill="#000" filter="url(#hx1h-grain)" opacity={0.5} />
    <path d={NAIL} fill="url(#hx1h-nail)" stroke="#B0735C" strokeWidth={2.5} />
    <g clipPath="url(#hx1h-nail-clip)">
      <path d="M78 150 C82 84 112 50 160 50 C208 50 238 84 242 150" fill="none" stroke="#FAEFEA" strokeWidth={13} strokeOpacity={0.8} filter="url(#hx1h-soft)" />
      <ellipse cx={160} cy={278} rx={56} ry={34} fill="#F7E4DC" fillOpacity={0.75} filter="url(#hx1h-soft)" />
      <path d="M118 96 C110 140 108 190 112 240" fill="none" stroke="#fff" strokeWidth={16} strokeOpacity={0.42} strokeLinecap="round" filter="url(#hx1h-soft)" />
    </g>
    <path d="M82 268 C120 290 200 290 238 268" fill="none" stroke="#9B5F49" strokeWidth={4} strokeOpacity={0.55} filter="url(#hx1h-soft)" />
    <g fill="none" stroke="#8F573F" strokeOpacity={0.5} strokeWidth={4} strokeLinecap="round" filter="url(#hx1h-soft)">
      <path d="M70 500 C120 478 200 478 250 500" />
      <path d="M62 536 C120 518 200 518 258 536" />
      <path d="M78 572 C124 558 196 558 242 572" />
    </g>
  </svg>
);

type Key = { f: number; x: number; y: number; h: number };
/** where the pad is over the sheet, and how high (0 = on the glass) */
function pose(f: number, T: HookX1T) {
  const [e, s, h] = HookX1TAPS;
  const keys: Key[] = [
    { f: T.faceOn - 14, x: -150, y: 900, h: 2.4 },
    { f: T.right - 4, x: e.x - 6, y: e.y + 10, h: 0.45 },
    { f: T.right, x: e.x, y: e.y, h: 0 },
    { f: T.letter + 18, x: e.x, y: e.y, h: 0 },
    { f: T.letter + 27, x: e.x + 24, y: e.y + 34, h: 0.7 },
    { f: T.every - 4, x: s.x - 4, y: s.y + 8, h: 0.4 },
    { f: T.every, x: s.x, y: s.y, h: 0 },
    { f: T.every + 6, x: s.x, y: s.y, h: 0 },
    { f: T.time - 4, x: h.x - 14, y: h.y + 4, h: 0.45 },
    { f: T.time, x: h.x, y: h.y, h: 0 },
    { f: T.time + 5, x: h.x, y: h.y, h: 0 },
    { f: T.home - 9, x: PATCH.x + 70, y: PATCH.y + 30, h: 0.55 },
    { f: T.home - 2, x: PATCH.x, y: PATCH.y, h: 0 },
  ];
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const a = keys[i], b = keys[i + 1];
  const k = prog(f, a.f, b.f - a.f, b.h < a.h ? ease.in : ease.inOut); // it falls onto a key, it eases off one
  return { x: hookX1Lerp(a.x, b.x, k), y: hookX1Lerp(a.y, b.y, k), h: hookX1Lerp(a.h, b.h, k) };
}

export const HookX1Hand: React.FC<{ f: number; T: HookX1T; cam: HookX1Cam }> = ({ f, T, cam }) => {
  if (f < T.faceOn - 14) return null;
  const p = pose(f, T);
  const at = hookX1Screen(cam, p.x, p.y);
  const unit = (cam.g * HookX1K) / 0.9; // 1 when the keyboard is the SLAB
  const s = 0.96 * unit * (1 + 0.07 * p.h);
  const box = (dx: number, dy: number, sc: number): React.CSSProperties => ({
    position: "absolute", left: at.x - 160 + dx, top: at.y - 150 + dy, transformOrigin: "160px 150px", transform: `rotate(${(31 + 5 * Math.min(1, p.h)).toFixed(2)}deg) scale(${sc.toFixed(4)})`,
  });
  return (
    <>
      <div style={{ ...box((10 + 60 * p.h) * unit, 90 * p.h * unit, unit), width: 320, height: 1200, borderRadius: 150, background: "#000", opacity: 0.6 - 0.12 * Math.min(2, p.h), filter: `blur(${((16 + 34 * p.h) * unit).toFixed(1)}px)` }} />
      <div style={box(0, 0, s)}><Art /></div>
    </>
  );
};
