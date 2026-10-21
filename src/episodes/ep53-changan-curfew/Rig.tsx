import React from 'react';

/**
 * 唐代人物骨骼：髋、颈、头三点定躯干，手脚给目标点，肘、膝用两段反解（IK）算出来，四肢长度固定、不会拉长或断开。
 * 比例（scale = 1）：头高 84、躯干 200、上臂 96 + 前臂 92、大腿 118 + 小腿 112。
 */
export type P = [number, number];
export const SKIN = '#e6c9a0';
export const SKIN_D = '#c9a57a';
const HAT = '#1b1512';
const BOOT = '#151110';

const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
const len = (a: P) => Math.hypot(a[0], a[1]);

/** 两段 IK：root → target，段长 a、b；bend = 1 / -1 决定关节往哪边弯。返回 [关节, 末端]（够不着时末端停在最远处） */
export const ik = (root: P, target: P, a: number, b: number, bend: 1 | -1): [P, P] => {
  const v = sub(target, root);
  const d0 = len(v);
  const d = Math.max(Math.abs(a - b) + 1, Math.min(a + b - 0.5, d0));
  const base = Math.atan2(v[1], v[0]);
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const al = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const j: P = [root[0] + a * Math.cos(base + bend * al), root[1] + a * Math.sin(base + bend * al)];
  const end: P = [root[0] + d * Math.cos(base), root[1] + d * Math.sin(base)];
  return [j, end];
};

const Seg: React.FC<{pts: P[]; w: number; color: string}> = ({pts, w, color}) => (
  <path d={`M${pts.map((p) => p.join(' ')).join(' L')}`} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
);

/** 手：顺着前臂方向的拳 / 掌 + 拇指 */
const Hand: React.FC<{at: P; from: P; s: number; color?: string; open?: boolean}> = ({at, from, s, color = SKIN, open}) => {
  const ang = (Math.atan2(at[1] - from[1], at[0] - from[0]) * 180) / Math.PI;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${ang}) scale(${s})`}>
      <ellipse cx={6} cy={0} rx={open ? 20 : 16} ry={open ? 12 : 13} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
      <ellipse cx={0} cy={-11} rx={8} ry={5} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
      {open && [-6, 0, 6].map((y) => <line key={y} x1={14} y1={y} x2={30} y2={y * 1.3} stroke={color} strokeWidth={6} strokeLinecap="round" />)}
    </g>
  );
};

/** 靴：脚尖朝 facing */
const Boot: React.FC<{at: P; knee: P; s: number; facing: number}> = ({at, knee, s, facing}) => {
  const ang = (Math.atan2(at[1] - knee[1], at[0] - knee[0]) * 180) / Math.PI - 90;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${ang}) scale(${facing * s} ${s})`}>
      <path d="M-14 -16 L-14 6 Q-14 14 -4 14 L34 14 Q40 14 38 6 Q30 -6 14 -8 L14 -16 Z" fill={BOOT} />
    </g>
  );
};

export type Face = 'calm' | 'shout' | 'pain' | 'stern' | 'shock' | 'smile' | 'laugh' | 'sleepy';
export type Hat = 'futou' | 'bun' | 'twin' | 'felt' | 'none';

