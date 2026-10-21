import React from 'react';
import {clamp01, easeIn, easeInOut, easeOut, rand} from '../../library/anim';
import {Drum, NameTag} from '../../library/lamplight/props';
import {L, LF} from '../../library/lamplight/theme';
import {Drummer, DongWords, RoutePlan} from './Ep53Curfew';
import {Bread, Bubble, CROWD, Ctx, Cup, G, headOf, Look, LOOK, Mansion, Rot, Svg, Sweat, Torch, Who} from './Kit';
import {PunishScene} from './PunishScene';
import {kneelPose, P, ridePose, runPose, standPose, Stick, stoolPose, walkPose} from './Rig';
import {Banquet, HemScene, PLAN_T, planXY} from './StoryA';
import {Bakery, CityPlan, cellXY, FoxTail, Grass, Hall, Lamp, LowTable, Mount, mountBack, Road, Sky, SkyMode, Street, WardGate, WardWall} from './Sets';
import {fbt, SPANK_BEATS} from './timeline';

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lp = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

/** 骑着坐骑的人：坐骑 + 人（ridePose） */
const Rider: React.FC<{f: number; x: number; s?: number; rs?: number; kind?: 'donkey' | 'horse'; look: Look; facing?: 1 | -1; walk?: number; more?: Look; hands?: Partial<{handN: P; handF: P}>; neck?: P; color?: string; grin?: boolean; lookBack?: boolean; y?: number}> = ({f, x, s = 0.72, rs = 0.6, kind = 'donkey', look, facing = 1, walk = 0, more, hands, neck, color, grin, lookBack, y = G}) => {
  const back = mountBack(x, y, s, kind);
  const rp = ridePose(back, rs, facing, walk ? Math.sin(f / 4) * 3 : 0);
  return (
    <g>
      <Mount f={f} x={x} y={y} s={s} kind={kind} facing={facing} walk={walk} color={color} grin={grin} lookBack={lookBack} />
      <Who look={look} pose={{...rp, ...hands, ...(neck ? {neck} : {})}} s={rs} more={more} />
    </g>
  );
};
const zhengBack = (x: number, s = 0.72) => ridePose(mountBack(x, G, s, 'donkey'), 0.6, 1);

const S32: React.FC<Ctx> = ({t, L: Ln}) => (
  <>
    <Svg>
      <Street f={t} id="s32" mode="dawn" moon={false} />
      <Rider f={t} x={980} look={LOOK.zheng} more={{face: 'calm'}} />
    </Svg>
    <NameTag f={t} at={Ln[1] + 2} x={1360} y={440} small="《任氏传》男主角，穷，骑一头灰驴" name="郑六" w={440} />
  </>
);

const S33: React.FC<Ctx> = ({t}) => {
  const wb = ridePose(mountBack(1240, G, 0.78, 'horse'), 0.6, 1, Math.sin(t / 4) * 3);
  const hd = headOf(wb.hip, wb.neck, 0.6);
  const drink = Math.sin(t / 10) > 0;
  return (
    <Svg>
      <Street f={t} id="s33" mode="dusk" scroll={t * 5} moon={false} />
      <rect width={1920} height={1080} fill="rgba(255,140,60,0.12)" />
      <Rider f={t} x={720} look={LOOK.zheng} walk={1} more={{face: 'laugh'}} />
      <Mount f={t} x={1240} y={G} s={0.78} kind="horse" walk={1} />
      <Who look={LOOK.wei} pose={{...wb, handN: drink ? ([hd[0] + 26, hd[1] + 24] as P) : wb.handN}} s={0.6} more={{face: 'laugh'}}>
        {drink && <Cup x={hd[0] + 30} y={hd[1] + 14} />}
      </Who>
    </Svg>
  );
};

const S34: React.FC<Ctx> = ({t, L: Ln}) => {
  const go = clamp01((t - Ln[1] - 6) / 40);
  const wx = 1180 + go * 1000;
  const zb = zhengBack(640);
  const hd = headOf(zb.hip, zb.neck, 0.6);
  return (
    <Svg>
      <Street f={t} id="s34" mode="dusk" moon={false} />
      <rect width={1920} height={1080} fill="rgba(255,140,60,0.12)" />
      <path d="M760 990 L620 1080 L1040 1080 L900 990 Z" fill="#2a2016" />
      <text x={830} y={1060} textAnchor="middle" fontFamily={LF.label} fontSize={30} fill={L.inkDim}>↓ 南</text>
      <Rider f={t} x={640} look={LOOK.zheng} more={{face: 'smile', front: t < Ln[1]}} hands={{handN: t < Ln[1] ? ([hd[0] + 60 + 20 * Math.sin(t / 3), hd[1] - 40] as P) : ([zb.hip[0] + 100, zb.hip[1] + 60] as P)}} />
      <Rider f={t} x={wx} kind="horse" s={0.78} look={LOOK.wei} walk={go > 0 ? 1 : 0} more={{face: 'smile'}} hands={go < 0.2 ? {handN: [wx - 40, mountBack(wx, G, 0.78, 'horse')[1] - 220]} : undefined} />
    </Svg>
  );
};

