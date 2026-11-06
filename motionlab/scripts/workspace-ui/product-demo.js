import {productVoiceLabel} from './product-demo-voice.js';
// The page prepares the request. Only the agent's project files record work.
export const productDemoPhases = [
  ['understand', 'Comprendre le produit', 'Explorer l’app et le code fourni, du problème au résultat utile.'],
  ['conceive', 'Trouver l’histoire', 'Choisir le parcours qui rend sa valeur évidente.'],
  ['prove', 'Tester le moment clé', 'Essayer l’idée visuelle et le mouvement sur un court extrait.'],
  ['produce', 'Animer le film', 'Construire les scènes, les transitions et le son autour de cette histoire.'],
  ['refine', 'Relire et livrer', 'Vérifier la vidéo finie et joindre le projet modifiable.'],
];

// Finished films a buyer can point at. A pick tells the agent the feel they like, never a layout to copy.
export const productDemoFilms = [
  {id:'spoken-type',title:'Mots parlés',line:'Une voix calme, et chaque mot qu’elle dit arrive à l’écran pile au bon moment.'},
  {id:'object-world',title:'Monde d’objets',line:'De gros objets brillants se transforment les uns en les autres sur le rythme de la musique.'},
  {id:'narrated-launch',title:'Lancement raconté',line:'Une voix amicale te guide pendant que les écrans se construisent autour des mots.'},
  {id:'continuous-take',title:'Plan-séquence',line:'Un seul plan qui ne coupe jamais. Chaque temps devient la chose suivante.'},
  {id:'chapter-worlds',title:'Mondes en chapitres',line:'Raconté comme une courte histoire, chaque partie ouvre un nouveau lieu à regarder.'},
  {id:'camera-on-card',title:'Lecture de près',line:'Une carte, et une caméra qui la lit de près, comme le ferait ton œil.'},
  {id:'pixel-glitch',title:'Énergie glitch',line:'Des mots tapés bégayent sur fond noir, puis explosent en lumière et en couleur.'},
  {id:'interface-clicks',title:'Clic après clic',line:'Une visite nette de l’app, un clic et un petit tic satisfaisant à la fois.'},
];
const filmMedia = name => `/media/assets/product-demo/examples/${name}`;
export const productDemoLiked = draft => (draft.productFilms || []).filter(id => productDemoFilms.some(film => film.id === id));

export function productDemoBrief(draft = {}) {
  return Object.fromEntries([
    ['source', draft.productSource?.trim()],
    ['repository', draft.productRepository?.trim()],
    ['brief', draft.productBrief?.trim()],
    ['audience', draft.productAudience?.trim()],
    ['placement', draft.productPlacement?.trim()],
    ['recordings', draft.productRecordings?.split('\n').map(value => value.trim()).filter(Boolean)],
  ].filter(([, value]) => Array.isArray(value) ? value.length : value));
}

export function productDemoPrompt(draft) {
  const brief = productDemoBrief(draft);
  if (!brief.source && !brief.repository && !brief.brief && !brief.recordings?.length) throw Error('Ajoute une URL de produit, un dépôt ou d’autres détails sur le produit.');
  const sources = [brief.source, brief.repository && `Dépôt : ${brief.repository}`, ...(brief.recordings || [])].filter(Boolean);
  const liked = productDemoLiked(draft).map(id => productDemoFilms.find(film => film.id === id));
  const notes = [brief.brief, brief.audience && `Public : ${brief.audience}`, brief.placement && `Pour : ${brief.placement}`,
    liked.length && `Films que j’aime : ${liked.map(film => `${film.title} (${film.id})`).join(', ')}.${draft.productFilmNote?.trim() ? ' Ce que j’aime : ' + draft.productFilmNote.trim() : ''} Reprends leur ambiance, jamais leurs plans.`].filter(Boolean);
  return '/product-demo' + (sources.length ? ' ' + sources.map(value => JSON.stringify(value)).join(' ') : '') +
    '\nFais une démo produit ultra-animée et approfondie qui montre le problème qu’il résout, comment il fonctionne et pourquoi c’est important. Vérifie mon ordinateur et le code fourni, utilise mon choix de voix off enregistré, écris la voix off et les textes dans ma langue (le français par défaut), puis livre la vidéo relue avec sa source modifiable.' +
    (notes.length ? '\n\n' + notes.join('\n') : '');
}

