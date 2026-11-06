// touchscreen hook X1: the ballpoint, sliced on the same plane. Drawn over "answer"'s pen in its coordinates (tip
// down, the ball's lowest point at (0, 0)): the plastic cone and the brass point as cut faces, the ink channel
// running down the middle to the ball in its socket. Plastic, brass, ink: nothing in there for the charge to enter.
import React from "react";

const CONE_TOP = -520;
const CONE = `M-49 -172 L-148 ${CONE_TOP + 40} Q0 ${CONE_TOP + 62} 148 ${CONE_TOP + 40} L49 -172 Q0 -160 -49 -172Z`;
const SHOULDER = "M-46 -176 Q0 -164 46 -176 L32 -78 Q0 -70 -32 -78Z";
const NOSE = "M-22 -64 Q0 -58 22 -64 L18 -24 Q0 -12 -18 -24Z";

/** `open`: 1 while the cut face shows, 0 once it has closed. `spin`: the ball turning, in degrees. */
export const HookX1PenCut: React.FC<{ open: number; spin: number; f: number }> = ({ open, spin, f }) => {
  if (open <= 0.001) return null;
  const flow = (f * 2.2) % 46;
  return (
    <g opacity={open}>
      <defs>
        <pattern id="hx1-hatch" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="13" height="13" fill="none" />
          <rect width="2.2" height="13" fill="#3A2A0A" opacity="0.4" />
        </pattern>
        <linearGradient id="hx1-ink" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#101A66" />
          <stop offset="0.45" stopColor="#3550E6" />
          <stop offset="1" stopColor="#0C1352" />
        </linearGradient>
        <radialGradient id="hx1-ball" cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#F4F6F8" />
          <stop offset="0.3" stopColor="#9BA2AA" />
          <stop offset="1" stopColor="#2B2F34" />
        </radialGradient>
        <clipPath id="hx1-ball-clip"><circle cx={0} cy={-18} r={18} /></clipPath>
      </defs>
      {/* the plastic cone, cut: a pale flat face, the hollow that takes the ink tube */}
      <path d={CONE} fill="#BFA36E" />
      <path d={CONE} fill="url(#hx1-hatch)" opacity="0.7" />
      <path d={`M-22 -176 L-62 ${CONE_TOP + 52} L62 ${CONE_TOP + 52} L22 -176Z`} fill="#17120A" />
      <path d={`M-13 -178 L-50 ${CONE_TOP + 52} L50 ${CONE_TOP + 52} L13 -178Z`} fill="url(#hx1-ink)" />
      <path d={`M-22 -176 L-62 ${CONE_TOP + 52} M22 -176 L62 ${CONE_TOP + 52}`} stroke="#F2E2B8" strokeOpacity="0.8" strokeWidth="2.5" fill="none" />
      <path d={CONE} fill="none" stroke="#F6E7C0" strokeOpacity="0.7" strokeWidth="3" />
      {/* the brass point, cut: solid metal either side of a channel no wider than the ball */}
      <path d={SHOULDER} fill="#D9B552" />
      <path d={SHOULDER} fill="url(#hx1-hatch)" />
      <path d="M-32 -80 Q0 -72 32 -80 L22 -62 Q0 -56 -22 -62Z" fill="#B48E33" />
      <path d={NOSE} fill="#D9B552" />
      <path d={NOSE} fill="url(#hx1-hatch)" />
      <path d="M-11 -180 L-6 -40 Q0 -34 6 -40 L11 -180Z" fill="url(#hx1-ink)" />
      {/* ink on its way down to the ball */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-2.5} y={-178 + ((flow + i * 46) % 138)} width={5} height={15} rx={2.5} fill="#9FB0FF" opacity="0.75" />
      ))}
      <path d={SHOULDER} fill="none" stroke="#FFF3C8" strokeOpacity="0.85" strokeWidth="2.5" />
      <path d={NOSE} fill="none" stroke="#FFF3C8" strokeOpacity="0.85" strokeWidth="2.5" />
      {/* the socket and the ball in it, wet with ink at the back */}
      <path d="M-19 -30 A20 20 0 0 1 19 -30" stroke="#2A3FCB" strokeWidth="5" fill="none" />
      <circle cx={0} cy={-18} r={18} fill="url(#hx1-ball)" />
      <g clipPath="url(#hx1-ball-clip)" transform={`rotate(${spin.toFixed(1)} 0 -18)`}>
        <ellipse cx={0} cy={-30} rx={9} ry={3.4} fill="#22306E" opacity="0.7" />
        <ellipse cx={11} cy={-11} rx={3.4} ry={7} fill="#14161A" opacity="0.5" />
        <ellipse cx={-10} cy={-8} rx={3} ry={6} fill="#14161A" opacity="0.4" />
      </g>
      <ellipse cx={-6} cy={-25} rx={5} ry={3} fill="#FFFFFF" opacity="0.9" />
    </g>
  );
};
