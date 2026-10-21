import React from 'react';
import {clamp01, lerp, rand} from '../../library/anim';
import {LF} from '../../library/lamplight/theme';
import {P} from './Rig';

/** ep53 场景库：天空、坊墙、坊门、大街、厅堂、坊内街、饼铺、坊格子、地图、驴马、蜡烛、灯笼、荒草。全部是 SVG <g>，放进 1920×1080 的 <svg> 里用。 */
export const GND = 990; // 大街地面

export type SkyMode = 'night' | 'dusk' | 'dawn' | 'day';
const SKY: Record<SkyMode, [string, string]> = {
  night: ['#05070b', '#16110d'],
  dusk: ['#3a1c14', '#c0602e'],
  dawn: ['#1e2a40', '#d9a070'],
  day: ['#7fa6c4', '#e8d6b0'],
};
const mix = (a: string, b: string, t: number) => {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',')})`;
};

/** 天空：mode 起，to 给了就按 t 0–1 过渡 */
export const Sky: React.FC<{f: number; mode: SkyMode; to?: SkyMode; t?: number; id: string; stars?: boolean; moon?: [number, number]}> = ({f, mode, to, t = 0, id, stars, moon}) => {
  const a = SKY[mode], b = SKY[to ?? mode];
  const top = mix(a[0], b[0], t), bot = mix(a[1], b[1], t);
  const nightness = (m: SkyMode) => (m === 'night' ? 1 : m === 'day' ? 0 : 0.4);
  const st = lerp(nightness(mode), nightness(to ?? mode), t);
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill={`url(#sky-${id})`} />
      {(stars ?? st > 0.6) && Array.from({length: 60}, (_, i) => <circle key={i} cx={rand(i * 3) * 1920} cy={rand(i * 7) * 520} r={1 + 1.6 * rand(i)} fill="#fff" opacity={(0.3 + 0.5 * rand(i + 9)) * st * (0.7 + 0.3 * Math.sin(f / 9 + i))} />)}
      {moon && st > 0.5 && (
        <g>
          <circle cx={moon[0]} cy={moon[1]} r={90} fill="rgba(255,240,200,0.08)" />
          <circle cx={moon[0]} cy={moon[1]} r={36} fill="#f3e9cc" />
          <circle cx={moon[0] + 16} cy={moon[1] - 8} r={32} fill={top} />
        </g>
      )}
    </g>
  );
};

/** 远处鼓楼剪影；glow 0–1 楼里鼓亮 */
export const FarTower: React.FC<{x: number; y: number; s?: number; glow?: number; color?: string}> = ({x, y, s = 1, glow = 0, color = '#120e0b'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-120} width={140} height={120} fill={color} />
    <path d="M-110 -120 L0 -190 L110 -120 Z" fill={color} />
    <rect x={-50} y={-250} width={100} height={70} fill={color} />
    <path d="M-80 -250 L0 -300 L80 -250 Z" fill={color} />
    <rect x={-26} y={-238} width={52} height={44} fill={`rgba(255,190,90,${0.35 + 0.6 * glow})`} />
  </g>
);

/** 夯土坊墙：x0–x1，墙顶 top，墙脚 bottom；横向夯层 + 墙帽 */
export const WardWall: React.FC<{x0?: number; x1?: number; top: number; bottom: number; color?: string; lit?: number}> = ({x0 = 0, x1 = 1920, top, bottom, color = '#3a2c20', lit = 0}) => (
  <g>
    <rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill={color} />
    {Array.from({length: Math.floor((bottom - top) / 44)}, (_, i) => (
      <line key={i} x1={x0} x2={x1} y1={top + 30 + i * 44} y2={top + 30 + i * 44 + (i % 2) * 3} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
    ))}
    <rect x={x0} y={top - 18} width={x1 - x0} height={22} fill="#2a2018" />
    {lit > 0 && <rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill={`rgba(255,170,80,${0.12 * lit})`} />}
  </g>
);

