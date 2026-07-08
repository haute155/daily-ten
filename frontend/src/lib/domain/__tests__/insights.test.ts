import { describe, it, expect } from 'vitest';
import { getCurrentStreak, getHighScoreStreak, HIGH_SCORE_THRESHOLD } from '@/lib/domain/insights';
import { makeEntry } from './helpers';

describe('getCurrentStreak', () => {
  const entries = [
    makeEntry({ date: '2026-07-04' }),
    makeEntry({ date: '2026-07-05' }),
    makeEntry({ date: '2026-07-06' }),
  ];

  it('기준일에 기록이 있으면 기준일부터 역산한다', () => {
    expect(getCurrentStreak([...entries, makeEntry({ date: '2026-07-07' })], '2026-07-07')).toBe(4);
  });

  it('기준일에 아직 기록이 없으면 어제부터 역산한다 (하루 중 스트릭 유지)', () => {
    expect(getCurrentStreak(entries, '2026-07-07')).toBe(3);
  });

  it('이틀 이상 비면 스트릭이 끊긴다', () => {
    expect(getCurrentStreak(entries, '2026-07-09')).toBe(0);
  });

  it('기록이 없으면 0이다', () => {
    expect(getCurrentStreak([], '2026-07-07')).toBe(0);
  });
});

describe('getHighScoreStreak', () => {
  it('기준 점수 이상인 날만 연속으로 센다', () => {
    const entries = [
      makeEntry({ date: '2026-07-04', score: 5 }),
      makeEntry({ date: '2026-07-05', score: 9 }),
      makeEntry({ date: '2026-07-06', score: 8 }),
    ];
    expect(getHighScoreStreak(entries, HIGH_SCORE_THRESHOLD, '2026-07-06')).toBe(2);
  });

  it('기준일 미기록 시 어제부터 역산한다', () => {
    const entries = [
      makeEntry({ date: '2026-07-05', score: 10 }),
      makeEntry({ date: '2026-07-06', score: 9 }),
    ];
    expect(getHighScoreStreak(entries, HIGH_SCORE_THRESHOLD, '2026-07-07')).toBe(2);
  });

  it('기준 점수 미만을 만나면 멈춘다', () => {
    const entries = [
      makeEntry({ date: '2026-07-06', score: 3 }),
    ];
    expect(getHighScoreStreak(entries, HIGH_SCORE_THRESHOLD, '2026-07-06')).toBe(0);
  });
});
