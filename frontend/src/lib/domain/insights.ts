import dayjs from 'dayjs';
import { DailyEntry, InsightSummary } from '@/lib/types';

/** 고득점 판정 기준 점수 */
export const HIGH_SCORE_THRESHOLD = 8;
/** 월 평균 추세 up/down 판정 임계값 */
export const TREND_THRESHOLD = 0.2;

/**
 * 연속 기록일 수. 기준일에 아직 기록이 없으면 어제부터 역산한다
 * (하루가 끝나기 전에 스트릭이 0으로 리셋되어 보이지 않도록).
 */
export function getCurrentStreak(entries: DailyEntry[], date: string): number {
  const entryDates = new Set(entries.map(e => e.date));
  let current = dayjs(date);

  if (!entryDates.has(current.format('YYYY-MM-DD'))) {
    current = current.subtract(1, 'day');
  }

  let streak = 0;
  while (entryDates.has(current.format('YYYY-MM-DD'))) {
    streak++;
    current = current.subtract(1, 'day');
  }

  return streak;
}

/** 연속 고득점일 수. getCurrentStreak과 같은 기준(오늘 미기록 시 어제부터)을 적용한다. */
export function getHighScoreStreak(
  entries: DailyEntry[],
  minScore = HIGH_SCORE_THRESHOLD,
  date: string = dayjs().format('YYYY-MM-DD')
): number {
  const entryMap = new Map(entries.map(e => [e.date, e]));
  let current = dayjs(date);

  if (!entryMap.has(current.format('YYYY-MM-DD'))) {
    current = current.subtract(1, 'day');
  }

  let streak = 0;
  for (
    let entry = entryMap.get(current.format('YYYY-MM-DD'));
    entry && entry.score >= minScore;
    current = current.subtract(1, 'day'), entry = entryMap.get(current.format('YYYY-MM-DD'))
  ) {
    streak++;
  }

  return streak;
}

export function getInsightSummary(entries: DailyEntry[]): InsightSummary {
  const today = dayjs().format('YYYY-MM-DD');
  const currentStreak = getCurrentStreak(entries, today);
  const highScoreStreak = getHighScoreStreak(entries);

  const last7 = entries
    .filter(e => dayjs(e.date).isAfter(dayjs().subtract(8, 'day')))
    .map(e => e.score);
  const last30 = entries
    .filter(e => dayjs(e.date).isAfter(dayjs().subtract(31, 'day')))
    .map(e => e.score);
  const prev30 = entries
    .filter(
      e =>
        dayjs(e.date).isAfter(dayjs().subtract(61, 'day')) &&
        dayjs(e.date).isBefore(dayjs().subtract(30, 'day'))
    )
    .map(e => e.score);

  const weeklyAverage =
    last7.length > 0 ? Math.round((last7.reduce((a, b) => a + b, 0) / last7.length) * 10) / 10 : 0;

  const monthlyAverage =
    last30.length > 0
      ? Math.round((last30.reduce((a, b) => a + b, 0) / last30.length) * 10) / 10
      : 0;

  const prevMonthlyAverage =
    prev30.length > 0
      ? Math.round((prev30.reduce((a, b) => a + b, 0) / prev30.length) * 10) / 10
      : 0;

  const monthlyImprovement =
    Math.round((monthlyAverage - prevMonthlyAverage) * 10) / 10;

  let averageTrend: 'up' | 'down' | 'flat' = 'flat';
  if (monthlyImprovement > TREND_THRESHOLD) averageTrend = 'up';
  else if (monthlyImprovement < -TREND_THRESHOLD) averageTrend = 'down';

  return {
    currentStreak,
    highScoreStreak,
    weeklyAverage,
    monthlyAverage,
    averageTrend,
    monthlyImprovement,
  };
}

export function generateInsights(entries: DailyEntry[]): string[] {
  const insights: string[] = [];
  const summary = getInsightSummary(entries);

  if (summary.currentStreak >= 7) {
    insights.push(`연속 ${summary.currentStreak}일 기록 중! 꾸준함이 최고의 무기입니다.`);
  } else if (summary.currentStreak >= 3) {
    insights.push(`${summary.currentStreak}일 연속 기록 중. 좋은 흐름이에요!`);
  } else if (summary.currentStreak === 0) {
    insights.push('오늘부터 다시 시작해요. 작은 것부터!');
  }

  if (summary.averageTrend === 'up') {
    insights.push(`지난달보다 평균 +${summary.monthlyImprovement}점 향상됐어요!`);
  } else if (summary.averageTrend === 'down') {
    insights.push(`지난달보다 평균 ${summary.monthlyImprovement}점 낮아졌어요. 루틴을 점검해볼까요?`);
  }

  if (summary.weeklyAverage >= 9) {
    insights.push('이번 주 평균 9점 이상! 최고의 한 주입니다.');
  } else if (summary.weeklyAverage >= 7) {
    insights.push(`이번 주 평균 ${summary.weeklyAverage}점. 잘 하고 있어요!`);
  }

  if (summary.highScoreStreak >= 3) {
    insights.push(`${summary.highScoreStreak}일 연속 8점 이상! 고득점 스트릭 중.`);
  }

  if (insights.length === 0) {
    insights.push('오늘도 루틴을 완성해 보세요!');
  }

  return insights;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '새벽에도 루틴을';
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '오후도 힘내요';
  if (hour < 22) return '저녁도 마무리해요';
  return '오늘 하루 마무리';
}