const S35: React.FC<Ctx> = ({t, L: Ln}) => {
  const start = planXY(3, 9);
  const xin = planXY(4, 11), sheng = planXY(5, 8);
  const p1 = clamp01((t - 4) / 24), p2 = clamp01((t - Ln[1]) / 24);
  const mid: P = [start[0], sheng[1] - 50];
  const a = lp(start, [xin[0], start[1]], p1);
  const b = p2 < 0.5 ? lp([start[0] - 20, start[1]], [mid[0] - 20, mid[1]], p2 * 2) : lp([mid[0] - 20, mid[1]], [sheng[0], sheng[1] - 30], (p2 - 0.5) * 2);
  return (
    <Svg>
      <rect width={1920} height={1080} fill="#0d0a08" />
      <g transform={PLAN_T}>
        <CityPlan f={t} cell={(r, c) => (r === 4 && c === 11 ? {fill: '#3a3020'} : r === 5 && c === 8 ? {fill: '#4a3a1a', stroke: L.gold} : {glow: 0.2})} />
      </g>
      <text x={xin[0]} y={xin[1] + 70} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={36} fill={L.ink} stroke="#000" strokeWidth={5} paintOrder="stroke">新昌坊</text>
      <text x={sheng[0]} y={sheng[1] + 70} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={36} fill={L.gold} stroke="#000" strokeWidth={5} paintOrder="stroke">升平坊</text>
      <circle cx={a[0]} cy={a[1]} r={20} fill="#f4f0e8" stroke="#000" strokeWidth={3} />
      <text x={a[0]} y={a[1] - 30} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={32} fill="#f4f0e8">韦</text>
      {t >= Ln[1] - 4 && (
        <g>
          <circle cx={b[0]} cy={b[1]} r={20} fill="#8a7a68" stroke="#000" strokeWidth={3} />
          <text x={b[0] - 34} y={b[1] + 10} textAnchor="end" fontFamily={LF.serif} fontWeight={900} fontSize={32} fill={L.gold}>郑</text>
        </g>
      )}
    </Svg>
  );
};

/** 三个女子（中间白衣任氏）：x 是任氏，faceR 任氏表情 */
const Three: React.FC<{t: number; x: number; facing?: 1 | -1; walk?: boolean; faceR?: 'calm' | 'smile' | 'laugh'; friends?: 'smile' | 'laugh'; s?: number; renPose?: Partial<ReturnType<typeof standPose>>; clap?: boolean; glow?: number}> = ({t, x, facing = -1, walk, faceR = 'calm', friends = 'smile', s = 0.68, renPose, clap, glow = 1}) => {
  const pose = (xx: number, ph: number) => (walk ? walkPose(xx, G, t / 22 + ph, s, facing) : standPose(xx, G, s, facing));
  const fr = (xx: number, look: Look, ph: number) => {
    const p = pose(xx, ph);
    const hd = headOf(p.hip, p.neck, s);
    const c = clap ? Math.abs(Math.sin(t / 2.5)) * 30 : 0;
    return <Who look={look} pose={clap ? {...p, handN: [hd[0] + facing * 60 + c, hd[1] + 140] as P, handF: [hd[0] + facing * 60 - c, hd[1] + 140] as P} : p} s={s} more={{face: friends}} />;
  };
  return (
    <g>
      {fr(x + 180, LOOK.girlP, 0.3)}
      <circle cx={x} cy={G - 260 * s} r={260 * s} fill="rgba(255,250,235,0.18)" opacity={glow} />
      <Who look={LOOK.ren} pose={{...pose(x, 0), ...renPose}} s={s} more={{face: faceR}} />
      {fr(x - 170, LOOK.girlB, 0.6)}
    </g>
  );
};
const lane = (t: number, id: string, mode: SkyMode = 'dusk') => <Street f={t} id={id} mode={mode} moon={false} wallTop={600} />;

const S36: React.FC<Ctx> = ({t, d}) => {
  const z = lerp(1, 1.12, clamp01(t / d));
  return (
    <Svg>
      <g transform={`translate(1200 900) scale(${z}) translate(-1200 -900)`}>
        {lane(t, 's36')}
        <Three t={t} x={1500 - t * 1.8} walk />
      </g>
    </Svg>
  );
};

const S37: React.FC<Ctx> = ({t, hit}) => {
  const cx = 1060;
  const a = ((t - 4) / 60) * Math.PI * 2;
  const mx = cx + 600 * Math.sin(a);
  const front = Math.cos(a) > 0;
  const fc: 1 | -1 = Math.cos(a) >= 0 ? 1 : -1;
  const sc = front ? 0.74 : 0.62;
  const y = front ? G + 20 : G - 30;
  const talk = Math.floor(t / 10) % 2 === 0;
  const rider = (
    <Rider f={t} x={mx} y={y} s={sc} rs={sc * 0.82} facing={fc} walk={1} look={LOOK.zheng} more={{face: talk ? 'shout' : 'shock', mouth: talk ? 0.7 : 0.2}} />
  );
  return (
    <Svg>
      {lane(t, 's37')}
      {!front && rider}
      <Three t={t} x={cx} walk={false} faceR="smile" glow={1} />
      {front && rider}
      {t > hit - 4 && Array.from({length: 3}, (_, i) => <text key={i} x={mx - fc * (80 + i * 50)} y={G - 30 - ((t + i * 7) % 20)} fontFamily={LF.serif} fontWeight={900} fontSize={34} fill={L.gold} opacity={0.7}>嘚</text>)}
    </Svg>
  );
};

const S38: React.FC<Ctx> = ({t}) => {
  const rs = standPose(1240, G, 0.7, -1);
  const hd = headOf(rs.hip, rs.neck, 0.7);
  const slip = clamp01((t - 30) / 16);
  const zb = zhengBack(460);
  return (
    <Svg>
      {lane(t, 's38')}
      <Rider f={t} x={460} look={LOOK.zheng} neck={[zb.neck[0] - 60 * slip, zb.neck[1] + 30 * slip]} more={{face: 'shock', mouth: 0.6, headTilt: -20 * slip, openHands: slip > 0}} hands={slip > 0 ? {handN: [zb.hip[0] + 120, zb.hip[1] - 120], handF: [zb.hip[0] - 80, zb.hip[1] - 100]} : undefined} />
      <Three t={t} x={1240} faceR="laugh" renPose={{handN: [hd[0] - 34, hd[1] + 24]}} />
    </Svg>
  );
};

