// Shared voice choices. The key input never enters a saved draft or prompt.
export const PRODUCT_VOICE_VERSION = 1;
export const productVoiceProviders = [
  {id:'openai',name:'OpenAI',key:'OPENAI_API_KEY',note:'Utilise ton crédit API OpenAI.',url:'https://platform.openai.com/api-keys',pricing:'https://developers.openai.com/api/docs/pricing'},
  {id:'elevenlabs',name:'ElevenLabs',key:'ELEVENLABS_API_KEY',note:'Un abonnement payant est nécessaire pour les films commerciaux.',url:'https://elevenlabs.io/app/developers/api-keys',pricing:'https://elevenlabs.io/pricing'},
  {id:'fish',name:'Fish Audio',key:'FISH_API_KEY',note:'Un modèle API gratuit est disponible ; les autres modèles sont payants.',url:'https://fish.audio/app/developers/',pricing:'https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits'},
  {id:'other',name:'Un autre service',note:'Ton agent vérifie son accès et ses tarifs.'},
  {id:'none',name:'Pas de voix off',note:'Raconter l’histoire avec l’animation et les mots à l’écran.'},
];
export function productVoiceKeyName(provider) {
  return productVoiceProviders.find(p=>p.id===provider)?.key || (provider==='other'?'PRODUCT_DEMO_VOICE_API_KEY':null);
}
export async function writeProductVoiceKey(provider,key,{fetcher=fetch}={}) {
  let response;
  try{response=await fetcher('/api/product-demo/key',{method:'POST',headers:{'Content-Type':'application/json','X-MotionLab-Write':'voice-key'},body:JSON.stringify({provider,key}),signal:AbortSignal.timeout(10000)});}
  catch{throw Error('Impossible de joindre ton espace de travail. Ta clé est toujours là. Réessaie.');}
  let value;
  try{value=await response.json();}catch{}
  if(!response.ok){
    if([404,405].includes(response.status))throw Error('L’espace de travail doit être mis à jour. Demande à ton agent de le rouvrir, puis réessaie.');
    throw Error(typeof value?.error==='string'?value.error:'Ta clé n’a pas pu être enregistrée. Réessaie.');
  }
  if(value?.ok!==true||!value.keys||value.keys[provider]!==true&&provider!=='other')throw Error('L’enregistrement de ta clé n’a pas été confirmé. Réessaie.');
  return {keys:value.keys};
}
export function normalizeProductVoice(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Choisis un service de voix.');
  // Reject accidental secrets instead of allowing them into the saved preferences.
  if (Object.keys(input).some(key=>!['provider','voice','service'].includes(key))) throw Error('Colle les clés API dans le champ Clé API.');
  if (!productVoiceProviders.some(p=>p.id===input.provider)) throw Error('Choisis un service de voix.');
  const text = value => typeof value === 'string' ? value.trim() : '';
  const voice = text(input.voice), service = text(input.service);
  if (voice.length>500 || service.length>200 || /[\r\n\u2014\u2013]/.test(voice+service)) throw Error('Garde les noms de voix et de service courts, sur une seule ligne.');
  if (/\b(?:sk-|sk_|Bearer\s)/i.test(voice+service)) throw Error('Colle les clés API dans le champ Clé API.');
  if (input.provider==='other'&&!service) throw Error('Indique le nom de ton service de voix.');
  return {provider:input.provider,voice:input.provider==='none'?'':voice,service:input.provider==='other'?service:''};
}
export function productVoiceReady(f) {
  if (!f?.setup?.done || f.setup.version<PRODUCT_VOICE_VERSION) return false;
  try { normalizeProductVoice(f.answers?.voice); return Boolean(f.answers?.voice); } catch { return false; }
}
export function productVoiceDraft(f,d) {
  if(!d.setupDraft&&f.answers?.voice){d.productVoiceProvider=f.answers.voice.provider;d.productVoiceName=f.answers.voice.voice||'';d.productVoiceService=f.answers.voice.service||'';}
  d.productVoiceProvider ??= f.answers?.voice?.provider || productVoiceProviders.find(p=>p.key&&f.productVoice?.keys?.[p.id])?.id || 'openai';
  d.productVoiceName ??= f.answers?.voice?.voice || '';
  d.productVoiceService ??= f.answers?.voice?.service || '';
  return {provider:d.productVoiceProvider,voice:d.productVoiceName,service:d.productVoiceService};
}
export function productVoiceLabel(voice) {
  return voice?.provider==='other'?voice.service:productVoiceProviders.find(p=>p.id===voice?.provider)?.name || 'Ton service de voix';
}
export function productVoicePrompt(voice) {
  voice=normalizeProductVoice(voice);
  return '/product-demo setup\n'+(voice.provider==='none'?'Enregistre ma préférence Product Demo : pas de voix off.':`Utilise ${JSON.stringify(productVoiceLabel(voice))} pour la voix off de mes Product Demo${voice.voice?', avec la voix '+JSON.stringify(voice.voice):', avec une voix que tu choisis'}.`)+
    ' '+(voice.provider==='none'?'Garde ce choix pour les prochains films et ouvre le formulaire produit.':'Utilise mon accès enregistré, enregistre ce choix de voix pour les prochains films, puis ouvre le formulaire produit.');
}
export function productVoicePage(f,d,{esc,heading,field,button,link},sub) {
  const choice=productVoiceDraft(f,d),provider=productVoiceProviders.find(p=>p.id===choice.provider)||productVoiceProviders[0];
  let saved=false;
  try{saved=productVoiceReady(f)&&JSON.stringify(normalizeProductVoice(f.answers.voice))===JSON.stringify(normalizeProductVoice(choice));}catch{}
  if(sub==='setup/prompt'){
    if(saved)d.setupDraft=false;
    let prompt;try{prompt=productVoicePrompt(choice);}catch{return productVoicePage(f,d,{esc,heading,field,button,link},'setup');}
    return `<div class="center-flow product-demo-flow">${heading(saved?'Ta voix est enregistrée.':'Configure ta voix.',saved?'Ce choix sera utilisé pour tes prochains films.':'Colle ceci dans le chat pour enregistrer ton choix de voix.')}<pre class="prompt-box product-demo-prompt" id="prompt-text">${esc(prompt)}</pre><div class="flow-footer">${link('Retour','/formats/product-demo/setup','ghost')}${saved?link('Continuer','/formats/product-demo/new','primary','arrow'):button('Copier le prompt de réglage','copy-prompt','primary','copy')}</div></div>`;
  }
  return `<div class="center-flow product-demo-flow">${heading('Choisis ton service de voix.','Tu le règles une fois. On écrit et on génère la voix off.')}<form id="product-demo-voice-form">
    <label class="field"><span>Service de voix</span><select data-field="productVoiceProvider" aria-label="Service de voix">${productVoiceProviders.map(p=>`<option value="${p.id}" ${choice.provider===p.id?'selected':''}>${p.name}${f.productVoice?.keys?.[p.id]?' · Clé enregistrée':''}</option>`).join('')}</select></label>
    <p class="product-demo-voice-note">${esc(provider.note)}${provider.pricing?` <a href="${esc(provider.pricing)}" target="_blank" rel="noopener noreferrer">Tarifs ↗</a>`:''}</p>
    ${choice.provider==='other'?field('Nom ou site du service','productVoiceService',choice.service,'Ton service de voix'):''}
    ${choice.provider!=='none'?field('Voix (facultatif)','productVoiceName',choice.voice,'Choisis pour moi, ou colle un nom ou un lien de voix'):''}
    ${productVoiceKeyName(choice.provider)?`<div class="onb-key"><div class="onb-key-label"><label for="product-demo-key">${esc(provider.id==='other'?'Clé API (facultatif)':'Clé API '+provider.name)}</label>${provider.url?`<a href="${esc(provider.url)}" target="_blank" rel="noopener noreferrer">Obtenir une clé ↗</a>`:''}</div><input id="product-demo-key" type="password" placeholder="${f.productVoice?.keys?.[provider.id]?'Clé déjà enregistrée. Laisse vide pour la garder.':'Colle ta clé API'}" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="8192" aria-describedby="product-demo-key-help"><p id="product-demo-key-help">Enregistrée sur ton ordinateur. Jamais dans ton chat.</p></div>`:''}
    <p class="inline-alert" id="form-error" role="alert"></p><div class="flow-footer">${link('Retour','/formats/product-demo','ghost')}<button type="submit" class="btn primary">Obtenir le prompt de réglage</button></div>
    </form></div>`;
}
