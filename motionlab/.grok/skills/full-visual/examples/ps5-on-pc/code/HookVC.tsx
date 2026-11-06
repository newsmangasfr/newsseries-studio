// Hook C, dark, 0-5.2 s: "Sony wants you to stop owning your games. So the community rebuilt the PS5 in open source."
// Sony: the real PS5 stands in a cold key light, its blue glow comes on. wants: a real PS5 game case slides in.
// stop: its disc slides out toward the console's real disc slot. owning: the slot seals shut, the disc bounces off
// the closed panel, and the case comes apart into its own pixels. games: the fact lands where the case was.
// So: the console blows apart into its seven real pieces. community: the 84 real KytyPS5 contributors swarm in and
// grab them. rebuilt: piece by piece they carry them home, each piece turning to code in flight and back to shell
// on landing. PS5: the last wing slams in, the glow returns, the community rings the console. open: the shell goes
// clear and the real KytyPS5 source runs inside. source: the code flares, its real file line lands.
// The console + its ring are boot's opening objects (keep = true): BootVC draws the same picture and moves it.
import React from "react";
import { arrive, blurIn, blurOut, ease, pop, prog, useScene } from "../../../src/engine";
import { HookVCCase, HookVCDisc } from "./HookVCCase";
import {
  HookVCAvatar, HookVCConsole, HookVCOrbit, HookVCPIECES, HookVCPt, HookVCRnd, HookVCRest, HookVCSLOT, HookVCScale,
  type HookVCPieceId, type HookVCPieceState, type HookVCPose,
} from "./HookVCParts";

export const HookVCPOSE: HookVCPose = { cx: 540, top: 578, h: 850 };
export const HookVCScroll = (f: number) => f * 1.5;
const CASE = { cx: 850, cy: 1000, w: 260, rot: -6 };

function useHookVCTimes() {
  const { cue, scene } = useScene();
  return {
    sony: cue("Sony"), wants: cue("wants"), stop: cue("stop"), owning: cue("owning"), your: cue("your"), games: cue("games"),
    so: cue("So"), community: cue("community"), rebuilt: cue("rebuilt"), ps5: cue("PS5"), open: cue("open"), source: cue("source"), end: scene.to,
  };
}
type T = ReturnType<typeof useHookVCTimes>;

/** when piece o leaves its exploded spot and when it lands; the last one lands on "PS5" */
const flight = (t: T, o: number) => ({ start: t.ps5 - 16 - (HookVCPIECES.length - 1 - o) * 4, dur: 16 });

/** where piece o hangs after the blast (before it is carried home) */
function exploded(t: T, o: number, f: number) {
  const p = HookVCPIECES[o];
  const k = prog(f, t.so, 14, ease.outHard);
  const hang = Math.max(0, f - t.so - 8);
  const sgn = o % 2 ? 1 : -1;
  return { dx: p.ex * k + sgn * hang * 0.5, dy: p.ey * k - hang * 0.25, rot: p.er * k + sgn * hang * 0.08, sc: 1 + (p.es - 1) * k };
}

function pieceAt(t: T, o: number, f: number): HookVCPieceState {
  if (f < t.so) return HookVCRest;
  const fl = flight(t, o);
  const home = prog(f, fl.start, fl.dur, ease.inOut);
  const code = prog(f, fl.start - 7, 7) * (1 - prog(f, fl.start + fl.dur - 2, 9));
  if (f < fl.start) return { ...exploded(t, o, f), code };
  const at = exploded(t, o, fl.start); // where it hung when it left
  return { dx: at.dx * (1 - home), dy: at.dy * (1 - home), rot: at.rot * (1 - home), sc: 1 + (at.sc - 1) * (1 - home), code };
}

