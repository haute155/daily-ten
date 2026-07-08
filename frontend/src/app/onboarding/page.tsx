'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, Zap, FileText, BarChart2, RefreshCw } from 'lucide-react';

const philosophies = [
  {
    icon: Target,
    title: '작은 승리, 매일 승리',
    desc: '거대한 목표 대신 오늘 10점을 향한 작은 체크에 집중하세요.',
    color: 'text-brand',
    bg: 'bg-brand/10',
  },
  {
    icon: Zap,
    title: '시스템이 의지력을 이긴다',
    desc: '의지력은 소모되지만 좋은 시스템은 마찰을 줄이고 행동을 자동화합니다.',
    color: 'text-neutral-700',
    bg: 'bg-neutral-100',
  },
  {
    icon: FileText,
    title: '기억보다 기록',
    desc: '매일의 점수를 기록하면 패턴이 보입니다. 느낌이 아닌 데이터로 나를 파악하세요.',
    color: 'text-brand',
    bg: 'bg-brand/10',
  },
  {
    icon: BarChart2,
    title: '나만의 채점 OS',
    desc: '수면, 운동, 독서... 당신의 삶에서 중요한 것에 직접 점수를 부여하세요.',
    color: 'text-neutral-900',
    bg: 'bg-neutral-100',
  },
  {
    icon: RefreshCw,
    title: '설계 → 실행 → 기록 → 개선 루프',
    desc: '버전을 업데이트하며 당신의 시스템을 지속적으로 진화시키세요.',
    color: 'text-neutral-700',
    bg: 'bg-neutral-100',
  },
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-8 pb-10">
        <div className="w-16 h-16 rounded-lg bg-neutral-900 flex items-center justify-center mb-4 shadow-sm">
          <span className="text-white text-2xl font-black">10</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 leading-tight tracking-tight">
          Daily Ten
        </h1>
        <p className="text-base text-neutral-500 mt-2 max-w-[240px] leading-relaxed">
          나만의 채점 시스템으로<br />
          <span className="text-brand font-semibold">매일 10점</span>을 완성하세요
        </p>
      </div>

      {/* Philosophy cards */}
      <div className="flex flex-col gap-3 flex-1">
        {philosophies.map(({ icon: Icon, title, desc, color, bg }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-lg bg-white border border-neutral-100 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon size={18} className={color} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">{title}</p>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-8 pb-4">
        <Link href="/today">
          <Button className="w-full h-14 text-base font-bold rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white shadow-sm">
            시작하기
          </Button>
        </Link>
        <p className="text-center text-xs text-neutral-400 mt-3">
          이미 10점을 향해 달리고 있나요?
        </p>
      </div>
    </div>
  );
}
