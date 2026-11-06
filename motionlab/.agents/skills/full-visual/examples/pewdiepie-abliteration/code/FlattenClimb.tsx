// flatten, the ending: (1) seen from above, every cluster sits exactly where it was (ghost rings of the old positions
// around the pressed points, footprints unchanged) and keeps its skill; (2) a refused request is thrown in, lands on
// the flat map, tries to climb toward the arrow's tip where "no" lives, and the glass holds it: the "no" up there is
// struck out and its reply is now an answer.
import React from "react";
import { ease, pop, prog } from "../../../src/engine";
import { type Cam, type Kind, type V3, ARROW_TO, CLUSTERS, POINTS, middle, project, turn, flatten } from "./map";
import { NO, YES } from "./parts";
import { FLOOR, Padlock, ringPath } from "./FindKit";
import { PLANE_Y } from "./FlattenPress";

/** hollow rings where every point was before the press: from above they sit exactly on the pressed points */
export const Ghosts: React.FC<{ cam: Cam; a: number }> = ({ cam, a }) =>
  a <= 0 ? null : (
    <g opacity={a}>
      {POINTS.filter((q) => q.id % 2 === 0).map((q) => {
        const s = project(turn(q.p, 1), cam);
        return <circle key={q.id} cx={s.x} cy={s.y} r={15 * s.scale} fill="none" stroke={CLUSTERS[q.kind].color} strokeWidth={2} opacity={0.75} />;
      })}
    </g>
  );

/** each cluster's footprint on the floor, fixed: the points above it are pressed down, the footprint never moves */
export const Footprints: React.FC<{ cam: Cam; a: number }> = ({ cam, a }) =>
  a <= 0 ? null : (
    <g opacity={a}>
      {(Object.keys(CLUSTERS) as Kind[]).map((k) => {
        const ps = POINTS.filter((q) => q.kind === k).map((q) => turn(q.p, 1));
        const c: V3 = [ps.reduce((t, p) => t + p[0], 0) / ps.length, FLOOR, ps.reduce((t, p) => t + p[2], 0) / ps.length];
        const r = CLUSTERS[k].spread * 2.3;
        return (
          <g key={k}>
            <path d={ringPath(c, r, cam, 48)} fill={CLUSTERS[k].color} fillOpacity={0.1} stroke={CLUSTERS[k].color} strokeOpacity={0.75} strokeWidth={2.5} />
            <path d={ringPath(c, r * 0.12, cam, 16)} fill={CLUSTERS[k].color} />
          </g>
        );
      })}
    </g>
  );

const SKILLS: Exclude<Kind, "refused">[] = ["cooking", "coding", "travel", "music", "math"];

/** each cluster named where it sits, then ticked: the model keeps what it knows */
export const Skills: React.FC<{ f: number; cam: Cam; at: number; tick: number; out: number }> = ({ f, cam, at, tick, out }) => {
  const o = 1 - prog(f, out, 12, ease.in);
  if (f < at || o <= 0) return null;
  return (
    <>
      {SKILLS.map((k, i) => {
        const c = turn(flatten(middle(POINTS.filter((q) => q.kind === k)), 1), 1);
        const s = project(c, cam);
        const st = pop(f, at + i * 5, { dur: 10 });
        const tk = pop(f, tick + i * 4, { dur: 9, from: 0.3 });
        return (
          <div key={k} style={{ position: "absolute", left: s.x, top: s.y - 92, opacity: o * (st.opacity as number), transform: `translateX(-50%) ${st.transform}`,
            display: "flex", alignItems: "center", gap: 10, padding: "8px 18px 8px 14px", borderRadius: 30, whiteSpace: "nowrap",
            background: "rgba(22,22,26,0.92)", boxShadow: `0 0 0 2px ${CLUSTERS[k].color}66, 0 10px 24px rgba(0,0,0,0.5)`,
            fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 32, color: "#fff" }}>
            <span style={{ fontSize: 30 }}>{CLUSTERS[k].emoji}</span>{CLUSTERS[k].label}
            <span style={{ color: YES, fontWeight: 700, opacity: tk.opacity as number, transform: tk.transform as string, display: "inline-block" }}>✓</span>
          </div>
        );
      })}
    </>
  );
};

export type ClimbT = { knows: number; climb: number; no: number; anymore: number; end: number };
const SPOT: V3 = [ARROW_TO(1)[0] - 0.3, PLANE_Y, ARROW_TO(1)[2] + 0.55];

/** the climber's lift above the sheet: two attempts, each stopped hard by the glass */
function strain(f: number, T: ClimbT) {
  const b = (start: number, dur: number, h: number) => {
    const t = (f - start) / dur;
    if (t <= 0 || t >= 1) return 0;
    return h * (t < 0.55 ? Math.sin((t / 0.55) * (Math.PI / 2)) : 1 - ease.in((t - 0.55) / 0.45));
  };
  return b(T.climb - 3, 18, 1) + b(T.climb + 17, 13, 0.55);
}

