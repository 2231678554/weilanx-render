import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, rand} from '../../library/anim';
import {Drum, NameTag, Scroll} from '../../library/lamplight/props';
import {BigGlyph} from '../../library/lamplight/stage';
import {L, LF} from '../../library/lamplight/theme';
import {Drummer, DongWords} from './Ep53Curfew';
import {Bowl, Bubble, CROWD, Ctx, Cup, G, headOf, LOOK, Note, Paper, Rot, Smoke, SpeedLines, Svg, Sweat, Torch, VText, Who} from './Kit';
import {kneelPose, P, stoolPose, ridePose, runPose, standPose, Stick, walkPose} from './Rig';
import {Bulletin, CityPlan, Hall, InnerStreet, Lamp, LowTable, Mount, mountBack, Sky, Street, WardGate, WardWall, Road, Candle, cellXY} from './Sets';

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lp = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
/** 缩小放右下的城图：x → 820 + (x-440)·0.72 */
export const PLAN_T = 'translate(820 430) scale(0.72) translate(-440 -330)';
export const planXY = (r: number, c: number): P => {
  const [x, y] = cellXY(r, c);
  return [820 + (x - 440) * 0.72, 430 + (y - 330) * 0.72];
};

/** 官府大堂（令狐绹坐在高案后） */
export const OfficeHall: React.FC<{f: number; desk?: boolean; ling?: Partial<{face: 'stern' | 'calm' | 'shock'; cup: boolean; wave: number}>; guards?: boolean}> = ({f, desk = true, ling, guards = true}) => {
  const lk = stoolPose(960, 860, 0.68, -1, 170);
  const wave = ling?.wave ?? 0;
  return (
    <g>
      <Hall f={f} kind="office" />
      {desk && ling && (
        <Who look={LOOK.ling} pose={{...lk, handN: wave > 0 ? lp([900, 700], [760, 600], Math.sin(wave * Math.PI)) : ling.cup ? [905, 650] : lk.handN, handF: [1010, 720]}} s={0.68} more={{front: true, face: ling.face ?? 'stern'}} />
      )}
      {desk && ling?.cup && !wave && <Cup x={905} y={638} s={1.2} />}
      {desk && (
        <g>
          <rect x={720} y={700} width={480} height={170} fill="#4a1a12" stroke="#1a0a06" strokeWidth={8} />
          <rect x={700} y={688} width={520} height={22} fill="#2a120c" />
          <rect x={760} y={730} width={400} height={110} fill="#7a2a1a" />
        </g>
      )}
      {guards &&
        [470, 590, 1330, 1450].map((x, i) => {
          const sp = standPose(x, 870, 0.56, i < 2 ? 1 : -1);
          return (
            <g key={x}>
              <Stick from={[x + (i < 2 ? 34 : -34), 870]} to={[x + (i < 2 ? 34 : -34), 560]} w={12} color="#6a1a12" />
              <Who look={LOOK.guard} pose={{...sp, handN: [x + (i < 2 ? 34 : -34), 700]}} s={0.56} more={{face: 'stern'}} />
            </g>
          );
        })}
    </g>
  );
};

const S6: React.FC<Ctx> = ({t}) => (
  <Svg>
    <Street f={t} id="s6" tower={0.5 + 0.5 * Math.sin(t / 5)} scroll={t * 26} />
    <SpeedLines f={t} y0={620} y1={960} dir={1} />
    <Who look={LOOK.you} pose={runPose(900, G, t / 10, 0.74, 1)} s={0.74} more={{face: 'shout', mouth: 0.6 + 0.3 * Math.sin(t / 3), kneeBend: -1, elbowBend: -1}} />
  </Svg>
);

const S7: React.FC<Ctx> = ({t, L: Ln, d}) => {
  const hits: number[] = [];
  for (let x = 6, gap = 16; x < d; x += gap, gap = Math.max(5, gap * 0.86)) hits.push(Math.round(x));
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0f0b08" />
        <rect x={960} y={0} width={960} height={1080} fill="#170f0a" />
        <Paper x={170} y={470} w={600} h={500} p={clamp01(t / 14)} />
        {t > 10 && (
          <>
            <VText x={640} y={560} text="闭门击鼓" size={66} glow="鼓" glowOn={clamp01((t - Ln[1]) / 8)} />
            <VText x={520} y={560} text="鼓满千下" size={66} glow="鼓下" glowOn={clamp01((t - Ln[1]) / 8)} />
            <VText x={400} y={560} text="坊门皆闭" size={66} />
          </>
        )}
        {t > Ln[2] && (
          <g opacity={clamp01((t - Ln[2]) / 6)}>
            <rect x={200} y={560} width={150} height={330} fill="none" stroke={L.red} strokeWidth={6} strokeDasharray="18 12" />
            <text x={275} y={760} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={150} fill={L.red}>？</text>
          </g>
        )}
        <line x1={960} y1={440} x2={960} y2={1080} stroke="rgba(239,230,214,0.3)" strokeWidth={4} />
      </Svg>
      <Drum f={t} x={1300} y={1000} r={170} hits={hits} />
      <Drummer f={t} x={1300} y={1000} r={170} hits={hits} scale={0.66} />
      <DongWords f={t} hits={hits} x={1300} y={560} />
    </>
  );
};

const S8: React.FC<Ctx> = ({t, L: Ln}) => {
  const x = 1110;
  const sp = standPose(x, G, 0.74, 1);
  const turn = clamp01((t - Ln[1] - 4) / 10) * (t > Ln[1] + 30 ? 0.5 : 1);
  const turn2 = Math.min(turn, 0.5);
  const yawn = t < Ln[1] ? Math.max(0, Math.sin((t / Math.max(1, Ln[1])) * Math.PI)) : 0;
  const key: P = [1252, 716];
  const hand: P = [key[0] - 70, key[1] + 4];
  return (
    <Svg>
      <InnerStreet f={t} light={0.55} />
      <WardGate x={1280} bottom={G} w={420} h={520} open={0.14} inside="#0b1020" />
      <rect x={1240} y={700} width={80} height={24} rx={4} fill="#1a1512" />
      <rect x={1256} y={718} width={46} height={34} rx={6} fill="#b08a3a" />
      <Who look={LOOK.fang} pose={{...sp, handN: hand, handF: [x - 30, sp.hip[1] + 30]}} s={0.74} more={{face: yawn > 0.2 ? 'shout' : 'calm', mouth: yawn, headTilt: t > Ln[1] + 14 ? 12 : 0}}>
        <g transform={`rotate(${turn2 * 90} ${key[0]} ${key[1]})`}>
          <Stick from={hand} to={key} w={8} color="#c9a24a" />
          <rect x={key[0] - 4} y={key[1] - 12} width={10} height={24} fill="#c9a24a" />
        </g>
        {/* 腰间一大串钥匙 */}
        {Array.from({length: 7}, (_, i) => <rect key={i} x={sp.hip[0] - 26 + i * 8} y={sp.hip[1] + 6 + Math.sin(t / 3 + i) * 2} width={5} height={34 + (i % 3) * 8} fill="#c9a24a" transform={`rotate(${(i - 3) * 8} ${sp.hip[0] - 26 + i * 8} ${sp.hip[1] + 6})`} />)}
        <circle cx={sp.hip[0]} cy={sp.hip[1] + 6} r={16} fill="none" stroke="#c9a24a" strokeWidth={5} />
      </Who>
      {t > Ln[1] + 14 && <text x={1000} y={560} fontFamily={LF.serif} fontWeight={900} fontSize={60} fill={L.goldHot} opacity={0.8}>咚…</text>}
    </Svg>
  );
};

