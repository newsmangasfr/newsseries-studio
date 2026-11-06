// touchscreen "grid": the way in. The phone "winter" leaves in the glove (same parts, same call still ringing) is
// dived at; the thumb and the fingers that were nearer than the glass fly out past the edges; on "glass" the cover
// glass lifts off toward us as one thick slab with the two melted flakes still on it, and on "phone" it comes on past
// the lens and out of the picture (the next scene brings it back down from there). Under it: the bare screen,
// dimmed on "see,", and, once we are down at one crossing, the screen's own sub-pixels.
import React from "react";
import { ease, prog } from "../../../src/engine";
import { AX, AY, PHONE, winterCallGlove } from "./WinterCallKit";
import { WinterCallPhone } from "./WinterCallPhone";
import { WinterCallGrip, WinterCallPalm, WinterCallRightHand } from "./WinterCallHands";
import { WinterCallOnGlass } from "./WinterCallWeather";
import { HERO, SCR, type WireGridT, type WireGridView, clamp } from "./WireGridKit";

/** the two beads of melted snow, in screen units from the middle of the glass (where "winter" let them land) */
const BEADS: [number, number, number][] = [[296 - HERO.x, 352 - HERO.y, 12.6], [158 - HERO.x, 566 - HERO.y, 10.2]];

export const WireGridDiveDefs: React.FC = () => (
  <defs>
    <radialGradient id="wg-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#DCCBC0" stopOpacity="0.42" />
      <stop offset="0.5" stopColor="#A8958C" stopOpacity="0.13" />
      <stop offset="1" stopColor="#A8958C" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="wg-slab-bevel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.62" />
      <stop offset="0.3" stopColor="#B9CACE" stopOpacity="0.2" />
      <stop offset="0.62" stopColor="#1A2226" stopOpacity="0.34" />
      <stop offset="1" stopColor="#DCE8EC" stopOpacity="0.46" />
    </linearGradient>
    <linearGradient id="wg-slab-face" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
      <stop offset="0.5" stopColor="#C8D6DC" stopOpacity="0.05" />
      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.11" />
    </linearGradient>
    <pattern id="wg-px" width={0.8} height={0.8} patternUnits="userSpaceOnUse">
      <circle cx={0.2} cy={0.2} r={0.09} fill="#3C8C4A" />
      <circle cx={0.6} cy={0.6} r={0.09} fill="#3C8C4A" />
      <rect x={0.47} y={0.07} width={0.26} height={0.26} rx={0.07} fill="#A8463C" />
      <rect x={0.05} y={0.45} width={0.3} height={0.3} rx={0.08} fill="#46589E" />
    </pattern>
  </defs>
);

/** the phone in the glove, the call ringing, and the screen going down to 15 % on "see," */
export const WireGridPhone: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  if (V.s > 5) return null;
  const dim = 0.85 * prog(f, T.see, 9, ease.inOut);
  return (
    <g transform={V.matrix()} opacity={1 - clamp((V.s - 3.4) / 1.6)}>
      <g transform={`translate(${-SCR.x} ${-SCR.y})`}>
        {V.s < 2 && <ellipse cx={SCR.x + HERO.x} cy={SCR.y + HERO.y} rx={760} ry={1000} fill="url(#wg-glow)" />}
        {V.s < 2.05 && <WinterCallPalm f={f} lit={1} />}
        <g transform={`translate(${PHONE.x} ${PHONE.y})`}>
          <WinterCallPhone f={f} T={T.winter} lit={1}>
            {f < T.glass && <WinterCallOnGlass f={f} T={T.winter} lit={1} />}
          </WinterCallPhone>
        </g>
      </g>
      {dim > 0 && <rect x={0} y={0} width={SCR.w} height={SCR.h} rx={SCR.r} fill="#050608" opacity={dim} />}
    </g>
  );
};

/** what the screen is made of, once we are close enough to see it: red, green and blue sub-pixels, lit low */
export const WireGridPixels: React.FC<{ f: number; V: WireGridView }> = ({ f, V }) => {
  const k = clamp((V.s - 3) / 2);
  if (k <= 0) return null;
  const near = clamp((V.s - 6) / 8);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#110F0E" opacity={k} />
      {near > 0 && (
        <g transform={V.matrix()} opacity={near * (0.78 + 0.05 * Math.sin(f / 6))}>
          <rect x={HERO.x - 60} y={HERO.y - 90} width={120} height={180} fill="url(#wg-px)" />
        </g>
      )}
    </g>
  );
};

