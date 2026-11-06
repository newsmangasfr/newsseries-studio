// language.mjs: the language the buyer's videos are made in, and what follows from it.
// Contract: language({ reel, explicit }) -> ISO 639-1 code ("fr", "en", ...). Order: an explicit value, the reel's own
//   reel.json "language", the saved Full Visual profile (workspace/library/full-visual/profile.json "language"), the
//   account reading (context/profile.json "language", when it is a two-letter code), else "fr". speechModel(lang) names the whisper.cpp model for it; ocrLanguages(lang) the tesseract data to load.
//   No network, no writes. The Python side mirrors this in engine/full-visual/scripts/where.py.
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const DEFAULT_LANGUAGE = "fr";
const ROOT = resolve(import.meta.dirname, "..");
const code = (v) => (typeof v === "string" && /^[a-z]{2}$/i.test(v.trim()) ? v.trim().toLowerCase() : null);
const readJson = (file) => { try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; } };

export function profileLanguage(root = ROOT) {
  const profile = readJson(join(root, "workspace", "library", "full-visual", "profile.json"));
  // the account reading (context/profile.json, written by /start) counts only when it holds a two-letter code
  return code(profile?.language) ?? code(profile?.resolved?.language) ?? code(readJson(join(root, "context", "profile.json"))?.language) ?? null;
}

export function language({ explicit = null, reel = null, root = ROOT } = {}) {
  return code(explicit) ?? (reel ? code(readJson(join(reel, "reel.json"))?.language) : null) ?? profileLanguage(root) ?? DEFAULT_LANGUAGE;
}

// small.en for English (base.en dropped a sentence of a real take); the multilingual small, same size, for every other
// language: an English-only model cannot transcribe French.
export const speechModel = (lang) => (code(lang) === "en" ? "ggml-small.en.bin" : "ggml-small.bin");
export const isEnglishOnlyModel = (file) => /\.en\.bin$/i.test(String(file));

// tesseract names its data with three letters. The buyer's language first, English beside it, because a post often
// carries an English word or brand in it.
const TESS = { fr: "fra", en: "eng", es: "spa", de: "deu", it: "ita", pt: "por", nl: "nld", pl: "pol", ro: "ron", sv: "swe", da: "dan", no: "nor", fi: "fin", tr: "tur", cs: "ces", ca: "cat" };
export function ocrLanguages(lang) {
  const main = TESS[code(lang) ?? DEFAULT_LANGUAGE] ?? "eng";
  return main === "eng" ? ["eng"] : [main, "eng"];
}

// Names said to the buyer.
const NAMES = { fr: "français", en: "anglais", es: "espagnol", de: "allemand", it: "italien", pt: "portugais", nl: "néerlandais" };
export const languageName = (lang) => NAMES[code(lang)] ?? code(lang) ?? DEFAULT_LANGUAGE;