const S9: React.FC<Ctx> = ({t, hit, st}) => {
  const gx = 1180;
  const arrive = hit - 10;
  const x = Math.min(930, 300 + t * 26);
  const run = t < arrive;
  const k = clamp01((st - hit - 4) / 26);
  const base = standPose(930, G, 0.74, 1);
  const kn = kneelPose(950, G, 0.74, 1);
  const pose = run
    ? runPose(x, G, t / 10, 0.74, 1)
    : {
        ...base,
        hip: lp(base.hip, kn.hip, easeIn(k)),
        neck: lp([base.neck[0] + 30, base.neck[1] + 6], [kn.neck[0] + 30, kn.neck[1] + 20], easeIn(k)),
        handN: lp([1006, 620], [1010, 840], easeIn(k)),
        handF: lp([1002, 660], [1006, 880], easeIn(k)),
        ...(k > 0.3 ? {kneeN: lp([970, 880], kn.kneeN, k), kneeF: lp([960, 880], kn.kneeF, k), footN: lp([900, G], kn.footN, k), footF: lp([880, G], kn.footF, k)} : {}),
      };
  return (
    <Svg>
      <Street f={t} id="s9" tower={t < hit ? 0.6 + 0.4 * Math.sin(t / 3) : 0} />
      <WardGate x={gx} bottom={G} w={340} h={420} open={t < hit - 4 ? 0.05 : 0} lock={t >= hit} />
      <Who look={LOOK.you} pose={pose} s={0.74} more={{face: run ? 'shout' : t < hit ? 'shock' : 'pain', mouth: 0.7, kneeBend: -1, elbowBend: run ? -1 : 1, openHands: !run, headTilt: run ? 0 : 10}} />
      {t >= hit && (
        <g opacity={clamp01((t - hit - 6) / 8)}>
          <text x={gx + 20} y={800} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={140} fill={L.red} stroke="#2a0a06" strokeWidth={6} paintOrder="stroke" style={{filter: 'drop-shadow(0 0 18px rgba(225,104,79,0.8))'}}>犯夜</text>
        </g>
      )}
      {t >= hit && t < hit + 20 && <text x={gx} y={680} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={70} fill={L.goldHot} opacity={1 - (t - hit) / 20}>咔哒</text>}
    </Svg>
  );
};

const MapCN: React.FC<{t: number; p: number; lit: number}> = ({t, p, lit}) => {
  const A: P = [520, 640], Bp: P = [1300, 900];
  const path = `M${A[0]} ${A[1]} C 760 640, 860 760, 1000 780 S 1220 860, ${Bp[0]} ${Bp[1]}`;
  return (
    <g>
      <rect width={1920} height={1080} fill="#141009" />
      <path d="M0 560 Q400 470 900 560 T1920 520" stroke="rgba(120,160,200,0.25)" strokeWidth={26} fill="none" />
      <path d="M200 760 Q700 820 1200 980 T1920 1000" stroke="rgba(120,160,200,0.2)" strokeWidth={34} fill="none" />
      <path d={path} stroke={L.gold} strokeWidth={8} fill="none" strokeDasharray="1400" strokeDashoffset={1400 * (1 - p)} />
      <circle cx={A[0]} cy={A[1]} r={22} fill={L.gold} />
      <text x={A[0]} y={A[1] - 40} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={54} fill={L.ink}>长安</text>
      <circle cx={Bp[0]} cy={Bp[1]} r={30 + 40 * lit} fill="rgba(255,200,90,0.35)" opacity={lit} />
      <circle cx={Bp[0]} cy={Bp[1]} r={22} fill={lit > 0 ? L.goldHot : '#4a3a2a'} />
      <text x={Bp[0]} y={Bp[1] - 42} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={54} fill={L.ink} opacity={0.4 + 0.6 * lit}>扬州</text>
      <text x={880} y={740} fontFamily={LF.label} fontSize={30} fill={L.inkDim} opacity={p}>运河</text>
      {t < 0 && null}
    </g>
  );
};

const S10: React.FC<Ctx> = ({t, L: Ln}) => {
  const p = clamp01((t - 4) / Math.max(8, Ln[1] - 4));
  const lit = clamp01((t - Ln[1]) / 8);
  return (
    <>
      <Svg>
        <MapCN t={t} p={p} lit={lit} />
        {t > Ln[1] && <Who look={LOOK.wen} pose={standPose(1660, G, 0.64, -1)} s={0.64} more={{front: true, face: 'stern', opacity: clamp01((t - Ln[1]) / 8)}} />}
      </Svg>
      <NameTag f={t} at={Ln[1] + 4} x={1460} y={420} small="晚唐诗人、词人，人称「温钟馗」" name="温庭筠" w={400} />
    </>
  );
};

const NAMES = [['李珏', '王起', '崔铉', '郑颢', '杜牧'], ['卢肇', '丁棱', '姚鹄', '黄颇', '赵嘏'], ['马植', '李远', '韦蟾', '刘蜕', '薛逢'], ['裴坦', '高璩', '孙瑝', '于珪', '崔沆']];
const S11: React.FC<Ctx> = ({t, L: Ln, hit, B}) => {
  const shown = (i: number) => Math.round(B * (1 + i * 1.5));
  const n = [0, 1, 2, 3].filter((i) => t >= shown(i)).length;
  const lx = t < hit - 14 ? 2100 : Math.max(1780, 2100 - (t - hit + 14) * 24);
  const lwalk = lx > 1780;
  return (
    <Svg>
      <rect width={1920} height={1080} fill="#2a2018" />
      <WardWall x0={0} x1={1920} top={440} bottom={G} color="#4a3826" />
      <Road />
      <text x={150} y={500} fontFamily={LF.serif} fontWeight={900} fontSize={44} fill="rgba(239,230,214,0.5)">礼部南院</text>
      {[0, 1, 2, 3].map((i) => {
        const a = t - shown(i);
        if (a < 0) return null;
        const pop = a < 5 ? 1.25 - 0.05 * a : 1;
        return <Bulletin key={i} x={300 + i * 250} y={700} s={0.56 * pop} names={NAMES[i]} rot={(rand(i) - 0.5) * 6} title={`第${'一二三四'[i]}年`} />;
      })}
      <Who look={LOOK.wen} pose={standPose(1460, G, 0.68, t < hit - 6 ? -1 : 1)} s={0.68} more={{face: t < hit - 6 ? 'shock' : 'stern', beardC: ['#2a1f18', '#4a4038', '#7a726a', '#a8a29a', '#d0ccc6'][n]}} />
      {lx < 2050 && (
        <Who look={LOOK.ling} pose={lwalk ? walkPose(lx, G, t / 18, 0.7, -1) : standPose(lx, G, 0.7, -1)} s={0.7} more={{face: 'stern', headTilt: 8, handN: [lx - 10, G - 226 * 0.7 + 10] as P, handF: [lx + 30, G - 226 * 0.7 + 10] as P}} />
      )}
      {t > hit && <text x={1620} y={600} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={56} fill={L.red}>哼！</text>}
      {Ln.length < 0 && null}
    </Svg>
  );
};

