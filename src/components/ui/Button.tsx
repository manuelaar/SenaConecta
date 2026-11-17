import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm hover:shadow-glow hover:-translate-y-px',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 focus-visible:bg-accent-600',
  danger: 'bg-cancelled-fg text-white hover:bg-red-800',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  outline: 'bg-white border-2 border-slate-300 text-slate-800 hover:border-primary-600 hover:text-primary-600',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
