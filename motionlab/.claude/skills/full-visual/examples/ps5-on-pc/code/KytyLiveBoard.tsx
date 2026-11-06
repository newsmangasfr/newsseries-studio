// The wiring board in state 2: KytyPS5 takes the console's place and answers the game's calls live.
// Everything here is drawn at full size in absolute stage px; KytyLive scales the whole board aside when a proof
// takes the stage. The front shader card is drawn by KytyLiveShader once it lifts out.
import React from "react";
import { Img } from "remotion";
import { blurIn, blurOut, draw, ease, mix, pop, prog, useScene } from "../../../src/engine";
import { KytyLiveRow } from "./KytyLiveRow";
import {
  KB, KL, RDNA, SOCKETS, KytyLiveCheck, KytyLiveMark, KytyLivePs5, kytyLiveAsset, kytyLiveCable, kytyLiveCablePath,
  type KytyLiveTimes,
} from "./KytyLiveKit";

/** when socket i's first ask leaves, when it is answered */
export const kytyLiveOut = (T: KytyLiveTimes, i: number) => (i === 0 ? T.asks : T.kyty2 + (i - 1) * 8);
export const kytyLiveAnswer = (T: KytyLiveTimes, i: number) => T.answers + i * 18;
const LEG = 34;
/** the SPIR-V the two back cards become (image_sample -> OpImageSampleImplicitLod, exp mrt0 -> OpStore to the output) */
const SPIRV_REST = ["", "%20 = OpImageSampleImplicitLod %v4float", "OpStore %out_color %22"];

const GameCard: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme } = useScene();
  const c = KB.card;
  const lit = prog(f, T.launches, 8);
  const boot = prog(f, T.launches + 4, 34, ease.inOut);
  return (
    <div style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: 18, background: KL.card, border: `2px solid ${KL.line}`, overflow: "hidden", boxShadow: lit > 0 ? `0 0 ${40 * lit}px rgba(0,112,209,${0.45 * lit})` : undefined }}>
      <div style={{ height: 62, background: KL.ps5, display: "flex", alignItems: "center", paddingLeft: 18, filter: `brightness(${1 + 0.35 * lit * (1 - boot * 0.6)})` }}>
        <KytyLivePs5 h={30} />
      </div>
      <div style={{ position: "absolute", top: 104, width: "100%", textAlign: "center", fontFamily: theme.font.mono, fontSize: 32, color: KL.ink }}>eboot.bin</div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 160, height: 10, borderRadius: 5, background: "#2c2c31", opacity: lit }}>
        <div style={{ width: `${boot * 100}%`, height: "100%", borderRadius: 5, background: KL.teal }} />
      </div>
      <div style={{ position: "absolute", left: 20, bottom: 18, display: "flex", alignItems: "center", gap: 8, fontFamily: theme.font.ui, fontWeight: 600, fontSize: 28, color: KL.green }}>
        <KytyLiveCheck size={30} /> CPU
      </div>
    </div>
  );
};

const Cables: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f } = useScene();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {SOCKETS.map((_, i) => {
        const an = kytyLiveAnswer(T, i);
        const col = mix(f, an, 6, "#4A4A50", KL.teal);
        return <path key={i} d={kytyLiveCablePath(i)} fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" />;
      })}
      {/* shader stack to graphics card */}
      <path d={`M${KB.stack.x + KB.stack.w},${KB.stack.y + 49} C${KB.stack.x + KB.stack.w + 50},${KB.stack.y + 49} ${KB.gpu.x - 50},${KB.gpu.y + 70} ${KB.gpu.x},${KB.gpu.y + 70}`} fill="none" stroke={mix(f, T.speaks, 6, "#4A4A50", KL.vulkan)} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
};

