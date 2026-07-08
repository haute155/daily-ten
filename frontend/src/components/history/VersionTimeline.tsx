import { ChecklistVersion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';

interface VersionTimelineProps {
  versions: ChecklistVersion[];
}

export function VersionTimeline({ versions }: VersionTimelineProps) {
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
                <Badge variant="outline" className="text-xs font-semibold text-brand border-brand/25">
                  v{version.versionNumber}
                </Badge>
                <span className="text-sm font-semibold text-neutral-800">{version.title}</span>
                {!version.effectiveTo && (
                  <Badge className="text-xs bg-neutral-900 text-white">현재</Badge>
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