const S39: React.FC<Ctx> = ({t}) => {
  const zb = zhengBack(700);
  const hd = headOf(zb.hip, zb.neck, 0.6);
  const bow = 0.5 + 0.5 * Math.sin(t / 8);
  const hand: P = [hd[0] + 70, hd[1] + 70 + 10 * bow];
  return (
    <Svg>
      {lane(t, 's39')}
      <Rider f={t} x={700} look={LOOK.zheng} neck={[zb.neck[0] + 14 * bow, zb.neck[1] + 6 * bow]} hands={{handN: hand, handF: [hand[0] - 6, hand[1] + 8]}} more={{face: 'calm', headTilt: 6 * bow}} />
      <Sweat x={hd[0] - 30} y={hd[1] - 50} s={1.3} />
      <Three t={t} x={1340} faceR="calm" />
    </Svg>
  );
};

const S40: React.FC<Ctx> = ({t}) => {
  const rs = standPose(1240, G, 0.7, -1);
  const hd = headOf(rs.hip, rs.neck, 0.7);
  return (
    <Svg>
      {lane(t, 's40')}
      <Rider f={t} x={700} look={LOOK.zheng} more={{face: 'shock', mouth: 0.4}} />
      <Three t={t} x={1240} faceR="laugh" friends="laugh" renPose={{handN: [hd[0] - 30, hd[1] + 26]}} />
      <text x={1010} y={700} fontFamily={LF.serif} fontWeight={900} fontSize={40} fill={L.gold} opacity={Math.sin(t / 6) > 0 ? 0.8 : 0}>（瞟）</text>
    </Svg>
  );
};

const S41: React.FC<Ctx> = ({t, L: Ln}) => {
  const jump = clamp01((t - 4) / 10);
  const x = 900;
  const sp = standPose(x, G, 0.72, 1);
  const hd = headOf(sp.hip, sp.neck, 0.72);
  const hands: P = [x + 120, sp.hip[1] - 10];
  const snort = t > Ln[1] + 4 ? clamp01((t - Ln[1] - 4) / 12) : 0;
  return (
    <Svg>
      {lane(t, 's41')}
      <Mount f={t} x={540} y={G} s={0.72} kind="donkey" />
      {jump < 1 ? (
        <Who look={LOOK.zheng} pose={{...zhengBack(540), hip: lp(zhengBack(540).hip, sp.hip, jump), neck: lp(zhengBack(540).neck, sp.neck, jump)}} s={0.6} />
      ) : (
        <>
          <line x1={540 + 190} y1={G - 250} x2={hands[0]} y2={hands[1]} stroke="#3a2a1a" strokeWidth={5} />
          <Who look={LOOK.zheng} pose={{...sp, neck: [sp.neck[0] + 50, sp.neck[1] + 30], handN: hands, handF: [hands[0] - 10, hands[1] + 8]}} s={0.72} more={{face: 'smile', headTilt: 14}} />
        </>
      )}
      {snort > 0 && snort < 1 && [0, 1].map((i) => <circle key={i} cx={540 + 220 + 60 * snort + i * 20} cy={G - 220 + i * 10} r={12 + 20 * snort} fill="rgba(240,240,240,0.5)" opacity={1 - snort} />)}
      <Three t={t} x={1400} faceR="smile" />
      {hd[0] < 0 && null}
    </Svg>
  );
};

const S42: React.FC<Ctx> = ({t}) => {
  const k = Math.abs(Math.sin(t / 4));
  const sp = standPose(860, G, 0.72, 1);
  return (
    <Svg>
      {lane(t, 's42')}
      <Mount f={t} x={500} y={G} s={0.72} kind="donkey" grin />
      <Who look={LOOK.zheng} pose={{...sp, neck: [sp.neck[0] - 40, sp.neck[1] + 4], handN: [860 + 40, sp.hip[1] - 10], handF: [860 - 30, sp.hip[1] - 40]}} s={0.72} more={{face: 'laugh', mouth: 0.6 + 0.4 * k, headTilt: -24}} />
      <Three t={t} x={1240} faceR="laugh" friends="laugh" clap renPose={{neck: [1240 - 50, G - 226 * 0.68 - 170 * 0.68], handN: [1240 - 60, G - 226 * 0.68 + 10]}} />
    </Svg>
  );
};

const S43: React.FC<Ctx> = ({t, d}) => {
  const k = clamp01(t / d);
  const x = 520 + t * 3;
  return (
    <>
      <Svg>
        <Sky f={t} mode="dusk" to="night" t={k} id="s43" moon={undefined} />
        <path d="M0 760 Q500 560 1000 620 Q1400 660 1920 560 L1920 1080 L0 1080 Z" fill="#1a1410" />
        <text x={1500} y={650} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={44} fill="rgba(239,230,214,0.5)">乐游原</text>
        <Road />
        <line x1={x + 170} y1={G - 230} x2={x + 330} y2={G - 226 * 0.7 + 20} stroke="#3a2a1a" strokeWidth={5} />
        <Rider f={t} x={x} look={LOOK.ren} walk={1} more={{face: 'smile'}} />
        <Who look={LOOK.zheng} pose={{...walkPose(x + 380, G, t / 18, 0.7, 1), handF: [x + 330, G - 226 * 0.7 + 20] as P}} s={0.7} more={{face: 'smile'}} />
        <rect width={1920} height={1080} fill={`rgba(0,0,20,${0.35 * k})`} />
      </Svg>
      <div style={{position: 'absolute', right: 70, bottom: 60, fontFamily: LF.serif, fontWeight: 900, fontSize: 56, color: L.inkDim}}>第 {Math.round(1 + 999 * clamp01((t - d * 0.3) / (d * 0.7)) ** 2)} 下</div>
    </>
  );
};

