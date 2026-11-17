import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function Card({ children, className, title, description, icon, actions }: CardProps) {
  return (
    <section
      className={cn('bg-white rounded-2xl shadow-soft border border-primary-100/70 p-5 transition-shadow hover:shadow-card', className)}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center" aria-hidden="true">
                {icon}
              </span>
            )}
            <div>
              {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
              {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
