import { describe, it, expect } from 'vitest';
import { calculateScore, getScorePercentage } from '@/lib/domain/scoring';
import { makeItem, makeVersion } from './helpers';

describe('calculateScore', () => {
  it('체크된 활성 항목의 가중치를 합산한다', () => {
    const version = makeVersion();
    expect(calculateScore(['item-1', 'item-3'], version)).toBe(7);
  });

  it('아무것도 체크하지 않으면 0점이다', () => {
    expect(calculateScore([], makeVersion())).toBe(0);
  });

  it('비활성 항목은 체크되어도 점수에 포함하지 않는다', () => {
    const version = makeVersion({
      items: [
        makeItem({ id: 'item-1', weight: 3, isActive: true }),
        makeItem({ id: 'item-2', weight: 7, isActive: false }),
      ],
    });
    expect(calculateScore(['item-1', 'item-2'], version)).toBe(3);
  });

  it('버전에 없는 항목 id는 무시한다 (다른 버전의 체크 id가 섞여도 안전)', () => {
    expect(calculateScore(['item-1', 'ghost-item'], makeVersion())).toBe(3);
  });
});

describe('getScorePercentage', () => {
  it('10점 만점 기준 백분율을 계산한다', () => {
    expect(getScorePercentage(7)).toBe(70);
  });

  it('만점이 0이어도 0을 반환한다', () => {
    expect(getScorePercentage(5, 0)).toBe(0);
  });
});
