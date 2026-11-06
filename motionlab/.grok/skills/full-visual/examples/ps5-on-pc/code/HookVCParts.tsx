// Hook C's real material, shared with BootVC: the real PS5 photo cut into its seven real parts (two wings split in
// two, the black core in three, piece-*.png made from public/ps5-on-pc/hookx1/ps5-tower.png), the code those parts
// turn into (real KytyPS5 source, HookVCCode.ts), and the 84 real KytyPS5 contributor avatars (base reel, GitHub
// order). Everything is a pure function of the frame so the hook and boot draw the very same console.
import React from "react";
import { Img, staticFile } from "remotion";
import { HookVCCODE } from "./HookVCCode";

export const HookVCAsset = (n: string) => staticFile(`ps5-on-pc-hC/${n}`);
export const HookVCBase = (n: string) => staticFile(`ps5-on-pc/${n}`);
export const HookVCPS_BLUE = "#0070D1";
export const HookVCTEAL = "#93D7C6"; // KytyPS5's mark
export const HookVCORANGE = "#F7931E"; // AnyPS5's avatar

/** the photo's own pixel size; the pieces are full-canvas cut-outs of it */
export const HookVCSRC = { w: 550, h: 1826 };
/** the disc slot in the right wing, photo pixels */
export const HookVCSLOT = { x0: 407, x1: 440, y0: 1256, y1: 1826 };

export type HookVCPieceId = "wl-top" | "wl-bot" | "wr-top" | "wr-bot" | "core-top" | "core-mid" | "core-bot";
/** centroid (photo px) and where the explosion throws it (screen px at the hook's size, rotation, depth scale) */
export const HookVCPIECES: { id: HookVCPieceId; cx: number; cy: number; ex: number; ey: number; er: number; es: number }[] = [
  { id: "core-bot", cx: 269, cy: 1542, ex: -40, ey: 30, er: -6, es: 0.86 },
  { id: "core-mid", cx: 267, cy: 910, ex: 70, ey: -10, er: 8, es: 0.82 },
  { id: "core-top", cx: 271, cy: 374, ex: -60, ey: -30, er: -9, es: 0.86 },
  { id: "wl-bot", cx: 131, cy: 1444, ex: -270, ey: 40, er: 13, es: 1.08 },
  { id: "wr-bot", cx: 445, cy: 1444, ex: 270, ey: 20, er: -11, es: 1.1 },
  { id: "wl-top", cx: 82, cy: 417, ex: -250, ey: -10, er: -17, es: 1.06 },
  { id: "wr-top", cx: 457, cy: 604, ex: 250, ey: -20, er: 18, es: 1.08 },
];

export type HookVCPose = { cx: number; top: number; h: number };
export const HookVCScale = (p: HookVCPose) => p.h / HookVCSRC.h;
export const HookVCWidth = (p: HookVCPose) => HookVCSRC.w * HookVCScale(p);
/** a photo point in screen px */
export const HookVCPt = (p: HookVCPose, x: number, y: number) => {
  const s = HookVCScale(p);
  return { x: p.cx - (HookVCSRC.w * s) / 2 + x * s, y: p.top + y * s };
};

export type HookVCPieceState = { dx: number; dy: number; rot: number; sc: number; code: number };
export const HookVCRest: HookVCPieceState = { dx: 0, dy: 0, rot: 0, sc: 1, code: 0 };

/** a seeded random in [0, 1) */
export const HookVCRnd = (i: number, k = 0) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const KW = /^(static|return|const|auto|if|template|std|bool|int|uint32_t|uint64_t|int32_t|int64_t|size_t|char|void|struct|namespace)$/;

/** one line of C++, coloured the way GitHub's dark theme does */
const HookVCLine: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/("[^"]*"|[A-Za-z_][A-Za-z0-9_]*|\s+|[^A-Za-z_\s"]+)/).filter((t) => t.length > 0);
  return (
    <div style={{ whiteSpace: "pre", height: "1.32em" }}>
      {parts.map((t, i) => {
        const c = t.startsWith('"') ? "#A5D6FF" : KW.test(t) ? "#FF7B72" : /^[A-Z]/.test(t) ? "#D2A8FF" : /^[a-z_]+$/.test(t) && parts[i + 1]?.startsWith("(") ? "#79C0FF" : "#E6EDF3";
        return <span key={i} style={{ color: c }}>{t}</span>;
      })}
    </div>
  );
};

