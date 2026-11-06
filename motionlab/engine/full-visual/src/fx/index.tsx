// Effects a scene may use, each a pure function of the frame (a still and a render always agree). Written for this
// engine from the motion ideas of the 10K Design web catalogue; no catalogue code is shipped here. Every effect takes
// `start` in frames: land it on its word with cue() / endsOn() like everything else. See references/effets.md.
import React from "react";
import { Img, useCurrentFrame } from "remotion";
import { ease, prog } from "../engine/moves";

const rnd = (i: number, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Odometer: every digit is a column of 0-9 that rolls to its place; the higher digits settle last. */
export const Odometer: React.FC<{ value: number; start: number; dur?: number; size?: number; color?: string; font?: string; prefix?: string; suffix?: string; locale?: string }> = ({
  value, start, dur = 36, size = 140, color = "#fff", font = "Inter, sans-serif", prefix = "", suffix = "", locale = "fr-FR",
}) => {
  const f = useCurrentFrame();
  const text = Math.round(value).toLocaleString(locale);
  const digits = [...text];
  let d = 0;
  const total = digits.filter((c) => /\d/.test(c)).length;
  return (
    <span style={{ display: "inline-flex", fontFamily: font, fontSize: size, fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
      {prefix && <span style={{ whiteSpace: "pre" }}>{prefix}</span>}
      {digits.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c === " " || c === " " ? " " : c}</span>;
        const order = total - 1 - d++; // the rightmost digit settles first
        const p = prog(f, start + order * 3, dur, ease.outHard);
        const target = Number(c);
        const turns = 1 + order; // higher digits travel further
        const pos = (target + 10 * turns) * p;
        return (
          <span key={i} style={{ display: "inline-block", height: size, overflow: "hidden", width: "0.62em" }}>
            <span style={{ display: "block", transform: `translateY(${-(pos % 10) * size}px)`, filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined }}>
              {Array.from({ length: 11 }, (_, k) => <span key={k} style={{ display: "block", height: size, textAlign: "center" }}>{k % 10}</span>)}
            </span>
          </span>
        );
      })}
      {suffix && <span style={{ whiteSpace: "pre" }}>{suffix}</span>}
    </span>
  );
};

/** Decode: each character cycles through glyphs, then locks, left to right. A prompt, a code, a password. */
export const Decode: React.FC<{ text: string; start: number; msPerChar?: number; fps?: number; glyphs?: string; style?: React.CSSProperties; lockedColor?: string; scrambleColor?: string }> = ({
  text, start, msPerChar = 28, fps = 60, glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/", style, lockedColor, scrambleColor = "rgba(255,255,255,0.45)",
}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const locked = Math.floor(((f - start) / fps) * (1000 / msPerChar));
  const ahead = 6; // characters already scrambling past the cursor
  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {[...text].map((c, i) => {
        if (i < locked) return <span key={i} style={{ color: lockedColor }}>{c}</span>;
        if (i > locked + ahead || c === " ") return <span key={i} style={{ opacity: 0 }}>{c}</span>;
        return <span key={i} style={{ color: scrambleColor }}>{glyphs[Math.floor(rnd(i, Math.floor(f / 2)) * glyphs.length)]}</span>;
      })}
    </span>
  );
};

/** Beam: a light that runs along the border of a rounded box. Put it inside a position:relative card. */
export const Beam: React.FC<{ w: number; h: number; r?: number; color?: string; start?: number; period?: number; length?: number; width?: number }> = ({
  w, h, r = 28, color = "#FF7A1A", start = 0, period = 150, length = 0.18, width = 3,
}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const per = 2 * (w + h) - (8 - 2 * Math.PI) * r;
  const head = (((f - start) / period) % 1) * per;
  const seg = per * length;
  const fade = prog(f, start, 12, ease.out);
  const id = `beam-${w}-${h}-${r}`;
  return (
    <svg width={w + 20} height={h + 20} style={{ position: "absolute", left: -10, top: -10, pointerEvents: "none", opacity: fade }}>
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      {[{ blur: true, sw: width * 3, o: 0.7 }, { blur: false, sw: width, o: 1 }].map((l, i) => (
        <rect key={i} x={10} y={10} width={w} height={h} rx={r} fill="none" stroke={color} strokeWidth={l.sw} strokeLinecap="round" opacity={l.o}
          strokeDasharray={`${seg} ${per - seg}`} strokeDashoffset={-head} filter={l.blur ? `url(#${id})` : undefined} />
      ))}
    </svg>
  );
};

