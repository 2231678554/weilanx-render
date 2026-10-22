import React from 'react';
import {rand} from '../../library/anim';
import {LF} from '../../library/lamplight/theme';
import {headOf} from '../ep53-changan-curfew/Kit';
import {P, RigProps} from '../ep53-changan-curfew/Rig';

/**
 * ep54 室内布景零件（每屏各自拼，不共用一座大殿）：柱、梁枋彩画、斗拱、格窗、地砖、屏风、台基、坐榻、帐幔、香炉、宫灯、书架、铜镜、书案、席、雪。
 * 全部 1920×1080 画布坐标；id 用来区分渐变，避免多处同名。
 */

/* ───────── 人物外观 ───────── */
export const CAST: Record<string, Partial<RigProps>> = {
  /** 隋文帝：花白长须、浅黄袍 */
  wen: {robe: '#e6d494', robeD: '#bba660', pants: '#4a3a24', hem: 130, beard: true, beardC: '#d6d0c4'},
  /** 独孤皇后：高髻、深红襦裙、金披帛 */
  dugu: {robe: '#7e1f2c', robeD: '#5a1420', hat: 'bun', skirt: true, shawl: '#e2b24a', hem: 200},
  /** 太子杨勇：俊朗浓眉，青袍 */
  yong: {robe: '#2f5a7a', robeD: '#21425a', pants: '#2a2420', hem: 120},
  /** 晋王杨广：紫袍 */
  guangJin: {robe: '#5e2f6e', robeD: '#40204c', pants: '#2a2030', hem: 120},
  jun: {robe: '#3f6a4a', robeD: '#2c4c34', pants: '#2a2420', hem: 110},
  xiu: {robe: '#8a4a2a', robeD: '#62341e', pants: '#2a2420', hem: 110},
  liang: {robe: '#4a4a7a', robeD: '#34345a', pants: '#2a2420', hem: 100},
  /** 朝臣：绯、绿、青三色 */
  offR: {robe: '#9a2e26', robeD: '#6e201a', pants: '#2a2020', hem: 130},
  offG: {robe: '#3e6a46', robeD: '#2a4a30', pants: '#2a2420', hem: 130},
  offB: {robe: '#34507a', robeD: '#243856', pants: '#22222a', hem: 130},
  guest: {robe: '#d8ccb0', robeD: '#aa9e84', pants: '#3a3026', hem: 110},
  guest2: {robe: '#8a7a5a', robeD: '#665a40', pants: '#3a3026', hem: 110, beard: true, beardC: '#3a2e22'},
  musician: {robe: '#b8452e', robeD: '#88301e', pants: '#2a2020', hem: 100},
};

/** 浓眉（侧脸）：叠在 Rig 自带的眉毛上 */
export const Brows: React.FC<{h: P; s: number; facing: number; tilt?: number; angry?: number}> = ({h, s, facing, tilt = 0, angry = 0}) => (
  <g transform={`translate(${h[0]} ${h[1]}) rotate(${tilt}) scale(${s})`}>
    <path d={`M${facing * 6} ${-18 - 2 * angry} L${facing * 32} ${-22 + 8 * angry}`} stroke="#14100c" strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** 正脸怒眉 + 青筋 */
export const AngerMark: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} stroke="#e0302a" strokeWidth={7} strokeLinecap="round" fill="none">
    <path d="M-16 -4 q8 -2 10 -12 M4 -16 q2 8 12 10 M16 4 q-8 2 -10 12 M-4 16 q-2 -8 -12 -10" />
  </g>
);

/** 合拢的双手（拱手 / 十指交叉） */
export const Clasp: React.FC<{at: P; s: number; rot?: number}> = ({at, s, rot = 0}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={24} ry={16} fill="#e6c9a0" stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
    {[-12, -4, 4, 12].map((x) => <line key={x} x1={x} y1={-14} x2={x + 2} y2={8} stroke="rgba(120,80,50,0.55)" strokeWidth={2.5} />)}
    <ellipse cx={-4} cy={-14} rx={9} ry={5} fill="#e6c9a0" stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
  </g>
);

export const headPos = (pose: {hip: P; neck: P}, s: number) => headOf(pose.hip, pose.neck, s);

/* ───────── 建筑 ───────── */

