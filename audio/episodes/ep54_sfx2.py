"""ep54 第一幕新增音效：盖印 stamp、闷响 thud、咽口水 gulp、拍手 clap、刀落案「当」dang、拍案 slap。"""
import numpy as np, wave
SR=48000; rng=np.random.default_rng(541); O='public/audio/ep54-yangguang-canal/'
def save(n,x):
    x=np.asarray(x,np.float32); x=x/max(1e-9,np.abs(x).max())*0.89
    st=np.stack([x,x],1) if x.ndim==1 else x
    with wave.open(O+n+'.wav','wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
def bp(x,lo,hi):
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); X[(fr<lo)|(fr>hi)]=0; return np.fft.irfft(X,len(x))
t=lambda d: np.arange(int(d*SR))/SR
# stamp：木印压纸，低频闷击 + 纸面噪声
d=0.5; tt=t(d); x=np.sin(2*np.pi*(90-40*tt)*tt)*np.exp(-14*tt)*1.2+bp(rng.standard_normal(len(tt)),400,3000)*np.exp(-30*tt)*0.6; save('stamp',x)
# thud：手按膝、布料闷响
d=0.35; tt=t(d); x=np.sin(2*np.pi*70*tt)*np.exp(-18*tt)+bp(rng.standard_normal(len(tt)),150,900)*np.exp(-25*tt)*0.7; save('thud',x)
# gulp：咽口水，下滑音 + 水泡
d=0.4; tt=t(d); f=420-260*tt/d; x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-((tt-0.12)/0.08)**2)+0.4*np.sin(2*np.pi*900*tt)*np.exp(-((tt-0.25)/0.03)**2); save('gulp',x)
# clap：一串拍手（几个人）
d=1.4; x=np.zeros(int(d*SR))
for p in range(4):
    off=rng.integers(0,3000)
    for k in range(6):
        i=off+int(k*0.2*SR)+rng.integers(-800,800)
        if 0<=i<len(x)-3000: x[i:i+3000]+=bp(rng.standard_normal(3000),800,5000)*np.exp(-np.arange(3000)/300)*(0.6+0.4*rng.random())
save('clap',x)
# dang：铁刀落木案，「当」短促金属 + 木头
d=0.9; tt=t(d); x=sum(a*np.sin(2*np.pi*f*tt+rng.random())*np.exp(-k*tt) for f,a,k in [(820,1,7),(1960,0.6,9),(3150,0.4,12),(4400,0.25,15)])
x+=0.9*np.sin(2*np.pi*150*tt)*np.exp(-30*tt)+0.4*rng.standard_normal(len(tt))*np.exp(-60*tt); save('dang',x)
# slap：手掌拍案，木头大响
d=0.6; tt=t(d); x=bp(rng.standard_normal(len(tt)),300,6000)*np.exp(-45*tt)*1.4+np.sin(2*np.pi*110*tt)*np.exp(-16*tt)+0.5*np.sin(2*np.pi*230*tt)*np.exp(-22*tt); save('slap',x)
