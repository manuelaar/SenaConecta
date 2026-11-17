import { useMemo, useState } from 'react';
import { BarChart3, Download, Printer, AlertCircle, FileText } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAppData } from '@/hooks/useAppData';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable } from '@/components/ui/DataTable';
import { Input, Select } from '@/components/ui/Input';
import {
  formatDate,
  durationHours,
  fmtHours,
  todayStr,
  dateFromOffset,
  isInRange,
} from '@/utils/date';
import { userName } from '@/services/notifications';
import type { ServiceRequest } from '@/types';

function toCSV(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => escape(r[h])).join(','));
  }
  return lines.join('\n');
}

function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const data = useAppData();
  const [start, setStart] = useState(dateFromOffset(-90));
  const [end, setEnd] = useState(todayStr());
  const [interpreterId, setInterpreterId] = useState('all');
  const [studentId, setStudentId] = useState('all');
  const [error, setError] = useState('');

  const interpreters = data.users.filter((u) => u.role === 'interpreter');
  const students = data.users.filter((u) => u.role === 'student');

  const inRange = useMemo(() => {
    if (!start || !end) return [];
    if (start > end) { setError('La fecha de inicio debe ser anterior a la de fin.'); return []; }
    setError('');
    return data.requests.filter((r) => isInRange(r.date, start, end));
  }, [data.requests, start, end]);

  const filtered = useMemo(() => {
    return inRange.filter((r) => {
      if (interpreterId !== 'all' && r.interpreterId !== interpreterId) return false;
      if (studentId !== 'all' && r.studentId !== studentId) return false;
      return true;
    });
  }, [inRange, interpreterId, studentId]);

  const served = filtered.filter((r) => r.status === 'served' && r.serviceRecord);
  const cancelled = filtered.filter((r) => r.status === 'cancelled');
  // No atendidas: llegaron a su fecha sin confirmarse (pendientes o asignadas con fecha pasada)
  const unattended = filtered.filter(
    (r) => (r.status === 'pending' || r.status === 'assigned') && r.date < todayStr()
  );

  const totalHours = served.reduce(
    (acc, r) => acc + durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd),
    0
  );

  const hoursByInterpreter = interpreters
    .map((intp) => {
      const hrs = served
        .filter((r) => r.interpreterId === intp.id)
        .reduce((acc, r) => acc + durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd), 0);
      const count = served.filter((r) => r.interpreterId === intp.id).length;
      return {
        id: intp.id,
        name: intp.fullName,
        servicios: count,
        horas: Number(hrs.toFixed(2)),
      };
    })
    .filter((x) => x.servicios > 0);

  function handleExport() {
    const rows = served.map((r) => ({
      Fecha: r.date,
      Asignatura: r.subject,
      Estudiante: userName(data, r.studentId),
      Intérprete: userName(data, r.interpreterId),
      'Hora inicio': r.serviceRecord!.realStart,
      'Hora fin': r.serviceRecord!.realEnd,
      Horas: durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd).toFixed(2),
      Asistió: r.serviceRecord!.studentAttended ? 'Sí' : 'No',
    }));
    downloadCSV(`reporte_senaconecta_${start}_${end}.csv`, toCSV(rows));
  }

  const hasResults = filtered.length > 0;

  return (
    <div>
      <PageHeader
        icon={<BarChart3 className="w-6 h-6" />}
        title="Reportes"
        description="Genera reportes por rango de fechas"
      />

      <Card className="mb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <Input
            label="Desde (obligatorio)"
            name="start"
            type="date"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
            error={error || undefined}
          />
          <Input
            label="Hasta (obligatorio)"
            name="end"
            type="date"
            required
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <Select
            label="Intérprete (opcional)"
            name="interpreter"
            value={interpreterId}
            onChange={(e) => setInterpreterId(e.target.value)}
            placeholder="Todos"
            options={interpreters.map((i) => ({ value: i.id, label: i.fullName }))}
          />
          <Select
            label="Estudiante (opcional)"
            name="student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Todos"
            options={students.map((s) => ({ value: s.id, label: s.fullName }))}
          />
        </div>

        <div className="flex flex-wrap gap-3 mt-4 justify-end">
          <Button variant="outline" onClick={() => window.print()} disabled={!hasResults}>
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button variant="accent" onClick={handleExport} disabled={!hasResults}>
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </Card>

      {error ? (
        <Card>
          <EmptyState
            icon={<AlertCircle className="w-7 h-7" />}
            title="Rango inválido"
            description={error}
          />
        </Card>
      ) : !hasResults ? (
        <Card>
          <EmptyState
            icon={<FileText className="w-7 h-7" />}
            title="Sin resultados"
            description="No hay solicitudes en el rango seleccionado. Cambia las fechas o los filtros."
          />
        </Card>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <SummaryCard label="Servicios prestados" value={String(served.length)} />
            <SummaryCard label="Horas totales" value={fmtHours(totalHours)} />
            <SummaryCard label="Solicitudes canceladas" value={String(cancelled.length)} />
            <SummaryCard label="No atendidas" value={String(unattended.length)} />
          </div>

          {/* Horas por intérprete */}
          <Card className="mb-6" title="Horas por intérprete" icon={<BarChart3 className="w-5 h-5" />}>
            {hoursByInterpreter.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No hay servicios prestados en el rango.</p>
            ) : (
              <>
                <div className="w-full h-72 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hoursByInterpreter} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(v) => [`${v} h`, 'Horas']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="horas" fill="#0E7C80" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <DataTable
                  rowKey={(r) => r.id}
                  data={hoursByInterpreter}
                  columns={[
                    { key: 'name', header: 'Intérprete', render: (r) => r.name },
                    { key: 'servicios', header: 'Servicios', render: (r) => r.servicios },
                    { key: 'horas', header: 'Horas', render: (r) => fmtHours(r.horas) },
                  ]}
                />
              </>
            )}
          </Card>

          {/* Detalle de servicios */}
          <Card className="mb-6" title="Detalle de servicios prestados" icon={<FileText className="w-5 h-5" />}>
            <DataTable
              rowKey={(r) => r.id}
              data={served as ServiceRequest[]}
              columns={[
                { key: 'date', header: 'Fecha', render: (r) => formatDate(r.date) },
                { key: 'subject', header: 'Asignatura', render: (r) => r.subject },
                { key: 'student', header: 'Estudiante', render: (r) => userName(data, r.studentId) },
                { key: 'interpreter', header: 'Intérprete', render: (r) => userName(data, r.interpreterId) },
                {
                  key: 'hours',
                  header: 'Horas',
                  render: (r) => fmtHours(durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd)),
                },
              ]}
            />
          </Card>

          {/* Canceladas y no atendidas */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card title={`Solicitudes canceladas (${cancelled.length})`}>
              {cancelled.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Ninguna en el rango.</p>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {cancelled.map((r) => (
                    <li key={r.id} className="py-3">
                      <p className="font-semibold text-slate-800">{r.subject}</p>
                      <p className="text-sm text-slate-500">{formatDate(r.date)} · {userName(data, r.studentId)}</p>
                      {r.cancelReason && <p className="text-sm text-cancelled-fg">Motivo: {r.cancelReason}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title={`Solicitudes no atendidas (${unattended.length})`}>
              {unattended.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Ninguna en el rango.</p>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {unattended.map((r) => (
                    <li key={r.id} className="py-3">
                      <p className="font-semibold text-slate-800">{r.subject}</p>
                      <p className="text-sm text-slate-500">{formatDate(r.date)} · {userName(data, r.studentId)}</p>
                      <p className="text-sm text-pending-fg">
                        Llegó a su fecha sin confirmarse (estado: {r.status === 'pending' ? 'Pendiente' : 'Asignada'}).
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </Card>
  );
}
