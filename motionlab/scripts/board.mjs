#!/usr/bin/env node
// board.mjs
// Contract: writes workspace/board.html, a static snapshot and fallback for the live workspace. It answers three questions
//   and shows nothing else: what can I post now, what is being made, what do you need from me.
//   in : workspace/output/*/ (the videos, their captions, tracker.json), workspace/library/<pack>.json (setup, the
//        workspace/library/<pack>.json per installed pack, context/profile.json, context/start.json, runtime.json
//   out: workspace/board.html through pageShell. What is ready to post comes first, because it is the only thing on the
//        page the buyer can act on today; then one line and one meter per format of their account; then what is needed
//        from them, and only when something is. Folder names, project states, stage numbers, script names and the input
//        queue are the folder showing its working: none of it belongs here. A video with no cover gets one poster frame
//        written beside it, once, so the page never shows a black rectangle.
//   Static page, no server. Exits 0.
import { readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, relative, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { P, readJson, installedPacks, pageShell, ffbin, whatNext } from "./_lib.mjs";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const list = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => !d.name.startsWith(".")) : []);
const rel = (p) => relative(P("workspace"), p).split("\\").join("/");
const num = (n) => Number(n).toLocaleString("fr-FR");
const two = (n) => String(n).padStart(2, "0");
const count = (n, one, many) => `${n === 0 ? "0" : num(n)} ${n === 1 ? one : many}`;

const start = readJson(P("context", "start.json"));
const profile = readJson(P("context", "profile.json"), {});
const packs = installedPacks();
let workspaceUrl = null;
try { workspaceUrl = execFileSync(process.execPath, [P("scripts", "workspace.mjs"), "--ensure", "--no-open"], { encoding: "utf8", timeout: 15000 }).trim(); } catch {}

// ── What you can post ────────────────────────────────────────────────────────────────────────
// One tile per finished video: the video itself, what was changed in it, and its caption with a button that copies it.
const CHANGED = { line: "d’autres mots", cards: "d’autres cartes", song: "un autre son", caption: "une autre légende", text: "un autre style de texte", colour: "une autre couleur", opening: "une autre ouverture", rhythm: "un autre rythme", end_card: "une autre carte de fin" };
const changedWords = (axis) => (!axis ? "" : axis.startsWith("shot") ? "un autre clip de toi" : CHANGED[axis] ?? `un autre réglage : ${axis.replace(/[:_]/g, " ")}`);

function posterFor(dir, mp4) {
  const cover = join(dir, "cover.jpg");
  if (existsSync(cover)) return cover;
  const own = join(dir, `${basename(mp4, ".mp4")}.poster.jpg`);
  if (existsSync(own)) return own;
  const ff = ffbin("ffmpeg");
  if (!ff) return null;
  try { execFileSync(ff, ["-nostdin", "-y", "-v", "error", "-ss", "0.2", "-i", mp4, "-frames:v", "1", "-vf", "scale=-2:640", "-q:v", "4", own]); return own; } catch { return null; }
}

const ready = list(P("workspace", "output")).filter((d) => d.isDirectory()).sort((a, b) => (a.name < b.name ? 1 : -1)).flatMap((d) => {
  const dir = P("workspace", "output", d.name);
  const files = list(dir).map((x) => x.name);
  const tracker = readJson(join(dir, "tracker.json"), []) ?? [];
  const silent = files.includes("sound-card.md");
  return files.filter((f) => f.endsWith(".mp4")).sort().map((f) => {
    const mp4 = join(dir, f);
    const capFile = [join(dir, `${basename(f, ".mp4")}.caption.txt`), join(dir, "caption.txt")].find(existsSync);
    const t = tracker.find((x) => x.file === f) ?? {};
    return { mp4, poster: posterFor(dir, mp4), silent, caption: capFile ? readFileSync(capFile, "utf8").trim() : "",
      changed: changedWords(t.axis), posted: t.posted_on ?? null, plays: t.plays ?? null };
  });
});

