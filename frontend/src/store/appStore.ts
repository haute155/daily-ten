'use client';

import { create } from 'zustand';
import dayjs from 'dayjs';
import { ChecklistVersion, DailyEntry, ChecklistItem } from '@/lib/types';
import { api } from '@/lib/api';
import { createNewVersion } from '@/lib/domain/versioning';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AppStore {
  versions: ChecklistVersion[];
  entries: DailyEntry[];
  status: LoadStatus;

  // Selectors (이벤트 핸들러용 — 렌더 파생값은 구독 상태에서 직접 계산할 것)
  getTodayEntry: () => DailyEntry | null;

  // Actions — 서버가 진실의 원천. 응답으로 로컬 상태를 갱신한다
  loadAll: () => Promise<void>;
  saveTodayEntry: (checkedItemIds: string[], note: string) => Promise<void>;
  updateEntryByDate: (date: string, checkedItemIds: string[], note: string) => Promise<void>;
  updateVersion: (newItems: ChecklistItem[]) => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppStore>()((set, get) => ({
  versions: [],
  entries: [],
  status: 'idle',

  getTodayEntry: () => {
    const today = dayjs().format('YYYY-MM-DD');
    return get().entries.find(e => e.date === today) ?? null;
  },

  loadAll: async () => {
    set({ status: 'loading' });
    try {
      const [versions, entries] = await Promise.all([api.getVersions(), api.getEntries()]);
      set({ versions, entries, status: 'ready' });
    } catch (e) {
      set({ status: 'error' });
      throw e;
    }
  },

  saveTodayEntry: async (checkedItemIds, note) => {
    const today = dayjs().format('YYYY-MM-DD');
    await get().updateEntryByDate(today, checkedItemIds, note);
  },

  updateEntryByDate: async (date, checkedItemIds, note) => {
    const saved = await api.upsertEntry(date, { checkedItemIds, note });
    set(state => ({
      entries: state.entries.some(e => e.date === date)
        ? state.entries.map(e => (e.date === date ? saved : e))
        : [...state.entries, saved],
    }));
  },

  updateVersion: async (newItems) => {
    const { versions } = get();
    const latest =
      versions.length > 0
        ? versions.reduce((a, b) => (b.versionNumber > a.versionNumber ? b : a))
        : null;

    // 변경 요약은 프론트 도메인 로직으로 생성 (표시용), 규칙 적용은 서버가 담당
    const { version: draft } = createNewVersion(latest, newItems);

    await api.createVersion({
      items: newItems,
      changeSummary: draft.changeSummary,
      title: draft.title,
      clientToday: dayjs().format('YYYY-MM-DD'),
    });

    // 서버가 이전 버전 effectiveTo도 갱신하므로 목록을 다시 불러온다
    const fresh = await api.getVersions();
    set({ versions: fresh });
  },

  reset: () => set({ versions: [], entries: [], status: 'idle' }),
}));
