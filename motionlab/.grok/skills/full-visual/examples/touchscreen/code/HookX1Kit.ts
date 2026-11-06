// touchscreen hook X1, "the double section": the shared numbers. The world is the one "answer" is drawn in (the
// iPhone cut open edge-on, top face of the glass at y = 0, the pen's spot at x = 0, the resting fingertip at REST_X),
// so the hook ends on the very picture "answer" starts on. Every time is a word of caption.txt.
import { Easing } from "remotion";
import { ease, prog, useScene } from "../../../src/engine";
import { P, PEN_ANGLE, REST_X, clamp, lerp } from "./PenVersusFingerKit";

export function useHookX1T() {
  const { cue, scene } = useScene();
  const reacts = cue("reacts");
  const ignores = cue("ignores");
  return {
    take: reacts - 14, // the charge tears off its crossings here, so its overshoot peaks as "reacts" is said
    reacts,
    lightest: cue("lightest"),
    brush: cue("brush"),
    finger: cue("finger"),
    and: cue("and"),
    ignores,
    slam: ignores + 1, // the ball meets the glass
    pen: cue("pen"),
    pressed: cue("pressed"),
    hard: cue("hard"),
    can: cue("can"),
    end: scene.to - 6, // "answer" draws from here on (keep = true)
  };
}
export type HookX1T = ReturnType<typeof useHookX1T>;

/** a view is a scale and the world point at the middle of the stage (540, 1000). WIDE is where "answer" starts. */
type View = { s: number; x: number; y: number };
const OPEN: View = { s: 0.64, x: -650, y: -322 };
const NEAR: View = { s: 0.73, x: -642, y: -300 };
const TIP: View = { s: 0.88, x: 40, y: -300 };
const GRIND: View = { s: 0.95, x: 30, y: -286 };
const WIDE: View = { s: 0.5, x: -220, y: -80 };
const between = (a: View, b: View, k: number): View => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const s = a.s * Math.pow(b.s / a.s, k);
  const q = Math.abs(b.s - a.s) < 1e-6 ? k : (1 / s - 1 / a.s) / (1 / b.s - 1 / a.s);
  return { s, x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q) };
};
const view = (f: number, T: HookX1T): View => {
  if (f < T.and - 3) return between(OPEN, NEAR, prog(f, -20, T.and + 17, ease.out));
  // the one hard move: across the same section to the pen, landing as it slams down on "ignores"
  if (f < T.ignores + 3) return between(view(T.and - 4, T), TIP, prog(f, T.and - 3, T.ignores - T.and + 5, Easing.bezier(0.55, 0, 0.1, 1)));
  if (f < T.hard + 2) return between(TIP, GRIND, prog(f, T.ignores + 3, T.hard - T.ignores - 1, ease.linear));
  return between(GRIND, WIDE, prog(f, T.hard + 2, 22, Easing.bezier(0.3, 0, 0.12, 1)));
};
export function hookX1Camera(f: number, T: HookX1T) {
  const v = view(f, T);
  const p = view(f - 1, T);
  const tx = 540 - v.s * v.x;
  // the glass takes the blow: the whole view jolts when the ball lands, and again, less, on the second jab
  const jolt = (t: number, a: number) => (t < 0 ? 0 : a * Math.exp(-t / 3.5) * Math.cos(t / 1.25));
  const ty = 1000 - v.s * v.y + jolt(f - T.slam, 9) + jolt(f - T.pen, 5);
  const whip = f >= T.and - 3 && f < T.ignores + 3; // blur along the push across, only while it is fast
  const smear = whip ? Math.min(30, Math.abs(tx - (540 - p.s * p.x)) * 0.3) : 0;
  return { s: v.s, tx, ty, smear: smear > 1.2 ? smear : 0, pt: (x: number, y: number): [number, number] => [tx + v.s * x, ty + v.s * y] };
}

const HOVER = 72; // "lightest brush": how far the pad lifts off the glass, still hooked
/** the cut fingertip: its lowest point (x, gap above the glass), how far it is still back up its own axis */
export function hookX1Tip(f: number, T: HookX1T) {
  const down = prog(f, -22, T.take + 26, Easing.bezier(0.2, 0.55, 0.3, 1)); // already on its way at frame 0
  const lift = prog(f, T.lightest - 3, 13, ease.back) * (1 - prog(f, T.and - 16, 12, ease.inOut));
  const slide = prog(f, T.brush - 3, 24, ease.inOut);
  const gap = lerp(250, 2, down) + HOVER * lift;
  return { x: REST_X - 84 * (1 - slide), gap, back: lerp(520, 0, down), hover: clamp((gap - 2) / HOVER) };
}

