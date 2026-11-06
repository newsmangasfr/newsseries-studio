// The inspector: everything about what is selected, on the right. It knows item types, never formats: a clip, a sound,
// a picture, words, captions or a graphic get the same controls in every video. With nothing selected it shows the
// video itself: its size, its background, and a way back to the agent's version.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Doc, Item, TextStyle, Transform, Field } from './types';
import type { Action, FrameStore } from './store';
import { useFrame } from './store';
import { Icon } from './icons';
import { layers } from 'motionlab-layers';
import { FONTS, fontById, fontStack, nearestWeight } from './fonts';
import { allTextLooks, allCaptionLooks, applyLook, currentLook, fixedLook, supportsStyle, lookFonts, type Look } from './looks';
import { CAPTION_DEFAULTS } from './Captions';
import { Section, Row, NumberField, Slider, Segmented, ColorField, Toggle, TimeField, TextArea, IconButton } from './fields';
import { pagesOf, activeWord, editWord, deleteWord, mergeWord, splitPage, joinPage, nudgeWord, retext, plainText } from './captions.mjs';
import { full, hasCrop, fitNew } from './geometry.mjs';
import { updateItem, moveItems, trimItem, setFade, setVolume, end, timecode, itemById, trackById, MAX_VOLUME } from '../edit-doc.mjs';
import { MediaPicker } from './AddPanel';
import { itemName, KIND_NAME, kindIcon } from './names';
import { useDetails, DetailInspector, canOpen } from './Details';
import { MOTIONS } from './motion.mjs';

export type InspectorProps = {
  doc: Doc; shown: Doc; selection: string[]; dispatch: React.Dispatch<Action>; frames: FrameStore;
  seek: (frame: number) => void; split: () => void; duplicate: () => void; remove: (ripple: boolean) => void;
  media: any[]; cropping: string | null; setCropping: (id: string | null) => void; setEditing: (id: string | null) => void;
  focus: { id: string; n: number } | null; onStartOver: (() => void) | null; onShortcuts: () => void; collapse: () => void;
};

type Apply = (fn: (doc: Doc) => Doc, live?: boolean, merge?: string) => void;

