// ep53 长安宵禁：配乐 bgm-1021 循环一次（第 0–64 小节 + 第 4 小节–结尾，接缝在小节线，见 ep53_bgm.py），无口播，−16 LUFS；
// 音效：战术屏音效包 impact / riser / tick + 灯火史话风 hoof / drum / ignite / bell（都是代码合成）
import {execFileSync} from 'node:child_process';
import {makeLamplightSfx} from '../sfx-lamplight.mjs';
import {makeTacticalSfx} from '../sfx-tactical.mjs';

const EP = 'ep53-changan-curfew';
execFileSync('python3', ['audio/episodes/ep53_bgm.py', '64'], {stdio: 'inherit'});
makeTacticalSfx(EP);
makeLamplightSfx(EP);
