#!/usr/bin/env bash
# Démarre un nouveau short d'actu séries à partir d'un des modèles déjà réalisés.
# Usage (depuis la racine du dépôt) : bash outils/nouveau_short.sh <modèle> <nom-du-projet>
#   liste        → modele-liste  (une liste de titres : une affiche par série, chapitres par mois)
#   film         → modele-film     (une annonce autour d'une affiche : date, slogan, détails de l'affiche)
#   personnages  → modele-personnages   (une annonce + une fiche par personnage, couleurs de la série)
#   teaser       → modele-teaser   (un teaser vidéo découpé en plans verticaux, style sombre et brutal)
# Copie les scripts (tools/), le logo, GSAP et les réglages HyperFrames ; ni images, ni voix, ni rendus.
set -euo pipefail
declare -A M=([liste]=modele-liste [film]=modele-film [personnages]=modele-personnages [teaser]=modele-teaser)
[ $# -eq 2 ] && [ -n "${M[$1]:-}" ] || { sed -n '2,9p' "$0"; exit 1; }
SRC="video-projects/${M[$1]}"; DST="video-projects/$2"
[ -e "$DST" ] && { echo "$DST existe déjà" >&2; exit 1; }
mkdir -p "$DST"/{tools,audio/vo,renders,assets/src,assets/brand,assets/vendor}
cp "$SRC"/tools/*.py "$SRC"/tools/*.sh "$SRC"/tools/style.css "$DST/tools/"
cp "$SRC"/tools/vo*.json "$DST/tools/" 2>/dev/null || true
cp "$SRC"/assets/brand/logo.png "$DST/assets/brand/"
cp "$SRC"/assets/vendor/gsap.min.js "$DST/assets/vendor/"
cp "$SRC"/package.json "$SRC"/hyperframes.json "$DST/"
sed -i "s/${M[$1]}/$2/" "$DST/package.json"
[ -f "$SRC/tools/make_fx.py" ] && (cd "$DST" && ../../outils/.venv/bin/python -I tools/make_fx.py >/dev/null 2>&1 || true)
echo "→ $DST prêt (modèle « $1 », copié de $SRC)"
echo "Ensuite : mets les visuels dans $DST/assets/src, réécris tools/vo.json, puis suis le skill short-actu-serie."
