// ep52 唐朝烽火：配乐 bgm-1021 从第 0 秒开始（第 256 拍 + 1 秒，结尾 2.5 秒淡出），无口播，−16 LUFS；
// 音效：战术屏音效包 impact / riser / tick + 灯火史话风 hoof / drum / ignite / bell（都是代码合成）
import {cutMusic} from '../music.mjs';
import {makeLamplightSfx} from '../sfx-lamplight.mjs';
import {makeTacticalSfx} from '../sfx-tactical.mjs';

const EP = 'ep52-tang-beacon';
const DURATION = Math.round((0.06 + (2.127 / 4) * 256 + 1) * 30) / 30;

if (cutMusic({track: 'bgm-1021', start: 0, duration: DURATION, ep: EP, fadeIn: 0.02, fadeOut: 2.5})) {
  makeTacticalSfx(EP);
  makeLamplightSfx(EP);
}
