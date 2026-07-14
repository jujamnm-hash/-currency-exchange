#!/usr/bin/env python3
"""
Original fusion beat:
  - Bounce / energy of mid-2000s club rap (inspired by era of Candy Shop —
    NOT that flute riff or song)
  - Melancholic Kurdish melodic color (inspired by Zakaria Abdulla emotional
    ballad feel — NOT Nemzani melody or lyrics)

All melodies, drum patterns, and arrangement are original.
"""

from __future__ import annotations

import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 96  # Candy Shop-ish bounce territory without copying the track
BEAT = 60.0 / BPM
BAR = BEAT * 4
RNG = np.random.default_rng(77)


def env(n: int, a=0.01, d=0.08, s=0.7, r=0.2) -> np.ndarray:
    a_n, d_n, r_n = max(1, int(a * SR)), max(1, int(d * SR)), max(1, int(r * SR))
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate(
        [
            np.linspace(0, 1, a_n, endpoint=False),
            np.linspace(1, s, d_n, endpoint=False),
            np.full(s_n, s),
            np.linspace(s, 0, r_n, endpoint=False),
        ]
    )
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def mix_at(track: np.ndarray, sound: np.ndarray, start_sec: float) -> None:
    i = int(start_sec * SR)
    if i >= len(track) or len(sound) == 0:
        return
    j = min(i + len(sound), len(track))
    track[i:j] += sound[: j - i]


def lowpass(x: np.ndarray, cutoff: float = 800.0) -> np.ndarray:
    if len(x) < 8:
        return x
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1.0 / SR)
    X = X / (1.0 + (freqs / max(cutoff, 1.0)) ** 4)
    return np.fft.irfft(X, n=len(x)).astype(np.float64)


def highpass(x: np.ndarray, cutoff: float = 2000.0) -> np.ndarray:
    if len(x) < 8:
        return x
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1.0 / SR)
    f = (freqs / max(cutoff, 1.0)) ** 4
    X = X * (f / (1.0 + f))
    return np.fft.irfft(X, n=len(x)).astype(np.float64)


def sine(freq, dur, vol=1.0, phase=0.0):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * freq * t + phase) * vol).astype(np.float64)


def noise(dur, vol=1.0):
    return (RNG.uniform(-1, 1, int(dur * SR)) * vol).astype(np.float64)


# Kurdish-flavored scale: D Bayati-ish / emotional minor with soft 2nd
# D Eb F G A Bb C
ROOT = 146.83  # D3
SCALE = [
    ROOT * (2 ** (0 / 12)),   # D
    ROOT * (2 ** (1 / 12)),   # Eb
    ROOT * (2 ** (3 / 12)),   # F
    ROOT * (2 ** (5 / 12)),   # G
    ROOT * (2 ** (7 / 12)),   # A
    ROOT * (2 ** (8 / 12)),   # Bb
    ROOT * (2 ** (10 / 12)),  # C
]


def kick(dur=0.42):
    n = int(dur * SR)
    t = np.arange(n) / SR
    freq = 160 * np.exp(-16 * t) + 48
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-5.5 * t)
    click = highpass(noise(dur, 0.4), 3500)[:n] * np.exp(-70 * t)
    return (body + click * 0.35) * 1.15


def snare(dur=0.22):
    n = int(dur * SR)
    t = np.arange(n) / SR
    tone = sine(190, dur, 0.45)[:n] * np.exp(-22 * t)
    nse = highpass(noise(dur, 0.85), 1800)[:n] * np.exp(-13 * t)
    return tone + nse * 0.9


