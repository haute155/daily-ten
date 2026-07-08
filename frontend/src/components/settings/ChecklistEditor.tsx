'use client';

import { ChecklistItem, CustomCategory } from '@/lib/types';
import { ChecklistItemCard } from './ChecklistItemCard';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface ChecklistEditorProps {
  items: ChecklistItem[];
  totalScore: number;
  isValid: boolean;
  /** 총점이 유효하고 실제 변경사항이 있을 때만 저장 가능 */
  canSave: boolean;
  hasTodayEntry: boolean;
  saved: boolean;
  customCategories: CustomCategory[];
  onItemChange: (id: string, changes: Partial<ChecklistItem>) => void;
  onItemAdd: () => void;
  onItemRemove: (id: string) => void;
  onItemMoveTo: (id: string, toIndex: number) => void;
  onItemReorder: (activeId: string, overId: string) => void;
  onSave: () => void;
}

export function ChecklistEditor({
  items,
  totalScore,
  isValid,
  canSave,
  hasTodayEntry,
  saved,
  customCategories,
  onItemChange,
  onItemAdd,
  onItemRemove,
  onItemMoveTo,
  onItemReorder,
  onSave,
}: ChecklistEditorProps) {
  const remaining = 10 - totalScore;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onItemReorder(String(active.id), String(over.id));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Score indicator */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-md border',
          isValid
            ? 'bg-success/5 border-success/25'
            : totalScore > 10
            ? 'bg-low/5 border-low/25'
            : 'bg-neutral-50 border-neutral-200'
        )}
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
          ) : (
            <AlertCircle size={16} className={totalScore > 10 ? 'text-low' : 'text-neutral-500'} aria-hidden="true" />
          )}
          <span className="text-sm font-medium text-neutral-700">
            {isValid
              ? '총점 10점 완성!'
              : totalScore > 10
              ? `${totalScore - 10}점 초과`
              : `${remaining}점 남음`}
          </span>
        </div>
        <span
          className={cn(
            'text-xl font-bold tabular-nums',
            isValid ? 'text-success' : totalScore > 10 ? 'text-low' : 'text-neutral-900'
          )}
          aria-label={`현재 총점 ${totalScore}점`}
        >
          {totalScore}
          <span className="text-sm text-neutral-400 font-normal">/10</span>
        </span>
      </div>

      {/* Column headers — 항목 행 레이아웃(핸들/순서/이름/가중치/삭제)과 정렬 맞춤 */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 px-3 text-[11px] font-medium text-neutral-400" aria-hidden="true">
          <div className="w-9 flex-shrink-0" /> {/* 드래그 핸들 자리 */}
          <div className="w-8 text-center flex-shrink-0">순서</div>
          <div className="flex-1">항목 이름</div>
          <div className="w-[92px] text-center flex-shrink-0">가중치</div>
          <div className="w-7 flex-shrink-0" /> {/* 삭제 버튼 자리 */}
        </div>
      )}

      {/* Items */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2" role="list" aria-label="체크리스트 항목">
            {items.map((item, idx) => (
              <div key={item.id} role="listitem">
                <ChecklistItemCard
                  item={item}
                  index={idx}
                  total={items.length}
                  customCategories={customCategories}
                  onChange={onItemChange}
                  onRemove={onItemRemove}
                  onMoveTo={onItemMoveTo}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add item */}
      <Button
        variant="outline"
        onClick={onItemAdd}
        className="h-10 border-dashed border-neutral-300 text-neutral-500 hover:text-brand hover:border-brand/30 rounded-md"
        aria-label="항목 추가"
      >
        <Plus size={16} className="mr-1.5" aria-hidden="true" />
        항목 추가
      </Button>

      {/* Warning */}
      {hasTodayEntry && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-neutral-100 border border-neutral-200">
          <AlertCircle size={14} className="text-neutral-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-neutral-700">
            오늘 이미 기록이 있습니다. 변경사항은 내일부터 적용되며, 적용 전에는 다시 수정해도 새 버전이 생기지 않아요.
          </p>
        </div>
      )}

      {/* Save */}
      {saved ? (
        <div className="flex items-center justify-center gap-2 h-12 rounded-lg bg-success/5 border border-success/25">
          <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
          <span className="text-sm font-semibold text-success">새 버전 저장됨!</span>
        </div>
      ) : (
        <Button
          onClick={onSave}
          disabled={!canSave}
          className="h-12 text-base font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white shadow-sm disabled:opacity-50"
          aria-label="새 버전 저장"
        >
          새 버전으로 저장
        </Button>
      )}
    </div>
  );
}
