import {AMBIENCE, BEAT, DUCK, DURATION, FPS, MUSIC_BEAT, SFX, fbt} from '../../src/episodes/ep54-yangguang-canal/timeline';
console.log(JSON.stringify({FPS, DURATION, SFX, AMBIENCE, MUSIC_SEC: BEAT * MUSIC_BEAT, MUSIC_VOL: 0.8, DUCK: DUCK.map(([a, b, g]) => [fbt(a), fbt(b), g])}));