function productDemoTrack(current) {
  return `<nav class="onboarding-track" aria-label="Étapes du nouveau film">${[['product','Ton produit'],['films','Films que tu aimes'],['process','Ce qui se passe'],['prompt','Ton prompt']].map(([id,label],i)=>`${i?'<span class="track-line" aria-hidden="true"></span>':''}<span ${current===id?'aria-current="step" class="current"':''}>${label}</span>`).join('')}</nav>`;
}

export function productDemoProcess() {
  return `<ol class="product-demo-process">${[
    ['computer','Vérifier ton ordinateur','Installer les outils nécessaires pour faire ton film.'],
    ...productDemoPhases,
  ].map(([,title,description],i)=>`<li><span class="product-demo-number" aria-hidden="true">${i+1}</span><div><h2>${title}</h2><p>${description}</p></div></li>`).join('')}</ol>`;
}

export function productDemoForm(draft, {esc, heading, field, button, link}, sub = 'new', format = {}) {
  const requested = sub === 'new/films' ? 'films' : sub === 'new/process' ? 'process' : sub === 'new/prompt' ? 'prompt' : 'product';
  let prompt;
  try { prompt = productDemoPrompt(draft); } catch {}
  const current = requested !== 'product' && !prompt ? 'product' : requested;
  let content;
  if (current === 'product') {
    const hasMore = draft.productRecordings || draft.productBrief || draft.productAudience || draft.productPlacement;
    content = `${heading('Montre-nous ton produit.','Une URL suffit pour commencer.')}
      <form id="product-demo-form">
        <label class="field"><span>URL du produit</span><input type="text" inputmode="url" autocomplete="url" data-field="productSource" value="${esc(draft.productSource)}" placeholder="https://ton-produit.com"></label>
        ${field('Dépôt GitHub ou dossier local (facultatif)','productRepository',draft.productRepository,'https://github.com/toi/produit')}
        <details class="product-demo-options" ${hasMore?'open':''}><summary>Ajouter des détails</summary>
          <label class="field"><span>Enregistrements ou maquettes</span><textarea data-field="productRecordings" placeholder="Chemins de fichiers ou de dossiers, un par ligne">${esc(draft.productRecordings)}</textarea></label>
          <label class="field"><span>Un point sur lequel insister ?</span><textarea data-field="productBrief" placeholder="Une fonctionnalité, un public, un lancement…">${esc(draft.productBrief)}</textarea></label>
          ${draft.productAudience?field('Public','productAudience',draft.productAudience):''}
          ${draft.productPlacement?field('Où il sera diffusé','productPlacement',draft.productPlacement):''}
        </details>
        <p class="inline-alert" id="form-error" role="alert"></p>
        <div class="flow-footer">${link('Retour','/formats/product-demo','ghost')}<button type="submit" class="btn primary">Continuer</button></div>
      </form>`;
  } else if (current === 'films') {
    const liked = productDemoLiked(draft);
    const cards = productDemoFilms.map(film => {
      const on = liked.includes(film.id);
      return `<article class="pd-film${on ? ' chosen' : ''}">
        <video src="${esc(filmMedia(film.id + '.mp4'))}" poster="${esc(filmMedia(film.id + '.jpg'))}" controls playsinline preload="none" aria-label="${esc(film.title)}"></video>
        <h2>${esc(film.title)}</h2><p>${esc(film.line)}</p>
        ${button(on ? 'Aimé' : 'J’aime', 'product-demo-film:' + film.id, '', on ? 'check' : '')}</article>`;
    }).join('');
    content = `${heading('Choisis un film qui te plaît.','Facultatif. On reprend son ambiance, jamais ses plans.')}<div class="pd-film-grid">${cards}</div>
      ${liked.length ? `<label class="field"><span>Qu’est-ce qui te plaît ? (facultatif)</span><input type="text" data-field="productFilmNote" value="${esc(draft.productFilmNote)}" placeholder="Le mouvement, la typo, la musique…" maxlength="300"></label>` : ''}
      <div class="flow-footer">${link('Retour','/formats/product-demo/new','ghost')}${link(liked.length ? 'Continuer' : 'Laisse-nous choisir','/formats/product-demo/new/process','primary','arrow')}</div>`;
  } else if (current === 'process') {
    const liked = productDemoLiked(draft).map(id => productDemoFilms.find(film => film.id === id).title);
    content = `${heading('On prend le relais.','Ton agent s’occupe de ces étapes dès que tu envoies le prompt.')}${productDemoProcess()}${format.answers?.voice?`<p class="product-demo-voice-summary">${esc(format.answers.voice.provider==='none'?'Pas de voix off.':`Voix off : ${productVoiceLabel(format.answers.voice)}${format.answers.voice.voice?' · '+format.answers.voice.voice:''}.`)}${liked.length?' '+esc('Inspiré de '+liked.join(', ')+'.'):''}</p>`:''}<div class="flow-footer">${link('Retour','/formats/product-demo/new/films','ghost')}${link('Obtenir mon prompt','/formats/product-demo/new/prompt','primary','arrow')}</div>`;
  } else {
    content = `${heading('Ton prompt.','Copie-le dans ton chat MotionLab.')}<pre class="prompt-box product-demo-prompt" id="prompt-text">${esc(prompt)}</pre><div class="flow-footer">${link('Retour','/formats/product-demo/new/process','ghost')}${button('Copier le prompt','copy-prompt','primary','copy')}</div>`;
  }
  return `<div class="center-flow product-demo-flow">${productDemoTrack(current)}${content}</div>`;
}

