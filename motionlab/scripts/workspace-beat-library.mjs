// Each montage owns its inputs and preparation. Browser actions save requests, never analysis.
import {readFileSync,writeFileSync,mkdirSync,renameSync,rmSync,readdirSync,createWriteStream,createReadStream,lstatSync,realpathSync} from 'node:fs';
import {join,dirname,basename,extname,resolve,sep,relative,isAbsolute} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {beatInputState} from './beat-workspace.mjs';
import {readingKey,beatMinimumClips,beatSuggestedClips} from './beat-preparation.mjs';

export const BEAT_LIBRARY='workspace/library/beat-montage.library.json';
export const BEAT_LOCAL_CATALOG='workspace/library/beat-montage.catalog.local.json';
export class BeatLibraryError extends Error {constructor(status,message){super(message);this.status=status;}}
const InputError=BeatLibraryError;
const VIDEO=new Set(['.mp4','.mov','.m4v','.mkv','.webm','.avi']);
const AUDIO=new Set(['.mp3','.wav','.m4a','.aac','.ogg','.flac','.aiff','.aif','.opus']);
const list=x=>Array.isArray(x)?x:[];
const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const now=()=>new Date().toISOString();
const fail=(status,message)=>{throw new InputError(status,message);};
const digest=x=>createHash('sha256').update(x).digest('hex');
const checkedFiles=new Map();
function matchesHash(root,path,expected){
 if(expected===undefined)return true;if(typeof expected!=='string'||!/^[a-f0-9]{64}$/.test(expected))return false;
 const f=safeFile(root,path);if(!f?.stat.isFile())return false;const key=join(root,path),stamp=f.stat.size+':'+f.stat.mtimeMs;let cached=checkedFiles.get(key);
 if(cached?.stamp!==stamp){cached={stamp,hash:digest(readFileSync(f.path))};if(checkedFiles.size>512)checkedFiles.clear();checkedFiles.set(key,cached);}return cached.hash===expected;
}
export function beatLocalPath(root,path){
 if(typeof path!=='string')return '';const normalized=path.replaceAll('\\','/');
 if(!isAbsolute(path)&&!/^[a-z]:/i.test(path))return normalized;
 try{const base=realpathSync(resolve(root)),absolute=realpathSync(path);return absolute.startsWith(base+sep)?relative(base,absolute).split(sep).join('/'):normalized;}catch{return normalized;}
}
// This reader cannot import workspace-state, which imports it to build the snapshot.
function safeFile(root,path){
 if(typeof path!=='string'||!path||path.includes('\\')||path.includes('\0')||path.startsWith('/')||/^[a-z]:/i.test(path))return null;
 const parts=path.split('/');if(parts.some(p=>!p||p==='.'||p==='..'||p.startsWith('.')))return null;
 try{const base=realpathSync(resolve(root));let file=base;for(const part of parts){file=join(file,part);if(lstatSync(file).isSymbolicLink())return null;}if(!file.startsWith(base+sep))return null;return {path:file,stat:lstatSync(file)};}catch{return null;}
}
const mediaUrl=(path,version)=>'/media/'+path.split('/').map(encodeURIComponent).join('/')+(version?'?v='+encodeURIComponent(version):'');
const canServeMedia=path=>typeof path==='string'&&!path.split('/').some(p=>/^(?:secrets?|credentials?|tokens?)(?:\.|$)/i.test(p))&&/^(workspace\/(input|projects|output|library|pages)|context\/(inputs|study)|assets\/quick-cuts)\//.test(path);
function validId(id){return typeof id==='string'&&/^(square|above|own-[a-z0-9][a-z0-9-]{0,95})$/.test(id);}
function validExample(id){return typeof id==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(id);}
function read(root,path,fallback){const f=safeFile(root,path);if(!f?.stat.isFile())return fallback;if(f.stat.size>32*1024**2)fail(409,'Ce fichier de montage est trop lourd pour être lu.');try{return JSON.parse(readFileSync(f.path,'utf8'));}catch{fail(409,'Ton montage se met à jour. Réessaie.');}}
function directory(root,path){let at='';for(const part of path.split('/')){at+=(at?'/':'')+part;try{mkdirSync(join(root,at));}catch(e){if(e.code!=='EEXIST')throw e;}if(!safeFile(root,at)?.stat.isDirectory())fail(403,'Les fichiers doivent rester dans ton espace de travail.');}}
function write(root,path,value){directory(root,dirname(path));const temp=join(root,path+'.'+randomUUID()+'.tmp');try{writeFileSync(temp,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});renameSync(temp,join(root,path));}finally{rmSync(temp,{force:true});}}
function installed(root){if(!list(read(root,'runtime.json',{}).packs).some(p=>p.name==='quick-cuts'))fail(404,'Beat Montage n’est pas installé.');}
function library(root){const saved=read(root,BEAT_LIBRARY,{version:1,templates:{},batches:[],requests:[]});if(saved.version!==1||!saved.templates||Array.isArray(saved.templates))fail(409,'Cette bibliothèque de montages doit être mise à jour.');saved.batches=list(saved.batches);saved.requests=list(saved.requests);return saved;}
function savedTemplate(data,id){const t=data.templates[id]||={id,selectedExampleId:null};t.inputs=list(t.inputs);t.songs=list(t.songs);t.favorites=list(t.favorites);return t;}
function catalogTemplates(root){
 const shipped=read(root,'assets/quick-cuts/beat-montage/catalog.json',{}),local=read(root,BEAT_LOCAL_CATALOG,{}),map=new Map();
 for(const t of [...list(shipped.templates),...list(local.templates)])if(validId(t.id))map.set(t.id,{...map.get(t.id),...t});
 if(!map.has('square'))map.set('square',{id:'square',name:'Carré centré',line:'Des clips de travail sombres. Une phrase au milieu.',layout:'square',examples:[]});
 if(!map.has('above'))map.set('above',{id:'above',name:'Légende au-dessus',line:'Ton histoire au-dessus des images.',layout:'caption-above',examples:[]});
 return [...map.values()];
}
function definitions(root,data=library(root)){
 const base=new Map(catalogTemplates(root).map(t=>[t.id,t]));
 for(const [id,s] of Object.entries(data.templates)){if(!validId(id))continue;const prior=base.get(id)||{},now=x=>beatEditId(prior,x);
  const saved=list(s.examples).map(e=>{const n=now(e.id),shipped=list(prior.examples).find(x=>x.id===n);return n===e.id?e:{...e,id:n,guideId:n,legacy:shipped.legacy,src:shipped.src,poster:shipped.poster,demoSrc:shipped.demoSrc,demoPoster:shipped.demoPoster,reading:shipped.reading};});
  base.set(id,{...prior,...s,id,selectedExampleId:now(s.selectedExampleId),examples:[...new Map([...list(prior.examples),...saved].map(e=>[e.id,e])).values()],variantGuides:{...object(prior.variantGuides),...Object.fromEntries(Object.entries(object(s.variantGuides)).map(([k,g])=>[now(k),g]))}});}
 return [...base.values()];
}
function requireTemplate(root,id,data=library(root)){if(!validId(id))fail(400,'Choisis un montage.');const t=definitions(root,data).find(t=>t.id===id);if(!t)fail(404,'Ce montage est introuvable.');return t;}
function localFile(root,path){if(typeof path!=='string'||!canServeMedia(path))return null;const f=safeFile(root,path);if(!f?.stat.isFile())return null;const ext=extname(path).toLowerCase(),kind=VIDEO.has(ext)?'video':AUDIO.has(ext)?'audio':['.jpg','.jpeg','.png','.webp','.svg'].includes(ext)?'image':'resource';return {path,name:basename(path),kind,size:f.stat.size,url:mediaUrl(path,`${f.stat.mtimeMs.toString(36)}-${f.stat.size.toString(36)}`)};}
function scan(root,path,out=[],depth=0){const f=safeFile(root,path);if(!f?.stat.isDirectory()||depth>10||out.length>10000)return out;for(const item of readdirSync(f.path,{withFileTypes:true})){if(item.name.startsWith('.')||item.isSymbolicLink())continue;const child=path+'/'+item.name;if(item.isDirectory())scan(root,child,out,depth+1);else{const file=localFile(root,child);if(file)out.push(file);}}return out;}
function validCuts(e){return validExample(e?.id)&&Number.isInteger(e.frames)&&e.frames>0&&Number.isFinite(e.fps)&&e.fps>0&&list(e.cuts).length===(e.cuts?.length??-1)&&e.cuts.every((f,i)=>Number.isInteger(f)&&f>0&&f<e.frames&&(!i||f>e.cuts[i-1]));}
function guideFor(t,e){return t.variantGuides?.[e?.guideId||e?.id]||t.guides?.[e?.guideId||e?.id]||t.guide||null;}
function guideView(g,file){return g?{...g,keyAsk:typeof g.keyAsk==='string'?g.keyAsk.replaceAll('30 to 40','10 to 20').replaceAll('30 à 40','10 à 20'):g.keyAsk,recommendedPool:{...g.recommendedPool,min:10,max:20,target:15,headline:'10 à 20 clips d’origine'},groups:list(g.groups).map(group=>({...group,countLabel:'Quelques idées'})),lookGuidance:g.lookGuidance?{...g.lookGuidance,examples:list(g.lookGuidance.examples).map(e=>({...e,src:file(e.src)?.url||null}))}:null}:null;}
function guideValid(g){return !!(g&&list(g.groups).length===6&&g.groups.every(x=>x.title&&list(x.ideas).length===3)&&list(g.lookGuidance?.examples).length===3&&list(g.shootTips).length&&list(g.preparationChecks).length);}
// Shipped edits renamed after 0.4.0 carry sha256 of the old id as `legacy`, so anything a workspace saved under
// the old id (a preparation, a selection, a request) still finds its edit. The old ids themselves never ship.
export function beatEditId(t,id){const all=list(t?.examples);return typeof id!=='string'||all.some(e=>e.id===id)?id:all.find(e=>e.legacy&&e.legacy===digest(id).slice(0,16))?.id??id;}
// The edit exactly as a saved record knew it: the same edit under its old id, or the edit itself.
export function beatSavedEdit(t,e,id){return id&&id!==e?.id&&beatEditId(t,id)===e?.id?{...e,id,guideId:id}:e;}
// Every prepared clip of an edit, including those saved under its old id; the current id wins.
export function beatVariantClips(t,preparation,id){const v=object(preparation?.variants);return Object.assign({},...Object.keys(v).filter(k=>k!==id&&beatEditId(t,k)===id).map(k=>object(v[k]?.clips)),object(v[id]?.clips));}
export function beatVariantKey(template,example){return digest(JSON.stringify({templateId:template.id,templateVersion:template.version||1,variantId:example.id,layout:example.layout||template.layout||null,overlay:example.overlays||example.overlay||null,fps:example.fps,frames:example.frames,cuts:example.cuts,fade:example.fade||null,guideId:example.guideId||example.id})).slice(0,20);}
function normalizedExample(root,t,e,file){
 const asset=p=>typeof p==='string'?file(p):p?.path?file(p.path):null;
 const audio=object(e.audio),audioFile=asset(audio.path||e.audioPath),available=audio.available===true&&!!audioFile&&['audio','video'].includes(audioFile.kind)&&audioFile.size>0;
 const playable=asset(e.src||e.video),demo=asset(e.demoSrc||e.demo),poster=asset(e.poster),demoPoster=asset(e.demoPoster)||poster;
 const studied=['studied','ready'].includes(e.cutPlanState)&&e.cutPlanReusable!==false&&e.defaultEligible!==false&&validCuts(e);
 return {...e,src:playable?.url||null,poster:poster?.url||null,demoSrc:demo?.url||null,demoPoster:demoPoster?.url||null,video:playable,demo,audio:{...audio,available,file:audioFile},audioAvailable:available,cutPlanReusable:studied,guide:guideView(guideFor(t,e),file),layoutKey:beatVariantKey(t,e),eligible:studied&&available&&guideValid(guideFor(t,e))};
}
function memberships(root,t,files){
 const explicit=list(t.inputs),map=new Map();
 if(t.id==='square')for(const f of files)if(f.kind==='video'&&f.path.startsWith('workspace/input/beat-montage/'))map.set(f.path,{id:digest(f.path).slice(0,16),path:f.path,name:f.name});
 for(const item of explicit)if(typeof item.path==='string')map.set(item.path,item);
 return [...map.values()].filter(i=>i.removedAt||localFile(root,i.path));
}
function mediaByPath(media,localPath){const map=new Map();for(const [hash,m] of Object.entries(media.clips||media))if(m?.path)for(const p of [m.path,...list(m.aliases)])map.set(localPath(p),{hash,...m});return map;}
function reviewedVariant(root,t,e,m,r,p,file){
 const was=beatSavedEdit(t,e,p?.variantId);
 if(!p||p.version!==1||p.templateId!==t.id||p.variantId!==was.id||p.layoutKey!==beatVariantKey(t,was)||p.source!==m.mezzanine||p.readingKey!==readingKey(r?.read))return null;
 if(p.status==='excluded'&&typeof p.reason==='string'&&p.reason.trim())return {excluded:true,reason:p.reason};
 const prefix=`workspace/library/mezzanine/beat-montage/${t.id}/${was.id}/`,w=p.usable,v=p.review;
 const window=x=>Number.isFinite(x?.from)&&Number.isFinite(x?.to)&&x.from>=0&&x.to<=m.duration&&x.to>x.from;
 if(p.status!=='ready'||!p.key||v?.key!==p.key||!['crop','colour','caption','motion'].every(k=>typeof v[k]==='string'&&v[k].trim())||typeof v.personVisible!=='boolean'||!window(w)||!p.video?.startsWith(prefix)||!p.sheet?.startsWith(prefix)||!file(p.video)||!file(p.sheet))return null;
 const moments=list(p.moments).length?p.moments:[w];
 if(!moments.every(x=>window(x)&&x.from>=w.from&&x.to<=w.to))return null;
 const ordered=moments.map(x=>({from:x.from,to:x.to})).sort((a,b)=>a.from-b.from);
 if(ordered.some((x,i)=>i&&x.from<ordered[i-1].to))return null;
 const person=r?.read?.human,personWindows=list(person?.windows).length?person.windows:[person];
 const human=v.personVisible&&person?.visible===true&&personWindows.some(h=>window(h)&&ordered.some(m=>Math.min(h.to,m.to)>Math.max(h.from,m.from)));
 return {prepared:true,usable:w,moments:ordered,preview:file(p.video),sheet:file(p.sheet),human,notes:['crop','colour','caption','motion'].map(k=>v[k])};
}
function inputState(root,t,e,members,{media,footage,file,localPath}){
 const active=members.filter(x=>!x.removedAt),files=active.map(i=>file(i.path)).filter(Boolean),g=guideFor(t,e);
 const legacy=t.id==='square'?beatInputState({files,media,footage,preparation:read(root,'workspace/library/beat-montage.preparation.json',{}),file,localPath}):null;
 const byPath=mediaByPath(media,localPath),preparation=read(root,`workspace/library/beat-montage/${t.id}/preparation.json`,{}),records=beatVariantClips(t,preparation,e?.id),seen=new Set();
 const clips=active.flatMap(item=>{
  const m=byPath.get(item.path),r=m&&footage.clips?.[m.hash],identity=m?.hash||item.sha256||item.path;if(seen.has(identity))return [];seen.add(identity);
  const understood=!!(m?.mezzanine&&file(localPath(m.mezzanine))&&r?.light&&r?.read?.what&&r?.read?.shows);
  let reviewed=understood&&e?reviewedVariant(root,t,e,m,r,records[m.hash],file):null;
  if(!records[m?.hash]&&legacy){const old=legacy.clips.find(c=>c.path===item.path);if(old?.prepared)reviewed={...old,moments:[old.usable]};else if(old?.excluded)reviewed={excluded:true,reason:old.reason};}
  return [{...item,file:file(item.path),hash:m?.hash||item.sha256||null,read:understood,prepared:!!reviewed?.prepared,excluded:!!reviewed?.excluded,...reviewed}];
 });
 const prepared=clips.filter(c=>c.prepared),excluded=clips.filter(c=>c.excluded).length,moments=prepared.reduce((n,c)=>n+c.moments.length,0),human=prepared.filter(c=>c.human).length;
 const minimum=g?.minimum||{},required=t.id==='square'?10:minimum.usableMoments??minimum.sceneSlots??(e?.cuts?.length+1||null),originals=Math.max(beatMinimumClips,minimum.originalFiles??minimum.originalFileMinimum??0);
 const ready=guideValid(g)&&Number.isInteger(required)&&required>0&&moments>=required&&(!Number.isInteger(originals)||prepared.length>=originals)&&(!(t.id==='square'||g?.requiresHumanOpening)||human>0);
 return {clips,total:clips.length,read:clips.filter(c=>c.read).length,prepared:prepared.length,excluded,pending:clips.length-prepared.length-excluded,human,usableMoments:moments,minimum:required,originalFileMinimum:originals,suggestedOriginals:beatSuggestedClips,ready,removed:members.filter(i=>i.removedAt),scope:t.id+'/'+(e?.id||'unlearned')};
}
function ownedOutputs(t,outputs,projects){return outputs.filter(o=>{const p=projects.find(p=>p.id===o.projectId),data=p?.data||{},id=data.beatMontage?.templateId||data.beat?.templateId||data.templateId||o.templateId;return o.format==='beat-montage'&&(id===t.id||!id&&t.id==='square');});}
export function reviewedBeatOutput(root,output,projects){
 const p=projects.find(p=>p.id===output.projectId);if(!p)return null;
 const directory=p.path||`workspace/projects/${p.id}`,check=read(root,directory+'/check.json',{}),review=read(root,directory+'/visual-review.json',{});
 const entry=list(review.outputs).find(r=>r.video===output.path)||review;
 const video=localFile(root,output.path),still=localFile(root,entry.still||output.cover?.path);
 if(check.ok!==true||review.status!=='approved'||entry.video!==output.path||!video?.size||!still?.size||still.kind!=='image'||!['semantic','crop','caption','motion'].every(k=>typeof entry[k]==='string'&&entry[k].trim()))return null;
 const keys=[p.data?.beatMontage?.renderKey,check.renderKey,review.renderKey];if(keys.some(Boolean)&&(!keys.every(k=>typeof k==='string'&&k)||new Set(keys).size!==1))return null;
 if(keys.some(Boolean)&&(!entry.videoHash&&!check.videoHash||!entry.coverHash&&!check.coverHash))return null;
 if(!matchesHash(root,output.path,entry.videoHash||check.videoHash)||!matchesHash(root,still.path,entry.coverHash||check.coverHash))return null;
 const caption=deliveryText(root,dirname(output.path)+'/caption.txt'),sound=deliveryText(root,dirname(output.path)+'/sound-card.md');
 if(!caption||!sound)return null;
 return {...output,...video,id:output.path,cover:still,caption,sound};
}
function deliveryText(root,path){const f=localFile(root,path);if(!f?.size||f.size>65536)return null;try{const text=readFileSync(join(root,path),'utf8').trim();return text?{...f,text}:null;}catch{return null;}}
// All workspace views use this same evidence when they call a montage delivered.
export function readBeatProject(root,project){
 const id=project.id||project.path?.split('/').at(-1),path=project.path||`workspace/projects/${id}`,data=project.data||read(root,path+'/project.json',{});
 const savedOutput=beatLocalPath(root,data.output),output=/^workspace\/output\/[^/]+$/.test(savedOutput)?savedOutput:`workspace/output/${id}`,candidates=scan(root,output).filter(f=>f.kind==='video'&&dirname(f.path)===output);
 const owner={...project,id,path,data},outputs=candidates.map(f=>reviewedBeatOutput(root,{...f,projectId:id,format:'beat-montage'},[owner])).filter(Boolean);
 const completed=outputs.length>0&&outputs.length===candidates.length,check=read(root,path+'/check.json',{}),key=data.beatMontage?.renderKey;
 const same=!!key&&check.renderKey===key,video=localFile(root,path+'/renders/montage.mp4'),cover=localFile(root,path+'/renders/cover.jpg');
 const preview=same&&video?.size&&typeof check.videoHash==='string'&&matchesHash(root,video.path,check.videoHash)?video:null;
 const poster=same&&cover?.size&&typeof check.coverHash==='string'&&matchesHash(root,cover.path,check.coverHash)?cover:null;
 const claimed=['exported','complete','done','posted'].includes(data.state)||!!data.exported_at;
 const stage=completed?'delivered':claimed?'delivery':data.state==='error'?'error':preview?'review':'rendering';
 const label=completed?'Livrée':stage==='delivery'?'Vérifier la livraison':stage==='review'?'Revue visuelle':stage==='error'?'À regarder':'Ta vidéo est en cours';
 return {complete:completed,outputPaths:outputs.map(o=>o.path),id,path,name:data.title||project.name||id,templateId:data.beatMontage?.templateId||data.beat?.templateId||data.templateId||'square',requestId:data.beatMontage?.requestId||null,completed,stage,label,error:stage==='error'?data.error||null:null,preview:completed?outputs[0]:preview,cover:completed?outputs[0].cover:poster,outputs,prompt:`/quick-cuts\nReprends le projet de montage "${id}". Lis son plan enregistré et ses vérifications actuelles. Termine ce qui manque et mets ce projet à jour.`};
}
function analysisPrompt(t,e){return `Analyse les clips que j’ai ajoutés pour le montage "${t.id}"${e?` avec la version "${e.id}"`:''}. Suis son guide de clips, prépare les recadrages et vérifie-les en mouvement.`;}
function referenceState(root,item,file){const source=item.source&&file(item.source),reading=item.reading&&safeFile(root,item.reading),demo=item.demo&&file(item.demo),grid=item.grid&&read(root,item.grid,{}),complete=!!(source&&reading&&demo&&grid?.edit?.source==='confirmed');return {...item,source:source||null,demo:demo||null,status:item.status==='ready'&&!complete?'ready-to-study':item.status};}
export function readBeatLibrary(root,{files,projects,outputs,fileInfo,file,media,footage,localPath,selectedInputPaths,templateId}={}){
 const index=projects&&outputs?null:outputIndex(root);projects??=index.projects;outputs??=index.outputs;
 const data=library(root),resolveFile=fileInfo||file||((p)=>localFile(root,p)),allFiles=files||scan(root,'workspace/input');
 const ctx={file:resolveFile,media:media||read(root,'context/inputs/media.json',{}),footage:footage||read(root,'context/inputs/footage.json',{}),localPath:localPath||((p)=>beatLocalPath(root,p))};
 const templates=definitions(root,data).map(t=>{
  const members=memberships(root,t,allFiles).filter(m=>!selectedInputPaths||t.id!==templateId||selectedInputPaths.includes(m.path)),examples=list(t.examples).map(e=>normalizedExample(root,t,e,resolveFile)),states=Object.fromEntries(examples.map(e=>[e.id,inputState(root,t,e,members,ctx)]));
  const plans=examples.filter(e=>e.eligible&&states[e.id].ready),selected=examples.find(e=>e.id===t.selectedExampleId),plan=plans.find(e=>e.id===t.selectedExampleId)||plans[0],display=selected||plan||examples.find(e=>e.id===(t.defaultExampleId||t.featured))||examples[0];
  const inputs=display?states[display.id]:inputState(root,t,null,members,ctx),songs=list(t.songs).map(s=>({...s,file:resolveFile(s.path),status:examples.some(e=>e.songId===s.id&&e.eligible)?'ready':'pending',prompt:`/new-format\nAnalyse la musique "${s.id}" pour le montage "${t.id}". Réutilise un enregistrement correspondant, puis enregistre ses coupes sur le rythme.`}));
  const progress=projects.filter(p=>(p.data?.format?.id||p.data?.format||p.format)==='beat-montage').map(p=>readBeatProject(root,p)).filter(p=>p.templateId===t.id);
  const out=ownedOutputs(t,outputs,projects).map(o=>reviewedBeatOutput(root,o,projects)).filter(Boolean).map(o=>({...o,favorite:list(t.favorites).includes(o.id||o.path)}));
  const scopedPreparation=`workspace/library/beat-montage/${t.id}/preparation.json`;
  const guides=Object.fromEntries(Object.entries(t.variantGuides||{}).map(([id,g])=>[id,guideView(g,resolveFile)]));
  return {...t,kind:t.id.startsWith('own-')?'Ton montage':'Notre modèle',examples,guide:guideView(guideFor(t,display),resolveFile),guides,variantGuides:guides,inputs,inputStates:states,songs,outputs:out,projects:progress,favorites:list(t.favorites),selectedExampleId:t.selectedExampleId||null,displayExampleId:display?.id||null,setup:{done:plans.length>0,status:plans.length?'ready':!members.some(m=>!m.removedAt)?'inputs':!examples.length?'study':!examples.some(e=>e.eligible)?'songs':'preparation'},generation:{ready:plans.length>0,planId:plan?.id||null,planIds:plans.map(e=>e.id),reason:plans.length?null:!examples.length?'Étudie d’abord ce montage.':!examples.some(e=>e.eligible)?'Ajoute une musique étudiée pour ce montage.':'Prépare assez de clips pour une de ses versions.'},analysisPrompt:analysisPrompt(t,display),preparationPath:t.id==='square'&&!safeFile(root,scopedPreparation)?'workspace/library/beat-montage.preparation.json':scopedPreparation,scopedPreparationPath:scopedPreparation,preferencesPath:`workspace/library/beat-montage/${t.id}/preferences.md`};
 });
 const refs=list(read(root,'workspace/library/beat-montage.references.json',{}).items).map(r=>referenceState(root,r,resolveFile));
 const references=list(data.batches).map(b=>{
  const t=data.templates[b.templateId],studied=t?.studyStatus==='ready'&&safeFile(root,t.reading?.json)?.stat.isFile()&&safeFile(root,t.reading?.markdown)?.stat.isFile(),requests=data.requests.filter(r=>r.batchId===b.id&&r.templateId===b.templateId);
  return {...b,items:list(b.referenceIds).map(id=>refs.find(r=>r.id===id)).filter(Boolean).map(r=>({...r,studyStatus:studied&&requests.some(q=>list(q.studiedReferenceIds).includes(r.id))?'complete':'pending'}))};
 });
 return {version:1,templates,references,unassignedReferences:refs.filter(r=>!list(data.batches).some(b=>list(b.referenceIds).includes(r.id))),requests:list(data.requests),availableInputs:allFiles.filter(f=>f.kind==='video'&&f.path.startsWith('workspace/input/')),libraryPath:BEAT_LIBRARY};
}

