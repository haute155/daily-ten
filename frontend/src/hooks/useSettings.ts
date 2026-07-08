'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { ChecklistItem } from '@/lib/types';
import { resolveLatestVersion } from '@/lib/domain/versioning';

/**
 * 하이드레이션 완료 후에만 마운트되어야 한다 (AppGate 안에서 사용).
 * 렌더 중에는 스토어 getter를 호출하지 말고 구독한 상태에서 직접 파생한다
 * — React Compiler가 getter 호출을 함수 참조 기준으로 메모해 stale 값이 남는다.
 */
export function useSettings() {
  const updateVersion = useAppStore(s => s.updateVersion);
  const versions = useAppStore(s => s.versions);
  const entries = useAppStore(s => s.entries);

  // 편집 기준은 최신 버전 (내일부터 적용 예정인 버전 포함)
  const currentVersion = resolveLatestVersion(versions);
  const [items, setItems] = useState<ChecklistItem[]>(
    currentVersion?.items.map(item => ({ ...item })) ?? []
  );
  const [saved, setSaved] = useState(false);

  const hasTodayEntry = entries.some(e => e.date === dayjs().format('YYYY-MM-DD'));

  const totalScore = items.reduce((sum, item) => sum + item.weight, 0);
  const isValid = totalScore === 10 && items.length > 0;

  // 변경이 없으면 새 버전을 만들지 않는다 (무의미한 버전 누적 방지)
  const hasChanges =
    !currentVersion ||
    currentVersion.items.length !== items.length ||
    currentVersion.items.some((it, idx) => {
      const next = items[idx];
      return (
        !next ||
        next.id !== it.id ||
        next.label !== it.label ||
        next.weight !== it.weight ||
        (next.category ?? null) !== (it.category ?? null)
      );
    });

  const updateItem = (id: string, changes: Partial<ChecklistItem>) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...changes } : item)));
  };

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      label: '새 항목',
      weight: 1,
      order: items.length,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  /** 순서 숫자 인풋에서 지정 위치로 항목을 이동 (범위 밖 인덱스는 클램프) */
  const moveItemTo = (id: string, toIndex: number) => {
    setItems(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx === -1) return prev;
      const clamped = Math.min(Math.max(toIndex, 0), prev.length - 1);
      if (clamped === idx) return prev;

      const newItems = [...prev];
      const [moved] = newItems.splice(idx, 1);
      newItems.splice(clamped, 0, moved);
      return newItems.map((item, i) => ({ ...item, order: i }));
    });
  };

  /** dnd-kit onDragEnd에서 사용: activeId를 overId 위치로 재정렬 */
  const reorderItems = (activeId: string, overId: string) => {
    if (activeId === overId) return;
    setItems(prev => {
      const fromIdx = prev.findIndex(item => item.id === activeId);
      const toIdx = prev.findIndex(item => item.id === overId);
      if (fromIdx === -1 || toIdx === -1) return prev;

      const newItems = [...prev];
      const [moved] = newItems.splice(fromIdx, 1);
      newItems.splice(toIdx, 0, moved);
      return newItems.map((item, i) => ({ ...item, order: i }));
    });
  };

  const handleSave = async (): Promise<boolean> => {
    if (!isValid || !hasChanges) return false;
    try {
      await updateVersion(items);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다');
      return false;
    }
  };

  const reset = () => {
    setItems(currentVersion?.items.map(item => ({ ...item })) ?? []);
  };

  return {
    currentVersion,
    versions,
    items,
    totalScore,
    isValid,
    hasChanges,
    hasTodayEntry,
    saved,
    updateItem,
    addItem,
    removeItem,
    moveItemTo,
    reorderItems,
    handleSave,
    reset,
  };
}
