// touchscreen "grid": the touch layer itself. A bar of raking light finds the diamonds on "grid" and loses them by
// "can't"; on "see," they are relit pale, to stay; the rows draw left to right ("rows" to "way"), the columns top to
// bottom ("columns" to "other."), a point lands on every crossing in a wave on "Everywhere". Down at one crossing the
// same shapes get their thickness, and each column steps over its row on a small raised bridge.
import React from "react";
import { ease, prog } from "../../../src/engine";
import {
  ALL_COLS, ALL_ROWS, COLS, COL_D, COL_LABEL, CROSSINGS, FLAT_BRIDGES, N, P, ROWS, ROW_D, ROW_LABEL, SCR, TH,
  type P2, type WireGridT, type WireGridView, clamp, crossX, crossY, lerp, wireGridLine,
} from "./WireGridKit";

const NS = { vectorEffect: "non-scaling-stroke" as const };

export const WireGridLatticeDefs: React.FC<{ V: WireGridView }> = ({ V }) => (
  <defs>
    {/* one sheen per diamond: the gradient repeats on the lattice's own diagonal */}
    <linearGradient id="wg-row" gradientUnits="userSpaceOnUse" x1={20} y1={0} x2={40} y2={20} spreadMethod="repeat">
      <stop offset="0" stopColor="#F4F7FB" stopOpacity="0.44" />
      <stop offset="0.5" stopColor="#BEC7D4" stopOpacity="0.2" />
      <stop offset="0.92" stopColor="#8F99A8" stopOpacity="0.13" />
      <stop offset="1" stopColor="#F4F7FB" stopOpacity="0.44" />
    </linearGradient>
    <linearGradient id="wg-col" gradientUnits="userSpaceOnUse" x1={20} y1={0} x2={40} y2={20} spreadMethod="repeat">
      <stop offset="0" stopColor="#AEB7C5" stopOpacity="0.2" />
      <stop offset="0.5" stopColor="#7B8492" stopOpacity="0.1" />
      <stop offset="0.92" stopColor="#535B67" stopOpacity="0.08" />
      <stop offset="1" stopColor="#AEB7C5" stopOpacity="0.2" />
    </linearGradient>
    {/* the light that runs along a wire once it is drawn, the way the wire goes */}
    <linearGradient id="wg-run-h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
      <stop offset="0.72" stopColor="#FFFFFF" stopOpacity="0.8" />
      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="wg-run-v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
      <stop offset="0.72" stopColor="#FFFFFF" stopOpacity="0.7" />
      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
    </linearGradient>
    <clipPath id="wg-rows-shape"><path d={ALL_ROWS} /></clipPath>
    <clipPath id="wg-cols-shape"><path d={ALL_COLS} /></clipPath>
    <clipPath id="wg-screen"><rect x={0} y={0} width={SCR.w} height={SCR.h} rx={SCR.r} /></clipPath>
    <clipPath id="wg-screen-f"><rect x={0} y={0} width={SCR.w} height={SCR.h} rx={SCR.r} transform={V.matrix()} /></clipPath>
  </defs>
);

/** a band of light crossing the frame, as a mask: full inside the band, `trail` behind it, nothing ahead */
const Band: React.FC<{ id: string; x: number; trail: number }> = ({ id, x, trail }) => (
  <defs>
    <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1={x - 900} y1={0} x2={x + 230} y2={150}>
      <stop offset="0" stopColor="#FFFFFF" stopOpacity={trail} />
      <stop offset="0.6" stopColor="#FFFFFF" stopOpacity={trail} />
      <stop offset="0.8" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="0.88" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
    </linearGradient>
    <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
      <rect x={-600} y={0} width={2400} height={1920} fill={`url(#${id}-g)`} />
    </mask>
  </defs>
);

/** the lattice caught by light: every diamond bright, edges white */
const Lit: React.FC<{ V: WireGridView; k: number; flat?: boolean }> = ({ V, k, flat = true }) => (
  <g transform={V.matrix()} opacity={k}>
    <g clipPath="url(#wg-screen)">
      <path d={ALL_ROWS} fill="#E9EEF5" fillOpacity={0.5} stroke="#FFFFFF" strokeWidth={1.5} {...NS} />
      <path d={ALL_COLS} fill="#C3CBD8" fillOpacity={0.42} stroke="#F2F5FA" strokeOpacity={0.9} strokeWidth={1.3} {...NS} />
      {flat && <path d={FLAT_BRIDGES} fill="#FFFFFF" fillOpacity={0.8} />}
    </g>
  </g>
);

/** how far each row and column has drawn (0 to 1) */
const rowDrawn = (f: number, j: number, T: WireGridT) => prog(f, T.rows + (j * (T.way - T.rows - 12)) / (ROWS - 1), 16, ease.inOut);
const colDrawn = (f: number, i: number, T: WireGridT) => prog(f, T.columns + (i * (T.other - T.columns - 16)) / (COLS - 1), 16, ease.inOut);