export function Inspector(props: InspectorProps) {
  const { doc, shown, selection, dispatch } = props;
  const details = useDetails();
  const root = useRef<HTMLDivElement>(null);
  // Every control changes the document through here: live while the hand is on it, one undo step when it lets go, and
  // nothing at all when the value ended where it started.
  const apply: Apply = (fn, live = false, merge) => {
    const next = fn(doc);
    if (live) { dispatch({ type: 'draft', doc: next }); return; }
    if (next === doc || JSON.stringify(next.items) + next.width + next.height + next.background === JSON.stringify(doc.items) + doc.width + doc.height + doc.background) { dispatch({ type: 'draft', doc: null }); return; }
    dispatch({ type: 'commit', doc: next, merge });
  };

  useEffect(() => {
    if (!props.focus) return;
    const id = requestAnimationFrame(() => root.current?.querySelector<HTMLElement>('[data-focus-first]')?.focus());
    return () => cancelAnimationFrame(id);
  }, [props.focus?.n]);

  const items = selection.map((id) => shown.items.find((i) => i.id === id)).filter(Boolean) as Item[];
  let body: React.ReactNode;
  if (details.item) body = <DetailInspector />;
  else if (!items.length) body = <VideoPanel {...props} apply={apply} />;
  else if (items.length > 1) body = <ManyPanel {...props} items={items} apply={apply} />;
  else body = <ItemPanel key={items[0].id} {...props} item={items[0]} apply={apply} />;

  return (
    <aside className="inspector" ref={root} aria-label="Inspecteur">
      <div className="ins-top">
        <h2>{items.length === 0 ? 'Vidéo' : items.length > 1 ? `${items.length} sélectionnés` : KIND_NAME[items[0].type]}</h2>
        <button className="tool" onClick={props.collapse} title="Masquer ce panneau" aria-label="Masquer ce panneau"><Icon name="panelRight" /></button>
      </div>
      {shown.items.some(i => i.type === 'layer' && i.renderer?.includes('/scene-')) && <div className="scene-picker"><select aria-label="Choisir une scène" value={selection.length === 1 && shown.items.find(i => i.id === selection[0])?.renderer?.includes('/scene-') ? selection[0] : ''} onChange={e => {
        const scene = doc.items.find(i => i.id === e.target.value); details.close();
        if (!scene) { dispatch({ type: 'select', ids: [] }); return; }
        dispatch({ type: 'select', ids: [scene.id] }); props.seek(Math.min(scene.from + scene.durationInFrames - 1, scene.from + Math.round(doc.fps / 2)));
        if (canOpen(scene)) details.open(scene.id);
      }}><option value="">Choisir une scène</option>{shown.items.filter(i => i.type === 'layer' && i.renderer?.includes('/scene-')).sort((a, b) => a.from - b.from).map((scene, index) => <option value={scene.id} key={scene.id}>{index + 1}. {scene.label ?? 'Scène'}</option>)}</select></div>}
      <div className="ins-scroll">{body}</div>
    </aside>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Nothing selected: the video.

const SIZES = [
  { label: '9:16', w: 1080, h: 1920, title: 'Reels, TikTok, Shorts' },
  { label: '4:5', w: 1080, h: 1350, title: 'Post du fil' },
  { label: '1:1', w: 1080, h: 1080, title: 'Carré' },
  { label: '16:9', w: 1920, h: 1080, title: 'YouTube, large' },
];

function VideoPanel(props: InspectorProps & { apply: Apply }) {
  const { doc, apply } = props;
  const [confirm, setConfirm] = useState(false);
  const current = SIZES.find((s) => s.w === doc.width && s.h === doc.height);
  const counts = { clips: doc.items.filter((i) => i.type === 'video').length, sounds: doc.items.filter((i) => i.type === 'audio').length };
  return (
    <>
      <Section title="Cette vidéo">
        <dl className="facts">
          <div><dt>Taille</dt><dd>{doc.width} × {doc.height}</dd></div>
          <div><dt>Cadence</dt><dd>{doc.fps} i/s</dd></div>
          <div><dt>Durée</dt><dd>{doc.items.length ? timecode(doc.durationInFrames, doc.fps) : 'Vide'}</dd></div>
          <div><dt>Contenu</dt><dd>{counts.clips} {counts.clips === 1 ? 'clip' : 'clips'}, {counts.sounds} {counts.sounds === 1 ? 'son' : 'sons'}</dd></div>
        </dl>
      </Section>
      <Section title="Cadre">
        <Row label="Forme">
          <Segmented name="Forme" value={current?.label ?? ''} options={SIZES.map((s) => ({ value: s.label, label: s.label, title: `${s.title}, ${s.w} × ${s.h}` }))} onChange={(label) => { const s = SIZES.find((x) => x.label === label)!; apply((d) => ({ ...d, width: s.w, height: s.h })); }} />
        </Row>
        <Row label="Fond"><ColorField name="Fond" value={doc.background ?? '#000000'} onChange={(v, live) => apply((d) => ({ ...d, background: v ?? '#000000' }), live)} /></Row>
      </Section>
      {props.onStartOver && (
        <Section title="Recommencer">
          {!confirm ? (
            <>
              <p className="ins-note">Reviens à la version faite par ton agent. Tu peux annuler.</p>
              <IconButton icon="reset" label="Recommencer" onClick={() => setConfirm(true)} />
            </>
          ) : (
            <div className="confirm">
              <p>Remplacer tes changements par la version de ton agent ?</p>
              <div className="ins-buttons">
                <button className="btn small primary" onClick={() => { setConfirm(false); props.onStartOver!(); }}>Recommencer</button>
                <button className="btn small" onClick={() => setConfirm(false)}>Garder mon montage</button>
              </div>
            </div>
          )}
        </Section>
      )}
      <Section title="Raccourcis" aside={<button className="link" onClick={props.onShortcuts}>Tous les raccourcis</button>}>
        <dl className="keys">
          <div><dt>Espace</dt><dd>Lire ou mettre en pause</dd></div>
          <div><dt>S</dt><dd>Couper à la tête de lecture</dd></div>
          <div><dt>Cmd Z</dt><dd>Annuler</dd></div>
          <div><dt>Suppr</dt><dd>Supprimer</dd></div>
          <div><dt>?</dt><dd>Tous les raccourcis</dd></div>
        </dl>
      </Section>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Several selected: what they share.

function ManyPanel(props: InspectorProps & { items: Item[]; apply: Apply }) {
  const { items, apply, doc } = props;
  const visual = items.filter((i) => i.type !== 'audio');
  const sounding = items.filter((i) => i.type === 'video' || i.type === 'audio');
  const ids = items.map((i) => i.id);
  const opacity = visual.length ? visual.reduce((s, i) => s + (i.transform?.opacity ?? 1), 0) / visual.length : 1;
  const volume = sounding.length ? sounding.reduce((s, i) => s + (i.volume ?? 1), 0) / sounding.length : 1;
  return (
    <>
      <Section title="Sélection">
        <ul className="many">{items.map((i) => <li key={i.id}><Icon name={kindIcon(i)} size={14} />{itemName(i)}</li>)}</ul>
        <div className="ins-buttons">
          <IconButton icon="copy" label="Dupliquer" onClick={props.duplicate} />
          <IconButton icon="trash" label="Supprimer" danger onClick={() => props.remove(false)} />
        </div>
      </Section>
      {visual.length > 0 && (
        <Section title="Apparence">
          <Row label="Opacité"><Slider name="Opacity" value={opacity} min={0} max={1} format={(v) => `${Math.round(v * 100)}%`} onChange={(v, live) => apply((d) => visual.reduce((acc, i) => updateItem(acc, i.id, { transform: { ...full(itemById(acc, i.id).transform), opacity: v } }), d), live)} /></Row>
        </Section>
      )}
      {sounding.length > 0 && (
        <Section title="Son">
          <Row label="Volume"><Slider name="Volume" value={volume} min={0} max={MAX_VOLUME} format={(v) => `${Math.round(v * 100)}%`} onChange={(v, live) => apply((d) => setVolume(d, sounding.map((i) => i.id), v), live)} /></Row>
        </Section>
      )}
      <p className="ins-note">{ids.length} éléments. Maj clic pour en ajouter ou en retirer un.</p>
      {void doc}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// One item.

function ItemPanel(props: InspectorProps & { item: Item; apply: Apply }) {
  const { item, apply, doc } = props;
  const details = useDetails();
  const locked = Boolean(trackById(doc, item.track)?.locked);
  const set = (patch: Partial<Item>, live?: boolean, merge?: string) => apply((d) => updateItem(d, item.id, patch), live, merge);
  const setStyle = (patch: Partial<TextStyle>, live?: boolean) => apply((d) => updateItem(d, item.id, { style: patch }), live);
  return (
    <>
      <div className="ins-head">
        <Icon name={kindIcon(item)} size={16} />
        <span className="ins-name" title={itemName(item)}>{itemName(item)}</span>
        {locked && <span className="badge" title="Cette piste est verrouillée"><Icon name="lock" size={13} />Verrouillée</span>}
      </div>
      <div className="ins-buttons top">
        <SplitButton frames={props.frames} item={item} locked={locked} split={props.split} />
        <IconButton icon="copy" label="Dupliquer" onClick={props.duplicate} />
        <IconButton icon="trash" label="Supprimer" danger disabled={locked} onClick={() => props.remove(false)} />
      </div>
      {item.missing && <p className="ins-note warn">Exclu de l’export : {item.missing}.</p>}
      {item.agent && <p className="ins-note warn">{item.agent.note || 'Ton agent s’en charge à l’export.'}</p>}
      <fieldset disabled={locked} className="ins-fields">
        {canOpen(item) && <Section title={item.type === 'caption' ? 'Mot par mot' : 'Dans cette scène'}><button className="btn small detail-open" onClick={() => details.open(item.id)}>{item.type === 'caption' ? 'Modifier les mots' : 'Modifier les éléments'}</button></Section>}
        {item.type === 'text' && <TextPanel item={item} set={set} setStyle={setStyle} setEditing={props.setEditing} />}
        {item.type === 'caption' && <CaptionPanel {...props} item={item} set={set} setStyle={setStyle} />}
        {item.type === 'layer' && <GraphicPanel item={item} apply={apply} />}
        {(item.type === 'video' || item.type === 'image' || item.type === 'audio') && <MediaPanel {...props} item={item} set={set} />}
        {item.type !== 'audio' && <PlacementPanel item={item} set={set} />}
        {item.type !== 'audio' && <Section title="Entrée">
          <Row label="Entrée"><Segmented name="Entrée" value={item.motion?.preset ?? 'none'} options={MOTIONS} onChange={(preset) => set({ motion: preset === 'none' ? undefined : { preset, durationInFrames: item.motion?.durationInFrames ?? Math.round(doc.fps * 0.4) } })} /></Row>
          {item.motion && <Row label="Durée"><NumberField name="Motion duration" value={item.motion.durationInFrames / doc.fps} min={1 / doc.fps} max={3} step={0.1} digits={2} unit=" s" onChange={(v, live) => set({ motion: { ...item.motion!, durationInFrames: Math.max(1, Math.round(v * doc.fps)) } }, live)} /></Row>}
        </Section>}
        <TimingPanel {...props} item={item} />
      </fieldset>
    </>
  );
}

// Split is only there while the playhead is inside the item; only this button follows the playhead.
function SplitButton({ frames, item, locked, split }: { frames: FrameStore; item: Item; locked: boolean; split: () => void }) {
  const frame = useFrame(frames);
  return <IconButton icon="split" label="Couper" disabled={locked || frame <= item.from || frame >= end(item)} onClick={split} />;
}

// Words placed by hand.
function TextPanel({ item, set, setStyle, setEditing }: { item: Item; set: (p: Partial<Item>, live?: boolean) => void; setStyle: (p: Partial<TextStyle>, live?: boolean) => void; setEditing: (id: string | null) => void }) {
  const looks = useMemo(allTextLooks, []);
  return (
    <>
      <Section title="Texte" aside={<button className="link" onClick={() => setEditing(item.id)}>Taper sur la vidéo</button>}>
        <TextArea name="Words" value={item.text ?? ''} rows={3} onChange={(v, live) => set({ text: v }, live)} />
      </Section>
      {fixedLook(item.style) ? <Section title="Apparence"><p className="ins-note">Tes propres lettres. Change les mots, l’apparence reste.</p></Section> : <>
        <LookPicker looks={looks} style={item.style} sample={(l) => l.text ?? 'Aa'} onPick={(look) => set({ style: applyLook(item.style, look) } as any)} />
        <StylePanel style={item.style ?? {}} setStyle={setStyle} caption={false} />
      </>}
    </>
  );
}

// A grid of looks: the editor's own and every installed pack's. Each tile draws its sample in the look's own style.
function LookPicker({ looks, style, sample, onPick }: { looks: Look[]; style?: TextStyle; sample: (look: Look) => string; onPick: (look: Look) => void }) {
  const current = currentLook(style, looks);
  return (
    <Section title="Apparence">
      <div className="looks" role="listbox" aria-label="Apparences">
        {looks.map((look) => {
          const s = look.style;
          return (
            <button key={look.id} role="option" aria-selected={current?.id === look.id} className={`look ${current?.id === look.id ? 'is-on' : ''}`} onClick={() => onPick(look)} title={look.label} data-look={look.id}>
              <span className="look-sample" style={{
                fontFamily: fontStack(s.font), fontWeight: nearestWeight(s.font, s.weight), color: s.color ?? '#fff', background: s.background,
                textTransform: s.caps ? 'uppercase' : undefined, WebkitTextStroke: s.stroke ? `1px ${s.stroke}` : undefined, paintOrder: 'stroke fill',
                padding: s.background ? '1px 5px' : 0,
              }}>
                {sample(look).split(' ').slice(0, look.id.includes('/') || !sample(look).startsWith('Dis') ? 2 : 3).map((w, i) => <span key={i} style={i === 1 && s.activeColor && s.animation !== 'karaoke' ? { color: s.activeColor } : undefined}>{i ? ' ' : ''}{w}</span>)}
              </span>
              <span className="look-name">{look.label}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function FontPicker({ value, onChange, allowed }: { value?: string; onChange: (id: string) => void; allowed?: string[] }) {
  const [open, setOpen] = useState(false);
  const font = fontById(value);
  const choices = FONTS.filter((f) => !allowed || allowed.includes(f.id));
  if (!choices.some((f) => f.id === font.id)) choices.unshift(font);
  return (
    <div className="font-pick">
      <button className="select" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open} name="Font" style={{ fontFamily: fontStack(font.id) }}>{font.label}<Icon name="chevron" size={14} /></button>
      {open && (
        <div className="menu fonts" role="listbox" onMouseLeave={() => setOpen(false)}>
          {choices.map((f) => <button key={f.id} role="option" aria-selected={f.id === font.id} className={f.id === font.id ? 'is-on' : ''} style={{ fontFamily: fontStack(f.id) }} onClick={() => { onChange(f.id); setOpen(false); }}>{f.label}</button>)}
        </div>
      )}
    </div>
  );
}

function StylePanel({ style, setStyle, caption }: { style: TextStyle; setStyle: (p: Partial<TextStyle>, live?: boolean) => void; caption: boolean }) {
  const s = caption ? { ...CAPTION_DEFAULTS, ...style } : style;
  const font = fontById(s.font);
  const weight = nearestWeight(s.font, s.weight);
  const hasOwnDraw = Boolean(s.look);
  const supports = (key: keyof TextStyle) => supportsStyle(style, key, caption);
  return (
    <Section title="Style">
      {hasOwnDraw && <p className="ins-note">Choisis une autre apparence pour plus de réglages.</p>}
      {supports('font') && <Row label="Police"><FontPicker value={s.font} allowed={lookFonts(style, caption)} onChange={(id) => setStyle({ font: id, weight: nearestWeight(id, s.weight) })} /></Row>}
      {supports('size') && <Row label="Taille"><NumberField name="Size" value={s.size ?? 72} min={8} max={400} unit=" px" onChange={(v, live) => setStyle({ size: v }, live)} /></Row>}
      {supports('weight') && font.weights.length > 1 && (
        <Row label="Graisse"><Segmented name="Graisse" value={weight} options={font.weights.map((w) => ({ value: w, label: w >= 800 ? 'Extra' : w >= 700 ? 'Gras' : w >= 600 ? 'Semi' : 'Moyen' }))} onChange={(w) => setStyle({ weight: w })} /></Row>
      )}
      {supports('color') && <Row label="Couleur" wide><ColorField name="Couleur" value={s.color ?? '#FFFFFF'} onChange={(v, live) => setStyle({ color: v ?? '#FFFFFF' }, live)} /></Row>}
      {caption && supports('activeColor') && <Row label="Mot en cours" wide><ColorField name="Mot en cours" optional value={s.activeColor} onChange={(v, live) => setStyle({ activeColor: v }, live)} /></Row>}
      {!caption && supports('align') && (
        <Row label="Alignement"><Segmented name="Alignement" value={s.align ?? 'center'} options={[{ value: 'left', label: <Icon name="alignLeft" size={16} />, title: 'Gauche' }, { value: 'center', label: <Icon name="alignCenter" size={16} />, title: 'Centre' }, { value: 'right', label: <Icon name="alignRight" size={16} />, title: 'Droite' }]} onChange={(v) => setStyle({ align: v as any })} /></Row>
      )}
      {supports('background') && <Row label="Encadré" wide><ColorField name="Encadré" optional value={s.background} onChange={(v, live) => setStyle({ background: v }, live)} /></Row>}
      {supports('stroke') && <Row label="Contour" wide><ColorField name="Contour" optional value={s.stroke} onChange={(v, live) => setStyle({ stroke: v }, live)} /></Row>}
      {supports('maxWidth') && <Row label="Largeur"><Slider name="Width" value={s.maxWidth ?? 0.84} min={0.3} max={1} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v, live) => setStyle({ maxWidth: v }, live)} /></Row>}
      <div className="ins-toggles">
        {supports('caps') && <Toggle name="Capitals" label="Majuscules" on={Boolean(s.caps)} onChange={(on) => setStyle({ caps: on })} />}
        {supports('shadow') && <Toggle name="Shadow" label="Ombre" on={s.shadow !== false} onChange={(on) => setStyle({ shadow: on })} />}
      </div>
    </Section>
  );
}

// Spoken words: the look, the words with their timing, and the style.
function CaptionPanel(props: InspectorProps & { item: Item; set: (p: Partial<Item>, live?: boolean, merge?: string) => void; setStyle: (p: Partial<TextStyle>, live?: boolean) => void }) {
  const { item, set, setStyle } = props;
  const looks = useMemo(allCaptionLooks, []);
  const s = { ...CAPTION_DEFAULTS, ...(item.style ?? {}) };
  return (
    <>
      <LookPicker looks={looks} style={item.style} sample={() => 'Dis-le comme ça'} onPick={(look) => set({ style: applyLook(item.style, look, { caption: true }) } as any)} />
      <CaptionWords {...props} />
      <Section title="Animation">
        {supportsStyle(item.style, 'animation', true)
          ? <Row label="Apparition"><Segmented name="Apparition des mots" value={s.animation ?? 'none'} options={[{ value: 'none', label: 'Fixe' }, { value: 'pop', label: 'Pop' }, { value: 'karaoke', label: 'Remplir' }, { value: 'word', label: 'Un seul' }]} onChange={(v) => setStyle({ animation: v as any })} /></Row>
          : <p className="ins-note">Cette apparence garde sa propre animation des mots. Choisis une apparence de l’éditeur pour la changer.</p>}
        <Row label="Par page">
          <NumberField name="Words per page" value={s.wordsPerPage ?? 3} min={1} max={12} onChange={(v) => set({ style: { ...item.style, wordsPerPage: v }, pages: undefined } as any)} />
        </Row>
        {item.pages?.length ? <p className="ins-note">Les pages ont été réglées à la main. Changer le nombre de mots par page les réinitialise.</p> : null}
        {supportsStyle(item.style, 'y', true) && <Row label="Hauteur"><Slider name="Height" value={s.y ?? 0.7} min={0.05} max={0.95} step={0.005} format={(v) => `${Math.round(v * 100)}%`} onChange={(v, live) => setStyle({ y: v }, live)} /></Row>}
      </Section>
      <StylePanel style={item.style ?? {}} setStyle={setStyle} caption />
    </>
  );
}

// The words as chips a page at a time, the one being said lit. Pick one to change it, nudge its timing, start a new
// page on it or join it with the next. Or edit all the words as text, keeping the timing of every word that stays.
function CaptionWords(props: InspectorProps & { item: Item; set: (p: Partial<Item>, live?: boolean, merge?: string) => void }) {
  const { item, set, doc } = props;
  const fps = doc.fps;
  const frame = useFrame(props.frames);
  const [picked, setPicked] = useState<number | null>(null);
  const [asText, setAsText] = useState(false);
  const words = item.words ?? [];
  const pages = useMemo(() => pagesOf(item, fps), [item.words, item.pages, item.style?.wordsPerPage, fps]);
  const local = frame - item.from + (item.trimStart ?? 0);
  const live = frame >= item.from && frame < end(item) ? activeWord(words, local) : -1;
  const at = (i: number) => item.from + words[i].from - (item.trimStart ?? 0);
  const change = (next: Item, merge?: string) => set({ words: next.words, pages: next.pages }, false, merge);
  const word = picked != null ? words[picked] : null;
  useEffect(() => { if (picked != null && picked >= words.length) setPicked(null); }, [words.length]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (live > -1 && props.frames.playing()) listRef.current?.querySelector(`[data-word="${live}"]`)?.scrollIntoView({ block: 'nearest' }); }, [live]);

  return (
    <Section title="Mots" aside={<button className="link" onClick={() => setAsText(!asText)}>{asText ? 'Voir les pages' : 'Modifier en texte'}</button>}>
      {asText ? (
        <>
          <TextArea name="Caption words" rows={6} value={plainText(item)} onChange={(text, isLive) => { if (!isLive) change(retext(item, text)); }} />
          <p className="ins-note">Les mots que tu gardes gardent leur timing.</p>
        </>
      ) : (
        <div className="cap-pages" ref={listRef}>
          {pages.map((page, p) => (
            <div key={p} className="cap-page">
              <span className="cap-n">{p + 1}</span>
              <div className="cap-words">
                {page.lines.map((line, l) => (
                  <React.Fragment key={l}>
                    {l > 0 && <i className="cap-break" title="Nouvelle ligne" />}
                    {line.map((i) => (
                      <button
                        key={i}
                        data-word={i}
                        {...(i === page.lines[0][0] && p === 0 ? { 'data-focus-first': true } : {})}
                        className={`chip ${i === live ? 'is-live' : ''} ${i === picked ? 'is-on' : ''} ${words[i].to <= (item.trimStart ?? 0) || words[i].from >= (item.trimStart ?? 0) + item.durationInFrames ? 'is-out' : ''}`}
                        onClick={() => { setPicked(i); props.seek(at(i)); }}
                      >{words[i].text}</button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              {p < pages.length - 1 && <button className="tool tiny" title="Fusionner avec la page suivante" aria-label="Fusionner avec la page suivante" onClick={() => change(joinPage(item, p, fps))}><Icon name="join" size={14} /></button>}
            </div>
          ))}
          {!pages.length && <p className="ins-note">Pas encore de mots. Utilise Modifier en texte.</p>}
        </div>
      )}
      {word && !asText && picked != null && (
        <div className="word-edit" key={picked}>
          <WordInput value={word.text} onCommit={(t) => change(editWord(item, picked, t))} />
          <div className="word-time">
            <span className="ins-label">Début</span>
            <button className="tool tiny" aria-label="Commencer plus tôt" onClick={() => change(nudgeWord(item, picked, 'from', -1), `w${picked}f`)}><Icon name="minus" size={13} /></button>
            <span className="mono">{timecode(at(picked), fps)}</span>
            <button className="tool tiny" aria-label="Commencer plus tard" onClick={() => change(nudgeWord(item, picked, 'from', 1), `w${picked}f`)}><Icon name="plus" size={13} /></button>
          </div>
          <div className="word-time">
            <span className="ins-label">Fin</span>
            <button className="tool tiny" aria-label="Finir plus tôt" onClick={() => change(nudgeWord(item, picked, 'to', -1), `w${picked}t`)}><Icon name="minus" size={13} /></button>
            <span className="mono">{timecode(item.from + word.to - (item.trimStart ?? 0), fps)}</span>
            <button className="tool tiny" aria-label="Finir plus tard" onClick={() => change(nudgeWord(item, picked, 'to', 1), `w${picked}t`)}><Icon name="plus" size={13} /></button>
          </div>
          <div className="word-time">
            <span className="ins-label">Décaler</span>
            <button className="tool tiny" aria-label="Décaler plus tôt" onClick={() => change(nudgeWord(item, picked, 'both', -1), `w${picked}b`)}><Icon name="minus" size={13} /></button>
            <span className="mono">1 image</span>
            <button className="tool tiny" aria-label="Décaler plus tard" onClick={() => change(nudgeWord(item, picked, 'both', 1), `w${picked}b`)}><Icon name="plus" size={13} /></button>
          </div>
          <div className="ins-buttons">
            <button className="btn small" onClick={() => change(splitPage(item, picked, fps))}>Nouvelle page ici</button>
            <button className="btn small" disabled={picked >= words.length - 1} onClick={() => change(mergeWord(item, picked))}>Fusionner avec le mot suivant</button>
            <button className="btn small danger" onClick={() => { change(deleteWord(item, picked)); setPicked(null); }}>Supprimer le mot</button>
          </div>
        </div>
      )}
    </Section>
  );
}

function WordInput({ value, onCommit }: { value: string; onCommit: (t: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <input className="word-input" name="Word" value={text} onChange={(e) => setText(e.target.value)} onBlur={() => text !== value && onCommit(text)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setText(value); }} />;
}

// A graphic: the few things its pack lets a person change, drawn the same for every pack.
function GraphicPanel({ item, apply }: { item: Item; apply: Apply }) {
  const kind = layers[item.renderer!];
  // A pack may give fields per item (a card whose words differ from card to card) as a function of the item.
  const fields = ((typeof kind?.fields === 'function' ? (kind.fields as any)(item) : kind?.fields) ?? []) as Field[];
  const write = (field: Field, value: any, live?: boolean) => apply((d) => { const current = itemById(d, item.id); return current ? updateItem(d, item.id, field.write(current, value)) : d; }, live);
  if (!kind) return <Section title="Graphique"><p className="ins-note">Ce graphique a besoin de son pack pour être exporté.</p></Section>;
  if (!fields.length) return <Section title="Graphique"><p className="ins-note">Déplace-le, redimensionne-le et cale-le ici. Son pack gère le reste.</p></Section>;
  return (
    <Section title="Graphique">
      {fields.map((field, n) => {
        const value = field.read(item);
        const focus = n === 0 ? { 'data-focus-first': true } : {};
        return (
          <Row key={field.key} label={field.label} wide={field.kind === 'longtext' || field.kind === 'color'}>
            {field.kind === 'text' && <PlainInput {...focus} name={field.label} value={value ?? ''} onCommit={(v) => write(field, v)} />}
            {field.kind === 'longtext' && <span {...focus} className="grow"><TextArea name={field.label} value={value ?? ''} onChange={(v, live) => write(field, v, live)} /></span>}
            {field.kind === 'number' && <NumberField name={field.label} value={Number(value) || 0} onChange={(v, live) => write(field, v, live)} />}
            {field.kind === 'color' && <ColorField name={field.label} value={value} onChange={(v, live) => write(field, v, live)} />}
            {field.kind === 'choice' && (field.choices!.length <= 4
              ? <Segmented name={field.label} value={value} options={field.choices!.map((c) => ({ value: c.value, label: c.label }))} onChange={(v) => write(field, v)} />
              : <select className="select" name={field.label} value={value} onChange={(e) => write(field, e.target.value)}>{field.choices!.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>)}
          </Row>
        );
      })}
    </Section>
  );
}

function PlainInput({ value, onCommit, name, ...rest }: { value: string; onCommit: (v: string) => void; name?: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <input {...rest} className="text-input" name={name} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => text !== value && onCommit(text)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />;
}

// A clip, a picture or a sound.
function MediaPanel(props: InspectorProps & { item: Item; set: (p: Partial<Item>, live?: boolean) => void }) {
  const { item, set, doc, apply } = props as any;
  const [replacing, setReplacing] = useState(false);
  const sound = item.type !== 'image';
  const speed = item.speed ?? 1;
  const setSpeed = (v: number) => apply((d: Doc) => {
    const current = itemById(d, item.id)!;
    const want = Math.max(1, Math.round((current.durationInFrames * (current.speed ?? 1)) / v));
    const next = updateItem(d, item.id, { speed: v, durationInFrames: Math.min(current.durationInFrames, want) });
    return trimItem(next, item.id, 'end', current.from + want);
  });
  const replace = async (entry: any) => {
    setReplacing(false);
    let patch: Partial<Item> = { src: entry.path, preview: undefined, trimStart: 0, crop: undefined, label: entry.name };
    if (entry.kind !== 'image') {
      const info = await fetch(`/api/edit/probe?path=${encodeURIComponent(entry.path)}`).then((r) => r.json()).catch(() => null);
      if (info?.duration) {
        const source = Math.max(1, Math.round(info.duration * doc.fps));
        patch = { ...patch, sourceDurationInFrames: source, durationInFrames: Math.min(item.durationInFrames, Math.floor(source / speed)) };
      }
      // A clip set in a window (a montage's rounded frame, a picture in picture) keeps its window and fills it, the way
      // replacing a clip keeps its place in CapCut; a full-frame clip takes the new file's shape.
      if (entry.kind === 'video' && info?.width) patch = item.size ? { ...patch, size: item.size, fit: 'cover' } : { ...patch, size: info.width / info.height !== doc.width / doc.height ? fitNew('video', { w: info.width, h: info.height }, doc) : undefined };
    } else {
      const img = await new Promise<{ w: number; h: number } | null>((ok) => { const i = new Image(); i.onload = () => ok({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => ok(null); i.src = entry.url; });
      if (img) patch.size = fitNew('image', img, doc);
    }
    apply((d: Doc) => updateItem(d, item.id, patch));
  };
  const cropping = props.cropping === item.id;
  return (
    <>
      {sound && (
        <Section title="Son">
          <Row label="Volume"><Slider name="Volume" value={item.volume ?? 1} min={0} max={MAX_VOLUME} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v, live) => apply((d: Doc) => setVolume(d, [item.id], v), live)} /></Row>
          <Row label="Fondu d’entrée"><NumberField name="Fade in" value={(item.fadeIn ?? 0) / doc.fps} min={0} max={item.durationInFrames / doc.fps} step={0.1} digits={1} unit=" s" onChange={(v, live) => apply((d: Doc) => setFade(d, item.id, 'in', Math.round(v * doc.fps)), live)} /></Row>
          <Row label="Fondu de sortie"><NumberField name="Fade out" value={(item.fadeOut ?? 0) / doc.fps} min={0} max={item.durationInFrames / doc.fps} step={0.1} digits={1} unit=" s" onChange={(v, live) => apply((d: Doc) => setFade(d, item.id, 'out', Math.round(v * doc.fps)), live)} /></Row>
          <Row label="Vitesse">
            <div className="speed">
              <Segmented name="Vitesse" value={speed} options={[0.5, 1, 1.5, 2].map((v) => ({ value: v, label: `${v}×` }))} onChange={(v) => setSpeed(v)} />
              <NumberField name="Speed value" value={speed} min={0.25} max={4} step={0.05} digits={2} unit="×" onChange={(v, live) => !live && setSpeed(v)} />
            </div>
          </Row>
        </Section>
      )}
      {item.type !== 'audio' && (
        <Section title="Image">
          {(item.size || item.type === 'image') && <Row label="Cadrage"><Segmented name="Cadrage" value={item.fit ?? (item.type === 'image' ? 'contain' : 'cover')} options={[{ value: 'cover', label: 'Remplir' }, { value: 'contain', label: 'Ajuster' }]} onChange={(v) => set({ fit: v as any })} /></Row>}
          <Row label="Coins"><NumberField name="Corners" value={item.radius ?? 0} min={0} max={400} unit=" px" onChange={(v, live) => set({ radius: v || undefined } as any, live)} /></Row>
          <div className="ins-buttons">
            <button className={`btn small ${cropping ? 'primary' : ''}`} onClick={() => props.setCropping(cropping ? null : item.id)}><Icon name="crop" size={15} />{cropping ? 'Terminé' : 'Recadrer'}</button>
            {hasCrop(item.crop) && <button className="btn small" onClick={() => set({ crop: undefined } as any)}>Annuler le recadrage</button>}
          </div>
        </Section>
      )}
      <Section title="Fichier" aside={<button className="link" onClick={() => setReplacing(true)}>Remplacer</button>}>
        <p className="file-path" title={item.src}>{item.src?.split('/').pop()}</p>
        {replacing && <MediaPicker media={props.media} kind={item.type} onPick={replace} onClose={() => setReplacing(false)} />}
      </Section>
    </>
  );
}

function PlacementPanel({ item, set }: { item: Item; set: (p: Partial<Item>, live?: boolean, merge?: string) => void }) {
  const t = full(item.transform);
  const put = (patch: Partial<Transform>, live?: boolean) => set({ transform: { ...t, ...patch } }, live);
  const moved = t.x || t.y || t.scale !== 1 || t.rotation || t.opacity !== 1;
  return (
    <Section title="Position" aside={moved ? <button className="link" onClick={() => set({ transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 } as any })}>Réinitialiser</button> : null}>
      <div className="grid2">
        <NumberField label="X" name="X" value={t.x} onChange={(v, live) => put({ x: v }, live)} />
        <NumberField label="Y" name="Y" value={t.y} onChange={(v, live) => put({ y: v }, live)} />
        <NumberField label="Taille" name="Size percent" value={t.scale} scale={100} min={0.02} max={20} step={0.01} unit="%" onChange={(v, live) => put({ scale: v }, live)} />
        <NumberField label="Rotation" name="Turn" value={t.rotation} min={-180} max={180} unit="°" onChange={(v, live) => put({ rotation: v }, live)} />
      </div>
      <Row label="Opacité"><Slider name="Opacity" value={t.opacity} min={0} max={1} format={(v) => `${Math.round(v * 100)}%`} onChange={(v, live) => put({ opacity: v }, live)} /></Row>
    </Section>
  );
}

function TimingPanel(props: InspectorProps & { item: Item; apply: Apply }) {
  const { item, doc, apply } = props;
  const fps = doc.fps;
  return (
    <Section title="Timing">
      <div className="grid2">
        <label className="num"><span className="num-label">Début</span><TimeField name="Start" value={item.from} fps={fps} onChange={(f) => apply((d) => moveItems(d, [item.id], f - item.from))} /></label>
        <label className="num"><span className="num-label">Durée</span><TimeField name="Length" value={item.durationInFrames} fps={fps} min={1} onChange={(f) => apply((d) => trimItem(d, item.id, 'end', item.from + Math.max(1, f)))} /></label>
      </div>
      <p className="ins-note mono">Finit à {timecode(end(item), fps)}</p>
    </Section>
  );
}
