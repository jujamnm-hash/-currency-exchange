#!/usr/bin/env python3
"""Original melancholic Kurdish-flavored rap instrumental (not a cover)."""

from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 86
BEAT = 60.0 / BPM
BAR = BEAT * 4
RNG = np.random.default_rng(42)


def env(n: int, a: float = 0.01, d: float = 0.08, s: float = 0.7, r: float = 0.2) -> np.ndarray:
    a_n = max(1, int(a * SR))
    d_n = max(1, int(d * SR))
    r_n = max(1, int(r * SR))
    s_n = max(0, n - a_n - d_n - r_n)
    parts = [
        np.linspace(0, 1, a_n, endpoint=False),
        np.linspace(1, s, d_n, endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, r_n, endpoint=False),
    ]
    e = np.concatenate(parts)
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    return e[:n]


def sine(freq: float, dur: float, vol: float = 1.0, phase: float = 0.0) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * freq * t + phase) * vol).astype(np.float64)


def saw(freq: float, dur: float, vol: float = 1.0) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    return ((2 * ((t * freq) % 1) - 1) * vol).astype(np.float64)


def square(freq: float, dur: float, vol: float = 1.0) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    return (np.sign(np.sin(2 * np.pi * freq * t)) * vol).astype(np.float64)


def noise(dur: float, vol: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    return (RNG.uniform(-1, 1, n) * vol).astype(np.float64)


def lowpass(x: np.ndarray, cutoff: float = 800.0) -> np.ndarray:
    if len(x) < 8:
        return x
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1.0 / SR)
    # soft butterworth-ish rolloff
    X = X / (1.0 + (freqs / max(cutoff, 1.0)) ** 4)
    return np.fft.irfft(X, n=len(x)).astype(np.float64)


def highpass(x: np.ndarray, cutoff: float = 2000.0) -> np.ndarray:
    if len(x) < 8:
        return x
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1.0 / SR)
    factor = (freqs / max(cutoff, 1.0)) ** 4
    X = X * (factor / (1.0 + factor))
    return np.fft.irfft(X, n=len(x)).astype(np.float64)


def mix_at(track: np.ndarray, sound: np.ndarray, start_sec: float) -> None:
    i = int(start_sec * SR)
    j = i + len(sound)
    if i >= len(track):
        return
    if j > len(track):
        sound = sound[: len(track) - i]
        j = len(track)
    track[i:j] += sound


# Kurdish-ish melancholic scale (A Hijaz-ish flavor over A minor rooted vibe)
# A Bb C# D E F G  (Hijaz on A) — emotional / Eastern
ROOT = 110.0  # A2
SCALE = [
    ROOT * (2 ** (0 / 12)),   # A
    ROOT * (2 ** (1 / 12)),   # Bb
    ROOT * (2 ** (4 / 12)),   # C#
    ROOT * (2 ** (5 / 12)),   # D
    ROOT * (2 ** (7 / 12)),   # E
    ROOT * (2 ** (8 / 12)),   # F
    ROOT * (2 ** (10 / 12)),  # G
]


def kick(dur: float = 0.45) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    freq = 150 * np.exp(-18 * t) + 45
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    click = highpass(noise(dur, 0.35), 3000) * np.exp(-80 * t)
    out = (body * np.exp(-6 * t) + click[:n] * 0.4) * 1.2
    return out.astype(np.float64)


def snare(dur: float = 0.25) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    tone = sine(180, dur, 0.5) * np.exp(-20 * t)
    nse = highpass(noise(dur, 0.9), 1500) * np.exp(-14 * t)
    return (tone[:n] + nse[:n] * 0.85).astype(np.float64)


def hihat(dur: float = 0.06, open_: bool = False) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    decay = 25 if open_ else 55
    return (highpass(noise(dur, 0.55), 6000) * np.exp(-decay * t)).astype(np.float64)


def clap(dur: float = 0.2) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = highpass(noise(dur, 0.7), 1200) * np.exp(-18 * t)
    # layered tiny delays for clap feel
    out = np.zeros(n)
    for delay_ms, amp in [(0, 1.0), (12, 0.7), (24, 0.45)]:
        d = int(delay_ms * SR / 1000)
        chunk = base[: max(0, n - d)] * amp
        out[d : d + len(chunk)] += chunk
    return out.astype(np.float64)