/** the asks travelling on the cables: first the three named asks, then a live loop of asks and answers */
const Packets: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f } = useScene();
  const out: React.ReactNode[] = [];
  SOCKETS.forEach((s, i) => {
    const o = kytyLiveOut(T, i);
    const an = kytyLiveAnswer(T, i);
    if (f >= o && f < an) {
      // it stops on the cable just short of the socket, so the socket's "?" stays readable while it waits
      const t = prog(f, o, LEG, ease.inOut) * 0.74 + prog(f, an - 6, 6, ease.in) * 0.26;
      const [x, y] = kytyLiveCable(i, t);
      const wait = f > o + LEG ? Math.sin((f - o - LEG) / 4) * 3 : 0;
      out.push(
        <div key={`a${i}`} style={{ position: "absolute", left: x - 26 + wait, top: y - 26, width: 52, height: 52, borderRadius: 14, background: "#2B2B30", border: "2px solid #6A6A70", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
          {s.emoji}
        </div>,
      );
    }
    if (f >= an && f < an + 22) {
      const [x, y] = kytyLiveCable(i, 1 - prog(f, an, 22, ease.inOut));
      out.push(<div key={`r${i}`} style={{ position: "absolute", left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: 13, background: KL.teal, boxShadow: `0 0 18px ${KL.teal}` }} />);
    }
    // the game keeps asking, KytyPS5 keeps answering: a live loop of small dots once the socket is answered
    const loop0 = an + 22;
    if (f >= loop0) {
      for (let k = 0; k < 2; k++) {
        const ph = ((f - loop0 + k * 23 + i * 11) % 46) / 46;
        const back = k === 1;
        const [x, y] = kytyLiveCable(i, back ? 1 - ph : ph);
        out.push(<div key={`l${i}${k}`} style={{ position: "absolute", left: x - 7, top: y - 7, width: 14, height: 14, borderRadius: 7, background: back ? KL.teal : "#C9C9CE", opacity: Math.min(1, (f - loop0) / 10) }} />);
      }
    }
  });
  return <>{out}</>;
};

const Console: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme, ground } = useScene();
  const o = KB.outline;
  const solid = prog(f, T.kyty + 6, 6, ease.linear);
  const stroke = mix(f, T.kyty + 6, 6, "#6B6B6B", KL.teal);
  // the mark falls onto the outline and slaps it: a short shake on impact
  const fall = prog(f, T.kyty - 3, 10, ease.in);
  const hit = f - (T.kyty + 7);
  const shake = hit > 0 && hit < 10 ? Math.sin(hit * 2.2) * (10 - hit) * 0.9 : 0;
  // KytyPS5 answers: the mark kicks on its name and on each answer it gives
  const kick = [T.kyty2, ...SOCKETS.map((_, i) => kytyLiveAnswer(T, i))].reduce((a, t) => {
    const d = f - t;
    return a + (d >= 0 && d < 10 ? Math.sin((d / 10) * Math.PI) * 0.1 : 0);
  }, 0);
  const markScale = 1.7 - 0.7 * fall + (hit > 0 && hit < 6 ? 0.06 * Math.sin((hit / 6) * Math.PI) : 0) + kick;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, transform: `translate(${shake * 0.5}px, ${Math.abs(shake) * 0.4}px)` }}>
        <rect x={o.x} y={o.y} width={o.w} height={o.h} rx={40} fill={`rgba(147,215,198,${0.07 * solid})`} stroke={stroke} strokeWidth={4} strokeDasharray={solid >= 1 ? undefined : `${14 + 40 * solid} ${12 * (1 - solid)}`} />
      </svg>
      <div style={{ position: "absolute", left: o.x + 28, top: o.y + o.h - 52, display: "flex", alignItems: "center", gap: 14, opacity: 0.35 * (1 - solid) }}>
        <KytyLivePs5 h={24} />
      </div>
      <div style={{ position: "absolute", left: o.x + o.w - 110, top: o.y + o.h + 8, fontFamily: theme.font.ui, fontSize: 26, color: KL.dim }}>on PC</div>
      {SOCKETS.map((s, i) => {
        const y = KB.sockY[i];
        const an = kytyLiveAnswer(T, i);
        const arrived = kytyLiveOut(T, i) + LEG;
        const ring = f > arrived && f < an ? 0.5 + 0.5 * Math.sin((f - arrived) / 5) : 0;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: KB.headX - 32, top: y - 32, width: 64, height: 64, borderRadius: 32, background: "#1E1E22", border: `3px solid ${f >= an ? KL.green : ring > 0 ? KL.amber : "#6B6B6B"}`, boxShadow: ring > 0 ? `0 0 ${18 * ring}px ${KL.amber}` : f >= an ? `0 0 ${24 * (1 - prog(f, an, 30))}px ${KL.green}` : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {f < an ? (
                <span style={{ fontFamily: theme.font.ui, fontWeight: 700, fontSize: 38, color: KL.amber }}>?</span>
              ) : (
                <div style={pop(f, an, { dur: 8, from: 0.3 })}><KytyLiveCheck size={52} p={prog(f, an + 2, 8)} /></div>
              )}
            </div>
            <div style={{ position: "absolute", left: KB.headX + 46, top: y - 24, fontSize: 40, lineHeight: "48px" }}>{s.emoji}</div>
            <KytyLiveRow i={i} an={an} y={y} />
          </React.Fragment>
        );
      })}
      {f >= T.kyty - 3 && (
        <div style={{ position: "absolute", left: o.x + o.w / 2 - 150, width: 300, top: o.y - 38 + (1 - fall) * -160, display: "flex", justifyContent: "center", transform: `scale(${markScale.toFixed(3)})`, opacity: prog(f, T.kyty - 3, 3, ease.linear) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 18px", background: ground.bg, borderRadius: 12 }}>
            <KytyLiveMark size={58} />
            <span style={{ fontFamily: theme.font.ui, fontWeight: 700, fontSize: 44, color: KL.teal }}>KytyPS5</span>
          </div>
        </div>
      )}
    </>
  );
};

/** the frame that wraps the whole board on "launches": KytyPS5 runs the game */
const Frame: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f } = useScene();
  if (f < T.launches) return null;
  const r = KB.frame;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={30} fill="none" stroke={KL.teal} strokeOpacity={0.6} strokeWidth={3} {...draw(f, T.launches, 18)} />
    </svg>
  );
};

