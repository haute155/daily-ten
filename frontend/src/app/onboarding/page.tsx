'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, Zap, FileText, BarChart2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    icon: Target,
    title: '작은 승리, 매일 승리',
    desc: '거대한 목표 대신 오늘 10점을 향한 작은 체크에 집중하세요.',
  },
  {
    icon: Zap,
    title: '시스템이 의지력을 이긴다',
    desc: '의지력은 소모되지만 좋은 시스템은 마찰을 줄이고 행동을 자동화합니다.',
  },
  {
    icon: FileText,
    title: '기억보다 기록',
    desc: '매일의 점수를 기록하면 패턴이 보입니다. 느낌이 아닌 데이터로 나를 파악하세요.',
  },
  {
    icon: BarChart2,
    title: '나만의 텐 레시피',
    desc: '수면, 운동, 독서... 당신의 삶에서 중요한 것에 직접 점수를 부여하세요.',
  },
  {
    icon: RefreshCw,
    title: '설계 → 실행 → 기록 → 개선',
    desc: '레시피를 계속 진화시키세요. 그 진화의 기록이 곧 당신의 성장입니다.',
  },
];

export default function OnboardingPage() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(slides.length - 1, Math.max(0, index)));
  };

  const goTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  };

  const isLast = activeIndex === slides.length - 1;

  return (
    <div className="min-h-dvh flex flex-col py-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4 pt-4 pb-6">
        <div className="w-14 h-14 rounded-lg bg-neutral-900 flex items-center justify-center mb-3 shadow-sm">
          <span className="text-white text-xl font-black">10</span>
        </div>
        <h1 className="text-2xl font-black text-neutral-900 leading-tight tracking-tight">
          Daily Ten
        </h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          나만의 레시피로 <span className="text-brand font-semibold">매일 10점</span>을 완성하세요
        </p>
      </div>

      {/* Swipe slides */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label="Daily Ten 철학 소개"
      >
        {slides.map(({ icon: Icon, title, desc }, idx) => (
          <div
            key={title}
            className="w-full flex-shrink-0 snap-center flex items-center justify-center px-8"
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} / ${slides.length}`}
          >
            <div className="flex flex-col items-center text-center max-w-[280px]">
              <div className="w-20 h-20 rounded-lg bg-brand/10 flex items-center justify-center mb-6">
                <Icon size={36} className="text-brand" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h2>
              <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 pt-6" role="tablist" aria-label="슬라이드 위치">
        {slides.map((s, idx) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={idx === activeIndex}
            aria-label={`${idx + 1}번째 슬라이드로 이동`}
            onClick={() => goTo(idx)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              idx === activeIndex ? 'w-6 bg-neutral-900' : 'w-1.5 bg-neutral-200'
            )}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="px-4 pt-6 pb-4">
        {isLast ? (
          <Link href="/today" className="block">
            <Button className="w-full h-14 text-base font-bold rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white shadow-sm">
              시작하기
            </Button>
          </Link>
        ) : (
          <Button
            onClick={() => goTo(activeIndex + 1)}
            className="w-full h-14 text-base font-bold rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white shadow-sm"
          >
            다음
          </Button>
        )}
        <Link
          href="/today"
          className={cn(
            'block text-center text-xs mt-3 underline underline-offset-4',
            isLast ? 'text-transparent pointer-events-none' : 'text-neutral-400'
          )}
          aria-hidden={isLast}
          tabIndex={isLast ? -1 : 0}
        >
          건너뛰기
        </Link>
      </div>
    </div>
  );
}
