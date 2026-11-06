// Render a reel, or look at it first.
//   node render.mjs <slug>                          -> output/YYYY-MM-DD/NN-<slug>.mp4
//   node render.mjs <slug> --stills 1.2,3.45,9      -> reels/<slug>/stills/t_001.20.png ... (seconds)
//   node render.mjs <slug> --guides --stills 3      -> with the bands and Instagram's zones drawn on
//   node render.mjs <slug> --from 4 --to 9          -> only that stretch
//   node render.mjs <slug> --public-only hairline     -> bundle only public/<slug> + public/hairline (tight disk)
//   (default bundles only the public/ folders the reel names; --full-public bundles all of public/)
//   node render.mjs <slug> --gl angle               -> WebGL scenes (three.js hooks): swangle cannot make a context here
//   node render.mjs <slug> --no-caption             -> without the top word caption (format 1 only; default keeps it)
// A reel whose reel.json says "format": 2 renders on the format-2 engine (src/v2, composition FullVisual2).
// Run with the sandbox disabled (Remotion's Chrome).
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const slug = args[0];
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const reelDir = path.join(dir, "reels", slug ?? "");
if (!slug || !fs.existsSync(path.join(reelDir, "words.json"))) {
  console.error("usage: node render.mjs <slug> [--stills s,s,s] [--guides] [--from s --to s] [--out path]\n(needs reels/<slug>/words.json: run scripts/align.py <slug> first)");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.join(reelDir, "words.json"), "utf-8"));
const configPath = path.join(reelDir, "reel.json");
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf-8")) : {};

// the bundler copies public/ and does not follow symlinks: copy the voice in
const voice = fs.readdirSync(reelDir).find((f) => /^voice\.(mp3|wav|m4a)$/.test(f));
const pub = path.join(dir, "public", slug);
fs.mkdirSync(pub, { recursive: true });
if (voice) fs.copyFileSync(path.join(reelDir, voice), path.join(pub, voice));
for (const f of fs.existsSync(path.join(reelDir, "assets")) ? fs.readdirSync(path.join(reelDir, "assets")) : [])
  if (fs.statSync(path.join(reelDir, "assets", f)).isFile()) fs.copyFileSync(path.join(reelDir, "assets", f), path.join(pub, f));

// format 2 (reel.json "format": 2) renders on src/v2 (FullVisual2) with its character and the voice's loudness
const v2 = false;   // format 2 does not ship in this folder
const inputProps = { slug, data, config, audio: voice ? `${slug}/${voice}` : null, guides: args.includes("--guides"), noCaption: args.includes("--no-caption"), };
const browserExecutable = process.env.CHROME || undefined;   // Remotion fetches its own browser for this system

function outputPath() {
  if (opt("--out")) return path.resolve(opt("--out"));
  const day = new Date().toLocaleDateString("en-CA");
  const outDir = path.join(dir, "output", day);
  fs.mkdirSync(outDir, { recursive: true });
  const mine = fs.readdirSync(outDir).find((f) => f.replace(/^\d+-/, "") === `${slug}.mp4`);
  if (mine) return path.join(outDir, mine);
  const n = new Set(fs.readdirSync(outDir).map((f) => f.slice(0, 2))).size + 1;
  return path.join(outDir, `${String(n).padStart(2, "0")}-${slug}.mp4`);
}

// At most FV_RENDER_SLOTS renders at once on this machine: each one is a webpack bundle (~1.1 GB of node)
// plus Chrome, and 13 to 16 at once on 16 GB froze the Mac into a kernel panic (four times, 9-10 Oct 2026). The others wait.
const slotDir = path.join((await import("os")).tmpdir(), "fv-render-slots");
fs.mkdirSync(slotDir, { recursive: true });
// Default 1 since 11 Oct 2026: three workflows build at once, and their agents and tsc runs already take most of the 16 GB.
const slots = Math.max(1, Number(process.env.FV_RENDER_SLOTS ?? 1));
let slot = null;
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
for (let waited = 0; !slot; waited++) {
  for (let i = 0; i < slots && !slot; i++) {
    const f = path.join(slotDir, `${i}.lock`);
    try { fs.writeFileSync(f, String(process.pid), { flag: "wx" }); slot = f; } catch {
      // a lock whose process died (a crash, a kill -9) is free again
      try { if (!alive(Number(fs.readFileSync(f, "utf-8")))) fs.rmSync(f, { force: true }); } catch {}
    }
  }
  if (!slot) {
    if (waited === 0) console.error(`waiting for a render slot (${slots} at once)...`);
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
  }
}
process.on("exit", () => { try { fs.rmSync(slot, { force: true }); } catch {} });

