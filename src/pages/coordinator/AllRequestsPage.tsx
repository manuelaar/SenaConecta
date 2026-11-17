import { useMemo, useState } from 'react';
import { ClipboardList, Search, Filter } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/date';
import { userName } from '@/services/notifications';
import { STATUS_META } from '@/types';
import type { RequestStatus } from '@/types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  ...(['pending', 'assigned', 'confirmed', 'served', 'cancelled'] as RequestStatus[]).map((s) => ({
    value: s,
    label: STATUS_META[s].label,
  })),
];

export function AllRequestsPage() {
  const data = useAppData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [interpreter, setInterpreter] = useState('all');

  const interpreters = data.users.filter((u) => u.role === 'interpreter');

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data.requests
      .filter((r) => {
        if (status !== 'all' && r.status !== status) return false;
        if (dateFilter && r.date !== dateFilter) return false;
        if (interpreter !== 'all' && r.interpreterId !== interpreter) return false;
        if (s) {
          const studentName = userName(data, r.studentId).toLowerCase();
          const interpName = userName(data, r.interpreterId).toLowerCase();
          if (
            !r.subject.toLowerCase().includes(s) &&
            !r.location.toLowerCase().includes(s) &&
            !studentName.includes(s) &&
            !interpName.includes(s)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  }, [data, search, status, dateFilter, interpreter]);

  return (
    <div>
      <PageHeader
        icon={<ClipboardList className="w-6 h-6" />}
        title="Todas las solicitudes"
        description="Busca y filtra todas las solicitudes del sistema"
      />

      <Card className="mb-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar asignatura, lugar, estudiante..."
              aria-label="Buscar"
              className="w-full rounded-lg border-2 border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-accent-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por estado"
            className="rounded-lg border-2 border-slate-300 px-3 py-2 text-sm focus:border-accent-500"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filtrar por fecha"
            className="rounded-lg border-2 border-slate-300 px-3 py-2 text-sm focus:border-accent-500"
          />
          <select
            value={interpreter}
            onChange={(e) => setInterpreter(e.target.value)}
            aria-label="Filtrar por intérprete"
            className="rounded-lg border-2 border-slate-300 px-3 py-2 text-sm focus:border-accent-500"
          >
            <option value="all">Todos los intérpretes</option>
            {interpreters.map((i) => <option key={i.id} value={i.id}>{i.fullName}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Filter className="w-7 h-7" />}
            title="Sin resultados"
            description="Ajusta los filtros para ver solicitudes."
          />
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3">{filtered.length} solicitudes encontradas</p>
            <DataTable
              rowKey={(r) => r.id}
              data={filtered}
              columns={[
                { key: 'date', header: 'Fecha', render: (r) => <span>{formatDate(r.date)}</span> },
                { key: 'time', header: 'Hora', render: (r) => `${r.startTime}–${r.endTime}` },
                { key: 'subject', header: 'Asignatura', render: (r) => r.subject },
                { key: 'student', header: 'Estudiante', render: (r) => userName(data, r.studentId) },
                { key: 'interpreter', header: 'Intérprete', render: (r) => userName(data, r.interpreterId) },
                { key: 'status', header: 'Estado', render: (r) => <StatusBadge status={r.status} size="sm" /> },
              ]}
            />
          </>
        )}
      </Card>
    </div>
  );
}
