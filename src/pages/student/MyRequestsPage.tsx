import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Pencil, Ban, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Textarea, Input } from '@/components/ui/Input';
import { STATUS_META } from '@/types';
import type { RequestStatus, ServiceRequest } from '@/types';
import { formatDate } from '@/utils/date';
import { userName } from '@/services/notifications';
import { cancelRequest, updateRequest } from '@/services/actions';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  ...(['pending', 'assigned', 'confirmed', 'served', 'cancelled'] as RequestStatus[]).map((s) => ({
    value: s,
    label: STATUS_META[s].label,
  })),
];

export function MyRequestsPage() {
  const { user } = useAuth();
  const data = useAppData();
  const { push } = useToast();
  const [filter, setFilter] = useState('all');
  const [cancelTarget, setCancelTarget] = useState<ServiceRequest | null>(null);
  const [editTarget, setEditTarget] = useState<ServiceRequest | null>(null);

  if (!user) return null;

  const myReqs = useMemo(
    () =>
      data.requests
        .filter((r) => r.studentId === user.id)
        .filter((r) => filter === 'all' || r.status === filter)
        .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime)),
    [data.requests, user.id, filter]
  );

  const canModify = (r: ServiceRequest) =>
    r.status === 'pending' || r.status === 'assigned' || r.status === 'confirmed';

  function handleCancel(reason: string) {
    if (!cancelTarget) return;
    cancelRequest(cancelTarget.id, reason, 'student');
    push({
      type: 'info',
      title: 'Solicitud cancelada',
      message: `Se canceló "${cancelTarget.subject}". ${
        cancelTarget.interpreterId ? 'Se notificó al intérprete y al coordinador.' : 'Se notificó al coordinador.'
      }`,
    });
    setCancelTarget(null);
  }

  return (
    <div>
      <PageHeader
        icon={<ClipboardList className="w-6 h-6" />}
        title="Mis solicitudes"
        description="Todas tus solicitudes de intérprete"
        actions={
          <Link to="/estudiante/nueva">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Nueva solicitud
            </Button>
          </Link>
        }
      />

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <label htmlFor="filter" className="text-sm font-semibold text-slate-700">
            Filtrar por estado:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border-2 border-slate-300 px-3 py-1.5 text-sm focus:border-accent-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {myReqs.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-7 h-7" />}
            title="No tienes solicitudes"
            description="Crea tu primera solicitud de intérprete para una clase o actividad."
            action={
              <Link to="/estudiante/nueva">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Crear primera solicitud
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-50">
            {myReqs.map((r) => (
              <li key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800">{r.subject}</p>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatDate(r.date)} · {r.startTime}–{r.endTime}
                  </p>
                  <p className="text-sm text-slate-600">{r.location}</p>
                  {r.interpreterId && (
                    <p className="text-sm text-slate-600 mt-0.5">
                      Intérprete: <span className="font-medium">{userName(data, r.interpreterId)}</span>
                    </p>
                  )}
                  {r.rejectionReason && (
                    <p className="text-sm text-cancelled-fg mt-1">
                      Motivo del rechazo anterior: {r.rejectionReason}
                    </p>
                  )}
                  {r.status === 'cancelled' && r.cancelReason && (
                    <p className="text-sm text-cancelled-fg mt-1">Cancelada: {r.cancelReason}</p>
                  )}
                </div>
                {canModify(r) && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditTarget(r)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Modificar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setCancelTarget(r)}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CancelModal
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
      <EditModal
        target={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}

function CancelModal({
  target,
  onClose,
  onConfirm,
}: {
  target: ServiceRequest | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  function reset() {
    setReason('');
    setError('');
  }

  return (
    <Modal
      open={!!target}
      title="Cancelar solicitud"
      description={target ? `"${target.subject}" del ${formatDate(target.date)}` : ''}
      onClose={() => { reset(); onClose(); }}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => { reset(); onClose(); }}>Cerrar</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (!reason.trim()) { setError('El motivo es obligatorio.'); return; }
              onConfirm(reason.trim());
              reset();
            }}
          >
            Sí, cancelar solicitud
          </Button>
        </>
      }
    >
      <Textarea
        label="Motivo de cancelación"
        name="cancelReason"
        value={reason}
        onChange={(e) => { setReason(e.target.value); setError(''); }}
        error={error}
        placeholder="Ej: Se suspendió la clase."
        rows={3}
      />
      {target?.interpreterId && (
        <p className="mt-3 text-sm text-slate-500">
          Como ya tenía intérprete asignado, se notificará al intérprete y al coordinador.
        </p>
      )}
    </Modal>
  );
}

function EditModal({
  target,
  onClose,
}: {
  target: ServiceRequest | null;
  onClose: () => void;
}) {
  const { push } = useToast();
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar cuando cambia target
  useEffect(() => {
    if (target) {
      setSubject(target.subject);
      setDate(target.date);
      setStartTime(target.startTime);
      setEndTime(target.endTime);
      setLocation(target.location);
      setObservations(target.observations || '');
      setErrors({});
    }
  }, [target]);

  function save() {
    if (!target) return;
    const e: Record<string, string> = {};
    if (!subject) e.subject = 'Requerido';
    if (!date) e.date = 'Requerido';
    if (!startTime) e.startTime = 'Requerido';
    if (!endTime) e.endTime = 'Requerido';
    if (!location) e.location = 'Requerido';
    if (endTime <= startTime) e.endTime = 'La hora de fin debe ser mayor.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    updateRequest(target.id, {
      subject, date, startTime, endTime, location,
      observations: observations || undefined,
    });
    push({ type: 'success', title: 'Solicitud modificada', message: 'Los cambios se guardaron correctamente.' });
    onClose();
  }

  return (
    <Modal
      open={!!target}
      title="Modificar solicitud"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="accent" onClick={save}>Guardar cambios</Button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Asignatura o actividad" name="e_subject" value={subject} onChange={(e) => setSubject(e.target.value)} error={errors.subject} />
        </div>
        <Input label="Fecha" name="e_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
        <Input label="Lugar" name="e_loc" value={location} onChange={(e) => setLocation(e.target.value)} error={errors.location} />
        <Input label="Hora de inicio" name="e_st" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} error={errors.startTime} />
        <Input label="Hora de fin" name="e_et" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} error={errors.endTime} />
        <div className="sm:col-span-2">
          <Textarea label="Observaciones" name="e_obs" value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} />
        </div>
      </div>
    </Modal>
  );
}
