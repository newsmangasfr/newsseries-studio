// Hook X1: the cut face. Everything under the hinge line, in the cut plane's own px (x 0 = under the E's centre,
// y 0 = the top face of the glass): the glass as a thick lit slab, the key caps as a thin dark layer with their
// letters on the cut, a hair of pixels, and under them the touch zones, amber, deep, tiled with no gap, the E's
// already wider than its cap. Then the phone's own body and its metal edge. The "+" falls through all of it.
import React from "react";
import { ease, prog } from "../../../src/engine";
import { AMBER, CAPS, KEY, SF } from "./KbSheetSplitKit";
import { HookX1D as D, HookX1ROW, HookX1SEAMS, HookX1TAP, hookX1Bump, hookX1Rnd, hookX1X, type HookX1T } from "./HookX1Kit";

const TOP = CAPS.filter((c) => HookX1ROW.includes(c.id) && c.kind === "letter").sort((a, b) => a.x - b.x);
const X0 = -770; // the display's left edge (a little past sheet x 0, as the panel is)
const X1 = 720;
const TAPX = hookX1X(HookX1TAP);
export const HookX1PLUS_Y = D.zoneT + 104; // where the "+" comes to rest, inside the E's zone

/** how lit the E's zone is by a catch: the tap, then the full press */
export const hookX1Flash = (f: number, T: HookX1T) => Math.max(hookX1Bump(f, T.caught, 18), 0.6 * hookX1Bump(f, T.press + 3, 22));
/** where the falling "+" is, px under the glass's top face (it speeds up: it is falling) */
export const hookX1PlusY = (f: number, T: HookX1T) => HookX1PLUS_Y * prog(f, T.touch + 1, T.caught - T.touch - 1, ease.in);

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="hx1-glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#E9F6F8" stopOpacity="0.62" />
      <stop offset="0.07" stopColor="#B9D6DC" stopOpacity="0.3" />
      <stop offset="0.5" stopColor="#7FA4AC" stopOpacity="0.13" />
      <stop offset="0.9" stopColor="#A9CDD3" stopOpacity="0.22" />
      <stop offset="1" stopColor="#DDF1F4" stopOpacity="0.4" />
    </linearGradient>
    <linearGradient id="hx1-cap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7C7C80" />
      <stop offset="0.18" stopColor="#66666A" />
      <stop offset="1" stopColor="#4C4C50" />
    </linearGradient>
    <linearGradient id="hx1-zone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFE2A6" />
      <stop offset="0.1" stopColor="#FFC455" />
      <stop offset="0.5" stopColor={AMBER} />
      <stop offset="1" stopColor="#9A5200" />
    </linearGradient>
    <linearGradient id="hx1-shaft" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#FFB636" stopOpacity="0.85" />
      <stop offset="0.45" stopColor={AMBER} stopOpacity="0.28" />
      <stop offset="1" stopColor={AMBER} stopOpacity="0" />
    </linearGradient>
    <linearGradient id="hx1-metal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#5E5E63" />
      <stop offset="0.3" stopColor="#D8D8DC" />
      <stop offset="0.62" stopColor="#8E8E93" />
      <stop offset="1" stopColor="#3A3A3D" />
    </linearGradient>
    <linearGradient id="hx1-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#242426" />
      <stop offset="1" stopColor="#0F0F10" />
    </linearGradient>
    <filter id="hx1-bloom" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="34" /></filter>
    <filter id="hx1-soft4" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="4" /></filter>
    <clipPath id="hx1-glass-clip"><rect x={X0} y={0} width={X1 - X0} height={D.glass} /></clipPath>
  </defs>
);

