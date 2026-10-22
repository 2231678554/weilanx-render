import React from 'react';
import {AbsoluteFill} from 'remotion';
import {headOf} from '../ep53-changan-curfew/Kit';
import {P, Rig} from '../ep53-changan-curfew/Rig';
import {Tomb} from './Opening';
import {DragonBoat, LOOK54, Mustache, Pot, YG_S, yangOnBoat} from './Props';

const INK = '#1a0f08';
const YEL = '#FFD43B';
const BG = '#0b0a0e';
const F = '"Alibaba PuHuiTi 3.0", "Noto Sans SC", sans-serif';
const title: React.CSSProperties = {position: 'absolute', color: '#fff', lineHeight: 1.05, letterSpacing: 2, fontWeight: 900,
  paintOrder: 'stroke fill', WebkitTextStroke: `14px ${INK}`, textShadow: `0 10px 0 ${INK}, 0 0 40px rgba(0,0,0,.6)`, whiteSpace: 'nowrap'};
const pill: React.CSSProperties = {position: 'absolute', background: YEL, color: INK, border: `5px solid ${INK}`, borderRadius: 60,
  padding: '8px 30px', transform: 'rotate(-6deg)', boxShadow: `6px 8px 0 ${INK}`, fontWeight: 900};
const bub: React.CSSProperties = {position: 'absolute', background: '#fff', color: INK, border: `6px solid ${INK}`, borderRadius: 30,
  padding: '14px 26px', lineHeight: 1.2, boxShadow: `8px 10px 0 ${INK}`, transform: 'rotate(4deg)', fontWeight: 900, whiteSpace: 'nowrap'};
const bar: React.CSSProperties = {position: 'absolute', background: '#C8281E', color: '#fff', border: `6px solid ${INK}`,
  padding: '12px 28px', boxShadow: `8px 10px 0 ${INK}`, transform: 'rotate(-2deg)', fontWeight: 900, whiteSpace: 'nowrap'};

/* 示意运河（画面坐标）：涿郡 → 永济渠 → 洛阳 → 通济渠 → 江都 → 江南河 → 余杭 */
const ZHUO: P = [1540, 150];
const LUO: P = [1130, 520];
const JD: P = [1660, 690];
const YH: P = [1700, 900];
const CANAL = `M${ZHUO[0]} ${ZHUO[1]} C1500 260 1380 330 1300 420 C1240 470 1180 490 ${LUO[0]} ${LUO[1]} C1300 540 1480 600 ${JD[0]} ${JD[1]} C1700 760 1730 820 ${YH[0]} ${YH[1]}`;

