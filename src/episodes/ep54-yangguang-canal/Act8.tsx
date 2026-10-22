import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {Flash} from '../../library/lamplight/stage';
import {LF} from '../../library/lamplight/theme';
import {headOf} from '../ep53-changan-curfew/Kit';
import {P, Rig, RigProps, kneelPose, standPose, stoolPose, walkPose} from '../ep53-changan-curfew/Rig';
import {Mount} from '../ep53-changan-curfew/Sets';
import {Rider} from './Act7';
import {Drape, Label3, Map3D, project, type Cam3, type Px} from './Map3D';
import {lerp, Svg} from './Opening';
import {LOOK54} from './Props';
import {Vignette} from './Sets54';
import {B, fbt, S46, S47, S48, S49, S50, S51, S52, S53, S54, S55, SHOT} from './timeline';

const bt = (b: number) => b * B;
const seg = (t: number, a: number, b: number) => clamp01((t - bt(a)) / bt(b - a));
type LL = [number, number];
type Pose = Partial<RigProps> & {hip: P; neck: P};
const R = (look: Partial<RigProps>, pose: Pose, s: number, more: Partial<RigProps> = {}, children?: React.ReactNode) => (
  <Rig {...(look as RigProps)} {...(pose as RigProps)} s={s} {...more}>
    {children}
  </Rig>
);
const lean = (hip: P, a: number, s: number, len = 200): P => [hip[0] + Math.sin((a * Math.PI) / 180) * len * s, hip[1] - Math.cos((a * Math.PI) / 180) * len * s];
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ── 地名（经纬度） ── */
const CHANGAN: LL = [108.94, 34.27];
const LANZHOU: LL = [103.8, 36.06];
const WUWEI: LL = [102.64, 37.93];
const ZHANGYE: LL = [100.45, 38.93];
const DUNHUANG: LL = [94.66, 40.14];
const QHLAKE: LL = [100.2, 36.9];
const XIPING: LL = [101.78, 36.62];
const FUSI: LL = [99.9, 36.95]; // 伏俟城（吐谷浑王城，后置西海郡）
const SILK: LL[] = [CHANGAN, [107.1, 34.4], [105.7, 34.6], LANZHOU, WUWEI, ZHANGYE, [98.5, 39.75], [97.0, 40.3], DUNHUANG, [92.5, 40.6], [90.3, 40.9]];
/** 吐谷浑故地（示意）：青海湖以西到塔里木盆地南缘，地图西缘截断 */
const TUYU: LL[] = [[90, 39.6], [93, 39.3], [96, 38.7], [98.6, 38.3], [100.8, 37.7], [102.4, 36.6], [102.6, 35.2], [101.6, 33.9], [99.6, 33.2], [96.5, 33.4], [93, 34.3], [90, 35.0]];

const LL_TAG = (cam: Cam3, at: LL, text: string, o: number, color = '#ffe6a8', size = 46, dy = -70) => {
  if (o <= 0) return null;
  const [x, y] = project(cam, at[0], at[1], 6);
  return <div key={text} style={{position: 'absolute', left: x - 200, top: y + dy, width: 400, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: size, color, WebkitTextStroke: '2px #1a0c04', textShadow: '0 4px 14px rgba(0,0,0,0.85)', opacity: Math.min(1, o * 1.6), transform: `scale(${lerp(1.4, 1, easeOutBack(clamp01(o)))})`}}>{text}</div>;
};
const Card: React.FC<{x: number; y: number; text: string; p: number; size?: number; red?: boolean; rot?: number}> = ({x, y, text, p, size = 60, red, rot = -3}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', left: x - 500, top: y, width: 1000, textAlign: 'center', opacity: Math.min(1, p * 2), transform: `scale(${lerp(1.6, 1, easeOutBack(clamp01(p)))}) rotate(${rot}deg)`}}>
      <div style={{display: 'inline-block', padding: '10px 34px', background: red ? 'rgba(110,24,14,0.92)' : 'rgba(60,24,8,0.88)', border: '5px solid #ffd070', borderRadius: 14, fontFamily: LF.serif, fontWeight: 900, fontSize: size, color: '#ffe6a8', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
const polyline = (g: CanvasRenderingContext2D, px: Px, pts: LL[], p: number) => {
  const xy = pts.map((q) => px(...q));
  const len: number[] = [0];
  for (let i = 1; i < xy.length; i++) len.push(len[i - 1] + Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]));
  const L = len[len.length - 1] * p;
  g.beginPath();
  g.moveTo(...xy[0]);
  let end = xy[0];
  for (let i = 1; i < xy.length; i++) {
    if (len[i] <= L) { g.lineTo(...xy[i]); end = xy[i]; continue; }
    const k = (L - len[i - 1]) / (len[i] - len[i - 1]);
    end = [lerp(xy[i - 1][0], xy[i][0], k), lerp(xy[i - 1][1], xy[i][1], k)];
    g.lineTo(...end);
    break;
  }
  return end;
};
const silkLine = (g: CanvasRenderingContext2D, px: Px, p: number, flow: number, alpha = 1) => {
  if (p <= 0) return;
  g.save();
  g.globalAlpha = alpha;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = 'rgba(30,14,2,0.75)';
  g.lineWidth = 22;
  polyline(g, px, SILK, p); g.stroke();
  g.setLineDash([30, 18]);
  g.lineDashOffset = -flow;
  g.strokeStyle = '#ffe08a';
  g.lineWidth = 12;
  const end = polyline(g, px, SILK, p); g.stroke();
  g.setLineDash([]);
  g.fillStyle = '#fff0c0';
  g.beginPath(); g.arc(end[0], end[1], 10, 0, Math.PI * 2); g.fill();
  g.restore();
};
const polyFill = (g: CanvasRenderingContext2D, px: Px, pts: LL[]) => {
  g.beginPath();
  pts.forEach((q, i) => (i ? g.lineTo(...px(...q)) : g.moveTo(...px(...q))));
  g.closePath();
};
/** along：沿经纬度折线取点 */
const alongLL = (pts: LL[], p: number): LL => {
  const len: number[] = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = len[len.length - 1] * clamp01(p);
  for (let i = 1; i < pts.length; i++) if (len[i] >= L) {
    const k = (L - len[i - 1]) / (len[i] - len[i - 1] || 1);
    return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
  }
  return pts[pts.length - 1];
};
/** 毡帐（地图上的小图标） */
const Yurt: React.FC<{x: number; y: number; s: number; glow?: number; red?: boolean}> = ({x, y, s, glow = 0, red}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={-20} rx={90} ry={60} fill={red ? '#ff6a40' : '#ffd070'} opacity={0.35 * glow} />}
    <path d="M-46 0 L-46 -34 Q0 -78 46 -34 L46 0 Z" fill="#e8dcc0" stroke="#3a2a1a" strokeWidth={4} />
    <path d="M-46 -34 Q0 -78 46 -34" fill="none" stroke={red ? '#b8301c' : '#8a5a2a'} strokeWidth={8} />
    <rect x={-10} y={-26} width={20} height={26} fill="#3a2414" />
  </g>
);
const FlagIcon: React.FC<{x: number; y: number; s: number; text: string; color: string; rot?: number}> = ({x, y, s, text, color, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={-200} stroke="#2a1a0c" strokeWidth={8} />
    <path d="M4 -196 L120 -180 L104 -150 L120 -120 L4 -110 Z" fill={color} stroke="#1a0c04" strokeWidth={4} />
    <text x={58} y={-140} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={44} fill="#fff0d0">{text}</text>
  </g>
);

/* ═════════ 第 46 屏：地图往西拉，丝绸之路从长安伸向西域 ═════════ */
const Sc46: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(8)));
  const cam: Cam3 = {lon: lerp(107.5, 101.8, k), lat: lerp(35.4, 37.4, k), dist: lerp(1500, 1800, k), pitch: 60, yaw: 0};
  const p = easeInOut(seg(t, S46.line0, S46.line1));
  const flow = t * 2.2;
  const paint = (g: CanvasRenderingContext2D, px: Px) => silkLine(g, px, p, flow);
  const card = easeOut(seg(t, S46.card, S46.card + 0.7));
  const west = easeOut(seg(t, S46.line1 - 0.3, S46.line1 + 0.6));
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={`${Math.floor(flow)}_${p.toFixed(3)}`} opacity={0.95} />
      </Map3D>
      <Label3 cam={cam} at={CHANGAN} name="长安" lift={16} size={44} />
      <Label3 cam={cam} at={LANZHOU} name="兰州" lift={16} size={34} o={p > 0.3 ? 0.85 : 0} color="#e8dcc0" />
      <Label3 cam={cam} at={ZHANGYE} name="张掖" lift={16} size={34} o={p > 0.6 ? 0.85 : 0} color="#e8dcc0" />
      <Label3 cam={cam} at={DUNHUANG} name="敦煌" lift={16} size={38} o={p > 0.85 ? 1 : 0} />
      {LL_TAG(cam, [93.6, 40.6], '← 西域', west, '#ffe6a8', 56)}
      <Card x={1240} y={760} text="丝绸之路" p={card} size={62} />
      <Vignette k={0.35} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 47 屏：西突厥两面旗互撞（内斗）；青海湖吐谷浑营地亮起，挡在丝路南边 ═════════ */
