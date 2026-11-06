// touchscreen hook X1: the fingertip sliced on the same plane as the phone. Drawn over "answer"'s hand, in its own
// coordinates (u down the finger, tip at u = +220; v across, pad v > 0, nail v < 0), inside its outline: ridged skin
// as a rim, the pink pulp with its fat lobules, the three bones and their joints, the tendon, an artery, the nail
// and its bed, all wet. The gold that the charge brings spreads up inside it. Anatomy off a sagittal fingertip section.
import React from "react";
import { GOLD, penVersusFingerOutline, rnd } from "./PenVersusFingerKit";

// the same outline as PenVersusFingerHand (it is private there), so the rim sits exactly on the skin
const HAND = penVersusFingerOutline([
  [222, -20], [178, -118], [60, -182], [-150, -206], [-330, -224], [-620, -216], [-700, -234], [-900, -222], [-1300, -244],
  [-1420, -270], [-1600, -252], [-2050, -272], [-2250, -336], [-2450, -356], [-2800, -336], [-3400, -332], [-3900, -312],
  [-4500, -322], [-5200, -330], [-5200, 330], [-4500, 322], [-3900, 334], [-3500, 430], [-3000, 566], [-2500, 566],
  [-2150, 432], [-1950, 262], [-1700, 236], [-1300, 242], [-1000, 216], [-680, 204], [-450, 226], [-150, 242], [60, 216],
  [170, 142], [220, 56],
]);
const BONES = [
  penVersusFingerOutline([[-600, -116], [-520, -104], [-320, -80], [-80, -74], [26, -88], [80, -42], [40, 6], [-80, 0], [-320, 6], [-520, 38], [-600, 54], [-624, -30]]),
  penVersusFingerOutline([[-1215, -130], [-1130, -114], [-940, -94], [-780, -106], [-690, -122], [-664, -30], [-690, 58], [-790, 40], [-940, 22], [-1130, 44], [-1215, 64], [-1242, -32]]),
  penVersusFingerOutline([[-1296, -124], [-1270, -32], [-1296, 62], [-1420, 42], [-1700, 22], [-2400, 30], [-2400, -112], [-1700, -106], [-1420, -114]]),
];
const NAIL = "M-432 -168 C-340 -208 -200 -222 20 -204 C104 -192 172 -140 204 -94";
const BED = "M-400 -150 C-320 -186 -200 -198 14 -180 C86 -170 140 -134 170 -98";
const TENDON = "M-2400 96 C-1900 84 -1500 92 -1240 100 C-1000 108 -820 84 -660 96 C-560 104 -500 80 -430 30";
const ARTERY = "M-2400 150 C-1800 168 -1300 140 -900 156 C-560 170 -260 172 -40 150 C40 142 96 110 120 60";
// the ways the gold takes up the finger: through the pulp, along the artery, under the bone
const WAYS = [
  "M110 170 C-60 220 -420 150 -820 172 C-1200 192 -1500 130 -1900 160",
  "M150 60 C40 130 -200 96 -520 120 C-900 150 -1300 96 -1900 110",
  "M60 208 C-200 236 -600 200 -1000 206 C-1400 212 -1650 200 -1900 216",
  "M190 0 C150 -40 100 -70 20 -120 C-200 -160 -500 -150 -900 -168 C-1300 -186 -1600 -200 -1900 -214",
];

