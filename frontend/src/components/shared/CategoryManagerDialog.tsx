'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/appStore';
import { CATEGORIES } from '@/lib/domain/categories';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 생성 직후 호출 — 편집 중이던 항목에 바로 지정할 때 사용 */
  onCreated?: (categoryId: string) => void;
}

export function CategoryManagerDialog({ open, onOpenChange, onCreated }: CategoryManagerDialogProps) {
  const customCategories = useAppStore(s => s.customCategories);
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const resetLocal = () => {
    setNewLabel('');
    setError(null);
    setConfirmingId(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetLocal();
    onOpenChange(next);
  };

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await useAppStore.getState().addCategory(label);
      setNewLabel('');
      if (onCreated) {
        onCreated(created.id);
        handleOpenChange(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '추가하지 못했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await useAppStore.getState().removeCategory(id);
      setConfirmingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제하지 못했습니다');
      setConfirmingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[340px] rounded-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 text-left">
          <DialogTitle className="text-base font-bold text-neutral-900">카테고리 관리</DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            항목을 분류할 나만의 카테고리를 만들어 보세요.
          </DialogDescription>
        </DialogHeader>

        {/* 새 카테고리 추가 */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => {
                setNewLabel(e.target.value);
                setError(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAdd();
                }
              }}
              maxLength={10}
              placeholder="새 카테고리 이름"
              className={cn(
                'flex-1 h-10 text-sm rounded-md border bg-white px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                error ? 'border-low/50' : 'border-neutral-200'
              )}
              aria-label="새 카테고리 이름"
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={() => void handleAdd()}
              disabled={!newLabel.trim() || submitting}
              className="h-10 px-3.5 rounded-md bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-semibold inline-flex items-center gap-1 disabled:opacity-40 transition-colors"
            >
              <Plus size={14} aria-hidden="true" />
              추가
            </button>
          </div>
          {error && (
            <p className="text-xs text-low mt-1.5" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* 내 카테고리 */}
        <div className="px-5 pb-2">
          <p className="text-[11px] font-semibold text-neutral-400 mb-1">내 카테고리</p>
          {customCategories.length > 0 ? (
            <ul className="flex flex-col -mx-2">
              {customCategories.map(c =>
                confirmingId === c.id ? (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 px-2 py-2 rounded-md bg-low/5"
                  >
                    <span className="flex-1 text-xs text-neutral-700">
                      <span className="font-semibold">&ldquo;{c.label}&rdquo;</span> 삭제할까요? 이
                      카테고리였던 항목은 미분류가 돼요.
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="h-8 px-2.5 rounded-md text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRemove(c.id)}
                      className="h-8 px-2.5 rounded-md text-xs font-semibold bg-low text-white hover:opacity-90"
                    >
                      삭제
                    </button>
                  </li>
                ) : (
                  <li key={c.id} className="flex items-center gap-2 px-2 py-1">
                    <span className="flex-1 text-sm text-neutral-800 py-1.5">{c.label}</span>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(c.id)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-300 hover:text-low hover:bg-low/5 transition-colors"
                      aria-label={`${c.label} 삭제`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-xs text-neutral-400 py-2">아직 없어요. 위에서 추가해 보세요.</p>
          )}
        </div>

        {/* 기본 카테고리 */}
        <div className="px-5 pt-2 pb-5 border-t border-neutral-100 mt-2">
          <p className="text-[11px] font-semibold text-neutral-400 mt-2 mb-1.5">기본 카테고리</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <span key={c.key} className="text-xs px-2 py-1 rounded-sm bg-neutral-100 text-neutral-500">
                {c.label}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">기본 카테고리는 자동 분류의 기준이라 바꿀 수 없어요.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
