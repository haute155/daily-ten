import dayjs from 'dayjs';
import { ChecklistItem, ChecklistVersion, VersionDiff } from '@/lib/types';
import { getCategoryLabel } from './categories';

/**
 * 항목 identity 보호: 새로 만들어진 항목의 이름이 과거 버전에 존재했던 항목과 같으면
 * 그 항목의 id를 재사용한다. "삭제 후 같은 이름으로 재생성"해도 항목별 통계(달성률,
 * 기여도)가 끊기지 않고 이어지게 하기 위함이다. 가장 최근 버전의 항목을 우선한다.
 */
export function reconcileItemIds(
  items: ChecklistItem[],
  versions: ChecklistVersion[]
): ChecklistItem[] {
  // 최신 버전부터 훑어 label → 과거 항목 매핑 (가장 최근 것 우선)
  const historicalByLabel = new Map<string, ChecklistItem>();
  for (const version of [...versions].sort((a, b) => b.versionNumber - a.versionNumber)) {
    for (const item of version.items) {
      const key = item.label.trim();
      if (!historicalByLabel.has(key)) historicalByLabel.set(key, item);
    }
  }

  const usedIds = new Set(items.map(i => i.id));

  return items.map(item => {
    // 편집 중 새로 추가된 항목만 대상 (id 패턴: item-<timestamp>)
    if (!/^item-\d+$/.test(item.id)) return item;

    const historical = historicalByLabel.get(item.label.trim());
    if (!historical || usedIds.has(historical.id)) return item;

    usedIds.delete(item.id);
    usedIds.add(historical.id);
    return { ...item, id: historical.id, createdAt: historical.createdAt };
  });
}

/** 해당 날짜에 적용되는 버전. effectiveFrom이 지난 버전 중 가장 최신 버전을 고른다. */
export function resolveActiveVersion(
  versions: ChecklistVersion[],
  date: string
): ChecklistVersion | null {
  const candidates = versions.filter(v => v.effectiveFrom <= date);
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (b.versionNumber > a.versionNumber ? b : a));
}

/** 가장 최근에 만들어진 버전. 내일부터 적용 예정인 버전도 포함한다 (설정 편집 기준). */
export function resolveLatestVersion(versions: ChecklistVersion[]): ChecklistVersion | null {
  if (versions.length === 0) return null;
  return versions.reduce((a, b) => (b.versionNumber > a.versionNumber ? b : a));
}

export function computeVersionDiff(
  prev: ChecklistVersion | null,
  next: ChecklistVersion
): VersionDiff {
  const changes: VersionDiff['changes'] = [];

  if (!prev) {
    return {
      id: `diff-init-${next.id}`,
      versionId: next.id,
      previousVersionId: null,
      changes: [{ type: 'add', description: '초기 버전 생성' }],
    };
  }

  const prevItemMap = new Map(prev.items.map(item => [item.id, item]));
  const nextItemMap = new Map(next.items.map(item => [item.id, item]));

  // Check removed items
  for (const [id, item] of prevItemMap) {
    if (!nextItemMap.has(id)) {
      changes.push({
        type: 'remove',
        itemId: id,
        description: `"${item.label}" 항목 제거`,
      });
    }
  }

  // Check added items and changed items
  for (const [id, item] of nextItemMap) {
    if (!prevItemMap.has(id)) {
      changes.push({
        type: 'add',
        itemId: id,
        description: `"${item.label}" 항목 추가 (${item.weight}점)`,
      });
    } else {
      const prevItem = prevItemMap.get(id)!;

      if (prevItem.label !== item.label) {
        changes.push({
          type: 'rename',
          itemId: id,
          before: prevItem.label,
          after: item.label,
          description: `"${prevItem.label}" → "${item.label}" 이름 변경`,
        });
      }

      if (prevItem.weight !== item.weight) {
        changes.push({
          type: 'weight-change',
          itemId: id,
          before: prevItem.weight,
          after: item.weight,
          description: `"${item.label}" 가중치 ${prevItem.weight}점 → ${item.weight}점`,
        });
      }

      if (prevItem.order !== item.order) {
        changes.push({
          type: 'reorder',
          itemId: id,
          before: prevItem.order,
          after: item.order,
          description: `"${item.label}" 순서 변경`,
        });
      }

      if ((prevItem.category ?? null) !== (item.category ?? null)) {
        changes.push({
          type: 'category-change',
          itemId: id,
          before: prevItem.category,
          after: item.category,
          description: `"${item.label}" 카테고리 ${getCategoryLabel(prevItem.category)} → ${getCategoryLabel(item.category)}`,
        });
      }
    }
  }

  return {
    id: `diff-${prev.id}-${next.id}`,
    versionId: next.id,
    previousVersionId: prev.id,
    changes,
  };
}

export function createNewVersion(
  current: ChecklistVersion | null,
  newItems: ChecklistItem[],
  effectiveFrom: string = dayjs().format('YYYY-MM-DD')
): { version: ChecklistVersion; diff: VersionDiff } {
  const nextNumber = (current?.versionNumber ?? 0) + 1;
  const newVersionId = `version-${nextNumber}-${Date.now()}`;

  const newVersion: ChecklistVersion = {
    id: newVersionId,
    versionNumber: nextNumber,
    title: `v${nextNumber} 루틴`,
    items: newItems.map((item, idx) => ({ ...item, order: idx })),
    totalScore: newItems.reduce((sum, item) => sum + item.weight, 0),
    changeSummary: '',
    effectiveFrom,
    effectiveTo: null,
    createdAt: new Date().toISOString(),
  };

  const diff = computeVersionDiff(current, newVersion);

  // Build summary from diff
  const summaryParts = diff.changes.map(c => c.description);
  newVersion.changeSummary = summaryParts.join(', ') || '변경 없음';

  return { version: newVersion, diff };
}
