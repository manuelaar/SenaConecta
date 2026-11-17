import { Users, Clock, CalendarDays } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { WEEKDAY_LABELS, WEEKDAY_SHORT, durationHours, fmtHours, isThisMonth } from '@/utils/date';
import type { AvailabilitySlot } from '@/types';

export function InterpretersPage() {
  const data = useAppData();
  const interpreters = data.users.filter((u) => u.role === 'interpreter');

  return (
    <div>
      <PageHeader
        icon={<Users className="w-6 h-6" />}
        title="Intérpretes"
        description="Disponibilidad semanal y horas acumuladas"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {interpreters.map((intp) => {
          const slots = data.availabilities.filter((s) => s.interpreterId === intp.id);
          const served = data.requests.filter(
            (r) => r.interpreterId === intp.id && r.status === 'served' && r.serviceRecord
          );
          const monthHours = served
            .filter((r) => isThisMonth(r.date))
            .reduce((acc, r) => acc + durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd), 0);
          const totalHours = served.reduce(
            (acc, r) => acc + durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd),
            0
          );

          return (
            <Card key={intp.id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-lg" aria-hidden="true">
                  {intp.fullName.charAt(0)}
                </span>
                <div>
                  <h2 className="font-bold text-slate-800">{intp.fullName}</h2>
                  <p className="text-sm text-slate-500">{intp.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-accent-50 border-2 border-accent-200 p-3">
                  <p className="text-xs font-semibold text-accent-700 uppercase">Horas este mes</p>
                  <p className="text-lg font-bold text-accent-700">{fmtHours(monthHours)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border-2 border-slate-100 p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Horas totales</p>
                  <p className="text-lg font-bold text-slate-700">{fmtHours(totalHours)}</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400" aria-hidden="true" />
                Disponibilidad semanal
              </h3>
              {slots.length === 0 ? (
                <p className="text-sm text-slate-400">Sin franjas definidas.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WEEKDAY_LABELS.map((label, di) => {
                    const daySlots = slots.filter((s) => s.dayOfWeek === di).sort((a, b) => a.startTime.localeCompare(b.startTime));
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={di} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                        <p className="text-xs font-bold text-slate-600">{WEEKDAY_SHORT[di]}</p>
                        {daySlots.map((s: AvailabilitySlot) => (
                          <p key={s.id} className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {s.startTime}–{s.endTime}
                          </p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {interpreters.length === 0 && (
        <Card>
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="No hay intérpretes"
            description="Registra intérpretes en el sistema para ver su disponibilidad."
          />
        </Card>
      )}
    </div>
  );
}
