// anime-2027 : les scènes. Chaque changement tombe sur son mot avec cue() / endsOn().
import React from "react";
import { Column, ease, prog, useScene, LEAD, blurIn, typeOn } from "../../../src/engine";
import { ALL, Card, CalendarPage, Pin, Room, RED, PAPER, INK, drift, lerp, clamp, toward, type PanelId } from "./AnimeKit";

const S: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Column><div style={{ position: "absolute", inset: 0, fontFamily: "Inter, sans-serif" }}>{children}</div></Column>
);

// ---------------------------------------------------------------- accroche
/** image 0 : les seize vraies affiches 2027 foncent déjà vers nous dans un tunnel. Elles s'assemblent en mur
 *  (le vrai visuel de la saison), le mur tremble puis explose sur « folle », et sur « Regardez » la couverture du
 *  calendrier mural 2027 tombe au centre : c'est le monde de toute la vidéo. */
export const Hook: React.FC = () => {
  const { f, cue } = useScene();
  const build = Math.max(2, cue("folle") - 44);
  const shake = prog(f, cue("folle") - 8, 8, ease.linear) * (1 - prog(f, cue("folle"), 4, ease.linear));
  const burst = prog(f, cue("folle"), 26, ease.out);
  const cover = prog(f, cue("Regardez") - 14, 16, ease.out);
  const cards = ALL.map((id, i) => {
    const ang = (i / 16) * Math.PI * 2 + 0.4;
    const dir = [Math.cos(ang), Math.sin(ang)];
    const z = ((i / 16) + f / 80) % 1;
    const tz = 0.08 + 1.25 * z * z;
    const tx = 450 + dir[0] * (40 + 560 * Math.pow(z, 1.6));
    const ty = 985 + dir[1] * (30 + 700 * Math.pow(z, 1.6));
    const col = i % 2, row = Math.floor(i / 2);
    const wx = 225 + col * 450, wy = 545 + row * 122 + 55;
    const m = prog(f, build + i * 1.5, 22, ease.inOut);
    const x = lerp(tx, wx, m) + dir[0] * 820 * burst + Math.sin(f * 2.3 + i) * 12 * shake;
    const y = lerp(ty, wy, m) + dir[1] * 980 * burst + Math.cos(f * 2.9 + i) * 9 * shake;
    const w = lerp(420 * tz, 430, m) * (1 + 1.3 * burst);
    const rot = lerp((dir[0] * 14) * (1 - z), 0, m) + dir[0] * 30 * burst;
    const o = clamp(z * 8) * (m > 0 ? 1 : 1) * (1 - prog(f, cue("folle") + 12, 12, ease.linear));
    return { id, x, y, w, rot, o: Math.max(o, m * (1 - burst * 0.9)), blur: burst * 10, z: m > 0.5 ? 100 + i : Math.round(z * 100) };
  }).sort((a, b) => a.z - b.z);
  return (
    <S>
      <Room f={f} tint={`rgba(227,38,38,${0.10 + 0.25 * burst})`} />
      {cards.map((c) => <Card key={c.id} id={c.id as PanelId} x={c.x} y={c.y} w={c.w} rot={c.rot} o={c.o} blur={c.blur} />)}
      {/* la couverture du calendrier 2027 : elle tombe avec du poids, rebondit à peine */}
      <div style={{ position: "absolute", left: 60, top: lerp(-900, 560, cover) + Math.sin(cover * Math.PI) * -20, width: 780, height: 860, opacity: cover > 0 ? 1 : 0,
        transform: `rotate(${lerp(-12, -2, cover)}deg) scale(${drift(f, cue("Regardez"), 0.0012)})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: `linear-gradient(160deg, ${RED} 0%, #a81414 100%)`, boxShadow: "0 40px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", color: PAPER, fontWeight: 900, fontSize: 300, letterSpacing: -14, lineHeight: 1 }}>2027</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center", color: "rgba(255,255,255,0.85)", fontWeight: 800, fontSize: 40, letterSpacing: 10 }}>CALENDRIER ANIME</div>
          <div style={{ position: "absolute", left: 70, right: 70, top: 520, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {ALL.map((id, i) => <div key={id} style={{ position: "relative", height: 50, borderRadius: 6, overflow: "hidden", opacity: prog(f, cue("Regardez") + i, 6) }}><Card id={id} x={80} y={25} w={160} /></div>)}
          </div>
        </div>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ position: "absolute", top: -16, left: 50 + i * 62, width: 12, height: 34, borderRadius: 6, background: "linear-gradient(90deg, #6d6d72, #e6e6ea 45%, #77777c)" }} />
        ))}
      </div>
    </S>
  );
};

