/** 기본 카테고리 키 — 코드에 고정된 6종. 자동 분류·공통 통계의 기준 */
export type CategoryKey = 'exercise' | 'sleep' | 'learning' | 'healing' | 'diet' | 'work';

/** 사용자 정의 카테고리 — 기본 6종 외에 사용자가 직접 추가한 분류 */
export type CustomCategory = {
  id: string;
  label: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  weight: number;
  order: number;
  isActive: boolean;
  /** 기본 카테고리 키(CategoryKey) 또는 커스텀 카테고리 id. 미지정 = 미분류 */
  category?: string;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistVersion = {
  id: string;
  versionNumber: number;
  title: string;
  items: ChecklistItem[];
  totalScore: number;
  changeSummary: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
};

export type DailyEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  checklistVersionId: string;
  checkedItemIds: string[];
  score: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type VersionDiff = {
  id: string;
  versionId: string;
  previousVersionId: string | null;
  changes: Array<{
    type: 'add' | 'remove' | 'rename' | 'reorder' | 'weight-change' | 'category-change';
    itemId?: string;
    before?: string | number;
    after?: string | number;
    description: string;
  }>;
};

export type InsightSummary = {
  currentStreak: number;
  highScoreStreak: number;
  weeklyAverage: number;
  monthlyAverage: number;
  averageTrend: 'up' | 'down' | 'flat';
  monthlyImprovement: number;
};