function request(data,type,templateId,fields,prompt){const item={id:randomUUID(),type,templateId,status:'pending',at:now(),...fields,prompt};item.prompt+=`\nUtilise la demande enregistrée "${item.id}".`;data.requests.push(item);return item;}
function persist(root,data,result){data.updatedAt=now();write(root,BEAT_LIBRARY,data);return result;}
function templateView(root,id){const view=readBeatLibrary(root).templates.find(t=>t.id===id);if(!view)fail(404,'Ce montage est introuvable.');return view;}
function plain(value,max=120){return typeof value==='string'?value.trim().slice(0,max):'';}
function inputPath(path){return typeof path==='string'&&path.startsWith('workspace/input/')&&!path.split('/').some(p=>!p||p==='.'||p==='..'||p.startsWith('.'));}
function outputIndex(root){const projects=[];for(const f of scan(root,'workspace/projects'))if(f.path.endsWith('/project.json'))projects.push({id:f.path.split('/')[2],data:read(root,f.path,{}),format:'beat-montage'});const outputs=scan(root,'workspace/output').filter(f=>f.kind==='video').map(f=>({...f,id:f.path,projectId:projects.find(p=>(p.data.output||`workspace/output/${p.id}`)===dirname(f.path))?.id,format:projects.find(p=>(p.data.output||`workspace/output/${p.id}`)===dirname(f.path))?.data.format?.id||projects.find(p=>(p.data.output||`workspace/output/${p.id}`)===dirname(f.path))?.data.format||(/beat-montage/.test(f.path)?'beat-montage':null)}));return {projects,outputs};}
export async function updateBeatLibrary(root,body){
 installed(root);if(!body||typeof body.action!=='string')fail(400,'Choisis une action de montage.');
 if(body.action==='save-references')return saveReferenceBatch(root,body);
 if(body.action==='reuse-inputs')return reuseBeatLibraryInputs(root,body);
 const data=library(root),id=body.templateId,t=requireTemplate(root,id,data),saved=savedTemplate(data,id);
 if(body.action==='select-edit'){
  if(body.exampleId!==null&&!list(t.examples).some(e=>e.id===body.exampleId))fail(400,'Choisis une version de ce montage.');saved.selectedExampleId=body.exampleId;
  return persist(root,data,{templateId:id,exampleId:body.exampleId});
 }
 if(['remove-input','restore-input'].includes(body.action)){
  const item=memberships(root,t,scan(root,'workspace/input')).find(i=>i.path===body.path);if(!item)fail(404,'Ce clip ne fait pas partie de ce montage.');
  const entry=list(saved.inputs).find(i=>i.path===body.path)||{...item};if(!saved.inputs.includes(entry))saved.inputs.push(entry);
  if(body.action==='remove-input')entry.removedAt=now();else{if(!localFile(root,entry.path))fail(404,'Le clip d’origine est manquant.');delete entry.removedAt;}
  return persist(root,data,{templateId:id,item:entry});
 }
 if(body.action==='rename-song'){
  const song=list(saved.songs).find(s=>s.id===body.songId),name=plain(body.name);if(!song)fail(404,'Cette musique est introuvable.');if(!name)fail(400,'Donne un nom à cette musique.');song.name=song.title=name;
  return persist(root,data,{templateId:id,song});
 }
 if(body.action==='favorite'){
  const index=outputIndex(root),output=ownedOutputs(t,index.outputs,index.projects).map(o=>reviewedBeatOutput(root,o,index.projects)).filter(Boolean).find(o=>o.id===body.outputId||o.path===body.outputId);if(!output)fail(404,'Choisis une vidéo finie de ce montage.');
  if(typeof body.value!=='boolean')fail(400,'Indique si tu gardes cette vidéo.');saved.favorites=body.value?[...new Set([...list(saved.favorites),output.id])]:list(saved.favorites).filter(x=>x!==output.id);
  write(root,`workspace/library/beat-montage/${id}/favorites.json`,{version:1,favorites:saved.favorites});write(root,`workspace/library/beat-montage/${id}/favorites.md`,saved.favorites.length?`# ${t.name||id}\n\nGarde la direction de ces variantes finies :\n\n${saved.favorites.map(p=>'- '+p).join('\n')}\n`:`# ${t.name||id}\n\nAucune variante favorite pour l’instant.\n`);
  return persist(root,data,{templateId:id,favorites:saved.favorites});
 }
 if(body.action==='request-analysis'){
  const displayId=body.exampleId||templateView(root,id).displayExampleId,e=list(t.examples).find(e=>e.id===displayId);if(body.exampleId&&!e)fail(400,'Choisis une version de ce montage.');if(!guideValid(guideFor(t,e)))fail(409,'Étudie d’abord ce montage et son guide de clips.');
  const inputPaths=memberships(root,t,scan(root,'workspace/input')).filter(i=>!i.removedAt).map(i=>i.path);
  const prompt=analysisPrompt(t,e),r=request(data,'analysis',id,{exampleId:e?.id||null,inputPaths},prompt);return persist(root,data,{templateId:id,request:r,prompt:r.prompt});
 }
 if(body.action==='request-edit'){
  const e=list(t.examples).find(e=>e.id===body.exampleId),view=templateView(root,id).examples.find(e=>e.id===body.exampleId);if(!e||!view)fail(400,'Choisis une version de ce montage.');if(view.eligible)fail(409,'Cette version a déjà sa musique, ses coupes et son guide de clips.');
  const needs=[...(!view.audioAvailable?['audio']:[]),...(!view.cutPlanReusable?['cuts']:[]),...(!guideValid(guideFor(t,e))?['guide']:[])];
  const work=[...(needs.includes('cuts')?[e.artifactFlag||e.defaultEligible===false?'Retire l’artefact de montage de la source et confirme des coupes propres.':'Confirme ses coupes exactes.']:[]),...(needs.includes('audio')?['Trouve un enregistrement correspondant utilisable.']:[]),...(needs.includes('guide')?['Complète son guide de clips.']:[])];
  const prompt=`/new-format\nPrépare la version "${e.id}" du montage "${id}". ${work.join(' ')} Garde son look mesuré et réutilise son guide de clips existant s’il est valide.`;
  const r=request(data,'edit-study',id,{exampleId:e.id,needs},prompt);return persist(root,data,{templateId:id,request:r,prompt:r.prompt});
 }
 if(body.action==='request-generation'){
  if(![1,5,10].includes(body.quantity))fail(400,'Choisis 1, 5 ou 10 variantes.');
  const selectedInputs=body.selectedInputPaths===undefined?null:body.selectedInputPaths;
  if(selectedInputs&&(!Array.isArray(selectedInputs)||!selectedInputs.length||selectedInputs.length>500||selectedInputs.some(p=>typeof p!=='string')))fail(400,'Choisis des clips d’origine de ce montage.');
  if(selectedInputs){const allowed=memberships(root,t,scan(root,'workspace/input')).filter(m=>!m.removedAt);if(selectedInputs.some(path=>!allowed.some(i=>i.path===path)))fail(400,'Choisis des clips d’origine de ce montage.');}
  const view=selectedInputs?readBeatLibrary(root,{templateId:id,selectedInputPaths:selectedInputs}).templates.find(t=>t.id===id):templateView(root,id);let plans=view.generation.planIds;
  if(body.exampleId){if(!plans.includes(body.exampleId))fail(409,'Cette version a besoin de sa musique ou de clips préparés.');plans=[body.exampleId];}
  if(!plans.length)fail(409,view.generation.reason);
  const selected=list(body.selectedOutputIds);if(selected.length>100||selected.some(x=>typeof x!=='string'))fail(400,'Choisis des variantes finies de ce montage.');
  if(selected.length){const index=outputIndex(root),allowed=ownedOutputs(t,index.outputs,index.projects).map(o=>reviewedBeatOutput(root,o,index.projects)).filter(Boolean);if(selected.some(id=>!allowed.some(o=>(o.id||o.path)===id)))fail(400,'Choisis des variantes finies de ce montage.');}
  const inputPaths=[...new Set(plans.flatMap(plan=>view.inputStates[plan].clips.filter(c=>c.prepared).map(c=>c.path)))];
  const n=body.quantity,prompt=`/quick-cuts\nGénère ${n} ${n===1?'exemple':'variantes'} pour le montage "${id}"${selected.length?' à partir de mes versions sélectionnées':''}. Utilise ses clips préparés et ses musiques enregistrées éligibles. Varie les clips et les accroches.`,r=request(data,'generation',id,{quantity:n,exampleIds:plans,selectedOutputIds:[...new Set(selected)],selectedInputPaths:selectedInputs?[...new Set(selectedInputs)]:null,more:body.more===true,inputPaths},prompt);
  return persist(root,data,{templateId:id,request:r,prompt:r.prompt});
 }
 fail(400,'Cette action de montage n’est pas disponible.');
}
async function saveReferenceBatch(root,body){
 const {saveBeatReferences}=await import('./beat-references.mjs');
 const name=plain(body.name)||'Mon montage',note=plain(body.note,500),data=library(root);let id=body.templateId;
 if(id){requireTemplate(root,id,data);if(!id.startsWith('own-'))fail(400,'Ajoute des références à l’un de tes propres montages.');}
 else{id='own-'+randomUUID();data.templates[id]={id,name,line:'Tes clips, d’après tes références.',description:'Un montage à apprendre de tes exemples.',layout:null,inputs:[],songs:[],examples:[],favorites:[],studyStatus:'pending'};}
 const result=saveBeatReferences(root,{links:body.links}),batch={id:randomUUID(),templateId:id,name,note,referenceIds:result.items.map(r=>r.id),at:now(),status:'pending'};data.batches.push(batch);
 const prompt=`/new-format\nApprends le montage "${id}" à partir de ces exemples. Regroupe les références qui se ressemblent dans un seul format. Enregistre son guide de clips, ses sous-titres, ses recadrages, ses musiques et ses coupes exactes.\n${result.items.map(r=>r.url).join('\n')}${note?'\nÀ garder : '+note:''}`;
 const r=request(data,'study',id,{batchId:batch.id,referenceIds:batch.referenceIds},prompt);batch.prompt=r.prompt;return persist(root,data,{templateId:id,batch,request:r,prompt:r.prompt});
}
function validName(name,kind){if(!name||name.length>800||name.includes('\\')||/[\x00-\x1f]/.test(name)||name.split('/').some(p=>!p||p.startsWith('.')||p.includes(':')||p.length>200))fail(400,'Choisis un fichier au nom simple.');if(!(kind==='song'?AUDIO:VIDEO).has(extname(name).toLowerCase()))fail(415,kind==='song'?'Ajoute un fichier audio.':'Ajoute des clips vidéo d’origine.');}
export async function uploadBeatLibraryInput(root,req,params){
 installed(root);if(params.get('reference')){const {uploadBeatInput}=await import('./workspace-beat-inputs.mjs');return uploadBeatInput(root,req,params);}
 const id=params.get('template')||params.get('templateId')||'square',kind=params.get('kind')||'clip',name=params.get('name');requireTemplate(root,id);if(!['clip','song'].includes(kind))fail(400,'Choisis des clips ou une musique.');validName(name,kind);
 if(id==='square'&&kind==='clip'){
  const {uploadBeatInput}=await import('./workspace-beat-inputs.mjs');
  const item=await uploadBeatInput(root,req,params),data=library(root),saved=savedTemplate(data,id),prior=list(saved.inputs).find(i=>i.path===item.path);if(prior)delete prior.removedAt;else saved.inputs.push(item);
  return persist(root,data,{...item,templateId:id,prompt:analysisPrompt(requireTemplate(root,id),null)});
 }
 const bytesLimit=kind==='song'?1024**3:20*1024**3;if(Number(req.headers?.['content-length'])>bytesLimit)fail(413,kind==='song'?'Ajoute des musiques de moins de 1 Go.':'Ajoute des clips de moins de 20 Go.');
 const itemId=randomUUID(),path=kind==='song'?`workspace/library/beat-montage/${id}/songs/${itemId}/${name}`:`workspace/input/beat-montage-templates/${id}/${itemId}/${name}`;directory(root,dirname(path));const temp=join(root,dirname(path),'.upload'),hash=createHash('sha256');let bytes=0;
 try{
  await pipeline(req,new Transform({transform(chunk,encoding,done){bytes+=chunk.length;hash.update(chunk);done(bytes>bytesLimit?new InputError(413,'Ce fichier est trop lourd.'):null,chunk);}}),createWriteStream(temp,{flags:'wx',mode:0o600}));if(!bytes)fail(400,'Ce fichier est vide.');const sha256=hash.digest('hex'),data=library(root),saved=savedTemplate(data,id),items=kind==='song'?saved.songs:saved.inputs;
  const prior=items.find(i=>i.sha256===sha256&&safeFile(root,i.path));if(prior){delete prior.removedAt;return persist(root,data,{...prior,templateId:id,existing:true,prompt:kind==='song'?songPrompt(id,prior.id):analysisPrompt(requireTemplate(root,id),null)});}
  const item={id:itemId,path,name:basename(name),title:kind==='song'?plain(params.get('title'))||basename(name,extname(name)):basename(name,extname(name)),bytes,sha256,status:'pending',at:now()};renameSync(temp,join(root,path));items.push(item);
  return persist(root,data,{...item,templateId:id,prompt:kind==='song'?songPrompt(id,item.id):analysisPrompt(requireTemplate(root,id),null)});
 }finally{rmSync(temp,{force:true});}
}
function songPrompt(templateId,songId){return `/new-format\nAnalyse la musique "${songId}" pour le montage "${templateId}". Réutilise un enregistrement correspondant, puis enregistre ses coupes sur le rythme.`;}
export async function reuseBeatLibraryInputs(root,body){
 installed(root);const id=body.templateId;requireTemplate(root,id);if(!Array.isArray(body.paths)||!body.paths.length||body.paths.length>100)fail(400,'Choisis les clips à ajouter.');
 const sources=[...new Set(body.paths)].map(path=>{const source=inputPath(path)&&safeFile(root,path);if(!source?.stat?.isFile()||!VIDEO.has(extname(path).toLowerCase()))fail(400,'Choisis un original dans ton dossier input.');return {path,...source};});
 const items=[];for(const source of sources){const stream=createReadStream(source.path);stream.headers={'content-length':source.stat.size};items.push(await uploadBeatLibraryInput(root,stream,new URLSearchParams({template:id,kind:'clip',name:basename(source.path)})));}
 return {templateId:id,items,prompt:analysisPrompt(requireTemplate(root,id),null)};
}

