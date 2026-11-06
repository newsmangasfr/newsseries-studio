// The caption engine: the one layer every reel shares unchanged.
// One word per spoken word. A word that has not been said does not exist. The active word is bold and full ink,
// said words go regular and grey in one frame, the line re-centres in one frame, the new word resolves from blur in
// place. One key word per block keeps its ink inside a selection box that lands a few frames after it.
import React, { useMemo } from "react";
import { Easing, interpolateColors, useCurrentFrame } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { useReel } from "./context";
import { useLightness } from "./Ground";
import { prog, ease } from "./moves";
import type { Block, Timeline } from "./timeline";
import type { Theme } from "../theme";

type Laid = { lines: number[][]; space: number };
const EMOJI_W = 1.34; // emoji box + its gap, in ems
const KEY_PAD = 10; // a key word keeps clear of its neighbours so the box never touches them
// with marker.pillPad set, the pill reaches pillPad past the word and the word keeps pillPad + PILL_GAP clear
const PILL_GAP = 8;
const keyPad = (mk: { style: string; pillPad?: number }) =>
  mk.style === "pill" && mk.pillPad != null ? mk.pillPad + PILL_GAP : mk.style === "color" || mk.style === "serif" || mk.style === "none" ? 0 : KEY_PAD;
const SERIF_SCALE = 1.08; // the serif key word sits a touch larger so its x-height matches the sans around it
const cased = (t: Theme, s: string) => (t.caption.case === "upper" ? s.toLocaleUpperCase("fr-FR") : s);

function layout(block: Block, tl: Timeline, t: Theme): Laid {
  const fam = (f: string) => f.split(",")[0].trim();
  const m = (text: string) =>
    measureText({ text: cased(t, text), fontFamily: fam(t.font.caption), fontSize: t.caption.size, fontWeight: "700", validateFontIsLoaded: true }).width;
  const serif = (text: string) =>
    measureText({ text, fontFamily: fam(t.font.accent ?? t.font.caption), fontSize: t.caption.size * SERIF_SCALE, fontWeight: "400", validateFontIsLoaded: true }).width;
  const chip = t.caption.chip;
  const space = m("a a") - m("aa") + (chip ? 6 : 0);
  const widths = block.words.map((i) => {
    const w = tl.words[i];
    const text = w.key && t.marker.style === "serif" ? serif(w.w) : m(w.w);
    return text + (w.emoji ? t.caption.size * EMOJI_W : 0) + (w.key ? 2 * keyPad(t.marker) : 0) + (chip ? 2 * chip.padX : 0);
  });
  const span = (a: number, b: number) => widths.slice(a, b).reduce((s, w) => s + w, 0) + space * Math.max(0, b - a - 1);
  const n = widths.length;
  let lines: number[][] = [block.words];
  if (block.br !== undefined) {
    const k = block.words.indexOf(block.br);
    lines = [block.words.slice(0, k), block.words.slice(k)];
    if (Math.max(span(0, k), span(k, n)) > t.caption.wrap) lines.push([]); // an authored line that does not fit is an error too
  } else if (span(0, n) > t.caption.wrap) {
    // two balanced lines, like text-wrap: balance: the break that keeps the wider line narrowest
    let best = -1;
    for (let k = 1; k < n; k++) {
      const wide = Math.max(span(0, k), span(k, n));
      if (wide <= t.caption.wrap && (best < 0 || wide < Math.max(span(0, best), span(best, n)))) best = k;
    }
    lines = best < 0 ? [block.words, [], []] : [block.words.slice(0, best), block.words.slice(best)];
  }
  if (lines.length > t.caption.maxLines) {
    const text = block.words.map((i) => tl.words[i].w).join(" ");
    throw new Error(`caption block ${block.index} needs ${lines.length} lines ("${text}"). Break it in caption.txt: two lines is the limit.`);
  }
  return { lines, space };
}

