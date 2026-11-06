// touchscreen "grid": the shared numbers of the scene. The world is the iPhone's screen in its own units (440 x 955,
// the same screen "winter" draws: WinterCallKit), with the touch layer laid over it: rows and columns of diamonds on
// a 40-unit pitch (about 6 mm, illustrative), a crossing wherever a row's neck passes under a column's bridge. One
// view looks at that world all scene long: it dives at the phone, pushes in to one crossing and pulls back out.
// Every time is a word of caption.txt.
import { Easing } from "remotion";
import { ease, prog, useScene } from "../../../src/engine";
import { useReel } from "../../../src/engine/context";
import { PHONE, SCREEN, type WinterCallT } from "./WinterCallKit";

export const GOLD = "#FFC233";
export const SCR = { x: PHONE.x + SCREEN.x, y: PHONE.y + SCREEN.y, w: SCREEN.w, h: SCREEN.h, r: SCREEN.r };
export const P = 40; // pitch of the crossings
export const D = 17.5; // half the diagonal of a diamond
export const N = 1.4; // half the width of a neck or a bridge
export const TH = 0.55; // thickness of the conductor
export const COLS = 11;
export const ROWS = 23;
export const crossX = (i: number) => 20 + P * i;
export const crossY = (j: number) => 37.5 + P * j;
/** the crossing the scene goes into: the middle of the screen */
export const HERO = { i: 5, j: 11, x: crossX(5), y: crossY(11) };
export const ROW_LABEL = 8; // the row that carries `ROW`
export const COL_LABEL = 7; // the column that carries `COLUMN`

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
/** a fixed pseudo-random number in [0, 1) */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** the words of the scene, as frames; `winter` is the previous scene's clock, for the phone it hands over */
export function useWireGridT() {
  const { cue, cueEnd, scene } = useScene();
  const { tl } = useReel();
  const was = (w: string) => tl.cue(w, 1, scene.index - 1);
  const winter: WinterCallT = { born: tl.scenes[scene.index - 1].from - 6, imagine: was("Imagine"), winter: was("winter"), trying: was("trying"), call: was("call"), gloves: was("gloves"), on: was("on"), end: scene.from };
  return {
    born: scene.from - 6,
    under: cue("Under"), glass: cue("glass"), phone: cue("phone"), grid: cue("grid"), wires: cue("wires"),
    cant: cue("can't"), see: cue("see"), rows: cue("rows"), going1: cue("going"), way: cue("way"),
    columns: cue("columns"), going2: cue("going", 2), other: cue("other"), everywhere: cue("Everywhere"),
    crosses: cue("crosses"), column: cue("column"), the3: cue("the", 3), holds: cue("holds"), tiny: cue("tiny"),
    electric: cue("electric"), charge: cue("charge"), checks: cue("checks"), every: cue("every"),
    those: cue("those"), crossings: cue("crossings"), crossingsEnd: cueEnd("crossings"), over1: cue("over"),
    and3: cue("and", 3), over2: cue("over", 2), end: scene.to,
    winter,
  };
}
export type WireGridT = ReturnType<typeof useWireGridT>;

export type P2 = [number, number];
export type P3 = [number, number, number];
/** the view: a zoom, a turn about the vertical, a tilt back, and where the hero crossing sits in the frame */
export type WireGridView = {
  s: number; yaw: number; tilt: number; ax: number; ay: number;
  /** 0 flat and wide, 1 down at one crossing */
  macro: number;
  /** 0 until the pull back out, 1 once it is done */
  back: number;
  /** frame pixels a world unit of height rises */
  up: number;
  /** the screen plane as an SVG matrix (optionally at another zoom: things nearer than the screen) */
  matrix: (s?: number) => string;
  pt: (x: number, y: number, z?: number) => P2;
};

const WIDE = 2.1;
const WIDE2 = 2.75; // back out, a step closer than before: the numbers have to be read
const MACRO = 20;
const PUSH = Easing.bezier(0.6, 0, 0.1, 1);
const PULL = Easing.bezier(0.5, 0, 0.15, 1);

