import {STORY_START} from './story';
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {clamp01, easeIn, easeOut, keyframes, rand} from '../../library/anim';
import {Drum, Gate, Moon} from '../../library/lamplight/props';
import {darkness, panelAt} from '../../library/lamplight/scenes';
import {BigGlyph, Disclaimer, Embers, Flash, Narration, NightBg, shakeXY, TitleCard} from '../../library/lamplight/stage';
import {L, LF, textShadow} from '../../library/lamplight/theme';
import {PunishScene} from './PunishScene';
import {Story} from './Story';
import {Rig, runPose, standPose, Stick, swing} from './Rig';
import {CUES, DARK_FROM, DRUM_BEATS, FACE_BEAT, fbt, FREEZE, HIT, HOOK_BAR, NINE_BEAT, SHOTS, SLAM_BEATS, SPANK_BEATS, TITLE} from './timeline';

/**
 * ep53 长安宵禁 · 开场：大鼓一下接一下砸 → 三座鼓楼 → 满街人往坊里冲 → 108 坊三排落锁 → 门拍脸 → 一板一拍打屁股 → 第九百下 → 标题卡。
 */
const inShot = (f: number, s: readonly [number, number]) => f >= s[0] && f < s[1];
const DRUM_F = DRUM_BEATS.map(fbt);
const lastHit = (f: number, hits: number[]) => hits.filter((h) => h <= f).pop();

export const Svg: React.FC<{children: React.ReactNode; opacity?: number}> = ({children, opacity = 1}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
    {children}
  </svg>
);

/** 一条胳膊握着棍子：肩 (sx, sy) 为轴，砸下时棍头正好落在 (tx, ty)；lift 0–1 抡起（朝左的人往上抡） */
const SwingArm: React.FC<{sx: number; sy: number; tx: number; ty: number; lift: number; scale?: number; maxLift?: number; stick?: string; head?: string}> = ({sx, sy, tx, ty, lift, scale = 1, maxLift = 85, stick = L.wood, head}) => {
  const len = Math.hypot(tx - sx, ty - sy);
  const hitAng = (Math.atan2(ty - sy, tx - sx) * 180) / Math.PI;
  const ang = hitAng + maxLift * lift;
  const arm = Math.min(110 * scale, len * 0.42);
  return (
    <Svg>
      <g transform={`translate(${sx} ${sy}) rotate(${ang})`}>
        <line x1={arm - 10} y1={0} x2={len} y2={0} stroke={stick} strokeWidth={16 * scale} strokeLinecap="round" />
        {head && <circle cx={len} cy={0} r={18 * scale} fill={head} />}
        <line x1={0} y1={0} x2={arm} y2={0} stroke={L.figure} strokeWidth={15 * scale} strokeLinecap="round" />
        <circle cx={arm} cy={0} r={13 * scale} fill={L.figure} />
      </g>
    </Svg>
  );
};

/** 抡起程度：敲完 3 帧贴在鼓面，之后抬起，下一下前 4 帧砸下 */
const liftAt = (f: number, hits: number[], down = 4) => {
  const next = hits.find((h) => h > f);
  const last = lastHit(f, hits);
  const since = last === undefined ? 99 : f - last;
  const toNext = next === undefined ? 99 : next - f;
  return since < 3 ? 0 : toNext <= down ? toNext / down : Math.min(1, (since - 3) / 4);
};

/** 鼓手（Rig）：站在鼓右边，面朝鼓，双手各握一根鼓槌轮流从头顶抡下 */
export const Drummer: React.FC<{f: number; x: number; y: number; r: number; hits: number[]; scale?: number}> = ({f, x, y, r, hits, scale = 1}) => {
  const s = 0.8 * scale;
  const fx = x + r * 1.5;
  const odd = hits.filter((_, i) => i % 2 === 0);
  const even = hits.filter((_, i) => i % 2 === 1);
  const p = standPose(fx, y, s, -1);
  const S: [number, number] = [p.neck[0], p.neck[1] + 16 * s];
  const A = swing(S, [x + r * 0.55, y - r * 1.25], liftAt(f, even.length ? even : hits), s, -1, 0.42);
  const B = swing(S, [x + r * 0.45, y - r * 1.55], liftAt(f, odd), s, -1, 0.42);
  return (
    <Svg>
      <Stick from={B.butt} to={B.tip} w={14 * s} color={L.wood} head="#a8261b" hr={20 * s} />
      <Rig {...p} hip={[fx + 14 * s, p.hip[1]]} handN={A.hand} handF={B.hand} s={s} robe="#5a2a1e" robeD="#43201a" face="shout" mouth={0.6} headTilt={-6}>
        <Stick from={A.butt} to={A.tip} w={14 * s} color={L.wood} head="#a8261b" hr={20 * s} />
      </Rig>
    </Svg>
  );
};

