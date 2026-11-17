import { useState } from 'react';
import { Clock, UserCheck, Check, AlertCircle, Calendar } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate, todayStr } from '@/utils/date';
import { userName } from '@/services/notifications';
import { availableInterpretersForRequest, assignInterpreter } from '@/services/actions';
import type { ServiceRequest } from '@/types';
import { cn } from '@/utils/cn';

export function PendingRequestsPage() {
  const data = useAppData();
  const { push } = useToast();
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ req: ServiceRequest; interpreterId: string; interpreterName: string } | null>(null);

  const pending = data.requests
    .filter((r) => r.status === 'pending' && r.date >= todayStr())
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  function handleAssign() {
    if (!assignTarget) return;
    assignInterpreter(assignTarget.req.id, assignTarget.interpreterId);
    push({
      type: 'success',
      title: 'Intérprete asignado',
      message: `Se asignó a ${assignTarget.interpreterName} para "${assignTarget.req.subject}". Se notificó al intérprete.`,
    });
    setAssignTarget(null);
    setSelected(null);
  }

  return (
    <div>
      <PageHeader
        icon={<Clock className="w-6 h-6" />}
        title="Solicitudes pendientes"
        description="Ordenadas por la fecha más próxima"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card title="Lista de solicitudes" description={`${pending.length} pendientes`}>
            {pending.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-7 h-7" />}
                title="No hay solicitudes pendientes"
                description="Todas las solicitudes futuras tienen intérprete asignado."
              />
            ) : (
              <ul className="divide-y divide-slate-50">
                {pending.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelected(r)}
                      aria-pressed={selected?.id === r.id}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors',
                        selected?.id === r.id ? 'bg-accent-50' : 'hover:bg-slate-50'
                      )}
                    >
                      <p className="font-semibold text-slate-800">{r.subject}</p>
                      <p className="text-sm text-slate-500">{formatDate(r.date)} · {r.startTime}–{r.endTime}</p>
                      <p className="text-sm text-slate-600">{r.location}</p>
                      <p className="text-sm text-slate-600 mt-0.5">Estudiante: {userName(data, r.studentId)}</p>
                      {r.rejectionReason && (
                        <p className="text-xs text-cancelled-fg mt-1">Rechazada antes: {r.rejectionReason}</p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <PendingDetail
              req={selected}
              onAssign={(interpreterId, interpreterName) =>
                setAssignTarget({ req: selected, interpreterId, interpreterName })
              }
            />
          ) : (
            <Card>
              <EmptyState
                icon={<Calendar className="w-7 h-7" />}
                title="Selecciona una solicitud"
                description="Elige una solicitud de la lista para ver los intérpretes disponibles."
              />
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={!!assignTarget}
        title="Asignar intérprete"
        description={assignTarget ? `${assignTarget.interpreterName} → ${assignTarget.req.subject}` : ''}
        onClose={() => setAssignTarget(null)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignTarget(null)}>Cancelar</Button>
            <Button variant="accent" onClick={handleAssign}>
              <Check className="w-4 h-4" />
              Confirmar asignación
            </Button>
          </>
        }
      >
        <p className="text-slate-700">
          ¿Confirmas la asignación de <strong>{assignTarget?.interpreterName}</strong> para esta solicitud?
          El intérprete recibirá una notificación y deberá aceptar o rechazar.
        </p>
      </Modal>
    </div>
  );
}

function PendingDetail({
  req,
  onAssign,
}: {
  req: ServiceRequest;
  onAssign: (interpreterId: string, interpreterName: string) => void;
}) {
  const data = useAppData();
  const interpreters = availableInterpretersForRequest(data, req.date, req.startTime, req.endTime);
  const eligible = interpreters.filter((i) => i.hasAvailability && !i.hasConflict);

  return (
    <Card
      title={req.subject}
      description={`${formatDate(req.date)} · ${req.startTime}–${req.endTime}`}
      icon={<UserCheck className="w-5 h-5" />}
    >
      <div className="mb-4 text-sm text-slate-600 space-y-1">
        <p><span className="font-semibold">Lugar:</span> {req.location}</p>
        <p><span className="font-semibold">Estudiante:</span> {userName(data, req.studentId)}</p>
        {req.observations && <p><span className="font-semibold">Observaciones:</span> {req.observations}</p>}
      </div>

      <h3 className="font-bold text-slate-800 mb-3">
        Intérpretes disponibles para esta franja
      </h3>

      {eligible.length === 0 ? (
        <div className="rounded-xl border-2 border-pending-border bg-pending-bg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-pending-fg mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold text-pending-fg">No hay intérpretes disponibles</p>
            <p className="text-sm text-pending-fg mt-1">
              Ningún intérprete tiene disponibilidad en esta franja ni está libre de conflictos.
              Considera reprogramar con el estudiante o ampliar la plantilla de intérpretes.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {eligible.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between gap-3 rounded-xl border-2 border-slate-100 p-3 hover:border-accent-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-sm">
                  {i.fullName.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{i.fullName}</p>
                  <p className="text-xs text-confirmed-fg">Disponible y sin conflictos</p>
                </div>
              </div>
              <Button size="sm" onClick={() => onAssign(i.id, i.fullName)}>
                <UserCheck className="w-4 h-4" />
                Asignar
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Mostrar intérpretes no disponibles por contexto */}
      {eligible.length > 0 && interpreters.some((i) => !i.hasAvailability || i.hasConflict) && (
        <details className="mt-4">
          <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
            Ver intérpretes no disponibles ({interpreters.length - eligible.length})
          </summary>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            {interpreters
              .filter((i) => !i.hasAvailability || i.hasConflict)
              .map((i) => (
                <li key={i.id} className="flex items-center gap-2">
                  <span>{i.fullName}</span>
                  <span className="text-xs text-cancelled-fg">
                    {!i.hasAvailability && 'Sin disponibilidad'}
                    {i.hasConflict && ' · Con conflicto de horario'}
                  </span>
                </li>
              ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
