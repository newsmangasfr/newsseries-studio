// touchscreen hook X1: the charge and the screen's reaction. Same gold filaments as "answer" (same arches, same
// pulse, so the handover is exact), with the weight the hook needs: under the fingertip they tear off the column and
// whip up through the glass past the skin, overshoot, recoil, and the recoil ripples out along the row. Lifted a hair,
// they stay hooked and stretch thin. Under the pen they lean for two frames and drop back level.
import React from "react";
import { ease, prog } from "../../../src/engine";
import { CROSSINGS, GOLD, HALF, Y, clamp, lerp } from "./PenVersusFingerKit";
import { hookX1Charge, type HookX1T } from "./HookX1Kit";

const SPREAD = [22, 40, 58, 76];
const HEIGHT = [52, 98, 150, 214];

type Pad = { x: number; gap: number; hover: number };

function hookX1Filament(x: number, side: number, k: number, c: ReturnType<typeof hookX1Charge>, pad: Pad, f: number) {
  const a = SPREAD[k] * side;
  const breathe = 1 + 0.035 * Math.sin(f / 17 + x * 0.013 + k);
  const lean = c.pen ? c.reach : c.lean;
  const at = c.pen ? 0 : pad.x;
  const l = clamp(lean);
  const tall = k >= 2;
  const h = HEIGHT[k] * breathe * (1 + (tall ? 0.1 : 0.42) * lean);
  const pull = (at - x) * 0.16 * lean + c.sway * (0.5 + 0.25 * k);
  const s = [x + a, Y.row];
  const e0 = [x, Y.col - 6];
  const sx = at + (x - at) * 0.5 + side * (k - 1.5) * 9;
  // the end in the skin rides with the pad, and the whip carries it past the skin before it recoils
  const sy = -5 - (c.pen ? 0 : pad.gap - 2 + c.into * (0.6 + 0.2 * k)) - Math.pow(sx - at, 2) / 170;
  const e = tall ? [lerp(e0[0], sx, l), lerp(e0[1], sy, l)] : e0;
  const c1 = [x + a * 1.95 + pull * 0.4, Y.row - h * 1.15];
  const c2 = tall ? [lerp(x + a * 0.35, e[0] + side * 16, l) + pull, lerp(Y.col - h * 1.3, e[1] + 70, l)] : [x + a * 0.35 + pull, Y.col - h * 1.3];
  return `M${s[0].toFixed(1)} ${s[1]}C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
}

export const HookX1Filaments: React.FC<{ f: number; T: HookX1T; pad: Pad }> = ({ f, T, pad }) => (
  <g style={{ filter: `drop-shadow(0 0 7px ${GOLD}) drop-shadow(0 0 22px rgba(255,170,30,0.55))` }} fill="none" strokeLinecap="round">
    {CROSSINGS.map((x, i) => {
      const c = hookX1Charge(x, f, T);
      const lean = clamp(c.lean);
      const lit = clamp(0.42 + 0.58 * lean + 0.5 * Math.max(0, c.reach));
      // hooked in the skin, the pulse runs faster, up into the finger; it is back on the common beat (a whole number
      // of turns later) before the view leaves, so "answer" picks the same pulse up
      const turns = Math.floor((T.and - T.take) / 30);
      const flow = f / 52 + (c.lean > 0.9 ? Math.min(turns, (f - T.take) / 30) : 0);
      return [-1, 1].flatMap((side) =>
        SPREAD.map((_, k) => {
          const d = hookX1Filament(x, side, k, c, pad, f);
          const off = -((flow + i * 0.37 + k * 0.23 + (side > 0 ? 0.5 : 0)) % 1);
          // pulled sugar: the ones hooked in the skin thin out while the pad is off the glass
          const thin = k >= 2 ? 1 - 0.52 * pad.hover * lean : 1;
          return (
            <g key={`${x}${side}${k}`}>
              <path d={d} stroke={GOLD} strokeWidth={(3.2 + 1.6 * lean) * thin} opacity={lit * 0.8} />
              <path d={d} stroke="#FFF3C4" strokeWidth={4.2 * thin} pathLength={1} strokeDasharray="0.14 0.86" strokeDashoffset={off} opacity={lit} />
            </g>
          );
        }),
      );
    })}
  </g>
);

const SUB_N = 84;
const subX = (j: number) => -HALF + 20 + (j + 0.5) * ((HALF * 2 - 40) / SUB_N);

/** the screen reacts: the sub-pixels flare out from under the pad, and throw their light up through the glass */
export const HookX1Flare: React.FC<{ f: number; T: HookX1T; x: number; flare: number }> = ({ f, T, x, flare }) => {
  if (flare < 0.01) return null;
  const at = T.take + 3;
  return (
    <>
      <defs>
        <radialGradient id="hx1-flare" cx="0.5" cy="1" r="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="0.35" stopColor="#BFD9FF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#BFD9FF" stopOpacity="0" />
        </radialGradient>
        <filter id="hx1-px" x="-5%" y="-300%" width="110%" height="700%"><feGaussianBlur stdDeviation="11" /></filter>
      </defs>
      {[true, false].map((soft) => (
        <g key={String(soft)} filter={soft ? "url(#hx1-px)" : undefined}>
          {Array.from({ length: SUB_N }, (_, j) => {
            const px = subX(j);
            const arrives = at + Math.abs(px - x) / 42;
            const reach = clamp(1 - Math.abs(px - x) / 950);
            const wave = prog(f, arrives, 6, ease.out) * (0.5 + 0.5 * Math.exp(-Math.max(0, f - arrives) / 16)) * reach * Math.min(1, flare * 2.4);
            if (wave < 0.02) return null;
            return soft ? (
              <rect key={j} x={px - 13} y={Y.px - 3} width={26} height={38} rx={7} fill={["#FF6A5E", "#5BFF97", "#6AA2FF"][j % 3]} opacity={clamp(wave * 1.6)} />
            ) : (
              <rect key={j} x={px - 7} y={Y.px + 5} width={14} height={22} rx={5} fill="#FFFFFF" opacity={clamp(wave * 0.9)} />
            );
          })}
        </g>
      ))}
      <path d={`M${x - 640} ${Y.px} A640 400 0 0 1 ${x + 640} ${Y.px}Z`} fill="url(#hx1-flare)" opacity={flare} style={{ mixBlendMode: "screen" }} />
    </>
  );
};