/** 敲击时飞出的「咚」字 */
export const DongWords: React.FC<{f: number; hits: number[]; x: number; y: number; big?: number[]}> = ({f, hits, x, y, big = []}) => (
  <>
    {hits
      .filter((h) => f >= h && f - h < 14)
      .map((h, i) => {
        const t = (f - h) / 14;
        const isBig = big.includes(h);
        const dx = (rand(h) - 0.5) * 500;
        return (
          <div key={h} style={{position: 'absolute', left: x + dx * t - 150, top: y - 140 * t - 100, width: 300, textAlign: 'center', fontFamily: LF.serif, fontWeight: 900, fontSize: isBig ? 190 : 120, color: L.goldHot, opacity: 1 - t, transform: `scale(${1.4 - 0.4 * easeOut(Math.min(1, t * 3))})`, textShadow: '0 0 40px rgba(255,200,100,0.7)'}}>
            咚
          </div>
        );
      })}
  </>
);

/** 鼓楼剪影 */
export const DrumTower: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 0}) => (
  <Svg>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-220} y={-200} width={440} height={200} fill="#1d1510" />
      <rect x={-60} y={-110} width={120} height={110} fill="#0a0706" />
      <rect x={-170} y={-330} width={340} height={130} fill="#241a12" />
      <path d="M-260 -330 L0 -430 L260 -330 Z" fill="#14100c" />
      <rect x={-120} y={-310} width={240} height={90} fill={`rgba(255,190,90,${0.25 + 0.6 * glow})`} />
    </g>
  </Svg>
);

/** 108 坊俯视图：12 列 × 9 行；lockAt[row] 那一帧这一行落锁（变暗 + 红门） */
const WardGrid: React.FC<{f: number; lockRow: (r: number) => number | undefined; you?: boolean; route?: number; ninety?: boolean}> = ({f, lockRow, route = 0}) => {
  const cols = 12;
  const rows = 9;
  const x0 = 440;
  const y0 = 330;
  const cw = 96;
  const ch = 62;
  const gap = 16;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const at = lockRow(r);
    const locked = at !== undefined && f >= at;
    const t = at === undefined ? 1 : clamp01((f - at) / 6);
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (cw + gap);
      const y = y0 + r * (ch + gap);
      const seed = r * 31 + c;
      const lightOn = locked ? 1 - t * 0.8 : 1;
      cells.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width={cw} height={ch} fill="#241b14" stroke={locked ? 'rgba(225,104,79,0.7)' : 'rgba(239,230,214,0.35)'} strokeWidth={2} />
          <circle cx={x + cw * (0.3 + 0.4 * rand(seed))} cy={y + ch * (0.3 + 0.4 * rand(seed + 3))} r={18} fill="rgba(255,200,110,0.55)" opacity={lightOn * (0.7 + 0.3 * Math.sin(f / 6 + seed))} />
          {locked && <rect x={x + cw / 2 - 14} y={y + ch - 6} width={28} height={10} fill={L.redDeep} opacity={t} />}
        </g>,
      );
    }
  }
  return (
    <Svg>
      <rect x={x0 - 30} y={y0 - 30} width={cols * (cw + gap) - gap + 60} height={rows * (ch + gap) - gap + 60} fill="#0d0a08" stroke="rgba(239,230,214,0.5)" strokeWidth={4} />
      {cells}
    </Svg>
  );
};