// --public-only a,b: bundle a public/ holding only public/<slug> and those folders (a tight disk: the full one is ~0.5 GB)
let publicDir = path.join(dir, "public");
// default: bundle only the public/ folders this reel names (its slug, the base slug of a -hN copy, _characters, and any
// public/<folder>/ its scenes mention). The full public/ is ~0.9 GB per bundle. --full-public bundles everything.
if (opt("--public-only") === undefined && !args.includes("--full-public")) {
  const base = slug.replace(/-h\d+$/, "");
  const sceneText = [slug, base].flatMap((s) => {
    const sd = path.join(dir, "reels", s, "scenes");
    return fs.existsSync(sd) ? fs.readdirSync(sd).filter((f) => /\.(tsx?|json)$/.test(f)).map((f) => fs.readFileSync(path.join(sd, f), "utf-8")) : [];
  }).join("\n") + fs.readdirSync(path.join(dir, "src"), { recursive: true }).filter((f) => /\.tsx?$/.test(f)).map((f) => fs.readFileSync(path.join(dir, "src", f), "utf-8")).join("\n");
  const keep = fs.readdirSync(path.join(dir, "public")).filter((d) => fs.statSync(path.join(dir, "public", d)).isDirectory()
    && (d === slug || d === base || d === "_characters" || sceneText.includes(`${d}/`)));
  publicDir = fs.mkdtempSync(path.join((await import("os")).tmpdir(), "fv-public-"));
  for (const d of keep) fs.cpSync(path.join(dir, "public", d), path.join(publicDir, d), { recursive: true });
  for (const f of fs.readdirSync(path.join(dir, "public"))) // loose files at the root of public/
    if (fs.statSync(path.join(dir, "public", f)).isFile()) fs.copyFileSync(path.join(dir, "public", f), path.join(publicDir, f));
} else if (opt("--public-only") !== undefined) {
  publicDir = fs.mkdtempSync(path.join((await import("os")).tmpdir(), "fv-public-"));
  for (const d of [slug, ...opt("--public-only").split(",").filter(Boolean)])
    if (fs.existsSync(path.join(dir, "public", d))) fs.cpSync(path.join(dir, "public", d), path.join(publicDir, d), { recursive: true });
}
// each bundle copies public/ into the tmp dir: delete it on exit (also when the bundle fails), or parallel builders fill the disk
let serveUrl = null;
const cleanup = () => {
  for (const p of [serveUrl, publicDir !== path.join(dir, "public") ? publicDir : null])
    if (p) try { fs.rmSync(p, { recursive: true, force: true }); } catch {}
};
process.on("exit", cleanup);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { cleanup(); process.exit(1); });
// FV_NO_CACHE=1 skips webpack's disk cache (it grows by about 1 GB a bundle in creator-dev/node_modules/.cache)
serveUrl = await bundle({ entryPoint: path.join(dir, "src/index.ts"), publicDir, enableCaching: !process.env.FV_NO_CACHE });
const composition = await selectComposition({ serveUrl, id: v2 ? "FullVisual2" : "FullVisual", inputProps, browserExecutable });
const fps = composition.fps;

if (opt("--stills")) {
  const out = path.join(reelDir, "stills");
  fs.mkdirSync(out, { recursive: true });
  for (const s of opt("--stills").split(",").map(Number)) {
    const output = path.join(out, `t_${s.toFixed(2).padStart(6, "0")}${inputProps.guides ? "_guides" : ""}.png`);
    await renderStill({ serveUrl, composition, inputProps, browserExecutable, frame: Math.min(composition.durationInFrames - 1, Math.round(s * fps)), output });
    console.log(output);
  }
} else {
  const outputLocation = outputPath();
  let lastPct = -1;
  const frameRange = opt("--from") || opt("--to")
    ? [Math.round(Number(opt("--from") ?? 0) * fps), Math.min(composition.durationInFrames - 1, Math.round(Number(opt("--to") ?? 1e9) * fps))]
    : undefined;
  await renderMedia({
    serveUrl, composition, inputProps, browserExecutable, outputLocation, frameRange,
    codec: "h264", crf: 16, pixelFormat: "yuv420p", x264Preset: "slow",
    concurrency: Number(opt("--concurrency") ?? 2), // Remotion's own default is half the cores: too many Chrome tabs next to other builds
    ...(opt("--gl") ? { chromiumOptions: { gl: opt("--gl") } } : {}), // --gl angle: a WebGL (three.js) scene on the Mac GPU
    // In a terminal the percentage rewrites one line; piped to an agent it would print thousands of tokens, so only
    // every tenth is printed there.
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (process.stdout.isTTY) process.stdout.write(`\r${pct}%`);
      else if (pct % 10 === 0 && pct !== lastPct) { lastPct = pct; process.stdout.write(`${pct}% `); }
    },
  });
  console.log(`\n${outputLocation}`);
}
