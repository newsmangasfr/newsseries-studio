// touchscreen "grid": the charge, the one gold thing. On "holds" a pulse runs in along the row and leaves it live;
// on "tiny" the first filament climbs out of the row diamond and arches over the gap onto the column diamond; by
// "charge," a dozen stand there, sagging a little, a bead of light running along each. On "every" the view pulls
// back and every crossing of the grid has its own, spreading outward from the one we were looking at.
import React from "react";
import { ease, prog } from "../../../src/engine";
import {
  CROSSINGS, GOLD, HERO, ROW_D, SCR, TH, type P2, type P3, type WireGridT, type WireGridView, clamp, lerp,
  wireGridFilament, wireGridFlash, wireGridLine,
} from "./WireGridKit";

const NS = { vectorEffect: "non-scaling-stroke" as const };
/** the order the hero's twelve filaments rise in: the near side first, the middle rib of each quarter before the others */
const ORDER: [number, number][] = [[3, 1], [2, 1], [1, 1], [0, 1], [3, 0], [2, 2], [1, 0], [0, 2], [3, 2], [2, 0], [1, 2], [0, 0]];

/** when the hero's n-th filament starts to rise, and how long it takes */
export const wireGridRise = (n: number, T: WireGridT) =>
  n === 0 ? { at: T.tiny, dur: 16 } : { at: lerp(T.electric, T.charge - 12, (n - 1) / 10), dur: 12 };

/** the top of the hero filament that carries the `CHARGE` label */
export const wireGridApex = (f: number, V: WireGridView): P2 => {
  const pts = wireGridFilament(HERO.x, HERO.y, 1, 2, f);
  const top = pts.reduce((a, b) => (b[2] > a[2] ? b : a));
  return V.pt(top[0], top[1], top[2]);
};

const project = (pts: P3[], V: WireGridView) => pts.map((p) => V.pt(p[0], p[1], p[2]));

