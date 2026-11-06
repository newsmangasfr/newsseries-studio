// The shared look of THE MAP (map.ts). A scene passes the camera and how each point sits/looks this frame; MapSpace
// draws the floor grid, the three axes, the points (far first, depth-fogged, glowing) and the red arrow. Scenes add
// their own layers on top (labels, cards, the flatten plane, cracks) using project() from map.ts.
import React from "react";
import { type Cam, type Pt, type V3, POINTS, CLUSTERS, project } from "./map";
import { NO } from "./parts";

export type PtLook = { p: V3; r?: number; color?: string; alpha?: number; glow?: number };

export const MapSpace: React.FC<{
  cam: Cam;
  /** where/how each point is drawn this frame (default: its home, its cluster colour) */
  look?: (q: Pt) => PtLook | null;
  points?: Pt[];
  /** 0..1 how much of the floor grid and the three axes are drawn */
  grid?: number;
  axes?: number;
  /** the refusal arrow from `from` to `to` (world), drawn 0..1 */
  arrow?: { from: V3; to: V3; t: number; width?: number };
  children?: React.ReactNode;
}> = ({ cam, look, points = POINTS, grid = 1, axes = 1, arrow, children }) => {
  const P = (v: V3) => project(v, cam);
  const drawn = points
    .map((q) => {
      const l = look ? look(q) : { p: q.p };
      if (!l) return null;
      const s = P(l.p);
      return { q, l, s };
    })
    .filter(Boolean) as { q: Pt; l: PtLook; s: ReturnType<typeof project> }[];
  drawn.sort((a, b) => b.s.depth - a.s.depth);

  const gridLines: React.ReactNode[] = [];
  if (grid > 0) {
    const y = -1.25, n = 8;
    for (let i = 0; i <= n; i++) {
      const u = -1.6 + (3.2 * i) / n;
      const a1 = P([u, y, -1.6]), b1 = P([u, y, 1.6]), a2 = P([-1.6, y, u]), b2 = P([1.6, y, u]);
      gridLines.push(<line key={`g${i}a`} x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} />, <line key={`g${i}b`} x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} />);
    }
  }
  const o = P([-1.6, -1.25, -1.6]);
  const ax = [P([-1.6 + 3.4 * axes, -1.25, -1.6]), P([-1.6, -1.25 + 2.8 * axes, -1.6]), P([-1.6, -1.25, -1.6 + 3.4 * axes])];

  let arrowEl: React.ReactNode = null;
  if (arrow && arrow.t > 0) {
    const a = P(arrow.from), b0 = P(arrow.to);
    const b = { x: a.x + (b0.x - a.x) * arrow.t, y: a.y + (b0.y - a.y) * arrow.t };
    const ang = Math.atan2(b.y - a.y, b.x - a.x), w = arrow.width ?? 10, h = w * 2.6;
    arrowEl = (
      <g style={{ filter: `drop-shadow(0 0 18px ${NO})` }}>
        <line x1={a.x} y1={a.y} x2={b.x - Math.cos(ang) * h * 0.6} y2={b.y - Math.sin(ang) * h * 0.6} stroke={NO} strokeWidth={w} strokeLinecap="round" />
        <polygon fill={NO} points={`${b.x},${b.y} ${b.x - Math.cos(ang) * h - Math.sin(ang) * h * 0.55},${b.y - Math.sin(ang) * h + Math.cos(ang) * h * 0.55} ${b.x - Math.cos(ang) * h + Math.sin(ang) * h * 0.55},${b.y - Math.sin(ang) * h - Math.cos(ang) * h * 0.55}`} />
      </g>
    );
  }

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible",
      // the map never reaches Instagram's right-hand buttons or the bottom bar: it fades out before them
      WebkitMaskImage: "linear-gradient(to bottom, #000 0, #000 1480px, transparent 1680px), linear-gradient(to right, #000 0, #000 930px, transparent 1040px)",
      WebkitMaskComposite: "source-in", maskComposite: "intersect" }}>
      <g stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} opacity={grid}>{gridLines}</g>
      {axes > 0 && (
        <g strokeWidth={3} strokeLinecap="round" opacity={0.55 * Math.min(1, axes * 2)}>
          <line x1={o.x} y1={o.y} x2={ax[0].x} y2={ax[0].y} stroke="#9fb4ff" />
          <line x1={o.x} y1={o.y} x2={ax[1].x} y2={ax[1].y} stroke="#9fffd0" />
          <line x1={o.x} y1={o.y} x2={ax[2].x} y2={ax[2].y} stroke="#ffd29f" />
        </g>
      )}
      {drawn.map(({ q, l, s }) => {
        const fog = Math.max(0.35, Math.min(1, 1.6 - s.depth / 5));
        const r = (l.r ?? 9) * s.scale;
        const col = l.color ?? CLUSTERS[q.kind].color;
        const al = (l.alpha ?? 1) * fog;
        return (
          <g key={q.id} opacity={al}>
            <circle cx={s.x} cy={s.y} r={r * 2.4 * (l.glow ?? 1)} fill={col} opacity={0.16} />
            <circle cx={s.x} cy={s.y} r={r} fill={col} />
            <circle cx={s.x - r * 0.3} cy={s.y - r * 0.3} r={r * 0.35} fill="#fff" opacity={0.5} />
          </g>
        );
      })}
      {arrowEl}
      {children}
    </svg>
  );
};