const Defs: React.FC<{ open: number }> = ({ open }) => {
  const edge = 320 + (-1340 - 320) * open; // the cut face runs from the tip to here, then the skin is whole again
  return (
    <defs>
      <linearGradient id="hx1-cut-g" gradientUnits="userSpaceOnUse" x1={edge - 520} y1="0" x2={edge} y2="0">
        <stop offset="0" stopColor="#000" />
        <stop offset="1" stopColor="#FFF" />
      </linearGradient>
      <mask id="hx1-cut" maskUnits="userSpaceOnUse" x="-2500" y="-500" width="2900" height="1000">
        <rect x="-2500" y="-500" width="2900" height="1000" fill="url(#hx1-cut-g)" />
      </mask>
      <clipPath id="hx1-hand"><path d={HAND} /></clipPath>
      <linearGradient id="hx1-pulp" gradientUnits="userSpaceOnUse" x1="0" y1="-250" x2="0" y2="260">
        <stop offset="0" stopColor="#6E3F3D" />
        <stop offset="0.35" stopColor="#A9605C" />
        <stop offset="0.75" stopColor="#D08A7E" />
        <stop offset="1" stopColor="#E7A999" />
      </linearGradient>
      <linearGradient id="hx1-bone" gradientUnits="userSpaceOnUse" x1="0" y1="-130" x2="0" y2="70">
        <stop offset="0" stopColor="#A89A82" />
        <stop offset="1" stopColor="#E4D9C2" />
      </linearGradient>
      <pattern id="hx1-spongy" width="26" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
        <circle cx="6" cy="6" r="4.2" fill="#7C6652" opacity="0.5" />
        <circle cx="19" cy="15" r="3.4" fill="#7C6652" opacity="0.42" />
      </pattern>
      <linearGradient id="hx1-dusk" gradientUnits="userSpaceOnUse" x1="240" y1="0" x2="-2300" y2="0">
        <stop offset="0" stopColor="#0A0D12" stopOpacity="0" />
        <stop offset="0.3" stopColor="#0A0D12" stopOpacity="0.16" />
        <stop offset="1" stopColor="#0A0D12" stopOpacity="0.72" />
      </linearGradient>
      <linearGradient id="hx1-way" gradientUnits="userSpaceOnUse" x1="200" y1="0" x2="-1900" y2="0">
        <stop offset="0" stopColor="#FFF0B8" />
        <stop offset="0.3" stopColor={GOLD} />
        <stop offset="1" stopColor={GOLD} stopOpacity="0.15" />
      </linearGradient>
      <filter id="hx1-glow" x="-30%" y="-150%" width="160%" height="400%"><feGaussianBlur stdDeviation="52" /></filter>
      <filter id="hx1-wet" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="9" /></filter>
    </defs>
  );
};

/** the fat of the pad: lobules packed between thin walls, a little bigger towards the middle */
const Lobules: React.FC = () => (
  <>
    {Array.from({ length: 150 }, (_, i) => {
      const u = 170 - Math.pow(rnd(i * 3 + 1), 0.9) * 2400;
      const top = i % 5 === 0;
      const v = top ? -178 + rnd(i * 7 + 2) * 50 : 64 + rnd(i * 7 + 2) * 150;
      const r = top ? 15 + rnd(i) * 10 : 21 + rnd(i) * 20;
      return <ellipse key={i} cx={u} cy={v} rx={r * 1.25} ry={r * 0.86} fill={i % 3 ? "#E6BE97" : "#DDAE8C"} fillOpacity={0.62 + 0.26 * rnd(i + 40)} stroke="#A9625C" strokeOpacity="0.75" strokeWidth="3" transform={`rotate(${(rnd(i + 9) * 50 - 25).toFixed(0)} ${u.toFixed(0)} ${v.toFixed(0)})`} />;
    })}
  </>
);

/** `open`: how much of the cut face shows (1, and 0 once the skin has closed over it). `spread`: how far the gold
 *  has gone up inside (0 to 1). `on`: its light. `lit`: the cold light the flaring screen throws on the pad. */
