// One flat ground with a faint 60 px grid (it gives motion blur something to smear). The ground belongs to the
// scene; between two scenes of different ground it cross-fades linearly over 6 frames, centred in the silence.
import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { useReel } from "./context";
import type { GroundName } from "../theme";

export const FADE = 6;

/** 0 = dark, 1 = light, at this frame */
export function useLightness(): number {
  const { tl } = useReel();
  const f = useCurrentFrame();
  const val = (g: GroundName) => (g === "light" ? 1 : 0);
  let k = val(tl.scenes[0].ground);
  for (let i = 1; i < tl.scenes.length; i++) {
    const s = tl.scenes[i];
    if (f < s.mid - FADE / 2) break;
    k = interpolate(f, [s.mid - FADE / 2, s.mid + FADE / 2], [val(tl.scenes[i - 1].ground), val(s.ground)], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return k;
}

export const Ground: React.FC = () => {
  const { theme } = useReel();
  const k = useLightness();
  const { dark, light } = theme.grounds;
  const p = theme.gridPitch;
  const grid = (c: string): React.CSSProperties => ({
    backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
    backgroundSize: `${p}px ${p}px`,
    backgroundPosition: `${p / 2}px ${p / 3}px`,
  });
  const a = theme.atmosphere;
  const g = a?.gradient;
  const grad = (name: GroundName, flat: string) => {
    const pair = g?.[name];
    return pair ? `linear-gradient(180deg, ${pair[0]}, ${pair[1]})` : flat;
  };
  return (
    <AbsoluteFill style={{ backgroundColor: interpolateColors(k, [0, 1], [dark.bg, light.bg]) }}>
      {g?.dark && <AbsoluteFill style={{ background: grad("dark", dark.bg), opacity: 1 - k }} />}
      {g?.light && <AbsoluteFill style={{ background: grad("light", light.bg), opacity: k }} />}
      {a?.glow && k < 1 && <AbsoluteFill style={{ opacity: 1 - k, background: `radial-gradient(circle ${a.glow.r}px at ${a.glow.x}px ${a.glow.y}px, ${a.glow.color}, transparent)` }} />}
      {a?.particles && <Particles {...a.particles} fade={1 - k} />}
      <AbsoluteFill style={{ ...grid(dark.grid), opacity: 1 - k }} />
      <AbsoluteFill style={{ ...grid(light.grid), opacity: k }} />
      {!!a?.vignette && k < 1 && <AbsoluteFill style={{ opacity: 1 - k, background: `radial-gradient(ellipse 75% 60% at 50% 45%, transparent 40%, rgba(0,0,0,${a.vignette}))` }} />}
    </AbsoluteFill>
  );
};

// Drifting dots joined by faint lines when close: a network that breathes behind the scene. Positions are a pure
// function of the frame and a fixed seed, so a still and a render agree. Dark grounds only (it fades with the light).
const Particles: React.FC<{ color: string; count: number; link: number; speed: number; fade: number }> = ({ color, count, link, speed, fade }) => {
  const f = useCurrentFrame();
  if (fade <= 0.01) return null;
  const rnd = (i: number, k: number) => {
    const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const t = (f / 60) * speed;
  const pts = Array.from({ length: count }, (_, i) => ({
    x: rnd(i, 1) * 1080 + Math.sin(t * (0.3 + rnd(i, 2) * 0.5) + i) * 40,
    y: rnd(i, 3) * 1920 + Math.cos(t * (0.25 + rnd(i, 4) * 0.5) + i * 1.7) * 40,
    r: 2 + rnd(i, 5) * 3,
  }));
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < count; i++)
    for (let j = i + 1; j < count; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < link) lines.push(<line key={`${i}-${j}`} x1={pts[i].x} y1={pts[i].y} x2={pts[j].x} y2={pts[j].y} stroke={color} strokeWidth={1.2} opacity={(1 - d / link) * 0.45} />);
    }
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={1080} height={1920}>
        {lines}
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={color} opacity={0.75} />)}
      </svg>
    </AbsoluteFill>
  );
};
