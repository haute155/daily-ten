'use client';

import { ChecklistVersion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { SaveState } from '@/hooks/useToday';

interface DailyCheckFormProps {
  version: ChecklistVersion;
  checkedItemIds: string[];
  note: string;
  saveState: SaveState;
  onToggle: (id: string) => void;
  onNoteChange: (note: string) => void;
}

export function DailyCheckForm({
  version,
  checkedItemIds,
  note,
  saveState,
  onToggle,
  onNoteChange,
}: DailyCheckFormProps) {
  const activeItems = version.items.filter(item => item.isActive);

  return (
    <div className="flex flex-col gap-2 px-4">
      {activeItems.map(item => {
        const isChecked = checkedItemIds.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-4 rounded-md border-2 transition-all active:scale-[0.98] text-left',
              isChecked
                ? 'bg-brand/5 border-brand/30 shadow-sm'
                : 'bg-white border-neutral-100 hover:border-neutral-200'
            )}
            aria-pressed={isChecked}
            aria-label={`${item.label} (${item.weight}점) - ${isChecked ? '완료' : '미완료'}`}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all',
                isChecked ? 'bg-brand border-brand' : 'border-neutral-300'
              )}
              aria-hidden="true"
            >
              {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
            <span
              className={cn(
                'flex-1 font-semibold text-base',
                isChecked ? 'text-brand' : 'text-neutral-700'
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                'text-sm font-bold px-2.5 py-1 rounded-sm',
                isChecked
                  ? 'bg-brand text-white'
                  : 'bg-neutral-100 text-neutral-500'
              )}
            >
              +{item.weight}
            </span>
          </button>
        );
      })}

      <div className="mt-2">
        <Textarea
          placeholder="오늘 하루 메모 (선택사항)"
          value={note}
          onChange={e => onNoteChange(e.target.value)}
          className="resize-none text-sm bg-white border-neutral-100 rounded-md focus:ring-brand/30"
          rows={2}
          aria-label="오늘 하루 메모"
        />
      </div>

      {/* 자동 저장 상태 — 저장 성공 시 초록 "저장됨"이 5초간 표시됐다 사라진다 */}
      <div className="flex items-center justify-end gap-1.5 px-1 h-5 text-xs" aria-live="polite">
        {saveState === 'saved' && (
          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
            <Check size={12} aria-hidden="true" />
            저장됨
          </span>
        )}
        {saveState === 'error' && <span className="text-low">저장 실패 — 다시 시도해 주세요</span>}
      </div>
    </div>
  );
}
