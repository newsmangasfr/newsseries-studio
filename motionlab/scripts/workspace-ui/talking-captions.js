// Your captions, for both Talking Head styles: copy a video you like, or describe it. The agent measures every detail
// and shows it on your own footage before saving. Only the captions change, never the visuals or the method.
const details = 'la police et sa graisse, la taille, majuscules ou non, la couleur d’un mot déjà dit, du mot en train d’être dit et des mots à venir, comment les mots clés ressortent (couleur, encadré, taille, emoji), combien de mots s’affichent à la fois et sur combien de lignes, où ils se placent à l’écran et à l’écart de mon visage, comment chaque mot apparaît et sur quelle image de la voix, contour, ombre ou fond, et ce qui se passe entre les phrases';

import {talkingStyleSkill} from './talking-style.js';

export function talkingCaptionsPrompt(f, d) {
  const skill = talkingStyleSkill(f), split = skill !== 'talking-head';
  const link = String(d.capLink || '').trim(), text = String(d.capText || '').trim();
  const source = d.capMode === 'describe'
    ? `Voici comment je veux mes sous-titres :\n${text || '(écris-le au-dessus)'}`
    : `Copie exactement les sous-titres de cette vidéo :\n${link || '(colle le lien au-dessus, ou joins la vidéo avec ce prompt)'}`;
  return [
    split ? '/' + skill : '/talking-head-customization',
    source,
    `Détermine chaque détail : ${details}. Regarde-la image par image, puis reconstruis-la sur une image fixe de mes propres rushes et montre-la-moi avant d’enregistrer.`,
    split ? 'C’est mon style de sous-titres pour ce style de vidéo, pas une nouvelle vidéo. Enregistre-le comme mon choix permanent, comme la skill enregistre une présentation.' : 'C’est mon style de sous-titres Talking Head, pas une nouvelle vidéo. Enregistre-le avec ses raisons, comme la skill enregistre un style.',
    'Change uniquement les sous-titres. Les visuels, le mouvement, la méthode et ses modèles restent tels quels.',
  ].join('\n\n');
}

export function talkingCaptionsPage(f, d, {esc, heading, button}) {
  const describe = d.capMode === 'describe';
  const field = describe
    ? `<label class="field"><span>Décris tes sous-titres</span><textarea data-cap="capText" rows="5" placeholder="Grands mots blancs, deux à la fois, au milieu de l’écran. Le mot clé en jaune. Chaque mot apparaît quand il est prononcé.">${esc(d.capText)}</textarea></label>`
    : `<label class="field"><span>Lien vers une vidéo dont tu aimes les sous-titres</span><input data-cap="capLink" type="url" placeholder="https://www.instagram.com/reel/..." value="${esc(d.capLink)}"></label><p class="helper-note">Tu l’as en fichier ? Joins-le dans le chat avec le prompt.</p>`;
  return `<div class="center-flow th-captions">${heading('Tes sous-titres.', 'Montre-nous des sous-titres qui te plaisent, ou décris-les. On copie chaque détail.')}
    <div class="th-cap-switch" role="tablist">${button('Copier une vidéo', 'cap-mode:copy', describe ? 'ghost' : 'primary')}${button('Les décrire', 'cap-mode:describe', describe ? 'primary' : 'ghost')}</div>
    ${field}
    <pre class="prompt-box" id="prompt-text">${esc(talkingCaptionsPrompt(f, d))}</pre>${button('Copier le prompt', 'copy-prompt', 'primary', 'copy')}
    <p class="helper-note">Colle-le dans le chat ouvert dans ton dossier MotionLab. Tu vois tes sous-titres sur tes propres rushes avant que quoi que ce soit soit enregistré. Passe cette étape et on utilise les nôtres.</p></div>`;
}
