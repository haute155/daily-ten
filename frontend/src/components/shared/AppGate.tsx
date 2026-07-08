'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { tokenStore } from '@/lib/api';

/**
 * 로그인 확인 + 서버 데이터 로드 게이트.
 * 토큰이 없으면 /login으로 보내고, 데이터가 준비되기 전에는 스켈레톤을 보여준다.
 */
export function AppGate({ children }: { children: ReactNode }) {
  const status = useAppStore(s => s.status);
  const loadAll = useAppStore(s => s.loadAll);
  const router = useRouter();

  useEffect(() => {
    if (!tokenStore.get()) {
      router.replace('/login');
      return;
    }
    if (useAppStore.getState().status === 'idle') {
      loadAll().catch(() => {
        // 401은 api 레이어가 /login으로 보낸다. 그 외 오류는 status='error'로 표시
      });
    }
  }, [loadAll, router]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 px-6 pt-24 text-center">
        <p className="text-sm text-neutral-600">데이터를 불러오지 못했어요. 서버가 실행 중인지 확인해 주세요.</p>
        <button
          type="button"
          onClick={() => loadAll().catch(() => {})}
          className="h-10 px-4 rounded-md bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-semibold"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (status !== 'ready') {
    return (
      <div className="flex flex-col gap-4 px-4 pt-6" aria-busy="true" aria-label="불러오는 중">
        <div className="h-8 w-32 rounded-md bg-neutral-100 animate-pulse" />
        <div className="h-40 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="h-64 rounded-lg bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}
