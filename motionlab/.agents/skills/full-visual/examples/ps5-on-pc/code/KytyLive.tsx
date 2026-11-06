// "KytyPS5 fixes that while you play. ... Reaching a scene is not finishing the game."
// The wiring board born in `missing`, answered live: KytyPS5 slaps onto the empty console outline; on "play" the PC's
// monitor rises under the board and the game really runs on it (real KytyPS5 captures) while each ask is answered and
// its socket turns green; socket 3 opens on KytyPS5's real export-table line; the one big move (a shader card
// rewritten into SPIR-V, stamped Vulkan, slid into the graphics card, whose cable lights the monitor). On "works" the
// board moves aside and the monitor plays real captures: Astro Bot, God of War, GTA V beside report #810, Silent Hill 2
// with its own title bar at fps 6, the real crash line, #810's three modes, then START to END.
// Parts: KytyLiveKit (geometry, cues, clips), KytyLiveBoard, KytyLiveShader, KytyLiveMonitor, KytyLiveScreen.
import React from "react";
import { blurIn, ease, prog, useScene } from "../../../src/engine";
import { KB, KL, KytyLiveSource, useKytyLiveT, type KytyLiveTimes } from "./KytyLiveKit";
import { KytyLiveBoard } from "./KytyLiveBoard";
import { KytyLiveShader } from "./KytyLiveShader";
import { KytyLiveProgress, KytyLiveReport } from "./KytyLiveScreen";
import { KytyLiveLoupe, KytyLiveMonitor, KytyLiveUnder } from "./KytyLiveMonitor";
import { ANY_FAR, AnyBoard } from "./AnyConvert";

// src/libs/libPad.cpp lines 176-188, KytyPS5's real export table; row 6 is line 182
const ROWS = [
  'LIB_FUNC("rIZnR6eSpvk", Controller::PadResetOrientation);',
  'LIB_FUNC("vDLMoJLde8I", PadSetTiltCorrectionState);',
  'LIB_FUNC("gjP9-KQzoUk", Controller::PadGetControllerInformation);',
  'LIB_FUNC("fCWdlnmB1Ks", Controller::PadIsRemoteController);',
  'LIB_FUNC("hGbf2QTBmqc", PadGetExtControllerInformationStub);',
  'LIB_FUNC("2JgFB2n9oUM", Controller::PadSetTriggerEffect);',
  'LIB_FUNC("YndgXqQVV7c", Controller::PadReadState);',
  'LIB_FUNC("q1cHNfGycLI", Controller::PadRead);',
  'LIB_FUNC("yFVnOdGxvZY", Controller::PadSetVibration);',
  'LIB_FUNC("W2G-yoyMF5U", PadSetVibrationMode);',
];
const TARGET = 6;
const ROW_H = 54;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** "copy": socket 3 opens in place onto the line of KytyPS5's table that answers the code the game called */
const KytyLiveStrip: React.FC<{ T: KytyLiveTimes }> = ({ T }) => {
  const { f, theme, endsOn } = useScene();
  const openAt = T.copy - 4;
  const closeAt = T.shader - 14;
  if (f < openAt || f >= closeAt + 9) return null;
  const k = prog(f, openAt, 10, ease.out) * (1 - prog(f, closeAt, 9, ease.in));
  const from = { x: 448, y: KB.sockY[2] - 46, w: 560, h: 92 };
  const to = { x: 24, y: 876, w: 1032, h: 314 };
  const r = { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), w: lerp(from.w, to.w, k), h: lerp(from.h, to.h, k) };
  const scroll = prog(f, T.copy + 2, 18, ease.outHard);
  const pos = lerp(1, TARGET, scroll); // row index centred in the window
  const matched = f >= T.copy + 18;
  const fnSweep = prog(f, endsOn("function", 10), 10, ease.out);
  const inner = Math.min(1, Math.max(0, (k - 0.55) / 0.45));
  return (
    <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 18, background: "#141417", border: `3px solid ${KL.teal}`, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
      <div style={{ position: "absolute", left: 24, right: 24, top: 16, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: inner }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: theme.font.ui, fontSize: 28, color: KL.dim }}>
          🎮 the game asks for
          <span style={{ fontFamily: theme.font.mono, fontSize: 32, color: matched ? "#101010" : KL.ink, background: matched ? KL.teal : "#2A2A2F", padding: "2px 12px", borderRadius: 8, boxShadow: matched ? `0 0 ${24 * (1 - prog(f, T.copy + 18, 24))}px ${KL.teal}` : undefined }}>YndgXqQVV7c</span>
        </div>
        <KytyLiveSource text="src/libs/libPad.cpp" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 80, height: ROW_H * 3, overflow: "hidden", opacity: inner, WebkitMaskImage: "linear-gradient(90deg, #000 93%, transparent 100%)", maskImage: "linear-gradient(90deg, #000 93%, transparent 100%)" }}>
        {ROWS.map((row, i) => {
          const y = (i - pos + 1) * ROW_H;
          if (y < -ROW_H || y > ROW_H * 3) return null;
          const isT = i === TARGET;
          const parts = row.match(/^(LIB_FUNC\(")([^"]+)(", )([^)]+)(\);)$/)!;
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: ROW_H, display: "flex", alignItems: "center", paddingLeft: 24, fontFamily: theme.font.mono, fontSize: 32, whiteSpace: "nowrap", color: isT && matched ? KL.ink : "#77777E", background: isT && matched ? "rgba(147,215,198,0.10)" : undefined }}>
              <span>{parts[1]}</span>
              <span style={{ color: isT && matched ? "#101010" : "#A5D6A7", background: isT && matched ? KL.teal : undefined, borderRadius: 4 }}>{parts[2]}</span>
              <span>{parts[3]}</span>
              <span style={{ position: "relative", color: isT && matched ? KL.ink : undefined }}>
                {isT && <span style={{ position: "absolute", left: -4, top: -2, bottom: -2, width: `calc(${fnSweep * 100}% + 8px)`, border: fnSweep > 0 ? `3px solid ${KL.teal}` : undefined, borderRadius: 6, background: "rgba(147,215,198,0.16)" }} />}
                <span style={{ position: "relative" }}>{parts[4]}</span>
              </span>
              <span>{parts[5]}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 24, bottom: 14, fontFamily: theme.font.ui, fontSize: 26, color: KL.teal, opacity: prog(f, endsOn("function", 4), 6) * inner }}>
        KytyPS5's own copy of the function
      </div>
    </div>
  );
};

