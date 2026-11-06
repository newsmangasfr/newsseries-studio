import {productDemoPrompt,productDemoForm,productDemoProject,productDemoPhases} from './product-demo.js';
import {agentPrompt,agentPicker,registerPromptSkills,syncAgentPrompts,watchAgentPrompts} from './agent-prompts.js';
import {productVoiceReady,productVoicePage,productVoiceDraft,productVoicePrompt,writeProductVoiceKey} from './product-demo-voice.js';
import {talkingVideoInstructions,talkingResumePrompt,splitVideoInstructions} from './talking-prompts.js';
import {talkingStylePage,talkingStyleName,talkingStyleSkill,talkingCreatePage,talkingCreatePrompt,writeTalkingStyle} from './talking-style.js';
import {onboardingView,onboardingRoute,mountOnboarding,writeOnboarding,setupPrompt} from './onboarding.js';
import {accountScreen, activityScreen} from './account-activity.js';
import {videoLibrary} from './video-library.js';
import {accountLabel,accountAvatar} from './account-identity.js';
import {WorkspaceClient} from './client.js';
import {reconcileLookDraft} from './look-draft.js';
import {talkingCaptionsPage,talkingCaptionsPrompt} from './talking-captions.js';
import {documentShelf, updateDocumentCards, filterDocuments} from './documents.js';
import {mountDocumentAnimations} from './document-motion.js';
import {beatCraftPage,beatReferenceRows,beatReferenceBadge,beatCraftPrompt} from './beat-craft.js';
import {montageReference} from './beat-reference-links.js';
import {beatOverview,beatInputsPage,beatNewPage,bindBeatPlayers,beatPreparationPrompt} from './beat-montage.js';
import {renderBeatLibrary,bindBeatLibrary,beatLibraryChrome,resetBeatLibraryDraft} from './beat-library.js';
import {listSetupDone,listDraft,listReelPage,mountListReel} from './list-reel.js';
import {oneShotPage,oneShotDraft,mountOneShot} from './one-shot.js';
import {fullVisualOverview,fullVisualNew,fullVisualProject,fullVisualResearchPrompt,fullVisualTranscriptPrompt} from './full-visual.js';
let oneShotController=null, onboardingController=null, onboardingMigration=false;

// Routes describe views. Only the files returned by the runtime describe completion.
document.documentElement.dataset.theme = 'light';
const $ = (q, root=document) => root.querySelector(q);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
 home:'<path d="m3 10 9-7 9 7v10H14v-7h-4v7H3Z"/>',
 talk:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M9 7h6M8 15h8M10 18h4"/><circle cx="12" cy="11" r="1"/>',
 montage:'<path d="M3 5h18v14H3zM8 5v14M16 5v14M3 9h5M16 15h5"/>',
 list:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M10 18h4"/>',
 trial:'<path d="M8 3v5l-5 10a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3L16 8V3M6 3h12M6 15h12"/>',
 folder:'<path d="M3 6V4h7l2 3h9v13H3Z"/>', file:'<path d="M13 2H5v20h14V8ZM13 2v6h6M8 13h8M8 17h5"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 back:'<path d="m14 6-6 6 6 6"/>',
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>', plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<path d="m5 12 4 4L19 6"/>', upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
 copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 chart:'<path d="M3 3v18h18M7 16V9M12 16V5M17 16v-5"/>',
 agent:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>',
 visual:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M10.5 11v5l4-2.5Z"/>',
 edit:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.file}</svg>`;
const labels = {edit:['edit','Ta propre vidéo, montée à la main.'],'full-visual':['visual','N’importe quel sujet, expliqué mot par mot.'],'product-demo':['montage','Ton produit. Une histoire qu’on comprend.'], 'talking-head':['talk','Ta voix. Une histoire plus percutante.'], 'beat-montage':['montage','Chaque clip, sur le beat.'], 'scroll-reel':['list','De bonnes trouvailles. Une vidéo.'],phone:['phone','Un seul plan. Une idée à garder.'],'trial-reels':['trial','Plus de ce qui marche pour toi.']};
const base = f => `/formats/${f.id}`;
const preview = Boolean(window.MOTIONLAB_PREVIEW);
const href = path => preview && location.protocol === 'file:' ? `?page=${encodeURIComponent(path)}` : path;
const link = (text, path, kind='', ico='') => `<a class="btn ${kind}" href="${esc(href(path))}" data-route="${esc(path)}" ${path.endsWith('/new')?'data-fresh="true"':''}>${ico ? icon(ico) : ''}${esc(text)}</a>`;
const button = (text, action, kind='', ico='') => `<button class="btn ${kind}" data-action="${esc(action)}">${ico ? icon(ico) : ''}${esc(text)}</button>`;
const heading = (title, subtitle='', actions='') => `<div class="page-heading"><div><h1>${esc(title)}</h1>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>${actions}</div>`;
// The video editor lives at /edit/<project>, a page of its own served by the workspace, so its links are plain links
// the router lets through. It is a desktop tool: on a phone the same place says so instead of opening it.
const editHref = id => '/edit/'+encodeURIComponent(id);
const canEdit = p => !preview && Boolean(p) && (p.format==='edit' || p.outputPaths?.length>0 || Boolean(p.preview));
const editLink = (id, text='Modifier', kind='') => `<span class="edit-entry"><a class="btn ${kind}" href="${esc(editHref(id))}" data-editor="${esc(id)}">${icon('edit')}${esc(text)}</a><span class="edit-phone tiny">Modifie sur un ordinateur</span></span>`;
const editExportNote = p => p?.edit?.exportRequest ? `<div class="edit-export-note" data-edit-export="${esc(p.id)}">${icon('clock')}<div><strong>Export demandé</strong><span class="tiny">Colle ceci dans le chat pour faire le rendu de ton montage.</span></div>${button('Copier le prompt','edit-export:'+p.id,'small-btn','copy')}</div>` : '';
const editBar = p => canEdit(p) ? `<div class="edit-bar">${editExportNote(p)}${editLink(p.id,'Modifier la vidéo','primary')}</div>` : editExportNote(p);
const empty = (title, text) => `<div class="empty-state"><h2>${esc(title)}</h2><p>${esc(text)}</p></div>`;
const field = (label, key, value='', placeholder='') => `<label class="field"><span>${esc(label)}</span><input type="text" data-field="${esc(key)}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`;
const select = (label,key,values,value) => `<label class="field"><span>${esc(label)}</span><select data-field="${esc(key)}">${values.map(v => {const [id,name] = Array.isArray(v) ? v : [v,v];return `<option value="${esc(id)}" ${id===value?'selected':''}>${esc(name)}</option>`;}).join('')}</select></label>`;
const count = d => `<label class="field"><span>Combien ?</span><input class="count-field" type="number" min="1" max="30" data-field="quantity" value="${esc(d.quantity || 1)}"></label>`;
let creatingEdit=false, snapshot, drafts={}, view, look, listController, documentMotion, lastStatus='connecting', pendingRoute, saveTimer, toastTimer;
const blobs = new Map();
const documents = new Map(), documentRequests = new Map(), documentEpochs = new Map();
const dataPath = () => preview && location.protocol==='file:' ? new URLSearchParams(location.search).get('page') || window.MOTIONLAB_PREVIEW.startPath || '/' : location.pathname;
const route = () => dataPath().split('?')[0].replace(/\/$/,'') || '/';
const format = id => snapshot.formats.find(f => f.id===id);
const setupDone = f => f?.id==='scroll-reel' ? listSetupDone(f) : f?.id==='talking-head' ? true : Boolean(f?.setup?.done && (!f.setup.requiredVersion || f.setup.version >= f.setup.requiredVersion));
const waiting = f => f.id==='trial-reels' && !snapshot.account.done;
const savedLook = a => ({card:a.dress||'plate',font:a.wordFont||'poppins',fonts:a.wordFonts||[a.wordFont||'poppins'],customFonts:a.customFonts||[],...(a.googleFont?{googleFont:a.googleFont}:{}),...(a.cardStyle?{cardStyle:a.cardStyle}:{}),opening:a.onscreen||'sentence-big',captionMode:a.captionMode||(['sentence-captions','visuals'].includes(a.onscreen)?'normal':'emphasized'),accent:(a.accent||'#E07850').toUpperCase()});
const finished = p => p.completed===true;
function formatAction(f,kind='small-btn'){
 if(f.id==='full-visual')return link('Nouvelle vidéo',base(f)+'/new',kind,'plus');
 if(f.id==='product-demo')return link(productVoiceReady(f)?'Nouveau film':'Configurer Product Demo',base(f)+(productVoiceReady(f)?'/new':'/setup'),kind,productVoiceReady(f)?'plus':'arrow');
 if(f.id==='phone')return f.oneShot?.inputs?.total?link('Nouvelle vidéo',base(f)+'/new',kind,'plus'):link('Ajouter tes fichiers',base(f)+'/inputs',kind,'upload');
 if(f.id==='scroll-reel'&&!f.listReel?.inputs?.total)return link('Ajouter tes fichiers',base(f)+'/inputs',kind,'upload');
 if(f.id==='scroll-reel')return link(listSetupDone(f)?'Nouvelle List Reel':'Configurer List Reel',base(f)+(listSetupDone(f)?'/new':'/setup'),kind,listSetupDone(f)?'plus':'arrow');
 if(f.id==='beat-montage')return link('Ouvrir les montages',base(f),kind,'arrow');
 if(f.id==='trial-reels')return route().startsWith(base(f)) ? '' : link('Voir les formats',base(f),kind,'arrow');
 if(waiting(f))return link('Voir l’avancement','/setup',kind);
 if(!setupDone(f))return link('Configurer',base(f)+'/setup',kind+' primary','arrow');
 if(f.id==='phone'&&f.materialKnown&&!f.materialReady&&inputFiles(f).length)return link('Vérifier tes plans',base(f)+'/material/prompt',kind,'arrow');
 if(f.materialKnown&&!f.materialReady)return link('Ajouter des rushes',base(f)+'/new/footage',kind,'plus');
 if(f.id==='trial-reels'&&['originals','material'].includes(f.stage?.id))return link('Ajouter les originaux',base(f)+'/new/footage',kind,'plus');
 return link('Nouvelle vidéo '+f.name,base(f)+'/new',kind,'plus');
}

