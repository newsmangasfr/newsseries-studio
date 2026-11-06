// Scene "grow": the thumb. The same thumb as in "answer" and "zone" (KbSheetSplitTouch), with its own ids. It comes
// in from the lower left, high above the glass (bigger, its shadow wide, soft and far from it), comes down as it
// travels (it shrinks toward the glass, the shadow closes up under it and sharpens) and stops in the air on "down,":
// it never touches in this scene. Screen coordinates.
import React from "react";
import { Easing } from "remotion";
import { prog, useScene } from "../../../src/engine";
import type { KbZoneGrowT } from "./KbZoneGrowKit";

const OUTLINE = "M30 172 C30 62 98 6 160 6 C222 6 290 62 290 172 C296 380 310 470 306 560 C302 700 318 900 340 1300 L-20 1300 C0 900 18 700 14 560 C10 470 24 380 30 172 Z";
const NAIL = "M78 196 C78 92 108 46 160 46 C212 46 242 92 242 196 L238 266 C200 286 120 286 82 266 Z";

const KbZoneGrowThumbArt: React.FC = () => (
  <svg width={320} height={1300} viewBox="0 0 320 1300" style={{ overflow: "visible", display: "block" }}>
    <defs>
      <linearGradient id="kzg-skin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8E563E" />
        <stop offset="13%" stopColor="#C58A6C" />
        <stop offset="42%" stopColor="#E4B397" />
        <stop offset="72%" stopColor="#D29C7E" />
        <stop offset="100%" stopColor="#8A5139" />
      </linearGradient>
      <linearGradient id="kzg-skin-tip" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7A452F" stopOpacity={0.55} />
        <stop offset="9%" stopColor="#B4755A" stopOpacity={0.15} />
        <stop offset="30%" stopColor="#B4755A" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="kzg-nail" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F3D3C6" />
        <stop offset="55%" stopColor="#E6B5A3" />
        <stop offset="100%" stopColor="#D49C88" />
      </linearGradient>
      <clipPath id="kzg-nail-clip"><path d={NAIL} /></clipPath>
      <filter id="kzg-soft"><feGaussianBlur stdDeviation="3" /></filter>
      {/* skin is never flat: fine grain, multiplied in */}
      <filter id="kzg-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55 0.18" numOctaves={3} seed={7} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.24  0 0 0 0 0.16  0.9 0 0 -0.32 0" result="g" />
        <feComposite in="g" in2="SourceGraphic" operator="in" />
      </filter>
      <radialGradient id="kzg-skin-light" cx="46%" cy="9%" r="20%">
        <stop offset="0%" stopColor="#FFE4D2" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#FFE4D2" stopOpacity={0} />
      </radialGradient>
    </defs>
    <path id="kzg-thumb" d={OUTLINE} fill="url(#kzg-skin)" />
    <use href="#kzg-thumb" fill="url(#kzg-skin-tip)" />
    <use href="#kzg-thumb" fill="url(#kzg-skin-light)" />
    <use href="#kzg-thumb" fill="#000" filter="url(#kzg-grain)" opacity={0.5} />
    {/* the nail: plate, free edge, lunula, one soft reflection */}
    <path d={NAIL} fill="url(#kzg-nail)" stroke="#B0735C" strokeWidth={2.5} />
    <g clipPath="url(#kzg-nail-clip)">
      <path d="M78 150 C82 84 112 50 160 50 C208 50 238 84 242 150" fill="none" stroke="#FAEFEA" strokeWidth={13} strokeOpacity={0.8} filter="url(#kzg-soft)" />
      <ellipse cx={160} cy={278} rx={56} ry={34} fill="#F7E4DC" fillOpacity={0.75} filter="url(#kzg-soft)" />
      <path d="M118 96 C110 140 108 190 112 240" fill="none" stroke="#fff" strokeWidth={16} strokeOpacity={0.42} strokeLinecap="round" filter="url(#kzg-soft)" />
    </g>
    <path d="M82 268 C120 290 200 290 238 268" fill="none" stroke="#9B5F49" strokeWidth={4} strokeOpacity={0.55} filter="url(#kzg-soft)" />
    {/* the knuckle */}
    <g fill="none" stroke="#8F573F" strokeOpacity={0.5} strokeWidth={4} strokeLinecap="round" filter="url(#kzg-soft)">
      <path d="M70 500 C120 478 200 478 250 500" />
      <path d="M62 536 C120 518 200 518 258 536" />
      <path d="M78 572 C124 558 196 558 242 572" />
    </g>
  </svg>
);

const GLIDE = Easing.bezier(0.3, 0.05, 0.2, 1);
/** where the tip hangs once it has stopped, on screen: below and left of the E, clear of its zone and its neighbours' */
export const KbZoneGrowHANG = { x: 292, y: 1228, rot: 40, scale: 1.52 };

/** the thumb at this frame: its tip, its turn, its size, and how high it still is above the glass (1 to 0.3) */
export function kbZoneGrowThumb(f: number, t: KbZoneGrowT) {
  const p = prog(f, t.thumb, t.stop - t.thumb, GLIDE);
  const d = f - t.stop;
  // it stops, gives a little, and hangs: a hand held in the air is never quite still
  // (heavy: it carries on the way it was going, dips toward the glass and comes back, all through the held beat
  // before the zones show, so the hold is never a still frame)
  const settle = d < 0 ? 0 : Math.exp(-d / 16) * Math.sin(d / 6.5);
  const hang = prog(f, t.stop, 20);
  const h = 1 - 0.7 * p - 0.085 * settle; // height above the glass
  return {
    x: -330 + (KbZoneGrowHANG.x + 330) * p + 10 * settle + hang * 2.2 * Math.sin(f / 29),
    y: 1930 + (KbZoneGrowHANG.y - 1930) * p - 20 * Math.sin(Math.PI * p) - 14 * settle + hang * 2.6 * Math.sin(f / 37 + 1),
    rot: 52 + (KbZoneGrowHANG.rot - 52) * p - 0.9 * settle,
    scale: KbZoneGrowHANG.scale * (1 + 0.2 * (h - 0.3)),
    h,
  };
}

export const KbZoneGrowThumb: React.FC<{ t: KbZoneGrowT }> = ({ t }) => {
  const { f } = useScene();
  if (f < t.thumb) return null;
  const m = kbZoneGrowThumb(f, t);
  const box = (x: number, y: number, s: number): React.CSSProperties => ({
    position: "absolute", left: x - 160, top: y - 6, width: 320, height: 1300, transformOrigin: "160px 6px", transform: `rotate(${m.rot.toFixed(2)}deg) scale(${s.toFixed(4)})`,
  });
  // the shadow lies on the glass, away from the hand by as much as the hand is high: it closes up as the thumb comes down
  const off = 190 * m.h;
  return (
    <>
      <div style={{ ...box(m.x + off * 0.8, m.y - off * 0.62, m.scale * (1 + 0.1 * m.h)), filter: `blur(${(9 + 40 * m.h).toFixed(1)}px)`, opacity: 0.8 - 0.3 * m.h }}>
        <svg width={320} height={1300} viewBox="0 0 320 1300" style={{ overflow: "visible", display: "block" }}><path d={OUTLINE} fill="#000" /></svg>
      </div>
      <div style={{ ...box(m.x, m.y, m.scale), filter: "drop-shadow(0 0 22px rgba(0,0,0,0.5))" }}>
        <KbZoneGrowThumbArt />
      </div>
    </>
  );
};