/** 坊门：两扇红漆门钉门，open 0–1（门缝里漏暖光），lock 挂锁 */
export const WardGate: React.FC<{x: number; bottom: number; w?: number; h?: number; open?: number; lock?: boolean; inside?: string; roof?: boolean}> = ({x, bottom, w = 340, h = 420, open = 0, lock, inside = 'rgba(255,190,100,0.75)', roof = true}) => {
  const half = w / 2;
  const gap = half * 0.92 * clamp01(open);
  const top = bottom - h;
  const leaf = (dx: number, dir: number) => {
    const lw = half - gap;
    if (lw <= 2) return null;
    const lx = dir < 0 ? x - half : x + gap;
    return (
      <g>
        <rect x={lx} y={top} width={lw} height={h} fill="#5a2418" stroke="#2a120c" strokeWidth={6} />
        {Array.from({length: 6}, (_, r) => Array.from({length: Math.max(1, Math.floor(lw / 46))}, (_, c) => <circle key={`${r}-${c}`} cx={lx + 24 + c * 44} cy={top + 40 + r * ((h - 70) / 5)} r={7} fill="#d0a24c" />))}
        {dx}
      </g>
    );
  };
  return (
    <g>
      {roof && (
        <>
          <rect x={x - half - 40} y={top - 30} width={w + 80} height={30} fill="#2a1e16" />
          <path d={`M${x - half - 90} ${top - 30} L${x} ${top - 110} L${x + half + 90} ${top - 30} Z`} fill="#1c1410" />
        </>
      )}
      <rect x={x - half} y={top} width={w} height={h} fill={inside} />
      {leaf(0, -1)}
      {leaf(0, 1)}
      {lock && open < 0.05 && (
        <g>
          <rect x={x - 30} y={bottom - h * 0.55} width={60} height={22} rx={4} fill="#1a1512" />
          <rect x={x - 18} y={bottom - h * 0.55 + 18} width={36} height={30} rx={6} fill="#b08a3a" />
        </g>
      )}
    </g>
  );
};

/** 夯土大街路面 */
export const Road: React.FC<{y?: number; color?: string}> = ({y = GND, color = '#1f1812'}) => (
  <g>
    <rect x={0} y={y} width={1920} height={1080 - y} fill={color} />
    {Array.from({length: 26}, (_, i) => <circle key={i} cx={rand(i) * 1920} cy={y + 14 + rand(i + 50) * (1080 - y - 20)} r={2 + 3 * rand(i + 9)} fill="rgba(255,230,190,0.07)" />)}
  </g>
);

