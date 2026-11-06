// exemple-essai (the French example used for look tests): the shared phone, its battery cell and the heat. One invisible colour: amber.
import React from "react";

export const AMBER = "#FFB020";
export const HOT = "#FF6A1A";
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** heat shimmer: wavy lines rising above a point, alive on every frame */
export const Shimmer: React.FC<{ f: number; x: number; y: number; w: number; amount: number; n?: number }> = ({ f, x, y, w, amount, n = 7 }) => {
  if (amount <= 0.01) return null;
  return (
    <g fill="none" stroke={AMBER} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const u = ((f * 0.012 + i / n) % 1);
        const px = x - w / 2 + (w * (i + 0.5)) / n;
        const py = y - u * 260 * amount;
        const pts = Array.from({ length: 9 }, (_, k) => `${px + Math.sin(k * 0.9 + f * 0.12 + i) * 9},${py - k * 12}`);
        return <polyline key={i} points={pts.join(" ")} strokeWidth={4} opacity={amount * (1 - u) * 0.8} />;
      })}
    </g>
  );
};

type PhoneProps = {
  f: number;
  x: number; // centre
  y: number; // centre
  s?: number; // scale, 1 = 380 x 780
  pct?: number | null; // lock-screen battery percentage, null = screen off
  glass?: number; // 1 glass on, 0 lifted away
  apps?: number; // 1 apps lit, 0 dark
  cell?: number; // 0..1 how visible the battery cell is through the body
  heat?: number; // 0..1
  cased?: number; // 0..1 the case around it
  cable?: boolean;
};

