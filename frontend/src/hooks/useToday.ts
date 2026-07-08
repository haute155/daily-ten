'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { calculateScore } from '@/lib/domain/scoring';
import { resolveActiveVersion } from '@/lib/domain/versioning';

/**
 * 하이드레이션 완료 후에만 마운트되어야 한다 (AppGate 안에서 사용).
 * 렌더 중에는 스토어 getter를 호출하지 말고 구독한 상태에서 직접 파생한다
 * — React Compiler가 getter 호출을 함수 참조 기준으로 메모해 stale 값이 남는다.
 */
export function useToday() {
  const saveTodayEntry = useAppStore(s => s.saveTodayEntry);
  const entries = useAppStore(s => s.entries);
  const versions = useAppStore(s => s.versions);

  const today = dayjs().format('YYYY-MM-DD');
  const todayEntry = entries.find(e => e.date === today) ?? null;
  // 오늘 이미 기록했다면 그 기록이 연결된 버전을, 아니면 오늘 적용되는 버전을 쓴다
  const activeVersion = resolveActiveVersion(versions, today);
  const version = todayEntry
    ? versions.find(v => v.id === todayEntry.checklistVersionId) ?? activeVersion
    : activeVersion;

  const [checkedItemIds, setCheckedItemIds] = useState<string[]>(
    todayEntry?.checkedItemIds ?? []
  );
  const [note, setNote] = useState(todayEntry?.note ?? '');
  const [isEditing, setIsEditing] = useState(false);

  const toggleItem = (itemId: string) => {
    setCheckedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const currentScore = version ? calculateScore(checkedItemIds, version) : 0;

  const handleSave = async () => {
    try {
      await saveTodayEntry(checkedItemIds, note);
      setIsEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다');
    }
  };

  const handleEdit = () => {
    const entry = useAppStore.getState().getTodayEntry();
    if (entry) {
      setCheckedItemIds(entry.checkedItemIds);
      setNote(entry.note);
    }
    setIsEditing(true);
  };

  const isSaved = !!todayEntry && !isEditing;

  return {
    version,
    todayEntry,
    checkedItemIds,
    note,
    currentScore,
    isSaved,
    isEditing,
    toggleItem,
    setNote,
    handleSave,
    handleEdit,
    entries,
  };
}
