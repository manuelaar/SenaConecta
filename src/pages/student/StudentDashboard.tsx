import { Link } from 'react-router-dom';
import { Plus, CalendarClock, Bell, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, isWithin48Hours, todayStr } from '@/utils/date';
import { STATUS_META } from '@/types';
import type { RequestStatus } from '@/types';
import { userName } from '@/services/notifications';

export function StudentDashboard() {
  const { user } = useAuth();
  const data = useAppData();
  if (!user) return null;

  const myReqs = data.requests
    .filter((r) => r.studentId === user.id)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  const upcoming = myReqs.filter(
    (r) =>
      (r.status === 'assigned' || r.status === 'confirmed') &&
      r.date >= todayStr()
  );

  const byStatus = (s: RequestStatus) => myReqs.filter((r) => r.status === s).length;

  const myNotifs = data.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const statusCounts: RequestStatus[] = ['pending', 'assigned', 'confirmed', 'served', 'cancelled'];

  return (
    <div>
      <PageHeader
        icon={<ClipboardList className="w-6 h-6" />}
        title={`Hola, ${user.fullName.split(' ')[0]}`}
        description="Resumen de tus solicitudes de intérprete"
        actions={
          <Link to="/estudiante/nueva">
            <Button>
              <Plus className="w-4 h-4" />
              Nueva solicitud
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {statusCounts.map((s) => (
          <Card key={s} className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {STATUS_META[s].label}
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{byStatus(s)}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Próximas clases con intérprete"
            description="Solicitudes asignadas o confirmadas"
            icon={<CalendarClock className="w-5 h-5" />}
          >
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<CalendarClock className="w-7 h-7" />}
                title="No tienes clases próximas"
                description="Cuando se te asigne un intérprete aparecerá aquí."
                action={
                  <Link to="/estudiante/nueva">
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
                      Crear solicitud
                    </Button>
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-slate-50">
                {upcoming.slice(0, 6).map((r) => (
                  <li key={r.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-slate-800">{r.subject}</p>
                      <p className="text-sm text-slate-500">
                        {formatDate(r.date)} · {r.startTime}–{r.endTime} · {r.location}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        Intérprete: {userName(data, r.interpreterId)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Notificaciones recientes" icon={<Bell className="w-5 h-5" />}>
          {myNotifs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Sin notificaciones.</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {myNotifs.map((n) => (
                <li key={n.id} className={`py-3 ${!n.read ? 'bg-accent-50/40 -mx-2 px-2 rounded-lg' : ''}`}>
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Aviso urgente */}
      {myReqs.some((r) => r.status === 'pending' && isWithin48Hours(r.date, r.startTime)) && (
        <div className="mt-6 rounded-xl border-2 border-pending-border bg-pending-bg p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-pending-fg mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-pending-fg">
            Tienes solicitudes pendientes para las próximas 48 horas que aún no tienen intérprete asignado.
          </p>
        </div>
      )}
    </div>
  );
}
