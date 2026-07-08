'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';
import { ChecklistEditor } from '@/components/settings/ChecklistEditor';
import { AppGate } from '@/components/shared/AppGate';
import { CategoryManagerDialog } from '@/components/shared/CategoryManagerDialog';
import { ChevronLeft, Tags } from 'lucide-react';

export default function RecipeEditPage() {
  return (
    <AppGate>
      <RecipeEditContent />
    </AppGate>
  );
}

function RecipeEditContent() {
  const router = useRouter();
  const {
    items,
    totalScore,
    isValid,
    hasChanges,
    hasTodayEntry,
    saved,
    customCategories,
    updateItem,
    addItem,
    removeItem,
    moveItemTo,
    reorderItems,
    handleSave,
  } = useSettings();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      router.push('/recipe?saved=1');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-6 pb-4">
        <button
          onClick={() => router.push('/recipe')}
          className="w-9 h-9 -ml-1 rounded-md hover:bg-neutral-100 flex items-center justify-center"
          aria-label="편집 취소하고 돌아가기"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-neutral-900 tracking-tight">레시피 편집</h1>
          <p className="text-xs text-neutral-400">
            {hasTodayEntry
              ? '변경사항은 내일부터 적용돼요'
              : '항목을 추가, 수정, 삭제하고 순서를 조정하세요'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCategoryDialogOpen(true)}
          className="h-9 px-3 rounded-md border border-neutral-200 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 inline-flex items-center gap-1.5 transition-colors"
        >
          <Tags size={13} aria-hidden="true" />
          카테고리 관리
        </button>
      </div>

      <div className="px-4 pb-8">
        <ChecklistEditor
          items={items}
          totalScore={totalScore}
          isValid={isValid}
          canSave={isValid && hasChanges}
          hasTodayEntry={hasTodayEntry}
          saved={saved}
          customCategories={customCategories}
          onItemChange={updateItem}
          onItemAdd={addItem}
          onItemRemove={removeItem}
          onItemMoveTo={moveItemTo}
          onItemReorder={reorderItems}
          onSave={onSave}
        />
      </div>

      <CategoryManagerDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />
    </div>
  );
}
