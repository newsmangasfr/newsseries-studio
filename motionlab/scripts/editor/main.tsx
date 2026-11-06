// The editor page's entry: find the video from the address, load its edit, and draw the editor. /edit/new starts a
// video from nothing (or from files named with ?from=), then opens it.
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './Editor';
import { api } from './store';
import { Icon } from './icons';
import './editor.css';

function App({ project }: { project: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => { setError(null); api.load(project).then(setData, (e) => setError(e.message)); };
  useEffect(load, [project]);
  if (error) return (
    <div className="ed-empty">
      <Icon name="warn" size={26} />
      <h1>Cette vidéo n’a pas pu s’ouvrir</h1>
      <p>{error}</p>
      <div className="ed-dialog-row"><button className="btn" onClick={load}>Réessayer</button><a className="btn" href="/">Retour à ton espace de travail</a></div>
    </div>
  );
  if (!data) return <div className="ed-empty"><i className="spin" /><p>Ouverture de ta vidéo</p></div>;
  return <Editor project={project} initial={data} />;
}

const SHAPES = [
  { label: '9:16', w: 1080, h: 1920, note: 'Reels, TikTok, Shorts' },
  { label: '4:5', w: 1080, h: 1350, note: 'Post du fil' },
  { label: '1:1', w: 1080, h: 1080, note: 'Carré' },
  { label: '16:9', w: 1920, h: 1080, note: 'Large' },
];

// A new video: a name and a shape, then straight into the editor. With files named in the address, it is made from
// them at once.
function NewVideo() {
  const params = new URLSearchParams(location.search);
  const from = params.getAll('from');
  const [name, setName] = useState(params.get('name') ?? '');
  const [shape, setShape] = useState(SHAPES[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = async (body: any) => {
    setBusy(true);
    setError(null);
    try { const r = await api.newProject(body); location.replace(`/edit/${encodeURIComponent(r.project)}`); }
    catch (e: any) { setError(e.message); setBusy(false); }
  };
  useEffect(() => { if (from.length) create({ from, name: name || undefined }); }, []);
  if (from.length && !error) return <div className="ed-empty"><i className="spin" /><p>Création de ta vidéo</p></div>;
  return (
    <div className="ed-empty new-video">
      <h1>Nouvelle vidéo</h1>
      <form onSubmit={(e) => { e.preventDefault(); create({ name: name.trim() || undefined, width: shape.w, height: shape.h, fps: 30 }); }}>
        <label className="field"><span>Nom</span><input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ma vidéo" autoFocus /></label>
        <div className="shapes" role="radiogroup" aria-label="Forme">
          {SHAPES.map((s) => (
            <button type="button" key={s.label} role="radio" aria-checked={s === shape} className={`shape ${s === shape ? 'is-on' : ''}`} onClick={() => setShape(s)}>
              <i style={{ aspectRatio: `${s.w} / ${s.h}` }} />
              <strong>{s.label}</strong>
              <span>{s.note}</span>
            </button>
          ))}
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="ed-dialog-row"><button className="btn primary" type="submit" disabled={busy}>{busy ? 'Création en cours' : 'Commencer le montage'}</button><a className="btn" href="/">Annuler</a></div>
      </form>
    </div>
  );
}

const host = document.getElementById('editor')!;
const project = host.dataset.project!;
// A blank video is started from the workspace's own New video page, so there is one way to begin.
if (project === 'new' && !new URLSearchParams(location.search).getAll('from').length) location.replace('/new-video');
else createRoot(host).render(project === 'new' ? <NewVideo /> : <App project={project} />);
