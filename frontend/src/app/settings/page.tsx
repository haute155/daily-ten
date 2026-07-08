'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppGate } from '@/components/shared/AppGate';
import { api, AuthUser } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { CATEGORIES } from '@/lib/domain/categories';
import { BookOpen, ChevronRight, LogOut, Pencil, Plus, Trash2, UserRound } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppGate>
      <SettingsPageContent />
    </AppGate>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const customCategories = useAppStore(s => s.customCategories);
  const [newLabel, setNewLabel] = useState('');

  const handleAddCategory = async () => {
    const label = newLabel.trim();
    if (!label) return;
    try {
      await useAppStore.getState().addCategory(label);
      setNewLabel('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '카테고리를 추가하지 못했습니다');
    }
  };

  const handleRenameCategory = async (id: string, current: string) => {
    const label = window.prompt('카테고리 이름 변경 (10자 이내)', current)?.trim();
    if (!label || label === current) return;
    try {
      await useAppStore.getState().renameCategory(id, label);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '이름을 바꾸지 못했습니다');
    }
  };

  const handleRemoveCategory = async (id: string, label: string) => {
    if (!window.confirm(`"${label}" 카테고리를 삭제할까요?\n이 카테고리였던 항목들은 미분류로 표시됩니다.`)) return;
    try {
      await useAppStore.getState().removeCategory(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '삭제하지 못했습니다');
    }
  };

  useEffect(() => {
    api.me().then(setUser).catch(() => {
      // 401은 api 레이어가 /login으로 보낸다
    });
  }, []);

  const handleLogout = () => {
    api.logout();
    useAppStore.getState().reset();
    router.replace('/login');
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="설정" subtitle="계정과 앱을 관리하세요" settingsLink={false} />

      {/* 계정 */}
      <section className="px-4">
        <h2 className="text-xs font-semibold text-neutral-400 mb-2">계정</h2>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-white border border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
            <UserRound size={18} className="text-neutral-500" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {user?.email ?? '불러오는 중…'}
            </p>
            <p className="text-xs text-neutral-400">이메일 계정</p>
          </div>
        </div>
      </section>

      {/* 앱 */}
      <section className="px-4 mt-5">
        <h2 className="text-xs font-semibold text-neutral-400 mb-2">앱</h2>
        <div className="rounded-lg bg-white border border-neutral-200 divide-y divide-neutral-100">
          <Link
            href="/onboarding"
            className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
          >
            <BookOpen size={16} className="text-neutral-500 flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 text-sm text-neutral-800">Daily Ten 철학 다시 보기</span>
            <ChevronRight size={16} className="text-neutral-300" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="px-4 mt-5">
        <h2 className="text-xs font-semibold text-neutral-400 mb-2">카테고리</h2>
        <div className="rounded-lg bg-white border border-neutral-200 p-4">
          {/* 기본 카테고리 (고정) */}
          <p className="text-[11px] text-neutral-400 mb-1.5">기본</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <span
                key={c.key}
                className="text-xs px-2 py-1 rounded-sm bg-neutral-100 text-neutral-600"
              >
                {c.label}
              </span>
            ))}
          </div>

          {/* 커스텀 카테고리 */}
          <p className="text-[11px] text-neutral-400 mt-4 mb-1.5">내가 추가한 카테고리</p>
          {customCategories.length > 0 ? (
            <ul className="flex flex-col divide-y divide-neutral-100">
              {customCategories.map(c => (
                <li key={c.id} className="flex items-center gap-2 py-2">
                  <span className="flex-1 text-sm text-neutral-800">{c.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRenameCategory(c.id, c.label)}
                    className="w-8 h-8 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700"
                    aria-label={`${c.label} 이름 변경`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(c.id, c.label)}
                    className="w-8 h-8 rounded-md hover:bg-low/5 flex items-center justify-center text-neutral-300 hover:text-low"
                    aria-label={`${c.label} 삭제`}
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-neutral-400 py-1">아직 없어요. 나만의 분류를 추가해 보세요.</p>
          )}

          {/* 추가 */}
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAddCategory();
                }
              }}
              maxLength={10}
              placeholder="새 카테고리 이름"
              className="flex-1 h-9 text-sm rounded-md border border-neutral-200 px-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              aria-label="새 카테고리 이름"
            />
            <button
              type="button"
              onClick={() => void handleAddCategory()}
              disabled={!newLabel.trim()}
              className="h-9 px-3 rounded-md bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-medium inline-flex items-center gap-1 disabled:opacity-40"
            >
              <Plus size={13} aria-hidden="true" />
              추가
            </button>
          </div>
        </div>
      </section>

      {/* 로그아웃 */}
      <section className="px-4 mt-5 pb-8">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-md border border-neutral-200 text-sm text-neutral-500 hover:text-low hover:border-low/30 transition-colors"
        >
          <LogOut size={14} aria-hidden="true" />
          로그아웃
        </button>
      </section>
    </div>
  );
}
