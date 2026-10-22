import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {Flash} from '../../library/lamplight/stage';
import {LF} from '../../library/lamplight/theme';
import {headOf, Sweat} from '../ep53-changan-curfew/Kit';
import {P, Rig, RigProps, ridePose, standPose, walkPose} from '../ep53-changan-curfew/Rig';
import {Mount, mountBack} from '../ep53-changan-curfew/Sets';
import {Drape, Label3, Map3D, Pin3, project, type Cam3, type Px} from './Map3D';
import {lerp, Svg} from './Opening';
import {Dust} from './Props';
import {CAST, NameTag, Vignette} from './Sets54';
import {B, fbt, S23, S24, S25, S26, S27, S28, SHOT} from './timeline';

type Pose = Partial<RigProps> & {hip: P; neck: P};
const R = (look: Partial<RigProps>, pose: Pose, s: number, more: Partial<RigProps> = {}, children?: React.ReactNode) => (
  <Rig {...(look as RigProps)} {...(pose as RigProps)} s={s} {...more}>
    {children}
  </Rig>
);
const lean = (hip: P, a: number, s: number, len = 200): P => [hip[0] + Math.sin((a * Math.PI) / 180) * len * s, hip[1] - Math.cos((a * Math.PI) / 180) * len * s];
const bt = (b: number) => b * B;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const ridge = (y: number, amp: number, seed: number, x0 = -200, x1 = 2200, step = 30) => {
  let d = `M${x0} 1080 L${x0} ${y}`;
  for (let x = x0; x <= x1; x += step) d += ` L${x} ${(y - amp * (0.5 + 0.3 * Math.sin(x / 210 + seed) + 0.2 * Math.sin(x / 77 + seed * 3))).toFixed(1)}`;
  return d + ` L${x1} 1080 Z`;
};
const CHANGAN: [number, number] = [108.94, 34.27];
const LUOYANG: [number, number] = [112.45, 34.62];

/** 老人、百姓、唐朝皇帝、府兵 */
const OLD: Partial<RigProps> = {robe: '#8a7a62', robeD: '#665a46', pants: '#4a4034', hem: 110, hat: 'none', hair: '#e8e4dc', beard: true, beardC: '#eeeae4'};
const GIRL: Partial<RigProps> = {robe: '#c86a4a', robeD: '#9a4a34', pants: '#4a3a2a', hem: 70, hat: 'twin'};
const MOM: Partial<RigProps> = {robe: '#6a7a5a', robeD: '#4a5a40', hat: 'bun', skirt: true, hem: 200};
const PORTER: Partial<RigProps> = {robe: '#7a5a3a', robeD: '#5a4028', pants: '#3a2e22', hem: 60, hat: 'none', hair: '#2a2018'};
const GUARD: Partial<RigProps> = {robe: '#7a2a1e', robeD: '#561c14', pants: '#2a2020', hem: 80, hat: 'none', hair: '#1a1410'};
const TANG: Partial<RigProps> = {robe: '#e8b830', robeD: '#b88a18', pants: '#4a3a20', hem: 120};

