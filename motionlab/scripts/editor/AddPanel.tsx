// The add panel, on the left: words, captions, your clips and pictures, sounds, and files from your computer. One
// click adds at the playhead; a drag puts it where you let go, on the video or on the timeline.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './icons';
import { allTextLooks, allCaptionLooks, type Look } from './looks';
import { fontStack, nearestWeight } from './fonts';

export type MediaEntry = { path: string; name: string; kind: 'video' | 'image' | 'audio'; group: string; url: string; size?: number };
export type Upload = { id: string; name: string; share: number; state: 'sending' | 'done' | 'error'; message?: string };
export type AddTab = 'text' | 'captions' | 'media' | 'sounds' | 'upload';

export const MEDIA_MIME = 'application/x-motionlab-media';

const TABS: { id: AddTab; label: string; icon: string }[] = [
  { id: 'media', label: 'Médias', icon: 'media' },
  { id: 'text', label: 'Texte', icon: 'text' },
  { id: 'captions', label: 'Sous-titres', icon: 'captions' },
  { id: 'sounds', label: 'Sons', icon: 'music' },
  { id: 'upload', label: 'Importer', icon: 'upload' },
];

export type AddPanelProps = {
  tab: AddTab | null; setTab: (tab: AddTab | null) => void;
  media: MediaEntry[]; uploads: Upload[];
  onAddMedia: (entries: MediaEntry[]) => void;
  onAddText: (look: Look) => void;
  onAddCaption: (look: Look) => void;
  onFiles: (files: File[]) => void;
};