const S44: React.FC<Ctx> = ({t}) => {
  const [cx, cy] = planXY(5, 8);
  return (
    <Svg>
      <rect width={1920} height={1080} fill="#050403" />
      <g transform={PLAN_T}>
        <CityPlan f={t} cell={(r, c) => (r === 5 && c === 8 ? {fill: '#5a4020', glow: 1.4, stroke: L.gold} : {fill: '#120d0a', glow: 0.15})} />
      </g>
      {[0, 1].map((i) => <circle key={i} cx={cx - 20 + i * 18 + 8 * Math.sin(t / 10)} cy={cy + 4} r={7} fill={i ? '#f4f0e8' : '#8a6a4a'} />)}
      {Array.from({length: 5}, (_, i) => {
        const p = ((t * 0.006 + i * 0.21) % 1);
        const horiz = i % 2 === 0;
        const x = horiz ? 800 + p * 1000 : planXY(0, 2 + i * 2)[0] + 44;
        const y = horiz ? planXY(i, 0)[1] + 28 : 420 + p * 640;
        return <g key={i}><circle cx={x} cy={y} r={20} fill="rgba(255,140,50,0.35)" /><circle cx={x} cy={y} r={7} fill="#ff9a3a" /></g>;
      })}
      <text x={cx} y={cy + 76} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={36} fill={L.gold} stroke="#000" strokeWidth={5} paintOrder="stroke">坊墙里</text>
    </Svg>
  );
};

const S45: React.FC<Ctx> = ({t, d}) => {
  const z = lerp(1.08, 1, clamp01(t / d));
  return (
    <Svg>
      <g transform={`translate(960 1080) scale(${z}) translate(-960 -1080)`}>
        <Sky f={t} mode="night" id="s45" moon={[1700, 160]} />
        <Mansion f={t} />
        <Road />
        <Who look={LOOK.zheng} pose={standPose(380, G, 0.56, 1)} s={0.56} more={{face: 'shock', headTilt: -14}} />
      </g>
    </Svg>
  );
};

const S46: React.FC<Ctx> = ({t, L: Ln}) => {
  const ms = standPose(1300, G, 0.6, -1);
  const zp = standPose(760, G, 0.72, 1);
  const zh = headOf(zp.hip, zp.neck, 0.72);
  const bow = t > Ln[1] ? 1 : 0;
  return (
    <Svg>
      <Sky f={t} mode="night" id="s46" />
      <WardWall x0={0} x1={1920} top={520} bottom={G} color="#7a5a3a" />
      <WardGate x={1120} bottom={G} w={420} h={400} open={0.5} />
      <Road />
      <Who look={LOOK.maid} pose={{...ms, neck: [ms.neck[0] - 20 * bow, ms.neck[1] + 10 * bow], handF: [1360, ms.hip[1] + 20]}} s={0.6} more={{face: 'smile'}}>
        <Lamp f={t} x={1360} y={ms.hip[1] + 20} s={0.6} />
      </Who>
      <Who look={LOOK.zheng} pose={{...zp, neck: [zp.neck[0] + 20, zp.neck[1] + 10], handN: [zh[0] + 70, zh[1] + 90], handF: [zh[0] + 62, zh[1] + 98]}} s={0.72} more={{face: 'smile'}} />
    </Svg>
  );
};

const S47: React.FC<Ctx> = ({t, d, L: Ln}) => {
  const burn = clamp01(t / d);
  const toast = Math.sin(t / 14) > 0.3;
  const zp = kneelPose(720, 960, 0.72, 1);
  const rp = kneelPose(1200, 960, 0.72, -1);
  const zh = headOf(zp.hip, zp.neck, 0.72), rh = headOf(rp.hip, rp.neck, 0.72);
  const ren = clamp01((t - Ln[1]) / 10);
  return (
    <Svg>
      <Hall f={t} kind="house" floor={820} />
      {Array.from({length: 8}, (_, i) => <Candle2 key={i} f={t} x={200 + i * 217} burn={burn} i={i} />)}
      <Who look={LOOK.zheng} pose={{...zp, handN: toast ? ([zh[0] + 70, zh[1] + 20] as P) : zp.handN}} s={0.72} more={{face: 'laugh', blush: 0.5}}>
        {toast && <Cup x={zh[0] + 76} y={zh[1] + 6} />}
      </Who>
      {ren > 0 && (
        <Who look={LOOK.renF} pose={{...rp, handN: toast ? ([rh[0] - 70, rh[1] + 20] as P) : rp.handN}} s={0.72} more={{face: 'smile', opacity: ren}}>
          {toast && <Cup x={rh[0] - 76} y={rh[1] + 6} />}
        </Who>
      )}
      <LowTable x={960} y={1000} w={360} />
    </Svg>
  );
};
const Candle2: React.FC<{f: number; x: number; burn: number; i: number}> = ({f, x, burn, i}) => {
  const h = 110 * (1 - 0.8 * burn);
  return (
    <g>
      <rect x={x - 5} y={700} width={10} height={140} fill="#6a4a2a" />
      <circle cx={x} cy={700 - h - 16} r={70} fill="rgba(255,190,100,0.16)" />
      <rect x={x - 9} y={700 - h} width={18} height={h} fill="#e9dcc0" />
      <path d={`M${x - 7} ${700 - h} Q${x + 3 * Math.sin(f / 3 + i)} ${660 - h} ${x + 7} ${700 - h} Z`} fill="#ffb347" />
    </g>
  );
};

