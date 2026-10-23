# 颜值混剪：自动卡点 + 变速(光流补帧) + 人物发光(RVM抠像) + 冲击/RGB分离/闪白 + 电影调色/遮幅/颗粒 + 标题
import cv2, numpy as np, librosa, torch, subprocess, math, json, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
SRC = "mix/src.mp4"; OUT = "mix/out"; os.makedirs(OUT, exist_ok=True)
W, H, FPS = 1920, 1080, 30
subprocess.run(["ffmpeg","-v","error","-y","-i",SRC,"-an","-c:v","libx264","-crf","10","-pix_fmt","yuv420p","mix/src264.mp4"],check=True)
cap = cv2.VideoCapture("mix/src264.mp4"); sf = cap.get(cv2.CAP_PROP_FPS) or 30
raw = []
while True:
    ok, f = cap.read()
    if not ok: break
    raw.append(f)
NS = len(raw); sh, sw = raw[0].shape[:2]; print("src", NS, sw, sh, sf)
# 裁掉四角台标：中心 950x534(16:9)
cw, ch = int(sw*0.95), int(sw*0.95*9/16); cx0, cy0 = (sw-cw)//2, (sh-ch)//2
# ---------- 音乐分析 ----------
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-ac", "1", "-ar", "22050", "mix/a.wav"], check=True)
y, sr = librosa.load("mix/a.wav", sr=22050)
DUR = len(y)/sr
oenv = librosa.onset.onset_strength(y=y, sr=sr)
tempo, bf = librosa.beat.beat_track(onset_envelope=oenv, sr=sr)
bt = librosa.frames_to_time(bf, sr=sr); bs = oenv[bf]
strong = bt[bs >= np.percentile(bs, 55)] if len(bs) else np.array([])
ons = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, units="time")
print("tempo", tempo, "beats", len(bt), "strong", len(strong))
# ---------- 镜头切点 ----------
def hist(f):
    hsv = cv2.cvtColor(cv2.resize(f, (160, 115)), cv2.COLOR_BGR2HSV)
    h = cv2.calcHist([hsv], [0, 1], None, [30, 16], [0, 180, 0, 256]); return cv2.normalize(h, h).flatten()
hs = [hist(f) for f in raw]
cuts = [0]
for i in range(1, NS):
    c = cv2.compareHist(hs[i-1], hs[i], cv2.HISTCMP_CORREL)
    if c < 0.55 and i - cuts[-1] > sf*0.4: cuts.append(i)
cuts.append(NS); print("cuts", cuts)
cut_t = [c/sf for c in cuts[1:-1]]
hits = np.unique(np.round(np.concatenate([strong, cut_t]), 2))
# ---------- 抠像 RVM ----------
model = torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3", trust_repo=True).eval()
alpha = [None]*NS
with torch.no_grad():
    for si in range(len(cuts)-1):
        rec = [None]*4
        for i in range(cuts[si], cuts[si+1]):
            t = torch.from_numpy(cv2.cvtColor(raw[i], cv2.COLOR_BGR2RGB)).permute(2, 0, 1)[None].float()/255
            fgr, pha, *rec = model(t, *rec, downsample_ratio=0.45)
            alpha[i] = pha[0, 0].numpy()