/** 侧脸（朝 facing）或正脸（front） */
const Head: React.FC<{at: P; s: number; facing: number; face: Face; front?: boolean; tilt?: number; mouth?: number; cap?: Hat; beard?: boolean; blush?: number; swell?: number; hair?: string; beardC?: string}> = ({at, s, facing, face, front, tilt = 0, mouth = 0, cap = 'futou', beard, blush = 0, swell = 0, hair = '#15100d', beardC = '#2a1f18'}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${tilt}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={front ? 38 : 36} ry={42} fill={SKIN} stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
    {!front && <ellipse cx={-facing * 6} cy={4} rx={7} ry={10} fill={SKIN_D} />}
    {cap === 'futou' && (
      <>
        <path d="M-39 -6 Q-40 -50 0 -54 Q40 -50 39 -6 Q20 -16 0 -16 Q-20 -16 -39 -6 Z" fill={HAT} />
        <ellipse cx={-facing * 4} cy={-56} rx={18} ry={14} fill={HAT} />
        <path d={`M${-facing * 34} -14 q${-facing * 26} 14 ${-facing * 30} 58`} stroke={HAT} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M${-facing * 30} -10 q${-facing * 16} 20 ${-facing * 14} 54`} stroke={HAT} strokeWidth={6} fill="none" strokeLinecap="round" />
      </>
    )}
    {cap === 'bun' && (
      <>
        <path d="M-39 -2 Q-42 -50 0 -52 Q42 -50 39 -2 Q30 -26 0 -28 Q-30 -26 -39 -2 Z" fill={hair} />
        <ellipse cx={0} cy={-70} rx={30} ry={24} fill={hair} />
        <ellipse cx={-facing * 8} cy={-92} rx={16} ry={12} fill={hair} />
        <circle cx={facing * 22} cy={-66} r={5} fill="#e9c46a" />
      </>
    )}
    {cap === 'twin' && (
      <>
        <path d="M-39 -2 Q-42 -50 0 -52 Q42 -50 39 -2 Q30 -26 0 -28 Q-30 -26 -39 -2 Z" fill={hair} />
        <circle cx={-30} cy={-50} r={17} fill={hair} />
        <circle cx={30} cy={-50} r={17} fill={hair} />
      </>
    )}
    {cap === 'felt' && (
      <>
        <path d="M-42 -8 L-30 -40 L0 -96 L30 -40 L42 -8 Q0 -20 -42 -8 Z" fill="#7a3a2a" />
        <path d="M-44 -8 Q0 -22 44 -8 L44 0 Q0 -12 -44 0 Z" fill="#c9a24a" />
      </>
    )}
    {beard && <path d={`M-24 18 Q-20 56 ${facing * 8} 70 Q24 56 26 18 Q0 34 -24 18 Z`} fill={beardC} opacity={0.92} />}
    {swell > 0 && <ellipse cx={front ? -18 : facing * 14} cy={14} rx={26 * swell + 4} ry={22 * swell + 4} fill="#d98a6a" opacity={0.85} />}
    {blush > 0 && (
      <>
        <ellipse cx={front ? -22 : facing * 12} cy={12} rx={14} ry={8} fill="#e0604a" opacity={0.6 * blush} />
        {front && <ellipse cx={22} cy={12} rx={14} ry={8} fill="#e0604a" opacity={0.6 * blush} />}
      </>
    )}
    {front ? (
      <>
        {face === 'smile' || face === 'laugh' || face === 'sleepy' ? (
          <path d={face === 'sleepy' ? 'M-22 2 h14 M8 2 h14' : 'M-22 4 q7 -8 14 0 M8 4 q7 -8 14 0'} stroke="#1b1410" strokeWidth={4.5} fill="none" strokeLinecap="round" />
        ) : face === 'pain' ? (
          <>
            <path d="M-24 -4 l13 7 l-13 7 M24 -4 l-13 7 l13 7" stroke="#1b1410" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M-28 -16 l14 5 M28 -16 l-14 5" stroke="#1b1410" strokeWidth={4} strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={-14} cy={2} r={5} fill="#1b1410" />
            <circle cx={14} cy={2} r={5} fill="#1b1410" />
          </>
        )}
        <path d="M0 6 q-5 10 0 13" stroke={SKIN_D} strokeWidth={4} fill="none" />
        {face === 'smile' ? <path d="M-12 24 q12 10 24 0" stroke="#5a1a14" strokeWidth={4} fill="none" strokeLinecap="round" /> : face === 'calm' || face === 'stern' || face === 'sleepy' ? <line x1={-10} y1={26} x2={10} y2={26} stroke="#1b1410" strokeWidth={4} strokeLinecap="round" /> : <ellipse cx={0} cy={27} rx={13} ry={4 + 10 * Math.max(mouth, face === 'laugh' ? 0.6 : 0)} fill="#5a1a14" />}
      </>
    ) : (
      <>
        <path d={`M${facing * 36} -4 q${facing * 9} 9 ${facing * 1} 14`} fill={SKIN} stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
        {face === 'laugh' || face === 'sleepy' ? (
          <path d={`M${facing * 12} -2 q${facing * 6} -6 ${facing * 12} 0`} stroke="#1b1410" strokeWidth={4} fill="none" strokeLinecap="round" />
        ) : face === 'pain' || face === 'shock' ? (
          <path d={`M${facing * 12} -6 l${facing * 12} 5 l${-facing * 12} 5`} stroke="#1b1410" strokeWidth={4} fill="none" strokeLinecap="round" />
        ) : (
          <circle cx={facing * 18} cy={-2} r={4.5} fill="#1b1410" />
        )}
        <path d={`M${facing * 8} ${face === 'stern' ? -14 : -16} l${facing * 22} ${face === 'stern' ? 4 : -3}`} stroke="#1b1410" strokeWidth={4} strokeLinecap="round" />
        {face === 'smile' ? (
          <path d={`M${facing * 12} 20 q${facing * 8} 8 ${facing * 18} 0`} stroke="#5a1a14" strokeWidth={4} fill="none" strokeLinecap="round" />
        ) : face === 'shout' || face === 'pain' || face === 'shock' || face === 'laugh' ? (
          <ellipse cx={facing * 22} cy={22} rx={8} ry={4 + 8 * Math.max(mouth, face === 'shock' ? 0.6 : 0.3)} fill="#5a1a14" />
        ) : (
          <line x1={facing * 14} y1={22} x2={facing * 28} y2={21} stroke="#1b1410" strokeWidth={4} strokeLinecap="round" />
        )}
      </>
    )}
  </g>
);

export type RigProps = {
  hip: P; neck: P; // 躯干两端
  handN: P; handF: P; footN: P; footF: P; // 近侧 / 远侧手脚目标
  facing?: 1 | -1;
  s?: number;
  robe?: string; robeD?: string; pants?: string;
  hem?: number; // 衣摆从髋往下的长度：圆领袍 ≈ 120，短袄 ≈ 30
  face?: Face; front?: boolean; headTilt?: number; mouth?: number;
  elbowBend?: 1 | -1; kneeBend?: 1 | -1;
  sword?: boolean; openHands?: boolean;
  headAt?: P; // 不给就沿躯干方向往上
  children?: React.ReactNode; // 画在近侧胳膊之前（比如手里握的东西）
  hat?: Hat; beard?: boolean; blush?: number; swell?: number; hair?: string; beardC?: string;
  skirt?: boolean; shawl?: string; // 女子：长裙到脚、披帛
  kneeN?: P; kneeF?: P; elbowN?: P; elbowF?: P; // 直接指定关节（坐、跪、骑）
  opacity?: number;
};

export const Rig: React.FC<RigProps> = ({
  hip, neck, handN, handF, footN, footF, facing = 1, s = 1, robe = '#2e3a4a', robeD = '#222b37', pants = '#3a2f26', hem = 120,
  face = 'calm', front, headTilt = 0, mouth = 0, elbowBend, kneeBend, sword, openHands, headAt, children,
  hat = 'futou', beard, blush, swell, hair, beardC, skirt, shawl, kneeN, kneeF, elbowN, elbowF, opacity = 1,
}) => {
  const UA = 96 * s, FA = 92 * s, TH = 118 * s, SH = 112 * s;
  const t = sub(neck, hip);
  const tl = len(t);
  const u = mul(t, 1 / tl); // 髋 → 颈
  const nrm: P = [-u[1], u[0]];
  const shN = add(neck, add(mul(nrm, 6 * s * facing), mul(u, -16 * s)));
  const shF = add(neck, add(mul(nrm, -6 * s * facing), mul(u, -10 * s)));
  const hipN = add(hip, mul(nrm, 8 * s * facing));
  const hipF = add(hip, mul(nrm, -8 * s * facing));
  const eb = elbowBend ?? (facing === 1 ? 1 : -1);
  const kb = kneeBend ?? (facing === 1 ? -1 : 1);
  const [elN, hN] = elbowN ? [elbowN, handN] : ik(shN, handN, UA, FA, eb);
  const [elF, hF] = elbowF ? [elbowF, handF] : ik(shF, handF, UA, FA, eb);
  const [knN, fN] = kneeN ? [kneeN, footN] : ik(hipN, footN, TH, SH, kb);
  const [knF, fF] = kneeF ? [kneeF, footF] : ik(hipF, footF, TH, SH, kb);
  const head = headAt ?? add(neck, mul(u, 58 * s));
  const w0 = 44 * s, w1 = (skirt ? 34 : 38) * s, w2 = (skirt ? 78 : 62) * s;
  const hemLen = skirt ? Math.max(hem, Math.abs(Math.max(fN[1], fF[1]) - hip[1]) / s - 6) : hem;
  const hemP = add(hip, mul(u, -hemLen * s));
  const robeD_ = `M${add(neck, mul(nrm, w0)).join(' ')} Q${add(neck, mul(u, 12 * s)).join(' ')} ${add(neck, mul(nrm, -w0)).join(' ')} L${add(hip, mul(nrm, -w1)).join(' ')} L${add(hemP, mul(nrm, -w2)).join(' ')} L${add(hemP, mul(nrm, w2)).join(' ')} L${add(hip, mul(nrm, w1)).join(' ')} Z`;
  return (
    <g opacity={opacity}>
      {/* 远侧：腿、胳膊（暗一档） */}
      <Seg pts={[hipF, knF, fF]} w={34 * s} color={pants} />
      <Boot at={fF} knee={knF} s={s} facing={facing} />
      <Seg pts={[shF, elF, hF]} w={27 * s} color={robeD} />
      <Hand at={hF} from={elF} s={s} color={SKIN_D} open={openHands} />
      {/* 近侧腿 */}
      <Seg pts={[hipN, knN, fN]} w={36 * s} color={pants} />
      <Boot at={fN} knee={knN} s={s} facing={facing} />
      {/* 袍 */}
      <path d={robeD_} fill={robe} stroke="rgba(0,0,0,0.35)" strokeWidth={3} strokeLinejoin="round" />
      {[-0.5, 0, 0.5].map((k) => (
        <line key={k} x1={add(hip, mul(nrm, k * w1)).join(' ').split(' ')[0]} y1={add(hip, mul(nrm, k * w1))[1]} x2={add(hemP, mul(nrm, k * w2 * 1.1))[0]} y2={add(hemP, mul(nrm, k * w2 * 1.1))[1]} stroke="rgba(0,0,0,0.22)" strokeWidth={3} />
      ))}
      <Seg pts={[add(hip, add(mul(nrm, w1 + 4), mul(u, 8 * s))), add(hip, add(mul(nrm, -w1 - 4), mul(u, 8 * s)))]} w={11 * s} color="#5a3a20" />
      {sword && <Seg pts={[add(hip, mul(nrm, -facing * 20 * s)), add(add(hip, mul(nrm, -facing * 110 * s)), mul(u, -60 * s))]} w={10 * s} color="#0e0c0b" />}
      {shawl && <path d={`M${add(neck, mul(nrm, 40 * s)).join(' ')} Q${add(neck, mul(u, -60 * s)).join(' ')} ${add(neck, mul(nrm, -40 * s)).join(' ')} L${add(add(hip, mul(nrm, -60 * s)), mul(u, -40 * s)).join(' ')}`} stroke={shawl} strokeWidth={10 * s} fill="none" strokeLinecap="round" opacity={0.9} />}
      {/* 圆领 + 脖子 + 头 */}
      <Seg pts={[neck, add(neck, mul(u, 22 * s))]} w={20 * s} color={SKIN} />
      <Head at={head} s={s} facing={facing} face={face} front={front} tilt={headTilt} mouth={mouth} cap={hat} beard={beard} blush={blush} swell={swell} hair={hair} beardC={beardC} />
      <path d={`M${add(neck, mul(nrm, 22 * s)).join(' ')} Q${add(neck, mul(u, -10 * s)).join(' ')} ${add(neck, mul(nrm, -22 * s)).join(' ')}`} stroke="rgba(0,0,0,0.35)" strokeWidth={4} fill="none" />
      {children}
      {/* 近侧胳膊 */}
      <Seg pts={[shN, elN, hN]} w={29 * s} color={robe} />
      <Hand at={hN} from={elN} s={s} open={openHands} />
    </g>
  );
};

/** 跑步姿势：phase 0–1 一个周期；返回 Rig 需要的关节 */
export const runPose = (x: number, ground: number, phase: number, s = 1, facing: 1 | -1 = 1) => {
  const a = Math.sin(phase * Math.PI * 2);
  const b = Math.cos(phase * Math.PI * 2);
  const hip: P = [x, ground - 222 * s + 8 * s * Math.abs(b)];
  const neck: P = [x + facing * 34 * s, hip[1] - 196 * s];
  return {
    hip, neck, facing,
    footN: [x + facing * 90 * s * a, ground - Math.max(0, 50 * s * b)] as P,
    footF: [x - facing * 90 * s * a, ground - Math.max(0, -50 * s * b)] as P,
    handN: [neck[0] - facing * 70 * s * a + facing * 20 * s, neck[1] + 150 * s - 30 * s * Math.abs(a)] as P,
    handF: [neck[0] + facing * 70 * s * a + facing * 20 * s, neck[1] + 150 * s - 30 * s * Math.abs(a)] as P,
  };
};

/** 站姿 */
export const standPose = (x: number, ground: number, s = 1, facing: 1 | -1 = 1) => {
  const hip: P = [x, ground - 226 * s];
  const neck: P = [x + facing * 4 * s, hip[1] - 200 * s];
  return {hip, neck, facing, footN: [x + facing * 26 * s, ground] as P, footF: [x - facing * 20 * s, ground] as P, handN: [x + facing * 30 * s, hip[1] + 40 * s] as P, handF: [x - facing * 24 * s, hip[1] + 36 * s] as P};
};

/** 双手握棍抡打：肩 S、打击点 T、lift 0–1 抡起；返回两只手、棍尾、棍头（棍子从头顶抡过来） */
export const swing = (S: P, T: P, lift: number, s = 1, facing: 1 | -1 = 1, reach = 0.5) => {
  const hHit: P = [S[0] + (T[0] - S[0]) * reach, S[1] + (T[1] - S[1]) * reach];
  const hUp: P = [S[0] - facing * 50 * s, S[1] - 150 * s];
  const hand: P = [hHit[0] + (hUp[0] - hHit[0]) * lift, hHit[1] + (hUp[1] - hHit[1]) * lift];
  const L0 = Math.hypot(T[0] - hHit[0], T[1] - hHit[1]);
  let aHit = Math.atan2(T[1] - hHit[1], T[0] - hHit[0]);
  const aUp = facing === -1 ? -1.15 : -Math.PI + 1.15;
  if (facing === -1 && aHit > 0) aHit -= Math.PI * 2;
  const a = aHit + (aUp - aHit) * lift;
  const d: P = [Math.cos(a), Math.sin(a)];
  return {hand, hand2: [hand[0] + d[0] * 26 * s, hand[1] + d[1] * 26 * s] as P, butt: [hand[0] - d[0] * 30 * s, hand[1] - d[1] * 30 * s] as P, tip: [hand[0] + d[0] * L0, hand[1] + d[1] * L0] as P};
};

/** 一根棍：棍尾 → 棍头，head 给颜色就画鼓槌头 */
export const Stick: React.FC<{from: P; to: P; w: number; color: string; head?: string; hr?: number}> = ({from, to, w, color, head, hr = 16}) => (
  <g>
    <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
    {head && <circle cx={to[0]} cy={to[1]} r={hr} fill={head} />}
  </g>
);

/** 走路：phase 0–1 一个周期 */
export const walkPose = (x: number, ground: number, phase: number, s = 1, facing: 1 | -1 = 1) => {
  const a = Math.sin(phase * Math.PI * 2);
  const b = Math.cos(phase * Math.PI * 2);
  const hip: P = [x, ground - 226 * s + 5 * s * Math.abs(b)];
  const neck: P = [x + facing * 10 * s, hip[1] - 200 * s];
  return {
    hip, neck, facing,
    footN: [x + facing * 48 * s * a, ground - Math.max(0, 24 * s * b)] as P,
    footF: [x - facing * 48 * s * a, ground - Math.max(0, -24 * s * b)] as P,
    handN: [x - facing * 34 * s * a + facing * 10 * s, hip[1] + 30 * s] as P,
    handF: [x + facing * 34 * s * a, hip[1] + 30 * s] as P,
  };
};

/** 跪坐（席地）：膝盖着地朝前，脚压在臀下 */
export const kneelPose = (x: number, ground: number, s = 1, facing: 1 | -1 = 1) => {
  const hip: P = [x, ground - 86 * s];
  const neck: P = [x + facing * 8 * s, hip[1] - 200 * s];
  const kn: P = [x + facing * 104 * s, ground - 18 * s];
  return {hip, neck, facing, kneeN: kn, kneeF: [kn[0] - facing * 10 * s, kn[1]] as P, footN: [x - facing * 18 * s, ground - 12 * s] as P, footF: [x - facing * 28 * s, ground - 12 * s] as P, handN: [x + facing * 90 * s, hip[1] - 14 * s] as P, handF: [x + facing * 76 * s, hip[1] - 10 * s] as P, hem: 70};
};

/** 坐凳子：凳面高 seat（相对地面，scale 1 约 120） */
export const stoolPose = (x: number, ground: number, s = 1, facing: 1 | -1 = 1, seat = 120) => {
  const hip: P = [x, ground - seat * s - 14 * s];
  const neck: P = [x + facing * 6 * s, hip[1] - 200 * s];
  const kn: P = [x + facing * 112 * s, hip[1] - 4 * s];
  return {hip, neck, facing, kneeN: kn, kneeF: [kn[0] - facing * 12 * s, kn[1]] as P, footN: [kn[0] + facing * 6 * s, ground] as P, footF: [kn[0] - facing * 8 * s, ground] as P, handN: [x + facing * 90 * s, hip[1] - 40 * s] as P, handF: [x + facing * 80 * s, hip[1] - 30 * s] as P};
};

/** 骑乘：back 为鞍点（mountBack 算出），人 s */
export const ridePose = (back: P, s = 1, facing: 1 | -1 = 1, bob = 0) => {
  const hip: P = [back[0] - facing * 6 * s, back[1] - 14 * s + bob];
  const neck: P = [hip[0] + facing * 10 * s, hip[1] - 198 * s];
  const kn: P = [hip[0] + facing * 70 * s, hip[1] + 50 * s];
  return {hip, neck, facing, kneeN: kn, kneeF: [kn[0] - facing * 8 * s, kn[1] - 4 * s] as P, footN: [kn[0] - facing * 6 * s, kn[1] + 108 * s] as P, footF: [kn[0] - facing * 14 * s, kn[1] + 100 * s] as P, handN: [hip[0] + facing * 120 * s, hip[1] - 30 * s] as P, handF: [hip[0] + facing * 110 * s, hip[1] - 24 * s] as P, hem: 90};
};
