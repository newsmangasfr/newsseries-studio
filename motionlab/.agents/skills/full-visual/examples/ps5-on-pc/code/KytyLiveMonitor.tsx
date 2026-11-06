// The PC's monitor, fed by the board's graphics card. "while you play": dark until now, it powers on and the game is
// really running on it (KytyPS5's launcher, then Astro Bot, real captures) while the calls above get answered.
// "works": it takes centre stage and plays real KytyPS5 captures, one per word (Astro Bot, God of War Sons of Sparta,
// GTA V on "playable"), then Silent Hill 2 with the window's own title bar at fps 6, the window shut on "crashes",
// #810's three modes on "uneven". Every clip carries its source line.
import React from "react";
import { blurIn, blurOut, draw, ease, mix, prog, typeOn, useScene } from "../../../src/engine";
import { CLIPS, KB, KL, KytyClip, KytyLiveSource, PcMonitorFrame, type ClipId, type KytyLiveTimes } from "./KytyLiveKit";
import { GtaTable } from "./KytyLiveScreen";
import { KytyLiveGlitch } from "./KytyLiveGlitch";

const BIG = { x: 110, y: 930, w: 860, h: 484 };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** "fps: 6" in the Silent Hill 2 window's title bar, as a fraction of the clip (measured on the 1080p capture) */
const FPS_SPOT = { x: 0.69, y: 0.02 };

/** the picture answers the graphics card: while the shader is being translated the frame waits, drained and dark;
 *  when the Vulkan pulse reaches the screen (speaks + 20) it bursts back to full colour */
function screenFilter(f: number, T: KytyLiveTimes, flash: number): string | undefined {
  const arrive = T.speaks + 20;
  const wait = prog(f, T.shader + 4, 12) * (1 - prog(f, arrive, 4, ease.linear));
  const burst = f >= arrive ? 1 - prog(f, arrive, 22, ease.out) : 0;
  const b = 1 + 0.8 * flash + 0.9 * burst - 0.5 * wait;
  if (b === 1 && wait === 0 && burst === 0) return undefined;
  return `brightness(${b.toFixed(3)}) grayscale(${wait.toFixed(3)}) saturate(${(1 + 0.8 * burst).toFixed(3)})`;
}

/** which clip is on screen, by word */
function clipPlan(T: KytyLiveTimes): { id: ClipId; at: number; skip: number }[] {
  const lAt = T.play - 4;
  return [
    { id: "launcher", at: lAt, skip: CLIPS.launcher.frames - (T.launches - lAt) },
    { id: "astro", at: T.launches, skip: 0 },
    { id: "gow", at: T.games, skip: 0 },
    { id: "gta", at: T.playable, skip: 0 },
    { id: "sh2", at: T.silent, skip: 0 },
  ];
}

const ScreenContent: React.FC<{ T: KytyLiveTimes; w: number; h: number }> = ({ T, w, h }) => {
  const { f } = useScene();
  const plan = clipPlan(T);
  const layers: React.ReactNode[] = [];
  plan.forEach((c, i) => {
    const next = plan[i + 1]?.at ?? T.uneven;
    if (f < c.at - 1 || f >= next + 10) return;
    // the next game slides in over the one playing; the first two cut (the launcher hands over to the game itself)
    const p = i < 2 ? 1 : prog(f, c.at, 9, ease.out);
    let inner: React.ReactNode = <KytyClip id={c.id} at={c.at} skip={c.skip} w={w} h={h} style={{ objectFit: "cover" }} />;
    if (c.id === "sh2") {
      const shut = prog(f, T.crashes + 6, 8, ease.in);
      inner = (
        <div style={{ position: "absolute", inset: 0, transform: `scaleY(${(1 - shut).toFixed(3)})`, transformOrigin: "50% 50%", opacity: 1 - prog(f, T.crashes + 12, 3) }}>
          <KytyLiveGlitch T={T} w={w} h={h} />
          {/* the window's own close button, pressed by the crash */}
          {f >= T.crashes && f < T.crashes + 8 && <div style={{ position: "absolute", left: w * 0.958, top: 0, width: w * 0.042, height: h * 0.042, background: "#C42B1C" }} />}
        </div>
      );
    }
    layers.push(
      <div key={c.id} style={{ position: "absolute", left: (1 - p) * w, top: 0, width: w, height: h, overflow: "hidden", background: "#000" }}>
        {inner}
      </div>,
    );
  });
  if (f >= T.uneven - 4) layers.push(<GtaTable key="t" T={T} />);
  return <>{layers}</>;
};

