import React from 'react';
import {clamp01, easeIn, lerp, rand} from '../../library/anim';
import {LF} from '../../library/lamplight/theme';
import {P, Rig} from './Rig';

/**
 * 犯夜挨笞（Rig 版）：夜里大街，坊墙 + 紧闭坊门，火把。侧面平视。
 * 小贩脸朝下趴在街面（无刑凳），短袄，屁股鼓起朝上、正对镜头，头扭向镜头喊疼；
 * 按肩武侯单膝跪在身后、双手压住两肩；按脚武侯跪在脚后、双手攥住脚踝；行刑武侯站在身后、双手握笞；队正举火把唱数。
 * 两个按人的武侯画在小贩身后，手单独再画一遍盖在小贩身上，所以手真正落在肩膀和脚踝上、不挡屁股。
 */
const G = 880; // 地面
const BACK = G - 40; // 身后那排人的脚
const WU = {robe: '#2e3a4a', robeD: '#222b37', pants: '#2a2622'};

/** 火把：木柄 + 火苗 + 一圈暖光 */
const Torch: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => (
  <g>
    <circle cx={x} cy={y - 30} r={260} fill="url(#ps-glow)" />
    <line x1={x - 20} y1={y + 120} x2={x} y2={y - 10} stroke="#6b4422" strokeWidth={14} strokeLinecap="round" />
    <path d={`M${x - 22} ${y - 6} Q${x - 30 + 6 * Math.sin(f / 2)} ${y - 70} ${x + 4 * Math.sin(f / 3)} ${y - 120 - 10 * Math.sin(f / 2.2)} Q${x + 30} ${y - 60} ${x + 20} ${y - 6} Z`} fill="#ff9a3a" />
    <path d={`M${x - 10} ${y - 8} Q${x - 12} ${y - 50} ${x + 2 * Math.sin(f / 2)} ${y - 80} Q${x + 14} ${y - 44} ${x + 10} ${y - 8} Z`} fill="#ffe2a0" />
  </g>
);

const CN = ['一', '二', '三', '四', '五', '六', '七', '八'];

