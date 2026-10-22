import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {Flash} from '../../library/lamplight/stage';
import {LF} from '../../library/lamplight/theme';
import {headOf} from '../ep53-changan-curfew/Kit';
import {P, Rig, RigProps, standPose, walkPose, ridePose} from '../ep53-changan-curfew/Rig';
import {Mount, mountBack} from '../ep53-changan-curfew/Sets';
import {Drape, GoldTube, Label3, Map3D, project, type Cam3, type Px} from './Map3D';
import {lerp, Svg} from './Opening';
import {DragonBoat, LOOK54} from './Props';
import {CAST, Clasp, Vignette} from './Sets54';
import {B, fbt, S41, S42, S43, S45, SHOT} from './timeline';

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
const TURK: Partial<RigProps> = {robe: '#5a3a24', robeD: '#3e2818', pants: '#2a1e14', hem: 70, hat: 'felt'};
const ELDER: Partial<RigProps> = {robe: '#d8ccb0', robeD: '#aa9e84', pants: '#3a3026', hem: 190, beard: true, beardC: '#e8e4dc'};
const ELDER2: Partial<RigProps> = {robe: '#6a5a80', robeD: '#4a3e5a', pants: '#2a2430', hem: 190, beard: true, beardC: '#d8d4cc'};
const SOLDIER: Partial<RigProps> = {robe: '#7a5a3a', robeD: '#5a4028', pants: '#2a2018', hem: 70};
const GUARD: Partial<RigProps> = {robe: '#9a2e26', robeD: '#6e201a', pants: '#2a2020', hem: 90};
const PEASANT: Partial<RigProps> = {robe: '#8a7458', robeD: '#66543e', pants: '#4a3e30', hem: 50, hat: 'none', hair: '#2a2018'};
const PEASANT2: Partial<RigProps> = {robe: '#6a6a58', robeD: '#4e4e40', pants: '#3e3a30', hem: 50, hat: 'none', hair: '#1e1810'};
const WOMAN: Partial<RigProps> = {robe: '#8a5a48', robeD: '#6a4434', pants: '#3a3026', hem: 60, hat: 'bun', hair: '#1e1610'};
const WOMAN2: Partial<RigProps> = {robe: '#5e6a5a', robeD: '#444e42', pants: '#3a3026', hem: 60, hat: 'bun', hair: '#1e1610'};

