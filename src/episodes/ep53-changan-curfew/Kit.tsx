import React from 'react';
import {clamp01, rand} from '../../library/anim';
import {LF} from '../../library/lamplight/theme';
import {P, Rig, RigProps} from './Rig';

/** 正片每屏的上下文：t 屏内帧、d 本屏帧数、L 每行字幕出现帧、hit 记忆点重拍帧、st 慢镜头重映射后的帧、B 一拍帧数 */
export type Ctx = {t: number; d: number; L: number[]; hit: number; st: number; B: number};
export type Look = Partial<RigProps>;
export const G = 990;

export const LOOK: Record<string, Look> = {
  you: {robe: '#ece2cc', robeD: '#c4b89e', pants: '#3a2f26', hem: 110},
  wen: {robe: '#8fae86', robeD: '#5f7a58', pants: '#3a2f26', hem: 120, beard: true},
  ling: {robe: '#6a3480', robeD: '#45215a', pants: '#2a2030', hem: 130, beard: true, beardC: '#9a9088'},
  yu: {robe: '#3b3430', robeD: '#26201c', pants: '#1e1a18', hem: 60, sword: true},
  guard: {robe: '#1e1c1c', robeD: '#141212', pants: '#141212', hem: 80},
  fang: {robe: '#7a6a58', robeD: '#5a4c3e', pants: '#2e2620', hem: 110, beard: true, beardC: '#6a625a'},
  zheng: {robe: '#8a6a4a', robeD: '#6a5038', pants: '#3a2f26', hem: 100},
  wei: {robe: '#b0563a', robeD: '#7e3a26', pants: '#3a2a20', hem: 120},
  ren: {robe: '#f4f0e8', robeD: '#d2cbbf', hat: 'bun', skirt: true, shawl: '#d8c8f0', hem: 200},
  renF: {robe: '#c0304a', robeD: '#8a2036', hat: 'bun', skirt: true, shawl: '#e9c46a', hem: 200},
  girlB: {robe: '#7ea0c0', robeD: '#5a7a9a', hat: 'bun', skirt: true, shawl: '#e8d8b0', hem: 200},
  girlP: {robe: '#e0a0b0', robeD: '#b87a8a', hat: 'bun', skirt: true, shawl: '#f0e0c0', hem: 200},
  girlR: {robe: '#c8402e', robeD: '#9a2a1e', hat: 'bun', skirt: true, shawl: '#f0d890', hem: 200},
  maid: {robe: '#a8c8a0', robeD: '#7a9a72', hat: 'twin', skirt: true, hem: 200},
  hu: {robe: '#6a4030', robeD: '#4a2c20', pants: '#2a1e18', hat: 'felt', beard: true, hem: 90},
  li: {robe: '#3a5a6a', robeD: '#2a424e', pants: '#2a2a2a', hem: 120},
};
export const CROWD = ['#6a5440', '#4a5a6a', '#7a4a3a', '#5a6a4a', '#6a6050', '#8a5a3a', '#4a4a6a'];

export const Svg: React.FC<{children: React.ReactNode; opacity?: number; style?: React.CSSProperties}> = ({children, opacity = 1, style}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, ...style}}>
    {children}
  </svg>
);

/** 竖排文字（每字一格），glow 里的字发金光 */
export const VText: React.FC<{x: number; y: number; text: string; size?: number; color?: string; glow?: string; glowOn?: number}> = ({x, y, text, size = 64, color = '#2a1a0a', glow = '', glowOn = 0}) => (
  <g>
    {Array.from(text).map((c, i) => {
      const g = glow.includes(c) ? glowOn : 0;
      return (
        <g key={i}>
          {g > 0 && <circle cx={x} cy={y + i * size * 1.1 - size * 0.35} r={size * 0.8} fill="rgba(255,200,90,0.55)" opacity={g} />}
          <text x={x} y={y + i * size * 1.1} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={size} fill={g > 0.5 ? '#a8261b' : color}>
            {c}
          </text>
        </g>
      );
    })}
  </g>
);

/** 黄纸（律文、榜文用） */
export const Paper: React.FC<{x: number; y: number; w: number; h: number; p?: number}> = ({x, y, w, h, p = 1}) => (
  <g>
    <rect x={x} y={y} width={w} height={h * clamp01(p)} fill="#e6d3a2" stroke="#8a6a2a" strokeWidth={6} />
    <rect x={x - 10} y={y - 14} width={w + 20} height={18} rx={8} fill="#5a3a20" />
    <rect x={x - 10} y={y + h * clamp01(p) - 4} width={w + 20} height={18} rx={8} fill="#5a3a20" />
  </g>
);

/** 慢镜头：从 hit 前 6 帧起按 k 倍速走 len 帧，之后恢复 */
export const slowT = (t: number, hit: number, k = 0.35, len = 36) => {
  const a = hit - 6;
  if (t < a) return t;
  if (t < a + len) return a + (t - a) * k;
  return a + len * k + (t - a - len);
};