/** 红柱：明暗渐变、金箍、栌斗、柱础 */
export const Pillar: React.FC<{id: string; x: number; y0: number; y1: number; w?: number; color?: string; dark?: string}> = ({id, x, y0, y1, w = 96, color = '#9a2416', dark = '#4a0e08'}) => (
  <g>
    <defs>
      <linearGradient id={`${id}-pg`} x1="0" x2="1">
        <stop offset="0" stopColor={dark} />
        <stop offset="0.32" stopColor={color} />
        <stop offset="0.45" stopColor="#c8503a" />
        <stop offset="0.62" stopColor={color} />
        <stop offset="1" stopColor={dark} />
      </linearGradient>
    </defs>
    <ellipse cx={x + 30} cy={y1 + 8} rx={w * 1.1} ry={14} fill="rgba(0,0,0,0.35)" />
    <rect x={x - w / 2} y={y0} width={w} height={y1 - y0} fill={`url(#${id}-pg)`} />
    {[y0 + 40, y0 + 64].map((y) => (
      <g key={y}>
        <rect x={x - w / 2 - 2} y={y} width={w + 4} height={14} fill="#c99a3a" />
        <rect x={x - w / 2 - 2} y={y + 10} width={w + 4} height={4} fill="#7a5418" />
      </g>
    ))}
    {Array.from({length: 4}, (_, i) => <circle key={i} cx={x - w / 2 + (i + 0.5) * (w / 4)} cy={y0 + 58} r={3} fill="#e8c060" />)}
    <path d={`M${x - w * 0.75} ${y0} L${x + w * 0.75} ${y0} L${x + w * 0.6} ${y0 + 26} L${x - w * 0.6} ${y0 + 26} Z`} fill="#3a2414" stroke="#1a0e06" strokeWidth={2} />
    <path d={`M${x - w * 0.7} ${y1} Q${x - w * 0.9} ${y1 + 26} ${x - w * 0.85} ${y1 + 34} L${x + w * 0.85} ${y1 + 34} Q${x + w * 0.9} ${y1 + 26} ${x + w * 0.7} ${y1} Z`} fill="#8c8270" stroke="#4a4436" strokeWidth={2} />
    <path d={`M${x - w * 0.6} ${y1 + 10} q${w * 0.6} 8 ${w * 1.2} 0`} stroke="#5e5646" strokeWidth={3} fill="none" />
  </g>
);

/** 额枋：旋子彩画（青绿底、金线、花心） */
export const Beam: React.FC<{id: string; x0?: number; x1?: number; y: number; h?: number; base?: string}> = ({id, x0 = 0, x1 = 1920, y, h = 64, base = '#1f4a46'}) => {
  const n = Math.max(2, Math.round((x1 - x0) / 300));
  const step = (x1 - x0) / n;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a7a70" />
          <stop offset="0.5" stopColor={base} />
          <stop offset="1" stopColor="#0e2624" />
        </linearGradient>
      </defs>
      <rect x={x0} y={y} width={x1 - x0} height={h} fill={`url(#${id}-bg)`} />
      <rect x={x0} y={y} width={x1 - x0} height={5} fill="#d8a83a" />
      <rect x={x0} y={y + h - 5} width={x1 - x0} height={5} fill="#d8a83a" />
      {Array.from({length: n}, (_, i) => {
        const cx = x0 + step * (i + 0.5);
        return (
          <g key={i}>
            <path d={`M${cx - step / 2 + 8} ${y + 5} l${h * 0.35} ${(h - 10) / 2} l${-h * 0.35} ${(h - 10) / 2} M${cx + step / 2 - 8} ${y + 5} l${-h * 0.35} ${(h - 10) / 2} l${h * 0.35} ${(h - 10) / 2}`} stroke="#d8a83a" strokeWidth={3} fill="none" />
            <ellipse cx={cx} cy={y + h / 2} rx={h * 0.62} ry={h * 0.36} fill="#2a5aa0" stroke="#d8a83a" strokeWidth={3} />
            {Array.from({length: 8}, (_, k) => {
              const a = (k / 8) * Math.PI * 2;
              return <ellipse key={k} cx={cx + Math.cos(a) * h * 0.38} cy={y + h / 2 + Math.sin(a) * h * 0.2} rx={h * 0.13} ry={h * 0.08} fill="#7ab0d8" transform={`rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * h * 0.38} ${y + h / 2 + Math.sin(a) * h * 0.2})`} />;
            })}
            <circle cx={cx} cy={y + h / 2} r={h * 0.12} fill="#f0c850" />
          </g>
        );
      })}
    </g>
  );
};

