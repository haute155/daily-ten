'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, SlidersHorizontal, CalendarDays, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/today', label: '오늘', icon: Home },
  { href: '/history', label: '기록', icon: CalendarDays },
  { href: '/recipe', label: '레시피', icon: SlidersHorizontal },
  { href: '/stats', label: '분석', icon: BarChart2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed md:absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 h-[var(--bottom-nav-total)] pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="하단 네비게이션"
    >
      <div className="max-w-md mx-auto flex h-[var(--bottom-nav-height)]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors h-full',
                isActive
                  ? 'text-brand'
                  : 'text-neutral-400 hover:text-neutral-600'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                aria-hidden="true"
              />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