/** 扬州城墙 + 城门 */
const CityWall: React.FC<{top?: number}> = ({top = 600}) => (
  <g>
    <rect x={0} y={top} width={1920} height={G - top} fill="#4a3a2a" />
    {Array.from({length: 24}, (_, i) => <rect key={i} x={i * 84} y={top - 40} width={50} height={42} fill="#4a3a2a" />)}
    {Array.from({length: 6}, (_, i) => <line key={i} x1={0} x2={1920} y1={top + 60 * (i + 1)} y2={top + 60 * (i + 1)} stroke="rgba(0,0,0,0.18)" strokeWidth={3} />)}
    <path d={`M560 ${G} L560 ${top + 140} Q700 ${top + 40} 840 ${top + 140} L840 ${G} Z`} fill="#120c08" />
    <rect x={620} y={top + 20} width={160} height={60} fill="#1a120c" stroke="#c9a24a" strokeWidth={3} />
    <text x={700} y={top + 66} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#e9c46a">扬州</text>
  </g>
);

const S12: React.FC<Ctx> = ({t, L: Ln}) => {
  const mx = Math.min(560, 120 + t * 7);
  const back = mountBack(mx, G, 0.72, 'donkey');
  const look = clamp01((t - Ln[1]) / 6);
  const rp = ridePose(back, 0.6, 1, Math.sin(t / 4) * 3);
  const shrink = clamp01((t - Ln[1] - 10) / 6);
  return (
    <Svg>
      <Sky f={t} mode="dusk" id="s12" />
      <CityWall top={600} />
      <Road />
      <Who look={LOOK.ling} pose={{...standPose(1300, 600, 0.5, -1), handN: [1316, 600 - 113 + 10], handF: [1330, 600 - 113 + 14]}} s={0.5} more={{face: 'stern', headTilt: 12}} />
      <Mount f={t} x={mx} y={G} s={0.72} kind="donkey" walk={mx < 560 ? 1 : 0} />
      <Who look={LOOK.wen} pose={{...rp, neck: [rp.neck[0], rp.neck[1] + 26 * shrink]}} s={0.6} more={{face: look > 0.5 ? 'shock' : 'calm', headTilt: -22 * look * (1 - shrink * 0.5), headAt: shrink > 0 ? ([rp.neck[0] + 6, rp.neck[1] + 26 * shrink - 24] as P) : undefined}} />
      {shrink > 0 && <Sweat x={rp.neck[0] - 40} y={rp.neck[1] - 60} s={1.2} />}
    </Svg>
  );
};

const S13: React.FC<Ctx> = ({t, L: Ln}) => {
  const gx = Math.min(1400, 1000 + t * 4);
  return (
    <Svg>
      <defs>
        <clipPath id="s13l"><rect x={0} y={0} width={956} height={1080} /></clipPath>
        <clipPath id="s13r"><rect x={964} y={0} width={956} height={1080} /></clipPath>
      </defs>
      <g clipPath="url(#s13l)">
        <Sky f={t} mode="day" id="s13a" />
        <WardWall x0={0} x1={960} top={560} bottom={G} />
        <WardGate x={480} bottom={G} w={360} h={400} open={0} />
        <rect x={400} y={500} width={160} height={50} fill="#1a120c" stroke="#c9a24a" strokeWidth={3} />
        <text x={480} y={538} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={30} fill="#e9c46a">节度使府</text>
        <Road />
        {[220, 740].map((x, i) => <Who key={x} look={LOOK.guard} pose={standPose(x, G, 0.56, i ? -1 : 1)} s={0.56} more={{face: Math.sin(t / 12 + i * 2) > 0.3 ? 'shout' : 'sleepy', mouth: 0.8, front: true}} />)}
        <rect width={960} height={1080} fill="rgba(60,90,140,0.25)" />
      </g>
      <g clipPath="url(#s13r)">
        <rect x={960} width={960} height={1080} fill="#1a0e10" />
        <rect x={1120} y={380} width={760} height={260} fill="#5a2a22" />
        <rect x={1120} y={640} width={760} height={350} fill="#4a2018" />
        <rect x={1300} y={720} width={240} height={270} fill="rgba(255,170,90,0.75)" />
        <path d="M1080 390 L1500 300 L1920 390 Z" fill="#1c1012" />
        <path d="M1080 650 L1920 650 L1920 630 L1080 630 Z" fill="#1c1012" />
        {[1240, 1440, 1640].map((x, i) => <Who key={x} look={i === 1 ? LOOK.girlR : LOOK.girlP} pose={{...standPose(x, 640, 0.42, -1), handN: [x - 40, 640 - 160 + 30 * Math.sin(t / 5 + i)] as P}} s={0.42} more={{face: 'smile', front: true}} />)}
        <rect x={1120} y={560} width={760} height={14} fill="#8a2a1a" />
        {Array.from({length: 20}, (_, i) => <rect key={i} x={1130 + i * 38} y={570} width={8} height={70} fill="#8a2a1a" />)}
        <rect x={1120} y={630} width={760} height={12} fill="#8a2a1a" />
        {[1160, 1840].map((x, i) => <Lamp key={x} f={t} x={x} y={660} s={0.8} seed={i} />)}
        <Road />
        {[0, 1, 2, 3].map((i) => {
          const x = gx - i * 110;
          return <Who key={i} look={i === 0 ? LOOK.wen : {...LOOK.you, robe: CROWD[i + 1], robeD: '#2e2620'}} pose={{...walkPose(x, G, t / 16 + i * 0.2, 0.56, 1), handN: [x + 70, G - 226 * 0.56 - 190 * 0.56] as P}} s={0.56} more={{face: 'laugh', blush: i === 0 ? 0.4 : 0}} />;
        })}
      </g>
      <rect x={956} y={0} width={8} height={1080} fill="#e9c46a" />
      {Ln.length < 0 && null}
    </Svg>
  );
};

const S14: React.FC<Ctx> = ({t}) => {
  const x = 380 + t * 4.2;
  const sway = Math.sin(t / 9);
  const wp = walkPose(x, G, t / 22, 0.72, 1);
  return (
    <Svg>
      <Street f={t} id="s14" gate={{x: 1640, open: 0, lock: true}} />
      <Who look={LOOK.wen} pose={{...wp, neck: [wp.neck[0] + sway * 40, wp.neck[1] + 6], handF: [wp.neck[0] + 40 + sway * 40, wp.neck[1] - 30], handN: [wp.neck[0] + 90 + sway * 20, wp.neck[1] + 30 * Math.sin(t / 5)]}} s={0.72} more={{face: 'laugh', blush: 0.9, headTilt: sway * 16, elbowBend: -1}}>
        <g transform={`rotate(${-30 + sway * 10} ${wp.neck[0] + 40 + sway * 40} ${wp.neck[1] - 30})`}>
          <ellipse cx={wp.neck[0] + 40 + sway * 40} cy={wp.neck[1] - 30} rx={22} ry={30} fill="#6a4a2a" stroke="#2a1a0a" strokeWidth={3} />
        </g>
      </Who>
      {[0, 1, 2].map((i) => <text key={i} x={x + 80 + i * 50} y={560 - ((t / 2 + i * 14) % 40)} fontFamily={LF.serif} fontSize={44} fill={L.gold} opacity={0.7}>♪</text>)}
    </Svg>
  );
};

