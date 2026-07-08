import { CategoryKey, CustomCategory } from '@/lib/types';

/**
 * 가입 시 시드되는 기본 카테고리 정의.
 * 카테고리는 전부 사용자 소유(DB 행)이며 자유롭게 수정·삭제할 수 있다 —
 * 이 상수는 옛 데이터(키 저장 방식)의 폴백 해석에만 쓰인다.
 */
export const CATEGORIES: Array<{ key: CategoryKey; label: string }> = [
  { key: 'exercise', label: '운동' },
  { key: 'sleep', label: '수면' },
  { key: 'learning', label: '학습' },
  { key: 'healing', label: '힐링' },
  { key: 'diet', label: '식습관' },
  { key: 'work', label: '업무' },
];

export const CATEGORY_LABELS: Record<CategoryKey, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.label])
) as Record<CategoryKey, string>;

export const UNCATEGORIZED_LABEL = '미분류';

/** 커스텀 id → 라벨, (레거시) 기본 키 → 기본 라벨, 그 외(삭제된 것 포함) → 미분류 */
export function getCategoryLabel(category?: string, customCategories?: CustomCategory[]): string {
  if (!category) return UNCATEGORIZED_LABEL;
  const custom = customCategories?.find(c => c.id === category);
  if (custom) return custom.label;
  if (category in CATEGORY_LABELS) return CATEGORY_LABELS[category as CategoryKey];
  return UNCATEGORIZED_LABEL;
}
