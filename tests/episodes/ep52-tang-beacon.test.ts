import {existsSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {
  BAN_LI, CREW, CREW_WATCH, CUES, cueStart, DARK_FROM, DARK_FROM2, DAY_LI, DURATION, fbt, FLEE_DAYS, FPS, HALF_BEATS, HIT, HIT2,
  LESS_YEARS, LI_PER_BEACON, MORE_YEARS, OPEN_HITS, RELAY_COUNT, SFX, SHOTS, TERM_YEARS, TIERS, WAIT_BEATS, YEARS_SINCE,
} from '../../src/episodes/ep52-tang-beacon/timeline';

describe('ep52 唐朝烽火', () => {
  it('卡点：两个爆点和开场强拍落在 bgm-1021 实测时间上（±2 帧）', () => {
    expect(Math.abs(HIT - 17.08 * FPS)).toBeLessThanOrEqual(2);
    expect(Math.abs(HIT2 - 93.63 * FPS)).toBeLessThanOrEqual(2);
    OPEN_HITS.forEach((b) => expect(Math.abs(fbt(b) - (0.06 + 0.53175 * b) * FPS)).toBeLessThanOrEqual(2));
    expect(DARK_FROM).toBeLessThan(HIT - 10);
    expect(DARK_FROM2).toBeLessThan(HIT2 - 10);
    expect(WAIT_BEATS.every((b) => b >= 160 && b < 172)).toBe(true);
  });
  it('片长约 137 秒', () => {
    expect(DURATION / FPS).toBeGreaterThan(136);
    expect(DURATION / FPS).toBeLessThan(138);
  });
  it('叙述：递增、≤ 24 字、话说一半以破折号结尾、锚词出现、每 15 秒内有一句「你猜」或悬念', () => {
    for (let i = 1; i < CUES.length; i++) expect(CUES[i][0]).toBeGreaterThan(CUES[i - 1][0]);
    CUES.forEach(([, text], i) => {
      expect(cueStart(i)).toBeLessThan(DURATION - FPS);
      if (text) expect(text.replace(/[【】〖〗〔〕\s]/g, '').length).toBeLessThanOrEqual(24);
    });
    HALF_BEATS.forEach((b) => {
      const cue = CUES.find(([beat]) => beat === b)!;
      expect(cue[1]).toMatch(/——$/);
      expect(cue[2]).toBe(true);
    });
    const hooks = CUES.filter(([, t]) => t === null || /你猜|——$/.test(t)).map(([b]) => fbt(b) / FPS);
    for (let i = 1; i < hooks.length; i++) expect(hooks[i] - hooks[i - 1]).toBeLessThanOrEqual(15.5);
    expect(hooks[0]).toBeLessThanOrEqual(15);
  });
  it('镜头首尾相接，爆点是镜头起点', () => {
    const list = Object.values(SHOTS);
    expect(list[0][0]).toBe(0);
    for (let i = 1; i < list.length; i++) expect(list[i][0]).toBe(list[i - 1][1]);
    expect(list[list.length - 1][1]).toBe(DURATION);
    expect(SHOTS.title[0]).toBe(HIT);
    expect(SHOTS.hit2[0]).toBe(HIT2);
  });
  it('片中数字和出处一致', () => {
    expect(LI_PER_BEACON).toBe(30);
    expect([CREW, CREW_WATCH]).toEqual([6, 5]);
    expect(TERM_YEARS).toBe(2);
    expect(TIERS).toEqual([50, 500, 500, 1000]);
    expect(DAY_LI).toBe(2000);
    expect(RELAY_COUNT).toBe(67);
    expect([LESS_YEARS, MORE_YEARS, BAN_LI]).toEqual([3, 1, 2]);
    expect(FLEE_DAYS).toBe(4); // 辛卯（第 28）→ 乙未（第 32）
    expect(28 % 10).toBe(8); // 辛 = 第 8 天干
    expect(28 % 12).toBe(4); // 卯 = 第 4 地支
    expect(32 % 10).toBe(2); // 乙
    expect(32 % 12).toBe(8); // 未
    expect(YEARS_SINCE).toBeGreaterThan(1200);
    const all = CUES.map(([, t]) => t ?? '').join('');
    ['三十里', '6 个人', '两年一换', '50 人', '500 人', '500 骑', '二千里', '67', '徒三年', '徒一年', '756', '4 天后', '1200 多年'].forEach((x) => expect(all).toContain(x));
  });
  it('音效在片长内，两个爆点和「绞」上有冲击，文件存在', () => {
    [HIT, HIT2, fbt(116)].forEach((t) => expect(SFX.some(([file, at]) => file.endsWith('impact.wav') && at === t)).toBe(true));
    for (const [file, at] of SFX) {
      expect(at).toBeGreaterThanOrEqual(0);
      expect(at).toBeLessThan(DURATION);
      if (existsSync('public/audio/ep52-tang-beacon/bgm.wav')) expect(existsSync(`public/${file}`)).toBe(true);
    }
  });
});
