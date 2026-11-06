// touchscreen "grid": the phone checking. On "checks" a white reading line passes over the one crossing and leaves a
// number on it, `100`: what the phone took away from the look. Back in the wide view the line goes down the whole
// grid and leaves a `100` under every crossing ("every" to "crossings"), comes round again twice as fast on "over",
// and by "over." it is a shimmer too fast to follow. Values are illustrative and tagged so.
import React from "react";
import { prog } from "../../../src/engine";
import { CROSSINGS, type WireGridT, type WireGridView, clamp, crossY, rnd, wireGridFlash, wireGridLineY, wireGridReadAt } from "./WireGridKit";
import { WireGridReadLine } from "./WireGridCharge";

export const WireGridRead: React.FC<{ f: number; T: WireGridT; V: WireGridView; font: string }> = ({ f, T, V, font }) => {
  if (f < T.checks - 9) return null;
  const y = wireGridLineY(f, T);
  const size = clamp(V.s * 10.5, 24, 84);
  const shimmer = f >= T.over2 - 2;
  return (
    <g>
      <g fontFamily={font} fontWeight={700} fontSize={size} textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
        {CROSSINGS.map((c) => {
          const at = wireGridReadAt(c.i, c.j, T);
          if (f < at) return null;
          const [x, yy] = V.pt(c.x, c.y + 17);
          if (x < -40 || x > 1120 || yy < 420 || yy > 1960) return null;
          const lit = wireGridFlash(f, c.j, T);
          // a crossing just read again twitches by one before it settles: the number is live
          const twitch = !shimmer && f > at + 8 && lit > 0.7 && rnd(c.n * 3.3 + Math.floor(f / 2)) > 0.62 ? (rnd(c.n + f) > 0.5 ? 1 : -1) : 0;
          const v = Math.round(100 * prog(f, at, 6)) + twitch;
          const pop = 1 + 0.16 * Math.exp(-(f - at) / 4);
          return (
            <text key={c.n} x={x} y={yy + size * 0.36} transform={pop > 1.01 ? `translate(${x} ${yy}) scale(${pop.toFixed(3)}) translate(${-x} ${-yy})` : undefined}
              fill="#FFFFFF" fillOpacity={c.hero && V.macro > 0.5 ? 1 : 0.66 + 0.34 * lit} stroke="#07080A" strokeOpacity={0.86} strokeWidth={size * 0.24} strokeLinejoin="round" paintOrder="stroke">
              {v}
            </text>
          );
        })}
      </g>
      {y !== null && <WireGridReadLine y={y} V={V} />}
      {/* too fast to follow: the line is everywhere at once */}
      {shimmer && [0, 1, 2].map((n) => <g key={n} opacity={0.55 - 0.12 * n}><WireGridReadLine y={crossY(5 + Math.floor(rnd(f * 1.7 + n * 9.1) * 12)) + 4} V={V} /></g>)}
    </g>
  );
};