const readyHtml = ready.map((v) => `<div class="card">
<div class="media"><video controls preload="none"${v.poster ? ` poster="${esc(rel(v.poster))}"` : ""} src="${esc(rel(v.mp4))}"></video></div>
<div class="body">${v.posted ? `<p class="muted">Publiée le ${esc(String(v.posted).slice(0, 10))}${v.plays ? `, ${num(v.plays)} vues` : ""}</p>` : ""}
${v.changed ? `<p>Même format que le post d’origine, avec ${esc(v.changed)}.</p>` : ""}
${v.silent ? `<p class="muted">Muette. Le son est indiqué sur la carte dans son dossier.</p>` : ""}
${v.caption ? `<pre class="caption">${esc(v.caption)}</pre><button class="copy" onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent)">Copier la légende</button>` : ""}
</div></div>`).join("");

// ── What is being made ───────────────────────────────────────────────────────────────────────
// One line per format of the buyer's own account, from the pack's plan file, in the words the plan already uses.
// One file a format, and one answer in it. The plan used to be written twice, to context/<pack>/plan.json and to
// workspace/library/<pack>.json, with this page reading one and the handoff reading the other; the day one was
// written and the other was not, the folder said two different things about where the buyer was.
const plans = packs.map((pk) => ({ pack: pk, plan: readJson(P("workspace", "library", `${pk.name}.json`))?.plan })).filter((x) => x.plan?.formats?.length);
const where = (f) => f.line ? f.line
  : !f.studied ? "on ne l’a pas encore regardé"
  : !f.first?.project ? "on fait la première version"
  : f.first.presented && !f.first.agreed_at ? "une version t’attend, on attend ton avis"
  : (f.ready ?? []).length ? "on fait le reste maintenant" : "terminé pour l’instant";
// What this format works on, in the buyer's word for it. A pack says so or the board says post.
const unit = (f) => f.unit ?? "post";
const meter = (done, readyN, waiting) => {
  const total = Math.max(1, done + readyN + waiting);
  const w = (n) => `${(n / total) * 100}%`;
  return `<div class="meter" role="img" aria-label="${done} faits, ${readyN} prêts, ${waiting} en attente">${done ? `<i class="done" style="width:${w(done)}"></i>` : ""}${readyN ? `<i class="ready" style="width:${w(readyN)}"></i>` : ""}${waiting ? `<i class="waiting" style="width:${w(waiting)}"></i>` : ""}</div>`;
};
const madeHtml = plans.map(({ plan }) => plan.formats.map((f) => {
  const done = (f.done ?? []).length, readyN = (f.ready ?? []).length, waiting = (f.waiting ?? []).length;
  const u = unit(f);
  const parts = [done ? `${count(done, `${u} fait`, `${u}s faits`)}` : null, readyN ? `${num(readyN)} prêt${readyN === 1 ? "" : "s"} dès que tu dis go` : null, waiting ? `${num(waiting)} qui t’attend${waiting === 1 ? "" : "ent"}` : null].filter(Boolean);
  const line = where(f);
  const tail = parts.join(", ") || (Number.isFinite(f.posts) ? `${count(f.posts, u, `${u}s`)} à toi dans ce format` : "");
  return `<h3>${esc(f.name)}</h3><p>${esc(line[0].toUpperCase() + line.slice(1))}.</p>${meter(done, readyN, waiting)}${tail ? `<p class="muted">${esc(tail)}</p>` : ""}`;
}).join("")).join("");

// ── What we need from you ────────────────────────────────────────────────────────────────────
// One entry per thing the buyer has to do: the thing itself as the headline, one line under it, where it goes, and the
// page that draws it beside crops of their own posts. A need said as a bare sentence in a bullet list is the version of
// this page that could not be read.
const needs = [];
if (!start?.done && packs.some(pack => pack.needs?.account !== false)) needs.push({ what: "Dis : configure-moi", line: "Deux minutes, et presque aucune question." });
else if (!packs.length) needs.push({ what: "Ajoute le format que tu as acheté", line: "Dis : ajoute le format que j’ai acheté." });
for (const { plan } of plans) {
  for (const f of plan.formats) {
    if (f.first?.presented && !f.first.agreed_at) needs.push({ what: `${f.name} : dis go, ou dis quoi changer`, line: "Elle t’attend. Rien d’autre n’est fait avant que tu la regardes.", page: plan.page });
    for (const n of f.needs ?? []) needs.push({ what: n.what, line: n.line, where: n.where, count: f.waiting?.length ?? 0, unit: f.unit, format: f.name, page: n.page ?? plan.page ?? null });
  }
}
// The same answer the agent acts on, from the same function, so the page and the chat never say two different things.
const now = whatNext();
const nextLine = now.say;

// The steps of the format that is live, drawn: where the buyer is, what is behind them, what is still to come.
const liveLib = now.format ? readJson(P("workspace", "library", `${now.format.pack}.json`)) : null;
// The ladder repeats, so the foot says which pass and which format, from what the format's own plan worked out.
// Counting either of them here would make the board the second answer to a question the plan already answers.
const foot = (() => {
  const st = liveLib?.stage; if (!st) return "";
  const bits = [], r = st.round;
  if (r?.line && (r.n > 1 || r.more)) bits.push(r.line);
  if (st.formats_of > 1 && ["study", "first", "all"].includes(st.id)) bits.push(`Format ${Math.min((st.formats_done ?? 0) + 1, st.formats_of)} sur ${st.formats_of}`);
  return bits.length ? `<p class="strip-foot">${esc(bits.join(". "))}.</p>` : "";
})();
const steps = liveLib?.stages?.length && liveLib?.stage
  ? `<p class="dek">${esc(now.format.stage?.format ? `${now.format.stage.format}, étape ${liveLib.stage.n} sur ${liveLib.stage.of}.` : `Étape ${liveLib.stage.n} sur ${liveLib.stage.of}.`)}</p>
