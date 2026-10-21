/**
 * ep52 没有敌人，唐朝烽火为什么每天都要点？（灯火史话风，无口播，约 2 分 17 秒，配乐 bgm-1021 从第 0 秒开始）
 * 锚词「火不至」：756 年六月潼关失守那天，「及暮，平安火不至，上始惧」；第 44 小节（93.63 秒）砸出。
 * 网格（实测）：起音 0.06 秒、一小节 2.127 秒（约 112.9 BPM）；开场强拍第 0/5/7/8/11/12/13/16 拍；
 * 回落段没有 10 dB 砸点，第 160–168 拍六下弱拍 = 六座烽台「等不来火」。
 * 每 10–15 秒一句「你猜」或悬念把注意力拉回来；顶部常驻一行钩子标题。
 * 文案与出处见 materials/08-灯火史话风/00-唐朝烽火/文案与卡点.md。
 */
import {wiggle} from '../../library/lamplight/charts';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** bgm-1021 网格 */
export const BAR = 2.127;
export const BAR0 = 0.06;
export const BEAT = BAR / 4;
export const beatSec = (b: number) => BAR0 + BEAT * b;
export const fr = (sec: number) => Math.round(sec * FPS);
export const fbt = (b: number) => fr(beatSec(b));
export const fb = (k: number) => fbt(4 * k);

export const HIT = fb(8);
export const HIT2 = fb(44);
export const DARK_FROM = fr(16.3);
export const DARK_FROM2 = fr(91.5);
export const FREEZE = 3;
export const DURATION = fr(beatSec(256) + 1);

/** 开场强拍（实测） */
export const OPEN_HITS = [0, 5, 7, 8, 11, 12, 13, 16];
/** 回落段：六座烽台该亮没亮 */
export const WAIT_BEATS = [160, 161, 164, 165, 167, 168];

export const ANCHOR = '火不至';
export const TITLE = '没有敌人\n唐朝烽火为什么\n每天都要点？';
/** 顶部常驻钩子标题 */
export const HOOK_BAR = '唐朝烽火：没有敌人，也要每天点火';

/** 叙述：[拍号, 文字 | null, 另起一屏?]；null = 大字卡 */
export const CUES: [number, string | null, boolean?][] = [
  // 开场
  [0, '你以为烽火台，只在打仗时点火？', true],
  [7, '〖错〗。'],
  [8, '没有敌人，它也得亮。'],
  [11, '从边关到长安，', true],
  [13, '一座接一座，各点〔一把〕。'],
  [20, '这把火，叫【平安火】。'],
  [24, '可要是哪天，这把火没来——', true],
  [32, null], // 标题卡
  // 第 1 章：烽台和烽子
  [36, '【唐六典】：烽台大率相去〔三十里〕。', true],
  [42, '有山挡着就挪，〔必须互相看得见〕。'],
  [48, '你猜：一座烽台，几个人守？', true],
  [52, '〔6 个人〕：5 个轮班盯着，1 个管文书。'],
  [56, '白天看烟，夜里看火。', true],
  [60, '〖两年一换〗，走前还得教会新人。'],
  // 第 2 章：几把火
  [64, '你猜：敌人越多，火怎么点？', true],
  [69, '50 人以上，〔1 把〕；'],
  [72, '500 人以上，〔2 把〕；'],
  [76, '500 骑以上，〔3 把〕；'],
  [80, '上千骑、数不清，〔4 把〕。'],
  [85, '1 把，只传到本州。', true],
  [88, '〔2 把以上〕，一路传进京城。'],
  [90, '你猜：一昼夜能传多远？', true],
  [92, '〔二千里〕，约 67 座烽台接力。'],
  // 第 3 章：唐律
  [96, '点错了，后果写在【唐律】里：', true],
  [100, '该多点却点少了，〖徒三年〗。'],
  [104, '不该点却点了，〖徒一年〗。'],
  [108, '要是因此丢了城、死了人——', true],
  [116, null], // 大字「绞」
  [120, '暗号只在烽帅、烽副手里，', true],
  [124, '〖烽子都不许知道〗。'],
  // 第 4 章：平安火
  [128, '但最反常的一条，是没敌人时：', true],
  [132, '【通典】：“每晨及夜平安，〔举一火〕。”'],
  [136, '火没来，就当〖烽子已被敌人抓了〗。', true],
  [140, '杜甫写：“夕烽来不近，〔每日报平安〕。”'],
  // 回落段：756 年
  [144, '你猜：这把火，真的没来过吗？', true],
  [146, '天宝十五载，公元 756 年六月。'],
  [148, '安禄山叛军，攻破了【潼关】。'],
  [152, '潼关身后，就是长安。', true],
  [156, '这一天，玄宗只派了些牧马兵去救。'],
  [160, '然后，长安等着那把火。', true],
  [164, '一座烽台，没亮。'],
  [167, '又一座，没亮。'],
  [172, '天黑了，长安等来的是——', true],
  [176, null], // 第二个爆点「火不至」
  // 收束
  [184, '没有火，就是最坏的消息。', true],
  [188, '不用人报信，玄宗就知道：〖潼关没了〗。'],
  [192, '你猜：接下来，他做了什么？', true],
  [194, '〔4 天后〕黎明，玄宗逃出了长安。'],
  [198, '宫外的皇孙、公主，都没带走。'],
  [200, '平安火，平时没人在意，', true],
  [204, '直到它〖不亮〗的那天。'],
  [208, null], // 大字：原来平安，也是每天要报的。
  [216, '1200 多年后，烽火台早熄了。', true],
  [220, '可我们到家，还会说一句——'],
  [224, null], // 大字：报个平安
  [232, null], // 评论区问题
  [244, null], // 结尾一句
];
export const cueStart = (i: number) => fbt(CUES[i][0]);
export const HALF_BEATS = [24, 172];

