'use client';

import { ChecklistItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, Trash2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItemCardProps {
  item: ChecklistItem;
  index: number;
  total: number;
  onChange: (id: string, changes: Partial<ChecklistItem>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export function ChecklistItemCard({
  item,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: ChecklistItemCardProps) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-md bg-white border border-neutral-100 shadow-sm">
      {/* Reorder buttons */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onMove(item.id, 'up')}
          disabled={index === 0}
          className={cn(
            'w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors'
          )}
          aria-label={`${item.label} 위로 이동`}
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={() => onMove(item.id, 'down')}
          disabled={index === total - 1}
          className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label={`${item.label} 아래로 이동`}
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Label */}
      <Input
        value={item.label}
        onChange={e => onChange(item.id, { label: e.target.value })}
        className="flex-1 h-9 text-sm border-neutral-200 focus:ring-brand/30"
        placeholder="항목 이름"
        aria-label="항목 이름"
        maxLength={20}
      />

      {/* Weight stepper */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(item.id, { weight: Math.max(1, item.weight - 1) })}
          disabled={item.weight <= 1}
          className="w-7 h-7 rounded-md bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`${item.label} 가중치 감소`}
        >
          <Minus size={12} />
        </button>
        <span
          className="w-7 text-center text-sm font-bold text-brand tabular-nums"
          aria-label={`가중치 ${item.weight}점`}
        >
          {item.weight}
        </span>
        <button
          type="button"
          onClick={() => onChange(item.id, { weight: Math.min(10, item.weight + 1) })}
          className="w-7 h-7 rounded-md bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center disabled:opacity-30 transition-colors"
          aria-label={`${item.label} 가중치 증가`}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 rounded-md hover:bg-low/5 flex items-center justify-center text-neutral-300 hover:text-low transition-colors"
        aria-label={`${item.label} 삭제`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
