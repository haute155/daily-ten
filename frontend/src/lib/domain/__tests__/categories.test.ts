import { describe, it, expect } from 'vitest';
import { suggestCategory, getCategoryLabel } from '@/lib/domain/categories';
import { computeVersionDiff } from '@/lib/domain/versioning';
import { makeItem, makeVersion } from './helpers';

describe('suggestCategory', () => {
  it('키워드로 카테고리를 제안한다', () => {
    expect(suggestCategory('아침 헬스')).toBe('exercise');
    expect(suggestCategory('11시 취침')).toBe('sleep');
    expect(suggestCategory('독서 30분')).toBe('learning');
    expect(suggestCategory('저녁 명상')).toBe('healing');
    expect(suggestCategory('영양제 챙겨먹기')).toBe('diet');
    expect(suggestCategory('이메일 정리')).toBe('work');
  });

  it('매칭이 없으면 undefined (미분류 유지)', () => {
    expect(suggestCategory('강아지 산책 말고 그냥')).toBe('exercise'); // 산책 매칭
    expect(suggestCategory('asdf')).toBeUndefined();
    expect(suggestCategory('')).toBeUndefined();
  });
});

describe('getCategoryLabel', () => {
  it('키를 한국어 라벨로, 미지정은 미분류로', () => {
    expect(getCategoryLabel('healing')).toBe('힐링');
    expect(getCategoryLabel('work')).toBe('업무');
    expect(getCategoryLabel(undefined)).toBe('미분류');
  });
});

describe('computeVersionDiff — 카테고리 변경', () => {
  it('카테고리 변경을 감지하고 한국어 설명을 만든다', () => {
    const prev = makeVersion({
      items: [makeItem({ id: 'a', label: '운동', weight: 10, order: 0, category: undefined })],
    });
    const next = makeVersion({
      id: 'v2',
      versionNumber: 2,
      items: [makeItem({ id: 'a', label: '운동', weight: 10, order: 0, category: 'exercise' })],
    });
    const diff = computeVersionDiff(prev, next);
    const change = diff.changes.find(c => c.type === 'category-change');
    expect(change).toBeDefined();
    expect(change!.description).toContain('미분류 → 운동');
  });
});