const Sc47: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(9)));
  const cam: Cam3 = {lon: lerp(100.2, 100.8, k), lat: lerp(38.6, 38.2, k), dist: lerp(1850, 1750, k), pitch: 58, yaw: 0};
  const clash = t - bt(S47.clash);
  const swing = clash < 0 ? easeInOut(clamp01(t / bt(S47.clash))) : 1;
  const recoil = clash > 0 ? Math.sin(Math.min(clash, 18) / 3) * Math.max(0, 1 - clash / 18) * 14 : 0;
  const camp = easeOut(seg(t, S47.camp, S47.camp + 0.8));
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    silkLine(g, px, 1, t * 2.2, 0.75);
    if (camp > 0) {
      polyFill(g, px, TUYU);
      g.fillStyle = `rgba(200,60,40,${0.32 * camp})`;
      g.fill();
      g.strokeStyle = `rgba(255,120,90,${0.8 * camp})`;
      g.lineWidth = 6;
      g.setLineDash([16, 10]);
      g.stroke();
      g.setLineDash([]);
    }
  };
  const [ax, ay] = [560, 470];
  const [bx, by] = [900, 470];
  const mid = (ax + bx) / 2;
  const lx = lerp(ax - 160, mid - 70, swing) - recoil, rx = lerp(bx + 160, mid + 70, swing) + recoil;
  const spark = clash > 0 && clash < 12 ? 1 - clash / 12 : 0;
  const yurts: LL[] = [[99.0, 37.2], [99.9, 36.95], [100.9, 36.5], [98.4, 36.6], [100.4, 37.5], [101.3, 37.0], [99.4, 36.3]];
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={`${Math.floor(t * 2.2)}_${camp.toFixed(2)}`} opacity={0.95} />
      </Map3D>
      <Svg>
        <FlagIcon x={lx} y={ay + 40} s={0.9} text="突" color="#4a4a8a" rot={lerp(-6, 22, swing) - recoil} />
        <g transform={`translate(${rx * 2} 0) scale(-1 1)`}><FlagIcon x={rx} y={by + 40} s={0.9} text="" color="#7a3a8a" rot={lerp(-6, 22, swing) - recoil} /></g>
        <text x={rx + 60} y={by - 92} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#fff0d0">突</text>
        {spark > 0 && Array.from({length: 10}, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const r = 30 + (1 - spark) * 110;
          return <line key={i} x1={mid + Math.cos(a) * r * 0.4} y1={ay - 120 + Math.sin(a) * r * 0.4} x2={mid + Math.cos(a) * r} y2={ay - 120 + Math.sin(a) * r} stroke="#ffe6a0" strokeWidth={6} opacity={spark} />;
        })}
        {yurts.map((q, i) => {
          const o = clamp01((camp - i * 0.08) * 2);
          const [x, y] = project(cam, q[0], q[1], 4);
          return o > 0 ? <g key={i} opacity={o}><Yurt x={x} y={y} s={0.55} glow={0.6 + 0.4 * Math.sin(t / 6 + i)} red /></g> : null;
        })}
      </Svg>
      {clamp01(t / bt(1)) > 0 && <div style={{position: 'absolute', left: 530, top: 500, width: 400, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 52, color: '#d8d0ff', WebkitTextStroke: '2px #1a0c04', textShadow: '0 4px 14px rgba(0,0,0,0.85)', opacity: clamp01(t / bt(1))}}>西突厥（内斗）</div>}
      {LL_TAG(cam, [100.0, 35.6], '吐谷浑', camp, '#ff9a80', 64, 0)}
      <Label3 cam={cam} at={QHLAKE} name="青海湖" lift={10} size={30} o={0.8} color="#cfe6f0" />
      <Label3 cam={cam} at={DUNHUANG} name="敦煌" lift={14} size={32} o={0.8} color="#e8dcc0" />
      <Label3 cam={cam} at={ZHANGYE} name="张掖" lift={14} size={32} o={0.8} color="#e8dcc0" />
      <Vignette k={0.35} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 48 屏：人名卡「慕容吐谷浑」；鲜卑人马从东北一路西迁到青海湖 ═════════ */
