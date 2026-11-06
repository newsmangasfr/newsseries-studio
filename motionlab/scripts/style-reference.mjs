#!/usr/bin/env node
// style-reference.mjs <video> [--out <dir>] [--frames <n>]
// Contract: prepares a reference video (a reel the creator wants to look like) for the `style` skill. Writes into
//   <dir> (default workspace/input/references/<name>/study/): sheet.jpg, the whole video as a grid of frames in order;
//   frame-01.jpg .. frame-NN.jpg at full size, evenly spaced; palette.json, the most common colours over those frames.
//   Prints { ok, video, seconds, fps, width, height, audio, frames, sheet, palette, out }. Reads only; the video is
//   never modified. The colours are counted, not judged: the agent still looks at every frame before naming a style.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { P, fail, ffbin, run, slug } from "./_lib.mjs";

const args = process.argv.slice(2);
const video = args[0];
if (!video || !existsSync(video)) fail("usage: style-reference.mjs <video> [--out <dir>] [--frames <n>]");
const opt = (name, fallback) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : fallback; };
const count = Math.max(4, Math.min(24, Number(opt("--frames", 12)) || 12));
const name = slug(basename(video, extname(video)));
const out = opt("--out", P("workspace", "input", "references", name, "study"));
mkdirSync(out, { recursive: true });

const ffmpeg = ffbin("ffmpeg"), ffprobe = ffbin("ffprobe");
if (!ffmpeg || !ffprobe) fail("ffmpeg introuvable : lance node scripts/doctor.mjs");

const probe = JSON.parse(run(ffprobe, ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", video]));
const v = probe.streams.find((s) => s.codec_type === "video");
if (!v) fail("ce fichier n’a pas d’image vidéo");
const seconds = Number(probe.format.duration) || 0;
const [num, den] = String(v.avg_frame_rate || "0/1").split("/").map(Number);
const fps = den ? Math.round((num / den) * 100) / 100 : 0;
const audio = probe.streams.some((s) => s.codec_type === "audio");

// Evenly spaced moments, away from the very first and last frame.
const times = Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * seconds);
const frames = times.map((t, i) => {
  const file = join(out, `frame-${String(i + 1).padStart(2, "0")}.jpg`);
  run(ffmpeg, ["-y", "-v", "error", "-ss", t.toFixed(3), "-i", video, "-frames:v", "1", "-q:v", "3", file]);
  return { at: Math.round(t * 100) / 100, file };
});

// One picture of the whole video: the same moments, small, in reading order.
const cols = count <= 8 ? 4 : 6, rows = Math.ceil(count / cols);
const sheet = join(out, "sheet.jpg");
run(ffmpeg, ["-y", "-v", "error", "-i", video, "-vf",
  `fps=${(count / Math.max(seconds, 0.1)).toFixed(4)},scale=270:-2,tile=${cols}x${rows}:padding=6:color=0x202020`,
  "-frames:v", "1", "-q:v", "3", sheet]);

// The commonest colours: each frame shrunk to 24x42, colours rounded to steps of 16, counted together.
const counts = new Map();
for (const f of frames) {
  const raw = execRaw(ffmpeg, ["-v", "error", "-i", f.file, "-vf", "scale=24:42", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
  for (let i = 0; i + 2 < raw.length; i += 3) {
    const key = [raw[i], raw[i + 1], raw[i + 2]].map((c) => Math.min(255, Math.round(c / 16) * 16));
    const hex = "#" + key.map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
    counts.set(hex, (counts.get(hex) || 0) + 1);
  }
}
const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
const palette = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  .map(([hex, n]) => ({ hex, share: Math.round((n / total) * 1000) / 10 }));
writeFileSync(join(out, "palette.json"), JSON.stringify({ video, palette }, null, 2));

console.log(JSON.stringify({ ok: true, video, seconds: Math.round(seconds * 10) / 10, fps, width: v.width, height: v.height,
  audio, frames: frames.map((f) => f.file), sheet, palette, out }, null, 2));

function execRaw(bin, argv) {
  return run(bin, argv, { encoding: "buffer" });
}
