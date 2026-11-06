# Écran tactile : faits (vérifiés le 2026-10-10)
| Affirmation | Preuve | URL |
|---|---|---|
| grille de lignes et de colonnes, un condensateur à chaque croisement | "consists of X by Y arrays of traces, creating X*Y units of capacitors. It creates a mutual capacitance between the elements of the columns and rows." | riverdi.com/blog/self-or-mutual-capacitive-touchscreen |
| le doigt prend une partie de la charge au croisement | extrait de recherche (canvys.com, page désormais en 404) : "some of the mutual capacitance between the row and column is coupled to the finger which reduce the capacitance" ; topwaydisplay.com : "When a finger or a conductive stylus approaches an electrode, it disturbs the electromagnetic field and alters the capacitance." | topwaydisplay.com/en/blog/what-is-projected-capacitive-touchscreen |
| balayage des intersections | "With mutual capacitance you need to scan the intersections of the electrodes, where the rows and columns overlap." | microtouch.com/faq |
| les gants sont des isolants | "Capacitive touch screens stop working with gloves because the material is an insulator that blocks electrical signals." | us.ktcplay.com/blogs/support-tips/why-gloves-dont-work-on-capacitive-touch-screens |
| l’eau provoque de faux appuis | "Water can interfere with a capacitive touch screen by changing the electrical conditions measured by its sensor." | touchpro.us/post/why-don-t-touch-screens-work-when-wet |
À lire en entier avant la voix off (seuls les extraits ont été ouverts aujourd’hui) : la FAQ microtouch, les pages sur les gants et sur l’eau ; et une source pour « le corps conduit parce qu’il est surtout de l’eau salée ».

## Ajouté pour le plan visuel (lu le 2026-10-11)
| À l’écran | Preuve | URL |
|---|---|---|
| `150 crossings` sur un exemple de 10 par 15, chacun balayé | "The 10 rows and 15 columns intersect at 10x15 or 150 intersections, so to scan the entire sensor you would need to scan at every one of those 150 intersections." et "With mutual capacitance, a touch takes some of the charge from the field that is created at the intersection of electrodes." | microtouch.com/faq |
| `120 scans a second` | Le tableau d’Apple lui-même, Touch Sample Rate : iPhone X 120 hz (iPhone plus anciens 60 hz). L’étiqueter `iPhone X and later` | developer.apple.com/library/archive/documentation/DeviceInformation/Reference/iOSDeviceCompatibility/Displays/Displays.html |
| `less than 1 pF` disparaît | "A user's touch disrupts the field between the two electrodes, reducing the coupling between them and removing mutual capacitance." "Typical changes in mutual capacitance due to a touch are small, usually less than 1pF." | TI CapTIvate Technology Guide, Capacitive Sensing Basics (software-dl.ti.com) |
| le fil fait le pont entre la peau et le verre | "The gloves are woven with conductive threads, typically in the fingertips" ; "The conductive thread effectively bridges the gap that's created by your non-conductive gloves" | olympiagloves.com/frigid-fingers-no-more-how-do-touch-screen-gloves-work-jfm |
| l’eau peut être lue comme un appui | "Water on the cover surface can change those measurements too." "The controller may interpret water as a touch" | touchpro.us/post/why-don-t-touch-screens-work-when-wet |
| l’iPhone verrouillé affiche `slide to answer` | capture d’écran iOS 17, assets/refs/ios17-locked-slide-to-answer-gadgethacks.webp | ios.gadgethacks.com |

Non vérifié, donc jamais écrit à l’écran comme un fait : le nombre de lignes et de colonnes d’un iPhone, l’écart entre les fils,
l’épaisseur du verre, toute valeur de comptage dans l’image tactile brute du téléphone (tout cela est dessiné, étiqueté `illustrative`).
