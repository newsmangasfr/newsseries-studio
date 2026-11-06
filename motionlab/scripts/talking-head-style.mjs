// The Talking Head style the person picked once: Classic (the talking-head skill) or Split explainer (the
// split-explainer skill). The app reads it from workspace/library/talking-head.json; the agent reads the one
// sentence it leaves at the top of workspace/library/talking-head.preferences.md, which it reads before every video.
import { existsSync, readFileSync, realpathSync, mkdirSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { talkingStyles as createdStyles } from './workspace-state.mjs';

export const talkingStyles = {
  classic: { name: 'Classic', skill: 'talking-head', line: 'Style : Classic. Je parle tout du long et les visuels apparaissent au-dessus de moi. Utilise la skill talking-head pour mes vidéos.' },
  split: { name: 'Split explainer', skill: 'split-explainer', line: 'Style : Split explainer. L’écran se partage entre moi et les visuels, et les visuels prennent parfois tout l’écran. Utilise la skill split-explainer pour mes vidéos.' },
};

export class TalkingStyleError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const atomic = (path, text) => {
  const temporary = path + '.' + randomUUID() + '.tmp';
  try { writeFileSync(temporary, text, { flag: 'wx' }); renameSync(temporary, path); } finally { rmSync(temporary, { force: true }); }
};

export function saveTalkingStyle(root, input) {
  root = realpathSync(root);
  const registry = JSON.parse(readFileSync(join(root, 'runtime.json'), 'utf8'));
  if (!registry.packs?.some((p) => p.name === 'talking-head')) throw new TalkingStyleError(400, 'Utilise le dossier où Talking Head est installé.');
  const style = input && typeof input === 'object' && !Array.isArray(input) ? input.style : null;
  const own = talkingStyles[style] ? null : createdStyles(root).find((t) => t.id === style);
  if (!talkingStyles[style] && !own) throw new TalkingStyleError(400, 'Choisis un des styles de cette page.');
  const line = own ? `Style : ${own.name}. Mon propre format, créé avec create-my-own. Utilise la skill ${own.skill} pour mes vidéos.` : talkingStyles[style].line;
  const library = join(root, 'workspace/library');
  mkdirSync(library, { recursive: true });
  const settingsPath = join(library, 'talking-head.json');
  let settings = {};
  try { settings = existsSync(settingsPath) ? JSON.parse(readFileSync(settingsPath, 'utf8')) : {}; } catch { throw new TalkingStyleError(409, 'workspace/library/talking-head.json n’est pas valide. Corrige-le ou supprime-le, puis choisis à nouveau.'); }
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) settings = {};
  atomic(settingsPath, JSON.stringify({ ...settings, style }, null, 2) + '\n');
  // One sentence, rewritten in place: the preferences page holds what stays true, never a log.
  const pagePath = join(library, 'talking-head.preferences.md');
  const page = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '# Préférences Talking Head\n';
  const kept = page.split('\n').filter((l) => !/^Style ?: .*(?:Use the [a-z0-9-]+ skill for my videos|Utilise la skill [a-z0-9-]+ pour mes vidéos)\.$/.test(l));
  const at = kept[0]?.startsWith('# ') ? 1 : 0;
  kept.splice(at, 0, '', line);
  atomic(pagePath, kept.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n'));
  return { ok: true, style };
}