const S48: React.FC<Ctx> = ({t}) => {
  const push = clamp01(t / 60);
  const zx = 980 + push * 380;
  const zp = walkPose(zx, G, t / 20, 0.72, 1);
  const rx = zx - 150;
  const rp = standPose(rx, G, 0.7, 1);
  return (
    <Svg>
      <Hall f={t} kind="house" floor={820} light={0.6} />
      <rect x={1320} y={260} width={420} height={330} fill="rgba(120,160,220,0.45)" />
      <rect x={1640} y={300} width={200} height={690} fill="#120a06" />
      <Who look={LOOK.zheng} pose={zp} s={0.72} more={{face: 'shock', front: true, mouth: 0.3}} />
      <Who look={LOOK.renF} pose={{...rp, neck: [rp.neck[0] + 40, rp.neck[1] + 16], handN: [zx - 40, zp.neck[1] + 40], handF: [zx - 46, zp.neck[1] + 80]}} s={0.7} more={{face: 'calm'}} />
    </Svg>
  );
};

const S49: React.FC<Ctx> = ({t}) => {
  const sp = standPose(900, G, 0.74, 1);
  const pulse = 0.5 + 0.5 * Math.sin(t / 4);
  return (
    <Svg>
      <Sky f={t} mode="night" id="s49" />
      <WardWall x0={0} x1={1920} top={520} bottom={G} />
      <WardGate x={1180} bottom={G} w={460} h={500} open={0} lock />
      <circle cx={1180} cy={G - 500 * 0.55 + 30} r={60} fill={`rgba(225,104,79,${0.3 * pulse})`} />
      <Road />
      <Who look={LOOK.zheng} pose={{...sp, neck: [sp.neck[0] + 40, sp.neck[1] + 10], handN: [958, 700], handF: [954, 760]}} s={0.74} more={{face: 'shock', openHands: true}} />
    </Svg>
  );
};

/** 饼铺一场：坊门（左）、饼铺（右）、胡人老板 */
const BakerySet: React.FC<{t: number; children?: React.ReactNode; baker?: Partial<{x: number; facing: 1 | -1; face: 'calm' | 'smile' | 'laugh' | 'shock' | 'sleepy'; handN: P; handF: P; neck: P; headTilt: number; front: boolean}>; gate?: boolean}> = ({t, children, baker = {}, gate = true}) => {
  const bx = baker.x ?? 1380;
  const bp = standPose(bx, G, 0.72, baker.facing ?? 1);
  return (
    <Svg>
      <Sky f={t} mode="dawn" id="bk" />
      <WardWall x0={0} x1={1920} top={540} bottom={G} />
      {gate && <WardGate x={300} bottom={G} w={400} h={440} open={0} lock />}
      <Bakery f={t} x={1380} />
      <Road />
      <Who look={{...LOOK.hu, hem: 100}} pose={{...bp, ...(baker.handN ? {handN: baker.handN} : {}), ...(baker.handF ? {handF: baker.handF} : {}), ...(baker.neck ? {neck: baker.neck} : {})}} s={0.72} more={{face: baker.face ?? 'calm', headTilt: baker.headTilt ?? 0, front: baker.front}} />
      {children}
    </Svg>
  );
};
const stick = (t: number, bx = 1380): P => [bx + 110 + 30 * Math.max(0, Math.sin(t / 8)), G - 300];
const Stool: React.FC<{x: number; rot?: number}> = ({x, rot = 0}) => (
  <g transform={`rotate(${rot} ${x + 50} ${G})`}>
    <rect x={x - 50} y={G - 100} width={100} height={14} fill="#6a4a2a" />
    <rect x={x - 44} y={G - 86} width={12} height={86} fill="#4a3018" />
    <rect x={x + 32} y={G - 86} width={12} height={86} fill="#4a3018" />
  </g>
);
const Curtain: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x - 180} y={560} width={360} height={150} fill="#3a5a7a" />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={x - 180 + i * 120} y1={560} x2={x - 180 + i * 120} y2={710} stroke="#2a4058" strokeWidth={6} />)}
  </g>
);
/** 郑六坐凳啃饼（朝 facing） */
const ZhengSit: React.FC<{t: number; x: number; facing?: 1 | -1; bite?: number; face?: 'calm' | 'shock' | 'pain' | 'smile'; point?: boolean; blush?: number; chest?: boolean; turned?: boolean}> = ({t, x, facing = -1, bite = 0, face = 'calm', point, blush = 0, chest, turned}) => {
  const sp = stoolPose(x, G, 0.72, facing, 100);
  const hd = headOf(sp.hip, sp.neck, 0.72);
  const eat = Math.max(0, Math.sin(t / 9));
  const bread: P = [hd[0] + facing * (40 + 30 * (1 - eat)), hd[1] + 40 + 50 * (1 - eat)];
  const handN: P = point ? [hd[0] + 160, hd[1] - 20] : chest ? [sp.neck[0] + facing * 30, sp.neck[1] + 50 + 20 * Math.sin(t / 2)] : [bread[0] - facing * 10, bread[1] + 18];
  return (
    <g>
      <Stool x={x} />
      <Who look={LOOK.zheng} pose={{...sp, handN, handF: [bread[0] + facing * 6, bread[1] + 22]}} s={0.72} more={{face, blush, mouth: 0.3, headTilt: turned ? -10 : 0}}>
        <Bread x={bread[0]} y={bread[1]} s={0.9} bite={bite} />
      </Who>
    </g>
  );
};

const S50: React.FC<Ctx> = ({t}) => (
  <BakerySet t={t} gate baker={{handN: stick(t), handF: [1420, G - 240]}}>
    <Curtain x={1100} />
  </BakerySet>
);

const S51: React.FC<Ctx> = ({t, d}) => (
  <BakerySet t={t} baker={{handN: stick(t), handF: [1420, G - 240]}}>
    <Curtain x={900} />
    <ZhengSit t={t} x={900} facing={-1} bite={clamp01(t / d) * 0.4} />
  </BakerySet>
);