/** the twelve filaments of the crossing we are at */
const Hero: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  if (f < T.tiny) return null;
  const w = clamp(V.s / 20, 0.3, 1.1);
  const extra = clamp((V.s - 3.5) / 4); // back in the wide view only one rib a quarter is left, like everywhere else
  const read = wireGridFlash(f, HERO.j, T) * (f >= T.every ? 1 : 0) + (f >= T.checks ? Math.exp(-(f - T.checks) / 6) : 0);
  const tall = lerp(1.75, 1, clamp((V.s - 2.5) / 6));
  return (
    <g>
      {ORDER.map(([q, k], n) => {
        const o = k === 1 ? 1 : extra;
        const { at, dur } = wireGridRise(n, T);
        if (f < at || o <= 0) return null;
        const g = prog(f, at, dur, ease.out);
        const t = f - (at + dur);
        const lift = tall * (t < 0 ? 0.8 + 0.2 * g : 1 + 0.24 * Math.exp(-t / 6) * Math.cos(t / 2.4));
        const pts = project(wireGridFilament(HERO.x, HERO.y, q, k, f, { grow: g, lift, n: 14 }), V);
        const d = wireGridLine(pts);
        const tip = pts[pts.length - 1], foot = pts[0];
        const u = (f * 0.021 + n * 0.37) % 1;
        const bead = pts[Math.round(u * (pts.length - 1))];
        const land = t >= 0 && t < 10 ? t / 10 : -1;
        return (
          <g key={n} opacity={o} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx={foot[0]} cy={foot[1]} rx={15 * w} ry={7 * w} fill={GOLD} opacity={0.34} />
            <path d={d} stroke={GOLD} strokeOpacity={0.13 + 0.12 * read} strokeWidth={30 * w} />
            <path d={d} stroke={GOLD} strokeOpacity={0.3 + 0.2 * read} strokeWidth={15 * w} />
            <path d={d} stroke={GOLD} strokeOpacity={0.85} strokeWidth={7 * w} />
            <path d={d} stroke="#FFF3CC" strokeOpacity={0.95} strokeWidth={Math.max(1.1, 2.8 * w)} />
            {g < 1 && <circle cx={tip[0]} cy={tip[1]} r={6 * w} fill="#FFF6D8" />}
            {land >= 0 && <ellipse cx={tip[0]} cy={tip[1]} rx={(8 + 34 * ease.out(land)) * w} ry={(4 + 17 * ease.out(land)) * w} stroke="#FFE08A" strokeOpacity={1 - land} strokeWidth={2.4 * w} />}
            {g >= 1 && w > 0.4 && (
              <g>
                <circle cx={bead[0]} cy={bead[1]} r={9 * w} fill={GOLD} opacity={0.4} />
                <circle cx={bead[0]} cy={bead[1]} r={3.6 * w} fill="#FFF9E6" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** every other crossing: one small arch a quarter, lit outward from the hero as the view pulls back */
const Field: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  if (f < T.every - 2) return null;
  const tall = lerp(1.75, 1, clamp((V.s - 2.5) / 6));
  const w = clamp(V.s / 2.75, 0.8, 3);
  return (
    <g fill="none" strokeLinecap="round">
      {CROSSINGS.map((c) => {
        if (c.hero) return null;
        const at = T.every - 2 + c.far * 1.5;
        if (f < at) return null;
        const [hx, hy] = V.pt(c.x, c.y);
        if (hx < -60 || hx > 1140 || hy < 240 || hy > 1960) return null;
        const g = prog(f, at, 9, ease.out);
        const t = f - at - 9;
        const lift = tall * (t < 0 ? g : 1 + 0.3 * Math.exp(-t / 5) * Math.cos(t / 2.2));
        const d = [0, 1, 2, 3].map((q) => wireGridLine(project(wireGridFilament(c.x, c.y, q, 1, f, { grow: g, lift, n: 5 }), V))).join("");
        const lit = wireGridFlash(f, c.j, T);
        const breath = 0.82 + 0.18 * Math.sin(f / 11 + c.i * 0.9 + c.j * 0.6);
        return (
          <g key={c.n}>
            <path d={d} stroke={GOLD} strokeOpacity={(0.24 + 0.3 * lit) * breath} strokeWidth={7 * w} />
            <path d={d} stroke={lit > 0.5 ? "#FFF0BF" : "#FFD05A"} strokeOpacity={0.97 * breath} strokeWidth={2.3 * w} />
          </g>
        );
      })}
    </g>
  );
};

/** "holds": a pulse comes in along the row from the left; the row it has passed stays warm */
const RowPulse: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  if (f < T.holds - 1 || V.macro < 0.02) return null;
  const run = prog(f, T.holds - 1, 26, ease.linear);
  const px = lerp(HERO.x - 32, HERO.x + 34, run);
  const warm = (0.5 + 0.08 * Math.sin(f / 7)) * V.macro;
  const [x, y] = V.pt(px, HERO.y, TH);
  const [x2, y2] = V.pt(px - 7, HERO.y, TH);
  return (
    <g>
      <g transform={V.matrix()}>
        <clipPath id="wg-warm"><rect x={0} y={HERO.y - 20} width={Math.max(0, px)} height={40} /></clipPath>
        <g clipPath="url(#wg-warm)">
          <path d={ROW_D[HERO.j]} fill={GOLD} fillOpacity={0.07 * V.macro} stroke={GOLD} strokeOpacity={warm} strokeWidth={2.6} {...NS} />
        </g>
      </g>
      {run < 1 && (
        <g>
          <line x1={x2} y1={y2} x2={x} y2={y} stroke={GOLD} strokeOpacity={0.5} strokeWidth={46} strokeLinecap="round" style={{ filter: "blur(16px)" }} />
          <ellipse cx={x} cy={y} rx={30} ry={15} fill="#FFF3C9" style={{ filter: "blur(5px)" }} />
        </g>
      )}
    </g>
  );
};

export const WireGridCharge: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => (
  <g>
    <RowPulse f={f} T={T} V={V} />
    <Field f={f} T={T} V={V} />
    <Hero f={f} T={T} V={V} />
  </g>
);

/** the reading line (world y) drawn across the grid: a hair of white with a short wake behind it */
export const WireGridReadLine: React.FC<{ y: number; V: WireGridView }> = ({ y, V }) => {
  const a = V.pt(-6, y, TH + 1.2), b = V.pt(SCR.w + 6, y, TH + 1.2);
  const wake = V.pt(-6, y - 26 / Math.max(1, V.s / 4), TH + 1.2);
  const dy = Math.max(6, a[1] - wake[1]);
  return (
    <g>
      <defs>
        <linearGradient id="wg-wake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${b[0]} ${b[1] - dy}L${a[0]} ${a[1] - dy}Z`} fill="url(#wg-wake)" />
      <path d={wireGridLine([a, b])} stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={9} />
      <path d={wireGridLine([a, b])} stroke="#FFFFFF" strokeWidth={2.4} />
    </g>
  );
};