const Marker: React.FC<{ at: number; ink: string }> = ({ at, ink }) => {
  const { theme } = useReel();
  const f = useCurrentFrame();
  const mk = theme.marker;
  const meas = theme.motion === "measured";
  const p = prog(f, at, mk.drawFrames, ease.linear);
  if (mk.style === "none" || mk.style === "color" || mk.style === "serif" || f < at) return null;
  const box: React.CSSProperties = meas
    ? { position: "absolute", left: -12, right: -12, top: 0, bottom: -2 }
    : { position: "absolute", left: -12, right: -12, top: 0, bottom: -2, opacity: p, transform: `scale(${0.94 + 0.06 * p})` };
  const fill = (color: string, opacity: number, radius = 0) => <span style={{ position: "absolute", inset: 0, background: color, opacity, borderRadius: radius }} />;
  if (mk.style === "pill") return <span style={{ ...box, opacity: p, left: -(mk.pillPad ?? 26), right: -(mk.pillPad ?? 26) }}>{fill(ink, 0.1, 999)}</span>;
  const dot = (pos: React.CSSProperties, k = 1) => (
    <span style={{ position: "absolute", width: mk.handle, height: mk.handle, borderRadius: 999, background: mk.color, border: "3px solid #fff", boxSizing: "border-box", transform: `scale(${k.toFixed(3)})`, ...pos }} />
  );
  const h = mk.handle / 2 + mk.stroke / 2;
  if (!meas) {
    return (
      <span style={{ ...box, border: `${mk.stroke}px solid ${mk.color}` }}>
        {fill(mk.color, mk.fill)}
        {dot({ left: -h, top: -h })}
        {dot({ right: -h, bottom: -h })}
      </span>
    );
  }
  // measured: four staged beats over 200 ms. Handles pop from 0.36, then the horizontal rules with a small
  // overshoot, then the verticals three frames later, then the fill ramps underneath. Drawing it reads as
  // selecting; the whole box appearing at once reads as a label.
  const hand = prog(f, at, 3, Easing.out(Easing.back(1.2)));
  const horiz = prog(f, at + 2, 5, ease.out);
  const vert = prog(f, at + 5, 5, ease.out);
  const wash = prog(f, at + 3, 11, ease.out);
  const rule = (o: React.CSSProperties, k: number, axis: "x" | "y") => (
    <span style={{ position: "absolute", background: mk.color, transform: axis === "x" ? `scaleX(${k.toFixed(3)})` : `scaleY(${k.toFixed(3)})`, ...o }} />
  );
  return (
    <span style={box}>
      {fill(mk.color, mk.fill * wash)}
      {rule({ left: 0, right: 0, top: 0, height: mk.stroke }, horiz, "x")}
      {rule({ left: 0, right: 0, bottom: 0, height: mk.stroke }, horiz, "x")}
      {rule({ top: 0, bottom: 0, left: 0, width: mk.stroke }, vert, "y")}
      {rule({ top: 0, bottom: 0, right: 0, width: mk.stroke }, vert, "y")}
      {dot({ left: -h, top: -h }, 0.36 + 0.64 * hand)}
      {dot({ right: -h, bottom: -h }, 0.36 + 0.64 * hand)}
    </span>
  );
};