export const FLIP_1 = '原来平安，';
export const FLIP_2 = '也是每天要报的。';
export const FLIP_WORD = '报个平安';
export const ASK_LINE = ['你上一次给家里报平安，', '是什么时候？'];
export const END_LINE = ['今晚到家，', '记得报个平安。'];

/** 镜头：首尾相接、落在拍点上 */
export const SHOTS = {
  hook: [0, fbt(11)], // 夜色烽台已燃，大字钩子；第 7 拍「错」、第 8 拍再旺一次
  road: [fbt(11), fbt(24)], // 地图：边关 → 长安，四座烽台踩拍亮起
  question: [fbt(24), HIT], // 镜头推向长安，收暗
  title: [HIT, fb(9)], // 标题卡
  liudian: [fb(9), fb(12)], // 纸卷：唐六典，三十里、相望见
  crew: [fb(12), fb(14)], // 烽台 + 6 个人
  daynight: [fb(14), fb(16)], // 昼烟夜火、两年一换
  tiers: [fb(16), fb(21)], // 四座火台：1/2/3/4 把
  reach: [fb(21), fb(24)], // 地图：1 把到本州，2 把以上进京，一昼夜二千里
  law: [fb(24), fb(27)], // 唐律纸卷：徒三年 / 徒一年
  hang: [fb(27), fb(30)], // 边城变红 →「绞」
  secret: [fb(30), fb(32)], // 烽帅手里的烽号
  peace: [fb(32), fb(35)], // 一排平安火，有一座灭了
  poem: [fb(35), fb(36)], // 杜甫《夕烽》
  fall: [fb(36), fb(40)], // 地图：潼关失守
  wait: [fb(40), fbt(172)], // 潼关 → 长安，六座烽台等不来火
  build: [fbt(172), HIT2], // 镜头推向长安，收暗
  hit2: [HIT2, fb(46)], // 「火不至」
  news: [fb(46), fb(48)], // 宫殿：玄宗知道了
  flee: [fb(48), fb(50)], // 延秋门出逃
  nolight: [fb(50), fb(52)], // 一排不亮的烽台
  flip: [fb(52), fb(54)], // 大字：原来平安，也是每天要报的
  modern: [fb(54), fb(56)], // 烽台遗址 → 手机亮屏
  word: [fb(56), fb(58)], // 大字：报个平安
  ask: [fb(58), fb(61)], // 评论区问题
  end: [fb(61), DURATION], // 结尾：一把平安火
} as const;

/* ---------------- 片中的事实（出处见文案稿，测试核对） ---------------- */
/** 《唐六典》卷五：凡烽候所置，大率相去三十里 */
export const LI_PER_BEACON = 30;
/** 《通典》卷 152：一烽六人，五人为烽子，一人烽率 */
export const CREW = 6;
export const CREW_WATCH = 5;
/** 《武经总要》前集卷五引唐兵部烽式：烽子并二年一代 */
export const TERM_YEARS = 2;
/** 同上：放烽一炬 50 人以上、两炬 500 人以上、三炬蕃贼 500 骑以上、四炬千人以上不知头数 */
export const TIERS = [50, 500, 500, 1000];
/** 同上：凡烟火，一昼夜须行二千里 */
export const DAY_LI = 2000;
export const RELAY_COUNT = Math.round(DAY_LI / LI_PER_BEACON); // ≈ 67，自己算的
/** 《唐律疏议》卷八「烽候不警」：应放多烽而放少烽，徒三年；不应举而举，徒一年；烽台二里内不得放烟火；陷败户口城戍者绞 */
export const LESS_YEARS = 3;
export const MORE_YEARS = 1;
export const BAN_LI = 2;
/** 《资治通鉴》卷 218：天宝十五载六月辛卯潼关陷；乙未黎明出延秋门 */
export const FALL_YEAR = 756;
export const GANZHI_XINMAO = 28; // 辛卯是六十甲子第 28
export const GANZHI_YIWEI = 32; // 乙未是第 32
export const FLEE_DAYS = GANZHI_YIWEI - GANZHI_XINMAO;
export const YEARS_SINCE = 2026 - FALL_YEAR; // 1270，文案写「1200 多年」

