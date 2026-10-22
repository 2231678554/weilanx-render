import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {Flash, shakeXY} from '../../library/lamplight/stage';
import {LF} from '../../library/lamplight/theme';
import {headOf, slowT, Sweat} from '../ep53-changan-curfew/Kit';
import {kneelPose, P, Rig, RigProps, standPose, stoolPose, walkPose} from '../ep53-changan-curfew/Rig';
import {Candle} from '../ep53-changan-curfew/Sets';
import {Drape, Label3, Map3D, Pin3, world, type Cam3, type Px} from './Map3D';
import {lerp, Svg} from './Opening';
import {Brush, Dust} from './Props';
import {Beam, Brackets, CAST, Curtain, Floor, Lattice, NameTag, Pillar, Screen, Shelf, Vignette} from './Sets54';
import {B, fbt, S17, S18, S19, S20, S21, S22, SHOT} from './timeline';

type Pose = Partial<RigProps> & {hip: P; neck: P};
const R = (look: Partial<RigProps>, pose: Pose, s: number, more: Partial<RigProps> = {}, children?: React.ReactNode) => (
  <Rig {...(look as RigProps)} {...(pose as RigProps)} s={s} {...more}>
    {children}
  </Rig>
);
const lean = (hip: P, a: number, s: number, len = 200): P => [hip[0] + Math.sin((a * Math.PI) / 180) * len * s, hip[1] - Math.cos((a * Math.PI) / 180) * len * s];
const bt = (b: number) => b * B;
const lp = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

const SU: Partial<RigProps> = {robe: '#4e2a66', robeD: '#341a48', pants: '#241a2a', hem: 150, beard: true, beardC: '#eeeae2'};
/** 宣华夫人：年轻、浅青襦裙 */
const XH: Partial<RigProps> = {robe: '#9ccfc4', robeD: '#6fa89c', hat: 'bun', skirt: true, shawl: '#f0e0b0', hem: 200};
/** 张衡：深绿官袍 */
const ZH: Partial<RigProps> = {robe: '#2e4a3a', robeD: '#1e3428', pants: '#1a1a1a', hem: 130};
const ENVOY: Partial<RigProps> = {robe: '#5a4a3a', robeD: '#3e3226', pants: '#221a14', hem: 120, hat: 'futou'};

const Stache: React.FC<{h: P; s: number; facing: number; hitch?: number}> = ({h, s, facing, hitch = 0}) => (
  <g transform={`translate(${h[0]} ${h[1]}) scale(${s})`}>
    <path d={`M${facing * 14} 14 q${facing * 10} -4 ${facing * 22} ${4 - 16 * hitch}`} stroke="#1b1410" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

const Stamp: React.FC<{x: number; y: number; text: string; p: number; sub?: string}> = ({x, y, text, p, sub}) =>
  p <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(-6) scale(${lerp(1.8, 1, easeOut(clamp01(p)))})`} opacity={Math.min(1, p * 2)}>
      <rect x={-150} y={-70} width={300} height={140} rx={8} fill="rgba(30,8,6,0.8)" stroke="#d8402e" strokeWidth={8} />
      <text x={0} y={32} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={92} fill="#e8503a">{text}</text>
      {sub && <text x={0} y={110} textAnchor="middle" fontFamily={LF.label} fontWeight={900} fontSize={38} fill="#ffe0a8">{sub}</text>}
    </g>
  );

/** 夜色寝殿：床榻 + 帐子 */
const Bed: React.FC<{x: number; y: number; w?: number; open?: number}> = ({x, y, w = 760, open = 1}) => (
  <g>
    <rect x={x - w / 2 - 30} y={y - 520} width={w + 60} height={40} fill="#3a1a0c" stroke="#c99a3a" strokeWidth={3} />
    <rect x={x - w / 2 - 20} y={y - 480} width={24} height={480} fill="#3a1a0c" />
    <rect x={x + w / 2 - 4} y={y - 480} width={24} height={480} fill="#3a1a0c" />
    <path d={`M${x - w / 2} ${y - 480} Q${x - w / 2 + 80 * open} ${y - 300} ${x - w / 2 + 60 * open} ${y - 80} L${x - w / 2} ${y - 80} Z`} fill="#6a2a3a" opacity={0.9} />
    <path d={`M${x + w / 2} ${y - 480} Q${x + w / 2 - 80 * open} ${y - 300} ${x + w / 2 - 60 * open} ${y - 80} L${x + w / 2} ${y - 80} Z`} fill="#6a2a3a" opacity={0.9} />
    <path d={`M${x - w / 2} ${y - 480} Q${x} ${y - 420} ${x + w / 2} ${y - 480}`} stroke="#8a3a4a" strokeWidth={30} fill="none" />
    <rect x={x - w / 2 - 20} y={y - 120} width={w + 40} height={40} fill="#5a2a14" stroke="#1a0a04" strokeWidth={3} />
    <rect x={x - w / 2 - 20} y={y - 80} width={w + 40} height={80} fill="#3a1a0c" />
    {Array.from({length: 6}, (_, i) => <rect key={i} x={x - w / 2 + i * (w / 6) + 14} y={y - 70} width={w / 6 - 28} height={56} fill="#2a1008" stroke="#c99a3a" strokeWidth={2} />)}
  </g>
);
/** 盖在人身上的被子 */
const Quilt: React.FC<{x0: number; x1: number; y: number; h?: number; heave?: number}> = ({x0, x1, y, h = 70, heave = 0}) => (
  <g>
    <path d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y - h - heave} ${x1} ${y - h * 0.4} L${x1 + 20} ${y + 10} L${x0 - 10} ${y + 10} Z`} fill="#b8922a" stroke="#6a4a10" strokeWidth={4} />
    {[0.25, 0.5, 0.75].map((k) => <circle key={k} cx={lerp(x0, x1, k)} cy={y - h * 0.7 * Math.sin(k * Math.PI) - 4} r={12} fill="none" stroke="#e8c060" strokeWidth={3} />)}
  </g>
);
const NightWindow: React.FC<{x: number; y: number; w: number; h: number; f: number}> = ({x, y, w, h, f}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#0e1a2e" />
    <circle cx={x + w * 0.7} cy={y + h * 0.3} r={Math.min(w, h) * 0.14} fill="#e8e4c8" />
    <circle cx={x + w * 0.7} cy={y + h * 0.3} r={Math.min(w, h) * 0.24} fill="rgba(232,228,200,0.15)" />
    <path d={`M${x} ${y + h * 0.75} Q${x + w * 0.3} ${y + h * 0.6} ${x + w * 0.6} ${y + h * 0.72} T${x + w} ${y + h * 0.68} L${x + w} ${y + h} L${x} ${y + h} Z`} fill="#06101c" />
    {Array.from({length: 4}, (_, i) => <line key={i} x1={x + ((i + 1) * w) / 5} y1={y} x2={x + ((i + 1) * w) / 5} y2={y + h} stroke="#2a140a" strokeWidth={8} />)}
    {Array.from({length: 3}, (_, i) => <line key={i} x1={x} y1={y + ((i + 1) * h) / 4} x2={x + w} y2={y + ((i + 1) * h) / 4} stroke="#2a140a" strokeWidth={8} />)}
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#2a140a" strokeWidth={16} />
    <circle cx={x + 40 + ((f * 0.3) % (w - 80))} cy={y + h * 0.2} r={2} fill="#fff" opacity={0.6} />
  </g>
);