export function wireGridView(f: number, T: WireGridT): WireGridView {
  const k1 = prog(f, T.under - 3, T.glass - T.under + 6, ease.inOut);
  const k2 = prog(f, T.phone - 4, 26, ease.inOut);
  const creep1 = prog(f, T.grid, T.crosses - T.grid, ease.linear);
  const kp = prog(f, T.crosses - 3, 24, PUSH);
  const creepM = prog(f, T.crosses + 21, T.every - T.crosses - 21, ease.linear);
  const kb = prog(f, T.every - 2, 30, PULL);
  const creep2 = prog(f, T.every + 28, T.end - T.every - 28, ease.linear);
  const wide1 = Math.log(1.55) * k1 + Math.log(WIDE / 1.55) * k2 + Math.log(1.05) * creep1;
  const inside = Math.log(MACRO) + Math.log(1.08) * creepM;
  const wide2 = Math.log(WIDE2) - Math.log(1.04) * creep2;
  const s = Math.exp(lerp(lerp(wide1, inside, kp), wide2, kb));
  const macro = kp * (1 - kb);
  const yaw = ((-2.4 * (1 - k1) + macro * (-21 + 7 * creepM)) * Math.PI) / 180;
  const tilt = ((macro * 52 + kb * 32) * Math.PI) / 180;
  const ax = lerp(SCR.x + HERO.x, 540, k1);
  const ay = lerp(SCR.y + HERO.y, 1000, k1) + 30 * kb;
  const ca = Math.cos(yaw), sa = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
  const pt = (x: number, y: number, z = 0): P2 => {
    const dx = x - HERO.x, dy = y - HERO.y;
    return [ax + s * (dx * ca - dy * sa), ay + s * ((dx * sa + dy * ca) * ct - z * st)];
  };
  const matrix = (sz = s) => {
    const a = sz * ca, b = sz * sa * ct, c = -sz * sa, d = sz * ca * ct;
    return `matrix(${a.toFixed(5)} ${b.toFixed(5)} ${c.toFixed(5)} ${d.toFixed(5)} ${(ax - a * HERO.x - c * HERO.y).toFixed(3)} ${(ay - b * HERO.x - d * HERO.y).toFixed(3)})`;
  };
  return { s, yaw, tilt, ax, ay, macro, back: kb, up: s * st, matrix, pt };
}

const n1 = (v: number) => v.toFixed(1);
export const wireGridLine = (pts: P2[]) => pts.map((p, i) => `${i ? "L" : "M"}${n1(p[0])} ${n1(p[1])}`).join("");

/* ---------- the touch layer, in world units ---------- */
const poly = (pts: P2[]) => `M${pts.map((p) => `${p[0]} ${p[1]}`).join("L")}Z`;
/** one row: diamonds joined by thin necks, as one outline */
const rowD = (j: number) => {
  const y = crossY(j);
  const top: P2[] = [], bot: P2[] = [];
  for (let i = -1; i <= COLS + 1; i++) {
    const cx = P * i;
    top.push([cx - (D - N), y - N], [cx, y - D], [cx + (D - N), y - N]);
    bot.unshift([cx + (D - N), y + N], [cx, y + D], [cx - (D - N), y + N]);
  }
  return poly([...top, ...bot]);
};
/** one column: its diamonds, tips cut where the bridge lands. The bridges are drawn apart (they stand off the rows) */
const colD = (i: number) => {
  const cx = crossX(i);
  let d = "";
  for (let j = -1; j <= ROWS + 1; j++) {
    const cy = crossY(j) - P / 2;
    d += poly([[cx - N, cy - (D - N)], [cx + N, cy - (D - N)], [cx + D, cy], [cx + N, cy + (D - N)], [cx - N, cy + (D - N)], [cx - D, cy]]);
  }
  return d;
};
export const ROW_D = Array.from({ length: ROWS }, (_, j) => rowD(j));
export const COL_D = Array.from({ length: COLS }, (_, i) => colD(i));
export const ALL_ROWS = ROW_D.join("");
export const ALL_COLS = COL_D.join("");
/** every bridge lying flat, for the looks from straight above */
export const FLAT_BRIDGES = Array.from({ length: COLS * ROWS }, (_, n) => {
  const x = crossX(n % COLS), y = crossY(Math.floor(n / COLS));
  return poly([[x - N, y - 4.4], [x + N, y - 4.4], [x + N, y + 4.4], [x - N, y + 4.4]]);
}).join("");
export const CROSSINGS = Array.from({ length: COLS * ROWS }, (_, n) => {
  const i = n % COLS, j = Math.floor(n / COLS);
  return { n, i, j, x: crossX(i), y: crossY(j), hero: i === HERO.i && j === HERO.j, far: Math.hypot(i - HERO.i, j - HERO.j) };
});

