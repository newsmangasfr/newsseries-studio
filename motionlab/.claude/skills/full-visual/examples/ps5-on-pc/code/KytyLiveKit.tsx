// KytyLive's shared pieces: the cue table, the board's geometry, colours, and the small real marks.
// The board here is the wiring board of plan.md (state 2: answered live by KytyPS5).
import React from "react";
import { Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { useScene } from "../../../src/engine";

export const kytyLiveAsset = (name: string) => staticFile(`ps5-on-pc/${name}`);

export const KL = {
  teal: "#93D7C6", // KytyPS5's own mark colour
  green: "#34C759",
  amber: "#F5A524",
  red: "#E5484D",
  vulkan: "#AC162C",
  ps5: "#0070D1",
  card: "#1A1A1D",
  card2: "#232327",
  line: "#3A3A3F",
  dim: "#8C8C8C",
  ink: "#FFFFFF",
};

/** board geometry, absolute stage px (1080x1920). The board fills y 530-1420 at full size. */
export const KB = {
  frame: { x: 50, y: 614, w: 980, h: 806 },
  card: { x: 90, y: 668, w: 230, h: 300 },
  outline: { x: 430, y: 646, w: 578, h: 372 },
  sockY: [722, 832, 942],
  headX: 482,
  cableY: [742, 818, 894],
  stack: { x: 90, y: 1112, w: 590, h: 98 },
  gpu: { x: 700, y: 1240, w: 310, h: 168 },
  /** the PC's monitor under the board, fed by the graphics card: the game really running while the calls are answered */
  pc: { x: 532, y: 1446, w: 448, h: 252 },
  /** where the board sits when it moves aside (top-left), as a scale around this origin */
  aside: { ox: 40, oy: 530, s: 0.4 },
};

/** real KytyPS5 captures (YouTube), cut, cropped clear of overlays, H.264 all-intra, muted (assets/kyty-clip-*.mp4) */
export const CLIPS = {
  launcher: { file: "kyty-clip-launcher.mp4", frames: 63, game: "Astro Bot", src: "YouTube · Christo Gevedjov · KytyPS5" },
  astro: { file: "kyty-clip-astro.mp4", frames: 768, game: "Astro Bot", src: "YouTube · Christo Gevedjov · KytyPS5" },
  gow: { file: "kyty-clip-gow.mp4", frames: 156, game: "God of War Sons of Sparta", src: "YouTube · Zatt · KytyPS5" },
  gta: { file: "kyty-clip-gta.mp4", frames: 210, game: "Grand Theft Auto V", src: "YouTube · KimiSha19 · KytyPS5" },
  sh2: { file: "kyty-clip-sh2.mp4", frames: 252, game: "Silent Hill 2", src: "YouTube · PSXTech · KytyPS5" },
  sh2title: { file: "kyty-clip-sh2-title.mp4", frames: 252, game: "", src: "" },
};
export type ClipId = keyof typeof CLIPS;

/** a real clip that starts playing at frame `at` (absolute), `skip` frames into the file */
export const KytyClip: React.FC<{ id: ClipId; at: number; skip?: number; w: number; h: number; style?: React.CSSProperties }> = ({ id, at, skip = 0, w, h, style }) => {
  const c = CLIPS[id];
  const sk = Math.max(0, Math.min(c.frames - 2, Math.round(skip)));
  return (
    <Sequence from={at} durationInFrames={c.frames - sk} layout="none">
      <OffthreadVideo src={kytyLiveAsset(c.file)} trimBefore={sk || undefined} muted style={{ position: "absolute", left: 0, top: 0, width: w, height: h, display: "block", ...style }} />
    </Sequence>
  );
};

/** the PC's monitor as an object with weight: bezel with a lit edge, glass glare, neck and foot, light spilling on the
 *  desk. `k` 0..1 grows the stand with the screen; `glow` is a maroon pulse when the graphics card feeds it */
export const PcMonitorFrame: React.FC<{ r: { x: number; y: number; w: number; h: number }; k?: number; glow?: number; lit?: number; children?: React.ReactNode }> = ({ r, k = 0, glow = 0, lit = 1, children }) => {
  const bez = 9 + 5 * k;
  return (
    <>
      <div style={{ position: "absolute", left: r.x - 40, top: r.y + r.h + bez + 10, width: r.w + 80, height: 70 * (1 + k), borderRadius: "50%", opacity: lit, background: "radial-gradient(ellipse at 50% 0%, rgba(140,180,255,0.16), transparent 70%)" }} />
      <div style={{ position: "absolute", left: r.x + r.w / 2 - 24 * (1 + k), top: r.y + r.h + bez, width: 48 * (1 + k), height: 26 * (1 + k), background: "linear-gradient(90deg, #232327, #3A3A40, #232327)" }} />
      <div style={{ position: "absolute", left: r.x + r.w / 2 - 110 * (1 + k), top: r.y + r.h + bez + 26 * (1 + k), width: 220 * (1 + k), height: 12, borderRadius: 6, background: "linear-gradient(#45454B, #1E1E22)", boxShadow: "0 10px 20px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: r.x - bez, top: r.y - bez, width: r.w + 2 * bez, height: r.h + 2 * bez, borderRadius: 14 + 8 * k, background: "linear-gradient(160deg, #3C3C42, #1C1C20 60%)", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 30px 80px rgba(0,0,0,0.65), 0 0 ${(70 * glow).toFixed(0)}px rgba(255,90,110,${(0.55 * glow).toFixed(2)})` }} />
      <div style={{ position: "absolute", left: r.x + r.w / 2 - 3, top: r.y + r.h + bez - 6, width: 6, height: 3, borderRadius: 2, background: lit > 0.5 ? "#7FD3FF" : "#E8A03A", opacity: 0.8 }} />
      <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 6, overflow: "hidden", background: "#060607" }}>
        <div style={{ position: "absolute", inset: 0, opacity: lit }}>{children}</div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 32%, transparent 33%)" }} />
      </div>
    </>
  );
};

export const SOCKETS = [
  { emoji: "💾", fn: "sceSaveDataMount3", nid: "ZP4e7rlzOUk" },
  { emoji: "🔊", fn: "sceAudioOutOutput", nid: "QOQtbeDqsT4" },
  { emoji: "🎮", fn: "scePadReadState", nid: "YndgXqQVV7c" },
];

/** the three shader cards, real RDNA 2 instructions; the front one is the one that gets translated */
export const RDNA = ["v_mul_f32 v0, s0, v1", "image_sample v[0:3], v4, s[8:15], s[16:19]", "exp mrt0 v0, v1, v2, v3 done"];
export const SPIRV = "%12 = OpFMul %float %10 %11";

/** cubic bezier point for cable i, t in 0..1 (card edge to socket head) */
export function kytyLiveCable(i: number, t: number): [number, number] {
  const x0 = KB.card.x + KB.card.w, y0 = KB.cableY[i];
  const x3 = KB.headX - 30, y3 = KB.sockY[i];
  const x1 = x0 + 60, y1 = y0, x2 = x3 - 50, y2 = y3;
  const u = 1 - t;
  return [
    u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
    u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
  ];
}
export const kytyLiveCablePath = (i: number) => {
  const x0 = KB.card.x + KB.card.w, y0 = KB.cableY[i];
  const x3 = KB.headX - 30, y3 = KB.sockY[i];
  return `M${x0},${y0} C${x0 + 60},${y0} ${x3 - 50},${y3} ${x3},${y3}`;
};

/** every word this scene moves on */
export function useKytyLiveT() {
  const { cue } = useScene();
  return {
    kyty: cue("KytyPS5"),
    play: cue("play"),
    launches: cue("launches"),
    asks: cue("asks"),
    ps5: cue("PS5"),
    kyty2: cue("KytyPS5", 2),
    answers: cue("answers"),
    copy: cue("copy"),
    func: cue("function"),
    shader: cue("shader"),
    translated: cue("translated"),
    fly: cue("fly"),
    vulkan: cue("Vulkan"),
    language: cue("language"),
    speaks: cue("speaks"),
    works: cue("works"),
    games: cue("games"),
    playable: cue("playable"),
    silent: cue("Silent"),
    six: cue("6"),
    bugs: cue("bugs"),
    crashes: cue("crashes"),
    uneven: cue("uneven"),
    reaching: cue("Reaching"),
    scene: cue("scene"),
    not: cue("not"),
    game3: cue("game", 3),
  };
}
export type KytyLiveTimes = ReturnType<typeof useKytyLiveT>;

/** KytyPS5's real org mark (the GitHub identicon of the KytyPS5 org), drawn bare from its 420 px grid */
export const KytyLiveMark: React.FC<{ size: number; color?: string }> = ({ size, color = KL.teal }) => (
  <svg width={size} height={size} viewBox="35 35 351 281" style={{ display: "block", flex: "none" }}>
    <path d="M175 35h71v70h140v211H35V105h140z" fill={color} />
  </svg>
);

export const KytyLiveVulkan: React.FC<{ size: number; white?: boolean }> = ({ size, white }) => (
  <Img
    src={kytyLiveAsset("kyty-vulkan.png")}
    style={{ width: size, height: size, objectFit: "contain", display: "block", flex: "none", filter: white ? "brightness(0) invert(1)" : undefined }}
  />
);

export const KytyLivePs5: React.FC<{ h: number }> = ({ h }) => (
  <Img src={kytyLiveAsset("kyty-ps5.svg")} style={{ height: h, width: "auto", display: "block", filter: "invert(1)" }} />
);

/** green check in a circle */
export const KytyLiveCheck: React.FC<{ size: number; p?: number }> = ({ size, p = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }}>
    <circle cx="20" cy="20" r="18" fill={KL.green} />
    <path d="M11 20.5l6 6 12-13" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

/** small grey source line under a proof */
export const KytyLiveSource: React.FC<{ text: string; style?: React.CSSProperties; gh?: boolean }> = ({ text, style, gh = true }) => {
  const { theme } = useScene();
  return (
    <div style={{ fontFamily: theme.font.ui, fontSize: 26, color: KL.dim, display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap", ...style }}>
      {gh && <svg width="24" height="24" viewBox="0 0 16 16"><path fill={KL.dim} d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0z" /></svg>}
      {text}
    </div>
  );
};
