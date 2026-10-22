import numpy as np, math, re, cv2
from PIL import Image, ImageDraw
X0,Y0,NX,NY,Z=96,44,16,12,7
W,H=NX*256,NY*256
dem=np.load('/data/geo/dem.npy')
land=dem>0
e=np.clip(dem,0,None)
# height grid 1024x768 uint16 (0..6000m)
hs=e.reshape(768,4,1024,4).mean((1,3))
hs=cv2.GaussianBlur(hs.astype(np.float32),(0,0),2.0)
hb=np.clip(hs/6000*65535,0,65535).astype('<u2')
hb.tofile('/data/weilanx-claude-videos/public/images/lamplight/height-china.bin')
gy,gx=np.gradient(e); k=0.035
nx,ny=-gx*k,-gy*k; n=np.sqrt(nx*nx+ny*ny+1)
az,al=math.radians(315),math.radians(40)
Lv=np.array([math.cos(al)*math.sin(az),-math.cos(al)*math.cos(az),math.sin(al)])
sh=np.clip((nx*Lv[0]+ny*Lv[1]+Lv[2])/n,0,1)
el=np.clip(e/4500,0,1)
low=np.array([0.42,0.32,0.18]); mid=np.array([0.55,0.42,0.24]); high=np.array([0.80,0.72,0.58])
c=np.where(el[...,None]<0.4, low+(mid-low)*(el[...,None]/0.4), mid+(high-mid)*((el[...,None]-0.4)/0.6))
img=c*(0.72+0.45*sh[...,None])
sea=np.array([0.05,0.08,0.11])
img=np.where(land[...,None],img,sea)
im=Image.fromarray((np.clip(img,0,1)*255).astype(np.uint8))
d=ImageDraw.Draw(im)
src=open('/data/weilanx-claude-videos/src/episodes/ep54-yangguang-canal/geo.ts').read()
def paths(key):
  m=re.search(r'"%s": "([^"]+)"'%key,src); out=[];cur=[]
  for tok in re.findall(r'([ML])([\d.\-]+) ([\d.\-]+)',m.group(1)):
    if tok[0]=='M' and cur: out.append(cur);cur=[]
    cur.append((float(tok[1]),float(tok[2])))
  if cur: out.append(cur)
  return out
def proj(lon,lat):
  x=(lon+180)/360*(2**Z)*256-X0*256
  y=(1-math.log(math.tan(math.radians(lat))+1/math.cos(math.radians(lat)))/math.pi)/2*(2**Z)*256-Y0*256
  return x,y
for seg in paths('coast'): d.line(seg,fill=(150,120,75),width=3)
riv=(95,160,225)
for r in ['huang','huai','yangtze','qiantang']:
  for seg in paths(r): d.line(seg,fill=riv,width=7,joint='curve')
HUAI=[proj(*p) for p in [(113.3,32.4),(114.7,32.35),(115.6,32.45),(116.5,32.5),(117.4,32.95),(118.3,33.15),(118.9,33.45),(119.4,33.7),(119.9,34.05),(120.4,34.25)]]
QT=[proj(*p) for p in [(119.95,30.1),(120.2,30.25),(120.6,30.35),(121.0,30.45)]]
d.line(HUAI,fill=riv,width=7,joint='curve'); d.line(QT,fill=riv,width=7,joint='curve')
im.save('/data/weilanx-claude-videos/public/images/lamplight/terrain3d-china.jpg',quality=92)
print(hb.max(), hb.shape)
