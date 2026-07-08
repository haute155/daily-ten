'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChecklistItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItemCardProps {
  item: ChecklistItem;
  index: number;
  total: number;
  onChange: (id: string, changes: Partial<ChecklistItem>) => void;
  onRemove: (id: string) => void;
  onMoveTo: (id: string, toIndex: number) => void;
}

export function ChecklistItemCard({
  item,
  index,
  total,
  onChange,
  onRemove,
  onMoveTo,
}: ChecklistItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  // index는 상위에서 내려오는 파생값이라 렌더마다 바뀔 수 있다.
  // 편집 중(isEditingOrder)에는 로컬 draft를 보여주고, 아닐 땐 항상 최신 index를 그대로 표시한다
  // (useEffect로 동기화하면 set-state-in-effect 린트에 걸리고 오래된 값이 남을 수 있다).
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderDraft, setOrderDraft] = useState('');
  const orderValue = isEditingOrder ? orderDraft : String(index + 1);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const commitOrder = (value: string) => {
    setIsEditingOrder(false);
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    onMoveTo(item.id, parsed - 1);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-3 rounded-md bg-white border border-neutral-100 shadow-sm',
        isDragging && 'shadow-md ring-1 ring-brand/30 relative z-10'
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="w-11 h-11 -my-1 -ml-2 flex-shrink-0 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 touch-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        aria-label={`${item.label} 드래그하여 순서 변경`}
      >
        <GripVertical size={16} />
      </button>

      {/* Order number */}
      <input
        type="text"
        inputMode="numeric"
        value={orderValue}
        onChange={e => setOrderDraft(e.target.value)}
        onFocus={e => {
          setIsEditingOrder(true);
          setOrderDraft(String(index + 1));
          e.target.select();
        }}
        onBlur={e => commitOrder(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-8 h-8 text-center text-sm font-semibold text-neutral-600 rounded-md border border-neutral-200 tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand"
        aria-label={`${item.label} 순서 (현재 ${index + 1}번째, 총 ${total}개)`}
      />

      {/* Label */}
      <Input
        value={item.label}
        onChange={e => onChange(item.id, { label: e.target.value })}
        onFocus={e => e.target.select()}
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
