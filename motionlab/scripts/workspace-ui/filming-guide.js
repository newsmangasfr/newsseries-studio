// Shared filming illustrations, with instructions fitted to each format.
export function filmingGuide(ui,format='phone') {
 const list=format==='scroll-reel',id=list?'list-filming-title':'shot-filming-title';
 const examples=[
  ['street','Marche dehors',list?'Garde le téléphone stable et reste dans le cadre.':'Passe devant le téléphone ou demande à quelqu’un de te filmer.'],
  ['desk','Travaille à ton bureau','Tape ou écris, le visage dans le cadre.'],
  ['coffee','Fais une pause café','Bois une gorgée ou regarde par la fenêtre.'],
  ['camera',list?'Reste simple':'Regarde la caméra',list?'Installe-toi confortablement et continue ta journée.':'Pose le téléphone et reste naturel.']
 ];
 return `<section class="filming-guide" aria-labelledby="${id}"><h2 id="${id}">Ce qu’il nous faut de toi</h2><p>${list?'Filme-toi en quelques prises d’environ 15 secondes. Choisis les moments qui te vont.':'Filme-toi pendant 8 à 12 secondes. Choisis une de ces idées.'}</p><div class="filming-scenes">${examples.map(([scene,title,line])=>`<figure><div class="filming-scene" data-scene="${scene}" role="img" aria-label="${ui.esc(title+': '+line)}"></div><figcaption><strong>${title}</strong><p>${line}</p></figcaption></figure>`).join('')}</div><p class="filming-guide-foot">${list?'Filme à la verticale, avec une bonne lumière. Reste visible, avec de l’espace au-dessus pour les ressources. Une seule prise continue, sans parler ni texte ajouté.':'Filme à la verticale, avec une bonne lumière. Reste visible, avec un peu d’espace autour de toi. Sans parler, sans coupe ni texte ajouté.'}</p></section>`;
}