/** the bridges, standing off the rows: a small arched strip per crossing, its two flanks and the shadow it throws */
const Bridges: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  const n = V.macro > 0.02 ? 8 : 2;
  const rise = 2.3;
  const z = (u: number) => TH + rise * Math.pow(Math.sin(Math.PI * u), 0.55);
  return (
    <g>
      {CROSSINGS.map((c) => {
        const k = clamp((colDrawn(f, c.i, T) * 955 - c.y + 6) / 12);
        if (k <= 0) return null;
        const [hx, hy] = V.pt(c.x, c.y);
        if (hx < -80 || hx > 1160 || hy < 240 || hy > 1960) return null;
        const side = (x: number, dz: number): P2[] => Array.from({ length: n + 1 }, (_, m) => V.pt(x, c.y + (m / n - 0.5) * 9.4, z(m / n) - dz));
        const l = side(c.x - N, 0), r = side(c.x + N, 0), l2 = side(c.x - N, 0.5), r2 = side(c.x + N, 0.5);
        const strip = (a: P2[], b: P2[]) => wireGridLine([...a, ...[...b].reverse()]) + "Z";
        return (
          <g key={c.n} opacity={k}>
            {V.macro > 0.02 && <path d={strip(side(c.x - N * 1.5, z(0.5) - TH), side(c.x + N * 1.5, z(0.5) - TH))} fill="#000000" opacity={0.4 * V.macro} />}
            <path d={strip(l, l2)} fill="#4A525E" />
            <path d={strip(r, r2)} fill="#6B7482" />
            <path d={strip(l, r)} fill={V.macro > 0.5 ? "#D5DBE4" : "#A9B1BD"} stroke="#FFFFFF" strokeOpacity={0.35 + 0.35 * V.macro} strokeWidth={0.6 + 0.9 * V.macro} />
          </g>
        );
      })}
    </g>
  );
};

/** a point on every crossing, in a wave from the top left corner to the bottom right */
const Points: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  // they mark the crossings until we go down to one; after that the charge marks them
  const gone = prog(f, T.crosses - 2, 14, ease.in);
  if (f < T.everywhere - 2 || gone >= 1) return null;
  const step = (T.crosses - 10 - T.everywhere) / (COLS + ROWS - 2);
  return (
    <g opacity={1 - gone}>
      {CROSSINGS.map((c) => {
        const t = f - (T.everywhere + (c.i + c.j) * step);
        if (t < 0) return null;
        const [x, y] = V.pt(c.x, c.y, TH);
        const ring = clamp(t / 10);
        return (
          <g key={c.n}>
            {ring < 1 && <circle cx={x} cy={y} r={5 + 24 * ease.out(ring)} fill="none" stroke="#FFFFFF" strokeOpacity={0.85 * (1 - ring)} strokeWidth={2.2} />}
            <circle cx={x} cy={y} r={(13 + 9 * Math.exp(-t / 3)) * Math.max(1, V.s / 2.3)} fill="#FFFFFF" opacity={0.2} />
            <circle cx={x} cy={y} r={(5 + 4 * Math.exp(-t / 3)) * Math.max(1, V.s / 2.3)} fill="#FFFFFF" />
          </g>
        );
      })}
    </g>
  );
};

