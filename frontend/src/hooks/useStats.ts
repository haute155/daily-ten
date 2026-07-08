'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { getInsightSummary } from '@/lib/domain/insights';
import { getCategoryLabel } from '@/lib/domain/categories';

export function useStats() {
  const entries = useAppStore(s => s.entries);
  const versions = useAppStore(s => s.versions);

  const summary = useMemo(() => getInsightSummary(entries), [entries]);

  const last30Days = useMemo(() => {
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const entry = entries.find(e => e.date === date);
      result.push({
        date,
        score: entry?.score ?? null,
        label: dayjs(date).format('M/D'),
      });
    }
    return result;
  }, [entries]);

  const weeklyAverages = useMemo(() => {
    const weeks: { week: string; avg: number; count: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = dayjs().subtract(w * 7 + 6, 'day');
      const weekEnd = dayjs().subtract(w * 7, 'day');
      const weekEntries = entries.filter(e => {
        const d = dayjs(e.date);
        return (d.isAfter(weekStart) || d.isSame(weekStart, 'day')) &&
          (d.isBefore(weekEnd) || d.isSame(weekEnd, 'day'));
      });
      if (weekEntries.length > 0) {
        const avg = weekEntries.reduce((s, e) => s + e.score, 0) / weekEntries.length;
        weeks.push({
          week: weekStart.format('M/D'),
          avg: Math.round(avg * 10) / 10,
          count: weekEntries.length,
        });
      }
    }
    return weeks;
  }, [entries]);

  const itemFrequency = useMemo(() => {
    const last30 = entries.filter(e =>
      dayjs(e.date).isAfter(dayjs().subtract(31, 'day'))
    );

    const freq = new Map<string, { id: string; label: string; count: number; total: number }>();

    last30.forEach(entry => {
      const version = versions.find(v => v.id === entry.checklistVersionId);
      if (!version) return;

      version.items.forEach(item => {
        if (!freq.has(item.id)) {
          freq.set(item.id, { id: item.id, label: item.label, count: 0, total: last30.length });
        }
        if (entry.checkedItemIds.includes(item.id)) {
          freq.get(item.id)!.count++;
        }
      });
    });

    return Array.from(freq.values())
      .map(f => ({
        ...f,
        rate: last30.length > 0 ? Math.round((f.count / last30.length) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [entries, versions]);

  /** 최근 30일 카테고리별 획득 점수 기여도 (당시 버전의 항목 카테고리 기준) */
  const categoryContribution = useMemo(() => {
    const last30 = entries.filter(e => dayjs(e.date).isAfter(dayjs().subtract(31, 'day')));

    const earned = new Map<string, number>(); // categoryLabel → 획득 점수 합
    let totalEarned = 0;

    last30.forEach(entry => {
      const version = versions.find(v => v.id === entry.checklistVersionId);
      if (!version) return;

      version.items.forEach(item => {
        if (!item.isActive || !entry.checkedItemIds.includes(item.id)) return;
        const label = getCategoryLabel(item.category);
        earned.set(label, (earned.get(label) ?? 0) + item.weight);
        totalEarned += item.weight;
      });
    });

    return Array.from(earned.entries())
      .map(([label, points]) => ({
        label,
        points,
        share: totalEarned > 0 ? Math.round((points / totalEarned) * 100) : 0,
      }))
      .sort((a, b) => b.points - a.points);
  }, [entries, versions]);

  const versionStats = useMemo(() => {
    return versions.map(version => {
      const vEntries = entries.filter(e => e.checklistVersionId === version.id);
      const avg =
        vEntries.length > 0
          ? Math.round((vEntries.reduce((s, e) => s + e.score, 0) / vEntries.length) * 10) / 10
          : 0;
      const best = vEntries.length > 0 ? Math.max(...vEntries.map(e => e.score)) : 0;

      return {
        version,
        entries: vEntries.length,
        avgScore: avg,
        bestScore: best,
        period: version.effectiveTo
          ? `${version.effectiveFrom} ~ ${version.effectiveTo}`
          : `${version.effectiveFrom} ~ 현재`,
      };
    });
  }, [entries, versions]);

  const bestStreak = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate: string | null = null;

    for (const entry of sorted) {
      if (prevDate && dayjs(entry.date).diff(dayjs(prevDate), 'day') === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      prevDate = entry.date;
    }
    return maxStreak;
  }, [entries]);

  return {
    summary,
    last30Days,
    weeklyAverages,
    itemFrequency,
    categoryContribution,
    versionStats,
    bestStreak,
    totalEntries: entries.length,
  };
}
