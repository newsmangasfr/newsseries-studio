#!/usr/bin/env node
// Dedicated Product Demo narration. Node 22+, ffmpeg and ffprobe; no SDK dependencies.
import {readFile, writeFile, mkdir, lstat, rename, unlink, open} from 'node:fs/promises';
import {resolve, dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash, randomUUID} from 'node:crypto';
import {parseEnv} from 'node:util';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {language as pickLanguage, languageName} from '../../../scripts/language.mjs';

const exec = promisify(execFile);
const VERSION = 1;
const PROVIDERS = ['openai', 'elevenlabs', 'fish', 'other', 'none'];
const KEYS = {openai: ['OPENAI_API_KEY'], elevenlabs: ['ELEVENLABS_API_KEY'], fish: ['FISH_API_KEY', 'FISH_AUDIO_API_KEY'], other: ['PRODUCT_DEMO_VOICE_API_KEY']};
const MODELS = {openai: 'gpt-4o-mini-tts', elevenlabs: 'eleven_multilingual_v2', fish: 's2.1-pro-free'};
const OPENAI_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer', 'verse', 'marin', 'cedar'];
// The spoken language: --language, the config's "language", the reel.json beside --out, the saved profile, else French.
// ElevenLabs takes it as language_code on every model but multilingual_v2, which refuses it and reads the language off
// the text. OpenAI has no language field: gpt-4o-mini-tts gets a one-line delivery instruction when none is set. Fish
// reads the language off the text and has no field for it.
const NO_LANGUAGE_CODE = ['eleven_multilingual_v2'];
// Fish silently falls back to a paid model for unknown names. Reject typos before sending.
const FISH_MODELS = ['s1', 's2-pro', 's2.1-pro', 's2.1-pro-free', 'drama-3-preview'];
const SETTINGS = {
  openai: ['instructions', 'speed'],
  elevenlabs: ['voice_settings', 'language_code', 'seed', 'previous_text', 'next_text', 'previous_request_ids', 'next_request_ids', 'apply_text_normalization'],
  fish: ['temperature', 'top_p', 'prosody', 'chunk_length', 'normalize', 'sample_rate', 'mp3_bitrate', 'latency', 'max_new_tokens', 'repetition_penalty', 'min_chunk_length', 'condition_on_previous_chunks', 'early_stop_threshold', 'features'],
};
const fail = (code, message) => {const error = new Error(message); error.code = code; error.narrationError = true; throw error;};
const sha = value => createHash('sha256').update(value).digest('hex');
const stable = value => JSON.stringify(value, function (key, item) {return item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map(k => [k, item[k]])) : item;});
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
async function exists(path) {try {await lstat(path); return true;} catch (e) {if (e.code === 'ENOENT') return false; throw e;}}
async function readRegular(path, limit = 1048576) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > limit) fail('INVALID_FILE', 'Utilise un fichier local ordinaire, dans la taille acceptée.');
  return readFile(path, 'utf8');
}
async function readJSON(path) {try {return JSON.parse(await readRegular(path));} catch (error) {if (error.code === 'ENOENT') return null; fail('INVALID_JSON', 'Un fichier de réglages ou de métadonnées de voix off est illisible. Répare-le avant de continuer.');}}