/** the touch zones on the cut: amber blocks, seam against seam, breathing */
const Zones: React.FC<{ f: number; flash: number; give: number }> = ({ f, flash, give: dent }) => {
  const seams = HookX1SEAMS.map((x, i) => hookX1X(x) + (i === 0 ? X0 - hookX1X(0) : 3.5 * Math.sin(f / 15 + i * 1.9)));
  const h = D.zoneB - D.zoneT;
  return (
    <g>
      <rect x={X0} y={D.zoneT - 10} width={X1 - X0} height={h + 60} fill={AMBER} opacity={0.5 + 0.08 * Math.sin(f / 19) + 0.3 * flash} filter="url(#hx1-bloom)" />
      {HookX1ROW.split("").map((c, i) => {
        const x0 = seams[i] + 2.5, x1 = Math.min(X1, seams[i + 1] - 2.5);
        if (x1 <= x0) return null;
        const isE = c === "e";
        const live = 0.9 + 0.1 * Math.sin(f / 10 + i * 2.3);
        const give = isE ? 14 * dent : 0; // it gives under what it catches, and springs back
        return (
          <g key={c}>
            <rect x={x0} y={D.zoneT + give} width={x1 - x0} height={h - give} rx={12} fill="url(#hx1-zone)" opacity={live} />
            <rect x={x0 + 6} y={D.zoneT + 5} width={x1 - x0 - 12} height={10} rx={5} fill="#FFF3D6" opacity={0.5 * live} />
            <text x={(x0 + x1) / 2} y={D.zoneT + 172} textAnchor="middle" fontFamily={SF} fontSize={150} fontWeight={600} fill="#4A2800" fillOpacity={0.4}>{c}</text>
            {isE && <rect x={x0} y={D.zoneT} width={x1 - x0} height={h} rx={12} fill="#FFFFFF" opacity={0.85 * flash} />}
          </g>
        );
      })}
    </g>
  );
};

/** the caps on the cut, their letters readable, and the amber leaking up between them into the glass */
const Caps: React.FC<{ f: number; lit: number }> = ({ f, lit }) => (
  <g>
    <rect x={X0} y={D.glass} width={X1 - X0} height={D.capB - D.glass} fill="#1D1D1F" />
    {TOP.map((c) => {
      const x = hookX1X(c.x), w = KEY.w * 3;
      const on = c.id === "e" ? lit : 0;
      return (
        <g key={c.id}>
          <rect x={x} y={D.glass + 3} width={w} height={D.capB - D.glass - 3} rx={9} fill="url(#hx1-cap)" />
          <rect x={x} y={D.glass + 3} width={w} height={D.capB - D.glass - 3} rx={9} fill="#F4F4F6" opacity={on} />
          {on > 0.02 && <rect x={x - 14} y={D.glass - 22} width={w + 28} height={D.capB - D.glass + 30} rx={22} fill="#FFFFFF" opacity={0.3 * on} filter="url(#hx1-soft4)" />}
          <rect x={x + 8} y={D.glass + 5} width={w - 16} height={3} rx={1.5} fill="#FFFFFF" opacity={0.3} />
          <text x={x + w / 2} y={D.capB - 15} textAnchor="middle" fontFamily={SF} fontSize={52} fontWeight={500} fill={on > 0.5 ? "#111113" : "#FFFFFF"}>{c.id}</text>
        </g>
      );
    })}
    {/* the pixels: a hair of red, green, blue under the caps */}
    <rect x={X0} y={D.capB} width={X1 - X0} height={D.zoneT - D.capB} fill="#0B0B0C" />
    {Array.from({ length: Math.floor((X1 - X0) / 9) }, (_, i) => (
      <rect key={i} x={X0 + 2 + i * 9} y={D.capB + 4} width={5} height={6} rx={1.5} fill={["#FF5A52", "#4EE06B", "#5B8CFF"][i % 3]} opacity={0.5 + 0.35 * hookX1Rnd(i + Math.floor(f / 5) * 0.37)} />
    ))}
  </g>
);