export const Climb: React.FC<{ f: number; cam: Cam; T: ClimbT }> = ({ f, cam, T }) => {
  const land = T.climb - 8, fly = 26;
  if (f < land - fly) return null;
  const fade = 1 - prog(f, T.end - 16, 12);
  const s = project(SPOT, cam);
  const t = Math.min(1, (f - (land - fly)) / fly), p = 1 - Math.pow(1 - t, 2);
  const x0 = 900, y0 = 1560;
  const x = x0 + (s.x - x0) * p, y = y0 + (s.y - 260 - y0) * p + 260 * p * p;
  const k = strain(f, T);
  const tip = project(ARROW_TO(1), cam);
  const ripple = [T.climb + 6, T.climb + 23].map((a) => prog(f, a, 28, ease.out));
  const open = prog(f, T.anymore - 4, 10, ease.out);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} opacity={fade}>
      {t < 1 ? (
        <g transform={`translate(${x} ${y}) scale(${1.4 - 1.25 * p})`}>
          <rect x={-46} y={-34} width={92} height={68} rx={34} fill="#3A1416" stroke="rgba(255,59,48,0.6)" strokeWidth={2} />
          <Padlock x={0} y={-2} s={1.3} color={NO} />
        </g>
      ) : (
        <g>
          {ripple.map((r, i) => r > 0 && r < 1 && (
            <path key={i} d={ringPath(SPOT, 0.05 + r * (i ? 0.35 : 0.55), cam)} fill="none" stroke="#DFF6FF" strokeWidth={2.5 * (1 - r)} opacity={0.9 * (1 - r)} />
          ))}
          <line x1={s.x} y1={s.y} x2={tip.x} y2={tip.y} stroke={NO} strokeWidth={2} opacity={0.22 * prog(f, T.climb - 6, 8) * (1 - prog(f, T.no + 10, 12))} />
          <ellipse cx={s.x} cy={s.y - 50 * k} rx={22} ry={22 + 50 * k} fill={NO} opacity={0.4} filter="url(#ff-glow)" />
          <ellipse cx={s.x} cy={s.y - 40 * k} rx={16 - 4 * k} ry={16 + 40 * k} fill={NO} stroke="#fff" strokeWidth={3} />
          <ellipse cx={s.x} cy={s.y + 2} rx={60 * (0.25 + k)} ry={16 * (0.25 + k)} fill="#DFF6FF" opacity={0.55 * k} />
          <Padlock x={s.x} y={s.y - 64 - 80 * k} s={1.5} color={open > 0.5 ? YES : NO} open={open} />
        </g>
      )}
      <NoChip f={f} T={T} x={tip.x} y={tip.y} />
      <Answer f={f} T={T} x={s.x} y={s.y} />
    </svg>
  );
};

/** up at the tip, the reply it can no longer reach: shown on "climb", struck out on "no" */
const NoChip: React.FC<{ f: number; T: ClimbT; x: number; y: number }> = ({ f, T, x, y }) => {
  const a = prog(f, T.climb - 2, 10, ease.out) * (1 - prog(f, T.anymore + 6, 12, ease.in));
  if (a <= 0) return null;
  const strike = prog(f, T.no - 2, 10, ease.inOut);
  const w = 352;
  return (
    <g transform={`translate(${x + 44} ${y - 40})`} opacity={a * (1 - 0.45 * strike)}>
      <rect x={0} y={0} width={w} height={60} rx={30} fill="#1D1D21" stroke="rgba(255,59,48,0.45)" strokeWidth={2} />
      <text x={26} y={40} fontFamily="Inter, sans-serif" fontWeight={500} fontSize={30} fill="#FFB4AE">I can&apos;t help with that.</text>
      {strike > 0 && <line x1={20} y1={30} x2={20 + (w - 40) * strike} y2={30} stroke={NO} strokeWidth={4} strokeLinecap="round" />}
    </g>
  );
};

/** down on the map, the reply it gives now: an answer (its content left unreadable) */
const Answer: React.FC<{ f: number; T: ClimbT; x: number; y: number }> = ({ f, T, x, y }) => {
  const st = prog(f, T.anymore - 6, 12, ease.out);
  if (st <= 0) return null;
  return (
    <g transform={`translate(${x + 40} ${y + 30}) scale(${0.85 + 0.15 * st})`} opacity={st}>
      <rect x={0} y={0} width={330} height={104} rx={26} fill="#1D1D21" stroke="rgba(52,199,89,0.55)" strokeWidth={2} />
      <circle cx={30} cy={33} r={8} fill={YES} />
      <text x={48} y={44} fontFamily="Inter, sans-serif" fontWeight={600} fontSize={32} fill="#fff">Sure, here&apos;s how</text>
      <text x={26} y={84} fontFamily="Inter, sans-serif" fontSize={24} fill="rgba(255,255,255,0.7)" filter="url(#ff-unread)">xxxxxx xxx xxxxx xxxx</text>
    </g>
  );
};
