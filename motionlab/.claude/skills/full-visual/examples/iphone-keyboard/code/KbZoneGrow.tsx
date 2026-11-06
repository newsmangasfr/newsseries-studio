// "So before your thumb even comes down, the invisible zone around the E gets bigger, and the zones around it get
// squeezed."
// The mechanism itself, slow and face on. The slab "tim" ends on ("what tim" in the field, 96% on the E cap, 0% on the
// W cap) comes in until Q W E R T over A S D F fill the stage and the rows below fall out of the light. The thumb
// comes in from the lower left, high above the glass, its shadow closing up under it, and stops in the air on
// "down,". On "invisible zone" the caps turn to dark glass and the zones show through, all the same size. On "E" its
// zone alone brightens and a hairline ties the 96% on its cap to the zone's edge. On "bigger," the zone swells, slowly
// then all at once, over half of the W cap and of the R cap and the tops of S and D; the cap has not moved, the
// hairline has stretched. W, R, S, D light by their borders on "zones around it", and on "squeezed." they are crushed
// thin, their sides bowed, and Q, T, A, F give a little. Ends on that picture, thumb still in the air: "same" starts
// on it (KbZoneGrowCLOSE, KbZoneGrowHANG), and it is "same" that turns the x-ray off.
// Parts: KbZoneGrowKit (cues, camera, the swell, the sheet of zones), KbZoneGrowBoard (keys, zones, field),
// KbZoneGrowThumb.
import React from "react";
import { blurIn, blurOut, mix, prog, useScene } from "../../../src/engine";
import { SF, SHEET } from "./KbSheetSplitKit";
import { kbZoneGrowPose, kbZoneGrowPush, useKbZoneGrowT, type KbZoneGrowT } from "./KbZoneGrowKit";
import { KbZoneGrowBoard } from "./KbZoneGrowBoard";
import { KbZoneGrowThumb } from "./KbZoneGrowThumb";

// what comes near the caption (the field on its way out, the top of the QuickType bar) fades out under it
const MASK = "linear-gradient(to bottom, transparent 486px, #000 548px)";

/** the rows under the two in the light go almost to the ground: the swollen zones keep their lower border clear of
 *  it, and the tag set on those rows is read on a plain dark field, not across the z, x, c, v of unlit keys.
 *  "same" starts under this same veil */
export const KbZoneGrowVEIL = (bg: string) => `linear-gradient(to bottom, transparent 1278px, ${bg}F0 1306px, ${bg}F5 1920px)`;

/** the two honest tags, one after the other in the same place: above the creator's character, on rows that are out of the light */
const KbZoneGrowTags: React.FC<{ t: KbZoneGrowT }> = ({ t }) => {
  const { f, ground } = useScene();
  if (f < t.tag) return null;
  const lit = prog(f, t.tag + 4, 6) * (1 - prog(f, t.tag + 34, 14));
  const base: React.CSSProperties = { position: "absolute", right: 44, top: 1300, textAlign: "right", fontFamily: SF, fontSize: 32, lineHeight: "41px", color: ground.dim, whiteSpace: "nowrap" };
  return (
    <>
      {f < t.tag2 + 8 && (
        <div style={{ ...base, ...(f < t.tag2 ? blurIn(f, t.tag, { dur: 8, rise: 8 }) : blurOut(f, t.tag2, { dur: 6 })) }}>
          Zones drawn visible.<br /><span style={{ color: mix(lit, 0, 1, ground.dim, "#FFFFFF") }}>On a real iPhone they are invisible.</span>
        </div>
      )}
      {f >= t.tag2 + 3 && (
        <div style={{ ...base, ...blurIn(f, t.tag2 + 3, { dur: 8, rise: 8 }) }}>
          Zone sizes from English word counts,<br />not Apple’s own model.
        </div>
      )}
    </>
  );
};

export const KbZoneGrow: React.FC = () => {
  const { f, ground } = useScene();
  const t = useKbZoneGrowT();
  const p = kbZoneGrowPose(f, t);
  const close = kbZoneGrowPush(f, t);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, maskImage: MASK, WebkitMaskImage: MASK }}>
        <div style={{ position: "absolute", left: p.x, top: p.y, width: SHEET.w, height: SHEET.h, transformOrigin: "0 0", transform: `scale(${p.s.toFixed(5)})` }}>
          <KbZoneGrowBoard t={t} />
        </div>
      </div>
      {/* the light stays on the two rows the sentence is about: the rows under them fall away */}
      <div style={{ position: "absolute", inset: 0, opacity: close, background: KbZoneGrowVEIL(ground.bg) }} />
      <KbZoneGrowThumb t={t} />
      <KbZoneGrowTags t={t} />
    </>
  );
};
// "same" starts on this very picture: it hands over in place, it is not lifted off
(KbZoneGrow as unknown as { keep: boolean }).keep = true;