/** the glass: a slab with a lit top edge, a light that keeps crossing it, the cut's own polish marks */
const Glass: React.FC<{ f: number; sag: number; cx: number; load: number }> = ({ f, sag, cx, load }) => {
  const sheen = X0 + ((f * 13 + 300) % (X1 - X0 + 700)) - 350;
  const top = `M${X0 + 46} 0 L${cx - 520} 0 Q${cx} ${(sag * 2).toFixed(2)} ${cx + 520} 0 L${X1} 0`;
  return (
    <g>
      <path d={`${top} L${X1} ${D.glass} L${X0} ${D.glass} L${X0} 44 Q${X0} 0 ${X0 + 46} 0 Z`} fill="#141B1D" />
      <path d={`${top} L${X1} ${D.glass} L${X0} ${D.glass} L${X0} 44 Q${X0} 0 ${X0 + 46} 0 Z`} fill="url(#hx1-glass)" />
      <g clipPath="url(#hx1-glass-clip)">
        {/* the amber leaks up between the caps and into the slab */}
        {TOP.slice(0, -1).map((c, i) => {
          const x = hookX1X(c.x) + KEY.w * 3;
          return <rect key={c.id} x={x - 8} y={6} width={hookX1X(TOP[i + 1].x) - x + 16} height={D.glass - 6} fill="url(#hx1-shaft)" opacity={0.7 + 0.25 * Math.sin(f / 12 + i * 1.7)} filter="url(#hx1-soft4)" />;
        })}
        {Array.from({ length: 46 }, (_, i) => {
          const x = X0 + hookX1Rnd(i * 3 + 1) * (X1 - X0);
          return <rect key={i} x={x} y={10 + hookX1Rnd(i + 70) * 96} width={40 + hookX1Rnd(i + 9) * 150} height={1.5} fill="#EAF7FA" opacity={0.06 + 0.1 * hookX1Rnd(i + 30)} />;
        })}
        <rect x={sheen} y={-20} width={190} height={170} fill="#FFFFFF" opacity={0.1} transform={`skewX(-28)`} filter="url(#hx1-soft4)" />
        <rect x={sheen + 260} y={-20} width={36} height={170} fill="#FFFFFF" opacity={0.12} transform={`skewX(-28)`} filter="url(#hx1-soft4)" />
        {/* under the load the glass shows its strain: pale fringes fanning down from the pad */}
        {load > 0.02 && [0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={cx} cy={sag} rx={150 + i * 95} ry={22 + i * 24} fill="none" stroke="#DFF6FF" strokeWidth={2.5} opacity={load * (0.34 - i * 0.07)} />
        ))}
      </g>
      <path d={top} fill="none" stroke="#FFFFFF" strokeWidth={3.5} opacity={0.92} />
      <path d={top} fill="none" stroke="#CFF3FF" strokeWidth={12} opacity={0.22} filter="url(#hx1-soft4)" />
      <rect x={X0} y={D.glass - 2} width={X1 - X0} height={2.5} fill="#E4F5F8" opacity={0.42} />
    </g>
  );
};

/** what the phone is made of under the display, and its metal edge */
const Body: React.FC = () => (
  <g>
    <rect x={X0} y={D.zoneB} width={X1 - X0} height={290} fill="url(#hx1-body)" />
    <rect x={X0} y={D.zoneB + 4} width={X1 - X0} height={9} fill="#3A3A3D" />
    <rect x={X0 + 60} y={D.zoneB + 34} width={X1 - X0 - 60} height={150} rx={10} fill="#19191B" stroke="#303033" strokeWidth={2} />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={X0 + 60} y={D.zoneB + 48 + i * 15} width={X1 - X0 - 60} height={1.5} fill="#2B2B2E" />)}
    <rect x={X0} y={D.zoneB + 204} width={X1 - X0} height={7} fill="#2E2E31" />
    <path d={`M${X0 - 4} -4 H${X0 - 60} Q${X0 - 96} -4 ${X0 - 96} 40 V760 H${X0 - 4} Z`} fill="url(#hx1-metal)" />
    <rect x={X0 - 88} y={30} width={5} height={700} fill="#FFFFFF" opacity={0.35} />
    <rect x={X0 - 6} y={-4} width={6} height={760} fill="#0A0A0B" />
  </g>
);

/** the touch point: the patent's white "+". It drops through the glass and is held by the zone that caught it */
const Plus: React.FC<{ f: number; T: HookX1T }> = ({ f, T }) => {
  if (f < T.touch + 1) return null;
  const y = hookX1PlusY(f, T);
  const land = hookX1Bump(f, T.caught, 9);
  const falling = f < T.caught;
  return (
    <g>
      {falling && <rect x={TAPX - 3} y={0} width={6} height={y} fill="#FFFFFF" opacity={0.5} />}
      {f >= T.caught && <circle cx={TAPX} cy={y} r={30 + 150 * (1 - land)} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.8 * land} />}
      <g transform={`translate(${TAPX} ${y.toFixed(1)}) scale(${(1 + 0.45 * land).toFixed(3)})`} strokeLinecap="round">
        <path d="M-27 0 H27 M0 -27 V27" stroke="#3A1F00" strokeWidth={15} opacity={0.7} />
        <path d="M-27 0 H27 M0 -27 V27" stroke="#FFFFFF" strokeWidth={8} />
      </g>
    </g>
  );
};

export const HookX1Section: React.FC<{ f: number; T: HookX1T; lit: number; sag: number; cx: number; load: number }> = ({ f, T, lit, sag, cx, load }) => {
  const flash = hookX1Flash(f, T);
  return (
    <g>
      <Defs />
      <Body />
      <Zones f={f} flash={flash} give={Math.sin(Math.PI * Math.min(1, Math.max(0, (f - T.caught) / 9))) * (f < T.caught + 9 ? 1 : 0)} />
      <Caps f={f} lit={lit} />
      <Glass f={f} sag={sag} cx={cx} load={load} />
      <Plus f={f} T={T} />
    </g>
  );
};
