#!/usr/bin/env python3
"""StudioFX : une seule commande pour les 12 outils de montage open source.

  studiofx scenes      <vidéo> [--decouper]                 PySceneDetect : trouve les plans (et les découpe)
  studiofx silences    <vidéo> [--marge 0.1]                Auto-Editor : retire les blancs et les pauses
  studiofx stabiliser  <vidéo> [--lissage 30]               vid.stab (dans FFmpeg) : stabilise une prise tremblée
  studiofx couleurs    <image|vidéo> --ref <image>          color-matcher : donne à un plan les couleurs d'une référence
  studiofx detourer    <image|vidéo> [--modele u2net]       rembg : retire le fond, sans fond vert
  studiofx ralenti     <vidéo> [--facteur 2]                RIFE (ncnn) ou, à défaut, l'interpolation de FFmpeg
  studiofx agrandir    <image|vidéo> [--echelle 4]          Real-ESRGAN (ncnn) : agrandit et nettoie
  studiofx pistes      <audio|vidéo>                        Demucs (htdemucs) : voix, batterie, basse, autres
  studiofx tempo       <audio|vidéo>                        librosa : tempo et temps forts, en JSON
  studiofx titres      <dossier HyperFrames>                HyperFrames : rendu d'un projet de titres animés
  studiofx exporter    <vidéo> [--format tiktok]            FFmpeg : export final (tiktok, youtube, web, master)
  studiofx mots        <audio|vidéo> [--sortie mots.json]   Vosk : transcription française mot à mot, hors ligne
  studiofx analyser    <vidéo>                              rea-video : décortique une vidéo de référence (plans, rythme, tempo, bruitages)
  studiofx verifier                                         vérifie que chaque outil répond

Chaque commande écrit à côté de l'entrée (ou dans --sortie) et n'écrase jamais l'original.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ICI = Path(__file__).resolve().parent
VENV = ICI / ".venv" / "bin"
BIN = ICI / "bin"
RIFE = BIN / "rife-ncnn-vulkan-20221029-ubuntu" / "rife-ncnn-vulkan"
ESRGAN = BIN / "realesrgan-ncnn" / "realesrgan-ncnn-vulkan"
IMAGES = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def run(cmd, **kw):
    print("→", " ".join(str(c) for c in cmd), flush=True)
    return subprocess.run([str(c) for c in cmd], check=True, **kw)


def outil(nom):
    p = VENV / nom
    return p if p.exists() else (shutil.which(nom) or sys.exit(f"{nom} manque : lance outils/installer.sh"))


def sortie(entree, suffixe, ext=None, dossier=None):
    e = Path(entree)
    d = Path(dossier) if dossier else e.parent
    d.mkdir(parents=True, exist_ok=True)
    return d / f"{e.stem}-{suffixe}{ext or e.suffix}"


def fps_de(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", str(video)],
                       capture_output=True, text=True, check=True).stdout.strip()
    n, d = r.split("/")
    return float(n) / float(d)


def a_du_son(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", str(video)], capture_output=True, text=True)
    return bool(r.stdout.strip())


def images(video, dossier, vf=None):
    run(["ffmpeg", "-y", "-v", "error", "-i", video, *(["-vf", vf] if vf else []), f"{dossier}/%06d.png"])


def remonter(dossier, fps, video_son, out, motif="%06d.png", extra=()):
    son = ["-i", video_son, "-map", "0:v", "-map", "1:a?", "-c:a", "aac", "-b:a", "192k"] if video_son and a_du_son(video_son) else []
    run(["ffmpeg", "-y", "-v", "error", "-framerate", f"{fps:.6f}", "-i", f"{dossier}/{motif}", *son, *extra,
         "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-shortest", out])


# ------------------------------------------------------------------ commandes
def c_scenes(a):
    d = Path(a.sortie or Path(a.entree).with_suffix("")).as_posix() + ("" if a.sortie else "-plans")
    cmd = [outil("scenedetect"), "-i", a.entree, "-o", d, "detect-adaptive", "list-scenes", "-q"]
    if a.decouper:
        cmd += ["split-video"]
    run(cmd)
    print(f"plans : {d}")


def c_silences(a):
    out = a.sortie or sortie(a.entree, "sans-pauses")
    run([outil("auto-editor"), a.entree, "--margin", f"{a.marge}s", "-o", out, "--no-open"], stdout=subprocess.DEVNULL)
    print(f"→ {out}")


def c_stabiliser(a):
    out = a.sortie or sortie(a.entree, "stable")
    with tempfile.TemporaryDirectory() as t:
        trf = Path(t) / "mouvement.trf"
        run(["ffmpeg", "-y", "-v", "error", "-i", a.entree, "-vf", f"vidstabdetect=shakiness={a.tremblement}:accuracy=15:result={trf}", "-f", "null", "-"])
        run(["ffmpeg", "-y", "-v", "error", "-i", a.entree, "-vf", f"vidstabtransform=input={trf}:smoothing={a.lissage}:zoom={a.zoom}:optzoom=0,unsharp=5:5:0.6",
             "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "copy", out])
    print(f"→ {out}")


def _match(src, ref, out, methode):
    run([VENV / "python", "-I", "-c",
         "import sys, numpy as np; from color_matcher import ColorMatcher; from color_matcher.io_handler import load_img_file, save_img_file;"
         "from color_matcher.normalizer import Normalizer;"
         "s, r = load_img_file(sys.argv[1]), load_img_file(sys.argv[2]);"
         "o = ColorMatcher().transfer(src=s, ref=r, method=sys.argv[4]); save_img_file(Normalizer(o).uint8_norm(), sys.argv[3])",
         src, ref, out, methode], stdout=subprocess.DEVNULL)


def c_couleurs(a):
    e = Path(a.entree)
    if e.suffix.lower() in IMAGES:
        out = a.sortie or sortie(e, "etalonne", ".png")
        _match(e, a.ref, out, a.methode)
    else:
        out = a.sortie or sortie(e, "etalonne", ".mp4")
        with tempfile.TemporaryDirectory() as t:
            images(e, t)
            fr = sorted(Path(t).glob("*.png"))
            print(f"{len(fr)} images à étalonner sur {a.ref}")
            for p in fr:
                _match(p, a.ref, p, a.methode)
            remonter(t, fps_de(e), e, out)
    print(f"→ {out}")


def c_detourer(a):
    e = Path(a.entree)
    rembg = outil("rembg")
    if e.suffix.lower() in IMAGES:
        out = a.sortie or sortie(e, "detoure", ".png")
        run([rembg, "i", "-m", a.modele, e, out], stderr=subprocess.DEVNULL)
    else:
        out = a.sortie or sortie(e, "detoure", ".webm")
        with tempfile.TemporaryDirectory() as t:
            src, dst = Path(t) / "in", Path(t) / "out"
            src.mkdir(); dst.mkdir()
            images(e, src)
            run([rembg, "p", "-m", a.modele, src, dst], stderr=subprocess.DEVNULL)
            # VP9 avec couche alpha : se pose directement dans HyperFrames, Remotion ou un logiciel de montage
            run(["ffmpeg", "-y", "-v", "error", "-framerate", f"{fps_de(e):.6f}", "-i", f"{dst}/%06d.png", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "4M", out])
    print(f"→ {out}")


def c_ralenti(a):
    e = Path(a.entree)
    out = a.sortie or sortie(e, f"ralenti-x{a.facteur}", ".mp4")
    fps = fps_de(e)
    methode = a.methode
    if methode == "auto":
        methode = "rife" if RIFE.exists() and os.environ.get("STUDIOFX_RIFE", "1") != "0" else "ffmpeg"
    if methode == "rife":
        with tempfile.TemporaryDirectory() as t:
            src, dst = Path(t) / "in", Path(t) / "out"
            src.mkdir(); dst.mkdir()
            images(e, src)
            n = len(list(src.glob("*.png"))) * a.facteur
            run([RIFE, "-i", src, "-o", dst, "-m", RIFE.parent / a.modele, "-n", n], cwd=RIFE.parent)
            # même cadence : la scène dure facteur fois plus longtemps (vrai ralenti) ; le son n'est pas gardé
            remonter(dst, fps, None, out, "%08d.png")
    else:
        # interpolation à compensation de mouvement de FFmpeg (sans IA), puis étirement du temps
        run(["ffmpeg", "-y", "-v", "error", "-i", e, "-an", "-vf",
             f"minterpolate=fps={fps * a.facteur:.4f}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,setpts={a.facteur}*PTS",
             "-r", f"{fps:.4f}", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", out])
    print(f"→ {out} ({methode})")


def c_agrandir(a):
    e = Path(a.entree)
    models = ESRGAN.parent / "models"
    if e.suffix.lower() in IMAGES:
        out = a.sortie or sortie(e, f"x{a.echelle}", ".png")
        run([ESRGAN, "-i", e, "-o", out, "-n", a.modele, "-s", a.echelle, "-m", models], stderr=subprocess.DEVNULL)
    else:
        out = a.sortie or sortie(e, f"x{a.echelle}", ".mp4")
        with tempfile.TemporaryDirectory() as t:
            src, dst = Path(t) / "in", Path(t) / "out"
            src.mkdir(); dst.mkdir()
            images(e, src)
            run([ESRGAN, "-i", src, "-o", dst, "-n", a.modele, "-s", a.echelle, "-m", models, "-f", "png"], stderr=subprocess.DEVNULL)
            remonter(dst, fps_de(e), e, out)
    print(f"→ {out}")


def c_pistes(a):
    d = Path(a.sortie or Path(a.entree).with_suffix("")).as_posix() + ("" if a.sortie else "-pistes")
    run([outil("audio-separator"), a.entree, "-m", a.modele, "--output_dir", d, "--output_format", "WAV"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for p in sorted(Path(d).glob("*")):
        print("→", p)


def c_tempo(a):
    import librosa  # noqa: lancé dans le venv
    import numpy as np
    y, sr = librosa.load(a.entree, sr=22050, mono=True)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    t = librosa.frames_to_time(beats, sr=sr).tolist()
    tempo = float(np.atleast_1d(tempo)[0])
    # librosa se cale souvent sur la moitié du vrai tempo : on double sous le seuil, temps intermédiaires compris
    if tempo < a.min_bpm and len(t) > 1:
        tempo *= 2
        t = sorted(t + [(x + y2) / 2 for x, y2 in zip(t, t[1:])])
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    fort = librosa.frames_to_time(librosa.util.peak_pick(onset, pre_max=10, post_max=10, pre_avg=20, post_avg=20, delta=onset.std() * 1.5, wait=20), sr=sr).tolist()
    out = Path(a.sortie or sortie(a.entree, "tempo", ".json"))
    out.write_text(json.dumps({"tempo_bpm": round(tempo, 2), "temps": [round(x, 3) for x in t], "accents": [round(x, 3) for x in fort]}, indent=1))
    print(f"tempo {tempo:.1f} BPM, {len(t)} temps, {len(fort)} accents → {out}")


def c_mots(a):
    """Transcription française mot à mot (Vosk, hors ligne) : {"words": [{start, end, text}]}, le format que lit le skill
    long-video-en-cut-reel, plus un fichier .txt lisible avec l'instant de chaque phrase."""
    from vosk import KaldiRecognizer, Model, SetLogLevel  # noqa: lancé dans le venv
    import wave
    SetLogLevel(-1)
    modele = BIN / "vosk" / "vosk-model-fr-0.22"
    if not modele.exists():
        sys.exit("le modèle Vosk français manque (outils/bin/vosk/vosk-model-fr-0.22) : voir outils/README.md")
    out = Path(a.sortie or sortie(a.entree, "mots", ".json"))
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "a.wav"
        run(["ffmpeg", "-y", "-v", "error", "-i", a.entree, "-vn", "-ac", "1", "-ar", "16000", wav])
        wf = wave.open(str(wav))
        rec = KaldiRecognizer(Model(str(modele)), wf.getframerate())
        rec.SetWords(True)
        mots = []
        while True:
            data = wf.readframes(4000)
            if not data:
                break
            if rec.AcceptWaveform(data):
                mots += json.loads(rec.Result()).get("result", [])
        mots += json.loads(rec.FinalResult()).get("result", [])
    words = [{"start": round(w["start"], 3), "end": round(w["end"], 3), "text": w["word"]} for w in mots]
    out.write_text(json.dumps({"words": words}, ensure_ascii=False))
    # texte lisible : une ligne par phrase (coupée sur un silence de plus de 0,35 s, ou après 14 mots)
    lignes, cur = [], []
    for w in words:
        if cur and (w["start"] - cur[-1]["end"] > 0.35 or len(cur) >= 14):
            lignes.append(cur); cur = []
        cur.append(w)
    if cur:
        lignes.append(cur)
    out.with_suffix(".txt").write_text("\n".join(f"[{int(l[0]['start'] // 60)}:{l[0]['start'] % 60:04.1f}] " + " ".join(w["text"] for w in l) for l in lignes) + "\n")
    print(f"{len(words)} mots, {len(lignes)} phrases → {out} et {out.with_suffix('.txt')}")


