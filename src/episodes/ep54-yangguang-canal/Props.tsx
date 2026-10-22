import React from 'react';
import {clamp01, rand} from '../../library/anim';
import {LF} from '../../library/lamplight/theme';
import {headOf} from '../ep53-changan-curfew/Kit';
import {P, Rig, RigProps, standPose} from '../ep53-changan-curfew/Rig';

/** ep54 人物外观（分镜「通用设定」） */
export const LOOK54: Record<string, Partial<RigProps>> = {
  /** 杨广称帝后：黄袍、白净 */
  yangEmp: {robe: '#d9a63a', robeD: '#a8792a', pants: '#3a2a1a', hem: 130},
  /** 考古队员：蓝色工装、卡其裤（现代，不戴幞头） */
  digA: {robe: '#3d5f80', robeD: '#2c4660', pants: '#8a7a5a', hem: 34, hat: 'none'},
  digB: {robe: '#4a6a5a', robeD: '#344c40', pants: '#7a6c50', hem: 34, hat: 'none'},
};

/** 八字小胡（侧脸）：画在 Rig 头上，h 为头心 */
export const Mustache: React.FC<{h: P; s: number; facing: number}> = ({h, s, facing}) => (
  <g transform={`translate(${h[0]} ${h[1]}) scale(${s})`}>
    <path d={`M${facing * 14} 14 q${facing * 8} -5 ${facing * 18} 2 q${-facing * 6} 1 ${-facing * 18} 4 Z`} fill="#1b1410" />
    <path d={`M${facing * 20} 13 q${facing * 10} -2 ${facing * 16} -10`} stroke="#1b1410" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

/** 短发 + 帽檐（现代考古队员） */
export const ModernHair: React.FC<{h: P; s: number; facing: number; cap?: string}> = ({h, s, facing, cap = '#c9b07a'}) => (
  <g transform={`translate(${h[0]} ${h[1]}) scale(${s})`}>
    <path d="M-38 -4 Q-40 -46 0 -46 Q38 -46 38 -8 Q20 -20 -10 -18 Q-30 -16 -38 -4 Z" fill="#1d1712" />
    <path d="M-36 -18 Q-34 -54 2 -56 Q38 -54 38 -20 Z" fill={cap} stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
    <path d={`M${facing * 20} -22 q${facing * 30} -2 ${facing * 44} 8 l${-facing * 44} 0 Z`} fill={cap} stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
  </g>
);

/** 金爵：三足、前流、两柱；at 为手握处（腰），tilt 度 */
export const Jue: React.FC<{at: P; s: number; tilt?: number}> = ({at, s, tilt = 0}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${tilt}) scale(${s})`}>
    <path d="M-16 -22 L16 -22 L14 8 Q0 14 -14 8 Z" fill="#e0b040" stroke="#7a5414" strokeWidth={3} />
    <path d="M16 -22 L40 -32 L38 -26 L14 -14 Z" fill="#e8c050" stroke="#7a5414" strokeWidth={2.5} />
    <path d="M-16 -22 L-30 -26 L-14 -14 Z" fill="#e8c050" stroke="#7a5414" strokeWidth={2.5} />
    <line x1={-6} y1={-22} x2={-6} y2={-34} stroke="#c89a30" strokeWidth={4} />
    <line x1={6} y1={-22} x2={6} y2={-34} stroke="#c89a30" strokeWidth={4} />
    {[-10, 0, 10].map((x) => <line key={x} x1={x} y1={10} x2={x * 1.6} y2={30} stroke="#c89a30" strokeWidth={4} strokeLinecap="round" />)}
    <path d="M-14 -12 h28" stroke="#fff2b0" strokeWidth={2} opacity={0.7} />
  </g>
);

/** 黑锅（扣着时开口朝下）：w 锅口宽 */
export const Pot: React.FC<{at: P; w: number; rot?: number; down?: boolean; text?: string}> = ({at, w, rot = 0, down = true, text}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot}) scale(${w / 200} ${(down ? 1 : -1) * (w / 200)})`}>
    <path d="M-100 0 Q-96 -80 0 -92 Q96 -80 100 0 Z" fill="#141414" stroke="#000" strokeWidth={4} />
    <path d="M-70 -40 Q-40 -72 10 -76" stroke="#5a5a5a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
    <rect x={-108} y={-6} width={216} height={14} rx={7} fill="#202020" />
    <path d="M-104 -10 q-26 -6 -24 14 q10 6 22 0" fill="none" stroke="#101010" strokeWidth={9} />
    <path d="M104 -10 q26 -6 24 14 q-10 6 -22 0" fill="none" stroke="#101010" strokeWidth={9} />
    {text && <text x={0} y={-30} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#e9e2d2" transform={down ? undefined : 'scale(1 -1) translate(0 60)'}>{text}</text>}
  </g>
);