export const HookX1Tissue: React.FC<{ f: number; open: number; spread: number; on: number; lit: number }> = ({ f, open, spread, on, lit }) => {
  if (open <= 0.001) return null;
  const sheen = -2000 + ((f * 9) % 2600);
  const gold = spread * on;
  return (
    <>
      <Defs open={open} />
      <g clipPath="url(#hx1-hand)">
        <g mask="url(#hx1-cut)">
          <rect x="-2500" y="-500" width="2900" height="1000" fill="url(#hx1-pulp)" />
          <Lobules />
          <path d={TENDON} stroke="#EFE8DA" strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d={TENDON} stroke="#B9AD98" strokeWidth="3" fill="none" strokeDasharray="60 14" opacity="0.6" />
          <path d={ARTERY} stroke="#8E2F35" strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d={ARTERY} stroke="#D2686A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
          {[-1700, -1250, -820, -430, -140].map((u, i) => (
            <path key={u} d={`M${u} 158 q${40 + i * 6} ${30 + (i % 2) * 20} ${90 + i * 8} ${44 - i * 4}`} stroke="#8E2F35" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
          ))}
          {BONES.map((d) => (
            <g key={d}>
              <path d={d} fill="url(#hx1-bone)" stroke="#F4EEDF" strokeWidth="13" strokeLinejoin="round" />
              <path d={d} fill="url(#hx1-spongy)" />
            </g>
          ))}
          {/* the joints: cartilage on both ends, a dark gap between */}
          {[-644, -1268].map((u) => (
            <g key={u} fill="none" strokeLinecap="round">
              <path d={`M${u + 22} -118 Q${u + 2} -30 ${u + 22} 56`} stroke="#DCE8EE" strokeWidth="11" />
              <path d={`M${u - 24} -126 Q${u - 2} -30 ${u - 24} 62`} stroke="#DCE8EE" strokeWidth="11" />
            </g>
          ))}
          <path d={BED} stroke="#B3535A" strokeWidth="20" fill="none" strokeLinecap="round" />
          <path d={NAIL} stroke="#EFE6DE" strokeWidth="19" fill="none" strokeLinecap="round" />
          <path d={NAIL} stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.75" transform="translate(0 -5)" />
          {/* the skin, cut through: dermis, then the pale outer layer, its ridges standing along the pad */}
          <path d={HAND} fill="none" stroke="#B4645F" strokeWidth="92" />
          <path d={HAND} fill="none" stroke="#F1D3C3" strokeWidth="46" />
          <path d={HAND} fill="none" stroke="#7E4A42" strokeWidth="46" strokeDasharray="7 9" opacity="0.42" />
          <path d={HAND} fill="none" stroke="#8E4E49" strokeWidth="50" strokeDasharray="3 13" opacity="0.5" transform="translate(-1 -1)" />
          <rect x="-2500" y="-500" width="2900" height="1000" fill="url(#hx1-dusk)" />
          <ellipse cx={-10} cy={290} rx={460} ry={150} fill="#CFE2FF" opacity={0.2 + 0.5 * lit} filter="url(#hx1-glow)" />
          {/* wet: one soft band of light sliding down the face, and small hard glints that come and go */}
          <ellipse cx={sheen} cy={40} rx={210} ry={330} fill="#FFFFFF" opacity="0.13" filter="url(#hx1-glow)" transform={`rotate(24 ${sheen} 40)`} />
          {Array.from({ length: 30 }, (_, i) => {
            const u = 150 - rnd(i * 5 + 3) * 1700;
            const v = -170 + rnd(i * 11 + 7) * 380;
            const tw = 0.5 + 0.5 * Math.sin(f / 6 + i * 2.4);
            return <ellipse key={i} cx={u} cy={v} rx={11 + 10 * rnd(i)} ry={3.2} fill="#FFFFFF" opacity={(0.25 + 0.6 * tw) * (1 - Math.min(1, Math.abs(u - sheen) / 1400) * 0.6)} transform={`rotate(-24 ${u.toFixed(0)} ${v.toFixed(0)})`} />;
          })}
          {gold > 0.01 && (
            <g style={{ mixBlendMode: "screen" }} fill="none">
              <ellipse cx={110 - 620 * spread} cy={110 - 60 * spread} rx={170 + 900 * spread} ry={150 + 190 * spread} fill={GOLD} opacity={0.34 * on * Math.min(1, spread * 3)} filter="url(#hx1-glow)" />
              <path d={HAND} stroke={GOLD} strokeWidth="26" opacity={0.42 * gold} filter="url(#hx1-wet)" />
              {WAYS.map((d, i) => {
                const run = Math.min(1, spread * (1.25 - i * 0.08));
                return (
                  <g key={d}>
                    <path d={d} stroke="url(#hx1-way)" strokeWidth={i === 3 ? 6 : 9} strokeLinecap="round" opacity={0.85 * on} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - run} />
                    {[0, 1, 2, 3].map((j) => {
                      const p = (f / 38 + j / 4 + i * 0.17) % 1;
                      return p < run - 0.03 ? <path key={j} d={d} stroke="#FFF3C4" strokeWidth="12" strokeLinecap="round" pathLength={1} strokeDasharray="0.03 1" strokeDashoffset={(-p).toFixed(4)} opacity={on * (1 - 0.6 * p)} filter="url(#hx1-wet)" /> : null;
                    })}
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </g>
    </>
  );
};
