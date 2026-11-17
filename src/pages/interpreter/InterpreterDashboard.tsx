import { Link } from 'react-router-dom';
import { CalendarClock, UserCheck, Clock, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, isThisMonth, durationHours, fmtHours, todayStr } from '@/utils/date';
import { userName } from '@/services/notifications';

export function InterpreterDashboard() {
  const { user } = useAuth();
  const data = useAppData();
  if (!user) return null;

  const myAssignments = data.requests.filter(
    (r) => r.interpreterId === user.id && (r.status === 'assigned' || r.status === 'confirmed')
  );
  const toConfirm = myAssignments.filter((r) => r.status === 'assigned');
  const upcoming = myAssignments
    .filter((r) => r.date >= todayStr())
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  // Horas del mes (servicios prestados este mes)
  const servedThisMonth = data.requests.filter(
    (r) =>
      r.interpreterId === user.id &&
      r.status === 'served' &&
      r.serviceRecord &&
      isThisMonth(r.date)
  );
  const hoursThisMonth = servedThisMonth.reduce(
    (acc, r) => acc + durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd),
    0
  );

  return (
    <div>
      <PageHeader
        icon={<UserCheck className="w-6 h-6" />}
        title={`Hola, ${user.fullName.split(' ')[0]}`}
        description="Tus asignaciones y servicios"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-pending-bg text-pending-fg flex items-center justify-center" aria-hidden="true">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Por confirmar</p>
              <p className="text-2xl font-bold text-slate-800">{toConfirm.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-assigned-bg text-assigned-fg flex items-center justify-center" aria-hidden="true">
              <CalendarClock className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Próximos servicios</p>
              <p className="text-2xl font-bold text-slate-800">{upcoming.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center" aria-hidden="true">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Horas este mes</p>
              <p className="text-2xl font-bold text-slate-800">{fmtHours(hoursThisMonth)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card
          title="Asignaciones por confirmar"
          description="Revisa y acepta o rechaza"
          icon={<ClipboardCheck className="w-5 h-5" />}
          actions={
            <Link to="/interprete/asignaciones">
              <Button size="sm" variant="ghost">Ver todas</Button>
            </Link>
          }
        >
          {toConfirm.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="w-7 h-7" />}
              title="Nada por confirmar"
              description="No tienes asignaciones pendientes de confirmar."
            />
          ) : (
            <ul className="divide-y divide-slate-50">
              {toConfirm.map((r) => (
                <li key={r.id} className="py-3">
                  <p className="font-semibold text-slate-800">{r.subject}</p>
                  <p className="text-sm text-slate-500">{formatDate(r.date)} · {r.startTime}–{r.endTime}</p>
                  <p className="text-sm text-slate-600">{r.location} · {userName(data, r.studentId)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Próximos servicios"
          icon={<CalendarClock className="w-5 h-5" />}
          actions={
            <Link to="/interprete/servicios">
              <Button size="sm" variant="ghost">Historial</Button>
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="w-7 h-7" />}
              title="Sin servicios próximos"
              description="Cuando confirmes asignaciones aparecerán aquí."
            />
          ) : (
            <ul className="divide-y divide-slate-50">
              {upcoming.slice(0, 6).map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-slate-800">{r.subject}</p>
                    <p className="text-sm text-slate-500">{formatDate(r.date)} · {r.startTime}–{r.endTime}</p>
                    <p className="text-sm text-slate-600">{r.location} · {userName(data, r.studentId)}</p>
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