/** 纸标签：白纸红框黑字，啪地贴上（p 0–1 落下进度） */
export const Tag: React.FC<{at: P; text: string; s: number; p: number; rot?: number; ink?: number}> = ({at, text, s, p, rot = 0, ink = 0}) => {
  if (p <= 0) return null;
  const k = clamp01(p);
  const sc = s * (1.9 - 0.9 * k);
  const fill = `rgb(${244 - 224 * ink},${236 - 220 * ink},${220 - 206 * ink})`;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot * k + (1 - k) * -25}) scale(${sc})`} opacity={Math.min(1, k * 2)}>
      <rect x={-46} y={-24} width={92} height={48} rx={3} fill={fill} stroke={ink > 0.5 ? '#000' : '#a8261b'} strokeWidth={4} />
      <text x={0} y={12} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={34} fill={ink > 0.5 ? '#333' : '#1b1410'}>{text}</text>
    </g>
  );
};

/** 龙舟局部坐标：原点 = 船中水线，船头朝右；杨广站顶层（ROOF_FLOOR） */
export const DECK = -80;
export const STOREY = 110;
export const TOP_FLOOR = DECK - 3 * STOREY; // 顶层地板
export const YG_X = 40; // 杨广在顶层的 x
export const YG_S = 0.34;
export const RAIL_TOP = TOP_FLOOR - 80;

const Roof: React.FC<{y: number; w: number; h?: number}> = ({y, w, h = 34}) => (
  <g>
    <path d={`M${-w / 2 - 50} ${y} Q${-w / 2 - 20} ${y - 6} ${-w / 2} ${y - h} L${w / 2} ${y - h} Q${w / 2 + 20} ${y - 6} ${w / 2 + 50} ${y} Q${w / 2 + 62} ${y - 16} ${w / 2 + 66} ${y - 22} L${w / 2 + 40} ${y + 6} L${-w / 2 - 40} ${y + 6} L${-w / 2 - 66} ${y - 22} Q${-w / 2 - 62} ${y - 16} ${-w / 2 - 50} ${y} Z`} fill="#d4a23a" stroke="#6a4a12" strokeWidth={4} />
    {Array.from({length: Math.floor(w / 40)}, (_, i) => -w / 2 + 20 + i * 40).map((x) => <line key={x} x1={x} y1={y - h + 4} x2={x * 1.06} y2={y + 2} stroke="#8a6418" strokeWidth={3} opacity={0.7} />)}
  </g>
);

const Flag: React.FC<{f: number; x: number; y: number; color: string; seed: number; h?: number}> = ({f, x, y, color, seed, h = 90}) => {
  const w = Math.sin(f / 6 + seed) * 10;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - h} stroke="#3a2210" strokeWidth={5} />
      <path d={`M${x} ${y - h} Q${x + 30} ${y - h + 6 + w} ${x + 62} ${y - h + 4 + w * 1.6} L${x + 58} ${y - h + 36 + w * 1.4} Q${x + 28} ${y - h + 40 + w} ${x} ${y - h + 34} Z`} fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
    </g>
  );
};

/** 四层龙舟（金顶、朱栏、彩旗）：children 画在顶层栏杆后面（杨广） */
export const DragonBoat: React.FC<{f: number; children?: React.ReactNode; front?: React.ReactNode}> = ({f, children, front}) => {
  const widths = [1000, 820, 640];
  const cols = ['#e04a3a', '#3a8ad0', '#f0c040', '#40a060', '#e07a30'];
  return (
    <g>
      {/* 船尾龙尾 */}
      <path d="M-640 -90 Q-760 -140 -740 -280 Q-735 -330 -690 -340 Q-720 -300 -700 -250 Q-680 -170 -600 -120 Z" fill="#d8a030" stroke="#6a4a12" strokeWidth={4} />
      {/* 船身 */}
      <path d={`M-660 ${DECK} L640 ${DECK} Q700 ${DECK - 6} 720 -150 L700 -60 Q680 10 560 30 L-560 30 Q-660 10 -690 -60 Z`} fill="#7a1f14" stroke="#3a0c06" strokeWidth={5} />
      <rect x={-650} y={DECK + 8} width={1290} height={14} fill="#d8a030" />
      {Array.from({length: 26}, (_, i) => -620 + i * 48).map((x) => <path key={x} d={`M${x} -40 q24 -18 48 0`} stroke="#b8862a" strokeWidth={4} fill="none" opacity={0.8} />)}
      {/* 龙头 */}
      <g>
        <path d="M700 -110 Q760 -170 770 -260 L810 -250 Q800 -160 740 -90 Z" fill="#d8a030" stroke="#6a4a12" strokeWidth={4} />
        <path d="M760 -250 Q790 -300 870 -290 Q900 -280 900 -262 L850 -256 Q880 -246 866 -232 Q820 -226 790 -236 Z" fill="#e0b040" stroke="#6a4a12" strokeWidth={4} />
        <path d="M852 -256 L896 -262 L870 -238 Z" fill="#b8261b" />
        <circle cx={818} cy={-276} r={7} fill="#1b1410" />
        <path d="M790 -292 q-10 -40 -40 -50 M806 -294 q4 -40 -14 -60" stroke="#6a4a12" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M880 -240 q30 10 50 40 M870 -236 q20 30 22 60" stroke="#e0b040" strokeWidth={3} fill="none" />
      </g>
      {/* 下三层：殿阁 */}
      {widths.map((w, k) => {
        const y = DECK - k * STOREY;
        return (
          <g key={k}>
            <rect x={-w / 2} y={y - STOREY + 30} width={w} height={STOREY - 30} fill="#8a2a1a" stroke="#3a0c06" strokeWidth={3} />
            {Array.from({length: Math.floor(w / 70)}, (_, i) => -w / 2 + 25 + i * 70).map((x, i) => (
              <g key={x}>
                <rect x={x} y={y - STOREY + 44} width={44} height={44} fill={`rgba(255,${190 + 30 * Math.sin(f / 9 + i)},110,0.85)`} />
                <line x1={x + 22} y1={y - STOREY + 44} x2={x + 22} y2={y - STOREY + 88} stroke="#5a1a10" strokeWidth={3} />
                <line x1={x - 6} y1={y - STOREY + 30} x2={x - 6} y2={y} stroke="#c8402e" strokeWidth={8} />
              </g>
            ))}
            {/* 每层前沿朱栏 */}
            <rect x={-w / 2 - 10} y={y - 22} width={w + 20} height={6} fill="#d0402e" />
            {Array.from({length: Math.floor(w / 30)}, (_, i) => -w / 2 + i * 30).map((x) => <line key={x} x1={x} y1={y - 18} x2={x} y2={y} stroke="#b8301e" strokeWidth={4} />)}
            <Roof y={y - STOREY + 30} w={w - 60} h={26} />
            <Flag f={f} x={-w / 2 - 30} y={y - STOREY + 20} color={cols[(k * 2) % 5]} seed={k * 3} />
            <Flag f={f} x={w / 2 + 20} y={y - STOREY + 20} color={cols[(k * 2 + 1) % 5]} seed={k * 3 + 1} />
          </g>
        );
      })}
      {/* 顶层：敞亭，杨广站在朱栏后 */}
      <g>
        {[-210, 210].map((x) => <rect key={x} x={x - 9} y={TOP_FLOOR - 230} width={18} height={230} fill="#c8402e" stroke="#5a1a10" strokeWidth={3} />)}
        <rect x={-240} y={TOP_FLOOR - 6} width={480} height={10} fill="#5a1a10" />
        <Roof y={TOP_FLOOR - 230} w={440} h={46} />
        <path d={`M-120 ${TOP_FLOOR - 276} Q0 ${TOP_FLOOR - 330} 120 ${TOP_FLOOR - 276}`} fill="#e0b040" stroke="#6a4a12" strokeWidth={3} />
        <circle cx={0} cy={TOP_FLOOR - 318} r={14} fill="#ffd060" stroke="#6a4a12" strokeWidth={3} />
        <Flag f={f} x={-260} y={TOP_FLOOR - 236} color="#e04a3a" seed={9} h={120} />
        <Flag f={f} x={250} y={TOP_FLOOR - 236} color="#f0c040" seed={11} h={120} />
        <rect x={-232} y={RAIL_TOP - 4} width={464} height={12} rx={4} fill="#d8442e" stroke="#6a1a10" strokeWidth={2} />
        {children}
        {/* 栏杆下段（盖住腿） */}
        <rect x={-232} y={RAIL_TOP + 26} width={464} height={8} fill="#c8402e" />
        {Array.from({length: 16}, (_, i) => -225 + i * 30).map((x) => <rect key={x} x={x} y={RAIL_TOP + 8} width={9} height={74} fill="#c8402e" stroke="#6a1a10" strokeWidth={1.5} />)}
        <rect x={-236} y={TOP_FLOOR - 10} width={472} height={10} fill="#a8301e" />
      </g>
      {front}
    </g>
  );
};

/** 杨广（顶层凭栏举杯）在龙舟局部坐标里的骨骼：左手（远侧）扶栏杆，右手（近侧）举金爵到嘴边 */
export const yangOnBoat = (f: number, cupUp = 1) => {
  const s = YG_S;
  const p = standPose(YG_X, TOP_FLOOR, s, 1);
  const head = headOf(p.hip, p.neck, s);
  const mouth: P = [head[0] + 66 * s, head[1] + 40 * s]; // 金爵举在嘴前（不挡脸）
  const rest: P = [p.neck[0] + 60 * s, p.neck[1] + 120 * s];
  const handN: P = [rest[0] + (mouth[0] - rest[0]) * cupUp, rest[1] + (mouth[1] - rest[1]) * cupUp + Math.sin(f / 14) * 2];
  const handF: P = [YG_X + 74 * s, RAIL_TOP - 6];
  return {p, head, handN, handF, s};
};

/** 刷子：柄 + 鬃毛；at 手握处，ang 朝向（度） */
export const Brush: React.FC<{at: P; s: number; ang: number}> = ({at, s, ang}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${ang}) scale(${s})`}>
    <rect x={-10} y={-6} width={60} height={12} rx={5} fill="#8a5a2a" />
    <rect x={48} y={-12} width={16} height={24} fill="#b8b0a0" />
    <path d="M64 -14 L92 -16 L92 16 L64 14 Z" fill="#e8dcc0" />
    {[-12, -6, 0, 6, 12].map((y) => <line key={y} x1={66} y1={y} x2={92} y2={y * 1.15} stroke="#b8a888" strokeWidth={1.5} />)}
  </g>
);

