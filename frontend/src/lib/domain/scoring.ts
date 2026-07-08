import { ChecklistVersion } from '@/lib/types';

export function calculateScore(checkedItemIds: string[], version: ChecklistVersion): number {
  return version.items
    .filter(item => item.isActive && checkedItemIds.includes(item.id))
    .reduce((total, item) => total + item.weight, 0);
}

export function getScorePercentage(score: number, maxScore = 10): number {
  if (maxScore === 0) return 0;
  return Math.min(100, Math.round((score / maxScore) * 100));
}

/**
 * 점수 상태 색 — 브랜드 규칙 (PRD: 기준 이상 파랑 / 미만 빨강):
 * high(≥8) = brand(#007fff), mid(6~7) = 무채색, low(<6) = red(--color-low)
 */
export function getScoreColor(score: number): string {
  if (score >= 8) return 'brand';
  if (score >= 6) return 'neutral';
  return 'low';
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return '완벽한 하루!';
  if (score >= 8) return '훌륭해요';
  if (score >= 6) return '괜찮아요';
  if (score >= 4) return '조금 더 분발해요';
  return '내일 다시 도전!';
}

export function getScoreTailwindColor(score: number): string {
  if (score >= 8) return 'text-brand';
  if (score >= 6) return 'text-neutral-900';
  return 'text-low';
}

export function getScoreBgColor(score: number): string {
  if (score >= 8) return 'bg-brand/5 border-brand/20';
  if (score >= 6) return 'bg-neutral-50 border-neutral-200';
  return 'bg-low/5 border-low/20';
}