// Agent-only registration. A supplied URL or uploaded song is never enough to pass this gate.
export function registerBeatStudy(root,body){
 installed(root);const data=library(root),t=requireTemplate(root,body?.templateId,data),saved=savedTemplate(data,t.id),reading=body.reading;
 if(!reading?.json?.endsWith('.json')||!reading?.markdown?.endsWith('.md')||!safeFile(root,reading.json)?.stat.isFile()||!safeFile(root,reading.markdown)?.stat.isFile())fail(409,'Enregistre d’abord la lecture du montage en JSON et en Markdown.');
 const merged={...t,...body,id:t.id,variantGuides:{...t.variantGuides,...body.variantGuides}},examples=list(body.examples);if(!examples.length)fail(400,'Enregistre au moins une version mesurée.');
 for(const e of examples){if(!validCuts(e)||e.cutPlanState!=='studied'||!guideValid(guideFor(merged,e)))fail(409,'Chaque version étudiée a besoin de ses coupes exactes et d’un guide de clips complet.');if(e.audio?.available===true){const audio=localFile(root,e.audio.path);if(!audio||!['audio','video'].includes(audio.kind)||audio.size<1)fail(409,'Le fichier de la musique étudiée est manquant.');}}
 saved.reading=reading;saved.guide=body.guide||t.guide;saved.variantGuides=merged.variantGuides;saved.examples=[...new Map([...list(saved.examples),...examples].map(e=>[e.id,e])).values()];saved.studyStatus='ready';if(body.layout)saved.layout=body.layout;if(plain(body.name))saved.name=plain(body.name);
 if(body.requestId){
  const r=data.requests.find(r=>r.id===body.requestId&&['study','edit-study'].includes(r.type)&&r.templateId===t.id);if(!r)fail(400,'Choisis la demande d’étude de ce montage.');
  if(r.type==='edit-study'){if(!examples.some(e=>e.id===r.exampleId))fail(400,'Enregistre la version nommée dans cette demande.');r.registeredExampleIds=[...new Set([...list(r.registeredExampleIds),...examples.map(e=>e.id)])];}
  else{const ids=list(body.referenceIds);if(ids.some(id=>!list(r.referenceIds).includes(id)))fail(400,'Garde cette étude dans son lot de références.');r.studiedReferenceIds=[...new Set([...list(r.studiedReferenceIds),...ids])];}
 }
 return persist(root,data,{templateId:t.id,exampleIds:examples.map(e=>e.id)});
}