const S15: React.FC<Ctx> = ({t, hit, st}) => {
  const h = hit;
  const wx = Math.min(840, 600 + t * 10);
  const fall = clamp01((st - h - 2) / 22);
  const wp = standPose(wx, G, 0.72, 1);
  const wHead = headOf(wp.hip, wp.neck, 0.72);
  const yx = 1000;
  const yp = standPose(yx, G, 0.74, -1);
  const back = clamp01((st - (h - 12)) / 8);
  const punch = clamp01((st - (h - 3)) / 3);
  const fist: P = st < h - 3 ? lp([yx + 10, yp.neck[1] + 60], [yx + 70, yp.neck[1] + 20], back) : lp([yx + 70, yp.neck[1] + 20], [wHead[0] + 30, wHead[1] + 6], punch);
  const tooth = clamp01((st - h) / 26);
  return (
    <Svg>
      <Street f={t} id="s15" />
      <Rot a={-82 * easeIn(fall)} at={[wx - 30, G]}>
        <Who look={LOOK.wen} pose={{...wp, handN: [wx + 40, wp.hip[1] - 20], handF: fall > 0 ? [wx - 80, wp.neck[1] - 40] : [wx - 20, wp.hip[1] + 20]}} s={0.72} more={{face: st >= h ? 'pain' : 'shock', blush: 0.6, swell: st >= h ? Math.min(1, (st - h) / 6) : 0, headTilt: st >= h ? -20 : 0, openHands: fall > 0}} />
      </Rot>
      {st >= h && (
        <g>
          <rect x={wHead[0] + 30 - 300 * tooth} y={wHead[1] + 10 - 260 * Math.sin(tooth * Math.PI * 0.8)} width={14} height={20} rx={4} fill="#fffaf0" stroke="#5a4a3a" strokeWidth={2} transform={`rotate(${tooth * 900} ${wHead[0] + 37 - 300 * tooth} ${wHead[1] + 20 - 260 * Math.sin(tooth * Math.PI * 0.8)})`} />
          {[0, 1, 2].map((i) => <circle key={i} cx={wHead[0] + 30 - 120 * tooth * (1 + i * 0.4)} cy={wHead[1] + 26 - 80 * Math.sin(tooth * 2.4) + i * 10} r={7 - i} fill="#c0202a" opacity={1 - tooth} />)}
        </g>
      )}
      <Who look={LOOK.yu} pose={{...yp, neck: [yp.neck[0] - 30 * punch, yp.neck[1] + 6 * punch], handN: fist, handF: [yx + 40, yp.hip[1] + 10]}} s={0.74} more={{face: 'shout', mouth: 0.5, elbowBend: 1}}>
        <Lamp f={t} x={yx + 40} y={yp.hip[1] + 6} s={0.7} text="巡" />
      </Who>
      {st >= h && st < h + 16 && <text x={wHead[0] + 40} y={wHead[1] - 70} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={110} fill={L.goldHot} stroke="#2a0a06" strokeWidth={6} paintOrder="stroke">咔！</text>}
    </Svg>
  );
};

/** 温庭筠捂脸告状（大堂左侧） */
const WenCheek: React.FC<{x: number; t: number; face?: 'stern' | 'shock' | 'smile' | 'pain'; point?: boolean; blush?: number}> = ({x, t, face = 'stern', point = true, blush = 0.3}) => {
  const sp = standPose(x, 870, 0.7, 1);
  const hd = headOf(sp.hip, sp.neck, 0.7);
  return <Who look={LOOK.wen} pose={{...sp, handN: [hd[0] + 22, hd[1] + 14], handF: point ? [x - 150, sp.neck[1] + 6 + 4 * Math.sin(t / 4)] : sp.handF}} s={0.7} more={{face, swell: 1, blush, elbowBend: 1}} />;
};

const S16: React.FC<Ctx> = ({t}) => {
  const cx = ((t * 14) % 2600) - 300;
  return (
    <Svg>
      <OfficeHall f={t} ling={{face: 'stern', cup: true}} />
      <WenCheek x={300} t={t} />
      <path d={`M${cx} 520 q30 -24 60 0 q30 -24 60 0`} stroke="#0a0806" strokeWidth={10} fill="none" strokeLinecap="round" />
    </Svg>
  );
};

const S17: React.FC<Ctx> = ({t}) => {
  const push = clamp01(t / 16);
  const x = lerp(1400, 960, easeOut(push));
  const kn = kneelPose(x, 870, 0.7, -1);
  const sp = standPose(x, 870, 0.7, -1);
  const pose = push < 1 ? {...sp, neck: [sp.neck[0] - 30, sp.neck[1] + 20] as P, handN: [x + 40, sp.hip[1] - 30] as P, handF: [x + 50, sp.hip[1] - 20] as P} : {...kn, handN: [x + 40, kn.hip[1] - 30] as P, handF: [x + 50, kn.hip[1] - 20] as P};
  return (
    <Svg>
      <OfficeHall f={t} desk={false} />
      <WenCheek x={340} t={t} face="smile" point={false} />
      <Who look={{...LOOK.yu, sword: false}} pose={pose} s={0.7} more={{face: 'stern', headTilt: -12, hem: push < 1 ? 60 : 70}} />
      {[x - 140, x + 150].map((gx, i) => {
        const gp = standPose(gx, 870, 0.62, i ? -1 : 1);
        return <Who key={i} look={LOOK.guard} pose={{...gp, handN: [x + (i ? 50 : -20), pose.neck[1] + 40] as P, handF: [x + (i ? 40 : -10), pose.hip[1] - 20] as P}} s={0.62} more={{face: 'stern'}} />;
      })}
      {t >= 16 && t < 30 && <text x={960} y={560} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={90} fill={L.goldHot} opacity={1 - (t - 16) / 14}>啪！</text>}
    </Svg>
  );
};

const S18: React.FC<Ctx> = ({t, L: Ln}) => {
  const x = 760;
  const kn = kneelPose(x, 870, 0.7, 1);
  const len = clamp01((t - 6) / 60) * 1100;
  const hand: P = [x + 90, kn.hip[1] - 40];
  const blush = clamp01((t - Ln[1]) / 18);
  return (
    <Svg>
      <OfficeHall f={t} desk={false} guards={false} />
      <WenCheek x={330} t={t} face={blush > 0.5 ? 'shock' : 'smile'} point={false} blush={0.3 + 0.7 * blush} />
      {blush > 0.5 && <Smoke f={t} x={360} y={560} n={4} color="rgba(220,220,220,0.5)" />}
      {/* 越拉越长的单子：先往右平拉，再铺到地上 */}
      <path d={`M${hand[0]} ${hand[1] - 20} L${hand[0] + Math.min(len, 160)} ${hand[1] - 20} L${hand[0] + Math.min(len, 160) + Math.max(0, Math.min(len - 160, 100))} ${870} L${hand[0] + len} ${870 + Math.max(0, len - 260) * 0.12}`} stroke="#f0e4c4" strokeWidth={60} fill="none" strokeLinejoin="round" />
      {Array.from({length: Math.floor(len / 150)}, (_, i) => (
        <text key={i} x={hand[0] + 300 + i * 150} y={880 + (150 * i + 40) * 0.12} fontFamily={LF.serif} fontWeight={900} fontSize={26} fill="#5a1a10" transform={`rotate(7 ${hand[0] + 300 + i * 150} ${880 + (150 * i + 40) * 0.12})`}>某夜 某楼</text>
      ))}
      <Who look={{...LOOK.yu, sword: false}} pose={{...kn, handN: hand, handF: [hand[0] - 10, hand[1] + 10]}} s={0.7} more={{face: 'shout', mouth: 0.4 + 0.4 * Math.abs(Math.sin(t / 3)), hem: 70}} />
    </Svg>
  );
};

