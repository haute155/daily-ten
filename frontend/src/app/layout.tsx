import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { BottomNavClient } from './BottomNavClient';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata: Metadata = {
  title: 'Daily Ten',
  description: '나만의 채점 시스템으로 하루 10점을 완성하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} font-sans bg-white antialiased md:bg-neutral-200/70`}>
        {/* 모바일: 전체 화면(dvh — 주소창 변화 대응). 데스크톱(md+): 폰 프레임을 화면 정중앙에 */}
        <div className="md:min-h-dvh md:flex md:items-center md:justify-center md:p-6">
          <div className="w-full max-w-md mx-auto min-h-dvh bg-white relative md:min-h-0 md:h-[var(--frame-height)] md:rounded-lg md:border md:border-neutral-200 md:shadow-lg md:overflow-hidden">
            <main className="pb-[var(--bottom-nav-total)] md:h-full md:overflow-y-auto">{children}</main>
            <BottomNavClient />
          </div>
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