print("matting ok")
# ---------- 变速：每个镜头 快-慢-快 ----------
def src_time(T):
    """输出时间 -> 源帧浮点索引（镜头边界保持在原位，镜头内做 ramp）"""
    for si in range(len(cuts)-1):
        a, b = cuts[si]/sf, cuts[si+1]/sf
        if T < b or si == len(cuts)-2:
            d = b - a; u = np.clip((T-a)/d, 0, 1)
            A = 0.72 if d > 0.9 else (0.4 if d > 0.5 else 0)
            g = u - A*math.sin(2*math.pi*u)/(2*math.pi)   # g' = 1 - A cos → 两头慢？取反见下
            g = u + A*math.sin(2*math.pi*u)/(2*math.pi)   # g' = 1 + A cos：入点快、中段慢镜、出点快
            return min(cuts[si] + g*(cuts[si+1]-cuts[si]-1), cuts[si+1]-1), si
    return NS-1, len(cuts)-2
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
fcache = {}
def flow(i, j):
    k = (i, j)
    if k not in fcache:
        g0 = cv2.cvtColor(cv2.resize(raw[i], (sw//2, sh//2)), cv2.COLOR_BGR2GRAY); g1 = cv2.cvtColor(cv2.resize(raw[j], (sw//2, sh//2)), cv2.COLOR_BGR2GRAY)
        fcache[k] = cv2.resize(dis.calc(g0, g1, None), (sw, sh))*2
        if len(fcache) > 8: fcache.pop(next(iter(fcache)))
    return fcache[k]
gx, gy = np.meshgrid(np.arange(sw, dtype=np.float32), np.arange(sh, dtype=np.float32))
def sample(fi):
    i = int(math.floor(fi)); a = np.float32(fi - i); j = min(i+1, NS-1)
    if a < 0.03 or j == i: return raw[i].astype(np.float32), alpha[i]
    if a > 0.97: return raw[j].astype(np.float32), alpha[j]
    F01, F10 = flow(i, j).astype(np.float32), flow(j, i).astype(np.float32)
    m0x, m0y = gx - a*F01[..., 0], gy - a*F01[..., 1]; m1x, m1y = gx - (1-a)*F10[..., 0], gy - (1-a)*F10[..., 1]
    w0 = cv2.remap(raw[i], m0x, m0y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
    w1 = cv2.remap(raw[j], m1x, m1y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
    p0 = cv2.remap(alpha[i], m0x, m0y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT); p1 = cv2.remap(alpha[j], m1x, m1y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return (1-a)*w0 + a*w1, (1-a)*p0 + a*p1
# ---------- 调色 / 特效工具 ----------
def env(T, pts, tau):
    p = pts[pts <= T]; return float(np.exp(-(T - p.max())/tau)) if len(p) else 0.0
def grade(img):  # img float 0-1 BGR
    l = img.mean(2, keepdims=True)
    sh_ = np.clip(1 - l*2.2, 0, 1); hi = np.clip(l*1.8 - 0.8, 0, 1)
    img = img + sh_*np.array([0.05, 0.025, -0.02]) + hi*np.array([-0.03, 0.01, 0.045])  # 暗部青、亮部暖
    img = 0.5 + (img - 0.5)*1.2
    return np.clip(img, 0, 1)
FD = os.environ.get("FONTDIR", "/usr/share/fonts/opentype/noto"); FONT = f"{FD}/NotoSerifCJK-Bold.ttc"; FONTL = f"{FD}/NotoSerifCJK-ExtraLight.ttc"
def text_layer(lines, prog):
    """lines: [(文字, 字号, y, 字距, 字体)]，prog 0-1 逐字浮现"""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for (s, size, yy, sp, fp, delay) in lines:
        ft = ImageFont.truetype(fp, size); ws = [d.textlength(c, font=ft) for c in s]; tw = sum(ws) + sp*(len(s)-1); x = W*0.2 - tw/2
        for k, c in enumerate(s):
            q = np.clip((prog - delay)*3.2 - k*0.18, 0, 1); q = q*q*(3-2*q)
            if q > 0: d.text((x, yy + (1-q)*18), c, font=ft, fill=(255, 244, 228, int(255*q)))
            x += ws[k] + sp
    glow = im.filter(ImageFilter.GaussianBlur(14))
    a = np.array(im).astype(np.float32)/255; g = np.array(glow).astype(np.float32)/255
    return a, g
rng = np.random.default_rng(7)
grain = [rng.normal(0, 1, (H//2, W//2)).astype(np.float32) for _ in range(6)]
vy, vx = np.mgrid[0:H, 0:W]; vig = np.clip(1 - ((vx/W-0.5)**2*1.1 + (vy/H-0.5)**2*1.6)*1.25, 0, 1)[..., None].astype(np.float32)
NT = int(DUR*FPS); BAR = int((H - W/2.35)/2)
title = [("惊 鸿", 128, 640, 46, FONT, 0.0), ("一 眼 万 年", 40, 820, 22, FONTL, 0.35)]
endt = [("回 眸", 110, 470, 40, FONT, 0.0)]
prev_si = -1; pipe = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", SRC, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", f"{OUT}/混剪.mp4"], stdin=subprocess.PIPE)
SEL = [int(x) for x in os.environ["FRAMES"].split(",")] if os.environ.get("FRAMES") else None
for n in (SEL or range(NT)):
    T = n/FPS; fi, si = src_time(T)
    img, pha = sample(fi)
    img = img[cy0:cy0+ch, cx0:cx0+cw]; pha = pha[cy0:cy0+ch, cx0:cx0+cw]
    eh = env(T, hits, 0.22); es = env(T, strong, 0.12)
    cut_flash = env(T, np.array(cut_t), 0.09)
    # 冲击缩放（弹簧）+ 缓慢推进 + 微抖
    sp = env(T, hits, 0.35); spring = sp*math.cos((1-sp)*9)*0.055
    z = 1.04 + 0.03*((T - cuts[si]/sf)/max(0.3, (cuts[si+1]-cuts[si])/sf)) + spring
    jx, jy = (rng.normal(0, 1)*6*es, rng.normal(0, 1)*6*es)
    M = cv2.getRotationMatrix2D((cw/2, ch/2), 0, z*W/cw); M[0, 2] += W/2 - cw/2 + jx; M[1, 2] += H/2 - ch/2 + jy
    M[0, 2] -= (z*W/cw - W/cw)*0; img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    pha = cv2.warpAffine(pha, M, (W, H), flags=cv2.INTER_LINEAR)[..., None]
    img = img/255
    # 背景压暗去饱和，人物提亮 → 人物“发光”
    gray = img.mean(2, keepdims=True); bg = (img*0.55 + gray*0.45)*0.68
    subj = np.clip(img*1.06 + 0.02, 0, 1)
    img = bg*(1-pha) + subj*pha
    img = grade(img)
    # 人物辉光 + 轮廓光（随节拍脉冲）
    small = cv2.resize((img*pha), (W//4, H//4)); glow = cv2.resize(cv2.GaussianBlur(small, (0, 0), 10), (W, H))
    ps = cv2.resize(pha, (W//4, H//4)); edge = np.clip(cv2.GaussianBlur(ps, (0, 0), 3) - cv2.erode(ps, np.ones((5, 5)))*1.0, 0, 1)
    rim = cv2.resize(cv2.GaussianBlur(edge, (0, 0), 2.5), (W, H))[..., None]*np.array([0.55, 0.78, 1.0])
    k = 0.3 + 0.5*eh
    img = 1 - (1-img)*(1 - glow*k*0.9)            # screen
    img = np.clip(img + rim*(0.5 + 1.1*eh), 0, 1)
    # 高光泛光
    hl = np.clip(cv2.resize(img, (W//4, H//4)) - 0.8, 0, 1); img = np.clip(img + cv2.resize(cv2.GaussianBlur(hl, (0, 0), 14), (W, H))*0.5, 0, 1)
    # 漏光（暖色光斑缓慢游移）
    lx = W*(0.15 + 0.7*(0.5 + 0.5*math.sin(T*0.37))); ly = H*(0.3 + 0.2*math.sin(T*0.53))
    leak = np.exp(-(((vx - lx)/(W*0.35))**2 + ((vy - ly)/(H*0.5))**2))[..., None]*np.array([0.25, 0.55, 1.0])*(0.07 + 0.12*eh)
    img = 1 - (1-img)*(1-leak)
    # RGB 分离（重拍）
    if es > 0.05:
        s = int(10*es); b_, g_, r_ = cv2.split(img)
        img = cv2.merge([np.roll(b_, -s, 1), g_, np.roll(r_, s, 1)])
    # 切点闪白
    img = img + (1-img)*cut_flash*0.75
    img = img*vig + img*(1-vig)*0.35
    # 颗粒
    gr = cv2.resize(grain[n % 6], (W, H))[..., None]; img = np.clip(img + gr*0.025, 0, 1)
    # 遮幅（开场 0.8 秒合上）
    bar = int(BAR*min(1, T/0.8)**0.5)
    if bar: img[:bar] = 0; img[H-bar:] = 0
    # 标题 / 结尾字
    for (lines, t0, t1) in ((title, 0.25, 3.2), (endt, DUR-2.2, DUR)):
        if t0 <= T <= t1:
            pr = (T - t0)/1.6; fade = min(1, (t1 - T)/0.5) if lines is title else 1
            a, g = text_layer(lines, pr)
            img = 1 - (1-img)*(1 - g[..., :3][..., ::-1]*g[..., 3:]*0.8*fade)
            img = img*(1 - a[..., 3:]*fade) + a[..., :3][..., ::-1]*a[..., 3:]*fade
    # 首尾淡入淡出
    img = img*min(1, T/0.35, (DUR - T)/0.6)
    out = (np.clip(img, 0, 1)*255).astype(np.uint8)
    if SEL: cv2.imwrite(f"{OUT}/s_{n:04d}.jpg", out); continue
    pipe.stdin.write(out.tobytes())
    if n % 60 == 0:
        cv2.imwrite(f"{OUT}/p_{n:04d}.jpg", cv2.resize(out, (640, 360))); print("frame", n, NT, flush=True)
pipe.stdin.close(); pipe.wait(); print("done")