/** 斗拱一排（梁上） */
export const Brackets: React.FC<{x0?: number; x1?: number; y: number; gap?: number; s?: number}> = ({x0 = 0, x1 = 1920, y, gap = 160, s = 1}) => (
  <g>
    {Array.from({length: Math.floor((x1 - x0) / gap) + 1}, (_, i) => {
      const x = x0 + i * gap + gap / 2;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x={-18} y={-22} width={36} height={22} fill="#2a5a54" stroke="#0e2220" strokeWidth={2} />
          <path d="M-62 -22 q0 -16 14 -16 h96 q14 0 14 16 Z" fill="#3a2a1a" stroke="#120a04" strokeWidth={2} />
          <rect x={-26} y={-58} width={52} height={20} fill="#2a5a54" stroke="#0e2220" strokeWidth={2} />
          <path d="M-46 -58 q0 -14 12 -14 h68 q12 0 12 14 Z" fill="#3a2a1a" stroke="#120a04" strokeWidth={2} />
          <rect x={-14} y={-90} width={28} height={18} fill="#2a5a54" stroke="#0e2220" strokeWidth={2} />
        </g>
      );
    })}
  </g>
);

/** 格窗 / 隔扇：外框 + 棂格 + 窗纸透光 */
export const Lattice: React.FC<{x: number; y: number; w: number; h: number; glow?: number; kind?: 'grid' | 'diamond' | 'zhi'; frame?: string; light?: string}> = ({x, y, w, h, glow = 0.6, kind = 'grid', frame = '#3a1a0e', light = '#ffd9a0'}) => {
  const cells: React.ReactNode[] = [];
  if (kind === 'zhi') for (let i = 1; i < 9; i++) cells.push(<line key={i} x1={x + (i * w) / 9} y1={y} x2={x + (i * w) / 9} y2={y + h} stroke={frame} strokeWidth={6} />);
  if (kind === 'grid') {
    for (let i = 1; i < 6; i++) cells.push(<line key={`v${i}`} x1={x + (i * w) / 6} y1={y} x2={x + (i * w) / 6} y2={y + h} stroke={frame} strokeWidth={5} />);
    for (let j = 1; j < Math.round(h / (w / 6)); j++) cells.push(<line key={`h${j}`} x1={x} y1={y + j * (w / 6)} x2={x + w} y2={y + j * (w / 6)} stroke={frame} strokeWidth={5} />);
  }
  if (kind === 'diamond') {
    const d = w / 5;
    for (let k = -Math.ceil(h / d); k < Math.ceil((w + h) / d); k++) {
      cells.push(<line key={`a${k}`} x1={x + k * d} y1={y} x2={x + k * d + h} y2={y + h} stroke={frame} strokeWidth={5} />);
      cells.push(<line key={`b${k}`} x1={x + k * d} y1={y} x2={x + k * d - h} y2={y + h} stroke={frame} strokeWidth={5} />);
    }
  }
  const cid = `lc${Math.round(x)}_${Math.round(y)}_${Math.round(w)}`;
  return (
    <g>
      <defs>
        <clipPath id={cid}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
        <radialGradient id={`${cid}-g`} cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor={light} stopOpacity={0.95 * glow} />
          <stop offset="1" stopColor={light} stopOpacity={0.35 * glow} />
        </radialGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill="#2a140a" />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${cid}-g)`} />
      <g clipPath={`url(#${cid})`}>{cells}</g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={frame} strokeWidth={14} />
      <rect x={x - 7} y={y + h} width={w + 14} height={22} fill={frame} />
    </g>
  );
};

