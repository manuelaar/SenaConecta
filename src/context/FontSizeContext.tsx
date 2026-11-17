import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type FontSize = 'normal' | 'large' | 'xlarge';

interface FontSizeContextValue {
  size: FontSize;
  cycle: () => void;
  label: string;
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

const LABELS: Record<FontSize, string> = {
  normal: 'Tamaño normal',
  large: 'Texto grande',
  xlarge: 'Texto extra grande',
};

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<FontSize>(() => {
    return (localStorage.getItem('senaconecta:fontsize') as FontSize) || 'normal';
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('text-large', 'text-xlarge');
    if (size === 'large') html.classList.add('text-large');
    if (size === 'xlarge') html.classList.add('text-xlarge');
    localStorage.setItem('senaconecta:fontsize', size);
  }, [size]);

  const cycle = () => {
    setSize((s) => (s === 'normal' ? 'large' : s === 'large' ? 'xlarge' : 'normal'));
  };

  return (
    <FontSizeContext.Provider value={{ size, cycle, label: LABELS[size] }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize(): FontSizeContextValue {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error('useFontSize debe usarse dentro de FontSizeProvider');
  return ctx;
}
