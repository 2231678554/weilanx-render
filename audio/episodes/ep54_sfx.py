"""ep54 新增音效（合成）：毛刷、运河水声、呼啸、黑锅「哐」、闪光叮、风声。输出 public/audio/ep54-yangguang-canal/*.wav（48 kHz 立体声）"""
import numpy as np, wave
SR=48000; rng=np.random.default_rng(54); O='public/audio/ep54-yangguang-canal/'
def save(n,x):
    x=np.asarray(x,np.float32); x=x/max(1e-9,np.abs(x).max())*0.89
    st=np.stack([x,x],1) if x.ndim==1 else x
    with wave.open(O+n+'.wav','wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
def bp(x,lo,hi):
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); X[(fr<lo)|(fr>hi)]=0; return np.fft.irfft(X,len(x))
t=lambda d: np.arange(int(d*SR))/SR
d=0.5; n=rng.standard_normal(int(d*SR)); x=bp(n,2500,9000)*np.sin(np.pi*t(d)/d)**2; save('brush',x)
d=6; n=bp(rng.standard_normal(int(d*SR)),120,1400); env=0.6+0.4*np.sin(2*np.pi*t(d)/3)**2
pl=np.zeros(int(d*SR))
for k in range(18):
    i=rng.integers(0,len(pl)-4000); pl[i:i+3000]+=bp(rng.standard_normal(3000),800,3000)*np.exp(-np.arange(3000)/500)*0.5
x=n*env+pl; save('water',x)
d=0.7; n=rng.standard_normal(int(d*SR)); tt=t(d)
x=np.zeros_like(n)
for k in range(10):
    a=k/10*d; b=a+d/10; m=(tt>=a)&(tt<b); c=3000-2400*k/10
    x[m]=bp(n,c*0.7,c*1.3)[m]
x*=np.sin(np.pi*tt/d)**1.5; save('whoosh',x)
d=1.6; tt=t(d); x=np.zeros_like(tt)
for f,a,dec in [(180,1,2.5),(431,0.7,3.5),(689,0.5,4),(1043,0.35,5),(1520,0.25,6),(2210,0.15,8)]:
    x+=a*np.sin(2*np.pi*f*tt+rng.random())*np.exp(-dec*tt)
x+=1.2*np.sin(2*np.pi*60*tt)*np.exp(-9*tt)+0.5*rng.standard_normal(len(tt))*np.exp(-40*tt)
save('clang',x)
d=1.2; tt=t(d); x=sum(a*np.sin(2*np.pi*f*tt)*np.exp(-k*tt) for f,a,k in [(2093,1,3),(3136,0.6,4),(4186,0.4,5),(5274,0.25,6)])
save('glint',x)
d=3; n=bp(rng.standard_normal(int(d*SR)),200,900); env=np.sin(np.pi*t(d)/d)*(0.7+0.3*np.sin(2*np.pi*t(d)*0.7))
save('wind',n*env)
print('ok')