const fvDraft = id => (drafts['fv:'+id] ||= {own:false,text:''});
const draft = id => {
 if (!drafts[id]) {
  const f=format(id), a=f?.answers || {};
  drafts[id]={files:[],quantity:1,transcript:'',transcribe:false,topic:'',subject:'',...a,look:savedLook(a),lookBase:savedLook(a)};
 }
 const d=drafts[id];if(id==='talking-head'&&!d.lookVersion){if(!format(id)?.answers?.wordFont&&!d.setupDraft)d.look=savedLook(format(id)?.answers||{});d.lookVersion=10;}
 return d;
};
function persist() { if(!snapshot)return; try {localStorage.setItem(`motionlab-workspace:${snapshot.workspaceId}`,JSON.stringify(drafts));}catch{} }
function restore() {try {drafts=JSON.parse(localStorage.getItem(`motionlab-workspace:${snapshot.workspaceId}`)||'{}');for(const [key,d] of Object.entries(drafts)){if(key.startsWith('pref:'))d.saving=false;if(d.list){d.list.saving=false;d.list.reusing=false;}}}catch{drafts={};} }
function toast(text) {$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2500);}
function navigate(path, replace=false) {
 if (!path.startsWith('/') || path.startsWith('//')) return;
 persist();look?.destroy();look=null;listController?.destroy();listController=null;oneShotController?.destroy();oneShotController=null;
 if (!replace) history.replaceState({...history.state,scroll:window.scrollY},'',location.href);
 history[replace?'replaceState':'pushState']({scroll:0},'',href(path));
 render();window.scrollTo(0,0);$('#stage')?.focus({preventScroll:true});
 if(activeDocumentPath())readDocument(activeDocumentPath(),{force:true});
 client.refresh();
}
function navItem(text, path, ico) {return `<a class="nav-item ${route()===path || path!=='/'&&route().startsWith(path+'/')?'active':''}" href="${esc(href(path))}" data-route="${esc(path)}">${icon(ico)}${esc(text)}</a>`;}
function shell() {
 $('#app').innerHTML=`<div class="os-shell"><aside class="os-sidebar"><a class="os-wordmark" href="${href('/')}" data-route="/"><span class="kf-mark"></span>MotionLab</a><a class="workspace-name" href="${href('/account')}" data-route="/account">${accountAvatar(snapshot.account.profile||{},esc,'mini-avatar')}<span>${esc(accountLabel(snapshot.account.profile))}</span></a><nav class="os-nav" aria-label="Espace de travail">${navItem('Accueil','/','home')}${preview?'':navItem('Nouvelle vidéo','/new','plus').replace('nav-item ','nav-item desktop-nav-link ')}${navItem('Vidéos','/videos','montage')}${navItem('Documents','/files','file')}${navItem('Compte','/account','chart').replace('nav-item ','nav-item mobile-nav-link ')}${navItem('Activité','/activity','clock').replace('nav-item ','nav-item mobile-nav-link ')}</nav><div class="nav-label">Tes formats</div><nav class="os-nav formats-nav" aria-label="Formats">${snapshot.formats.map(f=>navItem(f.name,base(f),labels[f.id]?.[0])).join('')}</nav><div class="nav-bottom">${navItem('Compte','/account','chart')}${navItem('Activité','/activity','clock')}<div class="local-status">${icon('folder')}Enregistré sur ton ordinateur</div></div></aside><div class="os-main"><header class="os-topbar"><div class="crumb" id="crumb">Accueil</div><div class="top-right">${agentPicker({global:true})}<div class="top-metrics" id="metrics"></div><a href="${href('/activity')}" data-route="/activity" id="activity-count" class="small"></a><span class="status-note" id="connection" role="status"></span></div></header><div id="format-bar" class="format-bar" hidden></div><main class="os-content" id="stage" tabindex="-1"></main></div></div>`;
 if(preview && window.MOTIONLAB_PREVIEW.notice && !$('.preview-notice')){const note=window.MOTIONLAB_PREVIEW.notice;$('#motionlab-os').insertAdjacentHTML('beforeend',`<div class="preview-notice trial-preview-notice"><span>${esc(note.text)}</span><a href="${esc(note.href)}">${esc(note.link)} ${icon('arrow')}</a></div>`);}
 if(preview && !$('.preview-notice')) $('#motionlab-os').insertAdjacentHTML('beforeend',`<div class="preview-notice"><span>Aperçu du design · Fichiers d’exemple</span><select aria-label="Scénario d’aperçu" id="preview-scenario"><option value="returning">Client habituel</option><option value="first">Première visite</option><option value="importing">Import du compte</option><option value="trial-analysis">Analyse Trial Reels</option><option value="talking">Talking Head seul</option></select></div>`);
 chrome();
}
function chrome() {
 if(!snapshot)return;
 const identity=$('.workspace-name'),profile=snapshot.account.profile?.handle?snapshot.account.profile:{...snapshot.account.profile,handle:snapshot.onboarding?.handle,platform:snapshot.onboarding?.platform};
 const identityHTML=accountAvatar(profile,esc,'mini-avatar')+`<span>${esc(accountLabel(profile))}</span>`;
 if(identity&&identity.innerHTML!==identityHTML)identity.innerHTML=identityHTML;
 const accountEnabled=snapshot.account.enabled!==false;
 if(identity)identity.style.display=accountEnabled?'':'none';
 document.querySelectorAll('.nav-item[data-route="/account"]').forEach(el=>el.style.display=accountEnabled?'':'none');
 document.querySelectorAll('.nav-item[data-route="/new"]').forEach(el=>el.style.display=snapshot.formats.length?'':'none');
 $('#metrics').style.display=accountEnabled?'':'none';
 const nav=$('.formats-nav'),ids=snapshot.formats.map(f=>f.id).join(',');
 if(nav.dataset.formats!==ids){nav.innerHTML=snapshot.formats.map(f=>navItem(f.name,base(f),labels[f.id]?.[0])).join('');nav.dataset.formats=ids;}
 $('#metrics').innerHTML=[['posts',snapshot.metrics?.posts],['views',snapshot.metrics?.views ?? snapshot.metrics?.plays]].filter(([,v])=>v!=null).map(([k,v])=>`<span><b>${esc(Number(v).toLocaleString('fr-FR',{notation:'compact',maximumFractionDigits:1}))}</b>${{posts:'posts',views:'vues'}[k]||k}</span>`).join('');
 const period=snapshot.metrics?.period;
 $('#metrics').title=period?.from ? `Posts du ${date(period.from)} au ${date(period.to)}` : 'Posts disponibles';
 const tasks=(snapshot.tasks||[]).filter(t=>t.status==='running'&&!t.stale);
 $('#activity-count').innerHTML=tasks.length ? `${tasks.length} en cours` : '';
 const sourceIssue=lastStatus==='connected'&&snapshot.sourceIssues?.length;
 $('#connection').dataset.state=sourceIssue?'reconnecting':lastStatus;
 $('#connection').innerHTML=`<i></i>${sourceIssue?'Un fichier est à vérifier':{connecting:'Connexion…',connected:preview?'Aperçu':'À jour',reconnecting:'Reconnexion…',unavailable:'Connexion perdue'}[lastStatus]}`;
 document.querySelectorAll('.nav-item').forEach(a=>a.classList.toggle('active',route()===a.dataset.route || a.dataset.route!=='/'&&route().startsWith(a.dataset.route+'/') || view?.f&&a.dataset.route===base(view.f)));
}
const date = value => {const d=new Date(value);return Number.isNaN(+d)?'':d.toLocaleDateString('fr-FR',{month:'short',day:'numeric'});};
const stageName = s => typeof s==='string' ? s : s?.label||s?.name||s?.title||s?.id||'';
const media = (file, controls=true) => !file ? '' : file.kind==='video' ? `<video src="${esc(file.url)}" ${controls?'controls':''} playsinline preload="metadata"></video>` : file.kind==='image' ? `<img src="${esc(file.url)}" alt="${esc(file.name)}" loading="lazy">` : '';
function tasksHTML(all=false) {
 const tasks=(snapshot.tasks||[]).filter(t=>all||t.status!=='done');
 return tasks.length ? `<div class="task-list">${tasks.map(t=>`<div class="task-row"><div class="task-title">${t.status==='running'&&!t.stale?'<i class="spin"></i>':icon(t.status==='done'?'check':'clock')}<strong>${esc(t.label||t.id)}</strong><span class="tiny">${esc(t.stale?'Dernier état connu':t.status==='done'?'Terminé':t.status==='error'?'À vérifier':t.status==='queued'?'En attente':t.status==='running'?'En cours':'En attente de l’agent')}</span></div><div class="tiny">${esc(t.stage||'')}${t.updatedAt?` · ${esc(date(t.updatedAt))}`:''}</div>${t.total>0&&t.completed!=null?`<progress max="${Number(t.total)}" value="${Number(t.completed)}" aria-label="${esc(t.label)}"></progress><p class="tiny">${Number(t.completed)} sur ${Number(t.total)}</p>`:''}${t.status==='error'||t.stale?button('Copier le prompt de reprise','task:'+t.id,'ghost small-btn'):''}</div>`).join('')}</div>` : '';
}
function projectRows(projects) {return projects.map(p=>{
 const thumb=p.files?.find(f=>f.kind==='image'),step=p.steps?.find(s=>s.id===p.progress?.current);
 const status=p.format==='edit'?(p.completed?'Exportée':p.edit?.exportRequest?'Export demandé':p.edit?.editedAt?'Modifiée':'Montage'):step?.label|| (p.format==='product-demo'?productDemoPhases.find(([id])=>id===p.data?.stage)?.[1]:null)|| (p.format==='talking-head'&&!p.steps?.length?'Étapes non enregistrées':stageName(p.stage)||'En cours');
 const path='/projects/'+encodeURIComponent(p.id);
 return `<a class="project-row" data-project="${esc(p.id)}" data-route="${esc(path)}" href="${esc(href(path))}">${thumb?`<img src="${esc(thumb.url)}" alt="" loading="lazy">`:icon(labels[p.format]?.[0])}<div class="project-copy"><h3>${esc(p.name)}</h3><p class="tiny">${snapshot.formats.length>1&&format(p.format)?esc(format(p.format).name)+' · ':''}${esc(status)}${step?.owner==='you'?' · À toi de valider':p.progress?.total?` · ${Number(p.progress.completed)} sur ${Number(p.progress.total)}`:''}</p>${p.steps?.length?`<div class="step-dots" aria-label="${Number(p.progress?.completed)||0} étape(s) terminée(s)">${p.steps.map(s=>`<i data-state="${esc(s.status)}" title="${esc(s.label)}"></i>`).join('')}</div>`:''}</div><span class="project-open" aria-hidden="true">${icon('arrow')}</span></a>`;
}).join('');}
// New video with several formats: pick one. With a single format the home button already goes straight to it.
function newChooser() {
 return `<div class="center-flow">${heading('Nouvelle vidéo','Choisis quoi créer.')}<div class="format-list">${snapshot.formats.map(f=>`<div class="format-row"><div class="format-symbol">${icon(labels[f.id]?.[0])}</div><a class="format-link" href="${href(base(f))}" data-route="${base(f)}"><h3>${esc(f.name)}</h3><p class="tiny">${esc(labels[f.id]?.[1]||'')}</p></a>${formatAction(f)}</div>`).join('')}</div></div>`;
}
function home() {
 const only=snapshot.formats.length===1&&snapshot.formats[0];
 let html=heading('Et maintenant ?','Ta prochaine vidéo commence ici.',preview||!snapshot.formats.length?'':only?formatAction(only,'primary'):link('Nouvelle vidéo','/new','primary','plus'));
 html+=tasksHTML();
 if(snapshot.sourceIssues?.length)html+=sourceIssuesHTML();
 if(snapshot.account.questions?.length)html+=`<div class="mission"><div class="mission-mark">${icon('agent')}</div><div class="mission-copy"><h3>Quelques infos que toi seul connais</h3><p>${snapshot.account.questions.length} réponse${snapshot.account.questions.length>1?'s':''} courte${snapshot.account.questions.length>1?'s':''} pour que ce soit vraiment à toi.</p></div>${link('Répondre','/setup/questions','primary','arrow')}</div>`;
 const accountTask=(snapshot.tasks||[]).some(t=>['profile','context'].includes(t.id)&&t.status!=='done');
 if(snapshot.account.enabled!==false&&!snapshot.account.done&&!snapshot.account.questions?.length&&!accountTask){
  const reading=snapshot.account.postsCount>0,ready=snapshot.onboarding?.stage==='prompt';
  html+=`<div class="mission"><div class="mission-mark">${icon('agent')}</div><div class="mission-copy"><h3>${reading?'La lecture de ton compte':ready?'Ton prompt de mise en route est prêt':'Ajoute ton compte quand tu veux'}</h3><p>${reading?'Tes posts sont là. Relis ce qu’on a appris.':ready?'Colle-le dans le chat de ton agent quand tu veux.':'Commence avec tes rushes. Ton compte peut attendre.'}</p></div>${link(reading?'À toi de relire':ready?'Prompt de mise en route':'Ajouter le compte',reading?'/setup':ready?'/account/setup-prompt':'/account/connect','','arrow')}</div>`;
 }
 const active=snapshot.projects.filter(p=>!finished(p));
 if(active.length)html+=`<div class="section-title">Reprendre ton travail</div>${projectRows(active.slice(0,3))}<div style="height:35px"></div>`;
 // The latest finished videos, each one click from the editor.
 const recent=snapshot.outputs.filter(o=>o.projectId).slice(0,4);
 if(recent.length)html+=`<section class="recent-outputs"><div class="section-title">Tes dernières vidéos ${link('Tout voir','/videos','small-btn')}</div>${outputCards(recent)}</section><div style="height:35px"></div>`;
 const edits=snapshot.projects.filter(p=>p.format==='edit');
 if(edits.length)html+=`<div class="section-title">Tes montages</div>${projectRows(edits.slice(0,6))}<div style="height:35px"></div>`;
 if(!snapshot.formats.length)return html+empty('Ajoute ton premier format','Copie le prompt dans le chat ouvert dans ce dossier.')+button('Copier le prompt d’ajout','add-pack','primary','copy');
 html+=`<div class="section-title">Tes formats</div><div class="format-list">${snapshot.formats.map(f=>`<div class="format-row"><div class="format-symbol">${icon(labels[f.id]?.[0])}</div><a class="format-link" href="${href(base(f))}" data-route="${base(f)}"><h3>${esc(f.name)}</h3><p class="tiny">${esc(waiting(f)?'En attente de ton compte':labels[f.id]?.[1]||'')}</p></a>${only?'':formatAction(f)}</div>`).join('')}</div>`;
 return html;
}
function accountSetup() {
 const a=snapshot.account;
 const steps=[['Ton compte',Boolean(a.profile?.handle||a.profile?.name)],['Tes posts',a.postsCount>0],['Ton contexte',a.done]];
 return `<div class="center-flow">${heading(a.done?'Ton compte est configuré':'Fais-en ton outil',a.done?'Tu peux le mettre à jour quand tu veux.':'Ton compte, ton contenu.')}<div class="stage-list">${steps.map(([name,done],i)=>`<div class="stage-line">${done?icon('check'):'<i class="state-circle"></i>'}<span>${name}</span><span class="tiny">${done?'Lu dans tes fichiers':'En attente'}</span></div>`).join('')}</div>${tasksHTML(true)}${a.questions?.length?link('Répondre à tes questions','/setup/questions','primary','arrow'):''}${a.readback?.length?link('Relire ton compte','/setup/readback','','arrow'):''}${promptBox(a.done?'/start\nMets à jour mon compte.':setupPrompt(snapshot.onboarding))}${link('Retour à l’Accueil','/','ghost')}</div>`;
}
function formatChrome() {
 const host=$('#format-bar'),f=view?.f;
 host.hidden=!f;host.dataset.format=f?.id||'';
 if(!f){host.innerHTML='';return;}
 if(f.id==='talking-head'&&['talking-style','talking-create'].includes(view.kind)){host.innerHTML=`<div class="format-bar-inner"><div class="format-hero"><div class="format-symbol">${icon(labels[f.id]?.[0])}</div><h1>${esc(f.name)}</h1></div></div>`;return;}
 if(f.id==='beat-montage'&&(view.kind==='beat-library'||searchParams().get('template')&&activeDocumentPath())){
  const c=beatLibraryChrome(f,activeDocumentPath()?'template/'+encodeURIComponent(searchParams().get('template'))+'/documents':view.sub);
  host.innerHTML=`<div class="format-bar-inner"><div class="format-hero trial-format-hero"><a class="trial-back" href="${esc(href(c.back))}" data-route="${esc(c.back)}" aria-label="Retour" title="Retour">${icon('back')}</a><h1>${esc(c.title)}</h1>${c.action?`<a class="btn primary" href="${esc(href(c.action.path))}" data-route="${esc(c.action.path)}" data-bm-reset="${esc(c.action.path.split('/')[4])}">${esc(c.action.label)}</a>`:''}</div>${c.tabs?.length?`<nav class="os-tabs" aria-label="Pages ${esc(c.title)}">${c.tabs.map(t=>`<a href="${esc(href(t.path))}" data-route="${esc(t.path)}" ${t.current?'aria-current="page"':''}>${esc(t.label)}</a>`).join('')}</nav>`:''}</div>`;return;
 }
 let selected=f.id==='product-demo'&&['product-demo-voice','product-demo-voice-prompt'].includes(view.kind)?'voice':view.kind==='preferences'||activeDocumentPath()===f.preferencesPath?'preferences':['scroll-reel','phone'].includes(f.id)?(f.id==='phone'?view.shotPage==='look'?'look':view.shotPage?.startsWith('ideas')?'ideas':view.shotPage==='research'?'research':view.shotPage==='inputs'?'inputs':'overview':(view.listPage?.startsWith('setup')?'look':view.listPage?.startsWith('ideas')?'ideas':view.listPage?.startsWith('research')?'research':view.listPage==='inputs'?'inputs':'overview')):view.kind==='beat-inputs'?'inputs':view.sub?.startsWith('setup')?'look':'overview';
 if(view.kind==='talking-captions')selected='captions';
 const tabs=f.id==='product-demo'?[['overview','Vue d’ensemble',base(f)],['voice','Voix off',base(f)+'/setup'],['preferences','Préférences',base(f)+'/preferences']]:['scroll-reel','phone'].includes(f.id)?[['overview','Vue d’ensemble',base(f)],['inputs','Ajouter des fichiers',base(f)+'/inputs'],['ideas','Idées',base(f)+'/ideas'],['research','Recherche',base(f)+'/research'],['preferences','Préférences',base(f)+'/preferences'],['look','Modifier le look',base(f)+'/setup/hook']]:f.id==='beat-montage'?[['overview','Vue d’ensemble',base(f)],['inputs','Ajouter des fichiers',base(f)+'/inputs'],['preferences','Préférences',base(f)+'/preferences']]:f.id==='trial-reels'?[['overview','Tes formats',base(f)],['preferences','Préférences',base(f)+'/preferences']]:f.id==='full-visual'?[]:[['overview','Vue d’ensemble',base(f)],['preferences','Préférences',base(f)+'/preferences'],...(f.id==='talking-head'?[['captions','Tes sous-titres',base(f)+'/captions']]:[['look','Modifier le look',base(f)+'/setup']])];
 const model=f.id==='trial-reels'&&view.sub?.startsWith('models/')?snapshot.trial?.formats.find(m=>m.id===decodeURIComponent(view.sub.slice(7))):null;
 if(model){host.innerHTML=`<div class="format-bar-inner"><div class="format-hero trial-format-hero"><a class="trial-back" href="${esc(href(base(f)))}" data-trial-back="${esc(model.id)}" aria-label="${trialInputDraft(model.id).adding||trialInputDraft(model.id).more?'Retour à '+esc(model.name):'Retour aux formats'}" title="Retour">${icon('back')}</a><h1>${esc(model.name)}</h1>${(model.canGenerate||model.approved)?preview&&window.MOTIONLAB_PREVIEW.workspaceUrl?`<a class="btn trial-primary" href="${esc(window.MOTIONLAB_PREVIEW.workspaceUrl)}/formats/trial-reels" target="_blank" rel="noopener">+ Nouveaux trial reels</a>`:`<button class="btn trial-primary" data-trial-add="${esc(model.id)}">+ Nouveaux trial reels</button>`:''}</div>${(model.canGenerate||model.approved)?`<p class="small trial-output-count">${model.batch?.sources?`${model.batch.finishedSources} sur ${model.batch.sources} reels terminés · `:''}${model.variationCount} variation${model.variationCount>1?'s':''}</p>`:''}</div>`;return;}
 host.innerHTML=`<div class="format-bar-inner"><div class="format-hero">${f.id==='trial-reels'?`<a class="trial-back" href="${esc(href(view.sub?base(f):'/'))}" data-route="${view.sub?base(f):'/'}" aria-label="${view.sub?'Retour aux formats':'Retour à l’Accueil'}" title="Retour">${icon('back')}</a>`:`<div class="format-symbol">${icon(labels[f.id]?.[0])}</div>`}<h1>${esc(f.name)}</h1>${view.kind==='beat-inputs'||f.id==='product-demo'&&(['product-demo-new','product-demo-voice','product-demo-voice-prompt','project'].includes(view.kind)||view.kind==='format'&&!snapshot.projects.some(p=>p.format===f.id)&&!snapshot.outputs.some(p=>p.format===f.id))||f.id==='full-visual'&&(view.kind!=='format'||!snapshot.projects.some(p=>p.format===f.id)&&!snapshot.outputs.some(p=>p.format===f.id))?'':formatAction(f,'primary')}</div>${tabs.length?`<nav class="os-tabs" aria-label="Pages ${esc(f.name)}">${tabs.map(([id,name,path])=>`<a href="${esc(href(path))}" data-route="${path}" ${selected===id?'aria-current="page"':''}>${name}</a>`).join('')}</nav>`:''}</div>`;
}
function outputCards(outputs) {
 return `<div class="output-grid">${outputs.map(output=>{
  const path=output.projectId?'/projects/'+encodeURIComponent(output.projectId):'/files?file='+encodeURIComponent(output.path);
  const project=output.projectId?snapshot.projects.find(p=>p.id===output.projectId):null;
  const edited=project?.edit?.editedAt?'<span class="edit-state">Modifiée</span>':'';
  const poster=output.cover?.url||(!preview?'/api/edit/poster?path='+encodeURIComponent(output.path):'');
  return `<article class="output-card" data-output="${esc(output.path)}"><video src="${esc(output.url)}" ${poster?`poster="${esc(poster)}"`:''} controls playsinline preload="none" aria-label="${esc(output.name)}"></video><a href="${esc(href(path))}" data-route="${esc(path)}">${esc(output.name)}</a><span class="tiny">${esc(date(output.updatedAt))}${edited}</span>${output.projectId&&!preview?editLink(output.editId||output.projectId,'Modifier','small-btn output-edit'):''}</article>`;
 }).join('')}</div>`;
}
function formatExample(f) {
 const copy={
  'beat-montage':['Tes clips, sur le beat.','Tes rushes montés sur une chanson, avec une phrase par-dessus.','Une vidéo terminée, sa légende, sa couverture et les consignes pour le son.','Apporte tes clips. On choisit les moments et on fait le montage.'],
  'scroll-reel':['De bonnes trouvailles. Une vidéo.','Des ressources utiles pour ton audience, montrées sur un clip de toi.','Une vidéo terminée, sa légende, sa couverture et les liens des ressources.','Apporte un clip de toi à ton bureau. On cherche ce qui vaut la peine d’être partagé.'],
  phone:['Un seul plan. Une idée à garder.','Un clip simple, une accroche à l’écran et la réponse utile dans la légende.','Une vidéo terminée, une légende complète, la couverture et les consignes pour le son.','Commence avec un seul plan. On trouve l’idée et on écrit les mots.'],
 }[f.id];
 if(!copy||!f.exampleVideo?.url&&!f.example?.url)return '';
 const video=f.exampleVideo;
 const reference=video?`<video src="${esc(video.url)}" ${f.example?.url?`poster="${esc(f.example.url)}"`:''} controls playsinline preload="metadata" aria-label="Regarder un exemple complet de ${esc(f.name)}"></video>`:media(f.example);
 const credit=f.exampleCredit||'Exemple du format';
 return `<section class="format-example" aria-label="Exemple ${esc(f.name)}"><figure>${reference}<figcaption>${esc(credit)}${f.exampleLink?` · <a href="${esc(f.exampleLink)}" target="_blank" rel="noreferrer">Vidéo d’origine ↗</a>`:''}</figcaption></figure><div><h2>${copy[0]}</h2><p>${copy[1]}</p><div class="example-includes"><strong>Tu reçois</strong><p>${copy[2]}</p></div><p>${copy[3]}</p>${setupDone(f)?formatAction(f,'primary'):link('L’adapter à moi',base(f)+'/setup','primary','arrow')}</div></section>`;
}
function detail(f) {
 if(f.id==='full-visual')return fullVisualOverview(f,snapshot,{esc,link,projectRows,outputCards});
 if(f.id==='product-demo'){
  const active=snapshot.projects.filter(p=>p.format===f.id&&!finished(p)),outputs=(snapshot.outputs||[]).filter(o=>o.format===f.id);
  return `${!outputs.length&&!active.length?`<div class="product-demo-project"><h2>Fais ta première démo produit.</h2><p class="muted">On étudie ton produit, on écrit l’histoire et on anime le film.</p><ol class="product-demo-intro"><li>Ton produit</li><li>Histoire et voix off</li><li>Film animé</li></ol><div class="button-row">${link(productVoiceReady(f)?'Faire mon premier film':'Configurer Product Demo',base(f)+(productVoiceReady(f)?'/new':'/setup'),'primary','arrow')}</div></div>`:''}${outputs.length?`<section class="recent-outputs"><div class="section-title">Tes films</div>${outputCards(outputs)}</section>`:''}${active.length?`<section class="active-videos"><div class="section-title">En cours</div>${projectRows(active)}</section>`:''}`;
 }
 if(f.id==='beat-montage')return beatOverview(f,snapshot,beatDraft(),beatUI());
 if(f.id==='trial-reels')return trialDetail(f);
 const active=snapshot.projects.filter(p=>p.format===f.id&&!finished(p));
 const outputs=(snapshot.outputs||[]).filter(o=>o.format===f.id).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
 if(outputs.length)return `<section class="recent-outputs"><div class="section-title">Tes vidéos</div>${outputCards(outputs)}</section>${active.length?`<section class="active-videos"><div class="section-title">En cours <span>${active.length}</span></div>${projectRows(active)}</section>`:''}`;
 const example=!outputs.length?formatExample(f):'';
 return `${example||(!setupDone(f)&&!waiting(f)?`<div class="mission"><div class="mission-copy"><h3>Ta première vidéo ${esc(f.name)}</h3><p>Choisis ton look une fois, puis fais-en ta signature.</p></div>${link('Configurer',base(f)+'/setup','primary','arrow')}</div>`:'')}${waiting(f)?`<div class="mission"><div class="mission-copy"><h3>D’abord, la lecture de ton compte</h3><p>Tes meilleurs formats guident ces variations.</p></div>${link('Voir l’avancement','/setup','small-btn')}</div>`:''}${active.length?`<section class="active-videos"><div class="section-title">En cours <span>${active.length}</span></div>${projectRows(active)}</section>`:''}${outputs.length||!example?`<section class="recent-outputs"><div class="section-title">Vidéos récentes</div>${outputs.length?outputCards(outputs):empty('Tes vidéos s’afficheront ici','Tes cinq dernières vidéos, prêtes à regarder.')}</section>`:''}`;
}
function stages(f) {return f.stages?.length?`<div class="mini-stages">${f.stages.map(s=>`<span class="${stageName(s)===stageName(f.stage)?'current':''}">${esc(stageName(s))}</span>`).join('')}</div>`:'';}
function progress(f,current,setup=false) {
 const paths=setup?['footage','look','prompt']:['footage','transcript','prompt'];
 return `<nav class="onboarding-track" aria-label="Étapes de la vidéo">${paths.map((p,i)=>`${i?'<span class="track-line"></span>':''}<span ${p===current?'aria-current="step"':''} class="${p===current?'current':''}">${{footage:'Rushes',look:'Ton look',transcript:'Script',prompt:'Prompt'}[p]}</span>`).join('')}</nav>`;
}
function formatFiles(f) {return snapshot.files.filter(file=>file.format===f.id||file.path.includes('/'+f.id+'/')||f.pack==='quick-cuts'&&file.path.includes('/quick-cuts/'));}
function inputFiles(f) {return snapshot.files.filter(file=>file.path.startsWith('workspace/input/')&&['video','image'].includes(file.kind) && (!file.format||file.format===f.id||file.format===f.pack));}
function selectedMedia(d) {
 for(const file of d.files||[]) {if(file.path){const live=snapshot.files.find(x=>x.path===file.path);if(live)return live;}else if(blobs.has(file.token))return {...file,url:blobs.get(file.token),kind:file.type?.startsWith('video/')?'video':'image'};}
 return null;
}
function footage(f,setup=false) {
 const d=draft(f.id);
 return `<div class="center-flow">${f.id==='talking-head'?progress(f,'footage',setup):''}${heading(f.id==='trial-reels'?'Tes rushes d’origine':'Ajoute tes rushes bruts',f.id==='trial-reels'?'Utilise les fichiers non montés derrière les vidéos choisies.':'Choisis un fichier ici, puis joins-le dans le chat.')}<label class="drop-zone">${icon('upload')}<strong>Dépose tes rushes ici</strong><span class="tiny">ou choisis des fichiers</span><input id="footage-input" type="file" accept="video/*,image/*" multiple aria-label="Choisir les rushes bruts"></label><div id="chosen-files">${chosenFiles(d)}</div>${inputFiles(f).length?`<label class="field" style="margin-top:24px"><span>Déjà dans ton dossier</span><select id="existing-footage"><option value="">Choisir des rushes</option>${inputFiles(f).map(file=>`<option value="${esc(file.path)}">${esc(file.name)}</option>`).join('')}</select></label>`:''}<p class="inline-alert" id="form-error" role="alert"></p><div class="flow-footer">${link('Retour',base(f),'ghost')}${button('Continuer','footage-next','primary','arrow')}</div></div>`;
}
function chosenFiles(d) {return (d.files||[]).map((file,i)=>`<div class="file-row">${icon('file')}<div>${esc(file.name)}<span class="tiny">${esc(file.path?'Dans ton dossier':'Joins ce fichier dans le chat')}</span></div><button class="btn ghost small-btn" data-remove="${i}" aria-label="Retirer ${esc(file.name)}">Retirer</button></div>`).join('');}

