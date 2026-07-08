'use client';

import { create } from 'zustand';
import dayjs from 'dayjs';
import { ChecklistVersion, CustomCategory, DailyEntry, ChecklistItem } from '@/lib/types';
import { api } from '@/lib/api';
import { createNewVersion, isDraftVersion, resolveLatestVersion } from '@/lib/domain/versioning';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AppStore {
  versions: ChecklistVersion[];
  entries: DailyEntry[];
  customCategories: CustomCategory[];
  status: LoadStatus;

  // Selectors (이벤트 핸들러용 — 렌더 파생값은 구독 상태에서 직접 계산할 것)
  getTodayEntry: () => DailyEntry | null;

  // Actions — 서버가 진실의 원천. 응답으로 로컬 상태를 갱신한다
  loadAll: () => Promise<void>;
  saveTodayEntry: (checkedItemIds: string[], note: string) => Promise<void>;
  updateEntryByDate: (
    date: string,
    checkedItemIds: string[],
    note: string,
    checklistVersionId?: string
  ) => Promise<void>;
  updateVersion: (newItems: ChecklistItem[]) => Promise<void>;
  addCategory: (label: string) => Promise<CustomCategory>;
  renameCategory: (id: string, label: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppStore>()((set, get) => ({
  versions: [],
  entries: [],
  customCategories: [],
  status: 'idle',

  getTodayEntry: () => {
    const today = dayjs().format('YYYY-MM-DD');
    return get().entries.find(e => e.date === today) ?? null;
  },

  loadAll: async () => {
    set({ status: 'loading' });
    try {
      const [versions, entries, customCategories] = await Promise.all([
        api.getVersions(),
        api.getEntries(),
        api.getCategories(),
      ]);
      set({ versions, entries, customCategories, status: 'ready' });
    } catch (e) {
      set({ status: 'error' });
      throw e;
    }
  },

  saveTodayEntry: async (checkedItemIds, note) => {
    const today = dayjs().format('YYYY-MM-DD');
    await get().updateEntryByDate(today, checkedItemIds, note);
  },

  updateEntryByDate: async (date, checkedItemIds, note, checklistVersionId) => {
    const saved = await api.upsertEntry(date, { checkedItemIds, note, checklistVersionId });
    set(state => ({
      entries: state.entries.some(e => e.date === date)
        ? state.entries.map(e => (e.date === date ? saved : e))
        : [...state.entries, saved],
    }));
  },

  updateVersion: async (newItems) => {
    const { versions, entries } = get();
    const today = dayjs().format('YYYY-MM-DD');
    const latest = resolveLatestVersion(versions);

    // 최신 버전이 아직 발효 전(draft)이면 서버가 그 버전을 덮어쓴다.
    // 변경 요약은 draft가 아니라 "마지막으로 실제 살아본 버전" 기준으로 계산해야 의미가 있다
    const latestIsDraft = !!latest && isDraftVersion(latest, entries, today);
    const baseline = latestIsDraft
      ? resolveLatestVersion(versions.filter(v => v.id !== latest.id))
      : latest;

    const { version: draft } = createNewVersion(baseline, newItems, undefined, get().customCategories);

    await api.createVersion({
      items: newItems,
      changeSummary: draft.changeSummary,
      // draft 흡수 시에는 기존 제목 유지 (서버가 title 미전송 시 유지)
      ...(latestIsDraft ? {} : { title: draft.title }),
      clientToday: today,
    });

    // 서버가 이전 버전 effectiveTo도 갱신하므로 목록을 다시 불러온다
    const fresh = await api.getVersions();
    set({ versions: fresh });
  },

  addCategory: async (label) => {
    const created = await api.createCategory(label);
    set(state => ({ customCategories: [...state.customCategories, created] }));
    return created;
  },

  renameCategory: async (id, label) => {
    const updated = await api.updateCategory(id, label);
    set(state => ({
      customCategories: state.customCategories.map(c => (c.id === id ? updated : c)),
    }));
  },

  removeCategory: async (id) => {
    await api.deleteCategory(id);
    set(state => ({
      customCategories: state.customCategories.filter(c => c.id !== id),
    }));
  },

  reset: () => set({ versions: [], entries: [], customCategories: [], status: 'idle' }),
}));