/** Dust: a word or a block breaks into grains that drift up and fade (out), or gathers from them (in). */
export const Dust: React.FC<{ start: number; dur?: number; mode?: "out" | "in"; w: number; h: number; color?: string; grains?: number; children: React.ReactNode }> = ({
  start, dur = 40, mode = "out", w, h, color = "#fff", grains = 140, children,
}) => {
  const f = useCurrentFrame();
  const raw = prog(f, start, dur, ease.inOut);
  const p = mode === "out" ? raw : 1 - raw;
  // the element erodes from left to right; each grain leaves when the front passes its column
  const front = p * 1.3 - 0.15;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `linear-gradient(90deg, transparent ${front * 100}%, #000 ${(front + 0.15) * 100}%)`, maskImage: `linear-gradient(90deg, transparent ${front * 100}%, #000 ${(front + 0.15) * 100}%)` }}>
        {children}
      </div>
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {Array.from({ length: grains }, (_, i) => {
          const gx = rnd(i, 1), gy = rnd(i, 2);
          const local = Math.max(0, Math.min(1, (front - gx) / 0.35));
          if (local <= 0 || local >= 1) return null;
          const x = gx * w + local * (40 + rnd(i, 3) * 120);
          const y = gy * h - local * (60 + rnd(i, 4) * 160);
          return <circle key={i} cx={x} cy={y} r={1.5 + rnd(i, 5) * 2.5} fill={color} opacity={(1 - local) * 0.9} />;
        })}
      </svg>
    </div>
  );
};