/** 头盔 + 甲片（画在骨骼人上） */
const Armor: React.FC<{hip: P; neck: P; s: number}> = ({hip, neck, s}) => {
  const h = headOf(hip, neck, s);
  const mx = (hip[0] + neck[0]) / 2, my = (hip[1] + neck[1]) / 2;
  const ang = (Math.atan2(neck[0] - hip[0], hip[1] - neck[1]) * 180) / Math.PI;
  return (
    <g>
      <g transform={`translate(${mx} ${my}) rotate(${ang})`}>
        <rect x={-40 * s} y={-80 * s} width={80 * s} height={130 * s} rx={10 * s} fill="#5a5048" stroke="#2a221c" strokeWidth={3 * s} />
        {Array.from({length: 5}, (_, i) => <path key={i} d={`M${-38 * s} ${(-62 + i * 24) * s} q${38 * s} ${12 * s} ${76 * s} 0`} stroke="#9a8a6a" strokeWidth={3 * s} fill="none" />)}
        <circle cx={0} cy={-50 * s} r={12 * s} fill="#c99a3a" />
      </g>
      <path d={`M${h[0] - 46 * s} ${h[1] - 4 * s} Q${h[0]} ${h[1] - 80 * s} ${h[0] + 46 * s} ${h[1] - 4 * s} Z`} fill="#6a6058" stroke="#2a221c" strokeWidth={3 * s} />
      <path d={`M${h[0]} ${h[1] - 54 * s} q${-6 * s} ${-30 * s} ${-26 * s} ${-44 * s}`} stroke="#c0281c" strokeWidth={10 * s} strokeLinecap="round" fill="none" />
    </g>
  );
};
const Spear: React.FC<{at: P; s: number; tilt?: number}> = ({at, s, tilt = 0}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${tilt})`}>
    <line x1={0} y1={160 * s} x2={0} y2={-300 * s} stroke="#5a3a1a" strokeWidth={8 * s} />
    <path d={`M0 ${-370 * s} L${12 * s} ${-300 * s} L${-12 * s} ${-300 * s} Z`} fill="#d8d8d0" stroke="#3a3a3a" strokeWidth={2 * s} />
    <path d={`M${-10 * s} ${-296 * s} q${10 * s} ${30 * s} ${20 * s} 0`} fill="#c0281c" />
  </g>
);

/** 城门 + 城楼 + 匾额 */
const CityGate: React.FC<{x: number; ground: number; w: number; name: string; s?: number; wall?: string}> = ({x, ground, w, name, s = 1, wall = '#8a6a4a'}) => {
  const wh = 280 * s, tw = 360 * s;
  const top = ground - wh;
  return (
    <g>
      <rect x={x - w / 2} y={top} width={w} height={wh} fill={wall} stroke="#3a2a1a" strokeWidth={4} />
      {Array.from({length: Math.floor(wh / (34 * s))}, (_, r) => <line key={r} x1={x - w / 2} y1={top + (r + 1) * 34 * s} x2={x + w / 2} y2={top + (r + 1) * 34 * s} stroke="rgba(0,0,0,0.14)" strokeWidth={2} />)}
      {Array.from({length: Math.floor(w / (40 * s))}, (_, i) => <rect key={i} x={x - w / 2 + i * 40 * s + 6 * s} y={top - 22 * s} width={26 * s} height={22 * s} fill={wall} stroke="#3a2a1a" strokeWidth={2} />)}
      <path d={`M${x - 70 * s} ${ground} L${x - 70 * s} ${ground - 130 * s} Q${x} ${ground - 200 * s} ${x + 70 * s} ${ground - 130 * s} L${x + 70 * s} ${ground} Z`} fill="#1a120c" stroke="#3a2a1a" strokeWidth={4} />
      {/* 城楼 */}
      <rect x={x - tw / 2} y={top - 30 * s} width={tw} height={30 * s} fill="#6a5040" />
      {[-0.42, -0.14, 0.14, 0.42].map((k) => <rect key={k} x={x + k * tw - 8 * s} y={top - 130 * s} width={16 * s} height={100 * s} fill="#9a2a1e" />)}
      <rect x={x - tw * 0.46} y={top - 130 * s} width={tw * 0.92} height={100 * s} fill="rgba(60,20,10,0.55)" />
      <path d={`M${x - tw * 0.62} ${top - 120 * s} Q${x - tw * 0.4} ${top - 140 * s} ${x - tw * 0.36} ${top - 190 * s} L${x + tw * 0.36} ${top - 190 * s} Q${x + tw * 0.4} ${top - 140 * s} ${x + tw * 0.62} ${top - 120 * s} L${x + tw * 0.5} ${top - 140 * s} L${x - tw * 0.5} ${top - 140 * s} Z`} fill="#2e2a2a" stroke="#141010" strokeWidth={3} />
      <rect x={x - tw * 0.36} y={top - 200 * s} width={tw * 0.72} height={14 * s} fill="#3a3434" />
      <rect x={x - 70 * s} y={top - 112 * s} width={140 * s} height={56 * s} fill="#1e2a4a" stroke="#c99a3a" strokeWidth={4} />
      <text x={x} y={top - 70 * s} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40 * s} fill="#ffe0a0">{name}</text>
    </g>
  );
};

/** 飘动的旗：竿 + 旗面 + 字 */
const Flag: React.FC<{x: number; y: number; h: number; t: number; color: string; text: string; seed: number; s?: number}> = ({x, y, h, t, color, text, seed, s = 1}) => {
  const w = 110 * s, fh = 130 * s;
  const wv = (k: number) => Math.sin(t / 5 + seed + k * 2.2) * 10 * s * k;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - h} stroke="#3a2414" strokeWidth={6 * s} />
      <circle cx={x} cy={y - h - 6 * s} r={7 * s} fill="#c99a3a" />
      <path d={`M${x} ${y - h} C${x + w * 0.35} ${y - h + wv(0.4)} ${x + w * 0.7} ${y - h - wv(0.7)} ${x + w} ${y - h + wv(1)} L${x + w + wv(1) * 0.3} ${y - h + fh + wv(1)} C${x + w * 0.7} ${y - h + fh - wv(0.7)} ${x + w * 0.35} ${y - h + fh + wv(0.4)} ${x} ${y - h + fh} Z`} fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
      <path d={`M${x} ${y - h + fh} l${w * 0.2} ${16 * s} l${w * 0.2} ${-16 * s} l${w * 0.2} ${16 * s} l${w * 0.2} ${-16 * s} l${w * 0.2} ${16 * s}`} fill="none" stroke="#c99a3a" strokeWidth={4 * s} />
      <text x={x + w / 2} y={y - h + fh / 2 + (text.length > 1 ? 0 : 16) * s + wv(0.5) * 0.5} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={(text.length > 1 ? 40 : 56) * s} fill="#ffeacc" writingMode={text.length > 1 ? 'tb' : undefined}>{text}</text>
    </g>
  );
};

/* ═════════ 第 23 屏：关中田地龟裂，古渠干涸塌陷，枯麦低垂 ═════════ */
const Wheat: React.FC<{x: number; y: number; h: number; sway: number; seed: number}> = ({x, y, h, sway, seed}) => {
  const a = sway + (rnd(seed) - 0.5) * 10;
  const tip: P = [x + Math.sin((a * Math.PI) / 180) * h * 0.8 + h * 0.18, y - h * 0.85];
  return (
    <g>
      <path d={`M${x} ${y} Q${x + h * 0.06} ${y - h * 0.6} ${tip[0]} ${tip[1]}`} stroke="#b8904a" strokeWidth={4} fill="none" />
      <path d={`M${x + 2} ${y - h * 0.3} q${-26} ${-10} ${-34} ${8}`} stroke="#a8803a" strokeWidth={3} fill="none" />
      <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${110 + a * 1.4})`}>
        <ellipse cx={0} cy={18} rx={7} ry={20} fill="#9a7a3a" />
        {[0, 1, 2, 3].map((k) => <line key={k} x1={-4} y1={6 + k * 9} x2={-14} y2={-2 + k * 9} stroke="#c8a860" strokeWidth={2} />)}
      </g>
    </g>
  );
};
const Sc23: React.FC<{t: number}> = ({t}) => {
  const k = clamp01(t / bt(8));
  const gust = clamp01((t - bt(S23.gust)) / 14);
  const gustK = Math.sin(Math.PI * clamp01((t - bt(S23.gust)) / bt(2.6)));
  const crack = easeOut(clamp01((t - bt(S23.crack)) / bt(2)));
  const sway = Math.sin(t / 10) * 4 + gustK * 16;
  const cracks: {pts: P[]; w: number; late: boolean}[] = [];
  for (let i = 0; i < 70; i++) {
    const side = i % 2;
    let x = side ? 1180 + rnd(i) * 760 : rnd(i) * 520;
    let y = 760 + rnd(i + 99) * 320;
    const pts: P[] = [[x, y]];
    for (let j = 0; j < 4; j++) {
      x += (rnd(i * 7 + j) - 0.5) * 160 * (0.5 + (y - 700) / 400);
      y += (rnd(i * 11 + j) - 0.45) * 50;
      pts.push([x, y]);
    }
    cracks.push({pts, w: 1.5 + ((y - 700) / 380) * 4, late: i % 3 === 0});
  }
  const lenOf = (p: P[]) => p.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
  const crowFly = clamp01((t - bt(S23.gust) + 4) / 30);
  const weedX = lerp(-120, 2100, clamp01((t - bt(S23.gust) + 6) / bt(3.2)));
  return (
    <AbsoluteFill style={{transform: `translateX(${-50 * easeInOut(k)}px) scale(${1.04 + 0.05 * k})`, transformOrigin: '900px 700px'}}>
      <Svg>
        <defs>
          <linearGradient id="s23sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b88a50" />
            <stop offset="0.7" stopColor="#ecc888" />
            <stop offset="1" stopColor="#f4dca4" />
          </linearGradient>
          <linearGradient id="s23gnd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b08848" />
            <stop offset="1" stopColor="#7a5628" />
          </linearGradient>
          <linearGradient id="s23bed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a5a30" />
            <stop offset="1" stopColor="#5a3e1e" />
          </linearGradient>
          <radialGradient id="s23sun">
            <stop offset="0" stopColor="rgba(255,250,220,1)" />
            <stop offset="0.25" stopColor="rgba(255,236,170,0.9)" />
            <stop offset="1" stopColor="rgba(255,220,140,0)" />
          </radialGradient>
        </defs>
        <rect width={2000} height={1080} fill="url(#s23sky)" />
        <circle cx={1480} cy={230} r={240 + 8 * Math.sin(t / 6)} fill="url(#s23sun)" />
        <circle cx={1480} cy={230} r={62} fill="#fff6d8" />
        <path d={ridge(560, 90, 1)} fill="#c09a62" opacity={0.7} />
        <path d={ridge(610, 70, 4)} fill="#a8804a" />
        <path d={ridge(660, 50, 7)} fill="#94703e" />
        <rect x={-100} y={650} width={2200} height={430} fill="url(#s23gnd)" />
        {/* 远处荒废的田埂 */}
        {Array.from({length: 7}, (_, i) => <line key={i} x1={-100} y1={672 + i * i * 4} x2={2100} y2={668 + i * i * 4.2} stroke="rgba(80,50,20,0.25)" strokeWidth={2 + i * 0.4} />)}
        {/* 干涸的古渠：两岸塌陷 */}
        <path d="M1010 662 L1110 662 L1340 1080 L300 1080 Z" fill="url(#s23bed)" />
        <path d="M1010 662 L960 700 L900 730 L840 790 L760 840 L700 900 L600 960 L480 1030 L300 1080" stroke="#4a3018" strokeWidth={6} fill="none" />
        <path d="M1110 662 L1140 720 L1170 780 L1200 850 L1250 930 L1300 1010 L1340 1080" stroke="#4a3018" strokeWidth={6} fill="none" />
        {[[860, 770, 70], [700, 880, 90], [1180, 820, 60], [1240, 940, 80], [520, 1000, 100], [980, 720, 40]].map(([x, y, r], i) => (
          <path key={i} d={`M${x - r} ${y} L${x - r * 0.4} ${y - r * 0.5} L${x + r * 0.3} ${y - r * 0.35} L${x + r} ${y + r * 0.1} L${x + r * 0.5} ${y + r * 0.45} L${x - r * 0.6} ${y + r * 0.4} Z`} fill={i % 2 ? '#8a6434' : '#9a7440'} stroke="#4a3018" strokeWidth={3} />
        ))}
        {/* 渠底龟裂 */}
        {Array.from({length: 26}, (_, i) => {
          const y = 700 + rnd(i + 300) * 370;
          const half = lerp(60, 480, (y - 662) / 418);
          const cx = lerp(1060, 820, (y - 662) / 418);
          const x = cx + (rnd(i + 400) - 0.5) * half * 1.6;
          return <path key={i} d={`M${x} ${y} l${(rnd(i) - 0.5) * 80} ${rnd(i + 1) * 20} l${(rnd(i + 2) - 0.5) * 70} ${rnd(i + 3) * 24}`} stroke="#3a2410" strokeWidth={2 + (y - 662) / 140} fill="none" />;
        })}
        {/* 倒塌的水闸 */}
        <g>
          <rect x={1000} y={640} width={16} height={110} fill="#5a3a1a" />
          <rect x={1122} y={640} width={16} height={110} fill="#5a3a1a" transform="rotate(8 1130 750)" />
          <rect x={1000} y={700} width={150} height={20} fill="#6a4a24" transform="rotate(18 1010 710)" />
        </g>
        {/* 坏掉的筒车 */}
        <g transform="translate(860 830) rotate(-14)">
          <circle cx={0} cy={0} r={120} fill="none" stroke="#5a3a1a" strokeWidth={14} strokeDasharray="560 80 200 1000" />
          {Array.from({length: 8}, (_, i) => (i === 3 ? null : <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 4) * 118} y2={Math.sin((i * Math.PI) / 4) * 118} stroke="#6a4a24" strokeWidth={8} />))}
          <circle cx={0} cy={0} r={18} fill="#4a2a10" />
          {Array.from({length: 6}, (_, i) => <rect key={i} x={Math.cos((i * Math.PI) / 3) * 120 - 10} y={Math.sin((i * Math.PI) / 3) * 120 - 14} width={20} height={28} fill="#7a5a34" />)}
        </g>
        <line x1={760} y1={960} x2={840} y2={830} stroke="#5a3a1a" strokeWidth={14} />
        <line x1={960} y1={940} x2={880} y2={830} stroke="#5a3a1a" strokeWidth={14} />
        {/* 田里龟裂（一部分在「咔」一声后裂开） */}
        {cracks.map((c, i) => {
          const L = lenOf(c.pts);
          const p = c.late ? crack : 1;
          return p <= 0 ? null : <polyline key={i} points={c.pts.map((q) => q.join(',')).join(' ')} stroke="#4a2c12" strokeWidth={c.w} fill="none" strokeLinejoin="round" strokeDasharray={`${L * p} ${L}`} />;
        })}
        {/* 枯树 + 乌鸦 */}
        <path d="M1660 700 L1668 560 L1630 470 M1668 560 L1720 480 L1760 460 M1690 520 L1650 440" stroke="#3a2614" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M1652 700 L1680 700 L1672 600 Z" fill="#3a2614" />
        <g transform={`translate(${lerp(1724, 1980, crowFly)} ${lerp(470, 260, crowFly)})`}>
          <ellipse cx={0} cy={0} rx={16} ry={10} fill="#1a1410" />
          <circle cx={13} cy={-8} r={7} fill="#1a1410" />
          <path d={crowFly > 0 ? `M-4 -4 L-26 ${-22 * Math.sin(t / 1.6)} M2 -4 L18 ${-22 * Math.sin(t / 1.6 + 1)}` : 'M-8 -2 L-24 6'} stroke="#1a1410" strokeWidth={6} strokeLinecap="round" />
        </g>
        {/* 枯麦 */}
        {Array.from({length: 22}, (_, i) => <Wheat key={i} x={30 + i * 21 + rnd(i) * 14} y={1060 - rnd(i + 5) * 70} h={130 + rnd(i + 9) * 70} sway={sway} seed={i} />)}
        {Array.from({length: 16}, (_, i) => <Wheat key={`r${i}`} x={1560 + i * 24 + rnd(i + 50) * 14} y={1070 - rnd(i + 55) * 80} h={120 + rnd(i + 59) * 60} sway={sway} seed={i + 50} />)}
        {/* 风滚草 + 风沙 */}
        <g transform={`translate(${weedX} ${1000 - Math.abs(Math.sin(t / 4)) * 30}) rotate(${t * 9})`}>
          {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={0} cy={0} rx={40} ry={14} transform={`rotate(${i * 20})`} fill="none" stroke="#8a6a3a" strokeWidth={3} />)}
        </g>
        {Array.from({length: 14}, (_, i) => {
          const x = ((t * (8 + 14 * gust) + rnd(i) * 2200) % 2400) - 200;
          const y = 700 + rnd(i + 20) * 360;
          return <path key={i} d={`M${x} ${y} q60 -8 140 0`} stroke="rgba(240,220,170,0.5)" strokeWidth={3} fill="none" opacity={0.25 + 0.6 * gustK} />;
        })}
        <rect width={2000} height={1080} fill="rgba(230,190,120,0.1)" opacity={gustK} />
        <Vignette k={0.55} />
      </Svg>
    </AbsoluteFill>
  );
};