def bass_note(freq: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    # 808-ish: sine + light saturation
    glide = freq * (1 + 0.35 * np.exp(-25 * t))
    phase = 2 * np.pi * np.cumsum(glide) / SR
    wave_ = np.sin(phase) + 0.25 * np.sin(2 * phase)
    wave_ = np.tanh(wave_ * 1.8)
    return (wave_ * env(n, 0.005, 0.05, 0.85, max(0.05, dur * 0.35)) * 0.9).astype(np.float64)


def pad_chord(freqs: list[float], dur: float, vol: float = 0.18) -> np.ndarray:
    n = int(dur * SR)
    out = np.zeros(n)
    for f in freqs:
        voice = sine(f, dur, 0.35) + 0.2 * sine(f * 2, dur, 0.25) + 0.08 * saw(f, dur, 0.15)
        voice = lowpass(voice, 1800)
        out += voice[:n]
    out *= env(n, 0.4, 0.5, 0.65, 0.8) * vol
    return out.astype(np.float64)


def lead_note(freq: float, dur: float, vol: float = 0.22) -> np.ndarray:
    n = int(dur * SR)
    # soft reed / duduk-ish feel via harmonics + vibrato
    t = np.arange(n) / SR
    vib = 1 + 0.012 * np.sin(2 * np.pi * 5.2 * t)
    f = freq * vib
    phase = 2 * np.pi * np.cumsum(f) / SR
    tone = (
        0.65 * np.sin(phase)
        + 0.22 * np.sin(2 * phase)
        + 0.08 * np.sin(3 * phase)
        + 0.04 * np.sin(4 * phase)
    )
    tone = np.tanh(tone * 1.3)
    # gentle ornament sweep at start
    ornament = sine(freq * 1.06, min(0.05, dur), 0.15) * np.exp(-np.linspace(0, 40, max(1, int(0.05 * SR))))
    out = tone * env(n, 0.02, 0.08, 0.75, max(0.08, dur * 0.25)) * vol
    mix_at(out, ornament[: min(len(ornament), n)], 0)
    return out.astype(np.float64)


def place_melody(track: np.ndarray, pattern: list[tuple[float, float, float]], start: float) -> None:
    """pattern: list of (scale_degree_index, duration_beats, volume)"""
    t = start
    for deg, beats, vol in pattern:
        freq = SCALE[deg % 7] * (2 ** (deg // 7))
        mix_at(track, lead_note(freq * 2, beats * BEAT, vol), t)  # one octave up
        t += beats * BEAT


def drums_bar(track: np.ndarray, start: float, intensity: float = 1.0, trap: bool = False) -> None:
    # kick pattern
    kicks = [0.0, 2.0] if not trap else [0.0, 1.5, 2.75]
    for b in kicks:
        mix_at(track, kick() * intensity, start + b * BEAT)
    # snare / clap on 2 and 4
    mix_at(track, snare() * 0.9 * intensity, start + 1 * BEAT)
    mix_at(track, clap() * 0.55 * intensity, start + 1 * BEAT)
    mix_at(track, snare() * 0.95 * intensity, start + 3 * BEAT)
    mix_at(track, clap() * 0.6 * intensity, start + 3 * BEAT)
    # hats
    for i in range(8):
        open_ = trap and i in (3, 7)
        mix_at(track, hihat(0.09 if open_ else 0.055, open_) * (0.35 + 0.15 * (i % 2)) * intensity, start + i * (BEAT / 2))
    if trap:
        # rolling 16th hats in second half
        for i in range(8, 16):
            mix_at(track, hihat(0.04) * 0.28 * intensity, start + i * (BEAT / 4))


CHORD_PROG = [
    # Am-ish, Bbmaj, E7-ish, F — mapped to Hijaz palette
    [SCALE[0] * 2, SCALE[2] * 2, SCALE[4] * 2],       # A C# E
    [SCALE[1] * 2, SCALE[3] * 2, SCALE[5] * 2],       # Bb D F
    [SCALE[4], SCALE[6] * 2, SCALE[1] * 4],           # E G Bb
    [SCALE[5], SCALE[0] * 2, SCALE[3] * 2],           # F A D
]

BASS_DEGREES = [0, 1, 4, 5]  # root movement


VERSE_MELODY = [
    (4, 1.0, 0.20),
    (5, 0.5, 0.18),
    (4, 0.5, 0.18),
    (2, 1.0, 0.22),
    (0, 1.0, 0.16),
    (1, 0.5, 0.20),
    (2, 0.5, 0.18),
    (4, 1.5, 0.24),
    (5, 0.5, 0.15),
]

HOOK_MELODY = [
    (6, 0.5, 0.26),
    (5, 0.5, 0.24),
    (4, 1.0, 0.28),
    (2, 1.0, 0.22),
    (1, 0.5, 0.24),
    (0, 0.5, 0.20),
    (1, 1.0, 0.26),
    (2, 1.0, 0.22),
]


def build() -> np.ndarray:
    # Structure: intro 4 | verse 8 | hook 4 | verse 8 | hook 4 | outro 4 = 32 bars
    bars = 32
    total = bars * BAR + 1.5
    track = np.zeros(int(total * SR))

    # intro pads + soft melody
    for b in range(4):
        mix_at(track, pad_chord(CHORD_PROG[b % 4], BAR * 1.05, 0.14), b * BAR)
        mix_at(track, bass_note(SCALE[BASS_DEGREES[b % 4]], BAR * 0.95) * 0.45, b * BAR)
    place_melody(track, VERSE_MELODY, 1 * BAR)

    # verse 1
    for b in range(4, 12):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.12), b * BAR)
        mix_at(track, bass_note(SCALE[BASS_DEGREES[ci]], BAR * 0.92) * 0.85, b * BAR)
        drums_bar(track, b * BAR, 0.95, trap=False)
        if b % 2 == 0:
            place_melody(track, VERSE_MELODY, b * BAR)

    # hook 1 (trapper)
    for b in range(12, 16):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.16), b * BAR)
        # doubles bass punch on hook
        mix_at(track, bass_note(SCALE[BASS_DEGREES[ci]], BEAT * 1.8) * 1.0, b * BAR)
        mix_at(track, bass_note(SCALE[BASS_DEGREES[ci]] * 0.5, BEAT * 1.5) * 0.7, b * BAR + 2 * BEAT)
        drums_bar(track, b * BAR, 1.1, trap=True)
        place_melody(track, HOOK_MELODY, b * BAR)

    # verse 2
    for b in range(16, 24):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.11), b * BAR)
        mix_at(track, bass_note(SCALE[BASS_DEGREES[ci]], BAR * 0.92) * 0.85, b * BAR)
        drums_bar(track, b * BAR, 1.0, trap=(b >= 20))
        if b % 2 == 0:
            place_melody(track, VERSE_MELODY, b * BAR)

    # hook 2
    for b in range(24, 28):
        ci = b % 4
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.17), b * BAR)
        mix_at(track, bass_note(SCALE[BASS_DEGREES[ci]], BEAT * 1.8) * 1.05, b * BAR)
        mix_at(track, bass_note(SCALE[BASS_DEGREES[ci]], BEAT * 1.2) * 0.8, b * BAR + 2.5 * BEAT)
        drums_bar(track, b * BAR, 1.15, trap=True)
        place_melody(track, HOOK_MELODY, b * BAR)

    # outro — strip drums, leave pad + fading lead
    for b in range(28, 32):
        ci = b % 4
        fade = 1.0 - (b - 28) / 4.0
        mix_at(track, pad_chord(CHORD_PROG[ci], BAR * 1.05, 0.14 * fade), b * BAR)
        mix_at(track, bass_note(SCALE[BASS_DEGREES[ci]], BAR * 0.9) * 0.5 * fade, b * BAR)
        if b == 28:
            place_melody(track, HOOK_MELODY, b * BAR)
        if b == 30:
            mix_at(track, kick() * 0.5, b * BAR)

    # soft room noise bed
    bed = lowpass(noise(total, 0.02), 600)
    track += bed[: len(track)]

    # soft clip / normalize
    peak = np.max(np.abs(track)) or 1.0
    track = np.tanh(track / peak * 1.15) * 0.92
    return track.astype(np.float64)


