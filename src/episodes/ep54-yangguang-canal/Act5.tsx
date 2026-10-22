import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {Flash, shakeXY} from '../../library/lamplight/stage';
import {LF} from '../../library/lamplight/theme';
import {headOf, Sweat} from '../ep53-changan-curfew/Kit';
import {P, Rig, RigProps, standPose, walkPose} from '../ep53-changan-curfew/Rig';
import {Candle} from '../ep53-changan-curfew/Sets';
import {GEO} from './geo';
import {Drape, Label3, Map3D, Pin3, project, world, type Cam3, type Px} from './Map3D';
import {lerp, Svg} from './Opening';
import {Brush, Dust} from './Props';
import {NameTag, Vignette} from './Sets54';
import {B, fbt, S29, S30, S31, S33, S34, SHOT} from './timeline';

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
export type LL = [number, number];
const CHANGAN: LL = [108.94, 34.27];
const LUOYANG: LL = [112.45, 34.62];
const JIANGDU: LL = [119.42, 32.39];
const ZHUO: LL = [116.4, 39.9];
/** 折线上取点（按段长均分） */
export const along = (pts: LL[], u: number): LL => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const tot = seg.reduce((a, b) => a + b, 0);
  let d = clamp01(u) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
export const strokePath = (g: CanvasRenderingContext2D, px: Px, pts: LL[], upto = 1) => {
  g.beginPath();
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const [x, y] = px(...along(pts, (i / n) * upto));
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  }
  g.stroke();
};
const PEASANT: Partial<RigProps> = {robe: '#8a7458', robeD: '#66543e', pants: '#4a3e30', hem: 50, hat: 'none', hair: '#2a2018'};
const PEASANT2: Partial<RigProps> = {robe: '#6a6a58', robeD: '#4e4e40', pants: '#3e3a30', hem: 50, hat: 'none', hair: '#1e1810'};
const SU: Partial<RigProps> = {robe: '#4e2a66', robeD: '#341a48', pants: '#241a2a', hem: 150, beard: true, beardC: '#eeeae2'};
const OFFICIAL: Partial<RigProps> = {robe: '#34507a', robeD: '#243856', pants: '#22222a', hem: 130};

