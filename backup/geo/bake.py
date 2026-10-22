import numpy as np, json, math
from PIL import Image
X0,Y0,NX,NY,Z=96,44,16,12,7
W,H=NX*256,NY*256
dem=np.zeros((H,W),np.float32)
for i in range(NX):
  for j in range(NY):
    a=np.asarray(Image.open(f'/data/geo/t7_{X0+i}_{Y0+j}.png').convert('RGB')).astype(np.float32)
    dem[j*256:(j+1)*256,i*256:(i+1)*256]=a[...,0]*256+a[...,1]+a[...,2]/256-32768
np.save('/data/geo/dem.npy',dem)
land=dem>0
e=np.clip(dem,0,None)
gy,gx=np.gradient(e)
k=0.035
nx,ny=-gx*k,-gy*k; nz=np.ones_like(nx); n=np.sqrt(nx*nx+ny*ny+1)
az,al=math.radians(315),math.radians(40)
L=np.array([math.cos(al)*math.sin(az),-math.cos(al)*math.cos(az),math.sin(al)])
sh=np.clip((nx*L[0]+ny*L[1]+nz*L[2])/n,0,1)
el=np.clip(e/4500,0,1)
base=np.stack([0.20+0.16*el,0.14+0.10*el,0.08+0.05*el],-1)
img=base*(0.35+1.25*sh[...,None])
sea=np.array([0.035,0.05,0.065])
img=np.where(land[...,None],img,sea)
Image.fromarray((np.clip(img,0,1)*255).astype(np.uint8)).save('/data/weilanx-claude-videos/public/images/lamplight/relief-china.jpg',quality=88)
def proj(lon,lat):
  x=(lon+180)/360*(2**Z)*256-X0*256
  y=(1-math.log(math.tan(math.radians(lat))+1/math.cos(math.radians(lat)))/math.pi)/2*(2**Z)*256-Y0*256
  return round(x,1),round(y,1)
d=json.load(open('/data/geo/ne_10m_rivers_lake_centerlines.geojson'))
want={'huang':['Huang'],'huai':['Huai'],'yangtze':['Chang Jiang','Yangtze'],'qiantang':['Fuchun'],'wei':['Wei']}
out={}
for key,names in want.items():
  segs=[]
  for ft in d['features']:
    g=ft['geometry']
    if not g or ft['properties'].get('name') not in names: continue
    ls=[g['coordinates']] if g['type']=='LineString' else g['coordinates']
    for l in ls:
      if key=='wei' and not any(105<p[0]<111 and 33.5<p[1]<35.5 for p in l): continue
      if key=='yangtze' and max(p[0] for p in l)<103: continue
      segs.append(' '.join(('M' if i==0 else 'L')+'%s %s'%proj(*p[:2]) for i,p in enumerate(l[::2] if len(l)>40 else l)))
  out[key]=' '.join(segs)
c=json.load(open('/data/geo/ne_50m_coastline.geojson'))
segs=[]
for ft in c['features']:
  g=ft['geometry']
  for l in ([g['coordinates']] if g['type']=='LineString' else g['coordinates']):
   if any(100<p[0]<135 and 18<p[1]<50 for p in l):
    segs.append(' '.join(('M' if i==0 else 'L')+'%s %s'%proj(*p[:2]) for i,p in enumerate(l)))
out['coast']=' '.join(segs)
ts='/** 真实地理（Natural Earth 10m 河流 + 50m 海岸线），坐标是 relief-china.jpg 的像素（Web 墨卡托 z7，经度 90–135°，纬度约 22–49°）。由 /data/geo/bake.py 生成。 */\n'
ts+=f'export const MAP_W = {W};\nexport const MAP_H = {H};\n'
ts+='export const proj = (lon: number, lat: number): [number, number] => [((lon + 180) / 360) * 32768 - %d, ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 32768 - %d];\n'%(X0*256,Y0*256)
ts+='export const GEO = '+json.dumps(out,ensure_ascii=False)+' as const;\n'
open('/data/weilanx-claude-videos/src/episodes/ep54-yangguang-canal/geo.ts','w').write(ts)
print({k:len(v) for k,v in out.items()})
