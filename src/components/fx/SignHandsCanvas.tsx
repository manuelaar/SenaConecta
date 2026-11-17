import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Dos manos abiertas formadas por partículas (estudiante e intérprete).
 * - Se mueven suavemente, como si estuvieran "señando".
 * - El mouse dispersa las partículas; luego vuelven a su lugar.
 * - Entre las dos manos viajan pulsos de luz: la comunicación.
 * Colores: turquesa (comunidad sorda y lengua de señas) y amarillo (luz),
 * tomados de la bandera sorda oficial.
 * Es decorativo (aria-hidden) y queda quieto con "reducir movimiento".
 */

// Mano abierta (ícono "hand" de lucide, viewBox 24×24)
const HAND_PATHS = [
  'M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2',
  'M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2',
  'M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8',
  'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
];

const TURQ = ['#4FD4D6', '#8EE6E6', '#22B8BC'];
const GOLD = ['#FFC93C', '#FFD86B', '#FFE7A3'];

type Particle = {
  hand: 0 | 1; // 0 = izquierda (turquesa), 1 = derecha (amarilla)
  hx: number; // posición "de casa" relativa al pivote de su mano
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
  phase: number;
};

/** Toma puntos del contorno de una mano dibujada en un canvas oculto. */
function sampleHand(mirror: boolean, size: number, gap: number): { x: number; y: number }[] {
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const c = off.getContext('2d', { willReadFrequently: true })!;
  const s = size / 24;
  c.save();
  if (mirror) {
    c.translate(size, 0);
    c.scale(-1, 1);
  }
  c.scale(s, s);
  c.lineWidth = 1.5;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.strokeStyle = '#fff';
  HAND_PATHS.forEach((d) => c.stroke(new Path2D(d)));
  c.restore();

  const img = c.getImageData(0, 0, size, size).data;
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < size; y += gap) {
    for (let x = 0; x < size; x += gap) {
      if (img[(y * size + x) * 4 + 3] > 128) {
        pts.push({ x: x + (Math.random() - 0.5) * gap * 0.6, y: y + (Math.random() - 0.5) * gap * 0.6 });
      }
    }
  }
  return pts;
}

