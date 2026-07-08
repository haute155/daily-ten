'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useAppStore } from '@/store/appStore';
import { useToday } from '@/hooks/useToday';
import { DailyCheckForm } from '@/components/today/DailyCheckForm';
import { ScoreSummaryCard } from '@/components/today/ScoreSummaryCard';
import { InsightBanner } from '@/components/today/InsightBanner';
import { getGreeting } from '@/lib/domain/insights';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { AppGate } from '@/components/shared/AppGate';

dayjs.locale('ko');

export default function TodayPage() {
  return (
    <AppGate>
      <TodayPageContent />
    </AppGate>
  );
}

function TodayPageContent() {
  const entries = useAppStore(s => s.entries);

  const {
    version,
    checkedItemIds,
    note,
    currentScore,
    saveState,
    toggleItem,
    handleNoteChange,
  } = useToday();

  const greeting = getGreeting();
  const today = dayjs().format('M월 D일 dddd');

  if (!version) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 pt-24 pb-4 text-center">
        <Settings size={32} className="text-neutral-300" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-bold text-neutral-900">아직 텐 레시피가 없어요</h1>
          <p className="text-sm text-neutral-500 mt-1">
            나만의 점수 시스템을 먼저 설계해 주세요. 항목과 가중치의 합이 10점이 되면 시작할 수 있어요.
          </p>
        </div>
        <Link
          href="/settings"
          className="h-12 px-6 inline-flex items-center rounded-md bg-neutral-900 hover:bg-neutral-700 text-white text-base font-semibold"
        >
          텐 레시피 만들기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-6 pb-4">
      {/* Header */}
      <div className="px-4 mb-4">
        <p className="text-sm text-neutral-400">{greeting}</p>
        <h1 className="text-2xl font-black text-neutral-900 mt-0.5 tracking-tight">{today}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-sm">
            레시피 v{version.versionNumber}
          </span>
        </div>
      </div>

      {/* Insight banner */}
      <InsightBanner entries={entries} />

      {/* Score card */}
      <ScoreSummaryCard score={currentScore} maxScore={version.totalScore} />

      {/* Checklist */}
      <DailyCheckForm
        version={version}
        checkedItemIds={checkedItemIds}
        note={note}
        saveState={saveState}
        onToggle={toggleItem}
        onNoteChange={handleNoteChange}
      />
    </div>
  );
}