/* ═════════ 第 17 屏：仁寿宫夜，回廊拽袖 → 扑到床沿 ═════════ */
const Sc17A: React.FC<{t: number}> = ({t}) => {
  const free = bt(S17.free);
  const pull = easeInOut(clamp01((t - bt(0.5)) / (free - bt(0.5))));
  const after = clamp01((t - free) / 10);
  const gs = 0.74, xs = 0.68;
  const gp = standPose(820, 1000, gs, 1);
  const gNeck: P = lean(gp.hip, 10, gs);
  const gh = headOf(gp.hip, gNeck, gs);
  const xBase = 1180 + 70 * easeOut(after) + 24 * pull;
  const xp = standPose(xBase, 1000, xs, -1);
  const xNeck: P = lean(xp.hip, after > 0 ? 10 * (1 - after) + 4 : 18 * pull, xs);
  const xh = headOf(xp.hip, xNeck, xs);
  const grab: P = [lerp(gNeck[0] + 150 * gs, 1030 + 16 * pull, Math.min(1, pull * 4)), gNeck[1] + 110 * gs];
  const snap = after > 0;
  // 宽大的水袖：从她的前臂垂出，被杨广攥住袖口
  const elb: P = [xNeck[0] - 62 * xs, xNeck[1] + 66 * xs];
  const wrist: P = [xNeck[0] - 20 * xs, xNeck[1] + 118 * xs];
  const sag = 26 - 14 * pull;
  const mid: P = [(wrist[0] + grab[0]) / 2, Math.max(wrist[1], grab[1]) + sag];
  const sleeve = `M${elb[0]} ${elb[1] - 14} Q${mid[0]} ${mid[1] - 34} ${grab[0] + 6} ${grab[1] - 26} L${grab[0] - 4} ${grab[1] + 30} Q${mid[0]} ${mid[1] + 30} ${wrist[0]} ${wrist[1] + 22} Z`;
  const pin = clamp01((t - free) / 12);
  const pinP: P = [lerp(xh[0] - 20, 1110, pin), lerp(xh[1] - 30, 990, easeIn(pin))];
  return (
    <AbsoluteFill style={{transform: `scale(${1.04 + 0.08 * clamp01(t / bt(4))})`, transformOrigin: '1000px 700px'}}>
      <Svg>
        <defs>
          <linearGradient id="s17gauze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(200,190,230,0.32)" />
            <stop offset="1" stopColor="rgba(200,190,230,0.04)" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="#0c0a12" />
        <NightWindow x={260} y={240} w={520} h={420} f={t} />
        <NightWindow x={1240} y={240} w={520} h={420} f={t + 40} />
        <rect width={1920} height={1080} fill="rgba(10,16,40,0.35)" />
        <Pillar id="s17p1" x={140} y0={60} y1={1080} w={120} color="#5a1a14" dark="#1e0806" />
        <Pillar id="s17p2" x={1000} y0={60} y1={1080} w={110} color="#5a1a14" dark="#1e0806" />
        <Pillar id="s17p3" x={1860} y0={60} y1={1080} w={120} color="#5a1a14" dark="#1e0806" />
        <Beam id="s17b" y={130} h={56} base="#1e2a2a" />
        <rect width={1920} height={70} fill="#06060a" />
        {/* 被夜风吹动的纱幔 */}
        {[[200, 420], [1060, 1240], [1700, 1800]].map(([a, b], i) => (
          <path key={i} d={`M${a} 186 L${b} 186 Q${b + 20 * Math.sin(t / 9 + i)} 520 ${b - 30 + 26 * Math.sin(t / 7 + i)} 900 L${a + 20 * Math.sin(t / 8 + i)} 900 Q${a - 10} 520 ${a} 186 Z`} fill="url(#s17gauze)" />
        ))}
        <Floor id="s17f" y={760} c1="#1e1a22" c2="#08060a" lines="rgba(120,120,160,0.12)" />
        <ellipse cx={1010} cy={900} rx={520} ry={60} fill="rgba(220,220,190,0.06)" />
        {[560, 1500].map((x, i) => (
          <g key={x}>
            <line x1={x} y1={190} x2={x} y2={260} stroke="#2a1a10" strokeWidth={4} />
            <rect x={x - 34} y={260} width={68} height={92} rx={18} fill="#c8502a" opacity={0.8 + 0.1 * Math.sin(t / 3 + i)} />
            <circle cx={x} cy={306} r={120} fill="rgba(255,150,80,0.12)" />
          </g>
        ))}
        {/* 宣华夫人往回扯袖；挣脱后护住袖子退开 */}
        {R(XH, {...xp, neck: xNeck, elbowN: snap ? undefined : elb, handN: snap ? [xNeck[0] - 10, xNeck[1] + 70 * xs] : wrist, handF: snap ? [xNeck[0] + 14, xNeck[1] + 76 * xs] : [xNeck[0] + 60 * xs, xNeck[1] + 150 * xs]}, xs, {face: snap ? 'shock' : 'pain', headTilt: snap ? 8 : 16 * pull, facing: -1})}
        {!snap && (
          <g>
            <path d={sleeve} fill={XH.robe} stroke={XH.robeD} strokeWidth={3} />
            {[0.3, 0.55, 0.8].map((k) => <path key={k} d={`M${lerp(wrist[0], grab[0], k)} ${lerp(wrist[1], grab[1], k) - 6} q8 ${sag * 0.6 + 10} 0 ${30 + sag * 0.3}`} stroke={XH.robeD} strokeWidth={3} fill="none" />)}
            <path d={`M${grab[0] + 6} ${grab[1] - 26} L${grab[0] - 4} ${grab[1] + 30}`} stroke="#f0e0b0" strokeWidth={6} />
          </g>
        )}
        {snap && (
          <g>
            <path d={`M${xNeck[0] - 30} ${xNeck[1] + 60 * xs} q-40 ${30 + 20 * after} -30 ${70 + 20 * after} l30 -6 q0 -40 26 -60 Z`} fill={XH.robe} stroke={XH.robeD} strokeWidth={3} />
            {after < 1 && (
              <g stroke="#f4e6c0" strokeWidth={5} opacity={1 - after}>
                {[0, 1, 2, 3].map((i) => <line key={i} x1={grab[0] + 20} y1={grab[1] - 30 + i * 20} x2={grab[0] + 70 + i * 10} y2={grab[1] - 50 + i * 30} />)}
              </g>
            )}
          </g>
        )}
        {/* 发簪被甩落 */}
        {snap && <g transform={`translate(${pinP[0]} ${pinP[1]}) rotate(${pin * 300})`}><rect x={-26} y={-3} width={52} height={6} rx={3} fill="#e8c060" /><circle cx={-26} cy={0} r={7} fill="#d8402e" /></g>}
        {/* 杨广：右手攥袖口 */}
        {R(CAST.guangJin, {...gp, neck: gNeck, handN: snap ? [lerp(grab[0], gNeck[0] + 90, after), grab[1] + 20 * after] : grab, handF: [gp.hip[0] - 10, gp.hip[1] + 30]}, gs, {face: snap ? 'shock' : 'smile', headTilt: snap ? -8 : 4})}
        <Stache h={gh} s={gs} facing={1} hitch={snap ? 0 : 1} />
        {snap && <Sweat x={gh[0] - 40} y={gh[1] - 20} s={0.9} />}
        <Vignette k={0.7} />
      </Svg>
    </AbsoluteFill>
  );
};

