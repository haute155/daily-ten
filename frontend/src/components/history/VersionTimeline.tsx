import { ChecklistVersion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';

interface VersionTimelineProps {
  versions: ChecklistVersion[];
  /** 아직 발효 전(사용 대기)인 버전 id — "현재" 대신 대기 뱃지를 단다 */
  pendingVersionId?: string | null;
}

export function VersionTimeline({ versions, pendingVersionId }: VersionTimelineProps) {
  const sorted = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="mx-4">
      <h2 className="text-sm font-semibold text-neutral-600 mb-3">버전 히스토리</h2>
      <div className="flex flex-col gap-0">
        {sorted.map((version, idx) => (
          <div key={version.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-brand flex-shrink-0 mt-3" />
              {idx < sorted.length - 1 && (
                <div className="w-0.5 flex-1 bg-neutral-200 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-neutral-800">레시피 v{version.versionNumber}</span>
                {version.id === pendingVersionId ? (
                  <Badge
                    variant="outline"
                    className="text-xs text-neutral-600 border-neutral-300 inline-flex items-center gap-1"
                    title={`${version.effectiveFrom}부터 적용됩니다`}
                  >
                    <Clock size={10} aria-hidden="true" />
                    사용 대기
                  </Badge>
                ) : (
                  !version.effectiveTo && (
                    <Badge className="text-xs bg-neutral-900 text-white">현재</Badge>
                  )
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {dayjs(version.effectiveFrom).format('YYYY.MM.DD')}
                {version.effectiveTo
                  ? ` ~ ${dayjs(version.effectiveTo).format('YYYY.MM.DD')}`
                  : ' ~ 현재'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{version.changeSummary}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {version.items.map(item => (
                  <span
                    key={item.id}
                    className="text-xs px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-600"
                  >
                    {item.label} {item.weight}pt
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
