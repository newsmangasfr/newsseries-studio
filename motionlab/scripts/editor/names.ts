// What an item is called in the inspector and the add panel: by its type, never by the format that made it.
import { layers } from 'motionlab-layers';
import type { Item } from './types';

export const KIND_NAME: Record<Item['type'], string> = { video: 'Clip', audio: 'Son', image: 'Image', text: 'Texte', caption: 'Sous-titres', layer: 'Graphique' };

export function itemName(item: Item) {
  if (item.type === 'layer') return layers[item.renderer!]?.label?.(item) ?? item.label ?? 'Graphique';
  if (item.type === 'text') return item.text?.split('\n')[0] || 'Texte';
  if (item.type === 'caption') return item.label || (item.words ?? []).slice(0, 5).map((w) => w.text).join(' ') || 'Sous-titres';
  return item.label || (item.src ?? '').split('/').pop() || KIND_NAME[item.type];
}

export const kindIcon = (item: Item) => (item.type === 'layer' ? 'layer' : item.type === 'text' ? 'text' : item.type === 'caption' ? 'captions' : item.type === 'audio' ? 'sound' : item.type);
