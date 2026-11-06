export const meta = {
  name: 'full-visual-reel',
  description: 'Toute la vidéo Full Visual à partir d’un script validé : voix off, sous-titres, plan et critique, chaque scène et cinq accroches construites en parallèle avec relecteurs, rendus',
  whenToUse: 'Lancé par le skill full-visual une fois le script validé par le créateur, avec {slug, keyword, date, project}',
  phases: [
    { title: 'Son', detail: 'script, voix off, sous-titres' },
    { title: 'Plan', detail: 'plan visuel avec de vraies références, puis une critique' },
    { title: 'Squelette', detail: 'fichiers vides et les cinq variantes d’accroche' },
    { title: 'Construction', detail: 'chaque scène et cinq accroches à la fois : constructeur, relecteur, correcteur' },
    { title: 'Livraison', detail: 'cinq rendus, vérifications, livraison' },
  ],
}

// Every path is from the MotionLab folder's root, where the session runs.
const A = args || {}
const SLUG = A.slug
const FV = 'engine/full-visual'
const REEL = `${FV}/reels/${SLUG}`
const SK = '.agents/skills/full-visual'
const PROJECT = A.project ? `workspace/projects/${A.project}` : ''

const BASE = `Tu fabriques un reel Full Visual. Dossier du reel : ${REEL}. Moteur : ${FV} (lance ses commandes depuis là).
Lis d’abord, en entier : ${SK}/SKILL.md, ${SK}/references/taste.md (le niveau d’exigence) et ${SK}/references/examples.md, puis ouvre
l’exemple de reel le plus proche de ce sujet. La page de ton rôle est indiquée plus bas ; lis-la avant de commencer.
La vidéo est dans la langue du créateur, le français par défaut : voix off, sous-titres et légende dans la langue du script.${A.direction ? `
La direction du créateur pour ce reel : ${A.direction}` : ''}`

// 1. Words to sound
phase('Son')
await agent(`${BASE} Ta page : ${SK}/references/voice.md et ${SK}/references/engine.md.

1. Crée ${REEL}/. ${PROJECT ? `Copie ${PROJECT}/transcript.md dans script.txt mot pour mot, et ${PROJECT}/facts.md à côté s’il existe.` : 'script.txt est déjà là.'}
   Le script est validé : ne le réécris jamais et ne le revérifie pas.
2. La voix off, en une seule prise, selon voice.md (si voice.mp3 et voice.alignment.json existent déjà, garde-les). Puis le
   rythme : tighten.py avec les respirations de 0,30 s entre paragraphes et le plafond de 0,2 s, 3,3 à 3,5 mots par seconde.
3. caption.txt selon engine.md : scènes découpées par groupes de phrases, l’id de la première scène est "hook" et ne contient
   que la phrase d’accroche. Lance align.py, puis check.py plan jusqu’à ce qu’il sorte avec 0.
4. caption-post.txt : la légende du post, dans la langue du script.${A.keyword ? ` Elle commence par Commente "${A.keyword}" et je t’envoie ...` : ''}
Renvoie la durée de la voix off et les ids des scènes.`, { label: 'voix off + sous-titres', phase: 'Son' })

// 2. Plan, then critic
phase('Plan')
const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    world: { type: 'string' },
    scenes: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, component: { type: 'string' }, words: { type: 'string' }, picture: { type: 'string' },
    }, required: ['id', 'component', 'words', 'picture'] } },
  },
  required: ['world', 'scenes'],
}
await agent(`${BASE} Ta page : ${SK}/references/workflow.md, la section du plan (« The plan », section 2).

Écris ${REEL}/plan.md à partir de caption.txt, script.txt et facts.md. Une fois pour le reel : l’image fausse qu’a le
spectateur, le monde unique et ses échelles, l’objet fil rouge, la couleur unique de l’invisible, les fonds. Puis par scène :
ses mots, la vraie chose, d’où viennent ses images, et mot -> ce qui change. L’accroche a une seule ligne (« cinq variantes,
construites à part »). Récupère dès maintenant les vraies références de chaque scène dans ${REEL}/assets/refs/ : photos
produit, démontages, coupes, les vraies interfaces, logos, documents, vidéos, nommées d’après ce qu’elles montrent. Sois
ultra créatif et ultra illustratif : le spectateur doit ressortir en comprenant le mécanisme comme un expert.`, { label: 'plan', phase: 'Plan' })

