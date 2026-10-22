import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {Flash, shakeXY} from '../../library/lamplight/stage';
import {LF} from '../../library/lamplight/theme';
import {headOf, slowT, Smoke, Sweat} from '../ep53-changan-curfew/Kit';
import {kneelPose, P, Rig, RigProps, standPose, stoolPose, walkPose} from '../ep53-changan-curfew/Rig';
import {Drape, Label3, Map3D, Pin3, project, type Cam3, type Px} from './Map3D';
import {lerp, Svg} from './Opening';
import {WhiteBubble} from './Props';
import {AngerMark, Beam, Brackets, Brows, CAST, Clasp, Couch, Curtain, Dais, Desk, Floor, Incense, Lattice, Mat, NameTag, Pillar, Rays, Screen, Shelf, Snow, StandLamp, Vignette} from './Sets54';
import {B, fbt, S10, S5, SHOT} from './timeline';

type Pose = Partial<RigProps> & {hip: P; neck: P};
const R = (look: Partial<RigProps>, pose: Pose, s: number, more: Partial<RigProps> = {}, children?: React.ReactNode) => (
  <Rig {...(look as RigProps)} {...(pose as RigProps)} s={s} {...more}>
    {children}
  </Rig>
);
const lean = (hip: P, a: number, s: number, len = 200): P => [hip[0] + Math.sin((a * Math.PI) / 180) * len * s, hip[1] - Math.cos((a * Math.PI) / 180) * len * s];
const bt = (b: number) => b * B; // 屏内拍 → 帧

/* ═════════ 第 5 屏：隋吞陈（三维地图） ═════════ */
const YZ: [number, number][] = [[111.3, 30.7], [112.2, 30.3], [112.9, 29.8], [113.6, 30.0], [114.3, 30.6], [115.0, 30.2], [116.1, 29.8], [117.0, 30.5], [117.9, 31.0], [118.4, 31.3], [118.8, 32.1], [119.4, 32.2], [120.3, 31.95], [121.0, 31.8], [121.9, 31.4], [123.5, 31.2]];
const SUI_N: [number, number][] = [[123.5, 34], [122.8, 37.5], [122.5, 40.5], [121, 41.6], [118, 41.2], [115, 41.6], [112, 41.2], [109, 41.3], [106, 40.5], [104, 39], [102, 38], [100, 37], [99.5, 35], [101, 33], [102, 30.5], [102.5, 28], [104, 27], [106, 28], [108, 28.6], [109.5, 29.6]];
const CHEN_S: [number, number][] = [[123.5, 29], [122.5, 27.5], [121, 25.5], [119.5, 24], [117.3, 22.6], [115, 21.6], [113.4, 21.2], [111, 20.6], [109.5, 21.0], [108.2, 21.5], [107, 22.4], [106.8, 23.5], [107.6, 24.6], [108.6, 25.6], [109.5, 26.8], [110.3, 28.5], [110.6, 29.6]];
const ARROWS: [[number, number], [number, number]][] = [[[113.8, 32.6], [114.1, 29.6]], [[116.8, 32.8], [117.0, 30.0]], [[118.9, 33.8], [118.75, 32.25]]];
const CHANGAN: [number, number] = [108.94, 34.27];
const JIANKANG: [number, number] = [118.78, 32.05];

const poly = (g: CanvasRenderingContext2D, px: Px, pts: [number, number][]) => {
  g.beginPath();
  pts.forEach(([lo, la], i) => {
    const [x, y] = px(lo, la);
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  });
  g.closePath();
};