const WordSpan: React.FC<{ i: number; active: boolean; ink: string; spoken: string; space: number; last: boolean; future?: string }> = ({ i, active, ink, spoken, space, last, future }) => {
  const { theme, tl } = useReel();
  const f = useCurrentFrame();
  const w = tl.words[i];
  const c = theme.caption;
  const m = theme.motion === "measured";
  // measured: ease-out, not linear. The reference resolves 0.28 / 0.70 / 0.87 / 0.94 / 1.00 over five frames,
  // and the word drops the last 13 px into place rather than appearing at rest.
  // a word shown ahead of its time (caption.upcoming) is already in place: no blur, no drop, its own colour
  const p = future ? 1 : prog(f, w.f, c.blurInFrames + (m ? 1 : 0), m ? ease.out : ease.linear);
  const dy = m ? (1 - p) * 13 : 0;
  const strong = active || !!w.key;
  const mk = theme.marker.style;
  const chip = c.chip;
  const keyColor = w.key && (mk === "color" || mk === "serif") && !future ? theme.marker.color : undefined;
  const color = (w as any).edit?.css?.color ?? (future ? future : chip ? (w.key ? chip.keyInk : chip.ink) : keyColor ?? (strong ? ink : spoken));
  const weight = w.key && mk === "serif" ? 400 : strong ? 700 : c.spokenWeight ?? 400;
  const face: React.CSSProperties = w.key && mk === "serif" ? { fontFamily: theme.font.accent ?? theme.font.caption, fontStyle: "italic", fontSize: c.size * SERIF_SCALE } : {};
  const label: React.CSSProperties = chip
    ? { background: w.key ? chip.keyBg : chip.bg, padding: `${chip.padY}px ${chip.padX}px`, borderRadius: chip.radius, transform: `rotate(${(i % 2 ? 1 : -1) * chip.tilt}deg)`, boxShadow: "0 6px 14px rgba(0,0,0,0.28)", opacity: future ? 0.55 : 1 }
    : {};
  const e = prog(f, w.f, 5, ease.back); // the emoji opens the line as it grows
  return (
    <span data-word-id={(w as any).edit?.id} style={{ display: "inline-flex", alignItems: "center", marginRight: last ? 0 : space, ...(w as any).edit?.css }}>
      {w.emoji && (
        // measured: the advance width is reserved at layout, so a growing emoji never reflows the line
        <span style={{ display: "inline-block", width: c.size * EMOJI_W * (m ? 1 : Math.min(1, e)), fontSize: c.size * 1.1, transform: `scale(${e})`, transformOrigin: m ? "center" : "left center", lineHeight: 1, opacity: m ? Math.min(1, e) : 1 }}>
          {w.emoji}
        </span>
      )}
      <span style={{ position: "relative", display: "inline-block", margin: w.key ? `0 ${keyPad(theme.marker)}px` : undefined, fontWeight: weight, color, opacity: p, filter: p < 1 ? `blur(${(1 - p) * c.blurPx}px)` : undefined, transform: dy ? `translateY(${dy.toFixed(2)}px)` : undefined }}>
        {w.key && !future && !chip && <Marker at={w.f + theme.marker.delayFrames} ink={ink} />}
        <span style={{ position: "relative", display: "inline-block", ...face, ...label }}>{cased(theme, w.w)}</span>
      </span>
    </span>
  );
};

export const Caption: React.FC = () => {
  const { theme, tl } = useReel();
  const f = useCurrentFrame();
  const k = useLightness();
  const laid = useMemo(() => tl.blocks.map((b) => layout(b, tl, theme)), [tl, theme]);
  const block = tl.blocks.find((b) => f >= b.from && f < b.to);
  if (!block) return null;
  const c = theme.caption;
  const { dark, light } = theme.grounds;
  const ink = interpolateColors(k, [0, 1], [dark.ink, light.ink]);
  const spoken = interpolateColors(k, [0, 1], [dark.spoken, light.spoken]);
  const { lines, space } = laid[block.index];
  const shown = block.words.filter((i) => f >= tl.words[i].f);
  const activeIdx = shown[shown.length - 1];
  // every block clears before the next one; the last one never does, so the final frame still reads
  const last = block.index === tl.blocks.length - 1;
  // measured: a block clears on opacity alone, ease-in, no blur and no travel, then one empty frame
  const meas = theme.motion === "measured";
  const out = last ? 0 : prog(f, block.to - c.clearFrames, c.clearFrames, meas ? ease.in : ease.linear);
  return (
    <div
      style={{
        position: "absolute", left: 0, width: 1080, top: block.slot === "top" ? c.top : c.bottom,
        fontFamily: theme.font.caption, fontSize: c.size, lineHeight: `${c.lineHeight}px`, letterSpacing: "-0.01em",
        opacity: 1 - out, filter: !meas && out > 0 ? `blur(${out * 8}px)` : undefined,
      }}
    >
      {lines.map((line, li) => {
        // caption.upcoming shows the whole block from its first frame, words not yet said in their own colour
        const vis = c.upcoming ? line : line.filter((i) => shown.includes(i));
        const left = c.align === "left";
        return (
          <div key={li} style={{ display: "flex", justifyContent: left ? "flex-start" : "center", paddingLeft: left ? (1080 - c.wrap) / 2 : 0, height: c.lineHeight, whiteSpace: "nowrap" }}>
            {vis.map((i, n) => (
              <WordSpan key={i} i={i} active={i === activeIdx} ink={ink} spoken={spoken} space={space} last={n === vis.length - 1} future={c.upcoming && !shown.includes(i) ? c.upcoming : undefined} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
