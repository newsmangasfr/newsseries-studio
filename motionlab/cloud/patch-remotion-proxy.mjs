// Session cloud : Remotion lance Chrome avec --no-proxy-server, donc Chrome contourne le proxy réseau de la
// session et rejette ses certificats. Ce correctif garde le comportement d'origine, sauf si la variable
// REMOTION_USE_SYSTEM_PROXY est définie : Chrome passe alors par $HTTPS_PROXY (localhost reste en direct).
// À relancer après chaque `npm install`.
import { readFileSync, writeFileSync } from "node:fs";
const flags = "...(process.env.REMOTION_USE_SYSTEM_PROXY && process.env.HTTPS_PROXY ? [`--proxy-server=${process.env.HTTPS_PROXY}`] : ['--no-proxy-server', \"--proxy-server='direct://'\", '--proxy-bypass-list=*']),";
const files = ["../node_modules/@remotion/renderer/dist/open-browser.js", "../node_modules/@remotion/renderer/dist/esm/index.mjs"];
const re = /(['"])--no-proxy-server\1,\s*"--proxy-server='direct:\/\/'",\s*(['"])--proxy-bypass-list=\*\2,/;
for (const rel of files) {
  const f = new URL(rel, import.meta.url);
  const s = readFileSync(f, "utf8");
  if (s.includes("REMOTION_USE_SYSTEM_PROXY")) { console.log("déjà corrigé :", rel); continue; }
  if (!re.test(s)) { console.error("motif introuvable :", rel); process.exit(1); }
  writeFileSync(f, s.replace(re, flags));
  console.log("corrigé :", rel);
}
