import { ChecklistItem, ChecklistVersion, DailyEntry } from '@/lib/types';

export function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: 'item-1',
    label: '운동',
    weight: 3,
    order: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function makeVersion(overrides: Partial<ChecklistVersion> = {}): ChecklistVersion {
  const items = overrides.items ?? [
    makeItem({ id: 'item-1', label: '운동', weight: 3, order: 0 }),
    makeItem({ id: 'item-2', label: '독서', weight: 3, order: 1 }),
    makeItem({ id: 'item-3', label: '수면', weight: 4, order: 2 }),
  ];
  return {
    id: 'version-1',
    versionNumber: 1,
    title: 'v1 루틴',
    totalScore: items.reduce((sum, i) => sum + i.weight, 0),
    changeSummary: '',
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
    items,
  };
}

export function makeEntry(overrides: Partial<DailyEntry> = {}): DailyEntry {
  return {
    id: `entry-${overrides.date ?? '2026-01-01'}`,
    date: '2026-01-01',
    checklistVersionId: 'version-1',
    checkedItemIds: [],
    score: 0,
    note: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
