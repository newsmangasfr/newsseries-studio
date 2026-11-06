import {montageReferences} from './beat-reference-links.js';
import {agentPrompt,syncAgentPrompts} from './agent-prompts.js';
import {beatReferenceBadge} from './beat-craft.js';

// The runtime files own saved state. This map only holds unfinished form choices.
const drafts = new Map(), mounts = new WeakMap();
const BASE = '/formats/beat-montage';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {plus:'M12 5v14M5 12h14',arrow:'M5 12h14m-5-5 5 5-5 5',close:'m6 6 12 12M6 18 18 6',upload:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',play:'m8 5 11 7-11 7Z',check:'m5 12 4 4L19 6',music:'M9 18V5l11-2v13M9 8l11-2',montage:'M3 5h18v14H3zM8 5v14M16 5v14M3 9h5M16 15h5',copy:'M8 8h12v13H8zM16 8V3H3v13h5',heart:'M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1C-2 11 12 21 12 21S26 11 20 5Z'};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.montage}"/></svg>`;
const url = value => {const path=typeof value==='string'?value:value?.url||'';return /^(assets|workspace)\//.test(path)?'/media/'+path.split('/').map(encodeURIComponent).join('/'):path;};
const route = (id, page='setup') => `${BASE}/template/${encodeURIComponent(id)}/${page}`;
const button = (label, action, kind='', attrs='') => `<button type="button" class="bm-button ${kind ? 'bm-'+kind : ''}" data-bm-action="${esc(action)}" ${attrs}>${label}</button>`;
const anchor = (label, path, kind='') => `<a ${path.endsWith('/make')?'data-bm-start="true" ':''}class="bm-button ${kind ? 'bm-'+kind : ''}" data-route="${esc(path)}" href="${esc(path)}">${label}</a>`;
const heading = (title, line='', action='') => `<header class="bm-page-head"><div class="bm-heading-row"><h2 tabindex="-1">${esc(title)}</h2>${action}</div>${line ? `<p>${esc(line)}</p>` : ''}</header>`;
const fileButton = (label,kind,accept,multiple=false,attrs='') => `<label class="bm-file-button ${kind==='clip'&&!attrs.includes('webkitdirectory')?'bm-primary':''}">${kind==='clip'&&!attrs.includes('webkitdirectory')?icon('plus'):''}${esc(label)}<input type="file" data-bm-file="${kind}" accept="${accept}" ${multiple?'multiple':''} ${attrs}></label>`;
function draft(key) {
  if (!drafts.has(key)) drafts.set(key,{example:null,showAll:false,quantity:5,filter:'all',selected:[],selectedInputs:[],autoClips:true,links:[''],name:'',note:'',removed:null,openFiles:false,error:'',request:null,busy:false});
  return drafts.get(key);
}
function parts(sub='') {
  sub = String(sub).replace(/^\/formats\/beat-montage\/?/,'').replace(/^\//,'');
  const p=sub.split('/');
  if (p[0]==='inputs') return {id:'square',page:'inputs'};
  if (p[0]==='new') return {id:'square',page:'make'};
  if (p[0]==='setup') return {id:'square',page:'setup'};
  if (p[0]==='template') {let id;try{id=decodeURIComponent(p[1]||'');}catch{id='';}return {id,page:p[2]||'setup',detail:p[3]||''};}
  return {id:null,page:p[0]||'home'};
}
function allTemplates(f) {return Array.isArray(f?.beat?.templates)?f.beat.templates:[];}
function examples(t) {return Array.isArray(t?.examples)?t.examples:[];}
function clips(t) {return t?.inputs?.clips || t?.inputs?.files || [];}
function readyClips(t) {return clips(t).filter(c=>c.prepared===true || c.ready===true || c.status==='ready');}
function selectedId(t) {return t?.selectedExampleId ?? t?.setup?.exampleId ?? t?.selectedEdit ?? null;}
function example(t,d) {const list=examples(t);return list.find(e=>e.id===d.example)||list.find(e=>e.id===(t.displayExampleId||selectedId(t)))||list.find(e=>e.id===(t.defaultExampleId||t.featured))||list[0];}
function eligible(t) {return examples(t).filter(e=>e.audioAvailable!==false && e.audio?.available!==false && e.cutPlanReusable!==false && e.defaultEligible!==false);}
function ready(t) {return t?.generation?.ready===true;}
function generationClips(t,song=null) {const ids=song?[song]:t.generation?.planIds||[];return [...new Map(ids.flatMap(id=>(t.inputStates?.[id]?.clips||[]).filter(c=>c.prepared).map(c=>[c.path,c]))).values()];}
function count(t) {return t?.inputs?.total ?? clips(t).length;}
function outputList(t) {return (t.outputs || t.variations || []).filter(o=>url(o.url||o.src||o.video) && o.path);}
function media(e,id='bm-lead') {
  const src=url(e?.demoSrc||e?.demo||e?.src),poster=url(e?.demoPoster||e?.poster);
  return src ? `<div class="bm-reel"><video id="${id}" src="${esc(src)}" ${poster?`poster="${esc(poster)}"`:''} controls playsinline preload="none" aria-label="${esc(e.title||e.name||'Aperçu des coupes numérotées')}"></video></div>` : '<div class="bm-empty"><p>L’aperçu numéroté apparaîtra après l’étude.</p></div>';
}
function cuts(e,id='bm-lead') {
  if (!e?.fps || !e?.frames || !Array.isArray(e.cuts)) return '';
  const frames=[0,...e.cuts,e.frames];
  return `<div class="bm-timeline"><div class="bm-timeline-head"><strong>${frames.length-1} emplacements de clips · ${(e.frames/e.fps).toFixed(1).replace('.',',')} s</strong><span data-bm-cut-info>Touche un numéro pour voir son timing</span></div><div class="bm-cut-strip" data-bm-target="${id}">${frames.slice(0,-1).map((n,i)=>`<button type="button" class="bm-cut-slot" data-bm-action="seek" data-player="${id}" data-start="${n/e.fps}" data-end="${frames[i+1]/e.fps}" aria-pressed="false" aria-label="Clip ${i+1}, ${((frames[i+1]-n)/e.fps).toFixed(2).replace('.',',')} secondes">${i+1}<small>${((frames[i+1]-n)/e.fps).toFixed(2).replace('.',',')} s</small></button>`).join('')}</div></div>`;
}
function handoff(title,prompt,action='copy',description='',attrs='') {
  return `<section class="bm-prompt-block" data-bm-handoff><h2>${esc(title)}</h2>${description?`<p>${esc(description)}</p>`:''}<pre data-bm-prompt>${esc(prompt||'')}</pre><div class="bm-actions">${button(icon('copy')+' Copier le prompt',action,'primary',attrs)}</div><p class="bm-small">Colle-le dans ton chat MotionLab.</p></section>`;
}
function platformList() {return `<div class="bm-platform-list">${[['Instagram','https://www.instagram.com/reel/example/'],['TikTok','https://www.tiktok.com/@example/video/123'],['YouTube Shorts','https://www.youtube.com/shorts/abcdefghijk']].map(([name,link])=>`<span>${beatReferenceBadge(link)} ${name}</span>`).join('')}</div>`;}
function home(f) {
  const list=allTemplates(f),own=list.filter(t=>!['square','above'].includes(t.id)),ours=list.filter(t=>['square','above'].includes(t.id));
  const row=t=>{
    const e=example(t,{}),available=ready(t),n=count(t),target=available?'make':'setup';
    return `<a class="bm-template-row" href="${route(t.id,target)}" data-route="${route(t.id,target)}" data-bm-template-row="${esc(t.id)}" ${available?'data-bm-start="true"':''}><div class="bm-row-preview">${url(e?.demoPoster||e?.poster)?`<img src="${esc(url(e.demoPoster||e.poster))}" alt="${esc(t.name)}, aperçu des coupes numérotées" loading="lazy">`:icon('montage')}</div><div class="bm-row-copy"><h2>${esc(t.name)}</h2><p>${esc(t.line||t.description||'Tes rushes, dans un format que tu peux réutiliser.')}</p><span class="bm-row-facts">${available?`${t.generation?.readyCount ?? generationClips(t).length} rushes prêts`:n?`${n} clips ajoutés`:examples(t).length?`${examples(t).length} ${t.id==='square'?'musiques avec leurs coupes':'façons de le faire'}`:'Étude des références en attente'} · 3 à 5 variantes</span></div><span class="bm-row-status ${available?'bm-ready':''}">${available?'Générer maintenant':n?'Préparer les rushes':'Réglage'}</span><span class="bm-row-arrow">${icon('arrow')}</span></a>`;
  };
  return `<div class="bm-home"><p class="bm-home-line">Tes clips. Un format que tu adores. 3 à 5 versions au choix.</p><div class="bm-montage-list"><a class="bm-template-row bm-craft-row" href="${BASE}/craft" data-route="${BASE}/craft"><div class="bm-craft-symbol">${icon('plus')}</div><div class="bm-row-copy"><h2>Crée le tien</h2><p>Apporte 3 à 5 exemples du même format. Fais-en le tien.</p>${platformList()}</div><span class="bm-row-status">Créer un format</span><span class="bm-row-arrow">${icon('arrow')}</span></a>${own.length?`<section class="bm-montage-group"><h2>Tes montages</h2>${own.map(row).join('')}</section>`:''}<section class="bm-montage-group"><h2>Nos modèles</h2>${ours.map(row).join('')}</section></div></div>`;
}
function gallery(t,d) {
  const all=examples(t),shown=t.id==='square'||d.showAll?all:all.filter(e=>e.id!==example(t,d)?.id).slice(0,5);
  return `<div class="bm-section-intro"><h2>${t.id==='square'?'Musiques et coupes':'Musiques et variantes'}</h2><span class="bm-small">${new Set(all.map(e=>e.audioId||e.audio?.recordingId).filter(Boolean)).size} musiques · ${all.length} schémas de coupes</span></div><p class="bm-gallery-intro">Écoute une musique et vois ses coupes. On peut choisir la musique pour toi à la génération.</p><div class="bm-media-row ${t.id==='square'?'bm-all-cuts':''}">${shown.map(e=>`<article class="bm-mini-montage"><button type="button" data-bm-action="example" data-id="${esc(e.id)}" aria-label="Lire ${esc(e.soundTitle||e.title)}" aria-pressed="${e.id===example(t,d)?.id}"><img src="${esc(url(e.demoPoster||e.poster))}" alt="${esc(e.variant||t.name)}, aperçu numéroté" loading="lazy"><h3>${esc(e.soundTitle||e.title)}</h3></button><p>${(e.cuts||[]).length+1} clips · ${e.frames&&e.fps?(e.frames/e.fps).toFixed(1).replace('.',',')+' s':''}</p></article>`).join('')}</div>${t.id!=='square'&&all.length>6?button(d.showAll?'Voir moins':'+ Voir toutes les variantes','all-examples','ghost'):''}`;
}
function activeProjects(t){
 const projects=(t.projects||[]).filter(p=>!p.completed);
 return projects.length?`<section class="bm-progress"><h2>En cours</h2>${projects.map(p=>`<a class="bm-project-row" href="${route(t.id,'project/'+encodeURIComponent(p.id))}" data-route="${route(t.id,'project/'+encodeURIComponent(p.id))}"><span><strong>${esc(p.name)}</strong><small>${esc(p.label)}</small></span>${icon('arrow')}</a>`).join('')}</section>`:'';
}
function projectPage(t,id){
 let key;try{key=decodeURIComponent(id);}catch{key=id;}const p=(t.projects||[]).find(p=>p.id===key);
 if(!p)return heading('Cette vidéo n’est pas disponible.')+anchor('Retour au montage',route(t.id));
 return `<div class="bm-narrow">${heading(p.name,p.label,anchor('Retour',route(t.id),'ghost'))}${p.preview?media({src:p.preview,poster:p.cover,title:p.name},'bm-project-video'):'<div class="bm-empty"><p>L’aperçu actuel apparaît une fois ce rendu vérifié.</p></div>'}${p.completed?p.outputs.map(delivery).join(''):handoff('Continuer dans le chat',p.prompt)}</div>`;
}
function delivery(o){
 const link=(label,file)=>file?.url?`<a class="bm-button bm-ghost" href="${esc(file.url)}" download>${label}</a>`:'';
 return `<div class="bm-delivery">${o.caption?.text?`<details><summary>Légende</summary><p class="bm-caption">${esc(o.caption.text)}</p>${button('Copier la légende','copy-caption','ghost',`data-value="${esc(o.caption.text)}"`)}</details>`:''}${o.sound?.text?`<details><summary>Consignes son</summary><p>${esc(o.sound.text)}</p></details>`:''}<div class="bm-actions">${link('Vidéo',o)}${link('Couverture',o.cover)}${link('Légende',o.caption)}${link('Consignes son',o.sound)}</div></div>`;
}
function templateDocuments(t){
 const path=t.preferencesPath,href='/files?file='+encodeURIComponent(path)+'&format=beat-montage&template='+encodeURIComponent(t.id);
 return `<div class="bm-narrow">${heading('Documents','Tes préférences enregistrées pour ce montage.')}<a class="bm-project-row" href="${esc(href)}" data-route="${esc(href)}"><span><strong>Préférences de ${esc(t.name)}</strong><small>Lis et modifie le vrai fichier.</small></span>${icon('arrow')}</a></div>`;
}
function overview(t,d,f) {
  if(!examples(t).length){const references={...f,beat:{...f.beat,references:(f.beat?.references||[]).filter(g=>g.templateId===t.id),unassignedReferences:[]}};return `<div class="bm-narrow">${heading('Apprendre ton montage','Tes références vont devenir un format avec ses propres clips, musiques et coupes.')}${referenceStudies(references)}</div>`;}
  const e=example(t,d),n=count(t),isReady=ready(t);
  const needsSong=!examples(t).some(e=>e.eligible);
  const songAsk=needsSong?`<div class="bm-notice"><div><strong>Ce montage a besoin d’un enregistrement de la musique.</strong><p>On peut préparer un enregistrement correspondant dans le chat. Tu peux déjà ajouter tes clips.</p></div>${anchor('Préparer une musique',route(t.id,'song/'+encodeURIComponent(e.id)),'primary')}</div>`:'';
  const next=`${songAsk}<div class="bm-next-step"><h2>${isReady?'Ton prochain montage':n?'Prépare tes rushes':'Tes clips deviennent ça'}</h2><p>${isReady?'Cinq variantes pour aujourd’hui, avec de nouveaux clips et de nouvelles accroches.':n?'Tes clips sont ajoutés. Préparons-les pour ce montage.':t.description||t.line}</p><p class="bm-small">${isReady?'On choisit des musiques adaptées dans ce format. Tu peux aussi en choisir une.':'Ajoute tes originaux. On te montre quoi filmer et on prépare chaque clip.'}</p><div class="bm-actions">${isReady?anchor('Générer maintenant '+icon('arrow'),route(t.id,'make'),'primary')+button('Créer un exemple','start-one'):anchor((n?'Préparer les rushes':'Ajouter tes rushes')+' '+icon('plus'),route(t.id,'inputs'),'primary')}</div>${isReady?`<div class="bm-step-links">${anchor('Rushes',route(t.id,'inputs'),'ghost')}${anchor('Choisir une musique',route(t.id,'songs'),'ghost')}</div>`:'<p class="bm-step-note">Ensuite, demande un exemple ou cinq variantes pour aujourd’hui.</p>'}${outputList(t).length?anchor('Voir tes variantes ('+outputList(t).length+')',route(t.id,'variations'),'ghost'):''}</div>`;
  return `<div class="bm-overview">${activeProjects(t)}<section class="bm-setup-preview">${next}<div class="bm-showcase">${media(e)}<div class="bm-preview-meta"><strong>${esc(e?.soundTitle||e?.title||t.name)}</strong><span>Chaque numéro est un de tes clips</span>${e?.audioAvailable===false?'<span>Audio indisponible</span>':''}</div></div></section>${e?`<details class="bm-timing-details"><summary>Voir chaque coupe</summary>${cuts(e)}</details>`:''}${examples(t).length?isReady?`<details class="bm-ready-gallery"><summary>Explorer musiques et coupes</summary><section class="bm-section">${gallery(t,d)}</section></details>`:`<section class="bm-section">${gallery(t,d)}</section>`:''}</div>`;
}
function inputGuide(t,d) {const e=example(t,d);return t.variantGuides?.[e?.guideId||e?.id]||t.guides?.[e?.guideId||e?.id]||t.inputGuides?.[e?.id]||t.guide||t.inputGuide||null;}
function normalizeGuide(g) {
  if (!g) return null;
  const look=g.lookGuidance||g.lookGuide||{};
  return {...g,contextLine:g.contextLine||g.theme,groups:(g.groups||g.families||[]).map((x,i)=>({...x,id:x.id||'group-'+i,ideas:x.ideas||x.examples||x.clips||[],countLabel:x.countLabel||(typeof x.count==='object'?`${x.count.min} à ${x.count.max} clips`:`Environ ${x.count||6} clips`)})),look:{title:look.title||look.heading,lead:look.lead||look.instruction,tip:look.tip,examples:(look.examples||[]).map(e=>({...e,title:e.title||e.label,description:e.description||e.notice}))},shootTips:Array.isArray(g.shootTips)?g.shootTips:Object.values(g.shootTips||{}),preparationChecks:g.preparationChecks||g.cropChecks||[]};
}
function analysisPrompt(t,d) {const g=inputGuide(t,d),e=example(t,d);if(t.analysisPrompt&&e?.id&&t.displayExampleId&&e.id!==t.displayExampleId)return `Analyse les clips que j’ai ajoutés pour le montage "${t.id}" avec la version "${e.id}". Suis son guide de clips, prépare les recadrages et vérifie-les en mouvement.`;return t.analysisPrompt||t.inputs?.analysisPrompt||g?.handoff?.analysisPrompt||g?.analysisPrompt||`Analyse les clips que j’ai ajoutés pour ${t.name} et prépare-les, avec son guide de clips et ses vérifications de recadrage.`;}
function clipPreview(c) {
  const source=url(c.preview||c.file||c.url||c.src),poster=url(c.poster||c.cover);
  return source?`<video src="${esc(source)}" ${poster?`poster="${esc(poster)}"`:''} controls muted playsinline preload="none" aria-label="${esc(c.name)}"></video>`:poster?`<img src="${esc(poster)}" alt="${esc(c.name)}" loading="lazy">`:`<span class="bm-clip-icon">${icon('montage')}</span>`;
}
function inputs(t,d,f) {
  const g=normalizeGuide(inputGuide(t,d)),list=clips(t),pending=list.filter(c=>!c.prepared&&!c.ready&&c.status!=='ready'&&!c.excluded),prepared=readyClips(t).length;
  const available=(t.availableClips||t.inputs?.availableClips||f.beat?.availableInputs||f.beat?.availableClips||f.availableClips||[]).filter(c=>!list.some(x=>x.path===c.path));
  const reuse=available.length?`<details class="bm-reuse"><summary>Choisir des clips d’un autre montage ou format</summary><p class="bm-small">Seuls les clips choisis seront ajoutés.</p><div class="bm-reuse-list">${available.map(c=>`<label><input type="checkbox" data-bm-reuse="${esc(c.path)}"><span>${esc(c.name)}<small>${esc(c.templateName||c.formatName||c.format||'Clip original')}</small></span></label>`).join('')}</div><div class="bm-actions">${button('Ajouter les clips choisis','reuse')}</div></details>`:'';
  const files=list.length?`<details class="bm-added-clips" data-bm-files ${d.openFiles?'open':''}><summary>Ajoutés à ${esc(t.name)} (${list.length})</summary><div class="bm-clip-grid">${list.map(c=>`<article class="bm-clip-card"><div class="bm-clip-picture">${clipPreview(c)}<button type="button" class="bm-remove" data-bm-action="remove-input" data-path="${esc(c.path)}" aria-label="Retirer ${esc(c.name)}">${icon('close')}</button></div><div class="bm-clip-name">${esc(c.name)}</div><small>${c.prepared||c.ready||c.status==='ready'?'Prêt · Recadrage vérifié':c.excluded?'Écarté'+(c.reason?' · '+esc(c.reason):''):'À analyser'}</small></article>`).join('')}</div></details>`:'';
  const undo=d.removed?`<div class="bm-input-status" role="status"><p>Clip retiré de ce montage.</p>${button('Annuler','restore-input','ghost')}</div>`:'';
  const status=list.length?`<div class="bm-input-status"><p>${prepared} clips prêts sur ${list.length}. Au moins ${t.inputs?.originalFileMinimum||10} requis.${pending.length?` ${pending.length} ${pending.length===1?'reste':'restent'} à analyser.`:''}</p>${pending.length?button('Aller au prompt '+icon('arrow'),'jump-analysis','ghost'):ready(t)?anchor('Générer maintenant',route(t.id,'make')):''}</div>`:'';
  const look=g?.look?.title?`<section class="bm-filming-look"><h2>${esc(g.look.title)}</h2><p>${esc(g.look.lead)}</p><div class="bm-filming-look-examples">${g.look.examples.map(e=>`<figure><img src="${esc(url(e.src))}" alt="${esc(e.description||e.title)}" loading="lazy"><figcaption>${esc(e.title)}</figcaption></figure>`).join('')}</div>${g.look.tip?`<p>${esc(g.look.tip)}</p>`:''}<p class="bm-small">${t.id==='square'?'Filme tes originaux sans filtre. On travaille les ombres et le contraste, puis on vérifie les mots blancs centrés.':'Envoie les clips originaux. On prépare le recadrage en gardant bien lisibles les personnes, l’action et le décor.'}</p></section>`:'';
  const shots=g?`<section class="bm-personal-guide"><h2>${esc('10 à 20 clips originaux')}</h2><p class="bm-guide-theme">${esc(g.contextLine)}</p><p class="bm-guide-intro">Utilise ce que tu as déjà, ou filme-en quelques-uns de chaque groupe.</p>${g.keyAsk?`<p class="bm-guide-purpose">${esc(g.keyAsk)} Au moins 10 originaux vérifiés. On garde les exigences propres à ce montage sur les moments utilisables.</p>`:''}${g.groups.map(group=>`<section class="bm-specific-shot-row"><div><h3>${esc(group.title)}</h3><span>${esc(group.countLabel)}</span></div><p>${esc(group.ideas.join(' '))}</p></section>`).join('')}<div class="bm-shoot-tips">${g.shootTips.map(tip=>`<p>${esc(tip)}</p>`).join('')}</div></section>`:'<section><h2>Ton guide de clips est en préparation.</h2><p>L’étude des références nous dira quoi filmer pour ce montage.</p></section>';
  const edit=examples(t).length>1&&t.id!=='square'?`<label class="bm-field bm-edit-choice">Préparer les clips pour<select data-bm-field="input-edit">${examples(t).map(e=>`<option value="${esc(e.id)}" ${e.id===example(t,d)?.id?'selected':''}>${esc(e.variant||e.title)} · ${esc(e.soundTitle||'')}</option>`).join('')}</select></label>`:'';
  return `<div class="bm-input-flow">${heading('Ajouter des rushes',t.id==='square'?'Transformons ton travail et ta journée en montages motivants.':`Transformons tes clips en montages ${t.name}.`)}<div class="bm-input-stack"><section class="bm-input-upload"><div class="bm-drop-zone" data-bm-drop="clip">${icon('upload')}<h2>Ajoute tes clips</h2><p>Ajoute 10 à 20 originaux, ou choisis un dossier.</p><div class="bm-actions">${fileButton('Choisir des clips','clip','video/*',true)}${fileButton('Choisir un dossier','clip','video/*',true,'webkitdirectory')}</div></div>${reuse}${files}${undo}${status}${edit}</section>${look}${shots}${g?.preparationChecks?.length?`<details class="bm-preparation"><summary>Ce qu’on vérifie pour ce montage</summary><ul>${g.preparationChecks.map(x=>`<li>${esc(typeof x==='string'?x:x.label||x.description)}</li>`).join('')}</ul><p class="bm-small">Un clip est prêt quand son recadrage a été vérifié en mouvement.</p></details>`:''}${handoff('Prépare tes clips',analysisPrompt(t,d),'analyze',g?.preparationSummary||g?.handoff?.preparationLine||'On choisit les moments, on prépare chaque recadrage et on vérifie que l’histoire reste claire.')}</div></div>`;
}
function songGroups(t) {
  const groups=new Map();
  for (const e of examples(t).filter(e=>e.audioAvailable!==false)) {const id=e.audioId||e.audio?.recordingId||e.id;if(!groups.has(id))groups.set(id,{id,title:e.soundTitle||e.title,plans:[]});groups.get(id).plans.push(e);}
  return [...groups.values()];
}
function songs(t) {
  const custom=(t.songs||[]).filter(s=>s.uploaded||s.kind==='uploaded'||!songGroups(t).some(g=>g.id===s.id));
  return `${heading('Musiques et coupes',`Musiques et montages pour ${t.name}.`,anchor(icon('plus')+' Ajouter une musique',route(t.id,'song-new'),'primary'))}<div class="bm-song-list">${custom.map(s=>`<article class="bm-song-row"><div class="bm-disc">${icon('music')}</div><div class="bm-song-info"><h3>${esc(s.title||s.name)}</h3><p>${esc(s.status==='ready'?'Montage sur le rythme prêt':'En attente d’analyse')}</p></div>${anchor(s.status==='ready'?'Voir les coupes':'Copier le prompt d’analyse',route(t.id,'song/'+encodeURIComponent(s.id)))}</article>`).join('')}${songGroups(t).map(s=>`<article class="bm-song-row"><a class="bm-disc" data-route="${route(t.id,'song/'+encodeURIComponent(s.plans[0].id))}" href="${route(t.id,'song/'+encodeURIComponent(s.plans[0].id))}" aria-label="Écouter ${esc(s.title)}">${icon('play')}</a><div class="bm-song-info"><h3>${esc(s.title)}</h3><p>${s.plans.length>1?`${s.plans.length} montages différents sur le même son`:`${(s.plans[0].cuts||[]).length+1} clips · ${(s.plans[0].frames/s.plans[0].fps).toFixed(1).replace('.',',')} s`}</p></div>${anchor('Écouter les coupes',route(t.id,'song/'+encodeURIComponent(s.plans[0].id)))}</article>`).join('')}</div><p class="bm-small bm-section">Ajoute une musique ici pour créer un autre montage pour ${esc(t.name)}.</p>`;
}
function songPrompt(t,s) {return s?.analysisPrompt||s?.prompt||`/new-format\nAnalyse "${s?.name||s?.title||'ma musique envoyée'}" comme nouvelle musique pour ${t.name}. Réutilise un son correspondant si on l’a déjà. Montre-moi les coupes.`;}
function songUpload(t,s,d) {
  return `<div class="bm-narrow">${heading(s?'Ta musique':'Ajouter une musique',`Crée un nouveau montage sur le rythme pour ${t.name}.`)}${s?`<div class="bm-wave-panel"><h3>${esc(s.filename||s.title||s.name)}</h3>${url(s.file||s.url||s.audio)?`<audio src="${esc(url(s.file||s.url||s.audio))}" controls preload="none"></audio>`:''}<p class="bm-small">${esc(s.status==='ready'?'Montage sur le rythme prêt':'Enregistrée. Prête à être étudiée.')}</p></div><label class="bm-field">Nomme cette musique<input type="text" maxlength="80" data-bm-field="song-name" data-song-id="${esc(s.id)}" value="${esc(d.songName??s.title??s.name)}"></label>${button('Enregistrer le nom','rename-song','',`data-id="${esc(s.id)}"`)}<p class="bm-small bm-section">On vérifie si tu as déjà ce son, puis on trouve un passage et on montre ses coupes numérotées.</p>${handoff('Trouver son rythme',songPrompt(t,{...s,name:d.songName??s.title??s.name}),'song-prompt','',`data-id="${esc(s.id)}"`)}`:`<label class="bm-field">Nomme ta musique <span class="bm-small">Facultatif</span><input type="text" maxlength="80" data-bm-field="new-song-name" value="${esc(d.newSongName||'')}" placeholder="Ma musique"></label><div class="bm-drop-zone" data-bm-drop="song">${icon('music')}<h2>Ajoute ta musique</h2><p>Choisis un MP3, un WAV ou un autre fichier audio.</p><div class="bm-actions">${fileButton('Choisir une musique','song','audio/*')}</div></div><p class="bm-small bm-section">Ta musique est enregistrée dans ce modèle. Copie ensuite son prompt pour trouver les temps forts.</p>`}</div>`;
}
function songDetail(t,d,id) {
  let key;try{key=decodeURIComponent(id);}catch{key=id;}
  const e=examples(t).find(x=>x.id===key),s=(t.songs||[]).find(x=>x.id===key);
  if (!e) return s?songUpload(t,s,d):heading('Cette musique n’est pas disponible.')+anchor('Toutes les musiques',route(t.id,'songs'));
  const siblings=songGroups(t).find(s=>s.id===(e.audioId||e.audio?.recordingId))?.plans||[];
  return `${heading(e.soundTitle||e.title,`${t.name} · Chaque numéro est la place d’un de tes clips.`)}${siblings.length>1?`<div class="bm-notice"><div><strong>Un son, ${siblings.length} montages.</strong><p>Choisis le timing qui te plaît.</p></div><div class="bm-actions">${siblings.map(s=>anchor(esc(s.variant||s.title),route(t.id,'song/'+encodeURIComponent(s.id)))).join('')}</div></div>`:''}<div class="bm-song-showcase">${media(e,'bm-song-player')}${cuts(e,'bm-song-player')}</div><div class="bm-actions">${e.audioAvailable===false||e.cutPlanReusable===false?button('Préparer ce montage','prepare-edit','primary',`data-id="${esc(e.id)}"`):button('Créer un exemple avec cette musique','use-song','primary',`data-id="${esc(e.id)}"`)}${anchor('Toutes les musiques',route(t.id,'songs'))}</div>${d.editPrompt&&d.editPromptId===e.id&&(e.audioAvailable===false||e.cutPlanReusable===false)?handoff('Préparer ce montage',d.editPrompt):''}`;
}
function makePrompt(t,d) {return `/quick-cuts\nGénère ${d.quantity===1?'un exemple '+t.name:d.quantity+' variantes '+t.name}${d.selected.length?' comme les versions que j’ai choisies':' avec mes clips prêts'}. ${d.song?`Utilise ${examples(t).find(e=>e.id===d.song)?.soundTitle||'la musique que j’ai choisie'}.`:'Choisis des musiques adaptées dans ce format.'} Varie les clips et les accroches, et vérifie chaque recadrage.`;}
function make(t,d) {
  const choices=generationClips(t,d.song),isReady=ready(t)&&(!d.song||t.generation.planIds.includes(d.song)),request=d.request;
  return `<div class="bm-narrow">${heading(d.selected.length?'En faire d’autres comme ça':'Faire un montage','Tes rushes sont enregistrés. On choisit les clips et on écrit les accroches.')}<div class="bm-make-summary"><h2>${esc(t.name)}</h2><p>${t.generation?.readyCount??choices.length} rushes prêts · ${d.song?esc(examples(t).find(e=>e.id===d.song)?.soundTitle||'Musique choisie'):'Musiques choisies pour toi'}</p><div class="bm-actions">${anchor('Rushes',route(t.id,'inputs'),'ghost')}${anchor('Parcourir les musiques',route(t.id,'songs'),'ghost')}</div></div><fieldset class="bm-quantity"><legend>Qu’est-ce que tu veux ?</legend><div class="bm-actions">${[1,5,10].map(n=>button(n===1?'Un exemple':n+' variantes','quantity','',`data-value="${n}" aria-pressed="${d.quantity===n}"`)).join('')}</div></fieldset><label class="bm-field">Musique<select data-bm-field="generation-song"><option value="">Choisis les musiques pour moi</option>${eligible(t).map(e=>`<option value="${esc(e.id)}" ${d.song===e.id?'selected':''}>${esc(e.soundTitle||e.title)}${songGroups(t).find(g=>g.id===(e.audioId||e.audio?.recordingId))?.plans.length>1?' · '+esc(e.variant||e.title):''}</option>`).join('')}</select></label><label class="bm-check"><input type="checkbox" data-bm-field="auto-clips" ${d.autoClips?'checked':''}>Choisis les clips pour moi</label>${!d.autoClips?`<div class="bm-reuse-list">${choices.map(c=>`<label><input type="checkbox" data-bm-selected-input="${esc(c.path)}" ${d.selectedInputs.includes(c.path)?'checked':''}><span>${esc(c.name)}</span></label>`).join('')}</div>`:''}${!isReady?`<div class="bm-notice"><div><strong>${count(t)?'Prépare d’abord tes rushes.':'Ajoute d’abord tes rushes.'}</strong><p>Il faut des clips vérifiés pour ce montage.</p></div>${anchor('Rushes',route(t.id,'inputs'))}</div>`:''}${request?`<p class="bm-small bm-section" role="status">Demande enregistrée. Colle son prompt pour démarrer.</p>`:''}${handoff('Copie ta demande',request?.prompt||makePrompt(t,d),'generate','',!isReady?'disabled':'')}</div>`;
}
function variations(t,d) {
  const outputs=outputList(t),list=outputs.filter(o=>d.filter!=='liked'||o.favorite);
  return `${activeProjects(t)}${heading('Tes variantes',`${t.name} · Garde tes favorites. Essaie-en d’autres quand tu veux.`,anchor('Générer maintenant',route(t.id,'make'),'primary'))}<div class="bm-segmented">${button('Toutes '+outputs.length,'filter','',`data-value="all" aria-pressed="${d.filter==='all'}"`)}${button('Favorites '+outputs.filter(o=>o.favorite).length,'filter','',`data-value="liked" aria-pressed="${d.filter==='liked'}"`)}</div>${list.length?`<div class="bm-variation-grid">${list.map((o,i)=>`<article class="bm-variation-card ${d.selected.includes(o.id||o.path)?'bm-selected':''}"><button type="button" class="bm-select-variation" data-bm-action="select-output" data-id="${esc(o.id||o.path)}" aria-pressed="${d.selected.includes(o.id||o.path)}" aria-label="Sélectionner ${esc(o.name||'la variante '+(i+1))}">${d.selected.includes(o.id||o.path)?icon('check'):''}</button>${media({src:o.url||o.src||o.video,poster:o.poster||o.cover,title:o.name},'bm-output-'+i)}<h3>${esc(o.name||'Variante '+(i+1))}</h3>${button(icon('heart')+(o.favorite?'Dans tes favorites':'Garder celle-ci'),'favorite','ghost',`data-id="${esc(o.id||o.path)}" data-value="${!o.favorite}" aria-pressed="${Boolean(o.favorite)}"`)}${delivery(o)}</article>`).join('')}</div>`:`<div class="bm-empty"><h2>${d.filter==='liked'?'Pas encore de favorites.':'Tes variantes apparaîtront ici.'}</h2><p>${d.filter==='liked'?'Garde une version qui te plaît pour la retrouver ici.':'Copie une demande de montage, puis reviens quand ton agent a fait les vidéos.'}</p></div>`}${d.selected.length?`<div class="bm-selection-bar"><strong>${d.selected.length} sélectionnée${d.selected.length>1?'s':''}</strong>${button('En générer 10 de plus comme ça '+icon('arrow'),'more-selected','primary')}</div>`:''}${outputs.length?`<div class="bm-actions">${button('Générer 10 variantes de plus','more')}${anchor('Essayer un autre montage',BASE,'ghost')}</div>`:''}`;
}
function referencePrompt(d) {return `/new-format\nApprends ce format à partir ${d.links.filter(s=>s.trim()).length>1?'de ces exemples':'de cet exemple'}${d.name?` sous le nom "${d.name}"`:''}. Regroupe les exemples qui se ressemblent dans un seul format. Apprends ses coupes et ses sous-titres, réutilise les sons correspondants et crée son guide de clips.\n${d.links.filter(s=>s.trim()).join('\n')||'Ajoute un lien vidéo au-dessus.'}${d.note?'\nÀ garder : '+d.note:''}`;}
function referenceStudies(f) {
  const groups=[...(f.beat?.references||[])];
  if(f.beat?.unassignedReferences?.length)groups.push({id:'unassigned',name:'Références précédentes',items:f.beat.unassignedReferences});
  if(!groups.length)return '';
  return `<section class="bm-section"><h2>Tes études</h2>${groups.map(group=>`<section class="bm-study-group"><div class="bm-heading-row"><h3>${esc(group.name||'Ton montage')}</h3>${group.templateId?anchor('Réglage',route(group.templateId)):''}</div>${(group.items||[]).map((r,i)=>{
    const failed=['unavailable','failed','download-failed'].includes(r.status)||(r.status==='error'&&!r.source),uploaded=Boolean(r.source),complete=r.studyStatus==='complete'||r.status==='ready';
    return `<article class="bm-reference-result"><div class="bm-heading-row"><h3>${beatReferenceBadge(r.url||'')} Vidéo ${i+1}</h3><span class="${failed?'bm-error-text':'bm-small'}">${failed?'Échec du téléchargement':complete?'Étude prête':uploaded?'Vidéo ajoutée':'En attente de ton agent'}</span></div><p class="bm-small"><a href="${esc(r.url)}" target="_blank" rel="noopener">Ouvrir la référence ↗</a></p>${failed?`<div class="bm-notice"><div><strong>On n’a pas pu télécharger cette vidéo.</strong><p>${esc(r.message||'Envoie-la avec sa musique pour continuer.')}</p></div></div>${fileButton('Envoyer la vidéo','reference','video/*',false,`data-reference="${esc(r.id)}"`)}`:''}</article>`;
  }).join('')}${group.prompt?handoff(group.status==='complete'?'Utiliser cette étude':'Continuer l’étude',group.prompt):''}</section>`).join('')}</section>`;
}

function craft(f,d) {
  return `<div class="bm-narrow"><p class="bm-craft-intro">Apporte un montage que tu adores. Enregistre un format que tu pourras réutiliser.</p><h2>Quelles vidéos tu aimes ?</h2><p>On conseille 3 à 5 exemples du même format. Cadrage, sous-titres et rythme similaires ; les musiques peuvent changer.</p>${platformList()}<p class="bm-small">Un lien par vidéo. Tu peux commencer avec un seul.</p><div class="bm-reference-inputs">${d.links.map((r,i)=>`<div class="bm-reference-row"><span class="bm-platform">${beatReferenceBadge(r)}</span><input type="text" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" data-bm-reference="${i}" value="${esc(r)}" placeholder="Colle un lien vidéo" aria-label="Lien vidéo ${i+1}">${button(icon('close'),'remove-reference','ghost',`data-index="${i}" aria-label="Retirer le lien ${i+1}"`)}</div>`).join('')}</div>${button(icon('plus')+' Ajouter un autre lien','add-reference','ghost',d.links.length>=30?'disabled':'')}<details><summary>Donne-lui un nom ou ajoute une note</summary><label class="bm-field">Nomme ton montage<input type="text" data-bm-field="craft-name" value="${esc(d.name)}" maxlength="80" placeholder="Mes coulisses"></label><label class="bm-field">Quelque chose à garder ? <span class="bm-small">Facultatif</span><textarea data-bm-field="craft-note" placeholder="L’ouverture lente et l’accroche courte.">${esc(d.note)}</textarea></label></details>${d.batchSaved?`<p class="bm-small bm-section" role="status">Ton lot de références est enregistré.</p>${button('Commencer un autre format','new-batch','ghost')}`:''}<div class="bm-explanation"><h3>Chaque montage a son propre réglage.</h3><p>L’étude détermine ses clips, ses recadrages, son style de sous-titres, ses musiques et ses coupes.</p></div>${referenceStudies(f)}${handoff('Apprendre ce format',d.request?.prompt||referencePrompt(d),'save-references')}</div>`;
}

export function resetBeatLibraryDraft(workspaceId,templateId) {
  const d=draft((workspaceId||'workspace')+':'+templateId);
  d.quantity=5;d.song=null;d.selected=[];d.selectedInputs=[];d.autoClips=true;d.request=null;
}

export function beatLibraryChrome(f,sub='') {
  const p=parts(sub),t=allTemplates(f).find(t=>t.id===p.id);
  if (!t) return {title:p.page==='craft'?'Crée le tien':'Beat Montage',back:p.page==='craft'?BASE:'/',tabs:[]};
  return {title:t.name,back:BASE,tabs:[['setup','Réglage'],['inputs','Rushes'],['songs','Musiques et coupes'],['variations','Variantes'],['documents','Documents']].map(([page,label])=>({label,path:route(t.id,page),current:page===p.page||page==='variations'&&p.page==='project'||page==='songs'&&p.page.startsWith('song')||page==='setup'&&p.page==='overview'})),action:ready(t)&&p.page!=='make'?{label:'Générer maintenant',path:route(t.id,'make')}:null};
}
export function renderBeatLibrary(f,snapshot,sub='',ui={}) {
  const p=parts(sub),key=(snapshot?.workspaceId||'workspace')+':'+(p.id||'craft'),d=draft(key),found=allTemplates(f).find(t=>t.id===p.id),t=found?{...found,inputs:found.inputStates?.[example(found,d)?.id]||found.inputs}:null;
  let body;
  if(t&&p.page==='song'){const pending=(f.beat?.requests||[]).filter(r=>r.templateId===t.id&&r.type==='edit-study'&&r.exampleId===p.detail&&r.status==='pending').at(-1);if(pending?.prompt){d.editPrompt=pending.prompt;d.editPromptId=p.detail;}}
  if(p.id&&!t) body=heading('Ce montage n’est pas disponible.')+anchor('Tous les montages',BASE);
  else if(!p.id) body=p.page==='craft'?craft(f,d):home(f);
  else body=p.page==='documents'?templateDocuments(t):p.page==='project'?projectPage(t,p.detail):p.page==='inputs'?inputs(t,d,f):p.page==='songs'?songs(t):p.page==='song-new'?songUpload(t,null,d):p.page==='song'?songDetail(t,d,p.detail):p.page==='make'?make(t,d):p.page==='variations'?variations(t,d):overview(t,d,f);
  if(t&&p.page==='variations'){const pending=(f.beat?.requests||[]).filter(r=>r.templateId===t.id&&r.type==='generation'&&r.status==='pending').at(-1);if(pending?.prompt)body+=handoff('Continuer ton montage',pending.prompt);}
  const html=`<div class="bm-library" aria-busy="${d.busy}" data-bm-key="${esc(key)}" data-bm-template="${esc(p.id||'')}" data-bm-example="${esc(t?example(t,d)?.id:'')}" data-bm-page="${esc(p.page)}" data-bm-sub="${esc(sub)}"><div class="bm-operation" role="status" ${d.busy?'':'hidden'}>Enregistrement de tes fichiers…</div><p class="bm-error-text" data-bm-error role="alert" ${d.error?'':'hidden'}>${esc(d.error)}</p>${body}</div>`;
  if (ui.href) return html.replace(/href="(\/formats\/beat-montage[^\"]*)"/g,(_,value)=>`href="${esc(ui.href(value.replaceAll('&amp;','&')))}"`);
  return html;
}

export function bindBeatLibrary(root,helpers={}) {
  syncAgentPrompts(root);
  mounts.get(root)?.abort();
  const controller=new AbortController(),signal=controller.signal;mounts.set(root,controller);
  const page=root.matches?.('.bm-library')?root:root.querySelector('.bm-library');if(!page)return {destroy:()=>controller.abort()};
  const d=draft(page.dataset.bmKey),templateId=page.dataset.bmTemplate,fetcher=helpers.fetcher||globalThis.fetch.bind(globalThis);
  const navigate=path=>helpers.navigate?helpers.navigate(path):location.assign(path);
  const rerender=()=>{if(helpers.render)helpers.render();else helpers.refresh?.();};
  const notify=message=>{if(helpers.toast)helpers.toast(message);else{const el=page.querySelector('.bm-operation');if(el){el.hidden=false;el.textContent=message;}}};
  const error=message=>{d.error=message;const current=root.querySelector('[data-bm-key="'+CSS.escape(page.dataset.bmKey)+'"]')||page;const el=current.querySelector('[data-bm-error]');if(el){el.hidden=!message;el.textContent=message;}};
  async function copy(value,{literal=false}={}) {
    if(!literal)value=agentPrompt(value);
    if(helpers.copy){await helpers.copy(value,literal?'Légende copiée.':undefined,{literal});return;}
    try{await navigator.clipboard.writeText(value);}catch{const area=document.createElement('textarea');area.value=value;document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();if(!ok)throw Error('Sélectionne le prompt pour le copier.');}
    notify('Copié. Colle-le dans ton chat MotionLab.');
  }
  async function write(payload) {
    const response=await fetcher(helpers.endpoint||'/api/beat-library',{method:'POST',headers:{'Content-Type':'application/json','X-MotionLab-Write':'inputs'},body:JSON.stringify({templateId:templateId||undefined,...payload})});
    const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||data.message||'Impossible d’enregistrer. Réessaie.');return data;
  }
  async function refresh() {await helpers.refresh?.();if(helpers.render)helpers.render();}
  async function upload(files,kind,referenceId) {
    const source=[...files].filter(file=>kind==='clip'?file.type.startsWith('video/')||/\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(file.name):true);
    if(!source.length)throw Error('Choisis un fichier vidéo original.');
    let last;
    for(let i=0;i<source.length;i++) {
      const file=source[i],params=new URLSearchParams({template:templateId,kind,name:file.webkitRelativePath||file.name});if(kind==='song'&&d.newSongName)params.set('title',d.newSongName);if(referenceId)params.set('reference',referenceId);
      const endpoint=kind==='reference'?(helpers.referenceUploadEndpoint||helpers.uploadEndpoint||'/api/beat-library/upload'):(helpers.uploadEndpoint||'/api/beat-library/upload');
      notify(`Enregistrement ${i+1} sur ${source.length} : ${file.name}`);
      const response=await fetcher(endpoint+'?'+params,{method:'PUT',headers:{'X-MotionLab-Write':'inputs','X-MotionLab-Filename':encodeURIComponent(file.name),'Content-Type':file.type||'application/octet-stream'},body:file});
      last=await response.json().catch(()=>({}));if(!response.ok){await refresh();throw Error((i?`${i} ${kind==='clip'?'clips':'fichiers'} enregistré${i>1?'s':''}. `:'')+(last.error||last.message||'Impossible d’enregistrer ce fichier. Réessaie.'));}
    }
    d.openFiles=true;await refresh();
    if(kind==='song'){const id=last?.song?.id||last?.songId||last?.id;if(id)navigate(route(templateId,'song/'+encodeURIComponent(id)));notify('Musique enregistrée. Copie son prompt pour trouver les temps forts.');}
    else notify(kind==='reference'?'Vidéo ajoutée. Copie le prompt pour continuer son étude.':`${source.length} clip${source.length>1?'s':''} ajouté${source.length>1?'s':''}. Copie le prompt pour les analyser.`);
  }
  const run=async fn=>{if(d.busy){notify('Enregistrement de ta dernière modification…');return;}d.busy=true;error('');page.setAttribute('aria-busy','true');try{await fn();}catch(e){error(e.message||'Un problème est survenu. Réessaie.');}finally{d.busy=false;page.removeAttribute('aria-busy');const current=root.querySelector('[data-bm-key="'+CSS.escape(page.dataset.bmKey)+'"]');current?.removeAttribute('aria-busy');const status=current?.querySelector('.bm-operation');if(status)status.hidden=true;}};
  page.addEventListener('click',event=>{
    const start=event.target.closest('[data-bm-start]');if(start){const target=parts(start.dataset.route||start.getAttribute('href'));resetBeatLibraryDraft(page.dataset.bmKey.split(':')[0],target.id);}
    const b=event.target.closest('[data-bm-action]');if(!b||b.disabled)return;
    event.preventDefault();event.stopPropagation();
    void run(async()=>{
      const action=b.dataset.bmAction,id=b.dataset.id;
      if(action==='copy-caption'){await copy(b.dataset.value,{literal:true});return;}
      if(action==='copy'){await copy(b.closest('[data-bm-handoff]').querySelector('[data-bm-prompt]').textContent);return;}
      if(action==='seek'){const video=page.querySelector('#'+b.dataset.player);if(video){video.currentTime=Number(b.dataset.start);await video.play();}return;}
      if(action==='example'){d.example=id;rerender();return;}
      if(action==='all-examples'){d.showAll=!d.showAll;rerender();return;}
      if(action==='jump-analysis'){page.querySelector('[data-bm-handoff]')?.scrollIntoView({block:'center',behavior:'smooth'});return;}
      if(action==='start-one'){resetBeatLibraryDraft(page.dataset.bmKey.split(':')[0],templateId);d.quantity=1;navigate(route(templateId,'make'));return;}
      if(action==='remove-input'){await write({action,path:b.dataset.path});d.removed=b.dataset.path;await refresh();return;}
      if(action==='restore-input'){await write({action,path:d.removed});d.removed=null;await refresh();return;}
      if(action==='reuse'){const paths=[...page.querySelectorAll('[data-bm-reuse]:checked')].map(e=>e.dataset.bmReuse);if(!paths.length)throw Error('Choisis les clips à ajouter.');await write({action:'reuse-inputs',paths});d.openFiles=true;await refresh();notify('Clips ajoutés. Copie le prompt pour les préparer pour ce montage.');return;}
      if(action==='analyze'){const result=await write({action:'request-analysis',exampleId:page.dataset.bmExample||undefined});const prompt=result.prompt||result.request?.prompt||b.closest('[data-bm-handoff]').querySelector('[data-bm-prompt]').textContent;await copy(prompt);await refresh();return;}
      if(action==='rename-song'||action==='song-prompt'){const result=await write({action:'rename-song',songId:id,name:page.querySelector('[data-bm-field="song-name"]')?.value||d.songName});if(action==='song-prompt')await copy(result.prompt||result.song?.prompt||b.closest('[data-bm-handoff]').querySelector('[data-bm-prompt]').textContent);d.songName=undefined;await refresh();if(action==='rename-song')notify('Nom de la musique enregistré.');return;}
      if(action==='use-song'){await write({action:'select-edit',exampleId:id});resetBeatLibraryDraft(page.dataset.bmKey.split(':')[0],templateId);d.song=id;d.example=id;d.quantity=1;d.request=null;await refresh();navigate(route(templateId,'make'));return;}
      if(action==='prepare-edit'){if(d.editPrompt&&d.editPromptId===id){await copy(d.editPrompt);return;}const result=await write({action:'request-edit',exampleId:id});d.editPrompt=result.prompt||result.request?.prompt;d.editPromptId=id;await refresh();await copy(d.editPrompt);return;}
      if(action==='quantity'){d.quantity=Number(b.dataset.value);d.request=null;rerender();return;}
      if(action==='generate'){if(d.request?.prompt){await copy(d.request.prompt);return;}if(!d.autoClips&&!d.selectedInputs.length)throw Error('Choisis un clip, ou laisse-nous choisir les clips pour toi.');const result=await write({action:'request-generation',quantity:d.quantity,exampleId:d.song||null,selectedOutputIds:d.selected,selectedInputPaths:d.autoClips?undefined:d.selectedInputs,more:d.quantity===10&&d.selected.length>0});d.request=result.request||result;await copy(result.prompt||result.request?.prompt);await refresh();return;}
      if(action==='favorite'){await write({action,outputId:id,value:b.dataset.value==='true'});await refresh();return;}
      if(action==='select-output'){d.selected=d.selected.includes(id)?d.selected.filter(x=>x!==id):[...d.selected,id];rerender();return;}
      if(action==='filter'){d.filter=b.dataset.value;rerender();return;}
      if(action==='more'||action==='more-selected'){d.quantity=10;d.song=null;d.selectedInputs=[];d.autoClips=true;d.request=null;if(action==='more')d.selected=[];navigate(route(templateId,'make'));return;}
      if(action==='add-reference'){d.links.push('');d.request=null;rerender();return;}
      if(action==='remove-reference'){d.links.splice(Number(b.dataset.index),1);if(!d.links.length)d.links=[''];d.request=null;rerender();return;}
      if(action==='new-batch'){d.links=[''];d.name='';d.note='';d.request=null;d.batchSaved=false;rerender();return;}
      if(action==='save-references'){if(d.request?.prompt){await copy(d.request.prompt);return;}const links=montageReferences(d.links.map(s=>s.trim()).filter(Boolean)).map(r=>r.url);const result=await write({action,links,name:d.name,note:d.note,templateId:d.batchSaved||undefined});d.batchSaved=result.templateId;d.request=result.request||result;await copy(result.prompt||result.request?.prompt);await refresh();return;}
    });
  },{signal});
  page.addEventListener('input',event=>{
    const e=event.target,field=e.dataset.bmField;
    if(e.dataset.bmReference!==undefined){d.links[Number(e.dataset.bmReference)]=e.value;d.request=null;e.closest('.bm-reference-row').querySelector('.bm-platform').innerHTML=beatReferenceBadge(e.value);}
    if(field==='craft-name'){d.name=e.value;d.request=null;}
    if(field==='craft-note'){d.note=e.value;d.request=null;}
    if(field==='new-song-name')d.newSongName=e.value;
    if(field==='song-name'){d.songName=e.value;const prompt=page.querySelector('[data-bm-prompt]');if(prompt)prompt.textContent=prompt.textContent.replace(/(Analy[sz]e) "[^"]*"/,(_,word)=>`${word} "${e.value}"`);}
    if(page.dataset.bmPage==='craft'){const prompt=page.querySelector(':scope > .bm-narrow > [data-bm-handoff] [data-bm-prompt]');if(prompt)prompt.textContent=referencePrompt(d);}
  },{signal});
  page.addEventListener('change',event=>{
    const e=event.target,field=e.dataset.bmField;
    if(e.dataset.bmFile){void run(()=>upload(e.files,e.dataset.bmFile,e.dataset.reference));return;}
    if(field==='input-edit'){void run(async()=>{await write({action:'select-edit',exampleId:e.value});d.example=e.value;await refresh();});return;}
    if(field==='generation-song'){d.song=e.value;d.selectedInputs=[];d.autoClips=true;d.request=null;rerender();return;}
    if(field==='auto-clips'){d.autoClips=e.checked;d.request=null;rerender();return;}
    if(e.dataset.bmSelectedInput){d.selectedInputs=e.checked?[...new Set([...d.selectedInputs,e.dataset.bmSelectedInput])]:d.selectedInputs.filter(p=>p!==e.dataset.bmSelectedInput);d.request=null;}
  },{signal});
  page.addEventListener('toggle',event=>{if(event.target.matches('[data-bm-files]'))d.openFiles=event.target.open;},{signal,capture:true});
  page.addEventListener('paste',event=>{if(event.target.dataset.bmReference===undefined)return;const links=event.clipboardData.getData('text').trim().split(/\s+/);if(links.length<2)return;event.preventDefault();d.links.splice(Number(event.target.dataset.bmReference),1,...links);d.links=[...new Set(d.links)].slice(0,30);d.request=null;rerender();},{signal});
  for(const type of ['dragover','dragleave','drop'])page.addEventListener(type,event=>{const zone=event.target.closest('[data-bm-drop]');if(!zone)return;event.preventDefault();zone.classList.toggle('bm-dragging',type==='dragover');if(type==='drop')void run(()=>upload(event.dataTransfer.files,zone.dataset.bmDrop));},{signal});
  page.querySelectorAll('video,audio').forEach(video=>{
    video.addEventListener('play',()=>page.querySelectorAll('video,audio').forEach(other=>{if(other!==video)other.pause();}),{signal});
    video.addEventListener('timeupdate',()=>{const strip=page.querySelector(`[data-bm-target="${video.id}"]`);strip?.querySelectorAll('.bm-cut-slot').forEach((slot,i)=>{const on=video.currentTime>=Number(slot.dataset.start)&&video.currentTime<Number(slot.dataset.end);slot.setAttribute('aria-pressed',String(on));if(on)strip.parentElement.querySelector('[data-bm-cut-info]').textContent=`Clip ${i+1} · ${(Number(slot.dataset.end)-Number(slot.dataset.start)).toFixed(2).replace('.',',')} s`;});},{signal});
  });
  return {destroy:()=>controller.abort()};
}
