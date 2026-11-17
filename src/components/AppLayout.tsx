import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HandHelping,
  LogOut,
  Menu,
  X,
  Type,
  UserCircle,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Info,
  CalendarDays,
  UserCheck,
  ClipboardCheck,
  History,
  Clock,
  Users,
  BarChart3,
  Mail,
} from 'lucide-react';
import type { Role } from '@/types';
import { ROLE_LABELS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useFontSize } from '@/context/FontSizeContext';
import { NotificationBell } from '@/components/NotificationBell';
import { resetToSeed } from '@/services/storage';
import { useToast } from '@/context/ToastContext';
import { useAppData } from '@/hooks/useAppData';
import { cn } from '@/utils/cn';
import { ConfirmModal } from '@/components/ui/Modal';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const HomeIcon = LayoutDashboard;
const PlusIcon = PlusCircle;
const ListIcon = ClipboardList;
const InfoIcon = Info;
const CalendarIcon = CalendarDays;
const UserCheckIcon = UserCheck;
const ClipboardIcon = ClipboardCheck;
const HistoryIcon = History;
const ClockIcon = Clock;
const UsersIcon = Users;
const ChartIcon = BarChart3;
const MailIcon = Mail;

const NAV: Record<Role, NavItem[]> = {
  student: [
    { to: '/estudiante', label: 'Inicio', icon: HomeIcon },
    { to: '/estudiante/nueva', label: 'Nueva solicitud', icon: PlusIcon },
    { to: '/estudiante/solicitudes', label: 'Mis solicitudes', icon: ListIcon },
    { to: '/estudiante/acerca', label: 'Acerca de', icon: InfoIcon },
  ],
  interpreter: [
    { to: '/interprete', label: 'Inicio', icon: HomeIcon },
    { to: '/interprete/disponibilidad', label: 'Mi disponibilidad', icon: CalendarIcon },
    { to: '/interprete/asignaciones', label: 'Mis asignaciones', icon: UserCheckIcon },
    { to: '/interprete/registrar', label: 'Registrar servicio', icon: ClipboardIcon },
    { to: '/interprete/servicios', label: 'Mis servicios', icon: HistoryIcon },
    { to: '/interprete/acerca', label: 'Acerca de', icon: InfoIcon },
  ],
  coordinator: [
    { to: '/coordinador', label: 'Panel', icon: HomeIcon },
    { to: '/coordinador/pendientes', label: 'Solicitudes pendientes', icon: ClockIcon },
    { to: '/coordinador/solicitudes', label: 'Todas las solicitudes', icon: ListIcon },
    { to: '/coordinador/interpretes', label: 'Intérpretes', icon: UsersIcon },
    { to: '/coordinador/reportes', label: 'Reportes', icon: ChartIcon },
    { to: '/coordinador/correos', label: 'Bandeja de correos', icon: MailIcon },
    { to: '/coordinador/acerca', label: 'Acerca de', icon: InfoIcon },
  ],
};

export function AppLayout() {
  const { user, logout } = useAuth();
  const { cycle, label } = useFontSize();
  const { push } = useToast();
  const data = useAppData();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!user) return null;

  const items = NAV[user.role];

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleReset() {
    resetToSeed();
    push({ type: 'success', title: 'Datos restablecidos', message: 'Se cargaron los datos de demostración.' });
    setResetOpen(false);
    navigate(`/${rolePath(user!.role)}`);
  }

  return (
    <div className="min-h-screen bg-canvas flex">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>

      {/* Sidebar escritorio */}
      <aside
        className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-primary-700 via-primary-800 to-night text-white fixed inset-y-0 left-0 z-40 overflow-hidden"
        aria-label="Navegación principal"
      >
        <SidebarContent items={items} />
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-primary-700 via-primary-800 to-night text-white flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent items={items} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="lg:hidden flex items-center gap-2 text-primary-600 font-bold">
                <HandHelping className="w-5 h-5" />
                <span>SeñaConecta</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cycle}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 text-sm font-medium"
                aria-label={`Tamaño del texto: ${label}. Cambiar tamaño.`}
                title={label}
              >
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>

              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100"
                  aria-expanded={userMenuOpen}
                  aria-label="Menú de usuario"
                >
                  <span className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.fullName.charAt(0)}
                  </span>
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-slate-800">{user.fullName}</span>
                    <span className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</span>
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-card border border-slate-100 z-[100] overflow-hidden"
                    role="menu"
                  >
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <p className="text-xs text-accent-600 font-semibold mt-1">{ROLE_LABELS[user.role]}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => { setResetOpen(true); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                        role="menuitem"
                      >
                        <UserCircle className="w-4 h-4 text-slate-400" />
                        Restablecer datos de demostración
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-cancelled-fg hover:bg-cancelled-bg rounded-lg flex items-center gap-2"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <ConfirmModal
        open={resetOpen}
        title="Restablecer datos de demostración"
        message="Esto borrará todos los cambios y volverá a cargar los datos de ejemplo. ¿Deseas continuar?"
        confirmLabel="Sí, restablecer"
        onConfirm={handleReset}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );

  function SidebarContent({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
    return (
      <>
        {/* Brillo decorativo */}
        <div className="pointer-events-none absolute -top-24 -left-20 w-64 h-64 rounded-full bg-gold-400/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 -right-24 w-56 h-56 rounded-full bg-accent-400/15 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-gold-300 to-accent-300 flex items-center justify-center shrink-0">
            <HandHelping className="w-6 h-6 text-night" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display font-bold text-lg leading-tight">SeñaConecta</p>
            <p className="text-xs text-accent-200">Intérpretes de LSC</p>
          </div>
        </div>
        <nav className="relative flex-1 p-3 overflow-y-auto" aria-label="Menú del rol">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === `/${rolePath(user!.role)}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-white text-primary-700 shadow-glow'
                        : 'text-white/90 hover:bg-white/10 hover:translate-x-0.5'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="relative p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/70">
            <p>{data.users.length} usuarios en demo</p>
            <p>{data.requests.length} solicitudes</p>
          </div>
        </div>
      </>
    );
  }
}

function rolePath(role: Role): string {
  return role === 'student' ? 'estudiante' : role === 'interpreter' ? 'interprete' : 'coordinador';
}