/** 小粮船（侧面，SVG） */
export const GrainBoat: React.FC<{x: number; y: number; s: number; dir: number; o?: number}> = ({x, y, s, dir, o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`} opacity={o}>
    <path d="M-34 0 L34 0 L26 12 L-28 12 Z" fill="#6a3a1a" stroke="#2a1408" strokeWidth={2} />
    <line x1={0} y1={0} x2={0} y2={-40} stroke="#3a2010" strokeWidth={3} />
    <path d="M2 -38 L24 -8 L2 -6 Z" fill="#f0e6cc" stroke="#8a7a5a" strokeWidth={1.5} />
    {[-22, -12, -2].map((k) => <ellipse key={k} cx={k} cy={-5} rx={6} ry={5} fill="#d8b860" stroke="#8a6a20" strokeWidth={1.2} />)}
  </g>
);

/* ═════════ 第 29 屏：四面八方的粮船涌向洛阳，粮仓鼓起来 ═════════ */
const ROUTES: LL[][] = [
  [[118.8, 36.9], [117.2, 36.4], [115.8, 35.6], [114.4, 35.1], [113.3, 34.9], [112.6, 34.7]],
  [[119.0, 33.0], [117.6, 33.4], [116.2, 33.9], [114.8, 34.4], [113.4, 34.75], [112.6, 34.68]],
  [[114.0, 31.2], [113.6, 32.2], [113.1, 33.2], [112.8, 34.0], [112.55, 34.55]],
  [[108.9, 34.35], [109.9, 34.55], [110.9, 34.75], [111.8, 34.78], [112.35, 34.68]],
  [[116.6, 39.6], [116.0, 38.4], [115.2, 37.0], [114.2, 35.8], [113.2, 35.0], [112.6, 34.72]],
];
const GRANARIES: [LL, string][] = [[[112.47, 34.78], '回洛仓'], [[113.05, 34.8], '洛口仓'], [[112.3, 34.6], '']];
const Granary3D: React.FC<{at: LL; k: number; seed: number}> = ({at, k, seed}) => {
  const c = world(at[0], at[1], 0);
  return (
    <group position={[c.x, c.y, c.z]}>
      {Array.from({length: 5}, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + seed;
        const sw = 0.55 + 0.45 * k + 0.08 * Math.sin(k * 20 + i);
        return (
          <group key={i} position={[Math.cos(a) * 9, 0, Math.sin(a) * 9]} scale={[sw, sw * (0.7 + 0.5 * k), sw]}>
            <mesh position={[0, 5, 0]}>
              <cylinderGeometry args={[5, 5.6, 10, 16]} />
              <meshStandardMaterial color="#d8b878" />
            </mesh>
            <mesh position={[0, 12, 0]}>
              <coneGeometry args={[6.6, 5, 16]} />
              <meshStandardMaterial color="#8a5a2a" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
const Sc29: React.FC<{t: number}> = ({t}) => {
  const k = clamp01(t / bt(8));
  const cam: Cam3 = {lon: lerp(114.2, 113.4, easeInOut(k)), lat: lerp(33.6, 34.0, easeInOut(k)), dist: lerp(1250, 900, easeInOut(k)), pitch: lerp(62, 56, k), yaw: lerp(-6, 4, k)};
  const fill = easeOut(clamp01((t - bt(1)) / bt(5)));
  const label = clamp01((t - bt(S29.label)) / 10);
  const flow = (t * 2) % 40;
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    g.save();
    g.lineCap = 'round';
    for (const r of ROUTES) {
      g.setLineDash([]);
      g.strokeStyle = 'rgba(20,40,60,0.55)';
      g.lineWidth = 12;
      strokePath(g, px, r);
      g.strokeStyle = 'rgba(120,200,230,0.85)';
      g.lineWidth = 6;
      strokePath(g, px, r);
      g.setLineDash([10, 30]);
      g.lineDashOffset = -flow;
      g.strokeStyle = 'rgba(255,240,190,0.9)';
      g.lineWidth = 4;
      strokePath(g, px, r);
    }
    g.restore();
    const [x, y] = px(...LUOYANG);
    const gr = g.createRadialGradient(x, y, 0, x, y, 120);
    gr.addColorStop(0, `rgba(255,200,90,${0.35 + 0.35 * fill})`);
    gr.addColorStop(1, 'rgba(255,200,90,0)');
    g.fillStyle = gr;
    g.fillRect(x - 120, y - 120, 240, 240);
  };
  const [lx, ly] = project(cam, LUOYANG[0], LUOYANG[1], 40);
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={`${Math.floor(flow)}_${fill.toFixed(2)}`} opacity={0.95} />
        <Pin3 at={LUOYANG} big />
        {GRANARIES.map(([at], i) => <Granary3D key={i} at={at} k={fill} seed={i} />)}
      </Map3D>
      <Svg>
        {ROUTES.map((r, ri) =>
          Array.from({length: 4}, (_, i) => {
            const u = ((t / bt(5.5) + i / 4 + ri * 0.13) % 1);
            const p0 = project(cam, ...along(r, u), 6);
            const p1 = project(cam, ...along(r, Math.min(1, u + 0.03)), 6);
            const o = Math.min(1, u * 8) * (1 - clamp01((u - 0.9) / 0.1));
            return <GrainBoat key={`${ri}_${i}`} x={p0[0]} y={p0[1]} s={0.9} dir={p1[0] >= p0[0] ? 1 : -1} o={o} />;
          }),
        )}
      </Svg>
      <Label3 cam={cam} at={CHANGAN} name="长安" side="left" lift={24} size={40} o={0.85} />
      {GRANARIES.filter(([, n]) => n).map(([at, n]) => <Label3 key={n} cam={cam} at={at} name={n} lift={30} size={30} o={fill} color="#f0e0c0" />)}
      {label > 0 && (
        <div style={{position: 'absolute', left: lx - 210, top: ly + 50, width: 420, textAlign: 'center', transform: `scale(${lerp(1.7, 1, easeOutBack(label))})`, opacity: Math.min(1, label * 2)}}>
          <div style={{display: 'inline-block', padding: '8px 30px', background: 'rgba(90,20,10,0.88)', border: '5px solid #ffd070', borderRadius: 14, fontFamily: LF.serif, fontWeight: 900, fontSize: 76, color: '#ffe6a8', boxShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>粮食首都</div>
        </div>
      )}
      {label <= 0 && <Label3 cam={cam} at={LUOYANG} name="洛阳" lift={36} size={52} />}
    </AbsoluteFill>
  );
};

/* ═════════ 第 30 屏：诏书特写，「務從儉約」四字 + 盖章 ═════════ */
const Sc30: React.FC<{t: number}> = ({t}) => {
  const open = easeInOut(clamp01(t / bt(1.4)));
  const stamp = bt(S30.stamp);
  const st = t - stamp;
  const down = st < 0 ? easeIn(clamp01((t - stamp + 6) / 6)) : 1;
  const lift = st > 4 ? easeOut(clamp01((st - 4) / 10)) : 0;
  const {x: sx, y: sy} = shakeXY(t, stamp, 12);
  const W = lerp(80, 1180, open);
  const chars = ['務', '從', '儉', '約'];
  const ink = (i: number) => clamp01((t - bt(1.6) - i * 7) / 8);
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${1 + 0.05 * clamp01(t / bt(8))})`, transformOrigin: '960px 600px'}}>
      <Svg>
        <defs>
          <radialGradient id="s30glow" cx="0.3" cy="0.75" r="0.7">
            <stop offset="0" stopColor="rgba(255,180,90,0.35)" />
            <stop offset="1" stopColor="rgba(255,180,90,0)" />
          </radialGradient>
          <linearGradient id="s30paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f0dc9c" />
            <stop offset="1" stopColor="#d8bc70" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="#2a160c" />
        {Array.from({length: 9}, (_, i) => <rect key={i} x={0} y={i * 120} width={1920} height={4} fill="rgba(0,0,0,0.25)" />)}
        <rect width={1920} height={1080} fill="url(#s30glow)" />
        {/* 案上：砚台、笔架 */}
        <ellipse cx={330} cy={900} rx={120} ry={40} fill="#1a1410" />
        <ellipse cx={330} cy={890} rx={90} ry={26} fill="#0a0806" />
        <Brush at={[470, 860]} s={1.2} ang={-70} />
        <Candle f={t} x={1700} y={900} h={130} s={1.3} />
        {/* 诏书展开（黄绫） */}
        <g transform="translate(960 600)">
          <rect x={-W / 2} y={-300} width={W} height={560} fill="url(#s30paper)" stroke="#8a6a2a" strokeWidth={6} />
          <rect x={-W / 2 + 20} y={-280} width={Math.max(0, W - 40)} height={520} fill="none" stroke="rgba(140,90,30,0.5)" strokeWidth={3} />
          {/* 两侧细字（示意） */}
          {open > 0.6 &&
            Array.from({length: 14}, (_, i) => {
              const x = 520 - i * 78;
              if (Math.abs(x) < 150) return null;
              return Array.from({length: 7}, (_, j) => <rect key={`${i}_${j}`} x={x - 14} y={-240 + j * 66} width={28} height={40 + (rnd(i * 9 + j) * 14)} rx={4} fill="rgba(50,30,10,0.55)" opacity={clamp01((open - 0.6) * 3)} />);
            })}
          {/* 正中四个大字 */}
          {chars.map((c, i) => (
            <text key={c} x={0} y={-180 + i * 128} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={118} fill="#1a0e06" opacity={ink(i)} transform={`translate(0 ${(1 - ink(i)) * 6})`}>{c}</text>
          ))}
          <rect x={-W / 2 - 34} y={-320} width={34} height={600} rx={12} fill="#6a2a12" stroke="#2a0e04" strokeWidth={4} />
          <rect x={W / 2} y={-320} width={34} height={600} rx={12} fill="#6a2a12" stroke="#2a0e04" strokeWidth={4} />
        </g>
        {/* 红印 */}
        {st >= 0 && (
          <g transform="translate(1210 760) rotate(-4)">
            <rect x={-95} y={-95} width={190} height={190} fill="rgba(200,30,20,0.12)" stroke="#c0281c" strokeWidth={12} />
            {['皇帝', '之寶'].map((tx, i) => <text key={tx} x={i ? -42 : 42} y={-8} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={70} fill="#c0281c" writingMode="tb">{tx}</text>)}
            {Array.from({length: 12}, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const kk = easeOut(clamp01(st / 8));
              return <circle key={i} cx={Math.cos(a) * (110 + 70 * kk)} cy={Math.sin(a) * (110 + 70 * kk)} r={8 - 5 * kk} fill="#c0281c" />;
            })}
          </g>
        )}
        {/* 印玺落下 */}
        {down > 0 && lift < 1 && (
          <g transform={`translate(1210 ${lerp(-200, 760, down) - 900 * lift})`}>
            <rect x={-100} y={-100} width={200} height={110} fill="#d8b040" stroke="#5a4010" strokeWidth={5} />
            <path d="M-70 -100 Q-80 -200 0 -230 Q80 -200 70 -100 Z" fill="#e8c050" stroke="#5a4010" strokeWidth={5} />
            <circle cx={0} cy={-170} r={22} fill="#c99a3a" stroke="#5a4010" strokeWidth={4} />
          </g>
        )}
        {st >= 0 && st < 8 && <text x={1430} y={600} fontFamily={LF.serif} fontWeight={900} fontSize={100} fill="#f4e2b0" stroke="#3a1a0c" strokeWidth={8} paintOrder="stroke">咚！</text>}
        <Vignette k={0.7} />
      </Svg>
      <Flash f={t} at={stamp} dur={6} peak={0.4} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 31 屏：东都工地，抬石 / 拉滚木循环动作组，「每月 200 万人」砸下 ═════════ */
