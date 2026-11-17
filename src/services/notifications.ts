// Ayudante para generar notificaciones y correos simulados a partir de eventos.
import type { AppData, Notification, NotificationType, SentEmail, User } from '@/types';
import { uid } from '@/utils/date';

export interface NotifTarget {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  emailSent?: boolean;
  relatedRequestId?: string;
}

export function applyNotifications(
  data: AppData,
  targets: NotifTarget[]
): { notifications: Notification[]; emails: SentEmail[] } {
  const newNotifs: Notification[] = [];
  const newEmails: SentEmail[] = [];
  const now = new Date().toISOString();

  for (const t of targets) {
    const n: Notification = {
      id: uid('nt'),
      userId: t.userId,
      type: t.type,
      title: t.title,
      message: t.message,
      read: false,
      emailSent: t.emailSent ?? true,
      createdAt: now,
      relatedRequestId: t.relatedRequestId,
    };
    newNotifs.push(n);
    if (n.emailSent) {
      const user = data.users.find((u) => u.id === t.userId);
      if (user) {
        newEmails.push({
          id: uid('em'),
          to: user.email,
          subject: t.title,
          body: t.message + '\n\nCorreo simulado por SeñaConecta.',
          sentAt: now,
          notificationId: n.id,
        });
      }
    }
  }

  return { notifications: newNotifs, emails: newEmails };
}

export function userName(data: AppData, id?: string): string {
  const u = data.users.find((x) => x.id === id);
  return u ? u.fullName : '—';
}

export function userEmail(data: AppData, id?: string): string {
  const u = data.users.find((x) => x.id === id);
  return u ? u.email : '';
}

export function userById(data: AppData, id: string): User | undefined {
  return data.users.find((u) => u.id === id);
}

// Devuelve los IDs de usuario involucrados en una solicitud (estudiante, intérprete, coordinador)
export function stakeholders(
  data: AppData,
  req: { studentId: string; interpreterId?: string }
): string[] {
  const ids = new Set<string>();
  ids.add(req.studentId);
  if (req.interpreterId) ids.add(req.interpreterId);
  data.users.filter((u) => u.role === 'coordinator').forEach((u) => ids.add(u.id));
  return Array.from(ids);
}
