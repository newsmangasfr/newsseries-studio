// Local input storage only. Imports, studies, approvals and renders remain agent work.
import {readFileSync, writeFileSync, mkdirSync, renameSync, rmSync, createWriteStream, lstatSync} from 'node:fs';
import {join, dirname, extname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import {safeFile, readWorkspace} from './workspace-state.mjs';
import {TRIAL_INPUTS, trialNeeds, instagramReel, roundFolder} from './trial-input-contract.mjs';

export class InputError extends Error { constructor(status,message) { super(message); this.status=status; } }
const invalid = message => { throw new InputError(400,message); };
const extensions = new Set('.mp4 .mov .m4v .mkv .webm .avi .mp3 .m4a .wav .aac .flac .ogg .aiff .jpg .jpeg .png .webp .heic .heif .gif .avif .txt .md .csv .rtf .srt .vtt .pdf .zip'.split(' '));
const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/;
const read = (root,path,fallback) => { const f=safeFile(root,path); if(!f)return fallback; try{return JSON.parse(readFileSync(f.path,'utf8'));}catch{throw new InputError(409,'Ton dossier se met à jour. Réessaie.');} };
function directory(root,path,hidden=false) {
  let current='';
  for(const part of path.split('/')) {
    if(!part||part==='.'||part==='..'||part.includes('\\'))invalid('Choisis un dossier de fichiers valide.');
    current=current?current+'/'+part:part;
    try { mkdirSync(join(root,current)); } catch(error) { if(error.code!=='EEXIST')throw error; }
    if(!safeFile(root,current,{hidden})?.stat.isDirectory())throw new InputError(403,'Les fichiers doivent rester dans ton dossier de travail.');
  }
  return join(root,path);
}
function save(root,value) {
  directory(root,dirname(TRIAL_INPUTS));
  const temp=join(root,`${TRIAL_INPUTS}.${randomUUID()}.tmp`);
  writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});
  renameSync(temp,join(root,TRIAL_INPUTS));
}
function context(root,formatId,needId='',roundId='') {
  if(!idPattern.test(formatId||''))invalid('Choisis un format.');
  const format=read(root,'context/trial-reels/review.json',{}).formats?.find(f=>f.id===formatId&&f.id!=='other'&&f.kind!=='talking head');
  if(!format)throw new InputError(404,'Ce format ne figure plus dans l’analyse de ton compte.');
  const manifest=read(root,TRIAL_INPUTS,{version:1,formats:{}});
  manifest.formats ??= {};
  if(!Object.hasOwn(manifest.formats,formatId))manifest.formats[formatId]={items:[],removed:[]};
  const entry=manifest.formats[formatId];
  entry.items ??= []; entry.removed ??= [];
  const round=roundId?(entry.rounds??[]).find(r=>r.id===roundId):null;
  if(roundId&&!round)invalid('Cette demande n’est plus disponible.');
  const state=round?read(root,'workspace/library/trial-reels.json',{}).formats?.[formatId]?.rounds?.[roundId]:null;
  const needs=trialNeeds(round?{need:state?.need??format.need}:format);
  if(needId&&!needs.some(n=>n.id===needId))invalid('Choisis un des fichiers attendus pour ce format.');
  return {format,manifest,entry};
}
export async function uploadInput(root,req,params) {
  const formatId=params.get('format'),needId=params.get('need')||'',name=params.get('name'),roundId=params.get('round')||'';
  context(root,formatId,needId,roundId);
  if(!name||name.length>800||name.includes('\\')||/[\x00-\x1f]/.test(name)||name.split('/').some(p=>!p||p.startsWith('.')||p.includes(':')||p.length>200))invalid('Choisis un fichier au nom simple.');
  if(!extensions.has(extname(name).toLowerCase()))throw new InputError(415,'Ajoute des vidéos, des sons, des images, des documents ou un dossier ZIP.');
  const limit=20*1024**3;
  if(Number(req.headers['content-length'])>limit)throw new InputError(413,'Passe par un dossier Drive pour les fichiers de plus de 20 Go.');
  const id=randomUUID(),path=`${roundFolder(formatId,roundId)}/uploads/${id}/${name}`;
  directory(root,dirname(path));
  const temporary=join(root,dirname(path),'.upload');
  let bytes=0;
  try {
    await pipeline(req,new Transform({transform(chunk,encoding,done){bytes+=chunk.length;done(bytes>limit?new InputError(413,'Passe par un dossier Drive pour les fichiers de plus de 20 Go.'):null,chunk);}}),createWriteStream(temporary,{flags:'wx',mode:0o600}));
    if(!bytes)invalid('Ce fichier est vide.');
    // Reload after streaming so concurrent uploads cannot overwrite each other's records.
    const {manifest,entry}=context(root,formatId,needId,roundId);
    renameSync(temporary,join(root,path));
    const item={id,kind:'file',name,path,bytes,needId,roundId,at:new Date().toISOString()};
    entry.items.push(item);
    try{save(root,manifest);}catch(error){rmSync(join(root,path),{force:true});throw error;}
    return item;
  } finally {rmSync(temporary,{force:true});}
}
export function changeInput(root,body) {
  const {formatId,needId='',roundId='',action}=body;
  const {format,manifest,entry}=context(root,formatId,needId,roundId);
  let item;
  if(action==='request-reels') {
    if(!Array.isArray(body.links)||!body.links.length)invalid('Ajoute les liens de tes reels Instagram, un par ligne.');
    const links=body.links.map(instagramReel);
    if(links.some(l=>!l))invalid('Utilise des liens de reels ou de posts Instagram, un par ligne.');
    const unique=[...new Map(links.map(l=>[l.code,l])).values()];
    entry.rounds??=[];
    const latest=entry.rounds.at(-1),library=read(root,'workspace/library/trial-reels.json',{});
    if(latest&&!library.formats?.[formatId]?.rounds?.[latest.id]?.first?.agreed_at)throw new InputError(409,'Termine le test en cours avant d’ajouter une autre série.');
    item={id:randomUUID(),links:unique,at:new Date().toISOString()};entry.rounds.push(item);
    directory(root,roundFolder(formatId,item.id));
  } else if(action==='posted') {
    if(typeof body.posted!=='boolean'||typeof body.path!=='string')invalid('Indique si cette variante a été publiée.');
    const snapshot=readWorkspace(root),model=snapshot.trial?.formats.find(f=>f.id===formatId);
    const output=model?.outputGroups?.flatMap(g=>g.outputs).find(o=>o.path===body.path);
    if(!output)throw new InputError(404,'Cette variante n’est pas une vidéo finie de ce format.');
    entry.posted??={};item={posted:body.posted,at:new Date().toISOString()};entry.posted[body.path]=item;
  } else if(action==='drive') {
    let url;try{url=new URL(body.url);}catch{invalid('Colle le lien d’un dossier Google Drive.');}
    const folderId=/^\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)\/?$/.exec(url.pathname)?.[1];
    if(url.protocol!=='https:'||url.hostname!=='drive.google.com'||url.username||url.password||url.port||!folderId)invalid('Colle le lien d’un dossier Google Drive.');
    const canonical=`https://drive.google.com/drive/folders/${folderId}`;
    const existing=entry.items.find(i=>i.kind==='drive'&&i.url===canonical&&i.needId===needId&&(i.roundId||'')===roundId);
    if(existing)return existing;
    const id=randomUUID();
    item={id,kind:'drive',name:'Dossier Drive',folderId,url:canonical,needId,roundId,path:`${roundFolder(formatId,roundId)}/drive/${id}`,at:new Date().toISOString()};
    entry.items.push(item);
  } else if(action==='remove-media') {
    const media=read(root,'context/inputs/media.json',{});
    const source=Object.hasOwn(media,body.mediaId)?media[body.mediaId]:null;
    const review=read(root,'context/trial-reels/review.json',{});
    const ids=[...(format.posts??[]),...Object.entries(review.posts??{}).filter(([,p])=>p.format===formatId).map(([id])=>id)];
    if(!source?.source_of||!ids.includes(source.source_of))throw new InputError(404,'Ce fichier n’appartient pas à ce format.');
    item={id:`media-${body.mediaId}`,kind:'media',mediaId:body.mediaId,paths:[source.path,source.mezzanine].filter(Boolean).map(p=>p.replaceAll('\\','/').replace(root.replaceAll('\\','/')+'/','')),name:String(source.path||source.mezzanine).split(/[\\/]/).pop(),removedAt:new Date().toISOString()};
    if(!entry.removed.some(i=>i.id===item.id))entry.removed.push(item);
  } else if(action==='remove') {
    const index=entry.items.findIndex(i=>i.id===body.id);
    if(index<0)throw new InputError(404,'Ce fichier a déjà été retiré.');
    item=entry.items[index];
    const prefix=`workspace/input/trial-reels/${formatId}/`;
    if(!item.path?.startsWith(prefix))throw new InputError(403,'Ce fichier est en dehors du dossier de son format.');
    const file=safeFile(root,item.path);
    if(file) {
      const trash=`.motionlab/removed-inputs/${randomUUID()}`;
      directory(root,dirname(trash),true);
      renameSync(file.path,join(root,trash));item={...item,trash};
    }
    entry.items.splice(index,1);entry.removed.push({...item,removedAt:new Date().toISOString()});
    try{save(root,manifest);}catch(error){if(item.trash)renameSync(join(root,item.trash),join(root,item.path));throw error;}
    return item;
  } else if(action==='restore') {
    const index=entry.removed.findIndex(i=>i.id===body.id);
    if(index<0)throw new InputError(404,'Ce fichier n’a pas pu être restauré.');
    item=entry.removed[index];
    if(item.kind==='media'){entry.removed.splice(index,1);save(root,manifest);return item;}
    if(!item.path?.startsWith(`workspace/input/trial-reels/${formatId}/`))throw new InputError(403,'Ce fichier est en dehors du dossier de son format.');
    if(item.trash) {
      const file=safeFile(root,item.trash,{hidden:true});
      if(!file||!/^\.motionlab\/removed-inputs\/[\w-]+$/.test(item.trash))throw new InputError(404,'Le fichier retiré n’est plus là.');
      directory(root,dirname(item.path));
      try{lstatSync(join(root,item.path));throw new InputError(409,'Un fichier occupe déjà cet emplacement.');}catch(error){if(error.code!=='ENOENT')throw error;}
      renameSync(file.path,join(root,item.path));
    }
    const restored={...item};delete restored.trash;delete restored.removedAt;
    entry.removed.splice(index,1);entry.items.push(restored);
    try{save(root,manifest);}catch(error){if(item.trash)renameSync(join(root,item.path),join(root,item.trash));throw error;}
    return restored;
  } else invalid('Choisis une action sur le fichier.');
  save(root,manifest);return item;
}
