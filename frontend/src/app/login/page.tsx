'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, ApiError, tokenStore } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await api.signup(email, password);
        toast.success('가입 완료! 나만의 체크리스트를 만들어 보세요.');
      } else {
        await api.login(email, password);
      }
      useAppStore.getState().reset();
      router.replace('/today');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '요청에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  // 이미 로그인 상태로 접근하면 오늘 페이지로 (렌더 중 라우팅 금지 — effect에서)
  useEffect(() => {
    if (tokenStore.get()) router.replace('/today');
  }, [router]);

  return (
    <div className="flex flex-col justify-center min-h-[80vh] px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Daily Ten</h1>
        <p className="text-sm text-neutral-500 mt-2">매일 10점, 나만의 점수 시스템</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-12 rounded-md"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-12 rounded-md"
          />
          {mode === 'signup' && (
            <p className="text-xs text-neutral-400">8자 이상 입력해 주세요</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 text-base font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white mt-2"
        >
          {submitting ? '처리 중…' : mode === 'signup' ? '가입하기' : '로그인'}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setMode(m => (m === 'login' ? 'signup' : 'login'))}
        className="mt-6 text-sm text-neutral-500 underline underline-offset-4"
      >
        {mode === 'login' ? '처음이신가요? 가입하기' : '이미 계정이 있어요. 로그인'}
      </button>
    </div>
  );
}