/* ═════════ 第 41 屏：北有突厥铁骑（草原骑兵剪影），南有陈朝旧族（江南城楼上的世家老者） ═════════ */
export const Rider: React.FC<{f: number; x: number; y: number; s: number; seed: number}> = ({f, x, y, s, seed}) => {
  const bob = Math.sin(f * 0.5 + seed) * 6 * s;
  const back = mountBack(x, y, s, 'horse');
  const pose = ridePose([back[0], back[1] + bob], s, 1);
  return (
    <g>
      <Mount f={f + seed * 7} x={x} y={y} s={s} facing={1} kind="horse" walk={1} color="#3a2a1e" />
      {R(TURK, {...pose, handN: [pose.neck[0] + 70 * s, pose.neck[1] - 120 * s]}, s, {face: 'stern'})}
      <line x1={pose.neck[0] + 62 * s} y1={pose.neck[1] + 60 * s} x2={pose.neck[0] + 90 * s} y2={pose.neck[1] - 330 * s} stroke="#1a120c" strokeWidth={10 * s} />
      <path d={`M${pose.neck[0] + 90 * s} ${pose.neck[1] - 330 * s} l${-14 * s} ${40 * s} l${28 * s} 0 Z`} fill="#c8c8c8" />
    </g>
  );
};
const GateTower: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-150} width={520} height={150} fill="#6a5a48" stroke="#2a2018" strokeWidth={4} />
    {Array.from({length: 12}, (_, i) => <rect key={i} x={-260 + i * 44} y={-174} width={30} height={26} fill="#6a5a48" stroke="#2a2018" strokeWidth={3} />)}
    <path d="M-60 0 L-60 -90 Q0 -130 60 -90 L60 0 Z" fill="#1e140c" />
    <rect x={-200} y={-300} width={400} height={126} fill="#8a3a24" stroke="#3a1408" strokeWidth={4} />
    {[-150, -75, 0, 75, 150].map((d) => <rect key={d} x={d - 22} y={-280} width={44} height={70} fill="#e8c878" opacity={0.55} />)}
    <path d="M-280 -296 Q-200 -320 -180 -360 L180 -360 Q200 -320 280 -296 L250 -290 L-250 -290 Z" fill="#3a3430" stroke="#1a1410" strokeWidth={4} />
    <rect x={-210} y={-182} width={420} height={10} fill="#3a2a1a" />
  </g>
);
const Sc41: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(9)));
  const cam: Cam3 = {lon: lerp(115.0, 115.6, k), lat: lerp(37.2, 37.0, k), dist: lerp(2700, 2600, k), pitch: 58, yaw: 0};
  const turk = easeOut(seg(t, S41.turk - 0.3, S41.turk + 0.6));
  const chen = easeOut(seg(t, S41.chen - 0.3, S41.chen + 0.6));
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    // 北方草原着一层枯黄，江南着一层青绿
    const [, yS] = px(110, 40.6);
    g.fillStyle = `rgba(200,170,90,${0.25 * turk})`;
    g.fillRect(0, 0, g.canvas.width, yS);
    const [x0, y0] = px(116.5, 33.2);
    const gr = g.createRadialGradient(x0 + 60, y0 + 140, 0, x0 + 60, y0 + 140, 220);
    gr.addColorStop(0, `rgba(90,170,100,${0.35 * chen})`);
    gr.addColorStop(1, 'rgba(90,170,100,0)');
    g.fillStyle = gr;
    g.fillRect(x0 - 260, y0 - 120, 640, 560);
  };
  const tx = (i: number) => project(cam, 112.6 + i * 1.05 + (t / bt(9)) * 0.8, 41.4 - (i % 2) * 0.25, 2);
  const [jx, jy] = project(cam, 118.78, 32.05, 4);
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={`${turk.toFixed(2)}_${chen.toFixed(2)}`} opacity={0.9} />
      </Map3D>
      <Svg>
        <g opacity={turk} style={{filter: 'brightness(0.18) sepia(0.6)'}}>
          {Array.from({length: 7}, (_, i) => {
            const [x, y] = tx(i);
            return <Rider key={i} f={t} x={x} y={y + (1 - turk) * 30} s={0.23} seed={i * 1.7} />;
          })}
        </g>
        {turk > 0 && (() => {
          const [x, y] = tx(3);
          return <text x={x} y={y - 175} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={60} fill="#ff9a80" stroke="#1a0a04" strokeWidth={6} paintOrder="stroke" opacity={turk}>突厥</text>;
        })()}
        <g opacity={chen} transform={`translate(0 ${(1 - chen) * 30})`}>
          <GateTower x={jx} y={jy} s={0.6} />
          {[-1, 0, 1].map((d, i) => {
            const s = 0.19;
            const x = jx + d * 66;
            const p = standPose(x, jy - 0.6 * 182, s, -1);
            return <g key={d}>{R(i === 1 ? ELDER2 : ELDER, {...p, handN: [x - 22 * s, p.hip[1] - 60 * s], handF: [x - 16 * s, p.hip[1] - 54 * s]}, s, {face: 'stern'})}</g>;
          })}
          <text x={jx} y={jy + 74} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={56} fill="#b8f0b0" stroke="#0a1a08" strokeWidth={6} paintOrder="stroke">陈朝旧族</text>
        </g>
      </Svg>
      <Label3 cam={cam} at={[108.94, 34.27]} name="长安" lift={16} size={32} o={0.7} color="#e8dcc0" />
      <Label3 cam={cam} at={[112.45, 34.62]} name="洛阳" lift={16} size={32} o={0.7} color="#e8dcc0" />
      <Vignette k={0.4} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 42 屏：斜切三分屏「船」「兵」「粮」 ═════════ */
