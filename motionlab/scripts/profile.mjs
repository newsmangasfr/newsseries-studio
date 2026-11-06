#!/usr/bin/env node
// profile.mjs [--handle <handle-or-profile-link>] [--days 90] [--trial-reels] [--media <id,id>]
// Contract: reads COMPOSIO_API_KEY from .env.local, pulls the buyer's OWN Instagram account through the Composio SDK
//   (direct tool execution, no server). Default: 90 days of captions and metadata, with up to 12 thumbnails and no
//   videos. --trial-reels: rank 180 days of video metrics and save only the best 50 previews. --media <id,id> downloads
//   only named references from that selection. All modes preserve older saved posts and existing media.
//   Prints the connection link when Instagram is not connected yet. Exits 1 with the reason on failure. Never reads
//   another account. Tool names and fields verified on the live toolkit on 2026-09-03: INSTAGRAM_GET_USER_INFO,
//   INSTAGRAM_GET_USER_MEDIA (limit, after; returns id, shortcode, caption, media_type, media_product_type, permalink,
//   thumbnail_url, timestamp, like_count, comments_count, paging.cursors.after), INSTAGRAM_GET_POST_INSIGHTS
//   (ig_post_id, metric). The video link (media_url) comes from a direct field request on the same connection and is
//   absent when the post carries licensed music, by Instagram's rule. No per-post non-follower reach exists.
//   Connection: when the account is not connected the SDK throws; the script then creates a connection link through
//   POST /api/v3/connected_accounts/link (the authorize helper is retired for Composio-managed auth), prints it, waits up to
//   ten minutes for the approval (skip with --no-wait), and continues. The link is valid for ten minutes.
//   duration is measured with ffprobe on the saved video and stays null when no file could be saved.
import { P, readJson, writeJson, now, loadEnv, fail, ffbin, run } from "./_lib.mjs";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { exec as shell } from "node:child_process";
import { beginTask } from "./task-status.mjs";
import { accountHandle } from './workspace-ui/account-identity.js';
import { saveProfileAvatar } from './profile-avatar.mjs';
import { ACCOUNT_DAYS, TRIAL_DAYS, ACCOUNT_PREVIEWS, trialInstalled, trialPosts, trialSources, recentPosts, mapLimit, isVideo } from './reading-policy.mjs';

import {TRIAL_INPUTS, requestedReels, postCode} from './trial-input-contract.mjs';
const args = process.argv.slice(2);
const requestId=args.includes('--requested')?args[args.indexOf('--requested')+1]:null;
const requested=requestId?requestedReels(readJson(P(TRIAL_INPUTS),{}),requestId==='all'?null:requestId):[];
if(requestId&&!requested.length)fail('Cette demande de reels n’a aucun lien enregistré.');
const trial = args.includes('--trial-reels');
const mediaIds = args.includes('--media') ? args[args.indexOf('--media') + 1]?.split(',').filter(Boolean) : null;
if ((trial || mediaIds || requestId) && !trialInstalled()) fail('Trial Reels n’est pas installé.');
const previous = readJson(P('context', 'posts.json'), []);
const previousProfile = readJson(P('context', 'profile.json'), {});
const onboarding = readJson(P('context', 'onboarding.json'), {});
const suppliedHandle = args.includes('--handle') ? args[args.indexOf('--handle') + 1] : null;
if (!suppliedHandle && !previousProfile.handle && onboarding.handle && onboarding.platform !== 'instagram') fail('La lecture de compte de cette plateforme n’est pas encore disponible. Tes formats restent disponibles.');
const expectedHandle = accountHandle(suppliedHandle ?? (onboarding.platform === 'instagram' && onboarding.handle || previousProfile.handle));
if (args.includes('--handle') && !expectedHandle) fail('Utilise ton identifiant Instagram ou le lien de ton profil.');
if (mediaIds && (!mediaIds.length || mediaIds.some(id => !trialSources(previous).some(p => p.id === id)))) fail('Choisis un reel sélectionné ou un lien ajouté avec + Trial reels.');

