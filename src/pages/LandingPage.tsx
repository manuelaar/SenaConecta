import { Link } from 'react-router-dom';
import {
  HandHelping,
  LogIn,
  UserPlus,
  GraduationCap,
  Languages,
  ShieldCheck,
  CalendarPlus,
  UserCheck,
  BellRing,
  BarChart3,
  Eye,
  Contrast,
  Keyboard,
  Type,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AuroraBackground } from '@/components/fx/AuroraBackground';
import { TiltScene } from '@/components/fx/TiltScene';

// Botones como enlaces (un <a> no debe contener un <button>)
const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-offset-4';
const btnAurora =
  `${btnBase} px-6 py-3.5 text-white bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-[length:200%_100%] bg-left hover:bg-right shadow-glow hover:-translate-y-0.5`;
const btnGlass = `${btnBase} px-6 py-3.5 text-white glass-dark hover:bg-white/10 hover:-translate-y-0.5`;

function onSpotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <a href="#contenido" className="skip-link">Saltar al contenido</a>

      {/* ============ HERO ============ */}
      <AuroraBackground className="pb-24 sm:pb-32">
        <header className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 text-white" aria-label="SeñaConecta, inicio">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-gold-300 to-accent-300 flex items-center justify-center">
                <HandHelping className="w-6 h-6 text-night" aria-hidden="true" />
              </span>
              <span className="font-display font-bold text-base sm:text-lg tracking-tight">SeñaConecta</span>
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm text-primary-100" aria-label="Secciones">
              <a href="#roles" className="hover:text-white transition-colors">Roles</a>
              <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
              <a href="#accesibilidad" className="hover:text-white transition-colors">Accesibilidad</a>
              <Link to="/acerca" className="hover:text-white transition-colors">Acerca de</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/login" className={`${btnBase} px-2.5 sm:px-3.5 py-2 text-sm text-white hover:bg-white/10`}>
                <LogIn className="w-4 h-4 hidden sm:block" aria-hidden="true" />
                <span className="hidden sm:inline">Iniciar sesión</span>
                <span className="sm:hidden">Entrar</span>
              </Link>
              <Link to="/registro" className={`${btnBase} px-3 sm:px-3.5 py-2 text-sm text-night bg-white hover:bg-primary-100`}>
                <UserPlus className="w-4 h-4 hidden sm:block" aria-hidden="true" />
                Registrarse
              </Link>
            </div>
          </div>
        </header>

        <main id="contenido" className="relative z-10 max-w-6xl mx-auto px-4 pt-10 sm:pt-16 grid lg:grid-cols-2 gap-14 items-center">
          <section>
            <p className="rise-in inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-sm text-primary-100">
              <Sparkles className="w-4 h-4 text-accent-300" aria-hidden="true" />
              Lengua de Señas Colombiana · Oficina de Inclusión
            </p>
            <h1 className="rise-in-2 mt-6 font-display text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Que ninguna clase se quede sin <span className="text-aurora">intérprete</span>.
            </h1>
            <p className="rise-in-3 mt-6 text-lg text-primary-100 max-w-xl">
              SeñaConecta centraliza las solicitudes de intérpretes de LSC: los estudiantes sordos piden apoyo
              en segundos, la oficina de inclusión asigna sin cruces de horario y todos reciben la confirmación a tiempo.
            </p>
            <div className="rise-in-3 mt-9 flex flex-col sm:flex-row gap-3">
              <Link to="/login" className={btnAurora}>
                Solicitar intérprete
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link to="/registro" className={btnGlass}>
                <UserPlus className="w-5 h-5" aria-hidden="true" />
                Crear cuenta
              </Link>
            </div>
            <dl className="rise-in-3 mt-12 grid grid-cols-3 gap-4 max-w-md">
              {[
                ['3', 'roles conectados'],
                ['100%', 'visual, sin audio'],
                ['AA', 'WCAG 2.1'],
              ].map(([n, l]) => (
                <div key={l} className="border-l border-white/15 pl-4">
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-3xl font-bold text-white">{n}</dd>
                  <dd className="text-sm text-primary-200">{l}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rise-in-2" aria-label="Vista previa de la aplicación">
            <TiltScene />
          </section>
        </main>
      </AuroraBackground>

      {/* ============ ROLES ============ */}
      <section id="roles" className="relative -mt-14 max-w-6xl mx-auto px-4" aria-labelledby="roles-title">
        <h2 id="roles-title" className="sr-only">Roles del sistema</h2>
        <div className="grid gap-5 md:grid-cols-3">
          <RoleCard
            icon={<GraduationCap className="w-6 h-6" />}
            title="Estudiante"
            description="Solicita intérpretes para tus clases y actividades, sigue el estado de cada solicitud y recibe confirmaciones visuales."
          />
          <RoleCard
            icon={<Languages className="w-6 h-6" />}
            title="Intérprete"
            description="Administra tu disponibilidad semanal, acepta o rechaza asignaciones y registra los servicios que prestas."
          />
          <RoleCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Coordinador de inclusión"
            description="Asigna intérpretes según disponibilidad, supervisa todas las solicitudes y genera reportes para planear."
          />
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-4 py-24" aria-labelledby="como-title">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-600">Cómo funciona</p>
          <h2 id="como-title" className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
            De la solicitud al servicio, en cuatro pasos
          </h2>
        </div>
        <div className="relative mt-16">
          <div
            className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary-400 via-gold-300 to-accent-400"
            aria-hidden="true"
          />
        <ol className="relative grid gap-10 md:grid-cols-4">
          {[
            { icon: CalendarPlus, t: 'Solicita', d: 'El estudiante indica asignatura, fecha, hora y lugar.' },
            { icon: UserCheck, t: 'Asigna', d: 'La coordinación ve solo intérpretes libres en esa franja.' },
            { icon: BellRing, t: 'Confirma', d: 'El intérprete acepta y todos reciben la notificación.' },
            { icon: BarChart3, t: 'Reporta', d: 'Se registran las horas y se generan reportes.' },
          ].map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="relative text-center">
              <span className="relative z-10 mx-auto w-14 h-14 rounded-2xl bg-white border-aurora shadow-card flex items-center justify-center text-primary-600">
                <Icon className="w-6 h-6" aria-hidden="true" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-500">Paso {i + 1}</p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{t}</h3>
              <p className="mt-2 text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
        </div>
      </section>

      {/* ============ ACCESIBILIDAD ============ */}
      <section id="accesibilidad" className="max-w-6xl mx-auto px-4 pb-24" aria-labelledby="acc-title">
        <AuroraBackground className="rounded-[2rem] px-6 py-14 sm:px-12">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-accent-300">Compromiso</p>
              <h2 id="acc-title" className="mt-3 text-3xl sm:text-4xl font-bold">
                Diseñado para <span className="text-aurora">verse</span>, no para escucharse
              </h2>
              <p className="mt-4 text-primary-100">
                Toda la información se comunica de forma visual, siguiendo las pautas WCAG 2.1 nivel AA.
              </p>
            </div>
            <ul className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
              {[
                { icon: Eye, t: '100 % visual', d: 'Sin sonidos ni alertas de audio. Todo con texto, íconos y color.' },
                { icon: Contrast, t: 'Alto contraste', d: 'Colores verificados con una relación mínima de 4.5:1.' },
                { icon: Keyboard, t: 'Teclado completo', d: 'Se puede usar todo sin mouse, con foco siempre visible.' },
                { icon: Type, t: 'Texto ampliable', d: 'Tres tamaños de letra y lenguaje claro y directo.' },
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="glass-dark rounded-2xl p-5">
                  <Icon className="w-6 h-6 text-accent-300" aria-hidden="true" />
                  <h3 className="mt-3 font-bold text-white">{t}</h3>
                  <p className="mt-1 text-sm text-primary-100">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </AuroraBackground>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="max-w-3xl mx-auto px-4 pb-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">¿Listo para probarlo?</h2>
        <p className="mt-3 text-slate-600">
          Entra con una cuenta de demostración: estudiante, intérprete o coordinación.
        </p>
        <Link to="/login" className={`${btnAurora} mt-8`}>
          Ir a la demostración
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </section>

      <footer className="border-t border-primary-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p className="flex items-center gap-2">
            <HandHelping className="w-4 h-4 text-primary-600" aria-hidden="true" />
            SeñaConecta — Oficina de Inclusión · Universidad
          </p>
          <p>Sistema de demostración. Los datos se guardan en tu navegador.</p>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <article
      onPointerMove={onSpotlight}
      className="spotlight-card group bg-white rounded-3xl shadow-card border border-primary-100/70 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
    >
      <span
        className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white flex items-center justify-center shadow-card transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        aria-hidden="true"
      >
        {icon}
      </span>
      <h3 className="relative mt-5 text-xl font-bold text-slate-900">{title}</h3>
      <p className="relative mt-2 text-slate-600">{description}</p>
    </article>
  );
}
