"""Helpers shared by the scripts that work with more than one video."""
import json
import os
import re
import subprocess


def probe(path):
    """Duration, display size, frame rate, audio and recording time of a video."""
    raw = subprocess.check_output(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", path])
    info = json.loads(raw)
    video = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    if not video:
        raise SystemExit(f"{path} has no video stream")
    w, h = video["width"], video["height"]
    # Phones store portrait video as landscape plus a rotation; ffmpeg applies it when decoding.
    turn = int(video.get("tags", {}).get("rotate", 0))
    for side in video.get("side_data_list", []):
        turn = int(side.get("rotation", turn))
    if abs(turn) % 180 == 90:
        w, h = h, w
    top, bottom = (video.get("avg_frame_rate") or "0/1").split("/")
    tags = info["format"].get("tags", {})
    return {
        "duration": round(float(info["format"]["duration"]), 3), "width": w, "height": h,
        "fps": round(float(top) / float(bottom), 2) if float(bottom) else 0,
        "audio": any(s["codec_type"] == "audio" for s in info["streams"]),
        "created": tags.get("com.apple.quicktime.creationdate") or tags.get("creation_time"),
    }


def loudness(path):
    """Mean volume in dB, or None when the file has no measurable sound."""
    done = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "volumedetect", "-f", "null", "-"],
                          capture_output=True, text=True)
    found = re.search(r"mean_volume: (-?[\d.]+) dB", done.stderr)
    return float(found.group(1)) if found else None


def parts(item):
    """A range is [start, end] or [start, end, source id]."""
    return item[0], item[1], item[2] if len(item) > 2 else ""


def source_paths(cut):
    """Map each source id to its file. A one-video cut.json uses the id ""."""
    if cut.get("sources"):
        return cut["sources"]
    return {"": cut["src"]}


def load_words(path):
    """Word timings as (start, end, text). Reads the eyes format and whisper.cpp JSON."""
    data = json.load(open(path))
    if "words" in data:
        return [(w["start"], w["end"], w["text"]) for w in data["words"] if w["text"].strip()]
    return [(w["offsets"]["from"] / 1000, w["offsets"]["to"] / 1000, w["text"])
            for w in data["transcription"] if w["text"].strip()]


def words_by_source(path, cut):
    """Word timings per source. `path` is one file, or a folder of <id>.json with several sources."""
    if not cut.get("sources"):
        return {"": load_words(path)}
    if not os.path.isdir(path):
        raise SystemExit("cut.json has several sources: pass --words a folder with one <id>.json per source")
    found = {}
    for sid in cut["sources"]:
        file = os.path.join(path, sid + ".json")
        found[sid] = load_words(file) if os.path.exists(file) else []
    return found