const task = beginTask({ id: trial || mediaIds || requestId ? "trial-selection" : "profile", label: requestId ? "Lecture des reels demandés" : trial || mediaIds ? "Recherche de tes meilleurs reels" : "Lecture de ton compte", stage: "Vérification de la connexion" });
loadEnv();
process.env.COMPOSIO_LOG_LEVEL ??= "error";
// Onboarding reads three months of captions and a small set of thumbnails. No video scans.
const days = trial ? TRIAL_DAYS : args.includes('--days') ? Number(args[args.indexOf('--days') + 1]) : ACCOUNT_DAYS;
if (!Number.isInteger(days) || days < 1 || days > (trial ? TRIAL_DAYS : ACCOUNT_DAYS)) fail('La lecture du compte couvre de 1 à 90 jours. Trial Reels utilise 180 jours.');
const apiKey = process.env.COMPOSIO_API_KEY;
if (!apiKey) fail("COMPOSIO_API_KEY manque ; lance : npm run keys");

const METRICS = ["reach", "views", "likes", "comments", "shares", "saved", "total_interactions", "ig_reels_avg_watch_time"];
const TOOLS = ["INSTAGRAM_GET_USER_INFO", "INSTAGRAM_GET_USER_MEDIA", "INSTAGRAM_GET_POST_INSIGHTS"];
const API = "https://backend.composio.dev/api/v3";

let Composio, SessionPreset;
try { ({ Composio, SessionPreset } = await import("@composio/core")); } catch { fail("@composio/core n’est pas installé ; lance : npm install"); }

const composio = new Composio({ apiKey });
const userId = process.env.COMPOSIO_USER_ID || "motionlab-owner";
const H = { "x-api-key": apiKey, "content-type": "application/json" };
const api = async (path, init) => { const r = await fetch(`${API}${path}`, { headers: H, ...init }); return r.json(); };
const openSession = (connection) => composio.create(userId, { toolkits: ["instagram"], tools: { instagram: TOOLS }, ...(connection ? {connectedAccounts:{instagram:connection}} : {}), manageConnections: false, sessionPreset: SessionPreset.DIRECT_TOOLS });

// Connection: when Instagram is not connected, make a link, print it, wait for the approval, then continue.
async function connect() {
  task.update({ stage: "En attente de l’autorisation du compte" });
  let ac = null;
  try { const j = await api("/auth_configs?toolkit_slug=instagram"); ac = ((j.items ?? []).find((a) => a.status === "ENABLED") ?? (j.items ?? [])[0])?.id ?? null; } catch {}
  if (!ac) { try { const j = await api("/auth_configs", { method: "POST", body: JSON.stringify({ toolkit: { slug: "instagram" }, auth_config: { type: "use_composio_managed_auth" } }) }); ac = j.auth_config?.id ?? j.id ?? null; } catch {} }
  if (!ac) fail("Instagram n’est pas connecté et aucune connexion n’a pu être préparée. Ajoute le toolkit Instagram dans ton tableau de bord Composio, puis relance profile.");
  const link = await api("/connected_accounts/link", { method: "POST", body: JSON.stringify({ auth_config_id: ac, user_id: userId }) });
  if (!link.redirect_url) fail(`le lien de connexion a échoué : ${JSON.stringify(link).slice(0, 200)}`);
  console.log(`Instagram n’est pas encore connecté. Une page s’est ouverte dans ton navigateur ; autorise l’accès avec le compte depuis lequel tu publies (un compte Professionnel ou Créateur). Le lien est valable dix minutes :\n${link.redirect_url}`);
  if (process.argv.includes("--no-wait")) process.exit(2);
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start \"\"" : "xdg-open";
  shell(`${opener} "${link.redirect_url}"`, () => {});
  console.log("attente de l’autorisation, dix minutes au plus...");
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    try { const j = await api(`/connected_accounts?user_ids=${encodeURIComponent(userId)}&toolkit_slugs=instagram`); const items = j.items ?? [];
      if (items.some((a) => a.status === "ACTIVE")) { console.log("connecté"); return; }
      if (items.length && items.every((a) => a.status === "FAILED")) fail("la connexion a été refusée ; relance profile pour obtenir un nouveau lien"); } catch {}
  }
  fail("aucune autorisation après dix minutes ; relance profile pour obtenir un nouveau lien");
}

