"""ep54 第 11–16 屏新增音效：马蹄 gallop、断弦拨 pluck、诏书展开 scroll、喊冤回响 shout、宫门合拢 doorslam。"""
import numpy as np, wave
SR=48000; rng=np.random.default_rng(543); O='public/audio/ep54-yangguang-canal/'
def save(n,x):
    x=np.asarray(x,np.float32); x=x/max(1e-9,np.abs(x).max())*0.89
    st=np.stack([x,x],1) if x.ndim==1 else x
    with wave.open(O+n+'.wav','wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
def bp(x,lo,hi):
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); X[(fr<lo)|(fr>hi)]=0; return np.fft.irfft(X,len(x))
t=lambda d: np.arange(int(d*SR))/SR
# gallop：三连马蹄，循环 2 秒
d=2.2; x=np.zeros(int(d*SR)); hit=lambda n: (np.sin(2*np.pi*80*np.arange(n)/SR)*np.exp(-np.arange(n)/600)+bp(rng.standard_normal(n),200,2000)*np.exp(-np.arange(n)/300)*0.6)
for c in range(6):
    for k,dt in enumerate([0,0.09,0.18]):
        i=int((c*0.36+dt)*SR)
        if i+4000<len(x): x[i:i+4000]+=hit(4000)*(0.8+0.2*rng.random())*(1-c/8)
save('gallop',x)
# pluck：断弦琴，拨一下走调、闷掉
d=1.2; tt=t(d); f=196*(1-0.03*tt); x=sum(a*np.sin(2*np.pi*f*h*tt)*np.exp(-(3+h*2)*tt) for h,a in [(1,1),(2,0.5),(3,0.3),(4,0.15)])
x+=0.6*bp(rng.standard_normal(len(tt)),1500,6000)*np.exp(-80*tt); x*=np.where(tt>0.35,np.exp(-(tt-0.35)*12),1); save('pluck',x)
# scroll：纸卷展开，沙沙 + 轴落
d=1.0; tt=t(d); x=bp(rng.standard_normal(len(tt)),1200,7000)*(np.sin(np.pi*np.clip(tt/0.75,0,1))**0.6)*(0.6+0.4*np.sin(2*np.pi*14*tt))
x+=np.where(tt>0.75,np.sin(2*np.pi*140*(tt-0.75))*np.exp(-(tt-0.75)*30),0)*1.5; save('scroll',x)
# shout：带共振峰的「啊——」+ 宫墙回声
d=3.2; tt=t(d); f0=230+40*np.sin(np.pi*np.clip(tt/1.1,0,1)); ph=2*np.pi*np.cumsum(f0)/SR
saw=sum(np.sin(k*ph)/k for k in range(1,30)); env=np.clip(tt/0.05,0,1)*np.where(tt<1.1,1,0)*(1+0.1*np.sin(2*np.pi*6*tt))
v=bp(saw*env,600,1000)*1.2+bp(saw*env,1100,1500)*0.7+bp(saw*env,2400,3000)*0.3+0.08*bp(rng.standard_normal(len(tt)),2000,6000)*env
x=v.copy()
for dl,g in [(0.32,0.45),(0.66,0.28),(1.0,0.16)]:
    n=int(dl*SR); x[n:]+=bp(v[:-n],300,2500)*g
save('shout',x)
# doorslam：沉重宫门合拢，低频闷响 + 木头 + 灰尘
d=1.6; tt=t(d); x=np.sin(2*np.pi*(55-15*tt)*tt)*np.exp(-5*tt)*1.4+bp(rng.standard_normal(len(tt)),80,600)*np.exp(-9*tt)+0.5*np.sin(2*np.pi*170*tt)*np.exp(-14*tt)
x+=0.25*bp(rng.standard_normal(len(tt)),2000,8000)*np.exp(-((tt-0.25)/0.25)**2); save('doorslam',x)
# ── 第 17–22 屏 ──
# creak：木门吱呀
d=0.9; tt=t(d); f=300+120*np.sin(2*np.pi*1.3*tt)+60*rng.standard_normal(len(tt)).cumsum()/SR*40
x=np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*0.4; x=bp(x*(np.sin(np.pi*tt/d)**1.5),400,3000)+0.3*bp(rng.standard_normal(len(tt)),800,2500)*np.sin(np.pi*tt/d); save('creak',x)
# puff：吹灭蜡烛
d=0.45; tt=t(d); x=bp(rng.standard_normal(len(tt)),200,2500)*np.exp(-((tt-0.1)/0.08)**2); save('puff',x)
# lowdrum：低沉一声鼓
d=1.8; tt=t(d); x=np.sin(2*np.pi*(48-10*tt)*tt)*np.exp(-2.6*tt)*1.3+bp(rng.standard_normal(len(tt)),40,300)*np.exp(-12*tt)*0.5; save('lowdrum',x)
# build：城池拔地而起，地底隆隆 + 一串木石落定
d=3.2; tt=t(d); x=bp(rng.standard_normal(len(tt)),30,220)*np.clip(tt/0.4,0,1)*np.exp(-0.7*tt)*1.2
for k in range(9):
    i=int((0.25+k*0.26)*SR); n=int(0.25*SR); u=np.arange(n)/SR
    x[i:i+n]+=(np.sin(2*np.pi*(110+k*12)*u)*np.exp(-20*u)+0.5*bp(rng.standard_normal(n),300,2500)*np.exp(-35*u))*(0.6+0.05*k)
save('build',x)
# growl：肚子「咕～」
d=1.0; tt=t(d); f=95+30*np.sin(2*np.pi*2.2*tt)+20*np.sin(2*np.pi*7*tt); x=np.sin(2*np.pi*np.cumsum(f)/SR)*(np.sin(np.pi*tt/d)**0.8)*(0.6+0.4*np.sin(2*np.pi*13*tt))
x+=0.3*bp(rng.standard_normal(len(tt)),80,400)*np.sin(np.pi*tt/d); save('growl',x)
