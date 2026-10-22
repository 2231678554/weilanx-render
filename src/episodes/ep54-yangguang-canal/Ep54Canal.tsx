import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {clamp01} from '../../library/anim';
import {panelAt} from '../../library/lamplight/scenes';
import {Embers, Flash, Narration, NightBg, TitleCard} from '../../library/lamplight/stage';
import {L, LF} from '../../library/lamplight/theme';
import {Opening} from './Opening';
import {Act1, ACT1_START} from './Act1';
import {Act2, ACT2_START} from './Act2';
import {Act3, ACT3_START} from './Act3';
import {Act4, ACT4_START} from './Act4';
import {Act5, ACT5_START} from './Act5';
import {Act6, ACT6_START} from './Act6';
import {Act7, ACT7_START} from './Act7';
import {Act8, ACT8_START} from './Act8';
import {CUES, fbt, SHOT} from './timeline';

/** ep54 杨广与大运河 */
export const Ep54Canal: React.FC = () => {
  const f = useCurrentFrame();
  const titleAt = fbt(SHOT.title[0]);
  const panel = panelAt(CUES, fbt, f);
  const inTitle = f >= titleAt && f < ACT1_START;
  const inAct1 = f >= ACT1_START && f < ACT2_START;
  const inAct2 = f >= ACT2_START && f < ACT3_START;
  const inAct3 = f >= ACT3_START && f < ACT4_START;
  const inAct4 = f >= ACT4_START && f < ACT5_START;
  const inAct5 = f >= ACT5_START && f < ACT6_START;
  const inAct6 = f >= ACT6_START && f < ACT7_START;
  const inAct7 = f >= ACT7_START && f < ACT8_START;
  const inAct8 = f >= ACT8_START;
  return (
    <AbsoluteFill style={{background: L.night, overflow: 'hidden'}}>
      <Audio src={staticFile('audio/ep54-yangguang-canal/mix.wav')} />
      {f < titleAt && <Opening f={f} />}
      {inAct1 && <Act1 f={f} />}
      {inAct2 && <Act2 f={f} />}
      {inAct3 && <Act3 f={f} />}
      {inAct4 && <Act4 f={f} />}
      {inAct5 && <Act5 f={f} />}
      {inAct6 && <Act6 f={f} />}
      {inAct7 && <Act7 f={f} />}
      {inAct8 && <Act8 f={f} />}
      {inTitle && (
        <>
          <NightBg f={f} glow={[50, 56]} strength={1.3} />
          <Embers f={f} x={960} y={1000} n={26} spread={1200} rise={600} seed={4} />
          <TitleCard f={f} at={titleAt} kicker="灯火史话 · 隋代运河" title="杨广与大运河" pill="修这条河，到底为了什么？" size={200} perChar={2} />
        </>
      )}
      {panel && <Narration key={panel[0].b} f={f} lines={panel.map(({b, text}) => ({at: b === 0 ? -40 : fbt(b), text}))} size={64} y={96} perChar={2} />}
      {!inTitle && f >= fbt(SHOT.s2[0]) && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontFamily: LF.label, fontSize: 24, color: L.inkDim, opacity: clamp01((f - fbt(SHOT.s2[0])) / 10)}}>人物和场面都是示意</div>
      )}
      <Flash f={f} at={0} dur={8} peak={0.85} />
      <Flash f={f} at={titleAt} />
      <Flash f={f} at={ACT1_START} dur={8} peak={0.5} />
    </AbsoluteFill>
  );
};