let session;
const notConnected = (e) => /no active connection/i.test(JSON.stringify(e?.error ?? e?.message ?? e ?? ""));
const exec = async (tool, args) => { try { return await session.execute(tool, args); } catch (e) { return { error: e?.error?.error ?? e?.error ?? { message: String(e?.message ?? e) } }; } };
try { session = await openSession(); } catch (e) { if (!notConnected(e)) fail(`la session Composio a échoué : ${String(e?.message ?? e).slice(0, 200)}`); }
let me = session ? await exec("INSTAGRAM_GET_USER_INFO", {}) : { error: { message: "No active connection" } };
if (me.error && notConnected(me)) {
  await connect();
  try { session = await openSession(); } catch (e2) { fail(`la session Composio a échoué après la connexion : ${String(e2?.message ?? e2).slice(0, 200)}`); }
  me = await exec("INSTAGRAM_GET_USER_INFO", {});
}

if (me.error) fail(`l’appel Instagram a échoué : ${JSON.stringify(me.error).slice(0, 200)}`);
let user = me.data ?? {};
const actualHandle = accountHandle(user.username);
if (!actualHandle) fail('Instagram n’a pas renvoyé ton identifiant. Reconnecte le compte et réessaie.');
if (expectedHandle && actualHandle.toLowerCase() !== expectedHandle.toLowerCase()) fail(`Instagram a connecté @${actualHandle}, mais cette lecture est pour @${expectedHandle}. Reconnecte le bon compte ; ton travail enregistré ne change pas.`);
if (previousProfile.id && user.id && String(previousProfile.id) !== String(user.id)) fail('Cette connexion appartient à un autre compte. Garde son contexte dans un dossier MotionLab séparé.');

// The connected account id, for the direct field request below.
let connectedAccount = null;
try {
  const r = await fetch(`${API}/connected_accounts?user_ids=${encodeURIComponent(userId)}&toolkit_slugs=instagram`, { headers: { "x-api-key": apiKey } });
  const j = await r.json(); const active = (j.items ?? []).filter((a) => a.status === "ACTIVE");
  if (active.length === 1) connectedAccount = active[0].id;
  else for (const connection of active) {
    const identity = await field('me','id,username',connection.id);
    if ((user.id && String(identity.id) === String(user.id)) || accountHandle(identity.username).toLowerCase() === actualHandle.toLowerCase()) { connectedAccount = connection.id; break; }
  }
} catch { connectedAccount = null; }
async function field(mediaId, fields, connection = connectedAccount) {
  if (!connection) return {};
  try {
    const r = await fetch(`${API}/tools/execute/proxy`, { method: "POST", signal:AbortSignal.timeout(8000), headers: { "x-api-key": apiKey, "content-type": "application/json" }, body: JSON.stringify({ endpoint: `/${encodeURIComponent(mediaId)}?fields=${fields}`, method: "GET", connected_account_id: connection }) });
    const j = await r.json(); return j.error || j.data?.error ? {} : j.data ?? {};
  } catch { return {}; }
}

// The same connection supplies both identity fields and post data.
if (connectedAccount) session = await openSession(connectedAccount);
const accountRead = !trial && !mediaIds && !requestId;
let identity = previousProfile;
if (accountRead) {
  task.update({stage:'Enregistrement de ton profil'});
  // Some toolkit versions return only id, username and account type by default.
  const extra = await field(user.id || 'me','id,username,name,biography,website,followers_count,account_type,profile_picture_url');
  if ((!extra.id || !user.id || String(extra.id) === String(user.id)) && (!extra.username || accountHandle(extra.username).toLowerCase() === actualHandle.toLowerCase())) user = {...user,...extra};
  identity = {...previousProfile,platform:'instagram',handle:actualHandle,id:user.id ?? previousProfile.id ?? null,
    name:user.name ?? previousProfile.name ?? null,followers:user.followers_count ?? previousProfile.followers ?? null,
    bio:user.biography ?? previousProfile.bio ?? '',link:user.website ?? previousProfile.link ?? null,
    account_type:user.account_type ?? previousProfile.account_type ?? null,toolkits:['instagram'],identity_at:now()};
  // Identity is available even if the subsequent post request is interrupted.
  writeJson(P('context','profile.json'),identity);
  let picture = user.profile_picture_url;
  if (!picture) picture = (await field(user.id || 'me','profile_picture_url')).profile_picture_url;
  identity.avatar = await saveProfileAvatar({root:process.cwd(),url:picture,previous:previousProfile.avatar});
  writeJson(P('context','profile.json'),identity);
}

