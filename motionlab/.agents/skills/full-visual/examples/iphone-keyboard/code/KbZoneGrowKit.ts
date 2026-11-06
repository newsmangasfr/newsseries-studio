// Scene "grow" (KbZoneGrow): cues, the camera, how much the E's zone has swollen, and the 26 zones as one gapless
// sheet that is pushed out of shape from the E. Same sheet space as every scene of the reel (KbSheetSplitKit:
// 1000 px wide, origin at the top-left of the text field). It starts on the last picture of "tim" (the SLAB, face on)
// and ends close on Q W E R T over A S D F, the thumb in the air, the map swollen: "same" starts on that picture.
import { Easing } from "remotion";
import { ease, prog, useScene } from "../../../src/engine";
import { useReel } from "../../../src/engine/context";
import { KB_TOP } from "./KbSheetSplitKit";

export const KbZoneGrowHeavy = Easing.bezier(0.45, 0, 0.2, 1);

/** every cue of the scene, once */
export function useKbZoneGrowT() {
  const { cue, cueEnd, scene } = useScene();
  const { tl } = useReel();
  return {
    born: scene.from - 6,
    caret0: tl.scenes[scene.index - 1].from - 6, // the caret keeps the beat it had in "tim"
    push: scene.from - 6, // the view comes in on the left half of the top two rows
    thumb: cue("before"), // the thumb comes into frame
    stop: cue("down,"), // and stops in the air
    xray: cue("invisible"), // the zones show through the caps
    even: cue("zone"), // all of them, all the same size
    tag: cue("zone"),
    sweep: cue("around"), // a light runs along the top row and ends on the E
    e: cue("E"), // its zone alone brightens
    gets: cue("gets"),
    big: cue("bigger,"), // it swells, slowly then all at once
    tag2: cue("and"),
    lit: [cue("zones"), cue("around", 2), cue("it"), cue("get")], // W, R, S, D: their borders light in turn
    squeeze: cue("squeezed."),
    end: cueEnd("squeezed."),
  };
}
export type KbZoneGrowT = ReturnType<typeof useKbZoneGrowT>;

/** the camera, flat: sheet (0, 0) sits at (x, y) on screen, at scale s */
export type KbZoneGrowPose = { s: number; x: number; y: number };
export const KbZoneGrowHOME: KbZoneGrowPose = { s: 0.9, x: 90, y: 560 }; // where "tim" ends
/** the centre of the E's zone at rest, in the sheet: what the view comes in on */
export const KbZoneGrowE = { x: 250, y: KB_TOP + 186.25, hw: 50, hh: 69.25 };
const CLOSE_S = 2.05;
export const KbZoneGrowCLOSE: KbZoneGrowPose = { s: CLOSE_S, x: 522 - KbZoneGrowE.x * CLOSE_S, y: 836 - KbZoneGrowE.y * CLOSE_S }; // where "same" starts
const PUSH = 66;

export const kbZoneGrowPush = (f: number, t: KbZoneGrowT) => prog(f, t.push, PUSH, KbZoneGrowHeavy);

export function kbZoneGrowPose(f: number, t: KbZoneGrowT): KbZoneGrowPose {
  const k = kbZoneGrowPush(f, t);
  const a = KbZoneGrowHOME, b = KbZoneGrowCLOSE, e = KbZoneGrowE;
  // the scale goes geometrically while the E travels in a straight line; a heavy thing does not stop dead
  const d = f - t.push - PUSH;
  const settle = d < 0 ? 0 : 0.008 * Math.exp(-d / 13) * Math.sin(d / 5);
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * k) * (1 + settle);
  const ex = a.x + e.x * a.s + (b.x + e.x * b.s - a.x - e.x * a.s) * k;
  const ey = a.y + e.y * a.s + (b.y + e.y * b.s - a.y - e.y * a.s) * k;
  return { s, x: ex - e.x * s, y: ey - e.y * s };
}

/** how far the E's zone has swollen: 0 at rest, 1 once it is "bigger", about 1.36 once the others are "squeezed".
 *  It creeps, goes all at once on the word, overshoots and settles; it never quite stops breathing */
export function kbZoneGrowAmp(f: number, t: KbZoneGrowT) {
  const go = t.big - 2;
  const creep = 0.16 * prog(f, t.e + 8, go - t.e - 8, ease.in);
  const t1 = f - go;
  if (t1 < 0) return creep;
  let a = 1 - 0.84 * Math.exp(-t1 / 5) * Math.cos(t1 / 3.4);
  const t2 = f - (t.squeeze - 2);
  if (t2 >= 0) a += 0.36 * (1 - Math.exp(-t2 / 5.5) * Math.cos(t2 / 3.6));
  return a + 0.012 * Math.sin(f / 11) * prog(f, go + 18, 12);
}

