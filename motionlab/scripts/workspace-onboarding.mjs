// The first welcome is separate from account learning. Completion is permanent.
import { readFileSync, writeFileSync, lstatSync, mkdirSync, renameSync, rmSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { accountHandle } from './workspace-ui/account-identity.js';

export class OnboardingError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const platforms = ['instagram', 'tiktok', 'youtube'];
const lastRead = new Map();
function localPath(root, relative) {
  let path = realpathSync(root);
  for (const part of relative.split('/')) {
    path = join(path, part);
    try { if (lstatSync(path).isSymbolicLink()) throw new OnboardingError(409, 'Enregistre dans le dossier MotionLab d’origine.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return path;
}
function read(root, path) {
  try { return readFileSync(localPath(root, path), 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return ''; throw error; }
}
function json(root, path) {
  const content = read(root, path);
  if (!content) return {};
  try { return JSON.parse(content) || {}; }
  catch { throw new OnboardingError(409, 'Ton dossier se met à jour. Réessaie dans un instant.'); }
}
function snapshotJson(root, path) {
  const key = join(root, path);
  try { const value = json(root, path); lastRead.set(key, value); return value; }
  catch { return lastRead.get(key) || {}; }
}
function atomic(root, relative, content) {
  const path = localPath(root, relative);
  mkdirSync(dirname(path), { recursive: true });
  const temporary = path + '.' + randomUUID() + '.tmp';
  try { writeFileSync(temporary, content, { mode: 0o600, flag: 'wx' }); renameSync(temporary, path); }
  finally { rmSync(temporary, { force: true }); }
}
function hasKey(root) {
  if (process.env.COMPOSIO_API_KEY?.trim()) return true;
  try { return /^\s*(?:export\s+)?COMPOSIO_API_KEY\s*=\s*["']?[^\s"'#]+/m.test(read(root, '.env.local')); }
  catch { return false; }
}
export function readOnboarding(root, { returning = false, profile = {} } = {}) {
  const saved = snapshotJson(root, 'context/onboarding.json');
  const legacy = snapshotJson(root, 'context/start.json');
  const platform = platforms.includes(saved.platform) ? saved.platform : platforms.includes(profile.platform) ? profile.platform : 'instagram';
  // This allowlist is the whole browser contract. Keys never enter a snapshot.
  return {
    version: 1, done: saved.done === true || legacy.done === true || returning,
    persisted: saved.done === true, at: saved.at || null,
    stage: saved.stage === 'prompt' ? 'prompt' : 'welcome', platform,
    handle: accountHandle(saved.handle || profile.handle, platform), hasKey: hasKey(root),
  };
}
export function saveOnboarding(root, input) {
  if (!['details', 'complete'].includes(input?.action)) throw new OnboardingError(400, 'Choisis une action d’accueil.');
  const previous = json(root, 'context/onboarding.json');
  const legacy = snapshotJson(root, 'context/start.json');
  const next = {
    version: 1, done: previous.done === true || legacy.done === true || input.action === 'complete',
    at: previous.at || null, stage: previous.stage === 'prompt' ? 'prompt' : 'welcome',
    platform: platforms.includes(previous.platform) ? previous.platform : 'instagram',
    handle: accountHandle(previous.handle, previous.platform),
  };
  if (input.action === 'details') {
    if (!platforms.includes(input.platform)) throw new OnboardingError(400, 'Choisis la plateforme de ton compte.');
    const value = typeof input.handle === 'string' ? input.handle.trim() : '';
    const handle = accountHandle(value, input.platform);
    if (value && !handle) throw new OnboardingError(400, 'Utilise ton identifiant ou le lien de ton profil.');
    const key = input.key == null ? '' : input.key;
    if (typeof key !== 'string' || key.length > 4096 || /[\r\n\0]/.test(key) || key.trim() && !/^[a-zA-Z0-9_.:-]+$/.test(key.trim())) throw new OnboardingError(400, 'Colle uniquement ta clé API Composio.');
    if (key.trim()) {
      const env = read(root, '.env.local');
      const lines = env.split(/\r?\n/).filter(line => !/^\s*(?:export\s+)?COMPOSIO_API_KEY\s*=/.test(line));
      atomic(root, '.env.local', lines.join('\n').replace(/\n*$/, '\n') + 'COMPOSIO_API_KEY=' + key.trim() + '\n');
    }
    next.platform = input.platform; next.handle = handle; next.stage = 'prompt';
  }
  if (next.done && !next.at) next.at = new Date().toISOString();
  atomic(root, 'context/onboarding.json', JSON.stringify(next, null, 2) + '\n');
  return readOnboarding(root);
}