export function normalizeConfig(raw) {
  if (!object(raw) || !PROVIDERS.includes(raw.provider)) fail('NO_VOICE_CONFIG', 'Choisis un service de voix off dans le réglage, ou passe --config avec un provider.');
  const allowed = ['provider', 'voice', 'service', 'model', 'settings', 'timeoutMs', 'language'];
  if (Object.keys(raw).some(k => !allowed.includes(k))) fail('INVALID_CONFIG', 'La config de voix off accepte provider, voice, service, model, settings, timeoutMs et language. Les clés d’API restent dans l’environnement ou dans .env.local.');
  if (raw.language !== undefined && !(typeof raw.language === 'string' && /^[a-z]{2}$/i.test(raw.language))) fail('INVALID_CONFIG', 'language est un code ISO 639-1 de deux lettres, par exemple "fr" ou "en".');
  if (raw.voice !== undefined && typeof raw.voice !== 'string') fail('INVALID_VOICE', 'Donne un nom de voix, un ID ou un lien du service, sous forme de texte.');
  const voice = (raw.voice || '').trim();
  if (voice.length > 2048 || /[\r\n\0]/.test(voice)) fail('INVALID_VOICE', 'Donne un seul nom de voix, ID ou lien du service.');
  const settings = raw.settings ?? {};
  if (!object(settings) || Object.keys(settings).some(k => !(SETTINGS[raw.provider] || []).includes(k))) fail('INVALID_SETTINGS', 'Un réglage de voix off non pris en charge a été fourni. Utilise les réglages du service listés dans references/narration.md.');
  const model = raw.model ?? MODELS[raw.provider] ?? null;
  if (model !== null && (typeof model !== 'string' || !/^[a-zA-Z0-9_.-]{1,100}$/.test(model))) fail('INVALID_MODEL', 'Utilise un identifiant de modèle officiel.');
  if (raw.provider === 'fish' && !FISH_MODELS.includes(model)) fail('INVALID_MODEL', 'Modèle Fish inconnu. Utilise s2.1-pro-free, s2.1-pro, s2-pro, s1 ou drama-3-preview. Un nom inconnu peut basculer sur un modèle payant chez Fish.');
  if (raw.provider === 'openai' && settings.instructions !== undefined && !model.startsWith('gpt-4o-mini-tts')) fail('INVALID_SETTINGS', 'Les instructions de diction OpenAI demandent un modèle gpt-4o-mini-tts.');
  if (settings.instructions !== undefined && typeof settings.instructions !== 'string') fail('INVALID_SETTINGS', 'Les instructions de voix off doivent être du texte.');
  if (raw.provider === 'openai' && settings.speed !== undefined && !(typeof settings.speed === 'number' && settings.speed >= 0.25 && settings.speed <= 4)) fail('INVALID_SETTINGS', 'La vitesse OpenAI est un nombre de 0,25 à 4.');
  const timeoutMs = raw.timeoutMs ?? 120000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 300000) fail('INVALID_CONFIG', 'timeoutMs va de 1000 à 300000.');
  return {provider: raw.provider, voice, service: typeof raw.service === 'string' ? raw.service.trim() : '', model, settings, timeoutMs, ...(raw.language ? {language: raw.language.toLowerCase()} : {})};
}

export async function resolveConfig(options = {}) {
  const root = resolve(options.root || process.cwd());
  if (options.config) {
    const raw = await readJSON(resolve(options.config));
    if (!raw) fail('NO_VOICE_CONFIG', 'La config de voix off indiquée n’existe pas.');
    return {root, config: normalizeConfig(raw), source: 'explicit'};
  }
  if (options.project) {
    const project = await readJSON(resolve(options.project, 'project.json'));
    if (!project) fail('NO_PROJECT', 'Le projet choisi a besoin de son project.json.');
    if (Object.hasOwn(project, 'voice')) return {root, config: normalizeConfig(project.voice), source: 'project'};
  }
  const saved = await readJSON(resolve(root, 'workspace/library/product-demo.json'));
  if (saved?.setup?.done === true) return {root, config: normalizeConfig(saved.answers?.voice), source: 'workspace'};
  fail('NO_VOICE_CONFIG', 'Termine le réglage de la voix, ou passe un --config explicite. Un réglage inachevé ne sert jamais à générer.');
}