const ROWS = [
  { letters: "qwertyuiop", bounds: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] },
  { letters: "asdfghjkl", bounds: [0, 150, 250, 350, 450, 550, 650, 750, 850, 1000] },
  { letters: "zxcvbnm", bounds: [142, 250, 350, 450, 550, 650, 750, 858] },
];
const YB = [117, 255.5, 393.5, 531.5].map((y) => y + KB_TOP); // row borders, mid-gap
const PX = 44; // sheet px the E's side borders travel at amp 1: to the middle of the W cap and of the R cap
const PY_DOWN = 46; // its lower border: across the tops of the S and D caps
const BOW = 0.3; // how much less a corner travels than the middle of its side
const PY_UP = 12; // the top of the map is the top of the keyboard: it barely gives

/** where a point of the resting sheet is once the E's zone has swollen. One field for every border, so two zones
 *  always share the border between them: what the E takes, its neighbours lose, and the push dies out over two keys.
 *  The push is strongest at the middle of a side, which is what bows the borders like cushions under a weight */
export function kbZoneGrowMove(x: number, y: number, amp: (delay: number) => number): [number, number] {
  const e = KbZoneGrowE;
  const a = (x - e.x) / e.hw, b = (y - e.y) / e.hh;
  const A = Math.abs(a), B = Math.abs(b);
  if (A >= 5 && B >= 4) return [x, y];
  // the push travels: a border two keys away answers a few frames after the E's own
  const k = amp(0.016 * Math.max(0, Math.hypot(x - e.x, y - e.y) - 70));
  const px = A <= 1 ? A : A < 5 ? (1 - (A - 1) / 4) ** 2 : 0;
  const hy = B <= 1 ? 1 - BOW * B * B : B < 3.4 ? (1 - BOW) * (1 - (B - 1) / 2.4) ** 2 : 0;
  const py = B <= 1 ? B : B < 4 ? (1 - (B - 1) / 3) ** 2 : 0;
  const hx = A <= 1 ? 1 - BOW * A * A : A < 3.5 ? (1 - BOW) * (1 - (A - 1) / 2.5) ** 2 : 0;
  return [x + Math.sign(a) * PX * k * px * hy, y + Math.sign(b) * (b > 0 ? PY_DOWN : PY_UP) * k * py * hx];
}

export type KbZoneGrowCell = { letter: string; row: number; d: string; x0: number; x1: number; y0: number; y1: number };

/** the zones of the two rows in the light (the third row is out of it) at this amount of swell, as closed paths in
 *  sheet coordinates */
export function kbZoneGrowCells(amp: (delay: number) => number): KbZoneGrowCell[] {
  const out: KbZoneGrowCell[] = [];
  ROWS.slice(0, 2).forEach((row, r) => {
    const y0 = YB[r], y1 = YB[r + 1];
    row.letters.split("").forEach((letter, i) => {
      const x0 = row.bounds[i], x1 = row.bounds[i + 1];
      // both rows that meet on a border walk it through the same points
      const xs: number[] = [x0];
      for (let x = Math.floor(x0 / 10) * 10 + 10; x < x1; x += 10) xs.push(x);
      for (const c of [142, 858]) if (c > x0 && c < x1) xs.push(c);
      xs.push(x1);
      xs.sort((p, q) => p - q);
      const ys = Array.from({ length: 9 }, (_, n) => y0 + ((y1 - y0) * (n + 1)) / 10);
      const pts: [number, number][] = [
        ...xs.map((x) => [x, y0] as [number, number]),
        ...ys.map((y) => [x1, y] as [number, number]),
        ...[...xs].reverse().map((x) => [x, y1] as [number, number]),
        ...[...ys].reverse().map((y) => [x0, y] as [number, number]),
      ];
      const d = "M" + pts.map(([x, y]) => kbZoneGrowMove(x, y, amp)).map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + "Z";
      out.push({ letter, row: r, d, x0, x1, y0, y1 });
    });
  });
  return out;
}

/** the four zones that touch the E's, in the order the sentence lights them */
export const KbZoneGrowRING = ["w", "r", "s", "d"];
/** and the ones behind those: they give a little */
export const KbZoneGrowRING2 = ["q", "t", "a", "f"];
