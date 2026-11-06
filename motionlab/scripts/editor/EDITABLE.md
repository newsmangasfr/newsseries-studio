# Modifier l’intérieur d’une scène

Le but est de changer les parties visibles d’une vidéo tout en gardant sa mise en page et son mouvement d’origine. L’éditeur enregistre des modifications sur des nœuds nommés, donc une carte, son titre et un mot des sous-titres peuvent chacun bouger sans aplatir leur scène en image. Le Player et l’export lisent le même document et les mêmes fonctions d’interpolation.

Les sous-titres ne demandent aucun branchement par projet. `withWordIds` donne à chaque mot un identifiant stable. Les moteurs de sous-titres Universal, Full Visual et Talking Head appliquent `word.edit` et exposent `data-word-id`. Les corrections gardent les identifiants ; diviser un sous-titre décale l’horloge d’animation pour que son mouvement continue exactement.

Une scène sur mesure expose les parties qu’une personne doit pouvoir changer. Remplace le nœud DOM existant par `Editable`, en gardant ses styles et ses enfants, puis déclare ses champs dans le tableau `elements` du registre de calques. Les identifiants restent stables d’une révision à l’autre. Un groupe et ses enfants peuvent chacun être exposés ; le canevas sélectionne le plus petit nœud visible sous le pointeur. La liste rend aussi le parent sélectionnable.

```tsx
import { Editable } from 'motionlab-editable';

export const Card = () => (
  <Editable id="card" style={{ position: 'absolute', left: 90, top: 700, width: 900 }}>
    <Editable id="heading" style={{ fontSize: 50 }}>Your heading</Editable>
  </Editable>
);
export const layers = {
  'demo/card': {
    draw: Card,
    elements: [
      { id: 'card', label: 'Card', kind: 'group' },
      { id: 'heading', parent: 'card', label: 'Heading', kind: 'text', text: 'Your heading', size: 50 },
    ],
  },
};
```

L’alias `motionlab-editable` appartient aux bundles d’aperçu et d’export de l’éditeur. Un projet autonome a besoin de son propre pont ou d’un alias équivalent. Full Visual fournit déjà un pont autonome dans `src/engine/Editable.tsx` ; ses scènes importent ce pont, et son adaptateur fournit les modifications enregistrées. Ainsi, le build du reel d’origine reste indépendant de l’éditeur.

Pour Full Visual, exporte `editableScenes` à côté de `scenes` dans le `scenes/index.tsx` du reel. Ses clés sont les identifiants de scène et ses valeurs sont les mêmes tableaux `elements` que ci-dessus. `makeSceneLayers` enregistre ces contrôles automatiquement.

## Modifications enregistrées

Un mot garde ses modifications sous `word.edit` ; un graphique utilise `item.elements[elementId]`. Les modifications couvrent le texte, la couleur, la taille de police, la visibilité, la translation, l’échelle, la rotation et l’opacité. Les images peuvent changer de ressource via `src` ; un sélecteur visuel de source ne fait pas partie de cette première version.

L’animation utilise `keyframes[property] = [{ frame, value, easing }]`, avec un easing `linear` ou `smooth`. L’image est sur l’horloge locale d’origine de l’élément. `clockOffset` porte cette horloge à travers les coupes de sous-titres. Les points gardent leur première et leur dernière valeur hors de leur intervalle. Modifier une valeur pendant qu’elle est animée écrit un point à la tête de lecture ; simplement entrer dans une valeur ou en sortir n’ajoute jamais de point. Chaque glisser est une seule étape d’annulation.

Double-clique sur un sous-titre ou une scène exposée pour ouvrir ses enfants. La timeline zoome sur cet élément et revient à sa vue précédente à la fermeture. Les mots peuvent se déplacer et se couper dans le temps sur leur piste dépliée. Les composants montrent leur propre piste et leurs points d’animation. Les repères d’origine de la scène restent tels qu’écrits ; ces points ajoutent un mouvement modifiable par-dessus.

Des nœuds explicites sont la bonne frontière. Expose bien une carte et son titre avec des identifiants stables. Ne déduis pas un arbre de composants modifiables à partir d’un MP4 et ne promets pas qu’un panneau de propriétés peut réécrire n’importe quel JSX calculé. Les scènes plus anciennes ont besoin de cette petite adaptation avant que leurs parties internes deviennent modifiables.
