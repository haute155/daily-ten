import dayjs from 'dayjs';
import { ChecklistItem, ChecklistVersion, VersionDiff } from '@/lib/types';

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