function sourceIssuesHTML(){return `<div class="mission"><div class="mission-copy"><h3>Un fichier est à vérifier</h3><p>Ta dernière lecture complète reste visible pendant que ton agent le répare.</p></div>${button('Copier le prompt de réparation','source-repair','small-btn','copy')}</div>`;}

function transcript(f) {
 const d=draft(f.id);
 return `<div class="center-flow">${progress(f,'transcript',!setupDone(f))}${heading('Tes mots.','Ajoute le script, ou laisse ton agent transcrire tes rushes.')}<label class="field"><span>Script</span><textarea data-field="transcript" id="transcript" placeholder="Colle ton script…" ${d.transcribe?'disabled':''}>${esc(d.transcript)}</textarea></label><label class="check-label"><input type="checkbox" data-field="transcribe" ${d.transcribe?'checked':''}>Transcrire mes rushes</label><p class="inline-alert" id="form-error" role="alert"></p><div class="flow-footer">${link('Retour',base(f)+(setupDone(f)?'/new/footage':'/setup/look'),'ghost')}${button('Obtenir le prompt','transcript-next','primary','arrow')}</div></div>`;
}
function sounds(f,d) {
 const options=(f.sounds||snapshot.sounds||[]).filter(t=>!t.formats||t.formats.includes(f.id));
 return options.length?`<div class="field"><span>Sons</span>${options.map(t=>`<label class="sound-choice"><input type="checkbox" data-sound="${esc(t.id)}" ${(d.sounds||[]).includes?.(t.id)?'checked':''}><span>${esc(t.title||t.id)}<small>${esc(t.owner||'')}${t.bpm?' · '+esc(t.bpm)+' BPM':''}</small></span>${/^https:\/\//.test(t.page||'')?`<a href="${esc(t.page)}" target="_blank" rel="noreferrer">Écouter ↗</a>`:''}</label>`).join('')}</div>`:'<p class="setup-note">Ton agent te proposera des sons adaptés à ce format.</p>';
}
function quickDefaults(f) {
 const d=draft(f.id);
 const defaults=f.id==='beat-montage'?{preset:'fast-beat-cut',layout:'full',line_style:'serif centred'}:f.id==='scroll-reel'?{opening:'lockup',feel:'medium',cta:'save',face:'Barlow Condensed',accent:'keyframes'}:{shape:'authority',cta:'save',keyword:''};
 for(const [k,v] of Object.entries(defaults))d[k]??=v;
 if(d.accent==='chris')d.accent='reference'; // legacy alias: the 0.4.0 name of the reference accent
 return d;
}
function quickSetup(f) {
 const d=quickDefaults(f);
 let form='';
 if(f.id==='beat-montage')form=field('Qu’est-ce que tu vas filmer ?','subject',d.subject,'Ton travail, ton studio, tes journées…')+select('Rythme','preset',[['fast-beat-cut','Coupes rapides sur le beat'],['slow-hold','Plans longs'],['hook-then-burst','Accroche puis rafale']],d.preset)+select('Cadre','layout',[['full','Plein cadre'],['square','Carré avec bandes']],d.layout)+select('Texte','line_style',[['serif centred','Serif, centré'],['own','Mon style de texte habituel']],d.line_style);
 if(f.id==='scroll-reel')form=field('Ton clip au bureau','shot',d.shot,'Choisis ci-dessous, ou joins-le dans le chat')+select('Ouverture','opening',[['lockup','Titre'],['count','Grand chiffre'],['band','Bandeau titre'],['window-first','Fenêtre d’abord']],d.opening)+field('Police','face',d.face)+select('Couleur d’accent','accent',[['keyframes','Orange'],['reference','Jaune'],['from your account','Celle de mon compte']],d.accent)+select('Défilement','feel',[['soft','Doux'],['medium','Moyen'],['hard','Fort']],d.feel)+select('Fin','cta',[['save','Enregistre-la'],['comment','Commente un mot-clé'],['link','Va sur mon lien']],d.cta)+field('Mot-clé à commenter, si utilisé','keyword',d.keyword);
 if(f.id==='phone')form=select('Type d’accroche','shape',[['authority','Une méthode reconnue'],['experiment','Ma propre expérience'],['taunt','Un défi'],['tonight','À tester ce soir'],['wall','Une collection utile'],['number-title','Une liste numérotée'],['one-prompt','Un prompt utile'],['tells','Les signes à repérer'],['secret','Une idée peu connue']],d.shape)+select('Fin','cta',[['save','Enregistre-la'],['caption','La valeur dans la légende'],['comment','Commente un mot-clé']],d.cta)+`<div id="keyword-field" ${d.cta==='comment'?'':'hidden'}>${field('Mot-clé et ce que tu envoies','keyword',d.keyword,'OUTILS, ma liste de ressources')}</div><p class="setup-note">Le texte suit ton cadrage. Ton agent vérifie sa place sur chaque plan.</p>`;
 return heading(setupDone(f)?'Ton look enregistré':`Configurer ${f.name}`,setupDone(f)?'Change seulement ce que tu veux mettre à jour.':'Choisis une fois, utilise-le pour chaque vidéo.')+`<div class="setup-grid"><div class="setup-preview" id="quick-preview">${quickPreview(f,d)}</div><div class="setup-fields">${form}${sounds(f,d)}${f.id==='beat-montage'?field('Tes propres sons, facultatif','own_sounds',d.own_sounds,'Joins tes fichiers audio dans le chat'):''}<div class="section-title">Tes rushes</div><label class="drop-zone">${icon('upload')}<span>Choisir des rushes</span><input id="footage-input" type="file" accept="video/*,image/*" multiple aria-label="Choisir des rushes"></label><div id="chosen-files">${chosenFiles(d)}</div>${fileRows(formatFiles(f).filter(x=>x.kind==='page'))}<p class="inline-alert" id="form-error" role="alert"></p><div class="flow-footer">${link('Retour',base(f),'ghost')}${button('Obtenir le prompt de réglage','quick-setup-prompt','primary','arrow')}</div></div></div>`;
}
function quickPreview(f,d) {
 const selected=selectedMedia(d), image=selected||f.example;
 const picture=image?media(image,false):`<div style="height:100%;display:grid;place-items:center;padding:25px;text-align:center;font-size:12px;color:#cbd0d6">Tes rushes s’afficheront ici</div>`;
 if(image&&image===f.example)return `<div class="format-mock">${f.exampleVideo?.url?`<video src="${esc(f.exampleVideo.url)}" poster="${esc(image.url)}" controls playsinline preload="metadata" aria-label="Regarder un exemple complet de ${esc(f.name)}"></video>`:picture}</div><p class="preview-foot">${esc(f.exampleCredit||'Exemple complet du format')}. Tes choix s’appliquent à ta vidéo.</p>`;
 const words=f.id==='phone'?'Petites idées.\nUtiles chaque jour.':f.id==='scroll-reel'?'4 outils à garder':'Un peu de ce que je fais.';
 return `<div class="format-mock ${f.id==='beat-montage'&&d.layout==='square'?'montage-square':''}">${picture}${f.id==='scroll-reel'?`<div class="mock-heading ${esc(d.opening)}" style="color:${d.accent==='reference'?'#F6FA87':d.accent==='keyframes'?'#e07850':'#fff'}">${words}</div><div class="mock-window"><div class="window-top"><i></i><i></i><i></i></div><strong>Une trouvaille utile</strong><p>Montre pourquoi elle vaut la peine d’être gardée.</p><div class="mock-line"></div><div class="mock-line"></div></div>`:`<div class="mock-words ${d.line_style==='serif centred'?'serif':''}">${words}</div>`}${f.id==='phone'?'<div class="mock-cta">Garde ça pour plus tard.</div>':''}</div><p class="preview-foot">${image?'Aperçu':'Aperçu de la mise en page'}</p>`;
}
const beatUploads=[];
const beatUI=()=>({esc,heading,link,button,icon,count,outputCards,projectRows,preview,workspaceUrl:window.MOTIONLAB_PREVIEW?.workspaceUrl});
const beatDraft=()=>{const d=draft('beat-montage');beatReferenceRows(d);return {...d,uploads:beatUploads};};
function beatUploadView(){if(['beat-inputs','beat-craft'].includes(view?.kind)||(view?.kind==='format'&&view.f?.id==='beat-montage')){const y=scrollY;render(true);scrollTo(0,y);}}
async function sendBeatFile(job){
 job.status='uploading';job.error='';beatUploadView();
 try{
  if(preview)throw Error('Ajoute des clips dans ton espace de travail installé. Ceci est l’aperçu du design.');
  await new Promise((accept,reject)=>{
   const xhr=new XMLHttpRequest();xhr.open('PUT','/api/beat-inputs?'+new URLSearchParams({name:job.name,...job.referenceId?{reference:job.referenceId}:{}}));xhr.setRequestHeader('X-MotionLab-Write','inputs');
   xhr.upload.onprogress=e=>{if(e.lengthComputable){job.progress=e.loaded/e.total*100;const p=document.querySelector(`[data-beat-upload-progress="${job.id}"]`);if(p)p.value=job.progress;}};
   xhr.onload=()=>{let value;try{value=JSON.parse(xhr.responseText);}catch{}if(xhr.status>=200&&xhr.status<300)accept(value);else reject(Error(value?.error||'Échec de l’envoi. Réessaie.'));};
   xhr.onerror=()=>reject(Error('Connexion perdue. Réessaie.'));xhr.onabort=()=>reject(Error('Envoi interrompu. Réessaie.'));xhr.send(job.file);
  });
  job.status='done';job.file=null;await client.refresh();
 }catch(e){job.status='error';job.error=e.message;}
 beatUploadView();
}
async function addBeatFiles(files,referenceId=null){
 const incoming=Array.from(files).map(entry=>({file:entry.file||entry,name:entry.relativePath||entry.webkitRelativePath||entry.name}));
 const videos=incoming.filter(x=>/\.(mp4|mov|m4v|mkv|webm|avi)$/i.test(x.name));
 if(referenceId){const d=draft('beat-montage');d.referenceUploadErrors??={};delete d.referenceUploadErrors[referenceId];if(!videos.length){d.referenceUploadErrors[referenceId]='Choisis un fichier vidéo, par exemple MP4 ou MOV.';beatUploadView();return;}}
 if(!videos.length)return error('Ajoute des clips vidéo d’origine.');
 const jobs=videos.map(x=>({...x,referenceId,id:crypto.randomUUID(),status:'queued',progress:0}));beatUploads.push(...jobs);beatUploadView();
 let next=0;await Promise.all([0,1].map(async()=>{while(next<jobs.length)await sendBeatFile(jobs[next++]);}));
}
function quickNew(f) {
 const d=draft(f.id);
 if(f.id==='trial-reels')return trialNew(f);
 return `<div class="center-flow">${heading(`Nouvelle vidéo ${f.name}`,f.id==='beat-montage'?'Tes rushes, sons et look enregistrés.':'Ton look enregistré est déjà inclus.')}${count(d)}${f.id!=='beat-montage'?field((snapshot.account.context?.readyForIdeas??snapshot.account.done)?'Sujet, facultatif':'De quoi doit-elle parler ?','topic',d.topic,(snapshot.account.context?.readyForIdeas??snapshot.account.done)?'Utilise ce que tu sais de moi':snapshot.account.context?.audience?'Une idée pour ton audience enregistrée':'Un sujet et à qui il s’adresse'):''}<p class="inline-alert" id="form-error" role="alert"></p><div class="flow-footer">${link('Retour',base(f),'ghost')}${button('Obtenir le prompt','quick-new-prompt','primary','arrow')}</div></div>`;
}
function trialNew(f){
 const d=draft(f.id),sources=Array.isArray(f.answers?.sources)?f.answers.sources:[];
 if(!d.source&&sources[0])d.source=sources[0].id;
 return `<div class="center-flow">${heading('Nouveaux Trial Reels','Décline un format qui a déjà marché.')}${sources.length?select('Partir de','source',sources.map(s=>[s.id,s.line||s.family||s.code||s.id]),d.source):'<p class="setup-note">Ton agent utilisera ta sélection de formats enregistrée.</p>'}${count(d)}${link('Ajouter ou remplacer les originaux',base(f)+'/new/footage','ghost','plus')}<p class="inline-alert" id="form-error" role="alert"></p><div class="flow-footer">${link('Retour',base(f),'ghost')}${button('Obtenir le prompt','quick-new-prompt','primary','arrow')}</div></div>`;
}
const trialUploads=new Map();
const trialInputDraft=id=>drafts['trial-inputs:'+id]??=( {drive:'',need:'',error:''} );
function trialTask() {return (snapshot.tasks||[]).filter(t=>(t.id==='profile'||String(t.id).startsWith('trial-'))&&t.status!=='done').sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];}
function trialTaskView(task) {return task?`<div class="trial-work" role="status">${task.status==='running'&&!task.stale?'<i class="spin"></i>':icon('clock')}<div><strong>${esc(task.label)}</strong><p class="small">${task.stale?'Dernier état connu : ':task.status==='error'?'Arrêté : ':''}${esc(task.stage)}${task.total>0?` · ${Number(task.completed)||0} sur ${Number(task.total)}`:''}</p>${task.stale||task.status==='error'?'<p class="small">Continue dans le chat pour reprendre.</p>':''}</div></div>`:'';}
function trialImage(example,cls='') {return example?.thumbnail?`<img class="${cls}" src="${esc(example.thumbnail.url)}" alt="${esc(example.name||'Exemple tiré de ta vidéo')}" loading="lazy">`:example?.video?`<video class="${cls}" src="${esc(example.video.url)}" preload="metadata" playsinline aria-label="Exemple tiré de ta vidéo"></video>`:`<span class="trial-missing ${cls}">Aperçu en attente</span>`;}
function trialHome(f) {
 const trial=snapshot.trial||{},models=trial.formats||[],state=trial.analysis?.status,task=trialTask(),incomplete=waiting(f)||!['ready','no-matches','empty'].includes(state);
 let intro=task?.status==='running'&&!task.stale?trialTaskView(task):'';
 if(!intro&&incomplete)intro=task?trialTaskView(task):`<div class="trial-continue">${promptBox(waiting(f)?'/start\nTermine le contexte de mon compte, puis continue avec Trial Reels.':'/trial-reels\nContinue à repérer mes meilleures vidéos. Réutilise les formats que tu connais déjà.')}</div>`;
 if(!intro&&!models.length)intro=heading(state==='no-matches'?'Tes meilleures vidéos sont face caméra':'Pas encore de vidéos récentes',state==='no-matches'?'Elles n’ont pas besoin d’une étude Trial Reels.':'Trial Reels part des vidéos que tu as déjà publiées.');
 const rows=models.map(m=>{
  const path=base(f)+'/models/'+encodeURIComponent(m.id);
  const status=(m.canGenerate||m.approved)?m.complete?`${m.variationCount} variations prêtes`:`${m.batch?.remainingSources??m.posts} vidéos à terminer`:m.screen==='test'?'Relis ton test':m.screen==='study'?m.studied?'Préparation de ton test':'Étudier tes fichiers':'Ajoute tes originaux';
  return `<a class="trial-format-row" href="${esc(href(path))}" data-route="${esc(path)}">${trialImage(m.cover||m.examples?.[0],'trial-row-image')}<div class="trial-row-copy"><h2>${esc(m.name)}</h2><p>${esc(m.what)}</p><span class="trial-video-count">${Number(m.posts).toLocaleString('fr-FR')} vidéo${m.posts>1?'s':''} choisie${m.posts>1?'s':''}</span></div><span class="trial-row-status" data-screen="${esc(m.screen)}">${esc(status)}</span><span class="trial-row-arrow">${icon('arrow')}</span></a>`;
 }).join('');
 return `<div class="trial-home">${intro}${rows?`<div class="trial-format-list">${rows}</div>`:''}${trial.reviewPage?`<a class="trial-reading-link" href="${esc(href('/pages?file='+encodeURIComponent(trial.reviewPage.path)))}" data-route="${esc('/pages?file='+encodeURIComponent(trial.reviewPage.path))}">Voir la lecture enregistrée de ton compte ${icon('arrow')}</a>`:''}${state==='no-matches'&&format('talking-head')?link('Ouvrir Talking Head','/formats/talking-head','','arrow'):''}</div>`;
}
function trialSource(e) {
 if(!e)return '';
 return `<article class="trial-source">${e.video?`<video src="${esc(e.video.url)}" ${e.thumbnail?`poster="${esc(e.thumbnail.url)}"`:''} controls playsinline preload="metadata" aria-label="Vidéo d’origine"></video>`:trialImage(e)}${e.name?`<p class="small">${esc(e.name)}</p>`:''}${e.permalink?`<a class="small" href="${esc(e.permalink)}" target="_blank" rel="noreferrer">Voir sur Instagram ↗</a>`:''}</article>`;
}
function trialInputs(model) {
 const d=trialInputDraft(model.id),jobs=trialUploads.get(model.id)||[];
 const requests=`<div class="trial-needs">${model.needs.map(n=>`<section class="trial-need"><div class="trial-need-title"><h3>${esc(n.what)}</h3></div>${n.example?`<p class="small">${esc(n.example)}</p>`:''}${n.without?`<p class="small">${esc(n.without)}</p>`:''}<div class="trial-source-grid">${n.references.map(trialSource).join('')}</div></section>`).join('')}</div>`;
 const files=(model.inputs||[]).map(i=>`<div class="trial-input-file"><div>${icon(i.kind==='drive'?'folder':'file')}<div>${i.kind==='drive'?`<a href="${esc(i.url)}" target="_blank" rel="noreferrer">${esc(i.name)}</a>`:esc(i.name)}<span class="tiny">${esc(i.status)}${i.bytes?` · ${trialBytes(i.bytes)}`:''}</span></div></div><button class="btn ghost small-btn" data-trial-remove="${esc(i.id)}" data-model="${esc(model.id)}" ${i.mediaId?`data-media="${esc(i.mediaId)}"`:''} aria-label="Retirer ${esc(i.name)}">Retirer</button></div>`).join('');
 const upload=preview?`<div class="trial-live-link"><p class="small">Dans l’app installée, les envois sont enregistrés dans ton dossier.</p>${window.MOTIONLAB_PREVIEW.workspaceUrl?`<a class="btn primary" href="${esc(window.MOTIONLAB_PREVIEW.workspaceUrl)}/formats/trial-reels" target="_blank" rel="noopener">Ouvrir l’app installée ↗</a>`:promptBox('Ouvre mon espace de travail MotionLab local pour que je puisse envoyer mes originaux.')}</div>`:`<div class="trial-upload-controls">${model.needs.length>1?`<label class="field"><span>Fichiers ajoutés pour</span><select data-trial-need="${esc(model.id)}"><option value="">Tous les fichiers ensemble</option>${model.needs.map(n=>`<option value="${esc(n.id)}" ${d.need===n.id?'selected':''}>${esc(n.what)}</option>`).join('')}</select></label>`:''}<div class="trial-drop" data-trial-drop="${esc(model.id)}"><span>${icon('upload')}Dépose tes fichiers ici</span><div><label class="btn small-btn">Choisir des fichiers<input type="file" multiple data-trial-upload="${esc(model.id)}" aria-label="Envoyer des fichiers"></label><label class="btn ghost small-btn">Choisir un dossier<input type="file" multiple webkitdirectory data-trial-upload="${esc(model.id)}" aria-label="Envoyer un dossier"></label></div></div><details class="trial-drive" data-trial-detail="drive"><summary>Utiliser un dossier Google Drive</summary><div class="trial-drive-field"><label class="field"><span>Lien du dossier Drive</span><input type="url" data-trial-drive="${esc(model.id)}" value="${esc(d.drive)}" placeholder="https://drive.google.com/drive/folders/…"></label><button class="btn" data-trial-save-drive="${esc(model.id)}">Ajouter le dossier</button></div></details></div>`;
 return `<section class="trial-inputs" data-trial-model="${esc(model.id)}">${heading('1) Ajoute tes fichiers',model.without)}${requests}${files?`<div class="trial-input-files">${files}</div>`:''}${upload}<div class="trial-transfers" data-transfers="${esc(model.id)}" role="status" aria-live="polite">${trialTransferRows(jobs)}</div><p class="inline-alert" data-trial-error="${esc(model.id)}" role="alert">${esc(d.error)}</p>${model.removed?.length?`<details class="trial-more" data-trial-detail="removed"><summary>Fichiers retirés</summary>${model.removed.map(i=>`<div class="trial-input-file"><span>${esc(i.name)}</span><button class="btn ghost small-btn" data-trial-restore="${esc(i.id)}" data-model="${esc(model.id)}">Restaurer</button></div>`).join('')}</details>`:''}${d.more?`<button class="btn primary" data-trial-ready="${esc(model.id)}">C’est fait</button>`:''}</section>`;
}
function trialCaption(model,item,{source=false}={}) {
 const text=item?.caption?.text;
 if(!text)return source?'':'<span class="trial-caption-pending">Légende en attente</span>';
 const key=source?item.id:item.path;
 return `<details class="trial-caption" data-trial-detail="caption:${source?'source:':''}${esc(key)}"><summary>${source?'Légende d’origine':'Légende'} ${icon('back')}</summary><p>${esc(text)}</p><button class="btn ghost small-btn" data-trial-caption="${esc(key)}" data-model="${esc(model.id)}" ${source?'data-source="true"':''}>${icon('copy')}Copier la légende</button></details>`;
}
function trialVariation(model,o,index) {
 const posted=!!o.posted;
 return `<article class="trial-video-card output-card" data-output="${esc(o.path)}" data-posted="${posted}"><video src="${esc(o.url)}" ${o.cover?.url?`poster="${esc(o.cover.url)}"`:''} controls playsinline preload="${o.cover?.url?'none':'metadata'}" aria-label="Variation ${index}"></video><div class="trial-video-info"><div class="trial-video-title"><h3>Variation ${index}</h3><a href="${esc(o.url)}" download class="trial-download" aria-label="Télécharger la variation ${index}" title="Télécharger">${icon('download')}</a></div>${trialCaption(model,o)}${o.projectId&&!preview?editLink(o.editId||o.projectId,'Modifier','small-btn output-edit'):''}<label class="trial-post-control" data-saved="${posted}"><input type="checkbox" data-trial-posted="${esc(o.path)}" data-model="${esc(model.id)}" aria-label="Publié : variation ${index}" ${posted?'checked':''} ${preview&&!window.MOTIONLAB_PREVIEW.changeTrial?'disabled':''}><span>${posted?'Publié':'Marquer comme publié'}</span><span class="trial-post-saving" aria-hidden="true">Enregistrement…</span></label></div></article>`;
}
function trialOriginalLink(source) {
 return source?.permalink?`<a class="trial-original-link" href="${esc(source.permalink)}" target="_blank" rel="noreferrer">Variations de <span>${esc(source.name||'ta vidéo Instagram')}</span> ↗</a>`:'';
}
function trialOutputGroups(model,posted) {
 return model.outputGroups.map(g=>{
  const outputs=g.outputs.filter(o=>o.posted===posted);if(!outputs.length)return '';
  const linked=model.kind==='montage';
  const source=linked?`<header class="trial-group-heading">${trialOriginalLink(g.source)}</header>`:`<aside class="trial-output-source">${trialImage(g.source)}${trialOriginalLink(g.source)}</aside>`;
  return `<section class="trial-output-group ${linked?'trial-output-group--linked':''} ${g.outputs.length>4?'trial-output-group--wide':''}">${source}<div class="trial-variations">${outputs.map(o=>trialVariation(model,o,g.outputs.indexOf(o)+1)).join('')}</div></section>`;
 }).join('');
}
function trialBacklog(model) {
 const remaining=model.uncreated||[];if(!remaining.length)return '<p class="small" role="status">Chaque vidéo connue a déjà une variation.</p>';
 const d=trialInputDraft(model.id),selected=new Set(d.queued||[]),count=remaining.filter(e=>selected.has(e.id)).length,n=model.variationTarget||4;
 return `<section class="trial-backlog trial-backlog-tab" aria-label="Vidéos sans variation"><p class="small">Sélectionne les vidéos à décliner.</p><div class="trial-backlog-list">${remaining.map(e=>`<div class="trial-backlog-row"><label><input type="checkbox" data-trial-queue="${esc(e.id)}" data-model="${esc(model.id)}" aria-label="Sélectionner ${esc(e.name||'la vidéo')}" ${selected.has(e.id)?'checked':''}>${trialImage(e)}<span>${esc(e.name||'Ta vidéo')}</span></label>${e.permalink?`<a href="${esc(e.permalink)}" target="_blank" rel="noreferrer" aria-label="Original sur Instagram">↗</a>`:''}</div>`).join('')}</div><div class="trial-backlog-footer"><span>${count?`${count} vidéo${count>1?'s':''} × ${n} variations`:'Sélectionne les vidéos de ta prochaine série.'}</span><button class="btn trial-primary" data-trial-queue-copy="${esc(model.id)}" ${count?'':'disabled'}>${icon('copy')}Copier le prompt${count?` · ${count*n} vidéos`:''}</button></div></section>`;
}
function trialOutputPage(f,model) {
 const requested=searchParams().get('tab'),tab=['output','uncreated','posted'].includes(requested)?requested:'uncreated';
 const tabs=[['output','Vidéos prêtes',model.variationCount-model.postedCount],['uncreated','Pas encore testées',(model.uncreated||[]).length],['posted','Publié',model.postedCount]];
 const nav=`<nav class="os-tabs trial-output-tabs" aria-label="Vues des trial reels">${tabs.map(([key,label,count])=>{
  const path=base(f)+'/models/'+encodeURIComponent(model.id)+'?tab='+key;
  return `<a class="os-tab ${tab===key?'active':''}" href="${esc(href(path))}" data-route="${esc(path)}" ${tab===key?'aria-current="page"':''}>${label} <span class="trial-tab-count">${count}</span></a>`;
 }).join('')}</nav>`;
 const activeTask=(snapshot.tasks||[]).find(t=>t.status==='running'&&!t.stale&&(t.project&&model.projectIds.includes(t.project)||String(t.id).startsWith('trial-stack-')&&(t.label==='Creating '+model.name||t.label==='Création de '+model.name)));
 const groups=tab==='uncreated'?trialBacklog(model):trialOutputGroups(model,tab==='posted');
 const empty=tab==='posted'?'Aucune variation marquée comme publiée pour l’instant.':'Tes variations non publiées s’afficheront ici dès qu’elles seront prêtes.';
 const resume=tab==='output'&&(model.canGenerate||model.approved)&&!model.complete?`<details class="trial-batch-resume" data-trial-detail="batch-resume"><summary>${model.batch?.remainingSources??model.posts} vidéos à terminer <span>Continuer dans le chat ${icon('arrow')}</span></summary>${promptBox('/trial-reels\nContinue les variations restantes pour '+model.name+'. Utilise la demande de série enregistrée ou la validation du test, et les originaux associés. Fais-en '+(model.variationTarget||4)+' par vidéo choisie, en comptant les variations déjà terminées, chacune avec la légende d’origine légèrement reformulée. Garde les rendus terminés et ajoute les légendes manquantes. Reprends le travail inachevé et montre ce qui manque si un original n’est pas disponible.')}</details>`:'';
 return `<div class="trial-detail trial-output-section">${nav}${trialTaskView(activeTask)}<p class="inline-alert" data-trial-error="${esc(model.id)}" role="alert">${esc(trialInputDraft(model.id).error)}</p><section aria-label="${tabs.find(([key])=>key===tab)[1]}" data-trial-view="${tab}">${groups||`<p class="small" role="status">${empty}</p>`}${resume}</section></div>`;
}
function trialDetail(f,id=null) {
 const models=snapshot.trial?.formats||[];
 if(!id||waiting(f)||!models.length)return trialHome(f);
 const model=models.find(m=>m.id===id);if(!model)return trialHome(f);
 const d=trialInputDraft(id);
 if(d.roundId!==model.roundId){d.roundId=model.roundId;d.more=false;d.need='';d.error='';}
 if(d.adding)return `<div class="trial-detail">${heading('Ajoute tes vidéos','Colle les liens de tes reels Instagram, un par ligne.')}<label class="field"><span class="sr-only">Liens des reels Instagram</span><textarea data-trial-links="${esc(id)}" rows="5" placeholder="https://www.instagram.com/reel/…">${esc(d.links||'')}</textarea></label><p class="inline-alert" data-trial-error="${esc(id)}" role="alert">${esc(d.error)}</p><div class="flow-footer"><button class="btn ghost" data-trial-cancel="${esc(id)}">Annuler</button><button class="btn primary" data-trial-request="${esc(id)}">Ajouter les vidéos</button></div></div>`;
 const uploading=(trialUploads.get(id)||[]).some(j=>j.roundId===model.roundId&&j.status!=='done');
 if(model.screen==='inputs'||d.more||uploading)return `<div class="trial-detail">${trialInputs(model)}</div>`;
 if(model.screen==='study'){
  const task=(snapshot.tasks||[]).find(t=>t.status!=='done'&&(t.project&&model.projectIds.includes(t.project)||t.id===model.studyTaskId||t.id==='trial-study'&&String(t.label).includes(model.name)));
  return `<div class="trial-detail trial-single-job">${heading(model.title)}${trialTaskView(task)}${!task||task.stale||task.status!=='running'?promptBox(model.studied?model.prompt+'\nL’étude est enregistrée. Repars de là et fais le test.':model.prompt):''}${!model.studied?`<button class="btn ghost small-btn" data-trial-more="${esc(id)}">Ajouter ou retirer des fichiers</button>`:''}</div>`;
 }
 if(model.screen==='test'){
  const first=snapshot.projects.find(p=>p.id===model.firstProjectId),test=model.outputGroups.flatMap(g=>g.outputs).find(o=>o.projectId===model.firstProjectId)||first?.files?.find(o=>o.kind==='video');
  const original=model.examples.find(e=>e.id===first?.data?.source_post)||model.examples[0];
  const originalVideo=original?.video?`<video src="${esc(original.video.url)}" ${original.thumbnail?`poster="${esc(original.thumbnail.url)}"`:''} controls playsinline preload="metadata" aria-label="Vidéo d’origine"></video>`:trialImage(original);
  const trialVideo=test?`<video src="${esc(test.url)}" ${test.cover?.url?`poster="${esc(test.cover.url)}"`:''} controls playsinline preload="metadata" aria-label="Trial reel de test"></video>`:'<div class="trial-test-pending">Ton test s’affichera ici.</div>';
  return `<div class="trial-detail trial-test-page">${heading('Trial reel de test')}<div class="trial-test"><figure class="trial-test-original"><figcaption>${original?.permalink?`<a href="${esc(original.permalink)}" target="_blank" rel="noreferrer">Original ↗</a>`:'Original'}</figcaption>${originalVideo}${trialCaption(model,original,{source:true})}</figure><span class="trial-test-arrow" aria-hidden="true">${icon('arrow')}</span><figure class="trial-test-result"><figcaption>Trial reel</figcaption>${trialVideo}${trialCaption(model,test)}</figure></div><div class="trial-test-handoff">${promptBox(model.testPrompt)}</div><p class="inline-alert" data-trial-error="${esc(id)}" role="alert">${esc(d.error)}</p></div>`;
 }
 return trialOutputPage(f,model);
}
function trialBytes(bytes){return bytes<1e6?`${Math.max(1,Math.round(bytes/1e3))} Ko`:`${(bytes/1e6).toFixed(bytes<1e7?1:0).replace(".",",")} Mo`;}
function trialTransferRows(jobs){return jobs.filter(j=>j.status!=='done').map(j=>`<div class="trial-transfer"><div><span>${esc(j.name)}</span><span class="tiny">${j.status==='error'?esc(j.error):j.status==='saving'?'Enregistrement…':`${Math.round(j.progress||0)} %`}</span></div>${j.status==='uploading'?`<progress max="100" value="${j.progress||0}" aria-label="Envoi de ${esc(j.name)}"></progress>`:''}${j.status==='error'?`<button class="btn ghost small-btn" data-trial-retry="${j.id}" data-model="${esc(j.modelId)}">Réessayer</button>`:''}</div>`).join('');}
function trialTransfersUpdate(id){const host=document.querySelector(`[data-transfers="${CSS.escape(id)}"]`);if(host)host.innerHTML=trialTransferRows(trialUploads.get(id)||[]);}
async function trialChange(body) {
 if(preview){if(window.MOTIONLAB_PREVIEW.changeTrial)return window.MOTIONLAB_PREVIEW.changeTrial(body);throw Error('Ceci est l’aperçu. Ajoute tes fichiers dans ton espace de travail installé.');}
 const response=await fetch('/api/trial-inputs',{method:'POST',headers:{'Content-Type':'application/json','X-MotionLab-Write':'inputs'},body:JSON.stringify(body)});
 const value=await response.json();if(!response.ok)throw Error(value.error||'Impossible d’enregistrer ce fichier.');return value;
}
function trialInputError(id,message){trialInputDraft(id).error=message;const el=document.querySelector(`[data-trial-error="${CSS.escape(id)}"]`);if(el)el.textContent=message;persist();}
async function trialSend(job) {
 job.status='uploading';job.progress=0;trialTransfersUpdate(job.modelId);
 try {
  if(preview){if(window.MOTIONLAB_PREVIEW.changeTrial)return window.MOTIONLAB_PREVIEW.changeTrial(body);throw Error('Ceci est l’aperçu. Ajoute tes fichiers dans ton espace de travail installé.');}
  await new Promise((accept,reject)=>{
   const xhr=new XMLHttpRequest(),params=new URLSearchParams({format:job.modelId,need:job.needId,name:job.name,round:job.roundId||''});
   xhr.open('PUT','/api/trial-inputs?'+params);xhr.setRequestHeader('X-MotionLab-Write','inputs');
   xhr.upload.onprogress=e=>{if(e.lengthComputable){job.progress=e.loaded/e.total*100;if(e.loaded===e.total)job.status='saving';trialTransfersUpdate(job.modelId);}};
   xhr.onload=()=>{let value;try{value=JSON.parse(xhr.responseText);}catch{}if(xhr.status>=200&&xhr.status<300)accept(value);else reject(Error(value?.error||'Échec de l’envoi. Réessaie ce fichier.'));};
   xhr.onerror=()=>reject(Error('Connexion perdue. Réessaie ce fichier.'));xhr.onabort=()=>reject(Error('Envoi interrompu. Réessaie ce fichier.'));xhr.send(job.file);
  });
  job.status='done';job.file=null;await client.refresh();
 } catch(error){job.status='error';job.error=error.message;}
 trialTransfersUpdate(job.modelId);
}
async function trialAddFiles(id,files) {
 const model=snapshot.trial.formats.find(m=>m.id===id);if(!model)return;
 const needId=trialInputDraft(id).need||(model.needs.length===1?model.needs[0].id:'');
 const jobs=Array.from(files).map(file=>({id:crypto.randomUUID(),modelId:id,needId,roundId:model.roundId,file:file.file||file,name:file.relativePath||file.webkitRelativePath||file.name,status:'queued'}));
 trialUploads.set(id,[...(trialUploads.get(id)||[]),...jobs]);trialTransfersUpdate(id);
 // Stream two files at a time. A folder never has to fit in browser or server memory.
 let next=0;await Promise.all([0,1].map(async()=>{while(next<jobs.length)await trialSend(jobs[next++]);}));
 trialInputDraft(id).more=false;render(true);
}
async function trialDropFiles(items) {
 async function walk(entry,prefix='') {
  if(entry.isFile)return [await new Promise((accept,reject)=>entry.file(file=>accept({file,relativePath:prefix+file.name}),reject))];
  if(!entry.isDirectory)return [];
  const reader=entry.createReader(),children=[];let batch;
  do{batch=await new Promise((accept,reject)=>reader.readEntries(accept,reject));children.push(...batch);}while(batch.length);
  const results=[];for(const child of children)results.push(...await walk(child,prefix+entry.name+'/'));return results;
 }
 const entries=Array.from(items).map(i=>i.webkitGetAsEntry?.()).filter(Boolean),files=[];
 for(const entry of entries)files.push(...await walk(entry));return files;
}
function promptBox(text) {return `<pre class="prompt-box" id="prompt-text">${esc(text)}</pre>${button('Copier le prompt','copy-prompt','primary','copy')}<p class="helper-note">Colle-le dans le chat ouvert dans ton dossier MotionLab.</p>`;}
function footagePrompt(d) {
 return (d.files||[]).map(file=>file.path?`Utilise ${JSON.stringify(file.path)}.`:`Je joins ${JSON.stringify(file.name)}. Place-le dans workspace/input avant de commencer.`).join('\n');
}
function makePrompt(f,mode='new') {
 const d=draft(f.id), isSetup=mode==='setup';
 if(f.id==='beat-montage')return mode==='new'?`Fais ${Number(d.quantity)||1} beat montage${Number(d.quantity)>1?'s':''}${d.montageId?' avec mon montage enregistré '+d.montageId:''}.`:'Analyse mes clips Beat Montage.';
 if(mode==='material')return [f.command,footagePrompt(d),((d.files||[]).length?'Ajoute ces originaux à ma bibliothèque '+f.name+' enregistrée.':'Vérifie les rushes déjà présents dans ma bibliothèque '+f.name+'.')+' Garde mes réglages et mon look actuels. Termine l’import'+(f.id==='phone'?' et mesure la place du texte sur chaque plan':'')+', puis montre l’action suivante dans mon espace de travail.'].filter(Boolean).join('\n\n');
 let lines=[f.command+(isSetup?' setup':''),footagePrompt(d)];
 if(f.pack==='quick-cuts')lines.push('Lis d’abord mes fichiers partagés context/answers.json, profile.md et voice.md. Réutilise mon audience enregistrée et ce sur quoi elle a besoin d’aide, pour tous les formats. Demande seulement ce qui est encore inconnu, une courte question à la fois. Enregistre les nouvelles réponses partagées dans context/answers.json et mets à jour profile.md ; ne garde dans les réglages de ce format que les choix de look et de rushes. Ne repose jamais une question de contexte déjà répondue.');
 if(f.id==='talking-head'&&f.style&&f.style!=='classic'&&!isSetup)return ['/'+talkingStyleSkill(f),footagePrompt(d),d.transcribe?'Transcris les rushes bruts.':`Script :\n${d.transcript||''}`,splitVideoInstructions(talkingStyleSkill(f),f.style==='split'?null:f.style),'Montre l’avancement et la prochaine relecture dans mon espace de travail MotionLab. Ne publie jamais rien.'].filter(Boolean).join('\n\n');
 if(f.id==='talking-head') {
  lines.push('Utilise mon look et mes préférences Talking Head enregistrés, ou le look par défaut si rien n’est enregistré. Ne me demande pas de choisir un look.');
  if(!isSetup)lines.push(d.transcribe?'Transcris les rushes bruts.':`Script :\n${d.transcript||''}`,talkingVideoInstructions());
 } else if(isSetup) {
  const allowed=f.id==='beat-montage'?['subject','sounds','own_sounds','preset','layout','line_style']:f.id==='scroll-reel'?['shot','opening','face','accent','feel','cta','keyword','sounds']:['shots','placement','shape','cta','keyword','sounds'];
  const answers=Object.fromEntries(Object.entries(d).filter(([k,v])=>allowed.includes(k)&&v!==''&&v!=null));
  lines.push(`Mes choix de réglage : ${JSON.stringify(answers,null,2)}`,`Garde-les dans les réglages ${f.id} de workspace/library/quick-cuts.json. Utilise les rushes déjà présents dans ma bibliothèque. Vérifie ce qui manque et montre l’étape suivante ici. Ne me repose pas les choix déjà faits.`,f.id==='phone'?'Mesure la place du texte sur chaque plan et garde-le loin de mon visage.':'');
 } else {
  if(f.id==='trial-reels'&&d.source)lines.push('Décline la source enregistrée '+JSON.stringify(d.source)+'.');
  lines.push(`Fais ${Number(d.quantity)||1} vidéo${Number(d.quantity)>1?'s':''} ${f.name} avec mes réglages et préférences enregistrés.`,d.topic?`Brief : ${d.topic}`:f.id==='beat-montage'?'Réutilise mes rushes et sons enregistrés.':f.id==='trial-reels'?'Utilise ma sélection de sources enregistrée et les originaux correspondants.':'Choisis le sujet à partir du contexte de mon compte.',f.id==='trial-reels'?'Utilise les originaux non montés et montre la première variation avant de faire les autres.':'Montre la première version pour que je la relise.');
 }
 if(!snapshot.account.done&&f.id!=='trial-reels')lines.push('La lecture de mon compte est peut-être encore en cours. Continue le travail que ces fichiers permettent ; demande un court brief seulement si une décision d’écriture l’exige.');
 lines.push('Montre l’avancement et la prochaine relecture dans mon espace de travail MotionLab. Ne publie jamais rien.');
 return lines.filter(Boolean).join('\n\n');
}
function handoff(f,setup=false,material=false) {
 return `<div class="center-flow">${f.id==='talking-head'&&!setup?progress(f,'prompt',!setupDone(f)):''}<div class="handoff-icon">${icon('agent')}</div>${heading(setup?'Tes choix, prêts à être enregistrés.':'Ton prompt est prêt.','Copie-le, puis colle-le dans le chat.')}<div class="sample-banner">${icon(labels[f.id]?.[0])}${esc(f.name)}</div>${!(f.id==='talking-head'&&setup)&&(draft(f.id).files||[]).some(x=>!x.path)?'<p class="small">Joins les rushes choisis avec ton prompt.</p>':''}${promptBox(makePrompt(f,material?'material':setup?'setup':'new'))}<div class="flow-footer">${link('Retour à '+f.name,base(f),'ghost')}</div></div>`;
}
// Every Markdown surface uses the same file editor and the same revision check.
const documentKey = path => 'pref:'+path;
function knownDocument(path){return documents.get(path)||snapshot.preferences.find(p=>p.path===path)||snapshot.contextDocuments?.find(p=>p.path===path);}
function documentState(path){
 const saved=knownDocument(path),key=documentKey(path);
 if(!saved)return null;
 drafts[key]??={text:saved.text||'',base:saved.text||'',revision:saved.revision,editing:false};
 const d=drafts[key];
 if(d.revision===undefined&&d.base===saved.text)d.revision=saved.revision;
 if(!d.editing&&!d.saving&&d.text===d.base){d.text=saved.text;d.base=saved.text;d.revision=saved.revision;}
 return d;
}
function activeDocumentPath(){
 if(view?.kind==='preferences')return view.f?.preferencesPath||'context/preferences.md';
 if(['markdown','reading'].includes(view?.kind))return searchParams().get('file');
 return null;
}
function mergeDocument(doc){
 documents.set(doc.path,doc);
 const d=drafts[documentKey(doc.path)];
 if(d&&!d.saving){
  if(d.text===doc.text||(!d.editing&&d.text===d.base)){
   d.text=doc.text;d.base=doc.text;d.revision=doc.revision;d.conflict=null;d.error='';
  }else if(d.base===doc.text&&(d.revision===undefined||d.revision===doc.revision)){
   d.revision=doc.revision;d.conflict=null;
  }else if(d.revision!==doc.revision){d.conflict=doc;}
 }
}
async function readDocument(path,{force=false}={}){
 if(documentRequests.has(path))return documentRequests.get(path);
 const epoch=documentEpochs.get(path)||0,workspace=snapshot.workspaceId;
 const promise=(async()=>{
  try{
   const doc=preview?await window.MOTIONLAB_PREVIEW.readMarkdown(path):await fetch('/api/markdown?path='+encodeURIComponent(path),{cache:'no-store',signal:AbortSignal.timeout(10000)}).then(async r=>{const body=await r.json();if(!r.ok)throw Error(body.error||'Impossible de lire ce fichier.');return body;});
   if(snapshot.workspaceId!==workspace||(documentEpochs.get(path)||0)!==epoch)return;
   if(drafts[documentKey(path)]?.saving)return;
   mergeDocument(doc);
   if(activeDocumentPath()===path){const d=documentState(path);if(d?.editing)updateDocumentStatus(path);else{const y=scrollY;render();scrollTo(0,y);}}
  }catch(e){
   if(snapshot.workspaceId!==workspace)return;
   const d=drafts[documentKey(path)];
   if(d){d.error='Impossible de lire ce fichier. Ton brouillon est conservé.';updateDocumentStatus(path);}
   else if(activeDocumentPath()===path){const target=$('#document-loading');if(target)target.innerHTML=`<p class="inline-alert">${esc(e.message)}</p>${button('Réessayer','retry-document','')}`;}
  }
 })();
 documentRequests.set(path,promise);
 try{await promise;}finally{if(documentRequests.get(path)===promise)documentRequests.delete(path);}
}
function editorStatus(d){
 if(d.saving)return 'Enregistrement…';
 if(d.error)return d.error;
 if(d.conflict)return 'Ce fichier a changé ailleurs. Ton brouillon est conservé.';
 if(d.text!==d.base)return 'Modifications non enregistrées';
 if(d.revision==null)return 'Pas encore enregistré';
 return preview?'Enregistré dans cet aperçu':'Enregistré dans ton dossier';
}
function updateDocumentStatus(path){
 if(activeDocumentPath()!==path)return;
 const d=documentState(path);if(!d)return;
 const status=$('#document-status');if(status){status.textContent=editorStatus(d);status.classList.toggle('inline-alert',Boolean(d.error||d.conflict));}
 const save=$('[data-action="save-document"]');if(save){save.disabled=Boolean(d.saving);save.textContent=d.saving?'Enregistrement…':d.conflict?'Enregistrer ma version':'Enregistrer';}
 const conflict=$('#document-conflict');
 if(conflict){conflict.hidden=!d.conflict;const latest=conflict.querySelector('pre');if(latest)latest.textContent=d.conflict?.text||'';}
}
function preferenceSyncNotice(owner){return owner?.preferencesSync?.changed?`<div class="sample-banner"><span>Ton fichier est enregistré. Applique ses changements de look aux prochaines vidéos.</span>${button('Copier le prompt de mise à jour','sync-preferences:'+owner.id,'small-btn','copy')}</div>`:'';}
function documentEditor(path,{title,subtitle='Un fichier qui t’appartient.',back='',extras=''}={}){
 const saved=knownDocument(path);
 if(!saved){queueMicrotask(()=>readDocument(path));return heading(title||path.split('/').pop(),subtitle,back)+`<div id="document-loading"><div class="skeleton"></div><p class="tiny">Ouverture de ton fichier…</p></div>`;}
 if(!documents.has(path))documents.set(path,saved);
 const d=documentState(path),key=documentKey(path);
 const owner=snapshot.formats.find(f=>f.preferencesPath===path);
 const syncNotice=`<div id="document-look-sync">${preferenceSyncNotice(owner)}</div>`;
 return syncNotice+heading(title||saved.name||path.split('/').pop(),subtitle,button(d.editing?'Lire le fichier':'Modifier le fichier','toggle-pref','','settings'))+`<p class="file-path">${esc(path)}</p>${d.editing?`<label class="field" style="margin-top:25px"><span>Ton texte</span><textarea id="preference-editor" data-pref="${esc(key)}" rows="15" placeholder="Écris ce qui compte pour toi.">${esc(d.text)}</textarea></label><div class="button-row">${button(d.conflict?'Enregistrer ma version':'Enregistrer','save-document','primary','check')}${button('Reprendre le fichier enregistré','reset-pref','ghost')}${button('Télécharger le fichier','download-pref','ghost')}</div><p class="helper-note" id="document-status" role="status">${esc(editorStatus(d))}</p><details id="document-conflict" ${d.conflict?'':'hidden'}><summary>Comparer avec le fichier enregistré</summary><pre class="readable-file">${esc(d.conflict?.text||'')}</pre></details>`:`${saved.text?`<pre class="readable-file">${esc(saved.text)}</pre>`:empty('Une page vierge','Ajoute ce qui compte pour toi.')}<div class="button-row">${button('Modifier le fichier','toggle-pref','','settings')}${button('Télécharger le fichier','download-pref','ghost')}</div>`}${back?`<div class="flow-footer">${back}</div>`:''}${extras}`;
}
function preferences(f){
 const path=f?.preferencesPath||'context/preferences.md';
 const extras=(f?.preferencesPath==='workspace/library/quick-cuts.preferences.md'?'<p class="helper-note">Partagé par tes formats Quick Cuts. Nomme le format quand une préférence lui est propre.</p>':'')+(!f?`<div class="section-title" style="margin-top:45px">Préférences des formats</div>${snapshot.formats.map(x=>`<div class="file-row">${icon(labels[x.id]?.[0])}<div>${esc(x.name)}</div>${link('Lire le fichier',base(x)+'/preferences','small-btn')}</div>`).join('')}`:'');
 return documentEditor(path,{title:f?'Préférences '+f.name:'Tes préférences',subtitle:'Tes goûts, dans un fichier qui t’appartient.',extras});
}
async function saveDocument(){
 const path=activeDocumentPath(),d=documentState(path);if(!d||d.saving)return;
 // A second click after comparing a conflict explicitly saves this version.
 const revision=d.conflict?d.conflict.revision:d.revision;
 if(revision===undefined){await readDocument(path,{force:true});updateDocumentStatus(path);return;}
 const text=d.text,workspace=snapshot.workspaceId;
 d.saving=true;d.error='';documentEpochs.set(path,(documentEpochs.get(path)||0)+1);updateDocumentStatus(path);
 try{
  let doc;
  if(preview)doc=await window.MOTIONLAB_PREVIEW.saveMarkdown({path,text,revision});
  else{
   const response=await fetch('/api/markdown',{method:'PUT',headers:{'Content-Type':'application/json','X-MotionLab-Write':'markdown'},body:JSON.stringify({path,text,revision}),signal:AbortSignal.timeout(15000)});
   const body=await response.json();
   if(response.status===409){d.conflict=body.document;throw Error('Ce fichier a changé ailleurs. Compare-le avec le fichier enregistré, puis enregistre ta version.');}
   if(!response.ok)throw Error(body.error||'Impossible d’enregistrer. Ton brouillon est conservé.');
   doc=body;
  }
  if(snapshot.workspaceId!==workspace)return;
  documents.set(path,doc);d.base=doc.text;d.revision=doc.revision;d.conflict=null;d.error='';
  // Typing during a save belongs to the next save; do not replace the editor node.
  persist();toast(preview?'Enregistré dans cet aperçu.':'Enregistré dans ton dossier.');
  if(client.pending)await client.pending;
  await client.refresh();
 }catch(e){if(snapshot.workspaceId===workspace)d.error=['TypeError','AbortError','TimeoutError'].includes(e.name)?'Impossible d’atteindre ton dossier. Ton brouillon est conservé.':e.message||'Impossible d’enregistrer. Ton brouillon est conservé.';}
 finally{d.saving=false;if(snapshot.workspaceId===workspace){persist();updateDocumentStatus(path);if(activeDocumentPath()===path&&!d.editing)render();}}
}
function fileRows(files) {return files.map(file=>`<div class="file-row">${icon(['page','markdown'].includes(file.kind)?'file':'folder')}<div>${esc(file.name)}<span class="tiny">${esc(file.path)}</span></div>${file.kind==='page'?link('Ouvrir','/pages?file='+encodeURIComponent(file.path),'small-btn'):link('Voir','/files?file='+encodeURIComponent(file.path),'small-btn')}</div>`).join('');}
function searchParams() {const path=dataPath();return preview&&location.protocol==='file:'?new URLSearchParams(path.split('?')[1]||''):new URLSearchParams(location.search);}
function fileFormat() {
 const path=searchParams().get('file');if(!path)return null;
 const id=searchParams().get('format')||snapshot.files.find(f=>f.path===path)?.format||snapshot.projects.find(p=>path.startsWith(p.path+'/'))?.format||snapshot.formats.find(f=>f.preferencesPath===path)?.id;
 return format(id);
}
const editClipButton = (file, text='Modifier') => `<span class="edit-entry">${button(text,'edit-clip:'+file.path,'small-btn','edit')}<span class="edit-phone tiny">Modifie sur un ordinateur</span></span>`;
// The buyer's own clips, each one a new video in the editor in one click.
function clipShelf() {
 const clips=preview?[]:snapshot.files.filter(f=>f.kind==='video'&&f.path.startsWith('workspace/input/')).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,24);
 return clips.length?`<section class="clip-shelf"><div class="section-title">Tes clips</div><p class="inline-alert" id="form-error" role="alert"></p><div class="output-grid">${clips.map(file=>`<article class="output-card"><video src="${esc(file.url)}" controls playsinline preload="metadata" aria-label="${esc(file.name)}"></video><a href="${esc(href('/files?file='+encodeURIComponent(file.path)))}" data-route="${esc('/files?file='+encodeURIComponent(file.path))}">${esc(file.name)}</a><span class="tiny">${esc(date(file.updatedAt))}</span>${editClipButton(file)}</article>`).join('')}</div></section>`:'';
}
function documentFiles() {return [...new Map([...(snapshot.markdownFiles||[]),...(snapshot.preferences||[])].map(file=>[file.path,file])).values()];}
function filesPage() {
 const chosen=searchParams().get('file');
 if(chosen&&/\.md$/i.test(chosen))return documentEditor(chosen,{back:link('Tous les documents','/files','ghost')});
 if(chosen){const file=snapshot.files.find(f=>f.path===chosen);return heading(file?.name||'Fichier indisponible','',link('Tous les documents','/files','ghost'))+(file?`<div class="media-grid"><figure>${media(file)}<figcaption>${esc(file.path)}</figcaption></figure></div><div class="button-row"><a class="btn" href="${esc(file.url)}" download>Télécharger le fichier</a>${file.kind==='video'&&!preview?editClipButton(file,'Modifier ce clip'):''}</div><p class="inline-alert" id="form-error" role="alert"></p>`:empty('Ce fichier a été déplacé','Retourne à tes fichiers pour trouver la dernière version.'));}
 return heading('Tes documents')+documentShelf(documentFiles(),{href,formats:snapshot.formats,query:drafts.documentQuery||''})+clipShelf();
}
function pageView() {
 const file=snapshot.files.find(f=>f.path===searchParams().get('file')&&f.kind==='page');
 return heading(file?.path==='workspace/trial-reels-review.html'?'La lecture enregistrée de ton compte':file?.name||'Page indisponible','',file?.format==='trial-reels'?link('Retour aux formats','/formats/trial-reels','ghost','back'):link('Documents','/files','ghost'))+(file?`<iframe class="page-frame" src="${esc(file.url)}" title="${esc(file.name)}" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe><p class="helper-note">Relis ici, puis donne tes choix dans le chat.</p>`:empty('Cette page a été déplacée','Retourne à ton format pour sa dernière relecture.'));
}
function videoSteps(p) {
 if(p.format!=='talking-head')return '';
 if(!p.steps?.length)return `<aside class="video-checklist">${empty('Étapes non enregistrées','Continue dans le chat pour vérifier l’avancement de cette vidéo.')}${button('Copier le prompt de reprise','resume:'+p.id,'primary','copy')}</aside>`;
 const working=(snapshot.tasks||[]).some(task=>[p.id,p.path].includes(task.project)&&task.status==='running'&&!task.stale);
 return `<aside class="video-checklist"><div class="section-title">Cette vidéo <span>${Number(p.progress?.completed)||0} / ${Number(p.progress?.total)||p.steps.length}</span></div><ol>${p.steps.map((step,i)=>`<li data-state="${esc(step.status)}" ${step.status==='current'?'aria-current="step"':''}><span class="step-marker">${step.status==='done'?icon('check'):i+1}</span><div><strong>${esc(step.label)}</strong><span class="tiny">${esc(step.status==='done'?'Terminé':step.status==='current'?step.owner==='you'?'À toi de valider':working?'L’agent travaille':'Prochaine étape pour ton agent':'Plus tard')}</span>${step.status==='current'&&step.reason?`<p class="tiny">${esc(step.reason)}</p>`:''}</div></li>`).join('')}</ol>${finished(p)?'':button('Copier le prompt pour continuer','resume:'+p.id,'primary','copy')}</aside>`;
}
function projectView(id) {
 const p=snapshot.projects.find(x=>x.id===id);
 if(!p)return heading('Projet indisponible')+link('Accueil','/','primary');
 if(p.format==='full-visual')return editBar(p)+fullVisualProject(p,format('full-visual'),draft('full-visual'),fvDraft(p.id),{esc,heading,button,link});
 if(p.format==='product-demo')return editBar(p)+productDemoProject(p,{esc,heading,link,button},snapshot.tasks);
 if(p.format==='edit')return editProjectView(p);
 const files=p.files||[];
 const featured=p.preview||null;
 const extras=files.filter(f=>['image','video'].includes(f.kind)&&f.path!==featured?.path);
 const visualPlan=p.format==='talking-head'&&(files.find(file=>file.path===p.path+'/visual-plan.md')||files.find(file=>file.path===p.path+'/plan.md'));
 return heading(p.name,'',`<div class="button-row">${visualPlan?link('Lire le plan visuel','/files?file='+encodeURIComponent(visualPlan.path)+'&format=talking-head','','file'):''}${canEdit(p)?editLink(p.id,'Modifier la vidéo',finished(p)?'primary':''):''}</div>`)+`<div class="video-workspace"><div class="video-review">${editExportNote(p)}${featured?`<figure class="video-feature">${media(featured)}</figure>`:empty('Ton prochain aperçu est en préparation','Copie le prompt de l’étape suivante pour continuer dans le chat.')+button('Copier le prompt de l’étape suivante','resume:'+p.id,'primary','copy')}${extras.length?`<details class="previous-media"><summary>Autres fichiers enregistrés</summary><div class="media-grid">${extras.map(file=>`<figure>${media(file)}<figcaption>${esc(file.name)}</figcaption></figure>`).join('')}</div></details>`:''}${fileRows(files.filter(x=>x.kind==='page'))}<div class="button-row">${button('Copier le prompt de relecture','review:'+p.id,'','copy')}${button('Copier le prompt de correction','revision:'+p.id,'ghost','copy')}</div></div>${videoSteps(p)}</div>`;
}
// A video made by hand in the editor: no format, no steps. Its page holds what it exported and the way back in.
function editProjectView(p) {
 const outputs=snapshot.outputs.filter(o=>o.projectId===p.id);
 return heading(p.name,p.edit?.editedAt?'Modifiée le '+date(p.edit.editedAt):'Ta propre vidéo.',canEdit(p)?editLink(p.id,'Modifier la vidéo','primary'):'')+editExportNote(p)+(outputs.length?`<section class="recent-outputs"><div class="section-title">Exportées</div>${outputCards(outputs)}</section>`:empty('Rien d’exporté pour l’instant','Modifie ta vidéo, puis exporte-la depuis l’éditeur.'));
}
const shapes=[['9:16',1080,1920,'Reel'],['1:1',1080,1080,'Carré'],['4:5',1080,1350,'Post'],['16:9',1920,1080,'Large']];
function newVideoPage() {
 const d=drafts.newVideo||={name:'',shape:'9:16'};
 return `<div class="center-flow new-video">${heading('Nouvelle vidéo','Donne-lui un nom et choisis un format d’image.')}<label class="field"><span>Nom</span><input type="text" data-new-video="name" value="${esc(d.name)}" placeholder="Ma vidéo" maxlength="80"></label><div class="shape-picker" role="radiogroup" aria-label="Format d’image">${shapes.map(([id,w,h,name])=>`<button type="button" class="shape-option" role="radio" aria-checked="${d.shape===id}" data-action="new-video-shape:${id}"><i style="width:${Math.round(64*w/Math.max(w,h))}px;height:${Math.round(64*h/Math.max(w,h))}px"></i><strong>${id}</strong><span class="tiny">${name}</span></button>`).join('')}</div><p class="inline-alert" id="form-error" role="alert">${esc(d.error||'')}</p><div class="edit-entry">${button(creatingEdit?'Ouverture…':'Ouvrir l’éditeur','new-video-create','primary','arrow')}<span class="edit-phone tiny">Modifie sur un ordinateur</span></div></div>`;
}
// Both ways into a new edit go through the workspace, which makes the project folder and its empty timeline, or one
// holding the chosen clip. The editor then opens on it.
async function createEdit(body) {
 const response=await fetch('/api/edit/new',{method:'POST',headers:{'Content-Type':'application/json','X-MotionLab-Write':'edit'},body:JSON.stringify(body)});
 const value=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(value.error||'Impossible de créer cette vidéo.');
 const id=value.project?.id??value.id??value.project;
 if(typeof id!=='string')throw Error('Impossible de créer cette vidéo.');
 location.href=editHref(id);
}
function accountOptions(){const q=searchParams();return {tab:['posts','notes'].includes(q.get('tab'))?q.get('tab'):'overview',range:['30','90','all'].includes(q.get('range'))?q.get('range'):'90',metric:['views','reach','saves','shares','comments','likes'].includes(q.get('metric'))?q.get('metric'):['views','likes','comments','reach'].find(key=>snapshot.account.posts?.some(p=>typeof p.metrics?.[key]==='number'&&Number.isFinite(p.metrics[key])))||'views',selected:drafts.accountSelectedPost};}
function evidenceUI(){return {esc,icon,link,button,date,heading,empty,href,preview};}
function accountPage(){return accountScreen(snapshot,evidenceUI(),accountOptions());}
function activityPage(){const q=searchParams();return activityScreen(snapshot,evidenceUI(),{filter:['attention','active','done'].includes(q.get('status'))?q.get('status'):'all',formatFilter:q.get('format')||'all',connected:lastStatus==='connected'});}
function accountRefresh(){return `<div class="account-page">${heading('Actualiser ton compte','Fais entrer tes derniers posts dans ta prochaine vidéo.',link('Retour au compte','/account','ghost'))}<div class="account-empty"><h2>Mettre à jour ce que MotionLab sait</h2><p>Ton agent lit tes dernières légendes et quelques aperçus, puis met à jour les notes du compte utilisées par tous tes formats.</p></div><div class="account-prompt">${promptBox('/start\nActualise mon compte.')}<p class="helper-note">Le détail de l’audience, le texte des commentaires et l’analyse du temps de visionnage demandent une lecture à part. Les statistiques manquantes restent non renseignées.</p></div></div>`;}