/** 大街整套：天空 + 远处鼓楼 + 坊墙 + 路面；gate 给了画坊门 */
export const Street: React.FC<{f: number; id: string; mode?: SkyMode; to?: SkyMode; t?: number; gate?: {x: number; open: number; lock?: boolean}; tower?: number; wallTop?: number; scroll?: number; moon?: boolean}> = ({f, id, mode = 'night', to, t, gate, tower, wallTop = 560, scroll = 0, moon = true}) => (
  <g>
    <Sky f={f} mode={mode} to={to} t={t} id={id} moon={moon ? [1640, 170] : undefined} />
    {tower !== undefined && <FarTower x={1500} y={wallTop - 10} s={0.8} glow={tower} />}
    <g transform={`translate(${-(scroll % 600)} 0)`}>
      <WardWall x0={0} x1={2600} top={wallTop} bottom={GND} />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M${i * 600 + 200} ${wallTop - 18} q40 -90 90 -60 q40 -60 80 0 q30 -20 40 30`} fill="#151a12" opacity={0.9} />)}
    </g>
    {gate && <WardGate x={gate.x} bottom={GND} open={gate.open} lock={gate.lock} />}
    <Road />
  </g>
);

/** 厅堂内景：kind office（官府大堂：高案 + 屏风）/ banquet（夜宴：两排矮案 + 烛台）/ house（宅子：帐幔 + 烛） */
export const Hall: React.FC<{f: number; kind: 'office' | 'banquet' | 'house'; floor?: number; light?: number}> = ({f, kind, floor = 860, light = 1}) => (
  <g>
    <rect width={1920} height={1080} fill="#1a110c" />
    <rect x={0} y={0} width={1920} height={floor} fill="#2b1a12" />
    {Array.from({length: 10}, (_, i) => <rect key={i} x={i * 200} y={0} width={196} height={floor} fill="#2f1d14" stroke="#1a100b" strokeWidth={4} />)}
    {[160, 1760].map((x) => <rect key={x} x={x - 30} y={0} width={60} height={floor} fill="#6a1f16" />)}
    <rect x={0} y={0} width={1920} height={60} fill="#140c08" />
    {kind !== 'office' &&
      [520, 1400].map((x) => (
        <g key={x}>
          <rect x={x - 160} y={300} width={320} height={260} fill="#3a2416" stroke="#1a100b" strokeWidth={8} />
          {Array.from({length: 7}, (_, i) => <line key={i} x1={x - 160 + i * 53} y1={300} x2={x - 160 + i * 53} y2={560} stroke="#1a100b" strokeWidth={5} />)}
          {Array.from({length: 5}, (_, i) => <line key={`h${i}`} x1={x - 160} y1={300 + i * 52} x2={x + 160} y2={300 + i * 52} stroke="#1a100b" strokeWidth={5} />)}
          <rect x={x - 160} y={300} width={320} height={260} fill={`rgba(255,190,110,${0.18 * light})`} />
        </g>
      ))}
    {kind === 'office' && (
      <g>
        <rect x={660} y={200} width={600} height={500} fill="#3a2a1a" stroke="#120a06" strokeWidth={10} />
        <path d="M700 640 q80 -200 200 -120 q100 -160 200 -20 q60 -80 120 20" stroke="#5a4630" strokeWidth={8} fill="none" />
        <circle cx={1120} cy={300} r={44} fill="#a8261b" opacity={0.75} />
      </g>
    )}
    {kind === 'house' && <path d="M0 60 Q480 200 960 80 Q1440 200 1920 60 L1920 0 L0 0 Z" fill="#6a2030" opacity={0.85} />}
    <rect x={0} y={floor} width={1920} height={1080 - floor} fill="#2a1c12" />
    {Array.from({length: 8}, (_, i) => <line key={i} x1={0} x2={1920} y1={floor + 14 + i * 28} y2={floor + 14 + i * 28} stroke="rgba(0,0,0,0.25)" strokeWidth={2} />)}
    <rect width={1920} height={1080} fill={`rgba(255,170,80,${0.06 * light})`} />
  </g>
);

/** 蜡烛：burn 0–1 烧短 */
export const Candle: React.FC<{f: number; x: number; y: number; h?: number; burn?: number; seed?: number; s?: number}> = ({f, x, y, h = 70, burn = 0, seed = 1, s = 1}) => {
  const hh = h * (1 - 0.75 * burn) * s;
  const fl = Math.sin(f / 3 + seed) * 3;
  return (
    <g>
      <circle cx={x} cy={y - hh - 14 * s} r={70 * s} fill="rgba(255,190,100,0.16)" />
      <rect x={x - 22 * s} y={y - 6 * s} width={44 * s} height={10 * s} fill="#6a4a2a" />
      <rect x={x - 9 * s} y={y - hh} width={18 * s} height={hh} fill="#e9dcc0" />
      <path d={`M${x - 7 * s} ${y - hh} Q${x + fl} ${y - hh - 40 * s} ${x + 7 * s} ${y - hh} Z`} fill="#ffb347" />
      <path d={`M${x - 3 * s} ${y - hh} Q${x + fl / 2} ${y - hh - 22 * s} ${x + 3 * s} ${y - hh} Z`} fill="#fff2c0" />
    </g>
  );
};

/** 矮案 + 酒壶耳杯 */
export const LowTable: React.FC<{x: number; y: number; w?: number; dishes?: boolean; color?: string}> = ({x, y, w = 320, dishes = true, color = '#5a2a18'}) => (
  <g>
    <rect x={x - w / 2} y={y - 18} width={w} height={18} rx={4} fill={color} />
    <rect x={x - w / 2 + 12} y={y} width={14} height={44} fill="#3a1a10" />
    <rect x={x + w / 2 - 26} y={y} width={14} height={44} fill="#3a1a10" />
    {dishes && (
      <>
        <path d={`M${x - 90} ${y - 18} q0 -46 20 -56 l-6 -14 h26 l-6 14 q20 10 20 56 Z`} fill="#c9b27a" />
        <ellipse cx={x - 10} cy={y - 24} rx={30} ry={8} fill="#d9cfb8" />
        <ellipse cx={x + 60} cy={y - 24} rx={30} ry={8} fill="#d9cfb8" />
        <circle cx={x + 52} cy={y - 32} r={8} fill="#c0502e" />
        <circle cx={x + 70} cy={y - 32} r={7} fill="#e0a040" />
      </>
    )}
  </g>
);

/** 纸灯笼（挂着或提着） */
export const Lamp: React.FC<{f: number; x: number; y: number; s?: number; seed?: number; color?: string; text?: string}> = ({f, x, y, s = 1, seed = 1, color = '#d8442a', text}) => {
  const sw = Math.sin(f / 15 + seed) * 4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sw}) scale(${s})`}>
      <circle cx={0} cy={44} r={110} fill="rgba(255,170,80,0.18)" />
      <line x1={0} y1={-20} x2={0} y2={0} stroke="#1a1310" strokeWidth={3} />
      <rect x={-20} y={0} width={40} height={8} fill="#2a1a10" />
      <ellipse cx={0} cy={44} rx={38} ry={40} fill={color} />
      <ellipse cx={0} cy={44} rx={22} ry={36} fill="rgba(255,220,150,0.45)" />
      <rect x={-20} y={80} width={40} height={8} fill="#2a1a10" />
      <line x1={0} y1={88} x2={0} y2={110} stroke="#d8a040" strokeWidth={4} />
      {text && <text x={0} y={56} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={34} fill="#2a0c06">{text}</text>}
    </g>
  );
};