export function completeBeatRequest(root,{requestId}={}){
 installed(root);const data=library(root),r=data.requests.find(r=>r.id===requestId);if(!r)fail(404,'Cette demande de montage est introuvable.');
 const t=requireTemplate(root,r.templateId,data),view=templateView(root,t.id);
 if(r.type==='study'){
  if(t.studyStatus!=='ready'||!safeFile(root,t.reading?.json)?.stat.isFile()||!safeFile(root,t.reading?.markdown)?.stat.isFile()||!list(r.referenceIds).every(id=>list(r.studiedReferenceIds).includes(id)))fail(409,'Certaines études de référence ne sont pas finies.');
 }else if(r.type==='edit-study'){
  if(!list(r.registeredExampleIds).includes(r.exampleId)||!view.examples.some(e=>e.id===r.exampleId&&e.eligible)||!safeFile(root,t.reading?.json)?.stat.isFile()||!safeFile(root,t.reading?.markdown)?.stat.isFile())fail(409,'Cette version attend encore ses coupes confirmées, son enregistrement ou son guide de clips.');
 }else if(r.type==='analysis'){
  const state=view.inputStates[r.exampleId]||view.inputs;
  if(!list(r.inputPaths).length||!r.inputPaths.every(path=>state.removed.some(c=>c.path===path)||state.clips.some(c=>c.path===path&&(c.prepared||c.excluded))))fail(409,'Certains clips attendent encore la vérification de leur recadrage.');
 }else if(r.type==='generation'){
  const index=outputIndex(root),outputs=ownedOutputs(t,index.outputs,index.projects).filter(o=>index.projects.find(p=>p.id===o.projectId)?.data?.beatMontage?.requestId===r.id).map(o=>reviewedBeatOutput(root,o,index.projects)).filter(Boolean);
  if(outputs.length<r.quantity)fail(409,'Certaines variantes attendent encore leurs fichiers finis et leur revue visuelle.');r.outputPaths=outputs.map(o=>o.path);
 }else fail(400,'Cette demande ne peut pas être terminée ici.');
 r.status='complete';r.completedAt=now();const batch=data.batches.find(b=>b.id===r.batchId);if(batch)batch.status='complete';return persist(root,data,{request:r});
}