/** a filament of charge: it leaves the row diamond, arches over the gap and comes down on the column diamond.
 *  `q` is the quarter around the crossing (0 to 3), `k` the rib in it (0 nearest the crossing). `grow` draws it out
 *  from the row end, `lift` scales its height. */
export function wireGridFilament(x0: number, y0: number, q: number, k: number, f: number, o: { grow?: number; lift?: number; n?: number } = {}): P3[] {
  const sx = q & 1 ? 1 : -1, sy = q & 2 ? 1 : -1;
  const t = [0.2, 0.42, 0.66][k];
  const e = 2 + 1.4 * k;
  const ph = q * 1.7 + k * 2.3 + x0 * 0.31 + y0 * 0.17;
  const H = (3.4 + 2.2 * k) * (o.lift ?? 1) * (1 + 0.045 * Math.sin(f / 9 + ph));
  const r = Math.SQRT1_2;
  const a: P2 = [x0 + sx * (2.5 + D * t) + sx * r * e, y0 + sy * D * t - sy * r * e];
  const b: P2 = [x0 + sx * D * t - sx * r * e, y0 + sy * (2.5 + D * t) + sy * r * e];
  const n = o.n ?? 12;
  const sway = 0.45 * Math.sin(f / 14 + ph);
  const out: P3[] = [];
  const upTo = o.grow ?? 1;
  for (let m = 0; m <= n; m++) {
    const u = (m / n) * upTo;
    const bow = Math.sin(Math.PI * u);
    // heavier on the far side: the top of the arch sits past the middle and the fall is steeper than the climb
    const z = TH + H * Math.pow(4 * Math.pow(u, 1.25) * (1 - Math.pow(u, 1.25)), 0.72);
    out.push([lerp(a[0], b[0], u) + sx * r * sway * bow, lerp(a[1], b[1], u) + sy * r * sway * bow, z]);
  }
  return out;
}

/* ---------- the phone reading its crossings ---------- */
/** the passes of the reading line down the grid: one slow enough to follow, then faster and faster */
export function wireGridSweeps(T: WireGridT) {
  return [
    { from: T.every + 14, dur: T.over1 - (T.every + 14) },
    { from: T.over1, dur: 19 },
    { from: T.over1 + 20, dur: 10 },
    { from: T.over1 + 31, dur: 6 },
    { from: T.over1 + 38, dur: 3 },
  ];
}
// the line runs over the rows the wide view shows; the rows above and below are read as it enters and leaves
const TOP = 215;
const SPAN = 452; // it leaves into the dark foot of the frame, it never stops in the open
const along = (j: number) => clamp((crossY(j) - TOP) / SPAN);
/** where the reading line is (world y), or null when it is off */
export function wireGridLineY(f: number, T: WireGridT): number | null {
  if (f >= T.checks - 8 && f < T.checks + 8) return HERO.y + lerp(-24, 24, (f - (T.checks - 8)) / 16);
  for (const s of wireGridSweeps(T)) if (f >= s.from && f < s.from + s.dur) return TOP + (SPAN * (f - s.from)) / s.dur;
  return null;
}
/** the frame a crossing is first read */
export function wireGridReadAt(i: number, j: number, T: WireGridT) {
  if (i === HERO.i && j === HERO.j) return T.checks;
  const s = wireGridSweeps(T)[0];
  return s.from + s.dur * along(j);
}
/** how bright a row is from being read just now: a flash on every pass, a flutter once the passes blur together */
export function wireGridFlash(f: number, j: number, T: WireGridT) {
  if (f >= T.over2 - 2) return 0.45 + 0.55 * rnd(f * 3.1 + j * 7.7);
  let v = 0;
  for (const s of wireGridSweeps(T)) {
    const at = s.from + s.dur * along(j);
    if (f >= at) v = Math.max(v, Math.exp(-(f - at) / 5));
  }
  return v;
}
