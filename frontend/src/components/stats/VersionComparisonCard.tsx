import { ChecklistVersion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VersionStat {
  version: ChecklistVersion;
  entries: number;
  avgScore: number;
  bestScore: number;
  period: string;
}

interface VersionComparisonCardProps {
  versionStats: VersionStat[];
}

export function VersionComparisonCard({ versionStats }: VersionComparisonCardProps) {
  return (
    <div className="flex flex-col gap-3 mx-4">
      {versionStats.map(({ version, entries, avgScore, bestScore, period }) => (
        <div
          key={version.id}
          className="p-4 rounded-lg bg-white border border-neutral-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-neutral-800">레시피 v{version.versionNumber}</span>
            {!version.effectiveTo && (
              <Badge className="text-xs bg-neutral-900 text-white ml-auto">현재</Badge>
            )}
          </div>
          <p className="text-xs text-neutral-400 mb-3">{period}</p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '기록 수', value: `${entries}일` },
              { label: '평균 점수', value: `${avgScore}점`, color: avgScore >= 8 ? 'text-brand' : avgScore >= 6 ? 'text-neutral-900' : 'text-low' },
              { label: '최고 점수', value: `${bestScore}점`, color: 'text-brand' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-neutral-400">{label}</p>
                <p className={cn('text-base font-bold', color ?? 'text-neutral-700')}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