export function SignHandsCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let handSize = 0;
    let particles: Particle[] = [];
    // Partículas sueltas de fondo, conectadas entre sí
    let dust: { x: number; y: number; vx: number; vy: number }[] = [];
    let raf = 0;
    let visible = true;
    let t = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    // Esquina superior izquierda de la caja de cada mano.
    // Izquierda espejada (pulgar hacia el centro) y derecha normal: las manos se miran.
    function boxes() {
      const cx = width / 2;
      const cy = height / 2;
      return [
        { x: cx - handSize * 0.98, y: cy - handSize * 0.5 },
        { x: cx - handSize * 0.02, y: cy - handSize * 0.5 + handSize * 0.06 },
      ];
    }

    function build() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      handSize = Math.min(width * 0.48, height * 0.7);
      const gap = Math.max(4, Math.round(handSize / 70));
      const left = sampleHand(true, Math.round(handSize), gap);
      const right = sampleHand(false, Math.round(handSize), gap);

      const make = (pts: { x: number; y: number }[], hand: 0 | 1): Particle[] =>
        pts.map((p) => {
          const palette = hand === 0 ? TURQ : GOLD;
          return {
            hand,
            hx: p.x,
            hy: p.y,
            // empiezan dispersas y se "arman" al cargar
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            r: Math.random() * 1.3 + 0.9,
            c: palette[Math.floor(Math.random() * palette.length)],
            phase: Math.random() * Math.PI * 2,
          };
        });
      particles = [...make(left, 0), ...make(right, 1)];

      dust = Array.from({ length: Math.round(Math.min(40, (width * height) / 9000)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));

      if (reduced) {
        // Sin animación: las manos aparecen ya formadas
        particles.forEach((p) => {
          const h = home(p, 0);
          p.x = h.x;
          p.y = h.y;
        });
      }
    }

    // Posición de destino de una partícula en el instante t (con el gesto aplicado)
    function home(p: Particle, time: number) {
      const box = boxes()[p.hand];
      // Gesto: cada mano rota levemente alrededor de la muñeca, desfasadas entre sí
      const ph = p.hand === 0 ? 0 : Math.PI * 0.8;
      const ang = reduced ? 0 : Math.sin(time * 0.9 + ph) * 0.09 * (p.hand === 0 ? -1 : 1);
      const lift = reduced ? 0 : Math.sin(time * 0.9 + ph + Math.PI / 2) * handSize * 0.025;
      // muñeca ≈ centro inferior del ícono
      const wx = handSize * 0.5;
      const wy = handSize * 0.92;
      const dx = p.hx - wx;
      const dy = p.hy - wy;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      return {
        x: box.x + wx + dx * cos - dy * sin,
        y: box.y + lift + wy + dx * sin + dy * cos,
      };
    }

    function frame() {
      t += 1 / 60;
      ctx!.clearRect(0, 0, width, height);

      // --- Polvo de fondo con conexiones (estilo constelación) ---
      for (const d of dust) {
        if (!reduced) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0 || d.x > width) d.vx *= -1;
          if (d.y < 0 || d.y > height) d.vy *= -1;
        }
      }
      for (let i = 0; i < dust.length; i++) {
        for (let j = i + 1; j < dust.length; j++) {
          const dd = Math.hypot(dust[i].x - dust[j].x, dust[i].y - dust[j].y);
          if (dd < 110) {
            ctx!.strokeStyle = `rgba(142,230,230,${(1 - dd / 110) * 0.12})`;
            ctx!.beginPath();
            ctx!.moveTo(dust[i].x, dust[i].y);
            ctx!.lineTo(dust[j].x, dust[j].y);
            ctx!.stroke();
          }
        }
        ctx!.fillStyle = 'rgba(185,206,245,0.45)';
        ctx!.beginPath();
        ctx!.arc(dust[i].x, dust[i].y, 1, 0, Math.PI * 2);
        ctx!.fill();
      }

      // --- Pulsos de comunicación entre las dos manos ---
      if (!reduced && handSize > 0) {
        const [bl, br] = boxes();
        const ax = bl.x + handSize * 0.62;
        const bx = br.x + handSize * 0.38;
        const y0 = bl.y + handSize * 0.3;
        for (let k = 0; k < 3; k++) {
          const prog = (t * 0.35 + k / 3) % 1;
          const forward = Math.floor(t * 0.35 + k / 3) % 2 === 0;
          const px = forward ? ax + (bx - ax) * prog : bx - (bx - ax) * prog;
          const py = y0 - Math.sin(prog * Math.PI) * handSize * 0.18;
          const g = ctx!.createRadialGradient(px, py, 0, px, py, 14);
          g.addColorStop(0, forward ? 'rgba(79,212,214,0.9)' : 'rgba(255,201,60,0.9)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(px, py, 14, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // --- Partículas de las manos ---
      const R = 85; // radio de influencia del mouse
      for (const p of particles) {
        const h = home(p, t);
        if (!reduced) {
          // resorte hacia su lugar
          p.vx += (h.x - p.x) * 0.045;
          p.vy += (h.y - p.y) * 0.045;
          // el mouse empuja
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < R && d > 0.1) {
              const f = (1 - d / R) * 2.6;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }
          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x += p.vx;
          p.y += p.vy;
        }
        const twinkle = reduced ? 1 : 0.65 + Math.sin(t * 2 + p.phase) * 0.35;
        ctx!.globalAlpha = twinkle;
        ctx!.fillStyle = p.c;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // Líneas del mouse a las partículas cercanas
      if (mouse.active) {
        let n = 0;
        for (const p of particles) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < 130 && n < 40) {
            n++;
            ctx!.strokeStyle = p.hand === 0
              ? `rgba(79,212,214,${(1 - d / 130) * 0.5})`
              : `rgba(255,201,60,${(1 - d / 130) * 0.5})`;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }
      }

      if (!reduced && visible) raf = requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= width && mouse.y <= height;
    }
    function onLeave() {
      mouse.active = false;
    }

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && !reduced) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);

    build();
    frame();
    const ro = new ResizeObserver(() => {
      build();
      if (reduced) frame();
    });
    ro.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
