# 2.5D 预处理：去水印、深度图、水面/灯笼/柳树遮罩
import sys, os, numpy as np, cv2, torch
from PIL import Image
from transformers import pipeline
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
img = cv2.imread(src)  # BGR
H, W = img.shape[:2]
# 去水印（右下角 OiiOii）
m = np.zeros((H, W), np.uint8)
m[int(H*0.912):int(H*0.988), int(W*0.765):int(W*0.978)] = 255
img = cv2.inpaint(img, m, 9, cv2.INPAINT_TELEA)
cv2.imwrite(f"{out}/color.png", img)
# 深度
pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Large-hf", device="cpu")
pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
with torch.no_grad():
    r = pipe(pil)
d = r["predicted_depth"]
d = torch.nn.functional.interpolate(d[None] if d.dim()==3 else d[None,None], size=(H, W), mode="bicubic", align_corners=False)[0,0].numpy()
lo, hi = np.percentile(d, 1), np.percentile(d, 99.5)
d = np.clip((d-lo)/(hi-lo), 0, 1).astype(np.float32)
d = cv2.medianBlur((d*65535).astype(np.uint16), 5).astype(np.float32)/65535
cv2.imwrite(f"{out}/disp_preview.png", (d*255).astype(np.uint8))
# 网格分辨率的视差（顶点用），v=0 在底部
GW, GH = W//2+1, H//2+1
g = cv2.resize(cv2.GaussianBlur(d, (0,0), 2), (GW, GH), interpolation=cv2.INTER_AREA)[::-1].copy()
np.save(f"{out}/disp_grid.npy", g)
# 遮罩
f = img.astype(np.float32)/255; b, gch, rch = f[...,0], f[...,1], f[...,2]
yy, xx = np.mgrid[0:H, 0:W]; yn, xn = yy/H, xx/W
green = (gch > rch*0.8) & (gch > b*1.1)
def poly(pts):
    mm = np.zeros((H, W), np.uint8); cv2.fillPoly(mm, [np.array([(x*W, y*H) for x, y in pts], np.int32)], 1); return mm.astype(bool)
water = poly([(0.03,0.53),(1,0.53),(1,1),(0.58,1),(0.58,0.87),(0.5,0.86),(0.38,0.80),(0.3,0.75),(0.2,0.68),(0.12,0.62),(0.06,0.56)])
for ex in ([(0.15,0.3),(0.72,0.3),(0.72,0.585),(0.15,0.585)],            # 龙舟船身
           [(0.78,0.57),(1,0.59),(1,0.745),(0.82,0.735),(0.77,0.69)],     # 右侧船与船夫
           [(0.69,0.51),(0.96,0.51),(0.96,0.578),(0.69,0.578)],          # 中右小船
           [(0.0,0.5),(0.24,0.5),(0.24,0.595),(0.0,0.595)],              # 左侧小船
           [(0.56,0.85),(0.74,0.83),(0.95,0.97),(0.95,1),(0.56,1)]):     # 前景栏杆绳索
    water &= ~poly(ex)
water = cv2.GaussianBlur(water.astype(np.float32), (0,0), 4)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
lant = ((hsv[...,2] > 170) & (hsv[...,1] > 140) & ((hsv[...,0] < 10) | (hsv[...,0] > 172))).astype(np.float32)
lant[(yn < 0.46) & (xn > 0.62)] = 0; lant[yn < 0.12] = 0
lant = cv2.GaussianBlur(cv2.dilate(lant, np.ones((3,3))), (0,0), 2)
will = (green & (((yn < 0.52) & (xn < 0.62)) | ((yn > 0.78) & (xn < 0.42)))).astype(np.float32)
will = cv2.GaussianBlur(cv2.dilate(will, np.ones((7,7))), (0,0), 5)
for n, a in (("water", water), ("lantern", lant), ("willow", will)):
    cv2.imwrite(f"{out}/{n}.png", (np.clip(a,0,1)*255).astype(np.uint8))
print("prep ok", W, H, float(d.mean()))
