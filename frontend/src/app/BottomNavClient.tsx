'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';

export function BottomNavClient() {
  const pathname = usePathname();
  if (pathname === '/onboarding' || pathname === '/' || pathname === '/login') return null;
  return <BottomNav />;
}
