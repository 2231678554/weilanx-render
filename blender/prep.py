# 2.5D 预处理：去水印、深度图、水面/灯笼/柳树遮罩
import sys, os, numpy as np, cv2, torch
from PIL import Image
from transformers import pipeline
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
img = cv2.imread(src)  # BGR
H, W = img.shape[:2]
# 去水印（右下角“豆包AI生成”）
m = np.zeros((H, W), np.uint8)
m[int(H*0.945):int(H*0.99), int(W*0.885):int(W*0.995)] = 255
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
GW, GH = 681, 381
g = cv2.resize(cv2.GaussianBlur(d, (0,0), 2), (GW, GH), interpolation=cv2.INTER_AREA)[::-1].copy()
np.save(f"{out}/disp_grid.npy", g)
# 遮罩
f = img.astype(np.float32)/255; b, gch, rch = f[...,0], f[...,1], f[...,2]
yy, xx = np.mgrid[0:H, 0:W]; yn, xn = yy/H, xx/W
green = (gch > rch*0.95) & (gch > b*0.9)
water = (yn > 0.655) & ~green
water &= ~((xn > 0.75) & (xn < 0.985) & (yn > 0.66) & (yn < 0.805))   # 右侧小船
water &= ~((xn > 0.23) & (xn < 0.31) & (yn < 0.675))                  # 左侧帆船
water = cv2.GaussianBlur(water.astype(np.float32), (0,0), 6)
water *= np.clip((yn-0.655)/0.03, 0, 1)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
lant = ((hsv[...,2] > 150) & (hsv[...,1] > 110) & ((hsv[...,0] < 22) | (hsv[...,0] > 170))).astype(np.float32)
lant = cv2.GaussianBlur(cv2.dilate(lant, np.ones((5,5))), (0,0), 3)
lant[(xn > 0.3) & (xn < 0.42) & (yn > 0.4) & (yn < 0.5)] *= 0.0       # 太阳不闪
will = (green & (d > 0.35) & (yn < 0.75) & ((xn < 0.34) | (xn > 0.82))).astype(np.float32)
will = cv2.GaussianBlur(cv2.dilate(will, np.ones((9,9))), (0,0), 8)
for n, a in (("water", water), ("lantern", lant), ("willow", will)):
    cv2.imwrite(f"{out}/{n}.png", (np.clip(a,0,1)*255).astype(np.uint8))
print("prep ok", W, H, float(d.mean()))
