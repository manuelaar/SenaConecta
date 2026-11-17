// Acciones centrales que mutan los datos y disparan notificaciones + toasts.
import type { AppData, ServiceRequest, RequestStatus } from '@/types';
import { getData, saveData } from '@/services/storage';
import { applyNotifications, userName, type NotifTarget } from './notifications';
import { uid } from '@/utils/date';
import { slotsOverlap, weekdayIndexFromDate } from '@/utils/date';

export interface CreateRequestInput {
  studentId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  observations?: string;
}

export function createRequest(input: CreateRequestInput): ServiceRequest {
  const data = getData();
  const req: ServiceRequest = {
    id: uid('req'),
    studentId: input.studentId,
    subject: input.subject,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    observations: input.observations,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Notificar a coordinadores
  const targets: NotifTarget[] = data.users
    .filter((u) => u.role === 'coordinator')
    .map((c) => ({
      userId: c.id,
      type: 'request_created',
      title: 'Nueva solicitud creada',
      message: `${userName(data, req.studentId)} solicitó intérprete para ${req.subject} el ${req.date} a las ${req.startTime}.`,
      relatedRequestId: req.id,
    }));

  const { notifications, emails } = applyNotifications(data, targets);
  saveData({ ...data, requests: [...data.requests, req], notifications: [...data.notifications, ...notifications], emails: [...data.emails, ...emails] });
  return req;
}

export function assignInterpreter(requestId: string, interpreterId: string): void {
  const data = getData();
  const req = data.requests.find((r) => r.id === requestId);
  if (!req) return;
  const updated: ServiceRequest = { ...req, status: 'assigned', interpreterId, rejectionReason: undefined };
  const next = data.requests.map((r) => (r.id === requestId ? updated : r));

  const targets: NotifTarget[] = [
    {
      userId: interpreterId,
      type: 'request_assigned',
      title: 'Nueva asignación',
      message: `Te asignaron ${req.subject} el ${req.date} de ${req.startTime} a ${req.endTime} en ${req.location}.`,
      relatedRequestId: req.id,
    },
    {
      userId: req.studentId,
      type: 'request_assigned',
      title: 'Intérprete asignado',
      message: `Se asignó a ${userName(data, interpreterId)} para tu solicitud de ${req.subject}.`,
      relatedRequestId: req.id,
    },
  ];

  const { notifications, emails } = applyNotifications(data, targets);
  saveData({ ...data, requests: next, notifications: [...data.notifications, ...notifications], emails: [...data.emails, ...emails] });
}

export function confirmAssignment(requestId: string): void {
  const data = getData();
  const req = data.requests.find((r) => r.id === requestId);
  if (!req || !req.interpreterId) return;
  const updated: ServiceRequest = { ...req, status: 'confirmed' };
  const next = data.requests.map((r) => (r.id === requestId ? updated : r));

  const targets: NotifTarget[] = [
    {
      userId: req.studentId,
      type: 'request_confirmed',
      title: 'Solicitud confirmada',
      message: `${userName(data, req.interpreterId)} confirmó tu solicitud de ${req.subject} para el ${req.date}.`,
      relatedRequestId: req.id,
    },
    ...data.users.filter((u) => u.role === 'coordinator').map((c) => ({
      userId: c.id,
      type: 'request_confirmed' as const,
      title: 'Solicitud confirmada',
      message: `${userName(data, req.interpreterId)} confirmó la solicitud de ${req.subject}.`,
      relatedRequestId: req.id,
    })),
  ];

  const { notifications, emails } = applyNotifications(data, targets);
  saveData({ ...data, requests: next, notifications: [...data.notifications, ...notifications], emails: [...data.emails, ...emails] });
}

export function rejectAssignment(requestId: string, reason: string): void {
  const data = getData();
  const req = data.requests.find((r) => r.id === requestId);
  if (!req) return;
  const updated: ServiceRequest = {
    ...req,
    status: 'pending',
    interpreterId: undefined,
    rejectionReason: reason,
  };
  const next = data.requests.map((r) => (r.id === requestId ? updated : r));

  const targets: NotifTarget[] = data.users
    .filter((u) => u.role === 'coordinator')
    .map((c) => ({
      userId: c.id,
      type: 'request_rejected' as const,
      title: 'Asignación rechazada',
      message: `${userName(data, req.interpreterId)} rechazó la solicitud de ${req.subject}. Motivo: ${reason}. La solicitud vuelve a Pendiente.`,
      relatedRequestId: req.id,
    }));

  const { notifications, emails } = applyNotifications(data, targets);
  saveData({ ...data, requests: next, notifications: [...data.notifications, ...notifications], emails: [...data.emails, ...emails] });
}

export function cancelRequest(requestId: string, reason: string, cancelledBy: string): void {
  const data = getData();
  const req = data.requests.find((r) => r.id === requestId);
  if (!req) return;
  const updated: ServiceRequest = {
    ...req,
    status: 'cancelled',
    cancelReason: reason,
    cancelledBy,
    cancelledAt: new Date().toISOString(),
  };
  const next = data.requests.map((r) => (r.id === requestId ? updated : r));

  // Notificar al intérprete (si lo hay) y al coordinador
  const targets: NotifTarget[] = [];
  if (req.interpreterId) {
    targets.push({
      userId: req.interpreterId,
      type: 'request_cancelled',
      title: 'Solicitud cancelada',
      message: `Se canceló la solicitud de ${req.subject} del ${req.date}. Motivo: ${reason}.`,
      relatedRequestId: req.id,
    });
  }
  data.users.filter((u) => u.role === 'coordinator').forEach((c) =>
    targets.push({
      userId: c.id,
      type: 'request_cancelled',
      title: 'Solicitud cancelada',
      message: `Se canceló la solicitud de ${req.subject} del ${req.date}. Motivo: ${reason}.`,
      relatedRequestId: req.id,
    })
  );

  const { notifications, emails } = applyNotifications(data, targets);
  saveData({ ...data, requests: next, notifications: [...data.notifications, ...notifications], emails: [...data.emails, ...emails] });
}

export function registerService(
  requestId: string,
  record: {
    studentAttended: boolean;
    realStart: string;
    realEnd: string;
    observations?: string;
  }
): void {
  const data = getData();
  const req = data.requests.find((r) => r.id === requestId);
  if (!req) return;
  const updated: ServiceRequest = {
    ...req,
    status: 'served',
    serviceRecord: { ...record, registeredAt: new Date().toISOString() },
  };
  const next = data.requests.map((r) => (r.id === requestId ? updated : r));

  const targets: NotifTarget[] = [
    {
      userId: req.studentId,
      type: 'service_registered',
      title: 'Servicio registrado',
      message: `Se registró el servicio de ${req.subject}. Asistencia: ${record.studentAttended ? 'Sí' : 'No'}.`,
      relatedRequestId: req.id,
    },
    ...data.users.filter((u) => u.role === 'coordinator').map((c) => ({
      userId: c.id,
      type: 'service_registered' as const,
      title: 'Servicio registrado',
      message: `Se registró el servicio de ${req.subject} (${userName(data, req.interpreterId)}).`,
      relatedRequestId: req.id,
    })),
  ];

  const { notifications, emails } = applyNotifications(data, targets);
  saveData({ ...data, requests: next, notifications: [...data.notifications, ...notifications], emails: [...data.emails, ...emails] });
}

export function updateRequest(
  requestId: string,
  patch: Partial<Pick<ServiceRequest, 'subject' | 'date' | 'startTime' | 'endTime' | 'location' | 'observations'>>
): void {
  const data = getData();
  const next = data.requests.map((r) => (r.id === requestId ? { ...r, ...patch } : r));
  saveData({ ...data, requests: next });
}

// --- Disponibilidad ---
export function addAvailability(interpreterId: string, dayOfWeek: number, startTime: string, endTime: string): void {
  const data = getData();
  const slot = { id: uid('av'), interpreterId, dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5, startTime, endTime };
  saveData({ ...data, availabilities: [...data.availabilities, slot] });
}

export function deleteAvailability(slotId: string): void {
  const data = getData();
  saveData({ ...data, availabilities: data.availabilities.filter((s) => s.id !== slotId) });
}

// --- Notificaciones ---
export function markAllNotificationsRead(userId: string): void {
  const data = getData();
  const next = data.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  saveData({ ...data, notifications: next });
}

// --- Utilidades de asignación ---
// ¿El intérprete tiene disponibilidad para esa franja?
export function interpreterHasAvailability(
  data: AppData,
  interpreterId: string,
  date: string,
  start: string,
  end: string
): boolean {
  const wd = weekdayIndexFromDate(date);
  const slots = data.availabilities.filter(
    (s) => s.interpreterId === interpreterId && s.dayOfWeek === wd
  );
  return slots.some((s) => timeInSlot(s.startTime, s.endTime, start, end));
}

// ¿El intérprete ya tiene una asignación que se cruza?
export function interpreterHasConflict(
  data: AppData,
  interpreterId: string,
  date: string,
  start: string,
  end: string,
  excludeRequestId?: string
): boolean {
  return data.requests.some(
    (r) =>
      r.id !== excludeRequestId &&
      r.interpreterId === interpreterId &&
      r.date === date &&
      r.status !== 'cancelled' &&
      r.status !== 'pending' &&
      slotsOverlap(r.startTime, r.endTime, start, end)
  );
}

export function availableInterpretersForRequest(
  data: AppData,
  date: string,
  start: string,
  end: string
): { id: string; fullName: string; hasAvailability: boolean; hasConflict: boolean }[] {
  return data.users
    .filter((u) => u.role === 'interpreter')
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      hasAvailability: interpreterHasAvailability(data, u.id, date, start, end),
      hasConflict: interpreterHasConflict(data, u.id, date, start, end),
    }));
}

function timeInSlot(slotStart: string, slotEnd: string, start: string, end: string): boolean {
  return start >= slotStart && end <= slotEnd;
}
