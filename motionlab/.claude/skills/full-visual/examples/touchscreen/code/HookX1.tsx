// touchscreen hook, variant X1, "the double section": "Your phone screen reacts to the lightest brush of your finger
// and ignores a pen pressed as hard as you can." The iPhone is cut open edge-on, and so is everything that touches it.
// A sliced fingertip comes down: the gold charge tears off its crossings and whips up through the glass into the wet
// tissue, the pixels flare; lifted a hair it stays hooked, thin as pulled sugar; then the gold spreads up inside the
// finger. On "ignores" the view is thrown across the same section to a sliced Bic slamming down: the charge leans
// for two frames, finds plastic, brass and ink, and drops back level. It bows on "hard". Nothing gold moves.
// The world is "answer"'s (its section, hand and pen are imported unchanged, the cut faces are drawn over them), and
// the last frame is its first: keep = true. Parts: Kit (times, view, motion), Charge, Finger, Pen, Marks.
import React from "react";
import { useScene } from "../../../src/engine";
import { FINGER_ANGLE, Y, rnd, type PenVersusFingerT } from "./PenVersusFingerKit";
import { PenVersusFingerGlow, PenVersusFingerSection } from "./PenVersusFingerSection";
import { PenVersusFingerHand } from "./PenVersusFingerHand";
import { PenVersusFingerPen } from "./PenVersusFingerPen";
import { hookX1Camera, hookX1Flare, hookX1Lit, hookX1Open, hookX1Pen, hookX1Tip, useHookX1T } from "./HookX1Kit";
import { HookX1Filaments, HookX1Flare } from "./HookX1Charge";
import { HookX1Tissue } from "./HookX1Finger";
import { HookX1PenCut } from "./HookX1Pen";
import { HookX1Label, HookX1Tag } from "./HookX1Marks";

const RAD = (FINGER_ANGLE * Math.PI) / 180;
const LOW = [-3, 226]; // the lowest point of the leaned fingertip, from the hand's own origin (as in "answer")
const NEVER = 1e9;
// "answer"'s section reads its own words for the reading line and its flare: none of them has been said yet
const QUIET: PenVersusFingerT = { born: 0, so: NEVER, what: NEVER, actually: NEVER, feeling: NEVER, isnt: NEVER, really: NEVER, pressure: NEVER, its: NEVER, measuring: NEVER, electricity: NEVER, your: NEVER, body: NEVER, end: NEVER };

/** the same snow as "answer", frame for frame: far behind, out of focus, sliding a little with the view */
const HookX1Snow: React.FC<{ f: number; s: number }> = ({ f, s }) => (
  <g>
    {Array.from({ length: 64 }, (_, i) => {
      const depth = 0.4 + rnd(i) * 0.6;
      const x = (rnd(i + 100) * 1180 + Math.sin(f / (38 + i) + i) * 22 * depth - s * 60 * depth + 1180) % 1180 - 50;
      const y = (rnd(i + 200) * 2000 + f * (0.9 + 1.7 * depth)) % 2000 - 40;
      return <circle key={i} cx={x} cy={y} r={1.6 + 3.4 * depth} fill="#DCE8F5" opacity={0.1 + 0.22 * depth} />;
    })}
  </g>
);

export const HookX1: React.FC = () => {
  const { f, theme } = useScene();
  const T = useHookX1T();
  const cam = hookX1Camera(f, T);
  const tip = hookX1Tip(f, T);
  const pen = hookX1Pen(f, T);
  const flare = hookX1Flare(f, T);
  const lit = hookX1Lit(f, T);
  const open = hookX1Open(f, T);
  const hx = tip.x - LOW[0] - Math.cos(RAD) * tip.back;
  const hy = -tip.gap - LOW[1] - Math.sin(RAD) * tip.back;
  const penAt = `rotate(${pen.angle.toFixed(3)}) translate(${(pen.shake * 2.2).toFixed(2)} ${(-pen.lift * 3400).toFixed(1)})`;
  const labelsOut = T.and - 8;
  const top = cam.pt(0, 0)[1]; // the top face of the glass on screen: the labels stand above it
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="pvf-far"><feGaussianBlur stdDeviation="1.6" /></filter>
          <filter id="hx1-smear" filterUnits="userSpaceOnUse" x="-80" y="0" width="1240" height="1920">
            <feGaussianBlur stdDeviation={`${cam.smear.toFixed(2)} 0`} />
          </filter>
        </defs>
        <g filter="url(#pvf-far)"><HookX1Snow f={f} s={cam.s} /></g>
        <g filter={cam.smear ? "url(#hx1-smear)" : undefined}>
          <g transform={`translate(${cam.tx.toFixed(2)} ${cam.ty.toFixed(2)}) scale(${cam.s.toFixed(5)})`}>
            <PenVersusFingerGlow flare={flare} />
            <PenVersusFingerSection f={f} T={QUIET} flare={0} />
            <HookX1Flare f={f} T={T} x={tip.x} flare={flare} />
            <g transform={`translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${FINGER_ANGLE})`}>
              <PenVersusFingerHand f={f} run={0} lit={flare} />
              <HookX1Tissue f={f} open={open} spread={lit.spread} on={lit.on} lit={flare} />
            </g>
            <HookX1Filaments f={f} T={T} pad={tip} />
            {pen.show && (
              <>
                <PenVersusFingerPen angle={pen.angle} flex={pen.flex} shake={pen.shake} lift={pen.lift} />
                <g transform={penAt}><HookX1PenCut open={open} spin={pen.spin} f={f} /></g>
              </>
            )}
          </g>
        </g>
        <HookX1Label f={f} at={14} out={labelsOut} text="GLASS" to={cam.pt(-405, 24)} y={top - 84} font={theme.font.ui} />
        <HookX1Label f={f} at={T.reacts + 14} out={labelsOut} text="WIRES" to={cam.pt(-170, Y.col - 12)} y={top - 156} font={theme.font.ui} left />
        <HookX1Label f={f} at={T.lightest + 14} out={labelsOut} text="CHARGE" to={cam.pt(-76, 30)} y={top - 228} font={theme.font.ui} left />
        <HookX1Tag f={f} out={T.end - 9} text="Magnified illustration" font={theme.font.ui} />
      </svg>
      {/* the caption's band, as in "answer": the picture runs behind it, dimmed */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 660, background: "linear-gradient(180deg, rgba(16,16,16,0.9) 0%, rgba(16,16,16,0.8) 66%, rgba(16,16,16,0) 100%)" }} />
    </div>
  );
};
(HookX1 as unknown as { keep: boolean }).keep = true;