<ol class="stages">${liveLib.stages.map((st) => {
      const cls = st.n < liveLib.stage.n ? "done" : st.n === liveLib.stage.n ? "on" : "";
      return `<li class="${cls}"><span class="mk" aria-hidden="true"></span><span class="sn">${String(st.n).padStart(2, "0")}</span><span class="nm">${esc(st.name)}</span><span class="ds">${esc(st.does ?? "")}</span><span class="st">${cls === "done" ? "fait" : cls === "on" ? "ici" : ""}</span></li>`;
    }).join("")}</ol>${foot}`
  : "";

// Everything needed is listed here, the one at the top included: a section that hides its only item because the line
// above said it leaves the buyer with a heading and nothing under it, which is what made this page unreadable.
const needsHtml = needs.length
  ? `<ol class="asks">${needs.map((n, i) => `<li class="ask${i === 0 ? " first" : ""}"><div class="n">${two(i + 1)}</div><div class="about">
${i === 0 ? '<div class="head"><span class="chip accent">commence ici</span></div>' : ""}<h3>${esc(n.what)}</h3>${n.line ? `<p>${esc(n.line)}</p>` : ""}
${n.format && n.count ? `<p class="for">${esc(n.format)} &middot; ${num(n.count)} ${esc(n.unit ?? "post")}${n.count === 1 ? "" : "s"} en attente</p>` : ""}
${n.where ? `<p class="drop">Dépose-les dans <code>${esc(n.where)}</code>. Peu importe les noms.</p>` : ""}
${n.page ? `<p class="drop"><a href="${esc(n.page)}">La même demande avec des extraits de tes propres posts</a></p>` : ""}</div></li>`).join("")}</ol>`
  : `<p class="dek">${ready.length ? "Rien. Publie ce qui est au-dessus." : "Rien pour l’instant."}</p>`;

// ── The page ─────────────────────────────────────────────────────────────────────────────────
const chips = packs.map((p) => {
  const s = readJson(P("workspace", "library", `${p.name}.json`));
  const state = !s?.setup?.done ? "pas encore configuré" : "prêt";
  return `<span class="chip ${state === "prêt" ? "ok" : "warn"}">${esc(p.name.replace(/-/g, " "))}: ${esc(state)}</span>`;
}).join(" ");

const body = `<header class="top">
<h1>${profile.handle ? `MotionLab pour @${esc(profile.handle)}` : "MotionLab"}</h1>
<p class="dek">Enregistré le ${esc(new Date().toLocaleDateString("fr-FR"))}. ${workspaceUrl ? `<a href="${esc(workspaceUrl)}">Ouvre ton espace de travail</a> pour les étapes en cours.` : "Demande à ton agent d’ouvrir ton espace de travail pour les étapes en cours."}</p>
<div class="next"><span class="lbl">Quoi faire maintenant</span><p>${esc(nextLine)}</p></div>
</header>
<main class="plain">
${ready.length ? `<h2>Prêt à publier</h2><p class="dek">${count(ready.length, "vidéo", "vidéos")}, ${ready.length === 1 ? "avec sa légende" : "chacune avec sa légende"}. Publies-en une par jour.</p><div class="grid">${readyHtml}</div>` : ""}
${steps ? `<h2>Où on en est</h2>${steps}` : ""}
<h2>Ce dont on a besoin de toi</h2>
${needsHtml}
${madeHtml ? `<h2>Ce qu’on fabrique</h2>${madeHtml}` : ""}
<p class="footnote">Ce que tu publies est dans <code>output</code>, un dossier par vidéo. ${chips}</p>
</main>`;

writeFileSync(P("workspace", "board.html"), pageShell("MotionLab", body));
console.log(`board : ${ready.length} prêt(s) à publier, ${plans.reduce((n, x) => n + x.plan.formats.length, 0)} formats -> workspace/board.html`);
