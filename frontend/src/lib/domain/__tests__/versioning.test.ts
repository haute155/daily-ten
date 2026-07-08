import { describe, it, expect } from 'vitest';
import {
  computeVersionDiff,
  createNewVersion,
  resolveActiveVersion,
  resolveLatestVersion,
} from '@/lib/domain/versioning';
import { makeItem, makeVersion } from './helpers';

describe('computeVersionDiff', () => {
  it('이전 버전이 없으면 초기 버전 생성으로 기록한다', () => {
    const diff = computeVersionDiff(null, makeVersion());
    expect(diff.previousVersionId).toBeNull();
    expect(diff.changes).toHaveLength(1);
    expect(diff.changes[0].type).toBe('add');
  });

  it('추가/삭제/이름변경/가중치변경/순서변경을 모두 감지한다', () => {
    const prev = makeVersion({
      items: [
        makeItem({ id: 'a', label: '운동', weight: 3, order: 0 }),
        makeItem({ id: 'b', label: '독서', weight: 3, order: 1 }),
        makeItem({ id: 'c', label: '수면', weight: 4, order: 2 }),
      ],
    });
    const next = makeVersion({
      id: 'version-2',
      versionNumber: 2,
      items: [
        makeItem({ id: 'a', label: '아침 운동', weight: 4, order: 1 }), // rename + weight + reorder
        makeItem({ id: 'c', label: '수면', weight: 4, order: 0 }), // reorder
        makeItem({ id: 'd', label: '명상', weight: 2, order: 2 }), // add
        // b 삭제
      ],
    });

    const types = computeVersionDiff(prev, next).changes.map(c => c.type);
    expect(types).toContain('remove');
    expect(types).toContain('add');
    expect(types).toContain('rename');
    expect(types).toContain('weight-change');
    expect(types).toContain('reorder');
  });
});

describe('createNewVersion', () => {
  it('버전 번호를 증가시키고 지정한 적용일을 사용한다', () => {
    const current = makeVersion();
    const { version } = createNewVersion(current, current.items, '2026-07-08');
    expect(version.versionNumber).toBe(2);
    expect(version.effectiveFrom).toBe('2026-07-08');
    expect(version.effectiveTo).toBeNull();
  });

  it('이전 버전이 없으면 v1을 만든다 (첫 사용)', () => {
    const { version, diff } = createNewVersion(null, [makeItem()], '2026-07-07');
    expect(version.versionNumber).toBe(1);
    expect(diff.previousVersionId).toBeNull();
  });

  it('diff로부터 changeSummary를 만든다', () => {
    const current = makeVersion();
    const newItems = current.items.map(i =>
      i.id === 'item-1' ? { ...i, weight: 4 } : i.id === 'item-3' ? { ...i, weight: 3 } : i
    );
    const { version } = createNewVersion(current, newItems, '2026-07-08');
    expect(version.changeSummary).toContain('가중치');
  });
});

describe('resolveActiveVersion', () => {
  const v1 = makeVersion({ id: 'v1', versionNumber: 1, effectiveFrom: '2026-01-01', effectiveTo: '2026-07-07' });
  const v2 = makeVersion({ id: 'v2', versionNumber: 2, effectiveFrom: '2026-07-08' });

  it('내일부터 적용되는 버전은 오늘의 활성 버전이 아니다', () => {
    expect(resolveActiveVersion([v1, v2], '2026-07-07')?.id).toBe('v1');
  });

  it('적용일이 되면 새 버전이 활성이 된다', () => {
    expect(resolveActiveVersion([v1, v2], '2026-07-08')?.id).toBe('v2');
  });

  it('버전이 없으면 null을 반환한다', () => {
    expect(resolveActiveVersion([], '2026-07-07')).toBeNull();
  });
});

describe('resolveLatestVersion', () => {
  it('적용 예정 버전을 포함해 가장 최신 버전을 반환한다', () => {
    const v1 = makeVersion({ id: 'v1', versionNumber: 1 });
    const v2 = makeVersion({ id: 'v2', versionNumber: 2, effectiveFrom: '2099-01-01' });
    expect(resolveLatestVersion([v1, v2])?.id).toBe('v2');
    expect(resolveLatestVersion([])).toBeNull();
  });
});
