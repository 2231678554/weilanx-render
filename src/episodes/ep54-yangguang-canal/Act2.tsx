import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {Flash, shakeXY} from '../../library/lamplight/stage';
import {LF} from '../../library/lamplight/theme';
import {headOf, Sweat} from '../ep53-changan-curfew/Kit';
import {P, Rig, RigProps, ridePose, standPose, stoolPose, walkPose} from '../ep53-changan-curfew/Rig';
import {Mount, mountBack} from '../ep53-changan-curfew/Sets';
import {lerp, Svg} from './Opening';
import {Crown, Dust} from './Props';
import {Beam, Brackets, CAST, Clasp, Couch, Curtain, Dais, Floor, Incense, Lattice, NameTag, Pillar, Screen, StandLamp, Vignette} from './Sets54';
import {B, fbt, S13, S14, S15, S16, SHOT} from './timeline';

type Pose = Partial<RigProps> & {hip: P; neck: P};
const R = (look: Partial<RigProps>, pose: Pose, s: number, more: Partial<RigProps> = {}, children?: React.ReactNode) => (
  <Rig {...(look as RigProps)} {...(pose as RigProps)} s={s} {...more}>
    {children}
  </Rig>
);
const lean = (hip: P, a: number, s: number, len = 200): P => [hip[0] + Math.sin((a * Math.PI) / 180) * len * s, hip[1] - Math.cos((a * Math.PI) / 180) * len * s];
const bt = (b: number) => b * B;
const lp = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

/** 杨素：瘦高、长白须、紫袍 */
const SU: Partial<RigProps> = {robe: '#4e2a66', robeD: '#341a48', pants: '#241a2a', hem: 150, beard: true, beardC: '#eeeae2'};
/** 老侍女：灰发、褐衣 */
const MAID: Partial<RigProps> = {robe: '#6a5a48', robeD: '#4a3e30', hat: 'bun', skirt: true, hem: 190, hair: '#a8a29a'};

/** 八字胡，side 一边上挑 0–1 */
const Stache: React.FC<{h: P; s: number; facing: number; hitch?: number; front?: boolean}> = ({h, s, facing, hitch = 0, front}) => (
  <g transform={`translate(${h[0]} ${h[1]}) scale(${s})`}>
    {front ? (
      <>
        <path d={`M-2 14 q-12 -2 -26 ${8 - 4 * 0}`} stroke="#1b1410" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M2 14 q12 -2 26 ${8 - 20 * hitch}`} stroke="#1b1410" strokeWidth={5} fill="none" strokeLinecap="round" />
      </>
    ) : (
      <path d={`M${facing * 14} 14 q${facing * 10} -4 ${facing * 22} ${4 - 16 * hitch}`} stroke="#1b1410" strokeWidth={5} fill="none" strokeLinecap="round" />
    )}
  </g>
);

/** 皱纹点（老侍女脸上） */
const Wrinkles: React.FC<{h: P; s: number; facing: number}> = ({h, s, facing}) => (
  <g transform={`translate(${h[0]} ${h[1]}) scale(${s})`} fill="none" stroke="rgba(110,70,40,0.75)" strokeWidth={2.5} strokeLinecap="round">
    <path d={`M${facing * 4} -26 q${facing * 10} -3 ${facing * 22} 0 M${facing * 2} -32 q${facing * 10} -3 ${facing * 20} 0`} />
    <path d={`M${facing * 24} 6 q${facing * 4} 6 ${facing * 0} 12 M${facing * 8} 10 q${-facing * 3} 6 0 12`} />
    {[[-8, 14], [-2, 20], [-14, 8]].map(([x, y], i) => <circle key={i} cx={facing * x} cy={y} r={2.2} fill="rgba(110,70,40,0.7)" stroke="none" />)}
  </g>
);

/** 木托盘 + 两只茶盏 */
const Tray: React.FC<{at: P; s: number; cups?: number}> = ({at, s, cups = 2}) => (
  <g transform={`translate(${at[0]} ${at[1]}) scale(${s})`}>
    {Array.from({length: cups}, (_, i) => (
      <g key={i} transform={`translate(${(i - (cups - 1) / 2) * 56} 0)`}>
        <path d="M-20 -30 L20 -30 L14 -6 L-14 -6 Z" fill="#e8e2d0" stroke="#6a5a40" strokeWidth={2} />
        <rect x={-22} y={-34} width={44} height={6} rx={3} fill="#a8c8b8" />
        <path d="M-6 -42 q-6 -10 2 -20 M6 -44 q6 -10 -2 -20" stroke="rgba(255,255,255,0.45)" strokeWidth={3} fill="none" />
      </g>
    ))}
    <rect x={-90} y={-6} width={180} height={16} rx={4} fill="#7a4a24" stroke="#3a200c" strokeWidth={3} />
    <rect x={-84} y={-6} width={168} height={4} fill="#a87040" />
  </g>
);

/** 声波纹 */
const Waves: React.FC<{at: P; t: number; dir?: number; n?: number; s?: number}> = ({at, t, dir = 1, n = 3, s = 1}) => (
  <g transform={`translate(${at[0]} ${at[1]}) scale(${dir * s} ${s})`} fill="none" strokeLinecap="round">
    {Array.from({length: n}, (_, i) => {
      const k = ((t / 14 + i / n) % 1);
      const r = 30 + k * 150;
      return <path key={i} d={`M${r * 0.5} ${-r * 0.86} A${r} ${r} 0 0 1 ${r * 0.5} ${r * 0.86}`} stroke="#f4e6c0" strokeWidth={10 - 6 * k} opacity={(1 - k) * 0.95} />;
    })}
  </g>
);

/* ═════════ 第 11 屏：躲柱后 → 切：挂名元帅 ═════════ */
const Sc11A: React.FC<{t: number}> = ({t}) => {
  const gs = 0.86;
  const px = 1180;
  const peek = easeOutBack(clamp01((t - bt(0.4)) / 14));
  const hip: P = [px + 6, 1000 - 226 * gs];
  const neck: P = lean(hip, -lerp(2, 30, peek), gs);
  const h = headOf(hip, neck, gs);
  const hitch = easeOutBack(clamp01((t - bt(2.2)) / 8));
  const z = 1 + 0.05 * clamp01(t / bt(4));
  const pw = 170;
  const right = px - pw / 2;
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s11wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a0806" />
            <stop offset="1" stopColor="#3a120a" />
          </linearGradient>
          <radialGradient id="s11door" cx="0.5" cy="0.6" r="0.6">
            <stop offset="0" stopColor="rgba(255,200,120,0.55)" />
            <stop offset="1" stopColor="rgba(255,200,120,0)" />
          </radialGradient>
        </defs>
        <g transform={`translate(1000 700) scale(${z}) translate(-1000 -700)`}>
          <rect width={1920} height={1080} fill="url(#s11wall)" />
          {/* 远处正殿门里：文帝拍案、太子跪着（小） */}
          <rect x={190} y={330} width={560} height={460} fill="#2a0c06" stroke="#6a2a14" strokeWidth={10} />
          <rect x={200} y={340} width={540} height={440} fill="#c88a4a" />
          <rect x={200} y={340} width={540} height={440} fill="url(#s11door)" />
          <Screen x={250} y={380} w={440} h={170} panels={4} art="wave" />
          <rect x={250} y={620} width={440} height={50} fill="#6a3418" />
          <rect x={200} y={670} width={540} height={110} fill="#5a2a12" />
          {R(CAST.wen, standPose(400, 660, 0.36, 1), 0.36, {face: 'shout', mouth: 0.5 + 0.4 * Math.abs(Math.sin(t / 3)), handN: [460, 620], handF: [430, 580]})}
          {R(CAST.yong, {...standPose(580, 780, 0.34, 1), hip: [580, 748], neck: [620, 692]}, 0.34, {face: 'shock'})}
          <path d="M750 330 L750 790 L820 840 L820 280 Z" fill="#12060a" opacity={0.7} />
          <Beam id="s11b" y={130} h={70} />
          <Brackets y={130} gap={170} s={0.9} />
          <rect width={1920} height={70} fill="#120604" />
          <Floor id="s11f" y={800} c1="#3a1408" c2="#0e0604" vx={460} />
          <StandLamp f={t} x={1640} y={980} s={1.1} />
          {/* 杨广：身子藏在柱后，探出半个头 */}
          {R(CAST.guangJin, {...standPose(px + 6, 1000, gs, -1), hip, neck}, gs, {face: 'smile', headTilt: -10 * peek})}
          <Stache h={h} s={gs} facing={-1} hitch={hitch} />
          <Pillar id="s11p" x={px} y0={60} y1={1080} w={pw} color="#8a1e12" dark="#3a0a06" />
          <rect x={px - pw / 2 - 12} y={900} width={pw + 24} height={180} fill="#2a1a10" />
          <rect x={px - pw / 2 - 12} y={900} width={pw + 24} height={10} fill="#c99a3a" />
          {/* 双手一上一下抱柱，拇指扣在前侧 */}
          {[[lerp(right - 40, right + 6, peek), 560], [lerp(right - 40, right + 6, peek), 700]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(-1 1)`}>
              <ellipse cx={0} cy={0} rx={13} ry={20} fill="#e6c9a0" stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
              <path d="M-10 -10 q-10 4 -14 12" stroke="#e6c9a0" strokeWidth={10} strokeLinecap="round" fill="none" />
              <path d="M-10 -10 q-10 4 -14 12" stroke="rgba(0,0,0,0.3)" strokeWidth={2} fill="none" />
            </g>
          ))}
          <rect x={0} y={60} width={40} height={1020} fill="#5a120a" />
        </g>
        <Vignette k={0.6} />
      </Svg>
    </AbsoluteFill>
  );
};