const S19: React.FC<Ctx> = ({t, d, B}) => {
  const cut = Math.round(d * 0.45);
  if (t < cut) {
    return (
      <Svg>
        <OfficeHall f={t} ling={{face: 'stern', wave: clamp01((t - 6) / 14)}} />
        <WenCheek x={300} t={t} face="shock" point={false} />
      </Svg>
    );
  }
  const u = t - cut;
  const slam = 6;
  const ring = u > slam ? Math.sin((u - slam) / 2.2) * 30 * Math.exp(-(u - slam) / 16) : 0;
  return (
    <Svg>
      <Sky f={t} mode="day" id="s19" />
      <WardWall x0={0} x1={1920} top={520} bottom={G} color="#5a3a26" />
      <WardGate x={960} bottom={860} w={460} h={360} open={u < slam ? 0.4 * (1 - u / slam) : 0} />
      {[0, 1, 2].map((i) => <rect key={i} x={640 - i * 40} y={860 + i * 44} width={640 + i * 80} height={44} fill={i % 2 ? '#6a5a4a' : '#7a6a58'} />)}
      <Road />
      <g transform={`rotate(${ring} 1010 640)`}>
        <circle cx={1010} cy={680} r={24} fill="none" stroke="#e0b050" strokeWidth={7} />
      </g>
      <Rot a={-88} at={[640, 1000]}>
        <Who look={LOOK.wen} pose={standPose(640, 1000, 0.6, 1)} s={0.6} more={{face: 'pain', swell: 1}} />
      </Rot>
      <Rot a={86} at={[1280, 1010]}>
        <Who look={{...LOOK.yu, sword: false}} pose={standPose(1280, 1010, 0.62, -1)} s={0.62} more={{face: 'pain'}} />
      </Rot>
      {u >= slam && u < slam + 14 && <text x={960} y={560} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={120} fill={L.goldHot} stroke="#2a0a06" strokeWidth={6} paintOrder="stroke">砰！</text>}
      {B < 0 && null}
    </Svg>
  );
};

const STALLS = ['布', '酒', '饼'];
const S20: React.FC<Ctx> = ({t}) => {
  const groups = [380, 960, 1540];
  const notes = ['温钟馗', '逛青楼', '被打掉牙'];
  return (
    <Svg>
      <Sky f={t} mode="day" id="s20" />
      {groups.map((gx, i) => (
        <g key={gx}>
          <rect x={gx - 230} y={560} width={460} height={430} fill="#6a4a30" />
          <path d={`M${gx - 270} 580 L${gx} 500 L${gx + 270} 580 Z`} fill="#b0563a" />
          <text x={gx} y={650} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={60} fill="#f4e6c0">{STALLS[i]}</text>
        </g>
      ))}
      <Road color="#6a5a44" />
      {groups.map((gx, i) =>
        [-110, 0, 110].map((dx, k) => {
          const talker = k === 1;
          const look = (i + k) % 3 === 1 ? (k % 2 ? LOOK.girlB : LOOK.girlP) : {...LOOK.you, robe: CROWD[(i * 3 + k) % 7], robeD: '#2e2620'};
          const sp = standPose(gx + dx, G, 0.52, dx < 0 ? 1 : -1);
          const hd = headOf(sp.hip, sp.neck, 0.52);
          return <Who key={`${i}-${k}`} look={look} pose={{...sp, handN: talker ? ([hd[0] + 50, hd[1] + 30 * Math.sin(t / 4)] as P) : ([hd[0] + (dx < 0 ? 16 : -16), hd[1] + 18] as P)}} s={0.52} more={{face: talker ? 'shout' : 'laugh', mouth: talker ? 0.3 + 0.4 * Math.abs(Math.sin(t / 3)) : 0.3, front: talker}} />;
        }),
      )}
      {Array.from({length: Math.min(9, 1 + Math.floor(t / 8))}, (_, k) => {
        const from = groups[k % 3], to = groups[(k + 1) % 3];
        const p = clamp01(((t - k * 8) % 40) / 30);
        return <Note key={k} x={lerp(from, to, p)} y={560 - 200 * Math.sin(p * Math.PI) - (k % 3) * 40} text={notes[k % 3]} rot={(rand(k) - 0.5) * 20} />;
      })}
    </Svg>
  );
};

const S21: React.FC<Ctx> = ({t, L: Ln}) => {
  const green = clamp01((t - Ln[1]) / 8);
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#100c09" />
        <Paper x={130} y={480} w={520} h={500} p={clamp01(t / 12)} />
        {t > 8 && (
          <>
            <VText x={560} y={570} text="若坊内行者" size={64} glow="坊内" glowOn={green} />
            <VText x={440} y={570} text="不拘此律" size={64} glow="不拘" glowOn={green} />
            <text x={300} y={950} textAnchor="middle" fontFamily={LF.label} fontSize={28} fill="#6a4a2a">《唐律疏议》</text>
          </>
        )}
        <g transform={PLAN_T}>
          <CityPlan f={t} street={`rgb(${lerp(40, 140, clamp01(t / 10))},20,16)`} cell={() => ({fill: `rgb(${lerp(36, 40, green)},${lerp(27, 110, green)},${lerp(20, 50, green)})`, glow: 0.3})} />
        </g>
        {t > 6 && <text x={1310} y={1050} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill={L.red}>大街：犯夜</text>}
        {green > 0 && <text x={1310} y={400} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#8fd08a" opacity={green}>坊里：随便走</text>}
      </Svg>
    </>
  );
};