// ---------------------------------------------------------------- les mois confirmés
type Entry = { id: PanelId; word: string };

/** une page du mois : chaque affiche arrive en grand sur son nom, puis va se faire épingler sur la page quand la
 *  suivante arrive. La page se remplit : c'est ce qui est confirmé. */
const MonthScene: React.FC<{ month: string; monthWord: string; days: number; start: number; entries: Entry[]; flip?: boolean }> = ({ month, monthWord, days, start, entries, flip }) => {
  const { f, cue, scene } = useScene();
  const enter = scene.from - LEAD;
  const page = prog(f, enter, 16, ease.out);
  const circle = prog(f, cue(monthWord) + 2, 14, ease.inOut);
  const calX = 20, calY = 548, calW = 860, calH = 440;
  const slot = (k: number) => ({ x: calX + 150 + (k % 3) * 290, y: calY + 205 + Math.floor(k / 3) * 115, w: 262, rot: [-3, 2, -1.5, 3, -2][k % 5] });
  const s = drift(f, scene.from);
  return (
    <S>
      <Room f={f} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${s})`, transformOrigin: "450px 900px" }}>
        <CalendarPage month={month} days={days} start={start} x={calX} y={calY} w={calW} h={calH} circle={{ day: 1, p: circle }} sweep={prog(f, cue(monthWord), 40, ease.linear)}
          style={{ transform: flip ? `perspective(1600px) rotateX(${lerp(-95, 0, page)}deg)` : `translateY(${lerp(-260, 0, page)}px)`, transformOrigin: "50% 0%", opacity: clamp(page * 4) }} />
        {entries.map((e, k) => {
          const at = cue(e.word);
          const next = k + 1 < entries.length ? cue(entries[k + 1].word) : 1e7;
          const inP = prog(f, at - 6, 12, ease.out);
          const go = toward(f, next - 4, 16);
          const sl = slot(k);
          const x = lerp(450, sl.x, go), y = lerp(1215, sl.y, go) + (1 - inP) * 160;
          const w = lerp(880, sl.w, go) * lerp(0.9, 1, inP);
          if (f < at - 6) return null;
          return (
            <React.Fragment key={e.id}>
              <Card id={e.id} x={x} y={y} w={w} rot={lerp(0, sl.rot, go)} o={clamp(inP * 2)} blur={(1 - inP) * 12} shine={prog(f, at + 4, 26, ease.linear)} />
              {go > 0.9 && <Pin x={sl.x} y={sl.y - sl.w * 0.156 + 6} s={0.9} drop={prog(f, next + 10, 8, ease.back)} />}
            </React.Fragment>
          );
        })}
      </div>
    </S>
  );
};

export const Jan: React.FC = () => (
  <MonthScene month="JANVIER" monthWord="janvier:" days={31} start={4}
    entries={[{ id: "shangri", word: "Shangri-La" }, { id: "mashle", word: "Mashle" }, { id: "sakamoto", word: "Sakamoto" }, { id: "medaka", word: "Medaka" }, { id: "toxin", word: "Marriage" }]} />
);
export const Oct: React.FC = () => (
  <MonthScene month="OCTOBRE" monthWord="octobre," days={31} start={4} flip entries={[{ id: "frieren", word: "Frieren" }, { id: "dungeon", word: "Delicious" }]} />
);

// ---------------------------------------------------------------- l'été : la salle de cinéma
/** une vraie salle : l'écran large en perspective, le faisceau du projecteur, les rangées de fauteuils. Sur « été »
 *  la lumière chaude monte, sur « Piece: » le projecteur s'allume et l'affiche se projette en clignotant. */
export const Ete: React.FC = () => {
  const { f, cue, scene } = useScene();
  const warm = prog(f, cue("été,") - 4, 20);
  const beam = prog(f, cue("Piece:") - 8, 6, ease.linear);
  const flick = f < cue("Piece:") - 2 ? 0.18 + 0.1 * warm : 0.75 + 0.25 * Math.abs(Math.sin(f * 1.7)) * (1 - prog(f, cue("Piece:") + 8, 20));
  const push = drift(f, scene.from, 0.0009);
  return (
    <S>
      <div style={{ position: "absolute", left: -90, top: 520, width: 1080, height: 930, background: `radial-gradient(ellipse at 50% 30%, rgba(255,170,60,${0.10 + 0.22 * warm}) 0%, rgba(16,16,16,0) 65%)` }} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "450px 820px" }}>
        {/* l'écran et son cadre noir mat */}
        <div style={{ position: "absolute", left: 10, top: 600, width: 880, height: 400, transform: "perspective(1400px) rotateX(8deg)", transformOrigin: "50% 100%",
          background: "#1d1d20", borderRadius: 8, boxShadow: `0 0 ${120 * flick}px rgba(255,210,120,${0.35 * flick})`, padding: 18 }}>
          <div style={{ position: "relative", width: "100%", height: "100%", background: "#dcd8cf", overflow: "hidden", borderRadius: 4 }}>
            <div style={{ position: "absolute", inset: 0, opacity: flick }}>
              <Card id="onepiece" x={422} y={182} w={1170} style={{ borderRadius: 0, boxShadow: "none" }} />
            </div>
          </div>
        </div>
        {/* le faisceau du projecteur, depuis la cabine au fond */}
        <div style={{ position: "absolute", left: 300, top: 760, width: 300, height: 700, opacity: beam * 0.55,
          background: "linear-gradient(0deg, rgba(255,235,190,0.0) 0%, rgba(255,235,190,0.25) 60%, rgba(255,235,190,0.05) 100%)", clipPath: "polygon(48% 100%, 52% 100%, 100% 0%, 0% 0%)", filter: "blur(6px)" }} />
        {/* les rangées de fauteuils en contre-jour */}
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ position: "absolute", left: -60 - r * 30, top: 1130 + r * 100, width: 1020 + r * 60, height: 140, display: "flex", gap: 6, justifyContent: "center" }}>
            {Array.from({ length: 11 + r }, (_, i) => (
              <div key={i} style={{ width: 80, height: 120, borderRadius: "40px 40px 10px 10px", background: `linear-gradient(180deg, #2a1416 0%, #120b0c 100%)`,
                boxShadow: `inset 0 6px 0 rgba(255,200,140,${0.08 + 0.2 * flick * (1 - r * 0.3)})` }} />
            ))}
          </div>
        ))}
      </div>
    </S>
  );
};

