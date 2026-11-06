#!/usr/bin/env node
// composite.mjs --base <clip.mp4> --overlay <overlay.mov|frames/%05d.png> --out <final.mp4>
//   [--in s] [--out-at s] [--filter <ffmpeg chain>] [--place top|bottom:<share>[:<focus>[:<zoom>]]] [--audio <file> [--audio-at s] | --silent] [--fps 30]
// Contract: lays an overlay with alpha (ProRes 4444 .mov or a PNG sequence) over the untouched base clip and encodes
//   H.264 (crf 18, yuv420p, faststart). Rule b lives here: the clip is decoded once, never re-timed, never drawn by the
//   renderer. --in and --out-at trim the clip (seconds); --filter applies one mild colour chain to the clip before the
//   overlay (a graded look, never an effect); --place puts the clip in one zone of a 1080 by 1920 frame for a split
//   format: the zone's side and its share of the height, the clip scaled to fill the zone and cropped to it, focus
//   saying which part of a taller clip is kept (0 the top, 0.5 the middle, 1 the bottom; default 0.5), black elsewhere,
//   which the opaque panel of the overlay covers. Audio: the clip's own sound stays (a talking head keeps its voice)
//   unless --audio replaces it with a track started --audio-at seconds in, or --silent drops it (a library sound is added
//   when posting). Exits 1 when a file is missing or ffmpeg fails.
import { existsSync } from "node:fs";
import { ffbin, run, fail } from "./_lib.mjs";

const a = process.argv.slice(2); const opt = (k, d = null) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const base = opt("--base"), overlay = opt("--overlay"), out = opt("--out"), audio = opt("--audio"), fps = opt("--fps", "30");
const tIn = Number(opt("--in", 0)) || 0, tOut = opt("--out-at") ? Number(opt("--out-at")) : null, filter = opt("--filter"), place = opt("--place"), audioAt = Number(opt("--audio-at", 0)) || 0, silent = a.includes("--silent");
if (!base || !overlay || !out) fail("usage: composite.mjs --base <mp4> --overlay <mov|frames/%05d.png> --out <mp4> [--in s] [--out-at s] [--filter chain] [--place top|bottom:share[:focus]] [--audio file [--audio-at s] | --silent]");
if (!existsSync(base)) fail(`base introuvable : ${base}`);
if (!overlay.includes("%") && !existsSync(overlay)) fail(`calque introuvable : ${overlay}`);
if (audio && !existsSync(audio)) fail(`audio introuvable : ${audio}`);
const ffmpeg = ffbin("ffmpeg"); if (!ffmpeg) fail("ffmpeg introuvable ; lance doctor");
for (const unused of ["--edl", "--still-hold"]) if (a.includes(unused)) console.log(`note: ${unused} n’est pas appliqué par le compositeur ; les traitements de rythme et d’ouverture ne sont pas construits`);

const W = 1080, H = 1920;
const trim = `trim=start=${tIn}${tOut ? `:end=${tOut}` : ""},setpts=PTS-STARTPTS`;
const graded = filter ? `,${filter}` : "";
let clipChain, prelude = "";
if (place) {
  const [side, shareS, focusS, zoomS] = place.split(":"); const share = Number(shareS), focus = focusS === undefined ? 0.5 : Number(focusS), zoom = zoomS === undefined ? 1 : Math.max(1, Number(zoomS) || 1);
  if (!["top", "bottom"].includes(side) || !(share > 0.1 && share < 0.9)) fail(`--place attend top|bottom:<part entre 0.1 et 0.9>[:<focus de 0 à 1>], reçu ${place}`);
  const zh = Math.round((H * share) / 2) * 2, y = side === "top" ? 0 : H - zh;
  prelude = `color=c=black:s=${W}x${H}:r=${fps}[bg];`;
  const zoomed = zoom > 1.001 ? `,scale=trunc(iw*${zoom}/2)*2:trunc(ih*${zoom}/2)*2` : "";
  clipChain = `[0:v]${trim}${graded},scale=${W}:${zh}:force_original_aspect_ratio=increase${zoomed},crop=${W}:${zh}:(iw-${W})/2:(ih-${zh})*${focus}[clip];[bg][clip]overlay=0:${y}:shortest=1[basev]`;
} else {
  clipChain = `[0:v]${trim}${graded}[basev]`;
}
const overlayIn = overlay.includes("%") ? ["-framerate", fps, "-i", overlay] : ["-i", overlay];
const audioIn = audio ? ["-ss", String(audioAt), "-i", audio] : [];
const graph = `${prelude}${clipChain};[1:v]format=rgba[ov];[basev][ov]overlay=0:0:format=auto:shortest=1[v]${!audio && !silent ? `;[0:a]atrim=start=${tIn}${tOut ? `:end=${tOut}` : ""},asetpts=PTS-STARTPTS[a]` : ""}`;
const maps = audio ? ["-map", "[v]", "-map", "2:a:0"] : silent ? ["-map", "[v]", "-an"] : ["-map", "[v]", "-map", "[a]?"];
const args = ["-y", "-loglevel", "error", "-i", base, ...overlayIn, ...audioIn, "-filter_complex", graph, ...maps,
  "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", fps, ...(silent ? [] : ["-c:a", "aac", "-b:a", "192k"]), "-movflags", "+faststart", "-shortest", out];
try { run(ffmpeg, args); } catch (e) {
  // A base without an audio stream makes the optional [a] map fail on some builds: retry without audio.
  if (!audio && !silent) { try { run(ffmpeg, ["-y", "-loglevel", "error", "-i", base, ...overlayIn, "-filter_complex", graph.replace(/;\[0:a\].*$/, ""), "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", fps, "-movflags", "+faststart", "-shortest", out]); console.log(`composité (pas d’audio dans le clip) -> ${out}`); process.exit(0); } catch {} }
  fail(`la composition a échoué : ${String(e.message).slice(0, 400)}`);
}
console.log(`composité -> ${out}${place ? ` (clip placé ${place})` : ""}${audio ? ` avec ${audio} à partir de ${audioAt} s` : silent ? " muet" : ""}`);
