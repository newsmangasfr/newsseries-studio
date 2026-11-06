// flatten, the press: a heavy pane of glass on four hydraulic rods comes down along the arrow and a thin lower plate
// rises to meet it, so every request ends at the same height (the normal middle's), exactly turn(flatten(p, 1), 1).
// Only the height changes: each point's left-right / forward-back position is untouched (the scene shows it with the
// stems and footprints). A point is moved only once a plate reaches it, so the red corner, the highest, is squeezed
// first.
import React from "react";
import { Easing } from "remotion";
import { prog } from "../../../src/engine";
import { type Cam, type V3, ARROW_FROM, ARROW_TO, POINTS, project, turn } from "./map";
import { NO } from "./parts";

/** the plane every point is pressed onto: the normal middle's height in the turned map */
export const PLANE_Y = ARROW_FROM(1)[1];
const TURNED = POINTS.map((q) => turn(q.p, 1));
const CX = TURNED.reduce((s, p) => s + p[0], 0) / TURNED.length, CZ = TURNED.reduce((s, p) => s + p[2], 0) / TURNED.length;
const HALF = 1.12;
export const TOP_START = 1.36, LOW_START = -1.2;

export type PressT = { edit: number; flat: number };
/** 0..1, how far the plates have travelled; heavy: slow to start, pressing hardest at the end */
export const pressOf = (f: number, T: PressT) => prog(f, T.edit + 6, T.flat - T.edit - 6, Easing.bezier(0.5, 0, 0.75, 1));
export const upperY = (p: number) => TOP_START + (PLANE_Y - TOP_START) * p;
export const lowerY = (p: number) => LOW_START + (PLANE_Y - LOW_START) * p;

/** a point's height under the press */
export function pressedY(home: number, p: number) {
  if (p >= 1) return PLANE_Y;
  return home > PLANE_Y ? Math.min(home, upperY(p)) : Math.max(home, lowerY(p));
}

const quad = (y: number, cam: Cam, half = HALF) =>
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => project([CX + a * half, y, CZ + b * half] as V3, cam));
const pts = (q: { x: number; y: number }[]) => q.map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`).join(" ");

/** one glass plate: bottom face, the four edges (glass-green), the top face with a moving reflection */
const Plate: React.FC<{ y: number; th: number; cam: Cam; alpha: number; id: string; shine: number; heat?: number }> = ({ y, th, cam, alpha, id, shine, heat = 0 }) => {
  const top = quad(y, cam), bot = quad(y - th, cam);
  const sides = [0, 1, 2, 3].map((i) => {
    const j = (i + 1) % 4;
    const d = (project([CX, y, CZ], cam).depth + 0) - (top[i].depth + top[j].depth) / 2;
    return { i, j, d };
  }).sort((a, b) => a.d - b.d);
  const near = top.reduce((m, s, i) => (s.y > top[m].y ? i : m), 0);
  const heatAt = project([ARROW_TO(1)[0], y, ARROW_TO(1)[2]], cam);
  const sx = top[0].x + (top[2].x - top[0].x) * shine, sy = top[0].y + (top[2].y - top[0].y) * shine;
  return (
    <g opacity={alpha}>
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8F2FF" stopOpacity={0.2} />
          <stop offset="0.55" stopColor="#BFE6FF" stopOpacity={0.07} />
          <stop offset="1" stopColor="#D8F2FF" stopOpacity={0.14} />
        </linearGradient>
        <clipPath id={`${id}-clip`}><polygon points={pts(top)} /></clipPath>
      </defs>
      <polygon points={pts(bot)} fill="rgba(160,220,215,0.05)" />
      {sides.map(({ i, j }) => (
        <polygon key={i} points={pts([top[i], top[j], bot[j], bot[i]])} fill="rgba(150,225,210,0.22)" stroke="rgba(200,255,240,0.35)" strokeWidth={1} />
      ))}
      <polygon points={pts(top)} fill={`url(#${id}-top)`} stroke="rgba(230,250,255,0.4)" strokeWidth={1.5} />
      <line x1={top[near].x} y1={top[near].y} x2={top[(near + 1) % 4].x} y2={top[(near + 1) % 4].y} stroke="#EFFFFF" strokeWidth={2.5} opacity={0.85} />
      <line x1={top[near].x} y1={top[near].y} x2={top[(near + 3) % 4].x} y2={top[(near + 3) % 4].y} stroke="#EFFFFF" strokeWidth={2.5} opacity={0.85} />
      <g clipPath={`url(#${id}-clip)`}>
        <line x1={sx - 420} y1={sy + 520} x2={sx + 420} y2={sy - 520} stroke="#fff" strokeWidth={70} opacity={0.07} />
        <line x1={sx - 330} y1={sy + 520} x2={sx + 510} y2={sy - 520} stroke="#fff" strokeWidth={14} opacity={0.08} />
        {heat > 0 && <ellipse cx={heatAt.x} cy={heatAt.y} rx={190 * heatAt.scale} ry={70 * heatAt.scale} fill={NO} opacity={0.22 * heat} filter="url(#ff-glow)" />}
      </g>
    </g>
  );
};

