'use client';

import { useHistory } from '@/hooks/useHistory';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppGate } from '@/components/shared/AppGate';

export default function HistoryPage() {
  return (
    <AppGate>
      <HistoryPageContent />
    </AppGate>
  );
}

function HistoryPageContent() {
  const {
    currentMonth,
    daysInMonth,
    entryMap,
    versionChangeDates,
    prevMonth,
    nextMonth,
  } = useHistory();

  return (
    <div className="flex flex-col">
      <PageHeader
        title="기록"
        subtitle="하루하루의 점수를 확인하세요"
      />
      <HistoryCalendar
        currentMonth={currentMonth}
        daysInMonth={daysInMonth}
        entryMap={entryMap}
        versionChangeDates={versionChangeDates}
        onPrev={prevMonth}
        onNext={nextMonth}
      />
    </div>
  );
}
