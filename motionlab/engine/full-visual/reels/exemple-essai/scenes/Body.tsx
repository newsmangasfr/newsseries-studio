// exemple-essai (the French example used for look tests): the body scenes. Every change lands on its word with cue() / endsOn().
import React from "react";
import { Column, countTo, ease, prog, useScene, LEAD } from "./engineKit";
import { AMBER, Cell, HOT, Phone, Shimmer, clamp, lerp } from "./PhoneKit";

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Column>
    <svg width={900} height={1920} viewBox="0 0 900 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {children}
    </svg>
  </Column>
);

/** a gentle push-in that never stops, so a held picture keeps living */
const drift = (f: number, from: number) => 1 + 0.00025 * Math.max(0, f - from);

export const Answer: React.FC = () => {
  const { f, cue, scene } = useScene();
  const glass = 1 - prog(f, cue("l'écran") - 4, 18, ease.inOut);
  const apps = (f < cue("applis") ? prog(f, scene.from - LEAD, 8) : 1 - prog(f, cue("applis"), 14));
  const cell = prog(f, cue("l'écran"), 20);
  const heat = prog(f, cue("batterie") - 6, 22);
  const s = 0.95 * drift(f, scene.from);
  return (
    <Svg>
      <Shimmer f={f} x={450} y={600} w={300} amount={heat} />
      <Phone f={f} x={450} y={985} s={s} pct={null} glass={glass} apps={apps} cell={cell} heat={heat} cable />
    </Svg>
  );
};

export const Night: React.FC = () => {
  const { f, cue, scene } = useScene();
  const dark = prog(f, cue("soir") - 10, 20);
  const pillow = prog(f, cue("oreiller") - 14, 18, ease.out);
  const cased = prog(f, cue("coque") - 10, 14);
  const heat = 0.3 + 0.5 * prog(f, cue("coque"), 30);
  const s = 0.62 * drift(f, scene.from);
  return (
    <Svg>
      {/* the bed: sheet and mattress edge */}
      <rect x={-60} y={1090} width={1020} height={360} rx={40} fill="#d8dde6" opacity={0.18 + 0.1 * (1 - dark)} />
      {/* night window with moon */}
      <g opacity={dark}>
        <rect x={620} y={560} width={220} height={260} rx={10} fill="#0b1a33" stroke="#33415c" strokeWidth={6} />
        <circle cx={760} cy={630} r={34} fill="#f1e9c8" />
        <circle cx={776} cy={620} r={30} fill="#0b1a33" />
        {[0, 1, 2].map((i) => <circle key={i} cx={660 + i * 40} cy={720 + (i % 2) * 30} r={3} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f / 9 + i)} />)}
      </g>
      <Phone f={f} x={330} y={1060} s={s} pct={lerp(34, 41, prog(f, scene.from, 300))} cased={cased} heat={heat} cable />
      <Shimmer f={f} x={330} y={800} w={220} amount={heat * cased} n={5} />
      {/* the pillow comes down on it */}
      <g transform={`translate(0 ${lerp(-700, 0, pillow)})`} opacity={pillow > 0 ? 1 : 0}>
        <path d="M60 880 C 40 760, 140 700, 330 710 C 520 700, 640 760, 620 880 C 640 990, 520 1040, 330 1030 C 140 1040, 40 990, 60 880 Z" fill="#eef1f6" />
        <path d="M120 870 C 220 840, 440 840, 560 870" stroke="#c9d0db" strokeWidth={6} fill="none" />
      </g>
    </Svg>
  );
};

export const Ions: React.FC = () => {
  const { f, cue, scene } = useScene();
  const appear = prog(f, scene.from - LEAD, 10);
  const flow = prog(f, cue("lithium") - 6, 12);
  const labels = prog(f, cue("positif") - 6, 10);
  const sparks = prog(f, cue("interne") - 4, 10);
  const heat = prog(f, cue("l'énergie"), 40);
  // one ion followed across on "passage"
  const pass = prog(f, cue("passage") - 8, 40, ease.inOut);
  const w = 820, h = 640, x0 = 40, y0 = 640;
  return (
    <Svg>
      <g opacity={appear}>
        <Cell f={f} x={x0} y={y0} w={w} h={h} flow={flow} sparks={sparks} heat={heat} labels={labels} from={cue("lithium") - 6} />
        {f >= cue("passage") - 8 && (
          <g>
            <circle cx={x0 + lerp(w * 0.2, w * 0.8, pass)} cy={y0 + h / 2} r={26} fill={AMBER} stroke="#fff" strokeWidth={4} />
            <text x={x0 + lerp(w * 0.2, w * 0.8, pass)} y={y0 + h / 2 + 8} fontSize={22} fontWeight={800} textAnchor="middle" fill="#3a2500" fontFamily="Figtree, sans-serif">Li+</text>
          </g>
        )}
        <Shimmer f={f} x={450} y={y0 - 20} w={700} amount={heat} n={9} />
      </g>
    </Svg>
  );
};

