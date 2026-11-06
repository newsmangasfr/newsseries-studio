// "bugs, crashes": the real Silent Hill 2 capture breaks on screen. From "bugs" the picture tears: bands of the same
// footage slip sideways, one band splits its colour, blocks of corrupt texture flash in (what a mistranslated shader or
// a lost GPU looks like). On "crashes" the frame freezes, the tearing peaks, and KytyLiveMonitor shuts the window.
import React from "react";
import { Freeze } from "remotion";
import { prog, useScene } from "../../../src/engine";
import { KytyClip, type KytyLiveTimes } from "./KytyLiveKit";

const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const KytyLiveGlitch: React.FC<{ T: KytyLiveTimes; w: number; h: number }> = ({ T, w, h }) => {
  const { f } = useScene();
  const frozen = f >= T.crashes;
  const clip = (style?: React.CSSProperties) => (
    <Freeze frame={T.crashes} active={frozen}>
      <KytyClip id="sh2" at={T.silent} w={w} h={h} style={{ objectFit: "cover", ...style }} />
    </Freeze>
  );
  if (f < T.bugs) return clip();
  // intensity ramps in on "bugs", peaks on "crashes"
  const amp = 0.45 + 0.35 * prog(f, T.bugs, 10) + 0.4 * prog(f, T.crashes, 4);
  const step = Math.floor(f / 3); // the tear re-cuts every 3 frames
  const bands = Array.from({ length: 4 }, (_, k) => {
    const y = rnd(step * 7 + k) * 0.85;
    const bh = 0.04 + rnd(step * 13 + k) * 0.12 * amp;
    const dx = (rnd(step * 17 + k) - 0.5) * 140 * amp;
    return { y, bh, dx, split: k === 0 };
  });
  const blocks = Array.from({ length: 3 }, (_, k) => ({
    x: rnd(step * 31 + k) * 0.85, y: rnd(step * 37 + k) * 0.85,
    bw: 0.05 + rnd(step * 41 + k) * 0.14, bh: 0.03 + rnd(step * 43 + k) * 0.08,
    c: ["#FF2BD6", "#00FF9C", "#2B6BFF"][k],
    on: rnd(step * 47 + k) < 0.55 + 0.3 * amp,
  }));
  return (
    <>
      {clip()}
      {bands.map((b, k) => (
        <div key={k} style={{ position: "absolute", inset: 0, clipPath: `inset(${(b.y * 100).toFixed(2)}% 0 ${(100 - (b.y + b.bh) * 100).toFixed(2)}% 0)`, transform: `translateX(${b.dx.toFixed(1)}px)` }}>
          {clip(b.split ? { filter: "saturate(3) hue-rotate(160deg) contrast(1.4)" } : undefined)}
        </div>
      ))}
      {blocks.map((b, k) =>
        b.on ? (
          <div key={`b${k}`} style={{ position: "absolute", left: b.x * w, top: b.y * h, width: b.bw * w, height: b.bh * h, background: `repeating-linear-gradient(90deg, ${b.c} 0 6px, #000 6px 9px, ${b.c}88 9px 14px)`, mixBlendMode: "screen", opacity: 0.85 }} />
        ) : null,
      )}
      {/* scanline flicker over the whole frame */}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 5px)", opacity: 0.4 + 0.4 * rnd(step) }} />
    </>
  );
};
