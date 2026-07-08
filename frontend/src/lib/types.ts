export type ChecklistItem = {
  id: string;
  label: string;
  weight: number;
  order: number;
  isActive: boolean;
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
    type: 'add' | 'remove' | 'rename' | 'reorder' | 'weight-change';
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
