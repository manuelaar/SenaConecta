import { Link } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  UserCheck,
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppData } from '@/hooks/useAppData';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  formatDate,
  isThisMonth,
  isWithin48Hours,
  durationHours,
  fmtHours,
  todayStr,
} from '@/utils/date';
import { userName } from '@/services/notifications';
import { STATUS_META } from '@/types';
import type { RequestStatus } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function CoordinatorDashboard() {
  const data = useAppData();

  const monthReqs = data.requests.filter((r) => isThisMonth(r.date));
  const counts: Record<RequestStatus, number> = {
    pending: 0,
    assigned: 0,
    confirmed: 0,
    served: 0,
    cancelled: 0,
  };
  monthReqs.forEach((r) => { counts[r.status]++; });

  const servedHours = monthReqs
    .filter((r) => r.status === 'served' && r.serviceRecord)
    .reduce(
      (acc, r) => acc + durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd),
      0
    );

  // Urgentes: próximas 48h sin intérprete (pendientes)
  const urgent = data.requests
    .filter(
      (r) =>
        r.status === 'pending' &&
        r.date >= todayStr() &&
        isWithin48Hours(r.date, r.startTime)
    )
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  // Horas por intérprete (este mes)
  const interpreterHours = data.users
    .filter((u) => u.role === 'interpreter')
    .map((u) => {
      const hrs = monthReqs
        .filter((r) => r.interpreterId === u.id && r.status === 'served' && r.serviceRecord)
        .reduce(
          (acc, r) => acc + durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd),
          0
        );
      return { name: u.fullName.split(' ')[0], horas: Number(hrs.toFixed(2)) };
    })
    .filter((x) => x.horas > 0);

  const summaryCards: { status: RequestStatus; icon: React.ReactNode; bg: string; fg: string }[] = [
    { status: 'pending', icon: <Clock className="w-5 h-5" />, bg: 'bg-pending-bg', fg: 'text-pending-fg' },
    { status: 'assigned', icon: <UserCheck className="w-5 h-5" />, bg: 'bg-assigned-bg', fg: 'text-assigned-fg' },
    { status: 'confirmed', icon: <CalendarCheck className="w-5 h-5" />, bg: 'bg-confirmed-bg', fg: 'text-confirmed-fg' },
    { status: 'served', icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-served-bg', fg: 'text-served-fg' },
  ];

  return (
    <div>
      <PageHeader
        icon={<BarChart3 className="w-6 h-6" />}
        title="Panel del coordinador"
        description="Resumen del mes y solicitudes urgentes"
        actions={
          <Link to="/coordinador/pendientes">
            <Button size="sm">
              <Clock className="w-4 h-4" />
              Ver pendientes
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {summaryCards.map((c) => (
          <Card key={c.status} className="p-4">
            <div className="flex items-center gap-3">
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.fg}`}
                aria-hidden="true"
              >
                {c.icon}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">{STATUS_META[c.status].label}</p>
                <p className="text-2xl font-bold text-slate-800">{counts[c.status]}</p>
              </div>
            </div>
          </Card>
        ))}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center" aria-hidden="true">
              <Timer className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Horas totales</p>
              <p className="text-2xl font-bold text-slate-800">{fmtHours(servedHours)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="Horas por intérprete (mes)"
          icon={<BarChart3 className="w-5 h-5" />}
        >
          {interpreterHours.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="w-7 h-7" />}
              title="Sin datos este mes"
              description="Aún no se han prestado servicios este mes."
            />
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interpreterHours} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [`${v} h`, 'Horas']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="horas" fill="#0E7C80" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          title="Solicitudes urgentes"
          description="Próximas 48 h sin intérprete"
          icon={<AlertTriangle className="w-5 h-5" />}
          actions={
            <Link to="/coordinador/pendientes">
              <Button size="sm" variant="ghost">Ver todas</Button>
            </Link>
          }
        >
          {urgent.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="w-7 h-7" />}
              title="Sin urgencias"
              description="No hay solicitudes sin intérprete en las próximas 48 horas."
            />
          ) : (
            <ul className="divide-y divide-slate-50">
              {urgent.slice(0, 6).map((r) => (
                <li key={r.id} className="py-3">
                  <p className="font-semibold text-slate-800">{r.subject}</p>
                  <p className="text-sm text-slate-500">{formatDate(r.date)} · {r.startTime}–{r.endTime}</p>
                  <p className="text-sm text-slate-600">{r.location} · {userName(data, r.studentId)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