const since = Date.now() - days * 864e5;
task.update({ stage: requestId ? `Recherche des ${requested.length} reels demandés dans ton compte` : `Recherche des posts des ${days} derniers jours` });
const wanted=new Set(requested.map(r=>r.code));
const posts = requestId?previous.filter(p=>wanted.has(postCode(p))):[];
for(const p of posts)wanted.delete(postCode(p));
let after = null, stop = false;
if (!mediaIds && (!requestId || wanted.size)) do {
  const r = await exec("INSTAGRAM_GET_USER_MEDIA", after ? { limit: 50, after } : { limit: 50 });
  if (r.error) fail(`l’appel média a échoué : ${JSON.stringify(r.error).slice(0, 200)}`);
  const items = r.data?.data ?? [];
  for (const m of items) { if(requestId){if(wanted.has(postCode(m))){posts.push(m);wanted.delete(postCode(m));}if(!wanted.size){stop=true;break;}continue;} if (new Date(m.timestamp).getTime() < since) { stop = true; break; } posts.push(m); }
  after = stop || !items.length ? null : r.data?.paging?.cursors?.after ?? null;
} while (after);

function parseInsights(data) { const out = {}; for (const m of data?.data ?? []) { const v = m.values?.length ? m.values[m.values.length - 1].value : m.total_value?.value; if (typeof v === "number") out[m.name] = v; } return out; }
mkdirSync(P("context", "posts"), { recursive: true });
const ffprobe = ffbin("ffprobe");
function probeDuration(path) { if (!ffprobe || !existsSync(path)) return null; try { const v = Number(run(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).trim()); return Number.isFinite(v) ? Number(v.toFixed(2)) : null; } catch { return null; } }
async function save(url, path) { if (!url || existsSync(path)) return existsSync(path); try { const r = await fetch(url); if (!r.ok) return false; writeFileSync(path, Buffer.from(await r.arrayBuffer())); return true; } catch { return false; } }

