// After "works": #810's three-mode table (shown on the monitor, KytyLiveMonitor), the GTA V report #810 clipping, and
// START to END. The monitor itself and its real clips live in KytyLiveMonitor.
import React from "react";
import { Travel, blurIn, blurOut, draw, ease, prog, useScene } from "../../../src/engine";
import { KL, KytyClip, KytyLiveSource, type KytyLiveTimes } from "./KytyLiveKit";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const GtaTable: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme } = useScene();
  const rows = [
    { mode: "Performance", res: "Starts and is playable … the game is pretty laggy.", tone: KL.amber },
    { mode: "Performance RT", res: "characters are drawn as black silhouettes", tone: KL.amber },
    { mode: "Fidelity", res: "Story mode does not load.", tone: KL.red },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", padding: "22px 26px", fontFamily: theme.font.ui, ...blurIn(f, T.uneven - 4, { dur: 7 }) }}>
      <div style={{ fontSize: 26, color: "#59636E", marginBottom: 14 }}>Grand Theft Auto V · #810</div>
      <div style={{ display: "flex", background: "#F6F8FA", border: "1px solid #D1D9E0", fontSize: 26, fontWeight: 600, color: "#1F2328" }}>
        <div style={{ width: 250, padding: "8px 14px", borderRight: "1px solid #D1D9E0" }}>Mode</div>
        <div style={{ padding: "8px 14px" }}>Result</div>
      </div>
      {rows.map((r, i) => {
        const at = T.uneven + i * 14;
        if (f < at) return <div key={i} style={{ height: 112 }} />;
        return (
          <div key={i} style={{ display: "flex", height: 112, borderLeft: "1px solid #D1D9E0", borderRight: "1px solid #D1D9E0", borderBottom: "1px solid #D1D9E0", ...blurIn(f, at, { dur: 7, rise: 16 }) }}>
            <div style={{ width: 250, padding: "0 14px", borderRight: "1px solid #D1D9E0", display: "flex", alignItems: "center", fontSize: 30, fontWeight: 700, color: "#1F2328" }}>{r.mode}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", background: `${r.tone}22` }}>
              <div style={{ width: 8, alignSelf: "stretch", margin: "14px 0", borderRadius: 4, background: r.tone }} />
              <div style={{ fontSize: 30, lineHeight: "36px", color: "#1F2328" }}>{r.res}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** "playable": the GTA V report, in the free space right of the small board */
export const KytyLiveReport: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme } = useScene();
  const sweep = prog(f, T.playable + 4, 12, ease.out);
  return (
    <Travel at={T.playable - 10} from="right" dist={240} dur={12} out={T.silent - 2} to="right" outDist={700} outDur={10} curve="measured" style={{ position: "absolute", left: 462, top: 548, width: 578 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "18px 22px", fontFamily: theme.font.ui, color: "#1F2328", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, color: "#59636E" }}>
          <svg width="26" height="26" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.6" fill="none" stroke="#1A7F37" strokeWidth="1.6" /><circle cx="8" cy="8" r="1.6" fill="#1A7F37" /></svg>
          KytyPS5 / KytyPS5 · #810
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, lineHeight: "40px", marginTop: 8 }}>[GAME STATUS]: Grand Theft Auto V</div>
        <div style={{ marginTop: 14, border: "1px solid #D1D9E0", display: "flex", fontSize: 30 }}>
          <div style={{ padding: "12px 14px", fontWeight: 700, borderRight: "1px solid #D1D9E0" }}>Performance</div>
          <div style={{ padding: "12px 14px", position: "relative" }}>
            <span style={{ position: "relative", zIndex: 1 }}>Starts and is playable.</span>
            <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: `calc(${sweep * 100}% - 16px)`, background: "rgba(52,199,89,0.28)", borderBottom: `3px solid ${KL.green}` }} />
          </div>
        </div>
      </div>
      <KytyLiveSource text="KytyPS5 · issue #810" style={{ marginTop: 10 }} />
    </Travel>
  );
};