/** back shader cards (the front one is KytyLiveShader's) */
const Stack: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme } = useScene();
  const s = KB.stack;
  return (
    <>
      {[2, 1].map((i) => {
        // "every shader": once the first card speaks Vulkan, the two behind it are rewritten too, one after the other
        const at = T.speaks + 6 + (2 - i) * 10;
        const sw = prog(f, at, 8, ease.out);
        return (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y - 44 * i, width: s.w, height: s.h, borderRadius: 14, background: mix(f, at, 8, i === 2 ? "#18181B" : "#1D1D21", i === 2 ? "#5E0E1A" : "#7A1222"), border: `2px solid ${mix(f, at, 8, KL.line, "#D2425A")}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 22, top: 8 - 30 * sw, fontFamily: theme.font.mono, fontSize: 22, color: "#8A8A92", whiteSpace: "nowrap", opacity: 1 - sw }}>{RDNA[i]}</div>
            <div style={{ position: "absolute", left: 22, top: 38 - 30 * sw, fontFamily: theme.font.mono, fontSize: 22, color: "#FFD9DF", whiteSpace: "nowrap", opacity: sw }}>{SPIRV_REST[i]}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: s.x, top: s.y + s.h + 14, fontFamily: theme.font.ui, fontSize: 26, color: KL.dim, opacity: 1 - prog(f, T.shader, 8) * 0.5 }}>PS5 GPU · RDNA 2</div>
    </>
  );
};

const Fan: React.FC<{ cx: number; cy: number; a: number }> = ({ cx, cy, a }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${a})`}>
    <circle r={56} fill="#141416" stroke="#3E3E44" strokeWidth={3} />
    {Array.from({ length: 9 }, (_, k) => (
      <path key={k} transform={`rotate(${k * 40})`} d="M0 -12 C 14 -24, 30 -34, 46 -26 C 34 -18, 20 -10, 8 -2 Z" fill="#2E2E33" />
    ))}
    <circle r={16} fill="#26262A" stroke="#44444A" strokeWidth={2} />
  </g>
);

const Gpu: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme } = useScene();
  const g = KB.gpu;
  const on = f >= T.speaks;
  const spin = on ? Math.pow(Math.min(1, (f - T.speaks) / 30), 2) * (f - T.speaks) * 16 : 0;
  const glow = prog(f, T.speaks, 12);
  // it lights up: a bloom under the card, then an LED strip along its edge that runs left to right
  const leds = prog(f, T.speaks + 2, 18, ease.out);
  const bloom = glow * (0.55 + 0.45 * (1 - prog(f, T.speaks + 4, 40, ease.out)));
  return (
    <>
      {glow > 0 && <div style={{ position: "absolute", left: g.x - 80, top: g.y - 70, width: g.w + 160, height: g.h + 140, borderRadius: "50%", background: `radial-gradient(ellipse at 50% 50%, rgba(255,70,95,${(0.42 * bloom).toFixed(3)}), transparent 68%)` }} />}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={g.x + 20} y={g.y + 8} width={g.w - 20} height={132} rx={16} fill="#232327" stroke={glow > 0 ? `rgba(172,22,44,${0.9 * glow})` : "#3A3A3F"} strokeWidth={3} />
        <rect x={g.x} y={g.y} width={18} height={g.h} rx={3} fill="#8A8A90" />
        <rect x={g.x + 80} y={g.y + 140} width={180} height={20} rx={2} fill="#C9A64A" />
        {Array.from({ length: 12 }, (_, k) => (
          <rect key={k} x={g.x + 36 + k * 22} y={g.y + 14} width={14} height={5} rx={2} fill={leds * 12 > k ? "#FF5A6E" : "#3A3A3F"} style={leds * 12 > k ? { filter: "drop-shadow(0 0 6px #FF5A6E)" } : undefined} />
        ))}
        <Fan cx={g.x + 104} cy={g.y + 74} a={spin} />
        <Fan cx={g.x + 224} cy={g.y + 74} a={spin * 1.1 + 20} />
      </svg>
      {f < T.speaks + 8 && (
        <div style={{ position: "absolute", left: g.x + 129, top: g.y + 39, width: 70, height: 70, borderRadius: 35, background: "#1E1E22", border: `3px solid ${KL.red}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.font.ui, fontWeight: 700, fontSize: 42, color: KL.red, ...(f >= T.speaks ? blurOut(f, T.speaks, { dur: 8 }) : {}) }}>?</div>
      )}
    </>
  );
};

export const KytyLiveBoard: React.FC<{ T: KytyLiveTimes }> = ({ T }) => (
  <>
    <Frame T={T} />
    <Cables T={T} />
    <GameCard T={T} />
    <Console T={T} />
    <Packets T={T} />
    <Stack T={T} />
    <Gpu T={T} />
  </>
);