async function readKeys(root, env) {
  const file = resolve(root, '.env.local');
  const local = await exists(file) ? parseEnv(await readRegular(file)) : {};
  // The workspace UI saves here; current shell values fill missing workspace keys.
  return Object.fromEntries([...new Set(Object.values(KEYS).flat())].map(name => [name, String(local[name] || env[name] || '').trim()]));
}
function apiKey(config, keys) {return (KEYS[config.provider] || []).map(k => keys[k]).find(Boolean) || '';}
function safeRequestId(response) {
  const value = response.headers.get('x-request-id') || response.headers.get('request-id') || response.headers.get('x-trace-id') || '';
  return /^[a-zA-Z0-9_.:-]{1,150}$/.test(value) ? value : null;
}
async function request(url, init, {fetchImpl, timeoutMs, provider}, read) {
  const signal = AbortSignal.timeout(timeoutMs);
  let response;
  try {
    response = await fetchImpl(url, {...init, redirect: 'error', signal});
    if (!response.ok) {
      await response.body?.cancel();
      const reason = {401: 'la clé d’API a été refusée', 402: 'le solde du compte ou l’accès au modèle est insuffisant', 403: 'le compte n’a pas accès à cette voix ou à ce modèle', 404: 'voix ou modèle introuvable', 422: 'voix, modèle ou réglages refusés', 429: 'limite de débit ou quota atteint', 503: 'service indisponible'}[response.status] || 'le service a refusé la demande';
      fail('PROVIDER_HTTP', `${provider} : ${reason} (HTTP ${response.status}). Aucune nouvelle tentative automatique. Vérifie l’accès et les réglages avant de réessayer.`);
    }
    return await read(response);
  } catch (error) {
    if (['PROVIDER_HTTP', 'INVALID_RESPONSE', 'RESPONSE_TOO_LARGE'].includes(error.code)) throw error;
    fail('PROVIDER_NETWORK', `${provider} : la demande ou la réponse n’a pas abouti. Aucune nouvelle tentative automatique ; la génération a peut-être été facturée. Vérifie l’historique du service avant de réessayer.`);
  }
}
async function bytes(response, limit) {
  if (!response.body) fail('INVALID_RESPONSE', 'Le service n’a renvoyé aucun contenu.');
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try {
    while (true) {
      const {value, done} = await reader.read(); if (done) break;
      size += value.length;
      if (size > limit) fail('RESPONSE_TOO_LARGE', 'La réponse du service dépasse la taille permise. Aucune nouvelle tentative automatique.');
      chunks.push(value);
    }
  } finally {await reader.cancel().catch(() => {});}
  return Buffer.concat(chunks);
}
async function getJSON(url, headers, context) {
  return request(url, {method: 'GET', headers}, context, async response => {
    try {return JSON.parse((await bytes(response, 4194304)).toString('utf8'));}
    catch (error) {if (error.code === 'RESPONSE_TOO_LARGE') throw error; fail('INVALID_RESPONSE', 'Le catalogue de voix a renvoyé un JSON invalide. Aucune voix off n’a été demandée.');}
  });
}

