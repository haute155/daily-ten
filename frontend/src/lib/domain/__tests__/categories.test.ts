import { describe, it, expect } from 'vitest';
import { suggestCategory, getCategoryLabel } from '@/lib/domain/categories';
import { reconcileItemIds, computeVersionDiff } from '@/lib/domain/versioning';
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

describe('reconcileItemIds (identity 보호)', () => {
  const v1 = makeVersion({
    id: 'v1',
    versionNumber: 1,
    items: [
      makeItem({ id: 'old-exercise', label: '운동', weight: 5, order: 0 }),
      makeItem({ id: 'old-reading', label: '독서', weight: 5, order: 1 }),
    ],
  });

  it('삭제 후 같은 이름으로 재생성된 항목은 과거 id를 이어받는다', () => {
    const items = [
      makeItem({ id: 'item-1700000000000', label: '운동', weight: 5, order: 0 }), // 재생성
      makeItem({ id: 'old-reading', label: '독서', weight: 5, order: 1 }),
    ];
    const result = reconcileItemIds(items, [v1]);
    expect(result[0].id).toBe('old-exercise');
  });

  it('기존 id를 가진 항목은 건드리지 않는다', () => {
    const items = [makeItem({ id: 'old-exercise', label: '완전히 새 이름', weight: 10, order: 0 })];
    const result = reconcileItemIds(items, [v1]);
    expect(result[0].id).toBe('old-exercise');
  });

  it('같은 라벨이 현재 목록에 이미 있으면 중복 id를 만들지 않는다', () => {
    const items = [
      makeItem({ id: 'old-exercise', label: '운동', weight: 5, order: 0 }),
      makeItem({ id: 'item-1700000000001', label: '운동', weight: 5, order: 1 }),
    ];
    const result = reconcileItemIds(items, [v1]);
    expect(result[1].id).toBe('item-1700000000001'); // old-exercise는 이미 사용 중
  });

  it('여러 버전 중 가장 최근 버전의 항목을 우선한다', () => {
    const v2 = makeVersion({
      id: 'v2',
      versionNumber: 2,
      items: [makeItem({ id: 'newer-exercise', label: '운동', weight: 10, order: 0 })],
    });
    const items = [makeItem({ id: 'item-1700000000002', label: '운동', weight: 10, order: 0 })];
    const result = reconcileItemIds(items, [v1, v2]);
    expect(result[0].id).toBe('newer-exercise');
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