const plan = await agent(`${BASE} Ta page : ${SK}/references/workflow.md, la section de la critique (« Critic », section 2).

Tu es le critique. Lis ${REEL}/plan.md face à taste.md, phrase par phrase, et regarde ses références. Traque : une image
principale qui en répète une précédente, une métaphore là où une vraie chose existe, une idée racontée au lieu d’être montrée
en marche, plus d’un point focal, une cause donnée par les mots que l’image ne montre pas, dix premières secondes trop
maigres, une scène avec trop peu de vraies références (va en chercher d’autres). Réécris plan.md sur place pour tout corriger.
Puis renvoie les scènes du corps (sans "hook") avec un nom de composant en PascalCase chacune, et le monde du reel en une ligne.`, { label: 'critique du plan', phase: 'Plan', schema: PLAN_SCHEMA })

const scenes = plan.scenes.filter(s => s.id !== 'hook')
log(`${scenes.length} scènes du corps + 5 accroches`)

// 3. Scaffold
phase('Squelette')
await agent(`${BASE} Ta page : ${SK}/references/engine.md.

Squelette seulement, aucun design. Dans ${REEL}/scenes/ : un fichier vide par scène (${scenes.map(s => `${s.id} -> ${s.component}.tsx`).join(', ')})
et HookX1.tsx .. HookX5.tsx, chacun exportant un composant qui n’affiche rien ; index.tsx associe chaque id de scène, "hook" ->
HookX1. Crée ${FV}/reels/${SLUG}-h1 .. -h5 comme le dit engine.md (mêmes caption.txt, words.json, reel.json et voix off ;
chaque scenes/index.tsx reprend les scènes de base et remplace hook par HookXn). Crée
${FV}/public/${SLUG}/. La vérification de types passe et une image fixe se rend.`, { label: 'squelette', phase: 'Squelette', effort: 'low' })

// 4. Build: every body scene and the five hooks at once
phase('Construction')
const SHARED = `D’autres agents construisent d’autres scènes en même temps : suis ${SK}/references/builder.md, la section sur
le travail à côté des autres constructeurs (« Working beside other builders »), et ${SK}/references/engine.md, la section
sur plusieurs constructeurs à la fois (« Many builders at once »).`

// How many agents build at once. The render queue and the type-check lock keep the machine safe, so the default lets
// every scene and every hook start together; pass a smaller slots on a small machine.
const SLOTS = Math.max(1, Number(A.slots ?? scenes.length + 5))
let running = 0
const waiting = []
const slot = async (fn) => {
  while (running >= SLOTS) await new Promise((r) => waiting.push(r))
  running++
  try { return await fn() } finally { running--; waiting.shift()?.() }
}

const REVIEW = { type: 'object', properties: { pass: { type: 'boolean' }, notes: { type: 'string' } }, required: ['pass', 'notes'] }

const buildScene = (s) => slot(async () => {
  const brief = `${BASE} Ta page : ${SK}/references/builder.md (en entier) et ${SK}/references/engine.md.

Tu construis la scène "${s.id}" dans ${REEL}/scenes/${s.component}.tsx (helpers préfixés ${s.component}). Ses mots : ${s.words}
Son plan est dans plan.md ; l’image : ${s.picture}. Le monde du reel : ${plan.world}.
Suis builder.md dans l’ordre : regarde d’abord la vraie chose (ouvre chaque référence en taille réelle, cherches-en d’autres,
écris ce que tu vois dans ${REEL}/notes/${s.component}.md), réfléchis avant de construire, construis, compare côte à côte,
puis la passe plus riche.
${SHARED}`
  await agent(brief, { label: `construction ${s.id}`, phase: 'Construction' })
  const r = await agent(`${BASE} Ta page : ${SK}/references/builder.md, la section de relecture au regard neuf (« Review, with fresh eyes »).

Relis la scène "${s.id}" (${REEL}/scenes/${s.component}.tsx), que tu n’as pas construite. Ses notes sont dans
${REEL}/notes/${s.component}.md et ses références dans ${REEL}/assets/refs/. Rends des images fixes toutes les ~0,4 s sur toute
sa durée et lis chacune en taille réelle à côté des références. Corrige toi-même les petites choses. Renvoie pass, ou des
notes sur lesquelles le constructeur peut agir.
${SHARED}`, { label: `relecture ${s.id}`, phase: 'Construction', schema: REVIEW })
  if (r.pass) return true
  await agent(`${brief}

Un relecteur au regard neuf a envoyé ces notes sur ta scène. Applique-les toutes, puis compare de nouveau côte à côte :
${r.notes}`, { label: `correction ${s.id}`, phase: 'Construction' })
  return true
})