/** 透视地砖：vanish 消失点，y 地平 */
export const Floor: React.FC<{id: string; y: number; vx?: number; c1?: string; c2?: string; lines?: string; n?: number; rows?: number}> = ({id, y, vx = 960, c1 = '#3a2214', c2 = '#1a0e08', lines = 'rgba(0,0,0,0.35)', n = 12, rows = 7}) => (
  <g>
    <defs>
      <linearGradient id={`${id}-fl`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={c1} />
        <stop offset="1" stopColor={c2} />
      </linearGradient>
    </defs>
    <rect x={0} y={y} width={1920} height={1080 - y} fill={`url(#${id}-fl)`} />
    {Array.from({length: n * 2 + 1}, (_, i) => <line key={i} x1={vx + (i - n) * 120} y1={y} x2={vx + (i - n) * 520} y2={1080} stroke={lines} strokeWidth={3} />)}
    {Array.from({length: rows}, (_, j) => {
      const k = Math.pow((j + 1) / rows, 1.8);
      return <line key={j} x1={0} y1={y + (1080 - y) * k} x2={1920} y2={y + (1080 - y) * k} stroke={lines} strokeWidth={3} />;
    })}
    <rect x={0} y={y} width={1920} height={10} fill="rgba(0,0,0,0.35)" />
  </g>
);

/** 屏风：几扇，画着远山 / 仙鹤 / 海浪 */
export const Screen: React.FC<{x: number; y: number; w: number; h: number; panels?: number; art?: 'mountain' | 'crane' | 'wave' | 'plain'; frame?: string; paper?: string; seed?: number}> = ({x, y, w, h, panels = 5, art = 'mountain', frame = '#2a140a', paper = '#d9c49a', seed = 3}) => {
  const pw = w / panels;
  const cid = `sc${Math.round(x)}_${Math.round(y)}`;
  return (
    <g>
      <defs>
        <clipPath id={cid}>
          <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} />
        </clipPath>
        <linearGradient id={`${cid}-p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={paper} />
          <stop offset="1" stopColor="#b8a27a" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={frame} />
      <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill={`url(#${cid}-p)`} />
      <g clipPath={`url(#${cid})`}>
        {art === 'mountain' && (
          <>
            <circle cx={x + w * 0.72} cy={y + h * 0.28} r={h * 0.09} fill="#c8402a" opacity={0.85} />
            {[0, 1, 2].map((k) => {
              const base = y + h * (0.55 + k * 0.14);
              const amp = h * (0.32 - k * 0.07);
              const pts = Array.from({length: 13}, (_, i) => {
                const px = x + (i / 12) * w;
                const py = base - amp * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.3 + seed + k * 2.1))) * (i % 2 ? 0.6 : 1);
                return `${px} ${py}`;
              });
              return <path key={k} d={`M${x} ${y + h} L${pts.join(' L')} L${x + w} ${y + h} Z`} fill={['#7a8a78', '#4e5e52', '#2a3a32'][k]} opacity={0.9} />;
            })}
            {Array.from({length: 7}, (_, i) => {
              const px = x + w * (0.08 + i * 0.14);
              const py = y + h * 0.86;
              return <path key={i} d={`M${px} ${py} l0 -40 M${px - 16} ${py - 18} l16 -14 l16 14 M${px - 12} ${py - 32} l12 -12 l12 12`} stroke="#1a2a22" strokeWidth={4} fill="none" />;
            })}
          </>
        )}
        {art === 'crane' && (
          <>
            {Array.from({length: 6}, (_, i) => <path key={i} d={`M${x} ${y + h * (0.2 + i * 0.13)} q${w * 0.25} -20 ${w * 0.5} 0 t${w * 0.5} 0`} stroke="rgba(120,90,50,0.25)" strokeWidth={6} fill="none" />)}
            {[0, 1, 2].map((i) => {
              const cx = x + w * (0.22 + i * 0.28);
              const cy = y + h * (0.3 + (i % 2) * 0.18);
              return (
                <g key={i} transform={`translate(${cx} ${cy}) scale(${1 - i * 0.12})`}>
                  <path d="M-60 0 q30 -40 60 -6 q30 -34 60 6 q-30 -8 -60 10 q-30 -18 -60 -10 Z" fill="#f4efe4" stroke="#2a2420" strokeWidth={3} />
                  <path d="M0 6 q20 6 40 -24" stroke="#2a2420" strokeWidth={4} fill="none" />
                  <circle cx={40} cy={-26} r={6} fill="#c8302a" />
                </g>
              );
            })}
          </>
        )}
        {art === 'wave' &&
          Array.from({length: 8}, (_, j) =>
            Array.from({length: 10}, (_, i) => <path key={`${i}-${j}`} d={`M${x + i * (w / 9) - 40 + (j % 2) * 30} ${y + h * 0.2 + j * (h / 9)} a40 40 0 0 1 80 0`} stroke="#2a4a6a" strokeWidth={5} fill="none" opacity={0.7} />),
          )}
      </g>
      {Array.from({length: panels - 1}, (_, i) => <rect key={i} x={x + (i + 1) * pw - 5} y={y} width={10} height={h} fill={frame} />)}
      <rect x={x} y={y + h - 4} width={w} height={30} fill={frame} />
      {Array.from({length: panels}, (_, i) => <rect key={i} x={x + i * pw + pw * 0.2} y={y + h + 26} width={pw * 0.6} height={12} fill="#1a0c06" />)}
    </g>
  );
};