const MIGRATE: LL[] = [[121.5, 41.6], [118.0, 41.9], [114.0, 41.3], [110.5, 40.7], [107.0, 39.3], [104.5, 37.6], [102.6, 36.9], [100.9, 36.9]];
const Sc48: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(9)));
  const cam: Cam3 = {lon: lerp(112.5, 110.8, k), lat: lerp(38.0, 37.6, k), dist: 2350, pitch: 56, yaw: 0};
  const p = easeInOut(seg(t, S48.mig0, S48.mig1));
  const card = easeOut(seg(t, S48.card, S48.card + 0.7));
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    if (p <= 0) return;
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(30,14,2,0.75)'; g.lineWidth = 24;
    polyline(g, px, MIGRATE, p); g.stroke();
    g.strokeStyle = '#bfe4ff'; g.lineWidth = 13;
    g.setLineDash([24, 16]);
    polyline(g, px, MIGRATE, p); g.stroke();
    g.restore();
  };
  const head = alongLL(MIGRATE, p);
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={p.toFixed(3)} opacity={0.95} />
      </Map3D>
      <Svg>
        {p > 0 && [0, 1, 2, 3].map((i) => {
          const q = alongLL(MIGRATE, Math.max(0, p - i * 0.025));
          const [x, y] = project(cam, q[0], q[1], 4);
          return <g key={i} style={{filter: 'brightness(0.25) sepia(0.5)'}} transform={`translate(${x} ${y}) scale(${q[0] > head[0] - 0.01 && i === 0 ? -1 : -1} 1) translate(${-x} ${-y})`}><Rider f={t} x={x + i * 6} y={y - (i % 2) * 8} s={0.17} seed={i * 1.3} /></g>;
        })}
      </Svg>
      <Label3 cam={cam} at={[121.5, 41.6]} name="辽西（慕容部故地）" side="left" lift={14} size={32} o={0.85} color="#e8dcc0" />
      <Label3 cam={cam} at={QHLAKE} name="青海湖" lift={10} size={34} o={p > 0.9 ? 1 : 0.5} color="#cfe6f0" />
      <Card x={1380} y={760} text="慕容吐谷浑" p={card} size={66} rot={0} />
      {card > 0 && <div style={{position: 'absolute', left: 880, width: 1000, top: 872, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 36, color: '#e8d8b0', textShadow: '0 2px 10px #000', opacity: card}}>鲜卑慕容部 · 第一代首领</div>}
      <Vignette k={0.35} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 49 屏：608 年铁勒袭击吐谷浑，隋军从西平出击，斩首三千多 ═════════ */