def c_analyser(a):
    """Décortique une vidéo de référence avec rea-video (hors ligne, gratuit) et écrit une fiche de montage en français :
    nombre de plans, rythme par tranche de 10 s, instants de coupe, tempo, coupes calées sur le temps, bruitages, voix,
    autocollants. Le rapport complet de rea-video (report.html, planche d'images, pistes) reste dans le dossier."""
    d = Path(a.sortie or Path(a.entree).with_suffix("").as_posix() + "-analyse")
    d.mkdir(parents=True, exist_ok=True)
    env = {**os.environ, "REA_VIDEO_HOME": str(ICI / ".rea-video")}
    run([outil("rea-video"), "decompose", a.entree, "-o", d / "rea"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    b = json.loads((d / "rea" / "breakdown.json").read_text())
    dur = b["summary"]["duration"]
    plans = b["shots"]
    coupes = [round(x["start"], 2) for x in plans[1:]]
    musique = b["audio"].get("music", {})
    bpm = musique.get("tempo_bpm")
    temps = musique.get("beats", [])
    calees = None
    if temps and coupes:
        # une coupe est « sur le temps » si un temps de musique tombe à moins de 80 ms
        calees = round(100 * sum(1 for c in coupes if min(abs(c - t) for t in temps) <= 0.08) / len(coupes))
    tranches = [{"de": t, "a": min(t + 10, round(dur, 1)), "coupes": sum(1 for c in coupes if t <= c < t + 10)} for t in range(0, int(dur) + 1, 10) if t < dur]
    longs = sorted(plans, key=lambda x: -x["duration"])[:3]
    fiche = {
        "video": str(a.entree), "duree_s": round(dur, 2), "format": f"{b['source']['width']}x{b['source']['height']} à {b['source']['fps']:.0f} i/s",
        "plans": len(plans), "duree_moyenne_plan_s": round(dur / len(plans), 2), "plans_par_minute": round(len(plans) / dur * 60, 1),
        "instants_de_coupe_s": coupes, "rythme_par_10s": tranches,
        "plans_les_plus_longs": [{"de": round(x["start"], 1), "duree": round(x["duration"], 1)} for x in longs],
        "tempo_bpm": bpm, "coupes_sur_le_temps_pct": calees,
        "bruitages": [{"t": x["t"], "type": x["type"]} for x in b["audio_plan"]["sfx_merged"]],
        "voix_s": b["audio"].get("voice", {}).get("segments", []) if b["audio"].get("voice", {}).get("present") else [],
        "musique_s": musique.get("segments", []),
        "autocollants_et_incrustations": [{"de": x["t0"], "a": x["t1"], "type": x["kind"]} for x in b["packaging"].get("stickers", [])],
        "methode_de_fabrication_brute": b["summary"]["verdict"], "confiance": b["summary"]["confidence"],
        "avertissement": "La méthode de fabrication (réel / IA / 3D) vient de statistiques sur les pixels : elle n'est pas fiable sur du dessin animé ou du motion design. Les plans, le rythme et le tempo sont fiables ; les bruitages, la voix et les incrustations sont indicatifs (à vérifier en regardant la vidéo).",
    }
    (d / "fiche.json").write_text(json.dumps(fiche, indent=1, ensure_ascii=False))
    lignes = [f"# Fiche de montage : {Path(a.entree).name}", "",
              f"- Durée : {fiche['duree_s']} s ({fiche['format']})",
              f"- Plans : {fiche['plans']} (en moyenne {fiche['duree_moyenne_plan_s']} s, soit {fiche['plans_par_minute']} par minute)",
              f"- Tempo de la musique : {bpm} BPM" + (f", {calees} % des coupes tombent sur un temps" if calees is not None else "") if bpm else "- Pas de musique détectée",
              "", "## Rythme (coupes par tranche de 10 s)"] + [f"- {t['de']}–{t['a']} s : {t['coupes']} coupe(s)" for t in tranches] + \
             ["", "## Plans les plus longs"] + [f"- à {x['de']} s : {x['duree']} s" for x in fiche["plans_les_plus_longs"]] + \
             ["", "## Bruitages repérés"] + ([f"- {x['t']} s : {x['type']}" for x in fiche["bruitages"]] or ["- aucun"]) + \
             ["", "## Voix", "- " + (", ".join(f"{x[0]}–{x[1]} s" for x in fiche["voix_s"]) or "aucune voix détectée"),
              "", "## Incrustations", *([f"- {x['de']}–{x['a']} s : {x['type']}" for x in fiche["autocollants_et_incrustations"]] or ["- aucune"]),
              "", f"> {fiche['avertissement']}", "", "Rapport détaillé : rea/report.html, rea/storyboard.jpg, rea/stems/ (voix et musique séparées)."]
    (d / "fiche.md").write_text("\n".join(lignes) + "\n")
    print(f"{fiche['plans']} plans, {fiche['plans_par_minute']}/min, tempo {bpm} BPM" + (f", {calees} % des coupes sur le temps" if calees is not None else "") + f" → {d / 'fiche.md'}")


def c_titres(a):
    d = Path(a.entree)
    out = a.sortie or (d / "renders" / f"{d.name}.mp4")
    run(["npx", "-y", "hyperframes", "render", "--quality", a.qualite, "--output", out], cwd=d)
    print(f"→ {out}")


FORMATS = {
    "tiktok": (["-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1", "-r", "30", "-crf", "20", "-maxrate", "12M", "-bufsize", "24M"], "-14"),
    "youtube": (["-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1", "-crf", "18"], "-14"),
    "web": (["-vf", "scale='min(1280,iw)':-2", "-crf", "26", "-preset", "slow"], "-16"),
    "master": (["-crf", "14", "-preset", "slow"], None),
}


def c_exporter(a):
    vf, lufs = FORMATS[a.format]
    out = a.sortie or sortie(a.entree, a.format, ".mp4")
    af = ["-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11"] if lufs and a_du_son(a.entree) else []
    run(["ffmpeg", "-y", "-v", "error", "-i", a.entree, *vf, *af, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    print(f"→ {out}")


def c_verifier(_):
    ok = True
    def test(nom, cmd):
        nonlocal ok
        try:
            subprocess.run([str(c) for c in cmd], check=True, capture_output=True, timeout=120)
            print(f"ok    {nom}")
        except Exception as ex:  # noqa: BLE001
            ok = False
            print(f"FAIL  {nom} : {ex.__class__.__name__}")
    test("PySceneDetect", [outil("scenedetect"), "version"])
    test("Auto-Editor", [outil("auto-editor"), "--version"])
    test("vid.stab (FFmpeg)", ["sh", "-c", "ffmpeg -hide_banner -filters | grep -q vidstabdetect"])
    test("color-matcher", [VENV / "python", "-I", "-c", "import color_matcher"])
    test("rembg", [outil("rembg"), "--help"])
    test("RIFE (ncnn)", ["test", "-x", RIFE])
    test("Real-ESRGAN (ncnn)", ["test", "-x", ESRGAN])
    test("Demucs (audio-separator)", [outil("audio-separator"), "--version"])
    test("librosa", [VENV / "python", "-I", "-c", "import librosa"])
    test("HyperFrames", ["npx", "-y", "hyperframes", "--version"])
    test("rea-video", [outil("rea-video"), "--help"])
    test("FFmpeg", ["ffmpeg", "-version"])
    test("Vulkan (processeur)", ["sh", "-c", "vulkaninfo --summary | grep -q deviceName"])
    sys.exit(0 if ok else 1)


def main():
    if (VENV / "python").exists() and Path(sys.prefix).resolve() != (ICI / ".venv").resolve():
        os.execv(str(VENV / "python"), [str(VENV / "python"), "-I", __file__, *sys.argv[1:]])
    p = argparse.ArgumentParser(prog="studiofx", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="cmd", required=True)
    def cmd(nom, fn, entree=True):
        s = sp.add_parser(nom)
        if entree:
            s.add_argument("entree")
        s.add_argument("--sortie")
        s.set_defaults(fn=fn)
        return s
    cmd("scenes", c_scenes).add_argument("--decouper", action="store_true")
    cmd("silences", c_silences).add_argument("--marge", type=float, default=0.1)
    s = cmd("stabiliser", c_stabiliser); s.add_argument("--lissage", type=int, default=30); s.add_argument("--tremblement", type=int, default=8); s.add_argument("--zoom", type=int, default=5)
    s = cmd("couleurs", c_couleurs); s.add_argument("--ref", required=True); s.add_argument("--methode", default="hm-mkl-hm")
    cmd("detourer", c_detourer).add_argument("--modele", default="u2net", help="u2net (défaut, le plus sûr), isnet-anime, isnet-general-use, u2net_human_seg, birefnet-general…")
    s = cmd("ralenti", c_ralenti); s.add_argument("--facteur", type=int, default=2); s.add_argument("--methode", choices=["auto", "rife", "ffmpeg"], default="auto"); s.add_argument("--modele", default="rife-v4.6", help="rife-v4.6 ou rife-anime")
    s = cmd("agrandir", c_agrandir); s.add_argument("--echelle", type=int, default=4); s.add_argument("--modele", default="realesr-animevideov3", help="realesr-animevideov3, realesrgan-x4plus, realesrgan-x4plus-anime")
    cmd("pistes", c_pistes).add_argument("--modele", default="htdemucs.yaml")
    cmd("tempo", c_tempo).add_argument("--min-bpm", type=float, default=80)
    cmd("mots", c_mots)
    cmd("analyser", c_analyser)
    s = cmd("titres", c_titres); s.add_argument("--qualite", default="standard")
    cmd("exporter", c_exporter).add_argument("--format", choices=list(FORMATS), default="tiktok")
    cmd("verifier", c_verifier, entree=False)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