const Scene: React.FC = () => {
  const y = yangOnBoat(0, 0);
  const head = headOf(y.p.hip, y.p.neck, YG_S);
  const point: P = [y.p.neck[0] + 150 * YG_S, y.p.neck[1] - 170 * YG_S];
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
      {/* 左：墓志特写，「隨故煬帝墓誌」发光 */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'translate(480px, 560px) scale(2.3) translate(-480px, -905px)', transformOrigin: '0 0'}}>
          <Tomb f={0} lit={() => 1} halo={false} />
        </div>
      </div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id="cv54" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(40,26,14,0)" />
            <stop offset="0.12" stopColor="#2e1e10" />
            <stop offset="1" stopColor="#3a2614" />
          </linearGradient>
          <filter id="cvg"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        <rect x={820} y={0} width={1100} height={1080} fill="url(#cv54)" />
        {/* 黄河、长江 */}
        <path d="M900 430 C1040 380 1120 470 1230 450 C1380 420 1460 440 1600 380 C1680 350 1760 380 1920 340" stroke="#4a8ab0" strokeWidth={10} fill="none" opacity={0.7} />
        <path d="M900 760 C1100 720 1300 780 1480 720 C1600 690 1700 700 1920 680" stroke="#4a8ab0" strokeWidth={12} fill="none" opacity={0.7} />
        {/* 金色运河 */}
        <path d={CANAL} stroke="#ffc850" strokeWidth={40} fill="none" opacity={0.6} filter="url(#cvg)" />
        <path d={CANAL} stroke="#ffe08a" strokeWidth={14} fill="none" strokeLinecap="round" />
        {([[ZHUO, '涿郡'], [LUO, '洛阳'], [JD, '江都'], [YH, '余杭']] as [P, string][]).map(([p, n]) => (
          <g key={n}>
            <circle cx={p[0]} cy={p[1]} r={16} fill="#fff4c8" stroke={INK} strokeWidth={5} />
            <text x={p[0] + 28} y={p[1] + 16} fontFamily={F} fontWeight={900} fontSize={46} fill="#fff4d8" stroke={INK} strokeWidth={8} paintOrder="stroke">{n}</text>
          </g>
        ))}
        {/* 龙舟：杨广头扣黑锅，手指北头的涿郡 */}
        <g transform="translate(1290 1010) scale(0.5)">
          <DragonBoat f={0}>
            <Rig {...(LOOK54.yangEmp as object)} {...y.p} handN={point} handF={y.handF} s={YG_S} face="shout" headTilt={-8} elbowBend={-1} />
            <Mustache h={head} s={YG_S} facing={1} />
            <Pot at={[head[0], head[1] - 34 * YG_S]} w={150 * YG_S * 2.2} rot={-8} />
          </DragonBoat>
        </g>
      </svg>
    </div>
  );
};

type L = {sx: number; sl: number; st: number; mh?: number};
const Stage: React.FC<{l: L; children: React.ReactNode}> = ({l, children}) => (
  <AbsoluteFill style={{background: BG, fontFamily: F, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: l.sl, top: l.st, width: 1920, height: 1080, transform: `scale(${l.sx})`, transformOrigin: '0 0'}}>
      <Scene />
    </div>
    {l.mh && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: l.mh, background: `linear-gradient(${BG} 0, ${BG} 70%, rgba(11,10,14,0))`}} />}
    {children}
  </AbsoluteFill>
);

// 3:4 1080×1440：字在上，画在下
export const Ep54Cover34: React.FC = () => (
  <Stage l={{sx: 0.8, sl: -470, st: 560, mh: 640}}>
    <div style={{...pill, left: 56, top: 60, fontSize: 48}}>隋朝冷知识</div>
    <div style={{...title, left: 50, top: 170, fontSize: 150}}>背了<span style={{color: YEL}}>千年黑锅</span></div>
    <div style={{...title, left: 56, top: 370, fontSize: 80, WebkitTextStroke: `10px ${INK}`}}>杨广修运河，真为下江南？</div>
    <div style={{...bub, left: 600, top: 700, fontSize: 50}}>看看河通到哪儿！</div>
    <div style={{...bar, left: 40, top: 1300, fontSize: 52}}>每月征调两百万人修洛阳</div>
  </Stage>
);

// 4:3 1440×1080：左字右画
export const Ep54Cover43: React.FC = () => (
  <Stage l={{sx: 0.78, sl: -60, st: 260, mh: 330}}>
    <div style={{...pill, left: 40, top: 40, fontSize: 42}}>隋朝冷知识</div>
    <div style={{...title, left: 40, top: 120, fontSize: 140}}>背了<span style={{color: YEL}}>千年黑锅</span></div>
    <div style={{...title, left: 830, top: 46, fontSize: 0}} />
    <div style={{...title, left: 44, top: 290, fontSize: 70, WebkitTextStroke: `9px ${INK}`}}>杨广修运河，真为下江南？</div>
    <div style={{...bub, left: 900, top: 500, fontSize: 46}}>看看河通到哪儿！</div>
    <div style={{...bar, left: 40, top: 960, fontSize: 50}}>每月征调两百万人修洛阳</div>
  </Stage>
);
