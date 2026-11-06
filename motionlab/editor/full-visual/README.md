# Full Visual dans l’éditeur

Le lecteur ouvre le reel associé au projet : `reelSlug` ou `slug` dans `project.json`, sinon le nom qui suit
`<date>-full-visual-`. Il ne choisit jamais un reel sans rapport. Le reel reste dans `engine/full-visual/reels/`.

L’éditeur dessine les composants de scène d’origine et garde chaque scène animée, bloc de sous-titres, fond et voix off
comme un élément à part. Les sous-titres gardent les temps de leurs mots, leur mise en avant, leurs retours à la ligne et
leur look natif. Déplacements, coupes, divisions, fondus et transformations passent par l’éditeur commun. Les
chevauchements de scènes préservent les passages de relais animés du format.

Double-clique sur les sous-titres pour déplacer, restyler, caler et animer chaque mot. Une scène peut exposer des
composants nommés via `Editable` de `src/engine/Editable.tsx` et un export `editableScenes` à côté de sa table de
scènes. Le sélecteur de scènes ouvre n’importe quelle scène ; les composants enregistrés apparaissent dans la liste, sur
le canevas et dans leurs propres pistes de timeline. Le contrat et un exemple sont dans
`runtime/scripts/editor/EDITABLE.md` dans le dossier de build, ou `scripts/editor/EDITABLE.md` dans une installation.
Les scènes plus anciennes ont encore besoin de ces nœuds nommés avant que leurs parties internes soient modifiables.

Modifier un sous-titre ne recale pas les repères de la scène d’origine. Déplacer une scène ne déplace ni la voix off ni
le fond avec elle ; sélectionne aussi ces éléments pour changer tout le passage.

Si le code de la scène ne compile pas, l’image finie s’ouvre comme une vidéo avec son son d’origine. Les sous-titres et
le mouvement sont alors figés dans cette vidéo. Les notes de source expliquent cette limite ; le lecteur n’ajoute jamais
de sous-titres en double.

Tests : `node --test packs/full-visual/editor/*.test.mjs` depuis le dossier de build.