def write_wav(path: Path, mono: np.ndarray) -> None:
    # stereo with slight width
    left = mono
    right = np.concatenate([np.zeros(int(0.012 * SR)), mono])[: len(mono)]
    stereo = np.column_stack([left, right])
    pcm = np.clip(stereo * 32767, -32768, 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main() -> None:
    out_dir = Path(__file__).resolve().parent
    wav_path = out_dir / "farhad-inspired-rap-instrumental.wav"
    mp3_path = out_dir / "farhad-inspired-rap-instrumental.mp3"
    print("Generating beat...")
    audio = build()
    write_wav(wav_path, audio)
    print(f"Wrote {wav_path} ({len(audio)/SR:.1f}s)")
    # encode mp3 via ffmpeg
    import subprocess

    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(wav_path),
            "-codec:a", "libmp3lame", "-qscale:a", "2",
            str(mp3_path),
        ],
        check=True,
        capture_output=True,
    )
    print(f"Wrote {mp3_path}")
    # copy to artifacts
    art = Path("/opt/cursor/artifacts/music")
    art.mkdir(parents=True, exist_ok=True)
    for p in (wav_path, mp3_path):
        dest = art / p.name
        dest.write_bytes(p.read_bytes())
        print(f"Copied to {dest}")


if __name__ == "__main__":
    main()
