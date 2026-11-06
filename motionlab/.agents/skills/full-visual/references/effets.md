# Les effets prêts

Neuf effets, dans `engine/full-visual/src/fx/`, importables depuis `../../../src/engine` comme le reste. Chacun est une
fonction pure de l’image : une image fixe et un rendu disent la même chose. Chacun prend `start` en images : pose-le sur
son mot avec `cue()` ou `endsOn()`, comme tout ce qui bouge. On les voit tous dans `reels/exemple-effets`
(`node render.mjs exemple-effets`) et dans `effets/apercu.mp4` à la racine du dossier.

Un effet sert une phrase, jamais l’inverse. Il habille une vraie chose (un vrai chiffre, une vraie interface, une
vraie photo) ; il ne remplace jamais la vraie chose par un effet joli. Un ou deux par vidéo, pas plus.

| Effet | Ce que ça fait | Quand l’utiliser | Exemple |
|---|---|---|---|
| `Odometer` | Chaque chiffre roule jusqu’à sa place, les chiffres de gauche en dernier. | Un montant, un nombre d’abonnés, un prix qui tombe sur son mot. | `<Odometer value={12480} suffix=" €" start={cue("12")} />` |
| `Decode` | Chaque lettre passe par des signes au hasard puis se fixe, de gauche à droite. | Un prompt, un code, un mot de passe, une commande. | `<Decode text="npm run build" start={cue("lance")} />` |
| `Beam` | Une lumière court le long du bord d’une carte. | La carte qui compte (l’offre, le bon choix, l’outil). À mettre dans un parent en `position: relative`. | `<Beam w={640} h={360} r={32} start={cue("celle-ci")} />` |
| `Dust` | Un mot ou un bloc se défait en grains qui s’envolent (`out`), ou se forme depuis eux (`in`). | Ce qui disparaît, s’efface, est oublié. | `<Dust start={cue("disparaît")} w={700} h={170}>…</Dust>` |
| `PixelReveal` | Une image arrive en mosaïque de tuiles, puis les tuiles fondent. | Une image générée par une IA, une photo qui se charge, un résultat qui apparaît. | `<PixelReveal src={staticFile("<slug>/img.jpg")} w={600} h={600} start={cue("voilà")} />` |
| `Radar` | Des anneaux qui partent du centre et un balayage qui tourne. | Chercher, scanner, écouter, localiser. | `<Radar start={scene.from}><Icone /></Radar>` |
| `Orb` | Une sphère lumineuse dont les couleurs tournent ; elle respire plus vite avec `busy`. | Une IA qui réfléchit, un assistant, une voix. | `<Orb busy start={cue("réfléchit")} />` |
| `Glass` | Une carte en verre dépoli avec un bord éclairé. | Une interface posée au-dessus d’un fond chargé (particules, photo). | `<Glass w={640} h={360}>…</Glass>` |
| `Curve` | Une courbe lisse qui se dessine de gauche à droite, un point sur sa pointe, l’aire qui se remplit. | Une croissance, une baisse, un avant / après chiffré. | `<Curve points={[3, 4, 6, 9]} w={760} h={420} start={cue("monte")} />` |

Les couleurs se prennent dans le thème de la vidéo (`theme.marker.color`, `theme.roles.*`) ou dans la direction du
style (`styles/<id>/direction.md`), pas au hasard. Un effet qui ne tombe pas sur son mot est un défaut, comme le reste.