/* ---------------- 地图（程序地形，地图坐标 2600×1600；地点是示意） ---------------- */
export const PLACES = {
  frontier: [520, 520] as [number, number], // 西北边关
  changan: [1180, 900] as [number, number],
  tongguan: [1560, 860] as [number, number],
  zhou: [820, 700] as [number, number], // 本州
};
/** 开场：边关 → 长安 */
export const ROUTE_OPEN = wiggle([PLACES.frontier, [700, 620], [880, 720], [1040, 820], PLACES.changan], 3, 16);
export const OPEN_STOPS = [0, 1 / 3, 2 / 3, 1];
export const OPEN_LIT = [fbt(11), fbt(12), fbt(13), fbt(16)];
/** 第 2 章：边关 → 本州（1 把）；边关 → 长安（2 把以上） */
export const ROUTE_ZHOU = wiggle([PLACES.frontier, [660, 600], PLACES.zhou], 5, 14);
/** 潼关 → 长安，六座烽台 */
export const ROUTE_TG = wiggle([PLACES.tongguan, [1460, 900], [1360, 880], [1260, 910], PLACES.changan], 7, 12);
export const WAIT_STOPS = WAIT_BEATS.map((_, i) => (i + 1) / (WAIT_BEATS.length + 1));

/* ---------------- 音效：[文件, 帧, 音量] ---------------- */
const A = 'audio/ep52-tang-beacon';
const s = (name: string, b: number, v: number): [string, number, number] => [`${A}/${name}.wav`, fbt(b), v];
const shared = (name: string, b: number, v: number): [string, number, number] => [`audio/sfx/${name}.wav`, fbt(b), v];
export const SFX: [string, number, number][] = [
  // 开场
  s('impact', 0, 0.5),
  s('ignite', 0, 0.45),
  s('drum', 5, 0.45),
  s('impact', 7, 0.5),
  s('ignite', 8, 0.55),
  ...[11, 12, 13, 16].map((b) => s('ignite', b, 0.45)),
  shared('whoosh', 20, 0.35),
  s('tick', 24, 0.45),
  [`${A}/riser.wav`, fr(beatSec(32) - 2), 0.6],
  s('impact', 32, 0.7),
  // 第 1 章
  shared('paper', 36, 0.5),
  shared('whoosh', 42, 0.3),
  s('tick', 48, 0.45),
  s('drum', 52, 0.45),
  shared('whoosh', 56, 0.35),
  s('drum', 60, 0.4),
  // 第 2 章
  s('tick', 64, 0.45),
  ...[69, 72, 76, 80].map((b) => s('drum', b, 0.5)),
  ...[69, 72, 76, 80].map((b) => s('ignite', b, 0.35)),
  shared('whoosh', 85, 0.35),
  shared('whoosh', 88, 0.4),
  s('tick', 90, 0.45),
  s('impact', 92, 0.45),
  // 第 3 章
  shared('paper', 96, 0.5),
  shared('stamp', 100, 0.6),
  shared('stamp', 104, 0.6),
  s('drum', 108, 0.5),
  s('drum', 112, 0.45),
  s('impact', 116, 0.62),
  shared('paper', 120, 0.4),
  s('drum', 124, 0.4),
  // 第 4 章
  ...[128, 129, 130, 131].map((b) => s('ignite', b, 0.3)),
  shared('paper', 132, 0.35),
  s('drum', 136, 0.5),
  shared('paper', 140, 0.45),
  // 回落段
  s('tick', 144, 0.45),
  shared('whoosh', 146, 0.3),
  s('impact', 148, 0.5),
  s('drum', 152, 0.4),
  s('hoof', 156, 0.4),
  s('hoof', 158, 0.35),
  ...WAIT_BEATS.map((b) => s('drum', b, 0.32)),
  [`${A}/riser.wav`, fr(beatSec(176) - 2), 0.65],
  s('impact', 176, 0.66),
  // 收束
  s('drum', 184, 0.4),
  s('impact', 188, 0.45),
  s('tick', 192, 0.45),
  ...[194, 195, 196, 197].map((b) => s('hoof', b, 0.35)),
  shared('whoosh', 200, 0.3),
  s('drum', 204, 0.45),
  s('impact', 208, 0.45),
  shared('whoosh', 216, 0.35),
  s('bell', 220, 0.35),
  s('impact', 224, 0.5),
  s('tick', 232, 0.4),
  s('ignite', 244, 0.45),
];