const PANELS: [string, string][] = [
  ['M0 0 L700 0 L540 1080 L0 1080 Z', '船'],
  ['M716 0 L1336 0 L1176 1080 L556 1080 Z', '兵'],
  ['M1352 0 L1920 0 L1920 1080 L1192 1080 Z', '粮'],
];
const Ship: React.FC<{f: number; x: number; y: number; s: number}> = ({f, x, y, s}) => {
  const roll = Math.sin(f / 9) * 3;
  return (
    <g transform={`translate(${x} ${y + Math.sin(f / 7) * 6}) rotate(${roll}) scale(${s})`}>
      <path d="M-260 -40 L250 -40 Q300 -46 320 -90 L300 10 Q280 50 200 60 L-220 60 Q-270 40 -280 -10 Z" fill="#6a3a1a" stroke="#2a1408" strokeWidth={5} />
      <rect x={-250} y={-52} width={500} height={14} fill="#a8742a" />
      {[-120, 60].map((mx, i) => (
        <g key={mx}>
          <line x1={mx} y1={-50} x2={mx} y2={-380 + i * 30} stroke="#3a2010" strokeWidth={10} />
          <path d={`M${mx + 8} ${-370 + i * 30} Q${mx + 150} ${-300 + i * 30} ${mx + 130} ${-80} L${mx + 8} -70 Z`} fill="#f4ecd8" stroke="#a89878" strokeWidth={4} />
          {[0, 1, 2, 3].map((j) => <line key={j} x1={mx + 8} y1={-320 + j * 60 + i * 30} x2={mx + 120 + (j === 0 ? 20 : 0)} y2={-310 + j * 62 + i * 30} stroke="#c8b898" strokeWidth={3} />)}
        </g>
      ))}
      <path d="M-180 -140 L-180 -50 M-180 -140 L-120 -120" stroke="#c8281c" strokeWidth={6} />
    </g>
  );
};
const Sc42: React.FC<{t: number}> = ({t}) => {
  const on = [S42.c1, S42.c2, S42.c3].map((c) => clamp01((t - bt(c)) / 8));
  const flash = t - bt(S42.flash);
  const bigShine = flash > 0 ? Math.max(0, 1 - flash / 20) : 0;
  const cam: Cam3 = {lon: 115.6, lat: 37.0, dist: 2600, pitch: 58, yaw: 0};
  // 粮：麻袋从天而降堆满（4 列 × 5 行）
  const t3 = t - bt(S42.c3);
  const sacks = Array.from({length: 20}, (_, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const t0 = row * 7 + rnd(i) * 5;
    const yEnd = 1000 - row * 92;
    const fall = clamp01((t3 - t0) / 12);
    return {x: 1400 + col * 118 - row * 18 + (row % 2) * 30, y: lerp(-80, yEnd, easeIn(fall)), vis: t3 > t0, rot: (rnd(i + 9) - 0.5) * 8 * (1 - fall)};
  });
  return (
    <AbsoluteFill>
      <Map3D cam={cam} opacity={0.45} />
      <AbsoluteFill style={{background: 'rgba(10,6,4,0.55)'}} />
      <Svg>
        <defs>
          {PANELS.map(([d], i) => <clipPath key={i} id={`p42_${i}`}><path d={d} /></clipPath>)}
        </defs>
        {/* 左格：金色河道上白帆大船破浪 */}
        <g clipPath="url(#p42_0)" opacity={0.25 + 0.75 * on[0]}>
          <rect x={0} y={0} width={720} height={1080} fill="#2a1e14" />
          <path d="M0 640 L720 560 L720 1080 L0 1080 Z" fill="#a8782a" />
          <path d="M0 660 L720 580 L720 1080 L0 1080 Z" fill="#d8a83a" opacity={0.5} />
          {Array.from({length: 9}, (_, i) => {
            const x = ((i * 120 - t * 6) % 900 + 900) % 900 - 100;
            return <path key={i} d={`M${x} ${760 + (i % 3) * 90} q30 -18 60 0 q30 18 60 0`} stroke="#ffe6a0" strokeWidth={5} fill="none" opacity={0.7} />;
          })}
          <Ship f={t} x={330} y={730} s={0.82} />
          {Array.from({length: 10}, (_, i) => {
            const a = ((t * 2 + i * 9) % 30) / 30;
            return <circle key={i} cx={590 + a * 90 * Math.cos(i)} cy={730 - a * 120 + a * a * 120} r={10 * (1 - a) + 3} fill="#fff8e0" opacity={1 - a} />;
          })}
        </g>
        {/* 中格：甲板上一排隋兵双手紧握长矛竖立 */}
        <g clipPath="url(#p42_1)" opacity={0.25 + 0.75 * on[1]}>
          <rect x={540} y={0} width={820} height={1080} fill="#3a2a1c" />
          <rect x={540} y={860} width={820} height={220} fill="#7a5430" />
          {Array.from({length: 10}, (_, i) => <line key={i} x1={540} y1={880 + i * 22} x2={1360} y2={880 + i * 22} stroke="#5a3a20" strokeWidth={3} />)}
          <rect x={540} y={780} width={820} height={24} fill="#5a3a20" />
          {[0, 1, 2, 3, 4].map((i) => {
            const s = 0.5;
            const x = 650 + i * 120;
            const p = standPose(x, 960, s, 1);
            const sx = x + 46 * s;
            return (
              <g key={i}>
                <line x1={sx} y1={965} x2={sx} y2={380} stroke="#3a2614" strokeWidth={9} />
                <path d={`M${sx} 330 l-11 52 l22 0 Z`} fill="#d8d8d8" stroke="#5a5a5a" strokeWidth={2} />
                <path d={`M${sx - 12} 384 l24 0 l-4 14 l-16 0 Z`} fill="#c8281c" />
                {R(SOLDIER, {...p, handN: [sx, p.neck[1] + 40 * s], handF: [sx, p.neck[1] + 110 * s]}, s, {face: 'stern'})}
              </g>
            );
          })}
        </g>
        {/* 右格：船舱里麻袋像方块一样落下堆满 */}
        <g clipPath="url(#p42_2)" opacity={0.25 + 0.75 * on[2]}>
          <rect x={1180} y={0} width={740} height={1080} fill="#4a3220" />
          {Array.from({length: 8}, (_, i) => <line key={i} x1={1180} y1={i * 140} x2={1920} y2={i * 140} stroke="#3a2414" strokeWidth={6} />)}
          <path d="M1180 1040 L1920 1040" stroke="#2a1a0e" strokeWidth={12} />
          {sacks.filter((q) => q.vis).map((q, i) => (
            <g key={i} transform={`translate(${q.x} ${q.y}) rotate(${q.rot})`}>
              <rect x={-54} y={-84} width={108} height={84} rx={22} fill="#d8c08a" stroke="#7a6034" strokeWidth={4} />
              <path d="M-30 -84 q30 -16 60 0" stroke="#7a6034" strokeWidth={4} fill="none" />
              <text x={0} y={-28} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={36} fill="#8a3a1a">粮</text>
            </g>
          ))}
        </g>
        {PANELS.map(([d], i) => <path key={i} d={d} fill="none" stroke="#e8b860" strokeWidth={6} opacity={0.4 + 0.6 * on[i]} />)}
        {PANELS.map(([, ch], i) => {
          const cx = [330, 950, 1600][i];
          const pop = on[i];
          return pop > 0 ? (
            <text key={ch} x={cx} y={i < 2 ? 1010 : 330} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={170} fill="#ffe0a0" stroke="#2a1606" strokeWidth={10} paintOrder="stroke" opacity={pop} transform={`translate(${cx} ${i < 2 ? 950 : 270}) scale(${lerp(1.6, 1, easeOutBack(pop))}) translate(${-cx} ${i < 2 ? -950 : -270})`}>
              {ch}
            </text>
          ) : null;
        })}
      </Svg>
      {bigShine > 0 && <AbsoluteFill style={{background: 'linear-gradient(110deg, rgba(255,230,160,0) 30%, rgba(255,230,160,0.55) 50%, rgba(255,230,160,0) 70%)', backgroundSize: '300% 100%', backgroundPosition: `${(1 - bigShine) * 100}% 0`, opacity: bigShine, mixBlendMode: 'screen'}} />}
      {[S42.c1, S42.c2, S42.c3].map((c) => <Flash key={c} f={t} at={bt(c)} dur={6} peak={0.25} />)}
      <Flash f={t} at={bt(S42.flash)} dur={9} peak={0.55} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 43 屏：龙舟停靠江都码头，皇帝仪仗下船，世家老者赶紧下楼迎接行礼 ═════════ */
const Sc43: React.FC<{t: number}> = ({t}) => {
  const W0 = 840; // 码头面
  const down = seg(t, S43.down, S43.down + 2.6);
  const bow = easeInOut(seg(t, S43.bow, S43.bow + 0.8));
  const gong = t - bt(S43.gong);
  // 仪仗：旗手、伞盖、杨广，从跳板走到码头
  const proc = [0, 1, 2, 3].map((i) => {
    const u = clamp01(down * 1.25 - i * 0.12);
    return {x: lerp(560, 900, u) - i * 0 + i * 0, u};
  });
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="sky43" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4a5a" />
            <stop offset="1" stopColor="#c8a878" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky43)" />
        <path d="M0 560 Q300 520 600 548 T1200 530 T1920 540 L1920 700 L0 700 Z" fill="#6a7a6a" opacity={0.6} />
        {/* 城墙与城楼（右） */}
        <rect x={1180} y={420} width={740} height={420} fill="#7a6a58" stroke="#3a2e22" strokeWidth={4} />
        {Array.from({length: 17}, (_, i) => <rect key={i} x={1180 + i * 44} y={396} width={30} height={28} fill="#7a6a58" stroke="#3a2e22" strokeWidth={3} />)}
        <g transform="translate(1560 420) scale(0.9)">
          <rect x={-220} y={-170} width={440} height={170} fill="#8a3a24" stroke="#3a1408" strokeWidth={4} />
          {[-160, -80, 0, 80, 160].map((d) => <rect key={d} x={d - 26} y={-150} width={52} height={90} fill="#f0d088" opacity={0.6} />)}
          <path d="M-300 -166 Q-220 -196 -200 -240 L200 -240 Q220 -196 300 -166 L270 -160 L-270 -160 Z" fill="#3a3430" stroke="#1a1410" strokeWidth={4} />
        </g>
        <text x={1560} y={520} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={48} fill="#f0d8a0" stroke="#2a1a0e" strokeWidth={5} paintOrder="stroke">江都</text>
        {/* 城墙台阶（从城上斜下到码头） */}
        <path d="M1180 520 L1000 840 L1060 840 L1240 520 Z" fill="#9a8a74" stroke="#4a3e2e" strokeWidth={3} />
        {Array.from({length: 12}, (_, i) => <line key={i} x1={1180 - i * 15} y1={520 + i * 26.7} x2={1240 - i * 15} y2={520 + i * 26.7} stroke="#5a4e3e" strokeWidth={3} />)}
        {/* 水面 */}
        <rect x={0} y={W0} width={1920} height={240} fill="#3a5a6a" />
        {Array.from({length: 12}, (_, i) => <path key={i} d={`M${((i * 170 + t * 1.2) % 2100) - 100} ${W0 + 40 + (i % 4) * 46} q40 -10 80 0`} stroke="#8ab0c0" strokeWidth={4} fill="none" opacity={0.6} />)}
        {/* 码头木栈 */}
        <rect x={700} y={W0 - 20} width={1220} height={34} fill="#7a5430" stroke="#3a2410" strokeWidth={4} />
        {Array.from({length: 14}, (_, i) => <rect key={i} x={720 + i * 88} y={W0 + 14} width={16} height={120} fill="#5a3a20" />)}
        {/* 龙舟停靠（左） */}
        <g transform={`translate(360 ${W0 + 30 + Math.sin(t / 12) * 3}) scale(0.5)`}>
          <DragonBoat f={t} />
        </g>
        {/* 跳板 */}
        <path d={`M560 ${W0 - 70} L760 ${W0 - 20}`} stroke="#8a6438" strokeWidth={14} />
        {/* 仪仗 */}
        {proc.map(({x, u}, i) => {
          if (u <= 0) return null;
          const s = 0.42;
          const g = u < 0.6 ? lerp(W0 - 70, W0 - 20, u / 0.6) : W0 - 20;
          const ph = t / 18 + i * 0.3;
          const p = u < 1 ? walkPose(x, g, ph, s, 1) : standPose(x, g, s, 1);
          if (i === 3) {
            return (
              <g key={i}>
                {R(LOOK54.yangEmp, p, s, {face: 'stern', hat: 'futou'})}
                <line x1={x - 60} y1={g - 340} x2={x - 60} y2={g - 40} stroke="#3a2210" strokeWidth={5} />
                <path d={`M${x - 140} ${g - 330} Q${x - 60} ${g - 390} ${x + 20} ${g - 330} Z`} fill="#e0b040" stroke="#7a5a10" strokeWidth={3} />
              </g>
            );
          }
          return (
            <g key={i}>
              {R(GUARD, {...p, handN: [x + 30 * s, p.neck[1] + 60 * s]}, s, {face: 'stern'})}
              <line x1={x + 30 * s} y1={g - 20} x2={x + 30 * s} y2={g - 380} stroke="#3a2210" strokeWidth={5} />
              <path d={`M${x + 30 * s} ${g - 380} l60 8 l-4 50 l-56 -6 Z`} fill={i === 1 ? '#e0b040' : '#c8281c'} />
            </g>
          );
        }).reverse()}
        {/* 世家老者：从城上沿台阶匆匆下来，到码头躬身作揖 */}
        {[0, 1, 2].map((i) => {
          const s = 0.4;
          const u = clamp01(down * 1.3 - i * 0.15);
          const x = lerp(1215 - i * 10, 1080 + i * 110, u);
          const g = u < 0.75 ? lerp(520, 840, u / 0.75) : W0 - 20;
          const p = walkPose(x, g, t / 10 + i, s, -1);
          const b = bow;
          const hip: P = [x, g - 226 * s];
          const neck = b > 0 ? lean(hip, -50 * b, s) : p.neck;
          const hands: P = [neck[0] - 60 * s, neck[1] + 70 * s];
          return (
            <g key={i}>
              {R(i === 1 ? ELDER2 : ELDER, b > 0 ? {...standPose(x, g, s, -1), neck, handN: hands, handF: [hands[0] + 6, hands[1] + 4]} : p, s, {face: b > 0 ? 'calm' : 'shock'})}
              {b > 0.4 && <Clasp at={hands} s={s} />}
            </g>
          );
        })}
        {gong > 0 && gong < 30 && <circle cx={1560} cy={300} r={40 + gong * 8} fill="none" stroke="#ffe0a0" strokeWidth={6} opacity={1 - gong / 30} />}
      </Svg>
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 44 屏：金色运河还在发光，镜头沉到河岸，两岸是累倒的民夫 ═════════ */
const Lying: React.FC<{x: number; y: number; s: number; look: Partial<RigProps>; dir: 1 | -1; seed: number}> = ({x, y, s, look, dir, seed}) => {
  const hip: P = [x, y - 30 * s];
  const neck: P = [x + dir * 200 * s, y - 40 * s];
  return (<g><ellipse cx={x + dir * 20 * s} cy={y + 4 * s} rx={260 * s} ry={22 * s} fill="#140c06" opacity={0.6} />{R({...look, hem: 24}, {hip, neck, facing: dir, handN: [neck[0] + dir * 40 * s, y], handF: [hip[0] + dir * 60 * s, y - 4 * s], footN: [x - dir * 200 * s, y], footF: [x - dir * 190 * s, y - 10 * s], kneeN: [x - dir * 100 * s, y - 40 * s], kneeF: [x - dir * 96 * s, y - 20 * s], headAt: [neck[0] + dir * 50 * s, y - 50 * s]}, s, {face: rnd(seed) > 0.5 ? 'sleepy' : 'pain'})}</g>);
};
const Sc44: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(seg(t, 1.6, 6.5));
  const z = lerp(1, 2.5, k);
  const fx = lerp(960, 640, k), fy = lerp(560, 840, k);
  const glow = 0.75 + 0.25 * Math.sin(t / 8);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="sky44" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#140c10" />
            <stop offset="1" stopColor="#4a2a1a" />
          </linearGradient>
          <linearGradient id="riv44" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe6a0" />
            <stop offset="1" stopColor="#d89a30" />
          </linearGradient>
          <filter id="gl44"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky44)" />
        <g transform={`translate(960 540) scale(${z}) translate(${-fx} ${-fy})`}>
          <rect x={-400} y={430} width={2720} height={1100} fill="#2a1c12" />
          {/* 运河：从地平线蜿蜒到近处，发着金光 */}
          <path d="M930 430 Q900 520 820 600 Q700 720 760 860 Q820 1000 700 1200 L1250 1200 Q1180 1000 1060 860 Q980 720 1010 600 Q1000 520 990 430 Z" fill="#ffc050" opacity={0.5 * glow} filter="url(#gl44)" />
          <path d="M940 430 Q915 520 850 600 Q740 720 800 860 Q860 1000 760 1200 L1180 1200 Q1120 1000 1020 860 Q950 720 990 600 Q985 520 980 430 Z" fill="url(#riv44)" opacity={0.9} />
          {Array.from({length: 8}, (_, i) => {
            const u = ((t / 60 + i / 8) % 1);
            const y = lerp(450, 1180, u * u);
            return <path key={i} d={`M${960 - 30 - u * 100} ${y} q${30 + u * 100} -6 ${60 + u * 200} 0`} stroke="#fff6d0" strokeWidth={2 + u * 4} fill="none" opacity={0.6} />;
          })}
          {/* 堤岸 */}
          <path d="M-400 760 Q300 700 760 860 L700 1200 L-400 1200 Z" fill="#3a2818" />
          <path d="M2320 760 Q1600 700 1060 860 L1180 1200 L2320 1200 Z" fill="#3a2818" />
          {/* 远处民夫剪影 */}
          {Array.from({length: 14}, (_, i) => <ellipse key={i} cx={i < 7 ? 300 + i * 70 : 1150 + (i - 7) * 90} cy={i < 7 ? 760 + i * 6 : 800 - (i - 7) * 4} rx={26} ry={8} fill="#1a100a" />)}
          {/* 近处累倒的民夫（左岸） */}
          {[[420, 905, 1], [600, 940, -1], [280, 975, 1], [520, 1010, 1]].map(([x, y, d], i) => <Lying key={i} x={x} y={y} s={0.26} look={i % 2 ? PEASANT2 : PEASANT} dir={d as 1 | -1} seed={i} />)}
          {/* 右岸 */}
          {[[1300, 905, -1], [1500, 950, 1], [1380, 1000, -1]].map(([x, y, d], i) => <Lying key={i} x={x} y={y} s={0.26} look={i % 2 ? PEASANT : PEASANT2} dir={d as 1 | -1} seed={i + 5} />)}
          {/* 倒在一边的扁担、筐 */}
          <line x1={330} y1={945} x2={470} y2={935} stroke="#6a4a2a" strokeWidth={6} />
          <path d="M640 985 l40 0 l-6 26 l-28 0 Z" fill="#8a6a3a" stroke="#4a3a1a" strokeWidth={2} />
        </g>
      </Svg>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 45 屏：河北永济渠工地，三名女子背着婴儿挑土上堤（慢镜头） ═════════ */
const Woman: React.FC<{t: number; x: number; y: number; s: number; look: Partial<RigProps>; seed: number; slope: number}> = ({t, x, y, s, look, seed, slope}) => {
  const ph = t / 70 + seed; // 慢镜头：一步很慢
  const a = Math.sin(ph * Math.PI * 2);
  const b = Math.cos(ph * Math.PI * 2);
  const g = (xx: number) => y - (xx - x) * slope;
  const hip: P = [x, y - 200 * s + 4 * s * Math.abs(b)];
  const neck = lean(hip, 45, s);
  const head = headOf(hip, neck, s);
  const fN: P = [x + 58 * s * a, g(x + 58 * s * a) - Math.max(0, 22 * s * b)];
  const fF: P = [x - 58 * s * a, g(x - 58 * s * a) - Math.max(0, -22 * s * b)];
  // 扁担：压在肩上，前后各吊一筐土
  const sh: P = [neck[0] - 4 * s, neck[1] + 4 * s];
  const pf: P = [sh[0] + 130 * s, sh[1] - 4 * s + Math.sin(ph * 6.28 + 1) * 3 * s];
  const pb: P = [sh[0] - 140 * s, sh[1] + 10 * s + Math.sin(ph * 6.28) * 3 * s];
  const bf: P = [pf[0] + 4 * s, pf[1] + 120 * s];
  const bb: P = [pb[0] - 4 * s, pb[1] + 120 * s];
  const handN: P = [pf[0] - 4 * s, pf[1] + 30 * s];
  const handF: P = [pb[0] + 6 * s, pb[1] + 28 * s];
  // 背上的婴儿（用布带绑在背后）
  const back: P = [lerp(hip[0], neck[0], 0.55) - 46 * s, lerp(hip[1], neck[1], 0.55) - 30 * s];
  const basket = (c: P) => (
    <g>
      <path d={`M${c[0] - 40 * s} ${c[1]} L${c[0] + 40 * s} ${c[1]} L${c[0] + 30 * s} ${c[1] + 54 * s} L${c[0] - 30 * s} ${c[1] + 54 * s} Z`} fill="#8a6a3a" stroke="#4a3a1a" strokeWidth={3 * s} />
      <ellipse cx={c[0]} cy={c[1]} rx={42 * s} ry={14 * s} fill="#5a4026" />
      {[-20, 0, 20].map((d) => <line key={d} x1={c[0] + d * s} y1={c[1] + 4 * s} x2={c[0] + d * 0.8 * s} y2={c[1] + 52 * s} stroke="#6a4e2a" strokeWidth={2 * s} />)}
    </g>
  );
  return (
    <g>
      {/* 后筐、绳 */}
      <line x1={pb[0]} y1={pb[1]} x2={bb[0] - 30 * s} y2={bb[1]} stroke="#4a3a24" strokeWidth={3 * s} />
      <line x1={pb[0]} y1={pb[1]} x2={bb[0] + 30 * s} y2={bb[1]} stroke="#4a3a24" strokeWidth={3 * s} />
      {basket(bb)}
      {/* 婴儿 */}
      <g>
        <ellipse cx={back[0]} cy={back[1] + 20 * s} rx={40 * s} ry={58 * s} fill="#b89a6a" stroke="#6a5030" strokeWidth={3 * s} transform={`rotate(45 ${back[0]} ${back[1]})`} />
        <circle cx={back[0] + 6 * s} cy={back[1] - 56 * s} r={26 * s} fill="#ecd2aa" stroke="#9a7a50" strokeWidth={2 * s} />
        <path d={`M${back[0] - 14 * s} ${back[1] - 70 * s} q16 -14 36 -4`} stroke="#2a1a10" strokeWidth={6 * s} fill="none" />
        <path d={`M${back[0] + 12 * s} ${back[1] - 54 * s} q5 3 10 0`} stroke="#2a1a10" strokeWidth={3 * s} fill="none" />
      </g>
      {R(look, {hip, neck, facing: 1, footN: fN, footF: fF, handN, handF, headAt: [head[0] + 6 * s, head[1] + 4 * s]}, s, {face: 'pain', headTilt: -10})}
      {/* 绑婴儿的布带（交叉过胸） */}
      <path d={`M${back[0] + 20 * s} ${back[1] - 30 * s} L${neck[0] + 20 * s} ${neck[1] + 60 * s} M${back[0] + 10 * s} ${back[1] + 50 * s} L${neck[0] + 24 * s} ${neck[1] + 10 * s}`} stroke="#c8a060" strokeWidth={9 * s} />
      {/* 婴儿小手抓着母亲衣领 */}
      <path d={`M${back[0] + 24 * s} ${back[1] - 40 * s} Q${neck[0] - 20 * s} ${neck[1] - 10 * s} ${neck[0] - 8 * s} ${neck[1] - 6 * s}`} stroke="#b89a6a" strokeWidth={10 * s} fill="none" strokeLinecap="round" />
      <circle cx={neck[0] - 6 * s} cy={neck[1] - 6 * s} r={8 * s} fill="#ecd2aa" stroke="#9a7a50" strokeWidth={2 * s} />
      {/* 扁担 */}
      <line x1={pb[0]} y1={pb[1]} x2={pf[0]} y2={pf[1]} stroke="#7a5430" strokeWidth={10 * s} strokeLinecap="round" />
      {/* 前筐、绳 */}
      <line x1={pf[0]} y1={pf[1]} x2={bf[0] - 30 * s} y2={bf[1]} stroke="#4a3a24" strokeWidth={3 * s} />
      <line x1={pf[0]} y1={pf[1]} x2={bf[0] + 30 * s} y2={bf[1]} stroke="#4a3a24" strokeWidth={3 * s} />
      {basket(bf)}
      {/* 草鞋踩进泥里 */}
      {[fN, fF].map((f, i) => <ellipse key={i} cx={f[0] + 6 * s} cy={f[1] + 2 * s} rx={26 * s} ry={8 * s} fill="#3a2a18" opacity={0.85} />)}
      {[fN, fF].map((f, i) => <path key={`s${i}`} d={`M${f[0] - 14 * s} ${f[1] - 4 * s} l34 0`} stroke="#c8a860" strokeWidth={6 * s} />)}
    </g>
  );
};
const Sc45: React.FC<{t: number}> = ({t}) => {
  const slope = 0.32;
  const card = easeOut(seg(t, S45.card, S45.card + 0.7));
  const drum = t - bt(S45.drum);
  const shake = drum > 0 && drum < 10 ? Math.sin(drum * 3) * (10 - drum) * 0.8 : 0;
  const k = easeInOut(clamp01(t / bt(10)));
  const z = lerp(1.0, 1.12, k);
  const adv = t * 0.55;
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px, 0)`}}>
      <Svg>
        <defs>
          <linearGradient id="sky45" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a5a5e" />
            <stop offset="1" stopColor="#a89878" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky45)" />
        <g transform={`translate(960 600) scale(${z}) translate(-960 -600)`}>
          {/* 远处工地：人群剪影、堤坝 */}
          <path d="M0 520 L1920 440 L1920 620 L0 660 Z" fill="#7a6a54" />
          {Array.from({length: 40}, (_, i) => {
            const x = (i * 53 + (t * 0.3 * (i % 3 ? 1 : -1))) % 1980 - 30;
            return <g key={i} opacity={0.55}><rect x={x} y={500 - x * 0.042 + (i % 4) * 14} width={10} height={26} fill="#3a2e22" /><circle cx={x + 5} cy={494 - x * 0.042 + (i % 4) * 14} r={6} fill="#3a2e22" /></g>;
          })}
          <g>
            <line x1={1500} y1={560} x2={1500} y2={420} stroke="#3a2a1a" strokeWidth={6} />
            <rect x={1500} y={420} width={150} height={52} fill="#e8dcc0" stroke="#3a2a1a" strokeWidth={3} />
            <text x={1575} y={458} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={34} fill="#3a1a0a">永济渠</text>
          </g>
          {/* 泥泞的河堤斜坡（向右上） */}
          <path d={`M0 1080 L0 ${1000} L1920 ${1000 - 1920 * slope} L1920 1080 Z`} fill="#5a4630" />
          <path d={`M0 ${1000} L1920 ${1000 - 1920 * slope}`} stroke="#3a2a18" strokeWidth={6} />
          {Array.from({length: 30}, (_, i) => {
            const x = i * 70 + rnd(i) * 30;
            return <ellipse key={i} cx={x} cy={1000 - x * slope + 30 + rnd(i + 3) * 60} rx={30 + rnd(i) * 20} ry={6} fill="#3e2e1c" opacity={0.6} />;
          })}
          {/* 三名女子排成一列往上走 */}
          {[0, 1, 2].map((i) => {
            const x = 420 + i * 420 + adv;
            return <Woman key={i} t={t} x={x} y={1000 - x * slope} s={0.62} look={i === 1 ? WOMAN2 : WOMAN} seed={i * 0.37} slope={slope} />;
          })}
        </g>
      </Svg>
      {card > 0 && (
        <div style={{position: 'absolute', right: 110, top: 250, transform: `scale(${lerp(1.6, 1, easeOutBack(card))}) rotate(-4deg)`, opacity: Math.min(1, card * 2)}}>
          <div style={{padding: '10px 34px', background: 'rgba(110,24,14,0.92)', border: '5px solid #ffd070', borderRadius: 14, fontFamily: LF.serif, fontWeight: 900, fontSize: 64, color: '#ffe6a8', boxShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>通济渠 100 万+</div>
        </div>
      )}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s41: Sc41, s42: Sc42, s43: Sc43, s44: Sc44, s45: Sc45};

export const Act7: React.FC<{f: number}> = ({f}) => {
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
export const ACT7_START = fbt(SHOT.s41[0]);