/** 台基 / 丹陛：几级台阶 */
export const Dais: React.FC<{x: number; y: number; w: number; steps?: number; step?: number; color?: string; edge?: string}> = ({x, y, w, steps = 3, step = 26, color = '#5a2a1a', edge = '#c99a3a'}) => (
  <g>
    {Array.from({length: steps}, (_, i) => {
      const ww = w + i * 90;
      const yy = y + i * step;
      return (
        <g key={i}>
          <rect x={x - ww / 2} y={yy} width={ww} height={step} fill={color} stroke="#1a0a04" strokeWidth={2} />
          <rect x={x - ww / 2} y={yy} width={ww} height={4} fill={edge} />
          {Array.from({length: Math.floor(ww / 60)}, (_, k) => <rect key={k} x={x - ww / 2 + 12 + k * 60} y={yy + 9} width={36} height={step - 16} rx={4} fill="rgba(0,0,0,0.2)" />)}
        </g>
      );
    })}
  </g>
);

/** 坐榻：围屏 + 壶门腿 + 锦垫 */
export const Couch: React.FC<{x: number; y: number; w: number; h?: number; back?: number; cushion?: string; wood?: string}> = ({x, y, w, h = 70, back = 120, cushion = '#b8302a', wood = '#4a2412'}) => (
  <g>
    <rect x={x - w / 2} y={y - back} width={w} height={back} fill={wood} stroke="#1a0a04" strokeWidth={3} />
    {Array.from({length: 6}, (_, i) => <rect key={i} x={x - w / 2 + 14 + (i * (w - 28)) / 6} y={y - back + 14} width={(w - 28) / 6 - 10} height={back - 28} fill="#6a3418" stroke="#c99a3a" strokeWidth={2} />)}
    <rect x={x - w / 2 - 10} y={y} width={w + 20} height={22} fill={wood} stroke="#1a0a04" strokeWidth={3} />
    <rect x={x - w / 2 - 10} y={y} width={w + 20} height={4} fill="#c99a3a" />
    <rect x={x - w / 2} y={y + 22} width={w} height={h - 22} fill="#3a1a0c" />
    {Array.from({length: Math.max(2, Math.floor(w / 110))}, (_, i) => {
      const cw = w / Math.max(2, Math.floor(w / 110));
      return <path key={i} d={`M${x - w / 2 + i * cw + 14} ${y + h} L${x - w / 2 + i * cw + 14} ${y + 34} Q${x - w / 2 + i * cw + cw / 2} ${y + 22} ${x - w / 2 + (i + 1) * cw - 14} ${y + 34} L${x - w / 2 + (i + 1) * cw - 14} ${y + h} Z`} fill="#12080a" />;
    })}
    <rect x={x - w / 2 + 6} y={y - 16} width={w - 12} height={18} rx={8} fill={cushion} />
    {Array.from({length: Math.floor(w / 40)}, (_, i) => <circle key={i} cx={x - w / 2 + 26 + i * 40} cy={y - 7} r={4} fill="#e8b850" />)}
  </g>
);