/** the left hand's grip and the right thumb: nearer than the glass, so the dive throws them out past the edges */
export const WireGridFrontHands: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  const sz = Math.pow(V.s, 2.9);
  if (sz > 3.8) return null;
  const last = winterCallGlove(T.winter.end - 1, T.winter);
  const away = prog(f, T.under - 3, 18, ease.in);
  const blur = clamp((sz - 1) / 2.8) * 14;
  return (
    <g transform={V.matrix(sz)} opacity={1 - clamp((sz - 1.5) / 2)} style={{ filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
      <g transform={`translate(${-SCR.x} ${-SCR.y})`}>
        <WinterCallGrip f={f} lit={1 - 0.5 * clamp(sz - 1)} />
        {last && away < 1 && (
          <WinterCallRightHand f={f} gloved lit={1}
            pose={{ ...last, x: last.x + AX * 900 * away, y: last.y + AY * 900 * away, h: Math.min(1, last.h + 3 * away), press: last.press * (1 - away), hard: 0, rot: last.rot + 8 * away }} />
        )}
      </g>
    </g>
  );
};

/** a bead of melted snow on the glass: a small lens with one highlight */
const Bead: React.FC<{ x: number; y: number; r: number; flat: number }> = ({ x, y, r, flat }) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1 ${flat.toFixed(3)})`}>
    <ellipse cx={r * 0.12} cy={r * 0.2} rx={r} ry={r * 0.9} fill="#000000" opacity={0.32} />
    <ellipse cx={0} cy={0} rx={r} ry={r * 0.88} fill="#0B0E13" fillOpacity={0.4} stroke="#EAF2FB" strokeOpacity={0.3} strokeWidth={1.2} />
    <ellipse cx={r * 0.2} cy={r * 0.28} rx={r * 0.6} ry={r * 0.42} fill="#DCE6F2" opacity={0.3} />
    <ellipse cx={-r * 0.36} cy={-r * 0.38} rx={r * 0.26} ry={r * 0.13} fill="#FFFFFF" opacity={0.9} transform="rotate(-30)" />
  </g>
);

/** the cover glass: lifted off on "glass" as one thick clear slab, bevel catching the light, the two beads still on
 *  it; on "phone" it keeps coming, past the lens, and is gone. It never parks in the picture (edge-on it was a grey
 *  bar across the wires and across the numbers). */
export const WireGridSlab: React.FC<{ f: number; T: WireGridT; V: WireGridView }> = ({ f, T, V }) => {
  if (f < T.glass - 1) return null;
  const up = prog(f, T.glass - 1, 15, ease.out);
  const fly = prog(f, T.phone - 3, 21, ease.in);
  if (fly >= 1) return null;
  const [cx, cy0] = V.pt(HERO.x, HERO.y);
  const grow = 1 + 0.2 * up + 2.6 * fly;
  const w = PHONE.w * V.s * grow;
  const h = (w * PHONE.h) / PHONE.w;
  const cy = cy0 - 26 * up - 70 * fly;
  const rx = (PHONE.r / PHONE.w) * w;
  const top = cy - h / 2;
  const unit = w / PHONE.w; // frame pixels a screen unit covers on the slab
  const glint = ((f * 9) % 1700) - 420 + 900 * fly;
  const bevel = 20 * up * (1 + 1.6 * fly); // the ground edge of the glass, seen from above
  const soft = 9 * fly; // nearer than the lens can hold
  return (
    <g opacity={1 - fly * fly} style={{ filter: soft > 0.5 ? `blur(${soft.toFixed(1)}px)` : undefined }}>
      {/* its shadow, left on the phone while it hangs over it */}
      <rect x={cx - (PHONE.w * V.s) / 2} y={cy0 - (PHONE.h * V.s) / 2 + 22 * up} width={PHONE.w * V.s} height={PHONE.h * V.s} rx={PHONE.r * V.s}
        fill="none" stroke="#000000" strokeWidth={46} opacity={0.5 * up * (1 - fly)} style={{ filter: "blur(18px)" }} />
      <clipPath id="wg-slab-clip"><rect x={cx - w / 2} y={top} width={w} height={h} rx={rx} /></clipPath>
      {/* its face: clear, with a wide bevel all round that catches the light, and one reflection sliding over it */}
      <rect x={cx - w / 2} y={top} width={w} height={h} rx={rx} fill="url(#wg-slab-face)" opacity={0.5 + 0.5 * up} />
      <g clipPath="url(#wg-slab-clip)">
        <rect x={cx - w / 2 + glint} y={top - 40} width={(150 + 170 * up) * (1 + fly)} height={h + 80} fill="#FFFFFF" opacity={0.16 * up + 0.1 * fly} transform="skewX(-18)" style={{ filter: "blur(14px)", transformBox: "fill-box", transformOrigin: "center" }} />
        <rect x={cx - w / 2 + glint + 330} y={top - 40} width={46} height={h + 80} fill="#FFFFFF" opacity={0.12 * up} transform="skewX(-18)" style={{ filter: "blur(8px)", transformBox: "fill-box", transformOrigin: "center" }} />
        {bevel > 1.5 && <rect x={cx - w / 2 + bevel / 2} y={top + bevel / 2} width={w - bevel} height={Math.max(0, h - bevel)} rx={Math.max(0, rx - bevel / 2)} fill="none" stroke="url(#wg-slab-bevel)" strokeWidth={bevel} />}
        {BEADS.map(([bx, by, r], i) => <Bead key={i} x={cx + bx * unit} y={cy + by * unit} r={r * unit} flat={1} />)}
      </g>
      <rect x={cx - w / 2} y={top} width={w} height={h} rx={rx} fill="none" stroke="#FFFFFF" strokeOpacity={0.3 + 0.6 * up} strokeWidth={2 + 1.5 * up} />
      {bevel > 1.5 && <rect x={cx - w / 2 + bevel} y={top + bevel} width={w - 2 * bevel} height={Math.max(0, h - 2 * bevel)} rx={Math.max(0, rx - bevel)} fill="none" stroke="#EAF2F5" strokeOpacity={0.5 * up} strokeWidth={1.3} />}
    </g>
  );
};
