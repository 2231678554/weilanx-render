/**
 * 第 6–66 屏：字幕（/ 换行；〔〕金色、〖〗朱红）、是否记忆点（★ 慢镜头 + 重鼓）。
 * 每屏的拍数按字数算（约 0.2 秒一个字 + 1 秒，记忆点多 1.5 秒），取偶数拍，起点对齐半小节。
 */
export type Screen = {n: number; text: string; mem?: 1 | 2; extra?: number; hitLine?: number; hitOff?: number};

export const SCREENS: Screen[] = [
  {n: 6, text: '撒腿跑回家？'},
  {n: 7, text: '不一定来得及。/规定只写了敲多少下，/没写〔敲多快〕。'},
  {n: 8, text: '每个坊都有个〔坊正〕，/管着坊门的钥匙。'},
  {n: 9, text: '鼓一停，门一锁。/你还在门外，就是〖犯夜〗。', mem: 1},
  {n: 10, text: '犯夜这条律，不光管长安。/晚唐大诗人〔温庭筠〕，就栽在了〔扬州〕。'},
  {n: 11, text: '他跟宰相〔令狐绹〕有仇：/考了好多年考不上，/怪令狐绹不拉他一把。', mem: 1, hitLine: 2},
  {n: 12, text: '咸通年间，他路过扬州。/管扬州的，偏偏就是〔令狐绹〕。'},
  {n: 13, text: '他不去拜见，/天天跟一帮年轻人逛青楼。'},
  {n: 14, text: '有天夜里他喝醉了，/过了时辰还在扬州街上。'},
  {n: 15, text: '巡夜的虞候撞上他，/打得他〖脸也破了，牙也断了〗。', mem: 2},
  {n: 16, text: '这口气咽不下，他去告状。/告到谁那儿？〔令狐绹〕。', extra: 2},
  {n: 17, text: '令狐绹真把虞候抓了。'},
  {n: 18, text: '虞候一张嘴，/把温庭筠逛青楼的事全抖了出来。'},
  {n: 19, text: '令狐绹干脆两个都放了。'},
  {n: 20, text: '这下，他那些丑事，/连长安都知道了。'},
  {n: 21, text: '唐律管的是大街。/进了坊门，在里头走动，〔不算犯夜〕。'},
  {n: 22, text: '街两边全是坊墙，/最近的坊门，就在跟前。', mem: 1},
  {n: 23, text: '〔崇仁坊〕挨着东市，/离朝廷选官的地方也最近。'},
  {n: 24, text: '进京等着做官的人，城里没房子，/大多住在这儿。'},
  {n: 25, text: '做工的、做买卖的，全往这儿挤。'},
  {n: 26, text: '《长安志》写这里：/「〔昼夜喧呼，灯火不绝〕。」'},
  {n: 27, text: '全长安，没有一个坊比得上。', mem: 1},
  {n: 28, text: '坊门外的大街一片黑，/坊里头照样有人喝酒、吃饭、聊天。'},
  {n: 29, text: '〔李商隐〕写过一场夜宴，/有两句你多半背过：'},
  {n: 30, text: '「身无彩凤双飞翼，/心有灵犀一点通。」', extra: 2},
  {n: 31, text: '酒席上是这样的：/「〔隔座送钩〕春酒暖，/〔分曹射覆〕蜡灯红。」', mem: 1, hitLine: 2},
  {n: 32, text: '唐朝小说《任氏传》里，/有个叫〔郑六〕的，卡在了天亮前那一会儿。'},
  {n: 33, text: '天宝九年夏天，郑六跟朋友约好，/去新昌坊喝酒。'},
  {n: 34, text: '走到半路，郑六说有事，/让朋友自己去，说随后就到。'},
  {n: 35, text: '朋友骑着白马往东，/郑六骑着驴往南，进了〔升平坊〕。'},
  {n: 36, text: '路上碰到三个女子，/中间穿白衣服的那个，长得特别好看。'},
  {n: 37, text: '郑六看呆了。/骑着驴一会儿跑到她前头，一会儿落到她后头，/想搭话，又不敢。', mem: 1},
  {n: 38, text: '白衣女子时不时看他一眼。'},
  {n: 39, text: '郑六壮着胆子开口：/「长得这么好看，怎么走路呢？」'},
  {n: 40, text: '她笑了：「有驴的人不肯借，/我不走路怎么办？」'},
  {n: 41, text: '郑六说：「我这破驴配不上你，/送你骑，我跟着走就够了。」'},
  {n: 42, text: '两个人对视一眼，哈哈大笑。'},
  {n: 43, text: '一路走到乐游园，天已经黑了。'},
  {n: 44, text: '天黑了还在走，没人管：/他们一直在〔坊里头〕。'},
  {n: 45, text: '眼前一座宅子，土墙大门，/屋子修得很气派。'},
  {n: 46, text: '丫鬟问了他的名字，也报了自家姓：/「姓〔任〕，排行第二十。」'},
  {n: 47, text: '屋里点满蜡烛，摆上酒菜。/任氏换了身衣服出来，陪他喝到半夜。'},
  {n: 48, text: '天快亮，任氏催他走：/「我家兄弟在教坊当差，一早要出门，/你不能多待。」'},
  {n: 49, text: '郑六走到坊门口，门还〖锁着〗。'},
  {n: 50, text: '门边有家胡人开的〔饼铺〕，/已经点上灯，生起了炉子。'},
  {n: 51, text: '郑六坐在饼铺的帘子底下，〔等鼓〕。'},
  {n: 52, text: '他跟老板搭话：/「往东拐，有个大门的，是谁家？」'},
  {n: 53, text: '老板说：那儿是一片塌墙荒地，/〖没有人家〗。'},
  {n: 54, text: '郑六不信：/「我刚从那儿过来，怎么会没有？」'},
  {n: 55, text: '老板想起来了：/「那里头有只〖狐狸〗，常勾男人去过夜。」', mem: 1},
  {n: 56, text: '「我见过三回了。你也碰上了？」'},
  {n: 57, text: '郑六脸一红：「没有。」'},
  {n: 58, text: '天亮了，他回去一看：/墙和门都在，里头〖只有荒草〗。', mem: 2},
  {n: 59, text: '回到家，朋友怪他放了鸽子。/郑六一个字没提，编了个别的理由。'},
  {n: 60, text: '天一亮，街上又响起了鼓。/长安人管它叫「〔冬冬鼓〕」。'},
  {n: 61, text: '〔一百零八个〕坊的门，一扇扇打开。'},
  {n: 62, text: '李商隐《无题》的结尾：/「嗟余听鼓应官去，/走马兰台类转蓬。」'},
  {n: 63, text: '鼓一响，他就得骑马去上班。/像一根被风卷着跑的蓬草。'},
  {n: 64, text: '有人挤进了坊门，/有人挨了二十下，/有人在饼铺里坐到天亮。', mem: 1},
  {n: 65, text: '换作是你：/鼓已经敲到〖第九百下〗，/离家还有〔三条街〕。'},
  {n: 66, text: '你怎么办？', extra: 2},
];