function voiceLink(value, provider) {
  if (!/^https?:\/\//i.test(value)) return null;
  let url; try {url = new URL(value);} catch {fail('INVALID_VOICE', 'Le lien de la voix est invalide.');}
  const hosts = provider === 'elevenlabs' ? ['elevenlabs.io', 'www.elevenlabs.io'] : ['fish.audio', 'www.fish.audio'];
  if (url.protocol !== 'https:' || !hosts.includes(url.hostname)) fail('INVALID_VOICE', 'Donne un lien du service de voix choisi, ou l’ID exact de la voix.');
  if (provider === 'elevenlabs') {
    const id = url.searchParams.get('voiceId') || url.searchParams.get('voice_id') || url.pathname.match(/\/(?:voice|voices)\/([a-zA-Z0-9]{20,})\/?$/)?.[1];
    if (id && /^[a-zA-Z0-9]{20,}$/.test(id)) return id;
  } else {
    const id = url.pathname.match(/\/m\/([a-f0-9]{32})\/?$/i)?.[1];
    if (id) return id.toLowerCase();
  }
  fail('INVALID_VOICE', 'Le lien du service ne donne pas un ID de voix sans ambiguïté. Copie l’ID de la voix depuis le service.');
}

export async function resolveVoice(config, key, dependencies = {}) {
  const context = {fetchImpl: dependencies.fetchImpl || fetch, timeoutMs: config.timeoutMs, provider: config.provider};
  const value = config.voice;
  if (config.provider === 'openai') {
    if (!value) return {id: 'cedar', name: 'cedar', selection: 'stock-default'};
    if (OPENAI_VOICES.includes(value.toLowerCase())) return {id: value.toLowerCase(), name: value.toLowerCase(), selection: 'specified'};
    if (/^voice_[a-zA-Z0-9_-]+$/.test(value)) return {id: value, name: null, custom: true, selection: 'specified'};
    fail('INVALID_VOICE', 'OpenAI demande un nom de voix standard pris en charge ou un ID voice_ personnalisé. Aucune voix de remplacement n’a été choisie.');
  }
  if (config.provider === 'elevenlabs') {
    if (!value) return {id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', selection: 'stock-default'};
    const id = voiceLink(value, config.provider) || (/^[a-zA-Z0-9]{20,}$/.test(value) ? value : null);
    if (id) return {id, name: null, selection: 'specified'};
    const matches = new Map(); let pageToken;
    for (let page = 0; page < 20; page++) {
      const url = new URL('https://api.elevenlabs.io/v2/voices');
      url.searchParams.set('search', value); url.searchParams.set('page_size', '100');
      if (pageToken) url.searchParams.set('next_page_token', pageToken);
      const data = await getJSON(url.href, {'xi-api-key': key}, context);
      if (!Array.isArray(data.voices)) fail('INVALID_RESPONSE', 'ElevenLabs n’a renvoyé aucun catalogue de voix utilisable. Donne l’ID exact de la voix.');
      for (const item of data.voices) if (item.name?.toLowerCase() === value.toLowerCase() && /^[a-zA-Z0-9]{20,}$/.test(item.voice_id)) matches.set(item.voice_id, item.name);
      if (!data.has_more) return uniqueVoice(matches, 'ElevenLabs');
      if (!data.next_page_token || data.next_page_token === pageToken) break;
      pageToken = data.next_page_token;
    }
    fail('AMBIGUOUS_VOICE', 'La recherche dans le catalogue ElevenLabs n’a pas abouti. Donne l’ID exact de la voix.');
  }
  if (config.provider === 'fish') {
    // Fish's unspecified reference is a provider default, not a stable named identity.
    if (!value) fail('VOICE_REQUIRED', 'Choisis un ID de voix Fish ou un lien fish.audio/m/. Fish n’a pas de voix par défaut stable dans cet adaptateur.');
    const id = voiceLink(value, config.provider) || (/^[a-f0-9]{32}$/i.test(value) ? value.toLowerCase() : null);
    if (id) return {id, name: null, selection: 'specified'};
    const matches = new Map();
    for (let page = 1; page <= 20; page++) {
      const url = new URL('https://api.fish.audio/model');
      url.searchParams.set('title', value); url.searchParams.set('page_size', '100'); url.searchParams.set('page_number', String(page));
      const data = await getJSON(url.href, {Authorization: `Bearer ${key}`}, context);
      if (!Array.isArray(data.items)) fail('INVALID_RESPONSE', 'Fish n’a renvoyé aucun catalogue de voix utilisable. Donne l’ID exact de la voix.');
      for (const item of data.items) if (item.title?.toLowerCase() === value.toLowerCase() && /^[a-f0-9]{32}$/i.test(item._id)) matches.set(item._id, item.title);
      if (!data.has_more) return uniqueVoice(matches, 'Fish');
    }
    fail('AMBIGUOUS_VOICE', 'La recherche dans le catalogue Fish n’a pas abouti. Donne l’ID exact de la voix.');
  }
  fail('UNSUPPORTED_PROVIDER', 'Ce service n’a pas d’adaptateur de voix off.');
}
function uniqueVoice(matches, provider) {
  if (matches.size !== 1) fail('AMBIGUOUS_VOICE', `${provider} : le nom exact de la voix correspond à ${matches.size} voix. Donne l’ID de la voix voulue ; aucune autre n’a été choisie.`);
  const [[id, name]] = matches; return {id, name, selection: 'name-match'};
}

// The language goes where the provider takes one; a value the creator set in settings always wins.
export function withLanguage(config, lang) {
  if (!lang) return config;
  const settings = {...config.settings};
  if (config.provider === 'elevenlabs' && !NO_LANGUAGE_CODE.includes(config.model) && settings.language_code === undefined) settings.language_code = lang;
  if (config.provider === 'openai' && lang !== 'en' && settings.instructions === undefined && String(config.model).startsWith('gpt-4o-mini-tts')) settings.instructions = `Speak in natural, native ${({fr: 'French', es: 'Spanish', de: 'German', it: 'Italian', pt: 'Portuguese', nl: 'Dutch'})[lang] ?? lang}, with a native accent.`;
  return {...config, language: lang, settings};
}

export function buildRequest(config, voice, text, key) {
  if (config.provider === 'openai') {
    if ([...text].length > 4096) fail('TEXT_TOO_LONG', 'OpenAI accepte au plus 4096 caractères par demande. Coupe la voix off à un passage naturel et utilise des fichiers de sortie séparés.');
    return {url: 'https://api.openai.com/v1/audio/speech', headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'audio/mpeg'}, body: {model: config.model, input: text, voice: voice.custom ? {id: voice.id} : voice.id, response_format: 'mp3', ...config.settings}};
  }
  if (config.provider === 'elevenlabs') return {url: `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice.id)}?output_format=mp3_44100_128`, headers: {'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg'}, body: {text, model_id: config.model, ...config.settings}};
  if (config.provider === 'fish') return {url: 'https://api.fish.audio/v1/tts', headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'audio/mpeg', model: config.model}, body: {text, reference_id: voice.id, format: 'mp3', ...config.settings}};
  fail('UNSUPPORTED_PROVIDER', 'Ce service n’a pas d’adaptateur de voix off.');
}

