import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export function Input({ label, error, hint, icon, id, className, ...props }: InputProps) {
  const inputId = id || props.name;
  const errorId = inputId ? `${inputId}-error` : undefined;
  const hintId = inputId ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label}
        {props.required && <span className="text-cancelled-fg ml-1" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            'w-full rounded-lg border-2 bg-white px-3 py-2.5 text-slate-800 placeholder:text-slate-400 transition-colors',
            icon ? 'pl-10' : '',
            error
              ? 'border-cancelled-border focus:border-cancelled-fg'
              : 'border-slate-300 focus:border-accent-500',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-cancelled-fg font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, id, className, ...props }: TextareaProps) {
  const inputId = id || props.name;
  const errorId = inputId ? `${inputId}-error` : undefined;
  const hintId = inputId ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'w-full rounded-lg border-2 bg-white px-3 py-2.5 text-slate-800 placeholder:text-slate-400 transition-colors resize-y min-h-[90px]',
          error ? 'border-cancelled-border focus:border-cancelled-fg' : 'border-slate-300 focus:border-accent-500',
          className
        )}
        {...props}
      />
      {hint && !error && <p id={hintId} className="text-xs text-slate-500">{hint}</p>}
      {error && <p id={errorId} className="text-sm text-cancelled-fg font-medium">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, id, className, ...props }: SelectProps) {
  const inputId = id || props.name;
  const errorId = inputId ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label}
        {props.required && <span className="text-cancelled-fg ml-1" aria-hidden="true">*</span>}
      </label>
      <select
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-lg border-2 bg-white px-3 py-2.5 text-slate-800 transition-colors',
          error ? 'border-cancelled-border' : 'border-slate-300 focus:border-accent-500',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p id={errorId} className="text-sm text-cancelled-fg font-medium">{error}</p>}
    </div>
  );
}
