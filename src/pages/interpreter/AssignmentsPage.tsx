import { useState } from 'react';
import { UserCheck, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { formatDate } from '@/utils/date';
import { userName } from '@/services/notifications';
import { confirmAssignment, rejectAssignment } from '@/services/actions';
import type { ServiceRequest } from '@/types';

export function AssignmentsPage() {
  const { user } = useAuth();
  const data = useAppData();
  const { push } = useToast();
  const [rejectTarget, setRejectTarget] = useState<ServiceRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  if (!user) return null;

  const myAssignments = data.requests
    .filter((r) => r.interpreterId === user.id && (r.status === 'assigned' || r.status === 'confirmed'))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  function handleAccept(r: ServiceRequest) {
    confirmAssignment(r.id);
    push({ type: 'success', title: 'Asignación aceptada', message: `Confirmaste "${r.subject}". Se notificó al estudiante.` });
  }

  function handleReject() {
    if (!rejectTarget) return;
    if (!reason.trim()) { setReasonError('El motivo es obligatorio.'); return; }
    rejectAssignment(rejectTarget.id, reason.trim());
    push({
      type: 'info',
      title: 'Asignación rechazada',
      message: `La solicitud vuelve a Pendiente. Se notificó al coordinador.`,
    });
    setRejectTarget(null);
    setReason('');
    setReasonError('');
  }

  return (
    <div>
      <PageHeader
        icon={<UserCheck className="w-6 h-6" />}
        title="Mis asignaciones"
        description="Acepta o rechaza las solicitudes que te asignó el coordinador"
      />

      <Card>
        {myAssignments.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="w-7 h-7" />}
            title="No tienes asignaciones"
            description="Cuando el coordinador te asigne una solicitud aparecerá aquí."
          />
        ) : (
          <ul className="divide-y divide-slate-50">
            {myAssignments.map((r) => (
              <li key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800">{r.subject}</p>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatDate(r.date)} · {r.startTime}–{r.endTime}
                  </p>
                  <p className="text-sm text-slate-600">{r.location}</p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Estudiante: <span className="font-medium">{userName(data, r.studentId)}</span>
                  </p>
                </div>
                {r.status === 'assigned' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="accent" onClick={() => handleAccept(r)}>
                      <Check className="w-4 h-4" />
                      Aceptar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setRejectTarget(r)}>
                      <X className="w-4 h-4" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={!!rejectTarget}
        title="Rechazar asignación"
        description={rejectTarget ? `"${rejectTarget.subject}" del ${formatDate(rejectTarget.date)}` : ''}
        onClose={() => { setRejectTarget(null); setReason(''); setReasonError(''); }}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setRejectTarget(null); setReason(''); setReasonError(''); }}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleReject}>Rechazar asignación</Button>
          </>
        }
      >
        <Textarea
          label="Motivo del rechazo (obligatorio)"
          name="reason"
          value={reason}
          onChange={(e) => { setReason(e.target.value); setReasonError(''); }}
          error={reasonError}
          placeholder="Ej: Tengo un compromiso personal en esa franja."
          rows={3}
        />
        <div className="mt-3 rounded-lg bg-pending-bg border-2 border-pending-border p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-pending-fg mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-pending-fg">
            La solicitud volverá a estado Pendiente y se notificará al coordinador.
          </p>
        </div>
      </Modal>
    </div>
  );
}