const Sc49: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(9)));
  const cam: Cam3 = {lon: lerp(100.4, 100.9, k), lat: lerp(37.6, 37.3, k), dist: lerp(1700, 1600, k), pitch: 60, yaw: 0};
  const charge = easeInOut(seg(t, S49.charge, S49.hit));
  const hit = t - bt(S49.hit);
  const flee = easeOut(seg(t, S49.hit, S49.hit + 3.5));
  const sui = easeInOut(seg(t, S49.sui, S49.sui + 3));
  const card = easeOut(seg(t, S49.card, S49.card + 0.7));
  const camp: LL = [100.0, 36.95];
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    // 隋军金色箭头：西平 → 西北追击
    if (sui > 0) {
      const a = px(...XIPING), b0 = px(100.4, 37.35);
      const b = [lerp(a[0], b0[0], sui), lerp(a[1], b0[1], sui)];
      g.save(); g.lineCap = 'round';
      g.strokeStyle = 'rgba(40,20,4,0.6)'; g.lineWidth = 26; g.beginPath(); g.moveTo(...a); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = '#ffd070'; g.lineWidth = 16; g.beginPath(); g.moveTo(...a); g.lineTo(b[0], b[1]); g.stroke();
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      g.translate(b[0], b[1]); g.rotate(ang); g.fillStyle = '#ffd070';
      g.beginPath(); g.moveTo(40, 0); g.lineTo(-20, -30); g.lineTo(-20, 30); g.closePath(); g.fill();
      g.restore();
    }
  };
  const [cx, cy] = project(cam, ...camp, 4);
  const shake = hit > 0 && hit < 10 ? Math.sin(hit * 3) * (10 - hit) : 0;
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px,0)`}}>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={sui.toFixed(3)} opacity={0.95} />
      </Map3D>
      <Svg>
        {[[-60, -20], [40, 10], [-10, 50], [90, -30], [-110, 30]].map(([dx, dy], i) => <Yurt key={i} x={cx + dx} y={cy + dy} s={0.7} red glow={hit > 0 && hit < 30 ? 1 - hit / 30 : 0.3} />)}
        {/* 铁勒骑兵从北边冲下来 */}
        {Array.from({length: 5}, (_, i) => {
          const q: LL = [lerp(99.6 + i * 0.18, 99.75 + i * 0.12, charge), lerp(38.7, 37.25, charge)];
          const [x, y] = project(cam, q[0], q[1], 4);
          return <g key={i} style={{filter: 'brightness(0.22) sepia(0.4)'}}><Rider f={t} x={x} y={y + (i % 2) * 14} s={0.15} seed={i * 1.9} /></g>;
        })}
        {/* 吐谷浑人往东逃（小人点） */}
        {flee > 0 && Array.from({length: 10}, (_, i) => {
          const q: LL = [100.05 + flee * (0.6 + rnd(i) * 0.4), 36.9 + (rnd(i + 4) - 0.5) * 0.35 + flee * 0.15];
          const [x, y] = project(cam, q[0], q[1], 4);
          return <g key={i} style={{filter: 'brightness(0.5) sepia(0.6) hue-rotate(-20deg)'}}>{R({robe: '#8a3a2a', robeD: '#6a2a1e', pants: '#2a1e14', hem: 60, hat: 'felt'}, walkPose(x, y, t / 8 + i * 0.3, 0.12, 1), 0.12, {face: 'shock'})}</g>;
        })}
      </Svg>
      <Label3 cam={cam} at={XIPING} name="西平" lift={14} size={40} />
      {LL_TAG(cam, [99.2, 38.3], '铁勒', clamp01(t / bt(0.8)), '#e0d0ff', 52, -40)}
      {LL_TAG(cam, camp, '吐谷浑', clamp01(t / bt(0.8)), '#ff9a80', 44, 30)}
      <Card x={1400} y={240} text="608 年" p={easeOut(seg(t, S49.charge, S49.charge + 0.7))} size={56} />
      <Card x={1400} y={370} text="斩首 3000+" p={card} size={64} red />
      <Vignette k={0.35} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 50 屏：伏允抱头张望，四面「隋」字大旗斜插，十字锁死 ═════════ */
const FUYUN: Partial<RigProps> = {robe: '#7a3a24', robeD: '#5a2818', pants: '#2a1e14', hem: 110, hat: 'felt', beard: true, beardC: '#2a1e14'};
const FurCollar: React.FC<{neck: P; s: number}> = ({neck, s}) => (
  <g>
    <ellipse cx={neck[0]} cy={neck[1] + 14 * s} rx={56 * s} ry={22 * s} fill="#e8d8b8" stroke="#8a7458" strokeWidth={3 * s} />
    <path d={`M${neck[0] - 10 * s} ${neck[1] + 20 * s} L${neck[0] + 20 * s} ${neck[1] + 120 * s} L${neck[0] + 40 * s} ${neck[1] + 20 * s}`} fill="#e8d8b8" stroke="#8a7458" strokeWidth={3 * s} />
  </g>
);
const BigFlag: React.FC<{x: number; y: number; from: number; p: number; s?: number; tilt?: number}> = ({x, y, from, p, s = 1, tilt = 0}) => {
  if (p <= 0) return null;
  // from：飞来方向（度，0 = 上方，90 = 右方）；旗杆基本竖直，字不倒
  const d = (1 - easeOut(p)) * 1100;
  const rad = (from * Math.PI) / 180;
  const ox = Math.sin(rad) * d, oy = -Math.cos(rad) * d;
  return (
    <g transform={`translate(${x + ox} ${y + oy}) rotate(${tilt}) scale(${s})`}>
      <line x1={0} y1={0} x2={0} y2={-520} stroke="#2a1a0c" strokeWidth={14} />
      <path d="M0 -540 l-12 34 l24 0 Z" fill="#c8c8c8" />
      <path d="M8 -500 L230 -490 L230 -250 L8 -240 Z" fill="#141414" stroke="#c8281c" strokeWidth={8} />
      <text x={119} y={-322} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={150} fill="#ffe0a0">隋</text>
      <ellipse cx={0} cy={0} rx={30} ry={8} fill="#1a1208" opacity={p >= 1 ? 0.6 : 0} />
    </g>
  );
};
const Sc50: React.FC<{t: number}> = ({t}) => {
  const hits = [S50.f1, S50.f2, S50.f3, S50.f4];
  const ps = hits.map((h) => clamp01((t - bt(h) + 5) / 5));
  const last = hits.reduce((m, h) => (t >= bt(h) ? t - bt(h) : m), -1);
  const shake = last >= 0 && last < 8 ? Math.sin(last * 3.2) * (8 - last) * 1.4 : 0;
  const look = Math.sin(t / 7);
  const facing: 1 | -1 = look > 0 ? 1 : -1;
  const s = 0.5, gx = 960, gy = 720;
  const base = standPose(gx, gy, s, facing);
  const neck: P = [gx + facing * 4 * s, base.neck[1] + 10 * s];
  const head = headOf(base.hip, neck, s);
  const fear = clamp01((t - bt(S50.f1)) / 20);
  const dir: [number, number, number, string, number, number][] = [
    // x, y, 角度, 地名, 地名x, 地名y
    [930, 540, 0, '雪山', 1240, 330],
    [930, 1075, 180, '金山', 1250, 900],
    [1580, 840, 90, '琵琶峡', 1720, 470],
    [260, 840, -90, '泥岭', 400, 470],
  ];
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.5}px)`}}>
      <Svg>
        <defs>
          <linearGradient id="sky50" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4658" />
            <stop offset="1" stopColor="#b8a888" />
          </linearGradient>
          <radialGradient id="bowl50" cx="0.5" cy="0.55" r="0.6">
            <stop offset="0" stopColor="#8a7a50" />
            <stop offset="1" stopColor="#3a3022" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky50)" />
        {/* 远处雪山 */}
        <path d="M0 520 L220 300 L380 420 L620 220 L840 400 L1000 260 L1220 420 L1420 240 L1660 400 L1920 280 L1920 620 L0 620 Z" fill="#6a7488" />
        <path d="M220 300 L270 350 L240 360 L300 380 L380 420 M620 220 L680 290 L640 300 L720 330 M1000 260 L1050 310 L1020 320 M1420 240 L1480 300 L1440 310 L1520 340" stroke="#f0f4f8" strokeWidth={14} fill="none" strokeLinejoin="round" />
        {/* 山谷盆地 */}
        <path d="M0 640 Q480 520 960 560 Q1440 520 1920 640 L1920 1080 L0 1080 Z" fill="url(#bowl50)" />
        <path d="M0 700 Q300 600 520 680 L0 900 Z M1920 700 Q1620 600 1400 680 L1920 900 Z" fill="#4a3e2c" />
        {/* 营帐 */}
        <g transform="translate(1200 700) scale(1.4)"><Yurt x={0} y={0} s={1.2} /></g>
        <g transform="translate(720 690) scale(1.1)"><Yurt x={0} y={0} s={1.0} /></g>
        <ellipse cx={gx} cy={gy + 6} rx={120} ry={18} fill="#1a1208" opacity={0.5} />
        {R(FUYUN, {...base, neck, headAt: [head[0] + look * 14 * s, head[1]], handN: [head[0] + 34 * s, head[1] - 30 * s], handF: [head[0] - 30 * s, head[1] - 32 * s], elbowBend: -1}, s, {face: fear > 0.3 ? 'shock' : 'pain', headTilt: look * 12}, <FurCollar neck={neck} s={s} />)}
        {/* 四面大旗 */}
        {dir.map(([x, y, a], i) => <BigFlag key={i} x={x} y={y} from={a} p={ps[i]} s={[0.5, 0.55, 0.62, 0.62][i]} tilt={[0, 0, -8, 8][i]} />)}
        {/* 十字锁线 */}
        {ps[3] >= 1 && <g opacity={clamp01((t - bt(S50.f4)) / 8)}>
          <line x1={960} y1={420} x2={960} y2={1080} stroke="#ffd070" strokeWidth={5} strokeDasharray="20 14" opacity={0.6} />
          <line x1={300} y1={760} x2={1620} y2={760} stroke="#ffd070" strokeWidth={5} strokeDasharray="20 14" opacity={0.6} />
        </g>}
      </Svg>
      {dir.map(([, , , n, x, y], i) => ps[i] >= 1 ? (
        <div key={n} style={{position: 'absolute', left: x - 160, top: y - 40, width: 320, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 54, color: '#ffe6a8', WebkitTextStroke: '2px #1a0c04', textShadow: '0 4px 14px rgba(0,0,0,0.85)', transform: `scale(${lerp(1.5, 1, easeOutBack(clamp01((t - bt(hits[i])) / 8)))})`}}>{n}</div>
      ) : null)}
      <div style={{position: 'absolute', left: 1040, top: 640, fontFamily: LF.serif, fontWeight: 900, fontSize: 44, color: '#ffd8a0', WebkitTextStroke: '2px #1a0c04', textShadow: '0 2px 10px #000'}}>伏允</div>
      <Card x={1650} y={150} text="609 年" p={easeOut(seg(t, S50.year, S50.year + 0.7))} size={54} />
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 51 屏：山头替身挥旗；山后伏允带几十骑往雪山方向狂奔（慢镜头） ═════════ */
const Sc51: React.FC<{t: number}> = ({t}) => {
  const slow = t * 0.45;
  const flee = easeInOut(seg(t, S51.flee - 1, 9));
  const k = easeInOut(clamp01(t / bt(9)));
  const z = lerp(1.0, 1.08, k);
  const s = 0.5;
  const hx = 560, hy = 640;
  const wave = Math.sin(slow / 5);
  const base = standPose(hx, hy, s, 1);
  const hand: P = [hx + 60 * s + wave * 30 * s, base.neck[1] - 120 * s];
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="sky51" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2e3a4e" />
            <stop offset="1" stopColor="#a89880" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky51)" />
        <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
          {/* 远方雪山（逃跑方向） */}
          <path d="M1100 470 L1360 250 L1520 380 L1700 230 L1920 400 L1920 600 L1100 600 Z" fill="#7a8498" />
          <path d="M1360 250 L1410 300 L1380 310 L1450 340 M1700 230 L1760 290 L1720 300 L1800 330" stroke="#f4f6fa" strokeWidth={14} fill="none" strokeLinejoin="round" />
          <path d="M0 620 Q700 520 1920 600 L1920 1080 L0 1080 Z" fill="#6a5a40" />
          {/* 山后小路：伏允和几十骑往右上狂奔 */}
          {Array.from({length: 9}, (_, i) => {
            const u = flee - i * 0.03;
            if (u <= 0) return null;
            const x = lerp(760, 1500, u) - (i % 3) * 36;
            const y = lerp(620, 520, u) + (i % 3) * 14;
            return <g key={i} style={{filter: i === 0 ? 'none' : 'brightness(0.45) sepia(0.4)'}}><Rider f={slow + i * 3} x={x} y={y} s={0.12 + (i === 0 ? 0.02 : 0)} seed={i * 1.1} /></g>;
          })}
          {flee > 0.05 && (() => {
            const x = lerp(760, 1500, flee), y = lerp(620, 520, flee);
            return <text x={x + 20} y={y - 120} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#ffd8a0" stroke="#1a0c04" strokeWidth={5} paintOrder="stroke">伏允</text>;
          })()}
          {/* 近处山头 */}
          <path d="M0 1080 L0 700 Q300 600 560 640 Q820 680 1000 820 L1200 1080 Z" fill="#4a3c28" />
          <path d="M0 700 Q300 600 560 640 Q820 680 1000 820" stroke="#2a2014" strokeWidth={6} fill="none" />
          {/* 替身：穿可汗衣服挥旗 */}
          {R(FUYUN, {...base, handN: hand, handF: [hx - 30 * s, base.hip[1] - 20 * s]}, s, {face: 'shout'}, <FurCollar neck={base.neck} s={s} />)}
          <line x1={hand[0]} y1={hand[1] + 60 * s} x2={hand[0] + 10 * s} y2={hand[1] - 300 * s} stroke="#2a1a0c" strokeWidth={8} />
          <path d={`M${hand[0] + 10 * s} ${hand[1] - 300 * s} Q${hand[0] + 120 * s + wave * 30} ${hand[1] - 270 * s} ${hand[0] + 200 * s} ${hand[1] - 300 * s + wave * 30} L${hand[0] + 190 * s} ${hand[1] - 160 * s} Q${hand[0] + 110 * s} ${hand[1] - 150 * s} ${hand[0] + 6 * s} ${hand[1] - 170 * s} Z`} fill="#b8301c" stroke="#3a0e08" strokeWidth={4} />
          <text x={hx} y={hy + 70} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={42} fill="#ffe6a8" stroke="#1a0c04" strokeWidth={5} paintOrder="stroke">替身</text>
        </g>
      </Svg>
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 52 屏：十几万部众举手投降，牛羊遍地 ═════════ */
const Sheep: React.FC<{x: number; y: number; s: number; dark?: boolean}> = ({x, y, s, dark}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-34} rx={46} ry={28} fill={dark ? '#4a3a2a' : '#ece4d4'} stroke="#6a5a48" strokeWidth={3} />
    <ellipse cx={44} cy={-48} rx={14} ry={12} fill={dark ? '#2a1e14' : '#3a2e24'} />
    {[-26, -8, 14, 28].map((d) => <line key={d} x1={d} y1={-12} x2={d} y2={4} stroke="#3a2e24" strokeWidth={5} />)}
  </g>
);
const Sc52: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(7)));
  const z = lerp(1.08, 1.0, k);
  const up = easeOut(seg(t, 0.2, 1.4));
  const looks: Partial<RigProps>[] = [
    {robe: '#7a3a24', robeD: '#5a2818', pants: '#2a1e14', hem: 90, hat: 'felt'},
    {robe: '#5a5a3a', robeD: '#40402a', pants: '#2a1e14', hem: 90, hat: 'felt'},
    {robe: '#6a4a5a', robeD: '#4a3440', pants: '#2a1e14', hem: 90, hat: 'none', hair: '#1a120c'},
  ];
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="sky52" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a5468" />
            <stop offset="1" stopColor="#c8b890" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky52)" />
        <path d="M0 430 L300 300 L520 400 L800 280 L1100 420 L1400 300 L1700 410 L1920 330 L1920 520 L0 520 Z" fill="#7a8090" />
        <path d="M0 480 Q960 420 1920 480 L1920 1080 L0 1080 Z" fill="#8a7a4a" />
        <g transform={`translate(960 700) scale(${z}) translate(-960 -700)`}>
          {/* 远处黑压压的人群（举手） */}
          {Array.from({length: 120}, (_, i) => {
            const row = Math.floor(i / 30), col = i % 30;
            const x = col * 66 + (row % 2) * 33 - 10 + rnd(i) * 20;
            const y = 520 + row * 34;
            const sc = 0.6 + row * 0.12;
            const arm = up * (0.6 + 0.4 * Math.sin(t / 5 + i));
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${sc})`} opacity={0.85}>
                <rect x={-9} y={-34} width={18} height={34} fill="#2a2018" />
                <circle cx={0} cy={-44} r={10} fill="#2a2018" />
                <line x1={-7} y1={-30} x2={-16} y2={-30 - 26 * arm} stroke="#2a2018" strokeWidth={5} />
                <line x1={7} y1={-30} x2={16} y2={-30 - 26 * arm} stroke="#2a2018" strokeWidth={5} />
              </g>
            );
          })}
          {/* 牛羊 */}
          {Array.from({length: 22}, (_, i) => <Sheep key={i} x={60 + i * 88 + rnd(i + 30) * 40} y={700 + rnd(i + 2) * 60 + Math.sin(t / 9 + i) * 2} s={0.6 + rnd(i) * 0.2} dark={i % 5 === 0} />)}
          {/* 近处三人跪地举手 */}
          {[0, 1, 2].map((i) => {
            const s = 0.5;
            const x = 520 + i * 420;
            const p = kneelPose(x, 1000, s, i === 1 ? -1 : 1);
            const hd = headOf(p.hip, p.neck, s);
            const lift = up * (1 + Math.sin(t / 4 + i) * 0.08);
            return <g key={i}>{R(looks[i], {...p, handN: [hd[0] + 50 * s, hd[1] - 110 * s * lift], handF: [hd[0] - 30 * s, hd[1] - 120 * s * lift], elbowBend: -1}, s, {face: 'shock'})}</g>;
          })}
        </g>
      </Svg>
      <Card x={1420} y={210} text="十几万部众投降" p={easeOut(seg(t, S52.card, S52.card + 0.7))} size={60} />
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 53 屏：吐谷浑故地刷成隋的颜色，「东西 4000 里 × 南北 2000 里」 ═════════ */
const Sc53: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(9)));
  const cam: Cam3 = {lon: lerp(99.3, 99.0, k), lat: lerp(36.4, 36.2, k), dist: lerp(1550, 1650, k), pitch: 58, yaw: 0};
  const sweep = easeInOut(seg(t, S53.paint0, S53.paint1));
  const flash = t - bt(S53.paint1);
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    polyFill(g, px, TUYU);
    g.fillStyle = 'rgba(200,60,40,0.32)';
    g.fill();
    if (sweep > 0) {
      const [xe] = px(102.8, 36);
      const [xw] = px(89.5, 36);
      const xs = lerp(xe, xw, sweep);
      g.save();
      polyFill(g, px, TUYU);
      g.clip();
      g.fillStyle = 'rgba(255,200,90,0.6)';
      g.fillRect(xs, 0, g.canvas.width, g.canvas.height);
      g.fillStyle = 'rgba(255,240,190,0.9)';
      g.fillRect(xs - 6, 0, 12, g.canvas.height);
      g.restore();
    }
    polyFill(g, px, TUYU);
    g.strokeStyle = sweep >= 1 ? '#ffd070' : 'rgba(255,120,90,0.8)';
    g.lineWidth = 7;
    g.stroke();
  };
  const card = easeOut(seg(t, S53.card, S53.card + 0.7));
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={sweep.toFixed(3)} opacity={0.95} />
      </Map3D>
      <Label3 cam={cam} at={QHLAKE} name="青海湖" lift={10} size={30} o={0.8} color="#cfe6f0" />
      <Label3 cam={cam} at={DUNHUANG} name="敦煌" lift={14} size={32} o={0.8} color="#e8dcc0" />
      <Label3 cam={cam} at={XIPING} name="西平" lift={14} size={32} o={0.8} color="#e8dcc0" />
      {LL_TAG(cam, [97.0, 36.2], sweep >= 1 ? '隋' : '吐谷浑', 1, sweep >= 1 ? '#ffe6a8' : '#ff9a80', sweep >= 1 ? 96 : 60, -40)}
      <Card x={960} y={830} text="东西 4000 里 × 南北 2000 里" p={card} size={58} rot={0} />
      {flash > 0 && flash < 14 && <AbsoluteFill style={{background: '#fff8e0', opacity: 0.7 * (1 - flash / 14)}} />}
      <Vignette k={0.35} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 54 屏：四郡名浮出；戴枷犯人扛锄头走进田里 ═════════ */
const JUN: [LL, string, boolean][] = [[[99.9, 36.95], '西海郡', false], [[99.6, 35.6], '河源郡', false], [[92.6, 38.9], '← 鄯善郡', true], [[92.4, 37.4], '← 且末郡', true]];
const Convict: React.FC<{t: number; x: number; y: number; s: number; seed: number}> = ({t, x, y, s, seed}) => {
  const p = walkPose(x, y, t / 22 + seed, s, 1);
  const hd = headOf(p.hip, p.neck, s);
  const look = {robe: '#8a8070', robeD: '#6a6254', pants: '#4a4236', hem: 50, hat: 'none' as const, hair: '#2a2018'};
  const sh: P = [p.neck[0], p.neck[1] + 10 * s];
  return (
    <g>
      {R(look, {...p, handN: [sh[0] + 30 * s, sh[1] + 10 * s], handF: [sh[0] - 10 * s, sh[1] + 20 * s]}, s, {face: 'pain'})}
      {/* 锄头扛在肩上 */}
      <line x1={sh[0] - 150 * s} y1={sh[1] + 40 * s} x2={sh[0] + 120 * s} y2={sh[1] - 40 * s} stroke="#7a5430" strokeWidth={9 * s} strokeLinecap="round" />
      <path d={`M${sh[0] - 150 * s} ${sh[1] + 40 * s} l${-10 * s} ${50 * s} l${-30 * s} ${-6 * s} Z`} fill="#8a8a8a" stroke="#3a3a3a" strokeWidth={2 * s} />
      {/* 木枷 */}
      <rect x={hd[0] - 80 * s} y={p.neck[1] - 4 * s} width={160 * s} height={30 * s} fill="#8a5a2a" stroke="#3a2010" strokeWidth={4 * s} rx={4 * s} />
      <circle cx={hd[0]} cy={p.neck[1] + 10 * s} r={6 * s} fill="#3a2010" />
    </g>
  );
};
const Sc54: React.FC<{t: number}> = ({t}) => {
  const cut = bt(S54.cut);
  const cam: Cam3 = {lon: 99.0, lat: 36.2, dist: 1650, pitch: 58, yaw: 0};
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    polyFill(g, px, TUYU);
    g.fillStyle = 'rgba(255,200,90,0.45)';
    g.fill();
    g.strokeStyle = '#ffd070'; g.lineWidth = 7; g.stroke();
  };
  const js = [S54.j1, S54.j2, S54.j3, S54.j4].map((b) => easeOut(seg(t, b, b + 0.6)));
  if (t < cut) {
    return (
      <AbsoluteFill>
        <Map3D cam={cam}>
          <Drape paint={paint} dep="54" opacity={0.95} />
        </Map3D>
        <Svg>
          {JUN.map(([at, , edge], i) => {
            if (js[i] <= 0 || edge) return null;
            const [x, y] = project(cam, at[0], at[1], 6);
            return <circle key={i} cx={x} cy={y} r={14 * js[i]} fill="#ffe6a0" stroke="#3a1a08" strokeWidth={4} />;
          })}
        </Svg>
        {JUN.map(([at, n], i) => LL_TAG(cam, at, n, js[i], '#ffe6a8', 50, -80))}
        <Vignette k={0.35} />
      </AbsoluteFill>
    );
  }
  const u = t - cut;
  const fade = clamp01(u / 8);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="sky54" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6a7488" />
            <stop offset="1" stopColor="#d8c898" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky54)" />
        <path d="M0 440 L360 300 L640 400 L980 290 L1300 410 L1640 300 L1920 380 L1920 540 L0 540 Z" fill="#8a90a0" />
        <path d="M0 520 L1920 520 L1920 1080 L0 1080 Z" fill="#9a8450" />
        {/* 新开的田垄 */}
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M${1000 - i * 30} ${560 + i * 56} L1920 ${560 + i * 56}`} stroke="#6a5430" strokeWidth={8 + i * 2} />)}
        {Array.from({length: 40}, (_, i) => <path key={`c${i}`} d={`M${1060 + (i % 10) * 90 - Math.floor(i / 10) * 20} ${600 + Math.floor(i / 10) * 112} l-8 -26 m8 26 l8 -24`} stroke="#5a8a3a" strokeWidth={5} />)}
        {/* 犯人队伍从左走进田里 */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = -80 + i * 230 + u * 2.2;
          return <Convict key={i} t={u} x={x} y={900 + (i % 2) * 40} s={0.4} seed={i * 0.27} />;
        })}
        {/* 押送官兵 */}
        {(() => {
          const x = 1180 + u * 0.6;
          const p = standPose(x, 880, 0.42, -1);
          return <g>{R({robe: '#7a5a3a', robeD: '#5a4028', pants: '#2a2018', hem: 70}, p, 0.42, {face: 'stern'})}<line x1={x - 30} y1={880} x2={x - 40} y2={600} stroke="#2a1a0c" strokeWidth={7} /><path d={`M${x - 40} 600 l-10 30 l20 0 Z`} fill="#c8c8c8" /></g>;
        })()}
      </Svg>
      <div style={{position: 'absolute', right: 120, top: 250, fontFamily: LF.serif, fontWeight: 900, fontSize: 56, color: '#ffe6a8', WebkitTextStroke: '2px #1a0c04', textShadow: '0 4px 14px rgba(0,0,0,0.8)', opacity: clamp01(u / 10)}}>屯田</div>
      <AbsoluteFill style={{background: '#000', opacity: 1 - fade, pointerEvents: 'none'}} />
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 55 屏：燕支山下，西域二十七国使者排队行礼，杨广高坐 ═════════ */
const ENVOY: Partial<RigProps>[] = [
  {robe: '#2f6a7a', robeD: '#214c5a', pants: '#2a2420', hem: 120, hat: 'felt', beard: true, beardC: '#3a2a1a'},
  {robe: '#a8402a', robeD: '#7a2c1c', pants: '#2a2020', hem: 120, hat: 'none', hair: '#1a120c', beard: true, beardC: '#2a1a10'},
  {robe: '#6a4a8a', robeD: '#4a3466', pants: '#2a2030', hem: 120, hat: 'felt'},
  {robe: '#c8a040', robeD: '#9a7a2a', pants: '#3a2a1a', hem: 120, hat: 'felt', beard: true, beardC: '#5a3a1a'},
  {robe: '#3e7a4a', robeD: '#2a5634', pants: '#2a2420', hem: 120, hat: 'none', hair: '#2a1a10'},
];
const Tent: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-90 0 L0 -130 L90 0 Z" fill="#efe6d0" stroke="#5a4a30" strokeWidth={4} />
    <path d="M-30 0 L0 -130 L30 0 Z" fill={c} opacity={0.85} />
    <line x1={0} y1={-130} x2={0} y2={-170} stroke="#5a4a30" strokeWidth={4} />
    <path d="M0 -170 l30 8 l-30 8 Z" fill={c} />
  </g>
);
const Sc55: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(9)));
  const pan = lerp(0, -160, k);
  const card = easeOut(seg(t, S55.card, S55.card + 0.7));
  const yg = stoolPose(1560, 760, 0.5, -1, 130);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="sky55" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a6a8a" />
            <stop offset="1" stopColor="#e8d0a0" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky55)" />
        <g transform={`translate(${pan} 0)`}>
          {/* 燕支山 */}
          <path d="M-100 460 L260 240 L460 360 L760 180 L1060 360 L1300 260 L1600 380 L2100 300 L2100 560 L-100 560 Z" fill="#6a7a60" />
          <path d="M760 180 L820 240 L790 250 L860 280 M260 240 L310 290 L280 300" stroke="#f0f2f0" strokeWidth={12} fill="none" />
          <text x={760} y={330} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={44} fill="#f4ecd0" stroke="#2a2010" strokeWidth={4} paintOrder="stroke" opacity={0.9}>燕支山</text>
          <path d="M-100 540 Q960 500 2100 540 L2100 1080 L-100 1080 Z" fill="#a89458" />
          {/* 帐幕连绵 */}
          {Array.from({length: 16}, (_, i) => <Tent key={i} x={-40 + i * 140} y={590 + (i % 2) * 18} s={0.7} c={['#b8301c', '#2f6a7a', '#c8a040', '#6a4a8a'][i % 4]} />)}
          {/* 旌旗 */}
          {Array.from({length: 8}, (_, i) => <g key={`f${i}`}><line x1={100 + i * 240} y1={660} x2={100 + i * 240} y2={500} stroke="#3a2a1a" strokeWidth={5} /><path d={`M${100 + i * 240} 500 q30 ${8 + Math.sin(t / 6 + i) * 6} 60 0 l0 40 q-30 ${-8 + Math.sin(t / 6 + i) * 6} -60 0 Z`} fill={i % 2 ? '#c8281c' : '#d8a83a'} /></g>)}
        </g>
        {/* 杨广高坐（右侧高台、华盖） */}
        <rect x={1380} y={760} width={420} height={60} fill="#7a2a1a" stroke="#3a1008" strokeWidth={4} />
        <rect x={1340} y={820} width={500} height={60} fill="#6a2416" stroke="#3a1008" strokeWidth={4} />
        <rect x={1300} y={880} width={580} height={200} fill="#5a1e12" />
        <line x1={1450} y1={760} x2={1450} y2={440} stroke="#5a3a1a" strokeWidth={10} />
        <line x1={1700} y1={760} x2={1700} y2={440} stroke="#5a3a1a" strokeWidth={10} />
        <path d="M1400 440 Q1575 380 1750 440 L1730 470 L1420 470 Z" fill="#d8a83a" stroke="#7a5a1a" strokeWidth={4} />
        {R(LOOK54.yangEmp, yg, 0.5, {face: 'smile'})}
        <text x={1580} y={430} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#ffe6a8" stroke="#1a0c04" strokeWidth={5} paintOrder="stroke">杨广</text>
        {/* 使者长队：由远及近，依次躬身/跪拜 */}
        {Array.from({length: 7}, (_, i) => {
          const s = 0.3 + i * 0.03;
          const x = 160 + i * 160 + t * 0.5;
          const g = 760 + i * 36;
          const bow = clamp01((t - i * 6) / 14) * (0.6 + 0.4 * Math.sin(t / 10 + i));
          const p = standPose(x, g, s, 1);
          const neck = lean(p.hip, 50 * bow, s);
          const hd = headOf(p.hip, neck, s);
          return <g key={i}>{R(ENVOY[i % ENVOY.length], {...p, neck, handN: [hd[0] + 20 * s, neck[1] + 70 * s], handF: [hd[0] + 10 * s, neck[1] + 76 * s]}, s, {face: 'calm'})}</g>;
        })}
      </Svg>
      <Card x={700} y={260} text="西域 27 国来朝" p={card} size={62} />
      <Vignette k={0.4} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 56 屏：大斗拔谷风雪吞没行军队伍，马驴倒在路边 ═════════ */