/** 布幡（店招） */
export const Banner: React.FC<{f: number; x: number; y: number; text: string; color?: string; seed?: number}> = ({f, x, y, text, color = '#e8d8b0', seed = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 20 + seed) * 3})`}>
    <line x1={-30} y1={0} x2={60} y2={0} stroke="#3a2a1a" strokeWidth={6} />
    <path d="M0 0 h50 v150 l-25 -16 l-25 16 Z" fill={color} />
    <text x={25} y={60} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#5a1a10">{text[0]}</text>
    {text[1] && <text x={25} y={108} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#5a1a10">{text[1]}</text>}
  </g>
);

/** 坊内街：两侧店铺、灯笼、布幡，地面暖光 */
export const InnerStreet: React.FC<{f: number; signs?: string[]; scroll?: number; light?: number}> = ({f, signs = ['邸', '店', '酒', '饼', '邸', '茶'], scroll = 0, light = 1}) => (
  <g>
    <rect width={1920} height={1080} fill="#0c0806" />
    <g transform={`translate(${-scroll} 0)`}>
      {Array.from({length: 7}, (_, i) => {
        const x = i * 330 - 60;
        return (
          <g key={i}>
            <rect x={x} y={420} width={310} height={GND - 420} fill={i % 2 ? '#3a2618' : '#33221a'} />
            <path d={`M${x - 30} 430 L${x + 155} 340 L${x + 340} 430 Z`} fill="#1c120c" />
            <rect x={x + 40} y={560} width={230} height={GND - 560} fill={`rgba(255,180,90,${0.4 * light})`} />
            {Array.from({length: 5}, (_, k) => <line key={k} x1={x + 40 + k * 57} y1={560} x2={x + 40 + k * 57} y2={GND} stroke="#2a1a10" strokeWidth={5} />)}
            <Lamp f={f} x={x + 40} y={455} s={0.8} seed={i} />
            <Lamp f={f} x={x + 270} y={455} s={0.8} seed={i + 4} />
            <Banner f={f} x={x + 130} y={440} text={signs[i % signs.length]} seed={i} />
          </g>
        );
      })}
    </g>
    <rect x={0} y={GND} width={1920} height={1080 - GND} fill="#2a1c12" />
    <rect x={0} y={GND} width={1920} height={1080 - GND} fill={`rgba(255,170,80,${0.12 * light})`} />
  </g>
);

/** 胡饼铺：布帘、馕坑炉（炉火）、贴在炉壁的胡饼、蒸汽 */
export const Bakery: React.FC<{f: number; x: number; y?: number; s?: number}> = ({f, x, y = GND, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-300} y={-520} width={600} height={520} fill="#3a2618" />
    <path d="M-340 -510 L0 -620 L340 -510 Z" fill="#1c120c" />
    <rect x={-260} y={-470} width={520} height={60} fill="#2a5a6a" />
    {Array.from({length: 8}, (_, i) => <line key={i} x1={-260 + i * 66} y1={-410} x2={-260 + i * 66} y2={-330} stroke="#2a5a6a" strokeWidth={14} />)}
    <rect x={-260} y={-330} width={520} height={330} fill="rgba(255,170,80,0.35)" />
    <g transform="translate(150 0)">
      <circle cx={0} cy={-150} r={190} fill="rgba(255,120,40,0.18)" />
      <path d="M-110 0 Q-130 -190 -60 -230 L60 -230 Q130 -190 110 0 Z" fill="#8a5a3a" stroke="#4a2a1a" strokeWidth={6} />
      <ellipse cx={0} cy={-230} rx={60} ry={16} fill="#ff7a2a" />
      <ellipse cx={0} cy={-232} rx={36} ry={9} fill="#ffd27a" opacity={0.8 + 0.2 * Math.sin(f / 2)} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-20 + i * 20} -250 q${-14 + 10 * Math.sin(f / 7 + i)} -40 0 -80 q14 -40 0 -80`} stroke="rgba(255,255,255,0.25)" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />)}
    </g>
    <rect x={-250} y={-90} width={200} height={20} fill="#5a3a20" />
    {[-210, -150, -90].map((cx) => (
      <g key={cx}>
        <ellipse cx={cx} cy={-98} rx={26} ry={9} fill="#c98f48" />
        <ellipse cx={cx} cy={-100} rx={18} ry={5} fill="#e0aa60" />
      </g>
    ))}
  </g>
);

