'use client';

import { getScoreLabel, getScorePercentage } from '@/lib/domain/scoring';
import { cn } from '@/lib/utils';

interface ScoreSummaryCardProps {
  score: number;
  maxScore?: number;
}

export function ScoreSummaryCard({ score, maxScore = 10 }: ScoreSummaryCardProps) {
  const pct = getScorePercentage(score, maxScore);
  const label = getScoreLabel(score);

  const getProgressColor = () => {
    if (score >= 8) return 'bg-brand';
    if (score >= 6) return 'bg-neutral-400';
    return 'bg-low';
  };

  const getTextColor = () => {
    if (score >= 8) return 'text-brand';
    if (score >= 6) return 'text-neutral-900';
    return 'text-low';
  };

  return (
    <div className="mx-4 mb-4 p-4 rounded-lg bg-white border border-neutral-100 shadow-sm">
      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">오늘의 점수</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={cn('text-4xl font-bold tabular-nums tracking-tight', getTextColor())}>{score}</span>
            <span className="text-lg text-neutral-300 font-medium">/ {maxScore}</span>
          </div>
        </div>
        <span className="text-sm text-neutral-500 mb-1">{label}</span>
      </div>
      <div className="relative h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getProgressColor())}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={maxScore}
          aria-label={`점수 ${score}점`}
        />
      </div>
    </div>
  );
}
