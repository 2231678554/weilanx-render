"""ep54 第 23–28 屏新增音效：脚步 steps、疑问 query、旗帜猎猎 flag、轻快鼓点 trot。"""
import numpy as np, wave
SR=48000; rng=np.random.default_rng(544); O='public/audio/ep54-yangguang-canal/'
def save(n,x):
    x=np.asarray(x,np.float32); x=x/max(1e-9,np.abs(x).max())*0.89
    st=np.stack([x,x],1)
    with wave.open(O+n+'.wav','wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
def bp(x,lo,hi):
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); X[(fr<lo)|(fr>hi)]=0; return np.fft.irfft(X,len(x))
t=lambda d: np.arange(int(d*SR))/SR
# steps：一群人踩土路，3 秒
d=3.0; x=np.zeros(int(d*SR))
for k in range(26):
    i=int(rng.random()*(d-0.2)*SR); n=5000; nn=np.arange(n)
    x[i:i+n]+=(bp(rng.standard_normal(n),120,1600)*np.exp(-nn/700)+0.5*np.sin(2*np.pi*90*nn/SR)*np.exp(-nn/500))*(0.5+0.5*rng.random())
save('steps',x)
# query：疑问「嗯？」上扬滑音
d=0.9; tt=t(d); f=300+260*np.clip((tt-0.2)/0.5,0,1)**1.5; ph=2*np.pi*np.cumsum(f)/SR
x=(np.sin(ph)+0.35*np.sin(2*ph)+0.15*np.sin(3*ph))*np.clip(tt/0.03,0,1)*np.exp(-np.clip(tt-0.6,0,None)*10); save('query',x)
# flag：旗帜猎猎
d=2.4; tt=t(d); x=bp(rng.standard_normal(len(tt)),300,3000)*(0.4+0.6*np.abs(np.sin(2*np.pi*3.2*tt+np.sin(2*np.pi*0.7*tt))))*np.sin(np.pi*tt/d)**0.5; save('flag',x)
# trot：小碎步鼓点（木鱼 + 小鼓）
d=2.2; x=np.zeros(int(d*SR))
for k in range(16):
    i=int(k*0.133*SR); n=3000; nn=np.arange(n)
    x[i:i+n]+=np.sin(2*np.pi*(700 if k%2 else 520)*nn/SR)*np.exp(-nn/350)*(1 if k%4==0 else 0.6)
save('trot',x)
