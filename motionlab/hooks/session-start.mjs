#!/usr/bin/env node
// hooks/session-start.mjs
// Contract: ensure the buyer's local workspace is available and print its URL, then say when the account reading
//   is behind. Never open a browser or pull an account here. Registered by build-pack for each supported agent.
//   It used to pull thirty days of posts in the background instead. Two things were wrong with that. It read the
//   buyer's account without being asked, on a machine they had just opened; and it re-ran none of the readings, so it
//   left posts nothing had read and a formats grouping and a text budget measured before those posts existed, with
//   nobody able to notice. Refreshing is now something the buyer asks for, and asking runs the readings too.
import { existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { readJson } from "../scripts/_lib.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Hooks can run from a nested project. The installed hook itself identifies the buyer's folder.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
try {
  const url = execFileSync(process.execPath, [resolve(root, "scripts", "workspace.mjs"), "--ensure", "--no-open"], { cwd: root, encoding: "utf8", timeout: 15000 }).trim();
  if (url) console.log(`Ton espace de travail : ${url}`);
} catch { console.log("L’espace de travail n’a pas pu s’ouvrir. Pour l’agent : relance node scripts/workspace.mjs --ensure --no-open."); }

// An export the buyer asked for in the editor waits for the agent, even when they closed the chat before pasting it.
try {
  const { pendingExports } = await import("../scripts/edit-export.mjs");
  const waiting = pendingExports(root);
  if (waiting.length) console.log(`pour l’agent : ${waiting.length === 1 ? "une vidéo modifiée attend" : `${waiting.length} vidéos modifiées attendent`} d’être exportée${waiting.length === 1 ? "" : "s"} (${waiting.map((w) => w.project).join(", ")}). Lis .agents/skills/edit/SKILL.md, puis lance node scripts/edit.mjs status et exporte chacune.`);
} catch {}

// A buyer who has not reached their first published video is still on the guided journey: the agent resumes it.
const journey = readJson(resolve(root, "context", "parcours.json"));
if (!journey || Number(journey.step) < 6) console.log(journey
  ? `pour l’agent : le client est à l’étape ${journey.step} sur 6 du parcours. Lis .agents/skills/parcours/SKILL.md et reprends là.`
  : "pour l’agent : nouveau client. Après configure-moi, guide-le avec .agents/skills/parcours/SKILL.md (six étapes, jusqu’à sa première vidéo).");

const posts =resolve(root, "context", "posts.json");
const start = readJson(resolve(root, "context", "start.json"));
if (!start?.done || !existsSync(posts)) process.exit(0);
const age = Math.round((Date.now() - statSync(posts).mtimeMs) / 864e5);
let c;
try {
  c = JSON.parse(execFileSync(process.execPath, [resolve(root, "scripts", "context.mjs"), "--json"], { cwd: root, encoding: "utf8" }));
} catch { process.exit(0); }
// Two different things go out of date and they are fixed by two different hands. A reading a script makes is caught
// up by running the readings; a file the agent wrote from one of those readings has to be written again by the agent.
// Saying "say refresh" about the second would send the buyer to a command that cannot fix it.
const scripts = c.behind.length, written = c.written_behind.length;
if (!scripts && !written && age < 7) process.exit(0);
const lines = [];
if (scripts || age >= 7) lines.push(`${scripts ? `${scripts} lecture${scripts === 1 ? " est" : "s sont"} en retard sur tes posts` : `tes posts ont été lus pour la dernière fois il y a ${age} jours`}. Dis « actualiser » (ou « refresh ») pour relire ton compte.`);
if (written) lines.push(`pour l’agent : ${c.written_behind.join(", ")} ${written === 1 ? "est plus ancien" : "sont plus anciens"} que la lecture sur laquelle ${written === 1 ? "il repose" : "ils reposent"} ; réécris-${written === 1 ? "le" : "les"} avant d’écrire quoi que ce soit à partir de ${written === 1 ? "lui" : "eux"}.`);
console.log(lines.join("\n"));
