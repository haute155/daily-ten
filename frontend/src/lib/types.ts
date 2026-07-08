/** 항목 카테고리 — 분석(카테고리별 기여도)을 위한 통제된 분류. 미지정 = 미분류 */
export type CategoryKey = 'exercise' | 'sleep' | 'learning' | 'healing' | 'diet' | 'work';

export type ChecklistItem = {
  id: string;
  label: string;
  weight: number;
  order: number;
  isActive: boolean;
  category?: CategoryKey;
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
