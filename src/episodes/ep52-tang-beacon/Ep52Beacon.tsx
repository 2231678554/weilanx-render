import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';

const RELIEF = staticFile('images/lamplight/relief-11.jpg');
import {clamp01, keyframes, rand} from '../../library/anim';
import {GlowRoute, RelayChain, routeAt, Waypoint} from '../../library/lamplight/charts';
import {BeaconRow, DayNightDial, Figure, Flame, Gate, GoldPlaque, GroundRing, Moon, SayBubble, Scroll, Watchtower} from '../../library/lamplight/props';
import {barPunch, darkness, MapView, panelAt} from '../../library/lamplight/scenes';
import {BigGlyph, Disclaimer, Embers, Flash, Narration, NightBg, SourceNote, StatCorner, TitleCard} from '../../library/lamplight/stage';
import {fadeSoft, L, LF} from '../../library/lamplight/theme';
import {
  ASK_LINE, BAR, BAR0, CUES, DARK_FROM, DARK_FROM2, END_LINE, fb, fbt, FLIP_1, FLIP_2, FLIP_WORD, FPS, FREEZE, HALF_BEATS, HIT, HIT2, HOOK_BAR,
  OPEN_LIT, OPEN_STOPS, PLACES, ROUTE_OPEN, ROUTE_TG, ROUTE_ZHOU, SHOTS, TITLE, WAIT_BEATS, WAIT_STOPS,
} from './timeline';

/**
 * ep52 唐朝烽火（灯火史话风，无口播）。每个镜头三层：背景（夜空 / 地形）、中景（烽台 / 小人 / 路线）、前景（山脊剪影 + 飘火星）。
 * 镜头硬切卡拍；重拍后每小节第一拍轻顶；叙述层和顶部钩子标题不跟着顶。
 */
const inShot = (f: number, s: readonly [number, number]) => f >= s[0] && f < s[1];

/** 前景：近处山脊剪影，随帧缓慢横移，给画面一层前景 */
const FgRidge: React.FC<{f: number; seed?: number; drift?: number; opacity?: number}> = ({f, seed = 1, drift = 0.25, opacity = 1}) => {
  const off = -((f * drift) % 400);
  const pts = Array.from({length: 14}, (_, i) => [i * 200 + off, 1010 - 50 * rand(seed * 97 + (i % 2)) - (i % 2 === 0 ? 40 : 0)]);
  const d = `M${off - 200} 1080 L${pts.map(([x, y]) => `${x} ${y}`).join(' L')} L${2600 + off} 1080 Z`;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity}}>
      <path d={d} fill="#050403" />
    </svg>
  );
};

/** 顶部常驻钩子标题 */
const HookBar: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 22, textAlign: 'center', opacity: 1}}>
    <span style={{fontFamily: LF.label, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: L.goldHot, padding: '6px 26px', borderRadius: 30, background: 'rgba(8,6,4,0.62)', border: '1px solid rgba(237,174,80,0.45)'}}>
      {HOOK_BAR}
    </span>
  </div>
);

/** 地图上「该亮没亮」的烽台：到拍时一圈暗红涟漪扩散后消失，点本身保持灰 */
const DeadStops: React.FC<{f: number; pts: [number, number][]; stops: number[]; at: number[]}> = ({f, pts, stops, at}) => (
  <svg width={2600} height={1600} style={{position: 'absolute', left: 0, top: 0}}>
    {stops.map((st, i) => {
      const [x, y] = routeAt(pts, st);
      const t = f - at[i];
      const shown = f >= at[i] - 20;
      const p = clamp01(t / 18);
      return shown ? (
        <g key={i}>
          <circle cx={x} cy={y} r={13} fill="#3a322a" stroke="rgba(239,230,214,0.35)" strokeWidth={3} />
          {t >= 0 && t < 18 && <circle cx={x} cy={y} r={14 + 60 * p} fill="none" stroke={L.red} strokeWidth={4} opacity={1 - p} />}
          {t >= 0 && (
            <g stroke={L.red} strokeWidth={4} opacity={0.75 * clamp01(t / 6)}>
              <line x1={x - 9} y1={y - 9} x2={x + 9} y2={y + 9} />
              <line x1={x + 9} y1={y - 9} x2={x - 9} y2={y + 9} />
            </g>
          )}
        </g>
      ) : null;
    })}
  </svg>
);

