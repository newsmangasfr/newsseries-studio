// The one big move: the front shader card lifts out of the stack and opens into two lines. A read head runs along the
// PS5's RDNA 2 line glyph by glyph; under it the SPIR-V line is written glyph by glyph as the head passes (KytyPS5's
// recompiler, src/graphics/shader/recompiler, "SPIR-V emission"). On "fly" the card flips onto its Vulkan side and is
// stamped on "Vulkan"; it then travels into the graphics card, which lights up (KytyLiveBoard's Gpu).
import React from "react";
import { arriveEase, ease, prog, useScene } from "../../../src/engine";
import { KB, KL, RDNA, SPIRV, KytyLiveSource, KytyLiveVulkan, type KytyLiveTimes } from "./KytyLiveKit";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const GLYPHS = "%=OpFMulfloat0123_v";
const OPEN_H = 158;

export const KytyLiveShader: React.FC<{ T: KytyLiveTimes; dim: number }> = ({ T, dim }) => {
  const { f, theme, endsOn, cue } = useScene();
  const s = KB.stack;
  const slideAt = endsOn("speaks", 28);
  if (f >= slideAt + 28) return null;
  const home = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
  // lifted up over the dimmed board (the monitor holds the space under it), so the one big move reads on its own
  const top = { x: 540, y: 1000 };
  const gpu = { x: KB.gpu.x + 164, y: KB.gpu.y + 74 };
  const lift = prog(f, T.shader, 22, arriveEase(22));
  const slide = prog(f, slideAt, 28, ease.inOut);
  let cx = lerp(home.x, top.x, lift), cy = lerp(home.y, top.y, lift) - Math.sin(lift * Math.PI) * 60;
  let sc = lerp(1, 1.4, lift);
  if (slide > 0) {
    cx = lerp(top.x, gpu.x, slide);
    cy = lerp(top.y, gpu.y, slide) - Math.sin(slide * Math.PI) * 70;
    sc = lerp(1.4, 0.16, slide);
  }
  const h = lerp(s.h, OPEN_H, prog(f, T.shader + 8, 12, ease.out));
  // the translation: from "gets" to just after "fly"; the read head on the PS5 line, the write head on SPIR-V
  const t0 = cue("gets");
  const t1 = T.fly + 4;
  const p = prog(f, t0, Math.max(20, t1 - t0), ease.linear);
  const src = RDNA[0];
  const ri = Math.min(src.length, Math.floor(p * src.length));
  const wi = Math.min(SPIRV.length, Math.floor(p * SPIRV.length));
  const writing = f >= t0 && wi < SPIRV.length;
  const flick = writing ? GLYPHS[(f * 7 + wi) % GLYPHS.length] : "";
  // the flip, between "fly" and "Vulkan"
  const flip = prog(f, T.fly + 4, Math.max(10, T.vulkan - T.fly - 4), ease.inOut) * 180;
  const back = flip > 90;
  const stamp = prog(f, T.vulkan, 9, ease.outHard);
  const lifted = f >= T.shader;
  const fade = (1 - prog(f, slideAt + 20, 8, ease.linear)) * (lifted ? 1 : 1 - dim);
  const face: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: 14, overflow: "visible" };
  const CH = 16.8; // mono 28 px advance
  const mono = (size: number): React.CSSProperties => ({ fontFamily: theme.font.mono, fontSize: size, whiteSpace: "nowrap", position: "absolute", left: 22 });
  const srcOn = prog(f, t0, 8) * (1 - prog(f, slideAt, 8));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: cx - s.w / 2, top: cy - h / 2, width: s.w, height: h, opacity: fade,
          transform: `perspective(1600px) scale(${sc.toFixed(4)}) rotateX(${(back ? flip - 180 : flip).toFixed(2)}deg)`,
          filter: lifted && slide < 1 ? `drop-shadow(0 ${(30 * lift).toFixed(1)}px ${(40 * lift).toFixed(1)}px rgba(0,0,0,0.7))` : undefined,
        }}
      >
        <div style={{ ...face, background: KL.card2, border: `2px solid ${lifted ? "#6A6A72" : KL.line}`, opacity: back ? 0 : 1 }}>
          <div style={{ position: "absolute", left: 22, top: 8, fontFamily: theme.font.ui, fontWeight: 600, fontSize: 20, letterSpacing: 1, color: KL.dim }}>RDNA 2 · PS5 GPU</div>
          {/* the PS5 line: read glyph by glyph, what is read goes dim */}
          <div style={{ ...mono(lifted ? 28 : 32), top: lifted ? 38 : 40, color: KL.ink }}>
            <span style={{ color: f >= t0 ? "#6E6E76" : KL.ink }}>{src.slice(0, ri)}</span>
            {ri < src.length && <span style={{ background: f >= t0 ? "rgba(147,215,198,0.35)" : undefined, borderRadius: 3 }}>{src[ri]}</span>}
            {src.slice(ri + 1)}
          </div>
          {/* the SPIR-V line written under it as the head passes */}
          {f >= T.shader + 8 && (
            <>
              <div style={{ position: "absolute", left: 22, top: 80, fontFamily: theme.font.ui, fontWeight: 600, fontSize: 20, letterSpacing: 1, color: KL.teal, opacity: prog(f, T.shader + 10, 8) }}>SPIR-V</div>
              <div style={{ ...mono(28), top: 108, color: KL.teal }}>
                {SPIRV.slice(0, wi)}
                {writing && <span style={{ display: "inline-block", color: "#fff", transform: `translateY(${-8 * (1 - ((f - t0) % 3) / 3)}px)` }}>{flick}</span>}
              </div>
              {/* the read head and the write head, joined: one glyph in, one glyph out */}
              {writing && (
                <svg width={s.w} height={OPEN_H} style={{ position: "absolute", left: 0, top: 0 }}>
                  <line x1={22 + (ri + 0.5) * CH} y1={74} x2={22 + (wi + 0.5) * CH} y2={110} stroke={KL.teal} strokeWidth={2} opacity={0.8} />
                </svg>
              )}
            </>
          )}
        </div>
        <div style={{ ...face, background: KL.vulkan, border: "2px solid #D2425A", opacity: back ? 1 : 0, transform: "rotateX(0deg)" }}>
          <div style={{ position: "absolute", left: 22, top: 12, fontFamily: theme.font.ui, fontWeight: 600, fontSize: 20, letterSpacing: 1, color: "#FFD9DF" }}>SPIR-V · for Vulkan</div>
          <div style={{ ...mono(30), top: 58, color: "#fff" }}>{SPIRV}</div>
          <div style={{ ...mono(20), top: 112, color: "#FFB3BF", textDecoration: "line-through" }}>{src}</div>
          {f >= T.vulkan && (
            <div
              style={{
                position: "absolute", right: -46, top: -58, display: "flex", alignItems: "center", gap: 6, padding: "6px 14px 6px 8px",
                border: "4px solid #fff", borderRadius: 14, background: KL.vulkan,
                transform: `rotate(-10deg) scale(${(1.9 - 0.9 * stamp).toFixed(3)})`, opacity: Math.min(1, stamp * 3),
              }}
            >
              <KytyLiveVulkan size={46} white />
              <span style={{ fontFamily: theme.font.ui, fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: 0.5 }}>Vulkan</span>
            </div>
          )}
        </div>
      </div>
      {srcOn > 0 && slide <= 0 && (
        <KytyLiveSource text="KytyPS5 · src/graphics/shader/recompiler" style={{ position: "absolute", left: 0, width: 1080, justifyContent: "center", top: top.y + (OPEN_H * 1.4) / 2 + 24, opacity: srcOn }} />
      )}
    </div>
  );
};
