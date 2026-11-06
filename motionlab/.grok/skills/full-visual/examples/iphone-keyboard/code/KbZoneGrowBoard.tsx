// Scene "grow": the keyboard, in the sheet. The slab and caps "tim" ends on (same geometry, same greys, "96%" on the
// E cap and "0%" on the W cap), then the x-ray: the caps turn to dark glass and the zones show through, amber,
// tiled edge to edge. The E's zone brightens and swells past its own cap; the cap does not move a pixel. Light is
// likelihood: the E's zone is the bright one, the four it crushes are lit by their borders, then go dim and thin.
import React from "react";
import { ease, mix, prog, useScene } from "../../../src/engine";
import { AMBER, CAPS, KB_H, KB_TOP, KEY, ROW_TOP, SF, SHEET, cap, type Cap } from "./KbSheetSplitKit";
import { KbZoneGrowE, KbZoneGrowRING, KbZoneGrowRING2, kbZoneGrowAmp, kbZoneGrowCells, kbZoneGrowMove, type KbZoneGrowT } from "./KbZoneGrowKit";

/** a pulse that starts at `at` and dies in `life` frames */
const bump = (f: number, at: number, life: number) => (f < at ? 0 : Math.max(0, 1 - (f - at) / life) ** 2);

const FAR = 44; // frames the x-ray takes to cross the sheet: it is across the two rows as "zone" is said
/** how far the x-ray has reached this point of the sheet: it spreads from under the thumb, up and to the right */
function xray(f: number, t: KbZoneGrowT, x: number, y: number) {
  if (y > ROW_TOP[2]) return 0; // the third row is out of the light: it stays as it is
  const far = Math.hypot(x - 140, y - 600) / 900;
  return prog(f, t.xray + far * FAR, 13, ease.out);
}
const centre = (id: string) => ({ x: cap(id).x + cap(id).w / 2, y: cap(id).y + KEY.h / 2 });

const Glyph: React.FC<{ id: string }> = ({ id }) =>
  id === "shift" ? (
    <svg width={54} height={50} viewBox="0 0 54 50"><path d="M27 4 L49 26 H37 V44 H17 V26 H5 Z" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinejoin="round" /></svg>
  ) : (
    <svg width={62} height={46} viewBox="0 0 62 46">
      <path d="M21 3 H52 a7 7 0 0 1 7 7 V36 a7 7 0 0 1 -7 7 H21 L3 23 Z" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinejoin="round" />
      <path d="M29 15 L45 31 M45 15 L29 31" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" />
    </svg>
  );

const KbZoneGrowCap: React.FC<{ c: Cap; t: KbZoneGrowT }> = ({ c, t }) => {
  const { f } = useScene();
  const letter = c.kind === "letter";
  const x = letter ? xray(f, t, c.x + c.w / 2, c.y + KEY.h / 2) : 0;
  const g = c.kind === "dark" ? 70 : 107;
  const l = (a: number, b: number) => (a + (b - a) * x).toFixed(letter ? 2 : 0);
  const pct = c.id === "e" ? "96%" : c.id === "w" ? "0%" : null;
  // the E's cap is the one thing that must be seen not to move: its edge is drawn harder as its zone leaves it behind
  const hot = c.id === "e" ? prog(f, t.e, 7) : 0;
  const edge = c.id === "e" ? 0.5 + 0.45 * hot : 0.42;
  const beat = c.id === "e" ? bump(f, t.e, 14) : c.id === "w" ? bump(f, t.squeeze, 16) : 0;
  return (
    <div
      style={{
        position: "absolute", left: c.x, top: c.y, width: c.w, height: KEY.h, borderRadius: KEY.r, boxSizing: "border-box", color: "#fff", fontFamily: SF,
        background: `rgba(${l(g, 22 - 8 * hot)},${l(g, 20 - 9 * hot)},${l(g, 18 - 10 * hot)},${l(1, 0.5 + 0.2 * hot)})`,
        boxShadow: `0 3px 0 rgba(27,27,27,${(1 - x).toFixed(2)}), inset 0 0 0 1.6px rgba(255,255,255,${(edge * x).toFixed(3)})`,
      }}
    >
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 0, height: KEY.h, display: "flex", alignItems: "center", justifyContent: "center", fontSize: letter ? 64 : 40, lineHeight: 1,
          paddingBottom: letter ? 8 : 0, boxSizing: "border-box", transformOrigin: "50% 50%", transform: pct ? "translateY(-25px) scale(0.64)" : undefined,
        }}
      >
        {c.label || <Glyph id={c.id} />}
      </div>
      {pct && (
        <div style={{ position: "absolute", left: -8, right: -8, bottom: 7, textAlign: "center", fontSize: c.id === "e" ? 36 : 35, fontWeight: 700, letterSpacing: -1, lineHeight: 1, color: c.id === "w" ? "#C9C9CE" : "#fff", fontVariantNumeric: "tabular-nums", transformOrigin: "50% 100%", transform: `scale(${(1 + 0.16 * beat).toFixed(4)})` }}>
          {pct}
        </div>
      )}
    </div>
  );
};