/** 夹衣角：坊门只剩一条缝，人挤进去，门合上夹住袍角，一扯，撕下一块 */
export const HemScene: React.FC<{t: number; hit: number; st: number}> = ({t, hit, st}) => {
  const gx = 1220;
  const open = st < hit ? lerp(0.24, 0.02, clamp01(st / hit)) : 0;
  const x = Math.min(gx + 60, 380 + st * 30);
  const inside = x > gx - 40;
  const tug = st > hit + 4 ? Math.sin((st - hit - 4) / 1.5) * 10 : 0;
  const tear = clamp01((st - hit - 18) / 14);
  return (
    <Svg>
      <Street f={t} id="s22" tower={0.6 + 0.4 * Math.sin(t / 3)} />
      <WardGate x={gx} bottom={G} w={400} h={460} open={open} />
      {x < gx + 50 && <Who look={LOOK.you} pose={inside ? {...standPose(x, G, 0.74, 1), neck: [x + 6, G - 226 * 0.74 - 200 * 0.74]} : runPose(x, G, t / 10, 0.74, 1)} s={0.74} more={{face: 'shout', mouth: 0.7, kneeBend: -1, elbowBend: -1}} />}
      {/* 门扇（盖住挤进门缝的人） */}
      <WardGate x={gx} bottom={G} w={400} h={460} open={open} inside="rgba(0,0,0,0)" roof={false} />
      {st >= hit - 2 && tear < 1 && <path d={`M${gx} ${G - 150} L${gx - 60 - tug} ${G - 110} L${gx - 40 - tug} ${G - 40} L${gx} ${G - 60} Z`} fill={LOOK.you.robe} stroke="#8a7a60" strokeWidth={3} />}
      {tear > 0 && (
        <g transform={`translate(${-80 * tear} ${150 * easeIn(tear)}) rotate(${-50 * tear} ${gx - 40} ${G - 90})`}>
          <path d={`M${gx - 6} ${G - 150} L${gx - 60} ${G - 110} L${gx - 40} ${G - 40} L${gx - 4} ${G - 60} L${gx - 14} ${G - 90} Z`} fill={LOOK.you.robe} stroke="#8a7a60" strokeWidth={3} />
        </g>
      )}
      {st >= hit && st < hit + 18 && <text x={gx} y={520} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={110} fill={L.goldHot} stroke="#2a0a06" strokeWidth={6} paintOrder="stroke">砰</text>}
      {tear > 0 && tear < 0.6 && <text x={gx - 180} y={G - 200} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={70} fill="#fff2d0">嘶啦</text>}
    </Svg>
  );
};
const S22: React.FC<Ctx> = ({t, hit, st}) => <HemScene t={t} hit={hit} st={st} />;

const S23: React.FC<Ctx> = ({t, L: Ln, B}) => {
  const cut = Math.round(B * 1.8);
  if (t < cut) {
    const sp = standPose(380, G, 0.74, 1);
    return (
      <Svg>
        <InnerStreet f={t} />
        <WardWall x0={0} x1={300} top={500} bottom={G} />
        <Who look={LOOK.you} pose={{...sp, hip: [sp.hip[0] - 10, sp.hip[1]], neck: [sp.neck[0] - 50, sp.neck[1] + 10], handN: [sp.hip[0] + 20, sp.hip[1] + 20], handF: [sp.hip[0] - 50, sp.hip[1] + 10]}} s={0.74} more={{face: 'shock', mouth: 0.5 + 0.2 * Math.sin(t / 2), headTilt: -24}} />
      </Svg>
    );
  }
  const u = t - cut;
  const pts: [P, string, number][] = [
    [planXY(2, 8), '崇仁坊', 0],
    [planXY(3, 9), '东市', 8],
    [planXY(2, 7), '选院', Math.max(16, Ln[1] - cut)],
  ];
  return (
    <Svg>
      <rect width={1920} height={1080} fill="#0d0a08" />
      <g transform={PLAN_T}>
        <CityPlan f={t} cell={(r, c) => (r <= 2 && c >= 4 && c <= 7 ? {fill: '#3a2a1a', glow: 0} : {glow: 0.25})} />
      </g>
      <text x={planXY(1, 5)[0] - 60} y={planXY(1, 5)[1] + 14} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={44} fill="rgba(239,230,214,0.55)">皇城</text>
      {pts.map(([p, name, at], i) => {
        const a = clamp01((u - at) / 6);
        if (a <= 0) return null;
        return (
          <g key={name} opacity={a}>
            <circle cx={p[0]} cy={p[1]} r={46} fill="rgba(255,200,90,0.45)" />
            <circle cx={p[0]} cy={p[1]} r={14} fill={L.goldHot} />
            <text x={p[0] + (i === 2 ? -30 : 30)} y={p[1] + (i === 1 ? 70 : -30)} textAnchor={i === 2 ? 'end' : 'start'} fontFamily={LF.serif} fontWeight={900} fontSize={44} fill={L.ink} stroke="#000" strokeWidth={6} paintOrder="stroke">{name}</text>
          </g>
        );
      })}
      {u > pts[2][2] + 4 && <line x1={pts[0][0][0]} y1={pts[0][0][1]} x2={pts[2][0][0]} y2={pts[2][0][1]} stroke={L.gold} strokeWidth={6} strokeDasharray="10 8" />}
      {u > 12 && <line x1={pts[0][0][0]} y1={pts[0][0][1]} x2={pts[1][0][0]} y2={pts[1][0][1]} stroke={L.gold} strokeWidth={6} strokeDasharray="10 8" />}
    </Svg>
  );
};

const S24: React.FC<Ctx> = ({t, L: Ln}) => {
  const x0 = 200 + t * 3.5;
  const nope = Math.floor(t / 26) % 2 === 1;
  return (
    <Svg>
      <InnerStreet f={t} signs={['邸', '店', '邸', '店', '邸', '店']} />
      <Note x={1180} y={640} text="赁房" rot={-4} />
      <Who look={{...LOOK.you, robe: '#8a7a5a'}} pose={{...standPose(1560, G, 0.6, -1), handN: nope ? ([1490, 640 + 20 * Math.sin(t)] as P) : ([1520, 860] as P)}} s={0.6} more={{face: 'calm', openHands: nope, front: nope}} />
      {nope && <Bubble x={1480} y={560} text="满了" size={40} />}
      {[0, 1, 2].map((i) => {
        const x = x0 - i * 170;
        const wp = walkPose(x, G, t / 18 + i * 0.3, 0.62, 1);
        return (
          <g key={i}>
            <rect x={wp.neck[0] - 70} y={wp.neck[1] + 10} width={50} height={90} fill="#6a4a2a" stroke="#2a1a0a" strokeWidth={3} />
            <Who look={{...LOOK.you, robe: i === 1 ? '#4a7a5a' : '#3a5a7a', robeD: '#2a3a3a'}} pose={wp} s={0.62} more={{face: t > Ln[1] && i === 0 ? 'pain' : 'calm'}} />
          </g>
        );
      })}
      <Mount f={t} x={x0 - 560} y={G} s={0.6} kind="donkey" walk={1} />
      <rect x={x0 - 600} y={G - 190} width={110} height={44} rx={20} fill="#c9b27a" />
    </Svg>
  );
};

