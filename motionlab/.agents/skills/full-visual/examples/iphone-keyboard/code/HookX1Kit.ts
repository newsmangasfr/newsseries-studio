// Hook X1 "the section": cues, the one camera (side on, then hinged up to face on, then back to the SLAB), the
// thumb's weight and the shape its pad takes against the glass. One world for the whole hook: the reel's sheet
// (KbSheetSplitKit, 1000 units wide), drawn at 3 px a unit, cut along y = HookX1CUT through the top letter row.
// The cut face hangs under the hinge line, the keyboard lies behind it; the hinge turns one into the other.
import { Easing } from "remotion";
import { ease, prog, useScene } from "../../../src/engine";

export const HookX1K = 3; // px a sheet unit at MACRO: one key pitch is 300 px
export const HookX1CUT = 300; // sheet y of the cut, through the lower half of the top row's caps
export const HookX1EX = 250; // sheet x of the E's centre: the origin of the hinge
export const HookX1TAP = 199; // sheet x of the first touch: the strip between the W cap and the E cap
/** depths under the glass's top face, px: the glass, the caps, the pixels, the touch zones */
export const HookX1D = { glass: 120, capB: 186, zoneT: 200, zoneB: 450 };
/** the touch zones along the cut, sheet x of each seam: the E's already swollen, the W's and the R's crushed */
export const HookX1SEAMS = [0, 100, 150, 350, 400, 500, 600];
export const HookX1ROW = "qwerty";

export const hookX1Lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const hookX1Bump = (f: number, at: number, life: number) => (f < at ? 0 : Math.max(0, 1 - (f - at) / life) ** 2);
export const hookX1Rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** sheet x to the cut plane's own px (0 = under the E's centre) */
export const hookX1X = (x: number) => (x - HookX1EX) * HookX1K;
const HEAVY = Easing.bezier(0.45, 0, 0.2, 1);

/** every cue of the hook, once */
export function useHookX1T() {
  const { cue, scene } = useScene();
  const key = cue("key");
  const thumb = cue("thumb");
  const and = cue("and");
  const letter = cue("letter");
  const every = cue("every", 2);
  const time = cue("time.");
  return {
    touch: key - 10, // the pad meets the glass, off centre
    caught: key - 2, // the "+" has fallen through the glass into the E's zone
    key, // the E cap alone lights, the bracket snaps to it
    pop: key + 6, // the letter balloon
    release: cue("on") + 6, // the pad lets go, a hair above the glass
    label: cue("iPhone") + 2, // "touch zone, invisible"
    slide: cue("keyboard"), // the cut face slides along the row
    smaller: cue("smaller"), // the cap's bracket, copied under the pad
    windup: cue("than"), // the thumb gathers itself
    press: thumb - 9, // contact: nine frames later, on the word, the pad is at its widest
    thumb,
    lift: and - 2,
    and, // the section hinges up
    faceOn: and + 30,
    right: cue("right"), // the "+" lands off the E, the E's cell takes it
    letter, // the balloon
    typedE: letter + 20, // the map re-forms for what comes after "time"
    every, // second tap, the S
    typedS: every + 3,
    time, // third tap, the H
    dark: time + 8, // the amber goes out
    flip: time + 12, // sent: the field is empty, the keys go back to capitals
    home: scene.to - 6, // the next scene is born here
    to: scene.to,
  };
}
export type HookX1T = ReturnType<typeof useHookX1T>;

/** where the E's centre sits on screen while the section is side on: it slides one key on "keyboard", heavy */
const hookX1Slide = (f: number, T: HookX1T) => {
  const d = f - T.slide;
  return 843 - 300 * (d < 0 ? 0 : 1 - Math.exp(-d / 7) * Math.cos(d / 5));
};

/** the camera. ex, hy: the hinge point on screen. g: scale (1 = MACRO). phi: 12 = side on, 90 = face on.
 *  open: how much of the keyboard in front of the cut has come back. */
export function hookX1Cam(f: number, T: HookX1T) {
  const k = prog(f, T.and, 30, HEAVY);
  const d = f - T.faceOn;
  const swing = d < 0 ? 0 : 2.4 * Math.exp(-d / 9) * Math.sin(d / 4.5); // a heavy thing does not stop dead
  const back = T.every - 16;
  const k2 = prog(f, back, T.home - back, HEAVY);
  const drift = prog(f, T.faceOn, 54, ease.linear);
  const lg = Math.log(0.5) * k + Math.log(0.46 / 0.5) * drift + Math.log(0.3 / 0.46) * k2;
  // the next scene blurs in 40 px low and rises: the SLAB arrives on that very path, so the two never part
  const rise = f < T.home ? 40 * k2 : 40 * (1 - prog(f, T.home, 8, ease.out));
  return {
    ex: hookX1Slide(f, T) + (440 - 543) * k + (315 - 440) * k2,
    hy: 1000 + (900 - 1000) * k + (830 - 900) * k2 + rise,
    g: Math.exp(lg),
    phi: 12 + 78 * k + swing,
    open: prog(f, T.and + 8, 24, ease.inOut),
    vx: f < T.and ? hookX1Slide(f, T) - hookX1Slide(f - 1, T) : 0,
    k,
    k2,
  };
}
export type HookX1Cam = ReturnType<typeof hookX1Cam>;
/** a sheet point on screen, once the keyboard is face on */
export const hookX1Screen = (c: HookX1Cam, x: number, y: number) => ({ x: c.ex + c.g * HookX1K * (x - HookX1EX), y: c.hy + c.g * HookX1K * (y - HookX1CUT) });

