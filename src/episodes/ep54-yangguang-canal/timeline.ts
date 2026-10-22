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
export const SHOT: Record<string, [number, number]> = {
  s1: [0, 6],
  s2: [6, 14],
  s3: [14, 22],
  s4: [22, 28],
  title: [28, 32],
  // 第一幕：每屏 8 拍（约 4.25 秒）
  s5: [32, 40],
  s6: [40, 48],
  s7: [48, 56],
  s8: [56, 64],
  s9: [64, 72],
  s10: [72, 80],
  s11: [80, 88],
  s12: [88, 96],
  s13: [96, 104],
  s14: [104, 112],
  s15: [112, 120],
  s16: [120, 128],
  s17: [128, 136],
  s18: [136, 144],
  s19: [144, 152],
  s20: [152, 160],
  s21: [160, 168],
  s22: [168, 176],
};
/** 当前已做完的最后一屏 */
export const LAST = 's22';
export const MUSIC_BEAT = 0;
export const DURATION = fbt(SHOT[LAST][1]);

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
  [32, '隋文帝杨坚灭了〔陈朝〕，', true],
  [34.5, '结束了〔近三百年〕的分裂。'],
  [40, '他还是个「〖妻管严〗」：', true],
  [42.5, '后宫只有〔独孤皇后〕，儿子全是她生的。'],
  [48, '太子〔杨勇〕是个〔文艺青年〕：', true],
  [50.5, '爱读书，会作诗，性子直。'],
  [56, '可他〖讲究排场〗，', true],
  [58, '一副蜀地铠甲也要装饰得〔金光闪闪〕。'],
  [64, '〔冬至〕大节，百官跑去东宫朝贺，', true],
  [66.5, '他奏乐受贺，〖照单全收〗。'],
  [72, '创业皇帝隋文帝，看得〖火冒三丈〗：', true],
  [74.5, '皇帝还在，〖朝什么太子〗？'],
  [80, '老二〔晋王杨广〕，立刻嗅到了〖机会〗！', true],
  [82.5, '灭陈时，他挂名〔元帅〕攒下了军功。'],
  [88, '回到家，他专跟哥哥〖反着演〗：', true],
  [90.5, '爹娘来府上，只见又老又丑的侍女。'],
  [96, '美貌的姬妾全〖藏进了别屋〗，', true],
  [98.5, '〔琴弦〕故意弄断，上面的灰也不擦。'],
  [104, '这波操作，拿下了〔独孤皇后〕和权臣〔杨素〕。', true],
  [106.5, '公元〔600 年〕，杨勇被废，〖杨广当上太子〗。'],
  [112, '杨勇想见亲爹〖喊冤〗，见不着，', true],
  [114.5, '逼得爬到宫外树上〖大喊〗。'],
  [120, '杨素一句话：', true],
  [122, '「他被〖疯鬼附身〗了，救不回来了。」'],
  [128, '四年后，隋文帝在〔仁寿宫〕病重。', true],
  [130.5, '杨广对〔宣华夫人〕〖无礼〗，被她挣脱了。'],
  [136, '隋文帝〖悔青了肠子〗：', true],
  [138.5, '「召我儿——是〔杨勇〕！」'],
  [144, '消息先到了〔杨素〕手里。', true],
  [146.5, '杨广派亲信〔张衡〕进了寝殿，没多久，〖皇帝驾崩〗。'],
  [152, '当晚，他就占了〔宣华夫人〕；', true],
  [154.5, '随后〖假传诏书〗，赐死了亲哥哥。'],
  [160, '杨广登基后，第一件大工程：', true],
  [162.5, '营建〔东都洛阳〕。'],
  [168, '放着长安不住，为啥要建洛阳？', true],
  [170.5, '因为——〖饭不够吃〗！'],
];
/** 第 5 屏：隋吞陈（屏内拍） */
export const S5 = {swallow: 3.5, done: 5.2};
/** 第 10 屏：拍案（屏内拍） */
export const S10 = {slam: 2};
export const S13 = {bump1: 1.3, bump2: 2.1};
export const S14 = {edict: 0.8, year: 3.0, crown: 3.4};
export const S15 = {shout: 1.8, turn: 5.0};
export const S16 = {circle: 2.3, wave: 4.4, close: 5.0};
export const S17 = {free: 3.0, year: 6.0};
export const S18 = {point: 3.0};
export const S19 = {enter: 2.6, shut: 4.4, out: 6.2, note: 4.0};
export const S20 = {cut: 4};
export const S21 = {rise: 2.6};
export const S22 = {growl: 3.4, clash: 4.6};

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
  // 第 5 屏：隋吞陈，合拢一声重鼓
  s('drum', 32, 0.4), s('whoosh', 32 + S5.swallow - 0.6, 0.6), s('riser', 32 + S5.swallow - 1.5, 0.3),
  s('bigdrum', 32 + S5.done, 1), s('impact', 32 + S5.done, 0.6), s('stamp', 32 + S5.done + 0.6, 0.7),
  // 第 6 屏：独孤皇后双手按膝，轻鼓
  s('drum', 40, 0.35), s('thud', 41, 0.7), s('drum', 41, 0.5), s('gulp', 43.5, 0.6),
  // 第 7 屏：吟诵、拍手叫好
  s('brush', 48.2, 0.25), s('clap', 51.5, 0.7), s('clap', 53, 0.6), s('drum', 52, 0.3),
  // 第 8 屏：铠甲反光一闪，刀子「当」
  s('glint', 57.5, 0.7), s('glint', 59.2, 0.5), s('dang', 62.5, 0.9), s('drum', 62.5, 0.4),
  // 第 9 屏：鼓乐声
  ...[64, 65, 66, 67, 68, 69, 70, 71].map((b) => s('drum', b, b % 2 ? 0.28 : 0.42)),
  ...[64.5, 66.5, 68.5, 70.5].map((b) => s('bell', b, 0.35)),
  // 第 10 屏：慢镜头拍案 + 重鼓
  s('riser', 72 + S10.slam - 1.6, 0.35),
  s('slap', 72 + S10.slam, 1), s('bigdrum', 72 + S10.slam, 1), s('impact', 72 + S10.slam, 0.8),
  s('clink', 72 + S10.slam + 1.2, 0.7), s('clink', 72 + S10.slam + 2.1, 0.45),
  // 第 11 屏：两个镜头一拍一切
  s('drum', 80, 0.35), s('tick', 82.2, 0.6), s('whoosh', 83.8, 0.6), s('bigdrum', 84, 0.8), s('gallop', 84, 0.7), s('clang', 85.5, 0.35),
  // 第 12 屏：轻鼓
  s('drum', 88, 0.35), s('drum', 90, 0.3), s('clink', 91.2, 0.4), s('drum', 92.2, 0.35), s('drum', 93.2, 0.3),
  // 第 13 屏：门板「咚咚」两声
  s('thud', 96 + S13.bump1, 1), s('thud', 96 + S13.bump2, 1), s('drum', 96 + S13.bump2, 0.5), s('pluck', 99, 0.6),
  // 第 14 屏：诏书展开声
  s('scroll', 104 + S14.edict, 0.9), s('stamp', 104 + S14.year, 0.8), s('whoosh', 104 + S14.crown, 0.5), s('bigdrum', 104 + S14.crown + 2, 0.8),
  // 第 15 屏：喊声回响
  s('shout', 112 + S15.shout, 0.85), s('drum', 112 + S15.turn, 0.5),
  // 第 16 屏：关门闷响
  s('drum', 120, 0.3), s('whoosh', 120 + S16.close, 0.4), s('doorslam', 120 + S16.close + 1.1, 1), s('bigdrum', 120 + S16.close + 1.1, 0.7),
  // 第 17 屏：低沉鼓点，快切
  ...[128, 129, 130, 131].map((b) => s('drum', b, 0.4)), s('brush', 128 + S17.free - 0.4, 0.6), s('whoosh', 128 + S17.free, 0.6),
  s('bigdrum', 132, 0.6), s('drum', 133, 0.35), s('drum', 134, 0.35), s('stamp', 128 + S17.year, 0.8),
  // 第 18 屏：慢镜头 + 重鼓 + 白闪
  s('riser', 136 + S18.point - 1.6, 0.4), s('bigdrum', 136 + S18.point, 1), s('impact', 136 + S18.point, 0.9),
  s('brush', 136 + S18.point + 0.8, 0.5), s('brush', 136 + S18.point + 2, 0.45), s('brush', 136 + S18.point + 3.2, 0.4),
  // 第 19 屏：门合上、烛光熄灭 → 静音 1 拍 → 一声低鼓
  s('scroll', 144.8, 0.35), s('creak', 144 + S19.enter - 0.3, 0.6), s('creak', 144 + S19.shut, 0.5), s('thud', 144 + S19.shut + 1.6, 0.7),
  s('puff', 144 + S19.out, 0.6), s('lowdrum', 144 + S19.out + 1, 1),
  // 第 20 屏：推门、金盒；盖章声；铁栅栏
  s('creak', 152.1, 0.5), s('clink', 153.8, 0.5), s('drum', 155, 0.35),
  s('stamp', 152 + S20.cut + 0.9, 1), s('bigdrum', 152 + S20.cut + 0.9, 0.8), s('clang', 152 + S20.cut + 1.8, 0.45), s('thud', 152 + S20.cut + 3.4, 0.6),
  // 第 21 屏：建筑生长
  s('drum', 160, 0.35), s('build', 160 + S21.rise, 0.9), s('stamp', 160 + S21.rise + 2.4, 0.7),
  // 第 22 屏：「咕」肚子叫 + 重鼓
  s('drum', 168, 0.3), s('growl', 168 + S22.growl, 0.9), s('clink', 168 + S22.clash, 0.9), s('bigdrum', 168 + S22.clash, 1), s('impact', 168 + S22.clash, 0.6),
];
/** 配乐压低：[起拍, 止拍, 增益] */
export const DUCK: [number, number, number][] = [[144 + S19.out - 0.15, 144 + S19.out + 1, 0.05]];
/** 环境声：运河水声（第 1–3 屏），[文件, 起帧, 止帧, 音量] */
export const AMBIENCE: [string, number, number, number][] = [
  [`${A}/water.wav`, 0, fbt(SHOT.s3[0]) + S3.zoomA, 0.22],
  [`${A}/water.wav`, fbt(22), fbt(24.5), 0.18],
];