/** "Reaching a scene is not finishing the game." */
export const KytyLiveProgress: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme, cue } = useScene();
  if (f < T.reaching || f >= T.game3 + 8) return null;
  const y = 1236, x0 = 150, x1 = 930, pin = x0 + 96;
  const st = f >= T.game3 - 1 ? blurOut(f, T.game3 - 1, { dur: 9 }) : {};
  const fin = cue("finishing");
  const arcP = prog(f, fin - 2, 14, ease.out);
  const drop = prog(f, T.scene - 4, 8, ease.out);
  const strike = prog(f, T.not, 9, ease.out);
  return (
    <div style={{ position: "absolute", inset: 0, ...st }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke="#4A4A50" strokeWidth={10} strokeLinecap="round" {...draw(f, T.reaching, 14)} />
        <line x1={x0} y1={y} x2={lerp(x0, pin, drop)} y2={y} stroke={KL.teal} strokeWidth={10} strokeLinecap="round" />
        {/* the rest of the game, chapter after chapter, still ahead */}
        {Array.from({ length: 8 }, (_, i) => {
          const x = pin + 70 + i * ((x1 - pin - 120) / 7);
          return <line key={i} x1={x} y1={y - 16} x2={x} y2={y + 16} stroke="#5A5A60" strokeWidth={4} strokeLinecap="round" opacity={prog(f, T.reaching + 4 + i * 2, 6)} />;
        })}
        <circle cx={x0} cy={y} r={14} fill={KL.teal} opacity={prog(f, T.reaching, 5)} />
        {/* END flag */}
        <g opacity={prog(f, T.reaching + 10, 6)}>
          <line x1={x1} y1={y} x2={x1} y2={y - 130} stroke="#C9C9CE" strokeWidth={6} />
          <path d={`M${x1} ${y - 130} h86 l-18 26 l18 26 h-86 z`} fill="#C9C9CE" />
        </g>
        {/* the rest of the game, still ahead of the pin: one long arc from the scene reached to the END */}
        {f >= fin - 2 && <path d={`M${pin} ${y - 24} Q ${(pin + x1) / 2} ${y - 230} ${x1 - 6} ${y - 24}`} fill="none" stroke="#C9C9CE" strokeWidth={5} strokeLinecap="round" {...draw(f, fin - 2, 14)} />}
        <line x1={x1 - 70} y1={y - 150} x2={x1 + 110} y2={y + 30} stroke={KL.red} strokeWidth={10} strokeLinecap="round" {...draw(f, T.not, 9)} />
        <line x1={x1 + 110} y1={y - 150} x2={x1 - 70} y2={y + 30} stroke={KL.red} strokeWidth={10} strokeLinecap="round" {...draw(f, T.not + 4, 9)} />
      </svg>
      <div style={{ position: "absolute", left: x0 - 60, top: y + 34, fontFamily: theme.font.ui, fontWeight: 700, fontSize: 34, color: KL.dim, ...blurIn(f, T.reaching, { dur: 6 }) }}>START</div>
      <div style={{ position: "absolute", left: x1 - 50, top: y + 34, fontFamily: theme.font.ui, fontWeight: 700, fontSize: 34, color: strike > 0 ? KL.red : KL.dim, ...blurIn(f, T.reaching + 10, { dur: 6 }) }}>END</div>
      {f >= fin - 2 && (
        <div style={{ position: "absolute", left: (pin + x1) / 2 - 170, width: 420, top: y - 200, textAlign: "center", fontFamily: theme.font.ui, fontWeight: 700, fontSize: 34, color: "#E6E6EA", opacity: arcP, transform: `translateY(${(1 - arcP) * 14}px)` }}>
          the rest of the game
        </div>
      )}
      {f >= T.scene - 4 && (
        <div style={{ position: "absolute", left: pin - 140, width: 280, top: y - 316 + (1 - drop) * -60, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, drop * 2) }}>
          {/* the first scene itself: Astro Bot's first level as it opens in KytyPS5 (the same real capture) */}
          <div style={{ position: "relative", width: 256, height: 144, borderRadius: 8, overflow: "hidden", background: "#000", boxShadow: `0 0 0 4px ${KL.teal}, 0 18px 40px rgba(0,0,0,0.6)`, marginBottom: 14 }}>
            <KytyClip id="astro" at={T.scene - 4} skip={24} w={256} h={144} style={{ objectFit: "cover" }} />
          </div>
          <div style={{ fontFamily: theme.font.ui, fontWeight: 700, fontSize: 32, color: KL.teal, whiteSpace: "nowrap" }}>first scene</div>
          <svg width="56" height="80" viewBox="0 0 28 40" style={{ marginTop: 8 }}>
            <path d="M14 39C14 39 2 22 2 14a12 12 0 0 1 24 0c0 8-12 25-12 25z" fill={KL.teal} />
            <circle cx="14" cy="14" r="5" fill="#101010" />
          </svg>
        </div>
      )}
    </div>
  );
};