// ---------------------------------------------------------------- les films : la pellicule
const FILMS: { id: PanelId; word: string }[] = [{ id: "solo", word: "Solo" }, { id: "eminence", word: "Eminence" }, { id: "haikyu", word: "Haikyu" }, { id: "demon", word: "Demon" }];
const FRAME_W = 800, FRAME_H = 250, GAP = 70;

/** une vraie bande 35 mm : perforations, numéros de bord, une image par film. Elle défile et s'arrête sur chaque
 *  film à son nom. Le dernier est une rumeur : flou sur « rumeur », il se précise sur « Demon », la caméra entre
 *  dedans sur « Forteresse ». */
export const Films: React.FC = () => {
  const { f, cue, scene } = useScene();
  const enter = scene.from - LEAD;
  const stops = FILMS.map((m) => cue(m.word));
  let pos = -1.4 + 1.4 * prog(f, enter, 14, ease.out);
  stops.forEach((st, i) => { if (i > 0) pos += prog(f, st - 12, 14, ease.inOut); });
  const rumor = prog(f, cue("rumeur") - 6, 10);
  const sharp = prog(f, cue("Demon") - 2, 16, ease.inOut);
  const dive = prog(f, cue("Forteresse") - 10, 22, ease.inOut);
  const run = (f % 4) * 0.6; // le léger tremblé du défilement
  const x0 = 450 - pos * (FRAME_W + GAP);
  return (
    <S>
      <Room f={f} tint="rgba(255,190,90,0.10)" />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1, 2.6, dive) * drift(f, scene.from)})`, transformOrigin: "450px 985px" }}>
        <div style={{ position: "absolute", left: -400, top: 985 - 210 + run, width: 1700, height: 420, background: "linear-gradient(180deg, #2b1d12, #1a120b)", boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
          {Array.from({ length: 34 }, (_, i) => {
            const hx = ((i * 50 - (pos * (FRAME_W + GAP)) % 50) + 5000) % 1700;
            return (
              <React.Fragment key={i}>
                <div style={{ position: "absolute", left: hx, top: 22, width: 28, height: 36, borderRadius: 5, background: "#0b0907" }} />
                <div style={{ position: "absolute", left: hx, top: 362, width: 28, height: 36, borderRadius: 5, background: "#0b0907" }} />
              </React.Fragment>
            );
          })}
          {FILMS.map((m, i) => (
            <div key={m.id} style={{ position: "absolute", left: 400 + x0 + i * (FRAME_W + GAP) - FRAME_W / 2 - 400 + 400, top: 64, width: FRAME_W, color: "rgba(255,200,120,0.55)", fontWeight: 700, fontFamily: "monospace",
              fontSize: 18, // texture
            }}>
              <span style={{ position: "absolute", top: -2, left: 40 }}>KODAK 5219  {14 + i * 7}</span>
            </div>
          ))}
        </div>
        {FILMS.map((m, i) => {
          const x = x0 + i * (FRAME_W + GAP);
          const isDemon = m.id === "demon";
          const blur = isDemon ? lerp(0, 22, rumor) * (1 - sharp) : 0;
          const lit = 1 - 0.55 * clamp(Math.abs(x - 450) / 700);
          return (
            <div key={m.id} style={{ position: "absolute", left: x - FRAME_W / 2, top: 985 - FRAME_H / 2 + run, width: FRAME_W, height: FRAME_H, filter: `brightness(${lit})` }}>
              <Card id={m.id} x={FRAME_W / 2} y={FRAME_H / 2} w={FRAME_W} blur={blur} style={{ borderRadius: 4 }} shine={isDemon ? 0 : prog(f, stops[i], 28, ease.linear)} />
              {isDemon && rumor > 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: rumor * (1 - sharp),
                  fontSize: 220, fontWeight: 900, color: "rgba(255,255,255,0.9)", textShadow: "0 8px 30px rgba(0,0,0,0.7)" }}>?</div>
              )}
            </div>
          );
        })}
      </div>
    </S>
  );
};

// ---------------------------------------------------------------- sans date : la pile à côté du calendrier
const TBA: { id: PanelId; word: string }[] = [{ id: "shield", word: "Shield" }, { id: "alya", word: "Alya" }, { id: "assassin", word: "Finest" }, { id: "lord", word: "Lord" }];
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ?#";

/** la page du calendrier n'a pas de mois : son nom se brouille sans jamais se fixer (« date »). Chaque affiche arrive
 *  en grand puis tombe sur une pile en vrac, sans punaise : rien n'est encore confirmé. */
export const Tba: React.FC = () => {
  const { f, cue, scene } = useScene();
  const enter = scene.from - LEAD;
  const page = prog(f, enter, 14, ease.out);
  const scramble = f >= cue("date") - 4;
  const name = scramble ? Array.from({ length: 7 }, (_, i) => GLYPHS[(Math.floor(f / 3) * 7 + i * 13) % GLYPHS.length]).join("") : "????";
  const pile = (k: number) => ({ x: 450 + [-150, 140, -60, 110][k], y: 1290 + [0, -14, 10, -6][k], rot: [-9, 7, -3, 11][k], w: 520 });
  return (
    <S>
      <Room f={f} tint="rgba(150,150,170,0.12)" />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${drift(f, scene.from)})`, transformOrigin: "450px 900px" }}>
        <CalendarPage month="" days={30} start={0} x={140} y={548} w={620} h={330} sweep={prog(f, cue("date"), 30, ease.linear)}
          header={<span style={{ fontSize: 40, fontWeight: 900, letterSpacing: 6, fontFamily: "monospace", opacity: scramble ? 0.95 : 0.6 }}>{name}</span>}
          style={{ transform: `translateY(${lerp(-240, 0, page)}px) rotate(-1.5deg)`, opacity: clamp(page * 4), filter: "saturate(0.6)" }} />
        {TBA.map((e, k) => {
          const at = cue(e.word);
          const next = k + 1 < TBA.length ? cue(TBA[k + 1].word) : 1e7;
          if (f < at - 6) return null;
          const inP = prog(f, at - 6, 12, ease.out);
          const fall = toward(f, next - 4, 14);
          const p = pile(k);
          const bounce = fall >= 1 ? Math.sin(prog(f, next + 10, 10, ease.linear) * Math.PI) * -10 : 0;
          return <Card key={e.id} id={e.id} x={lerp(450, p.x, fall)} y={lerp(1060, p.y, fall) + (1 - inP) * 140 + bounce} w={lerp(860, p.w, fall)} rot={lerp(0, p.rot, fall)}
            o={clamp(inP * 2)} blur={(1 - inP) * 12} style={{ filter: fall > 0.5 ? "saturate(0.75)" : undefined }} />;
        })}
      </div>
    </S>
  );
};