/* ═════════ 第 24 屏：隋文帝率百姓去洛阳就食，勒马给老人让路 ═════════ */
const Sc24: React.FC<{t: number}> = ({t}) => {
  const rein = bt(S24.rein);
  const v = 2.4;
  const camX = t < rein ? v * t : v * rein + v * 8 * (1 - Math.exp(-(t - rein) / 8));
  const moving = t < rein + 6;
  const back = clamp01((t - rein) / 14);
  const ms = 0.8;
  const hx = 900 - 40 * easeOut(back);
  const bk = mountBack(hx, 960, ms, 'horse');
  const rs = 0.66;
  const rp = ridePose(bk, rs, 1, moving ? Math.sin(t / 3) * 3 : 0);
  const wh = headOf(rp.hip, rp.neck, rs);
  const gesture = easeOutBack(clamp01((t - rein - 6) / 12));
  const wNeck: P = lean(rp.hip, lerp(4, -6, back), rs);
  const pullHand: P = [lerp(rp.handN[0], rp.hip[0] + 40 * rs, back), lerp(rp.handN[1], rp.hip[1] - 70 * rs, back)];
  const openHand: P = [lerp(rp.handF[0], wNeck[0] + 150 * rs, gesture), lerp(rp.handF[1], wNeck[1] + 40 * rs, gesture)];
  // 前排百姓：老人（被扶着的孙女）在马前慢慢穿过
  const oldX = 1260 + (1.0 - (t < rein ? v : 0)) * Math.min(t, rein) + (t > rein ? 1.0 * (t - rein) - (camX - v * rein) : 0);
  const bow = clamp01((t - rein - 20) / 14) * (1 - clamp01((t - rein - 50) / 14));
  const oldS = 0.7;
  const op = walkPose(oldX, 1050, (t / 22) % 1, oldS, 1);
  const oNeck: P = lean(op.hip, 26 + 16 * bow, oldS);
  const girlS = 0.46;
  const gp = walkPose(oldX + 110, 1050, (t / 14 + 0.3) % 1, girlS, 1);
  const momX = 360 + (2.2 - (t < rein ? v : 0)) * Math.min(t, rein) + (t > rein ? 2.2 * (t - rein) - (camX - v * rein) : 0);
  const mp = walkPose(momX, 1050, (t / 18) % 1, 0.7, 1);
  const porterX = momX - 300;
  const pp = walkPose(porterX, 1050, (t / 16 + 0.5) % 1, 0.72, 1);
  const pNeck: P = lean(pp.hip, 12, 0.72);
  const ph = headOf(pp.hip, pNeck, 0.72);
  return (
    <AbsoluteFill style={{transform: `scale(${1.03 + 0.04 * clamp01(t / bt(8))})`, transformOrigin: '960px 760px'}}>
      <Svg>
        <defs>
          <linearGradient id="s24sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c8925a" />
            <stop offset="0.7" stopColor="#f0cc90" />
            <stop offset="1" stopColor="#f6e0b0" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s24sky)" />
        <circle cx={420} cy={260} r={70} fill="#fff0c8" opacity={0.8} />
        <g transform={`translate(${-camX * 0.15} 0)`}><path d={ridge(600, 120, 2, -200, 2600)} fill="#c4986a" opacity={0.75} /></g>
        <g transform={`translate(${-camX * 0.3} 0)`}><path d={ridge(680, 90, 5, -200, 2600)} fill="#a87c4c" /></g>
        <rect x={0} y={700} width={1920} height={380} fill="#b48c54" />
        {/* 路旁枯树、里程石（往后滑） */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = ((i * 520 - camX * 0.7) % 3120 + 3120) % 3120 - 300;
          return <path key={i} d={`M${x} 820 L${x + 6} 700 L${x - 30} 640 M${x + 6} 700 L${x + 40} 650`} stroke="#5a3e22" strokeWidth={8} fill="none" strokeLinecap="round" />;
        })}
        <g transform={`translate(${1500 - camX * 0.9} 0)`}>
          <rect x={0} y={790} width={60} height={110} rx={10} fill="#8a8274" stroke="#4a4438" strokeWidth={3} />
          <text x={30} y={810} fontFamily={LF.serif} fontWeight={900} fontSize={30} fill="#3a2a1a" writingMode="tb">洛阳</text>
        </g>
        <path d="M0 880 L1920 860 L1920 1080 L0 1080 Z" fill="#c8a066" />
        {Array.from({length: 18}, (_, i) => {
          const x = ((i * 140 - camX) % 2520 + 2520) % 2520 - 300;
          return <ellipse key={i} cx={x} cy={940 + (i % 3) * 40} rx={30} ry={6} fill="rgba(110,80,40,0.25)" />;
        })}
        {/* 后排：仪仗卫士举「隋」旗 */}
        {[0, 1, 2, 3].map((i) => {
          const x = 240 + i * 170;
          const s = 0.5;
          const p = moving ? walkPose(x, 900, (t / 16 + i * 0.25) % 1, s, 1) : standPose(x, 900, s, 1);
          return (
            <g key={i}>
              {R(GUARD, {...p, handN: [p.neck[0] + 40 * s, p.neck[1] + 40 * s]}, s, {face: 'stern'})}
              <Armor hip={p.hip} neck={p.neck} s={s} />
              {i % 2 === 0 ? <Flag x={p.neck[0] + 40 * s} y={p.neck[1] + 120 * s} h={330 * s} t={t + i * 7} color="#a8281e" text="隋" seed={i} s={0.62} /> : <Spear at={[p.neck[0] + 40 * s, p.neck[1] + 40 * s]} s={s} />}
            </g>
          );
        })}
        {/* 隋文帝骑白马 */}
        <Mount f={moving ? t : rein} x={hx} y={960} s={ms} kind="horse" facing={1} walk={moving ? 1 : 0} color="#f0ece4" />
        {R(CAST.wen, {...rp, neck: wNeck, handN: pullHand, handF: openHand}, rs, {face: gesture > 0.3 ? 'smile' : 'calm', headTilt: -6 * back})}
        <path d={`M${pullHand[0]} ${pullHand[1]} L${hx + 220 * ms} ${960 - 330 * ms}`} stroke="#3a2414" strokeWidth={3} />
        <NameTag x={wh[0]} y={wh[1] - 80} text="隋文帝" size={30} />
        {moving && <Dust f={t} at={[hx - 80, 960]} since={(t % 20)} n={6} seed={Math.floor(t / 20)} spread={70} />}
        {/* 前排百姓 */}
        <g>
          {/* 挑担的汉子 */}
          {R(PORTER, {...pp, neck: pNeck, handN: [pNeck[0] + 40, pNeck[1] + 10], handF: [pNeck[0] - 30, pNeck[1] + 14]}, 0.72, {face: 'pain'})}
          <line x1={pNeck[0] - 150} y1={pNeck[1] + 4 + Math.sin(t / 3) * 4} x2={pNeck[0] + 150} y2={pNeck[1] - 4 - Math.sin(t / 3) * 4} stroke="#6a4a24" strokeWidth={8} />
          {[-1, 1].map((d) => (
            <g key={d} transform={`translate(${pNeck[0] + d * 140} ${pNeck[1] + 4 - d * 4 + Math.sin(t / 3) * 4 * -d})`}>
              <line x1={-26} y1={0} x2={-30} y2={90} stroke="#3a2a1a" strokeWidth={2} />
              <line x1={26} y1={0} x2={30} y2={90} stroke="#3a2a1a" strokeWidth={2} />
              <path d="M-40 90 L40 90 L32 150 L-32 150 Z" fill="#a8844a" stroke="#5a4020" strokeWidth={3} />
            </g>
          ))}
          <Sweat x={ph[0] - 30} y={ph[1] - 20} s={0.7} />
          {/* 抱孩子的母亲 */}
          {R(MOM, {...mp, handN: [mp.neck[0] + 46, mp.neck[1] + 70], handF: [mp.neck[0] + 30, mp.neck[1] + 90]}, 0.7, {face: 'pain'})}
          <ellipse cx={mp.neck[0] + 40} cy={mp.neck[1] + 70} rx={34} ry={24} fill="#e8dcc0" stroke="#8a7a5a" strokeWidth={3} />
          <circle cx={mp.neck[0] + 58} cy={mp.neck[1] + 58} r={14} fill="#e6c9a0" />
          {/* 拄拐的老人 + 孙女 */}
          {R(OLD, {...op, neck: oNeck, handN: [oNeck[0] + 70, 1050 - 120], handF: [gp.neck[0] - 30, gp.neck[1] + 70]}, oldS, {face: bow > 0.2 ? 'smile' : 'pain'})}
          <line x1={oNeck[0] + 70} y1={1050 - 130} x2={oNeck[0] + 86} y2={1050} stroke="#6a4a24" strokeWidth={7} strokeLinecap="round" />
          {R(GIRL, {...gp, handF: [gp.neck[0] - 40, gp.neck[1] + 70]}, girlS, {face: 'calm', facing: 1})}
        </g>
        {/* 让路时的手势提示 */}
        {gesture > 0.3 && <path d={`M${openHand[0] + 20} ${openHand[1] - 10} q40 -20 80 0`} stroke="#fff4d0" strokeWidth={5} fill="none" strokeLinecap="round" opacity={clamp01(gesture)} markerEnd="" />}
        <Vignette k={0.5} />
      </Svg>
    </AbsoluteFill>
  );
};