/** 坊格子平面图（12×9 = 108 坊）；cell(i) 返回 [填充, 亮度0–1]；labels 在格子上写字 */
export const CityPlan: React.FC<{f: number; x0?: number; y0?: number; cw?: number; ch?: number; gap?: number; cell?: (r: number, c: number) => {fill?: string; glow?: number; stroke?: string}; labels?: {r: number; c: number; text: string; color?: string}[]; street?: string}> = ({
  f, x0 = 440, y0 = 330, cw = 96, ch = 62, gap = 16, cell, labels = [], street = '#0d0a08',
}) => {
  const cols = 12, rows = 9;
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (cw + gap), y = y0 + r * (ch + gap);
      const o = cell?.(r, c) ?? {};
      const g = o.glow ?? 0.6;
      out.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width={cw} height={ch} fill={o.fill ?? '#241b14'} stroke={o.stroke ?? 'rgba(239,230,214,0.35)'} strokeWidth={2} />
          {g > 0 && <circle cx={x + cw * (0.3 + 0.4 * rand(r * 31 + c))} cy={y + ch * (0.3 + 0.4 * rand(r * 17 + c))} r={18 + 30 * Math.max(0, g - 1)} fill="rgba(255,200,110,0.55)" opacity={Math.min(1, g) * (0.7 + 0.3 * Math.sin(f / 6 + r * 31 + c))} />}
        </g>,
      );
    }
  return (
    <g>
      <rect x={x0 - 30} y={y0 - 30} width={cols * (cw + gap) - gap + 60} height={rows * (ch + gap) - gap + 60} fill={street} stroke="rgba(239,230,214,0.5)" strokeWidth={4} />
      {out}
      {labels.map((l, i) => (
        <text key={i} x={x0 + l.c * (cw + gap) + cw / 2} y={y0 + l.r * (ch + gap) + ch / 2 + 12} textAnchor="middle" fontFamily={LF.sans} fontSize={30} fontWeight={900} fill={l.color ?? '#fff2d0'} stroke="#000" strokeWidth={5} paintOrder="stroke">{l.text}</text>
      ))}
    </g>
  );
};
export const cellXY = (r: number, c: number, x0 = 440, y0 = 330, cw = 96, ch = 62, gap = 16): P => [x0 + c * (cw + gap) + cw / 2, y0 + r * (ch + gap) + ch / 2];