/** 帐幔：上沿一串垂弧 + 流苏，两侧束起 */
export const Curtain: React.FC<{f: number; x0?: number; x1?: number; y: number; drop?: number; color?: string; dark?: string; n?: number; sides?: boolean; sideH?: number}> = ({f, x0 = 0, x1 = 1920, y, drop = 70, color = '#8a1a24', dark = '#5a0e16', n = 6, sides = true, sideH = 700}) => {
  const step = (x1 - x0) / n;
  return (
    <g>
      {sides && (
        <>
          <path d={`M${x0} ${y} L${x0 + 200} ${y} Q${x0 + 120} ${y + sideH * 0.45} ${x0 + 60} ${y + sideH * 0.55} Q${x0 + 110} ${y + sideH * 0.8} ${x0 + 70 + Math.sin(f / 30) * 4} ${y + sideH} L${x0} ${y + sideH} Z`} fill={dark} />
          <path d={`M${x1} ${y} L${x1 - 200} ${y} Q${x1 - 120} ${y + sideH * 0.45} ${x1 - 60} ${y + sideH * 0.55} Q${x1 - 110} ${y + sideH * 0.8} ${x1 - 70 + Math.sin(f / 30 + 1) * 4} ${y + sideH} L${x1} ${y + sideH} Z`} fill={dark} />
          <rect x={x0 + 40} y={y + sideH * 0.53} width={44} height={16} rx={6} fill="#d8a83a" />
          <rect x={x1 - 84} y={y + sideH * 0.53} width={44} height={16} rx={6} fill="#d8a83a" />
        </>
      )}
      <rect x={x0} y={y - 20} width={x1 - x0} height={24} fill={dark} />
      {Array.from({length: n}, (_, i) => (
        <path key={i} d={`M${x0 + i * step} ${y} Q${x0 + (i + 0.5) * step} ${y + drop * 2} ${x0 + (i + 1) * step} ${y} Z`} fill={color} stroke={dark} strokeWidth={3} />
      ))}
      {Array.from({length: n + 1}, (_, i) => {
        const sw = Math.sin(f / 18 + i) * 3;
        const tx = x0 + i * step;
        return (
          <g key={i}>
            <line x1={tx} y1={y} x2={tx + sw} y2={y + 44} stroke="#d8a83a" strokeWidth={3} />
            <path d={`M${tx + sw - 8} ${y + 44} L${tx + sw + 8} ${y + 44} L${tx + sw + 5} ${y + 74} L${tx + sw - 5} ${y + 74} Z`} fill="#d8a83a" />
          </g>
        );
      })}
    </g>
  );
};

/** 博山炉 + 袅袅青烟 */
export const Incense: React.FC<{f: number; x: number; y: number; s?: number; seed?: number}> = ({f, x, y, s = 1, seed = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({length: 3}, (_, i) => {
      const ph = (f / 70 + i / 3 + seed * 0.13) % 1;
      const yy = -70 - ph * 260;
      const xx = Math.sin(ph * 6 + i + seed) * 26 * ph;
      return <circle key={i} cx={xx} cy={yy} r={10 + ph * 30} fill="rgba(220,215,200,0.22)" opacity={1 - ph} />;
    })}
    <path d={`M0 -70 C ${Math.sin(f / 20 + seed) * 14} -110, ${-Math.sin(f / 26 + seed) * 22} -150, ${Math.sin(f / 18) * 10} -200`} stroke="rgba(230,225,210,0.45)" strokeWidth={4} fill="none" />
    <ellipse cx={0} cy={6} rx={44} ry={8} fill="rgba(0,0,0,0.35)" />
    <path d="M-30 0 L30 0 L18 -16 L-18 -16 Z" fill="#6a5a3a" />
    <rect x={-6} y={-30} width={12} height={16} fill="#7a6a44" />
    <path d="M-34 -30 Q-34 -54 0 -56 Q34 -54 34 -30 Z" fill="#8a7a4a" stroke="#3a301a" strokeWidth={2} />
    <path d="M-26 -54 L-14 -74 L-4 -60 L6 -80 L16 -62 L26 -54 Z" fill="#9a8a5a" stroke="#3a301a" strokeWidth={2} />
    <circle cx={0} cy={-42} r={4} fill="#3a301a" />
  </g>
);

