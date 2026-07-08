'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateInsights } from '@/lib/domain/insights';
import { DailyEntry } from '@/lib/types';

interface InsightBannerProps {
  entries: DailyEntry[];
}

export function InsightBanner({ entries }: InsightBannerProps) {
  const [insightIdx, setInsightIdx] = useState(0);
  const insights = generateInsights(entries);

  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      setInsightIdx(prev => (prev + 1) % insights.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [insights.length]);

  if (insights.length === 0) return null;

  return (
    <div className="mx-4 mb-3 px-3 py-2 rounded-md bg-brand/5 border border-brand/25 flex items-start gap-2">
      <Sparkles size={14} className="text-brand mt-0.5 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-brand leading-relaxed">{insights[insightIdx]}</p>
    </div>
  );
}
