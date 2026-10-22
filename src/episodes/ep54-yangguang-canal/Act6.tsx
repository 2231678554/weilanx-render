import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeInOut, easeOut, easeOutBack} from '../../library/anim';
import {Flash} from '../../library/lamplight/stage';
import {LF} from '../../library/lamplight/theme';
import {along, GrainBoat, polyPath, RIVERS, type LL} from './Act5';
import {Drape, GoldTube, Label3, Map3D, Pin3, project, type Cam3, type Px} from './Map3D';
import {lerp, Svg} from './Opening';
import {DragonBoat} from './Props';
import {B, fbt, S35, S36, S37, S38, S39, S40, SHOT} from './timeline';

const bt = (b: number) => b * B;
const seg = (t: number, a: number, b: number) => clamp01((t - bt(a)) / bt(b - a));

/* ── 隋代运河走向（示意，取主要节点） ── */
const CHANGAN: LL = [108.94, 34.27];
const LUOYANG: LL = [112.45, 34.62];
const TONGGUAN: LL = [110.25, 34.58];
const ZHUO: LL = [116.4, 39.9];
const JIANGDU: LL = [119.42, 32.39];
const YUHANG: LL = [120.16, 30.28];
const KOGURYO: LL = [124.6, 41.0];
/** 永济渠：沁水口（黄河北岸）→ 馆陶 → 临清 → 德州 → 沧州 → 天津 → 涿郡 */
const YONGJI: LL[] = [[113.35, 35.05], [113.9, 35.35], [114.6, 35.9], [115.35, 36.55], [115.75, 37.0], [116.3, 37.5], [116.85, 38.3], [117.15, 38.95], [116.8, 39.45], ZHUO];
/** 通济渠：洛阳 → 板渚 → 汴州 → 宋州 → 埇桥 → 泗州（入淮） */
const TONGJI: LL[] = [LUOYANG, [113.0, 34.78], [113.4, 34.85], [114.35, 34.8], [115.65, 34.42], [116.95, 33.65], [118.0, 33.25], [118.5, 33.0]];
/** 淮河一段 + 邗沟：泗州 → 山阳（淮安）→ 江都 */
const HANGOU: LL[] = [[118.5, 33.0], [119.0, 33.45], [119.15, 33.5], [119.3, 33.05], [119.42, 32.7], JIANGDU];
/** 江南河：京口 → 常州 → 无锡 → 苏州 → 嘉兴 → 余杭 */
const JIANGNAN: LL[] = [[119.45, 32.2], [119.95, 31.78], [120.3, 31.57], [120.6, 31.3], [120.75, 30.75], [120.45, 30.45], YUHANG];
/** 广通渠：潼关 → 渭南 → 长安 */
const GUANGTONG: LL[] = [TONGGUAN, [109.9, 34.56], [109.5, 34.52], [109.2, 34.42], CHANGAN];
/** 611 年北上：江都 → 邗沟 → 通济渠 → 渡河 → 永济渠 → 涿郡 */
const NORTH611: LL[] = [...[...HANGOU].reverse(), ...[...TONGJI].reverse().slice(1, -2), [113.4, 34.85], ...YONGJI];

const WIDE: Cam3 = {lon: 115.6, lat: 34.6, dist: 2500, pitch: 62, yaw: 0};

