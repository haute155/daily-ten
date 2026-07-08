'use client';

import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface HistoryCalendarProps {
  currentMonth: dayjs.Dayjs;
  daysInMonth: (string | null)[];
  entryMap: Map<string, DailyEntry>;
  versionChangeDates: Set<string>;
  onPrev: () => void;
  onNext: () => void;
}

function getScoreStyle(score: number): string {
  if (score >= 8) return 'bg-brand/10 text-brand font-semibold';
  if (score >= 6) return 'bg-neutral-100 text-neutral-700';
  return 'bg-low/10 text-low';
}

export function HistoryCalendar({
  currentMonth,
  daysInMonth,
  entryMap,
  versionChangeDates,
  onPrev,
  onNext,
}: HistoryCalendarProps) {
  const router = useRouter();
  const today = dayjs().format('YYYY-MM-DD');

  const handleDayClick = (date: string) => {
    const entry = entryMap.get(date);
    if (entry || dayjs(date).isBefore(dayjs().add(1, 'day'))) {
      router.push(`/history/${date}`);
    }
  };

  return (
    <div className="mx-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrev}
          className="w-9 h-9 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-bold text-neutral-800 tracking-tight">
          {currentMonth.format('YYYY년 M월')}
        </h2>
        <button
          onClick={onNext}
          disabled={currentMonth.isSame(dayjs(), 'month')}
          className="w-9 h-9 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="다음 달"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2" role="row">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-neutral-400 py-1"
            role="columnheader"
            aria-label={day + '요일'}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={currentMonth.format('YYYY년 M월') + ' 달력'}>
        {daysInMonth.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} role="gridcell" aria-label="빈 날" />;
          }

          const entry = entryMap.get(date);
          const isToday = date === today;
          const isFuture = dayjs(date).isAfter(dayjs(), 'day');
          const hasVersionChange = versionChangeDates.has(date);
          const dayNum = dayjs(date).date();

          return (
            <button
              key={date}
              role="gridcell"
              aria-label={`${dayjs(date).format('M월 D일')}${entry ? ` - ${entry.score}점` : ' - 기록 없음'}`}
              onClick={() => handleDayClick(date)}
              disabled={isFuture}
              className={cn(
                'relative aspect-square rounded-md flex flex-col items-center justify-center text-sm transition-all',
                isFuture
                  ? 'opacity-20 cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95',
                isToday && !entry && 'ring-2 ring-brand/40 ring-offset-1',
                entry
                  ? getScoreStyle(entry.score)
                  : isToday
                  ? 'bg-brand/5 text-brand'
                  : 'text-neutral-500'
              )}
            >
              <span className="text-xs font-medium leading-none">{dayNum}</span>
              {entry && (
                <span className="text-[10px] leading-none mt-0.5 opacity-80">
                  {entry.score}
                </span>
              )}
              {hasVersionChange && (
                <span
                  className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-brand"
                  aria-label="버전 변경일"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 px-1">
        <span className="text-xs text-neutral-400">범례:</span>
        {[
          { color: 'bg-brand/10', label: '8+ 점' },
          { color: 'bg-neutral-100', label: '6~7점' },
          { color: 'bg-low/10', label: '~5점' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded', color)} aria-hidden="true" />
            <span className="text-xs text-neutral-400">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-2 h-2 rounded-full bg-brand" aria-hidden="true" />
          <span className="text-xs text-neutral-400">버전 변경</span>
        </div>
      </div>
    </div>
  );
}