const S52: React.FC<Ctx> = ({t, L: Ln}) => {
  const look = t > Ln[1];
  return (
    <BakerySet t={t} baker={look ? {facing: -1, x: 1300, face: 'calm'} : {handN: stick(t), handF: [1420, G - 240]}}>
      <Curtain x={900} />
      <ZhengSit t={t} x={900} facing={1} point bite={0.4} face="calm" />
      <text x={1140} y={560} fontFamily={LF.serif} fontWeight={900} fontSize={60} fill={L.gold}>→ 东</text>
    </BakerySet>
  );
};

const S53: React.FC<Ctx> = ({t, d}) => {
  const back = t > d * 0.7;
  const sp = standPose(1300, G, 0.72, -1);
  const hd = headOf(sp.hip, sp.neck, 0.72);
  return (
    <BakerySet t={t} baker={back ? {handN: stick(t), handF: [1420, G - 240]} : {x: 1300, facing: -1, front: true, face: 'smile', headTilt: 12 * Math.sin(t / 3), handN: [hd[0] - 80 + 30 * Math.sin(t / 2), hd[1] + 40] as P}}>
      <Curtain x={900} />
      <ZhengSit t={t} x={900} facing={1} bite={0.45} face="calm" />
    </BakerySet>
  );
};

const S54: React.FC<Ctx> = ({t}) => {
  const up = clamp01((t - 8) / 5);
  const sp = standPose(900, G, 0.74, 1);
  const hd = headOf(sp.hip, sp.neck, 0.74);
  const flip = t > 8 ? Math.sin((t - 8) / 3) * 40 * Math.exp(-(t - 8) / 20) : 0;
  return (
    <BakerySet t={t} baker={{x: 1300, facing: -1, face: 'calm'}}>
      <Curtain x={900} />
      {up < 1 ? (
        <ZhengSit t={t} x={900} facing={1} bite={0.45} />
      ) : (
        <>
          <Stool x={760} rot={-80 * clamp01((t - 8) / 6)} />
          <Who look={LOOK.zheng} pose={{...sp, handN: [hd[0] + 170, hd[1] - 10], handF: [sp.hip[0] - 60, sp.hip[1] - 60 + flip]}} s={0.74} more={{face: 'shock', mouth: 0.8, openHands: false}}>
            <Bread x={sp.hip[0] - 60} y={sp.hip[1] - 90 + flip} s={0.9} bite={0.45} />
          </Who>
        </>
      )}
      {t >= 8 && t < 22 && <text x={760} y={860} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={80} fill={L.goldHot}>哐</text>}
    </BakerySet>
  );
};

const S55: React.FC<Ctx> = ({t, hit}) => {
  const slap = t >= hit - 4;
  const sp = standPose(1300, G, 0.72, -1);
  const hd = headOf(sp.hip, sp.neck, 0.72);
  const zs = standPose(860, G, 0.74, 1);
  const zh = headOf(zs.hip, zs.neck, 0.74);
  const choke = t >= hit;
  return (
    <BakerySet t={t} baker={{x: 1300, facing: -1, front: true, face: slap ? 'laugh' : 'calm', handN: slap ? ([hd[0] + 4, hd[1] - 36] as P) : undefined}}>
      <Curtain x={900} />
      <Stool x={760} rot={-80} />
      <Who look={LOOK.zheng} pose={{...zs, neck: [zs.neck[0] + (choke ? 20 : 0), zs.neck[1] + (choke ? 10 : 0)], handN: choke ? ([zs.neck[0] + 40, zs.neck[1] + 60 + 24 * Math.sin(t / 1.6)] as P) : ([zh[0] + 50, zh[1] + 40] as P), handF: [zs.hip[0] - 40, zs.hip[1] - 20]}} s={0.74} more={{face: choke ? 'pain' : 'calm', blush: choke ? 1 : 0, swell: choke ? 0.4 : 0, front: choke}}>
        <Bread x={zs.hip[0] - 40} y={zs.hip[1] - 50} s={0.9} bite={0.5} />
      </Who>
      {choke && <text x={zh[0] - 140} y={zh[1] - 40} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={70} fill="#fff2d0">咳！咳！</text>}
      {slap && t < hit + 12 && <text x={hd[0] + 60} y={hd[1] - 90} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={70} fill={L.goldHot}>啪</text>}
    </BakerySet>
  );
};

const S56: React.FC<Ctx> = ({t, d}) => {
  const z = lerp(1, 1.18, easeInOut(clamp01(t / d)));
  const sp = standPose(1150, G, 0.72, -1);
  const lean = clamp01(t / 16);
  return (
    <Svg>
      <g transform={`translate(1000 700) scale(${z}) translate(-1000 -700)`}>
        <Sky f={t} mode="dawn" id="s56" />
        <WardWall x0={0} x1={1920} top={540} bottom={G} />
        <Bakery f={t} x={1380} />
        <Road />
        <Who look={LOOK.zheng} pose={standPose(860, G, 0.74, 1)} s={0.74} more={{face: 'shock', mouth: 0.3, blush: 0.4}}>
          <Bread x={900} y={780} s={0.9} bite={0.5} />
        </Who>
        <Who look={{...LOOK.hu, hem: 100}} pose={{...sp, neck: [sp.neck[0] - 70 * lean, sp.neck[1] + 30 * lean], handN: [1060, sp.hip[1] - 10], handF: [1200, sp.hip[1] + 10]}} s={0.72} more={{face: 'smile', headTilt: -10 * lean}} />
      </g>
    </Svg>
  );
};