export const PunishScene: React.FC<{f: number; hits: number[]}> = ({f, hits}) => {
  const n = hits.filter((h) => f >= h).length;
  const last = hits.filter((h) => h <= f).pop();
  const next = hits.find((h) => h > f);
  const since = last === undefined ? 99 : f - last;
  const toNext = next === undefined ? 99 : next - f;
  const lift = since < 3 ? 0 : toNext <= 5 ? easeIn(toNext / 5) : Math.min(1, (since - 3) / 5);
  const pain = since < 12 ? Math.exp(-since / 4) : 0;
  const kick = since < 10 ? Math.sin((since / 10) * Math.PI) : 0;
  const red = clamp01(n / hits.length);

  // —— 小贩：头在左，趴平 ——
  const s = 1.2;
  const jolt = 6 * pain;
  const mNeck: P = [610, G - 60 - jolt];
  const mHip: P = [850, G - 62];
  const mHead: P = [528, G - 58 - 10 * pain];
  const ankN: P = [1118, G - 26 - 10 * kick];
  const ankF: P = [1126, G - 34 - 14 * kick];
  const B: P = [872, G - 158]; // 屁股顶
  const swell = 1 + 0.14 * red + 0.1 * pain;
  const buttCol = `rgb(${Math.round(lerp(160, 214, red))},${Math.round(lerp(138, 70, red))},${Math.round(lerp(106, 56, red))})`;

  // —— 按肩武侯：单膝跪，身子前倾，双手压两肩 ——
  const shoulderTop: [P, P] = [[640, G - 108 - jolt], [684, G - 110 - jolt]];
  const presser = (
    <Rig hip={[800, G - 172]} neck={[690, G - 332]} handN={shoulderTop[0]} handF={shoulderTop[1]} footN={[690, G - 6]} footF={[930, G - 8]} facing={-1} s={1.15} {...WU} face="stern" headTilt={-18} sword />
  );
  // —— 按脚武侯：双膝跪在脚后，双手攥住脚踝 ——
  const holder = (
    <Rig hip={[1262, G - 140]} neck={[1146, G - 262]} handN={[ankN[0] - 14, ankN[1] - 10]} handF={[ankF[0] + 6, ankF[1] - 14]} footN={[1384, G - 6]} footF={[1366, G - 8]} facing={-1} s={1.15} {...WU} face="stern" headTilt={-14} />
  );
  // —— 行刑武侯：站在身后，双手握笞，从后上方抡下 ——
  const hHit: P = [952, G - 340];
  const hUp: P = [1070, G - 640];
  const hands: P = [lerp(hHit[0], hUp[0], lift), lerp(hHit[1], hUp[1], lift)];
  const angHit = Math.atan2(B[1] - hHit[1], B[0] - hHit[0]) - Math.PI * 2;
  const ang = lerp(angHit, -1.15, lift);
  const SL = 222;
  const dir: P = [Math.cos(ang), Math.sin(ang)];
  const tip: P = [hands[0] + dir[0] * SL, hands[1] + dir[1] * SL];
  const butt: P = [hands[0] - dir[0] * 34, hands[1] - dir[1] * 34];
  const nx = -dir[1], ny = dir[0];
  const stick = (
    <path d={`M${butt[0] + nx * 8} ${butt[1] + ny * 8} L${tip[0] + nx * 3.5} ${tip[1] + ny * 3.5} L${tip[0] - nx * 3.5} ${tip[1] - ny * 3.5} L${butt[0] - nx * 8} ${butt[1] - ny * 8} Z`} fill="#b08850" stroke="#6b4a22" strokeWidth={2} />
  );
  const exec = (
    <Rig hip={[1018, BACK - 262]} neck={[1000, BACK - 492]} handN={[hands[0] + dir[0] * 4, hands[1] + dir[1] * 4]} handF={[hands[0] + dir[0] * 30, hands[1] + dir[1] * 30]} footN={[985, BACK]} footF={[1050, BACK]} facing={-1} s={1.15} {...WU} face={lift < 0.3 ? 'shout' : 'stern'} mouth={0.5} sword>
      {stick}
    </Rig>
  );
  // —— 队正：举火把唱数 ——
  const tHand: P = [1556, BACK - 470];
  const captain = (
    <Rig hip={[1640, BACK - 250]} neck={[1636, BACK - 478]} handN={tHand} handF={[1606, BACK - 230]} footN={[1610, BACK]} footF={[1676, BACK]} facing={-1} s={1.1} robe="#4a3a2a" robeD="#3a2d20" pants="#2a2420" face="shout" mouth={pain} sword>
      <Torch f={f} x={tHand[0] + 10} y={tHand[1] - 55} />
    </Rig>
  );

  const push = clamp01((f - hits[hits.length - 1]) / 18);
  const zs = 1 + 0.35 * push;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${zs})`, transformOrigin: `${B[0]}px ${B[1]}px`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="ps-glow">
            <stop offset="0%" stopColor="rgba(255,180,90,0.55)" />
            <stop offset="100%" stopColor="rgba(255,150,60,0)" />
          </radialGradient>
          <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#07080c" />
            <stop offset="100%" stopColor="#161210" />
          </linearGradient>
          <clipPath id="ps-clipA"><rect x={590} y={G - 180} width={140} height={110} /></clipPath>
          <clipPath id="ps-clipB"><rect x={1060} y={G - 110} width={110} height={110} /></clipPath>
          <clipPath id="ps-clipS"><rect x={700} y={G - 230} width={300} height={200} /></clipPath>
        </defs>
        <rect width={1920} height={1080} fill="url(#ps-sky)" />
        {/* 远处鼓楼一点灯 */}
        <path d="M1500 300 L1560 270 L1620 300 Z" fill="#14100d" />
        <rect x={1515} y={300} width={90} height={120} fill="#14100d" />
        <rect x={1540} y={320} width={40} height={20} fill="rgba(255,190,90,0.7)" />
        {/* 坊墙：夯土，横向夯层 */}
        <rect x={0} y={380} width={1920} height={G - 380} fill="#3a2c20" />
        {Array.from({length: 9}, (_, i) => (
          <line key={i} x1={0} x2={1920} y1={420 + i * 52} y2={420 + i * 52 + (i % 2) * 3} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
        ))}
        <rect x={0} y={366} width={1920} height={20} fill="#2a2018" />
        {/* 紧闭的坊门 */}
        <rect x={120} y={470} width={380} height={G - 470} fill="#4a2216" stroke="#2a120c" strokeWidth={8} />
        <line x1={310} y1={470} x2={310} y2={G} stroke="#2a120c" strokeWidth={6} />
        {Array.from({length: 5}, (_, r) => Array.from({length: 4}, (_, c) => <circle key={`${r}${c}`} cx={160 + c * 46 + (c > 1 ? 50 : 0)} cy={510 + r * 72} r={8} fill="#c99a48" />))}
        <rect x={286} y={640} width={48} height={22} rx={4} fill="#1a1512" />
        {/* 夯土路面 */}
        <rect x={0} y={G} width={1920} height={1080 - G} fill="#1f1812" />
        {Array.from({length: 30}, (_, i) => (
          <circle key={i} cx={rand(i) * 1920} cy={G + 20 + rand(i + 50) * 170} r={2 + 3 * rand(i + 9)} fill="rgba(255,230,190,0.06)" />
        ))}
        {/* 掉在地上的扁担筐、胡饼 */}
        <line x1={260} y1={G + 40} x2={520} y2={G + 10} stroke="#6b4422" strokeWidth={12} strokeLinecap="round" />
        <path d={`M200 ${G + 70} Q240 ${G + 10} 300 ${G + 40} L290 ${G + 80} Z`} fill="#8a6a3a" />
        {[[330, 40], [380, 60], [440, 30], [520, 70]].map(([cx, cy], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={G + cy} rx={26} ry={10} fill="#c98f48" />
            <ellipse cx={cx} cy={G + cy - 2} rx={18} ry={6} fill="#e0aa60" />
          </g>
        ))}
        
        {/* 身后一排：队正、行刑武侯、按肩武侯、按脚武侯 */}
        {captain}
        {exec}
        {presser}
        {holder}
        {/* 趴着的小贩 */}
        <ellipse cx={830} cy={G + 4} rx={360} ry={16} fill="rgba(0,0,0,0.45)" />
        <Rig hip={mHip} neck={mNeck} headAt={mHead} handN={[834, G - 18]} handF={[470, G - 16]} footN={ankN} footF={ankF} facing={-1} s={s} robe="#8a7356" robeD="#6e5c45" pants="#a08a6a" hem={30} face="pain" front headTilt={-12 - 8 * pain} mouth={0.3 + 0.7 * pain} elbowBend={1} kneeBend={1} openHands />
        {/* 鼓起的屁股 */}
        <g transform={`translate(${B[0]} ${G - 98}) scale(${1 + 0.05 * pain} ${swell})`}>
          <path d="M-128 64 C-108 -6 -50 -60 6 -60 C70 -60 118 -14 140 50 L140 74 L-128 74 Z" fill={buttCol} stroke="rgba(0,0,0,0.35)" strokeWidth={3} />
          {Array.from({length: Math.min(6, n)}, (_, i) => (
            <path key={i} d={`M${-50 + i * 22} ${-42 + (i % 2) * 6} q14 34 4 72`} stroke="#ff4a36" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.85} />
          ))}
          {red > 0.5 && <ellipse cx={4} cy={-10} rx={80} ry={36} fill="#ff5a40" opacity={0.25 + 0.2 * Math.sin(f / 2.5)} />}
          <path d="M-46 -38 Q0 -48 46 -36" stroke="rgba(255,255,255,0.25)" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        {/* 飙泪、汗 */}
        {pain > 0.05 && [-1, 1].map((k) => (
          <path key={k} d={`M${mHead[0] + k * 34} ${mHead[1] + 4} q${k * 34 * pain} ${-24 * pain} ${k * 66 * pain} ${12 * pain}`} stroke="#9fd3ff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={pain} />
        ))}
        <path d={`M${mHead[0] + 48} ${mHead[1] - 40} q8 10 0 16 q-8 -6 0 -16 Z`} fill="#9fd3ff" opacity={0.8} />
        {/* 两个武侯的手盖在肩膀、脚踝上 */}
        <g clipPath="url(#ps-clipA)">{presser}</g>
        <g clipPath="url(#ps-clipB)">{holder}</g>
        {/* 笞落在屁股上那一截 */}
        <g clipPath="url(#ps-clipS)">{stick}</g>
        {toNext <= 3 && toNext > 0 && <path d={`M${hands[0]} ${hands[1]} L${hUp[0] + Math.cos(-1.15) * SL} ${hUp[1] + Math.sin(-1.15) * SL}`} stroke="rgba(255,240,210,0.22)" strokeWidth={30} strokeLinecap="round" />}
        {since < 6 && (
          <g>
            {Array.from({length: 7}, (_, i) => {
              const a = (i / 7) * Math.PI * 2;
              const r0 = 30 + since * 12;
              return <line key={i} x1={B[0] + Math.cos(a) * r0} y1={B[1] + Math.sin(a) * r0} x2={B[0] + Math.cos(a) * (r0 + 30)} y2={B[1] + Math.sin(a) * (r0 + 30)} stroke="#fff3d0" strokeWidth={6} strokeLinecap="round" opacity={1 - since / 6} />;
            })}
          </g>
        )}
      </svg>
      {/* 「啪！」 */}
      {hits
        .filter((h) => f >= h && f - h < 12)
        .map((h, i) => {
          const t = (f - h) / 12;
          return (
            <div key={h} style={{position: 'absolute', left: 1140 + (hits.indexOf(h) % 2) * 120, top: 200 - 50 * t, fontFamily: LF.serif, fontWeight: 900, fontSize: 140, color: '#ff5a40', opacity: 1 - t, transform: `scale(${1.5 - 0.5 * Math.min(1, t * 3)}) rotate(${(hits.indexOf(h) % 2 ? 1 : -1) * 10}deg)`, textShadow: '0 4px 18px rgba(0,0,0,0.8)'}}>
              啪！
            </div>
          );
        })}
      {/* 队正唱数 */}
      {last !== undefined && since < 20 && (
        <div style={{position: 'absolute', left: 1600, top: 190 - since * 2, width: 200, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 90, color: '#ffd98a', opacity: 1 - clamp01((since - 12) / 8), textShadow: '0 4px 18px rgba(0,0,0,0.8)'}}>
          {CN[n - 1]}！
        </div>
      )}
    </div>
  );
};