/** an iPhone seen from the front, redrawn at its proportions (71.5 x 147.6 mm), with the cutaway battery under the glass */
export const Phone: React.FC<PhoneProps> = ({ f, x, y, s = 1, pct = null, glass = 1, apps = 0, cell = 0, heat = 0, cased = 0, cable = true }) => {
  const W = 380, H = 784, R = 62;
  const glow = clamp(heat);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-W / 2} ${-H / 2})`}>
      <defs>
        <radialGradient id="pk-heat" cx="50%" cy="62%" r="60%">
          <stop offset="0%" stopColor={HOT} stopOpacity={0.9} />
          <stop offset="55%" stopColor={AMBER} stopOpacity={0.35} />
          <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="pk-frame" x1="0" x2="1">
          <stop offset="0" stopColor="#8a8d93" />
          <stop offset="0.5" stopColor="#d9dbe0" />
          <stop offset="1" stopColor="#7c7f85" />
        </linearGradient>
      </defs>
      {/* heat halo behind the body */}
      <ellipse cx={W / 2} cy={H * 0.62} rx={W * (0.7 + 0.25 * glow)} ry={H * (0.5 + 0.12 * glow)} fill="url(#pk-heat)" opacity={glow} />
      {/* case */}
      {cased > 0 && (
        <rect x={-18} y={-18} width={W + 36} height={H + 36} rx={R + 16} fill="#2b3a55" opacity={cased} stroke="#3e5276" strokeWidth={3} />
      )}
      {/* side buttons */}
      <rect x={-6} y={150} width={8} height={40} rx={3} fill="#9a9da3" />
      <rect x={-6} y={215} width={8} height={70} rx={3} fill="#9a9da3" />
      <rect x={-6} y={300} width={8} height={70} rx={3} fill="#9a9da3" />
      <rect x={W - 2} y={240} width={8} height={110} rx={3} fill="#9a9da3" />
      {/* frame and back */}
      <rect x={0} y={0} width={W} height={H} rx={R} fill="url(#pk-frame)" />
      <rect x={8} y={8} width={W - 16} height={H - 16} rx={R - 8} fill="#14161a" />
      {/* the inside: logic board at the top, the L-shaped battery below (as on teardown photos) */}
      <g opacity={cell}>
        <rect x={34} y={40} width={W - 68} height={170} rx={14} fill="#1f3b2c" stroke="#2f5a43" strokeWidth={2} />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={54 + i * 48} y={70 + (i % 2) * 40} width={34} height={34} rx={4} fill="#2d2f33" stroke="#4a4d52" />
        ))}
        <path d={`M34 230 H${W - 34} V${H - 90} H${W - 150} V${H - 40} H34 Z`} fill={`rgb(${Math.round(lerp(58, 255, glow))},${Math.round(lerp(60, 140, glow))},${Math.round(lerp(66, 40, glow))})`} stroke="#9aa0a8" strokeWidth={2} />
        <text x={W / 2 - 40} y={H / 2 + 40} fill="#e6e8ec" fontFamily="Figtree, sans-serif" fontSize={34} fontWeight={700} textAnchor="middle">batterie</text>
        <text x={W / 2 - 40} y={H / 2 + 80} fill="#e6e8ec" fontFamily="Figtree, sans-serif" fontSize={24} textAnchor="middle" opacity={0.75}>Li-ion</text>
      </g>
      {/* glass + lock screen */}
      <g opacity={glass} transform={`translate(${(1 - glass) * 40} ${-(1 - glass) * 120})`}>
        <rect x={14} y={14} width={W - 28} height={H - 28} rx={R - 14} fill={pct === null ? "#050607" : "#0c1220"} />
        {pct !== null && (
          <g fontFamily="Figtree, sans-serif" textAnchor="middle" fill="#f3f4f6">
            <text x={W / 2} y={200} fontSize={96} fontWeight={600}>23:12</text>
            <text x={W / 2} y={250} fontSize={26} opacity={0.8}>mardi 29 octobre</text>
            <g transform={`translate(${W / 2 - 60} ${H - 210})`}>
              <rect x={0} y={0} width={110} height={48} rx={12} fill="none" stroke="#f3f4f6" strokeWidth={4} />
              <rect x={6} y={6} width={Math.max(0, 98 * pct / 100)} height={36} rx={7} fill="#34C759" />
              <rect x={113} y={16} width={7} height={16} rx={3} fill="#f3f4f6" />
            </g>
            <text x={W / 2} y={H - 120} fontSize={40} fontWeight={700}>{Math.round(pct)} %</text>
          </g>
        )}
        {apps > 0 && (
          <g opacity={apps}>
            {Array.from({ length: 20 }, (_, i) => {
              const c = i % 4, r = Math.floor(i / 4);
              const hues = ["#34C759", "#0A84FF", "#FF9F0A", "#FF375F", "#5E5CE6", "#64D2FF", "#FFD60A", "#BF5AF2"];
              return <rect key={i} x={44 + c * 78} y={90 + r * 96} width={60} height={60} rx={15} fill={hues[(i * 3) % hues.length]} />;
            })}
          </g>
        )}
        <rect x={W / 2 - 62} y={30} width={124} height={36} rx={18} fill="#000" />
        <rect x={14} y={14} width={W - 28} height={H - 28} rx={R - 14} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={2} />
      </g>
      {/* port + cable */}
      <rect x={W / 2 - 22} y={H - 6} width={44} height={8} rx={4} fill="#222" />
      {cable && (
        <g>
          <rect x={W / 2 - 30} y={H + 2} width={60} height={70} rx={10} fill="#f2f2f2" />
          <path d={`M${W / 2} ${H + 72} C ${W / 2} ${H + 160}, ${W / 2 + 120} ${H + 140}, ${W / 2 + 140} ${H + 260}`} stroke="#f2f2f2" strokeWidth={18} fill="none" strokeLinecap="round" />
          {/* current running in: amber beads along the cable */}
          {Array.from({ length: 4 }, (_, i) => {
            const u = 1 - ((f * 0.02 + i / 4) % 1);
            const bx = W / 2 + 140 * u * u, by = H + 72 + 188 * u;
            return <circle key={i} cx={bx} cy={by} r={6} fill={AMBER} opacity={0.9} />;
          })}
        </g>
      )}
    </g>
  );
};

/** the cell in cross-section: positive plate, electrolyte, negative (graphite) plate, ions crossing left to right */
export const Cell: React.FC<{ f: number; x: number; y: number; w: number; h: number; flow: number; speed?: number; sparks?: number; heat?: number; labels?: number; from?: number }> = ({
  f, x, y, w, h, flow, speed = 1, sparks = 0, heat = 0, labels = 1, from = 0,
}) => {
  const plate = w * 0.2;
  const N = 46;
  return (
    <g transform={`translate(${x} ${y})`} fontFamily="Figtree, sans-serif">
      <rect x={-12} y={-12} width={w + 24} height={h + 24} rx={22} fill="#1a1c20" stroke="#6b6f76" strokeWidth={3} />
      {/* electrolyte */}
      <rect x={plate} y={0} width={w - 2 * plate} height={h} fill={`rgba(120,170,220,${0.16 + 0.1 * Math.sin(f / 20)})`} />
      {/* separator */}
      <line x1={w / 2} y1={6} x2={w / 2} y2={h - 6} stroke="#9fb3c8" strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
      {/* positive plate: layered oxide */}
      <rect x={0} y={0} width={plate} height={h} fill="#5d6470" />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={6} x2={plate - 6} y1={20 + i * (h - 40) / 13} y2={20 + i * (h - 40) / 13} stroke="#8a93a1" strokeWidth={3} />
      ))}
      {/* negative plate: graphite sheets */}
      <rect x={w - plate} y={0} width={plate} height={h} fill="#2c2e33" />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M${w - plate + 6} ${22 + i * (h - 40) / 13} q ${plate / 4} -8 ${plate / 2 - 6} 0 t ${plate / 2 - 6} 0`} stroke="#55585f" strokeWidth={3} fill="none" />
      ))}
      {/* ions */}
      {Array.from({ length: N }, (_, i) => {
        const seed = (i * 97) % 101 / 101;
        const t0 = from + i * 3;
        if (flow <= 0 || f < t0) return null;
        const u = (((f - t0) * 0.006 * speed + seed) % 1);
        const px = lerp(plate - 10, w - plate + 10, u);
        const py = 30 + ((i * 53) % (h - 60)) + Math.sin(f * 0.15 + i) * 6;
        // a collision: each ion jolts at three places, leaving a flash of heat
        const jolt = sparks > 0 && Math.abs(Math.sin(u * Math.PI * 6)) > 0.97;
        return (
          <g key={i} opacity={flow}>
            {jolt && <circle cx={px} cy={py} r={20} fill={HOT} opacity={0.55 * sparks} />}
            <circle cx={px} cy={py} r={13} fill={AMBER} />
            <text x={px} y={py + 5} fontSize={12} fontWeight={800} textAnchor="middle" fill="#3a2500">Li+</text>
          </g>
        );
      })}
      {/* heat in the cell */}
      <rect x={0} y={0} width={w} height={h} fill={HOT} opacity={0.28 * heat} />
      {labels > 0 && (
        <g opacity={labels} fill="#f3f4f6" textAnchor="middle">
          <text x={plate / 2} y={-34} fontSize={44} fontWeight={800}>+</text>
          <text x={w - plate / 2} y={-34} fontSize={44} fontWeight={800}>−</text>
          <text x={plate / 2} y={h + 56} fontSize={26}>positif</text>
          <text x={w - plate / 2} y={h + 56} fontSize={26}>négatif (graphite)</text>
          <text x={w / 2} y={h + 56} fontSize={26} opacity={0.8}>électrolyte</text>
        </g>
      )}
    </g>
  );
};