/** 手机：亮屏 + 一行「到家了，平安」 */
const Phone: React.FC<{f: number; at: number; x: number; y: number}> = ({f, at, x, y}) => {
  const a = fadeSoft(f, at, 10);
  const lit = clamp01((f - at - 4) / 8);
  return (
    <div style={{position: 'absolute', left: x - 70, top: y - 130, width: 140, height: 260, borderRadius: 22, background: '#16120f', border: '4px solid #4a3d30', opacity: a.opacity, boxShadow: `0 0 ${60 * lit}px rgba(255,217,138,${0.55 * lit})`}}>
      <div style={{position: 'absolute', inset: 10, borderRadius: 14, background: `rgba(255,232,180,${0.85 * lit})`}} />
      <div style={{position: 'absolute', left: 18, right: 18, top: 92, padding: '8px 6px', borderRadius: 10, background: '#2b6b3f', color: '#fff', fontFamily: LF.label, fontWeight: 700, fontSize: 21, textAlign: 'center', opacity: clamp01((f - at - 12) / 6)}}>到家了，平安</div>
    </div>
  );
};

const BG_GLOW: [number, number] = [50, 70];

export const Ep52Beacon: React.FC = () => {
  const f = useCurrentFrame();
  const ff = f >= DARK_FROM && f < HIT ? Math.min(f, HIT - FREEZE) : f >= DARK_FROM2 && f < HIT2 ? Math.min(f, HIT2 - FREEZE) : f;
  const dark = Math.max(darkness(f, DARK_FROM, HIT, FREEZE), darkness(f, DARK_FROM2, HIT2, FREEZE));
  const s = 1 + barPunch(f, {hit: HIT, hit2: HIT2, bar: BAR, bar0: BAR0, fps: FPS, fb});
  const panel = panelAt(CUES, fbt, ff);
  const half = panel && HALF_BEATS.includes(panel[0].b) ? (panel[0].b === HALF_BEATS[0] ? DARK_FROM : DARK_FROM2) : undefined;
  const showBar = !inShot(f, SHOTS.title);

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Audio src={staticFile('audio/ep52-tang-beacon/mix.wav')} />
      {/* 音效已由 audio/episodes/ep52_mix.py 按 SFX 表混进 mix.wav（带限幅） */}

      <AbsoluteFill style={{transform: `scale(${s})`}}>
        {/* ---------- 开场：第一帧就是燃着的烽台 ---------- */}
        {inShot(f, SHOTS.hook) && (
          <>
            <NightBg f={ff} floor glow={[62, 66]} strength={1.1 + 0.4 * clamp01((ff - fbt(8)) / 8)} horizon={640} />
            <FgRidge f={ff} seed={1} />
            <Moon f={ff} x={1650} y={170} r={40} />
            <Watchtower f={ff} x={2260 - 0.6 * ff} y={890} scale={0.55} opacity={0.5} />
            <Watchtower f={ff} x={1200} y={900} scale={1.05} lit={1} />
            {ff >= fbt(8) && <Flame f={ff} x={1200} y={430} size={2.2 * (0.6 + 0.4 * clamp01((ff - fbt(8)) / 8))} seed={4} />}
            <GroundRing f={ff} at={fbt(8)} x={1200} y={905} rx={300} ry={40} color="rgba(237,174,80,0.8)" />
            <Figure f={ff} x={1430} y={905} pose="torch" scale={0.9} seed={2} />
            <Embers f={ff} x={1200} y={420} n={22} spread={160} rise={380} seed={3} />
            <Disclaimer f={ff} text="烽台和人物都是示意" />
          </>
        )}

        {/* ---------- 边关 → 长安，四座烽台踩拍亮 ---------- */}
        {(inShot(f, SHOTS.road) || inShot(f, SHOTS.question)) && (
          <>
            <MapView bgSrc={RELIEF}
              cam={[
                keyframes(ff, [[fbt(11), 800], [fbt(24), 840], [HIT - FREEZE, 1150]]),
                keyframes(ff, [[fbt(11), 600], [fbt(24), 640], [HIT - FREEZE, 880]]),
                keyframes(ff, [[fbt(11), 1.15], [fbt(24), 1.2], [HIT - FREEZE, 1.9]]),
              ]}
            >
              <Waypoint f={ff} at={fbt(11)} x={PLACES.frontier[0]} y={PLACES.frontier[1]} kind="fire" label="边关" side="top" />
              <Waypoint f={ff} at={fbt(16)} x={PLACES.changan[0]} y={PLACES.changan[1]} kind="city" label="长安" side="right" />
              <RelayChain f={ff} pts={ROUTE_OPEN} stops={OPEN_STOPS} litAt={OPEN_LIT} />
            </MapView>
            <Embers f={ff} x={960} y={1060} n={14} spread={1100} rise={420} seed={5} />
            <SourceNote f={ff} at={fbt(11)} text="路线和烽台位置为示意" />
          </>
        )}

        {/* ---------- 标题卡 ---------- */}
        {inShot(f, SHOTS.title) && (
          <>
            <NightBg f={f} glow={[50, 56]} strength={1.3} />
            <FgRidge f={f} seed={2} />
            <Embers f={f} x={960} y={1000} n={26} spread={1200} rise={600} seed={3} />
            <TitleCard f={f} at={HIT} kicker="灯火史话 · 唐代烽燧" title={TITLE} pill="平安火" size={120} perChar={0.7} />
          </>
        )}

        {/* ---------- 第 1 章 ---------- */}
        {inShot(f, SHOTS.liudian) && (
          <>
            <NightBg f={f} sky={false} glow={BG_GLOW} strength={0.8} />
            <Scroll
              f={f}
              at={fb(9) + 4}
              y={740}
              h={380}
              cols={[{text: '烽候', box: true}, {text: '凡烽候所置', size: 56}, {text: '相去三十里', size: 56, color: L.seal}, {text: '须逐便安置', size: 56, at: fbt(42)}, {text: '得相望见', size: 56, color: L.seal, at: fbt(42) + 6}]}
              seal="唐六典"
              cite="《唐六典》卷五 · 尚书兵部 · 职方郎中"
            />
            <StatCorner f={f} at={fbt(36) + 6} label="两座烽台之间" value={30} unit="里" dur={16} />
            <Embers f={f} x={960} y={1060} n={10} spread={900} rise={300} seed={7} />
          </>
        )}
        {inShot(f, SHOTS.crew) && (
          <>
            <NightBg f={f} floor glow={[66, 62]} />
            <FgRidge f={f} seed={3} opacity={0.9} />
            <Watchtower f={f} x={1380} y={905} scale={0.95} lit={1} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Figure key={i} f={f} x={520 + i * 110} y={905} pose={i === 0 ? 'point' : 'stand'} scale={0.85} seed={i + 1} opacity={clamp01((f - fbt(52) - i * 2) / 6)} />
            ))}
            <Figure f={f} x={1700} y={905} pose="raise" hat scale={0.95} seed={9} opacity={clamp01((f - fbt(52) - 12) / 6)} />
            {f >= fbt(52) + 12 && <div style={{position: 'absolute', left: 1745, top: 690, width: 34, height: 50, background: L.paper, borderRadius: 4, opacity: clamp01((f - fbt(52) - 14) / 6)}} />}
            <div style={{position: 'absolute', left: 500, width: 470, top: 960, textAlign: 'center', fontFamily: LF.label, fontWeight: 700, fontSize: 32, color: L.inkDim, opacity: clamp01((f - fbt(53)) / 8)}}>烽子 ×5 · 轮班盯梢</div>
            <div style={{position: 'absolute', left: 1580, width: 240, top: 960, textAlign: 'center', fontFamily: LF.label, fontWeight: 700, fontSize: 32, color: L.inkDim, opacity: clamp01((f - fbt(54)) / 8)}}>烽帅 · 管文书</div>
            <StatCorner f={f} at={fbt(52)} label="一座烽台" value={6} unit="人" dur={12} />
            <SourceNote f={f} at={fbt(52)} text="《通典》卷 152：一烽六人，五人为烽子……一人烽率，知文书、符牒、转牒" y={1050} />
          </>
        )}
        {inShot(f, SHOTS.daynight) && (
          <>
            <NightBg f={f} floor glow={[60, 64]} />
            <FgRidge f={f} seed={4} />
            {(() => {
              const day = f < fbt(58);
              return (
                <>
                  <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(120,110,90,0.35), rgba(0,0,0,0))', opacity: day ? 1 - clamp01((f - fbt(57)) / 15) : 0}} />
                  <Watchtower f={f} x={1180} y={905} scale={0.9} lit={day ? 0 : 1} />
                  {day &&
                    Array.from({length: 7}, (_, i) => {
                      const t = (f * 0.012 + i / 7) % 1;
                      return <div key={i} style={{position: 'absolute', left: 1180 - 40 + Math.sin(t * 6 + i) * 30 + t * 120, top: 470 - t * 360, width: 70 + t * 120, height: 70 + t * 120, borderRadius: '50%', background: 'rgba(170,160,145,0.35)', filter: 'blur(12px)', opacity: 1 - t}} />;
                    })}
                </>
              );
            })()}
            <DayNightDial f={f} at={fb(14)} x={460} y={600} r={110} p={clamp01((f - fb(14)) / (fbt(59) - fb(14))) * 0.5} caption="昼烟 · 夜火" />
            {f >= fbt(60) && (
              <>
                <Figure f={f} x={1550 + Math.min(1, (f - fbt(60)) / 30) * 260} y={905} pose="stand" scale={0.85} seed={4} opacity={1 - clamp01((f - fbt(60) - 20) / 10)} walk />
                <Figure f={f} x={1500} y={905} pose="point" flip scale={0.85} seed={6} />
              </>
            )}
            <StatCorner f={f} at={fbt(60)} label="烽子 · 一班" value={2} unit="年" dur={8} color={L.red} />
            <SourceNote f={f} at={fbt(56)} text="《武经总要》前集卷五引唐兵部烽式：昼候烟，夜望火；烽子并二年一代，须教新人通解，始得代去" />
          </>
        )}

        {/* ---------- 第 2 章：几把火 ---------- */}
        {inShot(f, SHOTS.tiers) && (
          <>
            <NightBg f={f} floor glow={[62, 66]} />
            <BeaconRow f={f} x0={980} x1={1700} y={880} n={4} litAt={[fbt(69), fbt(72), fbt(76), fbt(80)]} labels={['一', '二', '三', '四']} hotLast scale={0.9} />
            <StatCorner f={f} at={fbt(69)} label="不满 500 人" value={1} unit="把" dur={6} out={fbt(72) - 2} y={620} x={420} size={90} />
            <StatCorner f={f} at={fbt(72)} label="不满 3000 人" value={2} unit="把" dur={6} out={fbt(76) - 2} y={620} x={420} size={90} />
            <StatCorner f={f} at={fbt(76)} label="蕃骑 · 审知南入" value={3} unit="把" dur={6} out={fbt(80) - 2} y={620} x={420} size={90} />
            <StatCorner f={f} at={fbt(80)} label="不知头数" value={4} unit="把" dur={6} y={620} x={420} size={90} color={L.red} />
            <SourceNote f={f} at={fbt(69)} text="《武经总要》前集卷五引唐兵部烽式；《唐六典》：放烽有一炬至四炬，随贼多少而为差" />
            <Embers f={f} x={1340} y={1040} n={10} spread={700} rise={300} seed={8} />
          </>
        )}
        {inShot(f, SHOTS.reach) && (
          <>
            <MapView bgSrc={RELIEF} cam={[keyframes(f, [[fb(21), 760], [fbt(88), 820], [fb(24), 860]]), keyframes(f, [[fb(21), 560], [fbt(88), 640], [fb(24), 660]]), keyframes(f, [[fb(21), 1.25], [fbt(88), 1.05], [fb(24), 1.0]])]}>
              <Waypoint f={f} at={fb(21)} x={PLACES.frontier[0]} y={PLACES.frontier[1]} kind="fire" label="边关" side="top" />
              <Waypoint f={f} at={fb(21) + 4} x={PLACES.zhou[0]} y={PLACES.zhou[1]} kind="dot" label="本州" side="top" />
              <GlowRoute f={f} at={fb(21) + 2} dur={14} pts={ROUTE_ZHOU} fire width={2600} height={1600} />
              <Waypoint f={f} at={fbt(88)} x={PLACES.changan[0]} y={PLACES.changan[1]} kind="city" label="京城 · 长安" side="right" />
              <GlowRoute f={f} at={fbt(88)} dur={fbt(92) - fbt(88)} pts={ROUTE_OPEN} fire color={L.red} width={2600} height={1600} />
            </MapView>
            <DayNightDial f={f} at={fbt(90)} x={1640} y={640} r={100} p={clamp01((f - fbt(90)) / (fb(24) - fbt(90) - 6))} caption="一昼夜" />
            <StatCorner f={f} at={fbt(92)} label="烟火 · 一昼夜" value={2000} unit="里" dur={20} />
            <SourceNote f={f} at={fbt(85)} text="唐兵部烽式：一炬至所管州县镇止，两炬以上并至京；凡烟火，一昼夜须行二千里（约 67 座烽台为推算）" />
          </>
        )}

        {/* ---------- 第 3 章：唐律 ---------- */}
        {inShot(f, SHOTS.law) && (
          <>
            <NightBg f={f} sky={false} glow={BG_GLOW} strength={0.8} />
            <Scroll
              f={f}
              at={fb(24) + 4}
              y={740}
              h={380}
              cols={[{text: '烽候不警', box: true}, {text: '应放多烽而放少烽', size: 44}, {text: '各徒三年', size: 56, color: L.seal}, {text: '不应举烽燧而举', size: 44, at: fbt(104)}, {text: '各徒一年', size: 56, color: L.seal, at: fbt(104) + 4}]}
              seal="唐律"
              cite="《唐律疏议》卷八 · 卫禁律「烽候不警」"
            />
            <StatCorner f={f} at={fbt(100)} label="点少了" prefix="徒" value={3} unit="年" dur={8} color={L.red} out={fbt(104) - 2} />
            <StatCorner f={f} at={fbt(104)} label="点多了" prefix="徒" value={1} unit="年" dur={8} color={L.red} />
          </>
        )}
        {inShot(f, SHOTS.hang) && (
          <>
            <MapView bgSrc={RELIEF} cam={[880, 720, keyframes(f, [[fb(27), 1.3], [fb(30), 1.5]])]}>
              <RelayChain f={f} pts={ROUTE_OPEN} stops={OPEN_STOPS} litAt={[fb(27) - 99, fb(27) - 99, 99999, 99999]} />
              <Waypoint f={f} at={fb(27)} x={PLACES.frontier[0]} y={PLACES.frontier[1]} kind="city" label="边城" side="top" color={L.red} />
              {f >= fbt(110) && f < fbt(116) && <Flame f={f} x={PLACES.frontier[0]} y={PLACES.frontier[1] - 20} size={1.6} seed={13} />}
            </MapView>
            <AbsoluteFill style={{background: 'rgba(120,20,10,1)', mixBlendMode: 'multiply', opacity: 0.3 * clamp01((f - fbt(108)) / 20)}} />
            <AbsoluteFill style={{background: '#000', opacity: f >= fbt(116) ? 0.62 : 0}} />
            <BigGlyph f={f} at={fbt(116)} text="绞" size={420} />
            <SourceNote f={f} at={fbt(116) + 6} text="《唐律疏议》卷八：以故陷败户口、军人、城戍者，绞" />
          </>
        )}
        {inShot(f, SHOTS.secret) && (
          <>
            <NightBg f={f} floor glow={[50, 66]} />
            <FgRidge f={f} seed={5} />
            <GoldPlaque f={f} at={fbt(120)} x={960} y={520} text="烽号" gleam={fbt(120) + 4} />
            <Figure f={f} x={760} y={905} pose="raise" hat scale={1.0} seed={9} />
            <Figure f={f} x={1180} y={905} pose="stand" hat scale={1.0} flip seed={8} />
            {[0, 1, 2].map((i) => (
              <Figure key={i} f={f} x={1500 + i * 120} y={905} pose="stand" flip scale={0.8} seed={i + 2} color="#8c8478" opacity={clamp01((f - fbt(124)) / 8) * 0.9 + 0.1} />
            ))}
            <div style={{position: 'absolute', left: 560, width: 820, top: 960, textAlign: 'center', fontFamily: LF.label, fontWeight: 700, fontSize: 32, color: L.inkDim}}>烽帅 · 烽副</div>
            <div style={{position: 'absolute', left: 1440, width: 360, top: 960, textAlign: 'center', fontFamily: LF.label, fontWeight: 700, fontSize: 32, color: L.red, opacity: clamp01((f - fbt(124)) / 8)}}>烽子：不许知道</div>
            <SourceNote f={f} at={fbt(120)} text="唐兵部烽式：烽号隐密……惟烽帅、烽副自执，烽子亦不得知委" />
          </>
        )}

        {/* ---------- 第 4 章：平安火 ---------- */}
        {inShot(f, SHOTS.peace) && (
          <>
            <NightBg f={f} floor glow={[50, 64]} />
            <FgRidge f={f} seed={6} />
            <Moon f={f} x={1180} y={200} r={36} />
            {[0, 1, 2, 3].map((i) => {
              const at = fbt(128 + i);
              const gone = i === 2 && f >= fbt(136);
              return <Watchtower key={i} f={f} x={360 + i * 400} y={905} scale={0.6} lit={gone ? 0 : clamp01((f - at) / 8)} />;
            })}
            <GroundRing f={f} at={fbt(136)} x={1160} y={905} rx={180} ry={26} color="rgba(225,104,79,0.85)" />
            {f >= fbt(136) && <Figure f={f} x={1160} y={905} pose="lie" scale={0.6} color="#6b625a" opacity={clamp01((f - fbt(136) - 4) / 8)} />}
            <StatCorner f={f} at={fbt(132)} label="每天早晚" value={1} unit="把" prefix="各" dur={6} />
            <SourceNote f={f} at={fbt(132)} text="《通典》卷 152：每晨及夜平安，举一火……平安火不来，即烽子为贼所捉" />
          </>
        )}
        {inShot(f, SHOTS.poem) && (
          <>
            <NightBg f={f} sky={false} glow={BG_GLOW} strength={0.8} />
            <Scroll f={f} at={fb(34) + 30} y={740} h={380} cols={[{text: '夕烽', box: true}, {text: '夕烽来不近', size: 60}, {text: '每日报平安', size: 60, color: L.seal}]} seal="杜甫" cite="杜甫《夕烽》" />
          </>
        )}

        {/* ---------- 回落段：756 年 ---------- */}
        {(inShot(f, SHOTS.fall) || inShot(f, SHOTS.wait) || inShot(f, SHOTS.build)) && (
          <>
            <MapView bgSrc={RELIEF}
              cam={[
                keyframes(ff, [[fb(36), 1300], [fb(40), 1380], [fbt(172), 1320], [HIT2 - FREEZE, 1300]]),
                keyframes(ff, [[fb(36), 840], [fb(40), 880], [HIT2 - FREEZE, 900]]),
                keyframes(ff, [[fb(36), 1.0], [fb(40), 1.6], [fbt(172), 1.65], [HIT2 - FREEZE, 2.3]]),
              ]}
            >
              <Waypoint f={ff} at={fbt(148)} x={PLACES.tongguan[0]} y={PLACES.tongguan[1]} kind="city" label="潼关" side="right" color={L.red} />
              <Waypoint f={ff} at={fbt(152)} x={PLACES.changan[0]} y={PLACES.changan[1]} kind="city" label="长安" side="left" />
              {ff >= fbt(148) && ff < fb(40) && <Flame f={ff} x={PLACES.tongguan[0]} y={PLACES.tongguan[1] - 20} size={1.3} seed={17} />}
              {ff >= fbt(156) && <GlowRoute f={ff} at={fbt(156)} dur={20} pts={[...ROUTE_TG].reverse()} color={L.inkDim} width={2600} height={1600} />}
              <DeadStops f={ff} pts={ROUTE_TG} stops={WAIT_STOPS} at={WAIT_BEATS.map(fbt)} />
            </MapView>
            {ff >= fbt(148) && <AbsoluteFill style={{background: 'rgba(120,20,10,1)', mixBlendMode: 'multiply', opacity: 0.18 * clamp01((ff - fbt(148)) / 12) * (ff < fb(40) ? 1 : 0.5)}} />}
            <StatCorner f={ff} at={fbt(146)} label="天宝十五载 · 六月" value={756} unit="年" comma={false} dur={16} out={fb(40) - 4} />
            <Embers f={ff} x={960} y={1060} n={10} spread={1000} rise={260} seed={9} on={ff < fbt(172) ? 1 : 0} />
            <SourceNote f={ff} at={fbt(146)} text="《资治通鉴》卷 218：辛卯，乾祐进攻潼关，克之；上不时召见，但遣李福德等将监牧兵赴潼关" out={fb(40) - 4} />
            <SourceNote f={ff} at={fb(40)} text="烽台位置为示意" />
          </>
        )}

        {/* ---------- 第二个爆点：火不至 ---------- */}
        {inShot(f, SHOTS.hit2) && (
          <>
            <NightBg f={f} glow={[50, 52]} strength={0.7} />
            <FgRidge f={f} seed={7} />
            <Watchtower f={f} x={960} y={1000} scale={0.7} opacity={0.35} />
            <BigGlyph f={f} at={HIT2} text="火不至" color={L.red} size={280} y={500} sub="756 年六月 · 潼关失守那天" />
            <SourceNote f={f} at={HIT2 + 16} text="《资治通鉴》卷 218：及暮，平安火不至，上始惧" />
          </>
        )}

        {/* ---------- 收束 ---------- */}
        {inShot(f, SHOTS.news) && (
          <>
            <NightBg f={f} floor glow={[50, 70]} strength={0.8} />
            <FgRidge f={f} seed={8} />
            <Gate f={f} x={1260} y={905} w={420} h={480} label="长安宫城" />
            <Figure f={f} x={980} y={905} pose="stand" hat scale={1.1} seed={1} />
            <SayBubble f={f} at={fbt(188)} x={1000} y={600} text="火……没来？" color={L.red} />
            <Disclaimer f={f} />
          </>
        )}
        {inShot(f, SHOTS.flee) && (
          <>
            <NightBg f={f} floor glow={[70, 60]} strength={0.9} />
            <FgRidge f={f} seed={9} />
            <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(90,110,140,0.25), rgba(0,0,0,0))', opacity: clamp01((f - fbt(194)) / 20)}} />
            <Gate f={f} x={1150} y={905} w={360} h={440} label="延秋门" open={clamp01((f - fbt(194)) / 12)} />
            {[0, 1, 2, 3].map((i) => (
              <Figure key={i} f={f} x={1150 - Math.max(0, f - fbt(194) - i * 6) * 5 - i * 20} y={905} pose="stand" walk flip hat={i === 0} scale={0.9} seed={i + 3} opacity={clamp01((f - fbt(194) - i * 6) / 6)} />
            ))}
            {[0, 1, 2].map((i) => (
              <Figure key={`l${i}`} f={f} x={1500 + i * 110} y={905} pose="raise" scale={0.75} seed={i + 7} color="#8c8478" opacity={clamp01((f - fbt(198)) / 8)} />
            ))}
            <StatCorner f={f} at={fbt(194)} label="辛卯 → 乙未" value={4} unit="天后" dur={8} />
            <SourceNote f={f} at={fbt(194)} text="《资治通鉴》卷 218：乙未，黎明，上……出延秋门，妃、主、皇孙之在外者，皆委之而去（天数按干支推算）" />
          </>
        )}
        {inShot(f, SHOTS.nolight) && (
          <>
            <NightBg f={f} floor glow={[50, 66]} strength={0.7} />
            <FgRidge f={f} seed={10} />
            <Moon f={f} x={1700} y={160} r={36} />
            <BeaconRow f={f} x0={500} x1={1600} y={880} n={5} litAt={[]} scale={0.8} />
          </>
        )}
        {inShot(f, SHOTS.flip) && (
          <>
            <NightBg f={f} glow={[50, 56]} strength={1.2} />
            <FgRidge f={f} seed={11} />
            <Embers f={f} x={960} y={1000} n={18} spread={1000} rise={500} seed={12} />
            <Narration f={f} align="center" y={380} size={104} lines={[{at: fb(52), text: FLIP_1}, {at: fbt(210), text: `〔${FLIP_2}〕`}]} />
          </>
        )}
        {inShot(f, SHOTS.modern) && (
          <>
            <NightBg f={f} floor glow={[40, 66]} strength={0.8} />
            <FgRidge f={f} seed={12} />
            <Watchtower f={f} x={620} y={905} scale={0.8} opacity={0.55} />
            {f >= fbt(220) && (
              <>
                <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(255,190,110,0.12), rgba(0,0,0,0))'}} />
                {Array.from({length: 18}, (_, i) => {
                  return <div key={i} style={{position: 'absolute', left: 1050 + rand(i * 31 + 5) * 800, top: 560 + rand(i * 17 + 9) * 260, width: 10, height: 14, background: L.goldHot, opacity: 0.25 + 0.5 * clamp01((f - fbt(220) - i) / 8)}} />;
                })}
                <Figure f={f} x={1250} y={905} pose="stand" scale={1.0} seed={3} />
                <Phone f={f} at={fbt(221)} x={1420} y={620} />
              </>
            )}
            <SourceNote f={f} at={fb(54)} text="唐代烽燧遗址示意" />
          </>
        )}
        {inShot(f, SHOTS.word) && (
          <>
            <NightBg f={f} glow={[50, 56]} strength={1.4} />
            <FgRidge f={f} seed={13} />
            <Embers f={f} x={960} y={1000} n={28} spread={1300} rise={650} seed={14} />
            <BigGlyph f={f} at={fb(56)} text={FLIP_WORD} color={L.goldHot} size={230} />
          </>
        )}
        {inShot(f, SHOTS.ask) && (
          <>
            <NightBg f={f} floor glow={[50, 74]} />
            <Narration f={f} align="center" y={170} size={82} lines={[{at: fb(58), text: ASK_LINE[0]}, {at: fbt(234), text: `〔${ASK_LINE[1]}〕`}]} />
            <Figure f={f} x={900} y={930} pose="stand" scale={1.1} />
            <SayBubble f={f} at={fbt(238)} x={970} y={560} text="到家了，放心" />
            <Disclaimer f={f} text="评论区说说" />
          </>
        )}
        {inShot(f, SHOTS.end) && (
          <>
            <NightBg f={f} floor glow={[50, 64]} strength={1.1} />
            <FgRidge f={f} seed={14} />
            <Moon f={f} x={1700} y={160} r={36} />
            <Watchtower f={f} x={960} y={950} scale={0.8} lit={clamp01((f - fb(61)) / 10)} />
            <Embers f={f} x={960} y={560} n={20} spread={120} rise={340} seed={15} />
            <Narration f={f} align="center" y={150} size={86} lines={[{at: fb(61) + 4, text: END_LINE[0]}, {at: fbt(246), text: `〔${END_LINE[1]}〕`}]} />
          </>
        )}
      </AbsoluteFill>

      {/* 叙述层（不跟着顶）；第一句在第 0 帧就已经成形 */}
      {panel && (
        <Narration key={panel[0].b} f={ff} lines={panel.map(({b, text}) => ({at: b === 0 ? -64 : fbt(b), text}))} out={half} />
      )}
      {showBar && <HookBar f={f} />}

      <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
      <Flash f={f} at={HIT} />
      <Flash f={f} at={HIT2} />
    </AbsoluteFill>
  );
};