/** PixelReveal: the picture arrives as a mosaic of tiles, each flipping in at its own moment, then the tiles melt. */
export const PixelReveal: React.FC<{ src: string; w: number; h: number; start: number; dur?: number; tile?: number; radius?: number; tint?: string }> = ({
  src, w, h, start, dur = 40, tile = 54, radius = 24, tint = "#1C1C1F",
}) => {
  const f = useCurrentFrame();
  const cols = Math.ceil(w / tile), rows = Math.ceil(h / tile);
  const melt = prog(f, start + dur, 14, ease.out);
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: radius, overflow: "hidden", background: tint }}>
      <Img src={src} style={{ position: "absolute", inset: 0, width: w, height: h, objectFit: "cover", opacity: melt }} />
      {melt < 1 && (
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${cols}, ${tile}px)`, opacity: 1 - melt }}>
          {Array.from({ length: cols * rows }, (_, i) => {
            const at = start + rnd(i, 7) * dur * 0.8;
            const p = prog(f, at, 8, ease.out);
            const cx = (i % cols) * tile, cy = Math.floor(i / cols) * tile;
            return (
              <div key={i} style={{ width: tile, height: tile, overflow: "hidden", position: "relative", transform: `scale(${0.6 + 0.4 * p})`, opacity: p }}>
                <Img src={src} style={{ position: "absolute", left: -cx, top: -cy, width: w, height: h, objectFit: "cover" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** Radar: rings that pulse out from a centre and a sweep that turns. Searching, scanning, listening. */
export const Radar: React.FC<{ size?: number; color?: string; start?: number; rings?: number; children?: React.ReactNode }> = ({ size = 520, color = "#41F9D3", start = 0, rings = 3, children }) => {
  const f = useCurrentFrame();
  const t = Math.max(0, f - start);
  const appear = prog(f, start, 14, ease.out);
  return (
    <div style={{ position: "relative", width: size, height: size, opacity: appear }}>
      {Array.from({ length: rings }, (_, i) => {
        const p = ((t / 90 + i / rings) % 1);
        return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: size * p, height: size * p, marginLeft: -size * p / 2, marginTop: -size * p / 2, borderRadius: "50%", border: `3px solid ${color}`, opacity: (1 - p) * 0.8 }} />;
      })}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(from ${(t * 3) % 360}deg, ${color}55, transparent 25%)` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${color}44` }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
};

/** Orb: a soft glowing sphere whose colours turn slowly; it breathes faster when `busy` (an AI thinking). */
export const Orb: React.FC<{ size?: number; colors?: [string, string, string]; busy?: boolean; start?: number }> = ({
  size = 360, colors = ["#7C5CFF", "#2E7AEA", "#41F9D3"], busy = false, start = 0,
}) => {
  const f = useCurrentFrame();
  const t = (f - start) / 60;
  const appear = prog(f, start, 18, ease.out);
  const breath = 1 + Math.sin(t * (busy ? 7 : 2.4)) * (busy ? 0.045 : 0.025);
  const a = (t * (busy ? 120 : 40)) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", position: "relative", transform: `scale(${appear * breath})`, opacity: appear,
      boxShadow: `0 0 ${size * 0.35}px ${colors[1]}66` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(from ${a}deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`, filter: `blur(${size * 0.08}px)` }} />
      <div style={{ position: "absolute", inset: "8%", borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0) 45%)` }} />
    </div>
  );
};

/** Glass: a frosted card with a lit edge. Over a busy background it reads as a layer above the scene. */
export const Glass: React.FC<{ w: number; h: number; r?: number; tint?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, r = 32, tint = "rgba(255,255,255,0.08)", children, style }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: r, background: tint, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.12), 0 30px 60px rgba(0,0,0,0.35)", overflow: "hidden", ...style }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 40%)", pointerEvents: "none" }} />
    <div style={{ position: "relative", width: "100%", height: "100%" }}>{children}</div>
  </div>
);

/** Curve: a smooth line chart that draws itself left to right, a dot riding its tip, the area filling under it. */
export const Curve: React.FC<{ points: number[]; w: number; h: number; start: number; dur?: number; color?: string; fill?: boolean; width?: number }> = ({
  points, w, h, start, dur = 50, color = "#34C759", fill = true, width = 6,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, dur, ease.inOut);
  const max = Math.max(...points), min = Math.min(...points);
  const xy = points.map((v, i) => [(i / (points.length - 1)) * w, h - ((v - min) / (max - min || 1)) * h * 0.9 - h * 0.05] as const);
  // Catmull-Rom to cubic Béziers: smooth through every point
  let d = `M ${xy[0][0]} ${xy[0][1]}`;
  for (let i = 0; i < xy.length - 1; i++) {
    const p0 = xy[i - 1] ?? xy[i], p1 = xy[i], p2 = xy[i + 1], p3 = xy[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  const seg = Math.min(xy.length - 2, Math.floor(p * (xy.length - 1)));
  const k = p * (xy.length - 1) - seg;
  const tip = [xy[seg][0] + (xy[seg + 1][0] - xy[seg][0]) * k, xy[seg][1] + (xy[seg + 1][1] - xy[seg][1]) * k];
  const id = `curve-${w}-${h}-${points.length}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={0.35} /><stop offset="1" stopColor={color} stopOpacity={0} /></linearGradient>
        <clipPath id={`${id}-c`}><rect x={0} y={-20} width={tip[0]} height={h + 40} /></clipPath>
      </defs>
      {fill && <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id})`} clipPath={`url(#${id}-c)`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#${id}-c)`} />
      {f >= start && <circle cx={tip[0]} cy={tip[1]} r={width * 1.8} fill={color} stroke="#fff" strokeWidth={3} />}
    </svg>
  );
};
