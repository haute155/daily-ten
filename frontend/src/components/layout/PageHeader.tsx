import Link from 'next/link';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** 우측 기본 설정 톱니 노출 여부 (설정 페이지 자신에서는 끈다) */
  settingsLink?: boolean;
  className?: string;
}

export function PageHeader({ title, subtitle, right, settingsLink = true, className }: PageHeaderProps) {
  return (
    <header className={cn('px-4 pt-6 pb-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4 flex items-center gap-1">
          {right}
          {settingsLink && (
            <Link
              href="/settings"
              className="w-10 h-10 -mr-1 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="설정"
            >
              <Settings size={19} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
