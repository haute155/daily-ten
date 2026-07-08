import { describe, it, expect } from 'vitest';
import { getCategoryLabel } from '@/lib/domain/categories';
import { computeVersionDiff } from '@/lib/domain/versioning';
import { makeItem, makeVersion } from './helpers';

describe('getCategoryLabel', () => {
  it('키를 한국어 라벨로, 미지정은 미분류로', () => {
    expect(getCategoryLabel('healing')).toBe('힐링');
    expect(getCategoryLabel('work')).toBe('업무');
    expect(getCategoryLabel(undefined)).toBe('미분류');
  });

  it('커스텀 카테고리 id를 라벨로 해석한다', () => {
    const custom = [{ id: 'cat-1', label: '사이드잡' }];
    expect(getCategoryLabel('cat-1', custom)).toBe('사이드잡');
  });

  it('삭제된(목록에 없는) 커스텀 id는 미분류로 처리한다', () => {
    expect(getCategoryLabel('deleted-cat-id', [])).toBe('미분류');
    expect(getCategoryLabel('deleted-cat-id')).toBe('미분류');
  });

  it('사용자 카테고리가 레거시 기본 키 폴백보다 우선한다', () => {
    const custom = [{ id: 'exercise', label: '내가 바꾼 이름' }];
    expect(getCategoryLabel('exercise', custom)).toBe('내가 바꾼 이름');
  });

  it('레거시 기본 키는 사용자 목록에 없으면 상수 라벨로 폴백한다', () => {
    expect(getCategoryLabel('exercise', [])).toBe('운동');
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