/** 画布上的虚线箭头（Drape 里） */
const dashArrow = (g: CanvasRenderingContext2D, px: Px, a: LL, b: LL, p: number, flow: number) => {
  if (p <= 0) return;
  const [x0, y0] = px(...a);
  const [x1f, y1f] = px(...b);
  const x1 = lerp(x0, x1f, p), y1 = lerp(y0, y1f, p);
  g.save();
  g.lineCap = 'round';
  g.setLineDash([22, 16]);
  g.lineDashOffset = -flow;
  g.strokeStyle = 'rgba(40,20,4,0.6)';
  g.lineWidth = 14;
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = '#ffd070';
  g.lineWidth = 8;
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.setLineDash([]);
  const ang = Math.atan2(y1 - y0, x1 - x0);
  g.translate(x1, y1); g.rotate(ang);
  g.fillStyle = '#ffd070'; g.strokeStyle = 'rgba(40,20,4,0.7)'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(26, 0); g.lineTo(-14, -20); g.lineTo(-6, 0); g.lineTo(-14, 20); g.closePath(); g.stroke(); g.fill();
  g.restore();
};
const glow = (g: CanvasRenderingContext2D, px: Px, at: LL, r: number, a: number) => {
  const [x, y] = px(...at);
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(255,214,120,${a})`);
  gr.addColorStop(1, 'rgba(255,214,120,0)');
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
};
/** 名牌（金框小卡），出场带弹跳 */
const Card: React.FC<{x: number; y: number; text: string; sub?: string; p: number; size?: number; color?: string}> = ({x, y, text, sub, p, size = 46, color = '#ffe6a8'}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', left: x - 300, top: y, width: 600, textAlign: 'center', opacity: Math.min(1, p * 2), transform: `scale(${lerp(1.5, 1, easeOutBack(clamp01(p)))})`}}>
      <div style={{display: 'inline-block', padding: '6px 22px', background: 'rgba(60,24,8,0.86)', border: '3px solid #e8b860', borderRadius: 10, fontFamily: LF.serif, fontWeight: 900, fontSize: size, color, boxShadow: '0 8px 24px rgba(0,0,0,0.55)', whiteSpace: 'nowrap'}}>
        {text}
        {sub && <span style={{fontSize: size * 0.62, color: '#e8d8b0', marginLeft: 8}}>{sub}</span>}
      </div>
    </div>
  );

/* ═════════ 第 35 屏：洛阳射出三道虚线箭头（东北、东南、西） ═════════ */
const Sc35: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(8)));
  const cam: Cam3 = {lon: lerp(114.5, 114.2, k), lat: lerp(33.0, 34.2, k), dist: lerp(1900, 2100, k), pitch: 64, yaw: 0};
  const flow = t * 2.5;
  const ps = [S35.a1, S35.a2, S35.a3].map((a) => easeOut(seg(t, a, a + 1.1)));
  const pulse = (t % bt(2)) / bt(2);
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    glow(g, px, LUOYANG, 70, 0.9);
    const [x, y] = px(...LUOYANG);
    g.strokeStyle = `rgba(255,210,110,${0.9 * (1 - pulse)})`;
    g.lineWidth = 6;
    g.beginPath(); g.arc(x, y, 12 + pulse * 70, 0, Math.PI * 2); g.stroke();
    dashArrow(g, px, [112.9, 35.0], [115.6, 38.6], ps[0], flow);
    dashArrow(g, px, [113.0, 34.3], [117.6, 31.4], ps[1], flow);
    dashArrow(g, px, [111.9, 34.6], [109.4, 34.4], ps[2], flow);
  };
  const dirs: [LL, string, number][] = [[[115.9, 39.0], '东北', ps[0]], [[118.0, 31.0], '东南', ps[1]], [[109.0, 34.0], '西', ps[2]]];
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={`${Math.floor(flow)}_${ps.map((q) => q.toFixed(2)).join('_')}_${pulse.toFixed(2)}`} opacity={0.95} />
        <Pin3 at={LUOYANG} big />
      </Map3D>
      <Label3 cam={cam} at={LUOYANG} name="洛阳" lift={36} size={50} />
      {dirs.map(([at, n, p]) => {
        const [x, y] = project(cam, at[0], at[1], 6);
        return p > 0.6 ? <div key={n} style={{position: 'absolute', left: x - 80, top: y - 40, width: 160, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: 56, color: '#ffe6a8', WebkitTextStroke: '2px #2a1606', textShadow: '0 4px 14px rgba(0,0,0,0.8)', opacity: (p - 0.6) / 0.4, transform: `scale(${lerp(1.4, 1, easeOutBack((p - 0.6) / 0.4))})`}}>{n}</div> : null;
      })}
    </AbsoluteFill>
  );
};

/* ═════════ 第 36 屏：永济渠，金线从黄河北岸画到涿郡 ═════════ */
const Sc36: React.FC<{t: number}> = ({t}) => {
  const p = easeInOut(seg(t, S36.d0, S36.d1));
  const k = easeInOut(clamp01(t / bt(8)));
  const cam: Cam3 = {lon: lerp(114.6, 115.6, k), lat: lerp(35.9, 37.4, k), dist: lerp(1300, 1550, k), pitch: 60, yaw: lerp(-6, 0, k)};
  const lab = easeOut(seg(t, S36.d1, S36.d1 + 0.8));
  const mid = project(cam, 115.75, 37.0, 6);
  const [zx, zy] = project(cam, ...ZHUO, 30);
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <GoldTube pts={YONGJI} p={p} r={4} />
        <Pin3 at={LUOYANG} />
        <Pin3 at={ZHUO} big o={lab} />
      </Map3D>
      <Label3 cam={cam} at={LUOYANG} name="洛阳" side="left" lift={26} size={38} o={0.85} />
      <Label3 cam={cam} at={[113.6, 34.75]} name="黄河" lift={4} size={30} o={0.8} color="#bfe6ff" />
      <Card x={mid[0] + 230} y={mid[1] - 40} text="永济渠" p={easeOut(seg(t, S36.d0 + 1.5, S36.d0 + 2.3))} size={52} />
      <Card x={zx + 40} y={zy - 110} text="涿郡" sub="（今北京一带）" p={lab} size={48} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 37 屏：高句丽亮起红色敌旗；611 年龙舟从江都北上涿郡，粮船兵船首尾相接 ═════════ */
const EnemyFlag: React.FC<{x: number; y: number; t: number; p: number}> = ({x, y, t, p}) => {
  if (p <= 0) return null;
  const w = Math.sin(t / 5) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${lerp(0.2, 1, easeOutBack(p))})`} opacity={Math.min(1, p * 2)}>
      <circle cx={0} cy={-60} r={110} fill="rgba(220,40,20,0.22)" />
      <line x1={0} y1={0} x2={0} y2={-150} stroke="#2a1408" strokeWidth={7} />
      <path d={`M0 -150 Q46 ${-144 + w} 96 ${-146 + w * 1.6} L90 ${-92 + w * 1.4} Q44 ${-86 + w} 0 -94 Z`} fill="#c8281c" stroke="#3a0804" strokeWidth={3} />
      <text x={46} y={-108} textAnchor="middle" fontFamily={LF.serif} fontWeight={900} fontSize={34} fill="#ffe0b0">敌</text>
    </g>
  );
};
const TroopBoat: React.FC<{x: number; y: number; s: number; dir: number; o?: number}> = ({x, y, s, dir, o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`} opacity={o}>
    <path d="M-34 0 L34 0 L26 12 L-28 12 Z" fill="#4a2a14" stroke="#1a0a04" strokeWidth={2} />
    {[-20, -8, 4, 16].map((k) => (
      <g key={k}>
        <circle cx={k} cy={-7} r={4.5} fill="#e6c9a0" stroke="#3a2a1a" strokeWidth={1} />
        <line x1={k + 3} y1={2} x2={k + 3} y2={-30} stroke="#c8c8c8" strokeWidth={1.6} />
      </g>
    ))}
    <path d="M-30 -2 L-30 -24 L-16 -20 L-30 -16" fill="#c8281c" stroke="#3a0804" strokeWidth={1} />
  </g>
);
const Sc37: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(10)));
  const cam: Cam3 = {lon: lerp(118.0, 118.6, k), lat: lerp(37.0, 37.3, k), dist: lerp(2800, 2950, k), pitch: 58, yaw: 0};
  const flagP = clamp01((t - bt(S37.flag)) / 14);
  const go = seg(t, S37.boat0, S37.boat1);
  const routeP = easeOut(seg(t, 0, 1.2));
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(255,200,90,0.5)'; g.lineWidth = 7;
    polyPath(g, px, [NORTH611]);
    g.restore();
    if (flagP > 0) {
      const [x, y] = px(...KOGURYO);
      const gr = g.createRadialGradient(x, y, 0, x, y, 160);
      gr.addColorStop(0, `rgba(220,40,20,${0.55 * flagP})`);
      gr.addColorStop(1, 'rgba(220,40,20,0)');
      g.fillStyle = gr; g.fillRect(x - 160, y - 160, 320, 320);
    }
  };
  // 船队：龙舟在前，后面粮船、兵船交替，首尾相接
  const lead = easeInOut(go) * 0.985;
  const fleet = Array.from({length: 22}, (_, i) => lead - i * 0.024).filter((u) => u > 0.004);
  const [fx, fy] = project(cam, ...KOGURYO, 6);
  const yearP = easeOut(seg(t, S37.boat0 - 0.3, S37.boat0 + 0.5));
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={flagP.toFixed(2)} opacity={0.95} landOnly={false} />
        <GoldTube pts={YONGJI} p={routeP} r={4} />
        <Pin3 at={JIANGDU} />
        <Pin3 at={ZHUO} big />
      </Map3D>
      <Svg>
        {fleet.map((u, i) => {
          const [x, y] = project(cam, ...along(NORTH611, u), 5);
          const [x2] = project(cam, ...along(NORTH611, Math.min(1, u + 0.01)), 5);
          const dir = x2 >= x ? 1 : -1;
          if (i === 0)
            return (
              <g key={i} transform={`translate(${x} ${y - 8}) scale(${dir * 0.075} 0.075)`}>
                <DragonBoat f={t} />
              </g>
            );
          return i % 2 ? <GrainBoat key={i} x={x} y={y} s={0.8} dir={dir} /> : <TroopBoat key={i} x={x} y={y} s={0.8} dir={dir} />;
        })}
        <EnemyFlag x={fx} y={fy} t={t} p={flagP} />
      </Svg>
      <Label3 cam={cam} at={JIANGDU} name="江都" lift={20} size={36} />
      <Label3 cam={cam} at={ZHUO} name="涿郡" side="left" lift={34} size={42} />
      <Label3 cam={cam} at={[124.6, 40.2]} name="高句丽" lift={6} size={42} o={flagP} color="#ff9a80" />
      {yearP > 0 && (
        <div style={{position: 'absolute', right: 90, bottom: 120, opacity: yearP, transform: `translateY(${(1 - yearP) * 30}px)`, fontFamily: LF.serif, fontWeight: 900, fontSize: 72, color: '#ffe6a8', WebkitTextStroke: '2px #2a1606', textShadow: '0 6px 18px rgba(0,0,0,0.8)'}}>
          公元 611 年
        </div>
      )}
      <Flash f={t} at={bt(S37.flag)} dur={10} peak={0.75} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 38 屏：东南——通济渠、邗沟、江南河，一直到余杭 ═════════ */
const Sc38: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(8)));
  const cam: Cam3 = {lon: lerp(115.4, 117.2, k), lat: lerp(33.0, 32.5, k), dist: lerp(1650, 1850, k), pitch: 60, yaw: 0};
  const p1 = easeInOut(seg(t, S38.d0, S38.d1));
  const p2 = easeInOut(seg(t, S38.d1, S38.d2));
  const p3 = easeInOut(seg(t, S38.d2, S38.d3));
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [n, lines] of RIVERS) {
      if (n === '黄河') continue;
      g.strokeStyle = 'rgba(10,30,60,0.5)'; g.lineWidth = 11; polyPath(g, px, lines);
      g.strokeStyle = 'rgba(80,170,230,0.85)'; g.lineWidth = 6; polyPath(g, px, lines);
    }
    g.restore();
  };
  const c1 = project(cam, 115.65, 34.42, 6);
  const c2 = project(cam, 119.3, 33.05, 6);
  const c3 = project(cam, 120.6, 31.3, 6);
  const [yx, yy] = project(cam, ...YUHANG, 24);
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep="r" opacity={0.95} />
        <GoldTube pts={TONGJI} p={p1} r={4} />
        <GoldTube pts={HANGOU} p={p2} r={4} />
        <GoldTube pts={JIANGNAN} p={p3} r={4} />
        <Pin3 at={LUOYANG} />
        <Pin3 at={JIANGDU} />
        <Pin3 at={YUHANG} big o={easeOut(seg(t, S38.d3 - 0.4, S38.d3 + 0.4))} />
      </Map3D>
      <Label3 cam={cam} at={LUOYANG} name="洛阳" side="left" lift={26} size={38} />
      <Label3 cam={cam} at={JIANGDU} name="江都" side="left" lift={22} size={34} o={0.9} />
      {[['淮河', [114.0, 32.45]], ['长江', [115.6, 29.95]], ['钱塘江', [118.6, 29.5]]].map(([n, at]) => <Label3 key={n as string} cam={cam} at={at as LL} name={n as string} lift={4} size={30} o={0.85} color="#bfe6ff" />)}
      <Card x={c1[0]} y={c1[1] - 120} text="通济渠" p={easeOut(seg(t, S38.d0 + 0.8, S38.d0 + 1.5))} />
      <Card x={c2[0] + 150} y={c2[1] - 50} text="邗沟" p={easeOut(seg(t, S38.d1 + 0.3, S38.d1 + 1))} />
      <Card x={c3[0] + 170} y={c3[1] - 50} text="江南河" p={easeOut(seg(t, S38.d2 + 0.6, S38.d2 + 1.3))} />
      <Card x={yx - 40} y={yy + 40} text="余杭" sub="（今杭州）" p={easeOut(seg(t, S38.d3, S38.d3 + 0.7))} size={44} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 39 屏：四条大河依次亮起，金色运河从北到南串成一张网，整网闪光 ═════════ */
const NET: LL[][] = [YONGJI, TONGJI, HANGOU, JIANGNAN, GUANGTONG];
const Sc39: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(8)));
  const cam: Cam3 = {...WIDE, lon: lerp(115.8, 115.4, k), lat: lerp(34.4, 35.0, k), dist: lerp(2350, 2550, k)};
  const lit = RIVERS.map((_, i) => easeOut(seg(t, S39.r0 + i, S39.r0 + i + 0.6)));
  const net = seg(t, S39.net0, S39.net1);
  const fl = t - bt(S39.flash);
  const shine = fl > 0 ? Math.max(0, 1 - fl / 24) : 0;
  const paint = (g: CanvasRenderingContext2D, px: Px) => {
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    RIVERS.forEach(([, lines], i) => {
      if (lit[i] <= 0) return;
      g.globalAlpha = lit[i];
      g.strokeStyle = 'rgba(120,210,255,0.35)'; g.lineWidth = 26; polyPath(g, px, lines);
      g.strokeStyle = 'rgba(10,30,60,0.6)'; g.lineWidth = 13; polyPath(g, px, lines);
      g.strokeStyle = '#5ab8f0'; g.lineWidth = 8; polyPath(g, px, lines);
    });
    g.restore();
  };
  // 运河自北向南逐段串起：永济渠 → 通济渠 → 邗沟 → 江南河（广通渠同时接上）
  const order = [0, 1, 2, 3, 1];
  const pOf = (i: number) => easeInOut(clamp01(net * 4 - order[i]));
  const flipYongji = [...YONGJI].reverse();
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <Drape paint={paint} dep={lit.map((q) => q.toFixed(2)).join('_')} opacity={0.95} />
        <GoldTube pts={flipYongji} p={pOf(0)} r={5} color={shine > 0 ? '#fff6d0' : '#ffd070'} />
        {NET.slice(1).map((pts, j) => <GoldTube key={j} pts={pts} p={pOf(j + 1)} r={5} color={shine > 0 ? '#fff6d0' : '#ffd070'} />)}
        <Pin3 at={LUOYANG} big />
      </Map3D>
      {RIVERS.map(([n], i) => {
        const at: LL[] = [[111.6, 35.95], [114.0, 32.6], [115.2, 30.1], [118.6, 29.4]];
        return <Label3 key={n} cam={cam} at={at[i]} name={n} lift={4} size={40} o={lit[i]} color="#bfe6ff" />;
      })}
      <Label3 cam={cam} at={LUOYANG} name="洛阳" side="left" lift={34} size={38} o={0.9} />
      <Label3 cam={cam} at={ZHUO} name="涿郡" side="left" lift={20} size={34} o={pOf(0)} color="#ffe6a8" />
      <Label3 cam={cam} at={YUHANG} name="余杭" lift={20} size={34} o={pOf(3)} color="#ffe6a8" />
      {shine > 0 && <AbsoluteFill style={{background: 'radial-gradient(ellipse 900px 700px at 55% 55%, rgba(255,220,140,0.35), rgba(255,220,140,0) 70%)', opacity: shine, mixBlendMode: 'screen'}} />}
      <Flash f={t} at={bt(S39.flash)} dur={9} peak={0.7} />
    </AbsoluteFill>
  );
};

/* ═════════ 第 40 屏：往西，广通渠从潼关接到长安（隋文帝时修） ═════════ */
const Sc40: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp01(t / bt(8)));
  const cam: Cam3 = {lon: lerp(111.0, 110.3, k), lat: lerp(34.75, 34.6, k), dist: lerp(900, 780, k), pitch: 52, yaw: lerp(4, -2, k)};
  const p = easeInOut(seg(t, S40.d0, S40.d1));
  const lab = easeOut(seg(t, S40.d1 - 0.4, S40.d1 + 0.4));
  const mid = project(cam, 109.6, 34.52, 6);
  return (
    <AbsoluteFill>
      <Map3D cam={cam}>
        <GoldTube pts={[...TONGJI].slice(0, 3)} p={1} r={3.5} />
        <GoldTube pts={GUANGTONG} p={p} r={3.5} />
        <Pin3 at={CHANGAN} big o={easeOut(seg(t, S40.d1 - 0.6, S40.d1))} />
        <Pin3 at={LUOYANG} />
        <Pin3 at={TONGGUAN} />
      </Map3D>
      <Label3 cam={cam} at={LUOYANG} name="洛阳" lift={26} size={38} o={0.9} />
      <Label3 cam={cam} at={TONGGUAN} name="潼关" lift={26} size={36} o={0.9} />
      <Label3 cam={cam} at={CHANGAN} name="长安" side="left" lift={36} size={46} o={lab} />
      <Card x={mid[0]} y={mid[1] + 50} text="广通渠" sub="（隋文帝时修）" p={lab} size={50} />
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number}>> = {s35: Sc35, s36: Sc36, s37: Sc37, s38: Sc38, s39: Sc39, s40: Sc40};

export const Act6: React.FC<{f: number}> = ({f}) => {
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
export const ACT6_START = fbt(SHOT.s35[0]);