export async function inspectAudio(path, dependencies = {}) {
  const run = dependencies.execImpl || exec;
  let probe;
  try {
    const result = await run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path], {timeout: 60000, maxBuffer: 2097152});
    probe = JSON.parse(result.stdout);
    const audio = probe.streams?.filter(s => s.codec_type === 'audio') || [];
    const duration = Number(probe.format?.duration);
    if (audio.length !== 1 || probe.streams.length !== 1 || audio[0].codec_name !== 'mp3' || !Number.isFinite(duration) || duration <= 0) throw new Error('Invalid audio');
    await run('ffmpeg', ['-nostdin', '-v', 'error', '-xerror', '-i', path, '-map', '0:a:0', '-f', 'null', '-'], {timeout: 60000, maxBuffer: 2097152});
    return {durationSeconds: duration, codec: audio[0].codec_name, sampleRate: Number(audio[0].sample_rate), channels: audio[0].channels, fullDecode: true};
  } catch {fail('INVALID_AUDIO', 'Le MP3 a échoué à la vérification de durée, de format ou de décodage complet. Aucun audio précédent n’a été remplacé. Vérifie la réponse du service avant de redemander une génération.');}
}
async function checkTools(dependencies) {
  try {for (const tool of ['ffprobe', 'ffmpeg']) await (dependencies.execImpl || exec)(tool, ['-version'], {timeout: 10000, maxBuffer: 1048576});}
  catch {fail('MISSING_AUDIO_TOOLS', 'Installe ffmpeg et ffprobe avant de générer la voix off. Aucune demande n’a été envoyée au service.');}
}
async function validateCache(out, fingerprint, dependencies) {
  const metaPath = `${out}.narration.json`;
  if (!await exists(out) && !await exists(metaPath)) return null;
  const meta = await readJSON(metaPath);
  if (!meta || meta.inputFingerprint !== fingerprint || !await exists(out)) fail('OUTPUT_EXISTS', 'Cette sortie appartient déjà à une autre voix off, ou à une voix off incomplète. Garde-la et choisis un nouveau nom pour --out.');
  const stat = await lstat(out);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 52428800 || sha(await readFile(out)) !== meta.audioSha256) fail('INVALID_CACHE', 'L’audio existant ne correspond pas à ses métadonnées. Choisis une nouvelle sortie après avoir regardé les fichiers. Aucune régénération n’a été demandée.');
  const measured = await inspectAudio(out, dependencies);
  if (Math.abs(measured.durationSeconds - meta.durationSeconds) > 0.001) fail('INVALID_CACHE', 'La durée de l’audio en cache ne correspond pas à ses métadonnées. Aucune régénération n’a été demandée.');
  return {ok: true, cached: true, out, metadata: metaPath, provider: meta.provider, model: meta.model, voice: meta.resolvedVoice, ...measured};
}