const S5Map: React.FC<{t: number}> = ({t}) => {
  const sw = easeInOut(clamp01((t - bt(S5.swallow)) / (bt(S5.done) - bt(S5.swallow))));
  const ap = easeOut(clamp01((t - bt(1.4)) / bt(1.9)));
  const done = bt(S5.done);
  const k = clamp01(t / bt(8));
  const pulse = Math.exp(-Math.max(0, t - done) / 8) * (t >= done ? 1 : 0);
  const cam: Cam3 = {lon: lerp(113.6, 114.6, k), lat: lerp(31.8, 30.9, k), dist: lerp(3200, 2800, easeInOut(k)) - 140 * pulse, pitch: lerp(60, 54, k), yaw: lerp(-7, 5, k)};
  const dep = `${sw.toFixed(3)}_${ap.toFixed(3)}`;
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    const chenC = 'rgba(46,128,150,0.72)';
    const suiC = 'rgba(206,74,44,0.70)';
    g.fillStyle = chenC;
    poly(g, px, [...YZ, ...CHEN_S]);
    g.fill();
    g.fillStyle = suiC;
    poly(g, px, [...YZ, ...SUI_N]);
    g.fill();
    if (sw > 0) {
      // 一排「牙」从长江往南咬下去
      g.save();
      poly(g, px, [...YZ, ...CHEN_S]);
      g.clip();
      const yTop = Math.min(...YZ.map((p) => px(p[0], p[1])[1])) - 40;
      const yBot = px(112, 20.4)[1];
      const yF = lerp(yTop + 60, yBot + 80, sw);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(2048, 0);
      g.lineTo(2048, yF);
      const tooth = 46;
      for (let x = 2048; x >= 0; x -= tooth) g.lineTo(x - tooth / 2, yF + (Math.floor(x / tooth) % 2 ? 34 : -6));
      g.lineTo(0, yF);
      g.closePath();
      g.fillStyle = suiC;
      g.fill();
      g.strokeStyle = `rgba(255,200,120,${0.9 * (1 - sw)})`;
      g.lineWidth = 6;
      g.stroke();
      g.restore();
    }
    // 长江分界：金色虚线，吞下去后淡掉
    g.save();
    g.setLineDash([22, 14]);
    g.strokeStyle = `rgba(255,214,120,${0.95 * (1 - sw)})`;
    g.lineWidth = 9;
    g.beginPath();
    YZ.slice(0, -1).forEach(([lo, la], i) => {
      const [x, y] = px(lo, la);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.stroke();
    g.restore();
    // 渡江箭头
    if (ap > 0)
      ARROWS.forEach(([a, b], i) => {
        const q = clamp01(ap * 1.3 - i * 0.15);
        if (q <= 0) return;
        const [x0, y0] = px(a[0], a[1]);
        const [x1, y1] = px(b[0], b[1]);
        const xe = lerp(x0, x1, q), ye = lerp(y0, y1, q);
        const ang = Math.atan2(y1 - y0, x1 - x0);
        g.lineCap = 'round';
        g.strokeStyle = 'rgba(40,12,4,0.85)';
        g.lineWidth = 26;
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(xe, ye);
        g.stroke();
        g.strokeStyle = '#ffd070';
        g.lineWidth = 15;
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(xe, ye);
        g.stroke();
        g.fillStyle = '#ffd070';
        g.beginPath();
        g.moveTo(xe + Math.cos(ang) * 42, ye + Math.sin(ang) * 42);
        g.lineTo(xe + Math.cos(ang + 2.4) * 40, ye + Math.sin(ang + 2.4) * 40);
        g.lineTo(xe + Math.cos(ang - 2.4) * 40, ye + Math.sin(ang - 2.4) * 40);
        g.closePath();
        g.fill();
      });
  };
  const suiAt = project(cam, lerp(111.8, 113.2, sw), lerp(36.4, 31.6, sw), 20);
  const chenAt = project(cam, 115.2, 26.4, 20);
  const chenS = 1 - easeIn(clamp01((sw - 0.25) / 0.6));
  const shake = sw > 0 && sw < 1 ? Math.sin(t * 2.3) * 8 : 0;
  const suiS = 1 + 0.35 * easeOutBack(clamp01((t - done) / 10));
  const jk = project(cam, JIANKANG[0], JIANKANG[1], 30);
  const fell = clamp01((t - done) / 8);
  const stamp = clamp01((t - done - bt(0.6)) / 6);
  const {x: sx, y: sy} = shakeXY(t, done, 12);
  const glyph = (x: number, y: number, txt: string, size: number, color: string, glow: string, o = 1, sc = 1, rot = 0) => (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size * 0.6, width: size, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: size, color, opacity: o, transform: `scale(${sc}) rotate(${rot}deg)`, textShadow: `0 0 30px ${glow}, 0 4px 14px rgba(0,0,0,0.9), 0 0 3px #000`}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={dep} opacity={0.9} />
        <Pin3 at={CHANGAN} big />
        <Pin3 at={JIANKANG} big o={1 - 0.6 * fell} />
      </Map3D>
      <Label3 cam={cam} at={CHANGAN} name="长安" side="left" lift={36} size={40} />
      <Label3 cam={cam} at={JIANKANG} name="建康（陈都）" lift={36} size={36} color={fell > 0.5 ? '#b8b0a0' : '#bfe6f0'} />
      {fell > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <g opacity={fell} stroke="#e0302a" strokeWidth={10} strokeLinecap="round">
            <line x1={jk[0] - 26 * fell} y1={jk[1] - 26 * fell} x2={jk[0] + 26 * fell} y2={jk[1] + 26 * fell} />
            <line x1={jk[0] + 26 * fell} y1={jk[1] - 26 * fell} x2={jk[0] - 26 * fell} y2={jk[1] + 26 * fell} />
          </g>
        </svg>
      )}
      {chenS > 0.02 && glyph(chenAt[0] + shake, chenAt[1], '陈', 170, '#d8f2f6', 'rgba(70,170,200,0.8)', Math.min(1, chenS * 1.4), chenS, shake)}
      {glyph(suiAt[0], suiAt[1], '隋', 190, '#ffe2b0', 'rgba(230,90,50,0.9)', 1, suiS)}
      {stamp > 0 && (
        <div style={{position: 'absolute', left: 1430, top: 700, transform: `scale(${lerp(1.8, 1, easeOut(stamp))}) rotate(-6deg)`, opacity: Math.min(1, stamp * 2)}}>
          <div style={{border: '8px solid #c8302a', borderRadius: 10, padding: '6px 26px', fontFamily: LF.serif, fontWeight: 900, fontSize: 96, color: '#e0402a', background: 'rgba(30,8,4,0.55)', textShadow: '0 0 18px rgba(224,64,42,0.6)'}}>589 年</div>
          <div style={{marginTop: 12, textAlign: 'center', fontFamily: LF.label, fontWeight: 900, fontSize: 40, color: '#ffe0a8', textShadow: '0 2px 8px #000'}}>南北重归一统</div>
        </div>
      )}
      <Flash f={t} at={done} dur={10} peak={0.6} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 6 屏：后宫殿上，独孤皇后 + 缩着的隋文帝 + 五个儿子 ═════════ */
const SONS: {look: keyof typeof CAST; name: string; s: number}[] = [
  {look: 'yong', name: '杨勇', s: 0.5},
  {look: 'guangJin', name: '杨广', s: 0.47},
  {look: 'jun', name: '杨俊', s: 0.44},
  {look: 'xiu', name: '杨秀', s: 0.41},
  {look: 'liang', name: '杨谅', s: 0.37},
];
const S6Hall: React.FC<{t: number}> = ({t}) => {
  const press = bt(1);
  const up = easeInOut(clamp01((t - bt(0.2)) / (press - bt(0.2) - 4)));
  const down = clamp01((t - press + 4) / 4);
  const lift = t < press - 4 ? up : 1 - easeIn(down);
  const bounce = t > press ? Math.exp(-(t - press) / 5) * Math.sin((t - press) * 1.3) * 6 : 0;
  const shrink = easeOutBack(clamp01((t - press) / 12));
  const {x: sx, y: sy} = shakeXY(t, press, 9);
  const z = 1 + 0.05 * clamp01(t / bt(8));
  const ds = 0.62;
  const dPose = stoolPose(780, 640, ds, 1, 148);
  const dNeck: P = lean(dPose.hip, 8 + 4 * shrink, ds);
  const dKnee = dPose.kneeN;
  const handD: P = [dKnee[0] - 6, lerp(dKnee[1] - 16 + bounce, dPose.hip[1] - 100, lift)];
  const dHead = headOf(dPose.hip, dNeck, ds);
  const ws = 0.64;
  const wPose = stoolPose(1190, 640, ws, -1, 148);
  const wa = -15 * shrink;
  const wNeck: P = lean(wPose.hip, -wa, ws);
  const wHead = headOf(wPose.hip, wNeck, ws);
  const collar: P = [wNeck[0] - 4, wNeck[1] + 26 * ws];
  const edge: P = [1268, 556];
  const wHandN: P = [lerp(wPose.hip[0] - 60 * ws, collar[0], clamp01(shrink)), lerp(wPose.hip[1] - 20, collar[1], clamp01(shrink))];
  const wHandF: P = [lerp(wPose.hip[0] - 50 * ws, edge[0], clamp01(shrink)), lerp(wPose.hip[1] - 20, edge[1], clamp01(shrink))];
  const sweat = (t - press) % 26;
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
      <Svg>
        <defs>
          <linearGradient id="s6wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a0e08" />
            <stop offset="0.6" stopColor="#4a1a10" />
            <stop offset="1" stopColor="#3a140c" />
          </linearGradient>
          <radialGradient id="s6glow" cx="0.5" cy="0.45" r="0.55">
            <stop offset="0" stopColor="rgba(255,190,110,0.30)" />
            <stop offset="1" stopColor="rgba(255,190,110,0)" />
          </radialGradient>
        </defs>
        <g transform={`translate(960 560) scale(${z}) translate(-960 -560)`}>
          <rect width={1920} height={1080} fill="url(#s6wall)" />
          <Lattice x={150} y={250} w={230} h={380} kind="diamond" glow={0.55} />
          <Lattice x={1540} y={250} w={230} h={380} kind="diamond" glow={0.55} />
          <Screen x={560} y={230} w={800} h={340} panels={6} art="crane" />
          <rect width={1920} height={1080} fill="url(#s6glow)" />
          <Brackets y={150} gap={150} s={0.8} />
          <Beam id="s6b" y={150} h={62} />
          <rect x={0} y={0} width={1920} height={70} fill="#1a0806" />
          <Floor id="s6f" y={700} c1="#3a1c10" c2="#120806" />
          <Dais x={960} y={640} w={900} steps={3} step={26} />
          <Couch x={985} y={560} w={640} back={150} cushion="#a8282a" />
          <Incense f={t} x={560} y={700} s={0.9} />
          <Incense f={t} x={1410} y={700} s={0.9} seed={3} />
          {R(CAST.dugu, {...dPose, neck: dNeck, handN: handD, handF: [handD[0] - 10, handD[1] + 2]}, ds, {face: 'stern', front: true, headTilt: 6 * shrink})}
          <Clasp at={[handD[0] + 2, handD[1]]} s={ds * 1.1} />
          <g transform={`translate(${dHead[0]} ${dHead[1]}) scale(${ds})`}>
            <path d="M-30 -10 L-6 -2 M30 -10 L6 -2" stroke="#14100c" strokeWidth={7} strokeLinecap="round" />
          </g>
          {R(CAST.wen, {...wPose, neck: wNeck, handN: wHandN, handF: wHandF}, ws, {face: shrink > 0.5 ? 'shock' : 'calm', headTilt: -wa * 0.6})}
          {shrink > 0.3 && sweat > 0 && <Sweat x={wHead[0] + 30} y={wHead[1] - 30 + sweat * 1.5} s={0.9} />}
          {shrink > 0.3 && <Sweat x={wHead[0] - 34} y={wHead[1] - 10} s={0.7} />}
          {SONS.map((so, i) => {
            const x = 600 + i * 180;
            const sway = Math.sin(t / 14 + i) * 3;
            const p = standPose(x, 1050, so.s, 1);
            const neck: P = [p.neck[0] + sway, p.neck[1]];
            const chest: P = [neck[0] + 38 * so.s, neck[1] + 70 * so.s];
            const h = headOf(p.hip, neck, so.s);
            return (
              <g key={so.name}>
                {R(CAST[so.look], {...p, neck, handN: chest, handF: [chest[0] - 6, chest[1] + 4]}, so.s, {front: true, face: i === 1 ? 'smile' : 'calm', headTilt: i === 1 ? -8 : sway})}
                <Clasp at={chest} s={so.s} />
                {so.look === 'guangJin' && (
                  <g transform={`translate(${h[0]} ${h[1]}) rotate(-8) scale(${so.s})`}>
                    <path d="M-4 16 q-10 -2 -20 6 M4 16 q10 -4 20 -10" stroke="#1b1410" strokeWidth={5} fill="none" strokeLinecap="round" />
                  </g>
                )}
                {so.look === 'yong' && (
                  <g transform={`translate(${h[0]} ${h[1]}) scale(${so.s})`}>
                    <path d="M-28 -14 L-6 -12 M28 -14 L6 -12" stroke="#14100c" strokeWidth={8} strokeLinecap="round" />
                  </g>
                )}
                <NameTag x={h[0]} y={h[1] - 82 * so.s - 26} text={so.name} size={24} />
              </g>
            );
          })}
          <StandLamp f={t} x={250} y={1000} s={0.9} />
          <StandLamp f={t} x={1670} y={1000} s={0.9} seed={2} />
          <Pillar id="s6p1" x={70} y0={0} y1={1040} w={120} />
          <Pillar id="s6p2" x={1850} y0={0} y1={1040} w={120} />
          <Curtain f={t} y={70} drop={40} n={8} sideH={560} />
        </g>
      </Svg>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 7 屏：东宫书房，杨勇吟诗 ═════════ */
const POEM = ['春', '江', '花', '月', '夜', '风', '诗', '酒'];
const S7Study: React.FC<{t: number}> = ({t}) => {
  const z = 1 + 0.06 * easeInOut(clamp01(t / bt(8)));
  const ys = 0.66;
  const sway = Math.sin(t / 10) * 6;
  const yp = standPose(820, 1000, ys, 1);
  const yNeck: P = [yp.neck[0] + sway, yp.neck[1] + Math.abs(Math.sin(t / 10)) * 4];
  const yh = headOf(yp.hip, yNeck, ys);
  const sc: [P, P] = [[yNeck[0] + 150 * ys, yNeck[1] + 96 * ys], [yNeck[0] + 40 * ys, yNeck[1] + 104 * ys]];
  const mouth = 0.3 + 0.3 * Math.abs(Math.sin(t / 3.2));
  const clapAt = [bt(3.5), bt(5)];
  const clapping = t > clapAt[0] - 4;
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s7wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2614" />
            <stop offset="1" stopColor="#24160a" />
          </linearGradient>
          <radialGradient id="s7moon" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f6efd8" />
            <stop offset="1" stopColor="#d8cfa8" />
          </radialGradient>
          <clipPath id="s7mc">
            <circle cx={1440} cy={430} r={230} />
          </clipPath>
        </defs>
        <g transform={`translate(860 640) scale(${z}) translate(-860 -640)`}>
          <rect width={1920} height={1080} fill="url(#s7wall)" />
          {Array.from({length: 16}, (_, i) => <rect key={i} x={i * 124} y={120} width={6} height={660} fill="rgba(0,0,0,0.18)" />)}
          <Shelf x={90} y={190} w={520} h={520} rows={4} cols={4} />
          <circle cx={1440} cy={430} r={250} fill="#3a2010" />
          <circle cx={1440} cy={430} r={230} fill="url(#s7moon)" />
          <g clipPath="url(#s7mc)">
            <rect x={1200} y={540} width={480} height={140} fill="#c8c09a" />
            {Array.from({length: 7}, (_, i) => {
              const x = 1240 + i * 66 + (i % 2) * 14;
              const sw = Math.sin(t / 22 + i) * 6;
              return (
                <g key={i} opacity={0.75 - (i % 3) * 0.15}>
                  <path d={`M${x} 700 Q${x + sw} 450 ${x + sw * 2} 180`} stroke="#3a5a3a" strokeWidth={10 - (i % 3) * 2} fill="none" />
                  {Array.from({length: 5}, (_, k) => <path key={k} d={`M${x + sw * (k / 4)} ${620 - k * 90} q${(k % 2 ? 1 : -1) * 50} -16 ${(k % 2 ? 1 : -1) * 80} 6 q${(k % 2 ? -1 : 1) * 30} -10 ${(k % 2 ? -1 : 1) * 80} -6`} fill="#4a6a44" />)}
                </g>
              );
            })}
            <path d="M1660 220 Q1560 280 1520 360 Q1500 400 1460 410" stroke="#3a2418" strokeWidth={9} fill="none" />
            {[[1590, 262], [1530, 340], [1478, 404], [1620, 236]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill="#e8a0a8" />)}
          </g>
          <circle cx={1440} cy={430} r={240} fill="none" stroke="#c99a3a" strokeWidth={6} />
          <rect x={900} y={150} width={150} height={420} fill="#e8dcc0" stroke="#5a3a1a" strokeWidth={4} />
          <rect x={890} y={140} width={170} height={16} fill="#5a3a1a" />
          <rect x={890} y={566} width={170} height={16} fill="#5a3a1a" />
          {['明', '月', '照', '高', '楼'].map((c, i) => (
            <text key={c} x={975} y={226 + i * 74} textAnchor="middle" fontFamily={LF.scroll} fontSize={64} fill="#2a1e14">{c}</text>
          ))}
          <Rays x={1440} y={430} w={300} len={620} o={0.08} ang={18} />
          <Floor id="s7f" y={780} c1="#5a3a20" c2="#2a180c" lines="rgba(0,0,0,0.25)" />
          <Desk x={380} y={880} w={380} />
          <Incense f={t} x={250} y={860} s={0.6} />
          {R(CAST.yong, {...yp, neck: yNeck, handN: sc[0], handF: sc[1]}, ys, {face: 'shout', mouth, headTilt: -8 + sway * 0.6})}
          <Brows h={yh} s={ys} facing={1} tilt={-8 + sway * 0.6} />
          <g>
            <rect x={sc[1][0]} y={sc[0][1] - 70} width={sc[0][0] - sc[1][0]} height={120} fill="#efe4c4" stroke="#8a6a3a" strokeWidth={2} />
            {Array.from({length: 6}, (_, i) => <line key={i} x1={sc[0][0] - 14 - i * 14} y1={sc[0][1] - 58} x2={sc[0][0] - 14 - i * 14} y2={sc[0][1] + 38} stroke="#3a2a1a" strokeWidth={3} strokeDasharray="8 5" />)}
            {sc.map(([x, y], i) => <rect key={i} x={x - 7} y={y - 82} width={14} height={144} rx={6} fill="#6a3a1a" />)}
          </g>
          {POEM.map((c, i) => {
            const p = ((t + i * 13) % 104) / 104;
            if (t < i * 8) return null;
            const x = yh[0] + 50 + p * 520 + Math.sin(p * 6 + i) * 20;
            const y = yh[1] + 10 - p * 260 - i * 6;
            return <text key={i} x={x} y={y} fontFamily={LF.scroll} fontSize={46 + p * 20} fill="#ffe2a8" opacity={Math.sin(p * Math.PI) * 0.9} style={{filter: 'drop-shadow(0 0 8px rgba(255,200,120,0.7))'}}>{c}</text>;
          })}
          {[1290, 1500, 1710].map((x, i) => {
            const gs = 0.56;
            const p = kneelPose(x, 1000, gs, -1);
            const ph = clapping ? Math.abs(Math.sin((t - clapAt[0]) / 3 + i)) : 0;
            const nod = Math.sin(t / 12 + i * 1.5) * 4;
            const neck: P = [p.neck[0] - nod, p.neck[1] + Math.abs(nod)];
            const c: P = [neck[0] - 70 * gs, neck[1] + 70 * gs];
            const hN: P = clapping ? [c[0] - 26 * ph, c[1]] : [x - 80 * gs, p.hip[1] - 10];
            const hF: P = clapping ? [c[0] + 26 * ph, c[1] - 6] : [x - 70 * gs, p.hip[1] - 6];
            const hh = headOf(p.hip, neck, gs);
            const look = i === 1 ? CAST.guest2 : CAST.guest;
            return (
              <g key={x}>
                <Mat x={x - 10} y={1000} w={210} />
                {R(look, {...p, neck, handN: hN, handF: hF}, gs, {face: clapping ? 'laugh' : 'smile', openHands: clapping})}
                {clapAt.map((ca, k) => {
                  const q = clamp01((t - ca - i * 3) / 8);
                  if (q <= 0 || t - ca > 26) return null;
                  return <WhiteBubble key={k} x={hh[0] - 20} y={hh[1] - 90 - 20 * q} text={k ? '妙！' : '好！'} p={easeOutBack(q)} size={34} tail="right" />;
                })}
              </g>
            );
          })}
        </g>
      </Svg>
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 8 屏：华丽铠甲对镜转圈，文帝塞旧刀 ═════════ */
const Armor: React.FC<{hip: P; neck: P; s: number; facing: number; f: number}> = ({hip, neck, s, facing, f}) => {
  const v: P = [neck[0] - hip[0], neck[1] - hip[1]];
  const l = Math.hypot(v[0], v[1]);
  const u: P = [v[0] / l, v[1] / l];
  const n: P = [-u[1], u[0]];
  const at = (a: number, b: number): P => [hip[0] + u[0] * a * s + n[0] * b * s, hip[1] + u[1] * a * s + n[1] * b * s];
  const scales: React.ReactNode[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = -3; c <= 3; c++) {
      const [x, y] = at(30 + r * 26, c * 13 + (r % 2) * 6);
      scales.push(<path key={`${r}${c}`} d={`M${x - 7 * s} ${y} a${7 * s} ${7 * s} 0 0 0 ${14 * s} 0`} fill="none" stroke="#7a5414" strokeWidth={4.8 * s} />);
    }
  const sh = at(186, 4 * facing);
  const belt = at(16, 0);
  const rib = (base: P, seed: number, color: string) => {
    const pts = Array.from({length: 6}, (_, i) => {
      const k = i / 5;
      return `${base[0] - facing * k * 120 * s + Math.sin(f / 5 + k * 4 + seed) * 16 * s * k} ${base[1] + k * 110 * s}`;
    });
    return <path d={`M${pts.join(' L')}`} stroke={color} strokeWidth={10 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  };
  return (
    <g>
      {rib(sh, 0, '#e0405a')}
      {rib(at(170, -6 * facing), 2, '#40a0d0')}
      <path d={`M${at(196, -40).join(' ')} L${at(196, 40).join(' ')} L${at(8, 40).join(' ')} L${at(8, -40).join(' ')} Z`} fill="#d8a83a" stroke="#ffe08a" strokeWidth={8 * s} />
      {scales}
      <path d={`M${at(150, -32).join(' ')} Q${at(130, 0).join(' ')} ${at(150, 32).join(' ')}`} stroke="#ffe8a0" strokeWidth={12 * s} fill="none" />
      <circle cx={at(120, 0)[0]} cy={at(120, 0)[1]} r={18 * s} fill="#e8c050" stroke="#7a5414" strokeWidth={3} />
      <circle cx={at(120, 0)[0]} cy={at(120, 0)[1]} r={8 * s} fill="#c8302a" />
      <ellipse cx={sh[0]} cy={sh[1]} rx={46 * s} ry={30 * s} fill="#e0b048" stroke="#7a5414" strokeWidth={3} />
      {[0, 1, 2].map((k) => <path key={k} d={`M${sh[0] - 40 * s} ${sh[1] + (k * 12 - 4) * s} q${40 * s} ${14 * s} ${80 * s} 0`} stroke="#8a6018" strokeWidth={3} fill="none" />)}
      <rect x={belt[0] - 46 * s} y={belt[1] - 10 * s} width={92 * s} height={20 * s} fill="#5a2a14" />
      {[-30, -10, 10, 30].map((d) => <circle key={d} cx={belt[0] + d * s} cy={belt[1]} r={6 * s} fill={d % 20 ? '#40c0a0' : '#e8c050'} />)}
      {rib(belt, 4, '#f0c040')}
    </g>
  );
};
const Helmet: React.FC<{h: P; s: number; facing: number; f: number}> = ({h, s, facing, f}) => (
  <g transform={`translate(${h[0]} ${h[1]}) scale(${s})`}>
    <path d="M-42 -2 Q-44 -60 0 -62 Q44 -60 42 -2 Q22 -16 0 -16 Q-22 -16 -42 -2 Z" fill="#d8a83a" stroke="#7a5414" strokeWidth={3} />
    <path d={`M${-facing * 40} -6 q${-facing * 10} 30 ${-facing * 2} 52 l${facing * 14} -6 q-4 -24 0 -40 Z`} fill="#c89a30" stroke="#7a5414" strokeWidth={2} />
    <rect x={-46} y={-8} width={92} height={10} rx={4} fill="#ffe08a" />
    <rect x={-4} y={-92} width={8} height={32} fill="#d8a83a" />
    <path d={`M0 -92 Q${-facing * 30 + Math.sin(f / 6) * 6} -120 ${-facing * 60 + Math.sin(f / 5) * 10} -96 Q${-facing * 30} -104 0 -86 Z`} fill="#d8302a" />
  </g>
);
const Knife: React.FC<{at: P; ang: number; s: number}> = ({at, ang, s}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${ang}) scale(${s})`}>
    <rect x={-18} y={-8} width={44} height={16} rx={5} fill="#4a3a2a" stroke="#1a120a" strokeWidth={2} />
    {[-10, 0, 10].map((x) => <line key={x} x1={x} y1={-8} x2={x} y2={8} stroke="#2a2018" strokeWidth={2} />)}
    <rect x={26} y={-11} width={8} height={22} fill="#5a5048" />
    <path d="M34 -8 L120 -6 Q132 0 120 6 L34 8 Z" fill="#6a5a46" stroke="#2a2018" strokeWidth={2} />
    <path d="M44 -2 L110 -2" stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
  </g>
);
const S8Armor: React.FC<{t: number}> = ({t}) => {
  const ys = 0.66;
  const x0 = 800;
  const turnEnd = bt(4.4);
  const ang = t < turnEnd ? easeInOut(clamp01(t / turnEnd)) * Math.PI * 3 + Math.PI : 0;
  const sx = t < turnEnd ? Math.cos(ang) : 1;
  const face = sx >= 0 ? 1 : -1;
  const yp = standPose(x0, 1000, ys, 1);
  const bob = Math.sin(t / 5) * 4;
  const yNeck: P = [yp.neck[0], yp.neck[1] + bob];
  const yh = headOf(yp.hip, yNeck, ys);
  const walkA = bt(4.0), walkB = bt(5.2);
  const wk = easeInOut(clamp01((t - walkA) / (walkB - walkA)));
  const wx = lerp(1640, 1240, wk);
  const ws = 0.62;
  const wp = wk > 0 && wk < 1 ? walkPose(wx, 1000, ((t - walkA) / 18) % 1, ws, -1) : standPose(wx, 1000, ws, -1);
  const give = easeOut(clamp01((t - walkB + 2) / 8));
  const wHandN: P = give > 0 ? [lerp(wx + 30 * ws, wx - 150 * ws, give), lerp(wp.hip[1] + 10, wp.neck[1] + 80 * ws, give)] : [wx + 30 * ws, wp.hip[1] + 10];
  const take = bt(5.7), toss = bt(6.2), land = bt(6.5);
  const yHandReach: P = [yNeck[0] + 150 * ys, yNeck[1] + 84 * ys];
  const rq = clamp01((t - take + 6) / 6);
  const yHandN: P = t < take - 6 ? [yp.hip[0] + 40 * ys, yp.hip[1] - 26 * ys] : t < toss ? [lerp(yp.hip[0] + 40 * ys, yHandReach[0], rq), lerp(yp.hip[1] - 26 * ys, yHandReach[1], rq)] : [yNeck[0] + 120 * ys, yNeck[1] + 40 * ys];
  const yHandF: P = [yNeck[0] - 50 * ys, yNeck[1] + 60 * ys];
  const table: P = [1060, 846];
  let knife: {at: P; ang: number} | null = null;
  if (t >= walkA && t < take) knife = {at: [wHandN[0] - 10, wHandN[1]], ang: 180};
  else if (t >= take && t < toss) knife = {at: [yHandN[0] + 4, yHandN[1]], ang: -10};
  else if (t >= toss) {
    const q = clamp01((t - toss) / (land - toss));
    const bounce = t > land ? Math.abs(Math.sin((t - land) / 2.2)) * 18 * Math.exp(-(t - land) / 6) : 0;
    knife = {at: [lerp(yNeck[0] + 120 * ys, table[0], q), lerp(yNeck[1] + 40 * ys, table[1] - 10, q) - Math.sin(q * Math.PI) * 120 - bounce], ang: lerp(-10, 360, q)};
  }
  const glints = [bt(1.5), bt(3.2)];
  const wh = headOf(wp.hip, wp.neck, ws);
  const zoom = 1.14 + 0.1 * easeInOut(clamp01(t / bt(8)));
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '1000px 780px'}}>
      <Svg>
        <defs>
          <linearGradient id="s8wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#241208" />
            <stop offset="1" stopColor="#3a1e10" />
          </linearGradient>
          <radialGradient id="s8mir" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#f8e6b0" />
            <stop offset="0.5" stopColor="#c8a050" />
            <stop offset="1" stopColor="#6a4a1a" />
          </radialGradient>
          <linearGradient id="s8door" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f6e2b0" />
            <stop offset="1" stopColor="#c8a870" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s8wall)" />
        {Array.from({length: 9}, (_, i) => <rect key={i} x={i * 220} y={140} width={200} height={620} fill="rgba(255,220,160,0.03)" stroke="rgba(0,0,0,0.25)" strokeWidth={4} />)}
        {[1060, 1260].map((x, i) => (
          <g key={x} opacity={0.75}>
            <rect x={x - 4} y={300} width={8} height={420} fill="#2a160a" />
            <rect x={x - 70} y={330} width={140} height={10} fill="#2a160a" />
            <path d={`M${x - 56} 342 L${x + 56} 342 L${x + 46} 520 L${x - 46} 520 Z`} fill={i ? '#6a6a6e' : '#7a5a2a'} stroke="#1a1410" strokeWidth={3} />
            {Array.from({length: 6}, (_, r) => <line key={r} x1={x - 50} y1={360 + r * 26} x2={x + 50} y2={360 + r * 26} stroke="rgba(0,0,0,0.35)" strokeWidth={3} />)}
            <path d={`M${x - 30} 300 Q${x} 250 ${x + 30} 300 Z`} fill={i ? '#6a6a6e' : '#7a5a2a'} />
          </g>
        ))}
        <rect x={1500} y={180} width={300} height={640} fill="#1a0c06" />
        <rect x={1520} y={200} width={260} height={620} fill="url(#s8door)" />
        <rect x={1520} y={700} width={260} height={120} fill="#c8b48a" />
        <rect x={1480} y={160} width={340} height={34} fill="#4a2412" />
        <Rays x={1650} y={300} w={240} len={700} o={0.12} ang={28} />
        <Floor id="s8f" y={820} c1="#4a2a16" c2="#1a0c06" />
        <g>
          <rect x={386} y={620} width={14} height={240} fill="#3a2010" />
          <path d="M320 860 L466 860 L440 840 L346 840 Z" fill="#3a2010" />
          <circle cx={393} cy={500} r={150} fill="#4a2a10" />
          <circle cx={393} cy={500} r={132} fill="url(#s8mir)" />
          <g opacity={0.55}>
            <ellipse cx={420} cy={520} rx={44} ry={84} fill="#e0b040" />
            <circle cx={420} cy={420} r={26} fill="#e6c9a0" />
          </g>
          {glints.map((g, i) => {
            const q = clamp01((t - g) / 12);
            if (q <= 0 || q >= 1) return null;
            return <circle key={i} cx={430} cy={470} r={140 * q} fill="none" stroke="#fff4c0" strokeWidth={10 * (1 - q)} />;
          })}
        </g>
        <rect x={960} y={846} width={240} height={18} rx={4} fill="#5a2a14" />
        <rect x={970} y={864} width={14} height={60} fill="#3a1a0c" />
        <rect x={1176} y={864} width={14} height={60} fill="#3a1a0c" />
        <g transform={`translate(${x0} 0) scale(${Math.max(0.18, Math.abs(sx)) * face} 1) translate(${-x0} 0)`}>
          {R(CAST.yong, {...yp, neck: yNeck, handN: yHandN, handF: yHandF}, ys, {face: t < land ? 'smile' : 'calm', hat: 'none', pants: '#5a3a1a'}, <Armor hip={yp.hip} neck={yNeck} s={ys} facing={1} f={t} />)}
          <Helmet h={yh} s={ys} facing={1} f={t} />
          <Brows h={yh} s={ys} facing={1} />
        </g>
        {glints.map((g, i) => {
          const q = clamp01((t - g) / 10);
          if (q <= 0 || q >= 1) return null;
          const c: P = [x0 + 10, yNeck[1] + 90 * ys];
          const r = 140 * Math.sin(q * Math.PI);
          return (
            <g key={i} opacity={Math.sin(q * Math.PI)}>
              <path d={`M${c[0]} ${c[1] - r} L${c[0] + r * 0.12} ${c[1] - r * 0.12} L${c[0] + r} ${c[1]} L${c[0] + r * 0.12} ${c[1] + r * 0.12} L${c[0]} ${c[1] + r} L${c[0] - r * 0.12} ${c[1] + r * 0.12} L${c[0] - r} ${c[1]} L${c[0] - r * 0.12} ${c[1] - r * 0.12} Z`} fill="#fffbe0" />
              <circle cx={c[0]} cy={c[1]} r={r * 0.4} fill="rgba(255,230,150,0.5)" />
            </g>
          );
        })}
        {R(CAST.wen, {...wp, handN: wHandN, handF: [wx + 40 * ws, wp.hip[1]]}, ws, {face: 'stern'})}
        <g transform={`translate(${wh[0]} ${wh[1]}) scale(${ws})`}>
          <path d="M-30 -22 L-8 -14" stroke="#14100c" strokeWidth={7} strokeLinecap="round" />
        </g>
        {t > land && <Smoke f={t - land} x={wh[0]} y={wh[1] - 60} n={2} />}
        {knife && <Knife at={knife.at} ang={knife.ang} s={0.7} />}
        {t > land && t < land + 14 && (
          <text x={table[0] + 40} y={table[1] - 60} fontFamily={LF.serif} fontWeight={900} fontSize={84} fill="#ffe0a0" opacity={1 - (t - land) / 14} style={{filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.9))'}}>
            当
          </text>
        )}
      </Svg>
      <Vignette k={0.55} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 9 屏：冬至，东宫大殿百官朝贺、奏乐 ═════════ */
const S9Court: React.FC<{t: number}> = ({t}) => {
  const pan = easeInOut(clamp01(t / bt(8)));
  const camX = -60 * pan;
  const ys = 0.6;
  const yp = stoolPose(1530, 640, ys, -1, 148);
  const wave = Math.sin(t / 5) * 30;
  const yNeck: P = lean(yp.hip, -6, ys);
  const yh = headOf(yp.hip, yNeck, ys);
  const bowAt = (i: number) => 0.5 + 0.5 * Math.sin(t / 9 - i * 0.7);
  const ms = 0.5;
  const g9 = 1010;
  const hit = Math.abs(Math.sin((t * Math.PI) / B));
  const bells = kneelPose(1180, g9, ms, 1);
  const flute = kneelPose(1520, g9, ms, -1);
  const drum = standPose(1760, g9, ms, -1);
  const fn = headOf(flute.hip, flute.neck, ms);
  const bellIdx = Math.floor(t / B) % 5;
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="s9wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a0c08" />
            <stop offset="1" stopColor="#4a1a10" />
          </linearGradient>
          <linearGradient id="s9snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6a7a8e" />
            <stop offset="1" stopColor="#c8d0da" />
          </linearGradient>
        </defs>
        <g transform={`translate(${camX} 0)`}>
          <rect x={-100} width={2120} height={1080} fill="url(#s9wall)" />
          <rect x={560} y={210} width={620} height={440} fill="url(#s9snow)" />
          <path d="M560 470 L700 420 L1040 420 L1180 470 L1180 650 L560 650 Z" fill="#e8ecf0" />
          <path d="M640 420 L700 380 L1040 380 L1100 420 Z" fill="#3a3a44" />
          <rect x={720} y={420} width={300} height={60} fill="#5a1a14" />
          <path d="M680 388 Q870 340 1060 388" stroke="#e8ecf0" strokeWidth={8} fill="none" />
          <Snow f={t} x0={560} y0={210} w={620} h={440} n={70} />
          {[560, 868, 1180].map((x) => <rect key={x} x={x - 14} y={200} width={28} height={460} fill="#3a120a" />)}
          <rect x={540} y={180} width={660} height={34} fill="#2a0c06" />
          <rect x={790} y={120} width={160} height={70} fill="#1a0806" stroke="#d8a83a" strokeWidth={4} />
          <text x={870} y={172} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={48} fill="#e8c060">东宫</text>
          <Lattice x={110} y={230} w={300} h={400} kind="zhi" glow={0.5} />
          <Lattice x={1300} y={230} w={140} h={360} kind="grid" glow={0.4} />
          <Beam id="s9b" x0={-100} x1={2020} y={70} h={56} />
          <Floor id="s9f" y={660} c1="#3a1810" c2="#140806" vx={900} />
          {[300, 700, 1040, 1420].map((x, i) => {
            const sw = Math.sin(t / 16 + i) * 3;
            return (
              <g key={x} transform={`rotate(${sw} ${x} 126)`}>
                <line x1={x} y1={126} x2={x} y2={200} stroke="#2a160a" strokeWidth={4} />
                <circle cx={x} cy={250} r={90} fill="rgba(255,120,80,0.12)" />
                <ellipse cx={x} cy={250} rx={42} ry={52} fill="#d8302a" stroke="#6a1410" strokeWidth={3} />
                {[-20, 0, 20].map((d) => <path key={d} d={`M${x + d} 200 Q${x + d * 1.6} 250 ${x + d} 300`} stroke="#8a1a14" strokeWidth={2} fill="none" />)}
                <rect x={x - 22} y={196} width={44} height={10} fill="#d8a83a" />
                <rect x={x - 22} y={296} width={44} height={10} fill="#d8a83a" />
                <line x1={x} y1={306} x2={x} y2={340} stroke="#d8a83a" strokeWidth={4} />
              </g>
            );
          })}
          <Screen x={1330} y={300} w={460} h={280} panels={4} art="mountain" seed={6} />
          <Dais x={1560} y={640} w={560} steps={3} step={24} />
          <Couch x={1560} y={560} w={420} back={110} />
          {R(CAST.yong, {...yp, neck: yNeck, handN: [yNeck[0] - 90 * ys, yNeck[1] - 40 * ys + wave * 0.6], handF: [yp.hip[0] - 80 * ys, yp.hip[1] - 20]}, ys, {face: 'laugh', mouth: 0.4, openHands: true})}
          <Brows h={yh} s={ys} facing={-1} />
          {[0, 1].map((row) => {
            const gs = row ? 0.52 : 0.42;
            const g = row ? 990 : 760;
            const looks = [CAST.offR, CAST.offG, CAST.offB, CAST.offR, CAST.offG];
            return looks.map((lk, i) => {
              const x = (row ? 180 : 300) + i * (row ? 210 : 170);
              const b = bowAt(i + row * 2);
              const p = standPose(x, g, gs, 1);
              const neck = lean(p.hip, 15 + 50 * b, gs);
              const hand: P = [neck[0] + 60 * gs, neck[1] + 70 * gs];
              return (
                <g key={`${row}-${i}`}>
                  {R(lk, {...p, neck, handN: hand, handF: [hand[0] - 6, hand[1] + 4]}, gs, {face: 'calm'})}
                  <rect x={hand[0] - 4 * gs} y={hand[1] - 70 * gs} width={10 * gs} height={70 * gs} fill="#e8dcc0" transform={`rotate(${30 + 40 * b} ${hand[0]} ${hand[1]})`} />
                  <Clasp at={hand} s={gs} rot={30 + 40 * b} />
                </g>
              );
            });
          })}
          <rect x={1240} y={820} width={10} height={190} fill="#3a1a0c" />
          <rect x={1420} y={820} width={10} height={190} fill="#3a1a0c" />
          <rect x={1230} y={814} width={210} height={14} fill="#5a2a14" />
          {[0, 1, 2, 3, 4].map((k) => {
            const sw = k === bellIdx ? Math.sin((t % B) / 2) * 6 * Math.exp(-(t % B) / 8) : 0;
            return (
              <g key={k} transform={`rotate(${sw} ${1262 + k * 38} 828)`}>
                <line x1={1262 + k * 38} y1={828} x2={1262 + k * 38} y2={846} stroke="#2a1a0a" strokeWidth={3} />
                <path d={`M${1250 + k * 38} 846 L${1274 + k * 38} 846 L${1280 + k * 38} ${900 - k * 6} Q${1262 + k * 38} ${908 - k * 6} ${1244 + k * 38} ${900 - k * 6} Z`} fill="#6a8a5a" stroke="#2a3a20" strokeWidth={2} />
              </g>
            );
          })}
          {R(CAST.musician, {...bells, handN: [1250 + bellIdx * 38, 880 - 20 * hit], handF: [1200, bells.hip[1] - 10]}, ms, {face: 'calm'})}
          {R(CAST.musician, {...flute, handN: [fn[0] - 40 * ms, fn[1] + 26 * ms], handF: [fn[0] - 110 * ms, fn[1] + 30 * ms]}, ms, {face: 'calm', robe: '#3a6a5a', robeD: '#2a4a40'})}
          <line x1={fn[0] - 10 * ms} y1={fn[1] + 22 * ms} x2={fn[0] - 170 * ms} y2={fn[1] + 30 * ms} stroke="#c8a050" strokeWidth={8} strokeLinecap="round" />
          <rect x={1658} y={760} width={8} height={250} fill="#3a1a0c" />
          <ellipse cx={1662} cy={850} rx={70} ry={60} fill="#a8302a" stroke="#3a120a" strokeWidth={4} />
          <ellipse cx={1662} cy={850} rx={40} ry={56} fill="#e8d0a0" />
          {R(CAST.musician, {...drum, handN: [1700, 850 - 60 * (1 - hit)], handF: [1716, 830 - 40 * hit]}, ms, {face: 'shout', mouth: 0.4})}
          {Array.from({length: 4}, (_, k) => {
            const p = (t / 30 + k / 4) % 1;
            return <text key={k} x={1300 + k * 120 + Math.sin(p * 6 + k) * 30} y={800 - p * 300} fontSize={44} fill="#ffd98a" opacity={Math.sin(p * Math.PI) * 0.8} fontFamily={LF.label}>♪</text>;
          })}
          <Pillar id="s9p1" x={30} y0={0} y1={1060} w={110} />
          <Pillar id="s9p2" x={1270} y0={0} y1={680} w={90} />
        </g>
      </Svg>
      <Vignette k={0.55} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 10 屏：皇宫，文帝拍案（慢镜头） ═════════ */
const S10Slam: React.FC<{t: number}> = ({t}) => {
  const real = bt(S10.slam);
  const k = 0.35;
  const H = real - Math.round(6 / k - 6);
  const e = slowT(t, H, k, 40);
  const wind = easeInOut(clamp01((e - bt(0.3)) / (H - bt(0.3) - 6)));
  const smash = clamp01((e - H + 6) / 6);
  const hitOn = e >= H;
  const ws = 0.72;
  const wp = stoolPose(1250, 700, ws, -1, 120);
  const angry = hitOn ? 1 : wind;
  const wNeck: P = lean(wp.hip, hitOn ? -14 : -6 + 8 * wind, ws);
  const wh = headOf(wp.hip, wNeck, ws);
  const tableY = 640;
  const palm: P = hitOn ? [1060, tableY - 8] : [lerp(lerp(1110, 1180, wind), 1060, easeIn(smash)), lerp(lerp(tableY - 40, wNeck[1] - 150 * ws, wind), tableY - 8, easeIn(smash))];
  const {x: sx, y: sy} = shakeXY(t, real, 22);
  const since = e - H;
  const cupT = clamp01(since / 36);
  const cupY = hitOn ? tableY - 26 - Math.sin(cupT * Math.PI) * 180 : tableY - 26;
  const cupX = hitOn ? lerp(980, 900, cupT) : 980;
  const cupR = hitOn ? cupT * 400 : 0;
  const tableJump = hitOn ? Math.exp(-since / 4) * 14 : 0;
  const cower = hitOn ? easeOut(clamp01(since / 10)) : 0;
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
      <Svg>
        <defs>
          <linearGradient id="s10wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a0806" />
            <stop offset="1" stopColor="#3a120a" />
          </linearGradient>
          <radialGradient id="s10glow" cx="0.62" cy="0.45" r="0.5">
            <stop offset="0" stopColor="rgba(255,200,110,0.28)" />
            <stop offset="1" stopColor="rgba(255,200,110,0)" />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s10wall)" />
        {Array.from({length: 12}, (_, i) => <rect key={i} x={i * 170 - 20} y={0} width={150} height={60} fill="#2a1a10" stroke="#c99a3a" strokeWidth={3} />)}
        <Brackets y={160} gap={140} s={0.9} />
        <Beam id="s10b" y={160} h={70} base="#1a3a46" />
        <Screen x={950} y={280} w={700} h={300} panels={5} art="wave" frame="#3a1a08" paper="#d8c080" />
        <rect width={1920} height={1080} fill="url(#s10glow)" />
        <Floor id="s10f" y={720} c1="#2e140a" c2="#0e0604" vx={1100} />
        <Dais x={1250} y={700} w={760} steps={3} step={26} color="#4a1a10" />
        <Couch x={1300} y={620} w={360} back={100} />
        {R(CAST.wen, {...wp, neck: wNeck, handN: palm, handF: [wp.hip[0] - 40 * ws, wp.hip[1] - 30]}, ws, {face: hitOn ? 'shout' : 'stern', mouth: hitOn ? 0.8 : 0, openHands: true, headTilt: hitOn ? 6 : 0})}
        <g transform={`translate(${wh[0]} ${wh[1]}) scale(${ws})`}>
          <path d={`M-32 ${-22 + 4 * angry} L-6 ${-12 + 4 * angry}`} stroke="#14100c" strokeWidth={8} strokeLinecap="round" />
        </g>
        <AngerMark x={wh[0] + 30} y={wh[1] - 50} s={0.8 + 0.3 * angry} o={angry} />
        {hitOn && <Smoke f={since} x={wh[0] + 10} y={wh[1] - 70} n={3} color="rgba(240,240,240,0.7)" />}
        <g transform={`translate(0 ${-tableJump})`}>
          <rect x={860} y={tableY} width={380} height={24} rx={4} fill="#5a2412" />
          <rect x={860} y={tableY} width={380} height={5} fill="#c99a3a" />
          <rect x={876} y={tableY + 24} width={18} height={60} fill="#3a1408" />
          <rect x={1206} y={tableY + 24} width={18} height={60} fill="#3a1408" />
          <rect x={1100} y={tableY - 22} width={90} height={22} fill="#efe4c4" stroke="#8a6a3a" strokeWidth={2} />
          <rect x={1140} y={tableY - 30} width={14} height={30} fill="#c8302a" />
        </g>
        <g transform={`translate(${cupX} ${cupY}) rotate(${cupR})`}>
          <path d="M-26 -18 L26 -18 L18 10 L-18 10 Z" fill="#e8e2d0" stroke="#6a5a40" strokeWidth={3} />
          <ellipse cx={0} cy={-18} rx={26} ry={6} fill="#a8c890" />
          <rect x={-12} y={10} width={24} height={8} fill="#c8c0a8" />
        </g>
        {hitOn && cupT > 0.1 && cupT < 0.9 && Array.from({length: 6}, (_, i) => <circle key={i} cx={cupX + Math.cos(i) * 40 * cupT} cy={cupY - 10 - Math.sin(i * 2) * 30 * cupT} r={6} fill="#a8c890" opacity={0.8} />)}
        {hitOn && since < 30 && (
          <g opacity={1 - since / 30}>
            {Array.from({length: 10}, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const r0 = 40 + since * 4;
              return <line key={i} x1={1060 + Math.cos(a) * r0} y1={tableY + Math.sin(a) * r0 * 0.5} x2={1060 + Math.cos(a) * (r0 + 60)} y2={tableY + Math.sin(a) * (r0 + 60) * 0.5} stroke="#ffe0a0" strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        {[0, 1].map((row) =>
          [0, 1, 2, 3].map((i) => {
            const gs = row ? 0.5 : 0.42;
            const g = row ? 1010 : 830;
            const x = (row ? 140 : 220) + i * (row ? 190 : 160);
            const p = kneelPose(x, g, gs, 1);
            const a = 40 + 35 * cower + Math.sin(t / 7 + i) * 2;
            const neck = lean(p.hip, a, gs);
            const hand: P = [neck[0] + 50 * gs, g - 20 * gs];
            const looks = [CAST.offR, CAST.offB, CAST.offG, CAST.offR];
            const hh = headOf(p.hip, neck, gs);
            return (
              <g key={`${row}-${i}`}>
                {R(looks[(i + row) % 4], {...p, neck, handN: hand, handF: [hand[0] - 14, hand[1]]}, gs, {face: cower > 0.5 ? 'pain' : 'calm'})}
                {cower > 0.5 && <Sweat x={hh[0] - 10} y={hh[1] - 50 * gs} s={0.6} />}
              </g>
            );
          }),
        )}
        <StandLamp f={t + (hitOn ? Math.max(0, 20 - since) * 3 : 0)} x={800} y={720} s={0.85} />
        <StandLamp f={t} x={1760} y={720} s={0.85} seed={3} />
        <Pillar id="s10p1" x={60} y0={0} y1={1060} w={130} />
        <Pillar id="s10p2" x={1870} y0={0} y1={1060} w={130} />
        <Curtain f={t} y={60} drop={36} n={9} sides={false} />
        {hitOn && since < 40 && (
          <text x={1010} y={520} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={170 + 40 * (1 - clamp01(since / 8))} fill="#e8402a" opacity={1 - clamp01((since - 26) / 14)} style={{filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.9))'}}>
            啪！
          </text>
        )}
      </Svg>
      <Vignette k={0.65} />
      <Flash f={t} at={real} dur={10} peak={0.7} />
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s5: S5Map, s6: S6Hall, s7: S7Study, s8: S8Armor, s9: S9Court, s10: S10Slam};
/** 第一幕：第 5–10 屏，按 SHOT 分配 */
export const Act1: React.FC<{f: number}> = ({f}) => {
  const id = Object.keys(SCENES).find((k) => f >= fbt(SHOT[k][0]) && f < fbt(SHOT[k][1]));
  if (!id) return null;
  const C = SCENES[id];
  return (
    <AbsoluteFill>
      <C t={f - fbt(SHOT[id][0])} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 1000px 260px at 360px 90px, rgba(10,4,2,0.62), rgba(10,4,2,0.3) 55%, rgba(10,4,2,0) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
export const ACT1_START = fbt(SHOT.s5[0]);
