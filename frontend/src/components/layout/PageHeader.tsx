import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, right, className }: PageHeaderProps) {
  return (
    <header className={cn('px-4 pt-6 pb-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex-shrink-0 ml-4">{right}</div>}
      </div>
    </header>
  );
}
