// Talking Head comes in styles. The person picks once, after watching a real video of each, or creates their own
// from videos they love (the create-my-own skill); a style they created shows up here beside ours.
export const talkingStyleCards = [
  ['classic', 'Classic', 'Tu parles tout du long. Les visuels apparaissent au-dessus de toi, sur tes mots.', 'Idéal pour une idée forte, un produit ou une histoire.', 'classic'],
  ['split', 'Split explainer', 'L’écran se partage : toi en bas, les visuels en haut. Parfois, les visuels prennent tout l’écran.', 'Idéal pour expliquer comment quelque chose fonctionne.', 'split-explainer'],
];
const example = name => `/media/assets/talking-head/examples/${name}`;
export const talkingStyleName = f => talkingStyleCards.find(c => c[0] === f.style)?.[1] || f.styles?.find(s => s.id === f.style)?.name || '';
// The skill a style runs on: ours, or the one create-my-own made.
export const talkingStyleSkill = (f, id = f.style) => id === 'split' ? 'split-explainer' : id === 'classic' || !id ? 'talking-head' : f.styles?.find(s => s.id === id)?.skill || 'talking-head';

export function talkingStylePage(f, {esc, heading, button, link}) {
  const card = (id, name, what, video, poster) => `<article class="th-style${f.style === id ? ' chosen' : ''}">
    ${video ? `<video src="${esc(video)}" ${poster ? `poster="${esc(poster)}"` : ''} controls playsinline preload="metadata" aria-label="Exemple ${esc(name)}"></video>` : '<div class="th-style-empty" aria-hidden="true"></div>'}
    <h2>${esc(name)}</h2><p>${esc(what)}</p>
    ${button(f.style === id ? 'Garder ' + name : 'Utiliser ' + name, 'th-style:' + id, f.style === id ? '' : 'primary', f.style === id ? 'check' : '')}</article>`;
  const ours = talkingStyleCards.map(([id, name, what, , file]) => card(id, name, what, example(file + '.mp4'), example(file + '.jpg')));
  const theirs = (f.styles || []).map(s => card(s.id, s.name, s.what || 'Ton propre format.', s.example));
  const create = `<article class="th-style th-style-create"><div class="th-style-empty th-style-plus" aria-hidden="true">+</div><h2>Créer le mien</h2><p>Colle des liens de vidéos que tu adores. On étudie chaque image et on construit ton propre style.</p>${link('Créer le mien', '/formats/talking-head/create', '')}</article>`;
  return `<div class="th-style-page">${heading('Choisis ton style.', f.style ? 'Tes prochaines vidéos l’utilisent. Les vidéos déjà commencées gardent le leur.' : 'Regarde-les. Tu choisis une fois, et tu peux changer plus tard.')}<div class="th-style-grid">${[...ours, ...theirs, create].join('')}</div>${f.style ? `<div class="flow-footer">${link('Retour', '/formats/talking-head', 'ghost')}</div>` : ''}<p class="inline-alert" id="form-error" role="alert"></p></div>`;
}

export function talkingCreatePrompt(d) {
  const links = String(d.ownLinks || '').split(/\s+/).filter(l => /^https?:\/\//.test(l));
  const love = String(d.ownLove || '').trim();
  return ['/create-my-own', 'Crée mon propre style Talking Head à partir de ces vidéos :', links.length ? links.join('\n') : '(colle tes liens au-dessus)', love ? `Ce que j’aime chez elles : ${love}` : '', 'Étudie chaque vidéo image par image, dis-moi ce que tu as trouvé avant de construire, puis construis le style et teste-le sur un de mes enregistrements.'].filter(Boolean).join('\n\n');
}

export function talkingCreatePage(f, d, {esc, heading, button, link}) {
  return `<div class="center-flow th-create">${heading('Créer le mien.', 'Colle 3 à 10 liens d’un format que tu adores. 5 ou plus, c’est l’idéal.')}
    <label class="field"><span>Liens, un par ligne</span><textarea data-own="ownLinks" rows="6" placeholder="https://www.instagram.com/reel/...&#10;https://www.tiktok.com/@.../video/...&#10;https://youtube.com/shorts/...">${esc(d.ownLinks)}</textarea></label>
    <label class="field"><span>Qu’est-ce que tu aimes chez elles ? (facultatif)</span><input data-own="ownLove" placeholder="Les zooms sur chaque mot clé, les sous-titres jaunes" value="${esc(d.ownLove)}"></label>
    <pre class="prompt-box" id="prompt-text">${esc(talkingCreatePrompt(d))}</pre>${button('Copier le prompt', 'copy-prompt', 'primary', 'copy')}
    <p class="helper-note">Colle-le dans le chat ouvert dans ton dossier MotionLab. Ça prend du temps : chaque vidéo est étudiée en profondeur. Ton style apparaît ensuite dans Choisis ton style.</p>
    <div class="flow-footer">${link('Retour', '/formats/talking-head/style', 'ghost')}</div></div>`;
}

export async function writeTalkingStyle(style, {fetcher = fetch} = {}) {
  let response;
  try { response = await fetcher('/api/talking-head/style', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-MotionLab-Write': 'talking-style'}, body: JSON.stringify({style}), signal: AbortSignal.timeout(10000)}); }
  catch { throw Error('Ton choix n’a pas pu être enregistré. Réessaie.'); }
  const value = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(value.error || 'Ton choix n’a pas pu être enregistré. Réessaie.');
  return value;
}
