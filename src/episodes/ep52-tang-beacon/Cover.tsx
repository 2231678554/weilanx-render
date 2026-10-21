import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

const INK = '#1a0f08';
const YEL = '#FFD43B';
const BG = '#0b0a0e';
const F = '"Alibaba PuHuiTi 3.0", "Noto Sans SC", sans-serif';
const title: React.CSSProperties = {position: 'absolute', color: '#fff', lineHeight: 1.05, letterSpacing: 2, fontWeight: 900,
  paintOrder: 'stroke fill', WebkitTextStroke: `14px ${INK}`, textShadow: `0 10px 0 ${INK}, 0 0 40px rgba(0,0,0,.6)`};
const pill: React.CSSProperties = {position: 'absolute', background: YEL, color: INK, border: `5px solid ${INK}`, borderRadius: 60,
  padding: '8px 30px', transform: 'rotate(-6deg)', boxShadow: `6px 8px 0 ${INK}`, fontWeight: 900};
const bub: React.CSSProperties = {position: 'absolute', background: '#fff', color: INK, border: `6px solid ${INK}`, borderRadius: 30,
  padding: '16px 24px', lineHeight: 1.2, boxShadow: `8px 10px 0 ${INK}`, transform: 'rotate(4deg)', fontWeight: 900};
const bar: React.CSSProperties = {position: 'absolute', background: '#C8281E', color: '#fff', border: `6px solid ${INK}`,
  padding: '12px 28px', boxShadow: `8px 10px 0 ${INK}`, transform: 'rotate(-2deg)', fontWeight: 900};

type L = {mw: number | string; iw: number; il: number; it: number; mh: number; gx: string; gy: string; ts: number; bs: number; tx: number; ty: number;
  bubX: number; bubY: number; bubS: number; barX: number; barY: number; barS: number; arrow: string; head: string; ring: [number, number, number, number]};

const Cover: React.FC<{l: L}> = ({l}) => (
  <AbsoluteFill style={{background: BG, fontFamily: F, overflow: 'hidden'}}>
    <Img src={staticFile('images/lamplight/ep52-cover-bg.png')} style={{position: 'absolute', width: l.iw, left: l.il, top: l.it, WebkitMaskImage: 'linear-gradient(transparent, #000 18%)'}} />
    <div style={{position: 'absolute', left: 0, width: l.mw, top: 0, height: l.mh, background: `linear-gradient(${BG} 0, ${BG} 85%, rgba(11,10,14,0))`, WebkitMaskImage: 'linear-gradient(90deg, #000 80%, transparent)'}} />
    <AbsoluteFill style={{background: `radial-gradient(circle at ${l.gx} ${l.gy}, rgba(255,140,40,.28), rgba(0,0,0,0) 34%)`}} />
    <div style={{...pill, left: 56, top: 64, fontSize: 48}}>唐朝冷知识 🔥</div>
    <div style={{...title, left: l.tx, top: l.ty, fontSize: l.ts}}>没有敌人<br />也要每天<br />
      <span style={{color: YEL, fontSize: l.bs, display: 'inline-block', transform: 'rotate(-4deg)', transformOrigin: 'left center'}}>点火！</span></div>
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width="10" height="10">
      <path d={l.arrow} fill="none" stroke={YEL} strokeWidth={12} strokeLinecap="round" />
      <path d={l.head} fill="none" stroke={YEL} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={l.ring[0]} cy={l.ring[1]} rx={l.ring[2]} ry={l.ring[3]} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray="26 14"
        transform={`rotate(-8 ${l.ring[0]} ${l.ring[1]})`} />
    </svg>
    <div style={{...bub, left: l.bubX, top: l.bubY, fontSize: l.bubS}}>点错一把<br /><span style={{color: '#E03A2A'}}>坐牢三年</span>？</div>
    <div style={{...bar, left: l.barX, top: l.barY, fontSize: l.barS}}>这把火，叫<span style={{color: YEL}}>「平安火」</span></div>
  </AbsoluteFill>
);

// 3:4 1080x1440：底图 0.55 倍
export const Ep52Cover34: React.FC = () => <Cover l={{mw: 700, iw: 2112, il: -835, it: 330, mh: 680, gx: '46%', gy: '50%', ts: 136, bs: 210, tx: 60, ty: 190,
  bubX: 740, bubY: 760, bubS: 46, barX: 120, barY: 1310, barS: 58,
  arrow: '', head: '', ring: [482, 730, 80, 100]}} />;
// 4:3 1440x1080：底图 0.5 倍
export const Ep52Cover43: React.FC = () => <Cover l={{mw: '100%', iw: 1920, il: -120, it: 20, mh: 300, gx: '75%', gy: '42%', ts: 128, bs: 200, tx: 64, ty: 200,
  bubX: 1150, bubY: 560, bubS: 40, barX: 64, barY: 900, barS: 54,
  arrow: 'M640 640 C 760 520, 880 470, 1000 410', head: 'M958 394 L1002 408 L984 452', ring: [1080, 380, 72, 90]}} />;
