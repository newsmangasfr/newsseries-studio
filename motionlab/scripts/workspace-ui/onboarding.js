import {accountLabel} from './account-identity.js';

const platforms = {instagram:'Instagram',tiktok:'TikTok',youtube:'YouTube'};
export function onboardingRoute(path, state) {
  if (!state) return path;
  if (state.done && /^\/onboarding(?:\/|$)/.test(path)) return '/';
  if (!state.done && path === '/') return state.stage === 'prompt' ? '/onboarding/prompt' : '/onboarding';
  return path;
}
export function setupPrompt(state = {}) {
  return ['/start',state.handle ? `${platforms[state.platform] || 'Instagram'}: ${accountLabel(state)}.` : ''].filter(Boolean).join('\n');
}
export function onboardingView(step, snapshot, {esc,icon}, entry = true) {
  const state = snapshot.onboarding || {}, prefix = entry ? '/onboarding' : '/account';
  const action = (label, name, kind = '', symbol = '') => `<button type="button" class="btn ${kind}" data-onboarding-action="${name}">${esc(label)}${symbol ? icon(symbol) : ''}</button>`;
  const route = (label, path, kind = '') => `<a class="btn ${kind}" href="${path}" data-route="${path}">${esc(label)}</a>`;
  const heading = (title, subtitle) => `<div class="onb-intro"><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>`;
  const exit = action(entry ? 'Plus tard' : 'Retour à l’Accueil','complete','ghost');
  let content;
  if (step === 'welcome') {
    content = heading('Ta prochaine vidéo commence ici.','Quelques réglages pour faire de MotionLab ton outil.') + `<div class="onb-benefits"><div>${icon('chart')}<strong>On apprend ton style</strong><p>En arrière-plan.</p></div><div>${icon('montage')}<strong>Tu commences à créer</strong><p>Choisis un de tes formats.</p></div></div><div class="onb-actions">${route('C’est parti',prefix+'/account','primary')}${exit}</div>`;
  } else if (step === 'account') {
    content = heading('Fais-en ton outil.','Ton compte nous aide à comprendre ton contenu.') + `<form id="onboarding-form"><fieldset class="onb-platforms"><legend class="sr-only">Ta plateforme</legend>${Object.entries(platforms).map(([id,label])=>`<label><input type="radio" name="onboarding-platform" value="${id}" ${state.platform === id ? 'checked' : ''}><span>${label}</span></label>`).join('')}</fieldset><label class="onb-field" for="onboarding-handle">Pseudo ou lien de la chaîne<input id="onboarding-handle" value="${esc(state.handle)}" placeholder="@tonpseudo" maxlength="180" autocomplete="off" autocapitalize="off" spellcheck="false"></label><p class="onb-note" id="onboarding-platform-note">${platformNote(state.platform)}</p><div class="onb-key"><div class="onb-key-label"><label for="onboarding-key">Clé API Composio</label><a href="https://dashboard.composio.dev/" target="_blank" rel="noopener noreferrer">Obtenir une clé ↗</a></div><p>Choisis ton workspace → project → API Keys.</p><input id="onboarding-key" type="password" placeholder="${state.hasKey ? 'Clé déjà enregistrée. Laisse vide pour la garder.' : 'Colle ta clé, ou ajoute-la plus tard'}" autocomplete="off" spellcheck="false" aria-describedby="onboarding-key-help"><p id="onboarding-key-help">Enregistrée sur ton ordinateur. Jamais dans ton chat.</p></div><div class="onb-actions"><button type="submit" class="btn primary">Obtenir mon prompt de mise en route ${icon('arrow')}</button>${exit}</div></form>`;
  } else {
    content = heading('Un prompt, et c’est parti.','Ouvre ton dossier MotionLab dans l’agent que tu utilises déjà.') + `<p class="onb-prompt-label">${icon('agent')}Colle-le dans le chat de ton agent</p><div class="onb-prompt-summary"><pre id="prompt-text">${esc(setupPrompt(state))}</pre></div><div class="onb-actions">${action('Copier le prompt','copy','','copy')}${action('Aller à l’Accueil','complete','primary','arrow')}</div>`;
  }
  const back = step === 'welcome' ? '' : route('Retour',step === 'account' ? entry ? '/onboarding' : '/account' : entry ? '/onboarding/account' : '/account/connect','ghost');
  const steps = ['Ton compte','Un prompt','Accueil'];
  const track = entry && step !== 'welcome' ? `<ol class="onb-track" aria-label="Mise en route">${steps.map((label,i)=>`<li ${i === (step === 'account' ? 0 : 1) ? 'aria-current="step"' : ''}>${label}</li>`).join('')}</ol>` : '';
  return `${entry ? `<header class="onb-mast"><a class="onb-brand" href="/" data-onboarding-action="complete"><span class="kf-mark" aria-hidden="true"></span>MotionLab</a>${action('Aller à l’Accueil','complete','ghost')}</header>${track}` : ''}<div class="onb-stage ${entry ? '' : 'onb-in-account'}"><section class="onb-screen ${step === 'welcome' ? 'onb-welcome' : ''}">${back ? `<div class="onb-back">${back}</div>` : ''}${content}<p class="onb-error" id="onboarding-error" role="alert" hidden></p></section></div>`;
}
function platformNote(platform) {
  return platform === 'instagram' ? 'Utilise ton propre compte Instagram Professionnel ou Créateur.' : `La lecture des comptes ${platforms[platform] || 'de cette plateforme'} n’est pas encore disponible. Enregistre ton pseudo et continue à créer.`;
}
export async function writeOnboarding(input) {
  const response = await fetch('/api/onboarding', {method:'POST',headers:{'Content-Type':'application/json','X-MotionLab-Write':'onboarding'},body:JSON.stringify(input),signal:AbortSignal.timeout(10000)});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Impossible d’enregistrer tes réglages. Réessaie.');
  return result;
}
export function mountOnboarding(host, {snapshot, entry, navigate, saved, copy, toast}) {
  const events = new AbortController();
  let busy = false, leaving = false;
  const showError = error => {const el = host.querySelector('#onboarding-error'); if (el) {el.textContent = error.message || 'Impossible d’enregistrer tes réglages. Réessaie.'; el.hidden = false;}};
  const clearKey = () => {const key = host.querySelector('#onboarding-key'); if (key) key.value = '';};
  const complete = async () => {
    if (leaving) return;
    leaving = true;
    try {const state = await writeOnboarding({action:'complete'}); saved(state); clearKey(); navigate('/',true);}
    catch (error) {leaving = false; showError(error);}
  };
  host.addEventListener('click',async event => {
    const control = event.target.closest('[data-onboarding-action]');
    if (!control) return;
    event.preventDefault();
    if (control.dataset.onboardingAction === 'complete') return complete();
    if (control.dataset.onboardingAction === 'copy') {
      const prompt = setupPrompt(snapshot.onboarding);
      await copy(prompt,'Copié. Colle-le dans le chat de ton agent.');
    }
  }, {signal:events.signal});
  host.addEventListener('change',event => {
    if (event.target.name === 'onboarding-platform') host.querySelector('#onboarding-platform-note').textContent = platformNote(event.target.value);
  }, {signal:events.signal});
  host.addEventListener('submit',async event => {
    if (event.target.id !== 'onboarding-form') return;
    event.preventDefault(); if (busy || leaving) return;
    busy = true;
    const button = event.target.querySelector('[type="submit"]'); button.disabled = true; button.textContent = 'Enregistrement…';
    try {
      const state = await writeOnboarding({action:'details',platform:host.querySelector('[name="onboarding-platform"]:checked')?.value || 'instagram',handle:host.querySelector('#onboarding-handle').value,key:host.querySelector('#onboarding-key').value});
      if (events.signal.aborted) return;
      saved(state); clearKey();
      if (!leaving) navigate(entry ? '/onboarding/prompt' : '/account/setup-prompt');
    } catch (error) {if (!events.signal.aborted) showError(error);}
    finally {busy = false; button.disabled = false; button.textContent = 'Obtenir mon prompt de mise en route';}
  }, {signal:events.signal});
  return {destroy(){events.abort(); clearKey();}};
}