export const STORY_START = 40; // 拍：标题卡（第 32 拍）停 8 拍
const BEAT = 2.127 / 4;
const chars = (t: string) => t.replace(/[〔〕〖〗「」《》/，。：？、！]/g, '').length;
export type Placed = Screen & {b0: number; beats: number; lines: string[]};
export const PLACED: Placed[] = (() => {
  let b = STORY_START;
  return SCREENS.map((sc) => {
    const sec = 0.5 + chars(sc.text) * 0.165 + (sc.mem ? 1.2 : 0) + (sc.extra ?? 0) * BEAT;
    const beats = Math.max(6, Math.ceil(sec / BEAT / 2) * 2);
    const p = {...sc, b0: b, beats, lines: sc.text.split('/')};
    b += beats;
    return p;
  });
})();
export const STORY_END = PLACED[PLACED.length - 1].b0 + PLACED[PLACED.length - 1].beats;
export const FINAL_TITLE = STORY_END; // 结尾标题卡起拍
export const TOTAL_BEATS = FINAL_TITLE + 12;

/** 每行字幕在屏内第几拍出现（按字数比例分配，行与行至少隔 2 拍） */
export const lineBeats = (p: Placed) => {
  const cs = p.lines.map(chars);
  const tot = cs.reduce((a, b) => a + b, 0);
  let acc = 0;
  let prev = -2;
  return cs.map((c, i) => {
    const b = i === 0 ? 0 : Math.min(p.beats - 2, Math.max(prev + 2, Math.round((acc / tot) * (p.beats - 1.5))));
    acc += c;
    prev = b;
    return b;
  });
};
/** 记忆点的重拍（屏内拍号） */
export const hitBeat = (p: Placed) => {
  if (!p.mem) return undefined;
  const lb = lineBeats(p);
  return lb[Math.min(lb.length - 1, p.hitLine ?? 1)] + (p.hitOff ?? 1);
};
