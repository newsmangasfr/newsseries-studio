// One socket row of the board while KytyPS5 answers: the game's call by name and by code (its NID); when the ask is
// intercepted, the code rolls out and KytyPS5's own function rolls in, typed glyph by glyph, with the real source
// line it lives on (refs/kyty: libSaveData.cpp l.1297, libAudio.cpp l.131, libPad.cpp l.182). A teal ring bursts
// from the socket on the frame the ask is caught.
import React from "react";
import { blurIn, ease, mix, prog, useScene } from "../../../src/engine";
import { KB, KL, SOCKETS } from "./KytyLiveKit";

export const ANSWERS = [
  { fn: "SaveData::SaveDataMount3", src: "src/libs/libSaveData.cpp:1297" },
  { fn: "AudioOut::AudioOutOutput", src: "src/libs/libAudio.cpp:131" },
  { fn: "Controller::PadReadState", src: "src/libs/libPad.cpp:182" },
];

export const KytyLiveRow: React.FC<{ i: number; an: number; y: number }> = ({ i, an, y }) => {
  const { f, theme } = useScene();
  const s = SOCKETS[i];
  const a = ANSWERS[i];
  const roll = prog(f, an, 9, ease.out);
  const typed = Math.floor(prog(f, an + 2, 14, ease.linear) * a.fn.length);
  const ring = prog(f, an - 2, 20, ease.out);
  const x = KB.headX + 104;
  return (
    <>
      {f >= an - 2 && ring < 1 && (
        <div style={{ position: "absolute", left: KB.headX - 32 - 40 * ring, top: y - 32 - 40 * ring, width: 64 + 80 * ring, height: 64 + 80 * ring, borderRadius: "50%", border: `${(5 * (1 - ring)).toFixed(1)}px solid ${KL.teal}`, opacity: 1 - ring }} />
      )}
      <div style={{ position: "absolute", left: x, top: y - 48, fontFamily: theme.font.mono, whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 32, lineHeight: "40px", color: mix(f, an, 6, "#BDBDC2", "#9A9AA0") }}>{s.fn}</div>
        <div style={{ position: "relative", width: 420, height: 36, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: -36 * roll, fontSize: 30, lineHeight: "36px", color: KL.dim }}>{s.nid}</div>
          {f >= an && (
            <div style={{ position: "absolute", left: 0, top: 36 * (1 - roll), fontSize: 26, lineHeight: "36px", color: KL.teal, fontWeight: 600 }}>
              {a.fn.slice(0, Math.max(1, typed))}
              {typed < a.fn.length && <span style={{ opacity: 0.8 }}>▍</span>}
            </div>
          )}
        </div>
        {f >= an + 6 && (
          <div style={{ fontFamily: theme.font.mono, fontSize: 21, lineHeight: "24px", color: "#7C7C84", ...blurIn(f, an + 6, { dur: 6 }) }}>{a.src}</div>
        )}
      </div>
    </>
  );
};
