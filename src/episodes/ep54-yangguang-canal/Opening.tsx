import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, rand} from '../../library/anim';
import {Flash, shakeXY} from '../../library/lamplight/stage';
import {L, LF} from '../../library/lamplight/theme';
import {headOf, slowT} from '../ep53-changan-curfew/Kit';
import {P, Rig} from '../ep53-changan-curfew/Rig';
import {GoldTube, Label3, Map3D, Pin3, project, type Cam3} from './Map3D';
import {Brush, Crown, DragonBoat, Dust, Jue, LOOK54, ModernHair, Mustache, Pot, RAIL_TOP, Tag, WhiteBubble, YG_S, yangOnBoat} from './Props';
import {fbt, S3, SHOT, TAG_BEATS} from './timeline';

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/* ───────── 运河黄昏 + 龙舟 ───────── */
const BOAT: P = [960, 830];
const BS = 0.62;
const toScene = (lp: P): P => [BOAT[0] + BS * lp[0], BOAT[1] + BS * lp[1]];
export type SceneCam = {fx: number; fy: number; z: number};

type CanalState = {
  tags?: {p: number; at?: P; ink?: number}[]; // 三张标签（龙舟局部坐标）
  blob?: {at: P; r: number; o: number}; // 熔成黑团
  pot?: {at: P; rot: number; o?: number}; // 黑锅（扣在头上 / 飞）
  cup?: {at: P; rot: number} | null; // 飞出去的金爵（null = 在手上）
  face?: 'smile' | 'shock' | 'calm';
  squash?: number;
  scroll?: number; // 岸边滚动（倒带时反着走）
};

const TAG_TEXT = ['运河', '龙舟', '南巡'];
/** 标签贴在杨广身上的位置（龙舟局部坐标） */
const tagSpots = () => {
  const {p, head} = yangOnBoat(0);
  return [
    {at: [p.neck[0] - 4, p.neck[1] + 24] as P, rot: -8},
    {at: [p.neck[0] + 6, p.neck[1] + 58] as P, rot: 7},
    {at: [head[0] - 2, head[1] - 8] as P, rot: -12},
  ];
};

const CanalBackdrop: React.FC<{f: number; scroll: number; cam: SceneCam}> = ({f, scroll, cam}) => {
  // 远景按 z 的平方根缩放（视差），避免放大时背景糊成一片
  const zb = Math.sqrt(cam.z);
  const bankY = (BOAT[1] - 40 - cam.fy) * zb + 540;
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #2a1d3e 0%, #6a3450 30%, #c8643a 62%, #f2a95a 80%, #f6c47a 100%)'}} />
      <Svg>
        <circle cx={1500 - (cam.fx - 960) * 0.2} cy={bankY - 120 * zb} r={70 * zb} fill="#ffe0a0" opacity={0.85} />
        <circle cx={1500 - (cam.fx - 960) * 0.2} cy={bankY - 120 * zb} r={130 * zb} fill="rgba(255,210,140,0.25)" />
        <g transform={`translate(${960 - (cam.fx - 960) * zb * 0.5} ${bankY}) scale(${zb})`}>
          <path d="M-3000 0 L-3000 -40 Q-2000 -70 -1000 -46 Q0 -80 1000 -50 Q2000 -70 3000 -40 L3000 0 Z" fill="#4a2a2a" />
          {Array.from({length: 40}, (_, i) => {
            const x = ((i * 160 - scroll * 0.6) % 6400 + 6400) % 6400 - 3200;
            const h = 60 + 50 * rand(i);
            return (
              <g key={i}>
                <line x1={x} y1={-40} x2={x} y2={-40 - h} stroke="#2a1818" strokeWidth={8} />
                {[0, 1, 2, 3, 4].map((j) => <path key={j} d={`M${x} ${-40 - h} q${(j - 2) * 22} 20 ${(j - 2) * 30} ${50 + 10 * j}`} stroke="#2e1c1a" strokeWidth={4} fill="none" />)}
              </g>
            );
          })}
          <rect x={-3000} y={-2} width={6000} height={14} fill="#b88a50" />
        </g>
      </Svg>
      <AbsoluteFill style={{top: bankY + 10 * zb, background: 'linear-gradient(180deg, #3a6a6a 0%, #285050 40%, #183636 100%)'}} />
      <Svg>
        {Array.from({length: 26}, (_, i) => {
          const y = bankY + 30 * zb + (i % 13) * 34 * zb + (i > 12 ? 17 * zb : 0);
          const x = ((i * 237 - scroll * (1.2 + (i % 13) * 0.08)) % 2400 + 2400) % 2400 - 240;
          return <path key={i} d={`M${x} ${y} q30 -8 60 0 q30 8 60 0`} stroke="rgba(220,240,230,0.35)" strokeWidth={3} fill="none" />;
        })}
        <rect x={0} y={bankY + 10 * zb} width={1920} height={18 * zb} fill="rgba(255,200,120,0.35)" />
      </Svg>
    </>
  );
};