/** a contributor: swarms in, holds its piece, rides it home, then joins the ring */
function avatarAt(t: T, i: number, f: number, pose: HookVCPose) {
  const o = i % HookVCPIECES.length;
  const p = HookVCPIECES[o];
  const st = pieceAt(t, o, f);
  const c = HookVCPt(pose, p.cx, p.cy);
  const a = HookVCRnd(i, 3) * Math.PI * 2;
  const r = (o > 2 ? 40 : 70) + 55 * HookVCRnd(i, 4);
  const hold = { x: c.x + st.dx + r * Math.cos(a), y: c.y + st.dy + r * Math.sin(a) * 1.7 };
  const from = { x: 540 + 1250 * Math.cos(HookVCRnd(i, 5) * Math.PI * 2), y: 1000 + 1250 * Math.sin(HookVCRnd(i, 5) * Math.PI * 2) };
  const inAt = t.community - 6 + (i % 28) * 0.75;
  const k = arrive(f, inAt, 18);
  const land = flight(t, o).start + 16 + (i % 5) * 2;
  const m = prog(f, land, 20, ease.inOut);
  const orb = HookVCOrbit(i, f, pose);
  const x = from.x + (hold.x - from.x) * k, y = from.y + (hold.y - from.y) * k;
  return { x: x + (orb.x - x) * m, y: y + (orb.y - y) * m, d: 50 - 6 * m + (orb.s - 1) * 40 * m, z: m > 0.5 ? orb.z : 1, o: f < inAt ? 0 : 1 - (1 - orb.o) * m, shown: f >= inAt };
}

const HookVCSwarm: React.FC<{ t: T; pose: HookVCPose; front: boolean }> = ({ t, pose, front }) => {
  const { f } = useScene();
  if (f < t.community - 6) return null;
  return (
    <>
      {Array.from({ length: 84 }, (_, i) => {
        const a = avatarAt(t, i, f, pose);
        if (!a.shown || (a.z > 0) !== front) return null;
        const b = avatarAt(t, i, f - 1, pose);
        const v = Math.hypot(a.x - b.x, a.y - b.y);
        return <HookVCAvatar key={i} i={i} x={a.x} y={a.y} d={a.d} o={a.o} blur={Math.min(7, v * 0.12)} />;
      })}
    </>
  );
};

/** the console comes apart: a white flash at the seams and shards thrown out */
const HookVCBlast: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const { f } = useScene();
  if (f < at || f > at + 30) return null;
  const t = f - at;
  return (
    <>
      <div style={{ position: "absolute", left: x - 420, top: y - 520, width: 840, height: 1040, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(190,220,255,0.55), rgba(47,139,255,0.15) 40%, transparent 70%)", opacity: Math.max(0, 1 - t / 14), mixBlendMode: "screen" }} />
      {Array.from({ length: 26 }, (_, i) => {
        const a = HookVCRnd(i, 9) * Math.PI * 2;
        const v = 14 + 22 * HookVCRnd(i, 10);
        const d = v * t * Math.exp(-t / 16);
        const w = 4 + 10 * HookVCRnd(i, 11);
        return <div key={i} style={{ position: "absolute", left: x + d * Math.cos(a), top: y + d * Math.sin(a) * 1.5, width: w, height: w * 0.4, background: i % 3 ? "#E9EBEE" : "#1A1C20", transform: `rotate(${(a * 57 + t * 20).toFixed(0)}deg)`, opacity: 1 - t / 30 }} />;
      })}
    </>
  );
};

