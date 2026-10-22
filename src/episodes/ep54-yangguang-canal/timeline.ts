/**
 * ep54 杨广与大运河（灯火史话风，无口播，左上角字幕）。分镜：materials/08-灯火史话风/02-杨广大运河/分镜-64屏.md
 * 网格沿用 bgm-1021：一小节 2.127 秒、一拍 0.532 秒。配乐从第 0 拍直接进；标题卡 4 拍（约 2 秒）。
 */
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const BAR = 2.127;
export const BAR0 = 0.06;
export const BEAT = BAR / 4;
export const beatSec = (b: number) => BAR0 + BEAT * b;
export const fr = (sec: number) => Math.round(sec * FPS);
export const fbt = (b: number) => fr(beatSec(b));
export const B = BEAT * FPS; // 一拍的帧数

/** 每屏起止（拍）：分镜 0:00–0:03 / 0:03–0:07 / 0:07–0:11 / 0:11–0:15，对齐到拍 */
export const SHOT: Record<'s1' | 's2' | 's3' | 's4' | 'title', [number, number]> = {
  s1: [0, 6],
  s2: [6, 14],
  s3: [14, 22],
  s4: [22, 28],
  title: [28, 32],
};
export const MUSIC_BEAT = 0;
export const DURATION = fbt(SHOT.title[1]);

/** 字幕：[拍, 文字, 是否另起一屏]；〔〕金、〖〗红 */
export const CUES: [number, string | null, boolean?][] = [
  [0, '背了〖千年黑锅〗的杨广，', true],
  [2.5, '直到一方〔墓志〕出土，很多旧说法才开始松动。'],
  [6, '〔运河〕、〔龙舟〕、〔南巡〕——', true],
  [14, '他修大运河，', true],
  [15.5, '真的只是为了〖下江南享乐〗吗？'],
  [22, '要揭开谜底，', true],
  [23.5, '还得从他夺下〔太子之位〕那一刻讲起。'],
  [28, null],
];

/** 第 2 屏三张标签贴上去的拍（绝对拍） */
export const TAG_BEATS = [7.5, 9.5, 11.5];
/** 第 3 屏屏内帧：标签熔成锅、扣头、弹开、拉远、画线、靶心、问号 */
export const S3 = {melt: 0, pot: 12, drop: 20, hit: 26, bounce: 52, zoomA: 56, zoomB: 64, mapIn: 74, line: 74, lineDur: 15, target: 89, bubble: 93, q: 98};

const A = 'audio/ep54-yangguang-canal';
const s = (name: string, b: number, v: number): [string, number, number] => [`${A}/${name}.wav`, fbt(b), v];
const sf = (name: string, f: number, v: number): [string, number, number] => [`${A}/${name}.wav`, f, v];
const s3 = (k: keyof typeof S3) => fbt(SHOT.s3[0]) + S3[k];
export const SFX: [string, number, number][] = [
  // 第 1 屏：分屏白闪重鼓、刷两下、字一个个亮
  s('bigdrum', 0, 1), s('impact', 0, 0.55),
  ...[0.9, 1.6, 2.4, 3.1].map((b) => s('brush', b, 0.35)),
  ...[0, 1, 2, 3, 4, 5].map((i) => sf('tick', fbt(1.4) + 8 + i * 9, 0.5)),
  s('bell', 4.6, 0.35),
  // 第 2 屏：镜头推近，一张标签一声「啪」
  s('drum', 6, 0.45),
  ...TAG_BEATS.flatMap((b) => [s('crack', b, 0.7), s('drum', b, 0.5)]),
  // 第 3 屏
  s('drum', 14, 0.4),
  sf('whoosh', s3('drop') - 8, 0.8),
  sf('clang', s3('hit'), 1), sf('bigdrum', s3('hit'), 1), sf('impact', s3('hit'), 0.7),
  sf('clink', s3('hit') + 22, 0.5),
  sf('whoosh', s3('bounce'), 0.6),
  sf('riser', s3('zoomA') - 30, 0.35),
  sf('impact', s3('target'), 0.6), sf('bigdrum', s3('target'), 0.9),
  sf('drum', s3('q'), 0.6),
  // 第 4 屏：倒带、殿中冠闪光、收暗
  s('rewind', 22, 0.8),
  s('rewind', 23.6, 0.5),
  s('glint', 25.5, 0.6),
  s('drum', 27, 0.35),
  // 标题卡：一声重鼓
  s('bigdrum', 28, 1), s('impact', 28, 0.7),
];
/** 环境声：运河水声（第 1–3 屏），[文件, 起帧, 止帧, 音量] */
export const AMBIENCE: [string, number, number, number][] = [
  [`${A}/water.wav`, 0, fbt(SHOT.s3[0]) + S3.zoomA, 0.22],
  [`${A}/water.wav`, fbt(22), fbt(24.5), 0.18],
];
