'use client';

import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { sendEntryBeacon } from '@/lib/api';
import { calculateScore } from '@/lib/domain/scoring';
import { resolveActiveVersion } from '@/lib/domain/versioning';

export type SaveState = 'idle' | 'saved' | 'error';

/** 자동 저장 디바운스 (ms) — 연속 체크를 한 번의 요청으로 묶는다 */
const AUTOSAVE_DELAY = 600;

/**
 * 하이드레이션 완료 후에만 마운트되어야 한다 (AppGate 안에서 사용).
 * 오늘 기록은 명시적 저장 없이 자동 저장된다 — 체크/메모 변경 후 잠깐 뒤 서버로 전송.
 */
export function useToday() {
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
  const [saveState, setSaveState] = useState<SaveState>('idle');

  // 마지막 변경 내용과 타이머 — 언마운트 시에도 유실 없이 전송하기 위해 ref로 유지
  const pendingRef = useRef<{ ids: string[]; note: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    try {
      await useAppStore.getState().saveTodayEntry(pending.ids, pending.note);
      // 저장 중에도 기존 "저장됨" 표시를 유지 — 연속 저장 시 깜빡임 없이 5초 타이머만 연장
      if (!pendingRef.current) {
        setSaveState('saved');
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setSaveState(current => (current === 'saved' ? 'idle' : current));
        }, 5000);
      }
    } catch (e) {
      setSaveState('error');
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다');
    }
  };

  const scheduleSave = (ids: string[], noteValue: string) => {
    pendingRef.current = { ids, note: noteValue };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flush(), AUTOSAVE_DELAY);
  };

  // 페이지 이탈 시 대기 중인 변경을 유실 없이 전송
  // - SPA 내 이동: 언마운트 cleanup에서 일반 저장
  // - 새로고침/탭 닫기: pagehide에서 keepalive fetch (문서가 내려가도 전송 유지)
  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const onPageHide = () => {
      const pending = pendingRef.current;
      if (!pending) return;
      pendingRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      sendEntryBeacon(today, { checkedItemIds: pending.ids, note: pending.note });
    };
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      const pending = pendingRef.current;
      if (pending) {
        pendingRef.current = null;
        void useAppStore.getState().saveTodayEntry(pending.ids, pending.note);
      }
    };
  }, []);

  const toggleItem = (itemId: string) => {
    const next = checkedItemIds.includes(itemId)
      ? checkedItemIds.filter(id => id !== itemId)
      : [...checkedItemIds, itemId];
    setCheckedItemIds(next);
    scheduleSave(next, note);
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
    scheduleSave(checkedItemIds, value);
  };

  const currentScore = version ? calculateScore(checkedItemIds, version) : 0;

  return {
    version,
    todayEntry,
    checkedItemIds,
    note,
    currentScore,
    saveState,
    toggleItem,
    handleNoteChange,
    entries,
  };
}