export async function runNarration(options = {}, dependencies = {}) {
  const resolved = await resolveConfig(options);
  const {root, source} = resolved;
  const reelDir = options.out ? dirname(resolve(options.out)) : null;
  const lang = pickLanguage({explicit: options.language || resolved.config.language || null, reel: reelDir, root});
  const config = withLanguage(resolved.config, lang);
  const keys = config.provider === 'none' ? {} : await readKeys(root, dependencies.env || process.env);
  const key = apiKey(config, keys);
  if (options.check) return {ok: true, mode: 'check', provider: config.provider, model: config.model, language: lang, languageName: languageName(lang), requestedVoice: config.voice || null, source, keyPresent: Boolean(key), adapterSupported: !['other', 'none'].includes(config.provider), narrationEnabled: config.provider !== 'none', accessVerified: false, voiceVerified: false, networkRequests: 0};
  if (config.provider === 'none') return {ok: true, skipped: true, provider: 'none', reason: 'Le choix enregistré n’utilise pas de voix off.', networkRequests: 0};
  if (config.provider === 'other') fail('UNSUPPORTED_PROVIDER', 'Le service personnalisé enregistré a besoin de son propre adaptateur vérifié. Ajoute son contrat de requête officiel et sa clé dans narrate.mjs, ou fournis un fichier de voix off enregistré. Aucune clé ni aucun texte n’a été envoyé.');
  if (!options.textFile || !options.out) fail('MISSING_ARGUMENT', 'Donne --text-file et un nouveau chemin --out qui finit par .mp3.');
  const out = resolve(options.out);
  if (extname(out).toLowerCase() !== '.mp3') fail('INVALID_OUTPUT', 'La sortie de voix off doit finir par .mp3.');
  const text = (await readRegular(resolve(options.textFile), 262144)).replace(/^\uFEFF/, '').trim();
  if (!text) fail('EMPTY_TEXT', 'Le fichier texte de la voix off est vide.');
  const textSha256 = sha(text);
  const inputFingerprint = sha(stable({version: VERSION, provider: config.provider, voice: config.voice, model: config.model, settings: config.settings, language: lang, textSha256}));
  await checkTools(dependencies);
  const existing = await validateCache(out, inputFingerprint, dependencies); if (existing) return existing;
  if (!key) fail('MISSING_KEY', `Ajoute ${KEYS[config.provider][0]} sur la page des clés (.env.local). Aucune demande n’a été envoyée au service.`);
  await mkdir(dirname(out), {recursive: true});
  const lockPath = `${out}.narration.lock`;
  let lock;
  try {lock = await open(lockPath, 'wx', 0o600); await lock.writeFile(JSON.stringify({pid: process.pid, at: new Date().toISOString()}));}
  catch {if (lock) {await lock.close(); await unlink(lockPath).catch(() => {});} fail('OUTPUT_LOCKED', 'Une autre voix off tient le verrou de cette sortie. Vérifie son processus et ses fichiers avant de retirer un verrou périmé ou de choisir une autre sortie.');}
  const temporary = `${out}.${randomUUID()}.tmp.mp3`;
  const stagedMeta = `${temporary}.json`;
  try {
    const cached = await validateCache(out, inputFingerprint, dependencies); if (cached) return cached;
    const voice = await resolveVoice(config, key, dependencies);
    const spec = buildRequest(config, voice, text, key);
    const fetched = await request(spec.url, {method: 'POST', headers: spec.headers, body: JSON.stringify(spec.body)}, {fetchImpl: dependencies.fetchImpl || fetch, timeoutMs: config.timeoutMs, provider: config.provider}, async response => {
      const contentType = response.headers.get('content-type') || '';
      if (/json|text\/|html/i.test(contentType)) fail('INVALID_RESPONSE', 'Le service a renvoyé du texte au lieu d’audio. Aucun fichier précédent n’a été remplacé et aucune nouvelle tentative n’a été faite.');
      return {audio: await bytes(response, 52428800), requestId: safeRequestId(response)};
    });
    await writeFile(temporary, fetched.audio, {flag: 'wx', mode: 0o600});
    const measured = await inspectAudio(temporary, dependencies);
    const metadata = {schemaVersion: VERSION, generatedAt: new Date().toISOString(), provider: config.provider, model: config.model, language: lang, configSource: source, requestedVoice: config.voice || null, resolvedVoice: voice, inputFingerprint, requestFingerprint: sha(stable({url: spec.url, body: spec.body, model: config.model})), settingsSha256: sha(stable(config.settings)), textSha256, textCharacters: [...text].length, audioSha256: sha(fetched.audio), bytes: fetched.audio.length, providerRequestId: fetched.requestId, ...measured};
    await writeFile(stagedMeta, JSON.stringify(metadata, null, 2) + '\n', {flag: 'wx', mode: 0o600});
    // The lock plus a second existence check protects prior valid takes.
    if (await exists(out) || await exists(`${out}.narration.json`)) fail('OUTPUT_EXISTS', 'Une sortie est apparue pendant la génération. Les fichiers existants ont été gardés.');
    await rename(stagedMeta, `${out}.narration.json`);
    await rename(temporary, out);
    return {ok: true, cached: false, out, metadata: `${out}.narration.json`, provider: config.provider, model: config.model, voice, ...measured};
  } finally {
    await unlink(temporary).catch(() => {}); await unlink(stagedMeta).catch(() => {});
    await lock.close(); await unlink(lockPath).catch(() => {});
  }
}

