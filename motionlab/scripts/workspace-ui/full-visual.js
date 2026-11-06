// Full Visual in the workspace: three steps, one prompt each. The page writes nothing about the video itself; the
// agent's files say where it is (research.md, transcript.md, then the video in workspace/output/<id>/).
import {productVoiceProviders} from './product-demo-voice.js';

export const fullVisualSteps = [
  ['research', 'Recherche', 'On trouve les faits.'],
  ['transcript', 'Script', 'On écrit ce que dit la voix off.'],
  ['video', 'Vidéo', 'On l’anime, mot par mot.'],
];
const voices = ['elevenlabs', 'openai', 'fish'].map(id => productVoiceProviders.find(p => p.id === id));
const today = () => { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(n => String(n).padStart(2, '0')).join('-'); };

export function fullVisualSlug(subject) {
  const words = String(subject || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  let slug = '';
  for (const word of words) { if ((slug + '-' + word).length > 48) break; slug = slug ? slug + '-' + word : word; }
  return slug || 'video';
}
export const fullVisualTitle = subject => String(subject || '').trim().split('\n')[0].slice(0, 80);
export const fullVisualId = (subject, date = today()) => `${date}-full-visual-${fullVisualSlug(subject)}`;
const folder = id => `workspace/projects/${id}`;

export function fullVisualResearchPrompt(d, id = fullVisualId(d.fvSubject)) {
  const subject = fullVisualTitle(d.fvSubject);
  if (!subject) throw Error('Écris d’abord ton sujet.');
  const notes = String(d.fvNotes || '').trim();
  return `/research\nNouvelle vidéo Full Visual : ${JSON.stringify(subject)}\nFais la recherche pour une courte vidéo explicative. Vérifie chaque fait aujourd’hui.\nDossier : ${folder(id)}/\nEnregistre research.md dedans, et project.json avec {"format":"full-visual","title":${JSON.stringify(subject)}}.` +
    (notes ? `\n\nMes liens et notes :\n${notes}` : '');
}
export function fullVisualTranscriptPrompt(id, own = '') {
  own = String(own || '').trim();
  return own
    ? `/full-visual-script\nUtilise mon propre script, mot pour mot. Signale seulement les faits qui semblent faux.\nDossier : ${folder(id)}/\nEnregistre-le dedans sous transcript.md.\n\n${own}`
    : `/full-visual-script\nÉcris le script à partir de research.md.\nDossier : ${folder(id)}/\nEnregistre dedans uniquement les mots prononcés, sous transcript.md.`;
}
export const fullVisualVideoPrompt = id => `/full-visual\nFais la vidéo à partir de transcript.md.\nDossier : ${folder(id)}/\nEnregistre la vidéo, caption.txt et cover.jpg dans workspace/output/${id}/.`;
export const fullVisualHasVoice = f => Object.values(f?.voiceKeys || {}).some(Boolean);

function track(current) {
  return `<nav class="onboarding-track" aria-label="Étapes de la vidéo">${fullVisualSteps.map(([id, label], i) => `${i ? '<span class="track-line" aria-hidden="true"></span>' : ''}<span ${current === id ? 'aria-current="step" class="current"' : ''}>${label}</span>`).join('')}</nav>`;
}
const promptBlock = (text, esc, button) => `<pre class="prompt-box product-demo-prompt" id="prompt-text">${esc(text)}</pre>${button('Copier le prompt', 'copy-prompt', 'primary', 'copy')}<p class="helper-note">Colle-le dans le chat ouvert dans ton dossier MotionLab.</p>`;

// The format page: the first video, or the videos so far.
export function fullVisualOverview(f, snapshot, {esc, link, projectRows, outputCards}) {
  const active = snapshot.projects.filter(p => p.format === f.id && !p.completed);
  const outputs = snapshot.outputs.filter(o => o.format === f.id);
  if (!active.length && !outputs.length) return `<div class="product-demo-project fv-first"><h2>Fais ta première vidéo.</h2><p class="muted">Choisis n’importe quel sujet. On fait la recherche, on l’écrit et on l’anime.</p><ol class="fv-steps">${fullVisualSteps.map(([, label, text], i) => `<li><span class="fv-number">${i + 1}</span><div><strong>${label}</strong><span>${text}</span></div></li>`).join('')}</ol><div class="button-row">${link('Nouvelle vidéo', '/formats/full-visual/new', 'primary', 'plus')}</div></div>`;
  return `${active.length ? `<section class="active-videos"><div class="section-title">En cours <span>${active.length}</span></div>${projectRows(active)}</section>` : ''}${outputs.length ? `<section class="recent-outputs"><div class="section-title">Tes vidéos</div>${outputCards(outputs)}</section>` : ''}`;
}

// New video: the subject, then the first prompt.
export function fullVisualNew(d, sub, {esc, heading, button, link}) {
  if (sub === 'new/prompt' && fullVisualTitle(d.fvSubject)) {
    return `<div class="center-flow product-demo-flow fv-flow">${track('research')}${heading('Lance la recherche.', 'Colle ceci dans ton chat. Ta vidéo apparaîtra ensuite sur cette page.')}${promptBlock(fullVisualResearchPrompt(d), esc, button)}<div class="flow-footer">${link('Retour', '/formats/full-visual/new', 'ghost')}${button('C’est fait', 'fv-done', '', 'check')}</div></div>`;
  }
  return `<div class="center-flow product-demo-flow fv-flow">${track('research')}${heading('De quoi parle ta vidéo ?', 'Un seul sujet suffit.')}<form id="fv-new-form">
    <label class="field"><span>Ton sujet</span><textarea data-field="fvSubject" rows="2" placeholder="Comment marchent les casques à réduction de bruit ?">${esc(d.fvSubject)}</textarea></label>
    <details class="product-demo-options" ${d.fvNotes ? 'open' : ''}><summary>Ajouter des liens ou des notes</summary><label class="field"><span>Liens ou notes (facultatif)</span><textarea data-field="fvNotes" placeholder="Articles, un rapport, tout ce qui peut servir">${esc(d.fvNotes)}</textarea></label></details>
    <p class="inline-alert" id="form-error" role="alert"></p>
    <div class="flow-footer">${link('Retour', '/formats/full-visual', 'ghost')}<button type="submit" class="btn primary">Continuer</button></div></form></div>`;
}

function voiceForm(f, d, esc) {
  const chosen = voices.find(v => v.id === d.fvVoice) || voices[0];
  return `<form id="fv-voice-form" class="fv-voice"><label class="field"><span>Service de voix off</span><select data-field="fvVoice">${voices.map(v => `<option value="${v.id}" ${v.id === chosen.id ? 'selected' : ''}>${v.name}${v.id === 'elevenlabs' ? ' (la meilleure, avec émotion)' : ''}</option>`).join('')}</select></label>
    <div class="onb-key"><div class="onb-key-label"><label for="fv-key">Clé ${esc(chosen.name)}</label><a href="${esc(chosen.url)}" target="_blank" rel="noopener noreferrer">Obtenir une clé ↗</a></div><input id="fv-key" type="password" placeholder="Colle ta clé" autocomplete="off" spellcheck="false"><p>Elle reste sur cet ordinateur.</p></div>
    <p class="inline-alert" id="form-error" role="alert"></p><button type="submit" class="btn primary">Enregistrer la clé</button></form>`;
}

// One video: the three steps, and the prompt for the one that is next.
export function fullVisualProject(p, f, d, pd, {esc, heading, button, link}) {
  const read = name => p.files?.find(file => file.path === `${p.path}/${name}`);
  const video = p.completed && p.files?.find(file => p.outputPaths?.includes(file.path));
  const caption = p.files?.find(file => file.path === `${p.outputPath}/caption.txt`);
  const current = p.completed ? null : p.progress?.current || 'research';
  const rows = fullVisualSteps.map(([id, label], i) => {
    const step = p.steps?.find(s => s.id === id), done = step?.status === 'done', file = id !== 'video' && done && read(id + '.md');
    return `<li data-state="${done ? 'done' : id === current ? 'current' : 'later'}"><span class="fv-number">${done ? '✓' : i + 1}</span><div><strong>${label}</strong><span>${done ? 'Terminé' : id === current ? 'Maintenant' : 'Ensuite'}</span></div>${file ? link('Lire', '/files?file=' + encodeURIComponent(file.path), 'small-btn ghost') : ''}</li>`;
  }).join('');
  let panel = '';
  if (video) {
    // Finished: the video is the page. The research and transcript stay one click away.
    const cover = p.files?.find(file => file.path === `${p.outputPath}/cover.jpg`);
    const notes = ['research', 'transcript'].map(n => read(n + '.md')).filter(Boolean).map(file => link({research: 'Lire la recherche', transcript: 'Lire le script'}[file.name.replace('.md', '')] || 'Lire ' + file.name.replace('.md', ''), '/files?file=' + encodeURIComponent(file.path), 'ghost small-btn')).join('');
    return `<div class="fv-project">${heading(p.name, 'Ta vidéo est prête.')}<video class="product-demo-video fv-video" src="${esc(video.url)}" ${cover ? `poster="${esc(cover.url)}"` : ''} controls playsinline preload="metadata" aria-label="${esc(p.name)}"></video><div class="button-row"><a class="btn primary" href="${esc(video.url)}" download>Télécharger la vidéo</a>${caption ? button('Copier la légende', 'fv-caption:' + p.id, '', 'copy') : ''}</div><div class="button-row fv-notes">${notes}</div>${link('Retour à Full Visual', '/formats/full-visual', 'ghost fv-back')}</div>`;
  }
  else if (current === 'research') panel = `<h2>D’abord, la recherche.</h2>${promptBlock(fullVisualResearchPrompt({fvSubject: p.name}, p.id), esc, button)}`;
  else if (current === 'transcript') panel = `<h2>Maintenant, le script.</h2><p class="muted">${pd.own ? 'Colle ton script. On garde tes mots.' : 'On l’écrit à partir de ta recherche.'}</p>${pd.own ? `<label class="field"><span>Ton script</span><textarea data-fv-text="${esc(p.id)}" rows="8" placeholder="Colle ce que la voix off doit dire">${esc(pd.text)}</textarea></label>` : ''}${promptBlock(fullVisualTranscriptPrompt(p.id, pd.own ? pd.text : ''), esc, button)}${button(pd.own ? 'Écris-le pour moi plutôt' : 'J’ai mon propre script', 'fv-own:' + p.id, 'ghost small-btn')}`;
  else if (!fullVisualHasVoice(f)) panel = `<h2>Ajoute d’abord une voix.</h2><p class="muted">Ta vidéo a besoin d’une voix off. ElevenLabs sonne le mieux, avec une vraie émotion.</p>${voiceForm(f, d, esc)}`;
  else panel = `<h2>Maintenant, la vidéo.</h2><p class="muted">On ajoute la voix off, les sous-titres et les visuels.</p>${promptBlock(fullVisualVideoPrompt(p.id), esc, button)}`;
  return `<div class="fv-project">${heading(p.name, p.completed ? 'Ta vidéo est prête.' : '')}<ol class="fv-steps fv-progress">${rows}</ol><section class="fv-panel">${panel}</section>${link('Retour à Full Visual', '/formats/full-visual', 'ghost fv-back')}</div>`;
}
