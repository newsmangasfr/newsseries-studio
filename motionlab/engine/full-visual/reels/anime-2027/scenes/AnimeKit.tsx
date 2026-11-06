// anime-2027 : les pièces partagées. Les vraies affiches 2027 (assets/refs/animespiritnews-2027.jpg, découpées en
// 16 bandeaux), le calendrier mural 2027 (le fil rouge : une date confirmée y est épinglée en rouge), la punaise.
import React from "react";
import { Img, staticFile } from "remotion";
import { prog, ease } from "../../../src/engine";

export const RED = "#E32626"; // la seule couleur de l'invisible : « date confirmée »
export const PAPER = "#F3EFE6";
export const INK = "#1B1B1F";

export const PANEL = {
  shangri: "01-shangri-la-frontier", shield: "02-shield-hero", alya: "03-alya", medaka: "04-medaka-kuroiwa",
  mashle: "05-mashle", toxin: "06-marriage-toxin", frieren: "07-frieren", assassin: "08-worlds-finest-assassin",
  dungeon: "09-delicious-in-dungeon", solo: "10-solo-leveling", sakamoto: "11-sakamoto-days", demon: "12-demon-slayer",
  eminence: "13-eminence-in-shadow", onepiece: "14-one-piece-god-valley", lord: "15-lord-of-mysteries", haikyu: "16-haikyu",
} as const;
export type PanelId = keyof typeof PANEL;
export const ALL: PanelId[] = ["shangri", "shield", "alya", "medaka", "mashle", "toxin", "frieren", "assassin", "dungeon", "solo", "sakamoto", "demon", "eminence", "onepiece", "lord", "haikyu"];
export const src = (id: PanelId) => staticFile(`anime-2027/${PANEL[id]}.jpg`);
export const RATIO = 250 / 800; // les bandeaux font 800 x 250

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
/** une avancée lente qui ne s'arrête jamais : une image tenue continue de vivre */
export const drift = (f: number, from: number, k = 0.00022) => 1 + k * Math.max(0, f - from);

/** un bandeau d'affiche réel, centré sur (x, y), largeur w */
export const Card: React.FC<{ id: PanelId; x: number; y: number; w: number; rot?: number; o?: number; blur?: number; shine?: number; style?: React.CSSProperties }> = ({ id, x, y, w, rot = 0, o = 1, blur = 0, shine = 0, style }) => {
  const h = w * RATIO;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, opacity: o,
      borderRadius: Math.max(6, w * 0.018), overflow: "hidden", boxShadow: `0 ${w * 0.03}px ${w * 0.07}px rgba(0,0,0,0.55)`,
      outline: `${Math.max(1, w * 0.003)}px solid rgba(255,255,255,0.16)`, filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined, ...style }}>
      <Img src={src(id)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      {shine > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${lerp(-30, 110, shine) - 18}%, rgba(255,255,255,0.35) ${lerp(-30, 110, shine)}%, transparent ${lerp(-30, 110, shine) + 18}%)` }} />
      )}
    </div>
  );
};

/** une punaise rouge vue de trois quarts, avec son ombre portée */
export const Pin: React.FC<{ x: number; y: number; s?: number; drop?: number }> = ({ x, y, s = 1, drop = 1 }) => (
  <div style={{ position: "absolute", left: x - 14 * s, top: y - 14 * s - (1 - drop) * 60, width: 28 * s, height: 28 * s, opacity: clamp(drop * 3) }}>
    <div style={{ position: "absolute", left: 10 * s, top: 18 * s + (1 - drop) * 50, width: 20 * s, height: 8 * s, borderRadius: "50%", background: "rgba(0,0,0,0.35)", filter: "blur(2px)" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #ff8a8a 0%, ${RED} 45%, #8f1010 100%)`, boxShadow: "0 2px 3px rgba(0,0,0,0.4)" }} />
  </div>
);

const DOW = ["L", "M", "M", "J", "V", "S", "D"];

/** une page de calendrier mural 2027 à sa vraie géométrie : spirale, bandeau du mois, jours de la semaine, grille.
 *  start = jour de la semaine du 1er (0 = lundi). circle = le jour entouré en rouge, avec son tracé 0..1. */
