import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Flash, shakeXY} from '../../library/lamplight/stage';
import {Ctx, slowT} from './Kit';
import {SCENES_A} from './StoryA';
import {SCENES_B} from './StoryB';
import {hitBeat, lineBeats, PLACED} from './story';
import {BEAT, fbt, FPS} from './timeline';

const SCENES = {...SCENES_A, ...SCENES_B};

/** 正片第 6–66 屏：按 PLACED 找当前屏，给屏内局部帧；记忆点加慢镜头、震屏、白闪 */
export const Story: React.FC<{f: number}> = ({f}) => {
  const p = PLACED.find((q) => f >= fbt(q.b0) && f < fbt(q.b0 + q.beats));
  if (!p) return null;
  const f0 = fbt(p.b0);
  const t = f - f0;
  const d = fbt(p.b0 + p.beats) - f0;
  const L = lineBeats(p).map((b) => fbt(p.b0 + b) - f0);
  const hb = hitBeat(p);
  const hit = hb === undefined ? d + 999 : fbt(p.b0 + hb) - f0;
  const st = hb === undefined ? t : slowT(t, hit, p.mem === 2 ? 0.3 : 0.45, p.mem === 2 ? 44 : 30);
  const ctx: Ctx = {t, d, L, hit, st, B: BEAT * FPS};
  const Scene = SCENES[p.n];
  const sh = hb === undefined ? {x: 0, y: 0} : shakeXY(t, hit, p.mem === 2 ? 26 : 16);
  const hits64 = p.n === 64 ? L : [];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>{Scene ? <Scene {...ctx} /> : null}</AbsoluteFill>
      {hb !== undefined && p.n !== 64 && <Flash f={t} at={hit} dur={p.mem === 2 ? 10 : 7} peak={p.mem === 2 ? 0.75 : 0.5} />}
      {hits64.map((h) => <Flash key={h} f={t} at={h} dur={6} peak={0.5} />)}
    </AbsoluteFill>
  );
};
