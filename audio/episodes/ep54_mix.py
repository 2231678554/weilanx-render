"""ep54 混音：音效时间表 + 环境声 + bgm-1021（从 MUSIC_BEAT 那一拍进）→ public/audio/ep54-yangguang-canal/mix.wav
用法：npx tsx audio/episodes/ep54-dump.ts > /tmp/ep54.json && python3 audio/episodes/ep54_mix.py /tmp/ep54.json"""
import json, subprocess, sys, wave
import numpy as np
SR = 48000
def read(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2)
cfg = json.load(open(sys.argv[1]))
fps, dur = cfg['FPS'], cfg['DURATION']
N = int(round(dur / fps * SR))
mix = np.zeros((N, 2), np.float32)
m0 = int(round(cfg['MUSIC_SEC'] * SR))
bgm = read('public/music/bgm-1021.mp3')
# 配乐只有 160 秒：在第 70 小节线（149.6 秒）接回第 20 小节线（42.8 秒），小节对齐 + 0.25 秒交叉淡化，按需循环
BARS = 2.1365
LE, LS = int((0.06 + BARS * 70) * SR), int((0.06 + BARS * 20) * SR)
xf = int(0.25 * SR)
ext = bgm[:LE].copy()
while len(ext) < N - m0 + SR:
    body = bgm[LS - xf : LE].copy()
    ramp = np.linspace(0, 1, xf)[:, None]
    ext[-xf:] = ext[-xf:] * (1 - ramp) + body[:xf] * ramp
    ext = np.concatenate([ext, body[xf:]])
if len(ext) > len(bgm): bgm = ext
seg = bgm[: max(0, N - m0)].copy()
fo = int(3.0 * SR)
if len(seg) > fo and m0 + len(bgm) > N:
    seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
gain = np.ones(len(seg), np.float32)
for a, b, g in cfg.get('DUCK', []):
    i, j = int(a / fps * SR) - m0, int(b / fps * SR) - m0
    r = int(0.08 * SR)
    env = np.ones(len(seg), np.float32)
    idx = np.arange(len(seg))
    env = np.where((idx >= i) & (idx < j), g, 1.0)
    up = (idx >= i - r) & (idx < i); env[up] = 1 - (1 - g) * (idx[up] - (i - r)) / r
    dn = (idx >= j) & (idx < j + r); env[dn] = g + (1 - g) * (idx[dn] - j) / r
    gain = np.minimum(gain, env.astype(np.float32))
mix[m0 : m0 + len(seg)] += seg * gain[:, None] * cfg.get('MUSIC_VOL', 0.8)
cache = {}
def get(fn):
    if fn not in cache: cache[fn] = read('public/' + fn)
    return cache[fn]
for fn, a, b, v in cfg['AMBIENCE']:
    s = get(fn); i, j = int(a / fps * SR), min(N, int(b / fps * SR))
    if j <= i: continue
    reps = np.tile(s, (int(np.ceil((j - i) / len(s))) + 1, 1))[: j - i].copy()
    r = min(int(0.4 * SR), (j - i) // 2)
    reps[:r] *= np.linspace(0, 1, r)[:, None]; reps[-r:] *= np.linspace(1, 0, r)[:, None]
    mix[i:j] += reps * v
for fn, at, v in cfg['SFX']:
    s = get(fn); i = int(round(max(0, at) / fps * SR))
    seg = s[: max(0, min(len(s), N - i))]
    mix[i : i + len(seg)] += seg * v
pk = float(np.abs(mix).max())
ceil = 10 ** (-1.5 / 20)
mix = np.where(np.abs(mix) > ceil * 0.8, np.sign(mix) * (ceil * 0.8 + (ceil * 0.2) * np.tanh((np.abs(mix) - ceil * 0.8) / (ceil * 0.2))), mix)
with wave.open('public/audio/ep54-yangguang-canal/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('mix', N / SR, 's, peak before', round(pk, 3))
