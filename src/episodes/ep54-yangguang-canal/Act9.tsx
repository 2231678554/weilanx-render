import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {LF} from '../../library/lamplight/theme';
import {Drape, GoldTube, Label3, Map3D, Pin3, type Cam3, type Px} from './Map3D';
import {CHANGAN, GUANGTONG, HANGOU, JIANGNAN, LUOYANG, TONGJI, YONGJI, ZHUO, YUHANG, JIANGDU} from './Act6';
import {lerp, Svg, Tomb} from './Opening';
import {DragonBoat, Pot} from './Props';
import {Vignette} from './Sets54';
import {B, fbt, S58, S59, S61, S62, S63, S64, SHOT} from './timeline';

const bt = (b: number) => b * B;
const seg = (t: number, a: number, b: number) => clamp01((t - bt(a)) / bt(b - a));
type LL = [number, number];
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const CANALS: LL[][] = [YONGJI, TONGJI, HANGOU, JIANGNAN, GUANGTONG];

/* ═════════ 第 57 屏：回到开场考古现场，墓志特写，字迹大多磨平 ═════════ */
const Sc57: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(8)));
  const z = lerp(2.2, 2.8, k);
  const lit = (i: number) => (i < 3 ? 0.25 + 0.15 * Math.sin(t / 10 + i) : 0.05);
  return (
    <AbsoluteFill style={{background: '#1d1a18'}}>
      <AbsoluteFill style={{transform: `translate(960px, 560px) scale(${z}) translate(-480px, -905px)`, transformOrigin: '0 0'}}>
        <Tomb f={t} lit={lit} />
      </AbsoluteFill>
      {/* 磨损：一层斑驳 */}
      <Svg>
        {Array.from({length: 40}, (_, i) => <ellipse key={i} cx={560 + rnd(i) * 800} cy={420 + rnd(i + 5) * 300} rx={20 + rnd(i + 2) * 50} ry={6 + rnd(i + 3) * 14} fill="#3a464a" opacity={0.25} />)}
      </Svg>
      <div style={{position: 'absolute', right: 120, bottom: 150, fontFamily: LF.serif, fontWeight: 900, fontSize: 44, color: '#e8dcc0', textShadow: '0 2px 10px #000', opacity: clamp01((t - bt(2)) / 12)}}>字迹大多已磨平</div>
      <Vignette k={0.7} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 58 屏：不大的砖室墓；十三环金玉带，金环一个个亮起 ═════════ */
const Sc58: React.FC<{t: number}> = ({t}) => {
  const zoom = easeInOut(seg(t, 2.2, 3.4));
  const n = 13;
  return (
    <AbsoluteFill style={{background: '#161210'}}>
      <Svg>
        {/* 砖室墓（小）：拱顶 + 砖墙 */}
        <g opacity={1 - zoom} transform={`translate(960 600) scale(${lerp(1, 2.4, zoom)}) translate(-960 -600)`}>
          <rect x={0} y={0} width={1920} height={1080} fill="#1d1a18" />
          {Array.from({length: 13}, (_, r) => Array.from({length: 10}, (_, c) => {
            const x = 660 + c * 62 + (r % 2 ? 31 : 0), y = 420 + r * 30;
            return x < 1260 ? <rect key={`${r}-${c}`} x={x} y={y} width={58} height={26} fill={`rgb(${92 + 20 * rnd(r * 9 + c)},${74 + 14 * rnd(r + c)},${62})`} /> : null;
          }))}
          <path d="M650 430 Q960 180 1270 430 L1270 470 Q960 230 650 470 Z" fill="#7a5a44" stroke="#3a2a1e" strokeWidth={4} />
          <path d="M860 810 L860 600 Q960 520 1060 600 L1060 810 Z" fill="#0c0a08" />
          <rect x={600} y={810} width={720} height={20} fill="#3a2e24" />
          <path d="M520 830 L1400 830 L1500 1080 L420 1080 Z" fill="#2a241e" />
          <text x={960} y={330} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={44} fill="#e8dcc0" opacity={clamp01(t / 10)}>一座不大的砖室墓</text>
        </g>
        {/* 十三环金玉带特写 */}
        {zoom > 0 && <g opacity={zoom}>
          <rect x={0} y={0} width={1920} height={1080} fill="#2a1c14" />
          <path d="M140 600 Q960 470 1780 600 L1780 690 Q960 560 140 690 Z" fill="#3a2418" stroke="#1a0e08" strokeWidth={4} />
          {Array.from({length: n}, (_, i) => {
            const u = i / (n - 1);
            const x = lerp(220, 1700, u);
            const y = 640 - Math.sin(u * Math.PI) * 120 + 10;
            const on = clamp01((t - bt(S58.ring0) - (i * bt(S58.ring1 - S58.ring0)) / (n - 1)) / 6);
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                {on > 0 && <circle cx={0} cy={0} r={70} fill="rgba(255,210,110,0.45)" opacity={on} />}
                <rect x={-38} y={-34} width={76} height={56} rx={8} fill="#c8d8c0" stroke="#7a8a70" strokeWidth={3} />
                <circle cx={0} cy={44} r={24} fill="none" stroke={on > 0.3 ? '#ffd870' : '#8a6a30'} strokeWidth={9} />
                {on > 0.6 && <circle cx={-10} cy={36} r={5} fill="#fff8e0" />}
              </g>
            );
          })}
          <text x={960} y={880} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={60} fill="#ffe6a8" stroke="#1a0c04" strokeWidth={6} paintOrder="stroke" opacity={clamp01((t - bt(S58.ring1)) / 8)}>十三环金玉带 · 皇帝规格</text>
        </g>}
      </Svg>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 59 屏：八个字一字一闪（金色运河网做底）；古今漕船叠在同一段河上 ═════════ */
const NET_CAM: Cam3 = {lon: 115.4, lat: 34.8, dist: 2700, pitch: 62, yaw: 0};
const Sc59: React.FC<{t: number}> = ({t}) => {
  const turn = easeInOut(seg(t, S59.turn, S59.turn + 1.4));
  const words = '罪在当代功在千秋';
  const cam: Cam3 = {...NET_CAM, dist: lerp(2700, 2500, clamp01(t / bt(10)))};
  return (
    <AbsoluteFill style={{background: '#07090b'}}>
      <AbsoluteFill style={{opacity: 1 - turn}}>
        <Map3D cam={cam} light={0.7}>
          {CANALS.map((c, i) => <GoldTube key={i} pts={c} p={1} r={6} />)}
          <Pin3 at={LUOYANG} />
        </Map3D>
        <AbsoluteFill style={{background: 'rgba(8,4,2,0.45)'}} />
        <div style={{position: 'absolute', left: 0, width: 1920, top: 420, display: 'flex', justifyContent: 'center', gap: 10}}>
          {Array.from(words).map((c, i) => {
            const at = bt(S59.c0) + (i * bt(S59.c1 - S59.c0)) / 7;
            const p = clamp01((t - at) / 6);
            const fl = t - at > 0 && t - at < 8 ? 1 - (t - at) / 8 : 0;
            return (
              <React.Fragment key={i}>
                {i === 4 && <div style={{width: 90}} />}
                <div style={{fontFamily: LF.serif, fontWeight: 900, fontSize: 170, color: i < 4 ? '#ff8a70' : '#ffe08a', WebkitTextStroke: '4px #1a0a04', textShadow: `0 0 ${30 + 60 * fl}px rgba(255,200,100,${0.5 + 0.5 * fl}), 0 8px 20px rgba(0,0,0,0.8)`, opacity: p, transform: `scale(${lerp(1.6, 1, easeOutBack(p))})`}}>{c}</div>
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
      {turn > 0 && <AbsoluteFill style={{opacity: turn}}>
        <Svg>
          <defs>
            <linearGradient id="sky59" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8a868" />
              <stop offset="1" stopColor="#f4d8a8" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={1920} height={1080} fill="url(#sky59)" />
          <path d="M0 560 L1920 520 L1920 1080 L0 1080 Z" fill="#5a8a7a" />
          <path d="M0 540 L1920 500 L1920 540 L0 580 Z" fill="#6a7a4a" />
          {Array.from({length: 10}, (_, i) => <path key={i} d={`M${(i * 210 + t * 2) % 2100 - 100} ${700 + (i % 3) * 110} q40 -14 80 0`} stroke="#d8f0e8" strokeWidth={5} fill="none" opacity={0.6} />)}
          {/* 今天的货船（半透明叠影） */}
          <g opacity={0.55} transform={`translate(${1150 - t * 0.8} 760)`}>
            <path d="M-420 0 L380 0 L440 -60 L-420 -60 Z" fill="#2a3a5a" />
            <rect x={-400} y={-120} width={560} height={60} fill="#a8322a" />
            <rect x={200} y={-170} width={130} height={110} fill="#e8e8e0" />
            <rect x={-400} y={-180} width={260} height={60} fill="#3a7aa8" />
          </g>
          {/* 古代漕船 */}
          <g transform={`translate(${720 + t * 0.6} 800)`}>
            <path d="M-260 -30 L250 -30 Q300 -36 320 -80 L300 10 Q280 40 200 50 L-220 50 Q-270 30 -280 -10 Z" fill="#6a3a1a" stroke="#2a1408" strokeWidth={5} />
            <line x1={-40} y1={-30} x2={-40} y2={-330} stroke="#3a2010" strokeWidth={10} />
            <path d="M-32 -320 Q110 -250 90 -40 L-32 -40 Z" fill="#f4ecd8" stroke="#a89878" strokeWidth={4} />
            {[0, 1, 2].map((i) => <rect key={i} x={-220 + i * 70} y={-80} width={60} height={50} rx={10} fill="#c8a060" stroke="#6a4a20" strokeWidth={3} />)}
          </g>
          <text x={960} y={985} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={56} fill="#f4ecd8" stroke="rgba(0,0,0,0.55)" strokeWidth={6} style={{paintOrder: "stroke"}} opacity={0.92}>同一段河，一千四百年</text>
        </Svg>
      </AbsoluteFill>}
      <Vignette k={0.4} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 60 屏：日历飞快翻页，工程一项项挤满画面 ═════════ */
const YEARS = ['大业元年', '大业二年', '大业三年', '大业四年', '大业五年', '大业六年', '大业七年', '大业八年', '大业九年', '大业十年'];
const WORKS: [string, number, number, number][] = [
  ['营建东都', 300, 640, -6], ['通济渠', 560, 420, 5], ['邗沟', 820, 700, -3], ['永济渠', 1100, 460, 4], ['江南河', 1360, 720, -5],
  ['长城', 1620, 430, 6], ['驰道', 380, 860, 3], ['西巡', 1240, 900, -4], ['灭吐谷浑', 1520, 600, 2], ['伐高句丽 ×3', 760, 900, -2], ['龙舟南巡', 980, 640, 5],
];
const Sc60: React.FC<{t: number}> = ({t}) => {
  const T = bt(8);
  const u = clamp01(t / T);
  const pageF = 14 * (1 - Math.pow(1 - u, 1.6));
  const idx = Math.min(YEARS.length - 1, Math.floor(pageF * (YEARS.length / 14)));
  const flip = pageF % 1;
  const shake = Math.sin(t * 2.4) * u * 4;
  return (
    <AbsoluteFill style={{background: '#1a120c', transform: `translate(${shake}px,0)`}}>
      <Map3D cam={{lon: 114.5, lat: 34.6, dist: 2600, pitch: 64, yaw: 0}} light={0.6} opacity={0.6}>
        {CANALS.map((c, i) => <GoldTube key={i} pts={c} p={1} r={5} />)}
      </Map3D>
      <AbsoluteFill style={{background: 'rgba(10,6,4,0.45)'}} />
      {/* 工程卡片一张张挤进画面 */}
      {WORKS.map(([w, x, y, r], i) => {
        const at = bt(0.4) + (i * T * 0.8) / WORKS.length;
        const p = clamp01((t - at) / 6);
        return p > 0 ? (
          <div key={w} style={{position: 'absolute', left: x - 170, top: y - 40, width: 340, textAlign: 'center', opacity: Math.min(1, p * 2), transform: `scale(${lerp(1.8, 1, easeOutBack(p))}) rotate(${r}deg)`}}>
            <div style={{display: 'inline-block', padding: '8px 24px', background: 'rgba(110,24,14,0.9)', border: '4px solid #ffd070', borderRadius: 10, fontFamily: LF.serif, fontWeight: 900, fontSize: 48, color: '#ffe6a8', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{w}</div>
          </div>
        ) : null;
      })}
      {/* 日历 */}
      <div style={{position: 'absolute', left: 820, top: 160, width: 280, height: 220, perspective: 800}}>
        <div style={{position: 'absolute', inset: 0, background: '#f4ecd8', border: '5px solid #6a1a10', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>
          <div style={{height: 54, background: '#b8281c', color: '#ffe6a8', fontFamily: LF.serif, fontWeight: 900, fontSize: 34, textAlign: 'center', lineHeight: '54px'}}>隋</div>
          <div style={{textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 56, color: '#2a1408', marginTop: 40}}>{YEARS[idx]}</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 54, bottom: 0, background: '#fff6e0', border: '3px solid #8a6a40', transformOrigin: '50% 0', transform: `rotateX(${flip * 180}deg)`, opacity: flip < 0.5 ? 1 : 0, backfaceVisibility: 'hidden'}} />
      </div>
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 61 屏：俯拍，杨广右手重重拍在发光地图正中，裂纹炸开 ═════════ */
const Hand: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 黄袍袖口（从画面上方伸下来） */}
    <path d="M-170 -900 L170 -900 L150 -250 L-150 -250 Z" fill="#d9a63a" stroke="#8a6420" strokeWidth={6} />
    <rect x={-160} y={-300} width={320} height={60} fill="#b8281c" />
    {/* 手掌（掌心向下，五指张开：拇指在左） */}
    <path d="M-120 -240 Q-130 -60 -60 0 L80 0 Q140 -60 120 -240 Z" fill="#e6c9a0" stroke="#9a7a50" strokeWidth={5} />
    {[[-80, 0, -110, 170], [-28, 0, -40, 210], [24, 0, 30, 215], [74, 0, 104, 180]].map(([x0, y0, x1, y1], i) => (
      <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#e6c9a0" strokeWidth={50} strokeLinecap="round" />
    ))}
    {[[-80, 0, -110, 170], [-28, 0, -40, 210], [24, 0, 30, 215], [74, 0, 104, 180]].map(([, , x1, y1], i) => <circle key={`n${i}`} cx={x1} cy={y1 - 6} r={12} fill="#f4dcc0" />)}
    {/* 拇指：向左下张开 */}
    <line x1={-110} y1={-150} x2={-250} y2={-40} stroke="#e6c9a0" strokeWidth={56} strokeLinecap="round" />
    <circle cx={-246} cy={-46} r={13} fill="#f4dcc0" />
  </g>
);
const Sc61: React.FC<{t: number}> = ({t}) => {
  const slam = bt(S61.slam);
  const down = easeIn(clamp01((t - slam + 8) / 8));
  const after = t - slam;
  const shake = after > 0 && after < 14 ? Math.sin(after * 3) * (14 - after) * 1.6 : 0;
  const cam: Cam3 = {lon: 114.6, lat: 34.6, dist: lerp(2400, 2300, clamp01(t / bt(8))), pitch: 82, yaw: 0};
  const crack = after > 0 ? easeOut(clamp01(after / 10)) : 0;
  const cx = 960, cy = 560;
  const cracks = Array.from({length: 14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + rnd(i) * 0.3;
    const len = (380 + rnd(i + 2) * 520) * crack;
    const pts: [number, number][] = [[cx, cy]];
    for (let j = 1; j <= 5; j++) {
      const r = (len * j) / 5;
      const aa = a + (rnd(i * 7 + j) - 0.5) * 0.5;
      pts.push([cx + Math.cos(aa) * r, cy + Math.sin(aa) * r * 0.8]);
    }
    return pts;
  });
  return (
    <AbsoluteFill style={{background: '#07090b', transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <Map3D cam={cam}>
        {CANALS.map((c, i) => <GoldTube key={i} pts={c} p={1} r={7} />)}
        <Pin3 at={LUOYANG} big />
      </Map3D>
      <Label3 cam={cam} at={LUOYANG} name="洛阳" lift={30} size={46} />
      <Svg>
        {cracks.map((p, i) => <polyline key={i} points={p.map((q) => q.join(',')).join(' ')} fill="none" stroke="#0a0604" strokeWidth={12 - (i % 3) * 3} strokeLinejoin="round" opacity={crack > 0 ? 0.92 : 0} />)}
        {cracks.map((p, i) => i % 2 ? null : p.slice(1, 4).map((q, j) => <line key={`b${i}${j}`} x1={q[0]} y1={q[1]} x2={q[0] + (rnd(i + j) - 0.5) * 160 * crack} y2={q[1] + (rnd(i * j + 3) - 0.5) * 160 * crack} stroke="#0a0604" strokeWidth={5} />))}
        {after > 0 && after < 10 && <circle cx={cx} cy={cy} r={120 + after * 50} fill="none" stroke="#ffe6a0" strokeWidth={10} opacity={1 - after / 10} />}
        <Hand x={cx + 40} y={lerp(-300, cy - 40, down)} s={lerp(1.15, 0.9, down)} />
      </Svg>
      {after > 0 && after < 6 && <AbsoluteFill style={{background: '#fff4d8', opacity: 0.6 * (1 - after / 6)}} />}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 62 屏：大黑锅贴「享乐工程」，风吹纸条脱落掉进运河漂走 ═════════ */
const PaperTag: React.FC<{x: number; y: number; rot: number; curl: number; text: string; s?: number}> = ({x, y, rot, curl, text, s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d={`M-150 -50 L150 -50 L150 ${50 - curl * 30} Q${150 - curl * 40} ${50 + curl * 10} ${150 - curl * 90} 50 L-150 50 Z`} fill="#f4ecdc" stroke="#a8261b" strokeWidth={6} />
    {curl > 0 && <path d={`M150 ${50 - curl * 30} Q${150 - curl * 20} ${50 - curl * 50} ${150 - curl * 90} 50`} fill="#d8ccb8" stroke="#a8261b" strokeWidth={3} />}
    <text x={0} y={18} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={60} fill="#1b1410">{text}</text>
  </g>
);
const Sc62: React.FC<{t: number}> = ({t}) => {
  const bob = Math.sin(t / 14) * 8;
  const gust = easeInOut(seg(t, S62.gust, S62.drop));
  const fall = seg(t, S62.drop, S62.drop + 1.6);
  const drift = Math.max(0, t - bt(S62.drop + 1.6));
  const tx = 960 + fall * 120 + drift * 3.2, ty = lerp(440 + bob, 900, easeIn(fall)) + (drift > 0 ? Math.sin(drift / 6) * 6 : 0);
  const rot = lerp(-4, 30, fall) + Math.sin(t / 3) * 6 * gust * (1 - fall) + (drift > 0 ? Math.sin(drift / 9) * 8 : 0);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="bg62" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2418" />
            <stop offset="1" stopColor="#1a100a" />
          </linearGradient>
          <linearGradient id="w62" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4aa090" />
            <stop offset="1" stopColor="#2a6a60" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#bg62)" />
        <path d="M0 840 L1920 840 L1920 1080 L0 1080 Z" fill="url(#w62)" />
        {Array.from({length: 12}, (_, i) => <path key={i} d={`M${(i * 180 + t * 3) % 2040 - 60} ${880 + (i % 3) * 60} q40 -14 80 0`} stroke="#c8f0e4" strokeWidth={5} fill="none" opacity={0.6} />)}
        {/* 风 */}
        {gust > 0 && gust < 1 && Array.from({length: 6}, (_, i) => <path key={`g${i}`} d={`M${-200 + gust * 2400 - i * 120} ${300 + i * 50} q120 -30 240 0`} stroke="#e8dcc0" strokeWidth={4} fill="none" opacity={0.5} />)}
        <Pot at={[960, 560 + bob]} w={760} />
        {fall <= 0 ? <PaperTag x={960} y={440 + bob} rot={-4 + Math.sin(t / 2.4) * 5 * gust} curl={gust} text="享乐工程" /> : <PaperTag x={tx} y={ty} rot={rot} curl={1} text="享乐工程" s={lerp(1, 0.7, fall)} />}
        {drift > 0 && <ellipse cx={tx} cy={ty + 30} rx={150} ry={14} fill="#c8f0e4" opacity={0.3} />}
      </Svg>
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 63 屏：「急功近利」「无视民命」两块铁牌焊死在黑锅上，黑锅再坠 ═════════ */
const IronPlate: React.FC<{x: number; y: number; text: string; p: number; hot: number; rot: number}> = ({x, y, text, p, hot, rot}) => {
  if (p <= 0) return null;
  const k = easeIn(p);
  return (
    <g transform={`translate(${x} ${lerp(y - 600, y, k)}) rotate(${rot}) scale(${lerp(1.5, 1, k)})`}>
      <rect x={-170} y={-60} width={340} height={120} rx={8} fill="#4a4a4e" stroke={hot > 0 ? `rgb(255,${120 + 80 * hot},40)` : '#202024'} strokeWidth={10} />
      {[[-150, -40], [150, -40], [-150, 40], [150, 40]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={8} fill="#2a2a2e" />)}
      <text x={0} y={22} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={66} fill={hot > 0.2 ? `rgb(255,${180 + 60 * hot},${120 + 80 * hot})` : '#e8e4dc'}>{text}</text>
    </g>
  );
};
const Sc63: React.FC<{t: number}> = ({t}) => {
  const w = [S63.weld1, S63.weld2];
  const ps = w.map((b) => clamp01((t - bt(b) + 6) / 6));
  const hots = w.map((b) => (t > bt(b) ? Math.max(0, 1 - (t - bt(b)) / 30) : 0));
  const sink = easeInOut(seg(t, S63.sink, S63.sink + 2.4));
  const last = w.reduce((m, b) => (t >= bt(b) ? t - bt(b) : m), -1);
  const shake = last >= 0 && last < 8 ? Math.sin(last * 3) * (8 - last) * 1.5 : 0;
  const py = 520 + sink * 160 + (sink > 0 ? Math.sin(sink * 9) * 8 * (1 - sink) : 0);
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px, ${Math.abs(shake) * 0.4}px)`}}>
      <Svg>
        <rect x={0} y={0} width={1920} height={1080} fill="#1a100a" />
        <path d="M0 860 L1920 860 L1920 1080 L0 1080 Z" fill="#2a4a44" />
        <Pot at={[960, py]} w={760} />
        <IronPlate x={760} y={py - 200} text="急功近利" p={ps[0]} hot={hots[0]} rot={-6} />
        <IronPlate x={1160} y={py - 190} text="无视民命" p={ps[1]} hot={hots[1]} rot={5} />
        {/* 火星 + 白烟 */}
        {w.map((b, j) => {
          const a = t - bt(b);
          if (a < 0 || a > 40) return null;
          const x0 = j ? 1160 : 760, y0 = py - 190;
          return (
            <g key={j}>
              {Array.from({length: 18}, (_, i) => {
                const ang = -Math.PI / 2 + (rnd(i + j * 30) - 0.5) * 2.6;
                const v = 6 + rnd(i + 3) * 10;
                const x = x0 + Math.cos(ang) * v * a, y = y0 + Math.sin(ang) * v * a + 0.25 * a * a;
                return a < 18 ? <circle key={i} cx={x} cy={y} r={4} fill="#ffd070" opacity={1 - a / 18} /> : null;
              })}
              {Array.from({length: 6}, (_, i) => <circle key={`s${i}`} cx={x0 - 120 + i * 50 + Math.sin(a / 5 + i) * 10} cy={y0 - 60 - a * 3 - i * 6} r={30 + a * 1.5} fill="#e8e4dc" opacity={0.35 * (1 - a / 40)} />)}
            </g>
          );
        })}
      </Svg>
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 64 屏：龙舟在暮色里越开越远，画面收暗，只剩问句 ═════════ */
const Sc64: React.FC<{t: number}> = ({t}) => {
  const T = bt(10);
  const u = clamp01(t / T);
  const away = easeInOut(clamp01(t / bt(6)));
  const dark = easeInOut(seg(t, 3.6, 4.6));
  const q = clamp01((t - bt(S64.q)) / 10);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Svg>
        <defs>
          <linearGradient id="sky64" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1a3a" />
            <stop offset="0.6" stopColor="#c8603a" />
            <stop offset="1" stopColor="#f0a060" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sky64)" />
        <circle cx={1300} cy={600} r={90} fill="#ffd8a0" opacity={0.85} />
        <path d="M0 600 L1920 600 L1920 1080 L0 1080 Z" fill="#3a2a3a" />
        <path d="M1200 610 L1400 610 L1460 1080 L1140 1080 Z" fill="#f0a060" opacity={0.25} />
        {Array.from({length: 14}, (_, i) => <path key={i} d={`M${(i * 150 - t) % 2100} ${650 + (i % 4) * 100} q40 -10 80 0`} stroke="#f0b080" strokeWidth={4} fill="none" opacity={0.4} />)}
        <g transform={`translate(${lerp(760, 1180, away)} ${lerp(860, 618, away)}) scale(${lerp(0.55, 0.06, away)})`} style={{filter: `brightness(${lerp(0.7, 0.25, u)})`}}>
          <DragonBoat f={t} />
        </g>
        <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={0.92 * dark} />
      </Svg>
      {q > 0 && <div style={{position: 'absolute', left: 0, width: 1920, top: 470, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 96, color: '#ffe6a8', textShadow: '0 0 30px rgba(255,200,100,0.5)', opacity: q}}>巅峰的大隋，还能撑多久？</div>}
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s57: Sc57, s58: Sc58, s59: Sc59, s60: Sc60, s61: Sc61, s62: Sc62, s63: Sc63, s64: Sc64};

export const Act9: React.FC<{f: number}> = ({f}) => {
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
export const ACT9_START = fbt(SHOT.s57[0]);
