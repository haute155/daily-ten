import { InsightSummary } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, Flame, CalendarCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
  summary: InsightSummary;
  bestStreak: number;
  totalEntries: number;
}

export function StatsOverview({ summary, bestStreak, totalEntries }: StatsOverviewProps) {
  const TrendIcon =
    summary.averageTrend === 'up'
      ? TrendingUp
      : summary.averageTrend === 'down'
      ? TrendingDown
      : Minus;

  const trendColor =
    summary.averageTrend === 'up'
      ? 'text-brand'
      : summary.averageTrend === 'down'
      ? 'text-low'
      : 'text-neutral-400';

  const cards = [
    {
      icon: Star,
      iconColor: 'text-brand',
      bgColor: 'bg-brand/10',
      label: '이번 달 평균',
      value: summary.monthlyAverage.toFixed(1),
      unit: '점',
      sub: (
        <span className={cn('flex items-center gap-0.5 text-xs', trendColor)}>
          <TrendIcon size={11} aria-hidden="true" />
          {summary.monthlyImprovement > 0 ? '+' : ''}
          {summary.monthlyImprovement.toFixed(1)}
        </span>
      ),
    },
    {
      icon: Flame,
      iconColor: 'text-neutral-700',
      bgColor: 'bg-neutral-100',
      label: '현재 연속',
      value: summary.currentStreak,
      unit: '일',
      sub: <span className="text-xs text-neutral-400">베스트 {bestStreak}일</span>,
    },
    {
      icon: CalendarCheck,
      iconColor: 'text-brand',
      bgColor: 'bg-brand/10',
      label: '총 기록',
      value: totalEntries,
      unit: '일',
      sub: <span className="text-xs text-neutral-400">이번 주 {summary.weeklyAverage}점</span>,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      {cards.map(({ icon: Icon, iconColor, bgColor, label, value, unit, sub }) => (
        <div
          key={label}
          className="flex flex-col items-center p-3 rounded-lg bg-white border border-neutral-100 shadow-sm gap-1"
        >
          <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', bgColor)}>
            <Icon size={16} className={iconColor} aria-hidden="true" />
          </div>
          <div className="text-center">
            <span className="text-xs text-neutral-400">{label}</span>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-bold text-neutral-800 tabular-nums tracking-tight">{value}</span>
              <span className="text-xs text-neutral-400">{unit}</span>
            </div>
          </div>
          {sub}
        </div>
      ))}
    </div>
  );
}
