"""Where the speech model and the speech engine are, on every system, and which language a reel speaks.

The format checks the last line of a take, and times a voice that came without word timestamps, with whisper.cpp and
the small model for the reel's language: small.en for English, the multilingual small (same size) for every other
language, French by default. Both belong to the MotionLab folder, not to this engine: the folder's own transcriber
(`scripts/transcribe.mjs`) fetches them once into `models/` and `whisper.cpp/`. When either is missing, that script is
run once on a second of silence with the reel's language, which makes it fetch both, so nothing here downloads anything
itself.

The language: reels/<slug>/reel.json "language", else the saved profile
(workspace/library/full-visual/profile.json "language"), else the account reading (context/profile.json "language",
when it is a two-letter code), else "fr". Mirrors scripts/language.mjs.
"""
import json, os, re, shutil, subprocess, sys, tempfile, unicodedata, wave
from pathlib import Path

FOLDER = Path(__file__).resolve().parents[3]  # engine/full-visual/scripts -> the MotionLab folder
DEFAULT_LANGUAGE = "fr"


def utf8_console():
    """Accents print on a Windows console or pipe too (cp1252 by default there)."""
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass


def read_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def _code(v):
    return v.strip().lower() if isinstance(v, str) and re.fullmatch(r"[A-Za-z]{2}", v.strip()) else None


def language(reel=None):
    """ISO 639-1 code of the reel's spoken language."""
    if reel is not None:
        got = _code((read_json(Path(reel) / "reel.json") or {}).get("language"))
        if got:
            return got
    profile = read_json(FOLDER / "workspace" / "library" / "full-visual" / "profile.json") or {}
    account = read_json(FOLDER / "context" / "profile.json") or {}   # the account reading, when it holds a code
    return (_code(profile.get("language")) or _code((profile.get("resolved") or {}).get("language"))
            or _code(account.get("language")) or DEFAULT_LANGUAGE)


def whisper_model(lang):
    return FOLDER / "models" / ("ggml-small.en.bin" if lang == "en" else "ggml-small.bin")


def fold(s):
    """A word as the recogniser and the script can both agree on it: lower case, accents and apostrophes off,
    letters and digits only. "L’écran" and "l'ecran" are the same word; "à" stays a word."""
    s = unicodedata.normalize("NFKD", s.lower())
    return "".join(ch for ch in s if not unicodedata.combining(ch) and (ch.isalnum() or ch.isspace()))


def spoken(tok):
    """A token that is said: it holds a letter or a digit. "?", "»", "€" or "—" standing alone is not a word."""
    return any(ch.isalnum() for ch in tok)


ELISION = re.compile(r"(?<![^\W\d_])(?:[cdjlmnst]|qu|jusqu|lorsqu|puisqu|quoiqu)['’](?=[^\W\d_])", re.IGNORECASE)


def word_count(tokens, lang):
    """Words said, for the pace. In French an elision is two words written as one ("l’écran" is "the screen")."""
    n = sum(1 for t in tokens if spoken(t))
    return n + (sum(len(ELISION.findall(t)) for t in tokens) if lang == "fr" else 0)


def _found_cli():
    if shutil.which("whisper-cli"):
        return "whisper-cli"
    want = "whisper-cli.exe" if os.name == "nt" else "whisper-cli"
    kept = FOLDER / "whisper.cpp"
    return next((str(p) for p in kept.rglob(want) if p.is_file()), None) if kept.exists() else None


def _fetch(lang):
    wav = Path(tempfile.mkdtemp()) / "silence.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000); w.writeframes(b"\0\0" * 16000)
    print(f"modèle et moteur de parole ({lang}) : récupérés une fois par le transcripteur du dossier")
    subprocess.run(["node", str(FOLDER / "scripts" / "transcribe.mjs"), str(wav), "--out", str(wav.with_suffix(".json")),
                    "--local", "--no-apple", "--lang", lang], check=False, cwd=str(FOLDER))


def whisper(lang):
    """The whisper.cpp program and the model for `lang`, fetched once if this machine has none."""
    model = whisper_model(lang)
    if not (_found_cli() and model.exists()):
        _fetch(lang)
    cli = _found_cli()
    if not cli or not model.exists():
        sys.exit(f"whisper.cpp ou son modèle {model.name} manque. Lance : node scripts/transcribe.mjs <un court audio> --out tmp.json --local --lang {lang}")
    return cli, model


def whisper_cli(lang=DEFAULT_LANGUAGE):
    """Kept for older callers: the program only."""
    return whisper(lang)[0]
