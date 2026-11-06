// Hook X2, dark, 0-3.6 s: "How did PewDiePie make / an uncensored AI / that never says no?"
// THE MAP DIVE. One continuous camera fall through the reel's map of requests, stretched into a deep galaxy (the map's
// own cluster colours: cooking, coding, travel, music, math), streaking past at speed from frame 1. Dead ahead, a
// red speck: the refused corner. "PewDiePie": the creator's real photo condenses out of the cloud, big, lit by it, points
// streaming in front of and behind them. "uncensored": the camera surges, the red cluster looms and its red light
// climbs the creator's face. "that": the brake, the cluster trembles (anticipation). "never": the lunge, the hit: the cluster
// is pressed flat, a shockwave ring races out along the flattened plane and past the lens, the galaxy is blown back.
// "says": every one of its points lifts and arcs into place. "no": they lock into the real Ajax lockup in front of them.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Img } from "remotion";
import { Column, ease, prog, useScene } from "../../../src/engine";
import { LEAD } from "../../../src/engine/Stage";
import { asset } from "./parts";
import { H, MARK, RC, type T, W, buildGalaxy, buildPath, buildRed, camAt } from "./HookX2World";
import { drawGalaxy, drawRed, drawShock } from "./HookX2Draw";

const TOP = 520;
const PHOTO = { left: -74, top: 14, w: 1000, h: 857 }; // the cut-out (840 x 720 crop of the creator's thumbnail), head at x 450

function useTimes(): T {
  const { cue, f, scene } = useScene();
  return { f, pew: cue("pewdiepie"), make: cue("make"), unc: cue("uncensored"), ai: cue("ai"), that: cue("that"), never: cue("never"), says: cue("says"), no: cue("no"), end: scene.to - LEAD };
}

const Canvas: React.FC<{ draw: (ctx: CanvasRenderingContext2D) => void; f: number }> = ({ draw, f }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    draw(ctx);
  }, [f, draw]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />;
};

/** deep space behind everything: two soft nebula lights that breathe, the source of the cool light on the creator's face */
const Nebula: React.FC<{ f: number; red: number }> = ({ f, red }) => (
  <div style={{ position: "absolute", inset: 0, opacity: 0.9 + 0.1 * Math.sin(f / 11),
    background: `radial-gradient(ellipse 55% 40% at ${30 + 6 * Math.sin(f / 40)}% 30%, rgba(90,140,255,0.16), transparent 70%),
      radial-gradient(ellipse 50% 38% at 72% 62%, rgba(199,155,255,0.12), transparent 70%),
      radial-gradient(ellipse 45% 35% at 50% 70%, rgba(255,59,48,${(0.2 * red).toFixed(3)}), transparent 72%)` }} />
);

/** the creator's real photo, condensing out of the cloud on "PewDiePie" and lit by it: cool from the galaxy, red from the
 *  cluster as it closes in, white from the hit */
const Photo: React.FC<{ t: T; red: number; flash: number }> = ({ t, red, flash }) => {
  const { f } = t;
  const inO = prog(f, t.pew - 8, 14, ease.linear);
  if (inO <= 0) return null;
  const blur = 16 * (1 - prog(f, t.pew - 8, 20, ease.out));
  const s0 = 1.24 - 0.24 * prog(f, t.pew - 8, 30, ease.outHard);
  const dolly = 1 + 0.07 * prog(f, t.pew, t.never - t.pew, ease.inOut);
  const punch = f >= t.never ? 0.035 * Math.exp(-(f - t.never) / 6) * Math.cos((f - t.never) / 2.2) : 0;
  const box: React.CSSProperties = { position: "absolute", left: PHOTO.left, top: PHOTO.top, width: PHOTO.w, height: PHOTO.h };
  const maskUrl = `url(${asset("hookx2/pdp-cut.png")})`;
  const light = `radial-gradient(ellipse 60% 45% at 52% 92%, rgba(255,59,48,${(0.62 * red).toFixed(3)}), transparent 70%),
    radial-gradient(ellipse 70% 70% at 52% 40%, rgba(255,250,240,${(0.5 * flash).toFixed(3)}), transparent 75%),
    linear-gradient(100deg, rgba(90,169,255,0.28), transparent 38%, transparent 62%, rgba(199,155,255,0.24))`;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inO, filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
      transform: `scale(${(s0 * dolly + punch).toFixed(4)})`, transformOrigin: "450px 300px" }}>
      <Img src={asset("hookx2/pdp-cut.png")} style={{ ...box, filter: `brightness(${(0.74 + 0.1 * Math.sin(f / 9) * 0.3).toFixed(3)}) contrast(1.08) saturate(0.92)` }} />
      <div style={{ ...box, background: light, mixBlendMode: "screen", WebkitMaskImage: maskUrl, maskImage: maskUrl, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }} />
    </div>
  );
};