const Sc11B: React.FC<{t: number}> = ({t}) => {
  const ms = 0.9;
  const mx = 1380;
  const back = mountBack(mx, 1010, ms, 'horse');
  const rs = 0.74;
  const rp = ridePose(back, rs, -1, Math.sin(t / 6) * 2);
  const charge = (i: number) => {
    const k = clamp01((t - i * 3) / bt(4));
    return lerp(900 - i * 120, 300 - i * 200, easeIn(k));
  };
  const flag = Math.sin(t / 7);
  return (
    <AbsoluteFill style={{transform: `scale(${1.04 + 0.04 * clamp01(t / bt(4))})`}}>
      <Svg>
        <defs>
          <linearGradient id="s11sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1a2a" />
            <stop offset="0.55" stopColor="#a8502a" />
            <stop offset="1" stopColor="#e8a050" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s11sky)" />
        <circle cx={420} cy={470} r={90} fill="#f4c070" opacity={0.6} />
        {/* 远处：建康城墙与浓烟 */}
        <path d="M0 640 L0 560 L60 560 L60 540 L110 540 L110 560 L360 560 L360 530 L420 530 L420 560 L700 560 L700 640 Z" fill="#3a1e18" />
        {[120, 300, 520].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 560 q${-30 + 10 * Math.sin(t / 9 + i)} -120 ${20} -240 q${40} -80 ${-10} -170`} stroke="rgba(40,24,20,0.55)" strokeWidth={70 + i * 10} fill="none" strokeLinecap="round" />
            <path d={`M${x - 20} 560 q10 -40 20 -70 q10 30 20 70 Z`} fill="#ff8a30" opacity={0.7 + 0.3 * Math.sin(t / 2 + i)} />
          </g>
        ))}
        <rect x={0} y={630} width={1920} height={60} fill="#7a90a0" opacity={0.65} />
        <path d="M0 640 Q480 625 960 642 T1920 636" stroke="rgba(255,240,210,0.5)" strokeWidth={4} fill="none" />
        <rect x={0} y={680} width={1920} height={400} fill="#5a3a20" />
        <path d="M0 700 Q600 680 1200 720 T1920 700 L1920 1080 L0 1080 Z" fill="#6a4426" />
        {Array.from({length: 26}, (_, i) => <path key={i} d={`M${(i * 97) % 1920} ${760 + ((i * 53) % 300)} l8 -18 l6 16`} stroke="#4a2e16" strokeWidth={4} fill="none" />)}
        {/* 尘土 */}
        {Array.from({length: 10}, (_, i) => {
          const x = charge(i % 2) + 140 + (i * 37) % 120;
          return <circle key={i} cx={x + ((t * 3 + i * 20) % 200)} cy={980 - (i % 4) * 22} r={26 + (i % 3) * 10} fill="rgba(200,170,120,0.35)" />;
        })}
        {/* 两员猛将冲杀 */}
        {[0, 1].map((i) => {
          const x = charge(i);
          const s = 0.66 - i * 0.04;
          const bk = mountBack(x, 1020 - i * 50, s, 'horse');
          const p = ridePose(bk, s * 0.82, -1, Math.sin(t / 2 + i) * 4);
          const spearB: P = [p.neck[0] + 120 * s, p.neck[1] + 40 * s];
          const spearT: P = [p.neck[0] - 300 * s, p.neck[1] - 30 * s + Math.sin(t / 3 + i) * 10];
          return (
            <g key={i}>
              <Mount f={t * 2} x={x} y={1020 - i * 50} s={s} kind="horse" facing={-1} walk={1} color={i ? '#5a3a28' : '#2a2420'} />
              {R({robe: i ? '#7a2a20' : '#2a3a5a', robeD: '#1a1a20', pants: '#2a2020', hem: 90, beard: true}, {...p, handN: lp(spearB, spearT, 0.3), handF: lp(spearB, spearT, 0.12)}, s * 0.82, {face: 'shout', mouth: 0.7})}
              <line x1={spearB[0]} y1={spearB[1]} x2={spearT[0]} y2={spearT[1]} stroke="#3a2412" strokeWidth={9} />
              <path d={`M${spearT[0]} ${spearT[1]} l30 -10 l0 20 Z`} fill="#d8d8d0" />
              <NameTag x={p.neck[0]} y={p.neck[1] - 150 * s} text={i ? '韩擒虎' : '贺若弼'} size={24} />
            </g>
          );
        })}
        {/* 帅旗「晋王」 */}
        <line x1={1600} y1={200} x2={1600} y2={1000} stroke="#3a2412" strokeWidth={14} />
        <circle cx={1600} cy={196} r={14} fill="#e8c060" />
        <path d={`M1600 220 Q${1480 + 20 * flag} ${260 + 10 * flag} ${1340 + 30 * flag} ${230 + 20 * flag} L${1340 + 26 * flag} ${520 + 20 * flag} Q${1480 + 16 * flag} ${560 + 10 * flag} 1600 520 Z`} fill="#b8241c" stroke="#e8c060" strokeWidth={6} />
        <text x={1470 + 14 * flag} y={350 + 10 * flag} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={100} fill="#f4e2b0">晋</text>
        <text x={1470 + 14 * flag} y={470 + 12 * flag} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={100} fill="#f4e2b0">王</text>
        {/* 杨广端坐马上：左手握缰，右手按剑柄 */}
        <Mount f={t} x={mx} y={1010} s={ms} kind="horse" facing={-1} color="#f0ece4" />
        {(() => {
          const rein: P = [rp.hip[0] - 110 * rs, rp.hip[1] - 60 * rs];
          const hilt: P = [rp.hip[0] + 30 * rs, rp.hip[1] - 4 * rs];
          const h = headOf(rp.hip, rp.neck, rs);
          return (
            <g>
              <path d={`M${rein[0]} ${rein[1]} Q${rein[0] - 60} ${rein[1] + 40} ${mx - 230 * ms} ${1010 - 330 * ms}`} stroke="#3a1a0c" strokeWidth={5} fill="none" />
              {R(CAST.guangJin, {...rp, handN: rein, handF: hilt}, rs, {face: 'smile', sword: true})}
              <Stache h={h} s={rs} facing={-1} hitch={0.6} />
              <rect x={hilt[0] - 8} y={hilt[1] - 6} width={30} height={12} rx={4} fill="#c99a3a" transform={`rotate(20 ${hilt[0]} ${hilt[1]})`} />
            </g>
          );
        })()}
        <Vignette k={0.5} />
      </Svg>
    </AbsoluteFill>
  );
};

const Sc11: React.FC<{t: number}> = ({t}) => {
  const cut = bt(4);
  return (
    <AbsoluteFill>
      {t < cut ? <Sc11A t={t} /> : <Sc11B t={t - cut} />}
      <Flash f={t} at={cut} dur={6} peak={0.55} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 12 屏：晋王府，老丑侍女上茶 ═════════ */
const Sc12: React.FC<{t: number}> = ({t}) => {
  const ws = 0.62, ds = 0.6;
  const wPose = stoolPose(1180, 680, ws, -1, 148);
  const dPose = stoolPose(1500, 680, ds, -1, 148);
  const nod = Math.max(0, Math.sin(Math.max(0, t - bt(4.2)) / 6)) * clamp01((t - bt(4.2)) / 4);
  const wNeck: P = lean(wPose.hip, -4 - 10 * nod, ws);
  const dNeck: P = lean(dPose.hip, -4 - 10 * nod, ds);
  const wh = headOf(wPose.hip, wNeck, ws);
  const dh = headOf(dPose.hip, dNeck, ds);
  const stroke = Math.sin(t / 5) * 10;
  const wHandN: P = [wh[0] - 16, wh[1] + 70 + stroke];
  const cupAt: P = [dh[0] - 70, dh[1] + 64];
  const ms = 0.64;
  const walkK = easeOut(clamp01(t / bt(3.2)));
  const maid = (i: number) => {
    const x = lerp(-120 - i * 220, 700 + i * 200, walkK);
    const moving = walkK < 1;
    const base = moving ? walkPose(x, 1000, (t / 22 + i * 0.5) % 1, ms, 1) : standPose(x, 1000, ms, 1);
    const neck: P = lean(base.hip, 16, ms);
    const hip: P = base.hip;
    const h: P = [neck[0] + 34 * ms, neck[1] - 30 * ms];
    const tray: P = [neck[0] + 90 * ms, neck[1] + 90 * ms];
    return {base, hip, neck, h, tray};
  };
  const gp = standPose(330, 1010, 0.66, 1);
  const gNeck: P = lean(gp.hip, 14, 0.66);
  const gh = headOf(gp.hip, gNeck, 0.66);
  const gHand: P = [gNeck[0] + 40, gNeck[1] + 60];
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s12wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3226" />
            <stop offset="1" stopColor="#5a4c38" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s12wall)" />
        {/* 素墙、素帐、粗竹帘 */}
        {Array.from({length: 9}, (_, i) => <rect key={i} x={i * 220} y={90} width={6} height={620} fill="rgba(0,0,0,0.12)" />)}
        <Lattice x={180} y={240} w={260} h={360} kind="grid" glow={0.35} frame="#3a2e20" />
        <Screen x={1010} y={250} w={700} h={330} panels={5} art="plain" frame="#4a3a26" paper="#d8ceb6" />
        <Curtain f={t} y={70} drop={60} color="#cfc6b0" dark="#9a917a" n={6} sideH={720} />
        <rect width={1920} height={70} fill="#2a241a" />
        <Floor id="s12f" y={700} c1="#6a5a40" c2="#3a3020" lines="rgba(0,0,0,0.18)" />
        <Dais x={1340} y={680} w={720} steps={2} step={22} color="#6a5032" edge="#8a7050" />
        <Couch x={1340} y={600} w={600} back={120} cushion="#8a8270" wood="#5a4028" />
        {/* 文帝：右手捋须；独孤皇后：右手托盏底 */}
        {R(CAST.wen, {...wPose, neck: wNeck, handN: wHandN, handF: [wPose.kneeN[0] + 6, wPose.kneeN[1] - 8]}, ws, {face: 'smile', headTilt: 8 * nod})}
        {R(CAST.dugu, {...dPose, neck: dNeck, handN: [cupAt[0], cupAt[1] + 14], handF: [cupAt[0] + 20, cupAt[1] + 20]}, ds, {face: 'smile', headTilt: 8 * nod})}
        <g transform={`translate(${cupAt[0]} ${cupAt[1]}) scale(${ds})`}>
          <path d="M-20 -30 L20 -30 L14 -6 L-14 -6 Z" fill="#e8e2d0" stroke="#6a5a40" strokeWidth={2} />
          <path d="M-6 -40 q-6 -10 2 -20" stroke="rgba(255,255,255,0.5)" strokeWidth={3} fill="none" />
        </g>
        {nod > 0.3 && [wh, dh].map((h, i) => <text key={i} x={h[0] - 60} y={h[1] - 70} fontFamily={LF.label} fontWeight={900} fontSize={34} fill="#f4e2b0" opacity={nod}>嗯～</text>)}
        {/* 杨广：素袍，躬身陪笑 */}
        {R({...CAST.guangJin, robe: '#8a8478', robeD: '#64605a'}, {...gp, neck: gNeck, handN: gHand, handF: [gHand[0] - 6, gHand[1] + 4]}, 0.66, {face: 'smile', headTilt: 10})}
        <Clasp at={gHand} s={0.66} />
        <Stache h={gh} s={0.66} facing={1} />
        {/* 两名驼背老侍女托盘上茶 */}
        {[1, 0].map((i) => {
          const m = maid(i);
          return (
            <g key={i}>
              <path d={`M${m.neck[0] - 30 * ms} ${m.neck[1] + 10 * ms} q${-34 * ms} ${40 * ms} ${-14 * ms} ${110 * ms} L${m.neck[0] + 10 * ms} ${m.neck[1] + 60 * ms} Z`} fill={MAID.robeD} />
              {R(MAID, {...m.base, hip: m.hip, neck: m.neck, handN: [m.tray[0] - 20, m.tray[1] + 6], handF: [m.tray[0] + 30, m.tray[1] + 6]}, ms, {face: 'calm', headTilt: 26, headAt: [m.neck[0] + 34 * ms, m.neck[1] - 30 * ms]})}
              <Wrinkles h={m.h} s={ms} facing={1} />
              <Tray at={m.tray} s={ms} />
            </g>
          );
        })}
        <Vignette k={0.5} />
      </Svg>
    </AbsoluteFill>
  );
};

/* ═════════ 第 13 屏：别屋门被挤得一鼓一鼓 ═════════ */
const Sc13: React.FC<{t: number}> = ({t}) => {
  const bumps = [bt(S13.bump1), bt(S13.bump2)];
  const bulge = bumps.reduce((a, b) => a + (t >= b ? Math.exp(-(t - b) / 5) * Math.abs(Math.sin((t - b) / 2.4)) : 0), 0) + 0.12 * (0.5 + 0.5 * Math.sin(t / 4));
  const jolt = bumps.reduce((a, b) => a + (t >= b ? Math.exp(-(t - b) / 4) * 14 : 0), 0);
  const {x: sx, y: sy} = shakeXY(t, bumps[1], 6);
  const gs = 0.7;
  const doorX = 760, doorW = 420, doorY = 260, doorH = 690;
  const gp = standPose(doorX + 120, 1000, gs, 1);
  const gHip: P = [gp.hip[0] + jolt * 0.6, gp.hip[1]];
  const gNeck: P = lean(gHip, -10 + jolt * 0.3, gs);
  const gh = headOf(gHip, gNeck, gs);
  const gap = 16 + 30 * bulge;
  const eyesO = clamp01((t - bt(0.6)) / 10);
  const dustT = t;
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
      <Svg>
        <defs>
          <linearGradient id="s13wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2e261c" />
            <stop offset="1" stopColor="#4a3e2c" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s13wall)" />
        {Array.from({length: 10}, (_, i) => <rect key={i} x={i * 200 + 40} y={90} width={8} height={640} fill="rgba(0,0,0,0.14)" />)}
        <Beam id="s13b" y={110} h={50} base="#4a3a28" />
        <rect width={1920} height={60} fill="#1e180e" />
        <Floor id="s13f" y={950} c1="#5a4a32" c2="#2a2216" lines="rgba(0,0,0,0.2)" />
        {/* 门洞 */}
        <rect x={doorX - 30} y={doorY - 30} width={doorW + 60} height={doorH + 30} fill="#2a1a0e" />
        <rect x={doorX} y={doorY} width={doorW} height={doorH} fill="#0a0604" />
        {/* 门缝里：一排眼睛 + 裙角 */}
        <g opacity={eyesO}>
          {Array.from({length: 7}, (_, i) => {
            const y = doorY + 120 + i * 62;
            const blink = Math.sin(t / 7 + i * 1.7) > 0.93 ? 0.15 : 1;
            return (
              <g key={i} transform={`translate(${doorX + doorW / 2} ${y}) scale(1.5)`}>
                <ellipse cx={-6} cy={0} rx={9} ry={9 * blink} fill="#f4ecd8" />
                <circle cx={-4} cy={0} r={4 * blink} fill="#1b1410" />
                <ellipse cx={8} cy={0} rx={9} ry={9 * blink} fill="#f4ecd8" opacity={gap > 18 ? 1 : 0.5} />
                <circle cx={10} cy={0} r={4 * blink} fill="#1b1410" opacity={gap > 18 ? 1 : 0.5} />
              </g>
            );
          })}
          {['#c84a6a', '#e8a0b0', '#7a5ab0', '#e0c060'].map((c, i) => (
            <path key={i} d={`M${doorX + doorW / 2 - 4 - i * 6} ${doorY + doorH - 4} q${-30 - i * 6} ${-20} ${-50 - i * 10} 0 Z`} fill={c} />
          ))}
        </g>
        {/* 两扇门板（往外鼓） */}
        {[-1, 1].map((side) => {
          const x0 = side < 0 ? doorX : doorX + doorW / 2 + gap / 2;
          const x1 = side < 0 ? doorX + doorW / 2 - gap / 2 : doorX + doorW;
          const mid = (x0 + x1) / 2;
          const b = bulge * 26;
          return (
            <g key={side}>
              <path d={`M${x0} ${doorY} Q${mid} ${doorY + b * 0.4} ${x1} ${doorY} L${x1} ${doorY + doorH} Q${mid} ${doorY + doorH + b * 0.4} ${x0} ${doorY + doorH} Z`} fill="#7a5230" stroke="#2a180a" strokeWidth={5} />
              {[0.2, 0.5, 0.8].map((k) => (
                <path key={k} d={`M${x0 + 16} ${doorY + doorH * k} Q${mid} ${doorY + doorH * k + b} ${x1 - 16} ${doorY + doorH * k}`} stroke="#4a3018" strokeWidth={8} fill="none" />
              ))}
              {Array.from({length: 4}, (_, j) => (
                <path key={j} d={`M${lerp(x0, x1, 0.2 + j * 0.2)} ${doorY + 30} L${lerp(x0, x1, 0.2 + j * 0.2) + side * b * 0.3} ${doorY + doorH * 0.5} L${lerp(x0, x1, 0.2 + j * 0.2)} ${doorY + doorH - 30}`} stroke="#5e3c20" strokeWidth={3} fill="none" />
              ))}
              <circle cx={side < 0 ? x1 - 22 : x0 + 22} cy={doorY + doorH * 0.5} r={12} fill="#c99a3a" />
            </g>
          );
        })}
        {bulge > 0.5 && (
          <g stroke="#f4e6c0" strokeWidth={6} strokeLinecap="round" opacity={clamp01(bulge - 0.4)}>
            <path d={`M${doorX - 40} ${doorY + 180} l-40 -20 M${doorX - 40} ${doorY + 300} l-50 0 M${doorX - 40} ${doorY + 420} l-40 20`} />
          </g>
        )}
        {jolt > 4 && <text x={doorX + doorW + 50} y={doorY + 150} fontFamily={LF.serif} fontWeight={900} fontSize={90} fill="#f4e2b0" stroke="#3a1a0c" strokeWidth={6} paintOrder="stroke" opacity={clamp01(jolt / 10)}>咚！</text>}
        {/* 杨广背靠门板顶住，冲爹娘微笑 */}
        {R({...CAST.guangJin, robe: '#8a8478', robeD: '#64605a'}, {...gp, hip: gHip, neck: gNeck, handN: [gHip[0] + 10, gHip[1] - 10], handF: [doorX + 40, gHip[1] - 30], footN: [gp.footN[0] + 40, 1000], footF: [gp.footF[0] + 30, 1000]}, gs, {face: 'smile', headTilt: -8})}
        <Stache h={gh} s={gs} facing={1} hitch={0.3} />
        {jolt > 3 && <Sweat x={gh[0] - 40} y={gh[1] - 30} s={0.9} />}
        {/* 角落：断弦落灰的琴 */}
        <g transform="translate(1440 820) rotate(-6)">
          <rect x={-50} y={40} width={30} height={110} fill="#3a2414" />
          <rect x={300} y={40} width={30} height={110} fill="#3a2414" />
          <path d="M-90 0 Q140 -40 370 0 L360 40 Q140 10 -80 40 Z" fill="#5a3418" stroke="#2a1608" strokeWidth={4} />
          <path d="M-86 4 Q140 -34 366 4 L364 12 Q140 -26 -84 12 Z" fill="#b8ae98" opacity={0.75} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const y = -10 + i * 6;
            const broken = i === 1 || i === 3 || i === 4;
            return broken ? (
              <g key={i}>
                <path d={`M-70 ${y + 14} Q20 ${y + 10} 90 ${y + 30}`} stroke="#e8dcc0" strokeWidth={2} fill="none" />
                <path d={`M350 ${y + 14} Q260 ${y + 2} 200 ${y + 34}`} stroke="#e8dcc0" strokeWidth={2} fill="none" />
              </g>
            ) : (
              <line key={i} x1={-70} y1={y + 14} x2={350} y2={y + 14} stroke="#e8dcc0" strokeWidth={2} />
            );
          })}
          {Array.from({length: 40}, (_, i) => <circle key={i} cx={-70 + ((i * 53) % 420)} cy={-4 + ((i * 17) % 30)} r={2 + (i % 3)} fill="#c8c0ac" opacity={0.7} />)}
          {Array.from({length: 5}, (_, i) => <path key={i} d={`M${20 + i * 70} -28 q10 -14 22 -4`} stroke="rgba(200,190,170,0.6)" strokeWidth={2} fill="none" />)}
        </g>
        <path d="M1380 700 q40 -10 60 20 q20 -30 60 -14" stroke="rgba(220,210,190,0.45)" strokeWidth={2} fill="none" />
        {Array.from({length: 18}, (_, i) => {
          const k = ((dustT / 90 + i / 18) % 1);
          return <circle key={i} cx={1420 + ((i * 41) % 380)} cy={600 + k * 260} r={2.5} fill="rgba(240,230,200,0.5)" opacity={Math.sin(k * Math.PI)} />;
        })}
        <path d="M1340 560 L1760 560 L1700 1000 L1400 1000 Z" fill="rgba(255,230,170,0.05)" />
        <Vignette k={0.55} />
      </Svg>
    </AbsoluteFill>
  );
};

/* ═════════ 第 14 屏：皇后、杨素站到杨广身后；太子冠易主 ═════════ */
const Sc14: React.FC<{t: number}> = ({t}) => {
  const gs = 0.7, ys = 0.68;
  const yx = 470, gx = 1150;
  const yp = standPose(yx, 1000, ys, 1);
  const gp = standPose(gx, 1030, gs, -1);
  const come = easeOut(clamp01((t - bt(0.4)) / bt(1.6)));
  const dx = lerp(1700, 960, come);
  const sx = lerp(2100, 1360, come);
  const dp = standPose(dx, 960, 0.64, -1);
  const spBase = standPose(sx, 960, 0.72, -1);
  const sp = {...spBase, neck: [spBase.neck[0], spBase.neck[1] - 30] as P};
  const unroll = easeInOut(clamp01((t - bt(S14.edict)) / bt(1.2)));
  const lift = clamp01((t - bt(S14.crown)) / bt(2));
  const yh = headOf(yp.hip, yp.neck, ys);
  const gh = headOf(gp.hip, gp.neck, gs);
  const from: P = [yh[0], yh[1] - 46 * ys];
  const to: P = [gh[0], gh[1] - 46 * gs];
  const k = easeInOut(lift);
  const crown: P = [lerp(from[0], to[0], k), lerp(from[1], to[1], k) - Math.sin(k * Math.PI) * 260];
  const cs = lerp(ys, gs, k) * 0.55;
  const year = easeOutBack(clamp01((t - bt(S14.year)) / 10));
  const shocked = lift > 0.05;
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s14wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#240a06" />
            <stop offset="1" stopColor="#4a160c" />
          </linearGradient>
          <radialGradient id="s14spot" cx="0.6" cy="0.5" r="0.45">
            <stop offset="0" stopColor="rgba(255,210,130,0.35)" />
            <stop offset="1" stopColor="rgba(255,210,130,0)" />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s14wall)" />
        <Screen x={760} y={240} w={900} h={380} panels={6} art="mountain" />
        <rect width={1920} height={1080} fill="url(#s14spot)" />
        <Pillar id="s14p1" x={140} y0={60} y1={1080} w={120} />
        <Pillar id="s14p2" x={1800} y0={60} y1={1080} w={120} />
        <Beam id="s14b" y={130} h={60} />
        <Brackets y={130} gap={160} s={0.8} />
        <rect width={1920} height={70} fill="#140604" />
        <Floor id="s14f" y={760} c1="#3a160a" c2="#100604" />
        <Incense f={t} x={700} y={800} s={0.9} />
        {/* 后排：独孤皇后、杨素 */}
        {R(CAST.dugu, {...dp, handN: [dp.neck[0] - 50, dp.neck[1] + 70], handF: [dp.neck[0] - 40, dp.neck[1] + 76]}, 0.64, {face: 'smile'})}
        <Clasp at={[dp.neck[0] - 46, dp.neck[1] + 72]} s={0.64} />
        {R(SU, {...sp, handN: [sp.neck[0] - 46, sp.neck[1] + 80], handF: [sp.neck[0] - 30, sp.neck[1] + 86]}, 0.72, {face: 'smile'})}
        <Clasp at={[sp.neck[0] - 40, sp.neck[1] + 84]} s={0.7} />
        {come > 0.8 && <NameTag x={headOf(sp.hip, sp.neck, 0.72)[0]} y={headOf(sp.hip, sp.neck, 0.72)[1] - 80} text="杨素" size={28} />}
        {come > 0.8 && <NameTag x={headOf(dp.hip, dp.neck, 0.64)[0]} y={headOf(dp.hip, dp.neck, 0.64)[1] - 110} text="独孤皇后" size={26} />}
        {/* 杨勇 */}
        {R(CAST.yong, {...yp, handN: shocked ? [yh[0] + 30, yh[1] - 30] : yp.handN, handF: shocked ? [yh[0] - 20, yh[1] - 40] : yp.handF}, ys, {face: shocked ? 'shock' : 'calm', headTilt: shocked ? -6 : 0})}
        {shocked && <Sweat x={yh[0] - 40} y={yh[1] - 10} s={0.8} />}
        {/* 杨广 */}
        {R(CAST.guangJin, {...gp, handN: [gp.neck[0] - 40, gp.neck[1] + 72], handF: [gp.neck[0] - 30, gp.neck[1] + 78]}, gs, {face: 'smile', headTilt: k > 0.95 ? -6 : 0})}
        <Clasp at={[gp.neck[0] - 36, gp.neck[1] + 74]} s={gs} />
        <Stache h={gh} s={gs} facing={-1} hitch={k > 0.95 ? 1 : 0.2} />
        <Crown x={crown[0]} y={crown[1]} s={cs} glint={Math.sin(t / 3) * 0.5 + 0.5} />
        {lift > 0 && lift < 1 && <path d={`M${from[0]} ${from[1]} Q${(from[0] + to[0]) / 2} ${from[1] - 360} ${to[0]} ${to[1]}`} stroke="rgba(244,226,176,0.35)" strokeWidth={4} strokeDasharray="12 14" fill="none" />}
        {/* 诏书展开 */}
        {unroll > 0 && (
          <g transform="translate(1250 380)">
            <rect x={-20 - 300 * unroll} y={-90} width={600 * unroll + 40} height={180} fill="#e8d08a" stroke="#8a6a2a" strokeWidth={4} opacity={0.97} />
            <rect x={-30 - 300 * unroll} y={-100} width={20} height={200} rx={8} fill="#7a3a1a" />
            <rect x={10 + 300 * unroll} y={-100} width={20} height={200} rx={8} fill="#7a3a1a" />
            <g opacity={clamp01(unroll * 2 - 1)}>
              <text x={0} y={-24} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={50} fill="#3a1a0c">诏</text>
              <text x={-10} y={46} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={34} fill="#3a1a0c">立晋王广为皇太子</text>
              <rect x={196} y={-70} width={60} height={60} fill="none" stroke="#c0281c" strokeWidth={5} />
            </g>
          </g>
        )}
        {year > 0 && (
          <g transform={`translate(1680 900) rotate(-6) scale(${year})`}>
            <rect x={-150} y={-70} width={300} height={140} fill="rgba(30,8,6,0.8)" stroke="#d8402e" strokeWidth={8} />
            <text x={0} y={30} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={92} fill="#e8503a">600 年</text>
          </g>
        )}
        <Vignette k={0.55} />
      </Svg>
    </AbsoluteFill>
  );
};

/* ───── 宫墙 + 大树（第 15、16 屏共用的外景元素） ───── */
const Wall: React.FC<{x0: number; x1: number; top: number; bottom: number}> = ({x0, x1, top, bottom}) => (
  <g>
    <rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill="#9a2a1c" />
    <rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill="url(#wallShade)" />
    <path d={`M${x0 - 20} ${top + 4} L${x0 + 10} ${top - 40} L${x1 - 10} ${top - 40} L${x1 + 20} ${top + 4} Z`} fill="#2a3a3a" />
    {Array.from({length: Math.ceil((x1 - x0) / 28)}, (_, i) => <rect key={i} x={x0 + i * 28} y={top - 40} width={14} height={44} fill="#1a2626" />)}
    <rect x={x0 - 20} y={top} width={x1 - x0 + 40} height={10} fill="#1a2626" />
    <rect x={x0} y={bottom - 40} width={x1 - x0} height={40} fill="#6a5a48" />
  </g>
);
const Tree: React.FC<{f: number; x: number; ground: number; s?: number}> = ({f, x, ground, s = 1}) => (
  <g transform={`translate(${x} ${ground}) scale(${s})`}>
    <path d="M-70 0 Q-40 -200 -50 -420 Q-60 -560 -20 -700 L40 -700 Q30 -560 50 -420 Q60 -200 90 0 Z" fill="#4a3020" stroke="#2a180c" strokeWidth={5} />
    {[[-40, -300], [10, -460], [-30, -620]].map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx={10} ry={22} fill="#2a180c" opacity={0.6} />)}
    <path d="M10 -560 Q140 -640 330 -650" stroke="#4a3020" strokeWidth={34} fill="none" strokeLinecap="round" />
    <path d="M-10 -500 Q-150 -560 -290 -540" stroke="#4a3020" strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d="M0 -690 Q20 -800 110 -860" stroke="#4a3020" strokeWidth={26} fill="none" strokeLinecap="round" />
    {[[-260, -620, 150], [-60, -820, 190], [200, -760, 180], [320, -640, 130], [80, -660, 150], [-200, -720, 140]].map(([cx, cy, r], i) => (
      <g key={i} transform={`translate(${cx + Math.sin(f / 30 + i) * 4} ${cy})`}>
        <circle r={r} fill={i % 2 ? '#3e5a32' : '#4a6a3a'} />
        <circle r={r * 0.7} cx={-r * 0.2} cy={-r * 0.2} fill="#5a7a44" opacity={0.6} />
      </g>
    ))}
  </g>
);

/* ═════════ 第 15 屏：杨勇爬树喊冤 ═════════ */
const Sc15: React.FC<{t: number}> = ({t}) => {
  const ys = 0.62;
  const climb = easeOut(clamp01(t / bt(1.4)));
  const shout = t > bt(S15.shout);
  const breathe = shout ? 0.5 + 0.5 * Math.sin(t / 3) : 0;
  const hip: P = [596, lerp(820, 470, climb)];
  const neck: P = [hip[0] + 24 + 6 * breathe, hip[1] - 190 * ys - 4 * breathe];
  const h = headOf(hip, neck, ys);
  const branch: P = [h[0] - 30, h[1] - 90];
  const mouthHand: P = [h[0] + 50 * ys, h[1] + 18];
  const turn = easeInOut(clamp01((t - bt(S15.turn)) / 10));
  const ws = 0.36;
  const wp = standPose(1500, 560, ws, turn > 0.5 ? -1 : 1);
  const wh = headOf(wp.hip, wp.neck, ws);
  const z = 1 + 0.04 * clamp01(t / bt(8));
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s15sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a6a7a" />
            <stop offset="1" stopColor="#c8b898" />
          </linearGradient>
          <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,0,0,0.35)" />
            <stop offset="0.3" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.25)" />
          </linearGradient>
        </defs>
        <g transform={`translate(800 600) scale(${z}) translate(-800 -600)`}>
          <rect width={1920} height={1080} fill="url(#s15sky)" />
          {[[300, 160], [1200, 120], [1700, 200]].map(([x, y], i) => <ellipse key={i} cx={x + ((t * 0.4) % 200)} cy={y} rx={180} ry={30} fill="rgba(255,255,255,0.25)" />)}
          {/* 宫墙里：殿顶与台基，文帝站在台上 */}
          <path d="M1060 330 L1240 250 L1780 250 L1920 330 Z" fill="#2a3232" />
          <rect x={1120} y={330} width={760} height={200} fill="#7a2a1a" />
          {Array.from({length: 7}, (_, i) => <rect key={i} x={1150 + i * 110} y={350} width={60} height={160} fill="#c8904a" opacity={0.65} />)}
          <rect x={1080} y={530} width={840} height={40} fill="#b8a888" />
          {R(CAST.wen, wp, ws, {face: turn > 0.5 ? 'shock' : 'calm', headTilt: turn > 0.5 ? -8 : 0})}
          {turn > 0.6 && <text x={wh[0] - 30} y={wh[1] - 40} fontFamily={LF.serif} fontWeight={900} fontSize={50} fill="#f4e2b0" stroke="#3a1a0c" strokeWidth={5} paintOrder="stroke">？</text>}
          <Wall x0={900} x1={1920} top={620} bottom={1000} />
          <rect x={0} y={980} width={1920} height={100} fill="#6a5a40" />
          <Tree f={t} x={560} ground={1000} />
          {/* 杨勇：双腿夹紧树干，左手抱上方树枝，右手拢在嘴边 */}
          {R(CAST.yong, {hip, neck, footN: [hip[0] - 40, hip[1] + 118], footF: [hip[0] - 70, hip[1] + 104], kneeN: [hip[0] + 10, hip[1] + 64], kneeF: [hip[0] - 66, hip[1] + 40], handN: mouthHand, handF: branch, facing: 1}, ys, {face: shout ? 'shout' : 'pain', mouth: shout ? 1 : 0.3, hem: 80})}
          {shout && (
            <g transform={`translate(${mouthHand[0] + 6} ${mouthHand[1]})`}>
              <path d="M0 -12 L34 -26 L34 26 L0 12 Z" fill="#e6c9a0" stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
            </g>
          )}
          {shout && <Waves at={[mouthHand[0] + 50, mouthHand[1]]} t={t} n={3} s={1.2} />}
          {shout && <text x={960} y={860} fontFamily={LF.serif} fontWeight={900} fontSize={84} fill="#f4e2b0" stroke="#3a1a0c" strokeWidth={8} paintOrder="stroke" transform={`rotate(-4 960 860) scale(${1 + 0.04 * breathe})`} style={{transformOrigin: '960px 860px'}}>父皇——冤枉啊！</text>}
        </g>
        <Vignette k={0.45} />
      </Svg>
    </AbsoluteFill>
  );
};

/* ═════════ 第 16 屏：杨素进谗，宫门合拢 ═════════ */
const Sc16: React.FC<{t: number}> = ({t}) => {
  const close = easeIn(clamp01((t - bt(S16.close)) / bt(1.1)));
  const slam = bt(S16.close) + bt(1.1);
  const {x: shx, y: shy} = shakeXY(t, slam, 10);
  const ws = 0.72, ss = 0.76;
  const wp = standPose(620, 1010, ws, 1);
  const sBase = standPose(860, 1010, ss, -1);
  const bend = easeOut(clamp01((t - bt(0.3)) / 12));
  const sNeck: P = lean(sBase.hip, -lerp(0, 30, bend), ss);
  const sh = headOf(sBase.hip, sNeck, ss);
  const wh = headOf(wp.hip, wp.neck, ws);
  const circ = t > bt(S16.circle) && t < bt(S16.circle) + 30 ? ((t - bt(S16.circle)) / 15) * Math.PI * 2 : 0;
  const finger: P = [sh[0] - 6 + Math.cos(circ) * 18, sh[1] - 50 + Math.sin(circ) * 18];
  const wave = easeOut(clamp01((t - bt(S16.wave)) / 8));
  const wHandF: P = [wh[0] + 34, wh[1] - 26];
  const wHandN: P = [lerp(wp.neck[0] + 60, wp.hip[0] + 100, wave), lerp(wp.neck[1] + 40, wp.hip[1] + 60, wave)];
  const gateX = 1360, gateW = 760, gateTop = 220, gateBot = 900;
  const leaf = (gateW / 2) * close;
  const freeze = t > slam;
  return (
    <AbsoluteFill style={{transform: `translate(${shx}px, ${shy}px)`}}>
      <Svg>
        <defs>
          <linearGradient id="s16sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a6a7a" />
            <stop offset="1" stopColor="#c8b898" />
          </linearGradient>
          <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,0,0,0.35)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.25)" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="#3a1e14" />
        {/* 门外：天空、树、树上的杨勇（小） */}
        <rect x={gateX - gateW / 2} y={gateTop} width={gateW} height={gateBot - gateTop} fill="url(#s16sky)" />
        <g transform={`translate(${gateX - 40} ${gateBot}) scale(0.5) translate(-560 -1000)`}>
          <Tree f={t} x={560} ground={1000} />
          {R(CAST.yong, {hip: [600, 450], neck: [630, 332], footN: [660, 570], footF: [580, 600], kneeN: [670, 490], kneeF: [640, 520], handN: freeze ? [700, 300] : [662, 360], handF: [570, 250], facing: 1}, 0.62, {face: freeze ? 'shock' : 'shout', mouth: freeze ? 0.6 : 1, hem: 80})}
          {freeze && <text x={700} y={240} fontFamily={LF.serif} fontWeight={900} fontSize={90} fill="#f4e2b0" stroke="#3a1a0c" strokeWidth={8} paintOrder="stroke">……</text>}
        </g>
        {/* 门洞 + 两扇门向内合拢 */}
        <rect x={gateX - gateW / 2 - 60} y={gateTop - 120} width={gateW + 120} height={gateBot - gateTop + 120} fill="none" stroke="#7a1e12" strokeWidth={120} />
        <path d={`M${gateX - gateW / 2 - 140} ${gateTop - 120} L${gateX} ${gateTop - 250} L${gateX + gateW / 2 + 140} ${gateTop - 120} Z`} fill="#2a3232" />
        {[-1, 1].map((side) => {
          const x0 = side < 0 ? gateX - gateW / 2 : gateX + gateW / 2 - leaf;
          return (
            <g key={side}>
              <rect x={x0} y={gateTop} width={leaf} height={gateBot - gateTop} fill="#8a2416" stroke="#3a0c06" strokeWidth={6} />
              {leaf > 30 &&
                Array.from({length: 7}, (_, r) =>
                  Array.from({length: Math.max(1, Math.floor(leaf / 70))}, (_, c) => <circle key={`${r}_${c}`} cx={x0 + 35 + c * 70} cy={gateTop + 60 + r * 90} r={11} fill="#d8a838" />),
                )}
            </g>
          );
        })}
        {close > 0.98 && <line x1={gateX} y1={gateTop} x2={gateX} y2={gateBot} stroke="#2a0804" strokeWidth={6} />}
        {freeze && <Dust f={t} at={[gateX, gateBot]} since={slam} n={22} spread={520} />}
        <rect x={0} y={900} width={1920} height={180} fill="#8a7a62" />
        {Array.from({length: 12}, (_, i) => <line key={i} x1={i * 170} y1={900} x2={i * 170 - 60} y2={1080} stroke="rgba(0,0,0,0.12)" strokeWidth={3} />)}
        <Pillar id="s16p" x={120} y0={0} y1={1000} w={140} />
        {/* 隋文帝：右手扶额，左手往下一挥 */}
        {R(CAST.wen, {...wp, handN: wHandN, handF: wHandF}, ws, {face: wave > 0.5 ? 'stern' : 'pain', headTilt: 10})}
        {/* 杨素弯腰凑到耳边：左手袍袖掩嘴，右手食指在太阳穴旁画圈 */}
        {R(SU, {...sBase, neck: sNeck, handN: finger, handF: [sh[0] - 50, sh[1] + 20]}, ss, {face: 'smile', headTilt: -10})}
        <path d={`M${sh[0] - 66} ${sh[1] + 2} q-26 30 -6 60 q24 -10 40 -40 Z`} fill={SU.robe} stroke="#1a0c20" strokeWidth={3} />
        <g transform={`translate(${finger[0]} ${finger[1]})`}>
          <line x1={0} y1={0} x2={-6} y2={-30} stroke="#e6c9a0" strokeWidth={9} strokeLinecap="round" />
        </g>
        {circ > 0 && <circle cx={sh[0] - 6} cy={sh[1] - 50} r={22} fill="none" stroke="#f4e6c0" strokeWidth={4} strokeDasharray="8 8" />}
        <NameTag x={sh[0]} y={sh[1] - 110} text="杨素" size={28} />
        <Vignette k={0.5} />
      </Svg>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s11: Sc11, s12: Sc12, s13: Sc13, s14: Sc14, s15: Sc15, s16: Sc16};

export const Act2: React.FC<{f: number}> = ({f}) => {
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
export const ACT2_START = fbt(SHOT.s11[0]);