/** 尘土粒子：从 at 向两边飘散 */
export const Dust: React.FC<{f: number; at: P; since: number; n?: number; seed?: number; spread?: number}> = ({f, at, since, n = 14, seed = 1, spread = 120}) => {
  if (since < 0) return null;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const r = rand(seed * 31 + i);
        const life = 18 + 14 * rand(seed * 7 + i);
        const tt = ((since + i * 2.3) % life) / life;
        const dx = (r - 0.5) * 2 * spread * tt;
        const dy = -60 * tt * (0.4 + rand(i + seed)) + 30 * tt * tt;
        return <circle key={i} cx={at[0] + dx} cy={at[1] + dy} r={2.5 + 5 * rand(i * 3 + seed) * (1 - tt * 0.5)} fill="#cdb894" opacity={0.75 * (1 - tt)} />;
      })}
    </g>
  );
};

/** 远游冠（太子冠）：黑漆纱冠 + 金饰 + 横簪，放在锦垫上 */
export const Crown: React.FC<{x: number; y: number; s?: number; glint?: number}> = ({x, y, s = 1, glint = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-110 0 Q-120 -30 -96 -40 L96 -40 Q120 -30 110 0 Z" fill="#8a2a3a" stroke="#3a0c14" strokeWidth={4} />
    <path d="M-100 -36 h200" stroke="#e0b040" strokeWidth={6} />
    <path d="M-62 -40 Q-70 -120 -30 -150 Q0 -166 30 -150 Q70 -120 62 -40 Z" fill="#1a1414" stroke="#000" strokeWidth={3} />
    <path d="M-54 -60 Q-58 -118 -24 -140 M54 -60 Q58 -118 24 -140" stroke="#3a3030" strokeWidth={3} fill="none" />
    <rect x={-66} y={-58} width={132} height={18} rx={4} fill="#d4a23a" stroke="#6a4a12" strokeWidth={2} />
    <circle cx={0} cy={-104} r={14} fill="#e0b040" stroke="#6a4a12" strokeWidth={3} />
    <circle cx={0} cy={-104} r={6} fill="#b8261b" />
    <line x1={-140} y1={-96} x2={140} y2={-112} stroke="#e8c050" strokeWidth={8} strokeLinecap="round" />
    <circle cx={142} cy={-112} r={8} fill="#ffd060" />
    {glint > 0 && (
      <g opacity={glint} transform={`translate(${-40 + 120 * glint} -118)`}>
        <path d="M0 -60 L9 -9 L60 0 L9 9 L0 60 L-9 9 L-60 0 L-9 -9 Z" fill="#fff6d0" />
        <circle r={22} fill="rgba(255,240,180,0.8)" />
      </g>
    )}
  </g>
);

/** 白底黑框小气泡（尾巴在左/右） */
export const WhiteBubble: React.FC<{x: number; y: number; text: string; p: number; size?: number; tail?: 'left' | 'right'}> = ({x, y, text, p, size = 40, tail = 'left'}) => {
  if (p <= 0) return null;
  const w = Array.from(text).length * size + 50;
  const k = 0.6 + 0.4 * Math.min(1, p * 1.2) + (p < 1 ? Math.sin(p * Math.PI) * 0.12 : 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(p * 3)}>
      <rect x={tail === 'left' ? 24 : -w - 24} y={-size - 20} width={w} height={size + 40} rx={18} fill="#fbf7ee" stroke="#1b1410" strokeWidth={4} />
      <path d={tail === 'left' ? 'M0 0 L30 -16 L30 14 Z' : 'M0 0 L-30 -16 L-30 14 Z'} fill="#fbf7ee" stroke="#1b1410" strokeWidth={4} strokeLinejoin="round" />
      <text x={tail === 'left' ? 49 : -w + 1} y={size * 0.36} fontFamily={LF.label} fontWeight={900} fontSize={size} fill="#1b1410">{text}</text>
    </g>
  );
};

export {Rig};