const StoneGroup: React.FC<{x: number; g: number; s: number; t: number; seed: number}> = ({x, g, s, t, seed}) => {
  const ph = t / 26 + seed * 0.37;
  const bob = Math.sin(ph * Math.PI * 4) * 4 * s;
  const stoneY = g - 400 * s + bob;
  const xs = [-150, -50, 50, 150].map((d) => x + d * s + Math.sin(ph * Math.PI * 2) * 10 * s);
  return (
    <g>
      {xs.map((px, i) => {
        const p = walkPose(px, g, (ph + i * 0.25) % 1, s, 1);
        const neck: P = lean(p.hip, -4, s);
        return <g key={i}>{R(i % 2 ? PEASANT2 : PEASANT, {...p, neck, handN: [px + 24 * s, stoneY + 64 * s], handF: [px - 20 * s, stoneY + 64 * s]}, s, {face: 'pain', openHands: true})}</g>;
      })}
      <path d={`M${x - 210 * s} ${stoneY + 60 * s} L${x - 200 * s} ${stoneY - 40 * s} L${x + 190 * s} ${stoneY - 50 * s} L${x + 214 * s} ${stoneY + 60 * s} Z`} fill="#8a8478" stroke="#3a3630" strokeWidth={4 * s} />
      <path d={`M${x - 120 * s} ${stoneY - 20 * s} l40 ${10 * s} M${x + 60 * s} ${stoneY} l50 ${-14 * s}`} stroke="#5a564c" strokeWidth={3 * s} />
    </g>
  );
};
const RopeGroup: React.FC<{x: number; g: number; s: number; t: number; seed: number}> = ({x, g, s, t, seed}) => {
  const ph = t / 30 + seed * 0.41;
  const tug = Math.max(0, Math.sin(ph * Math.PI * 2));
  const stoneX = x - 330 * s + tug * 10 * s;
  const ropeY = g - 300 * s;
  return (
    <g>
      {/* 石料压在滚木上 */}
      {[-60, 0, 60].map((d) => (
        <g key={d}>
          <circle cx={stoneX + d * s} cy={g - 18 * s} r={18 * s} fill="#7a5a34" stroke="#3a2a14" strokeWidth={3 * s} />
          <line x1={stoneX + d * s} y1={g - 18 * s} x2={stoneX + d * s + Math.cos(ph * 9) * 16 * s} y2={g - 18 * s + Math.sin(ph * 9) * 16 * s} stroke="#3a2a14" strokeWidth={3 * s} />
        </g>
      ))}
      <rect x={stoneX - 110 * s} y={g - 200 * s} width={220 * s} height={164 * s} rx={10 * s} fill="#9a9488" stroke="#3a3630" strokeWidth={4 * s} />
      <line x1={stoneX + 110 * s} y1={g - 130 * s} x2={x + 200 * s} y2={ropeY + 30 * s} stroke="#c8a860" strokeWidth={6 * s} />
      {[0, 1, 2, 3].map((i) => {
        const px = x + (-90 + i * 95) * s;
        const p = walkPose(px, g, (ph * 0.8 + i * 0.27) % 1, s, 1);
        const neck: P = lean(p.hip, 32 + tug * 8, s);
        const ry = lerp(g - 130 * s, ropeY + 30 * s, (px - (stoneX + 110 * s)) / (x + 200 * s - (stoneX + 110 * s)));
        return <g key={i}>{R(i % 2 ? PEASANT : PEASANT2, {...p, neck, handN: [px - 30 * s, ry], handF: [px - 60 * s, ry + 4 * s]}, s, {face: 'pain'})}</g>;
      })}
    </g>
  );
};
const Sc31: React.FC<{t: number}> = ({t}) => {
  const card = bt(S31.card);
  const ct = t - card;
  const {x: sx, y: sy} = shakeXY(t, card, 14);
  const pan = easeInOut(clamp01(t / bt(8)));
  const rows: [number, number][] = [[560, 0.26], [660, 0.33], [790, 0.42], [960, 0.54]];
  return (
    <AbsoluteFill style={{transform: `translate(${sx - 60 * pan}px, ${sy}px) scale(${1.06})`}}>
      <Svg>
        <defs>
          <linearGradient id="s31sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a87a50" />
            <stop offset="1" stopColor="#e8c890" />
          </linearGradient>
        </defs>
        <rect width={2000} height={1080} fill="url(#s31sky)" />
        {/* 远处：夯土台基、脚手架、半起的大殿梁架 */}
        <path d="M200 520 L1700 520 L1640 430 L260 430 Z" fill="#a07a4a" stroke="#5a4020" strokeWidth={4} />
        {Array.from({length: 7}, (_, i) => <line key={i} x1={260 + i * 230} y1={430} x2={240 + i * 236} y2={520} stroke="rgba(80,50,20,0.4)" strokeWidth={3} />)}
        <g stroke="#5a3a1a" strokeWidth={8}>
          {[600, 760, 920, 1080, 1240].map((x) => <line key={x} x1={x} y1={430} x2={x} y2={210} />)}
          <line x1={560} y1={230} x2={1280} y2={230} />
          <path d="M520 240 L920 120 L1320 240" fill="none" />
        </g>
        <g stroke="#7a5a34" strokeWidth={4} opacity={0.8}>
          {[420, 1420].map((x) =>
            Array.from({length: 5}, (_, j) => <g key={`${x}_${j}`}><line x1={x} y1={430 - j * 50} x2={x + 120} y2={430 - j * 50} /><line x1={x + j * 30} y1={430} x2={x + j * 30} y2={180} /></g>),
          )}
        </g>
        {/* 杨素在台上督工 */}
        {(() => {
          const p = standPose(1560, 430, 0.34, -1);
          const h = headOf(p.hip, p.neck, 0.34);
          return (
            <g>
              {R(SU, {...p, handN: [p.neck[0] - 50, p.neck[1] + 10]}, 0.34, {face: 'stern'})}
              <NameTag x={h[0]} y={h[1] - 40} text="杨素" size={24} />
            </g>
          );
        })()}
        <rect x={0} y={520} width={2000} height={560} fill="#b89060" />
        {Array.from({length: 10}, (_, i) => <ellipse key={i} cx={(i * 260 + t * 2) % 2200 - 100} cy={560 + (i % 4) * 130} rx={180} ry={20} fill="rgba(240,220,170,0.25)" />)}
        {rows.map(([g, s], ri) =>
          Array.from({length: 5}, (_, j) => {
            const x = 140 + j * (760 * s + 120) + (ri % 2) * 180 * s;
            if (x > 2050) return null;
            return (ri + j) % 2 ? <RopeGroup key={`${ri}_${j}`} x={x + 200 * s} g={g} s={s} t={t} seed={ri * 5 + j} /> : <StoneGroup key={`${ri}_${j}`} x={x} g={g} s={s} t={t} seed={ri * 5 + j} />;
          }),
        )}
        {/* 人数卡 */}
        {ct >= -4 && (
          <g transform={`translate(1000 640) rotate(-5) scale(${ct < 0 ? 2.2 : lerp(1.4, 1, easeOut(clamp01(ct / 5)))})`} opacity={ct < 0 ? 0.4 : 1}>
            <rect x={-330} y={-100} width={660} height={200} rx={14} fill="rgba(120,16,10,0.92)" stroke="#ffd070" strokeWidth={8} />
            <text x={0} y={40} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={110} fill="#fff0c8">每月 200 万人</text>
          </g>
        )}
        {ct >= 0 && (
          <g opacity={1 - clamp01(ct / 20)}>
            <ellipse cx={1000} cy={760} rx={300 + ct * 30} ry={60 + ct * 6} fill="none" stroke="rgba(240,220,170,0.8)" strokeWidth={10} />
            <Dust f={t} at={[1000, 760]} since={ct} n={18} seed={7} spread={420} />
          </g>
        )}
        <Vignette k={0.5} />
      </Svg>
      <Flash f={t} at={card} dur={6} peak={0.35} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 32 屏：★★ 拉尸体的大车，一辆接一辆，望不到头（匀速右移，天色渐暗） ═════════ */
const Cart: React.FC<{x: number; y: number; s: number; t: number; dark?: boolean; foot?: boolean}> = ({x, y, s, t, dark, foot}) => {
  const wood = dark ? '#1a1410' : '#6a4a24';
  const wheel = (t * 1.2) % 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {foot && (
        <g>
          <path d="M-250 -150 l-60 6 l-6 26 l58 -4 Z" fill="#c8a07a" stroke="#5a3a20" strokeWidth={3} />
          <path d="M-316 -122 l64 -4 l2 10 l-66 4 Z" fill="#b89048" stroke="#5a4020" strokeWidth={3} />
          <path d="M-300 -150 l0 30 M-280 -152 l0 28" stroke="#8a6a30" strokeWidth={3} />
        </g>
      )}
      {/* 草席裹着的人形 */}
      <path d="M-260 -130 Q-250 -200 -100 -200 Q60 -214 160 -180 Q200 -160 190 -130 Z" fill={dark ? '#14100c' : '#c8a868'} stroke={dark ? 'none' : '#6a5028'} strokeWidth={3} />
      {!dark && Array.from({length: 9}, (_, i) => <line key={i} x1={-230 + i * 48} y1={-196 + (i > 6 ? 10 : 0)} x2={-236 + i * 48} y2={-132} stroke="#8a6a38" strokeWidth={3} />)}
      <rect x={-280} y={-130} width={490} height={34} fill={wood} stroke={dark ? 'none' : '#2a1a0a'} strokeWidth={3} />
      <line x1={200} y1={-112} x2={420} y2={-150} stroke={wood} strokeWidth={14} strokeLinecap="round" />
      <line x1={200} y1={-100} x2={420} y2={-138} stroke={wood} strokeWidth={6} opacity={0.6} />
      <g transform={`translate(-20 -60) rotate(${wheel})`}>
        <circle cx={0} cy={0} r={74} fill="none" stroke={wood} strokeWidth={14} />
        {Array.from({length: 8}, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 4) * 72} y2={Math.sin((i * Math.PI) / 4) * 72} stroke={wood} strokeWidth={6} />)}
        <circle cx={0} cy={0} r={14} fill={wood} />
      </g>
    </g>
  );
};
const Sc32: React.FC<{t: number}> = ({t}) => {
  const T = bt(8);
  const k = t / T;
  const camX = 1400 * k;
  const dusk = clamp01(k * 1.1);
  const sky0 = `rgb(${lerp(200, 30, dusk)},${lerp(112, 30, dusk)},${lerp(58, 60, dusk)})`;
  const sky1 = `rgb(${lerp(240, 120, dusk)},${lerp(176, 70, dusk)},${lerp(110, 60, dusk)})`;
  const horizon = 600;
  const N = 34;
  const carts = Array.from({length: N}, (_, i) => {
    const d = i / (N - 1);
    const depth = Math.pow(d, 0.7);
    const s = lerp(0.42, 0.035, depth);
    const y = lerp(930, horizon + 4, depth);
    const wx = 900 + i * 150 + t * 0.6 * (1 - depth);
    const x = wx - camX * (1 - depth * 0.85);
    return {i, s, y, x, depth};
  });
  const cs = 0.62;
  const cx = 860;
  const p = walkPose(cx, 1000, (t / 48) % 1, cs, 1);
  const neck: P = lean(p.hip, 30, cs);
  const grip: P = [neck[0] - 10, p.hip[1] + 10];
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s32sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky0} />
            <stop offset="1" stopColor={sky1} />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s32sky)" />
        <circle cx={1500 - camX * 0.05} cy={lerp(470, 640, dusk)} r={70} fill="#ffcf90" opacity={1 - dusk * 0.8} />
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M${((i * 400 - camX * 0.1 + t * 0.6) % 2400) - 200} ${200 + (i % 3) * 60} l16 -8 l16 8 l16 -8 l16 8`} stroke="#1a1410" strokeWidth={4} fill="none" opacity={0.7} />)}
        <g transform={`translate(${-camX * 0.1} 0)`}>
          <path d={`M-200 ${horizon} L200 560 L500 580 L900 540 L1300 575 L1700 550 L2200 570 L2600 548 L3200 566 L3200 ${horizon} Z`} fill={`rgb(${lerp(140, 30, dusk)},${lerp(96, 26, dusk)},${lerp(60, 36, dusk)})`} />
        </g>
        <rect x={0} y={horizon} width={1920} height={480} fill={`rgb(${lerp(150, 50, dusk)},${lerp(112, 40, dusk)},${lerp(70, 40, dusk)})`} />
        {/* 远方工地（左，随镜头退出） */}
        <g transform={`translate(${-camX * 0.5} 0)`} opacity={0.9}>
          {[-200, -40, 120, 280].map((x) => <line key={x} x1={x + 100} y1={horizon} x2={x + 100} y2={horizon - 160} stroke="#2a1e14" strokeWidth={8} />)}
          <path d={`M-100 ${horizon - 150} L460 ${horizon - 150} M-60 ${horizon - 110} L420 ${horizon - 110}`} stroke="#2a1e14" strokeWidth={6} />
          <path d={`M-150 ${horizon} L520 ${horizon} L480 ${horizon - 40} L-120 ${horizon - 40} Z`} fill="#3a2a1a" />
        </g>
        {/* 车道 */}
        <path d={`M${-200 - camX * 0.4} 1080 L${2400} ${horizon + 2} L${2500} ${horizon + 8} L${600 - camX * 0.4} 1080 Z`} fill="rgba(60,40,24,0.35)" />
        {/* 远处车队剪影，一辆比一辆小，排到地平线 */}
        {carts
          .slice()
          .reverse()
          .map((c) =>
            c.x < -200 || c.x > 2100 ? null : (
              <g key={c.i}>
                <Cart x={c.x} y={c.y} s={c.s} t={t} dark />
                {R({robe: '#14100c', robeD: '#14100c', pants: '#14100c', hem: 50, hat: 'none', hair: '#14100c'}, {...walkPose(c.x + 470 * c.s, c.y, (t / 40 + c.i * 0.3) % 1, c.s * 1.0, 1), neck: lean(walkPose(c.x + 470 * c.s, c.y, (t / 40 + c.i * 0.3) % 1, c.s, 1).hip, 30, c.s), handN: [c.x + 420 * c.s, c.y - 150 * c.s], handF: [c.x + 410 * c.s, c.y - 140 * c.s]}, c.s, {face: 'calm', opacity: 0.95})}
              </g>
            ),
          )}
        {/* 地平线上的地名 */}
        {[['东至成皋', 1300], ['北至河阳', 1800]].map(([n, x], i) => {
          const sx2 = (x as number) - camX * 0.18;
          return (
            <g key={i} opacity={clamp01((t - bt(2 + i * 1.6)) / 12)}>
              <line x1={sx2} y1={horizon} x2={sx2} y2={horizon - 60} stroke="#e8d8b0" strokeWidth={3} strokeDasharray="6 6" />
              <text x={sx2} y={horizon - 72} textAnchor="middle" fontFamily={LF.label} fontWeight={900} fontSize={34} fill="#f0e0b8" stroke="#1a1008" strokeWidth={5} paintOrder="stroke">{n}</text>
            </g>
          );
        })}
        {/* 前景车夫：双手攥紧车把，低头拉车；草席外露出一只草鞋脚 */}
        <Cart x={cx - 520} y={1010} s={1} t={t} foot />
        {R({...PEASANT, robe: '#5a4a38', robeD: '#40342a'}, {...p, neck, handN: grip, handF: [grip[0] - 16, grip[1] + 6]}, cs, {face: 'pain', headTilt: 26})}
        {[0, 1].map((i) => <ellipse key={i} cx={grip[0] - 8 * i} cy={grip[1] + 4 * i} rx={14} ry={10} fill="#d8b890" stroke="rgba(0,0,0,0.35)" strokeWidth={2} />)}
        <Sweat x={headOf(p.hip, neck, cs)[0] + 30} y={headOf(p.hip, neck, cs)[1] - 10} s={0.8} />
        {Array.from({length: 18}, (_, i) => <path key={i} d={`M${((i * 130 - camX * 1.3) % 2340 + 2340) % 2340 - 200} 1080 q8 -50 22 -70 M${((i * 130 - camX * 1.3) % 2340 + 2340) % 2340 - 190} 1080 q-6 -40 -20 -56`} stroke={`rgb(${lerp(90, 20, dusk)},${lerp(70, 18, dusk)},${lerp(40, 14, dusk)})`} strokeWidth={5} fill="none" />)}
        <rect width={1920} height={1080} fill={`rgba(10,10,30,${0.35 * dusk})`} />
        <Vignette k={0.65 + 0.2 * dusk} />
      </Svg>
    </AbsoluteFill>
  );
};

/* ═════════ 第 33 屏：地图拉远到全国，洛阳金点闪烁 ═════════ */
const Sc33: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(6)));
  const cam: Cam3 = {lon: lerp(LUOYANG[0], 114.5, k), lat: lerp(LUOYANG[1] - 0.6, 33.0, k), dist: lerp(260, 1900, k), pitch: lerp(52, 66, k), yaw: lerp(8, 0, k)};
  const ring = (t % bt(S33.pulse * 2)) / bt(S33.pulse * 2);
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    const [x, y] = px(...LUOYANG);
    for (const off of [0, 0.5]) {
      const r = ((ring + off) % 1);
      g.strokeStyle = `rgba(255,210,110,${0.9 * (1 - r)})`;
      g.lineWidth = 6;
      g.beginPath();
      g.arc(x, y, 10 + r * 90, 0, Math.PI * 2);
      g.stroke();
    }
    const gr = g.createRadialGradient(x, y, 0, x, y, 60);
    gr.addColorStop(0, 'rgba(255,214,120,0.9)');
    gr.addColorStop(1, 'rgba(255,214,120,0)');
    g.fillStyle = gr;
    g.fillRect(x - 60, y - 60, 120, 120);
  };
  const far = clamp01((k - 0.55) / 0.3);
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={ring.toFixed(2)} opacity={0.95} />
        <Pin3 at={LUOYANG} big />
      </Map3D>
      <Label3 cam={cam} at={LUOYANG} name="洛阳" lift={36} size={lerp(56, 48, k)} />
      <Label3 cam={cam} at={CHANGAN} name="长安" side="left" lift={20} size={34} o={far * 0.8} color="#e8dcc0" />
      <Label3 cam={cam} at={JIANGDU} name="江都" lift={20} size={34} o={far * 0.8} color="#e8dcc0" />
      <Label3 cam={cam} at={ZHUO} name="涿郡" lift={20} size={34} o={far * 0.8} color="#e8dcc0" />
    </AbsoluteFill>
  );
};

/* ═════════ 第 34 屏：南北两半，四条大河东西流；南船撞北岸，北官扒河岸望南 ═════════ */
/** 真实河道（geo.ts 里的地图像素路径）→ 经纬度折线，统一成自西向东 */
const unproj = (x: number, y: number): LL => {
  const lon = ((x + 24576) / 32768) * 360 - 180;
  const yy = (y + 11264) / 32768;
  return [lon, (Math.atan(Math.sinh(Math.PI * (1 - 2 * yy))) * 180) / Math.PI];
};
const riverLines = (d: string): LL[][] =>
  d.split('M').map((seg) => {
    const pts = (seg.match(/-?[\d.]+ -?[\d.]+/g) || []).map((q) => { const [x, y] = q.split(' ').map(Number); return unproj(x, y); });
    return pts.length > 1 && pts[0][0] > pts[pts.length - 1][0] ? pts.reverse() : pts;
  }).filter((p) => p.length > 1);
export const RIVERS: [string, LL[][], LL][] = [
  ['黄河', riverLines(GEO.huang), [116.6, 36.5]],
  ['淮河', riverLines(GEO.huai), [114.6, 32.75]],
  ['长江', riverLines(GEO.yangtze), [115.0, 30.3]],
  ['钱塘江', riverLines(GEO.qiantang), [119.0, 29.55]],
];
export const polyPath = (g: CanvasRenderingContext2D, px: Px, lines: LL[][]) => {
  g.beginPath();
  for (const pts of lines) pts.forEach((q, i) => { const [x, y] = px(q[0], q[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
  g.stroke();
};
const Sc34: React.FC<{t: number}> = ({t}) => {
  const k = clamp01(t / bt(8));
  const cam: Cam3 = {lon: 114.4, lat: lerp(33.4, 33.55, k), dist: lerp(2100, 1980, easeInOut(k)), pitch: 64, yaw: 0};
  const flow = t * 3;
  const tint = easeOut(clamp01(t / bt(1.2)));
  const rv = easeInOut(clamp01((t - bt(0.4)) / bt(1.6)));
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    const [, yN] = px(116, 33.3);
    g.fillStyle = `rgba(200,160,80,${0.22 * tint})`;
    g.fillRect(0, 0, g.canvas.width, yN);
    g.fillStyle = `rgba(80,170,90,${0.2 * tint})`;
    g.fillRect(0, yN, g.canvas.width, g.canvas.height - yN);
    g.save();
    g.setLineDash([18, 12]);
    g.strokeStyle = `rgba(255,240,200,${0.8 * tint})`;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0, yN);
    g.lineTo(g.canvas.width, yN);
    g.stroke();
    g.restore();
    g.save();
    g.lineCap = 'round';
    g.lineJoin = 'round';
    // 自西向东逐渐显出（东流）
    const [xc] = px(lerp(108, 123, rv), 32);
    g.beginPath();
    g.rect(0, 0, xc, g.canvas.height);
    g.clip();
    for (const [, lines] of RIVERS) {
      g.setLineDash([]);
      g.strokeStyle = 'rgba(10,30,60,0.6)';
      g.lineWidth = 15;
      polyPath(g, px, lines);
      g.strokeStyle = '#4aa8e0';
      g.lineWidth = 8;
      polyPath(g, px, lines);
      g.setLineDash([12, 22]);
      g.lineDashOffset = -flow;
      g.strokeStyle = 'rgba(220,245,255,0.95)';
      g.lineWidth = 3.5;
      for (const pts of lines) if (pts.length > 8) polyPath(g, px, [pts]);
    }
    g.restore();
  };
  // 粮仓（江南）、撞岸的小船、扒岸的北方官员
  const [bx, by] = project(cam, 120.85, 30.35, 4);
  const bump = bt(S34.bump);
  const go = clamp01((t - bt(1.6)) / (bump - bt(1.6)));
  const after = t - bump;
  const boatLL: LL = after < 0 ? [119.5, lerp(30.95, 32.33, easeIn(go))] : [119.55 - 0.05 * Math.sin(after / 3), 32.3 - 0.1 * easeOut(clamp01(after / 8))];
  const [sx, sy] = project(cam, boatLL[0], boatLL[1], 4);
  const spin = after > 0 ? after * 18 : 0;
  const [ox, oy] = project(cam, 118.55, 36.95, 4);
  const nP = project(cam, 121.4, 35.2, 0);
  const sP = project(cam, 121.0, 28.8, 0);
  const neckK = easeInOut(clamp01((t - bt(2.4)) / bt(2)));
  const os = 0.36;
  const oHip: P = [ox, oy - 40];
  const oNeck: P = [ox + 4, oy - 40 - 200 * os];
  const head: P = [oNeck[0] + 14 + 95 * neckK, oNeck[1] - 30 + 55 * neckK];
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={`${Math.floor(flow)}_${tint.toFixed(2)}_${rv.toFixed(2)}`} opacity={0.95} landOnly={false} />
      </Map3D>
      {RIVERS.map(([n, , at]) => <Label3 key={n} cam={cam} at={at} name={n} lift={10} size={36} o={rv} color="#bfe6ff" />)}
      <Svg>
        <text x={nP[0]} y={nP[1]} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={60} fill="#f0d090" stroke="#1a1008" strokeWidth={6} paintOrder="stroke" opacity={tint}>北</text>
        <text x={sP[0]} y={sP[1]} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={60} fill="#a8e0a0" stroke="#1a1008" strokeWidth={6} paintOrder="stroke" opacity={tint}>南</text>
        {/* 江南粮仓：满得往外溢 */}
        <g transform={`translate(${bx} ${by})`}>
          {[-60, 0, 60].map((d, i) => (
            <g key={d} transform={`translate(${d} ${i === 1 ? -10 : 0}) scale(${1 + 0.06 * Math.sin(t / 4 + i)})`}>
              <rect x={-26} y={-50} width={52} height={50} fill="#d8b878" stroke="#5a4020" strokeWidth={3} />
              <path d="M-34 -50 L0 -80 L34 -50 Z" fill="#8a5a2a" stroke="#3a2010" strokeWidth={3} />
            </g>
          ))}
          {Array.from({length: 16}, (_, i) => {
            const a = ((t * 1.5 + i * 11) % 40) / 40;
            return <ellipse key={i} cx={(i % 2 ? 1 : -1) * (30 + a * 60) + (i % 3) * 10} cy={-30 + a * a * 70} rx={4} ry={3} fill="#f0d060" opacity={1 - a} />;
          })}
          <path d="M-100 0 Q0 18 100 0 L110 14 Q0 30 -110 14 Z" fill="#e8c860" />
        </g>
        {/* 运粮小船：船头朝北往上冲，撞上江北陆地 */}
        <g transform={`translate(${sx} ${sy}) rotate(${-90 + spin * 0.6 + (after > 0 ? 18 : 0)})`}>
          <path d="M-40 -14 L34 -14 L48 0 L34 14 L-40 14 Z" fill="#7a4a1e" stroke="#2a1408" strokeWidth={3} />
          {[-24, -8, 8].map((d) => <ellipse key={d} cx={d} cy={0} rx={8} ry={7} fill="#e8c860" stroke="#8a6a20" strokeWidth={2} />)}
          {after < 0 && <path d="M-44 -10 l-30 -6 M-44 10 l-30 6" stroke="rgba(220,245,255,0.8)" strokeWidth={4} />}
        </g>
        {after > 0 && after < 70 && (
          <g>
            {[0, 1, 2].map((i) => {
              const a = after / 8 + (i * Math.PI * 2) / 3;
              return <text key={i} x={sx + Math.cos(a) * 46} y={sy - 50 + Math.sin(a) * 16} textAnchor="middle" fontSize={30} fill="#ffe070" stroke="#3a2a0a" strokeWidth={3} paintOrder="stroke">★</text>;
            })}
            {after < 10 && <text x={sx + 50} y={sy - 30} fontFamily={LF.serif} fontWeight={900} fontSize={64} fill="#f4e2b0" stroke="#3a1a0c" strokeWidth={6} paintOrder="stroke">咚！</text>}
          </g>
        )}
        {/* 北方官员：双手扒着黄河岸，脖子拉长往南看 */}
        <g>
          <path d={`M${oNeck[0] - 6} ${oNeck[1]} Q${oNeck[0] - 12} ${(oNeck[1] + head[1]) / 2} ${head[0] - 4} ${head[1] + 20}`} stroke="#e6c9a0" strokeWidth={14} fill="none" strokeLinecap="round" />
          {R(OFFICIAL, {hip: oHip, neck: oNeck, handN: [ox + 30, oy + 6], handF: [ox - 26, oy + 8], footN: [ox + 10, oy - 40 + 120 * os * 1.8], footF: [ox - 10, oy - 40 + 120 * os * 1.8], facing: 1}, os, {face: 'shock', headAt: head, front: true})}
          <path d={`M${ox - 70} ${oy + 10} Q${ox} ${oy - 4} ${ox + 70} ${oy + 10}`} stroke="#8a6a3a" strokeWidth={8} fill="none" />
          {neckK > 0.5 && <path d={`M${head[0] + 30} ${head[1] + 20} l34 34 m-18 0 l18 0 l0 -18`} stroke="#fff0c8" strokeWidth={4} fill="none" opacity={neckK} />}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s29: Sc29, s30: Sc30, s31: Sc31, s32: Sc32, s33: Sc33, s34: Sc34};

export const Act5: React.FC<{f: number}> = ({f}) => {
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
export const ACT5_START = fbt(SHOT.s29[0]);