function questionsPage(){
 const qs=snapshot.account.questions||[],d=drafts.accountAnswers||{};
 const q=qs.find(q=>q.id===drafts.accountQuestion)||qs[0],index=qs.indexOf(q);
 if(!q)return `<div class="center-flow">${heading('Rien à répondre','Ton contexte enregistré sert à tous les formats.')}${link('Retour à l’Accueil','/','primary')}</div>`;
 return `<div class="center-flow">${heading(q.ask,'Une seule réponse, enregistrée pour tous les formats.')}${qs.length>1?`<p class="tiny">${index+1} sur ${qs.length}</p>`:''}${q.options?.length?`<div class="button-row" style="margin-bottom:20px">${q.options.slice(0,3).map((option,i)=>`<button class="btn ${d[q.id]===option?'primary':''}" data-action="answer-option:${i}" aria-pressed="${d[q.id]===option}">${esc(option)}</button>`).join('')}</div>`:''}<label class="field"><span>${q.options?.length?'Choisis ci-dessus, ou écris ta réponse':'Ta réponse'}</span><textarea rows="3" style="min-height:100px" data-question="${esc(q.id)}">${esc(d[q.id]||'')}</textarea></label><p class="inline-alert" id="form-error" role="alert"></p><div class="flow-footer">${index>0?button('Retour','question-back','ghost'):link('Retour','/setup','ghost')}${index<qs.length-1?button('Continuer','question-next','primary','arrow'):button('Copier les réponses','copy-answers','primary','copy')}</div><p class="helper-note">${index<qs.length-1?'Tes réponses restent ici pendant que tu continues.':'Colle tes réponses dans le chat. Ton agent les enregistre pour tous les formats.'}</p></div>`;
}
function contextLinks(){return (snapshot.contextDocuments||[]).length?`<div class="section-title" style="margin-top:32px">Ce que ton compte nous apprend</div>${snapshot.contextDocuments.map(d=>`<div class="file-row">${icon('file')}<div>${esc(d.name)}</div>${link('Lire','/account/reading?file='+encodeURIComponent(d.path),'small-btn')}</div>`).join('')}`:'';}
function contextPage(){const path=searchParams().get('file');if(!path)return heading('La lecture de ton compte')+contextLinks();return documentEditor(path,{title:snapshot.contextDocuments?.find(d=>d.path===path)?.name,back:link('Retour au compte','/account','ghost')});}
function readbackPage(){return `<div class="center-flow">${heading('Est-ce que ça te ressemble ?','Une dernière vérification avant de finir la configuration de ton compte.')}<div class="stage-list">${(snapshot.account.readback||[]).map(line=>`<div class="stage-line"><span>${esc(line)}</span></div>`).join('')}</div>${snapshot.account.readback?.length?button('Copier la confirmation','confirm-account','primary','copy'):empty('Lecture de ton compte en cours','Le résumé s’affichera ici quand ton agent aura fini.')}<label class="field" style="margin-top:28px"><span>Quelque chose à corriger ?</span><textarea id="account-correction" style="min-height:100px">${esc(drafts.accountCorrection||'')}</textarea></label>${button('Copier la correction','correct-account','','copy')}${contextLinks()}</div>`;}

