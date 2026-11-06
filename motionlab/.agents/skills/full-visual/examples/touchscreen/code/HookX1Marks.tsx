// touchscreen hook X1: the words on the picture. Three labels, one at a time, each a word and a hairline standing
// on the thing it names (GLASS, WIRES, CHARGE), all in before 2.5 s and gone when the view leaves for the pen.
// One small grey tag, bottom left. Same type as the labels of "grid".
import React from "react";
import { blurIn, blurOut, ease, prog } from "../../../src/engine";

const HALO = { stroke: "#07080A", strokeOpacity: 0.88, strokeLinejoin: "round" as const, paintOrder: "stroke" as const };

/** a word above the thing, a hairline dropping from under its first letter to a small dot on the thing */
export const HookX1Label: React.FC<{ f: number; at: number; out: number; text: string; to: [number, number]; y: number; font: string; left?: boolean }> = ({ f, at, out, text, to, y, font, left }) => {
  if (f < at - 9 || f > out + 8) return null;
  const x = left ? to[0] + 7 : to[0] - 5; // the word hangs to the right of its hairline, or to the left of it
  const top = y + 16;
  const len = Math.max(1, to[1] - top);
  const k = f < out ? prog(f, at - 8, 10, ease.inOut) : 1 - prog(f, out, 6, ease.in);
  const style = f < out ? blurIn(f, at, { dur: 7, rise: 8 }) : blurOut(f, out, { dur: 6 });
  return (
    <g>
      <line x1={to[0]} y1={to[1]} x2={to[0]} y2={top} stroke="#07080A" strokeOpacity={0.6} strokeWidth={5} strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
      <line x1={to[0]} y1={to[1]} x2={to[0]} y2={top} stroke="#FFFFFF" strokeOpacity={0.92} strokeWidth={1.8} strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
      <circle cx={to[0]} cy={to[1]} r={5 * k} fill="#FFFFFF" stroke="#07080A" strokeWidth={1.5} />
      <text x={x} y={y} textAnchor={left ? "end" : "start"} fontFamily={font} fontSize={36} fontWeight={700} letterSpacing={5} fill="#FFFFFF" strokeWidth={11} {...HALO} style={style}>{text}</text>
    </g>
  );
};

export const HookX1Tag: React.FC<{ f: number; out: number; text: string; font: string }> = ({ f, out, text, font }) =>
  f > out + 8 ? null : (
    <text x={64} y={1536} fontFamily={font} fontSize={26} fontWeight={500} fill="#A3A7AE" strokeWidth={8} {...HALO} style={f < out ? undefined : blurOut(f, out, { dur: 7 })}>{text}</text>
  );
