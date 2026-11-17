import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Fondo azul noche con luces suaves en los colores de la bandera sorda
 * (azul, turquesa y amarillo) que se desplazan lentamente.
 */
export function AuroraBackground({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative isolate overflow-hidden bg-night text-white noise', className)}>
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1 w-[42rem] h-[42rem] -top-60 -left-40 bg-primary-500" style={{ opacity: 0.5 }} />
        <div className="aurora-blob aurora-blob-2 w-[36rem] h-[36rem] top-0 -right-48 bg-accent-400" style={{ opacity: 0.35 }} />
        <div className="aurora-blob aurora-blob-3 w-[26rem] h-[26rem] -bottom-48 left-1/3 bg-gold-400" style={{ opacity: 0.16 }} />
        {/* Viñeta para mantener el contraste del texto */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,22,51,0.5)_70%,rgba(6,22,51,0.9)_100%)]" />
      </div>
      {children}
    </div>
  );
}