function listUI(){return {esc,icon,link,button,heading,empty,href,date,projectRows,outputCards,setupDone,navigate,copy,toast,persist,refresh:()=>client.refreshAfterWrite(),render:()=>{const y=scrollY;render(true);scrollTo(0,y);},params:searchParams(),preview,workspaceUrl:window.MOTIONLAB_PREVIEW?.workspaceUrl};}
function shotView(f,sub,project=null){const result=oneShotPage(f,snapshot,draft(f.id),sub,listUI(),project);return {f,sub,kind:'one-shot',shotPage:result.page,project:result.project,html:result.html};}
function listView(f,sub,project=null){const parent=draft(f.id),result=listReelPage(f,snapshot,parent,sub,listUI(),project);return {f,sub,kind:'list-reel',listPage:result.page,project:result.project,html:result.html};}

function resolveView() {
 const original=route().split('?')[0], path=snapshot.account.enabled===false&&original==='/'?original:onboardingRoute(original,snapshot.onboarding);
 if(path!==original)history.replaceState({scroll:0},'',href(path));
 if(/^\/onboarding(?:\/|$)/.test(path)||['/account/connect','/account/setup-prompt'].includes(path)){
  const entry=path.startsWith('/onboarding'),step=path.endsWith('/prompt')||path.endsWith('/setup-prompt')?'prompt':path.endsWith('/account')||path.endsWith('/connect')?'account':'welcome';
  return {kind:'onboarding',entry,step,html:onboardingView(step,snapshot,{esc,icon},entry)};
 }
 if(path==='/')return {kind:'home',html:home()};
 if(path==='/videos')return {kind:'videos',html:videoLibrary(snapshot,searchParams(),{esc,heading,link,outputCards,empty})};
 if(path==='/new-video')return {kind:'new-video',html:newVideoPage()};
 if(path==='/new'&&snapshot.formats.length===1&&snapshot.formats[0].id==='full-visual'){history.replaceState({scroll:0},'',href('/formats/full-visual/new'));const f=snapshot.formats[0];return {f,sub:'new',kind:'full-visual-new',html:fullVisualNew(draft(f.id),'new',{esc,heading,button,link})};}
 if(path==='/new')return {kind:'new-chooser',html:newChooser()};
 if(path==='/setup')return {kind:'account-setup',html:accountSetup()};
 if(path==='/setup/questions')return {kind:'questions',html:questionsPage()};
 if(path==='/setup/readback')return {kind:'readback',html:readbackPage()};
 if(path==='/account/refresh')return {kind:'account-refresh',html:accountRefresh()};
 if(path==='/account/reading')return {kind:'reading',html:contextPage()};
 if(path==='/files')return {f:fileFormat(),kind:/\.md$/i.test(searchParams().get('file')||'')?'markdown':'files',html:filesPage()};
 if(path==='/pages')return {f:fileFormat(),kind:'page',html:pageView()};
 if(path==='/preferences')return {kind:'preferences',html:preferences()};
 if(path==='/account')return {kind:'account',html:accountPage()};
 if(path==='/activity')return {kind:'activity',html:activityPage()};
 if(path.startsWith('/projects/')){const id=decodeURIComponent(path.slice(10)),p=snapshot.projects.find(p=>p.id===id);if(p?.format==='beat-montage'&&format('beat-montage')){const f=format('beat-montage'),sub='template/'+encodeURIComponent(p.beatMontage?.templateId||'square')+'/project/'+encodeURIComponent(p.id);return {kind:'beat-library',f,sub,html:editBar(p)+renderBeatLibrary(f,snapshot,sub,beatUI())};}if(p?.format==='phone'&&format('phone')){const shot=shotView(format('phone'),'project',p);return {...shot,html:editBar(p)+shot.html};}if(p?.format==='scroll-reel'&&format('scroll-reel')){const list=listView(format('scroll-reel'),'project',p);return {...list,html:editBar(p)+list.html};}return {kind:'project',f:format(p?.format),html:projectView(id)};}
 const match=path.match(/^\/formats\/([^/]+)(?:\/(.*))?$/);
 if(!match)return {kind:'unknown',html:heading('Page introuvable')+link('Accueil','/','primary')};
 const f=format(match[1]);
 if(!f)return {kind:'unknown',html:heading('Ce format n’est pas installé.')+link('Accueil','/','primary')};
 const sub=match[2]||'', result={f,sub};
 if(sub==='preferences')return {...result,kind:'preferences',html:preferences(f)};
 if(f.id==='product-demo'&&['setup','setup/prompt','new','new/films','new/process','new/prompt'].includes(sub)){
  if(sub.startsWith('setup')||!productVoiceReady(f))return {...result,kind:sub==='setup/prompt'?'product-demo-voice-prompt':'product-demo-voice',html:productVoicePage(f,draft(f.id),{esc,heading,field,button,link},sub==='setup/prompt'?sub:'setup')};
  return {...result,kind:'product-demo-new',html:productDemoForm(draft(f.id),{esc,heading,field,button,link},sub,f)};
 }
 if(f.id==='full-visual'&&['new','new/prompt'].includes(sub))return {...result,kind:'full-visual-new',html:fullVisualNew(draft(f.id),sub,{esc,heading,button,link})};
 if(f.id==='scroll-reel')return listView(f,sub);
 if(f.id==='phone')return shotView(f,sub);
 if(f.id==='beat-montage')return {...result,kind:'beat-library',html:renderBeatLibrary(f,snapshot,sub,beatUI())};
 if(f.id==='talking-head'&&sub==='create')return {...result,kind:'talking-create',html:talkingCreatePage(f,draft(f.id),{esc,heading,button,link})};
 if(f.id==='talking-head'&&(sub==='style'||!f.style))return {...result,kind:'talking-style',html:talkingStylePage(f,{esc,heading,button,link})};
 if(!sub)return {...result,kind:'format',html:(f.id==='talking-head'?`<p class="th-style-current">Style : <strong>${esc(talkingStyleName(f))}</strong>${link('Changer','/formats/talking-head/style','ghost small-btn')}</p>`:'')+detail(f)};
 if(f.id==='beat-montage'){
  if(sub==='craft')return {...result,kind:'beat-craft',html:beatCraftPage(f,beatDraft(),beatUI())};
  if(sub==='new'&&searchParams().get('montage'))draft(f.id).montageId=searchParams().get('montage');
  if(sub==='new'||sub==='new/prompt')return f.beatInputs?.ready?{...result,kind:'beat-new',html:beatNewPage(f,draft(f.id),beatUI())}:{...result,kind:'beat-inputs',html:beatInputsPage(f,snapshot,beatDraft(),beatUI())};
  if(['inputs','setup','setup/prompt','new/footage','material/prompt'].includes(sub))return {...result,kind:'beat-inputs',html:beatInputsPage(f,snapshot,beatDraft(),beatUI())};
 }
 if(f.id==='trial-reels' && (sub==='setup'||sub==='new'||sub.startsWith('models/')))return {...result,kind:'trial-format',html:trialDetail(f,sub.startsWith('models/')?decodeURIComponent(sub.slice(7)):null)};
 if(waiting(f))return {...result,kind:'waiting',html:heading('Ton compte passe en premier.','Trial Reels utilise les formats qui ont marché pour toi.')+tasksHTML(true)+link('Voir la configuration du compte','/setup','primary')};
 if(f.id==='talking-head'){
  if(sub==='new' || sub==='new/footage' || sub==='setup/footage' || sub==='setup'&&!setupDone(f)&&!selectedMedia(draft(f.id))&&!inputFiles(f).length)return {...result,kind:'footage',html:footage(f,!setupDone(f))};
  if(['setup','setup/look','look','captions'].includes(sub))return {...result,kind:'talking-captions',html:talkingCaptionsPage(f,draft(f.id),{esc,heading,button,link})};
  if(sub==='new/transcript')return {...result,kind:'transcript',html:transcript(f)};
  if(sub==='new/prompt'||sub==='setup/prompt')return {...result,kind:'prompt',html:handoff(f,sub==='setup/prompt')};
 }else{
  if(sub==='material/prompt')return {...result,kind:'prompt',html:handoff(f,false,true)};
  if(sub==='setup/prompt')return {...result,kind:'prompt',html:handoff(f,true)};
  if(sub==='new/prompt')return {...result,kind:'prompt',html:handoff(f)};
  if(sub==='setup'||sub==='new'&&!setupDone(f))return {...result,kind:'quick-setup',html:f.id==='trial-reels'?trialDetail(f):quickSetup(f)};
  if(sub==='new/footage')return {...result,kind:'footage',html:footage(f)};
  if(sub==='new'&&f.materialKnown&&!f.materialReady)return {...result,kind:'footage',html:footage(f)};
  if(sub==='new')return {...result,kind:'quick-new',html:quickNew(f)};
 }
 return {...result,kind:'unknown',html:heading('Page introuvable')+link('Retour à '+f.name,base(f),'primary')};
}
function render(preserveMedia=false) {
 if(!snapshot)return;
 registerPromptSkills(snapshot.formats);
 const shotFocus=preserveMedia&&document.activeElement?.dataset.shotField?{field:document.activeElement.dataset.shotField,start:document.activeElement.selectionStart,end:document.activeElement.selectionEnd}:null;
 const shotDetails=preserveMedia?Array.from(document.querySelectorAll('[data-shot-detail][open]'),el=>el.dataset.shotDetail):[];
 const listFocus=preserveMedia&&document.activeElement?.closest('.lr')?{field:document.activeElement.dataset.listField,card:document.activeElement.dataset.listCard,cardField:document.activeElement.dataset.cardField,start:document.activeElement.selectionStart,end:document.activeElement.selectionEnd}:null;
 const listDetails=preserveMedia?Array.from(document.querySelectorAll('[data-list-detail][open]'),el=>el.dataset.listDetail):[];
 listController?.destroy();listController=null;oneShotController?.destroy();oneShotController=null;
 documentMotion?.destroy();documentMotion=null;
 look?.destroy();look=null;
 if(!$('#stage'))shell();
 const referenceFocus=preserveMedia&&document.activeElement?.dataset.beatLink?{id:document.activeElement.dataset.beatLink,start:document.activeElement.selectionStart,end:document.activeElement.selectionEnd}:null;
 const montageFocus=preserveMedia&&document.activeElement?.closest('.bm-library')?{field:document.activeElement.dataset.bmField,reference:document.activeElement.dataset.bmReference,start:document.activeElement.selectionStart,end:document.activeElement.selectionEnd}:null;
 const playing=preserveMedia?Array.from(document.querySelectorAll('#stage video')):[];
 const inputFocus=preserveMedia&&document.activeElement?.hasAttribute('data-trial-drive')?{id:document.activeElement.dataset.trialDrive,start:document.activeElement.selectionStart,end:document.activeElement.selectionEnd}:null;
 const beatDetails=preserveMedia?Array.from(document.querySelectorAll('[data-beat-detail][open]'),el=>el.dataset.beatDetail):[];
 const openDetails=preserveMedia?Array.from(document.querySelectorAll('[data-trial-detail][open]'),el=>el.dataset.trialDetail):[];
 onboardingController?.destroy();onboardingController=null;
 view=resolveView();$('#motionlab-os').classList.toggle('onboarding-mode',view.kind==='onboarding'&&view.entry);
 $('#stage').innerHTML=(snapshot.sourceIssues?.length&&!['home','onboarding'].includes(view.kind)?sourceIssuesHTML():'')+view.html;formatChrome();
 if(view.kind==='onboarding')onboardingController=mountOnboarding($('#stage'),{snapshot,entry:view.entry,navigate,copy,toast,saved:state=>{snapshot.onboarding={...state,done:state.done||snapshot.onboarding?.done};client.refreshAfterWrite();}});
 if(referenceFocus){const input=document.querySelector(`[data-beat-link="${CSS.escape(referenceFocus.id)}"]`);input?.focus({preventScroll:true});if(input&&referenceFocus.start!==null)input.setSelectionRange(referenceFocus.start,referenceFocus.end);}
 if($('#document-search')){filterDocuments(drafts.documentQuery||'');documentMotion=mountDocumentAnimations($('#document-grid'));}
 for(const detail of document.querySelectorAll('[data-beat-detail]'))detail.open=beatDetails.includes(detail.dataset.beatDetail);
 if(preserveMedia)for(const detail of document.querySelectorAll('[data-list-detail]'))detail.open=listDetails.includes(detail.dataset.listDetail);
 for(const detail of document.querySelectorAll('[data-trial-detail]'))detail.open=openDetails.includes(detail.dataset.trialDetail);
 for(const next of document.querySelectorAll('#stage video')){const i=playing.findIndex(old=>old.getAttribute('src')===next.getAttribute('src'));if(i>=0)next.replaceWith(playing.splice(i,1)[0]);}
 bindBeatLibrary(document,{navigate,refresh:()=>client.refreshAfterWrite(),render:()=>render(true),toast,copy,uploadEndpoint:'/api/beat-library/upload'});
 if(montageFocus){const selector=montageFocus.field?'[data-bm-field="'+CSS.escape(montageFocus.field)+'"]':montageFocus.reference!==undefined?'[data-bm-reference="'+CSS.escape(montageFocus.reference)+'"]':null,el=selector&&document.querySelector(selector);el?.focus({preventScroll:true});if(el&&typeof montageFocus.start==='number')try{el.setSelectionRange(montageFocus.start,montageFocus.end);}catch{}}
 if(inputFocus){const el=document.querySelector(`[data-trial-drive="${CSS.escape(inputFocus.id)}"]`);el?.focus({preventScroll:true});if(el&&inputFocus.start!==null&&el.type==='text')el.setSelectionRange(inputFocus.start,inputFocus.end);}
 if(view.kind==='one-shot')oneShotController=mountOneShot($('#stage'),{f:view.f,snapshot,d:oneShotDraft(view.f,draft(view.f.id)),page:view.shotPage,project:view.project,ui:listUI()});
 for(const el of document.querySelectorAll('[data-shot-detail]'))el.open=shotDetails.includes(el.dataset.shotDetail);
 if(shotFocus){const el=document.querySelector('[data-shot-field="'+CSS.escape(shotFocus.field)+'"]');el?.focus({preventScroll:true});try{el?.setSelectionRange(shotFocus.start,shotFocus.end);}catch{}}
 if(view.kind==='list-reel')listController=mountListReel($('#stage'),{f:view.f,snapshot,d:listDraft(view.f,draft(view.f.id)),page:view.listPage,project:view.project,ui:listUI()});
 if(listFocus){const selector=listFocus.field?'[data-list-field="'+CSS.escape(listFocus.field)+'"]':listFocus.card!==undefined?'[data-list-card="'+CSS.escape(listFocus.card)+'"][data-card-field="'+CSS.escape(listFocus.cardField||'')+'"]':null;const el=selector&&document.querySelector(selector);if(el){el.focus({preventScroll:true});if(typeof listFocus.start==='number'&&['text','url','search',undefined].includes(el.type)||el?.tagName==='TEXTAREA')try{el.setSelectionRange(listFocus.start,listFocus.end);}catch{}}}
 $('#crumb').textContent=view.f?view.f.name:view.kind==='home'?'Accueil':$('#stage h1')?.textContent||'Espace de travail';
 document.title=($('#stage h1')?.textContent||view.f?.name||'Espace de travail')+' / MotionLab';
 syncAgentPrompts(document);
 chrome();
}
function receive(next) {
 const first=!snapshot || snapshot.workspaceId!==next.workspaceId;
 const previous=snapshot;
 if(!first&&previous.onboarding?.done&&next.onboarding)next.onboarding.done=true;
 snapshot=next;
 if(first)restore();
 if(next.onboarding?.done&&!next.onboarding.persisted&&!onboardingMigration){
  onboardingMigration=true;
  writeOnboarding({action:'complete'}).then(state=>{if(snapshot.workspaceId===next.workspaceId)snapshot.onboarding=state;client.refreshAfterWrite();}).catch(()=>{}).finally(()=>{onboardingMigration=false;});
 }
 for(const f of next.formats){const d=drafts[f.id];if(!d)continue;const a=f.answers||{};if(f.id==='talking-head')reconcileLookDraft(d,savedLook(a));if(!d.setupDraft)Object.assign(d,a);}
 persist();
 if(view?.f)view.f=format(view.f.id)||view.f;
 if(first){documents.clear();documentRequests.clear();documentEpochs.clear();shell();render();if(activeDocumentPath())readDocument(activeDocumentPath(),{force:true});return;}
 chrome();formatChrome();
 if(view?.kind==='onboarding'){
  // Background file reads never wipe a handle or a key being typed.
  if(view.entry&&next.onboarding?.done)navigate('/',true);
  return;
 }
 if(view?.kind==='one-shot'){if(view.shotPage==='look'&&document.querySelector('.os-shot-font-dialog[open]')){oneShotController?.update({f:view.f,snapshot});return;}const y=scrollY;render(true);scrollTo(0,y);return;}
 if(view?.kind==='list-reel'&&format('scroll-reel')){
  const f=format('scroll-reel'),d=listDraft(f,draft('scroll-reel'));
  if(['setup/hook','setup/overlays','setup/cta','research/project','project'].includes(view.listPage)){const project=view.project?next.projects.find(p=>p.id===view.project.id):null;if(view.project&&!project){const y=scrollY;render(true);scrollTo(0,y);return;}listController?.update({f,snapshot,d,project:project?{...project,listLookLabel:f.answers?.label}:null});return;}
  const y=scrollY;render(true);scrollTo(0,y);return;
 }
 if(view?.kind==='files'&&$('#document-search')){
  updateDocumentCards($('#document-grid'),documentFiles(),{href,formats:snapshot.formats});
  filterDocuments($('#document-search').value);documentMotion?.sync();return;
 }
 const docPath=activeDocumentPath();
 if(docPath&&$('#document-look-sync'))$('#document-look-sync').innerHTML=preferenceSyncNotice(next.formats.find(f=>f.preferencesPath===docPath));
 if(docPath){const incoming=next.preferences.find(p=>p.path===docPath)||next.contextDocuments?.find(p=>p.path===docPath);if(incoming&&!drafts[documentKey(docPath)]?.saving)mergeDocument(incoming);if(drafts[documentKey(docPath)]?.editing)updateDocumentStatus(docPath);else{const y=scrollY;render();scrollTo(0,y);}readDocument(docPath,{force:true});return;}
 const passive=['product-demo-voice-prompt','home','format','beat-library','beat-inputs','beat-craft','trial-format','account','activity','waiting','account-setup','project','files','unknown'];
 if(passive.includes(view?.kind)||view?.kind==='questions'&&JSON.stringify(previous.account.questions)!==JSON.stringify(next.account.questions)||view?.kind==='readback'&&JSON.stringify(previous.account.readback)!==JSON.stringify(next.account.readback)) {
  const y=window.scrollY, focus=document.activeElement?.dataset.route;
  const control=document.activeElement?.matches('[data-account-control],[data-activity-format],[data-action^="account-post:"]')?{action:document.activeElement.dataset.action,account:document.activeElement.dataset.accountControl,activity:document.activeElement.hasAttribute('data-activity-format')}:null;
  render(true);window.scrollTo(0,y);
  if(focus)Array.from(document.querySelectorAll('[data-route]')).find(a=>a.dataset.route===focus)?.focus({preventScroll:true});
  if(control){const selector=control.action?'[data-action="'+CSS.escape(control.action)+'"]':control.account?'[data-account-control="'+control.account+'"]':'[data-activity-format]';document.querySelector(selector)?.focus({preventScroll:true});}
 } else if(view?.kind==='page'){
  const file=snapshot.files.find(f=>f.path===searchParams().get('file'));
  const frame=$('.page-frame');if(frame&&file&&frame.getAttribute('src')!==file.url)frame.src=file.url;
 } else if(view?.kind==='prompt'&&view.f){
  // Chat saving setup can change future routes, but a copied prompt stays stable on screen.
  if(!setupDone(previous.formats.find(f=>f.id===view.f.id))&&setupDone(format(view.f.id)))toast('Tes réglages sont enregistrés.');
 }
}
async function copy(text,message='Copié. Colle-le dans le chat.',{literal=false}={}) {
 if(!literal)text=agentPrompt(text);
 try {await navigator.clipboard.writeText(text);toast(message);}
 catch {const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();if(ok)toast(message);else {const prompt=$('#prompt-text');if(prompt){const selection=getSelection(),range=document.createRange();range.selectNodeContents(prompt);selection.removeAllRanges();selection.addRange(range);}toast('Sélectionne le prompt et copie-le.');}}
}
function error(text){$('#form-error').textContent=text;$('#form-error').scrollIntoView({block:'nearest'});}
function addFiles(files) {
 if(!view?.f)return;
 const d=draft(view.f.id);
 for(const file of files){if(!/^(video|image)\//.test(file.type)&&!(/\.(mov|mp4|m4v|webm|mkv|jpg|jpeg|png|webp)$/i.test(file.name)))continue;
 const token=crypto.randomUUID();blobs.set(token,URL.createObjectURL(file));d.files.push({name:file.name,size:file.size,type:file.type||(/\.(jpg|jpeg|png|webp)$/i.test(file.name)?'image/jpeg':'video/mp4'),token});}
 persist();$('#chosen-files').innerHTML=chosenFiles(d);
 if(view.kind==='quick-setup')$('#quick-preview').innerHTML=quickPreview(view.f,d);
}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function act(action) {
 if(action==='beat-more'){const d=draft('beat-montage');d.showAllBeats=!d.showAllBeats;persist();const y=scrollY;render(true);scrollTo(0,y);return;}
 if(action==='beat-link-add'||action.startsWith('beat-link-remove:')){
  const d=draft('beat-montage');
  const rows=beatReferenceRows(d);let focus;
  if(action==='beat-link-add'){if(rows.length>=30)return error('Ajoute jusqu’à 30 liens vidéo à la fois.');focus={id:crypto.randomUUID(),value:''};rows.push(focus);}
  else {const index=rows.findIndex(r=>r.id===action.slice('beat-link-remove:'.length));if(index<0)return;delete d.referenceErrors?.[rows[index].id];if(rows.length===1)rows[0].value='';else rows.splice(index,1);focus=rows[Math.min(index,rows.length-1)];}
  d.craftError='';persist();render(true);document.querySelector(`[data-beat-link="${CSS.escape(focus.id)}"]`)?.focus();return;
 }
 if(action==='beat-craft'){
  const d=draft('beat-montage');
  const rows=beatReferenceRows(d),filled=rows.filter(r=>r.value.trim());d.referenceErrors={};d.craftError='';
  if(!filled.length)d.referenceErrors[rows[0].id]='Colle un lien vidéo.';
  for(const row of filled){try{montageReference(row.value);}catch(e){d.referenceErrors[row.id]=e.message;}}
  if(Object.keys(d.referenceErrors).length){render(true);document.querySelector(`[data-beat-link="${CSS.escape(Object.keys(d.referenceErrors)[0])}"]`)?.focus();return;}
  const prompt=beatCraftPrompt(d);
  if(!prompt)return error('Ajoute jusqu’à 30 liens vidéo à la fois.');
  persist();return copy(prompt);
 }
 if(action.startsWith('beat-reference-retry:')){const job=beatUploads.find(j=>j.id===action.slice('beat-reference-retry:'.length)&&j.referenceId&&j.status==='error');if(job)await sendBeatFile(job);return;}
 if(action.startsWith('beat-reference-continue:')||action.startsWith('beat-reference-open:')){
  const id=action.split(':')[1],ref=format('beat-montage')?.beatReferences?.find(r=>r.id===id);if(!ref)return;
  return copy('/new-format\n\n'+(action.startsWith('beat-reference-continue:')?'Étudie la vidéo que j’ai envoyée pour cette référence et montre-moi son aperçu des coupes numérotées.':'Ouvre mon espace de travail MotionLab pour que je puisse envoyer la vidéo de cette référence.')+'\n\n'+ref.url);
 }
 if(action==='beat-analyse')return copy(beatPreparationPrompt);
 if(action==='beat-reuse'){
  const d=draft('beat-montage');if(d.reusing)return;
  if(!d.reuseClips?.length)return error('Choisis les clips à ajouter.');
  if(preview)return toast('Ouvre ton espace de travail pour ajouter ces clips.');
  d.reusing=true;d.reuseError='';render(true);
  try{const response=await fetch('/api/beat-inputs',{method:'POST',headers:{'Content-Type':'application/json','X-MotionLab-Write':'inputs'},body:JSON.stringify({paths:d.reuseClips})});const value=await response.json();if(!response.ok)throw Error(value.error||'Impossible d’ajouter ces clips.');d.reuseClips=[];await client.refresh();toast('Clips ajoutés à Beat Montage.');}catch(e){d.reuseError=e.message;}finally{d.reusing=false;persist();render(true);}return;
 }
 if(action==='beat-retry'){for(const job of beatUploads.filter(j=>!j.referenceId&&j.status==='error'))await sendBeatFile(job);return;}
 if(action==='beat-make'){
  const d=draft('beat-montage');
  if(!Number.isInteger(Number(d.quantity))||d.quantity<1||d.quantity>30)return error('Choisis entre 1 et 30 vidéos.');
  if(!format('beat-montage')?.beatInputs?.ready)return navigate('/formats/beat-montage/inputs');
  return copy(makePrompt(format('beat-montage')));
 }
 const f=view?.f,d=f?draft(f.id):null;
 if(action.startsWith('account-post:')){drafts.accountSelectedPost=action.slice(13);render();document.querySelector('[data-action="'+CSS.escape(action)+'"]')?.focus({preventScroll:true});return;}
 if(action==='copy-prompt')return copy($('#prompt-text').textContent);
 if(action==='fv-next'){if(!String(d?.fvSubject||'').trim()){error('Écris d’abord ton sujet.');$('#fv-new-form textarea')?.focus();return;}return navigate('/formats/full-visual/new/prompt');}
 if(action==='fv-done'){const fd=draft('full-visual');fd.fvSubject='';fd.fvNotes='';persist();toast('Ta vidéo apparaît ici dès que la recherche commence.');return navigate('/formats/full-visual');}
 if(action.startsWith('fv-own:')){const pd=fvDraft(action.slice(7));pd.own=!pd.own;persist();return render(true);}
 if(action.startsWith('fv-caption:')){const o=snapshot.outputs.find(o=>o.projectId===action.slice(11)&&o.caption?.text);return o?copy(o.caption.text,'Légende copiée.',{literal:true}):toast('Pas encore de légende.');}
 if(action.startsWith('cap-mode:')){d.capMode=action.slice(9);persist();return render(true);}
 if(action.startsWith('th-style:')){
  if(preview)return toast('Ouvre ton espace de travail pour choisir un style.');
  const style=action.slice(9),tf=format('talking-head');
  try{await writeTalkingStyle(style);if(tf)tf.style=style;toast('Enregistré. Tes vidéos utilisent '+(talkingStyleName({...tf,style})||'ce style')+'.');await client.refreshAfterWrite();return navigate('/formats/talking-head');}
  catch(problem){error(problem.message);}
  return;
 }
 if(action==='fv-voice'){
  const form=$('#fv-voice-form'),key=$('#fv-key');if(!form||form.dataset.saving)return;
  if(!key.value.trim()){error('Colle d’abord ta clé.');key.focus();return;}
  if(preview)return toast('Ouvre ton espace de travail pour enregistrer ta clé.');
  form.dataset.saving='true';const submit=form.querySelector('[type="submit"]');submit.disabled=true;submit.textContent='Enregistrement…';
  try{f.voiceKeys=(await writeProductVoiceKey(d.fvVoice||'elevenlabs',key.value)).keys;key.value='';toast('Clé enregistrée.');await client.refreshAfterWrite();render(true);}
  catch(problem){if(form.isConnected){error(problem.message);key.focus();}}
  finally{delete form.dataset.saving;if(submit.isConnected){submit.disabled=false;submit.textContent='Enregistrer la clé';}}
  return;
 }
 if(action==='product-demo-back')return navigate('/formats/product-demo/new');
 if(action==='product-demo-voice-next'){
  const form=$('#product-demo-voice-form');if(!form||form.dataset.saving)return;
  try{productVoicePrompt(productVoiceDraft(f,d));}catch(problem){return error(problem.message);}
  if(preview)return toast('Ouvre ton espace de travail pour enregistrer ta clé.');
  const key=$('#product-demo-key'),submit=form.querySelector('[type="submit"]'),controls=[...form.querySelectorAll('input,select,button')];
  form.dataset.saving='true';form.setAttribute('aria-busy','true');controls.forEach(el=>el.disabled=true);submit.textContent='Enregistrement…';
  try{
   if(key){
    f.productVoice=await writeProductVoiceKey(d.productVoiceProvider,key.value);key.value='';
   }
   if(form.isConnected)return navigate('/formats/product-demo/setup/prompt');
  }catch(problem){if(form.isConnected){error(problem.message);controls.forEach(el=>el.disabled=false);key?.focus();}}
  finally{delete form.dataset.saving;form.removeAttribute('aria-busy');controls.forEach(el=>el.disabled=false);submit.textContent='Obtenir le prompt de réglage';}
  return;
 }
 if(action.startsWith('product-demo-film:')){const id=action.slice(18),liked=new Set(d.productFilms||[]);liked.has(id)?liked.delete(id):liked.add(id);d.productFilms=[...liked];persist();const y=scrollY;render(true);return scrollTo(0,y);}
 if(action==='product-demo-next'){try{productDemoPrompt(d);return navigate('/formats/product-demo/new/films');}catch(problem){error(problem.message);$('#product-demo-form input')?.focus();return;}}
 if(action.startsWith('answer-option:')||action==='question-next'||action==='question-back'){
  const qs=snapshot.account.questions||[],q=qs.find(q=>q.id===drafts.accountQuestion)||qs[0];if(!q)return;
  const index=qs.indexOf(q);drafts.accountAnswers??={};
  if(action.startsWith('answer-option:')){const answer=q.options?.[Number(action.split(':')[1])];if(answer==null)return;drafts.accountAnswers[q.id]=answer;}
  else{if(action==='question-next'&&!drafts.accountAnswers[q.id]?.trim())return error('Ajoute d’abord ta réponse.');drafts.accountQuestion=qs[index+(action==='question-next'?1:-1)]?.id||q.id;}
  persist();render();return;
 }
 if(action==='copy-answers'){const questions=snapshot.account.questions||[],d=drafts.accountAnswers||{};if(questions.some(q=>!d[q.id]?.trim()))return error('Réponds d’abord aux questions restantes.');return copy('/start\nVoici mes réponses partagées :\n'+questions.map(q=>'['+q.id+'] '+q.ask+'\n'+d[q.id]).join('\n\n')+'\n\nEnregistre-les une fois dans context/answers.json, en gardant les réponses existantes et leur provenance. Utilise audience.for pour audience et audience.need pour audience_need. Réutilise-les dans tous les formats, retire les questions répondues de context/questions.json, mets à jour profile.md et montre le résumé dans mon espace de travail. Ne me repose pas ces questions quand je change de format.');}
 if(action==='confirm-account')return copy('/start\nJ’ai relu le résumé du compte dans mon espace de travail. Il est correct. Termine les vérifications restantes, marque la configuration du compte comme terminée quand elles passent, puis enchaîne directement avec Trial Reels s’il est installé. Sinon, montre ma prochaine étape sur l’Accueil.');
 if(action==='correct-account')return copy('/start\nVoici ma correction du résumé du compte :\n'+(drafts.accountCorrection||'')+'\nMets à jour les fichiers de contexte concernés et montre le résumé corrigé avant de terminer la configuration.');
 if(action==='add-pack')return copy('/add\nAide-moi à ajouter à ce dossier le pack MotionLab que j’ai téléchargé.');
 if(action.startsWith('task:'))return copy(`Reprends la tâche ${JSON.stringify(action.slice(5))}. Lis son dernier statut enregistré, vérifie ce qui est déjà fait et continue seulement le travail manquant. Montre l’avancement dans mon espace de travail.`);
 if(action==='source-repair')return copy('Vérifie ces fichiers de l’espace de travail : '+JSON.stringify(snapshot.sourceIssues.map(issue=>issue.path))+'. Répare le JSON incomplet ou invalide à partir des sources d’origine, en gardant toutes les préférences et le travail terminé. Laisse disponible le travail qui n’en dépend pas. Actualise l’espace de travail quand les fichiers sont valides.');
 if(action.startsWith('sync-preferences:')){const f=format(action.slice(17));if(!f)return;return copy(f.command+' setup\nLis '+JSON.stringify(f.preferencesPath)+' et accorde mon look enregistré avec les corrections que j’y ai faites. Garde le texte actuel et toutes les autres préférences. Écris des réponses de look explicites et utilise --preferences-revision '+(f.preferencesSync?.revision||'<SHA256 actuel du fichier de préférences>')+' en les enregistrant avec le script de look du format. Mets à jour les réglages par défaut pour les prochaines vidéos seulement. Fais-le toi-même ; ne demande que si mon intention est impossible à déduire.');}
 if(action.startsWith('edit-export:')){const p=snapshot.projects.find(p=>p.id===action.slice(12));if(p?.edit?.exportRequest)return copy(p.edit.exportRequest.prompt);return;}
 if(action.startsWith('new-video-shape:')){const d=drafts.newVideo||={name:'',shape:'9:16'};d.shape=action.slice(16);d.name=$('[data-new-video="name"]')?.value??d.name;render(true);$(`[data-action="${CSS.escape(action)}"]`)?.focus({preventScroll:true});return;}
 if(action==='new-video-create'){const d=drafts.newVideo||={name:'',shape:'9:16'};if(creatingEdit)return;d.name=($('[data-new-video="name"]')?.value??d.name).trim();const [,width,height]=shapes.find(s=>s[0]===d.shape)||shapes[0];creatingEdit=true;d.error='';render(true);try{await createEdit({name:d.name||'Ma vidéo',width,height,fps:30});drafts.newVideo={name:'',shape:d.shape};persist();}catch(e){creatingEdit=false;d.error=e.message;render(true);}return;}
 if(action.startsWith('edit-clip:')){const path=action.slice(10),file=snapshot.files.find(f=>f.path===path);if(!file)return;try{await createEdit({name:file.name.replace(/\.[^.]+$/,''),clip:file.path});}catch(e){error(e.message);}return;}
 if(action.startsWith('resume:')){const p=snapshot.projects.find(p=>p.id===action.slice(7));if(!p)return;if(p.format==='talking-head')return copy(talkingResumePrompt(p));if(p.format==='product-demo')return copy('/product-demo\nContinue '+JSON.stringify(p.path)+'. Lis le dossier actuel et les préférences, puis termine le film, la relecture et la livraison modifiable.');return copy(p.beatMontage?.prompt||`${format(p.format)?.command||''}\nContinue ${JSON.stringify(p.path)} avec la skill du format. Actualise son steps.json à partir des fichiers et des validations de cette vidéo. Fais toi-même la préparation, la construction et les vérifications, jusqu’à la prochaine validation de calque ou de plan visuel requise. Montre-moi cette proposition dans mon espace de travail. Garde verrouillés les calques validés et enregistre l’avancement après chaque opération.`);}
 if(action.startsWith('review:')||action.startsWith('revision:')){
  const p=snapshot.projects.find(p=>p.id===action.split(':').slice(1).join(':'));
  return copy(action.startsWith('review:')?`Montre-moi la proposition actuelle pour ${JSON.stringify(p.path)}. Suis la skill du format et vérifie le travail toi-même avant de me le montrer. Demande la validation de calque ou de plan visuel que la skill exige, garde verrouillés les calques validés, et gère toi-même la préparation et les vérifications.`:`Pour ${JSON.stringify(p.path)}, voici ce que je veux changer :\n[Ajoute ma correction ici]\nGarde le reste. Mets à jour le fichier de préférences du format si c’est une préférence durable.`);
 }
 if(action==='footage-next'){
  if(!d.files?.length)return error('Choisis d’abord tes rushes.');
  return navigate(base(f)+(f.id==='talking-head'?setupDone(f)?'/new/transcript':'/setup/look':f.pack==='quick-cuts'?'/material/prompt':'/new/prompt'));
 }
 if(action==='transcript-next'){
  if(!d.files?.length)return error('Ajoute d’abord tes rushes.');
  if(!d.transcribe&&!d.transcript?.trim())return error('Colle un script ou choisis « Transcrire mes rushes ».');
  return navigate(base(f)+'/new/prompt');
 }
 if(action==='quick-new-prompt'){
  if(!Number.isInteger(Number(d.quantity))||d.quantity<1||d.quantity>30)return error('Choisis entre 1 et 30 vidéos.');
  if(['phone','scroll-reel'].includes(f.id)&&!(snapshot.account.context?.readyForIdeas??snapshot.account.done)&&!d.topic?.trim())return error(snapshot.account.context?.audience?'Ajoute un sujet court pour ton audience.':'Ajoute un sujet court et à qui il s’adresse.');
  return navigate(base(f)+'/new/prompt');
 }
 if(action==='quick-setup-prompt'){
  if(f.id==='beat-montage'&&!d.subject?.trim())return error('Dis ce que tu veux filmer.');
  if(d.cta==='comment'&&!d.keyword?.trim())return error('Ajoute ton mot-clé de commentaire et ce qu’il envoie.');
  return navigate(base(f)+'/setup/prompt');
 }
 if(action==='save-document')return saveDocument();
 if(action==='retry-document')return readDocument(activeDocumentPath(),{force:true});
 if(['toggle-pref','download-pref','reset-pref'].includes(action)){
  const path=activeDocumentPath(),saved=knownDocument(path),d=documentState(path);if(!d)return;
  if(action==='toggle-pref'){d.editing=!d.editing;persist();render();if(d.editing)readDocument(path,{force:true});}
  if(action==='reset-pref'){const latest=d.conflict||saved;d.text=latest.text;d.base=latest.text;d.revision=latest.revision;d.conflict=null;d.error='';persist();render();}
  if(action==='download-pref')download(d.editing?d.text:saved.text,path.split('/').pop());
 }

}
function bind() {
 document.addEventListener('submit',e=>{if(e.target.id==='product-demo-form'){e.preventDefault();act('product-demo-next');}});
 document.addEventListener('submit',e=>{if(e.target.id==='fv-new-form'){e.preventDefault();act('fv-next');}if(e.target.id==='fv-voice-form'){e.preventDefault();act('fv-voice');}});
 document.addEventListener('submit',e=>{if(e.target.id==='product-demo-voice-form'){e.preventDefault();act('product-demo-voice-next');}});
 bindBeatPlayers(document);
 // Trial comparisons play one reel at a time, so their sound never overlaps.
 document.addEventListener('play',event=>{
  const video=event.target;if(!video.matches?.('.trial-detail video'))return;
  for(const other of document.querySelectorAll('.trial-detail video'))if(other!==video)other.pause();
 },true);
 document.addEventListener('click',async e=>{
  const back=e.target.closest('[data-trial-back]');
  if(back&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();const d=trialInputDraft(back.dataset.trialBack);if(d.adding||d.more){d.adding=false;d.more=false;d.error='';persist();render(true);}else navigate('/formats/trial-reels');return;}
  const toggle=e.target.closest('[data-trial-add],[data-trial-cancel],[data-trial-more],[data-trial-ready]');
  if(toggle){const id=toggle.dataset.trialAdd||toggle.dataset.trialCancel||toggle.dataset.trialMore||toggle.dataset.trialReady,d=trialInputDraft(id);d.adding=!!toggle.dataset.trialAdd;d.more=!!toggle.dataset.trialMore;d.error='';persist();render(true);return;}
  const queueCopy=e.target.closest('[data-trial-queue-copy]');
  if(queueCopy){const model=snapshot.trial.formats.find(m=>m.id===queueCopy.dataset.trialQueueCopy),selected=new Set(trialInputDraft(model.id).queued||[]),reels=(model.uncreated||[]).filter(e=>selected.has(e.id));if(reels.length)await copy('/trial-reels\nFais '+(model.variationTarget||4)+' variations de chaque vidéo choisie ci-dessous pour '+model.name+'. Réutilise l’étude enregistrée et les originaux actuels. Vérifie qu’ils conviennent, donne à chaque vidéo la légende d’origine légèrement réécrite, et montre les vidéos vérifiées. Garde toutes les vidéos existantes et leurs marques de publication.\n'+reels.map(e=>e.permalink||e.id).join('\n'));return;}
  const captionButton=e.target.closest('[data-trial-caption]');
  if(captionButton){const model=snapshot.trial.formats.find(m=>m.id===captionButton.dataset.model);const item=captionButton.dataset.source?model?.examples.find(e=>e.id===captionButton.dataset.trialCaption):model?.outputGroups.flatMap(g=>g.outputs).find(o=>o.path===captionButton.dataset.trialCaption);if(item?.caption?.text)await copy(item.caption.text,'Légende copiée.',{literal:true});return;}
  const control=e.target.closest('[data-trial-save-drive],[data-trial-remove],[data-trial-restore],[data-trial-retry],[data-trial-request]');if(!control)return;
  const id=control.dataset.model||control.dataset.trialSaveDrive||control.dataset.trialRequest,d=trialInputDraft(id);
  if(control.dataset.trialRetry){const job=trialUploads.get(id)?.find(j=>j.id===control.dataset.trialRetry);if(job)await trialSend(job);return;}
  control.disabled=true;trialInputError(id,'');
  try {
   if(control.dataset.trialRequest){await trialChange({action:'request-reels',formatId:id,links:(d.links||'').split(/\s+/).filter(Boolean)});d.adding=false;d.links='';persist();}
   else if(control.dataset.trialSaveDrive){const model=snapshot.trial.formats.find(m=>m.id===id);await trialChange({action:'drive',formatId:id,roundId:model.roundId,needId:d.need||(model.needs.length===1?model.needs[0].id:''),url:d.drive});d.drive='';d.more=false;persist();}
   else if(control.dataset.trialRestore){await trialChange({action:'restore',formatId:id,id:control.dataset.trialRestore});toast('Fichier restauré.');}
   else {await trialChange({action:control.dataset.media?'remove-media':'remove',formatId:id,id:control.dataset.trialRemove,mediaId:control.dataset.media});toast('Retiré de ce format. Tu peux le restaurer plus bas.');}
   await client.refresh();
  }catch(error){trialInputError(id,error.message);}finally{control.disabled=false;}
 });
 document.addEventListener('click',e=>{
  const a=e.target.closest('[data-route]');
  if(a&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();if(a.dataset.bmReset)resetBeatLibraryDraft(snapshot.workspaceId,decodeURIComponent(a.dataset.bmReset));if(a.dataset.fresh){const id=a.dataset.route.split('/')[2];delete drafts[id];draft(id);}navigate(a.dataset.route);return;}
  const action=e.target.closest('[data-action]');if(action){act(action.dataset.action);return;}
  const remove=e.target.closest('[data-remove]');if(remove&&view.f){const d=draft(view.f.id),[file]=d.files.splice(Number(remove.dataset.remove),1);if(file?.token&&blobs.has(file.token)){URL.revokeObjectURL(blobs.get(file.token));blobs.delete(file.token);}persist();$('#chosen-files').innerHTML=chosenFiles(d);}
 });
 document.addEventListener('paste',e=>{
  const el=e.target;if(!el.dataset.beatLink)return;
  const values=(e.clipboardData?.getData('text/plain')||'').trim().split(/\s+/).filter(Boolean);if(values.length<2)return;
  e.preventDefault();const d=draft('beat-montage');
  const rows=beatReferenceRows(d),index=rows.findIndex(r=>r.id===el.dataset.beatLink);if(index<0)return;
  if(rows.length-1+values.length>30)return error('Ajoute jusqu’à 30 liens vidéo à la fois.');
  const incoming=values.map((value,i)=>({id:i?crypto.randomUUID():rows[index].id,value}));rows.splice(index,1,...incoming);d.referenceErrors={};d.craftError='';persist();render(true);document.querySelector(`[data-beat-link="${CSS.escape(incoming.at(-1).id)}"]`)?.focus();
 });
 document.addEventListener('input',e=>{
 if(e.target.dataset?.newVideo==='name'){(drafts.newVideo||={name:'',shape:'9:16'}).name=e.target.value;persist();return;}
  const el=e.target;
  if(el.dataset.beatLink){const d=draft('beat-montage'),row=beatReferenceRows(d).find(r=>r.id===el.dataset.beatLink);if(!row)return;row.value=el.value;delete d.referenceErrors?.[row.id];d.craftError='';const host=el.closest('[data-beat-link-row]');host.querySelector('.beat-link-brand').innerHTML=beatReferenceBadge(el.value);host.querySelector('.beat-link-error').hidden=true;el.removeAttribute('aria-invalid');el.setAttribute('aria-describedby','beat-link-help');if($('#form-error'))$('#form-error').textContent='';const prompt=beatCraftPrompt(d),box=$('#prompt-text');if(box){box.textContent=prompt;box.hidden=!prompt;}persist();return;}
  if(el.id==='document-search'){drafts.documentQuery=el.value;persist();filterDocuments(el.value);return;}
  if(el.dataset.trialLinks){trialInputDraft(el.dataset.trialLinks).links=el.value;persist();return;}
  if(el.dataset.trialDrive){trialInputDraft(el.dataset.trialDrive).drive=el.value;persist();return;}
  if(el.dataset.question){drafts.accountAnswers??={};drafts.accountAnswers[el.dataset.question]=el.value;persist();return;}
  if(el.dataset.own&&view?.f){const d=draft(view.f.id);d[el.dataset.own]=el.value;persist();const box=$('#prompt-text');if(box)box.textContent=agentPrompt(talkingCreatePrompt(d));return;}
  if(el.dataset.cap&&view?.f){const d=draft(view.f.id);d[el.dataset.cap]=el.value;persist();const box=$('#prompt-text');if(box)box.textContent=agentPrompt(talkingCaptionsPrompt(view.f,d));return;}
  if(el.dataset.fvText){const pd=fvDraft(el.dataset.fvText);pd.text=el.value;persist();const box=$('#prompt-text');if(box)box.textContent=agentPrompt(fullVisualTranscriptPrompt(el.dataset.fvText,pd.text));return;}
  if(el.id==='account-correction'){drafts.accountCorrection=el.value;persist();return;}
  if(el.dataset.pref){drafts[el.dataset.pref].text=el.value;drafts[el.dataset.pref].error='';persist();updateDocumentStatus(activeDocumentPath());return;}
  if(!view?.f||!el.dataset.field)return;
  const d=draft(view.f.id),key=el.dataset.field;
  d[key]=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;
  if(view.kind==='quick-setup')d.setupDraft=true;
  if(view.kind==='product-demo-voice')d.setupDraft=true;
  clearTimeout(saveTimer);saveTimer=setTimeout(persist,200);
  if(key==='transcribe')$('#transcript').disabled=d.transcribe;
  if(key==='cta'&&$('#keyword-field'))$('#keyword-field').hidden=d.cta!=='comment';
  if(view.kind==='quick-setup')$('#quick-preview').innerHTML=quickPreview(view.f,d);
 });
 document.addEventListener('change',async e=>{
  const el=e.target;
  if(el.dataset.field==='fvVoice'&&view?.f?.id==='full-visual'){draft('full-visual').fvVoice=el.value;persist();render(true);document.querySelector('[data-field="fvVoice"]')?.focus();return;}
  if(el.dataset.field==='productVoiceProvider'&&view?.f?.id==='product-demo'){draft(view.f.id).productVoiceProvider=el.value;persist();render();document.querySelector('[data-field="productVoiceProvider"]')?.focus();return;}
  if(el.dataset.accountControl){const q=accountOptions();q[el.dataset.accountControl]=el.value;navigate('/account?tab='+q.tab+'&range='+q.range+'&metric='+q.metric);document.querySelector('[data-account-control="'+el.dataset.accountControl+'"]')?.focus({preventScroll:true});return;}
  if(el.hasAttribute('data-activity-format')){navigate('/activity?status='+(searchParams().get('status')||'all')+'&format='+encodeURIComponent(el.value));document.querySelector('[data-activity-format]')?.focus({preventScroll:true});return;}
  if(el.dataset.trialPosted){const posted=el.checked,control=el.closest('.trial-post-control');el.disabled=true;control?.setAttribute('aria-busy','true');trialInputError(el.dataset.model,'');try{await trialChange({action:'posted',formatId:el.dataset.model,path:el.dataset.trialPosted,posted});await client.refreshAfterWrite();toast(posted?'Marquée comme publiée.':'Remise dans les non publiées.');}catch(error){el.checked=!posted;trialInputError(el.dataset.model,error.message);toast('Impossible d’enregistrer le statut de publication.');}finally{el.disabled=false;control?.removeAttribute('aria-busy');}return;}
  if(el.dataset.beatReferenceUpload){addBeatFiles(el.files,el.dataset.beatReferenceUpload);el.value='';return;}
  if(el.hasAttribute('data-beat-upload')){addBeatFiles(el.files);el.value='';return;}
  if(el.dataset.beatReuse){const d=draft('beat-montage');d.reuseClips=(d.reuseClips||[]).filter(p=>p!==el.dataset.beatReuse);if(el.checked)d.reuseClips.push(el.dataset.beatReuse);persist();return;}
  if(el.dataset.trialUpload){trialAddFiles(el.dataset.trialUpload,el.files);el.value='';return;}
  if(el.dataset.trialQueue){const d=trialInputDraft(el.dataset.model),selected=new Set(d.queued||[]);el.checked?selected.add(el.dataset.trialQueue):selected.delete(el.dataset.trialQueue);d.queued=[...selected];persist();render(true);return;}
  if(el.dataset.trialNeed){trialInputDraft(el.dataset.trialNeed).need=el.value;persist();return;}
  if(el.id==='footage-input')addFiles(el.files);
  if(el.id==='existing-footage'&&el.value){const file=snapshot.files.find(f=>f.path===el.value),d=draft(view.f.id);if(file&&!d.files.some(f=>f.path===file.path))d.files.push({path:file.path,name:file.name,type:file.kind==='video'?'video/mp4':'image/jpeg'});persist();$('#chosen-files').innerHTML=chosenFiles(d);}
  if(el.dataset.sound){const d=draft(view.f.id);d.sounds=Array.isArray(d.sounds)?d.sounds:[];d.sounds=d.sounds.filter(s=>s!==el.dataset.sound);if(el.checked)d.sounds.push(el.dataset.sound);persist();}
  if(el.id==='preview-scenario'){window.MOTIONLAB_PREVIEW.setScenario(el.value);drafts={};snapshot=null;navigate(el.value==='trial-analysis'?'/formats/trial-reels':'/');client.refresh();}
 });
 document.addEventListener('dragover',e=>{const zone=e.target.closest('.drop-zone,[data-trial-drop],[data-beat-drop]');if(zone){e.preventDefault();zone.classList.add('dragging');}});
 document.addEventListener('dragleave',e=>e.target.closest('.drop-zone,[data-trial-drop],[data-beat-drop]')?.classList.remove('dragging'));
 document.addEventListener('drop',async e=>{const zone=e.target.closest('.drop-zone,[data-trial-drop],[data-beat-drop]');if(!zone)return;e.preventDefault();zone.classList.remove('dragging');if(zone.dataset.beatDrop){const fallback=Array.from(e.dataTransfer.files);try{const files=await trialDropFiles(e.dataTransfer.items);await addBeatFiles(files.length?files:fallback);}catch(e){error(e.message);}return;}if(zone.dataset.trialDrop){const id=zone.dataset.trialDrop,fallback=Array.from(e.dataTransfer.files);try{const files=await trialDropFiles(e.dataTransfer.items);await trialAddFiles(id,files.length?files:fallback);}catch(error){trialInputError(id,error.message);}return;}addFiles(e.dataTransfer.files);});
 window.addEventListener('popstate',()=>{render();window.scrollTo(0,history.state?.scroll||0);if(activeDocumentPath())readDocument(activeDocumentPath(),{force:true});client.refresh();});
 window.addEventListener('beforeunload',e=>{if([...trialUploads.values()].flat().concat(beatUploads).some(j=>['queued','uploading','saving'].includes(j.status))){e.preventDefault();e.returnValue='';}});
 window.addEventListener('pagehide',()=>{persist();client.stop();});
 window.addEventListener('pageshow',e=>{if(e.persisted)client.start();});
}
const client=new WorkspaceClient({source:preview?()=>window.MOTIONLAB_PREVIEW.snapshot():undefined,onData:receive,onStatus:status=>{lastStatus=status;if(snapshot)chrome();else if(status==='unavailable')$('#app').innerHTML=`<main class="os-content">${heading('On se reconnecte.','Demande à ton agent de rouvrir cet espace de travail MotionLab.')}<p class="small">Cette page se reconnectera toute seule.</p>${button('Réessayer','retry','primary')}</main>`;}});
watchAgentPrompts(document);
$('#app').innerHTML='<main class="os-content" aria-label="Chargement de l’espace de travail"><div class="skeleton title"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></main>';
if(location.protocol==='file:'&&!preview)$('#app').innerHTML='<main class="os-content"><h1>Ouvre ton espace de travail depuis le chat.</h1><p>Demande à ton agent d’ouvrir MotionLab. Il te donnera le lien local.</p></main>';
else{bind();document.addEventListener('click',e=>{if(e.target.closest('[data-action="retry"]'))client.refresh();});client.start();}
// Useful for deterministic browser verification; it cannot mutate runtime files.
window.MOTIONLAB_WORKSPACE={refresh:()=>client.refresh(),get snapshot(){return snapshot;},navigate};

// A failed local image falls back to the initials already underneath it.
document.addEventListener('error',event=>{if(event.target.matches?.('img[data-account-avatar]'))event.target.remove();},true);