/** 900 下那张图：你 — 一 — 二 — 三 — 家 */
export const RoutePlan: React.FC<{f: number; at: number}> = ({f, at}) => {
  const pts: [number, number][] = [
    [380, 760],
    [720, 760],
    [1060, 620],
    [1400, 620],
    [1600, 420],
  ];
  const labels = ['你', '一', '二', '三', '家'];
  const lit = (i: number) => fbt(26) + i * 8;
  return (
    <Svg>
      {Array.from({length: 6}, (_, c) =>
        Array.from({length: 4}, (_, r) => <rect key={`${c}-${r}`} x={240 + c * 260} y={330 + r * 170} width={210} height={120} fill="#1d1612" stroke="rgba(239,230,214,0.2)" strokeWidth={2} />),
      )}
      {pts.slice(0, -1).map(([x, y], i) => {
        const [x2, y2] = pts[i + 1];
        const p = clamp01((f - lit(i)) / 8);
        return <line key={i} x1={x} y1={y} x2={x + (x2 - x) * p} y2={y + (y2 - y) * p} stroke={L.gold} strokeWidth={6} strokeDasharray="18 14" />;
      })}
      {pts.map(([x, y], i) => {
        const shown = i === 0 ? f >= at : f >= lit(i - 1) + 8;
        if (!shown) return null;
        const home = i === 4;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={home ? 46 : 36} fill={i === 0 ? L.redDeep : home ? L.gold : '#2b221a'} stroke={L.ink} strokeWidth={4} />
            <text x={x} y={y + 16} textAnchor="middle" fontFamily="Noto Serif SC, serif" fontWeight={900} fontSize={home ? 46 : 40} fill={home ? '#1a120c' : L.ink}>
              {labels[i]}
            </text>
          </g>
        );
      })}
    </Svg>
  );
};

/** 右下角小计数：开场跟着鼓狂跳 */
export const MiniCount: React.FC<{f: number; n: number; red?: boolean; big?: number}> = ({n, red, big = 0}) => (
  <div style={{position: 'absolute', right: 70 + big * 0, bottom: 60 + big * 0, fontFamily: LF.serif, fontWeight: 900, fontSize: 56 + big * 90, color: red ? L.red : L.inkDim, textShadow, transformOrigin: '100% 100%'}}>
    第 {n} 下
  </div>
);