// ---------------------------------------------------------------- la fin : à toi de choisir
/** les seize affiches de l'année en mur ; un projecteur passe de l'une à l'autre (« lequel ? »), puis la vraie barre
 *  de commentaire monte et une réponse s'y tape sur « commentaire ». */
export const Cta: React.FC = () => {
  const { f, cue, scene, fps } = useScene();
  const enter = scene.from - LEAD;
  const pick = Math.floor(Math.max(0, f - cue("plus?") + 8) / 5) % 16;
  const bar = prog(f, cue("commentaire!") - 12, 12, ease.out);
  const typed = typeOn("Frieren saison 3, sans hésiter", f, cue("commentaire!") + 2, fps, 34);
  return (
    <S>
      <Room f={f} />
      {ALL.map((id, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = 117 + col * 222, y = 620 + row * 82;
        const a = prog(f, enter + ((col + row) % 7) * 2, 10, ease.out);
        const hot = f >= cue("plus?") - 8 && pick === i;
        return <Card key={id} id={id} x={x} y={y + (1 - a) * 60} w={210} o={a * (hot ? 1 : 0.55)} style={{ transform: `scale(${hot ? 1.18 : 1})`, zIndex: hot ? 5 : 1, outline: hot ? `4px solid ${RED}` : undefined }} />;
      })}
      {/* la barre de commentaire, à sa vraie géométrie : avatar, champ arrondi, bouton d'envoi */}
      <div style={{ position: "absolute", left: 30, top: lerp(1450, 1000, bar), width: 840, height: 150, opacity: bar, background: "#1f1f22", borderRadius: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 22, padding: "0 26px" }}>
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, #ff7b7b, ${RED})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 34 }}>NM</div>
        <div style={{ flex: 1, height: 84, borderRadius: 42, background: "#2d2d31", display: "flex", alignItems: "center", padding: "0 30px", fontSize: 36, fontWeight: 600, color: typed.text ? "#f2f2f2" : "#8a8a90" }}>
          {typed.text || "Ajouter un commentaire…"}{typed.typing && <span style={{ color: RED }}>|</span>}
        </div>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: typed.done ? RED : "#3a3a3f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 34, fontWeight: 900 }}>↑</div>
      </div>
    </S>
  );
};