export async function main(args = process.argv.slice(2), dependencies = {}) {
  const options = {}; const names = {'--root': 'root', '--project': 'project', '--text-file': 'textFile', '--out': 'out', '--config': 'config', '--language': 'language'};
  try {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--check') {options.check = true; continue;}
      if (args[i] === '--help') {console.log('narrate.mjs --root <workspace> [--project <project-dir>] [--config <voice.json>] [--language fr] --text-file <narration.txt> --out <new.mp3>\nLangue : --language, sinon "language" de la config, sinon le reel.json à côté de --out, sinon le profil, sinon fr.\n--check inspecte la config et la présence de la clé sans appel réseau.'); return;}
      const name = names[args[i]]; if (!name || !args[i + 1] || args[i + 1].startsWith('--')) fail('INVALID_ARGUMENT', 'Lance --help pour voir les arguments de la voix off.');
      options[name] = args[++i];
    }
    console.log(JSON.stringify(await runNarration(options, dependencies), null, 2));
  } catch (error) {
    const known = error.narrationError === true;
    console.error(JSON.stringify({ok: false, code: known ? error.code : 'NARRATION_FAILED', error: known ? error.message : 'Une opération locale de voix off a échoué. Vérifie l’accès aux fichiers et l’espace disque libre. Les clés et le texte source ont été omis.'}));
    process.exitCode = 1;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