const Sc17B: React.FC<{t: number}> = ({t}) => {
  const ws = 0.6;
  const bedY = 900;
  const wHip: P = [1180, bedY - 150];
  const wNeck: P = [1180 - 200 * ws, bedY - 162];
  const dive = easeOut(clamp01(t / 10));
  const xs = 0.62;
  const xHip: P = [lerp(560, 760, dive), 960 - 90 * xs];
  const sob = Math.abs(Math.sin(t / 3.4));
  const xNeck: P = [xHip[0] + 120 * xs, xHip[1] - 140 * xs + sob * 8];
  const xh = headOf(xHip, xNeck, xs);
  const year = clamp01((t - bt(S17.year - 4)) / 8);
  return (
    <AbsoluteFill style={{transform: `scale(${1.04 + 0.04 * clamp01(t / bt(4))})`}}>
      <Svg>
        <defs>
          <radialGradient id="s17glow" cx="0.5" cy="0.62" r="0.5">
            <stop offset="0" stopColor="rgba(255,170,90,0.42)" />
            <stop offset="1" stopColor="rgba(255,170,90,0)" />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="#140a08" />
        <Screen x={660} y={180} w={900} h={320} panels={6} art="crane" />
        <rect width={1920} height={1080} fill="rgba(10,6,20,0.45)" />
        <Bed x={1100} y={bedY} w={820} />
        <rect x={wNeck[0] - 50 * ws - 70} y={bedY - 162} width={130} height={42} rx={16} fill="#d8c8a0" stroke="#8a7a5a" strokeWidth={3} />
        {R(CAST.wen, {hip: wHip, neck: wNeck, handN: [wNeck[0] + 60, wNeck[1] + 50], handF: [wNeck[0] + 90, wNeck[1] + 40], footN: [wHip[0] + 220, wHip[1] + 10], footF: [wHip[0] + 230, wHip[1]], kneeN: [wHip[0] + 110, wHip[1] - 4], kneeF: [wHip[0] + 110, wHip[1] - 8], facing: -1}, ws, {face: 'sleepy', hem: 40, headAt: [wNeck[0] - 50 * ws, bedY - 176]})}
        <Quilt x0={wNeck[0] + 6} x1={1480} y={bedY - 120} h={64} heave={Math.sin(t / 8) * 3} />
        {/* 宣华夫人扑在床沿，双手掩面，肩膀一耸一耸 */}
        {R(XH, {hip: xHip, neck: xNeck, kneeN: [xHip[0] + 90 * xs, 960 - 16], kneeF: [xHip[0] + 80 * xs, 960 - 16], footN: [xHip[0] - 30, 952], footF: [xHip[0] - 40, 952], handN: [xh[0] + 20, xh[1] + 10], handF: [xh[0] + 30, xh[1] + 20], facing: 1}, xs, {face: 'pain', headTilt: 30, hem: 90})}
        <ellipse cx={xh[0] + 26} cy={xh[1] + 14} rx={26} ry={18} fill="#e6c9a0" stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
        {sob > 0.8 && <path d={`M${xh[0] - 30} ${xh[1] - 60} l-10 -16 M${xh[0] - 10} ${xh[1] - 66} l0 -18 M${xh[0] + 10} ${xh[1] - 60} l10 -16`} stroke="#f4e6c0" strokeWidth={4} strokeLinecap="round" />}
        <Candle f={t} x={420} y={900} h={110} s={1.2} />
        <Candle f={t} x={1640} y={880} h={90} s={1.1} seed={3} />
        <rect width={1920} height={1080} fill="url(#s17glow)" />
        <Stamp x={1640} y={300} text="604 年" p={year} />
        <Vignette k={0.7} />
      </Svg>
    </AbsoluteFill>
  );
};
const Sc17: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    {t < bt(4) ? <Sc17A t={t} /> : <Sc17B t={t - bt(4)} />}
    <Flash f={t} at={bt(4)} dur={5} peak={0.35} />
  </AbsoluteFill>
);

