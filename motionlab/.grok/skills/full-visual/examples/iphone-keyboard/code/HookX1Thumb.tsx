// Hook X1: the thumb, side on, in the cut plane. A real fingertip in profile (the reel's own skin and nail colours),
// huge at this scale: one cap is 255 px, the pad is twice that. Its outline is the one HookX1Kit bends against the
// glass, so the pad really flattens and spreads; the bone, the nail and the grain ride the rigid finger inside it.
// On the glass: the print's ridges packing down, the skin going pale where the blood is pushed out, the amber of
// the zones lighting it from below.
import React from "react";
import { AMBER } from "./KbSheetSplitKit";
import type { HookX1Shape } from "./HookX1Kit";

const NAIL = "M-436 -241 C-300 -236 -120 -200 -30 -128 L-12 -98 C-108 -158 -290 -184 -428 -188 Z";

const Defs: React.FC<{ s: HookX1Shape }> = ({ s }) => (
  <defs>
    <clipPath id="hx1t-clip"><path d={s.d} /></clipPath>
    <linearGradient id="hx1t-skin" gradientUnits="userSpaceOnUse" x1="0" y1="-262" x2="0" y2="300">
      <stop offset="0" stopColor="#B07A60" />
      <stop offset="0.1" stopColor="#E9BFA5" />
      <stop offset="0.42" stopColor="#E2B195" />
      <stop offset="0.74" stopColor="#CC9577" />
      <stop offset="1" stopColor="#99614A" />
    </linearGradient>
    <radialGradient id="hx1t-tip" gradientUnits="userSpaceOnUse" cx="90" cy="30" r="300">
      <stop offset="0" stopColor="#7A452F" stopOpacity="0.6" />
      <stop offset="1" stopColor="#7A452F" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="hx1t-blood" gradientUnits="userSpaceOnUse" cx="-90" cy="120" r="330">
      <stop offset="0" stopColor="#D8624A" stopOpacity="0.3" />
      <stop offset="1" stopColor="#D8624A" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="hx1t-nail" gradientUnits="userSpaceOnUse" x1="-430" y1="-230" x2="-20" y2="-110">
      <stop offset="0" stopColor="#F6E3DA" />
      <stop offset="0.25" stopColor="#F0CDBF" />
      <stop offset="0.85" stopColor="#E3B09C" />
      <stop offset="1" stopColor="#FBF1EA" />
    </linearGradient>
    <linearGradient id="hx1t-under" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-260">
      <stop offset="0" stopColor="#FFB13A" stopOpacity="1" />
      <stop offset="0.35" stopColor={AMBER} stopOpacity="0.42" />
      <stop offset="1" stopColor={AMBER} stopOpacity="0" />
    </linearGradient>
    <linearGradient id="hx1t-padside" gradientUnits="userSpaceOnUse" x1="0" y1="-40" x2="0" y2="150">
      <stop offset="0" stopColor="#000" />
      <stop offset="1" stopColor="#FFF" />
    </linearGradient>
    <filter id="hx1t-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
    <filter id="hx1t-softer" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
    {/* skin is never flat: fine grain, multiplied in */}
    <filter id="hx1t-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.16 0.5" numOctaves={3} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.24  0 0 0 0 0.16  0.9 0 0 -0.34 0" result="g" />
      <feComposite in="g" in2="SourceGraphic" operator="in" />
    </filter>
    {/* the print: ridges that follow the pad's edge, each a hair inside the last, on the pad's side only */}
    <mask id="hx1t-ridges" maskUnits="userSpaceOnUse" x="-1400" y="-900" width="2200" height="920">
      <rect x="-1400" y="-900" width="2200" height="920" fill="#000" />
      {Array.from({ length: 13 }, (_, k) => 13 - k).map((i) => (
        <g key={i}>
          <path d={s.d} fill="none" stroke="#FFF" strokeWidth={22 * i} />
          <path d={s.d} fill="none" stroke="#000" strokeWidth={22 * i - 9} />
        </g>
      ))}
    </mask>
    <mask id="hx1t-pad" maskUnits="userSpaceOnUse" x="-1400" y="-900" width="2200" height="920">
      <g transform={`translate(${s.tx.toFixed(1)} ${s.ty.toFixed(1)}) rotate(${s.a.toFixed(2)})`}>
        <rect x="-1700" y="-700" width="2200" height="1400" fill="url(#hx1t-padside)" />
      </g>
    </mask>
  </defs>
);