/** the zones under the glass */
const KbZoneGrowZones: React.FC<{ t: KbZoneGrowT }> = ({ t }) => {
  const { f } = useScene();
  if (f < t.xray) return null;
  const cells = kbZoneGrowCells((delay) => kbZoneGrowAmp(f - delay, t));
  const hot = prog(f, t.e, 7, ease.out); // the E's zone alone
  const swollen = prog(f, t.big - 2, 6);
  const crushed = prog(f, t.squeeze - 2, 10);
  const look = cells.map((c, i) => {
    const mx = (c.x0 + c.x1) / 2, my = (c.y0 + c.y1) / 2;
    const on = xray(f, t, mx, my);
    const ring = KbZoneGrowRING.indexOf(c.letter), ring2 = KbZoneGrowRING2.includes(c.letter);
    const isE = c.letter === "e";
    // a light closes in on the E from both sides before its zone is picked out
    // (it travels: each zone lights as the light passes it, the far ones first, the E's neighbours last)
    const away = Math.abs(mx - KbZoneGrowE.x) / 100 + (c.row ? 0.5 : 0);
    const pass = t.e - 3 - away * ((t.e - t.sweep) / 2.2);
    const sweep = isE || away > 3.6 ? 0 : f < pass ? prog(f, pass - 5, 5) : bump(f, pass, 15);
    const lit = ring >= 0 ? prog(f, t.lit[ring], 5) : 0;
    const flash = ring >= 0 ? bump(f, t.lit[ring], 14) * 0.3 + bump(f, t.squeeze - 1, 12) * 0.34 : ring2 ? bump(f, t.squeeze + 3, 14) * 0.2 : 0;
    let fill = 0.46 + 0.035 * Math.sin(f / 9 + i * 1.7) + 0.3 * bump(f, t.xray + (Math.hypot(mx - 140, my - 600) / 900) * FAR, 16) + 0.62 * sweep;
    if (isE) fill += (0.5 + 0.06 * Math.sin(f / 7)) * hot + 0.25 * bump(f, t.e, 12);
    else fill += flash - 0.1 * swollen * (ring >= 0 || ring2 ? 1 : 0.5) - (ring >= 0 ? 0.13 : 0) * crushed;
    return { c, isE, ring, on, fill: Math.max(0, Math.min(1, fill)) * on, lit };
  });
  const order = [...look.filter((l) => !l.isE && l.ring < 0), ...look.filter((l) => l.ring >= 0), ...look.filter((l) => l.isE)];
  return (
    <svg width={SHEET.w} height={SHEET.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="kzg-amber" cx="50%" cy="46%" r="72%">
          <stop offset="0%" stopColor="#FFD587" />
          <stop offset="38%" stopColor="#FFB02E" />
          <stop offset="78%" stopColor={AMBER} />
          <stop offset="100%" stopColor="#C66F00" />
        </radialGradient>
        <radialGradient id="kzg-amber-hot" cx="50%" cy="44%" r="74%">
          <stop offset="0%" stopColor="#FFF0C4" />
          <stop offset="34%" stopColor="#FFCB60" />
          <stop offset="74%" stopColor={AMBER} />
          <stop offset="100%" stopColor="#E88400" />
        </radialGradient>
        <filter id="kzg-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16" /></filter>
      </defs>
      {/* the light the E's zone throws on the ones around it */}
      {look.filter((l) => l.isE).map((l) => <path key="glow" d={l.c.d} fill={AMBER} opacity={0.75 * hot * l.on} filter="url(#kzg-glow)" />)}
      {order.map((l) => (
        <path
          key={l.c.letter} d={l.c.d} fill={l.isE && hot > 0 ? "url(#kzg-amber-hot)" : "url(#kzg-amber)"} fillOpacity={l.fill} strokeLinejoin="round"
          stroke={l.isE ? mix(hot, 0, 1, "#2A1700", "#FFF3D6") : mix(l.lit, 0, 1, "#2A1700", "#FFDD9A")} strokeOpacity={0.95 * l.on} strokeWidth={l.isE ? 3.5 + hot : 3.5 + 0.8 * l.lit}
        />
      ))}
    </svg>
  );
};

/** the message field and the QuickType bar, as "tim" left them: "what tim", and "time" picked out in the middle */
const KbZoneGrowBar: React.FC<{ t: KbZoneGrowT }> = ({ t }) => {
  const { f } = useScene();
  const y = KB_TOP + 34;
  // the caret blinks while the thumb is on its way, and stops when the thumb stops: time is held
  const caret = f >= t.stop || Math.floor((f - t.caret0) / 30) % 2 === 0;
  return (
    <>
      <div style={{ position: "absolute", left: 10, top: 9, width: 72, height: 72, borderRadius: 36, background: "#2A2A2C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={34} height={34} viewBox="0 0 34 34"><path d="M17 4 V30 M4 17 H30" stroke="#A9A9AE" strokeWidth={4} strokeLinecap="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 100, top: 5, width: 890, height: 80, borderRadius: 40, boxShadow: "inset 0 0 0 2.5px #3A3A3C", background: "#111113", display: "flex", alignItems: "center", paddingLeft: 30, boxSizing: "border-box", fontFamily: SF, fontSize: 42, color: "#fff", whiteSpace: "pre" }}>
        <span>what tim</span>
        <span style={{ width: 4, height: 50, borderRadius: 2, background: "#0A84FF", opacity: caret ? 1 : 0, marginLeft: 2, marginRight: 7 }} />
        <div style={{ position: "absolute", right: 9, top: 9, width: 62, height: 62, borderRadius: 31, background: "#0A84FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={32} height={34} viewBox="0 0 32 34"><path d="M16 30 V5 M5 16 L16 5 L27 16" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <div style={{ position: "absolute", left: SHEET.w / 3 + 14, top: y - 2, width: SHEET.w / 3 - 28, height: 70, borderRadius: 16, background: "#6B6B6B", opacity: 0.62 }} />
      {["times", "time", "timing"].map((w, i) => (
        <div key={w} style={{ position: "absolute", left: (i * SHEET.w) / 3, width: SHEET.w / 3, top: y, height: 66, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF, fontSize: 42, color: "#fff" }}>
          <span style={{ display: "inline-block", fontWeight: i === 1 ? 600 : 400, transform: i === 1 ? "translateY(-4px) scale(1.1)" : undefined }}>{w}</span>
        </div>
      ))}
      {[1, 2].map((i) => <div key={i} style={{ position: "absolute", left: (i * SHEET.w) / 3 - 1, top: KB_TOP + 38, width: 2, height: 60, background: "#404040", opacity: 0.2 }} />)}
    </>
  );
};

/** a hairline from the "96%" on the E cap to the edge of the E's zone. The number stays on the cap, the edge leaves:
 *  the line is the distance the zone has grown */
const KbZoneGrowReach: React.FC<{ t: KbZoneGrowT }> = ({ t }) => {
  const { f } = useScene();
  if (f < t.e) return null;
  const e = KbZoneGrowE;
  const [x, y] = kbZoneGrowMove(e.x, e.y + e.hh, () => kbZoneGrowAmp(f, t));
  const y0 = ROW_TOP[0] + KEY.h + 1;
  const k = prog(f, t.e, 8, ease.out);
  const y1 = y0 + (y - 2 - y0) * k;
  return (
    <svg width={SHEET.w} height={SHEET.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={`M${x} ${y0} V${y1.toFixed(2)}`} stroke="#fff" strokeWidth={1.6} strokeOpacity={0.95} />
      <circle cx={x} cy={y1} r={3.6 + 1.6 * bump(f, t.big + 1, 12)} fill="#fff" opacity={k} />
    </svg>
  );
};

export const KbZoneGrowBoard: React.FC<{ t: KbZoneGrowT }> = ({ t }) => {
  const { f } = useScene();
  const glass = prog(f, t.xray + 4, 20);
  return (
    <>
      <div style={{ position: "absolute", left: -14, top: KB_TOP - 6, width: SHEET.w + 28, height: KB_H + 20, borderRadius: 34, background: "#2B2B2B", boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: SHEET.w, height: SHEET.h, opacity: 0.7 }}>
        {CAPS.map((c) => <div key={c.id} style={{ position: "absolute", left: c.x, top: c.y + 3, width: c.w, height: KEY.h, borderRadius: KEY.r, background: "#161616", opacity: c.kind === "letter" ? 1 - 0.75 * glass * xray(f, t, centre(c.id).x, centre(c.id).y) : 1 }} />)}
      </div>
      <KbZoneGrowZones t={t} />
      {CAPS.map((c) => <KbZoneGrowCap key={c.id} c={c} t={t} />)}
      <KbZoneGrowBar t={t} />
      <KbZoneGrowReach t={t} />
    </>
  );
};