/** 驴 / 马（侧面），walk 时四腿交替；back() 给骑手坐的位置 */
export const mountBack = (x: number, y: number, s: number, kind: 'donkey' | 'horse'): P => [x, y - (kind === 'horse' ? 300 : 230) * s];
export const Mount: React.FC<{f: number; x: number; y: number; s?: number; facing?: 1 | -1; kind: 'donkey' | 'horse'; walk?: number; color?: string; grin?: boolean; lookBack?: boolean}> = ({f, x, y, s = 1, facing = 1, kind, walk = 0, color, grin, lookBack}) => {
  const H = kind === 'horse';
  const col = color ?? (H ? '#ece6da' : '#7d7468');
  const dark = H ? '#c8c0b0' : '#5e564c';
  const bodyY = H ? -250 : -190;
  const legL = H ? 200 : 150;
  const ph = f * 0.35;
  const leg = (lx: number, k: number, d: boolean) => {
    const a = walk ? Math.sin(ph + k * Math.PI) * 0.35 * walk : 0;
    const kx = lx + Math.sin(a) * legL * 0.5;
    const ky = bodyY + 30 + legL * 0.5;
    const fx = kx + Math.sin(a * 1.4) * legL * 0.5;
    return <path d={`M${lx} ${bodyY + 30} L${kx} ${ky} L${fx} ${-6}`} stroke={d ? dark : col} strokeWidth={H ? 24 : 20} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  };
  const neckX = H ? 120 : 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${facing * s} ${s})`}>
      <ellipse cx={0} cy={-4} rx={H ? 170 : 130} ry={12} fill="rgba(0,0,0,0.35)" />
      {leg(-90, 1, true)}
      {leg(80, 0, true)}
      <ellipse cx={0} cy={bodyY} rx={H ? 150 : 115} ry={H ? 62 : 52} fill={col} />
      <path d={`M${-(H ? 140 : 108)} ${bodyY - 10} q-40 30 -30 ${H ? 120 : 80}`} stroke={dark} strokeWidth={H ? 16 : 8} fill="none" strokeLinecap="round" />
      {leg(-80, 0, false)}
      {leg(90, 1, false)}
      {/* 脖子 + 头 */}
      <g transform={lookBack ? `translate(${neckX} ${bodyY - 30}) scale(-1 1) translate(${-neckX} ${-(bodyY - 30)})` : undefined}>
        <path d={`M${neckX - 40} ${bodyY - 20} L${neckX + 20} ${bodyY - (H ? 140 : 110)} L${neckX + 60} ${bodyY - (H ? 120 : 90)} L${neckX + 30} ${bodyY + 20} Z`} fill={col} />
        <path d={`M${neckX + 10} ${bodyY - (H ? 150 : 115)} L${neckX + 100} ${bodyY - (H ? 90 : 60)} Q${neckX + 110} ${bodyY - (H ? 70 : 44)} ${neckX + 90} ${bodyY - (H ? 64 : 40)} L${neckX + 30} ${bodyY - (H ? 90 : 70)} Z`} fill={col} stroke={dark} strokeWidth={3} />
        <circle cx={neckX + 40} cy={bodyY - (H ? 128 : 96)} r={5} fill="#1a1410" />
        {H ? <path d={`M${neckX + 10} ${bodyY - 150} l-6 -30 l20 20 Z`} fill={col} /> : (
          <>
            <path d={`M${neckX + 14} ${bodyY - 112} q-6 -70 8 -80 q8 30 4 82 Z`} fill={col} stroke={dark} strokeWidth={3} />
            <path d={`M${neckX + 30} ${bodyY - 106} q6 -66 22 -72 q2 34 -10 76 Z`} fill={col} stroke={dark} strokeWidth={3} />
          </>
        )}
        {H && <path d={`M${neckX - 20} ${bodyY - 40} Q${neckX - 10} ${bodyY - 130} ${neckX + 20} ${bodyY - 145}`} stroke="#bdb5a5" strokeWidth={12} fill="none" />}
        {grin && <path d={`M${neckX + 70} ${bodyY - 52} q10 6 22 -2`} stroke="#fff" strokeWidth={5} fill="none" />}
      </g>
      {/* 鞍 */}
      <path d={`M-40 ${bodyY - 54} Q0 ${bodyY - 70} 40 ${bodyY - 54} L40 ${bodyY - 30} L-40 ${bodyY - 30} Z`} fill={H ? '#7a2a1a' : '#5a3a20'} />
    </g>
  );
};

/** 荒草（grow 0–1 长出来） */
export const Grass: React.FC<{f: number; x0: number; x1: number; y: number; grow?: number; h?: number}> = ({f, x0, x1, y, grow = 1, h = 130}) => (
  <g>
    {Array.from({length: Math.floor((x1 - x0) / 14)}, (_, i) => {
      const x = x0 + i * 14 + rand(i) * 10;
      const hh = h * (0.5 + 0.6 * rand(i + 3)) * grow;
      const sw = Math.sin(f / 12 + i) * 8;
      return <path key={i} d={`M${x} ${y} q${sw / 2 + 4} ${-hh / 2} ${sw + 10 * (rand(i + 7) - 0.5)} ${-hh}`} stroke={i % 3 ? '#4a5a2a' : '#6a7a3a'} strokeWidth={5} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

/** 狐狸尾巴：从墙根一闪而过（p 0–1） */
export const FoxTail: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) =>
  p <= 0 || p >= 1 ? null : (
    <g transform={`translate(${x + 300 * p} ${y})`} opacity={Math.sin(p * Math.PI)}>
      <path d="M0 0 Q-60 -50 -130 -20 Q-90 -10 -60 10 Q-30 14 0 0 Z" fill="#d9772e" />
      <path d="M-130 -20 Q-150 -16 -152 -6 Q-130 -2 -112 -8 Z" fill="#f3ead8" />
    </g>
  );

/** 金榜：一张贴在墙上的榜（names 每列一个名字） */
export const Bulletin: React.FC<{x: number; y: number; w?: number; h?: number; names: string[]; title?: string; s?: number; rot?: number}> = ({x, y, w = 300, h = 420, names, title = '进士榜', s = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#d8c48a" stroke="#8a6a2a" strokeWidth={6} />
    <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={60} fill="#a8261b" />
    <text x={0} y={-h / 2 + 58} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={38} fill="#fff2d0">{title}</text>
    {names.map((n, i) => (
      <text key={i} x={w / 2 - 40 - i * 46} y={-h / 2 + 110} fontFamily={LF.serif} fontSize={32} fill="#2a1a0a" style={{writingMode: 'vertical-rl'}}>{n}</text>
    ))}
  </g>
);