/** 落地宫灯：木架 + 绢罩 + 火光 */
export const StandLamp: React.FC<{f: number; x: number; y: number; s?: number; seed?: number; color?: string}> = ({f, x, y, s = 1, seed = 1, color = '#f0d8a0'}) => {
  const fl = 0.9 + 0.1 * Math.sin(f / 4 + seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-260} r={210 * fl} fill="rgba(255,190,100,0.10)" />
      <circle cx={0} cy={-260} r={110 * fl} fill="rgba(255,200,120,0.14)" />
      <rect x={-6} y={-200} width={12} height={200} fill="#2a160a" />
      <path d="M-50 0 L50 0 L30 -14 L-30 -14 Z" fill="#2a160a" />
      <path d="M-48 -200 L48 -200 L56 -320 L-56 -320 Z" fill={color} stroke="#3a1e0a" strokeWidth={4} />
      {[-28, 0, 28].map((dx) => <line key={dx} x1={dx * 1.05} y1={-200} x2={dx * 1.18} y2={-320} stroke="#3a1e0a" strokeWidth={3} />)}
      <rect x={-64} y={-336} width={128} height={18} fill="#3a1e0a" />
      <rect x={-52} y={-206} width={104} height={12} fill="#3a1e0a" />
      <ellipse cx={0} cy={-255} rx={20 * fl} ry={34 * fl} fill="rgba(255,220,140,0.75)" />
      <path d="M-40 -336 l-10 -20 M40 -336 l10 -20" stroke="#3a1e0a" strokeWidth={5} />
    </g>
  );
};

/** 书架：格子里码卷轴（圆头）和竹简捆 */
export const Shelf: React.FC<{x: number; y: number; w: number; h: number; rows?: number; cols?: number; seed?: number}> = ({x, y, w, h, rows = 4, cols = 5, seed = 7}) => {
  const cw = w / cols, ch = h / rows;
  const items: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const bx = x + c * cw, by = y + r * ch;
      const kind = Math.floor(rand(seed + r * 17 + c * 5) * 3);
      if (kind === 0)
        for (let k = 0; k < 9; k++) {
          const row = Math.floor(k / 3), col = k % 3;
          const cx = bx + cw * (0.24 + col * 0.26) + (row % 2) * 10;
          const cy = by + ch - 22 - row * 26;
          items.push(<circle key={`${r}${c}${k}`} cx={cx} cy={cy} r={12} fill={['#e8dcc0', '#d0b888', '#c8a070'][k % 3]} stroke="#5a3a1a" strokeWidth={2} />);
          items.push(<circle key={`${r}${c}${k}d`} cx={cx} cy={cy} r={4} fill="#8a5a2a" />);
        }
      else if (kind === 1)
        items.push(
          <g key={`${r}${c}`}>
            <rect x={bx + 14} y={by + ch - 50} width={cw - 28} height={40} rx={6} fill="#b89a5a" />
            {Array.from({length: 8}, (_, k) => <line key={k} x1={bx + 20 + k * ((cw - 40) / 7)} y1={by + ch - 50} x2={bx + 20 + k * ((cw - 40) / 7)} y2={by + ch - 10} stroke="#7a5a2a" strokeWidth={2} />)}
            <rect x={bx + cw / 2 - 6} y={by + ch - 52} width={12} height={44} fill="#a8302a" />
          </g>,
        );
      else
        items.push(
          <g key={`${r}${c}`}>
            {[0, 1, 2, 3].map((k) => <rect key={k} x={bx + 16 + k * 22} y={by + 18 + (k % 2) * 8} width={18} height={ch - 30 - (k % 2) * 8} fill={['#4a6a5a', '#8a3a2a', '#c8a050', '#3a4a6a'][k]} />)}
          </g>,
        );
    }
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill="#3a1e0c" stroke="#1a0a04" strokeWidth={3} />
      <rect x={x} y={y} width={w} height={h} fill="#1e0e06" />
      {items}
      {Array.from({length: rows - 1}, (_, r) => <rect key={r} x={x} y={y + (r + 1) * ch - 6} width={w} height={12} fill="#3a1e0c" />)}
      {Array.from({length: cols - 1}, (_, c) => <rect key={c} x={x + (c + 1) * cw - 6} y={y} width={12} height={h} fill="#3a1e0c" />)}
    </g>
  );
};

