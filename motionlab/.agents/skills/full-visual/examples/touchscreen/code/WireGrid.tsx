// touchscreen "grid": "Under the glass of your phone there's a grid of wires you can't see, rows going one way and
// columns going the other. Everywhere a row crosses a column, the phone holds a tiny electric charge, and it checks
// every one of those crossings over and over." One view, never cut: it dives at the phone "winter" leaves in the
// glove, the cover glass lifts off and parks, a bar of light finds the lattice and loses it, the rows and the columns
// draw, the view goes down to one crossing where the charge arches from row to column, the phone reads it (`100`),
// and back out every crossing is read over and over, 120 times a second.
// The cover glass does not park in the picture: lifted on "glass", it comes on past the lens on "phone" and is gone.
// It is above the frame when this scene ends ("finger" brings it back down from there). Hands over the whole grid,
// every crossing at `100`, shimmering.
// Parts: Kit (times, view, geometry), Dive (phone, glass, hands), Lattice, Charge, Read, Text.
import React from "react";
import { useScene } from "../../../src/engine";
import { WinterCallPhoneDefs } from "./WinterCallPhone";
import { WinterCallHandDefs } from "./WinterCallHands";
import { WinterCallSnow } from "./WinterCallWeather";
import { useWireGridT, wireGridView } from "./WireGridKit";
import { WireGridDiveDefs, WireGridFrontHands, WireGridPhone, WireGridPixels, WireGridSlab } from "./WireGridDive";
import { WireGridLattice, WireGridLatticeDefs } from "./WireGridLattice";
import { WireGridCharge } from "./WireGridCharge";
import { WireGridRead } from "./WireGridRead";
import { WireGridText } from "./WireGridText";
import { prog } from "../../../src/engine";

const FULL = { position: "absolute" as const, inset: 0 };
/** the dark foot of the frame: y, then how dark it is while the picture runs to the bottom (the phone, the lattice,
 *  the one crossing), while the grid is read (the reading line leaves into it), and once the counter stands on it.
 *  Long ramps only: a short one cuts a lit diamond in two and reads as a bar across the picture. */
const FOOT: [number, number, number, number][] = [
  [1140, 0, 0, 0], [1200, 0, 0, 0.3], [1262, 0, 0.04, 0.86], [1340, 0, 0.16, 0.88], [1430, 0, 0.42, 0.9],
  [1530, 0.06, 0.7, 0.93], [1640, 0.3, 0.86, 0.95], [1760, 0.62, 0.94, 0.96], [1920, 0.9, 0.97, 0.97],
];

export const WireGrid: React.FC = () => {
  const { f, theme } = useScene();
  const T = useWireGridT();
  const V = wireGridView(f, T);
  // the ground the last number stands on: the foot of the frame goes dark a little higher when the counter comes
  const foot = prog(f, T.over2 - 20, 12);
  // "winter" has no foot at all: ours comes with the dive, never on the first frame
  const footIn = prog(f, T.under - 2, 16);
  return (
    <div style={{ ...FULL, overflow: "hidden" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={FULL}>
        <WinterCallPhoneDefs />
        <WinterCallHandDefs />
        <WireGridDiveDefs />
        <WireGridLatticeDefs V={V} />
        {V.s < 1.9 && <WinterCallSnow f={f} T={T.winter} />}
        <WireGridPhone f={f} T={T} V={V} />
        <WireGridPixels f={f} V={V} />
        <WireGridLattice f={f} T={T} V={V} />
        <WireGridCharge f={f} T={T} V={V} />
        <WireGridRead f={f} T={T} V={V} font={theme.font.mono} />
        <WireGridSlab f={f} T={T} V={V} />
        <WireGridFrontHands f={f} T={T} V={V} />
      </svg>
      {/* the caption's band, and the foot of the frame: the picture runs behind both, dimmed */}
      <div style={{ ...FULL, height: 700, background: "linear-gradient(180deg, rgba(16,16,16,0.97) 0%, rgba(16,16,16,0.95) 68%, rgba(16,16,16,0.62) 80%, rgba(16,16,16,0.2) 91%, rgba(16,16,16,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1140, height: 780, background: `linear-gradient(180deg, ${FOOT.map(([y, a, b, c]) => `rgba(16,16,16,${(footIn * (a + (b - a) * V.back + (c - (a + (b - a) * V.back)) * foot)).toFixed(3)}) ${y - 1140}px`).join(", ")})` }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={FULL}>
        <WireGridText f={f} T={T} V={V} font={theme.font.ui} />
      </svg>
    </div>
  );
};
