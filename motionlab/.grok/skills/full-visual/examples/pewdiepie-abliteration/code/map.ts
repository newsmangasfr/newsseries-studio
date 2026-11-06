// THE MAP: the one continuous thing of this reel. Every request is a point in a 3D space (the 4,096-dimension map
// shrunk to three). Every map scene (numbers, map, clusters, direction, find, flatten, catch, alarm) draws THIS data
// with THIS camera, so the viewer never loses the world. Pure math, no React: MapSpace.tsx draws it.
//
// World units: the cloud sits roughly inside a 2 x 2 x 2 box around the origin. +Y is up on screen once the map is
// "turned" (direction scene); before that, the refusal arrow R points diagonally.

export type V3 = [number, number, number];
export type Kind = "cooking" | "coding" | "travel" | "music" | "math" | "refused";

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: V3): V3 => mul(a, 1 / Math.hypot(...a));
export const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** deterministic noise, so every scene and every render draws the same cloud */
export const rand = (i: number, seed = 1) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const gauss = (i: number, seed: number) => {
  const u = Math.max(1e-6, rand(i, seed)), v = rand(i, seed + 101);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** THE ARROW: the refusal direction, in the map's original (un-turned) orientation. Red, always (NO in parts.tsx). */
export const R: V3 = norm([0.55, 0.62, 0.42]);
/** "this is harmful": a DIFFERENT direction (alarm scene). Amber. Roughly at right angles to R. */
export const H: V3 = norm(cross(R, [0, 0, 1]));

/** the normal requests' centre; the refused corner sits REFUSE_LIFT along R from it */
export const NORMAL_CENTRE: V3 = [-0.25, -0.35, -0.1];
export const REFUSE_LIFT = 1.35;

/** cluster centres. math sits a little way UP the arrow on purpose: it is what the catch scene damages when the
 *  map is flattened too hard ("that arrow isn't perfectly clean"). */
export const CLUSTERS: Record<Kind, { centre: V3; spread: number; n: number; label: string; emoji: string; color: string }> = {
  cooking: { centre: [-0.95, -0.55, 0.35], spread: 0.16, n: 26, label: "cooking", emoji: "🍳", color: "#FFB547" },
  coding: { centre: [0.45, -0.75, -0.55], spread: 0.16, n: 26, label: "coding", emoji: "💻", color: "#5AA9FF" },
  travel: { centre: [-0.55, -0.1, -0.85], spread: 0.15, n: 18, label: "travel", emoji: "✈️", color: "#7CE0C3" },
  music: { centre: [-0.1, -0.95, 0.95], spread: 0.15, n: 18, label: "music", emoji: "🎵", color: "#C79BFF" },
  math: { centre: add([0.6, -0.55, 0.2], mul(R, 0.42)), spread: 0.13, n: 18, label: "math", emoji: "➗", color: "#FF8FB1" },
  refused: { centre: add(NORMAL_CENTRE, mul(R, REFUSE_LIFT)), spread: 0.17, n: 30, label: "refused", emoji: "🚫", color: "#FF3B30" },
};

export type Pt = { id: number; kind: Kind; p: V3 };

/** every point on the map, fixed forever */
export const POINTS: Pt[] = (() => {
  const out: Pt[] = [];
  let id = 0;
  (Object.keys(CLUSTERS) as Kind[]).forEach((kind, k) => {
    const c = CLUSTERS[kind];
    for (let i = 0; i < c.n; i++, id++) {
      out.push({ id, kind, p: add(c.centre, [gauss(id, 3 + k) * c.spread, gauss(id, 7 + k) * c.spread, gauss(id, 11 + k) * c.spread]) });
    }
  });
  return out;
})();

/** the middle of a set of points (find scene: the two group middles; the arrow is drawn between them) */
export const middle = (pts: Pt[]): V3 => mul(pts.reduce<V3>((s, q) => add(s, q.p), [0, 0, 0]), 1 / pts.length);
export const NORMAL_PTS = POINTS.filter((q) => q.kind !== "refused");
export const REFUSED_PTS = POINTS.filter((q) => q.kind === "refused");

/** height along the arrow, measured from the normal middle */
export const heightOf = (p: V3) => dot(sub(p, middle(NORMAL_PTS)), R);

/** FLATTEN: press the map flat along the arrow. s = 0 untouched, 1 = every point at the normal height (the real edit:
 *  the R component removed). s > 1 overdoes it: everything near the arrow is crushed past the plane and smeared
 *  (catch scene), which is drawn as extra squash + jitter by the scene, not here. */
export const flatten = (p: V3, s: number): V3 => sub(p, mul(R, heightOf(p) * Math.min(1, s)));

/** TURN: rotate the whole map so the arrow R ends up pointing straight up (+Y). t = 0 original, 1 turned. */
export const turn = (p: V3, t: number): V3 => {
  const axis = cross(R, [0, 1, 0]);
  const len = Math.hypot(...axis);
  if (len < 1e-9 || t === 0) return p;
  const k = mul(axis, 1 / len);
  const a = Math.acos(Math.max(-1, Math.min(1, R[1]))) * t;
  const c = Math.cos(a), s = Math.sin(a);
  return add(add(mul(p, c), mul(cross(k, p), s)), mul(k, dot(k, p) * (1 - c)));
};

/** CAMERA: an orbiting camera looking at `target`. yaw/pitch in radians, dist in world units, fov in px focal. */
export type Cam = { yaw: number; pitch: number; dist: number; focal: number; target: V3; cx: number; cy: number };
export const CAM0: Cam = { yaw: 0.6, pitch: 0.22, dist: 5, focal: 1000, target: [0, -0.05, 0], cx: 540, cy: 985 };

/** one zoom for the whole map, every scene: the cloud must fill the stage (it read too small at 1.0) */
export const MAP_ZOOM = 1.35;

/** world point -> screen {x, y, scale, depth}. scale ~1 at the target; depth bigger = further (draw far first). */
export const project = (p: V3, cam: Cam) => {
  const q = sub(p, cam.target);
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const x1 = q[0] * cy - q[2] * sy, z1 = q[0] * sy + q[2] * cy;
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const y2 = q[1] * cp - z1 * sp, z2 = q[1] * sp + z1 * cp;
  const zc = cam.dist - z2;
  const scale = cam.dist / Math.max(0.2, zc);
  const k = scale * MAP_ZOOM;
  return { x: cam.cx + (x1 * cam.focal * k) / cam.dist, y: cam.cy - (y2 * cam.focal * k) / cam.dist, scale: k, depth: zc };
};

export const mixCam = (a: Cam, b: Cam, t: number): Cam => ({
  yaw: a.yaw + (b.yaw - a.yaw) * t, pitch: a.pitch + (b.pitch - a.pitch) * t, dist: a.dist + (b.dist - a.dist) * t,
  focal: a.focal + (b.focal - a.focal) * t, target: lerp3(a.target, b.target, t), cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t,
});

/** HANDOVER STATES. The map scenes hand over in place (`keep`): the outgoing scene must END exactly on this state and
 *  the incoming scene must START exactly on it, drawn with plain <MapSpace> defaults (grid 1, axes 1, cluster colours,
 *  r 9, no labels, no overlays). Fade your own overlays out before your scene ends; bring new ones in after it starts.
 *  map -> clusters      : HAND.empty   (the 3D space, grid + axes, ONE white point "your request" at YOUR_REQUEST)
 *  clusters -> direction: HAND.cloud   (every point at home, un-turned, CAM0)
 *  direction -> find    : HAND.turned  (every point turned so R points up, CAM_UP, no arrow)
 *  find -> flatten      : HAND.arrow   (turned, CAM_UP, the red arrow from the normal middle to the refused middle)
 *  flatten -> catch     : HAND.flat    (turned AND flattened s = 1, CAM_UP, the arrow still drawn)               */
/** drawing a point in any state: turn(flatten(home, s), t), i.e. flatten in the original map, then turn it. */
export const YOUR_REQUEST: V3 = [0.05, -0.2, 0.1];
export const CAM_UP: Cam = { yaw: 0.35, pitch: 0.1, dist: 5, focal: 1000, target: [0, 0.1, 0], cx: 540, cy: 1000 };
export const HAND = {
  empty: { cam: CAM0 },
  cloud: { cam: CAM0, turn: 0, flat: 0, arrow: 0 },
  turned: { cam: CAM_UP, turn: 1, flat: 0, arrow: 0 },
  arrow: { cam: CAM_UP, turn: 1, flat: 0, arrow: 1 },
  flat: { cam: CAM_UP, turn: 1, flat: 1, arrow: 1 },
} as const;
/** the arrow's ends in the turned map (find draws it; flatten and catch keep it) */
export const ARROW_FROM = (t: number) => turn(middle(NORMAL_PTS), t);
export const ARROW_TO = (t: number) => turn(middle(REFUSED_PTS), t);