const PRESS = 92; // how far the bone comes down into the pad at full weight: the flat is then about 600 px, 2.3 caps

/** the thumb, side on. z > 0: the gap left above the glass. z < 0: how far the bone has come down into the pad. */
export function hookX1Thumb(f: number, T: HookX1T) {
  const hover = 12 + 2 * Math.sin(f / 11);
  let z: number;
  if (f < T.touch) z = 150 * (1 - (f / T.touch) ** 2); // already falling at frame 0
  else if (f < T.release) {
    const d = f - T.touch; // a tap: in, a small rebound, resting light
    z = -(14 * (1 - Math.exp(-d / 1.5)) + 16 * Math.exp(-d / 5) * Math.sin(d / 2.4));
  } else if (f < T.windup) z = hookX1Lerp(-14, hover, prog(f, T.release, 8, ease.inOut));
  else if (f < T.press) {
    const top = hover + 62 * prog(f, T.windup, T.press - 4 - T.windup, ease.out); // it gathers itself
    z = top * (1 - Math.max(0, (f - (T.press - 4)) / 4) ** 2); // and comes down hard
  } else if (f < T.lift) {
    const d = f - T.press; // the bone keeps coming after the skin has stopped: past its rest, then back
    z = -(PRESS * (1 - Math.exp(-d / 4.5) * Math.cos(d / 3.2)) + 2.2 * Math.sin(f / 7) * prog(f, T.press + 22, 10));
  } else z = hookX1Lerp(-PRESS, 950, prog(f, T.lift, 15, ease.in));
  const s = f - T.slide;
  const lean = s < 0 ? 0 : 3 * Math.exp(-s / 8) * Math.sin(s / 4); // the phone slides under it: it lags, then catches up
  const pen = Math.max(0, -z);
  return { z, pen, gap: Math.max(0, z), dx: -0.55 * Math.max(0, z), a: 40 + lean - (2.5 * pen) / PRESS + (f < T.touch ? (5 * z) / 150 : 0) };
}

type P = [number, number];
// the fingertip in profile, in its own px: pointing +x, the tip's apex at the origin, the nail up (-y), the pad down
const CUBICS: [P, P, P, P][] = [
  [[-430, -240], [-300, -236], [-120, -200], [-30, -128]], // along the nail
  [[-30, -128], [20, -90], [52, -40], [50, 20]], // round the tip
  [[50, 20], [48, 110], [-20, 220], [-170, 262]], // the pulp
  [[-170, 262], [-300, 298], [-480, 290], [-640, 262]], // the pad
  [[-640, 262], [-900, 222], [-1200, 250], [-1600, 262]], // back toward the joint
];
const OUTLINE: P[] = (() => {
  const pts: P[] = [[-1600, -250]];
  for (const [a, b, c, d] of CUBICS)
    for (let i = 0; i < 18; i++) {
      const t = i / 18, u = 1 - t;
      pts.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]);
    }
  pts.push([-1600, 262]);
  return pts;
})();

/** the thumb's outline against the glass, in px from the contact point (0, 0 = on the glass, under the lowest
 *  point of the pad). The pad cannot go through: what is pushed under the plane stays on it and goes sideways,
 *  and the skin just above bulges with it. L, R: the ends of the flat. tx, ty, a: where the rigid finger is. */
export function hookX1ThumbShape(aDeg: number, z: number) {
  const a = (aDeg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const rot = OUTLINE.map(([x, y]) => [x * c - y * s, x * s + y * c] as P);
  let low = 0;
  rot.forEach((p, i) => { if (p[1] > rot[low][1]) low = i; });
  const [ox, oy] = rot[low];
  const pen = Math.max(0, -z);
  const spread = pen * 0.85;
  let L = 0, R = 0;
  const pts = rot.map(([x, y]) => {
    let X = x - ox, Y = y - oy - z;
    if (pen > 0) {
      const h = -Y;
      X += Math.tanh(X / 70) * spread * (h < 0 ? 1 : Math.exp(-h / 110));
      if (Y > 0) { Y = 0; L = Math.min(L, X); R = Math.max(R, X); }
    }
    return [X, Y] as P;
  });
  return { d: "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + "Z", L, R, tx: -ox, ty: -oy - z, a: aDeg };
}
export type HookX1Shape = ReturnType<typeof hookX1ThumbShape>;

/** the glass gives a hair under the load, and rings */
export function hookX1Sag(f: number, T: HookX1T, pen: number) {
  const d = f - T.press;
  return f < T.press ? 0 : 0.06 * pen + 4 * Math.exp(-d / 6) * Math.sin(d / 2.1);
}
