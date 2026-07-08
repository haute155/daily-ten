import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBadge({ score, maxScore = 10, size = 'md', className }: ScoreBadgeProps) {
  const getColors = () => {
    if (score >= 8) return 'bg-brand/10 text-brand border-brand/25';
    if (score >= 6) return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    if (score > 0) return 'bg-low/10 text-low border-low/25';
    return 'bg-neutral-100 text-neutral-500 border-neutral-200';
  };

  const getSizes = () => {
    if (size === 'sm') return 'text-xs px-1.5 py-0.5';
    if (size === 'lg') return 'text-xl px-3 py-1 font-bold';
    return 'text-sm px-2 py-1';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        getColors(),
        getSizes(),
        className
      )}
      aria-label={`점수 ${score}점 (최대 ${maxScore}점)`}
    >
      {score}
      <span className="opacity-60">/{maxScore}</span>
    </span>
  );
}