/** 人物：外观 + 姿势 + 额外参数 */
export const Who: React.FC<{look: Look; pose: Partial<RigProps>; s: number; more?: Look; children?: React.ReactNode}> = ({look, pose, s, more, children}) => (
  <Rig {...(look as RigProps)} {...(pose as RigProps)} s={s} {...more}>
    {children}
  </Rig>
);

/** 头的位置（与 Rig 默认一致：沿躯干往上 58s） */
export const headOf = (hip: P, neck: P, s: number): P => {
  const v: P = [neck[0] - hip[0], neck[1] - hip[1]];
  const l = Math.hypot(v[0], v[1]);
  return [neck[0] + (v[0] / l) * 58 * s, neck[1] + (v[1] / l) * 58 * s];
};

/** 绕某点旋转一个子树（倒地、歪身） */
export const Rot: React.FC<{a: number; at: P; children: React.ReactNode}> = ({a, at, children}) => <g transform={`rotate(${a} ${at[0]} ${at[1]})`}>{children}</g>;

/** 冒烟 / 汗珠 / 速度线等小特效 */
export const Smoke: React.FC<{f: number; x: number; y: number; n?: number; color?: string}> = ({f, x, y, n = 3, color = 'rgba(230,230,230,0.6)'}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const k = ((f / 20 + i / n) % 1);
      return <circle key={i} cx={x + Math.sin(k * 6 + i) * 14} cy={y - k * 90} r={10 + 16 * k} fill={color} opacity={1 - k} />;
    })}
  </g>
);
export const Sweat: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => <path d={`M${x} ${y} q${-10 * s} ${18 * s} 0 ${24 * s} q${10 * s} ${-6 * s} 0 ${-24 * s} Z`} fill="#9ad0ff" stroke="#3a6a9a" strokeWidth={2} />;
export const SpeedLines: React.FC<{f: number; y0: number; y1: number; dir?: 1 | -1}> = ({f, y0, y1, dir = 1}) => (
  <g>
    {Array.from({length: 10}, (_, i) => {
      const y = y0 + rand(i + 3) * (y1 - y0);
      const x = (((-dir * f * 40 + rand(i) * 2400) % 2400) + 2400) % 2400 - 240;
      return <line key={i} x1={x} y1={y} x2={x + 180} y2={y} stroke="rgba(255,240,210,0.22)" strokeWidth={4} strokeLinecap="round" />;
    })}
  </g>
);

/** 一张写字的小纸条 */
export const Note: React.FC<{x: number; y: number; text: string; rot?: number; o?: number}> = ({x, y, text, rot = 0, o = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <rect x={-text.length * 22 - 16} y={-34} width={text.length * 44 + 32} height={64} rx={6} fill="#f4ead0" stroke="#8a6a2a" strokeWidth={3} />
    <text x={0} y={12} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={38} fill="#5a1a10">{text}</text>
  </g>
);

/** 白色对话框（空白或写字） */
export const Bubble: React.FC<{x: number; y: number; text?: string; w?: number; o?: number; size?: number}> = ({x, y, text = '', w, o = 1, size = 44}) => {
  const ww = w ?? Math.max(160, Array.from(text).length * size + 60);
  return (
    <g opacity={o}>
      <rect x={x - ww / 2} y={y - 50} width={ww} height={90} rx={30} fill="#fffaf0" stroke="#1a120c" strokeWidth={4} />
      <path d={`M${x - 20} ${y + 38} L${x - 34} ${y + 76} L${x + 10} ${y + 38} Z`} fill="#fffaf0" stroke="#1a120c" strokeWidth={4} strokeLinejoin="round" />
      <rect x={x - 22} y={y + 34} width={34} height={8} fill="#fffaf0" />
      {text && <text x={x} y={y + 14} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={size} fill="#1a120c">{text}</text>}
    </g>
  );
};

/** 一碗汤 / 一个胡饼 / 一个杯子 */
export const Bowl: React.FC<{x: number; y: number; s?: number; steam?: number; f?: number}> = ({x, y, s = 1, steam = 0, f = 0}) => (
  <g>
    <path d={`M${x - 40 * s} ${y} Q${x} ${y + 50 * s} ${x + 40 * s} ${y} Z`} fill="#c9b27a" stroke="#5a3a20" strokeWidth={3} />
    <ellipse cx={x} cy={y} rx={40 * s} ry={9 * s} fill="#b0803a" />
    {steam > 0 && [0, 1].map((i) => <path key={i} d={`M${x - 10 + i * 20} ${y - 10} q${-10 + 6 * Math.sin(f / 6 + i)} -30 0 -60`} stroke="rgba(255,255,255,0.4)" strokeWidth={6} fill="none" strokeLinecap="round" opacity={steam} />)}
  </g>
);
export const Bread: React.FC<{x: number; y: number; s?: number; bite?: number}> = ({x, y, s = 1, bite = 0}) => {
  const r = 34 * s * (1 - 0.7 * clamp01(bite));
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#d79a4a" stroke="#7a4a1a" strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={x + Math.cos(i * 1.3) * r * 0.5} cy={y + Math.sin(i * 1.3) * r * 0.45} r={3 * s} fill="#f4e6c0" />)}
    </g>
  );
};
export const Cup: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g>
    <path d={`M${x - 16 * s} ${y - 12 * s} L${x + 16 * s} ${y - 12 * s} L${x + 10 * s} ${y + 10 * s} L${x - 10 * s} ${y + 10 * s} Z`} fill="#c9a24a" stroke="#5a3a20" strokeWidth={2} />
  </g>
);

