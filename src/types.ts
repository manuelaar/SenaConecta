// Tipos centrales del sistema SeñaConecta

export type Role = 'student' | 'interpreter' | 'coordinator';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export type RequestStatus = 'pending' | 'assigned' | 'confirmed' | 'served' | 'cancelled';

export interface ServiceRequest {
  id: string;
  studentId: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  observations?: string;
  status: RequestStatus;
  interpreterId?: string;
  rejectionReason?: string;
  // Registro del servicio prestado
  serviceRecord?: ServiceRecord;
  createdAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: string;
}

export interface ServiceRecord {
  studentAttended: boolean;
  realStart: string;
  realEnd: string;
  observations?: string;
  registeredAt: string;
}

// Disponibilidad semanal de un intérprete (lun-sáb)
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5; // 0=Lun ... 5=Sáb

export interface AvailabilitySlot {
  id: string;
  interpreterId: string;
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
}

export type NotificationType =
  | 'request_created'
  | 'request_assigned'
  | 'request_confirmed'
  | 'request_rejected'
  | 'request_cancelled'
  | 'service_registered'
  | 'generic';

export interface Notification {
  id: string;
  userId: string; // destinatario
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
  relatedRequestId?: string;
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  notificationId: string;
}

export interface AppData {
  users: User[];
  requests: ServiceRequest[];
  availabilities: AvailabilitySlot[];
  notifications: Notification[];
  emails: SentEmail[];
  seededAt: string;
}

export const STATUS_META: Record<
  RequestStatus,
  { label: string; icon: string; color: string }
> = {
  pending: { label: 'Pendiente', icon: 'Clock', color: 'pending' },
  assigned: { label: 'Asignada', icon: 'UserCheck', color: 'assigned' },
  confirmed: { label: 'Confirmada', icon: 'CalendarCheck', color: 'confirmed' },
  served: { label: 'Prestada', icon: 'CheckCircle', color: 'served' },
  cancelled: { label: 'Cancelada', icon: 'XCircle', color: 'cancelled' },
};

export const ROLE_LABELS: Record<Role, string> = {
  student: 'Estudiante',
  interpreter: 'Intérprete',
  coordinator: 'Coordinador de inclusión',
};