export const Ep53Curfew: React.FC = () => {
  const f = useCurrentFrame();
  const ff = f >= DARK_FROM && f < HIT ? Math.min(f, HIT - FREEZE) : f;
  const dark = darkness(f, DARK_FROM, HIT, FREEZE);
  const panel = panelAt(CUES, fbt, ff);
  const bigHits = [0, 5, 7, 8].map(fbt);
  const allHits = [...DRUM_F, ...SLAM_BEATS.map(fbt), fbt(FACE_BEAT), fbt(NINE_BEAT)];
  const lh = lastHit(f, allHits);
  const sh = shakeXY(f, lh ?? -99, lh !== undefined && (bigHits.includes(lh) || lh >= fbt(11)) ? 22 : 10);
  // 计数：0–11 拍从 1 涨到 640，之后停在 1000 门关上
  const count = Math.round(keyframes(ff, [[0, 1], [fbt(4), 60], [fbt(8), 260], [fbt(11), 1000]], easeIn));

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Audio src={staticFile('audio/ep53-changan-curfew/mix.wav')} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        {/* 大鼓特写：天一黑 */}
        {inShot(f, SHOTS.drum) && (
          <>
            <NightBg f={ff} floor glow={[50, 60]} strength={1.3 - 0.5 * clamp01((ff - fbt(2)) / 6)} horizon={700} />
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(200,90,40,0.55), rgba(0,0,0,0) 70%)', opacity: 1 - clamp01((ff - fbt(2)) / 5)}} />
            <Svg>
              <circle cx={1500} cy={300 + 400 * easeIn(clamp01((ff - fbt(2)) / 6))} r={90} fill="#e8743a" opacity={1 - clamp01((ff - fbt(2) - 4) / 4)} />
            </Svg>
            {ff >= fbt(2) + 6 && <Moon f={ff} x={1600} y={170} r={40} />}
            <Drum f={ff} x={900} y={1000} r={260} hits={DRUM_F} />
            <Drummer f={ff} x={900} y={1000} r={260} hits={DRUM_F} />
            <DongWords f={ff} hits={DRUM_F} x={900} y={420} big={bigHits} />
          </>
        )}
        {/* 三座鼓楼，一拍一切 */}
        {inShot(f, SHOTS.cities) &&
          (() => {
            const cut = ff < fbt(5) ? 0 : ff < fbt(7) ? 1 : 2;
            const pos = [
              [960, 980, 1.6],
              [600, 1000, 1.2],
              [1300, 1000, 1.9],
            ][cut];
            return (
              <>
                <NightBg f={ff} floor glow={[(pos[0] / 1920) * 100, 60]} strength={1.1} horizon={760} />
                <DrumTower x={pos[0]} y={pos[1]} s={pos[2]} glow={clamp01(1 - (ff - (lastHit(ff, DRUM_F) ?? 0)) / 8)} />
                <Drum f={ff} x={pos[0]} y={pos[1] - 260 * pos[2] + 60} r={50 * pos[2]} hits={DRUM_F} />
                <DongWords f={ff} hits={DRUM_F} x={pos[0]} y={300} big={bigHits} />
                <Moon f={ff} x={1650} y={150} r={36} />
              </>
            );
          })()}
        {/* 满街人往坊门冲 */}
        {inShot(f, SHOTS.rush) && (
          <>
            <NightBg f={ff} floor glow={[80, 62]} horizon={640} />
            <Gate f={ff} x={1600} y={940} w={360} h={480} open={0.8} label="坊门" />
            <Svg>
              {Array.from({length: 9}, (_, i) => {
                const spd = 9 + 5 * rand(i);
                const x = Math.min(1540, 80 + i * 150 - 60 * (i % 2) + (ff - fbt(8)) * spd);
                const g = 940 + (i % 3) * 18;
                const sc = 0.36 + 0.02 * (i % 3);
                const pp = runPose(x, g, (ff + i * 5) / 13, sc, 1);
                const robes = ['#6a5440', '#4a5a6a', '#7a4a3a', '#5a6a4a', '#6a6050'];
                return <Rig key={i} {...pp} s={sc} robe={robes[i % 5]} robeD="#2e2620" pants="#2a2420" hem={i % 2 ? 110 : 40} face={i % 3 === 0 ? 'shout' : 'shock'} mouth={0.7} kneeBend={-1} elbowBend={-1} />;
              })}
            </Svg>
            {/* 跑掉的鞋 */}
            {(() => {
              const t = clamp01((ff - fbt(9)) / 18);
              return t > 0 && t < 1 ? <Svg><ellipse cx={500 - 300 * t} cy={900 - 400 * Math.sin(t * Math.PI)} rx={34} ry={16} fill="#3b2a1c" transform={`rotate(${t * 720} ${500 - 300 * t} ${900 - 400 * Math.sin(t * Math.PI)})`} /></Svg> : null;
            })()}
            <Drum f={ff} x={1700} y={480} r={60} hits={DRUM_F} opacity={0.8} />
            <DongWords f={ff} hits={DRUM_F} x={1700} y={200} />
          </>
        )}
        {/* 108 坊三排落锁 */}
        {inShot(f, SHOTS.grid) && (
          <>
            <NightBg f={ff} sky={false} glow={[50, 50]} strength={0.7} />
            <WardGrid f={ff} lockRow={(r) => fbt(SLAM_BEATS[Math.floor(r / 3)])} />
            {SLAM_BEATS.map((b) => (
              <Flash key={b} f={ff} at={fbt(b)} dur={6} peak={0.35} color="#ff8a5a" />
            ))}
          </>
        )}
        {/* 门拍脸 */}
        {inShot(f, SHOTS.face) &&
          (() => {
            const t = fbt(FACE_BEAT);
            const open = ff < t - 6 ? 0.8 : ff < t ? 0.8 * (1 - (ff - (t - 6)) / 6) : 0;
            const runX = Math.min(1360, 700 + (ff - fbt(14)) * 32);
            const slide = ff >= t ? Math.min(140, (ff - t) * 6) : 0;
            return (
              <>
                <NightBg f={ff} floor glow={[70, 62]} horizon={640} />
                <Gate f={ff} x={1600} y={960} w={460} h={600} open={open} />
                <Svg>
                  {ff < t ? (
                    <Rig {...runPose(runX, 960, ff / 11, 0.56, 1)} s={0.56} robe="#6a5440" robeD="#2e2620" pants="#2a2420" hem={40} face="shout" mouth={0.8} kneeBend={-1} elbowBend={-1} />
                  ) : (
                    (() => {
                      const k = Math.min(1, (ff - t) / 8);
                      const bx = 1360 - 40 * k;
                      const sp = standPose(bx, 960, 0.56, 1);
                      return <Rig {...sp} neck={[sp.neck[0] - 50 * k, sp.neck[1] + 10 * k]} handN={[bx + 70, sp.neck[1] + 20]} handF={[bx + 50, sp.neck[1] + 40]} s={0.56} robe="#6a5440" robeD="#2e2620" pants="#2a2420" hem={40} face="shock" front headTilt={-14 * k} mouth={0.8} openHands />;
                    })()
                  )}
                </Svg>
                {ff >= t && <Svg>{[0, 1, 2].map((k) => <circle key={k} cx={1360 + 60 * Math.cos(ff / 3 + k * 2)} cy={600 + slide + 20 * Math.sin(ff / 3 + k * 2)} r={10} fill={L.goldHot} />)}</Svg>}
                <BigGlyph f={ff} at={t} text="哐！" color={L.goldHot} size={240} y={380} />
              </>
            );
          })()}
        {/* 打屁股 */}
        {inShot(f, SHOTS.spank) && (
          <>
            <PunishScene f={ff} hits={SPANK_BEATS.map(fbt)} />
          </>
        )}
        {/* 第九百下：你—一—二—三—家 */}
        {inShot(f, SHOTS.plan) && (
          <>
            <NightBg f={ff} sky={false} glow={[50, 60]} strength={0.8} />
            <RoutePlan f={ff} at={fbt(NINE_BEAT)} />
            {ff >= fbt(29) && (() => { const wx = 380 + Math.min(260, (ff - fbt(29)) * 14); const moving = (ff - fbt(29)) * 14 < 260; return <Svg><Rig {...(moving ? runPose(wx, 760, ff / 12, 0.27, 1) : standPose(wx, 760, 0.27, 1))} s={0.27} robe="#e8dcc4" robeD="#bfb39c" pants="#3a2f26" hem={110} face={moving ? 'shock' : 'shock'} front={!moving} mouth={0.6} kneeBend={-1} elbowBend={-1} /></Svg>; })()}
          </>
        )}
        {inShot(f, SHOTS.story) && <Story f={f} />}
        {inShot(f, SHOTS.final) && (
          <>
            <NightBg f={f} glow={[50, 56]} strength={1.3} />
            <Embers f={f} x={960} y={1000} n={26} spread={1200} rise={600} seed={5} />
            <TitleCard f={f} at={SHOTS.final[0]} kicker="灯火史话 · 唐代宵禁" title={TITLE} pill="鼓敲满一千下，你在哪儿过夜？" size={200} perChar={1} />
          </>
        )}
        {/* 标题卡 */}
        {inShot(f, SHOTS.title) && (
          <>
            <NightBg f={f} glow={[50, 56]} strength={1.3} />
            <Embers f={f} x={960} y={1000} n={26} spread={1200} rise={600} seed={3} />
            <TitleCard f={f} at={HIT} kicker="灯火史话 · 唐代宵禁" title={TITLE} pill="鼓敲满一千下，你在哪儿过夜？" size={200} perChar={1} />
          </>
        )}
      </AbsoluteFill>

      {/* 计数：开场右下角小字，第九百下放大变红 */}
      {f < SHOTS.grid[1] && !inShot(f, SHOTS.title) && <MiniCount f={f} n={count} />}
      {inShot(f, SHOTS.plan) && (
        <div style={{position: 'absolute', right: 90, top: 70, fontFamily: LF.serif, fontWeight: 900, fontSize: 150, color: L.red, textShadow: '0 0 40px rgba(225,104,79,0.6)', transform: `scale(${1.6 - 0.6 * easeOut(clamp01((ff - fbt(NINE_BEAT)) / 6))})`, transformOrigin: '100% 0'}}>
          900 下
        </div>
      )}

      {panel && <Narration key={panel[0].b} f={ff} lines={panel.map(({b, text}) => ({at: b === 0 ? -40 : fbt(b), text}))} size={78} perChar={f >= fbt(STORY_START) ? 2 : 3} />}
      {!inShot(f, SHOTS.title) && !inShot(f, SHOTS.final) && f >= fbt(16) && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: LF.label, fontSize: 26, color: L.inkDim}}>人物和场面都是示意</div>
      )}
      <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
      <Flash f={f} at={0} dur={6} />
      <Flash f={f} at={fbt(5)} dur={6} peak={0.5} />
      <Flash f={f} at={fbt(7)} dur={6} peak={0.5} />
      <Flash f={f} at={fbt(FACE_BEAT)} dur={8} peak={0.7} />
      <Flash f={f} at={fbt(NINE_BEAT)} dur={8} peak={0.6} color="#ffb0a0" />
      <Flash f={f} at={HIT} />
      <Flash f={f} at={SHOTS.final[0]} />
    </AbsoluteFill>
  );
};