export const WireGridLattice: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  if (f < T.grid - 9) return null;
  // the raking light: in fast, then it moves on across the glass and off by "can't"
  const rakeOn = f < T.cant + 2;
  const rp = prog(f, T.grid - 8, T.cant - T.grid + 4, (n) => 1 - (1 - n) * (1 - n));
  const bx = lerp(-150, 1420, rp);
  const rk = prog(f, T.grid - 8, 5) * (1 - prog(f, T.cant - 7, 7, ease.in));
  const trail = 0.24 * (1 - prog(f, T.wires + 6, T.cant - T.wires - 7, ease.in));
  // a second, weaker light slides over the crossing while we look at how it is built
  const gp = prog(f, T.the3 - 4, T.holds - T.the3 + 10, ease.inOut);
  const glintOn = gp > 0 && gp < 1;
  const ghost = prog(f, T.see, 10, ease.out);
  const sw = 1.1 + 1.5 * V.macro;
  const deep = TH * V.up; // how many pixels of thickness the conductor shows
  const rowHi = prog(f, T.going1, 7) * (1 - prog(f, T.everywhere - 4, 10));
  const colHi = prog(f, T.going2, 7) * (1 - prog(f, T.everywhere - 4, 10));
  const rowsOn = f >= T.rows, colsOn = f >= T.columns;
  return (
    <g>
      {rakeOn && (
        <g>
          <Band id="wg-rake" x={bx} trail={trail} />
          <g clipPath="url(#wg-screen-f)"><rect x={bx - 190} y={0} width={380} height={1920} fill="#FFFFFF" opacity={0.1 * rk} style={{ filter: "blur(50px)" }} transform={`skewX(-8)`} /></g>
          <g mask="url(#wg-rake)"><Lit V={V} k={rk} /></g>
        </g>
      )}
      {ghost > 0 && (
        <g transform={V.matrix()} opacity={ghost}>
          <g clipPath="url(#wg-screen)" fill="#D6DEEB" fillOpacity={0.055} stroke="#D6DEEB" strokeOpacity={0.4} strokeWidth={1.1}>
            <path d={ALL_ROWS} {...NS} />
            <path d={ALL_COLS} {...NS} />
          </g>
        </g>
      )}
      {/* the thickness, seen only once the view tilts: the same outlines stepped down, the lowest one a shadow */}
      {deep > 0.8 && rowsOn && [3, 2, 1].map((k) => (
        <g key={k} transform={`translate(0 ${((k / 3) * deep + (k === 3 ? deep * 0.5 : 0)).toFixed(2)})`}>
          <g transform={V.matrix()}>
            <g clipPath="url(#wg-screen)" fill={k === 3 ? "#000000" : "none"} fillOpacity={0.42} stroke="#98A2B2" strokeOpacity={k === 3 ? 0 : 0.36} strokeWidth={1.2}>
              <path d={ALL_ROWS} {...NS} />
              <path d={ALL_COLS} {...NS} />
            </g>
          </g>
        </g>
      ))}
      {(rowsOn || colsOn) && (
        <g transform={V.matrix()} opacity={1 - 0.42 * V.back}>
          <defs>
            <clipPath id="wg-rows-in">{ROW_D.map((_, j) => <rect key={j} x={0} y={crossY(j) - P / 2} width={SCR.w * rowDrawn(f, j, T)} height={P} />)}</clipPath>
            <clipPath id="wg-cols-in">{COL_D.map((_, i) => <rect key={i} x={crossX(i) - P / 2} y={0} width={P} height={SCR.h * colDrawn(f, i, T)} />)}</clipPath>
          </defs>
          <g clipPath="url(#wg-screen)">
            {rowsOn && (
              <g clipPath="url(#wg-rows-in)">
                <path d={ALL_ROWS} fill="url(#wg-row)" stroke="#F1F4F9" strokeOpacity={0.9} strokeWidth={sw} {...NS} />
                {rowHi > 0 && <path d={ROW_D[ROW_LABEL]} fill="#FFFFFF" fillOpacity={0.55 * rowHi} stroke="#FFFFFF" strokeOpacity={rowHi} strokeWidth={2.2} {...NS} />}
              </g>
            )}
            {colsOn && (
              <g clipPath="url(#wg-cols-in)">
                <path d={ALL_COLS} fill="url(#wg-col)" stroke="#98A1AF" strokeOpacity={0.8} strokeWidth={sw} {...NS} />
                {colHi > 0 && <path d={COL_D[COL_LABEL]} fill="#FFFFFF" fillOpacity={0.5 * colHi} stroke="#FFFFFF" strokeOpacity={colHi} strokeWidth={2.2} {...NS} />}
              </g>
            )}
            {/* the bright head of each wire while it is being drawn */}
            {ROW_D.map((_, j) => {
              const p = rowDrawn(f, j, T);
              return p > 0 && p < 1 ? <ellipse key={j} cx={SCR.w * p} cy={crossY(j)} rx={5.5} ry={1.7} fill="#FFFFFF" opacity={0.95} style={{ filter: "blur(0.6px)" }} /> : null;
            })}
            {COL_D.map((_, i) => {
              const p = colDrawn(f, i, T);
              return p > 0 && p < 1 ? <ellipse key={i} cx={crossX(i)} cy={SCR.h * p} rx={1.7} ry={5.5} fill="#FFFFFF" opacity={0.95} style={{ filter: "blur(0.6px)" }} /> : null;
            })}
            {/* "one way": a light runs along every row, left to right. "the other": down every column */}
            {f >= T.way - 3 && f < T.columns + 4 && (
              <g clipPath="url(#wg-rows-shape)">
                {ROW_D.map((_, j) => {
                  const p = prog(f, T.way - 3 + (j % 4) * 2, T.columns - T.way - 4, ease.inOut);
                  return p > 0 && p < 1 ? <rect key={j} x={lerp(-90, SCR.w, p)} y={crossY(j) - P / 2} width={90} height={P} fill="url(#wg-run-h)" /> : null;
                })}
              </g>
            )}
            {f >= T.other - 4 && f < T.everywhere + 6 && (
              <g clipPath="url(#wg-cols-shape)">
                {COL_D.map((_, i) => {
                  const p = prog(f, T.other - 4 + (i % 3) * 2, T.everywhere - T.other + 2, ease.inOut);
                  return p > 0 && p < 1 ? <rect key={i} x={crossX(i) - P / 2} y={lerp(120, 900, p)} width={P} height={110} fill="url(#wg-run-v)" /> : null;
                })}
              </g>
            )}
          </g>
        </g>
      )}
      {colsOn && <Bridges f={f} T={T} V={V} />}
      {glintOn && (
        <g>
          <Band id="wg-glint" x={lerp(-200, 1500, gp)} trail={0} />
          <g mask="url(#wg-glint)"><Lit V={V} k={0.5} flat={false} /></g>
        </g>
      )}
      <Points f={f} T={T} V={V} />
    </g>
  );
};
