import { useEffect, useState } from 'react';
import { ClipboardCheck, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { formatDate, todayStr, isPastDate, isEndBeforeStart, isPast, durationHours, fmtHours } from '@/utils/date';
import { userName } from '@/services/notifications';
import { registerService } from '@/services/actions';
import type { ServiceRequest } from '@/types';

export function RegisterServicePage() {
  const { user } = useAuth();
  const data = useAppData();
  const { push } = useToast();
  const [target, setTarget] = useState<ServiceRequest | null>(null);

  if (!user) return null;

  // Solicitudes confirmadas cuya fecha ya llegó (hoy o antes)
  const eligible = data.requests
    .filter(
      (r) =>
        r.interpreterId === user.id &&
        r.status === 'confirmed' &&
        r.date <= todayStr()
    )
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + b.startTime));

  // Servicios ya prestados por mí
  const served = data.requests
    .filter((r) => r.interpreterId === user.id && r.status === 'served')
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + b.startTime));

  return (
    <div>
      <PageHeader
        icon={<ClipboardCheck className="w-6 h-6" />}
        title="Registrar servicio"
        description="Confirma que prestaste el servicio y registra las horas reales"
      />

      <Card className="mb-6" title="Pendientes por registrar" description="Solicitudes confirmadas cuya fecha ya llegó">
        {eligible.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="w-7 h-7" />}
            title="Nada por registrar"
            description="No tienes servicios confirmados cuya fecha ya haya llegado."
          />
        ) : (
          <ul className="divide-y divide-slate-50">
            {eligible.map((r) => (
              <li key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">{r.subject}</p>
                  <p className="text-sm text-slate-500">{formatDate(r.date)} · {r.startTime}–{r.endTime}</p>
                  <p className="text-sm text-slate-600">{r.location} · {userName(data, r.studentId)}</p>
                </div>
                <Button size="sm" onClick={() => setTarget(r)}>
                  <ClipboardCheck className="w-4 h-4" />
                  Registrar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Servicios ya registrados" description="Historial reciente">
        {served.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Aún no has registrado servicios.</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {served.slice(0, 8).map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-slate-800">{r.subject}</p>
                  <p className="text-sm text-slate-500">{formatDate(r.date)} · {userName(data, r.studentId)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    {fmtHours(durationHours(r.serviceRecord!.realStart, r.serviceRecord!.realEnd))}
                  </span>
                  <StatusBadge status="served" size="sm" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <RegisterModal target={target} onClose={() => setTarget(null)} />
    </div>
  );

  function RegisterModal({ target, onClose }: { target: ServiceRequest | null; onClose: () => void }) {
    const [attended, setAttended] = useState('yes');
    const [realStart, setRealStart] = useState('');
    const [realEnd, setRealEnd] = useState('');
    const [observations, setObservations] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Inicializar cuando se abre
    useEffect(() => {
      if (target) {
        setRealStart(target.startTime);
        setRealEnd(target.endTime);
        setAttended('yes');
        setObservations('');
        setErrors({});
      }
    }, [target]);

    function save() {
      if (!target) return;
      const e: Record<string, string> = {};
      if (!realStart) e.realStart = 'Requerido';
      if (!realEnd) e.realEnd = 'Requerido';
      if (realEnd && realStart && isEndBeforeStart(realStart, realEnd)) e.realEnd = 'La hora de fin debe ser mayor que la de inicio.';
      if (isPastDate(target.date) === false && !isPast(target.date, realStart)) {
        // fecha futura no permitida — pero ya filtramos fecha <= hoy
      }
      setErrors(e);
      if (Object.keys(e).length > 0) return;

      registerService(target.id, {
        studentAttended: attended === 'yes',
        realStart,
        realEnd,
        observations: observations || undefined,
      });
      push({ type: 'success', title: 'Servicio registrado', message: `Se registró "${target.subject}" como Prestada.` });
      onClose();
    }

    return (
      <Modal
        open={!!target}
        title="Registrar servicio prestado"
        description={target ? `${target.subject} · ${formatDate(target.date)}` : ''}
        onClose={onClose}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="accent" onClick={save}>
              <Check className="w-4 h-4" />
              Guardar registro
            </Button>
          </>
        }
      >
        {target && (
          <div className="flex flex-col gap-4">
            <Select
              label="¿Asistió el estudiante?"
              name="attended"
              value={attended}
              onChange={(e) => setAttended(e.target.value)}
              options={[
                { value: 'yes', label: 'Sí asistió' },
                { value: 'no', label: 'No asistió' },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Hora real de inicio"
                name="realStart"
                type="time"
                value={realStart}
                onChange={(e) => setRealStart(e.target.value)}
                error={errors.realStart}
              />
              <Input
                label="Hora real de fin"
                name="realEnd"
                type="time"
                value={realEnd}
                onChange={(e) => setRealEnd(e.target.value)}
                error={errors.realEnd}
              />
            </div>
            <Textarea
              label="Observaciones (opcional)"
              name="obs"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
            />
          </div>
        )}
      </Modal>
    );
  }
}
