/**
 * ep53 长安宵禁（灯火史话风，无口播）。配乐 bgm-1021 循环（160 秒一遍，接缝对小节线）。
 * 网格：起音 0.06 秒、一小节 2.127 秒；开场强拍沿用 ep52 实测 0/5/7/8/11/12/13/16。
 * 当前只排了开场 17 秒样片（到标题卡后 2 秒）。文案见 materials/08-灯火史话风/01-长安宵禁/文案与卡点.md。
 */
import {FINAL_TITLE, hitBeat, lineBeats, PLACED, STORY_START, TOTAL_BEATS} from './story';

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const BAR = 2.127;
export const BAR0 = 0.06;
export const BEAT = BAR / 4;
export const beatSec = (b: number) => BAR0 + BEAT * b;
export const fr = (sec: number) => Math.round(sec * FPS);
export const fbt = (b: number) => fr(beatSec(b));
export const fb = (k: number) => fbt(4 * k);

export const HIT = fb(8); // 标题卡
export const DARK_FROM = fr(16.3);
export const FREEZE = 3;
export const DURATION = fbt(TOTAL_BEATS);

export const TITLE = '长安宵禁';
export const HOOK_BAR = '长安宵禁：鼓敲满一千下，你在哪儿过夜？';

/** 鼓点（拍号）：0–7 每拍一下，8–11 每半拍一下（越敲越急） */
export const DRUM_BEATS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8.5, 9, 9.5, 10, 10.5];
export const SLAM_BEATS = [11, 12, 13]; // 三排坊门一起关
export const FACE_BEAT = 15; // 门拍脸
export const SPANK_BEATS = [17, 18, 19, 20, 21, 22]; // 一板一拍
export const NINE_BEAT = 24; // 第九百下

export const CUES: [number, string | null, boolean?][] = [
  [0, '唐朝〔长安〕。', true],
  [2, '天一黑——'],
  [4, '满城开始〖敲鼓〗！', true],
  [8, '鼓敲满〔一千下〕——', true],
  [11, '〔一百零八个〕坊门，', true],
  [12, '全部〖关上〗！'],
  [14, null],
  [16, '还在街上的，', true],
  [18, '抓住，抽〖二十下〗！'],
  [24, '鼓已经敲到〖第九百下〗！', true],
  [26, '你离家，还有〔三条街〕。'],
  [29, '你怎么办？'],
  [32, null],
  ...PLACED.flatMap((p): [number, string | null, boolean?][] => (p.n === 66 ? [[p.b0, null, true]] : lineBeats(p).map((b, i) => [p.b0 + b, p.lines[i], i === 0]))),
  [FINAL_TITLE, null],
];

export const SHOTS = {
  drum: [0, fbt(4)],
  cities: [fbt(4), fbt(8)],
  rush: [fbt(8), fbt(11)],
  grid: [fbt(11), fbt(14)],
  face: [fbt(14), fbt(16)],
  spank: [fbt(16), fbt(24)],
  plan: [fbt(24), HIT],
  title: [HIT, fbt(STORY_START)],
  story: [fbt(STORY_START), fbt(FINAL_TITLE)],
  final: [fbt(FINAL_TITLE), DURATION],
} as const;

const A = 'audio/ep53-changan-curfew';
const s = (name: string, b: number, v: number): [string, number, number] => [`${A}/${name}.wav`, fbt(b), v];
export const SFX: [string, number, number][] = [
  ...DRUM_BEATS.map((b) => s('bigdrum', b, [0, 5, 7, 8].includes(b) ? 1 : 0.8)),
  ...DRUM_BEATS.map((b) => s('drum', b, 0.5)),
  s('impact', 0, 0.45),
  s('impact', 5, 0.35),
  s('impact', 7, 0.35),
  ...SLAM_BEATS.map((b) => s('impact', b, 0.55)),
  ...SLAM_BEATS.map((b) => s('bigdrum', b, 1)),
  s('impact', FACE_BEAT, 0.7),
  s('crack', FACE_BEAT, 0.5),
  ...SPANK_BEATS.map((b) => s('crack', b, 0.55)),
  s('bigdrum', NINE_BEAT, 1),
  s('impact', NINE_BEAT, 0.55),
  s('tick', 26, 0.4),
  s('tick', 27, 0.4),
  s('tick', 28, 0.4),
  [`${A}/riser.wav`, fr(beatSec(32) - 2), 0.6],
  s('impact', 32, 0.7),
  s('drum', 32, 0.7),
  ...STORY_SFX(),
];

/** 正片音效：每屏切换一声轻鼓；记忆点重鼓 + 撞击；个别屏的专属音效 */
function STORY_SFX(): [string, number, number][] {
  const out: [string, number, number][] = [];
  for (const p of PLACED) {
    const lb = lineBeats(p);
    out.push(s('drum', p.b0, p.n === 66 ? 0 : 0.32));
    const hb = hitBeat(p);
    if (hb !== undefined && p.n !== 64) {
      out.push(s('bigdrum', p.b0 + hb, p.mem === 2 ? 1 : 0.85), s('impact', p.b0 + hb, p.mem === 2 ? 0.75 : 0.55));
    }
    if (p.n === 15) out.push(s('crack', p.b0 + (hb ?? 0), 0.6));
    if (p.n === 7) for (let b = 1; b < p.beats; b += 0.5) out.push(s('drum', p.b0 + b, 0.3 + 0.03 * b));
    if (p.n === 9) out.push(s('tick', p.b0 + (hb ?? 0), 0.9));
    if (p.n === 17 || p.n === 54) out.push(s('crack', p.b0 + 1, 0.45));
    if (p.n === 19) out.push(s('impact', p.b0 + Math.round(p.beats * 0.45) + 0.4, 0.6));
    if (p.n === 31) out.push(s('tick', p.b0 + (hb ?? 0), 0.7));
    if (p.n === 60) for (let b = 1; b < p.beats; b++) out.push(s('bigdrum', p.b0 + b, b === 1 ? 1 : 0.75));
    if (p.n === 61) [1, 2, 3].forEach((b) => out.push(s('impact', p.b0 + b, 0.5)));
    if (p.n === 62) out.push(s('bigdrum', p.b0 + lb[1], 0.9));
    if (p.n === 64) lb.forEach((b) => out.push(s('bigdrum', p.b0 + b, 1), s('impact', p.b0 + b, 0.5)));
    if (p.n === 65) out.push(s('bigdrum', p.b0, 1), s('impact', p.b0, 0.5));
    if (p.n === 66) out.push(s('bigdrum', p.b0 + 2, 0.6));
  }
  out.push([`${A}/riser.wav`, fr(beatSec(FINAL_TITLE) - 2), 0.6], s('impact', FINAL_TITLE, 0.75), s('bigdrum', FINAL_TITLE, 1));
  return out;
}
