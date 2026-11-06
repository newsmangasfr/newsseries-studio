#!/usr/bin/env node
// checks/loudness.mjs <project-dir> <args-json>
// args: { final = "renders/final.mp4", target = -14, tolerance = 1, peak = -1 }  the path is relative to the project
// Contract: proves the finished file is as loud as the platforms play it back at, and never louder than a
//   phone speaker can hold. Measured once over the whole delivered file with the loudness meter, so the
//   number is the one the platform will read: the integrated loudness within a loudness unit of the target,
//   and the true peak under the ceiling. A mix laid on the voice moves both, which is why this is read
//   after the sound rather than before it. Prints one JSON line:
//   { name, value: <the integrated loudness in LUFS>, threshold, pass, reason }.
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { ffbin, ffenv } from "../_lib.mjs";

const dir = resolve(process.argv[2] || "");
const args = JSON.parse(process.argv[3] || "{}");
const target = args.target ?? -14, tolerance = args.tolerance ?? 1, peak = args.peak ?? -1;
const say = (o) => { console.log(JSON.stringify({ name: "loudness", threshold: `${target} LUFS à ${tolerance} LU près, crête vraie sous ${peak} dBTP`, ...o })); process.exit(0); };
const at = (p) => (p.startsWith("/") ? p : join(dir, p));
const final = at(args.final ?? "renders/final.mp4");
if (!existsSync(final)) say({ value: null, pass: false, reason: `le fichier final manque : ${final}` });

const ffmpeg = ffbin("ffmpeg");
if (!ffmpeg) say({ value: null, pass: false, reason: "ffmpeg manque ; lance doctor" });
// The meter prints its reading as JSON on the error stream, after everything else it has to say.
const r = spawnSync(ffmpeg, ["-nostats", "-hide_banner", "-i", final, "-af", `loudnorm=I=${target}:TP=${peak}:LRA=11:print_format=json`, "-f", "null", "-"],
  { encoding: "utf8", maxBuffer: 1 << 26, env: ffenv(ffmpeg) });
const text = `${r.stderr || ""}`;
const start = text.lastIndexOf("{"), end = text.lastIndexOf("}");
let measured = null;
if (start > -1 && end > start) { try { measured = JSON.parse(text.slice(start, end + 1)); } catch { measured = null; } }
if (!measured?.input_i) say({ value: null, pass: false, reason: `le volume du fichier final n’a pas pu être mesuré : ${text.trim().split("\n").pop()?.slice(0, 160) ?? ""}` });

const loudness = Number(measured.input_i), truePeak = Number(measured.input_tp);
if (!Number.isFinite(loudness) || !Number.isFinite(truePeak)) say({ value: null, pass: false, reason: "le mesureur n’a rien renvoyé pour ce fichier" });
const value = Math.round(loudness * 100) / 100;
const off = Math.abs(loudness - target);
const pass = off <= tolerance && truePeak < peak;
say({
  value, pass,
  reason: pass
    ? `${value} LUFS avec une crête vraie de ${truePeak} dBTP`
    : off > tolerance
      ? `${value} LUFS est à ${Math.round(off * 100) / 100} LU de ${target} ; la voix sonnera ${loudness < target ? "plus bas" : "plus fort"} que tout ce qui l’entoure`
      : `la crête vraie est de ${truePeak} dBTP, au-dessus du plafond de ${peak} ; ça saturera sur un haut-parleur de téléphone`,
});
