import { useMemo, useState } from 'react';
import { History, Filter, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { formatDate, durationHours, fmtHours, todayStr, dateFromOffset, isInRange } from '@/utils/date';
import { userName } from '@/services/notifications';
import type { ServiceRequest } from '@/types';

export function MyServicesPage() {
  const { user } = useAuth();
  const data = useAppData();
  const [start, setStart] = useState(dateFromOffset(-90));
  const [end, setEnd] = useState(todayStr());

  if (!user) return null;

  const served = useMemo(
    () =>
      data.requests
        .filter(
          (r) =>
            r.interpreterId === user.id &&
            r.status === 'served' &&
            r.serviceRecord &&
            isInRange(r.date, start, end)
        )
        .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + b.startTime)),
    [data.requests, user.id, start, end]
  );

  const totalHours = served.reduce(
    (acc, r) => acc + durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd),
    0
  );

  return (
    <div>
      <PageHeader
        icon={<History className="w-6 h-6" />}
        title="Mis servicios"
        description="Historial de servicios prestados"
      />

      <Card className="mb-4">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <Input label="Desde" name="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input label="Hasta" name="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <div className="rounded-xl bg-accent-50 border-2 border-accent-200 p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-accent-600" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-accent-700 uppercase">Total del periodo</p>
              <p className="text-lg font-bold text-accent-700">{fmtHours(totalHours)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        {served.length === 0 ? (
          <EmptyState
            icon={<History className="w-7 h-7" />}
            title="Sin servicios en este rango"
            description="Cambia el rango de fechas o registra servicios prestados."
          />
        ) : (
          <DataTable
            rowKey={(r) => r.id}
            data={served}
            columns={[
              { key: 'date', header: 'Fecha', render: (r) => <span>{formatDate(r.date)}</span> },
              { key: 'subject', header: 'Asignatura', render: (r) => r.subject },
              { key: 'student', header: 'Estudiante', render: (r) => userName(data, r.studentId) },
              { key: 'hours', header: 'Horas', render: (r) => fmtHours(durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd)) },
              { key: 'attended', header: 'Asistencia', render: (r) => r.serviceRecord!.studentAttended ? 'Sí' : 'No' },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