/* ═════════ 第 25 屏：唐朝皇帝背空米袋在长安、洛阳之间来回小跑 ═════════ */
const Sc25: React.FC<{t: number}> = ({t}) => {
  const per = bt(3.4);
  const ph = t / per + 0.08;
  const tri = 1 - Math.abs(((ph % 2) + 2) % 2 - 1);
  const dir: 1 | -1 = (((ph % 2) + 2) % 2) < 1 ? 1 : -1;
  const x = lerp(470, 1450, easeInOut(tri));
  const s = 0.74;
  const p = walkPose(x, 1000, (t / 9) % 1, s, dir);
  const neck: P = lean(p.hip, dir * 14, s);
  const h = headOf(p.hip, neck, s);
  const label = clamp01((t - bt(S25.label)) / 10);
  const bob = Math.abs(Math.sin((t / 9) * Math.PI * 2)) * 6;
  const bag: P = [neck[0] - dir * 46 * s, neck[1] + 60 * s];
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s25sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6a8ab0" />
            <stop offset="1" stopColor="#e8d4a8" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s25sky)" />
        {[[300, 200], [1200, 150], [1600, 260]].map(([cx, cy], i) => <ellipse key={i} cx={cx + ((t * 0.4) % 200)} cy={cy} rx={120} ry={30} fill="rgba(255,255,255,0.5)" />)}
        <path d={ridge(640, 110, 3)} fill="#8a9a7a" opacity={0.7} />
        <path d={ridge(720, 70, 6)} fill="#7a7a5a" />
        <rect x={0} y={760} width={1920} height={320} fill="#b89a64" />
        <path d="M0 960 L1920 960 L1920 1060 L0 1060 Z" fill="#cdb07a" />
        <CityGate x={190} ground={980} w={420} name="长安" s={0.82} />
        <CityGate x={1730} ground={980} w={420} name="洛阳" s={0.82} />
        {/* 中间路牌 */}
        <rect x={950} y={850} width={12} height={120} fill="#5a3a1a" />
        <path d="M880 850 L1040 850 L1060 870 L1040 890 L880 890 Z" fill="#d8c08a" stroke="#5a3a1a" strokeWidth={3} />
        <text x={960} y={880} textAnchor="middle" fontFamily={LF.label} fontWeight={900} fontSize={26} fill="#3a2414">八百里</text>
        {/* 脚印尘土 */}
        {Array.from({length: 8}, (_, i) => {
          const age = (t + i * 6) % 48;
          const px = x - dir * age * 3.2;
          return <circle key={i} cx={px} cy={996 - age * 0.4} r={8 + age * 0.4} fill="rgba(200,170,120,0.5)" opacity={1 - age / 48} />;
        })}
        {/* 空米袋（背在身后，瘪的，随步子甩） */}
        <g transform={`translate(${bag[0]} ${bag[1] + bob}) rotate(${dir * (-18 + Math.sin(t / 3) * 12)})`}>
          <path d="M-30 0 Q-44 60 -26 120 Q0 132 26 120 Q40 60 26 0 Q0 -14 -30 0 Z" fill="#d8c8a0" stroke="#7a6a4a" strokeWidth={3} />
          <path d="M-20 30 q20 10 40 0 M-22 70 q22 12 44 0" stroke="#9a8a6a" strokeWidth={2} fill="none" />
          <text x={0} y={90} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={30} fill="#7a5a2a">米</text>
        </g>
        <line x1={neck[0]} y1={neck[1] + 10} x2={bag[0]} y2={bag[1] + bob} stroke="#7a6a4a" strokeWidth={4} />
        {R(TANG, {...p, neck}, s, {face: 'pain', headTilt: dir * 6})}
        <Sweat x={h[0] - dir * 46} y={h[1] - 20} s={0.9} />
        <Sweat x={h[0] - dir * 60} y={h[1] + 10} s={0.6} />
        {Array.from({length: 4}, (_, i) => <line key={i} x1={x - dir * (90 + i * 10)} y1={p.hip[1] - 120 + i * 40} x2={x - dir * (170 + i * 26)} y2={p.hip[1] - 120 + i * 40} stroke="rgba(255,255,255,0.7)" strokeWidth={4} />)}
        <NameTag x={h[0]} y={h[1] - 76} text="唐朝皇帝" size={30} o={1 - label} />
        {label > 0 && (
          <g transform={`translate(${h[0]} ${h[1] - 120}) scale(${lerp(1.6, 1, easeOutBack(label))})`} opacity={Math.min(1, label * 2)}>
            <rect x={-170} y={-50} width={340} height={92} rx={12} fill="#7a1a14" stroke="#ffd070" strokeWidth={5} />
            <text x={0} y={22} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={68} fill="#ffe6a8">逐粮天子</text>
          </g>
        )}
        <Vignette k={0.45} />
      </Svg>
    </AbsoluteFill>
  );
};