export const KytyLive: React.FC = () => {
  const { f, scene } = useScene();
  const T = useKytyLiveT();
  const back = T.game3 - 6;
  const aside = prog(f, T.works, 24, ease.inOut) * (1 - prog(f, back, 26, ease.inOut));
  const focusDim = Math.max(prog(f, T.copy - 4, 8) * (1 - prog(f, T.shader - 14, 8)) * 0.35, prog(f, T.shader, 10) * (1 - prog(f, T.speaks - 6, 12)) * 0.75);
  const s = 1 - (1 - KB.aside.s) * aside;
  // the handover: while the board waits aside, small and dim ("Reaching"), it settles into the exact board `anyps5`
  // opens on (AnyConvert's own AnyBoard, every word still ahead); on "game." it comes back as that board, so the
  // scene change is the same picture on both sides (KytyLive.keep: no lift-off)
  const swap = prog(f, T.reaching, 14, ease.inOut);
  return (
    <>
      <div
        style={{
          position: "absolute", inset: 0, transformOrigin: `${KB.aside.ox}px ${KB.aside.oy}px`,
          transform: `scale(${s.toFixed(4)})`, opacity: (1 - 0.55 * aside) * (1 - focusDim),
          ...(f < scene.from + 2 ? blurIn(f, scene.from - 6, { dur: 7 }) : {}),
        }}
      >
        {swap < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
            <KytyLiveBoard T={T} />
          </div>
        )}
        {swap > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: swap }}>
            <AnyBoard t={ANY_FAR} />
          </div>
        )}
      </div>
      <KytyLiveShader T={T} dim={focusDim} />
      <KytyLiveStrip T={T} />
      <KytyLiveMonitor T={T} />
      <KytyLiveUnder T={T} />
      <KytyLiveReport T={T} />
      <KytyLiveLoupe T={T} />
      <KytyLiveProgress T={T} />
    </>
  );
};
// hands over in place: its last frame is AnyConvert's first (the engine's `keep`, a per-scene flag, no engine change)
(KytyLive as unknown as { keep: boolean }).keep = true;
