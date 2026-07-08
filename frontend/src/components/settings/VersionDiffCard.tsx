import dayjs from 'dayjs';
import { ChecklistVersion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, Minus, ArrowUpDown, Hash, Pencil } from 'lucide-react';
import { computeVersionDiff } from '@/lib/domain/versioning';

interface VersionDiffCardProps {
  prev: ChecklistVersion | null;
  next: ChecklistVersion;
}

export function VersionDiffCard({ prev, next }: VersionDiffCardProps) {
  const changes = prev ? computeVersionDiff(prev, next).changes : [];
  const today = dayjs().format('YYYY-MM-DD');
  const effectiveLabel =
    next.effectiveFrom > today ? `${next.effectiveFrom}부터 적용` : '오늘부터 적용';

  return (
    <div className="p-4 rounded-md bg-neutral-50 border border-neutral-200">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="text-xs font-semibold text-brand border-brand/25">
          v{next.versionNumber} 저장됨
        </Badge>
        <span className="text-xs text-neutral-400">{effectiveLabel}</span>
      </div>

      {changes.length > 0 ? (
        <ul className="flex flex-col gap-1.5" aria-label="변경사항">
          {changes.map((change, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-[4px] flex items-center justify-center mt-0.5',
                  change.type === 'add' && 'bg-brand/10 text-brand',
                  change.type === 'remove' && 'bg-low/10 text-low',
                  change.type === 'weight-change' && 'bg-neutral-200 text-neutral-700',
                  change.type === 'rename' && 'bg-brand/10 text-brand',
                  change.type === 'reorder' && 'bg-neutral-200 text-neutral-600'
                )}
                aria-hidden="true"
              >
                {change.type === 'add' && <Plus size={10} strokeWidth={3} />}
                {change.type === 'remove' && <Minus size={10} strokeWidth={3} />}
                {change.type === 'weight-change' && <Hash size={10} strokeWidth={3} />}
                {change.type === 'rename' && <Pencil size={10} strokeWidth={3} />}
                {change.type === 'reorder' && <ArrowUpDown size={10} strokeWidth={3} />}
              </span>
              <span className="text-neutral-700">{change.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">변경사항이 없습니다.</p>
      )}
    </div>
  );
}