const S25: React.FC<Ctx> = ({t, d}) => {
  const zoom = lerp(1.12, 1, easeInOut(clamp01(t / d)));
  return (
    <Svg>
      <g transform={`translate(960 760) scale(${zoom}) translate(-960 -760)`}>
        <InnerStreet f={t} signs={['酒', '饼', '馄', '饨', '茶', '店']} />
        {Array.from({length: 11}, (_, i) => {
          const dir = i % 2 ? 1 : -1;
          const x = ((((i * 197 + t * (2 + (i % 3)) * dir) % 2100) + 2100) % 2100) - 90;
          const g = G - (i % 3) * 8;
          const s = 0.5 + 0.04 * (i % 3);
          const jump = i === 4 && t % 60 > 40 ? Math.sin(((t % 60) - 40) / 20 * Math.PI) * 60 : 0;
          const wp = walkPose(x, g - jump, t / 16 + i * 0.37, s, dir as 1 | -1);
          const look = i % 4 === 2 ? LOOK.girlP : i === 7 ? LOOK.hu : {...LOOK.you, robe: CROWD[i % 7], robeD: '#2e2620', hem: i % 2 ? 110 : 40};
          return (
            <g key={i}>
              {i % 5 === 0 && <Stick from={[x - 90, wp.neck[1] + 10]} to={[x + 90, wp.neck[1] + 10]} w={8} color="#6a4a2a" />}
              {i % 5 === 0 && [x - 90, x + 90].map((bx) => <rect key={bx} x={bx - 26} y={wp.neck[1] + 70} width={52} height={40} fill="#8a6a3a" />)}
              <Who look={look} pose={i % 5 === 0 ? {...wp, handN: [x + 30, wp.neck[1] + 14] as P} : i % 3 === 1 ? {...wp, handN: [x + dir * 60, wp.neck[1] + 40] as P} : wp} s={s} more={{face: jump > 0 ? 'shout' : i % 4 === 0 ? 'shout' : 'smile', mouth: 0.5}} />
              {i % 3 === 1 && <Lamp f={t} x={x + dir * 60} y={wp.neck[1] + 40} s={0.5} seed={i} />}
            </g>
          );
        })}
      </g>
    </Svg>
  );
};

const S26: React.FC<Ctx> = ({t, L: Ln}) => (
  <>
    <Svg opacity={0.35}>
      <InnerStreet f={t} />
    </Svg>
    <Scroll f={t} at={Math.max(0, Ln[1] - 10)} x={1040} y={760} w={900} h={300} colW={130} cols={[{text: '昼夜喧呼', size: 80, at: Ln[1]}, {text: '灯火不绝', size: 80, at: Ln[1] + 14}]} cite="《长安志》卷八 · 崇仁坊" />
  </>
);

