#!/usr/bin/env node
// check-caption.mjs <caption.txt> [--answers context/answers.json] [--previous workspace/output] [--self <this video's own output folder>] [--screen-keyword WORD]
// Contract: prints one line per failed check, exits 1 when any fails, exits 0 and prints "ok" when none fail.
// Checks: em or en dash; hashtag; first line over 125 chars; comment line rules by automation; keyword rules;
//         length 600 to 2200; a close line; the follow line with a DM promise; keyword reuse across output/.
// Languages: French (the default) and English, with accents. Comment line "Commente MEMO ..." or "Comment MEMO ...";
//   follow line "(abonne-toi d’abord pour que mon DM t’arrive)" or "(follow first so my DM reaches you)", straight or
//   curly apostrophe; close verbs in both. The keyword stays capitals A to Z and digits, no accent.
//   Word edges are Unicode-aware: \b in a JavaScript regex stops at "é", so it is never used on words here.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const USAGE = "usage : check-caption.mjs <caption.txt> [--answers context/answers.json] [--previous workspace/output] [--self <le dossier de sortie de cette vidéo>] [--screen-keyword MOT]";
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) { console.log(USAGE); process.exit(0); }
const file = args.find((a, i) => !a.startsWith("--") && !["--answers", "--previous", "--self", "--screen-keyword"].includes(args[i - 1]));
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
if (!file) { console.error(USAGE); process.exit(2); }

const text = readFileSync(file, "utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n").normalize("NFC").trim();
const answersPath = opt("--answers", "context/answers.json");
const previousDir = opt("--previous", "workspace/output");
const screenKeyword = opt("--screen-keyword", null);
const selfDir = opt("--self", null); // a re-delivery of the same video is not a reuse of its keyword
let automation = null;
if (existsSync(answersPath)) {
  try { automation = Boolean(JSON.parse(readFileSync(answersPath, "utf8"))?.funnel?.dm_automation?.enabled); } catch { automation = null; }
}

// A word edge in any language: no letter or digit on that side.
const W = "[\\p{L}\\p{N}]";
const word = (alternatives) => new RegExp(`(?<!${W})(?:${alternatives})(?!${W})`, "iu");
// "Comment MEMO", "Commente MEMO", "Commentez « MEMO »", "Commente le mot MEMO": the keyword may sit in straight or
// curly quotes or guillemets.
const COMMENT = /^(?:comment|commente|commentez)\s+(?:(?:le\s+mot|the\s+word)\s+)?["“‘'«]?[\s  ]?([A-Z][A-Z0-9]{2,})[\s  ]?["”’'»]?(?=[\s ,.!:;?]|$)/i;
const FOLLOW = /follow first|abonne[-\s]toi\s+d['’]abord/i;

const fails = [];
const lines = text.split("\n");
const first = lines[0] ?? "";
const nonEmpty = lines.filter((l) => l.trim());
const commentLine = COMMENT.exec(first);
const keyword = commentLine ? commentLine[1] : null;
const chars = text.length;     // NFC above: an accented letter is one character
const firstChars = first.length;

if (/[—–]/.test(text)) fails.push("tiret cadratin ou demi-cadratin trouvé ; mets une virgule, deux-points ou un point");
if (/(^|\s)#[\p{L}\p{N}_]+/u.test(text)) fails.push("hashtag trouvé ; les mots-clés vont dans les phrases");
if (firstChars > 125) fails.push(`la première ligne fait ${firstChars} caractères ; reste sous 125 pour qu’elle s’affiche avant « plus »`);
if (chars < 600) fails.push(`la légende fait ${chars} caractères ; sous 600, la valeur n’est pas complète`);
if (chars > 2200) fails.push(`la légende fait ${chars} caractères ; au-delà de 2 200, elle est coupée`);

if (automation === true) {
  if (!commentLine) fails.push("l’automatisation est active mais la première ligne n’est pas une ligne commentaire (Commente MOT et ...)");
  if (keyword && keyword !== keyword.toUpperCase()) fails.push("le mot-clé doit être en capitales");
  if (!FOLLOW.test(text)) fails.push("un DM est promis mais la ligne d’abonnement manque : (abonne-toi d’abord pour que mon DM t’arrive)");
} else if (automation === false) {
  if (commentLine) fails.push("pas d’automatisation dans answers.json : la légende ne doit pas demander de commentaire ; ouvre sur la promesse");
  if (FOLLOW.test(text)) fails.push("pas d’automatisation : retire la ligne d’abonnement");
} else if (commentLine && !FOLLOW.test(text)) {
  fails.push("ligne commentaire sans ligne d’abonnement ; ajoute-la ou retire la ligne commentaire");
}

if (keyword && screenKeyword && keyword !== screenKeyword.toUpperCase()) fails.push(`le mot-clé ${keyword} diffère du mot-clé à l’écran ${screenKeyword.toUpperCase()}`);
if (keyword && existsSync(previousDir)) {
  for (const dir of readdirSync(previousDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    if (selfDir && (dir.name === selfDir || selfDir.replace(/\\/g, "/").endsWith("/" + dir.name))) continue;
    const p = join(previousDir, dir.name, "caption.txt");
    if (!existsSync(p) || p === file) continue;
    const prevFirst = readFileSync(p, "utf8").replace(/^﻿/, "").split(/\r?\n/)[0] ?? "";
    const m = COMMENT.exec(prevFirst);
    if (m && m[1].toUpperCase() === keyword.toUpperCase()) { fails.push(`le mot-clé ${keyword} a déjà servi dans ${dir.name}`); break; }
  }
}

// What to do with it, in either language, tu or vous.
const closeWords = word([
  "save|send|share|run|try|screenshot|keep|use|start|steal",
  "enregistre|enregistrez|sauvegarde|sauvegardez|garde|gardez|envoie|envoyez|partage|partagez|lance|lancez",
  "essaie|essaye|essayez|teste|testez|utilise|utilisez|commence|commencez|copie|copiez|note|notez|épingle|épinglez|capture|capturez",
].join("|"));
const closeCandidates = nonEmpty.slice(-3).filter((l) => !FOLLOW.test(l));
if (!closeCandidates.some((l) => closeWords.test(l) && l.length <= 160)) fails.push("pas de ligne de fin ; termine par quoi en faire (enregistre, envoie, lance le prompt 2)");

const emoji = (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;
if (emoji > 1) fails.push(`${emoji} emoji ; un au plus, à la fin de la première ligne`);
if (/\p{Lu}{6,}\s+\p{Lu}{4,}\s+\p{Lu}{4,}/u.test(text.replace(commentLine?.[0] ?? "", ""))) fails.push("une phrase tout en capitales ; écris en casse de phrase");

if (fails.length) { for (const f of fails) console.log(`fail: ${f}`); process.exit(1); }
console.log("ok");
