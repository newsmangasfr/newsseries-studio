// The one thing allowed to stay on screen for the whole reel. Pick one per reel, or none.
// pill: a promise with a countdown ("the prompt · at the end"), born on the promise, gone when it is paid.
// terminal: never moves, never blurs, gains a line per claim; its squares are the reel's progress bar in disguise.
import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { useReel } from "./context";
import { useLightness } from "./Ground";
import { blurIn, prog, ease, typeOn } from "./moves";
import type { ChromeConfig, Tone } from "./timeline";

const Pill: React.FC<{ c: Extract<ChromeConfig, { type: "pill" }> }> = ({ c }) => {
  const { theme, tl } = useReel();
  const f = useCurrentFrame();
  const k = useLightness();
  const from = tl.at(c.from);
  const to = tl.at(c.to);
  if (f < from || f > to + 10) return null;
  const left = Math.max(0, Math.ceil((to - f) / tl.fps));
  const fill = prog(f, from, to - from, ease.linear);
  const leave = prog(f, to, 10, ease.in);
  const track = interpolateColors(k, [0, 1], ["#1B1B1B", "#FFFFFF"]);
  const ink = interpolateColors(k, [0, 1], ["#FFFFFF", "#0B0B0B"]);
  return (
    <div style={{ position: "absolute", left: 230, top: 1622, width: 620, height: 58, ...blurIn(f, from, { dur: 8, rise: 16 }) }}>
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 29, overflow: "hidden", background: track, opacity: 1 - leave,
          transform: `translateY(${leave * 60}px)`, boxShadow: k > 0.5 ? "0 8px 28px rgba(30,40,60,0.10)" : "none",
          display: "flex", alignItems: "center", fontFamily: theme.font.ui, fontSize: 28, color: ink,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: theme.roles.brand, opacity: 0.22 + 0.06 * (1 - k) }} />
        <span style={{ position: "relative", marginLeft: 24, color: theme.roles.brand, fontSize: 30 }}>✳</span>
        <span style={{ position: "relative", marginLeft: 12, fontWeight: 600 }}>{c.label}</span>
        <span style={{ position: "relative", marginLeft: "auto", marginRight: 24, fontWeight: 600, fontSize: 30, opacity: 0.72, fontVariantNumeric: "tabular-nums" }}>{left}s</span>
      </div>
    </div>
  );
};

const tones: Record<Tone, string> = { prompt: "#E06C5A", ok: "#3DD66B", warn: "#EAB648", alarm: "#F35C6B", dim: "#8A8A8C", plain: "#D6D6D8" };