export const CanalScene: React.FC<{f: number; cam: SceneCam; st?: CanalState}> = ({f, cam, st = {}}) => {
  const sway = Math.sin(f / 22) * 1.1;
  const bob = Math.sin(f / 17) * 4;
  const cupUp = st.cup === undefined ? 1 : 0.45;
  const y = yangOnBoat(f, st.cup ? 0.2 : cupUp);
  const sq = st.squash ?? 0;
  const pose = {...y.p, hip: [y.p.hip[0], y.p.hip[1] + 6 * sq] as P, neck: [y.p.neck[0] - 4 * sq, y.p.neck[1] + 22 * sq] as P};
  const head = headOf(pose.hip, pose.neck, YG_S);
  const handN: P = st.cup ? [pose.neck[0] + 60 * YG_S, pose.neck[1] - 30 * YG_S] : [y.handN[0], y.handN[1] + 22 * sq];
  const spots = tagSpots();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <CanalBackdrop f={f} scroll={st.scroll ?? f * 3} cam={cam} />
      <Svg>
        <g transform={`translate(960 540) scale(${cam.z}) translate(${-cam.fx} ${-cam.fy})`}>
          {/* 倒影 */}
          <g transform={`translate(${BOAT[0]} ${BOAT[1] + 30}) scale(${BS} ${-BS * 0.5})`} opacity={0.22}>
            <DragonBoat f={f} />
          </g>
          <g transform={`translate(${BOAT[0]} ${BOAT[1] + bob}) rotate(${sway}) scale(${BS})`}>
            <DragonBoat
              f={f}
              front={
                <>
                  {st.tags?.map((tg, i) => <Tag key={i} at={tg.at ?? spots[i].at} text={TAG_TEXT[i]} s={0.5} p={tg.p} rot={spots[i].rot} ink={tg.ink} />)}
                  {st.blob && st.blob.o > 0 && <circle cx={st.blob.at[0]} cy={st.blob.at[1]} r={st.blob.r} fill="#111" opacity={st.blob.o} />}
                  {st.pot && <Pot at={st.pot.at} w={64} rot={st.pot.rot} />}
                  {st.cup && <Jue at={st.cup.at} s={YG_S * 0.9} tilt={st.cup.rot} />}
                </>
              }
            >
              <Rig {...(LOOK54.yangEmp as object)} {...pose} handN={handN} handF={y.handF} s={YG_S} face={st.face ?? 'smile'} headTilt={st.cup === undefined ? -4 : 0} elbowBend={1}>
                {!st.cup && <Jue at={[handN[0] + 2 * YG_S, handN[1] - 14 * YG_S]} s={YG_S * 0.9} tilt={st.cup === undefined ? -18 : 0} />}
              </Rig>
              <Mustache h={head} s={YG_S} facing={1} />
            </DragonBoat>
          </g>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/* ───────── 第 1 屏左：扬州曹庄砖室墓 ───────── */
const TG = 950; // 墓室地面（跪地）
const EPI = '隨故煬帝墓誌';
const kneelOne = (x: number, s: number, facing: 1 | -1) => {
  const hip: P = [x, TG - 128 * s];
  const neck: P = [x + facing * 100 * s, hip[1] - 150 * s];
  return {
    hip, neck, facing,
    kneeN: [x + facing * 112 * s, TG - 110 * s] as P,
    footN: [x + facing * 118 * s, TG] as P,
    kneeF: [x + facing * 16 * s, TG - 14 * s] as P,
    footF: [x - facing * 95 * s, TG - 10 * s] as P,
  };
};

export const Tomb: React.FC<{f: number; lit: (i: number) => number}> = ({f, lit}) => {
  const bricks: React.ReactNode[] = [];
  for (let r = 0; r < 26; r++) {
    for (let c = -1; c < 15; c++) {
      const x = c * 72 + (r % 2 ? 36 : 0);
      const y = 60 + r * 28;
      if (y > 720) continue;
      const v = rand(r * 31 + c);
      bricks.push(<rect key={`${r}-${c}`} x={x} y={y} width={68} height={24} fill={`rgb(${70 + 14 * v},${66 + 12 * v},${62 + 10 * v})`} />);
    }
  }
  const sx = 0.55; // 墓志面透视压扁
  return (
    <Svg>
      <rect width={1920} height={1080} fill="#1d1a18" />
      {bricks}
      {/* 券顶 */}
      <path d="M-20 0 L980 0 L980 120 Q480 -40 -20 120 Z" fill="#141210" />
      <path d="M-20 120 Q480 -40 980 120" stroke="#2a2622" strokeWidth={14} fill="none" />
      {/* 地面砖（透视） */}
      <path d="M-20 720 L980 720 L980 1080 L-20 1080 Z" fill="#3a3430" />
      {Array.from({length: 13}, (_, i) => <line key={i} x1={480 + (i - 6) * 90} y1={720} x2={480 + (i - 6) * 260} y2={1080} stroke="#24201c" strokeWidth={3} />)}
      {[760, 810, 870, 940, 1020].map((y) => <line key={y} x1={-20} y1={y} x2={980} y2={y} stroke="#24201c" strokeWidth={3} />)}
      {/* 工作灯 */}
      <line x1={110} y1={720} x2={110} y2={420} stroke="#2a2a2a" strokeWidth={8} />
      <path d="M86 420 L134 420 L148 470 L72 470 Z" fill="#3a3a3a" />
      <circle cx={110} cy={472} r={16} fill="#fff2c0" />
      <path d="M72 470 L148 470 L560 980 L-200 980 Z" fill="rgba(255,236,180,0.12)" />
      {/* 墓志：青石，平放 */}
      <g>
        <path d="M300 930 L660 930 L660 958 L300 958 Z" fill="#3e4a50" />
        <path d="M330 862 L630 862 L660 930 L300 930 Z" fill="#5d6b70" stroke="#2a3236" strokeWidth={3} />
        {Array.from({length: 9}, (_, i) => <line key={i} x1={345 + i * 33} y1={866} x2={318 + i * 37} y2={926} stroke="rgba(30,40,44,0.35)" strokeWidth={2} />)}
        {Array.from({length: 14}, (_, i) => <rect key={i} x={330 + rand(i * 7) * 300} y={872 + rand(i * 13) * 48} width={10 + 8 * rand(i)} height={4} fill="rgba(30,40,44,0.35)" />)}
        {Array.from(EPI).map((c, i) => {
          const col = i < 3 ? 0 : 1; // 右列「隨故煬」，左列「帝墓誌」
          const row = i % 3;
          const x = 552 - col * 66 + row * 6;
          const y = 884 + row * 21;
          const g = lit(i);
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(1 ${sx})`}>
              {g > 0 && <circle cx={0} cy={-12} r={30} fill="rgba(255,200,90,0.5)" opacity={g} />}
              <text x={0} y={0} textAnchor="middle" fontFamily={LF.scroll} fontWeight={900} fontSize={40} fill={g > 0.3 ? `rgba(255,${200 + 30 * g},${100 + 40 * g},1)` : 'rgba(40,52,56,0.9)'}>
                {c}
              </text>
            </g>
          );
        })}
      </g>
      <rect width={960} height={300} fill="url(#topShade)" />
      <defs>
        <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(0,0,0,0.75)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
    </Svg>
  );
};

/** 两名考古队员单膝跪地：左手按住墓志边缘，右手握毛刷左右刷两下 */
const Diggers: React.FC<{f: number}> = ({f}) => {
  const s = 0.8;
  const strokeA = Math.sin(clamp01((f - 14) / 60) * Math.PI * 4) * (f > 14 && f < 74 ? 1 : 0);
  const strokeB = Math.sin(clamp01((f - 22) / 60) * Math.PI * 4) * (f > 22 && f < 82 ? 1 : 0);
  const A = kneelOne(215, s, 1);
  const B = kneelOne(745, s, -1);
  const hA: P = [372 + 28 * strokeA, 862];
  const hB: P = [590 - 28 * strokeB, 862];
  const headA = headOf(A.hip, A.neck, s);
  const headB = headOf(B.hip, B.neck, s);
  return (
    <Svg>
      <Dust f={f} at={[hA[0] + 66, 896]} since={f > 14 && f < 80 ? f - 14 : -1} seed={2} spread={90} />
      <Dust f={f} at={[hB[0] - 66, 896]} since={f > 22 && f < 88 ? f - 22 : -1} seed={5} spread={90} />
      <Rig {...(LOOK54.digA as object)} {...A} handN={hA} handF={[336, 884]} s={s} face="calm" headTilt={14}>
        <Brush at={hA} s={s} ang={28} />
      </Rig>
      <ModernHair h={headA} s={s} facing={1} />
      <Brush at={hB} s={s} ang={152} />
      <Rig {...(LOOK54.digB as object)} {...B} handN={[626, 884]} handF={hB} s={s} face="calm" headTilt={-14} />
      <ModernHair h={headB} s={s} facing={-1} cap="#b8a070" />
    </Svg>
  );
};

/* ───────── 第 4 屏：倒带回宫殿 ───────── */
const CrownHall: React.FC<{f: number; glint: number; push: number}> = ({f, glint, push}) => {
  const z = 1 + 0.08 * push;
  return (
    <Svg>
      <g transform={`translate(960 600) scale(${z}) translate(-960 -600)`}>
        <rect width={1920} height={1080} fill="#2a0e0a" />
        {[360, 760, 1160, 1560].map((x) => (
          <g key={x}>
            <rect x={x - 130} y={200} width={260} height={360} fill="#3a1a10" stroke="#6a3a1a" strokeWidth={8} />
            {Array.from({length: 7}, (_, i) => <line key={`v${i}`} x1={x - 130 + (i + 1) * 32.5} y1={200} x2={x - 130 + (i + 1) * 32.5} y2={560} stroke="#5a2a14" strokeWidth={5} />)}
            {Array.from({length: 10}, (_, i) => <line key={`h${i}`} x1={x - 130} y1={200 + (i + 1) * 33} x2={x + 130} y2={200 + (i + 1) * 33} stroke="#5a2a14" strokeWidth={5} />)}
            <rect x={x - 130} y={200} width={260} height={360} fill="rgba(255,190,110,0.12)" />
          </g>
        ))}
        <rect x={0} y={110} width={1920} height={70} fill="#5a1a12" />
        {Array.from({length: 12}, (_, i) => <path key={i} d={`M${i * 170} 145 q42 -30 85 0 q42 30 85 0`} stroke="#d4a23a" strokeWidth={6} fill="none" />)}
        <rect x={0} y={170} width={1920} height={14} fill="#d4a23a" />
        <path d="M0 640 L1920 640 L1920 1080 L0 1080 Z" fill="#1a0c08" />
        {Array.from({length: 11}, (_, i) => <line key={i} x1={960 + (i - 5) * 200} y1={640} x2={960 + (i - 5) * 560} y2={1080} stroke="#2a140c" strokeWidth={4} />)}
        <rect x={620} y={690} width={680} height={40} fill="#3a1a10" stroke="#5a2a14" strokeWidth={4} />
        <rect x={580} y={730} width={760} height={40} fill="#341610" stroke="#5a2a14" strokeWidth={4} />
        <rect x={780} y={560} width={360} height={130} fill="#4a1a10" stroke="#1a0806" strokeWidth={5} />
        <path d="M770 560 L1150 560 L1130 640 L790 640 Z" fill="#d8b040" stroke="#7a5a14" strokeWidth={3} />
        <ellipse cx={960} cy={556} rx={150} ry={22} fill="#8a1a2a" />
        <Crown x={960} y={548} s={1.5} glint={glint} />
        <path d="M860 0 L1060 0 L1220 700 L700 700 Z" fill="rgba(255,220,150,0.10)" />
        {[130, 1790].map((x) => (
          <g key={x}>
            <rect x={x - 70} y={0} width={140} height={1080} fill="#8a1c12" />
            <rect x={x - 70} y={0} width={30} height={1080} fill="rgba(0,0,0,0.25)" />
            <rect x={x - 76} y={180} width={152} height={26} fill="#d4a23a" />
            <rect x={x - 76} y={900} width={152} height={26} fill="#d4a23a" />
          </g>
        ))}
      </g>
    </Svg>
  );
};

/** 倒带特效：扫描线 + 横向撕裂 + ◀◀ */
const RewindFx: React.FC<{f: number; on: number}> = ({f, on}) => {
  if (on <= 0) return null;
  return (
    <Svg style={{opacity: on}}>
      {Array.from({length: 54}, (_, i) => <rect key={i} x={0} y={i * 20} width={1920} height={3} fill="rgba(0,0,0,0.35)" />)}
      {Array.from({length: 5}, (_, i) => {
        const y = (rand(Math.floor(f / 3) * 7 + i) * 1080) | 0;
        return <rect key={i} x={0} y={y} width={1920} height={10 + 30 * rand(i + f)} fill={`rgba(255,255,255,${0.08 + 0.12 * rand(i * 3 + f)})`} />;
      })}
      <g transform="translate(1690 120)">
        <path d="M0 0 L-50 34 L0 68 Z M54 0 L4 34 L54 68 Z" fill="#fff" opacity={Math.floor(f / 8) % 2 ? 0.95 : 0.55} />
      </g>
    </Svg>
  );
};

/* ───────── 开头四屏 ───────── */
export const Opening: React.FC<{f: number}> = ({f}) => {
  const [a1, b1] = [fbt(SHOT.s1[0]), fbt(SHOT.s1[1])];
  const [a2, b2] = [fbt(SHOT.s2[0]), fbt(SHOT.s2[1])];
  const [a3, b3] = [fbt(SHOT.s3[0]), fbt(SHOT.s3[1])];
  const [a4, b4] = [fbt(SHOT.s4[0]), fbt(SHOT.s4[1])];
  const right0: SceneCam = {fx: 360, fy: 500, z: 0.8};
  const spots = tagSpots();
  const yy = yangOnBoat(0);
  const closeCam: SceneCam = {fx: toScene(yy.p.neck)[0] + 10, fy: toScene(yy.p.neck)[1] - 2, z: 8.4};

  /* 第 1 屏：左右分屏 */
  if (f < b1) {
    const t = f - a1;
    const lit = (i: number) => clamp01((t - (fbt(1.4) + 8 + i * 9 - a1)) / 8);
    return (
      <AbsoluteFill>
        <Tomb f={t} lit={lit} />
        <Diggers f={t} />
        <AbsoluteFill style={{clipPath: 'polygon(1010px 0, 1920px 0, 1920px 1080px, 930px 1080px)'}}>
          <CanalScene f={f} cam={right0} />
        </AbsoluteFill>
        <Svg>
          <line x1={1010} y1={0} x2={930} y2={1080} stroke="#ffd98a" strokeWidth={8} />
          <line x1={1010} y1={0} x2={930} y2={1080} stroke="rgba(255,217,138,0.35)" strokeWidth={26} />
        </Svg>
      </AbsoluteFill>
    );
  }

  /* 第 2 屏：右屏扩成整屏，推近顶层杨广，三张标签一拍一张贴上去 */
  if (f < b2) {
    const t = f - a2;
    const open = easeInOut(clamp01(t / 12));
    const push = easeInOut(clamp01(t / (fbt(7.4) - a2)));
    const cam: SceneCam = {fx: lerp(right0.fx, closeCam.fx, push), fy: lerp(right0.fy, closeCam.fy, push), z: lerp(right0.z, closeCam.z, Math.pow(push, 0.7)) + 0.15 * clamp01((t - 40) / 80)};
    const tags = TAG_BEATS.map((b) => ({p: clamp01((f - fbt(b) + 5) / 5)}));
    const lastTag = TAG_BEATS.map(fbt).filter((x) => x <= f).pop();
    const sh = lastTag === undefined ? {x: 0, y: 0} : shakeXY(f, lastTag, 10);
    const x0 = lerp(1010, -200, open);
    const x1 = lerp(930, -200, open);
    return (
      <AbsoluteFill>
        {open < 1 && (
          <>
            <Tomb f={f} lit={() => 1} />
            <Diggers f={f} />
          </>
        )}
        <AbsoluteFill style={{clipPath: `polygon(${x0}px 0, 1920px 0, 1920px 1080px, ${x1}px 1080px)`, transform: `translate(${sh.x}px, ${sh.y}px)`}}>
          <CanalScene f={f} cam={cam} st={{tags}} />
        </AbsoluteFill>
        {open < 1 && (
          <Svg>
            <line x1={x0} y1={0} x2={x1} y2={1080} stroke="#ffd98a" strokeWidth={8} />
          </Svg>
        )}
        {TAG_BEATS.map((b) => <Flash key={b} f={f} at={fbt(b)} dur={5} peak={0.25} />)}
      </AbsoluteFill>
    );
  }

  /* 第 3 屏：标签熔成黑锅 → 扣头 → 弹开 → 急速拉远到全国（三维）地图 → 金线冲到涿郡 → 靶心 → 气泡 → 问号 */
  if (f < b3) {
    const t = f - a3;
    const st = slowT(t, S3.hit, 0.4, 30);
    const {head} = yangOnBoat(0);
    const above: P = [head[0], head[1] - 70];
    const onHead: P = [head[0], head[1] - 6];
    const conv = easeIn(clamp01((st - S3.melt) / 12));
    const tags = spots.map((sp) => ({p: st < S3.pot + 2 ? 1 : 0, at: [lerp(sp.at[0], above[0], conv), lerp(sp.at[1], above[1], conv)] as P, ink: clamp01((st - 4) / 8)}));
    const blob = {at: above, r: 26 * clamp01((st - S3.pot + 2) / 4) * (1 - clamp01((st - S3.pot - 4) / 4)), o: 1};
    let pot: {at: P; rot: number} | undefined;
    if (st >= S3.pot && st < S3.drop) {
      const k = (st - S3.pot) / (S3.drop - S3.pot);
      pot = {at: [above[0], above[1] - 420 * easeIn(clamp01((k - 0.4) / 0.6))], rot: 0};
    } else if (st >= S3.drop && st < S3.hit) {
      const k = easeIn((st - S3.drop) / (S3.hit - S3.drop));
      pot = {at: [onHead[0], lerp(onHead[1] - 420, onHead[1], k)], rot: 0};
    } else if (st >= S3.hit && st < S3.bounce) {
      pot = {at: [onHead[0], onHead[1] + 3 * Math.max(0, 1 - (st - S3.hit) / 6)], rot: Math.sin((st - S3.hit) / 3) * 4 * Math.max(0, 1 - (st - S3.hit) / 20)};
    } else if (st >= S3.bounce) {
      const k = (st - S3.bounce) / 14;
      pot = {at: [onHead[0] + 160 * k, onHead[1] - 300 * k + 120 * k * k], rot: 200 * k};
    }
    const hit = st >= S3.hit;
    const cupT = st - S3.hit;
    const handN: P = yy.handN;
    const cup = hit ? {at: [handN[0] + 9 * cupT, handN[1] - 14 * cupT + 0.55 * cupT * cupT] as P, rot: cupT * 24} : undefined;
    // 三维镜头：先俯看江都 → 抬起、转向北方，斜看太行山与华北平原
    const fly = easeInOut(clamp01((t - S3.mapIn) / 30));
    const drift = clamp01((t - S3.mapIn - 30) / 60);
    const mcam: Cam3 = {lon: lerp(119.43, 115.2, fly) - 0.3 * drift, lat: lerp(32.39, 37.6, fly) + 0.2 * drift, dist: lerp(1100, 1500, fly) - 60 * drift, pitch: lerp(84, 40, fly) - 3 * drift, yaw: lerp(0, 16, fly) + 4 * drift};
    const jd = project(mcam, 119.43, 32.39, 0);
    const zA = easeInOut(clamp01((t - S3.zoomA) / (S3.zoomB - S3.zoomA)));
    const cam: SceneCam = {fx: lerp(closeCam.fx, 960, zA), fy: lerp(closeCam.fy, 640, zA), z: lerp(closeCam.z, 0.9, zA)};
    const zB = easeIn(clamp01((t - S3.zoomB) / (S3.mapIn - S3.zoomB)));
    const shrink = lerp(1, 0.02, zB);
    const sh = shakeXY(t, S3.hit, 24);
    const sh2 = shakeXY(t, S3.target, 14);
    const luo: [number, number] = [112.45, 34.62];
    const zhuo: [number, number] = [116.4, 39.9];
    const route: [number, number][] = [luo, [113.4, 35.0], [114.0, 35.4], [114.9, 35.95], [115.7, 36.8], [116.3, 37.45], [116.85, 38.3], [117.0, 39.0], zhuo];
    const lineP = easeOut(clamp01((t - S3.line) / S3.lineDur));
    const zs = project(mcam, zhuo[0], zhuo[1], 26);
    const tg = t - S3.target;
    return (
      <AbsoluteFill style={{transform: `translate(${sh.x + sh2.x}px, ${sh.y + sh2.y}px)`}}>
        {t >= S3.zoomB && (
          <AbsoluteFill style={{opacity: clamp01((t - S3.zoomB) / 8)}}>
            <Map3D cam={mcam}>
              <GoldTube pts={route} p={lineP} r={4} />
              <Pin3 at={luo} big />
              <Pin3 at={zhuo} o={lineP >= 1 ? 1 : 0} />
            </Map3D>
            <Label3 cam={mcam} at={luo} name="洛阳" side="left" lift={34} />
            {lineP >= 1 && <Label3 cam={mcam} at={zhuo} name="涿郡" side="left" lift={26} />}
          </AbsoluteFill>
        )}
        {zB < 1 && (
          <AbsoluteFill style={{transform: `translate(${jd[0]}px, ${jd[1]}px) scale(${shrink}) translate(${-jd[0]}px, ${-jd[1]}px)`, opacity: 1 - clamp01((zB - 0.6) / 0.4), borderRadius: zB > 0 ? 40 : 0, overflow: 'hidden'}}>
            <CanalScene f={f} cam={cam} st={{tags: st < S3.pot + 2 ? tags : undefined, blob: st >= S3.pot - 2 && st < S3.pot + 8 ? blob : undefined, pot, cup: hit ? cup : undefined, face: hit && st < S3.bounce + 10 ? 'shock' : 'smile', squash: hit ? Math.max(0, 1 - (st - S3.hit) / 26) : 0}} />
          </AbsoluteFill>
        )}
        {tg >= 0 && (
          <Svg>
            {[0, 1, 2].map((i) => {
              const k = clamp01((tg - i * 3) / 14);
              return <circle key={i} cx={zs[0]} cy={zs[1]} r={20 + 70 * k + i * 6} fill="none" stroke="#ff3a2a" strokeWidth={8 * (1 - k) + 2} opacity={1 - k * 0.8} />;
            })}
            <circle cx={zs[0]} cy={zs[1]} r={30} fill="none" stroke="#ff3a2a" strokeWidth={6} opacity={0.6 + 0.4 * Math.sin(tg / 2.5)} />
            <circle cx={zs[0]} cy={zs[1]} r={12} fill="#ff3a2a" opacity={0.7 + 0.3 * Math.sin(tg / 2.5)} />
            <line x1={zs[0] - 52} y1={zs[1]} x2={zs[0] + 52} y2={zs[1]} stroke="#ff3a2a" strokeWidth={4} />
            <line x1={zs[0]} y1={zs[1] - 52} x2={zs[0]} y2={zs[1] + 52} stroke="#ff3a2a" strokeWidth={4} />
            <WhiteBubble x={zs[0] + 90} y={zs[1] - 60} text="通往东征前线！" p={clamp01((t - S3.bubble) / 6)} size={42} />
          </Svg>
        )}
        {hit && st < S3.bounce && (
          <div style={{position: 'absolute', left: 1240, top: 330, fontFamily: LF.serif, fontWeight: 900, fontSize: 280, color: L.goldHot, textShadow: '0 0 50px rgba(255,200,90,0.8), 0 8px 20px rgba(0,0,0,0.8)', transform: `rotate(10deg) scale(${1.7 - 0.7 * easeOut(clamp01((t - S3.hit) / 6))})`, opacity: 1 - clamp01((t - S3.bounce + 6) / 6)}}>哐！</div>
        )}
        {t >= S3.q && (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: LF.serif, fontWeight: 900, fontSize: 380, color: '#fff4dc', textShadow: '0 0 60px rgba(255,200,100,0.7), 0 10px 30px rgba(0,0,0,0.8)', transform: `translateY(60px) scale(${1.6 - 0.6 * easeOut(clamp01((t - S3.q) / 8))})`, opacity: clamp01((t - S3.q) / 4)}}>？</div>
          </AbsoluteFill>
        )}
        <Flash f={t} at={S3.hit} dur={10} peak={0.75} />
        <Flash f={t} at={S3.target} dur={7} peak={0.35} color="#ffb0a0" />
      </AbsoluteFill>
    );
  }

  /* 第 4 屏：从龙舟拉远、倒带，回到宫殿，太子冠闪一下光，末尾收暗 */
  if (f < b4) {
    const t = f - a4;
    const cut = 40;
    const pull = easeOut(clamp01(t / cut));
    const cam: SceneCam = {fx: 960, fy: lerp(640, 600, pull), z: lerp(0.9, 0.55, pull)};
    const glintAt = fbt(25.5) - a4;
    const glint = t >= glintAt ? Math.sin(clamp01((t - glintAt) / 16) * Math.PI) : 0;
    const dark = clamp01((t - (b4 - a4 - 16)) / 14);
    const glitch = t > cut - 6 && t < cut + 6;
    return (
      <AbsoluteFill>
        {t < cut ? (
          <AbsoluteFill style={{filter: 'saturate(0.6) contrast(1.15)'}}>
            <CanalScene f={a4 - t * 3} cam={cam} st={{scroll: -(t * t) * 1.2, cup: null}} />
          </AbsoluteFill>
        ) : (
          <CrownHall f={t} glint={glint} push={clamp01((t - cut) / 60)} />
        )}
        {glitch && (
          <Svg>
            {Array.from({length: 9}, (_, i) => <rect key={i} x={(rand(i + t) - 0.5) * 300} y={i * 120 + rand(i * 9 + t) * 40} width={1920} height={40 + 50 * rand(i + t * 3)} fill={i % 2 ? 'rgba(255,255,255,0.35)' : 'rgba(120,200,255,0.25)'} />)}
          </Svg>
        )}
        <RewindFx f={t} on={t < cut + 4 ? 1 : 0} />
        <AbsoluteFill style={{background: '#000', opacity: dark}} />
      </AbsoluteFill>
    );
  }
  return null;
};
