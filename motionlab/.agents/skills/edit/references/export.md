# Comment marche l’export

## Objectif

Savoir ce que l’export a fait à chaque élément, et pourquoi une vérification a réussi ou échoué, sans lire le script.

## Le plan

`scripts/edit-export.mjs` découpe le document selon une seule règle, jamais selon le format.

- **Intact** (ffmpeg) : un élément vidéo sur une piste visible sans boîte (ou avec une boîte de la taille de l’image), sans recadrage, sans coins arrondis, sans déplacement, mise à l’échelle ni rotation, à pleine opacité, sans fondus, en ajustement cover (ou contain quand les formes correspondent), et sans rien dessiné sous lui sur une piste inférieure pendant qu’il joue. Il est coupé dans son fichier à `trimStart`, accéléré avec `setpts`, mis à la cadence du montage (chaque image montre l’image source à l’écran à ce moment-là, comme le fait l’éditeur), mis à l’échelle pour couvrir et centré. Les trous entre clips intacts prennent la couleur de fond du montage. Un fichier qui ne dit pas comment ses couleurs sont stockées est lu en bt709, comme le lit le navigateur.
- **Dessiné** (Remotion) : tout le reste du visuel, rendu par `scripts/editor/render-root.tsx` (composition `Edit`) en sautant les éléments intacts, sans son, sur fond transparent. Les images partent vers ffmpeg en flux PNG ; rien de gros n’atterrit sur le disque. Le bundle de rendu porte le même registre `motionlab-layers` que la page de l’éditeur (y compris les graphismes propres au projet), et un dossier public avec chaque fichier que nomme le document sous `media/`, plus le dossier du projet et chaque `public/` installé pour `staticFile()`.
- **Son** (ffmpeg) : chaque élément audio sur une piste non coupée, et le son de chaque élément vidéo sur une piste visible et non coupée, avec son volume, ses fondus, sa vitesse (`atempo`) et son départ. Additionnés sans être baissés, puis un limiteur à 0,95.
- Une seule passe ffmpeg pose la piste dessinée sur la base en RGB et encode en H.264 crf 18, yuv420p, bt709, AAC 192k, faststart.

Les pistes masquées ne dessinent rien et ne jouent rien. Un graphisme dont le pack n’est pas installé arrête le rendu (sinon il livrerait un emplacement vide).

## Les vérifications

| Vérification | Réussite |
|---|---|
| length | images et secondes à une image près du montage |
| size, rate | exactement ceux du montage |
| sound | un flux audio exactement quand quelque chose joue, et audible |
| peak | l’échantillon le plus fort sous la pleine échelle |
| frame N | PSNR de l’export face à `Edit` dessiné en entier à cette image, au moins 30 dB |
| drawn N | différence moyenne sur les pixels dessinés, au plus 16 sur 255 |
| caption | au moment du premier mot de sous-titre, la piste dessinée contient les mots |

Les images sont la plus chargée (l’image d’aperçu), un moment de sous-titres quand il y en a, et des images réparties. Chaque paire est enregistrée sous `edit/checks/r<revision>/f<frame>.jpg`.

## Quand une vérification échoue

- Une image échoue mais sa vérification drawn passe : le clip en dessous diffère. Regarde la paire : une image de décalage dans le temps veut dire un arrondi de cadence ou de vitesse ; une dominante de couleur veut dire les balises de couleur du fichier.
- Une vérification drawn échoue : la piste dessinée diffère de l’image de l’éditeur (une police qui n’a pas chargé, un graphisme qui lit un fichier qui n’a pas été préparé).
- Caption échoue : l’élément de sous-titres ne dessine rien dans l’export ; vérifie que son look est installé.
- Length échoue : un clip dépasse la fin de son fichier ; la vérification du document attrape normalement ça avant.

## Place

L’export refuse quand le disque a moins que le plus grand de 2 Go et de la taille de la vidéo plus 1 Go. Le bundle et les fichiers préparés sont supprimés à la fin, en réussite comme en échec.