const Terminal: React.FC<{ c: Extract<ChromeConfig, { type: "terminal" }> }> = ({ c }) => {
  const { theme, tl } = useReel();
  const f = useCurrentFrame();
  const lines = c.lines.map((l) => ({ ...l, f: tl.at(l.at) })).filter((l) => f >= l.f);
  const squares = c.squares ?? 0;
  const filled = lines.filter((l) => l.square).length;
  const done = c.lines.length ? lines.length / c.lines.length : 0;
  // a log that only covers part of the reel arrives and leaves in a silence, like a scene
  const from = c.from !== undefined ? tl.at(c.from) : 8;
  const to = c.to !== undefined ? tl.at(c.to) : Infinity;
  if (f < from || f > to + 9) return null;
  const leave = prog(f, to, 9, ease.in);
  return (
    <div style={{ position: "absolute", left: 90, top: 1290, width: 850, height: 300, borderRadius: 15, overflow: "hidden", background: "#141416", border: "1px solid #2F2F2F", boxShadow: "0 30px 60px rgba(0,0,0,0.45)", ...blurIn(f, from, { dur: 10, rise: 24 }), ...(leave > 0 ? { opacity: 1 - leave, filter: `blur(${(leave * 14).toFixed(1)}px)`, transform: `translateY(${(leave * 40).toFixed(1)}px)` } : {}) }}>
      <div style={{ height: 46, background: "#2A2A2C", display: "flex", alignItems: "center", padding: "0 18px", gap: 9 }}>
        {["#F05155", "#F5C034", "#39DC41"].map((col) => <span key={col} style={{ width: 15, height: 15, borderRadius: 99, background: col }} />)}
        <span style={{ flex: 1, textAlign: "center", fontFamily: theme.font.ui, fontSize: 22, color: "#A2A2A4" }}>{c.title}</span>
        {Array.from({ length: squares }).map((_, i) => <span key={i} style={{ width: 13, height: 13, borderRadius: 3, background: i < filled ? tones.ok : "#47474A" }} />)}
      </div>
      <div style={{ padding: "16px 28px", fontFamily: theme.font.mono, fontSize: 32, lineHeight: "40px", whiteSpace: "nowrap" }}>
        {lines.slice(-4).map((l) => (
          <div key={l.f + l.text} style={{ color: tones[l.tone ?? "plain"] }}>{typeOn(l.text, f, l.f, tl.fps, l.tone === "prompt" ? 33 : 8).text}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 28, right: 28, bottom: 18, height: 8, borderRadius: 4, background: "#252527" }}>
        <div style={{ width: `${done * 100}%`, height: "100%", borderRadius: 4, background: done >= 1 ? tones.ok : tones.warn }} />
      </div>
    </div>
  );
};

// The style's label row at the top (theme.hud), on every frame: "label" is a mono line with the scene number and a
// progress rule; "tape" is the scene's title on a strip of paper tape that swaps in each silence between scenes.
const Hud: React.FC = () => {
  const { theme, tl } = useReel();
  const f = useCurrentFrame();
  const h = theme.hud;
  if (!h) return null;
  const idx = Math.max(0, tl.scenes.findIndex((s) => f >= s.from && f < s.to));
  const sc = tl.scenes[idx] ?? tl.scenes[0];
  const fill = (txt?: string) =>
    (txt ?? "").replace("{n}", String(idx + 1).padStart(2, "0")).replace("{total}", String(tl.scenes.length).padStart(2, "0"))
      .replace("{scene}", sc.id.replace(/[-_]/g, " ")).replace("{title}", sc.title ?? "");
  if (h.kind === "tape") {
    const text = fill(h.left);
    if (!text.trim()) return null;
    const p = prog(f, sc.from, 10, ease.out);
    return (
      <div style={{ position: "absolute", top: h.top, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", background: "#EFE6D2", color: h.color, fontFamily: theme.font.caption, fontWeight: 700, fontSize: 46,
          letterSpacing: "-0.01em", textTransform: "uppercase", padding: "14px 40px", transform: `rotate(-1.2deg) scale(${0.9 + 0.1 * p})`, opacity: p,
          boxShadow: "0 10px 24px rgba(0,0,0,0.35)", clipPath: "polygon(1% 0, 99% 4%, 100% 96%, 0 100%)" }}>
          {text}
        </div>
      </div>
    );
  }
  const progress = h.progress
    ? h.progress === "segments"
      ? tl.scenes.map((s2, i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < idx ? h.color : i === idx ? h.accent : "rgba(128,128,128,0.35)" }} />)
      : [<span key="bar" style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(128,128,128,0.35)", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(f / tl.frames) * 100}%`, background: h.accent }} />
        </span>]
    : null;
  return (
    <div style={{ position: "absolute", top: h.top, left: 60, right: 60, fontFamily: theme.font.mono, fontSize: 24, letterSpacing: "0.04em", color: h.color }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span>{fill(h.left)}</span>
        {h.right && <span style={{ color: h.accent }}>{fill(h.right)}</span>}
      </div>
      {progress && <div style={{ display: "flex", gap: 8, marginTop: 14 }}>{progress}</div>}
    </div>
  );
};

export const Chrome: React.FC<{ config?: ChromeConfig }> = ({ config }) => {
  const pinned = !config || config.type === "none" ? null : config.type === "pill" ? <Pill c={config} /> : <Terminal c={config} />;
  return (
    <>
      <Hud />
      {pinned}
    </>
  );
};