const near = (x: number) => {
  const d = Math.abs(x - REST_X) / P;
  return d < 1.2 ? 1 : d < 2.2 ? 0.28 : 0;
};
/** the charge over one crossing. `lean`: 0 level, 1 in the skin (it overshoots, then recoils). `into`: how far the
 *  whip carries its ends past the skin, into the tissue. `sway`: the recoil rippling out to the neighbours.
 *  `reach`: under the pen it leans for two frames, finds nothing to enter and drops back dead level. */
export function hookX1Charge(x: number, f: number, T: HookX1T) {
  const u = f - T.take;
  const approach = 0.2 * prog(f, 10, T.take - 10, ease.in);
  const take = u < 0 ? approach : 1 - 0.8 * Math.exp(-u / 5) * Math.cos(u / 2.3);
  const n = near(x);
  const d = Math.abs(x - REST_X) / P;
  const w = u - d * 2.6; // the ripple leaves the finger and reaches each neighbour in turn
  const sway = w < 0 || d < 0.5 ? 0 : (Math.sign(x - REST_X) * 34 * Math.exp(-w / 13) * Math.sin(w / 2.7)) / (1 + 0.32 * d);
  const t = f - T.slam;
  const under = Math.abs(x) < 200 ? 1 : Math.abs(x) < 380 ? 0.4 : 0;
  const jab = (t: number, a: number) => (t < 0 ? 0 : t < 2 ? a * (t / 2) : a * Math.exp(-(t - 2) / 3.6) * Math.cos((t - 2) / 2.1));
  const reach = jab(t, 0.38) + jab(f - T.pen, 0.3); // it is jabbed a second time on "pen": the same nothing
  return { lean: n * take, into: n * Math.max(0, take - 1) * 300, sway, reach: under * reach, pen: under > 0 && t >= 0 };
}

/** the screen reacting: a flare that leaves the pad and runs out along the pixels, then holds low until the view
 *  leaves for the pen. 0 by the end, as "answer" has it. */
export function hookX1Flare(f: number, T: HookX1T) {
  const at = T.take + 3;
  return prog(f, at, 7) * (0.42 + 0.58 * Math.exp(-Math.max(0, f - at) / 15)) * (1 - prog(f, T.and - 16, 14, ease.inOut));
}

/** the gold inside the finger: a first shot as the charge whips in, the whole tip on "finger"; it drains back out
 *  in the last frames, when the finger lets go */
export function hookX1Lit(f: number, T: HookX1T) {
  const fill = 0.24 * prog(f, T.take + 3, 9) + 0.76 * prog(f, T.finger - 3, 30, ease.out);
  return { spread: fill, on: 1 - prog(f, T.end - 9, 8, ease.inOut) };
}

/** the cut faces close over in the last frames: "answer" has the finger and the pen whole */
export const hookX1Open = (f: number, T: HookX1T) => 1 - prog(f, T.end - 8, 7, ease.inOut);

/** the pen: it slams down on "ignores", is leaned on at "pressed", bows on "hard", and is let up at the very end */
export function hookX1Pen(f: number, T: HookX1T) {
  const start = T.slam - 15;
  // the second jab: drawn back a little before "pen", driven down on it
  const back = prog(f, T.pen - 14, 9, ease.out) * (1 - prog(f, T.pen - 4, 4, Easing.in(Easing.quad)));
  const lift = 0.46 * (1 - prog(f, start, 15, Easing.in(Easing.quad))) + 0.03 * back;
  const t = f - T.slam;
  const blow = (u: number) => (u < 0 ? 0 : Math.exp(-u / 6) * Math.cos(u / 2.2));
  const hit = blow(t) + 0.7 * blow(f - T.pen);
  const shove1 = prog(f, T.pressed - 1, 9, ease.back);
  const shove2 = prog(f, T.hard - 2, 8, ease.back);
  const give = 1 - prog(f, T.end - 9, 8, ease.inOut);
  const tremor = shove2 * give * (0.45 + 0.55 * Math.exp(-Math.max(0, f - T.hard) / 22));
  const shake = tremor * (Math.sin(f * 2.9) * 0.55 + Math.sin(f * 4.7) * 0.3) + hit * 0.5;
  return {
    show: f >= start,
    lift,
    angle: PEN_ANGLE + 2.6 * hit + (3.2 * shove1 + 4.4 * shove2) * give + shake + Math.sin(f / 9) * 0.12,
    flex: (1.5 * hit + 1.2 * shove1 + 3.0 * shove2) * give,
    shake,
    spin: f * 9 + (shove1 + 3 * shove2) * (f - T.pressed) * 16, // the ball turning in its socket as it grinds
  };
}
