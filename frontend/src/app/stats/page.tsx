'use client';

import { useStats } from '@/hooks/useStats';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { TrendChart, WeeklyBarChart, ItemFrequencyChart } from '@/components/stats/TrendChart';
import { VersionComparisonCard } from '@/components/stats/VersionComparisonCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Separator } from '@/components/ui/separator';
import { AppGate } from '@/components/shared/AppGate';
import { Lightbulb, Share2 } from 'lucide-react';

const mockRecommendations = [
  {
    emoji: '💪',
    title: '운동이 점수를 주도하고 있어요',
    desc: '최근 30일 운동 달성률 87%. 운동이 가장 일관된 습관입니다.',
  },
  {
    emoji: '📚',
    title: '독서 달성률이 낮아지고 있어요',
    desc: '지난주 독서 달성률 43%. 취침 전 10분 독서를 루틴에 추가해보세요.',
  },
  {
    emoji: '🌙',
    title: '수면 점수가 주말에 떨어져요',
    desc: '주말 수면 달성률 평일 대비 -30%. 수면 일관성을 유지해보세요.',
  },
];

export default function StatsPage() {
  return (
    <AppGate>
      <StatsPageContent />
    </AppGate>
  );
}

function StatsPageContent() {
  const {
    summary,
    last30Days,
    weeklyAverages,
    itemFrequency,
    versionStats,
    bestStreak,
    totalEntries,
  } = useStats();

  return (
    <div className="flex flex-col">
      <PageHeader title="통계" subtitle="데이터로 나를 파악하세요" />

      {/* Overview cards */}
      <StatsOverview
        summary={summary}
        bestStreak={bestStreak}
        totalEntries={totalEntries}
      />

      {/* 30-day trend */}
      <section className="mt-5 px-4">
        <h2 className="text-sm font-semibold text-neutral-600 mb-3">최근 30일 점수 추이</h2>
        <div className="p-4 rounded-lg bg-white border border-neutral-100 shadow-sm">
          <TrendChart data={last30Days} />
        </div>
      </section>

      {/* Weekly averages */}
      <section className="mt-4 px-4">
        <h2 className="text-sm font-semibold text-neutral-600 mb-3">주간 평균 점수</h2>
        <div className="p-4 rounded-lg bg-white border border-neutral-100 shadow-sm">
          <WeeklyBarChart data={weeklyAverages} />
        </div>
      </section>

      {/* Item frequency */}
      {itemFrequency.length > 0 && (
        <section className="mt-4 px-4">
          <h2 className="text-sm font-semibold text-neutral-600 mb-3">항목별 달성률 (최근 30일)</h2>
          <div className="p-4 rounded-lg bg-white border border-neutral-100 shadow-sm">
            <ItemFrequencyChart data={itemFrequency} />
          </div>
        </section>
      )}

      <Separator className="mx-4 my-5" />

      {/* Version comparison */}
      <section>
        <div className="px-4 mb-3">
          <h2 className="text-sm font-semibold text-neutral-600">버전별 성과 비교</h2>
        </div>
        <VersionComparisonCard versionStats={versionStats} />
      </section>

      <Separator className="mx-4 my-5" />

      {/* AI recommendations (mock) */}
      <section className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-neutral-500" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-neutral-600">AI 인사이트</h2>
          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-sm font-medium">베타</span>
        </div>
        <div className="flex flex-col gap-3">
          {mockRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-lg bg-white border border-neutral-100 shadow-sm"
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">{rec.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-neutral-800">{rec.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Share placeholder */}
      <section className="px-4 mt-4 mb-4">
        <button
          className="w-full flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-brand/30 hover:text-brand transition-colors text-sm font-medium"
          aria-label="기록 공유하기 (준비 중)"
          onClick={() => {}}
        >
          <Share2 size={16} aria-hidden="true" />
          기록 공유하기 (준비 중)
        </button>
      </section>
    </div>
  );
}
