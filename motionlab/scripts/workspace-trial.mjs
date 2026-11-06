// A format shows one current job. Counts, requests, approval and posting marks come from disk.
import {trialPosts} from './reading-policy.mjs';
import {TRIAL_INPUTS, trialNeeds, inputRemoved, needReady, requestedReels, postCode, instagramReel, roundFolder, trialBatch} from './trial-input-contract.mjs';
import {trialOutputProgress} from './trial-output-progress.mjs';
import {trialStudyTaskId} from './trial-task-identity.mjs';
export function trialWorkspace({read,file,posts,projects,document,outputs=[],previews=[],root=''}) {
  const review=read('context/trial-reels/review.json',{}),recordedAnalysis=read('context/trial-reels/analysis.json',null),selection=read('context/trial-reels/selection.json',null);
  const candidates=read('context/trial-reels/candidates.json',[]),library=read('workspace/library/trial-reels.json',{}),manifest=read(TRIAL_INPUTS,{});
  const measured=read('context/formats.json',{}).formats??[],media=Object.entries(read('context/inputs/media.json',{})).map(([id,m])=>({...m,id}));
  const rows=Array.isArray(candidates)?candidates:[],byPost=new Map(posts.map(p=>[p.id,p]));
  const initialIds=Array.isArray(selection?.ids)?selection.ids.slice(0,50):posts.some(p=>p.timestamp)?trialPosts(posts).map(p=>p.id):(rows.length?rows:posts).slice(0,50).map(p=>p.id);
  const selectedIds=new Set(initialIds);
  // Older complete readings predate the progress file. Reuse their actual classifications.
  const classifiedIds=new Set([...Object.keys(review.posts??{}),...(review.formats??[]).flatMap(f=>f.posts??[]),...measured.flatMap(f=>(f.posts??[]).map(p=>p.id))]);
  const classified=initialIds.filter(id=>classifiedIds.has(id)).length;
  const analysis=recordedAnalysis??((review.formats??[]).length?{status:classified===initialIds.length?'ready':'triage',selected:initialIds.length,classified,at:review.written??null}:null);
  const sourcePreviews=new Map();
  for(const image of previews){const match=image.path.match(/\/([^/]+)-full-[^/]+\.(?:jpg|png|webp)$/);if(match&&!sourcePreviews.has(match[1]))sourcePreviews.set(match[1],image);}
  const local=p=>String(p||'').replace(root?root+'/':/^$/,'');
  const source=id=>{
    const p=byPost.get(id)||{},c=rows.find(r=>r.id===id),code=postCode(p);
    return {id,caption:{text:String(p.caption||'')},name:review.posts?.[id]?.about||c?.caption_first_line||p.caption?.split('\n')[0]||'',reach:p.metrics?.reach??c?.metrics?.reach??null,
      thumbnail:sourcePreviews.get(id)||file(p.local?.preview)||file(p.local?.thumbnail||`context/posts/${id}.jpg`),video:file(p.local?.video||`context/posts/${id}.mp4`),permalink:instagramReel(p.permalink)?.url||(code?`https://www.instagram.com/reel/${code}/`:null)};
  };
  const formats=(review.formats??[]).filter(f=>f.id&&f.id!=='other').map(f=>{
    const inputs=manifest.formats?.[f.id]??{},round=inputs.rounds?.at(-1)??null,roundId=round?.id??'';
    const standing=library.formats?.[f.id]??{},state=roundId?standing.rounds?.[roundId]??{}:standing;
    const manual=requestedReels(manifest).filter(r=>r.formatId===f.id),manualIds=posts.filter(p=>manual.some(r=>r.code===postCode(p))).map(p=>p.id);
    const measuredIds=measured.find(m=>m.id===f.id)?.posts?.map(p=>p.id)??[];
    const knownIds=[...new Set([...(f.posts??measuredIds),...manualIds,...Object.entries(review.posts??{}).filter(([,p])=>p.format===f.id).map(([id])=>id)])];
    const selected=knownIds.filter(id=>!selectedIds||selectedIds.has(id));
    const roundIds=round?posts.filter(p=>round.links.some(l=>l.code===postCode(p))).map(p=>p.id):selected;
    const requestedBatch=trialBatch(state);
    const currentIds=requestedBatch?[...new Set(requestedBatch.posts.filter(id=>roundIds.includes(id)||(state.posts??[]).includes(id)))]:[...new Set([...roundIds,...state.posts??[]])];
    const first=state.first??(!round?library.plan?.formats?.find(p=>p.id===f.id)?.first:null)??{};
    const ownProjects=projects.filter(p=>p.data?.format_id?p.data.format_id===f.id:knownIds.includes(p.data?.source_post)||p.id===first.project);
    const firstProject=ownProjects.find(p=>p.id===first.project);
    const liveMedia=media.filter(m=>m.source_of&&knownIds.includes(m.source_of)&&m.mezzanine&&file(m.mezzanine)&&!inputRemoved(manifest,f.id,m,root));
    const items=(inputs.items??[]).filter(i=>(i.roundId||'')===roundId).map(i=>{
      const files=i.kind==='drive'?(read(`${i.path}/drive.json`,{}).files??[]).map(p=>file(p.local)).filter(Boolean):[];
      const own=file(i.path);
      return {...i,file:own,files,status:i.kind==='drive'?files.length?'Importé':'À importer':own?'Ajouté':'Manquant'};
    });
    const legacy=round?[]:liveMedia.filter(m=>!items.some(i=>local(m.path)===i.path||local(m.path).startsWith(i.path+'/'))).map(m=>({id:`media-${m.id}`,mediaId:m.id,kind:'media',name:(m.path||m.mezzanine).split('/').pop(),file:file(m.path)||file(m.mezzanine),status:'Prêt'}));
    const inputFolder=roundFolder(f.id,roundId),proofName=f.id+(roundId?'--'+roundId:'');
    const checks=read(`context/trial-reels/inputs/${proofName}.json`,{}).needs??{};
    const examples=currentIds.map(source).sort((a,b)=>(b.reach??0)-(a.reach??0));
    if(round)for(const link of round.links)if(!examples.some(e=>instagramReel(e.permalink)?.code===link.code))examples.push({id:link.code,name:'',permalink:link.url,thumbnail:null,video:null});
    const requested=trialNeeds(round?{need:state.need??f.need,source:state.source??f.source}:f);
    const without=state.without??f.without??(f.kind==='talking head'?'Envoie la même vidéo montée sans le titre d’ouverture. Garde son rythme et les autres sous-titres.':f.kind==='montage'?'Garde les coupes. Retire le texte ajouté, les sous-titres et les graphismes.':'Envoie les prises d’origine, sans texte ajouté, sous-titres ni graphismes.');
    const needs=requested.map((n,index)=>{
      const received=items.filter(i=>i.needId===n.id&&i.status!=='Manquant');
      const ready=needReady(n,requested,round?[]:liveMedia,checks,file,manifest,f.id,root);
      const assigned=(n.posts??n.show?.filter(s=>s.post).map(s=>s.post)??[]);
      // Explicit per-need examples stay grouped. The first need also covers every unassigned source.
      const assignedElsewhere=new Set(requested.filter((_,i)=>i!==index).flatMap(x=>x.posts??x.show?.filter(s=>s.post).map(s=>s.post)??[]));
      const references=examples.filter(e=>assigned.includes(e.id)||index===0&&!assignedElsewhere.has(e.id)||requested.length===1);
      return {...n,references,ready,status:ready?'Prêt':received.some(i=>i.kind==='file'||i.files.length)?'Ajouté':received.length?'À importer':'À ajouter'};
    });
    const originalsReady=needs.every(n=>n.ready),studyPath=`context/trial-reels/study/${f.id}.md`;
    const studied=!!document(studyPath)&&!!read(`context/trial-reels/study/${f.id}.json`,null)&&(!round||!!state.studied_at);
    const reviewed=!!(first.presented_at||first.presented)&&!!firstProject,approved=!!first.agreed_at&&reviewed;
    const trackers=new Map();
    for(const p of ownProjects){const data=read(`${p.outputPath??`workspace/output/${p.id}`}/tracker.json`,[]);trackers.set(p.id,Array.isArray(data)?data:data.rows??[]);}
    const groups=new Map();
    for(const output of outputs){
      const project=ownProjects.find(p=>p.id===output.projectId||output.path.startsWith((p.outputPath||`workspace/output/${p.id}`)+'/'));
      if(!project?.data?.source_post)continue;
      const id=project.data.source_post,tracked=trackers.get(project.id)?.find(r=>r.file===output.path.split('/').pop());
      const posted=inputs.posted?.[output.path]?.posted??!!tracked?.posted_on;
      if(!groups.has(id))groups.set(id,{source:source(id),outputs:[]});
      groups.get(id).outputs.push({...output,roundId:project.data?.round_id||'',posted,postedAt:inputs.posted?.[output.path]?.at??tracked?.posted_on??null,what:tracked?.what??output.name});
    }
    const outputGroups=[...groups.values()];
    for(const group of outputGroups)group.outputs.sort((a,b)=>a.path.localeCompare(b.path,undefined,{numeric:true}));
    const allOutputs=outputGroups.flatMap(g=>g.outputs);
    const results=ownProjects.flatMap(p=>(trackers.get(p.id)??[]).map(r=>({file:r.file,postedOn:r.posted_on??null,views:r.plays??null,reach:r.reach??null,projectId:p.id})));
    const variationTarget=requestedBatch?.variations_per_source??5;
    const completion=trialOutputProgress({sources:currentIds,outputs:outputGroups.flatMap(g=>g.outputs.map(o=>({...o,sourceId:g.source.id}))),roundId,target:variationTarget,sourceTargets:requestedBatch?.source_targets});
    const batch=completion.batch;
    const canGenerate=approved||!!requestedBatch;
    const eligibleIds=[...new Set([...selected,...manualIds])];
    const uncreated=eligibleIds.filter(id=>!(groups.get(id)?.outputs.some(o=>o.caption?.text?.trim()))).map(source).sort((a,b)=>(b.reach??0)-(a.reach??0));
    const generated=canGenerate&&completion.complete;
    const hasInputs=items.some(i=>i.status!=='Manquant')||legacy.length>0;
    const stage=canGenerate?generated?'results':'versions':!originalsReady?'originals':!studied?'study':'test';
    const screen=canGenerate?'outputs':reviewed?'test':hasInputs||originalsReady?'study':'inputs';
    const absoluteFolder=root?`${root}/${inputFolder}`:inputFolder;
    const nothingToAdd=!requested.length;
    const prompt=nothingToAdd?`/trial-reels\nRien à envoyer pour ${f.name} : seuls les mots changent sur la vidéo publiée. Étudie-la, puis fais le test sans attendre d’autre prompt : un reel avec son jeu complet, jusqu’à 5 versions.${roundId?` Demande : ${roundId}.`:''}`:`/trial-reels\nVérifie tous les fichiers dans ${JSON.stringify(absoluteFolder)}. Associe-les aux reels demandés pour ${f.name}, étudie-les, puis fais le test sans attendre d’autre prompt : un reel avec son jeu complet, jusqu’à 5 versions.${roundId?` Demande : ${roundId}.`:''}`;
    const testPrompt=`/trial-reels\nJ’approuve le test pour ${f.name}${roundId?` (demande ${roundId})`:''}. Le jeu est bon. Fais jusqu’à 5 variantes pour chacun des autres reels, chacune avec une légende légèrement reformulée à partir de sa source. Puis montre les vidéos finies.`;
    const title={inputs:'1) Ajoute tes fichiers',study:studied?'Préparation de ton test':nothingToAdd?'Rien à envoyer':'2) Étude de tes fichiers',test:'Trial Reel de test',outputs:''}[screen];
    return {id:f.id,name:f.name,kind:f.kind,what:f.what??'',cover:examples.find(e=>e.thumbnail||e.video)||knownIds.map(source).find(e=>e.thumbnail||e.video),without,needs,inputs:[...items,...legacy],removed:(inputs.removed??[]).map(i=>({id:i.id,name:i.name})),examples,posts:knownIds.filter(id=>!selectedIds||selectedIds.has(id)||manualIds.includes(id)).length,
      roundId,inputFolder,stage,screen,title,prompt,testPrompt,approved,canGenerate,batch,uncreated,variationTarget,originalsReady,studied,studyTaskId:trialStudyTaskId(f.id),studyPath:studied?studyPath:null,firstProjectId:firstProject?.id??null,projectIds:ownProjects.map(p=>p.id),outputGroups,variationCount:allOutputs.length,sourceCount:outputGroups.length,postedCount:allOutputs.filter(o=>o.posted).length,results,complete:generated,
      steps:[['originals','Fichiers',originalsReady],['study','Étude',studied],['test','Test',approved]].map(([id,label,done])=>({id,label,status:done?'done':id===stage?'current':'pending'}))};
  }).filter(f=>f.posts>0||f.examples.length||f.projectIds.length);
  return {formats,analysis,selection,reviewPage:file('workspace/trial-reels-review.html'),selected:selection?.ids?.length??analysis?.selected??initialIds.length,excluded:analysis?.excluded??0,nextFormat:library.plan?.next?.format??formats[0]?.id??null};
}
