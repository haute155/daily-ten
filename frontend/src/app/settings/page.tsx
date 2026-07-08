'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppGate } from '@/components/shared/AppGate';
import { api, AuthUser } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { BookOpen, ChevronRight, LogOut, UserRound } from 'lucide-react';

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