/** the monitor stands under the board from the scene's first frame, dark (the same one `missing` put there on "PC");
 *  on "play" it powers on and the game runs on it */
export const KytyLiveMonitor: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, scene } = useScene();
  if (f < scene.from - 6 || f >= T.reaching + 9) return null;
  const k = prog(f, T.works, 26, ease.inOut);
  const m = KB.pc;
  const r = { x: lerp(m.x, BIG.x, k), y: lerp(m.y, BIG.y, k), w: lerp(m.w, BIG.w, k), h: lerp(m.h, BIG.h, k) };
  const bez = 9 + 5 * k;
  const lit = prog(f, T.play - 4, 8, ease.out);
  const flash = f >= T.play - 4 ? 1 - prog(f, T.play - 2, 14, ease.out) : 0;
  const glow = Math.max(f >= T.speaks ? 1 - prog(f, T.speaks + 6, 30, ease.out) : 0, 0.6 * flash);
  const cable = 1 - prog(f, T.works, 10);
  const out = f >= T.reaching ? blurOut(f, T.reaching, { dur: 8 }) : {};
  const g = KB.gpu;
  const port = { x: g.x + 9, y: g.y + 126 };
  const plug = { x: r.x + r.w * 0.3, y: r.y - bez };
  return (
    <div style={{ position: "absolute", inset: 0, ...out }}>
      {/* the display cable from the graphics card's bracket; it carries the picture once the card speaks Vulkan */}
      {cable > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: cable }}>
          <path d={`M${port.x},${port.y} C${port.x - 40},${port.y + 30} ${plug.x + 20},${plug.y - 40} ${plug.x},${plug.y}`} fill="none" stroke={mix(f, T.speaks, 6, "#4A4A50", KL.vulkan)} strokeWidth={8} strokeLinecap="round" />
          <rect x={port.x - 8} y={port.y - 10} width={16} height={20} rx={3} fill="#2A2A2E" stroke="#6A6A70" strokeWidth={2} />
          {f >= T.speaks && f < T.speaks + 20 && (() => {
            const t = prog(f, T.speaks, 20, ease.inOut);
            const u = 1 - t;
            const x = u * u * u * port.x + 3 * u * u * t * (port.x - 40) + 3 * u * t * t * (plug.x + 20) + t * t * t * plug.x;
            const y = u * u * u * port.y + 3 * u * u * t * (port.y + 30) + 3 * u * t * t * (plug.y - 40) + t * t * t * plug.y;
            return <circle cx={x} cy={y} r={10} fill="#FF5A6E" style={{ filter: "drop-shadow(0 0 10px #FF5A6E)" }} />;
          })()}
        </svg>
      )}
      <PcMonitorFrame r={r} k={k} glow={glow} lit={lit}>
        {f >= T.play - 6 && (
          <div style={{ position: "absolute", left: 0, top: 0, width: BIG.w, height: BIG.h, transform: `scale(${(r.w / BIG.w).toFixed(4)}, ${(r.h / BIG.h).toFixed(4)})`, transformOrigin: "0 0", filter: screenFilter(f, T, flash) }}>
            <ScreenContent T={T} w={BIG.w} h={BIG.h} />
          </div>
        )}
      </PcMonitorFrame>
    </div>
  );
};