/** the four hydraulic rods holding the upper plate, fading out before they reach the caption */
const Rods: React.FC<{ y: number; cam: Cam }> = ({ y, cam }) => (
  <g mask="url(#fp-rodmask)">
    <defs>
      <linearGradient id="fp-rodfade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.29" stopColor="#fff" stopOpacity={0} />
        <stop offset="0.4" stopColor="#fff" stopOpacity={1} />
      </linearGradient>
      <mask id="fp-rodmask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#fp-rodfade)" />
      </mask>
    </defs>
    {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b], i) => {
      const lo = project([CX + a * (HALF - 0.12), y, CZ + b * (HALF - 0.12)], cam);
      const hi = project([CX + a * (HALF - 0.12), y + 4, CZ + b * (HALF - 0.12)], cam);
      const w = 16 * lo.scale;
      return (
        <g key={i}>
          <defs>
            <linearGradient id={`fp-rod${i}`} gradientUnits="userSpaceOnUse" x1={lo.x - w / 2} y1={0} x2={lo.x + w / 2} y2={0}>
              <stop offset="0" stopColor="#3A3F47" /><stop offset="0.35" stopColor="#E9EEF5" /><stop offset="0.6" stopColor="#8B939E" /><stop offset="1" stopColor="#2A2E35" />
            </linearGradient>
          </defs>
          <line x1={lo.x} y1={lo.y} x2={hi.x} y2={hi.y} stroke={`url(#fp-rod${i})`} strokeWidth={w} />
          <ellipse cx={lo.x} cy={lo.y} rx={w * 0.9} ry={w * 0.35} fill="#9AA3AE" />
        </g>
      );
    })}
  </g>
);

/** behind the points: the finished flat sheet and the lower plate rising */
export const PressBack: React.FC<{ cam: Cam; p: number; appear: number; lift: number; sheet: number }> = ({ cam, p, appear, lift, sheet }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {sheet > 0 && <Plate y={PLANE_Y} th={0.012} cam={cam} alpha={0.5 * sheet} id="fp-sheet" shine={0.5} />}
    {appear > 0 && lift < 1 && <Plate y={lowerY(p)} th={0.03} cam={cam} alpha={0.5 * appear * (1 - lift)} id="fp-low" shine={0.3 + p * 0.3} />}
  </svg>
);

/** in front of the points: the heavy upper plate on its rods; `lift` takes it back up and away once the edit is done */
export const PressFront: React.FC<{ cam: Cam; p: number; appear: number; lift: number }> = ({ cam, p, appear, lift }) => {
  if (appear <= 0 || lift >= 1) return null;
  const yU = upperY(p) + (1 - appear) * 0.2 + lift * 0.7;
  const heat = p > 0.18 && p < 1 ? Math.min(1, (p - 0.18) * 4) : p >= 1 ? 1 - lift : 0;
  return (
    <g opacity={appear * (1 - lift)}>
      <Rods y={yU} cam={cam} />
      <Plate y={yU} th={0.1} cam={cam} alpha={1} id="fp-up" shine={0.15 + p * 0.6} heat={heat} />
    </g>
  );
};

export const plateCentre: V3 = [CX, PLANE_Y, CZ];