const CONCEPTS = { type: 'object', properties: { concepts: { type: 'array', minItems: 5, maxItems: 5, items: {
  type: 'object', properties: { title: { type: 'string' }, move: { type: 'string' } }, required: ['title', 'move'] } } },
  required: ['concepts'] }

const hooks = (async () => {
  const c = await agent(`${BASE} Ta page : ${SK}/references/builder.md, la section sur l’accroche (« The hook »).

L’accroche est la première scène de ${REEL}/caption.txt, les trois à quatre premières secondes. Étudie ${SK}/examples/ps5-on-pc/code/HookVC*
(le niveau d’exigence), ${SK}/examples/touchscreen/code/HookX1* et ${SK}/examples/iphone-keyboard/code/HookX1*, avec leurs images fixes.
Décode la phrase d’accroche mot par mot (mot, vraie chose, verbe appliqué au héros). Puis invente cinq concepts d’accroche
pour CETTE histoire, chacun un grand geste physique différent sur sa vraie matière, chacun tombant sur le mot clé de
l’accroche. Cinq idées vraiment différentes, pas cinq versions d’une seule.`, { label: 'concepts d’accroche', phase: 'Construction', schema: CONCEPTS })
  return Promise.all(c.concepts.map((k, i) => slot(() => agent(`${BASE} Ta page : ${SK}/references/builder.md (en entier, la section sur l’accroche, « The hook », d’abord).

Tu construis la variante d’accroche ${i + 1} sur 5 : "${k.title}". Le geste : ${k.move}
Écris ${REEL}/scenes/HookX${i + 1}.tsx (helpers préfixés HookX${i + 1}). Elle ne couvre que la scène "hook" et passe le relais
proprement à la scène suivante. Regarde d’abord la vraie chose, écris ton tableau de mots dans ${REEL}/notes/HookX${i + 1}.md,
construis, compare, puis la passe plus riche. Rends des images fixes de ${SLUG}-h${i + 1} toutes les ~0,25 s sur l’accroche et lis-les
en taille réelle ; corrige jusqu’à ce que ce soit la meilleure accroche que tu aies vue. ${SHARED}`, { label: `accroche ${i + 1}`, phase: 'Construction' }).then(() => true))))
})()

const settled = (p) => p.catch((e) => { log(`échec : ${e && e.message}`); return false })
const [bodyDone, hooksDone] = await Promise.all([Promise.all(scenes.map((s) => settled(buildScene(s)))), settled(hooks)])
log(`corps : ${bodyDone.filter(Boolean).length}/${scenes.length}, accroches : ${Array.isArray(hooksDone) ? hooksDone.length : 0}/5`)

// 5. Deliver
phase('Livraison')
return await agent(`${BASE} Ta page : ${SK}/references/workflow.md, la section de livraison (« Deliver », section 5)${PROJECT ? `, et ${SK}/references/workspace.md` : ''}.

Depuis ${FV} : la vérification de types passe. Rends ${SLUG}-h1 .. ${SLUG}-h5 l’un après l’autre, jamais en même temps. Lance check.py
render sur chacun et corrige ce qui échoue dans la scène responsable, puis refais le rendu. Regarde chaque passage de relais
entre accroche et corps dans une rafale d’images fixes à 1/60 s. Arrête-toi et dis-le si le disque a moins de 2 Go libres.
Choisis l’accroche la plus forte au regard de taste.md.
${PROJECT
  ? `Livre dans workspace/output/${A.project}/ : ${SLUG}-h1.mp4 .. ${SLUG}-h5.mp4, caption.txt (depuis caption-post.txt), cover.jpg (une image forte), et en dernier, une fois toutes les vérifications passées, ${SLUG}.mp4, copie de l’accroche la plus forte.`
  : 'Laisse les rendus dans output/.'}
Pas de son : on le demande une fois au créateur, après qu’il a vu l’image. Renvoie les chemins complets, la durée de chaque
vidéo, l’accroche la plus forte et pourquoi en une ligne, et tout ce que tu n’as pas pu corriger.`, { label: 'rendu + livraison', phase: 'Livraison' })