export const CityGlow: React.FC<{t: number; hit: number; d: number}> = ({t, hit, d}) => {
  const z = lerp(1.7, 1, easeInOut(clamp01(t / (d * 0.8))));
  const [cx, cy] = cellXY(2, 8);
  const g = clamp01((t - hit + 6) / 10);
  return (
    <Svg>
      <rect width={1920} height={1080} fill="#060403" />
      <g transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy}) translate(0 40)`}>
        <CityPlan f={t} cell={(r, c) => (r === 2 && c === 8 ? {fill: '#ffcf6a', glow: 1 + 2 * g, stroke: L.goldHot} : {fill: '#120d0a', glow: 0, stroke: 'rgba(239,230,214,0.12)'})} />
        <circle cx={cx} cy={cy} r={60 + 220 * g} fill="rgba(255,190,90,0.25)" />
        <circle cx={cx} cy={cy} r={30 + 110 * g} fill="rgba(255,220,140,0.35)" />
        <text x={cx} y={cy - 70} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={40} fill="#fff2d0" stroke="#000" strokeWidth={6} paintOrder="stroke">崇仁坊</text>
      </g>
    </Svg>
  );
};
const S27: React.FC<Ctx> = ({t, hit, d}) => <CityGlow t={t} hit={hit} d={d} />;

const S28: React.FC<Ctx> = ({t, L: Ln}) => {
  const wx = 120 + ((t * 4) % 560);
  const wk = walkPose(wx, G, t / 18, 0.6, 1);
  const give = clamp01((t - Ln[1] - 4) / 10);
  const bowl: P = lp([1430, 760], [1250, 790], give);
  const ysp = standPose(1160, G, 0.72, 1);
  const osp = standPose(1500, G, 0.7, -1);
  return (
    <Svg>
      <rect width={800} height={1080} fill="#05070c" />
      <Road y={G} color="#0d0b0a" />
      <Who look={{...LOOK.guard, sword: true}} pose={{...wk, handN: [wx + 50, wk.neck[1] - 30]}} s={0.6} more={{face: 'stern'}}>
        <Stick from={[wx + 50, wk.neck[1] - 20]} to={[wx + 56, wk.neck[1] - 110]} w={10} color="#4a2a1a" />
        <Torch f={t} x={wx + 56} y={wk.neck[1] - 110} />
      </Who>
      <g>
        <rect x={840} width={1080} height={1080} fill="#2a160c" />
        <rect x={840} width={1080} height={1080} fill="rgba(255,170,80,0.25)" />
        {[980, 1360, 1740].map((x, i) => <Lamp key={x} f={t} x={x} y={430} s={1} seed={i} text={['酒', '汤', '饭'][i]} />)}
        <LowTable x={1720} y={930} w={260} />
        <Who look={{...LOOK.you, robe: CROWD[2]}} pose={kneelPose(1620, G, 0.6, 1)} s={0.6} more={{face: 'laugh'}} />
        <Who look={{...LOOK.you, robe: CROWD[4]}} pose={kneelPose(1840, G, 0.6, -1)} s={0.6} more={{face: 'shout', mouth: 0.4 + 0.3 * Math.sin(t / 3)}} />
        <Who look={{...LOOK.you, robe: '#6a3a2a', hem: 60}} pose={{...osp, handN: [bowl[0] + 20, bowl[1] + 8], handF: [bowl[0] + 40, bowl[1] + 14]}} s={0.7} more={{face: 'smile'}} />
        <Bowl x={bowl[0]} y={bowl[1]} steam={1} f={t} />
        <Who look={LOOK.you} pose={{...ysp, handN: give > 0.9 ? ([bowl[0] - 30, bowl[1] + 10] as P) : ([1210, 820] as P), handF: give > 0.9 ? ([bowl[0] + 24, bowl[1] + 12] as P) : ([1140, 830] as P)}} s={0.72} more={{face: give > 0.9 ? 'smile' : 'calm'}} />
      </g>
      <rect x={780} y={480} width={80} height={600} fill="#5a4430" />
      <rect x={770} y={470} width={100} height={20} fill="#2a1e16" />
    </Svg>
  );
};

/** 夜宴厅：后排宾客跪坐、矮案、高烛台 */
export const Banquet: React.FC<{t: number; burn?: number; drunk?: boolean; skipLi?: boolean; dim?: number}> = ({t, burn = 0, drunk, skipLi, dim = 0}) => {
  const guests: [number, 1 | -1, keyof typeof LOOK | string][] = [[300, 1, 'c1'], [560, 1, 'girlB'], [820, 1, 'li'], [1120, -1, 'girlR'], [1380, -1, 'c3'], [1640, -1, 'c5']];
  return (
    <g>
      <Hall f={t} kind="banquet" floor={820} light={1 - dim} />
      {[180, 700, 1260, 1780].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y={560} width={12} height={300} fill="#6a4a2a" />
          {burn < 1 ? <Candle f={t} x={x} y={566} h={90} burn={burn} seed={i} /> : <g><rect x={x - 9} y={540} width={18} height={26} fill="#e9dcc0" /><path d={`M${x} 540 q${-14 + 6 * Math.sin(t / 8 + i)} -40 0 -80 q14 -40 0 -80`} stroke="rgba(200,210,220,0.45)" strokeWidth={8} fill="none" /></g>}
        </g>
      ))}
      {guests.map(([x, fc, k], i) => {
        if (skipLi && k === 'li') return null;
        const look = LOOK[k as string] ?? {...LOOK.you, robe: CROWD[i % 7], robeD: '#2e2620'};
        if (drunk && k !== 'li')
          return (
            <Rot key={i} a={fc * 80} at={[x, 960]}>
              <Who look={look} pose={standPose(x, 960, 0.56, fc)} s={0.56} more={{face: 'sleepy'}} />
            </Rot>
          );
        return <Who key={i} look={look} pose={kneelPose(x, 940, 0.56, fc)} s={0.56} more={{face: k === 'li' && drunk ? 'sleepy' : i % 2 ? 'smile' : 'laugh'}} />;
      })}
      {[380, 1020, 1520].map((x) => <LowTable key={x} x={x} y={960} w={300} dishes={!drunk} />)}
      {dim > 0 && <rect width={1920} height={1080} fill={`rgba(0,0,0,${dim})`} />}
    </g>
  );
};

const S29: React.FC<Ctx> = ({t, d, L: Ln}) => {
  const z = lerp(1, 1.08, clamp01(t / d));
  return (
    <>
      <Svg>
        <g transform={`translate(960 800) scale(${z}) translate(-960 -800)`}>
          <Banquet t={t} />
        </g>
        <circle cx={850} cy={720} r={90} fill="none" stroke={L.gold} strokeWidth={4} opacity={clamp01((t - 8) / 8)} />
      </Svg>
      <NameTag f={t} at={8} x={1440} y={430} small="晚唐诗人，三十出头" name="李商隐" w={380} />
      {Ln.length < 0 && null}
    </>
  );
};

const S30: React.FC<Ctx> = ({t, L: Ln}) => {
  const li = kneelPose(560, 940, 0.72, 1);
  const her = kneelPose(1360, 940, 0.72, -1);
  const a = headOf(li.hip, li.neck, 0.72), b = headOf(her.hip, her.neck, 0.72);
  const ea: P = [a[0] + 13, a[1] - 1], eb: P = [b[0] - 13, b[1] - 1];
  const p = clamp01((t - Ln[1] + 4) / 14);
  return (
    <Svg>
      <Hall f={t} kind="banquet" floor={820} light={0.6} />
      <rect width={1920} height={1080} fill="rgba(0,0,0,0.35)" />
      <Candle f={t} x={960} y={820} h={110} />
      <Who look={LOOK.li} pose={li} s={0.72} more={{face: 'calm'}} />
      <Who look={LOOK.girlR} pose={her} s={0.72} more={{face: 'smile'}} />
      <LowTable x={720} y={980} w={260} />
      <LowTable x={1200} y={980} w={260} />
      {p > 0 && (
        <g>
          <line x1={ea[0]} y1={ea[1]} x2={lerp(ea[0], eb[0], p)} y2={lerp(ea[1], eb[1], p)} stroke="#ffe08a" strokeWidth={4} style={{filter: 'drop-shadow(0 0 8px #ffc04a)'}} />
          {p >= 1 && <circle cx={(ea[0] + eb[0]) / 2} cy={(ea[1] + eb[1]) / 2} r={10 + 4 * Math.sin(t / 3)} fill="#fff2c0" style={{filter: 'drop-shadow(0 0 12px #ffc04a)'}} />}
        </g>
      )}
    </Svg>
  );
};

const S31: React.FC<Ctx> = ({t, L: Ln, hit}) => {
  if (t < Ln[1]) return <Svg><Banquet t={t} /></Svg>;
  if (t < Ln[2]) {
    const u = t - Ln[1];
    const p = clamp01((u - 6) / 22);
    return (
      <Svg>
        <rect width={1920} height={1080} fill="#2a160c" />
        <rect x={0} y={380} width={1920} height={60} fill="#5a2a18" />
        <rect x={0} y={440} width={1920} height={640} fill="#1a0e08" />
        <path d="M-40 600 Q300 520 700 620 L700 900 Q300 980 -40 900 Z" fill="#4a7a9a" />
        <path d="M1960 600 Q1620 520 1220 620 L1220 900 Q1620 980 1960 900 Z" fill="#a8402e" />
        <ellipse cx={700} cy={760} rx={70} ry={130} fill="#2a4a5a" />
        <ellipse cx={1220} cy={760} rx={70} ry={130} fill="#6a2018" />
        <g transform={`translate(${lerp(720, 1200, easeInOut(p))} ${760 - 60 * Math.sin(p * Math.PI)}) rotate(${p * 360})`}>
          <path d="M-20 -30 Q20 -30 20 0 Q20 30 -10 30" stroke="#e8e8f0" strokeWidth={9} fill="none" strokeLinecap="round" />
        </g>
        <text x={960} y={560} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={50} fill="rgba(239,230,214,0.7)">送钩：钩藏在谁手里？</text>
      </Svg>
    );
  }
  const lift = clamp01((t - hit + 4) / 6);
  const sp = kneelPose(1360, 990, 0.72, -1);
  const drink = clamp01((t - hit - 10) / 8);
  return (
    <Svg>
      <rect width={1920} height={1080} fill="#2a160c" />
      <rect x={0} y={780} width={1920} height={300} fill="#5a2a18" />
      <ellipse cx={700} cy={790} rx={160} ry={24} fill="#3a1a10" />
      <g transform={`translate(0 ${-220 * easeOut(lift)}) rotate(${-20 * lift} 700 780)`}>
        <path d="M560 790 Q560 640 700 630 Q840 640 840 790 Z" fill="#d9cfb8" stroke="#6a5a40" strokeWidth={5} />
      </g>
      {lift > 0.3 && (
        <g>
          <circle cx={700} cy={762} r={30} fill="#9a6a3a" stroke="#4a2a10" strokeWidth={4} />
          <path d="M680 750 q20 -10 40 10 M676 770 q24 6 44 -6" stroke="#4a2a10" strokeWidth={3} fill="none" />
        </g>
      )}
      {t >= hit && t < hit + 14 && <text x={700} y={560} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={110} fill={L.goldHot} stroke="#2a0a06" strokeWidth={6} paintOrder="stroke">当！</text>}
      <Who look={{...LOOK.you, robe: CROWD[6]}} pose={{...standPose(1560, 990, 0.66, -1), handN: [1420, 700 - 10 * drink] as P, handF: [1500, 760] as P}} s={0.66} more={{face: 'laugh'}} />
      <Who look={{...LOOK.you, robe: CROWD[1]}} pose={{...sp, handN: lp([1290, 820], [1300, 740], drink), handF: [1300, 840] as P}} s={0.72} more={{face: drink > 0 ? 'pain' : 'shock', blush: drink, headTilt: -20 * drink}} />
      {drink > 0 && <path d={`M1270 ${730 - 10 * drink} L1330 ${730 - 10 * drink} L1316 ${800 - 10 * drink} L1284 ${800 - 10 * drink} Z`} fill="#c9a24a" stroke="#5a3a20" strokeWidth={3} transform={`rotate(${-40 * drink} 1300 ${760 - 10 * drink})`} />}
      <text x={1360} y={560} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={50} fill="rgba(239,230,214,0.7)">射覆：猜错罚一大杯</text>
    </Svg>
  );
};

export const SCENES_A: Record<number, React.FC<Ctx>> = {6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13, 14: S14, 15: S15, 16: S16, 17: S17, 18: S18, 19: S19, 20: S20, 21: S21, 22: S22, 23: S23, 24: S24, 25: S25, 26: S26, 27: S27, 28: S28, 29: S29, 30: S30, 31: S31};