export function productDemoProject(project, {esc, heading, link, button}, tasks = []) {
  const phase = productDemoPhases.find(([id]) => id === project.data?.stage);
  const working = tasks.some(task => [project.id,project.path].includes(task.project) && task.status === 'running' && !task.stale);
  const video = project.completed && project.files?.find(file => project.outputPaths?.includes(file.path));
  const source = project.files?.find(file => file.path === project.outputPath + '/editable-project.zip');
  const note = project.data?.progressNote || phase?.[2] || 'Ton agent va lire le travail enregistré et continuer le film.';
  const current = project.completed ? 'Ton film est prêt.' : phase?.[1] || 'Continue ton film';
  const record = project.files?.find(file => file.path === project.path + '/record.md');
  return heading(project.name) + `<div class="product-demo-project">
    ${video?`<video class="product-demo-video" src="${esc(video.url)}" controls playsinline preload="metadata" aria-label="${esc(project.name)}"></video>`:''}
    <h2>${esc(current)}</h2>${project.completed?'':`<p class="muted">${esc(note)}</p>`}
    ${project.completed?'':`<ol class="product-demo-phases" aria-label="Étapes du film">${productDemoPhases.map(([id,label])=>`<li ${phase?.[0]===id?'aria-current="step"':''}>${esc(label)}</li>`).join('')}</ol>`}
    <div class="button-row">${video?`<a class="btn primary" href="${esc(video.url)}" download>Télécharger la vidéo</a>${source?`<a class="btn" href="${esc(source.url)}" download>Projet modifiable</a>`:''}`:working?'<p class="small" role="status">Ton agent travaille. L’avancement apparaît ici.</p>':button('Copier le prompt pour continuer','resume:'+project.id,'primary','copy')}
    ${record?link('Lire l’histoire','/files?file='+encodeURIComponent(record.path),'ghost'):''}</div>
    ${project.completed?`<div class="flow-footer">${link('Retour aux films','/formats/product-demo','ghost')}${button('Copier le prompt de révision','revision:'+project.id,'ghost','copy')}</div>`:''}
  </div>`;
}