/* ═════════ 第 18 屏：★★ 「召我儿——是杨勇！」 ═════════ */
const Sc18: React.FC<{t: number}> = ({t}) => {
  const hit = bt(S18.point);
  const st = slowT(t, hit, 0.35, 40);
  const rise = easeOut(clamp01(st / (hit - 2)));
  const ws = 0.66;
  const bedY = 860;
  const wHip: P = [1040, bedY - 150];
  const ang = lerp(84, 28, rise);
  const wNeck: P = [wHip[0] - Math.sin((ang * Math.PI) / 180) * 200 * ws, wHip[1] - Math.cos((ang * Math.PI) / 180) * 200 * ws];
  const wh = headOf(wHip, wNeck, ws);
  const tremble = t > hit - 6 ? Math.sin(t * 2.7) * 5 + Math.sin(t * 4.1) * 3 : 0;
  const point = easeOutBack(clamp01((st - hit + 8) / 10));
  const handN: P = [lerp(wNeck[0] + 60, wNeck[0] + 230 * ws, point) + tremble * 0.4, lerp(wNeck[1] + 80, wNeck[1] + 10, point) + tremble];
  const handF: P = [wNeck[0] - 30, bedY - 124];
  const write = t > hit;
  const ofs = (i: number) => (write ? Math.sin(t * 1.6 + i * 2) * 14 : 0);
  const {x: sx, y: sy} = shakeXY(t, hit, 12);
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${1 + 0.06 * easeInOut(clamp01(t / bt(8)))})`, transformOrigin: '960px 640px'}}>
      <Svg>
        <defs>
          <radialGradient id="s18glow" cx="0.55" cy="0.6" r="0.5">
            <stop offset="0" stopColor="rgba(255,170,90,0.42)" />
            <stop offset="1" stopColor="rgba(255,170,90,0)" />
          </radialGradient>
          <linearGradient id="s18door" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(220,230,255,0.0)" />
            <stop offset="1" stopColor="rgba(220,230,255,0.35)" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="#140a08" />
        <Screen x={360} y={180} w={900} h={320} panels={6} art="crane" />
        <rect width={1920} height={1080} fill="rgba(10,6,20,0.45)" />
        {/* 殿门：右边，门缝透冷光 */}
        <rect x={1560} y={160} width={300} height={760} fill="#2a1208" stroke="#5a2a14" strokeWidth={12} />
        <rect x={1700} y={170} width={14} height={740} fill="#c8d4f0" opacity={0.55} />
        <path d="M1714 170 L1200 920 L1714 910 Z" fill="url(#s18door)" opacity={0.25} />
        <Bed x={900} y={bedY} w={820} />
        <rect x={790} y={bedY - 160} width={120} height={40} rx={16} fill="#d8c8a0" stroke="#8a7a5a" strokeWidth={3} />
        {R(CAST.wen, {hip: wHip, neck: wNeck, handN, handF, footN: [wHip[0] + 240, wHip[1] + 10], footF: [wHip[0] + 250, wHip[1]], kneeN: [wHip[0] + 120, wHip[1] - 4], kneeF: [wHip[0] + 120, wHip[1] - 8], facing: 1}, ws, {face: rise > 0.6 ? 'shout' : 'sleepy', hem: 30, mouth: point, headTilt: -10 * point})}
        {/* 左手死死撑住床板 */}
        <ellipse cx={handF[0]} cy={handF[1]} rx={18} ry={10} fill="#e6c9a0" stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
        {rise > 0.4 && <path d={`M${handF[0] - 30} ${handF[1] + 8} l-12 10 M${handF[0] + 30} ${handF[1] + 8} l12 10`} stroke="#f4e6c0" strokeWidth={4} />}
        <Quilt x0={wHip[0] - 70} x1={1320} y={bedY - 120} h={78} />
        {point > 0.3 && <path d={`M${handN[0] + 20} ${handN[1]} L1540 ${handN[1] - 40}`} stroke="rgba(244,226,176,0.5)" strokeWidth={4} strokeDasharray="14 12" />}
        {point > 0.3 && <Sweat x={wh[0] - 40} y={wh[1] - 20} s={0.9} />}
        {/* 床前两名大臣跪坐，左手按纸，右手握笔飞快书写 */}
        {[0, 1].map((i) => {
          const s = 0.74;
          const x = 300 + i * 900;
          const g = 1000;
          const p = kneelPose(x, g, s, 1);
          const paper: P = [x + 170 * s, g - 10];
          const pen: P = [paper[0] + 20 + ofs(i), g - 30 + (write ? Math.abs(Math.sin(t * 2.2 + i)) * -10 : 0)];
          return (
            <g key={i}>
              <rect x={paper[0] - 120} y={g - 4} width={250} height={34} fill="#3a1a0c" stroke="#c99a3a" strokeWidth={2} />
              <path d={`M${paper[0] - 90} ${g - 4} L${paper[0] + 100} ${g - 4} L${paper[0] + 88} ${g - 26} L${paper[0] - 78} ${g - 26} Z`} fill="#efe6cc" />
              {write && Array.from({length: Math.min(7, Math.floor((t - hit) / 4))}, (_, k) => <line key={k} x1={paper[0] + 70 - k * 22} y1={g - 22} x2={paper[0] + 70 - k * 22} y2={g - 8} stroke="#1b1410" strokeWidth={3} />)}
              {R(i ? CAST.offG : CAST.offR, {...p, neck: lean(p.hip, 24, s), handN: pen, handF: [paper[0] - 60, g - 16]}, s, {face: 'shock'})}
              <Brush at={pen} s={s} ang={-30 + ofs(i)} />
            </g>
          );
        })}
        <Candle f={t} x={260} y={900} h={110} s={1.2} />
        <rect width={1920} height={1080} fill="url(#s18glow)" />
        <Vignette k={0.72} />
      </Svg>
      <Flash f={t} at={hit} dur={10} peak={0.85} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 19 屏：杨素递诏书草稿 → 张衡进寝殿，门缝烛光熄灭 ═════════ */
const Sc19: React.FC<{t: number}> = ({t}) => {
  const hand = easeInOut(clamp01(t / bt(1.6)));
  const ss = 0.8, gs = 0.8, zs = 0.78;
  const sx = lerp(60, 330, hand);
  const sp = hand < 1 ? walkPose(sx, 1000, (t / 12) % 1, ss, 1) : standPose(sx, 1000, ss, 1);
  const sNeck: P = lean(sp.hip, hand < 1 ? 12 : 6, ss);
  const gp = standPose(600, 1010, gs, -1);
  const gh = headOf(gp.hip, gp.neck, gs);
  const give = clamp01((t - bt(1.3)) / 10);
  const paper: P = lp([sNeck[0] + 90 * ss, sNeck[1] + 90 * ss], [gp.neck[0] - 90 * gs, gp.neck[1] + 90 * gs], easeInOut(give));
  const zIn = clamp01((t - bt(S19.enter)) / bt(1.8));
  const zx = lerp(880, 1480, easeInOut(zIn));
  const zp = zIn > 0 && zIn < 1 ? walkPose(zx, 1000, (t / 14) % 1, zs, 1) : standPose(zx, 1000, zs, 1);
  const doorL = 1240, doorR = 1720, doorTop = 240, doorBot = 1000;
  const open = t < bt(S19.enter) ? easeOut(clamp01((t - bt(S19.enter) + bt(1)) / bt(0.8))) : 1 - easeInOut(clamp01((t - bt(S19.shut)) / bt(1.6)));
  const leafW = (doorR - doorL) / 2;
  const gapW = 2 * leafW * open;
  const out = t > bt(S19.out);
  const flick = out ? 0 : 0.85 + 0.15 * Math.sin(t / 2.3);
  const smoke = t - bt(S19.out);
  const zOp = zIn < 1 ? 1 : Math.max(0, 1 - (t - bt(S19.enter) - bt(1.8)) / 6);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s19in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd28a" />
            <stop offset="1" stopColor="#c8702a" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="#0c0a10" />
        <NightWindow x={180} y={260} w={440} h={360} f={t} />
        <rect width={1920} height={1080} fill="rgba(10,16,40,0.35)" />
        <Beam id="s19b" y={130} h={56} base="#1e2a2a" />
        <rect width={1920} height={70} fill="#06060a" />
        <Floor id="s19f" y={760} c1="#1e1a22" c2="#08060a" lines="rgba(120,120,160,0.12)" />
        {/* 寝殿门：门里烛光 */}
        <rect x={doorL - 40} y={doorTop - 50} width={doorR - doorL + 80} height={doorBot - doorTop + 50} fill="#2a1008" />
        <rect x={doorL} y={doorTop} width={doorR - doorL} height={doorBot - doorTop} fill="url(#s19in)" opacity={flick} />
        {/* 门内：远处床帐与一点烛火 */}
        <g opacity={flick}>
          <path d={`M${doorL + 60} ${doorBot - 120} L${doorR - 60} ${doorBot - 120} L${doorR - 60} ${doorBot - 60} L${doorL + 60} ${doorBot - 60} Z`} fill="rgba(90,40,20,0.55)" />
          <path d={`M${doorL + 70} ${doorTop + 160} Q${doorL + 140} ${doorTop + 380} ${doorL + 110} ${doorBot - 120} L${doorL + 70} ${doorBot - 120} Z M${doorR - 70} ${doorTop + 160} Q${doorR - 140} ${doorTop + 380} ${doorR - 110} ${doorBot - 120} L${doorR - 70} ${doorBot - 120} Z`} fill="rgba(120,40,40,0.45)" />
          <rect x={doorL + 60} y={doorTop + 140} width={doorR - doorL - 120} height={24} fill="rgba(80,30,16,0.6)" />
          <rect x={(doorL + doorR) / 2 + 120} y={doorBot - 190} width={10} height={60} fill="#f4e6c0" />
          <ellipse cx={(doorL + doorR) / 2 + 125} cy={doorBot - 202} rx={6} ry={12} fill="#fff2b0" />
          <circle cx={(doorL + doorR) / 2 + 125} cy={doorBot - 200} r={60} fill="rgba(255,230,150,0.35)" />
        </g>
        {!out && <rect x={(doorL + doorR) / 2 - gapW / 2} y={doorTop} width={gapW} height={doorBot - doorTop} fill="rgba(255,200,120,0.15)" />}
        {zOp > 0 && <g opacity={zOp}>{R(ZH, {...zp}, zs, {face: 'stern'})}</g>}
        {[-1, 1].map((side) => {
          const x0 = side < 0 ? doorL : doorR - (leafW - gapW / 2);
          const w = leafW - gapW / 2;
          return (
            <g key={side}>
              <rect x={x0} y={doorTop} width={Math.max(0, w)} height={doorBot - doorTop} fill="#5a2414" stroke="#1a0804" strokeWidth={5} />
              {w > 40 && Array.from({length: 4}, (_, r) => <rect key={r} x={x0 + 20} y={doorTop + 30 + r * 180} width={w - 40} height={150} fill="none" stroke="#3a1408" strokeWidth={6} />)}
            </g>
          );
        })}
        {!out && gapW > 0 && <path d={`M${(doorL + doorR) / 2 - gapW / 2} ${doorBot} L${(doorL + doorR) / 2 + gapW / 2} ${doorBot} L${(doorL + doorR) / 2 + gapW * 3} 1080 L${(doorL + doorR) / 2 - gapW * 3} 1080 Z`} fill="rgba(255,190,110,0.35)" />}
        {out && smoke < 30 && <path d={`M${(doorL + doorR) / 2} ${doorTop + 300} q-20 -40 0 -80 q20 -40 0 -80`} stroke="rgba(200,200,210,0.5)" strokeWidth={6} fill="none" opacity={1 - smoke / 30} />}
        <NameTag x={zx} y={1000 - 520 * zs} text="张衡" size={28} o={zOp} />
        {/* 杨素拿草稿快步走向杨广 */}
        {R(SU, {...sp, neck: sNeck, handN: give < 1 ? paper : [sNeck[0] + 40, sNeck[1] + 110 * ss]}, ss, {face: 'stern'})}
        {R(CAST.guangJin, {...gp, handN: give > 0.9 ? paper : gp.handN}, gs, {face: give > 0.9 ? 'smile' : 'stern'})}
        <Stache h={gh} s={gs} facing={-1} hitch={give} />
        <g transform={`translate(${paper[0]} ${paper[1]}) rotate(${lerp(-10, 10, give)})`}>
          <rect x={-30} y={-40} width={60} height={80} fill="#efe6cc" stroke="#8a7a5a" strokeWidth={2} />
          {[0, 1, 2].map((k) => <line key={k} x1={14 - k * 14} y1={-30} x2={14 - k * 14} y2={30} stroke="#3a2a1a" strokeWidth={2} />)}
        </g>
        <NameTag x={headOf(sp.hip, sNeck, ss)[0]} y={1000 - 520 * ss} text="杨素" size={28} />
        <Vignette k={out ? 0.85 : 0.7} />
        {out && <rect width={1920} height={1080} fill="rgba(0,0,0,0.35)" />}
        <text x={960} y={1004} textAnchor="middle" fontFamily={LF.label} fontWeight={700} fontSize={30} fill="#d8ccb0" opacity={clamp01((t - bt(S19.note)) / 10)}>
          正史只写到这里；铁如意弑君等说法出自野史
        </text>
      </Svg>
    </AbsoluteFill>
  );
};

/* ═════════ 第 20 屏：金盒 → 大印砸诏书 → 囚室剪影 ═════════ */
const GoldBox: React.FC<{at: P; s: number}> = ({at, s}) => (
  <g transform={`translate(${at[0]} ${at[1]}) scale(${s})`}>
    <rect x={-50} y={-34} width={100} height={64} rx={6} fill="#d8a838" stroke="#6a4a10" strokeWidth={4} />
    <rect x={-54} y={-44} width={108} height={18} rx={6} fill="#e8c050" stroke="#6a4a10" strokeWidth={4} />
    <rect x={-8} y={-50} width={16} height={84} fill="#f0e6cc" />
    <text x={0} y={-6} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={14} fill="#a8201a" writingMode="tb">封</text>
    <path d="M-40 -10 L40 -10 M-40 10 L40 10" stroke="#a87820" strokeWidth={3} />
  </g>
);
const Sc20A: React.FC<{t: number}> = ({t}) => {
  const es = 0.66, xs = 0.64;
  const door = easeOut(clamp01(t / 12));
  const reach = easeInOut(clamp01((t - bt(1)) / bt(1.2)));
  const ep = standPose(560, 1000, es, 1);
  const eNeck: P = lean(ep.hip, 14, es);
  const xp = standPose(1180, 1000, xs, -1);
  const xNeck: P = lean(xp.hip, -10, xs);
  const xh = headOf(xp.hip, xNeck, xs);
  const box: P = lp([eNeck[0] + 120 * es, eNeck[1] + 110 * es], [xNeck[0] - 110 * xs, xNeck[1] + 110 * xs], reach);
  const fear = t > bt(2.6);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={1920} height={1080} fill="#120a0c" />
        <Screen x={980} y={220} w={720} h={320} panels={5} art="crane" />
        <rect width={1920} height={1080} fill="rgba(10,6,20,0.4)" />
        <rect x={0} y={0} width={760} height={1080} fill="#0a0608" />
        {/* 推开的门 */}
        <path d={`M760 160 L${760 - 260 * door} ${200 - 40 * door} L${760 - 260 * door} ${1040 + 40 * door} L760 1000 Z`} fill="#5a2414" stroke="#1a0804" strokeWidth={5} />
        <rect x={740} y={140} width={40} height={880} fill="#2a1008" />
        <Floor id="s20f" y={780} c1="#2a1a14" c2="#0e0806" />
        {R(ENVOY, {...ep, neck: eNeck, handN: [box[0] - 20, box[1] + 6], handF: [box[0] + 20, box[1] + 6]}, es, {face: 'stern'})}
        {R(XH, {...xp, neck: xNeck, handN: reach > 0.9 ? [box[0] + 24, box[1] + 10] : xp.handN, handF: reach > 0.9 ? [box[0] - 4, box[1] + 14] : xp.handF}, xs, {face: fear ? 'shock' : 'calm', headTilt: fear ? 22 : 8})}
        <GoldBox at={box} s={0.9} />
        {fear && <Sweat x={xh[0] - 40} y={xh[1] - 20} s={0.9} />}
        {fear && <Sweat x={xh[0] + 30} y={xh[1] - 36} s={0.7} />}
        {fear && <text x={xh[0] + 50} y={xh[1] - 70} fontFamily={LF.serif} fontWeight={900} fontSize={60} fill="#f4e2b0" stroke="#1a0804" strokeWidth={6} paintOrder="stroke">……</text>}
        <Candle f={t} x={1700} y={900} h={100} s={1.1} />
        <Vignette k={0.7} />
      </Svg>
    </AbsoluteFill>
  );
};
const Sc20B: React.FC<{t: number}> = ({t}) => {
  const hit = bt(0.9);
  const down = t < hit ? easeIn(clamp01(t / hit)) : 1;
  const up = t > hit + 4 ? easeOut(clamp01((t - hit - 4) / 10)) : 0;
  const sealY = lerp(250, 520, down) - 120 * up;
  const SX = 1150;
  const {x: sx, y: sy} = shakeXY(t, hit, 14);
  const prison = t > bt(1.8);
  const pt = t - bt(1.8);
  const slide = easeInOut(clamp01((pt - bt(0.4)) / bt(1.5)));
  if (prison) {
    const hx = 1020;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={1920} height={1080} fill="#16120e" />
          <defs>
            <filter id="s20sil"><feFlood floodColor="#050403" floodOpacity="0.92" /><feComposite in2="SourceAlpha" operator="in" /></filter>
          </defs>
          <rect x={0} y={0} width={1920} height={1080} fill="#2a241c" />
          {Array.from({length: 40}, (_, i) => <rect key={i} x={(i % 8) * 250 - (Math.floor(i / 8) % 2) * 125} y={Math.floor(i / 8) * 130 + 60} width={240} height={122} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={4} />)}
          <rect x={720} y={140} width={300} height={220} fill="#4a5a6a" opacity={0.5} />
          <path d="M720 140 L1020 140 L1460 1000 L620 1000 Z" fill="rgba(210,220,240,0.24)" />
          {/* 逆光剪影：双手抓栅栏，慢慢向后仰、跌坐在地 */}
          {(() => {
            const sc = 1.1;
            const hip: P = [lerp(1130, 1220, slide), lerp(687, 880, easeIn(slide))];
            const neck: P = lean(hip, lerp(-8, 22, slide), sc);
            const gy = lerp(440, 760, slide);
            return (
              <g filter="url(#s20sil)">
                {R(CAST.yong, {hip, neck, handN: [1012, gy], handF: [1016, gy + 46], footN: [lerp(1070, 1020, slide), 940], footF: [lerp(1110, 1050, slide), 940], facing: -1}, sc, {face: 'pain', headTilt: lerp(0, 18, slide)})}
              </g>
            );
          })()}
          <ellipse cx={1120} cy={944} rx={lerp(120, 180, slide)} ry={18} fill="rgba(0,0,0,0.5)" />
          {/* 栅栏（前景） */}
          {Array.from({length: 11}, (_, i) => <rect key={i} x={140 + i * 165} y={0} width={34} height={1080} fill="#1a1612" stroke="#4a4038" strokeWidth={3} />)}
          <rect x={0} y={120} width={1920} height={30} fill="#1a1612" stroke="#4a4038" strokeWidth={3} />
          <rect x={0} y={900} width={1920} height={30} fill="#1a1612" stroke="#4a4038" strokeWidth={3} />
          <Vignette k={0.8} />
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
      <Svg>
        <rect width={1920} height={1080} fill="#2a140a" />
        <rect x={0} y={760} width={1920} height={320} fill="#4a2410" />
        {/* 假诏书 */}
        <g transform="translate(960 700)">
          <rect x={-420} y={-140} width={840} height={260} fill="#e8d08a" stroke="#8a6a2a" strokeWidth={5} />
          <rect x={-440} y={-150} width={24} height={280} rx={8} fill="#7a3a1a" />
          <rect x={416} y={-150} width={24} height={280} rx={8} fill="#7a3a1a" />
          {Array.from({length: 9}, (_, i) => <line key={i} x1={360 - i * 80} y1={-110} x2={360 - i * 80} y2={90} stroke="rgba(60,30,10,0.45)" strokeWidth={6} strokeDasharray="20 10" />)}
          <text x={0} y={-160} textAnchor="middle" fontFamily={LF.label} fontWeight={900} fontSize={36} fill="#ffe0a8" opacity={0.9}>（假传的诏书）</text>
        </g>
        {t >= hit && (
          <g>
            <rect x={SX - 90} y={610} width={180} height={180} fill="none" stroke="#c0281c" strokeWidth={14} opacity={0.92} />
            <text x={SX} y={730} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={90} fill="#c0281c" opacity={0.9}>印</text>
            {Array.from({length: 14}, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const k = easeOut(clamp01((t - hit) / 8));
              return <circle key={i} cx={SX + Math.cos(a) * (100 + 120 * k)} cy={700 + Math.sin(a) * (70 + 60 * k)} r={10 - 5 * k} fill="#c0281c" />;
            })}
          </g>
        )}
        {/* 握着大印的手 */}
        <g transform={`translate(${SX} ${sealY}) rotate(${lerp(-26, -8, down)})`}>
          <rect x={-100} y={-20} width={200} height={110} fill="#b8922a" stroke="#5a4010" strokeWidth={5} />
          <path d="M-60 -20 Q-60 -110 0 -120 Q60 -110 60 -20 Z" fill="#d8b040" stroke="#5a4010" strokeWidth={5} />
          <rect x={-70} y={-260} width={140} height={150} rx={50} fill="#e6c9a0" stroke="rgba(0,0,0,0.35)" strokeWidth={3} />
          <path d="M-70 -200 q-20 30 0 60" stroke="#e6c9a0" strokeWidth={30} strokeLinecap="round" />
          <g transform="rotate(38 0 -230)"><rect x={-80} y={-700} width={160} height={460} fill={CAST.guangJin.robe} /><path d="M-80 -260 L80 -260 L96 -230 L-96 -230 Z" fill={CAST.guangJin.robeD ?? '#3a2a5a'} /></g>
        </g>
        {t >= hit && t < hit + 6 && <text x={1420} y={560} fontFamily={LF.serif} fontWeight={900} fontSize={110} fill="#f4e2b0" stroke="#3a1a0c" strokeWidth={8} paintOrder="stroke">咚！</text>}
        <Vignette k={0.6} />
      </Svg>
      <Flash f={t} at={hit} dur={6} peak={0.5} />
    </AbsoluteFill>
  );
};
const Sc20: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    {t < bt(S20.cut) ? <Sc20A t={t} /> : <Sc20B t={t - bt(S20.cut)} />}
    <Flash f={t} at={bt(S20.cut)} dur={5} peak={0.35} />
  </AbsoluteFill>
);

/* ═════════ 第 21 屏：三维地图，长安 → 洛阳，城池拔地而起 ═════════ */
const CHANGAN: [number, number] = [108.94, 34.27];
const LUOYANG: [number, number] = [112.45, 34.62];
const City3D: React.FC<{k: number; sc?: number}> = ({k, sc = 1}) => {
  const c = world(LUOYANG[0], LUOYANG[1], 0);
  const W = 34, wallH = 7, th = 2.2;
  const rise = (d: number) => easeOutBack(clamp01((k - d) / 0.35));
  const walls: [number, number, number, number][] = [[0, -W / 2, W, th], [0, W / 2, W, th], [-W / 2, 0, th, W], [W / 2, 0, th, W]];
  const r = rise(0);
  const blocks: [number, number, number, number, number, string][] = [];
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (!(Math.abs(i) <= 0 && j <= -1) && (i + j) % 1 === 0) blocks.push([i * 5.4, j * 5.4, 3.6, 3.6, 1.4 + ((i * 7 + j * 3 + 20) % 3) * 0.8, (i + j) % 2 ? '#a8805a' : '#8a6a4a']);
  return (
    <group position={[c.x, c.y, c.z]} scale={sc}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[W + 6, 0.8, W + 6]} />
        <meshStandardMaterial color="#5a4a36" />
      </mesh>
      {walls.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, (wallH * r) / 2 + 0.8, z]} scale={[1, Math.max(0.001, r), 1]}>
          <boxGeometry args={[w, wallH, d]} />
          <meshStandardMaterial color="#b0563a" />
        </mesh>
      ))}
      {[[0, -W / 2], [0, W / 2], [-W / 2, 0], [W / 2, 0], [-W / 2, -W / 2], [W / 2, -W / 2], [-W / 2, W / 2], [W / 2, W / 2]].map(([x, z], i) => {
        const q = rise(0.15 + i * 0.03);
        return (
          <group key={i} position={[x, 0.8, z]} scale={[1, Math.max(0.001, q), 1]}>
            <mesh position={[0, 5.5, 0]}>
              <boxGeometry args={[5, 11, 5]} />
              <meshStandardMaterial color="#c8683e" />
            </mesh>
            <mesh position={[0, 12.5, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[5.2, 3.6, 4]} />
              <meshStandardMaterial color="#4a6e6a" emissive="#1a2a28" />
            </mesh>
          </group>
        );
      })}
      {blocks.map(([x, z, w, d, h, col], i) => {
        const q = rise(0.3 + (i % 9) * 0.03);
        return (
          <mesh key={i} position={[x, 0.8 + (h * q) / 2, z]} scale={[1, Math.max(0.001, q), 1]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={col} />
          </mesh>
        );
      })}
      {/* 宫城：北部正中，大殿 */}
      {(() => {
        const q = rise(0.5);
        return (
          <group position={[0, 0.8, -W / 2 + 8]} scale={[1, Math.max(0.001, q), 1]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[14, 3, 8]} />
              <meshStandardMaterial color="#d8c8a0" />
            </mesh>
            <mesh position={[0, 6, 0]}>
              <boxGeometry args={[10, 6, 5]} />
              <meshStandardMaterial color="#b83a2a" />
            </mesh>
            <mesh position={[0, 10.5, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.5, 1, 0.8]}>
              <coneGeometry args={[7, 4, 4]} />
              <meshStandardMaterial color="#e8b850" emissive="#5a3a08" />
            </mesh>
          </group>
        );
      })()}
    </group>
  );
};
const Sc21: React.FC<{t: number}> = ({t}) => {
  const k = clamp01(t / bt(8));
  const grow = clamp01((t - bt(S21.rise)) / bt(3));
  const push = easeInOut(clamp01((t - bt(1.6)) / bt(5.4)));
  const cam: Cam3 = {lon: lerp(110.7, LUOYANG[0], push), lat: lerp(34.0, LUOYANG[1] - 0.05, push), dist: lerp(720, 190, push), pitch: lerp(62, 50, push), yaw: lerp(-4, 10, k)};
  const line = easeInOut(clamp01((t - bt(0.3)) / bt(1.4)));
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    const [x0, y0] = px(CHANGAN[0], CHANGAN[1]);
    const [x1, y1] = px(LUOYANG[0], LUOYANG[1]);
    g.save();
    g.setLineDash([22, 16]);
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(30,10,4,0.8)';
    g.lineWidth = 14;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(lerp(x0, x1, line), lerp(y0, y1, line));
    g.stroke();
    g.strokeStyle = '#ffd070';
    g.lineWidth = 7;
    g.stroke();
    g.restore();
    const gr = g.createRadialGradient(x1, y1, 0, x1, y1, 80);
    gr.addColorStop(0, `rgba(255,200,90,${0.55 * grow})`);
    gr.addColorStop(1, 'rgba(255,200,90,0)');
    g.fillStyle = gr;
    g.fillRect(x1 - 80, y1 - 80, 160, 160);
  };
  const dep = `${line.toFixed(3)}_${grow.toFixed(2)}`;
  const yr = clamp01((t - bt(S21.rise + 2.4)) / 8);
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={dep} opacity={0.95} />
        <Pin3 at={CHANGAN} big />
        {grow <= 0 && <Pin3 at={LUOYANG} big />}
        {grow > 0 && <City3D k={grow} sc={1.25} />}
      </Map3D>
      <Label3 cam={cam} at={CHANGAN} name="长安" side="left" lift={30} size={56} />
      <Label3 cam={cam} at={LUOYANG} name={grow > 0.5 ? '东都洛阳' : '洛阳'} lift={grow > 0 ? 26 : 30} size={grow > 0.5 ? 64 : 56} />
      {yr > 0 && (
        <div style={{position: 'absolute', left: 1450, top: 760, transform: `scale(${lerp(1.8, 1, easeOut(yr))}) rotate(-6deg)`, opacity: Math.min(1, yr * 2)}}>
          <div style={{border: '8px solid #c8302a', borderRadius: 10, padding: '6px 26px', fontFamily: LF.serif, fontWeight: 900, fontSize: 88, color: '#e0402a', background: 'rgba(30,8,4,0.55)'}}>605 年</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ═════════ 第 22 屏：★ 六个官员抢一小碗饭 ═════════ */
const Sc22: React.FC<{t: number}> = ({t}) => {
  const clash = bt(S22.clash);
  const st = slowT(t, clash, 0.4, 30);
  const reach = easeInOut(clamp01((st - bt(1.2)) / (clash - bt(1.2))));
  const frozen = t >= clash;
  const {x: sx, y: sy} = shakeXY(t, clash, 10);
  const bowl: P = [960, 700];
  const table = {x0: 360, x1: 1560, y: 760};
  const seats = [
    {x: 520, g: 800, s: 0.56, f: 1, look: CAST.offR},
    {x: 700, g: 840, s: 0.6, f: 1, look: CAST.offG},
    {x: 380, g: 1000, s: 0.66, f: 1, look: CAST.offB},
    {x: 1400, g: 800, s: 0.56, f: -1, look: CAST.offG},
    {x: 1220, g: 840, s: 0.6, f: -1, look: CAST.offB},
    {x: 1540, g: 1000, s: 0.66, f: -1, look: CAST.offR},
  ];
  const dots = clamp01((t - clash - bt(0.8)) / 8);
  const growl = t > bt(S22.growl) && t < bt(S22.growl) + 20;
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${1 + 0.05 * easeInOut(clamp01(t / bt(8)))})`, transformOrigin: '960px 700px'}}>
      <Svg>
        <defs>
          <linearGradient id="s22wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a160c" />
            <stop offset="1" stopColor="#4a2a16" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s22wall)" />
        {/* 窗外长安城：坊墙屋顶 */}
        <rect x={660} y={200} width={600} height={300} fill="#c8a878" />
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M${660 + i * 110} ${380 - (i % 2) * 30} l55 -40 l55 40 Z`} fill="#4a3a2a" />)}
        {Array.from({length: 6}, (_, i) => <rect key={i} x={672 + i * 110} y={380 - (i % 2) * 30} width={86} height={120} fill="#8a6a4a" />)}
        <path d="M660 470 L1260 470 L1260 500 L660 500 Z" fill="#6a5440" />
        <Lattice x={660} y={200} w={600} h={300} kind="grid" glow={0.2} />
        <Shelf x={140} y={260} w={300} h={420} rows={4} cols={3} seed={5} />
        <Shelf x={1480} y={260} w={300} h={420} rows={4} cols={3} seed={9} />
        <Beam id="s22b" y={130} h={56} />
        <rect width={1920} height={70} fill="#140806" />
        <Floor id="s22f" y={760} c1="#3a2012" c2="#120806" />
        {/* 长案 */}
        <rect x={table.x0} y={table.y - 20} width={table.x1 - table.x0} height={30} fill="#6a3418" stroke="#2a1008" strokeWidth={4} />
        <rect x={table.x0 + 30} y={table.y + 10} width={30} height={120} fill="#3a1a0c" />
        <rect x={table.x1 - 60} y={table.y + 10} width={30} height={120} fill="#3a1a0c" />
        {/* 正中唯一一小碗米饭 */}
        <g transform={`translate(${bowl[0]} ${table.y - 20})`}>
          <path d="M-46 -40 L46 -40 Q40 0 0 4 Q-40 0 -46 -40 Z" fill="#e8e2d0" stroke="#6a5a40" strokeWidth={3} />
          <path d="M-42 -40 Q0 -78 42 -40 Z" fill="#fbf8f0" />
          {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={-30 + i * 7.5} cy={-46 - Math.sin((i / 8) * Math.PI) * 18} rx={4} ry={2.4} fill="#fff" stroke="#e0d8c0" strokeWidth={0.8} />)}
          {!frozen && <path d="M-10 -80 q-8 -16 4 -30 M12 -82 q8 -16 -4 -30" stroke="rgba(255,255,255,0.5)" strokeWidth={3} fill="none" />}
          <path d="M-40 -30 Q0 -20 40 -30" stroke="#5aa0a0" strokeWidth={4} fill="none" />
        </g>
        {seats.map((o, i) => {
          const p = stoolPose(o.x, o.g, o.s, o.f as 1 | -1, 110);
          const neck: P = lean(p.hip, o.f * lerp(6, 26, reach), o.s);
          const h = headOf(p.hip, neck, o.s);
          const tipT: P = [bowl[0] + o.f * -6 + (i % 3 - 1) * 6, 650 + (i % 3) * 8];
          const tip0: P = [neck[0] + o.f * 190 * o.s, neck[1] + 40 * o.s];
          const tip = lp(tip0, tipT, reach);
          const dir = Math.atan2(tip[1] - neck[1], tip[0] - neck[0]);
          const hand: P = [tip[0] - Math.cos(dir) * 150 * o.s, tip[1] - Math.sin(dir) * 150 * o.s + 30 * o.s];
          const bowlHand: P = [neck[0] + o.f * 70 * o.s, neck[1] + 110 * o.s];
          return (
            <g key={i}>
              {R(o.look, {...p, neck, handN: hand, handF: bowlHand}, o.s, {face: frozen ? 'shock' : 'stern', headTilt: o.f * 8 * reach})}
              {/* 左手端着空碗 */}
              <g transform={`translate(${bowlHand[0]} ${bowlHand[1] - 6}) scale(${o.s})`}>
                <path d="M-30 -24 L30 -24 Q26 6 0 8 Q-26 6 -30 -24 Z" fill="#e8e2d0" stroke="#6a5a40" strokeWidth={3} />
                <ellipse cx={0} cy={-24} rx={30} ry={7} fill="#3a2a1a" />
              </g>
              {/* 筷子 */}
              <line x1={hand[0] - Math.cos(dir) * 30} y1={hand[1] - Math.sin(dir) * 30} x2={tip[0]} y2={tip[1]} stroke="#c8902a" strokeWidth={6} strokeLinecap="round" />
              <line x1={hand[0] - Math.cos(dir) * 30} y1={hand[1] - Math.sin(dir) * 30 + 8} x2={tip[0] + 2} y2={tip[1] + 8} stroke="#b07820" strokeWidth={6} strokeLinecap="round" />
              {frozen && dots > 0 && <text x={h[0]} y={h[1] - 70 * o.s - 10} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={60 * o.s + 10} fill="#f4e2b0" stroke="#1a0804" strokeWidth={6} paintOrder="stroke" opacity={dots}>……</text>}
              {frozen && <Sweat x={h[0] - o.f * 40} y={h[1] - 20} s={o.s * 1.3} />}
            </g>
          );
        })}
        {frozen && t < clash + 16 && (
          <g transform="translate(960 660)" stroke="#fff4dc" strokeWidth={6} strokeLinecap="round" opacity={1 - (t - clash) / 16}>
            {Array.from({length: 10}, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 40} y1={Math.sin(a) * 40} x2={Math.cos(a) * 110} y2={Math.sin(a) * 110} />;
            })}
          </g>
        )}
        {growl && <text x={1580} y={620} fontFamily={LF.serif} fontWeight={900} fontSize={72} fill="#f4e2b0" stroke="#3a1a0c" strokeWidth={6} paintOrder="stroke" transform="rotate(8 1580 620)">咕～</text>}
        {frozen && <rect width={1920} height={1080} fill="rgba(20,10,30,0.18)" />}
        <Vignette k={0.6} />
      </Svg>
      <Flash f={t} at={clash} dur={8} peak={0.6} />
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s17: Sc17, s18: Sc18, s19: Sc19, s20: Sc20, s21: Sc21, s22: Sc22};

export const Act3: React.FC<{f: number}> = ({f}) => {
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
export const ACT3_START = fbt(SHOT.s17[0]);
