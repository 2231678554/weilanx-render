"""ep53 配乐：bgm-1021 只有 160 秒，全片 135 小节。拼法：第 0–J 小节 + 第 (J-60)–结尾小节，
接缝在小节线（30 ms 交叉淡化），音乐自然结尾正好落在片尾。然后 loudnorm 到 -16 LUFS。"""
import subprocess, sys, numpy as np
SR = 48000
BAR = 0.53175 * 4
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/music/bgm-1021.mp3', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2)
J = int(sys.argv[1]) if len(sys.argv) > 1 else 64
bt = lambda k: int(round((0.06 + BAR * k) * SR))
a, b = bt(J), bt(J - 60)
X = int(0.03 * SR)
fo = np.linspace(1, 0, X)[:, None]
head = x[:a].copy()
head[-X:] = head[-X:] * fo + x[b - X:b] * (1 - fo)
y = np.concatenate([head, x[b:]])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', 'public/audio/ep53-changan-curfew/bgm.wav'], input=y.astype(np.float32).tobytes(), check=True)
print('bgm', len(y) / SR, 's')