/* ═════════ 第 26 屏：地图上长安、洛阳之间一个大问号 ═════════ */
const Sc26: React.FC<{t: number}> = ({t}) => {
  const k = clamp01(t / bt(8));
  const cam: Cam3 = {lon: lerp(110.6, 110.75, k), lat: lerp(34.25, 34.35, k), dist: lerp(680, 600, easeInOut(k)), pitch: 66, yaw: lerp(-8, 6, k)};
  const arrow = easeInOut(clamp01((t - bt(0.3)) / bt(1.2)));
  const q = easeOutBack(clamp01((t - bt(S26.q)) / 12));
  const mid: [number, number] = [(CHANGAN[0] + LUOYANG[0]) / 2, (CHANGAN[1] + LUOYANG[1]) / 2 - 0.1];
  const [mx, my0] = project(cam, mid[0], mid[1], 4);
  const my = Math.max(my0, 700);
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    const [x0, y0] = px(CHANGAN[0], CHANGAN[1]);
    const [x1, y1] = px(LUOYANG[0], LUOYANG[1]);
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 60;
    const pt = (u: number): [number, number] => [(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1];
    g.save();
    g.lineCap = 'round';
    g.setLineDash([20, 14]);
    for (const [c, w] of [['rgba(20,8,4,0.8)', 14], ['#f0e0b0', 7]] as const) {
      g.strokeStyle = c;
      g.lineWidth = w;
      g.beginPath();
      for (let u = 0; u <= arrow + 1e-6; u += 0.02) {
        const [x, y] = pt(Math.min(u, arrow));
        if (u === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    g.restore();
    if (arrow > 0.95) {
      const [ax, ay] = pt(1), [bx, by] = pt(0.94);
      const a = Math.atan2(ay - by, ax - bx);
      g.fillStyle = '#f0e0b0';
      g.beginPath();
      g.moveTo(ax + Math.cos(a) * 10, ay + Math.sin(a) * 10);
      g.lineTo(ax + Math.cos(a + 2.5) * 30, ay + Math.sin(a + 2.5) * 30);
      g.lineTo(ax + Math.cos(a - 2.5) * 30, ay + Math.sin(a - 2.5) * 30);
      g.fill();
    }
  };
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={arrow.toFixed(3)} opacity={0.95} />
        <Pin3 at={CHANGAN} big />
        <Pin3 at={LUOYANG} big />
      </Map3D>
      <Label3 cam={cam} at={CHANGAN} name="长安" side="left" lift={34} size={56} />
      <Label3 cam={cam} at={LUOYANG} name="洛阳" lift={34} size={56} />
      {q > 0 && (
        <>
          <div style={{position: 'absolute', left: mx - 110, top: my - 20, width: 220, height: 50, borderRadius: '50%', background: 'radial-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0))', transform: `scale(${q})`}} />
          <div style={{position: 'absolute', left: mx - 210, top: my - 500, width: 420, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 460, lineHeight: 1, color: '#ffd070', WebkitTextStroke: '10px #2a1206', paintOrder: 'stroke', textShadow: '0 12px 30px rgba(0,0,0,0.6)', transform: `translateY(${(1 - Math.min(1, q)) * -200}px) scale(${q}) rotate(${Math.sin(t / 7) * 6}deg)`, transformOrigin: '50% 100%'}}>？</div>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ═════════ 第 27 屏：「均田制」「府兵制」两张字卡砸在关中地图上 ═════════ */
const GUANZHONG: [number, number][] = [[107.15, 34.36], [107.8, 34.48], [108.6, 34.62], [109.4, 34.78], [110.1, 34.72], [110.35, 34.55], [110.05, 34.36], [109.3, 34.2], [108.5, 34.12], [107.7, 34.16], [107.2, 34.24]];
const FieldIcon: React.FC = () => (
  <svg width={190} height={110} viewBox="0 0 190 110">
    {Array.from({length: 12}, (_, i) => <rect key={i} x={6 + (i % 4) * 45} y={6 + Math.floor(i / 4) * 34} width={41} height={30} fill={['#8aa84a', '#c8b050', '#6a9040', '#b0a048'][(i * 3 + Math.floor(i / 4)) % 4]} stroke="#4a3a1a" strokeWidth={3} />)}
  </svg>
);
const SoldierIcon: React.FC = () => (
  <svg width={190} height={110} viewBox="0 0 190 110">
    {Array.from({length: 5}, (_, i) => (
      <g key={i} transform={`translate(${22 + i * 36} 20)`}>
        <line x1={12} y1={-14} x2={12} y2={88} stroke="#3a2414" strokeWidth={3} />
        <path d="M12 -22 L17 -10 L7 -10 Z" fill="#c8c8c0" />
        <circle cx={0} cy={22} r={9} fill="#2a1e14" />
        <path d="M-9 20 Q0 6 9 20 Z" fill="#6a6058" />
        <path d="M-11 34 L11 34 L13 76 L-13 76 Z" fill="#7a2a1e" />
        <line x1={-6} y1={76} x2={-6} y2={90} stroke="#2a2020" strokeWidth={5} />
        <line x1={6} y1={76} x2={6} y2={90} stroke="#2a2020" strokeWidth={5} />
      </g>
    ))}
  </svg>
);
const Card: React.FC<{cam: Cam3; at: [number, number]; p: number; title: string; icon: React.ReactNode; f: number}> = ({cam, at, p, title, icon, f}) => {
  if (p <= 0) return null;
  const [gx, gy] = project(cam, at[0], at[1], 2);
  const drop = easeIn(clamp01(p * 3));
  const land = clamp01(p * 3 - 1);
  const pole = 150;
  const y0 = gy - pole - (1 - drop) * 500;
  const ring = clamp01(land * 1.6);
  return (
    <>
      {land > 0 && <div style={{position: 'absolute', left: gx - 140 * ring - 20, top: gy - 34 * ring - 6, width: 280 * ring + 40, height: 68 * ring + 12, borderRadius: '50%', border: `${6 * (1 - ring) + 1}px solid rgba(255,230,170,${0.8 * (1 - ring)})`}} />}
      <div style={{position: 'absolute', left: gx - 5, top: y0, width: 10, height: pole + (1 - drop) * 0, background: 'linear-gradient(#6a4a24, #3a2410)', borderRadius: 4, boxShadow: '0 0 6px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', left: gx - 130, top: y0 - 210, width: 260, height: 220, background: '#f2e4c0', border: '6px solid #7a1a14', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.6)', transform: `rotate(${Math.sin(f / 9 + at[0]) * 2 + (1 - land) * -4}deg) scale(${land > 0 && land < 0.3 ? 1 + 0.08 * Math.sin(land * 10) : 1})`, transformOrigin: '50% 100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10}}>
        <div style={{fontFamily: LF.serif, fontWeight: 900, fontSize: 62, color: '#7a1a14', lineHeight: 1.1}}>{title}</div>
        <div style={{marginTop: 8}}>{icon}</div>
      </div>
    </>
  );
};
const Sc27: React.FC<{t: number}> = ({t}) => {
  const k = clamp01(t / bt(8));
  const cam: Cam3 = {lon: lerp(108.75, 108.85, k), lat: lerp(34.62, 34.68, k), dist: lerp(540, 470, easeInOut(k)), pitch: lerp(68, 72, k), yaw: lerp(-4, 4, k)};
  const glow = easeOut(clamp01(t / bt(1.6)));
  const c1 = clamp01((t - bt(S27.card1) + 6) / 24);
  const c2 = clamp01((t - bt(S27.card2) + 6) / 24);
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    g.save();
    g.beginPath();
    GUANZHONG.forEach(([lo, la], i) => {
      const [x, y] = px(lo, la);
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    });
    g.closePath();
    g.fillStyle = `rgba(255,200,90,${0.28 * glow})`;
    g.fill();
    g.setLineDash([16, 10]);
    g.lineWidth = 6;
    g.strokeStyle = `rgba(255,214,120,${0.95 * glow})`;
    g.stroke();
    g.restore();
  };
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={glow.toFixed(2)} opacity={0.95} />
        <Pin3 at={CHANGAN} big />
      </Map3D>
      <Label3 cam={cam} at={CHANGAN} name="长安" lift={30} size={48} />
      <Label3 cam={cam} at={[107.65, 34.55]} name="关中" lift={10} size={80} o={glow} color="#ffd070" />
      <Card cam={cam} at={[108.15, 34.36]} p={c1} title="均田制" icon={<FieldIcon />} f={t} />
      <Card cam={cam} at={[109.65, 34.5]} p={c2} title="府兵制" icon={<SoldierIcon />} f={t} />
      <Flash f={t} at={bt(S27.card1) + 2} dur={5} peak={0.25} />
      <Flash f={t} at={bt(S27.card2) + 2} dur={5} peak={0.25} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 28 屏：长安城头插满关陇贵族的旗，城门口府兵站岗 ═════════ */
const CLANS: [string, string][] = [['宇文', '#3a4a7a'], ['独孤', '#7a2a2a'], ['杨', '#a8281e'], ['李', '#2a5a4a'], ['元', '#6a3a6a'], ['于', '#8a5a1a'], ['赵', '#3a5a7a'], ['长孙', '#5a2a1a']];
const Sc28: React.FC<{t: number}> = ({t}) => {
  const pull = easeInOut(clamp01(t / bt(3.2)));
  const guard = bt(S28.guard);
  const stomp = clamp01((t - guard) / 6);
  const present = easeOutBack(clamp01((t - guard) / 8));
  const sc = lerp(1.5, 1, pull);
  return (
    <AbsoluteFill style={{transform: `scale(${sc})`, transformOrigin: '960px 420px'}}>
      <Svg>
        <defs>
          <linearGradient id="s28sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3a5a" />
            <stop offset="0.6" stopColor="#c87a4a" />
            <stop offset="1" stopColor="#f0b070" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s28sky)" />
        <circle cx={1600} cy={520} r={90} fill="#ffd8a0" opacity={0.8} />
        <path d={ridge(640, 80, 2)} fill="#6a4a4a" opacity={0.6} />
        <rect x={0} y={900} width={1920} height={180} fill="#5a4030" />
        <CityGate x={960} ground={1000} w={2100} name="长安" s={1.3} wall="#7a5a40" />
        {/* 城头一排旗 */}
        {CLANS.map(([n, c], i) => {
          const x = 120 + i * 238 + (i >= 4 ? 120 : -120);
          return <Flag key={n} x={x} y={1000 - 280 * 1.3 - 20} h={220} t={t} color={c} text={n} seed={i * 1.7} s={1.1} />;
        })}
        {/* 城门口府兵 */}
        {[-2, -1, 1, 2].map((d, i) => {
          const s = 0.78;
          const x = 960 + d * 150 + (d > 0 ? 20 : -20);
          const facing: 1 | -1 = d < 0 ? 1 : -1;
          const p = standPose(x, 1020 - (stomp > 0 && stomp < 0.5 ? 8 : 0), s, facing);
          const hand: P = [p.neck[0] + facing * 50 * s, p.neck[1] + lerp(90, 40, present) * s];
          return (
            <g key={d}>
              {R(GUARD, {...p, handN: hand, footN: [p.footN[0] + facing * (stomp > 0 && stomp < 0.5 ? 20 : 0), p.footN[1]]}, s, {face: 'stern'})}
              <Armor hip={p.hip} neck={p.neck} s={s} />
              <Spear at={hand} s={s} tilt={0} />
              <path d={`M${p.hip[0] - facing * 30 * s} ${p.hip[1] - 120 * s} l${-facing * 30 * s} 0 l0 ${110 * s} q${-facing * 10 * s} ${20 * s} ${facing * 30 * s} ${30 * s} Z`} fill="#5a2a1a" stroke="#2a1410" strokeWidth={3} />
              {i === 0 && present > 0.5 && stomp < 1 && <text x={x} y={p.neck[1] - 160 * s} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={56} fill="#fff0c8" stroke="#2a1206" strokeWidth={6} paintOrder="stroke" opacity={1 - stomp}>喝！</text>}
            </g>
          );
        })}
        <NameTag x={960} y={790} text="府兵" size={34} o={clamp01((t - guard - 4) / 8)} />
        <Vignette k={0.5} />
      </Svg>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s23: Sc23, s24: Sc24, s25: Sc25, s26: Sc26, s27: Sc27, s28: Sc28};

export const Act4: React.FC<{f: number}> = ({f}) => {
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
export const ACT4_START = fbt(SHOT.s23[0]);