const DeadHorse: React.FC<{x: number; y: number; s: number; snow: number}> = ({x, y, s, snow}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-50} rx={150} ry={52} fill="#5a4a3a" />
    <path d="M120 -70 Q190 -80 230 -40 L220 -10 Q170 -30 120 -30 Z" fill="#5a4a3a" />
    {[-90, -50, 40, 80].map((d, i) => <line key={d} x1={d} y1={-60} x2={d + 30 + i * 6} y2={-160 + (i % 2) * 20} stroke="#4a3a2a" strokeWidth={16} strokeLinecap="round" />)}
    <path d={`M-160 -40 Q-60 ${-110 - snow * 20} 60 -96 Q160 -110 240 -40 L240 -20 L-160 -20 Z`} fill="#f4f6fa" opacity={0.3 + 0.6 * snow} />
  </g>
);
const Sc56: React.FC<{t: number}> = ({t}) => {
  const storm = clamp01(t / bt(6));
  const fade = clamp01((t - bt(4)) / bt(6));
  const marchers = Array.from({length: 10}, (_, i) => i);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="sky56" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3240" />
            <stop offset="1" stopColor="#8a96a8" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky56)" />
        {/* 峡谷两壁 */}
        <path d="M0 0 L760 0 L820 300 L700 620 L560 1080 L0 1080 Z" fill="#3e4654" />
        <path d="M1920 0 L1160 0 L1100 300 L1220 620 L1360 1080 L1920 1080 Z" fill="#3a424e" />
        <path d="M760 0 L820 300 L700 620 L560 1080 M1160 0 L1100 300 L1220 620 L1360 1080" stroke="#e8eef4" strokeWidth={14} fill="none" opacity={0.7} />
        <path d="M560 1080 L700 620 L860 420 L1060 420 L1220 620 L1360 1080 Z" fill="#c8d0dc" />
        {/* 行军队伍：从近处走向峡谷深处，被风雪吞没 */}
        {marchers.map((i) => {
          const u = clamp01(((t * 0.35 + i * 9) % 90) / 90);
          const y = lerp(1060, 440, u);
          const x = lerp(i % 2 ? 900 : 1010, 960, u) + Math.sin(i) * 20 * (1 - u);
          const s = lerp(0.42, 0.06, u);
          const p = walkPose(x, y, t / 26 + i * 0.3, s, -1);
          const neck = lean(p.hip, -22, s);
          const o = (1 - u) * (1 - 0.6 * fade);
          return <g key={i} opacity={o}>{R({robe: '#5a5a60', robeD: '#404048', pants: '#2a2a30', hem: 80}, {...p, neck, handN: [neck[0] - 30 * s, neck[1] + 20 * s], handF: [neck[0] - 20 * s, neck[1] + 30 * s]}, s, {face: 'pain'})}</g>;
        })}
        <DeadHorse x={420} y={1010} s={0.8} snow={storm} />
        <DeadHorse x={1560} y={980} s={0.6} snow={storm} />
        <g transform="translate(1380 1060) scale(0.5)"><Mount f={0} x={0} y={0} s={1} facing={-1} kind="donkey" color="#6a6258" /></g>
        {/* 风雪：斜向横扫 */}
        {Array.from({length: 220}, (_, i) => {
          const sp = 6 + rnd(i) * 10;
          const x = ((rnd(i + 3) * 2400 - t * sp * 3) % 2400 + 2400) % 2400 - 240;
          const y = ((rnd(i + 7) * 1200 + t * sp * 1.2) % 1200) - 60;
          return <line key={i} x1={x} y1={y} x2={x + 22 + sp * 2} y2={y - 8 - sp * 0.6} stroke="#f4f8fc" strokeWidth={2 + rnd(i + 1) * 3} opacity={(0.4 + 0.5 * storm) * (0.5 + rnd(i + 9) * 0.5)} strokeLinecap="round" />;
        })}
        <rect x={0} y={0} width={1920} height={1080} fill="#e8eef4" opacity={0.15 + 0.35 * fade} />
      </Svg>
      <div style={{position: 'absolute', right: 140, top: 250, fontFamily: LF.serif, fontWeight: 900, fontSize: 58, color: '#ffe6a8', WebkitTextStroke: '2px #1a0c04', textShadow: '0 4px 14px rgba(0,0,0,0.8)'}}>大斗拔谷</div>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s46: Sc46, s47: Sc47, s48: Sc48, s49: Sc49, s50: Sc50, s51: Sc51, s52: Sc52, s53: Sc53, s54: Sc54, s55: Sc55, s56: Sc56};

export const Act8: React.FC<{f: number}> = ({f}) => {
  const id = Object.keys(SCENES).find((k) => f >= fbt(SHOT[k][0]) && f < fbt(SHOT[k][1]));
  if (!id) return null;
  const C = SCENES[id];
  return (
    <AbsoluteFill>
      <C t={f - fbt(SHOT[id][0])} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 1000px 260px at 360px 90px, rgba(10,4,2,0.62), rgba(10,4,2,0.3) 55%, rgba(10,4,2,0) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
export const ACT8_START = fbt(SHOT.s46[0]);