/** the shadow the thumb lays on the glass: wide and soft from high up, tight and dark as it lands */
export const HookX1ThumbShadow: React.FC<{ cx: number; cy: number; s: HookX1Shape; gap: number }> = ({ cx, cy, s, gap }) => {
  const mid = (s.L + s.R) / 2;
  const half = (s.R - s.L) / 2 + 70 + gap * 1.5;
  return (
    <g transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)})`} opacity={Math.max(0, 0.9 - gap / 330)}>
      <ellipse cx={mid - gap * 0.35} cy={-4} rx={half} ry={9 + gap * 0.11} fill="#000" filter={gap > 20 ? "url(#hx1t-softer)" : "url(#hx1t-soft)"} />
    </g>
  );
};

/** cx, cy: the contact point in the cut plane. warm: how hard the zones are lighting it from below (0 to 1). */
export const HookX1Thumb: React.FC<{ cx: number; cy: number; s: HookX1Shape; pen: number; warm: number }> = ({ cx, cy, s, pen, warm }) => {
  const mid = (s.L + s.R) / 2, half = (s.R - s.L) / 2;
  const hard = Math.min(1, pen / 40);
  const rigid = `translate(${s.tx.toFixed(1)} ${s.ty.toFixed(1)}) rotate(${s.a.toFixed(2)})`;
  return (
    <g transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)})`}>
      <Defs s={s} />
      <g clipPath="url(#hx1t-clip)">
        <g transform={rigid}>
          <rect x="-1700" y="-800" width="2300" height="1700" fill="url(#hx1t-skin)" />
          <rect x="-700" y="-400" width="1100" height="900" fill="url(#hx1t-blood)" />
          <rect x="-400" y="-400" width="800" height="900" fill="url(#hx1t-tip)" />
          <rect x="-1300" y="-290" width="1400" height="640" fill="#000" filter="url(#hx1t-grain)" opacity="0.5" />
          {/* the nail in profile: the plate, its gloss, the free edge, the fold of skin at its root */}
          <path d={NAIL} fill="url(#hx1t-nail)" stroke="#B0735C" strokeWidth="2.5" />
          <path d="M-410 -226 C-290 -222 -130 -190 -44 -124" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" opacity="0.7" filter="url(#hx1t-soft)" />
          <path d="M-70 -150 C-52 -138 -40 -128 -22 -110" fill="none" stroke="#FFFBF6" strokeWidth="13" strokeLinecap="round" opacity="0.85" />
          <ellipse cx="-392" cy="-214" rx="46" ry="15" fill="#FBEFE8" opacity="0.7" transform="rotate(3 -392 -214)" filter="url(#hx1t-soft)" />
          <path d="M-520 -246 C-480 -256 -446 -250 -428 -232 C-424 -212 -426 -196 -432 -184" fill="none" stroke="#A86B52" strokeWidth="6" strokeLinecap="round" opacity="0.7" filter="url(#hx1t-soft)" />
          <path d="M-430 -186 C-290 -180 -110 -154 -14 -96" fill="none" stroke="#9B5F49" strokeWidth="5" opacity="0.5" filter="url(#hx1t-soft)" />
          {/* light from above, along the top of the finger */}
          <path d="M-1600 -236 L-540 -232" stroke="#FFE9DA" strokeWidth="22" opacity="0.45" filter="url(#hx1t-soft)" />
        </g>
        {/* the print, packing down as the pad spreads */}
        <g mask="url(#hx1t-pad)">
          <rect x="-1400" y="-900" width="2200" height="920" fill="#6B3A26" opacity={0.3} mask="url(#hx1t-ridges)" />
        </g>
        {/* the zones' own light, from below */}
        <rect x="-900" y="-260" width="1600" height="262" fill="url(#hx1t-under)" opacity={0.2 + 0.55 * warm} style={{ mixBlendMode: "screen" }} />
        {pen > 0.5 && (
          <>
            {/* pressed skin goes pale, the blood pushed to its rim */}
            <ellipse cx={mid} cy={-34 - pen * 0.2} rx={half * 1.2} ry={64 + pen * 0.55} fill="none" stroke="#C24A32" strokeWidth={30} opacity={0.26 * hard} filter="url(#hx1t-softer)" />
            <ellipse cx={mid} cy={-6} rx={half * 0.94} ry={26 + pen * 0.3} fill="#FFEDE0" opacity={0.62 * hard} filter="url(#hx1t-softer)" />
            <path d={`M${s.L.toFixed(1)} -1.5 H${s.R.toFixed(1)}`} stroke="#4A2616" strokeWidth={3} opacity={0.75} />
          </>
        )}
      </g>
      <path d={s.d} fill="none" stroke="#4E2A1B" strokeWidth={2.5} opacity={0.6} />
    </g>
  );
};