const previousById = new Map(previous.map(p => [p.id, p]));
let completed = 0;
task.update({ stage: requestId ? 'Lecture des reels demandés' : trial ? 'Classement de six mois par portée' : 'Lecture de trois mois de légendes', completed: 0, total: posts.length });
const out = mediaIds ? previous : await mapLimit(posts, 4, async m => {
  const old = previousById.get(m.id);
  if(requestId&&old===m)return m;
  let metrics = {};
  // Onboarding needs identity and voice, not an insight request for every post.
  if (trial && isVideo({media_type: m.media_product_type ?? m.media_type})) {
    const r = await exec("INSTAGRAM_GET_POST_INSIGHTS", { ig_post_id: m.id, metric: METRICS.join(",") });
    if (!r.error) metrics = parseInsights(r.data);
    else {
      // A rejected metric used to multiply one call into eight serial calls per video.
      const reach = await exec("INSTAGRAM_GET_POST_INSIGHTS", { ig_post_id: m.id, metric: 'reach' });
      if (!reach.error) metrics = parseInsights(reach.data);
    }
  }
  task.update({ completed: ++completed });
  return {
    id: m.id, code: m.shortcode ?? old?.code ?? null, timestamp: m.timestamp, permalink: m.permalink, caption: m.caption ?? '',
    media_type: m.media_product_type ?? m.media_type, duration: old?.duration ?? null,
    thumbnail: m.thumbnail_url ?? old?.thumbnail ?? null, download_url: old?.download_url ?? null,
    local: old?.local ?? { thumbnail: null, video: null }, sound: old?.sound ?? null,
    metrics: { ...old?.metrics, reach: metrics.reach ?? old?.metrics?.reach ?? null, plays: metrics.views ?? old?.metrics?.plays ?? null,
      saves: metrics.saved ?? old?.metrics?.saves ?? null, shares: metrics.shares ?? old?.metrics?.shares ?? null,
      comments: metrics.comments ?? m.comments_count ?? null, likes: metrics.likes ?? m.like_count ?? null,
      avg_watch_ms: metrics.ig_reels_avg_watch_time ?? old?.metrics?.avg_watch_ms ?? null, non_follower_reach: null },
  };
});
const selected = requestId ? out.filter(isVideo) : mediaIds ? out.filter(p => mediaIds.includes(p.id)) : trial ? trialPosts(out) : recentPosts(out, days).slice(0, ACCOUNT_PREVIEWS);
completed = 0;
task.update({ stage: requestId ? 'Enregistrement des aperçus demandés' : mediaIds ? 'Enregistrement des vidéos de référence choisies' : trial ? `Préparation de ${selected.length} aperçus de reels` : 'Vérification de quelques miniatures récentes', completed: 0, total: selected.length });
await mapLimit(selected, 4, async p => {
  const extra = isVideo(p) && (mediaIds || !p.thumbnail) ? await field(p.id, 'media_url,thumbnail_url') : {};
  p.thumbnail = p.thumbnail ?? extra.thumbnail_url ?? null;
  p.download_url = extra.media_url ?? p.download_url ?? null;
  await save(p.thumbnail, P('context', 'posts', `${p.id}.jpg`));
  const videoSaved = mediaIds ? await save(p.download_url, P('context', 'posts', `${p.id}.mp4`)) : existsSync(P('context', 'posts', `${p.id}.mp4`));
  p.local = { thumbnail: existsSync(P('context', 'posts', `${p.id}.jpg`)) ? `context/posts/${p.id}.jpg` : null, video: videoSaved ? `context/posts/${p.id}.mp4` : null };
  if (mediaIds && videoSaved) p.duration = probeDuration(P('context', 'posts', `${p.id}.mp4`));
  task.update({ completed: ++completed });
});
const merged = new Map(previous.map(p => [p.id, p]));
for (const p of out) merged.set(p.id, p);
const savedPosts = [...merged.values()].sort((a,b) => String(b.timestamp).localeCompare(String(a.timestamp)));
// Updating media links does not invalidate every reading derived from account captions.
if (JSON.stringify(previous) !== JSON.stringify(savedPosts)) writeJson(P('context', 'posts.json'), savedPosts);
if (trial) writeJson(P('context', 'trial-reels', 'selection.json'), { version: 1, days: TRIAL_DAYS, limit: 50, ranked_by: 'reach, then views when reach is unavailable', eligible: out.filter(isVideo).length, posts: out.length, ids: selected.map(p => p.id), missing_metrics: out.filter(isVideo).filter(p => p.metrics?.reach == null && p.metrics?.plays == null).map(p => p.id), at: now() });
if(requestId){const missing=requested.filter(r=>!selected.some(p=>postCode(p)===r.code));task.done(missing.length?`${missing.length} liens introuvables parmi les vidéos de ton compte`:'Reels demandés enregistrés');console.log(JSON.stringify({saved:selected.map(p=>p.id),unavailable:missing.map(r=>r.url)}));process.exit(missing.length?1:0);}
if (mediaIds) { const missing = selected.filter(p => !p.local.video).map(p => p.id); task.done(missing.length ? `${selected.length - missing.length} références enregistrées ; ${missing.length} indisponibles` : 'Fichiers de référence enregistrés'); console.log(JSON.stringify({saved:selected.filter(p=>p.local.video).map(p=>p.id), unavailable:missing})); process.exit(0); }
const captions = out.map((p) => p.caption).filter(Boolean);
const weeks = Math.max(1, days / 7);
const profile = {
  ...identity,
  handle: actualHandle, id: user.id ?? identity.id ?? null, followers: user.followers_count ?? identity.followers ?? null, bio: user.biography ?? identity.bio ?? "", link: user.website ?? identity.link ?? null,
  account_type: user.account_type ?? identity.account_type ?? null, language: identity.language ?? null, cadence_per_week: Number((out.length / weeks).toFixed(1)),
  comment_line_share: captions.length ? Number((captions.filter((c) => /^comment(?:e|ez)?\s+["\u201c\u2018'\u00ab]?\s?[a-z0-9\u00c0-\u017f]{3,}\s?["\u201d\u2019'\u00bb]?(?=[\s,.!:]|$)/i.test(c.trim())).length / captions.length).toFixed(2)) : null,
  toolkits: ["instagram"], pulled_at: now(), context_days: trial ? (readJson(P("context", "profile.json"), {})?.context_days ?? ACCOUNT_DAYS) : days,
};
if (!trial) writeJson(P("context", "profile.json"), profile);
if (!trial) writeJson(P("context", "account-scope.json"), { version: 1, days, ids: out.map(p => p.id), previews: selected.map(p => p.id), at: now() });
task.done("Compte enregistré");
const withVideo = out.filter((p) => p.local.video).length;
console.log(`profile : @${profile.handle}, ${profile.followers} abonnés, ${out.length} posts en ${days} jours, ${withVideo} avec un fichier vidéo, part de lignes « commente » ${profile.comment_line_share}`);