def clap(dur=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = highpass(noise(dur, 0.75), 1400)[:n] * np.exp(-16 * t)
    out = np.zeros(n)
    for d_ms, amp in [(0, 1.0), (11, 0.65), (22, 0.4)]:
        d = int(d_ms * SR / 1000)
        chunk = base[: max(0, n - d)] * amp
        out[d : d + len(chunk)] += chunk
    return out


def hihat(dur=0.05, open_=False):
    n = int(dur * SR)
    t = np.arange(n) / SR
    decay = 22 if open_ else 60
    return highpass(noise(dur, 0.5), 7000)[:n] * np.exp(-decay * t)


def bass_808(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    glide = freq * (1 + 0.4 * np.exp(-22 * t))
    phase = 2 * np.pi * np.cumsum(glide) / SR
    wave = np.sin(phase) + 0.2 * np.sin(2 * phase)
    return np.tanh(wave * 1.9) * env(n, 0.004, 0.04, 0.88, max(0.06, dur * 0.3)) * 0.95


def pad_chord(freqs, dur, vol=0.15):
    n = int(dur * SR)
    out = np.zeros(n)
    for f in freqs:
        v = sine(f, dur, 0.3) + 0.15 * sine(f * 2, dur, 0.2)
        out += lowpass(v, 1600)[:n]
    return out * env(n, 0.35, 0.4, 0.7, 0.7) * vol


def flute_lead(freq, dur, vol=0.2):
    """Soft breathy lead — original hook motif, not Candy Shop's riff."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.008 * np.sin(2 * np.pi * 5.5 * t)
    phase = 2 * np.pi * np.cumsum(freq * vib) / SR
    tone = 0.7 * np.sin(phase) + 0.18 * np.sin(2 * phase) + 0.06 * np.sin(3 * phase)
    breath = highpass(noise(dur, 0.08), 2500)[:n] * np.exp(-8 * t)
    out = (np.tanh(tone * 1.2) + breath) * env(n, 0.025, 0.06, 0.8, max(0.06, dur * 0.2)) * vol
    return out


def dudukish(freq, dur, vol=0.18):
    """Warm Kurdish reed-like color for verses."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.014 * np.sin(2 * np.pi * 4.8 * t)
    phase = 2 * np.pi * np.cumsum(freq * vib) / SR
    tone = 0.55 * np.sin(phase) + 0.28 * np.sin(2 * phase) + 0.12 * np.sin(3 * phase)
    return np.tanh(tone * 1.35) * env(n, 0.03, 0.1, 0.75, max(0.08, dur * 0.25)) * vol


def drums_bounce(track, start, intensity=1.0, half_time=False):
    """Syncopated mid-2000s bounce pattern (original)."""
    if half_time:
        kicks = [0.0, 2.5]
    else:
        # bouncy: kick on 1, "and" of 2, 3
        kicks = [0.0, 1.5, 2.0]
    for b in kicks:
        mix_at(track, kick() * intensity, start + b * BEAT)
    # snare/clap on 2 & 4
    for b in (1.0, 3.0):
        mix_at(track, snare() * 0.85 * intensity, start + b * BEAT)
        mix_at(track, clap() * 0.55 * intensity, start + b * BEAT)
    # swinging 8th / 16th hats
    for i in range(8):
        open_ = i in (3, 7)
        vol = 0.32 + 0.12 * (i % 2)
        mix_at(track, hihat(0.08 if open_ else 0.045, open_) * vol * intensity, start + i * (BEAT / 2))
    # ghost 16ths for bounce
    for i in (1, 3, 5, 9, 11, 13):
        mix_at(track, hihat(0.03) * 0.18 * intensity, start + i * (BEAT / 4))


CHORD_PROG = [
    [SCALE[0] * 2, SCALE[2] * 2, SCALE[4] * 2],  # Dm-ish
    [SCALE[5] * 2, SCALE[0] * 2, SCALE[2] * 2],  # Bb
    [SCALE[3] * 2, SCALE[5] * 2, SCALE[0] * 4 / 2],  # G minor-ish
    [SCALE[4] * 2, SCALE[6] * 2, SCALE[1] * 4],  # A7-ish tension
]

BASS = [0, 5, 3, 4]

# Original hook phrase (short-long bounce) — NOT Candy Shop intervals
HOOK_FLUTE = [
    (4, 0.5, 0.22),
    (5, 0.5, 0.20),
    (4, 0.5, 0.22),
    (2, 0.5, 0.18),
    (0, 1.0, 0.24),
    (1, 0.5, 0.20),
    (2, 0.5, 0.18),
    (4, 1.0, 0.26),
]

VERSE_REED = [
    (2, 1.0, 0.16),
    (4, 0.5, 0.14),
    (5, 0.5, 0.15),
    (4, 1.0, 0.17),
    (2, 0.5, 0.14),
    (1, 0.5, 0.13),
    (0, 1.5, 0.18),
    (1, 0.5, 0.12),
]


def place_phrase(track, pattern, start, instrument="flute"):
    t = start
    for deg, beats, vol in pattern:
        freq = SCALE[deg % 7] * (2 ** (deg // 7)) * 2  # octave up
        fn = flute_lead if instrument == "flute" else dudukish
        mix_at(track, fn(freq, beats * BEAT, vol), t)
        t += beats * BEAT


def build() -> np.ndarray:
    # intro4 | verse8 | hook4 | verse8 | hook4 | bridge4 | hook4 | outro4 = 40 bars
    bars = 40
    total = bars * BAR + 1.2
    track = np.zeros(int(total * SR))

    # INTRO — pad + soft reed, light hats only later
    for b in range(4):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.14), b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BAR * 0.9) * 0.5, b * BAR)
        if b >= 2:
            drums_bounce(track, b * BAR, 0.55, half_time=True)
        if b == 1 or b == 3:
            place_phrase(track, VERSE_REED, b * BAR, "reed")

    # VERSE 1 — bounce in, reed melody
    for b in range(4, 12):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.11), b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BAR * 0.92) * 0.88, b * BAR)
        drums_bounce(track, b * BAR, 0.95)
        if b % 2 == 0:
            place_phrase(track, VERSE_REED, b * BAR, "reed")

    # HOOK 1 — flute lead + bigger drums
    for b in range(12, 16):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.15), b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BEAT * 1.6) * 1.0, b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]] * 0.5, BEAT * 1.2) * 0.7, b * BAR + 2 * BEAT)
        drums_bounce(track, b * BAR, 1.12)
        place_phrase(track, HOOK_FLUTE, b * BAR, "flute")

    # VERSE 2
    for b in range(16, 24):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.10), b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BAR * 0.92) * 0.9, b * BAR)
        drums_bounce(track, b * BAR, 1.0)
        if b % 2 == 0:
            place_phrase(track, VERSE_REED, b * BAR, "reed")

    # HOOK 2
    for b in range(24, 28):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.16), b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BEAT * 1.6) * 1.05, b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BEAT * 1.0) * 0.75, b * BAR + 2.5 * BEAT)
        drums_bounce(track, b * BAR, 1.15)
        place_phrase(track, HOOK_FLUTE, b * BAR, "flute")

    # BRIDGE — strip drums, Kurdish reed swell
    for b in range(28, 32):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.17), b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BAR * 0.95) * 0.55, b * BAR)
        if b == 30:
            drums_bounce(track, b * BAR, 0.6, half_time=True)
        place_phrase(track, VERSE_REED, b * BAR, "reed")
        if b >= 30:
            place_phrase(track, HOOK_FLUTE[:4], b * BAR + 2 * BEAT, "flute")

    # FINAL HOOK
    for b in range(32, 36):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.17), b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BEAT * 1.5) * 1.08, b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]] * 0.5, BEAT * 1.3) * 0.8, b * BAR + 2 * BEAT)
        drums_bounce(track, b * BAR, 1.18)
        place_phrase(track, HOOK_FLUTE, b * BAR, "flute")

    # OUTRO
    for b in range(36, 40):
        fade = 1.0 - (b - 36) / 4.5
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.14 * fade), b * BAR)
        mix_at(track, bass_808(SCALE[BASS[ci]], BAR * 0.9) * 0.45 * fade, b * BAR)
        if b == 36:
            place_phrase(track, HOOK_FLUTE, b * BAR, "flute")
            drums_bounce(track, b * BAR, 0.7 * fade)
        if b == 38:
            mix_at(track, kick() * 0.4, b * BAR)

    bed = lowpass(noise(total, 0.015), 500)
    track += bed[: len(track)]
    peak = np.max(np.abs(track)) or 1.0
    return np.tanh(track / peak * 1.12) * 0.93


def write_wav(path: Path, mono: np.ndarray) -> None:
    left = mono
    right = np.concatenate([np.zeros(int(0.011 * SR)), mono])[: len(mono)]
    pcm = np.clip(np.column_stack([left, right]) * 32767, -32768, 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main() -> None:
    out = Path(__file__).resolve().parent
    wav = out / "candy-zakaria-fusion-rap.wav"
    mp3 = out / "candy-zakaria-fusion-rap.mp3"
    print("Generating fusion beat...")
    audio = build()
    write_wav(wav, audio)
    print(f"Wrote {wav} ({len(audio)/SR:.1f}s)")
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-qscale:a", "2", str(mp3)],
        check=True,
        capture_output=True,
    )
    art = Path("/opt/cursor/artifacts/music")
    art.mkdir(parents=True, exist_ok=True)
    for p in (wav, mp3):
        (art / p.name).write_bytes(p.read_bytes())
        print(f"Artifact: {art / p.name}")


if __name__ == "__main__":
    main()
