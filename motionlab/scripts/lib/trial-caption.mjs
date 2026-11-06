// Trial captions stay close to their own source, and travel with the exact video they describe.
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
export const captionWords=text=>String(text??'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(Boolean).join(' ');
export function captionProblems(variants,source='') {
 if(!Array.isArray(variants)||!variants.length)return ['Aucune légende de variante n’a été fournie.'];
 const issues=[],seen=new Map(),original=String(source).trim();
 // A version carries no hashtags, so it is held to the length of the source without its own.
 const body=original.replace(/#[\p{L}\p{N}_]+/gu,'').replace(/[ \t]+/g,' ').trim();
 for(const v of variants){
  const text=typeof v.caption==='string'?v.caption.trim():'',words=captionWords(text);
  if(!words){issues.push(`${v.id} : écris une légende pour cette variante.`);continue;}
  if(/[\u2013\u2014]/.test(text))issues.push(`${v.id} : retire les tirets cadratins et demi-cadratins.`);
  if(/#[\p{L}\p{N}_]+/u.test(text))issues.push(`${v.id} : retire les hashtags.`);
  if(original&&words===captionWords(original))issues.push(`${v.id} : reformule légèrement la légende source ; changer la ponctuation ou la casse n’est pas une réécriture.`);
  if(original&&Math.abs(text.length-body.length)>Math.max(50,body.length*.2))issues.push(`${v.id} : garde la légende proche de la longueur de la source et conserve ses détails utiles.`);
  if(seen.has(words))issues.push(`${v.id} : donne à cette variante sa propre formulation ; sa légende répète ${seen.get(words)}.`);
  seen.set(words,v.id);
 }
 return issues;
}
export function trialCaptionFiles(project,root) {
 const read=path=>JSON.parse(readFileSync(path,'utf8'));
 const plan=read(join(project,'props/variants.json'));
 const posts=read(join(root,'context/posts.json'));
 const source=posts.find(p=>p.id===plan.source_post);
 if(!source)throw Error('Le post source manque. Lis-le avant d’exporter ses légendes.');
 const issues=captionProblems(plan.variants,source.caption||'');
 if(issues.length)throw Error(issues.join(' '));
 const videos=readdirSync(join(project,'renders')).filter(name=>name.endsWith('.mp4'));
 return videos.map(name=>{
  const id=name.slice(0,-4),variant=plan.variants.find(v=>v.id===id);
  if(!variant)throw Error(`${name} : cette vidéo rendue n’a pas de légende de variante correspondante.`);
  const from=join(project,'renders',id+'.caption.txt');
  if(!existsSync(from))throw Error(`${name} : son fichier de légende manque.`);
  if(readFileSync(from,'utf8').trim()!==variant.caption.trim())throw Error(`${name} : sa légende enregistrée est vide ou diffère de la variante vérifiée.`);
  return {from,to:id+'.caption.txt'};
 });
}
