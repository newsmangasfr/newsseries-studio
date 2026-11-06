// The two windows the editor opens: Export, which saves, records the request and gives the words to paste to the agent,
// and the sheet of keys.
import React, { useEffect, useRef, useState } from 'react';
import type { Doc } from './types';
import { api } from './store';
import { Icon } from './icons';
import { checkDoc, timecode } from '../edit-doc.mjs';

function Modal({ label, onClose, children, wide }: { label: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', key, true);
    box.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => window.removeEventListener('keydown', key, true);
  }, []);
  return (
    <div className="ed-modal" role="dialog" aria-modal="true" aria-label={label} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ed-dialog ${wide ? 'wide' : ''}`} ref={box}>{children}</div>
    </div>
  );
}

export function ExportDialog({ project, doc, flush, onClose }: { project: string; doc: Doc; flush: () => Promise<boolean>; onClose: () => void }) {
  const [step, setStep] = useState<'saving' | 'ready' | 'error'>('saving');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    (async () => {
      const problems = checkDoc(doc);
      if (problems.length) { setError(problems[0]); setStep('error'); return; }
      const saved = await flush();
      if (!saved) { setError('Ton montage n’est pas encore enregistré. Réessaie dans un instant.'); setStep('error'); return; }
      try { const r = await api.exportRequest(project); setPrompt(r.prompt); setStep('ready'); }
      catch (e: any) { setError(e.message); setStep('error'); }
    })();
  }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); } catch {
      const area = document.querySelector<HTMLElement>('.prompt-box');
      if (area) { const range = document.createRange(); range.selectNodeContents(area); const s = getSelection(); s?.removeAllRanges(); s?.addRange(range); document.execCommand('copy'); }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal label="Exporter" onClose={onClose}>
      <h2>Exporter ce montage</h2>
      {step === 'saving' && <p className="with-spin"><i className="spin" />Enregistrement de ton montage</p>}
      {step === 'error' && <p className="error" role="alert">{error}</p>}
      {step === 'ready' && (
        <>
          <p>Ton agent en fait le rendu, le vérifie et le range avec tes vidéos. Colle ceci dans le chat :</p>
          <pre className="prompt-box" data-prompt>{prompt}</pre>
          <p className="helper mono">{doc.width} × {doc.height}, durée {timecode(doc.durationInFrames, doc.fps)}</p>
        </>
      )}
      <div className="ed-dialog-row">
        {step === 'ready' && <button className="btn primary" onClick={copy} data-autofocus data-copy>{copied ? <><Icon name="check" size={16} />Copié</> : <><Icon name="copy" size={16} />Copier</>}</button>}
        <button className="btn" onClick={onClose}>Fermer</button>
      </div>
    </Modal>
  );
}

const KEYS: [string, [string, string][]][] = [
  ['Lecture', [['Espace', 'Lire ou mettre en pause'], ['Gauche, Droite', 'Une image en arrière ou en avant'], ['Maj Gauche, Droite', 'Une seconde'], ['Début, Fin', 'Début ou fin']]],
  ['Montage', [['S ou Cmd B', 'Couper à la tête de lecture'], ['Suppr', 'Supprimer'], ['Maj Suppr', 'Supprimer et refermer le vide'], ['Cmd C, Cmd X, Cmd V', 'Copier, couper, coller à la tête de lecture'], ['Cmd Alt V', 'Coller l’apparence sur la sélection'], ['Cmd D', 'Dupliquer'], ['Cmd A', 'Tout sélectionner'], ['Cmd Z', 'Annuler'], ['Maj Cmd Z', 'Rétablir'], ['Cmd S', 'Enregistrer maintenant'], ['N', 'Activer ou couper le magnétisme']]],
  ['Sur la vidéo', [['Clic', 'Sélectionner'], ['Maj clic', 'Ajouter à la sélection'], ['Glisser dans le vide', 'Sélectionner avec un cadre'], ['Alt clic', 'Seulement celui-ci, sans ses éléments liés'], ['Double-clic', 'Taper du texte, ou recadrer une image'], ['Flèches', 'Déplacer de 1 px (Maj : 10 px)'], ['Maj glisser', 'Déplacer dans une seule direction'], ['Alt glisser', 'Déplacer sans magnétisme'], ['Alt coin', 'Redimensionner depuis le centre'], ['Maj coin', 'Redimensionner librement (images, clips)'], ['Maj rotation', 'Pivoter par pas de 15°'], ['Cmd +, Cmd -, Cmd 0', 'Zoomer, dézoomer, ajuster'], ['Cmd molette', 'Zoom']]],
];

export function ShortcutsSheet({ onClose }: { onClose: () => void }) {
  return (
    <Modal label="Raccourcis" onClose={onClose} wide>
      <h2>Raccourcis</h2>
      <div className="sheet">
        {KEYS.map(([title, list]) => (
          <section key={title}>
            <h3>{title}</h3>
            <dl>{list.map(([k, v]) => <div key={k}><dt>{k.split(', ').map((part, i) => <React.Fragment key={i}>{i ? ', ' : ''}{part.split(' ').map((w, j) => <kbd key={j}>{w}</kbd>)}</React.Fragment>)}</dt><dd>{v}</dd></div>)}</dl>
          </section>
        ))}
      </div>
      <div className="ed-dialog-row"><button className="btn" onClick={onClose} data-autofocus>Fermer</button></div>
    </Modal>
  );
}
