'use client';

import { ChecklistVersion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface DailyCheckFormProps {
  version: ChecklistVersion;
  checkedItemIds: string[];
  note: string;
  isSaved: boolean;
  onToggle: (id: string) => void;
  onNoteChange: (note: string) => void;
  onSave: () => void;
  onEdit: () => void;
}

export function DailyCheckForm({
  version,
  checkedItemIds,
  note,
  isSaved,
  onToggle,
  onNoteChange,
  onSave,
  onEdit,
}: DailyCheckFormProps) {
  const activeItems = version.items.filter(item => item.isActive);

  if (isSaved) {
    return (
      <div className="flex flex-col gap-2 px-4">
        {activeItems.map(item => {
          const isChecked = checkedItemIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-md border transition-colors',
                isChecked
                  ? 'bg-brand/5 border-brand/25'
                  : 'bg-neutral-50 border-neutral-100'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0',
                  isChecked ? 'bg-brand border-brand' : 'border-neutral-300'
                )}
                aria-hidden="true"
              >
                {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <span
                className={cn(
                  'flex-1 font-medium text-base',
                  isChecked ? 'text-neutral-800' : 'text-neutral-400'
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold px-2 py-0.5 rounded-sm',
                  isChecked ? 'bg-brand/10 text-brand' : 'bg-neutral-100 text-neutral-400'
                )}
              >
                +{item.weight}
              </span>
            </div>
          );
        })}

        {note && (
          <div className="mt-2 px-4 py-3 rounded-md bg-neutral-50 border border-neutral-100">
            <p className="text-xs text-neutral-400 mb-1">메모</p>
            <p className="text-sm text-neutral-700">{note}</p>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between px-2">
          <p className="text-xs text-brand font-medium">오늘 기록 완료</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs h-8"
          >
            수정하기
          </Button>
        </div>
      </div>
    );
  }

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

      <Button
        onClick={onSave}
        className="mt-1 h-12 text-base font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white shadow-sm"
        aria-label="오늘 기록 저장"
      >
        기록 저장
      </Button>
    </div>
  );
}
