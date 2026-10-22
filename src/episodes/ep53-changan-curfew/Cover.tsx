import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LOOK, Torch, Who} from './Kit';
import {runPose, standPose, Stick} from './Rig';
import {FarTower, Road, Sky, WardGate, WardWall} from './Sets';

const INK = '#1a0f08';
const YEL = '#FFD43B';
const BG = '#0b0a0e';
const F = '"Alibaba PuHuiTi 3.0", "Noto Sans SC", sans-serif';
const title: React.CSSProperties = {position: 'absolute', color: '#fff', lineHeight: 1.05, letterSpacing: 2, fontWeight: 900,
  paintOrder: 'stroke fill', WebkitTextStroke: `14px ${INK}`, textShadow: `0 10px 0 ${INK}, 0 0 40px rgba(0,0,0,.6)`};
const pill: React.CSSProperties = {position: 'absolute', background: YEL, color: INK, border: `5px solid ${INK}`, borderRadius: 60,
  padding: '8px 30px', transform: 'rotate(-6deg)', boxShadow: `6px 8px 0 ${INK}`, fontWeight: 900};
const bub: React.CSSProperties = {position: 'absolute', background: '#fff', color: INK, border: `6px solid ${INK}`, borderRadius: 30,
  padding: '14px 26px', lineHeight: 1.2, boxShadow: `8px 10px 0 ${INK}`, transform: 'rotate(4deg)', fontWeight: 900, whiteSpace: 'nowrap'};
const bar: React.CSSProperties = {position: 'absolute', background: '#C8281E', color: '#fff', border: `6px solid ${INK}`,
  padding: '12px 28px', boxShadow: `8px 10px 0 ${INK}`, transform: 'rotate(-2deg)', fontWeight: 900, whiteSpace: 'nowrap'};

const G = 990;
/** 主视觉（1920×1080 坐标）：夜街，右坊门只剩一条缝、坊正在里头顶门；白袍「你」扑向门缝；武侯举火把攥笞追来；远处鼓楼「咚」；一弯月 */
const Scene: React.FC = () => {
  const yp = runPose(1180, G, 0.35, 0.95, 1);
  const gp = runPose(720, G, 0.15, 0.8, 1);
  const fp = standPose(1575, G, 0.82, -1);
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <Sky f={0} mode="night" id="c53" stars />
      <defs><radialGradient id="mg"><stop offset="0.3" stopColor="rgba(255,236,190,0.22)" /><stop offset="1" stopColor="rgba(255,236,190,0)" /></radialGradient></defs>
      <circle cx={1330} cy={200} r={170} fill="url(#mg)" />
      <path d="M1360 140 A70 70 0 1 0 1390 250 A58 58 0 1 1 1360 140 Z" fill="#f4e6c4" />
      <defs><radialGradient id="tg"><stop offset="0" stopColor="rgba(255,170,70,0.45)" /><stop offset="1" stopColor="rgba(255,170,70,0)" /></radialGradient></defs>
      <circle cx={900} cy={470} r={260} fill="url(#tg)" />
      <FarTower x={900} y={600} s={1.4} glow={1} color="#1a120c" />
      <text x={800} y={340} fontSize={120} fontWeight={900} fill={YEL} stroke={INK} strokeWidth={10} paintOrder="stroke" transform="rotate(-12 800 340)" fontFamily={F}>咚</text>
      <text x={1010} y={260} fontSize={80} fontWeight={900} fill={YEL} stroke={INK} strokeWidth={8} paintOrder="stroke" transform="rotate(10 1010 260)" fontFamily={F} opacity={0.85}>咚</text>
      <WardWall x0={0} x1={1920} top={600} bottom={G} />
      <rect x={1350} y={G - 500} width={460} height={500} fill="rgba(255,190,100,0.8)" />
      {/* 坊正在门缝里顶门（画在门扇后面，只从缝里露出来） */}
      <Who look={LOOK.fang} pose={{...fp, neck: [fp.neck[0] + 20, fp.neck[1] + 10], handN: [1540, fp.neck[1] + 50], handF: [1545, fp.neck[1] + 100]}} s={0.82} more={{face: 'shout', mouth: 0.7}} />
      <WardGate x={1580} bottom={G} w={460} h={500} open={0.2} inside="rgba(0,0,0,0)" />
      <Road />
      {/* 武侯追来 */}
      <Who look={{...LOOK.guard, sword: true}} pose={{...gp, handN: [gp.neck[0] + 70, gp.neck[1] - 60], handF: [gp.neck[0] - 60, gp.neck[1] + 60]}} s={0.78} more={{face: 'shout', mouth: 0.8}}>
        <Stick from={[gp.neck[0] + 70, gp.neck[1] - 50]} to={[gp.neck[0] + 78, gp.neck[1] - 190]} w={12} color="#4a2a1a" />
        <Torch f={3} x={gp.neck[0] + 78} y={gp.neck[1] - 190} s={1.3} />
        <Stick from={[gp.neck[0] - 60, gp.neck[1] + 60]} to={[gp.neck[0] - 170, gp.neck[1] - 40]} w={9} color="#8a6a3a" />
      </Who>
      {/* 你：扑向门缝，正脸惊恐 */}
      <Who look={LOOK.you} pose={{...yp, handN: [yp.neck[0] + 190, yp.neck[1] - 30], handF: [yp.neck[0] - 150, yp.neck[1] + 30]}} s={0.95} more={{front: true, face: 'shock', mouth: 0.9, openHands: true}} />
    </svg>
  );
};