export const Fast: React.FC = () => {
  const { f, cue, scene } = useScene();
  const speed = 1 + 3 * prog(f, cue("vite") - 6, 20);
  const fat = prog(f, cue("fort") - 8, 14);
  const heat = 0.3 + 0.7 * prog(f, cue("chauffe") - 10, 20);
  const w = 820, h = 520, x0 = 40, y0 = 760;
  return (
    <Svg>
      {/* the current arrow into the cell, thicker on "fort" */}
      <g transform={`translate(450 ${y0 - 110})`}>
        <rect x={-300} y={-(10 + 24 * fat) / 2} width={560} height={10 + 24 * fat} rx={8} fill={AMBER} />
        <path d={`M260 ${-30 - 20 * fat} L ${330 + 20 * fat} 0 L 260 ${30 + 20 * fat} Z`} fill={AMBER} />
        <text x={-300} y={-40 - 12 * fat} fontSize={34} fill="#f3f4f6" fontFamily="Figtree, sans-serif" fontWeight={700}>courant</text>
      </g>
      <Cell f={f + scene.from} x={x0} y={y0} w={w} h={h} flow={1} speed={speed} sparks={1} heat={heat} labels={0.6} from={-200} />
      <Shimmer f={f} x={450} y={y0 - 30} w={700} amount={heat} n={11} />
    </Svg>
  );
};

export const Protect: React.FC = () => {
  const { f, cue, scene } = useScene();
  const appear = prog(f, scene.from - LEAD, 10);
  const worn = prog(f, cue("abîme") - 6, 16);
  const shield = prog(f, cue("protège") - 8, 12, ease.out);
  const hot = prog(f, cue("chaud") - 10, 16);
  const pct = countTo(f, cue("bloque"), Math.max(10, cue("80 %") - cue("bloque")), 52, 80);
  const s = drift(f, scene.from);
  return (
    <Svg>
      {/* the iOS Settings > Battery screen, redrawn */}
      <g opacity={appear} transform={`translate(450 990) scale(${s}) translate(-450 -990)`} fontFamily="Figtree, sans-serif">
        <rect x={70} y={560} width={760} height={860} rx={40} fill="#F2F2F7" stroke="#d1d1d6" strokeWidth={3} />
        <text x={110} y={640} fontSize={44} fontWeight={800} fill="#000">Batterie</text>
        <rect x={100} y={680} width={700} height={140} rx={20} fill="#fff" />
        <text x={130} y={735} fontSize={32} fill="#000">Niveau de la batterie</text>
        <text x={770} y={735} fontSize={32} fill="#8e8e93" textAnchor="end">{Math.round(pct)} %</text>
        <rect x={130} y={765} width={640} height={28} rx={14} fill="#e5e5ea" />
        <rect x={130} y={765} width={640 * pct / 100} height={28} rx={14} fill={worn > 0.5 ? "#FF9F0A" : "#34C759"} />
        <rect x={130 + 640 * 0.8 - 2} y={755} width={4} height={48} fill="#000" opacity={prog(f, cue("bloque"), 10)} />
        {/* the warm-battery notice */}
        <g opacity={hot}>
          <rect x={100} y={850} width={700} height={170} rx={20} fill="#fff" />
          <text x={130} y={905} fontSize={30} fontWeight={700} fill="#000">Recharge en attente</text>
          <text x={130} y={950} fontSize={28} fill="#3c3c43">La batterie est trop chaude :</text>
          <text x={130} y={990} fontSize={28} fill="#3c3c43">la charge reprendra plus tard.</text>
        </g>
        {/* the cell icon, worn on "abîme", then shielded */}
        <g transform="translate(450 1220)">
          <rect x={-150} y={-90} width={300} height={180} rx={22} fill={`rgb(${Math.round(lerp(52, 160, worn))},${Math.round(lerp(199, 120, worn))},${Math.round(lerp(89, 90, worn))})`} />
          {worn > 0 && [0, 1, 2].map((i) => <path key={i} d={`M${-120 + i * 90} -80 l 20 50 l -14 30 l 24 60`} stroke="#5a3a20" strokeWidth={5} fill="none" opacity={worn} />)}
          <path d="M-190 -130 Q 0 -190 190 -130 V 20 Q 190 140 0 190 Q -190 140 -190 20 Z" fill="none" stroke="#0A84FF" strokeWidth={14} opacity={shield} transform={`scale(${lerp(1.3, 1, shield)})`} />
          {/* thermometer */}
          <g transform="translate(230 -40)" opacity={hot}>
            <rect x={-12} y={-90} width={24} height={150} rx={12} fill="#fff" stroke="#8e8e93" strokeWidth={3} />
            <rect x={-6} y={lerp(50, -80, hot)} width={12} height={lerp(10, 140, hot)} rx={6} fill={HOT} />
            <circle cx={0} cy={70} r={22} fill={HOT} />
          </g>
        </g>
      </g>
    </Svg>
  );
};