/** 火把 */
export const Torch: React.FC<{f: number; x: number; y: number; s?: number}> = ({f, x, y, s = 1}) => (
  <g>
    <circle cx={x} cy={y - 30 * s} r={90 * s} fill="rgba(255,150,60,0.22)" />
    <path d={`M${x - 14 * s} ${y} Q${x + 4 * Math.sin(f / 2)} ${y - 70 * s} ${x + 14 * s} ${y} Z`} fill="#ff8a2a" />
    <path d={`M${x - 7 * s} ${y} Q${x + 2 * Math.sin(f / 2)} ${y - 40 * s} ${x + 7 * s} ${y} Z`} fill="#ffe08a" />
  </g>
);

/** 宅子：夯土院墙 + 朱漆大门 + 正堂（斗拱飞檐、窗灯）；fade 0–1 一层层褪成荒地（灯→屋顶→斗拱→堂屋），ruin 墙头坍塌 */
export const Mansion: React.FC<{f: number; fade?: number; x?: number; s?: number}> = ({f, fade = 0, x = 960, s = 1}) => {
  const seg = (a: number, b: number) => 1 - clamp01((fade - a) / (b - a));
  const lights = seg(0, 0.3), roof = seg(0.15, 0.5), brackets = seg(0.3, 0.65), body = seg(0.5, 0.85);
  const ruin = clamp01((fade - 0.4) / 0.5);
  return (
    <g transform={`translate(${x} ${G}) scale(${s})`}>
      {/* 正堂 */}
      <g opacity={body}>
        <rect x={-420} y={-560} width={840} height={260} fill="#5a3424" />
        {[-300, -100, 100, 300].map((wx) => (
          <g key={wx}>
            <rect x={wx - 60} y={-520} width={120} height={150} fill="#2a1810" />
            <rect x={wx - 60} y={-520} width={120} height={150} fill={`rgba(255,190,100,${0.75 * lights * (0.85 + 0.15 * Math.sin(f / 7 + wx))})`} />
            {[1, 2, 3].map((k) => <line key={k} x1={wx - 60 + k * 30} y1={-520} x2={wx - 60 + k * 30} y2={-370} stroke="#2a1810" strokeWidth={4} />)}
          </g>
        ))}
        {[-410, -200, 0, 200, 410].map((cx) => <rect key={cx} x={cx - 12} y={-560} width={24} height={260} fill="#8a2a1a" />)}
      </g>
      <g opacity={brackets}>
        {Array.from({length: 13}, (_, i) => <rect key={i} x={-430 + i * 70} y={-596} width={36} height={36} fill="#3a6a5a" stroke="#1a2a20" strokeWidth={3} />)}
        <rect x={-440} y={-570} width={880} height={14} fill="#7a2a1a" />
      </g>
      <g opacity={roof}>
        <path d="M-560 -600 Q-520 -610 -470 -640 L470 -640 Q520 -610 560 -600 Q580 -620 600 -660 L540 -650 L420 -740 L-420 -740 L-540 -650 L-600 -660 Q-580 -620 -560 -600 Z" fill="#1c1a1e" />
        <rect x={-430} y={-760} width={860} height={24} fill="#141216" />
      </g>
      {/* 院墙 */}
      <path d={`M-800 0 L-800 ${-300 + ruin * 40} ${Array.from({length: 17}, (_, i) => `L${-800 + i * 100} ${-300 + ruin * (40 + 110 * rand(i + 5))}`).join(' ')} L800 0 Z`} fill="#9a7a52" />
      {Array.from({length: 5}, (_, i) => <line key={i} x1={-800} x2={800} y1={-60 * (i + 1)} y2={-60 * (i + 1)} stroke="rgba(0,0,0,0.12)" strokeWidth={3} />)}
      {ruin < 0.5 && <rect x={-810} y={-316} width={1620} height={20} fill="#3a2a1e" opacity={1 - ruin * 2} />}
      {/* 大门 */}
      <rect x={-170} y={-340} width={340} height={340} fill="#3a2018" />
      <rect x={-150} y={-300} width={145} height={300} fill="#a8261b" stroke="#5a120c" strokeWidth={5} />
      <rect x={5} y={-300} width={145} height={300} fill="#a8261b" stroke="#5a120c" strokeWidth={5} />
      {[-110, -60, 60, 110].map((cx) => [0, 1, 2, 3].map((r) => <circle key={`${cx}-${r}`} cx={cx} cy={-250 + r * 60} r={7} fill="#e0b050" />))}
      <path d="M-230 -340 L0 -420 L230 -340 Z" fill="#1c1410" />
    </g>
  );
};
