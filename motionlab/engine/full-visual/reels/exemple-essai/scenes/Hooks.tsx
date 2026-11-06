// exemple-essai (the French example used for look tests) hooks. h1: the still phone that heats while its % climbs. h2: inside, the cell filling with amber.
import React from "react";
import { Column, countTo, ease, prog, useScene } from "./engineKit";
import { Cell, Phone, Shimmer, lerp } from "./PhoneKit";

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Column>
    <svg width={900} height={1920} viewBox="0 0 900 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>
  </Column>
);

/** h1: frame 0 already shows the plugged phone with current running in; on "chauffe" the heat blooms, on "charges"
 * the % counts, on "rien" the screen goes black yet the heat keeps rising, on "chaleur" one heavy push-in */
export const HookX1: React.FC = () => {
  const { f, cue } = useScene();
  const heat = 0.15 + 0.85 * prog(f, cue("chauffe") - 8, 20);
  const pct = countTo(f, cue("charges"), 50, 23, 31);
  const off = prog(f, cue("rien"), 6);
  const push = prog(f, cue("chaleur") - 14, 18, ease.out);
  const s = lerp(0.78, 1.0, push) * (1 + 0.0008 * f);
  return (
    <Svg>
      <Shimmer f={f} x={450} y={620} w={360} amount={heat} n={9} />
      <Phone f={f} x={450} y={lerp(990, 1040, push)} s={s} pct={off > 0.5 ? null : pct} heat={heat} cell={push * 0.9} cable />
    </Svg>
  );
};

/** h2: the cell itself from frame 0, ions already crossing; "chauffe" turns it amber, "rien" freezes the phone
 * outline around it, "chaleur" the heat floods the cell */
export const HookX2: React.FC = () => {
  const { f, cue } = useScene();
  const heat = prog(f, cue("chauffe") - 6, 18) * 0.5 + prog(f, cue("chaleur") - 10, 16) * 0.5;
  const speed = 1 + 2 * prog(f, cue("charges") - 6, 14);
  const outline = prog(f, cue("rien") - 6, 12);
  return (
    <Svg>
      <g opacity={outline}>
        <rect x={20} y={560} width={860} height={860} rx={90} fill="none" stroke="#c8ccd2" strokeWidth={10} />
        <rect x={360} y={590} width={180} height={40} rx={20} fill="#000" stroke="#555" />
      </g>
      <Cell f={f + 200} x={90} y={700} w={720} h={600} flow={1} speed={speed} sparks={heat} heat={heat} labels={0} from={0} />
      <Shimmer f={f} x={450} y={680} w={600} amount={heat} n={11} />
    </Svg>
  );
};
