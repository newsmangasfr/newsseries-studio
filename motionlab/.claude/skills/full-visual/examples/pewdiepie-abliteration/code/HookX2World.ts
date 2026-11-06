// Hook X2, THE MAP DIVE: the world. Pure math, no React. The reel's map of requests (map.ts colours: cooking, coding,
// travel, music, math) stretched into a deep galaxy the camera dives through, and the refused corner (red, NO) as one
// dense cluster sitting dead ahead. Stage-local pixels: the stage box is 900 x 930 (page y 520..1450).
import { CLUSTERS, rand } from "./map";
import { TARGETS } from "./HookX2Targets";

export const W = 900;
export const H = 930;
export const F = 820; // focal, px
export const CX = 450; // vanishing point
export const CY = 520;
/** the red cluster: on the axis, a little low so it lands on the creator's chest at the hit */
export const RC = { x: 0, y: -1.04, z: -100, r: 2.5 };
export const DSTOP = 6.6; // camera distance to the cluster centre at the hit
/** the Ajax lockup, formed in front of the creator's chest */
export const MARK = { x: 450, y: 668, scale: 1.45 }; // 400 x 150 lockup -> 580 x 218

export type T = { f: number; pew: number; make: number; unc: number; ai: number; that: number; never: number; says: number; no: number; end: number };

export const PALETTE = (["cooking", "coding", "travel", "music", "math"] as const).map((k) => CLUSTERS[k].color);

const gauss = (i: number, seed: number) => {
  const u = Math.max(1e-6, rand(i, seed)), v = rand(i, seed + 101);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export type GPt = { x: number; y: number; z: number; s: number; c: string; tw: number };

/** the galaxy: request clusters wound along three spiral arms, plus fine dust between them */
export function buildGalaxy(z0: number, z1: number): GPt[] {
  const out: GPt[] = [];
  const blobs = 120;
  for (let b = 0; b < blobs; b++) {
    const z = z0 + (z1 - z0) * rand(b, 41);
    const arm = b % 3;
    const ang = (arm * 2 * Math.PI) / 3 + z * 0.075 + gauss(b, 43) * 0.35;
    const rad = 1.5 + Math.abs(gauss(b, 47)) * 2.4;
    const cx = Math.cos(ang) * rad, cy = Math.sin(ang) * rad * 0.8;
    const c = PALETTE[b % PALETTE.length];
    const n = 16 + Math.floor(rand(b, 53) * 22);
    const sp = 0.18 + rand(b, 59) * 0.22;
    for (let i = 0; i < n; i++) {
      const id = b * 100 + i;
      out.push({ x: cx + gauss(id, 61) * sp, y: cy + gauss(id, 67) * sp, z: z + gauss(id, 71) * sp * 1.6, s: 0.03 + rand(id, 73) * 0.025, c, tw: rand(id, 79) * 6.28 });
    }
  }
  for (let i = 0; i < 2600; i++) {
    const z = z0 + (z1 - z0) * rand(i, 83);
    const ang = rand(i, 89) * 6.283;
    const rad = 0.9 + Math.abs(gauss(i, 97)) * 3.2;
    out.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * 0.85, z, s: 0.012 + rand(i, 101) * 0.012, c: i % 5 === 0 ? PALETTE[i % 25 === 0 ? 1 : 0] : "#D6E2FF", tw: rand(i, 103) * 6.28 });
  }
  return out;
}

/** the refused corner: as many points as the lockup has samples, so every "no" becomes part of the mark */
export function buildRed(): { x: number; y: number; z: number; tx: number; ty: number }[] {
  const n = TARGETS.length / 2;
  return Array.from({ length: n }, (_, i) => {
    let gx = gauss(i, 7), gy = gauss(i, 11), gz = gauss(i, 13);
    const m = Math.hypot(gx, gy, gz);
    const k = m > 2.2 ? 2.2 / m : 1;
    gx *= k; gy *= k; gz *= k;
    return { x: gx * RC.r * 0.48, y: gy * RC.r * 0.48, z: gz * RC.r * 0.48, tx: TARGETS[i * 2], ty: TARGETS[i * 2 + 1] };
  });
}

const lin = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / Math.max(1, b - a)));
const sm = (x: number) => x * x * (3 - 2 * x);

/** camera speed (world units per frame): alive at f0, cruise for the face, surge on "uncensored", brake (the
 *  anticipation) on "that", lunge into the hit on "never", recoil */
export function speed(f: number, t: T): number {
  if (f < t.pew) return 0.95 - 0.35 * sm(lin(f, 0, t.pew));
  if (f < t.unc) return 0.6;
  if (f < t.ai + 8) return 0.6 + 1.25 * sm(lin(f, t.unc, t.unc + 16));
  if (f < t.that) return 1.85 - 0.95 * sm(lin(f, t.ai + 8, t.that));
  if (f < t.never - 7) return 0.9 - 0.82 * sm(lin(f, t.that, t.that + 9));
  if (f < t.never) return 0.08 + 0.95 * sm(lin(f, t.never - 7, t.never - 1));
  return -0.16 * Math.exp(-(f - t.never) / 4) + 0.015 * (1 - Math.exp(-(f - t.never) / 10));
}

/** camera z for every frame, fixed so the hit lands exactly at DSTOP on "never" */
export function buildPath(t: T, n: number): number[] {
  const z = [0];
  for (let f = 0; f < n; f++) z.push(z[f] - speed(f, t));
  const off = RC.z + DSTOP - z[t.never];
  return z.map((v) => v + off);
}

export type Cam = { x: number; y: number; z: number; roll: number };
export function camAt(path: number[], f: number, t: T): Cam {
  const i = Math.max(0, Math.min(path.length - 2, Math.floor(f)));
  const z = path[i] + (path[i + 1] - path[i]) * (f - i);
  const calm = 1 - sm(lin(f, t.that, t.never));
  const surge = sm(lin(f, t.unc, t.unc + 20)) * (1 - sm(lin(f, t.ai + 8, t.that)));
  return {
    x: (0.55 * Math.sin(f / 38 + 0.6)) * calm,
    y: (0.3 * Math.cos(f / 47)) * calm,
    z,
    roll: (0.16 * Math.sin(f / 52 + 1.1) + 0.12 * surge) * calm,
  };
}

/** world -> stage px. null when behind the lens */
export function proj(x: number, y: number, z: number, c: Cam) {
  const dz = c.z - z;
  if (dz < 0.35) return null;
  const rx = x - c.x, ry = y - c.y;
  const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  const qx = rx * cr - ry * sr, qy = rx * sr + ry * cr;
  return { x: CX + (qx * F) / dz, y: CY - (qy * F) / dz, k: F / dz, dz };
}
