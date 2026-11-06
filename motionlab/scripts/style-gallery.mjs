#!/usr/bin/env node
// style-gallery.mjs
// Contract: rebuilds styles/galerie.html from every styles/<id>/ that holds a style.json and a style.md (the six
//   ready-made styles and the creator's own perso-<name>/ styles), with apercu.mp4 or apercu.jpg when present.
//   Prints { ok, page, styles }. Writes nothing else; the styles themselves are never changed.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { P } from "./_lib.mjs";

const root = P("styles");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ids = existsSync(root) ? readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : [];

const cards = [];
for (const id of ids) {
  const dir = join(root, id);
  if (!existsSync(join(dir, "style.json")) || !existsSync(join(dir, "style.md"))) continue;
  const meta = JSON.parse(readFileSync(join(dir, "style.json"), "utf8"));
  const md = readFileSync(join(dir, "style.md"), "utf8");
  const look = (md.split(/\n\s*\n/)[1] || "").trim();
  const use = (md.match(/\*\*Pour quels sujets :\*\* (.+)/) || [])[1] || "";
  const num = id.split("-")[0];
  const isNum = /^\d+$/.test(num);
  const theme = meta.theme || {};
  const dark = theme.grounds?.dark?.bg || "#101010";
  const light = theme.grounds?.light?.bg || "#FAFAFA";
  const accent = (theme.marker?.style ?? "select") === "select" ? theme.marker?.color || "#2E7AEA" : "#888888";
  const media = existsSync(join(dir, "apercu.mp4"))
    ? `<video src="${id}/apercu.mp4" poster="${id}/apercu.jpg" muted loop playsinline preload="metadata"></video>`
    : existsSync(join(dir, "apercu.jpg")) ? `<img src="${id}/apercu.jpg" alt="">` : `<div class="empty">Aperçu à venir</div>`;
  cards.push(`
<article class="card">
  <div class="phone">${media}</div>
  <div class="txt">
    <p class="num">${esc(isNum ? num : "perso")}</p>
    <h2>${esc(meta.name)}</h2>
    <p class="look">${esc(look)}</p>
    <p class="use">${esc(use)}</p>
    <div class="sw"><i style="background:${esc(dark)}"></i><i style="background:${esc(light)}"></i><i style="background:${esc(accent)}"></i></div>
    <p class="say">Dis à ton agent : <b>« style ${esc(isNum ? num : meta.name)} »</b></p>
  </div>
</article>`);
}

const page = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MotionLab · Les styles</title>
<style>
:root{--bg:#0c0a09;--card:#17130f;--line:#2a221c;--ink:#fff;--mute:#a39589;--o:#ff7a1a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif}
header{max-width:1180px;margin:0 auto;padding:48px 20px 8px}
h1{font-size:40px;letter-spacing:-.03em;margin:0 0 8px}header p{color:var(--mute);max-width:720px;margin:0 0 6px}
.tip{margin:18px 0 0;padding:14px 16px;border-radius:14px;background:rgba(255,122,26,.1);border:1px solid rgba(255,122,26,.35);max-width:760px}
.tip b{color:var(--o)}
main{max-width:1180px;margin:0 auto;padding:24px 20px 64px;display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px}
.card{display:flex;gap:16px;padding:16px;border-radius:20px;background:var(--card);border:1px solid var(--line)}
.phone{flex:0 0 132px;aspect-ratio:9/16;border-radius:14px;overflow:hidden;background:#000;border:1px solid var(--line)}
.phone video,.phone img{width:100%;height:100%;object-fit:cover;display:block}
.empty{height:100%;display:grid;place-items:center;color:var(--mute);font-size:12px;text-align:center;padding:8px}
.num{margin:0;color:var(--o);font-weight:700;font-size:13px;letter-spacing:.08em}
h2{margin:2px 0 8px;font-size:22px;letter-spacing:-.02em}
.look{margin:0 0 8px;font-size:14px}.use{margin:0 0 10px;font-size:13px;color:var(--mute)}
.sw{display:flex;gap:6px;margin-bottom:10px}.sw i{width:22px;height:22px;border-radius:7px;border:1px solid rgba(255,255,255,.15)}
.say{margin:0;font-size:13px;color:var(--mute)}.say b{color:var(--ink)}
@media (max-width:420px){.card{flex-direction:column}.phone{flex-basis:auto;width:60%}}
</style></head><body>
<header>
  <h1>Les styles</h1>
  <p>Le look de tes vidéos : la police et les couleurs des sous-titres, le mot clé, les fonds. Choisis-en un et dis-le à ton agent. Tu pourras en changer quand tu veux.</p>
  <p>Les images de chaque scène et leur mouvement restent la méthode MotionLab, quel que soit le style.</p>
  <p class="tip"><b>Le meilleur conseil :</b> si aucun ne te va, dépose une vidéo dont tu adores le look dans <code>workspace/input/references/</code> et dis « copie ce style ». L’agent l’étudie et en fait ton style.</p>
</header>
<main>${cards.join("")}</main>
<script>
document.querySelectorAll('video').forEach(v => {
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? v.play().catch(() => {}) : v.pause())).observe(v);
});
</script>
</body></html>
`;
writeFileSync(join(root, "galerie.html"), page);
console.log(JSON.stringify({ ok: true, page: join(root, "galerie.html"), styles: cards.length }));