export const Case: React.FC = () => {
  const { f, cue, scene } = useScene();
  const out = prog(f, cue("coque") - 4, 22, ease.inOut);
  const free = prog(f, cue("charge"), 20);
  const src = prog(f, cue("qu'apple") - 6, 10);
  const s = 0.7 * drift(f, scene.from);
  return (
    <Svg>
      <g opacity={src} fontFamily="Figtree, sans-serif">
        <text x={450} y={600} fontSize={30} textAnchor="middle" fill="#3c3c43">apple.com/batteries</text>
        <text x={450} y={650} fontSize={34} textAnchor="middle" fontWeight={700} fill="#000">« take it out of its case first »</text>
      </g>
      {/* the case slides down off the phone */}
      <g transform={`translate(0 ${out * 620})`} opacity={1 - out * 0.4}>
        <rect x={450 - 0.7 * 208} y={1010 - 0.7 * 410} width={0.7 * 416} height={0.7 * 820} rx={50} fill="#2b3a55" stroke="#3e5276" strokeWidth={4} />
      </g>
      <Phone f={f} x={450} y={1010} s={s} pct={lerp(60, 66, prog(f, scene.from, 240))} heat={lerp(0.7, 0.25, free)} cable />
      <Shimmer f={f} x={450} y={700} w={420} amount={0.3 + 0.7 * free} n={9} />
    </Svg>
  );
};

export const End: React.FC = () => {
  const { f, cue, scene } = useScene();
  const cell = prog(f, cue("ions") - 8, 14);
  const night = prog(f, cue("nuit") - 6, 16);
  const pillow = prog(f, cue("l'oreiller") - 14, 16, ease.out);
  const s = 0.82 * drift(f, scene.from);
  return (
    <Svg>
      <g opacity={night}>
        <circle cx={760} cy={600} r={40} fill="#f1e9c8" />
        <circle cx={778} cy={588} r={36} fill="#101010" />
      </g>
      <Phone f={f} x={450} y={1000} s={s} pct={null} cell={cell} heat={0.25 + 0.35 * cell} cable />
      {cell > 0 && (
        <g>
          {Array.from({ length: 16 }, (_, i) => {
            const u = ((f * 0.01 + i / 16) % 1);
            return <circle key={i} cx={lerp(230, 670, u)} cy={1000 + ((i * 41) % 220) - 60} r={9} fill={AMBER} opacity={cell} />;
          })}
        </g>
      )}
      <g transform={`translate(0 ${lerp(-800, 0, pillow)})`} opacity={pillow > 0 ? 1 : 0}>
        <path d="M80 1000 C 40 860, 180 790, 450 800 C 720 790, 860 860, 820 1000 C 860 1140, 720 1200, 450 1190 C 180 1200, 40 1140, 80 1000 Z" fill="#eef1f6" />
      </g>
    </Svg>
  );
};

export { AMBER, clamp };