export function AddRail({ tab, setTab }: { tab: AddTab | null; setTab: (t: AddTab | null) => void }) {
  return (
    <nav className="rail" aria-label="Ajouter">
      {TABS.map((t) => (
        <button key={t.id} className={`rail-btn ${tab === t.id ? 'is-on' : ''}`} onClick={() => setTab(tab === t.id ? null : t.id)} aria-pressed={tab === t.id} data-tab={t.id}>
          <Icon name={t.icon} size={20} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function AddPanel(props: AddPanelProps) {
  const { tab } = props;
  if (!tab) return null;
  return (
    <aside className="add" aria-label={TABS.find((t) => t.id === tab)?.label}>
      <div className="add-top">
        <h2>{TABS.find((t) => t.id === tab)?.label}</h2>
        <button className="tool" onClick={() => props.setTab(null)} aria-label="Masquer ce panneau" title="Masquer ce panneau"><Icon name="panelLeft" /></button>
      </div>
      <div className="add-scroll">
        {tab === 'text' && <TextTab {...props} />}
        {tab === 'captions' && <CaptionTab {...props} />}
        {tab === 'media' && <MediaTab {...props} />}
        {tab === 'sounds' && <SoundTab {...props} />}
        {tab === 'upload' && <UploadTab {...props} />}
      </div>
    </aside>
  );
}

// A look drawn at a small size in its own font and colours, on the dark of a frame.
function LookTile({ look, text, onClick, tall }: { look: Look; text: string; onClick: () => void; tall?: boolean }) {
  const s = look.style;
  return (
    <button className={`preset ${tall ? 'tall' : ''}`} onClick={onClick} data-preset={look.id} title={`Ajouter ${look.label}`}>
      <span className="preset-art">
        <span style={{
          fontFamily: fontStack(s.font), fontWeight: nearestWeight(s.font, s.weight), fontSize: Math.max(13, Math.min(26, (s.size ?? 64) / 3.4)),
          color: s.color ?? '#fff', background: s.background, textTransform: s.caps ? 'uppercase' : undefined,
          WebkitTextStroke: s.stroke ? `1.2px ${s.stroke}` : undefined, paintOrder: 'stroke fill', padding: s.background ? '2px 7px' : 0,
          textShadow: s.shadow && !s.background ? '0 1px 4px rgba(0,0,0,.6)' : undefined, lineHeight: 1.1,
        }}>
          {text.split(' ').map((w, i) => <span key={i} style={i === 1 && s.activeColor && s.animation !== 'karaoke' ? { color: s.activeColor } : undefined}>{i ? ' ' : ''}{w}</span>)}
        </span>
      </span>
      <span className="preset-name">{look.label}{look.installed && <em>Pack</em>}</span>
    </button>
  );
}

function TextTab({ onAddText }: AddPanelProps) {
  const looks = useMemo(allTextLooks, []);
  return (
    <>
      <p className="add-note">Clique pour ajouter à la tête de lecture.</p>
      <div className="presets">{looks.map((look) => <LookTile key={look.id} look={look} text={look.text ?? look.label} onClick={() => onAddText(look)} />)}</div>
    </>
  );
}

function CaptionTab({ onAddCaption }: AddPanelProps) {
  const looks = useMemo(allCaptionLooks, []);
  return (
    <>
      <p className="add-note">Ajoute des sous-titres à la tête de lecture. Tape les mots à droite.</p>
      <div className="presets">{looks.map((look) => <LookTile key={look.id} look={look} text="Dis-le comme ça" onClick={() => onAddCaption(look)} tall />)}</div>
    </>
  );
}

export function MediaTile({ entry, onClick, draggable = true }: { entry: MediaEntry; onClick: () => void; draggable?: boolean }) {
  const thumb = entry.kind === 'image'
    ? <img src={entry.url} alt="" loading="lazy" draggable={false} />
    : <i className="strip" style={{ backgroundImage: `url(/api/edit/strip?path=${encodeURIComponent(entry.path)})` }} />;
  return (
    <button
      className="tile" onClick={onClick} title={`${entry.name}\nClique pour l’ajouter à la tête de lecture, ou glisse-le où tu veux.`} data-media={entry.path}
      draggable={draggable}
      onDragStart={(e) => { e.dataTransfer.setData(MEDIA_MIME, JSON.stringify([entry])); e.dataTransfer.effectAllowed = 'copy'; }}
    >
      <span className="tile-art">{thumb}{entry.kind === 'video' && <b className="tile-kind"><Icon name="video" size={12} /></b>}</span>
      <span className="tile-name">{entry.name}</span>
    </button>
  );
}

const GROUP_NAME: Record<string, string> = { project: 'Cette vidéo', yours: 'Tes fichiers', output: 'Vidéos finies' };

function MediaTab({ media, onAddMedia, setTab }: AddPanelProps) {
  const [filter, setFilter] = useState('');
  const shown = media.filter((m) => m.kind !== 'audio' && m.group !== 'sounds' && (!filter || m.name.toLowerCase().includes(filter.toLowerCase())));
  const groups = [...new Set(shown.map((m) => m.group))];
  return (
    <>
      {media.filter((m) => m.kind !== 'audio').length > 10 && <input className="search" placeholder="Chercher un fichier" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Chercher un fichier" />}
      {!shown.length && (
        <div className="add-empty">
          <p>Pas encore de clips ni d’images.</p>
          <button className="btn" onClick={() => setTab('upload')}><Icon name="upload" size={16} />Importer</button>
        </div>
      )}
      {groups.map((g) => (
        <section key={g} className="add-group">
          <h3>{GROUP_NAME[g] ?? g}</h3>
          <div className="tiles">{shown.filter((m) => m.group === g).map((m) => <MediaTile key={m.path} entry={m} onClick={() => onAddMedia([m])} />)}</div>
        </section>
      ))}
    </>
  );
}

// One shared player for previews, so starting one stops the last.
let preview: HTMLAudioElement | null = null;
function SoundTab({ media, onAddMedia }: AddPanelProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => () => { preview?.pause(); }, []);
  const play = (m: MediaEntry) => {
    if (!preview) preview = new Audio();
    if (playing === m.path) { preview.pause(); setPlaying(null); return; }
    preview.src = m.url;
    preview.currentTime = 0;
    preview.play().catch(() => setPlaying(null));
    preview.onended = () => setPlaying(null);
    setPlaying(m.path);
  };
  const sounds = media.filter((m) => m.kind === 'audio');
  const groups: [string, MediaEntry[]][] = [['Tes sons', sounds.filter((m) => m.group !== 'sounds')], ['Effets sonores', sounds.filter((m) => m.group === 'sounds')]];
  return (
    <>
      {!sounds.length && <p className="add-note">Pas encore de sons. Importe une musique ou une voix.</p>}
      {groups.filter(([, list]) => list.length).map(([title, list]) => (
        <section key={title} className="add-group">
          <h3>{title}</h3>
          <ul className="sounds">
            {list.map((m) => (
              <li key={m.path} draggable onDragStart={(e) => { e.dataTransfer.setData(MEDIA_MIME, JSON.stringify([m])); e.dataTransfer.effectAllowed = 'copy'; }} data-sound={m.path}>
                <button className={`tool ${playing === m.path ? 'is-on' : ''}`} onClick={() => play(m)} aria-label={playing === m.path ? 'Arrêter' : 'Écouter'} title={playing === m.path ? 'Arrêter' : 'Écouter'}><Icon name={playing === m.path ? 'stop' : 'play'} size={14} /></button>
                <span className="sound-name" title={m.name}>{m.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ')}</span>
                <button className="tool" onClick={() => onAddMedia([m])} aria-label={`Ajouter ${m.name}`} title="Ajouter à la tête de lecture"><Icon name="plus" size={16} /></button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function UploadTab({ uploads, onFiles }: AddPanelProps) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="dropzone" onClick={() => input.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}>
        <Icon name="upload" size={24} />
        <strong>Dépose tes fichiers n’importe où</strong>
        <span>Clips, images et sons. Ou clique pour choisir.</span>
        <input ref={input} type="file" multiple hidden accept="video/*,image/*,audio/*" name="Upload" onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
      </div>
      {uploads.length > 0 && (
        <ul className="uploads">
          {uploads.map((u) => (
            <li key={u.id} className={u.state}>
              <span className="up-name" title={u.name}>{u.name}</span>
              <span className="up-state">{u.state === 'sending' ? `${Math.round(u.share * 100)}%` : u.state === 'done' ? 'Ajouté' : u.message}</span>
              <i className="bar"><b style={{ width: `${Math.round(u.share * 100)}%` }} /></i>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// A small window to pick another file of the same kind, for Replace.
export function MediaPicker({ media, kind, onPick, onClose }: { media: MediaEntry[]; kind: string; onPick: (m: MediaEntry) => void; onClose: () => void }) {
  const list = media.filter((m) => m.kind === kind);
  return (
    <div className="ed-modal" role="dialog" aria-modal="true" aria-label="Remplacer" onClick={onClose}>
      <div className="ed-dialog wide" onClick={(e) => e.stopPropagation()}>
        <h2>Remplacer par</h2>
        {list.length ? (
          <div className="tiles picker">{list.map((m) => kind === 'audio'
            ? <button key={m.path} className="btn" onClick={() => onPick(m)}>{m.name}</button>
            : <MediaTile key={m.path} entry={m} onClick={() => onPick(m)} draggable={false} />)}</div>
        ) : <p>Aucun autre fichier de ce type pour l’instant. Importes-en un d’abord.</p>}
        <div className="ed-dialog-row"><button className="btn" onClick={onClose}>Annuler</button></div>
      </div>
    </div>
  );
}
