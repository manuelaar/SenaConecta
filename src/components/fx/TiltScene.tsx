import { useEffect, useRef } from 'react';
import { BellRing, CalendarCheck, Clock3, MapPin } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SignHandsCanvas } from './SignHandsCanvas';

/**
 * Escena con profundidad: al centro, dos manos de partículas (estudiante e
 * intérprete); alrededor, tarjetas de la app en capas que se inclinan y se
 * desplazan a distinta velocidad siguiendo el mouse (parallax 3D).
 */
export function TiltScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = sceneRef.current;
    if (!el) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    function onMove(e: PointerEvent) {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    function tick() {
      current.x += (target.x - current.x) * 0.07;
      current.y += (target.y - current.y) * 0.07;
      el!.style.setProperty('--rx', `${(-current.y * 7).toFixed(2)}deg`);
      el!.style.setProperty('--ry', `${(current.x * 10).toFixed(2)}deg`);
      el!.style.setProperty('--px', current.x.toFixed(3));
      el!.style.setProperty('--py', current.y.toFixed(3));
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const layer = (depth: number): React.CSSProperties => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), ${depth}px)`,
  });

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square [perspective:1200px]">
      <div
        ref={sceneRef}
        className="relative w-full h-full [transform-style:preserve-3d]"
        style={{ transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' }}
      >
        {/* Halo detrás de las manos */}
        <div
          className="absolute inset-[18%] rounded-full bg-gradient-to-br from-accent-400 via-primary-500 to-gold-400 opacity-25 blur-3xl"
          style={layer(-40)}
          aria-hidden="true"
        />

        {/* Manos de partículas (interactivas) */}
        <div className="absolute inset-0" style={layer(0)}>
          <SignHandsCanvas className="w-full h-full" />
        </div>

        {/* Etiquetas de cada mano */}
        <div className="absolute left-[8%] bottom-[14%]" style={layer(30)} aria-hidden="true">
          <span className="glass-dark rounded-full px-3 py-1 text-xs font-semibold text-accent-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-300" /> Estudiante
          </span>
        </div>
        <div className="absolute right-[8%] bottom-[14%]" style={layer(30)} aria-hidden="true">
          <span className="glass-dark rounded-full px-3 py-1 text-xs font-semibold text-gold-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold-400" /> Intérprete
          </span>
        </div>

        {/* Notificación flotante */}
        <div className="hidden sm:block absolute right-[-2%] top-[15%] w-[56%]" style={layer(80)} aria-hidden="true">
          <div className="glass-dark rounded-2xl p-3 flex items-start gap-3 shadow-glow float-slower">
            <span className="w-9 h-9 shrink-0 rounded-xl bg-gold-400/20 text-gold-300 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">¡Intérprete confirmado!</p>
              <p className="text-xs text-primary-200">Hace 1 min · también por correo</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de solicitud */}
        <div className="hidden sm:block absolute left-[-4%] top-[-1%] w-[50%]" style={layer(55)} aria-hidden="true">
          <div className="glass-dark rounded-2xl p-4 shadow-glow float-slow">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-widest text-primary-200">Solicitud</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-300/15 text-accent-200 border border-accent-300/30 px-2 py-0.5 text-[11px] font-semibold">
                <CalendarCheck className="w-3 h-3" /> Confirmada
              </span>
            </div>
            <p className="mt-2 font-display font-bold text-white">Cálculo Diferencial</p>
            <div className="mt-2 space-y-1 text-xs text-primary-100">
              <p className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 text-gold-300" /> Lun · 08:00 – 10:00</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold-300" /> Bloque 3 – Salón 305</p>
            </div>
          </div>
        </div>

        {/* Chip de disponibilidad */}
        <div className="absolute inset-x-0 bottom-[2%] flex justify-center" style={layer(100)} aria-hidden="true">
          <div className="glass-dark rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-accent-300 animate-pulse" /> 4 intérpretes disponibles
          </div>
        </div>
      </div>
    </div>
  );
}