export const CalendarPage: React.FC<{
  month: string; days: number; start: number; x: number; y: number; w: number; h: number;
  circle?: { day: number; p: number } | null; header?: React.ReactNode; sweep?: number; children?: React.ReactNode; style?: React.CSSProperties;
}> = ({ month, days, start, x, y, w, h, circle, header, sweep = 0, children, style }) => {
  const headH = h * 0.2, dowH = h * 0.08, gridTop = headH + dowH + h * 0.02, rowH = (h - gridTop - h * 0.03) / 6, colW = (w - 40) / 7;
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = i - start + 1;
    const inMonth = d >= 1 && d <= days;
    const col = i % 7, row = Math.floor(i / 7);
    const label = inMonth ? d : d < 1 ? 31 + d : d - days;
    cells.push(
      <div key={i} style={{ position: "absolute", left: 20 + col * colW, top: gridTop + row * rowH, width: colW, height: rowH, borderTop: "1px solid rgba(27,27,31,0.10)",
        borderLeft: col ? "1px solid rgba(27,27,31,0.07)" : undefined, fontSize: rowH * 0.38, fontWeight: 800, paddingLeft: 8, paddingTop: 4,
        color: !inMonth ? "rgba(27,27,31,0.22)" : col >= 5 ? "#b23a3a" : INK }}>{label}</div>,
    );
  }
  const ci = circle ? circle.day + start - 1 : -1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: PAPER, boxShadow: "0 30px 60px rgba(0,0,0,0.55), inset 0 -6px 0 rgba(0,0,0,0.06)", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: headH, background: `linear-gradient(180deg, ${RED}, #c41b1b)`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${w * 0.04}px`, color: "#fff" }}>
          {header ?? <span style={{ fontSize: headH * 0.52, fontWeight: 900, letterSpacing: -1 }}>{month}</span>}
          <span style={{ fontSize: headH * 0.36, fontWeight: 800, opacity: 0.9 }}>2027</span>
        </div>
        {DOW.map((d, i) => (
          <div key={i} style={{ position: "absolute", top: headH + h * 0.015, left: 20 + i * colW, width: colW, textAlign: "center", fontSize: dowH * 0.62, fontWeight: 800, color: i >= 5 ? "#b23a3a" : "rgba(27,27,31,0.55)" }}>{d}</div>
        ))}
        {cells}
        {sweep > 0 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${lerp(-40, 140, sweep) - 20}%, rgba(255,255,255,0.45) ${lerp(-40, 140, sweep)}%, transparent ${lerp(-40, 140, sweep) + 20}%)` }} />}
        {ci >= 0 && circle && (
          <svg style={{ position: "absolute", left: 20 + (ci % 7) * colW - 4, top: gridTop + Math.floor(ci / 7) * rowH - 2, overflow: "visible" }} width={colW + 8} height={rowH + 4}>
            <ellipse cx={(colW + 8) / 2} cy={(rowH + 4) / 2} rx={colW / 2} ry={rowH / 2 - 2} fill="none" stroke={RED} strokeWidth={5} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circle.p} transform={`rotate(-8 ${(colW + 8) / 2} ${(rowH + 4) / 2})`} />
          </svg>
        )}
      </div>
      {/* la spirale de reliure, par-dessus le bord du haut */}
      {Array.from({ length: 13 }, (_, i) => (
        <div key={i} style={{ position: "absolute", top: -16, left: w * 0.06 + i * ((w * 0.88) / 12) - 6, width: 12, height: 34, borderRadius: 6, background: "linear-gradient(90deg, #6d6d72, #e6e6ea 45%, #77777c)", boxShadow: "0 2px 3px rgba(0,0,0,0.5)" }} />
      ))}
      {children}
    </div>
  );
};

/** fond : la lumière qui traverse lentement la pièce, pour que le fond ne soit jamais nu */
export const Room: React.FC<{ f: number; tint?: string; x?: number; y?: number }> = ({ f, tint = "rgba(227,38,38,0.16)", x = 450, y = 980 }) => (
  <div style={{ position: "absolute", left: -90, top: 0, width: 1080, height: 1920,
    background: `radial-gradient(circle at ${x + 90 + Math.sin(f / 70) * 60}px ${y + Math.cos(f / 90) * 40}px, ${tint} 0%, rgba(16,16,16,0) 55%)` }} />
);

/** une case vers sa place, sur la durée d'un geste */
export const toward = (f: number, at: number, dur = 16) => prog(f, at, dur, ease.inOut);