/** the game's name and its source: beside the small monitor while the board works, under the big one after "works" */
export const KytyLiveUnder: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme, fps } = useScene();
  if (f < T.play || f >= T.reaching + 8) return null;
  const out = f >= T.reaching ? blurOut(f, T.reaching, { dur: 8 }) : {};
  const name = (id: ClipId, at: number, align: "flex-end" | "center", srcStyle?: React.CSSProperties) => (
    <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: align, gap: 8, ...blurIn(f, at, { dur: 6 }) }}>
      <div style={{ fontFamily: theme.font.ui, fontSize: 34, fontWeight: 700, color: KL.ink }}>{CLIPS[id].game}</div>
      <KytyLiveSource text={CLIPS[id].src} gh={false} style={srcStyle} />
    </div>
  );
  if (f < T.works + 8) {
    const gone = f >= T.works ? blurOut(f, T.works, { dur: 8 }) : {};
    return (
      // the creator's character stands at the bottom-left edge (Presenter.tsx): the source line wraps into a narrow right-aligned
      // column beside the monitor, a little higher, so the creator's head never covers it
      <div style={{ position: "absolute", right: 1080 - KB.pc.x + 26, top: KB.pc.y + 40, display: "flex", flexDirection: "column", alignItems: "flex-end", ...gone }}>
        {name("astro", T.play, "flex-end", { whiteSpace: "normal", maxWidth: 250, textAlign: "right", lineHeight: 1.25 })}
      </div>
    );
  }
  const wrap = (node: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1504, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, ...style }}>{node}</div>
  );
  if (f < T.bugs) {
    const cur = clipPlan(T).filter((c) => c.id !== "launcher" && f >= Math.max(c.at, T.works + 8)).pop()!;
    return wrap(name(cur.id, Math.max(cur.at, T.works + 8), "center"), f >= T.bugs - 6 ? blurOut(f, T.bugs - 6, { dur: 6 }) : {});
  }
  if (f < T.uneven) {
    // after the window shuts, the error line rises into the black screen: the crash has a face, the screen is never empty
    const t = typeOn("vkQueueSubmit failed: ErrorDeviceLost", f, T.bugs, fps, 18);
    const rise = prog(f, T.crashes + 12, 16, ease.inOut);
    const pulse = rise >= 1 ? 0.5 + 0.5 * Math.sin((f - T.crashes - 28) / 5) : 0;
    const gone = f >= T.uneven - 6 ? blurOut(f, T.uneven - 6, { dur: 6 }) : {};
    return (
      <>
        <div style={{ position: "absolute", left: 0, width: 1080, top: lerp(1504, 1140, rise), display: "flex", justifyContent: "center", transform: `scale(${(1 + 0.12 * rise).toFixed(3)})`, ...gone }}>
          <div style={{ fontFamily: theme.font.mono, fontSize: 32, color: KL.red, padding: "8px 18px", borderRadius: 10, background: "rgba(229,72,77,0.12)", border: `2px solid ${KL.red}`, minWidth: 744, boxShadow: `0 0 ${(30 * pulse).toFixed(1)}px rgba(229,72,77,0.55)`, ...blurIn(f, T.bugs, { dur: 5 }) }}>
            {t.text}
            {t.typing && <span style={{ opacity: 0.8 }}>▍</span>}
          </div>
        </div>
        {wrap(<KytyLiveSource text="KytyPS5 · issue #810" />, { top: 1560 })}
      </>
    );
  }
  return wrap(<KytyLiveSource text="KytyPS5 · issue #810 · GTA V" />, { ...blurIn(f, T.uneven, { dur: 6 }), ...out });
};

/** "6": the Silent Hill 2 window's own title bar, the same capture zoomed, "fps: 6" circled; a thread to the spot */
export const KytyLiveLoupe: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme } = useScene();
  if (f < T.six - 6 || f >= T.bugs + 8) return null;
  const L = { x: 462, y: 600, w: 560, h: 150 };
  const ring = { cx: 384, cy: 74 };
  const spot = { x: BIG.x + FPS_SPOT.x * BIG.w, y: BIG.y + FPS_SPOT.y * BIG.h };
  const st = f >= T.bugs ? blurOut(f, T.bugs, { dur: 8 }) : blurIn(f, T.six - 6, { dur: 7, scaleFrom: 0.7 });
  return (
    <div style={{ position: "absolute", inset: 0, ...st }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={L.x + ring.cx} y1={L.y + L.h + 4} x2={spot.x} y2={spot.y} stroke={KL.red} strokeWidth={3} {...draw(f, T.six, 10)} />
        <circle cx={spot.x} cy={spot.y} r={16} fill="none" stroke={KL.red} strokeWidth={3} opacity={prog(f, T.six + 8, 4)} />
      </svg>
      <div style={{ position: "absolute", left: L.x, top: L.y, width: L.w, height: L.h, overflow: "hidden", borderRadius: 12, background: "#F3F3F3", boxShadow: "0 20px 50px rgba(0,0,0,0.55)" }}>
        <div style={{ position: "absolute", left: 0, top: 24, width: 560, height: 101 }}>
          <KytyClip id="sh2title" at={T.silent} w={560} h={101} />
        </div>
        <svg width={L.w} height={L.h} style={{ position: "absolute", left: 0, top: 0 }}>
          <ellipse cx={ring.cx} cy={ring.cy} rx={76} ry={42} fill="none" stroke={KL.red} strokeWidth={6} {...draw(f, T.six, 10)} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: L.x, top: L.y - 46, fontFamily: theme.font.ui, fontSize: 26, color: KL.dim }}>the window's own title bar</div>
    </div>
  );
};
