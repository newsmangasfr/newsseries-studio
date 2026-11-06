// Hook X1, dark, 0 to 5.8 s: "Every key on your iPhone keyboard is smaller than your thumb and you still hit the
// right letter almost every time."
// THE SECTION. Frame 0 is the iPhone already sliced through its top letter row and seen side on at MACRO: the glass
// as a thick lit slab, the caps q w e r t under it with their letters on the cut, and under them the touch zones,
// amber, tiled with no gap, the E's already swollen. The real thumb is already falling. By "key" it has touched
// between the W and the E, its "+" has dropped through the glass into the E's zone, the zone has flashed, the E cap
// has lit and the letter balloon is up: the whole mechanism, once, before "iPhone". Then the label, the row sliding
// past, the cap's bracket copied under the pad, and on "thumb" the one big move: the pad comes down with all its
// weight, flattens and spreads to more than twice a cap, the glass gives a hair, dust lifts. On "and you still hit"
// the section hinges up 90 degrees, same world, same keys, and we are face on: three taps, none on its key, each
// caught by a cell that was already bigger. It ends on the SLAB, amber out, the thumb down over the E: the frame
// "answer" starts on, which is why the hook is not lifted off (the engine's lift is undone below).
// Parts: Kit (cues, camera, the thumb's weight and shape), Section (the cut face), Thumb (side on), Board (the
// keyboard, face), Hand (the thumb from above), Marks (brackets, label, balloon, dust, lights, tags).
import React from "react";
import { leaveEase, prog, useScene } from "../../../src/engine";
import { SHEET } from "./KbSheetSplitKit";
import { HookX1Board } from "./HookX1Board";
import { HookX1Hand } from "./HookX1Hand";
import { HookX1CUT, HookX1EX, HookX1K as K, HookX1TAP, hookX1Cam, hookX1Sag, hookX1Thumb, hookX1ThumbShape, hookX1X, useHookX1T } from "./HookX1Kit";
import { HookX1Backdrop, HookX1Brackets, HookX1Dust, HookX1Label, HookX1SideBalloon, HookX1Tags } from "./HookX1Marks";
import { HookX1Section, hookX1Flash } from "./HookX1Section";
import { HookX1Thumb, HookX1ThumbShadow } from "./HookX1Thumb";

const VB = { x: -1700, y: -1100, w: 2400, h: 1800 }; // the cut plane's svg, in px from the hinge under the E

export const HookX1: React.FC = () => {
  const { f, ground } = useScene();
  const T = useHookX1T();
  if (f >= T.to) return null;
  const cam = hookX1Cam(f, T);
  const th = hookX1Thumb(f, T);
  const sag = hookX1Sag(f, T, th.pen);
  const shape = hookX1ThumbShape(th.a, th.z);
  const cx = hookX1X(HookX1TAP) + th.dx;
  const flash = hookX1Flash(f, T);
  const sideLit = prog(f, T.key, 3) * (1 - prog(f, T.lift, 6));
  const xray = (0.8 + 0.2 * cam.k) * (1 - prog(f, T.dark, 14));
  const lift = 2000 * prog(f, T.to - 7, 11, leaveEase(11)); // undo the engine's lift-off: "answer" takes this frame over
  const p = f - T.press;
  const kick = p < 0 ? 0 : 8 * Math.exp(-p / 5) * Math.sin(p / 1.7);
  const smear = Math.min(40, Math.abs(cam.vx) * 0.4);
  const south = (SHEET.h - HookX1CUT) * K;
  const veil = 1 - cam.k2;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${lift.toFixed(1)}px)` }}>
      <HookX1Backdrop f={f} shift={cam.ex} o={(1 - 0.5 * cam.k) * veil} />
      {smear > 0.6 && (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <filter id="hx1-smear" x="-10%" y="-5%" width="120%" height="110%"><feGaussianBlur stdDeviation={`${smear.toFixed(2)} 0`} /></filter>
        </svg>
      )}
      <div style={{ position: "absolute", inset: 0, perspective: 2600, perspectiveOrigin: `${cam.ex.toFixed(2)}px ${cam.hy.toFixed(2)}px`, transform: `translateY(${kick.toFixed(2)}px)` }}>
        <div style={{ position: "absolute", left: cam.ex, top: cam.hy, width: 0, height: 0, transformStyle: "preserve-3d", transform: `scale3d(${cam.g.toFixed(5)}, ${cam.g.toFixed(5)}, ${cam.g.toFixed(5)}) rotateX(${(-cam.phi).toFixed(3)}deg)` }}>
          {/* the keyboard: it lies behind the cut, and what was cut away comes back as the section turns */}
          <div
            style={{
              position: "absolute", left: -HookX1EX * K, top: -HookX1CUT * K, width: SHEET.w * K, height: SHEET.h * K, transformOrigin: `0px ${HookX1CUT * K}px`, transform: "rotateX(90deg)",
              clipPath: `inset(-40px -80px ${(south * (1 - cam.open) - 90 * cam.open).toFixed(1)}px -80px)`,
            }}
          >
            <HookX1Board f={f} T={T} xray={xray} sideLit={sideLit} caught={flash} />
          </div>
          {/* the cut face, and everything that happens in its plane */}
          {cam.phi < 88 && (
            <svg width={VB.w} height={VB.h} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} style={{ position: "absolute", left: VB.x, top: VB.y, overflow: "visible", filter: smear > 0.6 ? "url(#hx1-smear)" : undefined }}>
              <HookX1Section f={f} T={T} lit={sideLit} sag={sag} cx={cx + (shape.L + shape.R) / 2} load={Math.min(1, th.pen / 85)} />
              {f < T.lift + 16 && (
                <>
                  <HookX1ThumbShadow cx={cx} cy={sag} s={shape} gap={th.gap} />
                  <HookX1Thumb cx={cx} cy={sag} s={shape} pen={th.pen} warm={Math.min(1, 0.25 + flash + th.pen / 130)} />
                </>
              )}
              <HookX1Brackets f={f} T={T} s={shape} cx={cx} cy={sag} />
              <HookX1Label f={f} T={T} />
              <HookX1SideBalloon f={f} T={T} />
              <HookX1Dust f={f} T={T} cx={cx} s={shape} />
            </svg>
          )}
        </div>
      </div>
      <HookX1Hand f={f} T={T} cam={cam} />
      {/* the caption's band stays the caption's, and the section falls off into the ground before Instagram's zone */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 620, opacity: veil, background: "linear-gradient(180deg, rgba(16,16,16,0.94) 0px, rgba(16,16,16,0.88) 430px, rgba(16,16,16,0) 620px)" }} />
      <div style={{ position: "absolute", left: 0, top: 1450, width: 1080, height: 470, opacity: veil, background: "linear-gradient(180deg, rgba(16,16,16,0) 0px, #101010 120px)" }} />
      <HookX1Tags f={f} T={T} dim={ground.dim} />
    </div>
  );
};