/** 书案：笔架、砚台、铺纸、镇纸 */
export const Desk: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 360}) => (
  <g>
    <rect x={x - w / 2} y={y - 20} width={w} height={20} rx={4} fill="#4a2412" />
    <rect x={x - w / 2} y={y - 20} width={w} height={4} fill="#7a4a24" />
    <path d={`M${x - w / 2 + 16} ${y} l0 46 l14 0 l0 -30 Q${x} ${y + 6} ${x + w / 2 - 30} ${y + 16} l0 30 l14 0 l0 -46 Z`} fill="#2e1608" />
    <rect x={x - w * 0.28} y={y - 26} width={w * 0.42} height={8} fill="#efe6cf" />
    {[0, 1, 2, 3].map((k) => <line key={k} x1={x - w * 0.24 + k * 22} y1={y - 25} x2={x - w * 0.24 + k * 22} y2={y - 19} stroke="#2a2420" strokeWidth={3} />)}
    <rect x={x + w * 0.18} y={y - 34} width={70} height={14} rx={5} fill="#2a2a2e" />
    <ellipse cx={x + w * 0.18 + 26} cy={y - 30} rx={14} ry={4} fill="#0a0a0c" />
    <path d={`M${x + w * 0.36} ${y - 20} l0 -40 l60 0 l0 40`} stroke="#3a1e0c" strokeWidth={5} fill="none" />
    {[0, 1, 2].map((k) => <line key={k} x1={x + w * 0.36 + 14 + k * 16} y1={y - 60} x2={x + w * 0.36 + 14 + k * 16} y2={y - 22} stroke="#c8a060" strokeWidth={4} />)}
  </g>
);

/** 草席 */
export const Mat: React.FC<{x: number; y: number; w: number; h?: number; color?: string}> = ({x, y, w, h = 16, color = '#a8905a'}) => (
  <g>
    <path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2 + 20} ${y + h} L${x - w / 2 - 20} ${y + h} Z`} fill={color} stroke="#5a4a2a" strokeWidth={2} />
    {Array.from({length: Math.floor(w / 18)}, (_, i) => <line key={i} x1={x - w / 2 + i * 18} y1={y} x2={x - w / 2 - 20 + i * 18 * (1 + 40 / w)} y2={y + h} stroke="rgba(90,70,40,0.5)" strokeWidth={2} />)}
    <rect x={x - w / 2 - 20} y={y + h - 3} width={w + 40} height={4} fill="#6a1a14" />
  </g>
);

/** 雪花 */
export const Snow: React.FC<{f: number; x0: number; y0: number; w: number; h: number; n?: number; seed?: number}> = ({f, x0, y0, w, h, n = 60, seed = 5}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const sp = 0.8 + rand(seed + i) * 1.4;
      const yy = y0 + ((rand(seed * 3 + i) * h + f * sp * 2.2) % h);
      const xx = x0 + ((rand(seed * 7 + i) * w + Math.sin(f / 30 + i) * 14) % w);
      return <circle key={i} cx={xx} cy={yy} r={2 + rand(i + seed) * 3.5} fill="#f4f6fa" opacity={0.85} />;
    })}
  </g>
);

/** 光束 */
export const Rays: React.FC<{x: number; y: number; w: number; len: number; o?: number; ang?: number}> = ({x, y, w, len, o = 0.12, ang = 0}) => (
  <g transform={`rotate(${ang} ${x} ${y})`} opacity={o}>
    <path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w * 1.4} ${y + len} L${x - w * 0.6} ${y + len} Z`} fill="#ffe2a8" />
  </g>
);

/** 四周压暗 */
export const Vignette: React.FC<{k?: number}> = ({k = 0.55}) => (
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 72% 68% at 50% 52%, rgba(0,0,0,0) 55%, rgba(0,0,0,${k}) 100%)`, pointerEvents: 'none'}} />
);

/** 人名小牌 */
export const NameTag: React.FC<{x: number; y: number; text: string; size?: number; o?: number}> = ({x, y, text, size = 30, o = 1}) => (
  <g opacity={o}>
    <rect x={x - (text.length * size) / 2 - 12} y={y - size * 0.82} width={text.length * size + 24} height={size * 1.2} rx={6} fill="rgba(20,12,8,0.78)" stroke="#c99a3a" strokeWidth={2} />
    <text x={x} y={y + size * 0.12} textAnchor="middle" fontFamily={LF.label} fontWeight={900} fontSize={size} fill="#f2e2b8">
      {text}
    </text>
  </g>
);
