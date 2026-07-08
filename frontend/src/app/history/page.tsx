'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useHistory } from '@/hooks/useHistory';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppGate } from '@/components/shared/AppGate';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { Button } from '@/components/ui/button';
import { Check, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

dayjs.locale('ko');

export default function HistoryPage() {
  return (
    <AppGate>
      <HistoryPageContent />
    </AppGate>
  );
}

function HistoryPageContent() {
  const router = useRouter();
  const {
    currentMonth,
    daysInMonth,
    entryMap,
    versionChangeDates,
    prevMonth,
    nextMonth,
    versions,
  } = useHistory();

  const today = dayjs().format('YYYY-MM-DD');
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const selectedEntry = entryMap.get(selectedDate) ?? null;
  const selectedVersion = selectedEntry
    ? versions.find(v => v.id === selectedEntry.checklistVersionId) ?? null
    : null;

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
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        onPrev={prevMonth}
        onNext={nextMonth}
      />

      {/* 선택한 날짜 미리보기 */}
      <div className="mx-4 mt-5 mb-4 p-4 rounded-lg bg-white border border-neutral-200">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-neutral-900">
              {dayjs(selectedDate).format('M월 D일 dddd')}
            </p>
            {selectedVersion && (
              <p className="text-xs text-neutral-400 mt-0.5">
                레시피 v{selectedVersion.versionNumber}
              </p>
            )}
          </div>
          {selectedEntry && <ScoreBadge score={selectedEntry.score} size="lg" />}
        </div>

        {selectedEntry && selectedVersion ? (
          <>
            {/* 항목별 체크 현황 */}
            <ul className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-neutral-100">
              {selectedVersion.items
                .filter(item => item.isActive)
                .map(item => {
                  const checked = selectedEntry.checkedItemIds.includes(item.id);
                  return (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          'w-4 h-4 rounded-[3px] border-2 flex items-center justify-center flex-shrink-0',
                          checked ? 'bg-success border-success' : 'bg-white border-neutral-300'
                        )}
                        aria-hidden="true"
                      >
                        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                      </span>
                      <span className={checked ? 'text-neutral-800' : 'text-neutral-400'}>
                        {item.label}
                      </span>
                      <span className="ml-auto text-xs tabular-nums text-neutral-400">
                        +{item.weight}
                      </span>
                    </li>
                  );
                })}
            </ul>

            {/* 메모 */}
            {selectedEntry.note && (
              <p className="mt-3 px-3 py-2 rounded-md bg-neutral-50 text-sm text-neutral-600">
                {selectedEntry.note}
              </p>
            )}

            <Button
              variant="outline"
              className="w-full h-10 mt-3 rounded-md text-sm"
              onClick={() => router.push(`/history/${selectedDate}?edit=1`)}
            >
              <Pencil size={13} className="mr-1.5" aria-hidden="true" />
              수정하기
            </Button>
          </>
        ) : (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <p className="text-sm text-neutral-400">이 날은 기록이 없어요.</p>
            {selectedDate === today && (
              <Button
                className="w-full h-10 mt-3 rounded-md bg-neutral-900 hover:bg-neutral-700 text-white text-sm"
                onClick={() => router.push('/today')}
              >
                오늘 기록하러 가기
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