type L = {sx: number; sl: number; st: number; mh?: number};
const Count: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <div style={{...title, left: x, top: y, fontSize: s, WebkitTextStroke: `10px ${INK}`, color: '#fff', whiteSpace: 'nowrap'}}><span style={{color: YEL}}>900</span> / 1000 下</div>
);

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
export const Ep53Cover34: React.FC = () => (
  <Stage l={{sx: 0.85, sl: -476, st: 520, mh: 600}}>
    <div style={{...pill, left: 56, top: 60, fontSize: 48}}>唐朝冷知识 🥁</div>
    <div style={{...title, left: 60, top: 160, fontSize: 190}}>长安宵禁</div>
    <div style={{...title, left: 64, top: 380, fontSize: 104}}>鼓敲到<span style={{color: YEL, fontSize: 130}}>第900下</span></div>
    <div style={{...bub, left: 590, top: 830, fontSize: 52}}>还有三条街！</div>
    <div style={{...bar, left: 50, top: 1220, fontSize: 56}}>没进坊门，当街抽二十下</div>
    <Count x={650} y={1340} s={56} />
  </Stage>
);

// 4:3 1440×1080：人物在右 2/3，字竖排在左
const vt: React.CSSProperties = {writingMode: 'vertical-rl', textOrientation: 'upright'};
export const Ep53Cover43: React.FC = () => (
  <Stage l={{sx: 0.77, sl: 49, st: 230, mh: 340}}>
    <AbsoluteFill style={{background: `linear-gradient(90deg, ${BG} 0, ${BG} 22%, rgba(11,10,14,0) 40%)`}} />
    <div style={{...pill, left: 40, top: 46, fontSize: 42}}>唐朝冷知识 🥁</div>
    <div style={{...title, ...vt, left: 200, top: 150, fontSize: 170, letterSpacing: 6}}>长安宵禁</div>
    <div style={{...title, ...vt, left: 50, top: 170, fontSize: 96}}>鼓敲到<span style={{color: YEL, fontSize: 112}}>第<span style={{textCombineUpright: 'all'}}>900</span>下</span></div>
    <div style={{...bub, left: 900, top: 470, fontSize: 48}}>还有三条街！</div>
    <div style={{...bar, left: 520, top: 950, fontSize: 52}}>没进坊门，当街抽二十下</div>
    <Count x={1010} y={60} s={54} />
  </Stage>
);