/** the real Ajax lockup (the creator's page's mark + italic "Ajax", recoloured white for the dark ground), locking on "no" */
const Lockup: React.FC<{ t: T }> = ({ t }) => {
  const { f } = t;
  const o = prog(f, t.no - 3, 6, ease.linear);
  if (o <= 0) return null;
  const s = 1.16 - 0.16 * prog(f, t.no - 3, 14, ease.back);
  const breathe = 1 + 0.008 * Math.sin((f - t.no) / 7);
  const w = 400 * MARK.scale, h = 150 * MARK.scale;
  return (
    <Img src={asset("hookx2/lockup-white.png")} style={{ position: "absolute", left: MARK.x - w / 2, top: MARK.y - h / 2, width: w, height: h, opacity: o,
      transform: `scale(${(s * breathe).toFixed(4)})`, filter: "drop-shadow(0 8px 26px rgba(0,0,0,0.75))" }} />
  );
};

export const HookX2: React.FC = () => {
  const t = useTimes();
  const { f } = t;
  const path = useMemo(() => buildPath(t, 260), [t.pew, t.unc, t.ai, t.that, t.never]);
  const galaxy = useMemo(() => buildGalaxy(path[0] + 4, RC.z - 40), [path]);
  const red = useMemo(() => buildRed(), []);
  const back = useMemo(() => (ctx: CanvasRenderingContext2D) => drawGalaxy(ctx, galaxy, path, { ...t }, "back"), [f, galaxy, path]);
  const front = useMemo(() => (ctx: CanvasRenderingContext2D) => {
    drawGalaxy(ctx, galaxy, path, { ...t }, "front");
    drawRed(ctx, red, path, { ...t });
    drawShock(ctx, path, { ...t });
  }, [f, galaxy, path, red]);
  if (f >= t.end) return null;

  const cam = camAt(path, f, t);
  const heat = prog(f, t.never, 10, ease.linear);
  const near = Math.max(0, Math.min(1, (45 - (cam.z - RC.z)) / 40));
  const redLight = near * near * (1 - heat);
  const flash = f >= t.never ? Math.exp(-(f - t.never) / 5) : 0;
  const flashNo = f >= t.no ? Math.exp(-(f - t.no) / 4) * 0.45 : 0;
  const quake = (f >= t.never ? 16 * Math.exp(-(f - t.never) / 7) : 0) + (f >= t.no ? 6 * Math.exp(-(f - t.no) / 5) : 0);
  const dx = Math.sin(f * 2.3) * quake, dy = Math.cos(f * 3.1) * quake;
  const fade = "linear-gradient(to bottom, transparent 0, #000 80px, #000 840px, transparent 930px)";
  const fadeX = "linear-gradient(to right, transparent 0, #000 60px, #000 840px, transparent 900px)";
  return (
    <Column>
      <div style={{ position: "absolute", left: 0, top: TOP, width: W, height: H, overflow: "hidden", WebkitMaskImage: `${fade}, ${fadeX}`, WebkitMaskComposite: "source-in", maskImage: `${fade}, ${fadeX}`, maskComposite: "intersect" }}>
        <div style={{ position: "absolute", inset: 0, transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` }}>
          <Nebula f={f} red={redLight} />
          <Canvas draw={back} f={f} />
          <Photo t={t} red={redLight} flash={flash} />
          <Canvas draw={front} f={f} />
          <Lockup t={t} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 55% at 50% 70%, rgba(255,246,236,${(0.55 * flash + flashNo).toFixed(3)}), rgba(255,246,236,${(0.18 * flash).toFixed(3)}) 60%, transparent 85%)` }} />
        </div>
      </div>
    </Column>
  );
};