const S57: React.FC<Ctx> = ({t, d}) => (
  <BakerySet t={t} baker={{x: 1300, facing: -1, face: 'smile'}}>
    <Curtain x={900} />
    <Stool x={860} />
    <ZhengSit t={t} x={860} facing={-1} blush={1} bite={0.5 + 0.45 * clamp01(t / d)} face="calm" turned />
  </BakerySet>
);

export const RuinScene: React.FC<{t: number; hit: number; st: number}> = ({t, hit, st}) => {
  const fade = clamp01((st - hit + 4) / 40);
  return (
    <Svg>
      <Sky f={t} mode="dawn" to="day" t={fade} id="s58" />
      <Mansion f={t} fade={fade} />
      <Grass f={t} x0={200} x1={1720} y={G - 6} grow={clamp01((fade - 0.3) / 0.7)} h={260} />
      <FoxTail x={300} y={G - 50} p={clamp01((st - hit - 34) / 14)} />
      <Road />
      <Who look={LOOK.zheng} pose={standPose(360, G, 0.6, 1)} s={0.6} more={{face: fade > 0.5 ? 'shock' : 'calm', mouth: 0.6}} />
      {Array.from({length: 5}, (_, i) => {
        const x = ((t * 22 + i * 420) % 2200) - 200;
        return <path key={i} d={`M${x} ${620 + i * 60} q80 -20 160 0`} stroke="rgba(239,230,214,0.25)" strokeWidth={4} fill="none" opacity={fade} />;
      })}
    </Svg>
  );
};
const S58: React.FC<Ctx> = ({t, hit, st}) => <RuinScene t={t} hit={hit} st={st} />;

const S59: React.FC<Ctx> = ({t, L: Ln}) => {
  const wp = standPose(1300, G, 0.74, -1);
  const zp = standPose(800, G, 0.72, 1);
  const zh = headOf(zp.hip, zp.neck, 0.72);
  return (
    <Svg>
      <Sky f={t} mode="day" id="s59" />
      <WardWall x0={0} x1={1920} top={540} bottom={G} color="#7a5a3a" />
      <rect x={480} y={600} width={220} height={390} fill="#3a2a1a" />
      <rect x={500} y={620} width={180} height={370} fill="#6a3a22" />
      <Road color="#5a4a36" />
      <Who look={LOOK.wei} pose={{...wp, handN: [1270, wp.hip[1] - 10], handF: [1330, wp.hip[1] - 10], elbowN: [1210, wp.hip[1] - 70], elbowF: [1400, wp.hip[1] - 70]}} s={0.74} more={{face: 'stern', front: true}} />
      <Who look={LOOK.zheng} pose={{...zp, handN: [zh[0] + 60 + 30 * Math.sin(t / 3), zh[1] + 70], handF: [zh[0] - 10, zh[1] - 40]}} s={0.72} more={{face: 'smile'}} />
      {t > Ln[1] - 6 && <Bubble x={zh[0] + 60} y={zh[1] - 150} text="……" w={200} o={clamp01((t - Ln[1] + 6) / 6)} />}
    </Svg>
  );
};

const S60: React.FC<Ctx> = ({t, d, B}) => {
  const hits: number[] = [];
  for (let k = 1; k * B < d; k++) hits.push(Math.round(k * B));
  return (
    <>
      <Svg>
        <Sky f={t} mode="dawn" to="day" t={clamp01(t / d) * 0.5} id="s60" />
        <rect x={0} y={760} width={1920} height={320} fill="#2a1e14" />
      </Svg>
      <Drum f={t} x={900} y={1000} r={260} hits={hits} />
      <Drummer f={t} x={900} y={1000} r={260} hits={hits} />
      <DongWords f={t} hits={hits} x={900} y={480} big={hits.slice(0, 1)} />
    </>
  );
};

const S61: React.FC<Ctx> = ({t, B}) => {
  const at = (r: number) => Math.round(B * (1 + Math.floor(r / 3)));
  return (
    <Svg>
      <rect width={1920} height={1080} fill="#0d0a08" />
      <CityPlan f={t} street="#2a2016" cell={(r) => (t >= at(r) ? {fill: '#4a3820', glow: 0.8, stroke: L.gold} : {fill: '#1a140f', glow: 0.1, stroke: 'rgba(225,104,79,0.6)'})} />
      {Array.from({length: 9 * 12}, (_, i) => {
        const r = Math.floor(i / 12), c = i % 12;
        const u = t - at(r);
        if (u < 0) return null;
        const [x, y] = cellXY(r, c);
        const p = clamp01(u / 18);
        return <circle key={i} cx={x + (rand(i) - 0.5) * 30} cy={y + 31 + 8 * p} r={5} fill="#f4e6c0" opacity={p < 1 ? 1 : 0.6} />;
      })}
      {[0, 3, 6].map((r) => {
        const u = t - at(r);
        return u >= 0 && u < 10 ? <rect key={r} x={410} y={cellXY(r, 0)[1] - 60} width={1364} height={250} fill="rgba(255,220,140,0.25)" opacity={1 - u / 10} /> : null;
      })}
    </Svg>
  );
};

