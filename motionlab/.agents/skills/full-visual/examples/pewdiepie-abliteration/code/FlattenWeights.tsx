// flatten, the weights: the machinery under the map. A slab of the model's weights (a grid of real-looking small
// numbers, running on past the edges) rises under the map on "weights". On "decide" a request drops into it, its row
// lights cell by cell (the request multiplied through the weights) and a beam carries the result up to the exact spot
// where it lands. On "edit" the cells the press touches roll to new values, red while they change.
import React from "react";
import { arriveEase, ease, leaveEase, prog } from "../../../src/engine";
import { rand } from "./map";

export const SLAB = { x: 120, y: 1268, w: 840, h: 216, cols: 7, rows: 4 };
const MONO = "'JetBrains Mono', monospace";
const fmt = (v: number) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(4);
const v0 = (r: number, c: number) => (rand(r * 31 + c, 17) - 0.5) * 0.09;
const edited = (r: number, c: number) => rand(r * 31 + c, 23) < 0.42;
const v1 = (r: number, c: number) => v0(r, c) * (0.15 + 0.5 * rand(r * 31 + c, 29)) - (rand(r * 31 + c, 37) - 0.5) * 0.01;

export type WeightsT = { weights: number; decide: number; lands: number; edit: number; everything: number };
export const SCAN_ROW = 2;

/** the slab's frame-state: where it is (y offset), which cell the scan is on, how far the edit has gone */
export function slabState(f: number, T: WeightsT) {
  const inP = prog(f, T.weights - 10, 26, arriveEase(26));
  const outP = prog(f, T.everything - 2, 16, leaveEase(16));
  const scan = (f - (T.decide + 4)) / 3.2; // cells lit so far
  return { dy: (1 - inP) * 340 + outP * 700, op: Math.min(1, inP * 3) * (1 - prog(f, T.everything + 10, 6)), scan };
}

export const Weights: React.FC<{ f: number; T: WeightsT; press: number }> = ({ f, T, press }) => {
  const st = slabState(f, T);
  if (st.op <= 0) return null;
  const cw = SLAB.w / SLAB.cols, ch = SLAB.h / SLAB.rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < SLAB.rows; r++)
    for (let c = 0; c < SLAB.cols; c++) {
      const e = edited(r, c);
      const ep = e ? Math.min(1, Math.max(0, press * 1.25 - rand(r * 31 + c, 41) * 0.25)) : 0;
      const changing = e && ep > 0 && ep < 1 ? 1 : 0;
      const hot = changing * (0.6 + 0.4 * Math.sin(f * 0.9 + c));
      const v = e ? v0(r, c) + (v1(r, c) - v0(r, c)) * ep + changing * (rand(f * 7 + r * 31 + c, 3) - 0.5) * 0.004 : v0(r, c);
      const lit = r === SCAN_ROW && st.scan > c ? Math.max(0, 1 - (st.scan - c) / 14) : 0;
      cells.push(
        <div key={`${r}-${c}`} style={{ position: "absolute", left: c * cw, top: r * ch, width: cw, height: ch, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: MONO, fontSize: 25, letterSpacing: -0.5,
          color: hot > 0 ? `rgba(255,${Math.round(200 - 140 * hot)},${Math.round(190 - 140 * hot)},1)` : lit > 0 ? "#fff" : e && ep >= 1 ? "#F2F2F7" : "rgba(235,238,245,0.72)",
          background: lit > 0 ? `rgba(255,181,71,${0.55 * lit})` : hot > 0 ? `rgba(255,59,48,${0.16 * hot})` : "transparent",
          boxShadow: "inset -1px -1px 0 rgba(255,255,255,0.05)" }}>
          {fmt(v)}
        </div>,
      );
    }
  return (
    <div style={{ position: "absolute", left: SLAB.x, top: SLAB.y - 74, width: SLAB.w, opacity: st.op, transform: `translateY(${st.dy}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginLeft: 70, height: 60 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 42, color: "#fff", letterSpacing: -0.6 }}>weights</span>
        <span style={{ fontFamily: MONO, fontSize: 22, color: "rgba(255,255,255,0.45)" }}>Qwen3.5-9B</span>
      </div>
      <div style={{ perspective: 1300, perspectiveOrigin: "50% -40%" }}>
        <div style={{ position: "relative", width: SLAB.w, height: SLAB.h, transform: "rotateX(38deg)", transformOrigin: "50% 0%",
          background: "linear-gradient(180deg, rgba(38,42,52,0.96), rgba(18,20,26,0.96))", borderRadius: 10,
          boxShadow: "0 1px 0 rgba(255,255,255,0.22) inset, 0 40px 80px rgba(0,0,0,0.6)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)" }}>
          {cells}
          {press > 0 && press < 1 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: 10,
              boxShadow: `inset 0 0 0 2px rgba(255,59,48,${0.5 * Math.sin(press * Math.PI)})` }} />
          )}
        </div>
      </div>
    </div>
  );
};

/** the slab's lit row end, on screen (the beam starts here) */
export function scanEnd(f: number, T: WeightsT) {
  const st = slabState(f, T);
  const ch = SLAB.h / SLAB.rows;
  // rotateX(38deg) about the top edge, perspective 1300 from above: rows compress toward the top
  const depth = (SCAN_ROW + 0.5) * ch;
  const yy = depth * Math.cos((38 * Math.PI) / 180);
  return { x: SLAB.x + SLAB.w * 0.82, y: SLAB.y + yy * 0.9 + st.dy };
}

/** the request that drops into the slab, then the beam that carries its result up to its landing spot */
export const Route: React.FC<{ f: number; T: WeightsT; to: { x: number; y: number } }> = ({ f, T, to }) => {
  const inP = prog(f, T.decide - 18, 18, ease.in);
  const gone = prog(f, T.decide + 2, 8);
  const st = slabState(f, T);
  const bx = SLAB.x + 40, by = SLAB.y + 110 + st.dy;
  const beam = prog(f, T.lands - 26, 22, ease.inOut), fade = prog(f, T.lands + 6, 20);
  const s = scanEnd(f, T);
  const hx = s.x + (to.x - s.x) * beam, hy = s.y + (to.y - s.y) * beam;
  return (
    <>
      {inP > 0 && gone < 1 && (
        <div style={{ position: "absolute", left: bx, top: by - 260 * (1 - inP), opacity: 1 - gone, transform: `scale(${1 - 0.5 * gone})`, transformOrigin: "0 50%",
          padding: "14px 24px", borderRadius: 32, background: "#2B2B30", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 32, color: "#F2F2F7",
          boxShadow: "0 0 0 2px rgba(255,181,71,0.6), 0 12px 30px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
          Best carbonara recipe?
        </div>
      )}
      {beam > 0 && fade < 1 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} opacity={1 - fade}>
          <line x1={s.x} y1={s.y} x2={hx} y2={hy} stroke="#FFB547" strokeWidth={22} strokeLinecap="round" opacity={0.45} filter="url(#ff-glow)" />
          <line x1={s.x} y1={s.y} x2={hx} y2={hy} stroke="#FFE2AE" strokeWidth={5} strokeLinecap="round" />
          <circle cx={hx} cy={hy} r={34} fill="url(#ff-core)" />
        </svg>
      )}
    </>
  );
};

export const routeHit = (f: number, T: WeightsT) => prog(f, T.lands - 4, 30, ease.out);
