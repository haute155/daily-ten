'use client';

import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';

export function useHistory() {
  const entries = useAppStore(s => s.entries);
  const versions = useAppStore(s => s.versions);

  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));

  const daysInMonth = useMemo(() => {
    const days = [];
    const start = currentMonth.startOf('month');
    const end = currentMonth.endOf('month');

    // Pad start with empty days for correct weekday alignment
    const startDow = start.day(); // 0=Sun
    for (let i = 0; i < startDow; i++) {
      days.push(null);
    }

    for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
      days.push(d.format('YYYY-MM-DD'));
    }

    return days;
  }, [currentMonth]);

  const entryMap = useMemo(() => {
    const map = new Map<string, (typeof entries)[0]>();
    entries.forEach(e => map.set(e.date, e));
    return map;
  }, [entries]);

  const versionChangeDates = useMemo(() => {
    const dates = new Set<string>();
    versions.forEach(v => {
      dates.add(v.effectiveFrom);
    });
    return dates;
  }, [versions]);

  const prevMonth = () => setCurrentMonth(m => m.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(m => m.add(1, 'month'));

  return {
    currentMonth,
    daysInMonth,
    entryMap,
    versionChangeDates,
    prevMonth,
    nextMonth,
    entries,
    versions,
  };
}

export function useHistoryEntry(date: string) {
  // 렌더 중 스토어 getter 호출 금지 (React Compiler 메모이제이션과 충돌) — 구독 상태에서 파생
  const entries = useAppStore(s => s.entries);
  const updateEntryByDate = useAppStore(s => s.updateEntryByDate);
  const versions = useAppStore(s => s.versions);
  const entry = entries.find(e => e.date === date) ?? null;

  const version = entry
    ? versions.find(v => v.id === entry.checklistVersionId)
    : null;

  return { entry, version, versions, updateEntryByDate };
}
