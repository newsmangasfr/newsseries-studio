// Hook X2, THE MAP DIVE: the canvas passes. Galaxy (back = behind the creator's photo, front = in front of it), the red cluster
// (the refused corner) and its collapse, the shockwave, and the points flying into the Ajax lockup.
import { rand } from "./map";
import { type Cam, type GPt, type T, MARK, RC, camAt, proj } from "./HookX2World";

type Ctx = CanvasRenderingContext2D;
const lin = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / Math.max(1, b - a)));
const outC = (x: number) => 1 - Math.pow(1 - x, 3);
const DF = 5; // galaxy points nearer than this pass in front of the creator's photo

const hexA = (c: string, a: number) => {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
};

/** the hit's push: everything near the cluster is thrown outward, away from the axis */
const pushAt = (f: number, t: T) => (f < t.never ? 0 : outC(lin(f, t.never, t.never + 22)) * 4);

function dot(ctx: Ctx, x: number, y: number, r: number, c: string, a: number) {
  ctx.fillStyle = hexA(c, a);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 6.2832);
  ctx.fill();
}

function streak(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, c: string, a: number) {
  ctx.strokeStyle = hexA(c, a);
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

export function drawGalaxy(ctx: Ctx, pts: GPt[], path: number[], t: T, layer: "back" | "front") {
  const { f } = t;
  const c1 = camAt(path, f, t), c0 = camAt(path, f - 1.5, t);
  const A = pushAt(f, t), A0 = pushAt(f - 1.5, t);
  ctx.lineCap = "round";
  for (const p of pts) {
    const dzRough = c1.z - p.z;
    if (dzRough < 0.35 || dzRough > 95) continue;
    if ((layer === "front") !== (dzRough < DF)) continue;
    const rx = p.x - RC.x, ry = p.y - RC.y, d = Math.hypot(rx, ry, (p.z - RC.z) * 0.6) + 0.3;
    const k = 1 / (1 + d * 0.35);
    const ux = rx / Math.hypot(rx, ry, 1e-3), uy = ry / Math.hypot(rx, ry, 1e-3);
    const a1 = proj(p.x + ux * A * k, p.y + uy * A * k, p.z, c1);
    const a0 = proj(p.x + ux * A0 * k, p.y + uy * A0 * k, p.z, c0);
    if (!a1) continue;
    const r = Math.max(0.45, Math.min(10, p.s * a1.k));
    const fog = Math.max(0, Math.min(1, 1.25 - a1.dz / 75));
    const near = Math.max(0, Math.min(1, (a1.dz - 0.45) / 1.4));
    const al = fog * near * (0.72 + 0.28 * Math.sin(f / 6 + p.tw)) * (layer === "front" ? 0.6 : 1);
    if (al < 0.02) continue;
    if (a0) {
      const len = Math.hypot(a1.x - a0.x, a1.y - a0.y);
      if (len > r * 0.8) streak(ctx, a0.x, a0.y, a1.x, a1.y, r * 1.5, p.c, al * Math.min(0.8, 4 / Math.sqrt(len + 1) + 0.25));
    }
    if (r > 2.2) dot(ctx, a1.x, a1.y, r * 3, p.c, al * 0.1);
    dot(ctx, a1.x, a1.y, r, p.c, al);
  }
}

export type RedPt = { x: number; y: number; z: number; tx: number; ty: number };

/** a red point in the world this frame: the cluster turns, trembles before the hit, then is pressed flat */
function redWorld(q: RedPt, i: number, f: number, t: T) {
  const ang = f * 0.014;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  let x = q.x * ca - q.z * sa, z = q.x * sa + q.z * ca, y = q.y;
  const tremble = lin(f, t.that, t.never) * (f < t.never ? 1 : 0) * 0.1;
  x += Math.sin(f * 1.7 + i) * tremble;
  y += Math.cos(f * 2.1 + i * 0.7) * tremble;
  if (f >= t.never) {
    const u = lin(f, t.never, t.never + 9);
    const s = Math.min(1, outC(u) * 1.04);
    const spread = 1 + 0.45 * outC(lin(f, t.never, t.never + 18));
    y *= 1 - 0.96 * s;
    x *= spread;
    z *= spread;
  }
  return { x: RC.x + x, y: RC.y + y, z: RC.z + z };
}

/** where point i flies to its place in the lockup: start, delay, arc */
function flight(q: RedPt, i: number, t: T) {
  const fs = t.says - 8;
  const delay = ((q.tx + 200) / 400) * 8 + rand(i, 5) * 4;
  const s0 = fs + delay;
  return { s0, dur: 17, tx: MARK.x + q.tx * MARK.scale, ty: MARK.y + q.ty * MARK.scale, arc: (rand(i, 9) - 0.5) * 320, lift: -40 - rand(i, 17) * 120 };
}

function flyPos(q: RedPt, i: number, f: number, t: T, path: number[]) {
  const fl = flight(q, i, t);
  if (f <= fl.s0) {
    const w = redWorld(q, i, f, t);
    return { p: proj(w.x, w.y, w.z, camAt(path, f, t)), u: 0 };
  }
  const w = redWorld(q, i, fl.s0, t);
  const s = proj(w.x, w.y, w.z, camAt(path, fl.s0, t));
  if (!s) return { p: null, u: 1 };
  const u = outC(lin(f, fl.s0, fl.s0 + fl.dur));
  const mx = (s.x + fl.tx) / 2, my = (s.y + fl.ty) / 2;
  const dx = fl.tx - s.x, dy = fl.ty - s.y, L = Math.hypot(dx, dy) + 1e-3;
  const cx = mx - (dy / L) * fl.arc, cy = my + (dx / L) * fl.arc + fl.lift;
  const x = (1 - u) * (1 - u) * s.x + 2 * (1 - u) * u * cx + u * u * fl.tx;
  const y = (1 - u) * (1 - u) * s.y + 2 * (1 - u) * u * cy + u * u * fl.ty;
  return { p: { x, y, k: s.k, dz: s.dz }, u };
}

export function drawRed(ctx: Ctx, red: RedPt[], path: number[], t: T) {
  const { f } = t;
  const cam = camAt(path, f, t);
  const heat = lin(f, t.never, t.never + 10);
  const centre = proj(RC.x, RC.y, RC.z, cam);
  // the cluster's own red light, growing as we close in, dying as it is pressed flat
  if (centre) {
    const R = Math.max(90, Math.min(900, RC.r * 2.6 * centre.k));
    const g = ctx.createRadialGradient(centre.x, centre.y, 0, centre.x, centre.y, R);
    const a = (0.32 + 0.1 * Math.sin(f / 5)) * (1 - heat);
    g.addColorStop(0, `rgba(255,59,48,${a.toFixed(3)})`);
    g.addColorStop(0.4, `rgba(255,40,30,${(a * 0.35).toFixed(3)})`);
    g.addColorStop(1, "rgba(255,40,30,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 900, 930);
  }
  const dens = centre ? 0.25 + 0.75 * Math.min(1, (RC.r * centre.k) / 160) : 1;
  const noF = t.no;
  const fade = 1 - lin(f, noF, noF + 7);
  if (fade <= 0) return;
  ctx.lineCap = "round";
  red.forEach((q, i) => {
    const a = flyPos(q, i, f, t, path);
    const b = flyPos(q, i, f - 1.5, t, path);
    if (!a.p) return;
    const flying = a.u > 0 && a.u < 1;
    const settled = a.u >= 1;
    const r = settled || flying ? 2.4 : Math.max(1.1, Math.min(3.6, 0.03 * RC.r * a.p.k));
    const col = heat < 0.5 ? "#FF3B30" : flying || settled ? "#FFF3E2" : "#FFB59A";
    const al = (settled ? 0.95 : 0.85) * fade * (heat > 0 && heat < 1 ? 1.2 : 1) * (flying || settled ? 1 : dens);
    let x = a.p.x, y = a.p.y;
    if (settled) {
      x += Math.sin(f / 3 + i) * 0.5;
      y += Math.cos(f / 4 + i) * 0.5;
      if (f > noF) {
        const out = outC(lin(f, noF, noF + 7)) * 0.07;
        x += (x - MARK.x) * out;
        y += (y - MARK.y) * out;
      }
    }
    if (b.p) {
      const len = Math.hypot(x - b.p.x, y - b.p.y);
      if (len > r) streak(ctx, b.p.x, b.p.y, x, y, r * 1.2, col, al * 0.55);
    }
    dot(ctx, x, y, r, col, al);
  });
}

/** the shockwave: a ring of light racing out along the flattened plane and past the lens */
export function drawShock(ctx: Ctx, path: number[], t: T) {
  const { f } = t;
  if (f < t.never) return;
  const cam = camAt(path, f, t);
  const rings = [{ d: 0, k: 1 }, { d: 4, k: 0.55 }];
  for (const rg of rings) {
    const p = lin(f, t.never + rg.d, t.never + rg.d + 30);
    if (p <= 0 || p >= 1) continue;
    const R = RC.r * (0.4 + 6.8 * outC(p));
    const pts: ({ x: number; y: number } | null)[] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * 6.2832;
      pts.push(proj(RC.x + Math.cos(a) * R, RC.y - 0.02, RC.z + Math.sin(a) * R, cam));
    }
    for (const [w, c, al] of [[34, "#FF3B30", 0.22], [12, "#FFD2BE", 0.55], [4, "#FFFFFF", 0.95]] as const) {
      ctx.strokeStyle = hexA(c, al * (1 - p) * rg.k);
      ctx.lineWidth = w * (1 - 0.5 * p);
      ctx.beginPath();
      let pen = false;
      for (const q of pts) {
        if (!q || Math.abs(q.x) > 4000 || Math.abs(q.y) > 4000) { pen = false; continue; }
        if (pen) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
        pen = true;
      }
      ctx.stroke();
    }
  }
}

export type { Cam };
