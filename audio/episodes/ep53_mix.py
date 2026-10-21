"""ep53 混音：bgm.wav + SFX 时间表（timeline.ts 导出的 JSON）→ mix.wav（48 kHz 立体声）。
防爆音：前视限幅（5 ms 预读，80 ms 释放），天花板 -1.5 dBFS。
用法：python3 audio/episodes/ep52_mix.py sfx.json out.wav"""
import json, subprocess, sys, wave
import numpy as np
from numpy.lib.stride_tricks import sliding_window_view

SR = 48000

def read(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2)

cfg = json.load(open(sys.argv[1]))
fps, dur = cfg['FPS'], cfg['DURATION']
N = int(round(dur / fps * SR))
mix = np.zeros((N, 2), np.float32)
bgm = read('public/audio/ep53-changan-curfew/bgm.wav')[:N]
mix[: len(bgm)] += bgm
cache = {}
for file, at, vol in cfg['SFX']:
    if file not in cache:
        cache[file] = read('public/' + file)
    s = cache[file]
    i = int(round(max(0, at) / fps * SR))
    seg = s[: max(0, min(len(s), N - i))]
    mix[i : i + len(seg)] += seg * vol
pre = float(np.abs(mix).max())

ceil = 10 ** (-1.5 / 20)
peak = np.abs(mix).max(axis=1)
need = np.minimum(1.0, ceil / np.maximum(peak, 1e-9))
win = int(0.005 * SR)
need = sliding_window_view(np.pad(need, (0, win - 1), constant_values=1), win).min(axis=1)
gain = np.ones(N, np.float32)
rel = 1 - np.exp(-1 / (0.08 * SR))
idx = np.flatnonzero(need < 1)
if len(idx):
    tail = int(0.6 * SR)
    spans, a, p = [], idx[0], idx[0]
    for k in idx[1:]:
        if k - p > tail:
            spans.append((a, p + tail)); a = k
        p = k
    spans.append((a, p + tail))
    for a, b in spans:
        cur = 1.0
        for k in range(a, min(b, N)):
            t = need[k]
            cur = t if t < cur else cur + (1 - cur) * rel
            gain[k] = cur
mix = np.clip(mix * gain[:, None], -1, 1)
with wave.open(sys.argv[2], 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f'限幅前峰值 {20*np.log10(pre):.2f} dBFS；被压的时长 {(gain < 0.999).sum()/SR:.2f} 秒；最终峰值 {20*np.log10(np.abs(mix).max()):.2f} dBFS')
