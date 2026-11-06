#!/usr/bin/env python3
"""Synthesize the base sound effects with ffmpeg, so the repo ships no third-party audio.
usage: make_sfx.py <output_dir>
Sounds a brand provides in "sfx_dir" (same .mp3 name) take priority over these."""
import os
import subprocess
import sys

# aevalsrc expressions: a wave times an exponential decay.
TONES = {
    "pop": ("sin(2*PI*(420*t+5200*t*t))*exp(-26*t)", 0.16),
    "click-pop": ("sin(2*PI*(900*t+2600*t*t))*exp(-55*t)", 0.09),
    "ding": ("(0.6*sin(2*PI*1320*t)+0.3*sin(2*PI*2640*t)+0.12*sin(2*PI*3960*t))*exp(-5*t)", 0.9),
    "sparkle": ("(0.5*sin(2*PI*(1800+2600*t)*t)+0.4*sin(2*PI*(2700+3400*t)*t))*exp(-4.5*t)*(0.7+0.3*sin(2*PI*22*t))", 0.8),
    "subscribe": ("(0.6*sin(2*PI*880*t)*lt(t,0.14)+0.6*sin(2*PI*1320*(t-0.14))*gte(t,0.14))*exp(-6*mod(t,0.14)-1.5*t)", 0.7),
    "impact": ("(0.9*sin(2*PI*(90-40*t)*t)+0.3*sin(2*PI*180*t))*exp(-6*t)", 0.8),
}
# Filtered noise: the sweep is what reads as motion.
NOISE = {
    "whoosh": (0.55, "bandpass=f=900:width_type=o:w=2.2,afade=t=in:d=0.28:curve=exp,afade=t=out:st=0.28:d=0.27:curve=exp"),
    "swish": (0.28, "highpass=f=1500,lowpass=f=7000,afade=t=in:d=0.12,afade=t=out:st=0.12:d=0.16"),
}


def run(args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def main(out):
    os.makedirs(out, exist_ok=True)
    for name, (expr, dur) in TONES.items():
        run(["-f", "lavfi", "-i", f"aevalsrc='0.8*({expr})':s=44100:d={dur}", "-c:a", "libmp3lame", "-q:a", "3",
             os.path.join(out, f"{name}.mp3")])
    for name, (dur, chain) in NOISE.items():
        run(["-f", "lavfi", "-i", f"anoisesrc=d={dur}:c=pink:r=44100:a=0.7", "-af", chain, "-c:a", "libmp3lame", "-q:a", "3",
             os.path.join(out, f"{name}.mp3")])
    print(len(TONES) + len(NOISE), "effects in", out)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