export const HookVC: React.FC & { keep?: boolean } = () => {
  const { f, theme } = useScene();
  const t = useHookVCTimes();
  const pose = { ...HookVCPOSE, top: HookVCPOSE.top + 5 * Math.sin(f / 38) };
  const s = HookVCScale(pose);

  const pieces = {} as Record<HookVCPieceId, HookVCPieceState>;
  HookVCPIECES.forEach((p, o) => (pieces[p.id] = pieceAt(t, o, f)));
  const slam = (at: number) => (f < at ? 0 : Math.exp(-(f - at) / 10));
  const led = Math.max(prog(f, t.sony, 8) * (1 - prog(f, t.so, 4)), prog(f, t.ps5, 6)) * (0.8 + 0.2 * Math.sin(f / 9)) + 0.6 * slam(t.ps5);
  const open = prog(f, t.open - 2, 12, ease.inOut);
  const glow = 0.25 * open + 0.9 * slam(t.source);

  // the disc: out of the case on "stop", edge-on into the slot by "owning", knocked back as the slot seals
  const slot = HookVCPt(pose, (HookVCSLOT.x0 + HookVCSLOT.x1) / 2, 1500);
  const out = prog(f, t.stop - 4, t.owning - t.stop + 4, ease.inOut);
  const back = prog(f, t.owning + 1, 16, ease.outHard);
  const discX = CASE.cx + (slot.x + 30 - CASE.cx) * out + 120 * back;
  const discY = CASE.cy + (slot.y - CASE.cy) * out - 40 * Math.sin(Math.PI * back);
  const discSx = 1 - 0.86 * prog(f, t.stop + 8, t.owning - t.stop - 8, ease.in) + 0.5 * back;
  const discO = f < t.your + 2 ? 1 : 0;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* a cold key light pooled on the floor under the console */}
      <div style={{ position: "absolute", left: 540 - 520, top: 1330, width: 1040, height: 220, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(110,150,220,${(0.16 + 0.12 * led).toFixed(3)}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 540 - 420, top: 560, width: 840, height: 900, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,112,209,${(0.05 + 0.1 * led + 0.12 * open).toFixed(3)}), transparent 70%)` }} />

      <HookVCSwarm t={t} pose={pose} front={false} />

      {/* the disc travels behind the case, in front of the console */}
      <div style={blurIn(f, 0, { dur: 18, scaleFrom: 1.06 })}>
        <HookVCConsole pose={pose} pieces={pieces} photo={1 - 0.8 * open} code={open} scroll={HookVCScroll(f)} seal={prog(f, t.owning - 3, 11, ease.inOut)} led={led} codeGlow={glow} sweep={prog(f, t.sony - 6, 34, ease.inOut)} />
      </div>
      {f >= t.stop - 4 && f < t.your + 2 && (
        <HookVCDisc src="gta5.jpg" x={discX} y={discY} d={232} sx={discSx} spin={f * 9} o={discO} blur={back > 0 && back < 0.6 ? 4 : 0} />
      )}
      {f < t.so && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${((1 - arrive(f, t.wants - 6, 20)) * 560).toFixed(1)}px)`, filter: f < t.wants + 8 ? `blur(${((1 - arrive(f, t.wants - 6, 20)) * 14).toFixed(1)}px)` : undefined }}>
          <HookVCCase f={f} src="gta5.jpg" {...CASE} at={t.owning + 3} />
        </div>
      )}
      {f >= t.your && f < t.so + 10 && (
        <HookVCDisc src="gta5.jpg" x={discX} y={discY} d={232} sx={discSx} spin={f * 9} o={1 - prog(f, t.your, 14)} blur={prog(f, t.your, 14) * 10} />
      )}

      {/* the fact, where the case was */}
      {f >= t.games - 2 && f < t.so + 10 && (
        <div style={{ position: "absolute", left: 700, top: 930, width: 330, ...(f >= t.so ? blurOut(f, t.so, { dur: 8 }) : blurIn(f, t.games - 2, { dur: 9, rise: 24 })) }}>
          <div style={{ padding: "20px 26px", borderRadius: 16, background: "rgba(22,22,24,0.92)", boxShadow: "0 0 0 1.5px #2A2A2C, 0 24px 50px rgba(0,0,0,0.6)", fontFamily: theme.font.ui, color: "#fff" }}>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -0.6 }}>PS5 Pro, 2024</div>
            <div style={{ fontSize: 34, fontWeight: 500, color: "#C9CDD3", marginTop: 4 }}>no disc drive</div>
          </div>
        </div>
      )}

      <HookVCBlast at={t.so} x={540} y={pose.top + pose.h * 0.5} />
      <HookVCSwarm t={t} pose={pose} front={true} />

      {/* landing sparks: each piece clicks home with a white seam flash */}
      {HookVCPIECES.map((p, o) => {
        const land = flight(t, o).start + 16;
        if (f < land || f > land + 10) return null;
        const c = HookVCPt(pose, p.cx, p.cy);
        const r = 120 * s * 2.4;
        return <div key={p.id} style={{ position: "absolute", left: c.x - r, top: c.y - r * 1.6, width: 2 * r, height: 3.2 * r, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(220,235,255,0.6), transparent 65%)", opacity: 1 - (f - land) / 10, mixBlendMode: "screen" }} />;
      })}

      {/* the real file the code comes from */}
      {f >= t.source - 2 && (
        <div style={{ position: "absolute", left: 0, width: 1080, top: pose.top + pose.h + 14, display: "flex", justifyContent: "center" }}>
          <div style={{ ...pop(f, t.source - 2, { dur: 9, from: 0.8 }), fontFamily: theme.font.mono, fontSize: 28, color: "#9DB4D0", whiteSpace: "nowrap" }}>
            KytyPS5 / src/libs/libSaveData.cpp
          </div>
        </div>
      )}
    </div>
  );
};
HookVC.keep = true;