const S62: React.FC<Ctx> = ({t, L: Ln, d}) => {
  const wake = Ln[1];
  const u = t - wake;
  const run = u > 12;
  const x = run ? 820 + (u - 12) * 22 : 820;
  return (
    <Svg>
      <Banquet t={t} burn={1} drunk skipLi dim={0.25} />
      {u < 0 ? (
        <Who look={LOOK.li} pose={kneelPose(820, 940, 0.62, 1)} s={0.62} more={{face: 'sleepy', headTilt: 20, neck: [826, 940 - 86 * 0.62 - 180 * 0.62] as P}} />
      ) : run ? (
        <Who look={LOOK.li} pose={runPose(x, G, t / 9, 0.66, 1)} s={0.66} more={{face: 'shock', mouth: 0.6, kneeBend: -1, elbowBend: -1, hem: 100}} />
      ) : (
        <Who look={LOOK.li} pose={{...standPose(820, G, 0.66, 1), handN: [850, 640] as P}} s={0.66} more={{face: 'shock', mouth: 0.8, front: true, swell: 0, blush: 0}} />
      )}
      {u >= 0 && u < 10 && <text x={960} y={560} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={120} fill={L.goldHot} stroke="#2a0a06" strokeWidth={6} paintOrder="stroke">咚！</text>}
      {run && (
        <Who look={{...LOOK.you, robe: '#5a4a3a', hem: 40}} pose={runPose(x - 260, G, t / 9 + 0.4, 0.56, 1)} s={0.56} more={{face: 'shout', kneeBend: -1, elbowBend: -1, handN: [x - 180, G - 300] as P}}>
          <Stick from={[x - 186, G - 296]} to={[x - 150, G - 380]} w={12} color="#e8dcc4" />
        </Who>
      )}
      {d < 0 && null}
    </Svg>
  );
};

const RANK = ['#6a3480', '#a8261b', '#3a7a4a', '#3a5a8a'];
const S63: React.FC<Ctx> = ({t, L: Ln}) => {
  const n = 7;
  return (
    <Svg>
      <Sky f={t} mode="dawn" to="day" t={0.6} id="s63" />
      <WardWall x0={0} x1={1920} top={620} bottom={G} />
      <Road color="#4a3a2a" />
      {Array.from({length: n}, (_, i) => {
        const li = i === 3;
        const x = ((i * 330 + t * 3) % (n * 330)) - 280;
        return <Rider key={i} f={t} x={li ? 1000 : x} kind="horse" s={0.62} rs={0.5} look={li ? LOOK.li : {...LOOK.you, robe: RANK[i % 4], robeD: '#1e1a1e'}} walk={1} color={i % 2 ? '#8a6a4a' : '#ece6da'} more={{face: li ? 'sleepy' : 'stern', mouth: li ? 0.8 : 0}} />;
      })}
      {t > Ln[1] - 6 && (() => {
        const p = clamp01((t - Ln[1] + 6) / 40);
        const x = -100 + p * 2100;
        return (
          <g transform={`translate(${x} ${G - 50 - Math.abs(Math.sin(p * 18)) * 60}) rotate(${p * 1400})`}>
            {Array.from({length: 8}, (_, i) => <ellipse key={i} cx={0} cy={0} rx={46} ry={22} fill="none" stroke="#b09a6a" strokeWidth={5} transform={`rotate(${i * 23})`} />)}
          </g>
        );
      })()}
    </Svg>
  );
};

const S64: React.FC<Ctx> = ({t, L: Ln}) => {
  if (t < Ln[1]) return <HemScene t={t + 60} hit={30} st={60 + t} />;
  if (t < Ln[2]) return <PunishScene f={fbt(SPANK_BEATS[3]) - 2 + (t - Ln[1])} hits={SPANK_BEATS.map(fbt)} />;
  const u = t - Ln[2];
  return (
    <BakerySet t={t} baker={{handN: stick(t), handF: [1420, G - 240]}}>
      <Curtain x={900} />
      <ZhengSit t={u} x={900} facing={-1} bite={0.3} />
    </BakerySet>
  );
};

const S65: React.FC<Ctx> = ({t}) => {
  const ff = fbt(24) + t;
  const wx = 380 + Math.min(260, Math.max(0, ff - fbt(29)) * 14);
  const moving = ff >= fbt(29) && (ff - fbt(29)) * 14 < 260;
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0b0806" />
      </Svg>
      <RoutePlan f={ff} at={fbt(24)} />
      <Svg>
        <Who look={LOOK.you} pose={moving ? runPose(wx, 760, ff / 12, 0.27, 1) : standPose(wx, 760, 0.27, 1)} s={0.27} more={{face: 'shock', front: !moving, mouth: 0.6, kneeBend: -1, elbowBend: -1}} />
      </Svg>
      <div style={{position: 'absolute', right: 90, top: 70, fontFamily: LF.serif, fontWeight: 900, fontSize: 150, color: L.red, textShadow: '0 0 40px rgba(225,104,79,0.6)', transform: `scale(${1.6 - 0.6 * easeOut(clamp01(t / 6))})`, transformOrigin: '100% 0'}}>900 下</div>
    </>
  );
};

const S66: React.FC<Ctx> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, opacity: 0.18, filter: 'blur(3px)'}}>
      <RoutePlan f={fbt(32)} at={fbt(24)} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 180, color: L.ink, textShadow: '0 0 40px rgba(0,0,0,0.9)', opacity: clamp01(t / 8), transform: `scale(${1.08 - 0.08 * easeOut(clamp01(t / 10))})`}}>
      你怎么办？
    </div>
    <div style={{position: 'absolute', right: 70, bottom: 60, fontFamily: LF.serif, fontWeight: 900, fontSize: 64, color: L.red}}>第 900 下</div>
  </>
);

export const SCENES_B: Record<number, React.FC<Ctx>> = {32: S32, 33: S33, 34: S34, 35: S35, 36: S36, 37: S37, 38: S38, 39: S39, 40: S40, 41: S41, 42: S42, 43: S43, 44: S44, 45: S45, 46: S46, 47: S47, 48: S48, 49: S49, 50: S50, 51: S51, 52: S52, 53: S53, 54: S54, 55: S55, 56: S56, 57: S57, 58: S58, 59: S59, 60: S60, 61: S61, 62: S62, 63: S63, 64: S64, 65: S65, 66: S66};
void [easeIn, Torch, Rot, CROWD, Lamp, LowTable, Hall];
