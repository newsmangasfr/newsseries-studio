// Hook C, "stop owning your games": a real PS5 game case (GTA V key art under the redrawn PS5 band) and its disc.
// The disc slides out toward the console's real disc slot, the slot seals, the disc bounces off the closed panel,
// and the case and the disc come apart into the cover's own pixels, blown off like dust.
import React from "react";
import { Img } from "remotion";
import { HookVCBase, HookVCPS_BLUE, HookVCRnd } from "./HookVCParts";

export const HookVCCaseArt = (n: string) => HookVCBase(`hookx3/${n}`);

/** a PS5 case face: the key art with the blue PS5 band across its top */
export const HookVCCaseFace: React.FC<{ src: string; w: number; band?: number }> = ({ src, w, band = 1 }) => {
  const h = w * 1.5, bh = w * 0.15;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, background: "#000", overflow: "hidden" }}>
      <Img src={HookVCCaseArt(src)} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: bh, background: HookVCPS_BLUE, display: "flex", alignItems: "center", paddingLeft: w * 0.07, transform: `scaleY(${band.toFixed(3)})`, transformOrigin: "top" }}>
        <Img src={HookVCBase("boot/ps5-wordmark.svg")} style={{ height: bh * 0.5, filter: "invert(1)" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.08) 100%)" }} />
    </div>
  );
};

const COLS = 9, ROWS = 14;

/** the case, whole until `at`, then torn into its own pixels from the right edge leftward */
export const HookVCCase: React.FC<{ f: number; src: string; cx: number; cy: number; w: number; rot: number; at: number; o?: number }> = ({ f, src, cx, cy, w, rot, at, o = 1 }) => {
  const h = w * 1.5;
  const tw = w / COLS, th = h / ROWS;
  const whole = f < at;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, transform: `rotate(${rot.toFixed(2)}deg)`, opacity: o }}>
      {whole ? (
        <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.03, overflow: "hidden", boxShadow: `0 ${w * 0.14}px ${w * 0.32}px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(255,255,255,0.1)` }}>
          <HookVCCaseFace src={src} w={w} />
        </div>
      ) : (
        Array.from({ length: COLS * ROWS }, (_, n) => {
          const c = n % COLS, r = Math.floor(n / COLS);
          const start = at + (COLS - 1 - c) * 2.2 + HookVCRnd(n, 1) * 7 + (r % 3);
          const t = Math.max(0, f - start);
          const k = Math.min(1, t / 26);
          if (k >= 1) return null;
          const dx = t * (2.6 + 4.5 * HookVCRnd(n, 2)) + t * t * 0.05;
          const dy = -t * (1.5 + 5 * HookVCRnd(n, 3)) - t * t * 0.08;
          const spin = t * (HookVCRnd(n, 4) - 0.5) * 9;
          const sc = 1 - 0.55 * k;
          return (
            <div key={n} style={{ position: "absolute", left: c * tw, top: r * th, width: tw + 0.6, height: th + 0.6, overflow: "hidden", opacity: 1 - k * k, transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${spin.toFixed(1)}deg) scale(${sc.toFixed(3)})`, filter: t > 2 ? `blur(${Math.min(5, t * 0.22).toFixed(1)}px)` : undefined }}>
              <div style={{ position: "absolute", left: -c * tw, top: -r * th, width: w, height: h }}>
                <HookVCCaseFace src={src} w={w} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

/** a Blu-ray: silver rim, the game's art printed on the label side, the clear hub */
export const HookVCDisc: React.FC<{ src: string; x: number; y: number; d: number; sx: number; spin: number; o?: number; blur?: number }> = ({ src, x, y, d, sx, spin, o = 1, blur = 0 }) => (
  <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, opacity: o, transform: `scaleX(${sx.toFixed(3)})`, filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", transform: `rotate(${spin.toFixed(1)}deg)`, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,0.7)", background: "conic-gradient(from 20deg, #D9DDE3, #8E96A3, #F4F6F8, #9AA3AF, #E2E6EA, #7F8794, #D9DDE3)" }}>
      <div style={{ position: "absolute", left: d * 0.04, top: d * 0.04, width: d * 0.92, height: d * 0.92, borderRadius: "50%", overflow: "hidden" }}>
        <Img src={HookVCCaseArt(src)} style={{ position: "absolute", left: 0, top: -d * 0.2, width: d * 0.92, height: d * 1.38, objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: d * 0.92, height: d * 0.16, background: HookVCPS_BLUE }} />
      </div>
      <div style={{ position: "absolute", left: d * 0.33, top: d * 0.33, width: d * 0.34, height: d * 0.34, borderRadius: "50%", background: "radial-gradient(circle, #101010 0 22%, rgba(200,210,220,0.85) 23% 60%, rgba(120,130,140,0.9) 61% 100%)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(130deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.25))", mixBlendMode: "screen" }} />
    </div>
  </div>
);