/** real KytyPS5 source, scrolling, masked to a photo-shaped cut-out (a piece or the whole console) */
export const HookVCCodeFill: React.FC<{ w: number; h: number; mask: string; scroll: number; size: number; glow?: number; o?: number }> = ({ w, h, mask, scroll, size, glow = 0, o = 1 }) => {
  if (o <= 0.001) return null;
  const lh = size * 1.32;
  const n = HookVCCODE.length;
  const first = Math.floor(scroll / lh);
  const rows = Math.ceil(h / lh) + 2;
  return (
    <div
      style={{
        position: "absolute", left: 0, top: 0, width: w, height: h, opacity: o, overflow: "hidden",
        WebkitMaskImage: `url(${mask})`, WebkitMaskSize: `${w}px ${h}px`, WebkitMaskRepeat: "no-repeat",
        background: `linear-gradient(180deg, rgba(13,17,23,0.92), rgba(9,22,40,0.92))`,
      }}
    >
      <div style={{ position: "absolute", left: 4, top: -(scroll % lh), fontFamily: "'JetBrains Mono', monospace", fontSize: size, lineHeight: `${lh}px`, letterSpacing: -0.2 }}>
        {Array.from({ length: rows }, (_, r) => (
          <HookVCLine key={r} text={HookVCCODE[(((first + r) % n) + n) % n]} />
        ))}
      </div>
      {glow > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(120,190,255,${(0.35 * glow).toFixed(3)})`, mixBlendMode: "screen" }} />}
    </div>
  );
};

/** the console: seven real pieces, each with its own transform, photo or code; a slot that can seal; a blue glow */
export const HookVCConsole: React.FC<{
  pose: HookVCPose; pieces?: Partial<Record<HookVCPieceId, HookVCPieceState>>; photo?: number; code?: number; scroll?: number;
  seal?: number; led?: number; codeGlow?: number; sweep?: number;
}> = ({ pose, pieces = {}, photo = 1, code = 0, scroll = 0, seal = 0, led = 0, codeGlow = 0, sweep = -1 }) => {
  const s = HookVCScale(pose);
  const W = HookVCSRC.w * s, H = pose.h;
  const left = pose.cx - W / 2;
  const codeSize = Math.max(8, 26 * s);
  return (
    <div style={{ position: "absolute", left, top: pose.top, width: W, height: H }}>
      {/* the whole console as code, under the translucent shell: "open source" */}
      <HookVCCodeFill w={W} h={H} mask={HookVCBase("hookx1/ps5-tower.png")} scroll={scroll} size={codeSize} glow={codeGlow} o={code} />
      {HookVCPIECES.map((p) => {
        const st = pieces[p.id] ?? HookVCRest;
        const core = p.id.startsWith("core");
        const blue = core && led > 0 ? `drop-shadow(0 0 ${(10 + 18 * led).toFixed(1)}px rgba(0,112,209,${(0.85 * led).toFixed(3)}))` : "";
        return (
          <div
            key={p.id}
            style={{
              position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: `${p.cx * s}px ${p.cy * s}px`,
              transform: `translate(${st.dx.toFixed(1)}px, ${st.dy.toFixed(1)}px) rotate(${st.rot.toFixed(2)}deg) scale(${st.sc.toFixed(4)})`,
              filter: blue || undefined,
            }}
          >
            {st.code < 1 && <Img src={HookVCAsset(`piece-${p.id}.png`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: photo * (1 - st.code) }} />}
            {st.code > 0 && <HookVCCodeFill w={W} h={H} mask={HookVCAsset(`piece-${p.id}.png`)} scroll={scroll + p.cy * 0.4} size={codeSize} glow={0.4} o={st.code} />}
            {p.id === "wr-bot" && seal > 0 && (
              // the slot heals from its top down: the white panel grows over it, one glint running ahead
              <div style={{ position: "absolute", left: (HookVCSLOT.x0 - 2) * s, top: HookVCSLOT.y0 * s, width: (HookVCSLOT.x1 - HookVCSLOT.x0 + 4) * s, height: (HookVCSLOT.y1 - HookVCSLOT.y0) * s * seal, opacity: photo * (1 - st.code), background: "linear-gradient(90deg, #B9B5BB 0%, #B3AFB6 55%, #A7A4AC 100%)", boxShadow: seal < 1 ? "0 6px 10px rgba(255,255,255,0.9)" : "none", borderRadius: 2 }} />
            )}
          </div>
        );
      })}
      {sweep >= 0 && sweep <= 1 && (
        // a key light sliding across the shell, inside its silhouette
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${HookVCBase("hookx1/ps5-tower.png")})`, WebkitMaskSize: `${W}px ${H}px`, background: `linear-gradient(105deg, transparent ${(sweep * 140 - 40).toFixed(1)}%, rgba(255,255,255,0.55) ${(sweep * 140 - 25).toFixed(1)}%, transparent ${(sweep * 140 - 10).toFixed(1)}%)`, mixBlendMode: "screen" }} />
      )}
    </div>
  );
};

/** the 84 contributors in GitHub order */
export const HookVCAV = Array.from({ length: 84 }, (_, i) => HookVCBase(`speeding-av-${String(i + 1).padStart(2, "0")}.jpg`));

/** the community's orbit around the console: three tilted rings, back half behind it, front half in front */
export function HookVCOrbit(i: number, f: number, pose: HookVCPose, k = 1) {
  const ring = i % 3;
  const n = 28;
  const slot = Math.floor(i / 3);
  const W = HookVCWidth(pose);
  const a = (slot / n) * Math.PI * 2 + ring * 0.7 + f * (0.011 + ring * 0.003) * (ring === 1 ? -1 : 1);
  const rx = W * (1.05 + 0.12 * ring) * k;
  const ry = W * 0.2 * k;
  const yc = pose.top + pose.h * (0.3 + 0.24 * ring);
  const z = Math.sin(a); // > 0: in front
  return { x: pose.cx + rx * Math.cos(a), y: yc + ry * z - 18 * Math.cos(a) * (ring - 1), z, s: 0.78 + 0.26 * z, o: 0.55 + 0.45 * Math.max(0, z) };
}

/** a contributor's avatar, a real GitHub face in a circle */
export const HookVCAvatar: React.FC<{ i: number; x: number; y: number; d: number; o?: number; blur?: number; ring?: string }> = ({ i, x, y, d, o = 1, blur = 0, ring }) => (
  <Img
    src={HookVCAV[i % 84]}
    style={{
      position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: "50%", opacity: o,
      boxShadow: `0 0 0 ${Math.max(1.5, d * 0.05).toFixed(1)}px ${ring ?? "rgba(255,255,255,0.85)"}, 0 ${(d * 0.15).toFixed(1)}px ${(d * 0.35).toFixed(1)}px rgba(0,0,0,0.6)`,
      filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : undefined,
    }}
  />
);
