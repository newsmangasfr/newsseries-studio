// touchscreen "grid": the words on the picture. A label is a word and a hairline on the thing, landing at its word
// (`ROW`, `COLUMN`, `CROSSING`, `CHARGE`), never two in the same half second. A tag is one small grey line, bottom
// left, one at a time. The only number that is a fact is the last one: 120 scans a second (Apple's table, facts.md).
import React from "react";
import { blurIn, blurOut, countTo, ease, prog } from "../../../src/engine";
import { COL_LABEL, HERO, ROW_LABEL, TH, type P2, type WireGridT, type WireGridView, crossX, crossY } from "./WireGridKit";
import { wireGridApex } from "./WireGridCharge";

const HALO = { stroke: "#07080A", strokeOpacity: 0.88, strokeLinejoin: "round" as const, paintOrder: "stroke" as const };

/** a word with a hairline from it to the thing it names */
const Label: React.FC<{ f: number; at: number; out: number; text: string; x: number; y: number; anchor: "start" | "end"; to: P2; font: string; side?: boolean }> = ({ f, at, out, text, x, y, anchor, to, font, side }) => {
  if (f < at - 9 || f > out + 8) return null;
  const wide = text.length * 30.5; // 38 px caps, tracked 5
  // the hairline leaves from under the word, or from its far end when the thing is off to the side
  const from: P2 = side ? [anchor === "start" ? x + wide + 10 : x - wide - 10, y - 13] : [anchor === "start" ? x + 4 : x - 4, y + 18];
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const k = f < out ? prog(f, at - 8, 10, ease.inOut) : 1 - prog(f, out, 7, ease.in);
  const style = f < out ? blurIn(f, at, { dur: 7, rise: 8 }) : blurOut(f, out, { dur: 7 });
  return (
    <g>
      <line x1={to[0]} y1={to[1]} x2={from[0]} y2={from[1]} stroke="#07080A" strokeOpacity={0.6} strokeWidth={5} strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
      <line x1={to[0]} y1={to[1]} x2={from[0]} y2={from[1]} stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={1.8} strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={38} fontWeight={700} letterSpacing={5} fill="#FFFFFF" strokeWidth={11} {...HALO} style={style}>{text}</text>
    </g>
  );
};

/** one small honest line, bottom left */
const Tag: React.FC<{ f: number; at: number; out: number; text: string; font: string }> = ({ f, at, out, text, font }) => {
  if (f < at || f > out + 8) return null;
  return (
    <text x={64} y={1408} fontFamily={font} fontSize={26} fontWeight={500} fill="#A3A7AE" strokeWidth={8} {...HALO} style={f < out ? blurIn(f, at, { dur: 8 }) : blurOut(f, out, { dur: 7 })}>{text}</text>
  );
};

export const WireGridText: React.FC<{ f: number; T: WireGridT; V: WireGridView; font: string }> = ({ f, T, V, font }) => {
  const row = V.pt(crossX(1) + 20, crossY(ROW_LABEL), TH);
  const col = V.pt(crossX(COL_LABEL), crossY(15) - 20, TH);
  const crossing = V.pt(HERO.x - 0.6, HERO.y - 1.5, TH + 2.3);
  const apex = wireGridApex(f, V);
  const n = Math.round(countTo(f, T.over2 - 15, 15, 0, 120));
  const counter = f >= T.over2 - 15;
  return (
    <g>
      <Label f={f} at={T.going1} out={T.everywhere - 6} text="ROW" x={row[0] - 30} y={row[1] - 78} anchor="start" to={[row[0], row[1] - 6]} font={font} />
      <Label f={f} at={T.going2} out={T.everywhere - 6} text="COLUMN" x={col[0] + 78} y={col[1] - 84} anchor="start" to={[col[0] + 8, col[1] - 6]} font={font} />
      <Label f={f} at={T.column} out={T.holds - 8} text="CROSSING" x={84} y={726} anchor="start" to={crossing} font={font} side />
      <Label f={f} at={T.charge} out={T.checks - 10} text="CHARGE" x={1004} y={700} anchor="end" to={apex} font={font} side />
      <Tag f={f} at={T.see + 6} out={T.columns - 8} text="The wires are transparent in a real phone" font={font} />
      <Tag f={f} at={T.the3} out={T.tiny - 10} text="Magnified illustration" font={font} />
      <Tag f={f} at={T.tiny} out={T.checks - 10} text="Charge shown in gold, invisible to the eye" font={font} />
      <Tag f={f} at={T.those} out={T.over1 + 6} text="Values illustrative" font={font} />
      {counter && (
        <g fontFamily={font} {...HALO} style={blurIn(f, T.over2 - 15, { dur: 6, rise: 14 })}>
          <text x={60} y={1392} fontSize={124} fontWeight={800} letterSpacing={-3} fill="#FFFFFF" strokeWidth={16} style={{ fontVariantNumeric: "tabular-nums" }}>{n}</text>
          <text x={318} y={1352} fontSize={44} fontWeight={700} fill="#FFFFFF" strokeWidth={11}>scans a second</text>
          <text x={320} y={1392} fontSize={26} fontWeight={500} fill="#A3A7AE" strokeWidth={8}>Apple, iPhone X and later</text>
        </g>
      )}
    </g>
  );
};
