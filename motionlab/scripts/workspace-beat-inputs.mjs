// Stream original clips into the montage library. Analysis remains the agent's work.
import {readFileSync,writeFileSync,mkdirSync,renameSync,rmSync,createWriteStream,createReadStream} from 'node:fs';
import {join,dirname,extname,basename} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {referenceLibrary,updateBeatReference} from './beat-references.mjs';
import {safeFile} from './workspace-state.mjs';
import {InputError} from './workspace-inputs.mjs';
const manifestPath='workspace/library/beat-montage.inputs.json';
function directory(root,path){
 let at='';for(const part of path.split('/')){at+=(at?'/':'')+part;try{mkdirSync(join(root,at));}catch(e){if(e.code!=='EEXIST')throw e;}if(!safeFile(root,at)?.stat.isDirectory())throw new InputError(403,'Les fichiers doivent rester dans ton dossier de travail.');}
}
function read(root,path,fallback){const f=safeFile(root,path);if(!f)return fallback;try{return JSON.parse(readFileSync(f.path,'utf8'));}catch{throw new InputError(409,'Ton dossier se met à jour. Réessaie.');}}
export async function reuseBeatInputs(root,body){
 if(!Array.isArray(body?.paths)||body.paths.length<1||body.paths.length>100)throw new InputError(400,'Choisis les clips à ajouter.');
 const sources=[...new Set(body.paths)].map(path=>{
  const source=typeof path==='string'&&path.startsWith('workspace/input/')&&!path.startsWith('workspace/input/beat-montage/')&&safeFile(root,path);
  if(!source?.stat?.isFile()||!['.mp4','.mov','.m4v','.mkv','.webm','.avi'].includes(extname(path).toLowerCase()))throw new InputError(400,'Choisis un original dans ton dossier input.');
  return source;
 });
 const items=[];
 for(const source of sources){const stream=createReadStream(source.path);stream.headers={'content-length':source.stat.size};items.push(await uploadBeatInput(root,stream,new URLSearchParams({name:basename(source.path)})));}
 return {items};
}
export async function uploadBeatInput(root,req,params){
 if(!read(root,'runtime.json',{}).packs?.some(p=>p.name==='quick-cuts'))throw new InputError(404,'Beat Montage n’est pas installé.');
 const reference=params.get('reference');
 if(reference&&!referenceLibrary(root).items.some(i=>i.id===reference))throw new InputError(404,'Cette référence est introuvable.');
 const name=params.get('name');
 if(!name||name.length>800||name.includes('\\')||/[\x00-\x1f]/.test(name)||name.split('/').some(p=>!p||p.startsWith('.')||p.includes(':')||p.length>200))throw new InputError(400,'Choisis un clip au nom simple.');
 if(!['.mp4','.mov','.m4v','.mkv','.webm','.avi'].includes(extname(name).toLowerCase()))throw new InputError(415,'Ajoute des clips vidéo d’origine.');
 const limit=20*1024**3;
 if(Number(req.headers['content-length'])>limit)throw new InputError(413,'Ajoute ici des fichiers de moins de 20 Go.');
 const id=randomUUID(),path=reference?`workspace/library/beat-montage/references/${reference}/source/${id}/${name}`:`workspace/input/beat-montage/${id}/${name}`;
 directory(root,dirname(path));
 const temporary=join(root,dirname(path),'.upload'),hash=createHash('sha256');let bytes=0;
 try{
  await pipeline(req,new Transform({transform(chunk,encoding,done){bytes+=chunk.length;hash.update(chunk);done(bytes>limit?new InputError(413,'Ajoute ici des fichiers de moins de 20 Go.'):null,chunk);}}),createWriteStream(temporary,{flags:'wx',mode:0o600}));
  if(!bytes)throw new InputError(400,'Ce clip est vide.');
  const digest=hash.digest('hex');
  if(reference){
   const current=referenceLibrary(root).items.find(i=>i.id===reference);
   if(current.sha256===digest&&safeFile(root,current.source))return {...current,existing:true};
   renameSync(temporary,join(root,path));
   return updateBeatReference(root,reference,{source:path,sha256:digest,status:'ready-to-study',message:null,demo:null,grid:null,reading:null});
  }
  const manifest=read(root,manifestPath,{version:1,items:[]});
  const prior=manifest.items.find(i=>i.sha256===digest&&safeFile(root,i.path));if(prior)return {...prior,existing:true};
  const item={id,path,name,bytes,sha256:digest,at:new Date().toISOString()};
  directory(root,dirname(manifestPath));
  const next=join(root,manifestPath+'.'+id+'.tmp');
  renameSync(temporary,join(root,path));
  try{writeFileSync(next,JSON.stringify({...manifest,items:[...manifest.items,item]},null,2)+'\n',{flag:'wx',mode:0o600});renameSync(next,join(root,manifestPath));}catch(e){rmSync(join(root,path),{force:true});throw e;}finally{rmSync(next,{force:true});}
  return item;
 }finally{rmSync(temporary,{force:true});}
}
