// One shelf for every finished video. Filters and page live in the URL so a recording can reopen the same view.
export function videoLibrary(snapshot, params, { esc, heading, link, outputCards, empty }) {
  const all = snapshot.outputs || [];
  const query = (params.get('q') || '').trim();
  const chosen = params.get('format') || '';
  const names = new Map((snapshot.formats || []).map(f => [f.id, f.name]));
  names.set('edit', 'Tes montages');
  const formats = [...new Set(all.map(o => o.format).filter(Boolean))].sort();
  const outputs = all.filter(o => (!chosen || o.format === chosen) && (!query || [o.name, o.projectId, names.get(o.format)].join(' ').toLowerCase().includes(query.toLowerCase())));
  const pages = Math.max(1, Math.ceil(outputs.length / 24));
  const page = Math.max(1, Math.min(pages, Math.floor(Number(params.get('page')) || 1)));
  const pageUrl = next => { const q = new URLSearchParams(); if (query) q.set('q', query); if (chosen) q.set('format', chosen); q.set('page', String(next)); return '/videos?' + q; };
  const controls = `<form action="/videos" method="get" class="button-row" aria-label="Trouver des vidéos"><label class="field"><span>Rechercher</span><input type="search" name="q" value="${esc(query)}" placeholder="Trouver une vidéo"></label><label class="field"><span>Format</span><select name="format"><option value="">Tous les formats</option>${formats.map(id => `<option value="${esc(id)}" ${id === chosen ? 'selected' : ''}>${esc(names.get(id) || id)}</option>`).join('')}</select></label><button class="btn" type="submit">Trouver</button>${query || chosen ? link('Effacer', '/videos', 'ghost') : ''}</form>`;
  return heading('Tes vidéos', `${outputs.length} vidéo${outputs.length > 1 ? 's' : ''}${query || chosen ? (outputs.length > 1 ? ' trouvées' : ' trouvée') : (outputs.length > 1 ? ', enregistrées sur ton ordinateur' : ', enregistrée sur ton ordinateur')}.`, link('Nouvelle vidéo', '/new', 'primary', 'plus')) + controls +
    (outputs.length ? `<section class="recent-outputs">${outputCards(outputs.slice((page - 1) * 24, page * 24))}</section>` : empty(all.length ? 'Aucune vidéo ne correspond' : 'Ta première vidéo commence ici', all.length ? 'Essaie un autre nom ou un autre format.' : 'Les vidéos terminées de tous tes formats s’affichent ici.')) +
    (pages > 1 ? `<nav class="button-row" aria-label="Pages de vidéos">${page > 1 ? link('Précédent', pageUrl(page - 1)) : ''}<span class="tiny">Page ${page} sur ${pages}</span>${page < pages ? link('Suivant', pageUrl(page + 1)) : ''}</nav>` : '');
}
