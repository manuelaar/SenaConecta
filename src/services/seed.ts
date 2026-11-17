// Datos de ejemplo (seed) para SeñaConecta
// Las fechas son RELATIVAS a hoy para que la demo funcione siempre.

import type {
  AppData,
  User,
  ServiceRequest,
  AvailabilitySlot,
  Notification,
  SentEmail,
} from '@/types';
import { dateFromOffset, uid, sha256, timeToMinutes } from '@/utils/date';

const DEMO_PASSWORD_HASH = await sha256('Demo1234');

const users: User[] = [
  {
    id: 'u_coord',
    fullName: 'Laura Gómez',
    email: 'coordinacion@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'coordinator',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
  // Intérpretes
  {
    id: 'u_int1',
    fullName: 'Andrés Restrepo',
    email: 'andres.restrepo@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'interpreter',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
  {
    id: 'u_int2',
    fullName: 'Paula Zuluaga',
    email: 'paula.zuluaga@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'interpreter',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
  {
    id: 'u_int3',
    fullName: 'Juan Camilo Ríos',
    email: 'juan.rios@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'interpreter',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
  {
    id: 'u_int4',
    fullName: 'Natalia Ospina',
    email: 'natalia.ospina@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'interpreter',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
  // Estudiantes
  {
    id: 'u_stu1',
    fullName: 'Valentina Morales',
    email: 'valentina.morales@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'student',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
  {
    id: 'u_stu2',
    fullName: 'Santiago Herrera',
    email: 'santiago.herrera@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'student',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
  {
    id: 'u_stu3',
    fullName: 'Mariana Castaño',
    email: 'mariana.castano@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'student',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
  {
    id: 'u_stu4',
    fullName: 'Daniel Quintero',
    email: 'daniel.quintero@universidad.edu.co',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'student',
    createdAt: dateFromOffset(-120) + 'T08:00:00',
  },
];

// Disponibilidades semanales (día 0=Lun..5=Sáb)
function avail(intId: string, day: number, start: string, end: string): AvailabilitySlot {
  return {
    id: uid('av'),
    interpreterId: intId,
    dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5,
    startTime: start,
    endTime: end,
  };
}

const availabilities: AvailabilitySlot[] = [
  // Andrés — mañanas L-V
  avail('u_int1', 0, '07:00', '12:00'),
  avail('u_int1', 1, '07:00', '12:00'),
  avail('u_int1', 2, '07:00', '12:00'),
  avail('u_int1', 3, '07:00', '12:00'),
  avail('u_int1', 4, '07:00', '12:00'),
  // Paula — tardes L-V y sábado mañana
  avail('u_int2', 0, '13:00', '18:00'),
  avail('u_int2', 1, '13:00', '18:00'),
  avail('u_int2', 2, '13:00', '18:00'),
  avail('u_int2', 3, '13:00', '18:00'),
  avail('u_int2', 4, '13:00', '18:00'),
  avail('u_int2', 5, '08:00', '12:00'),
  // Juan Camilo — todo el día L,Mi,V
  avail('u_int3', 0, '08:00', '17:00'),
  avail('u_int3', 2, '08:00', '17:00'),
  avail('u_int3', 4, '08:00', '17:00'),
  // Natalia — tardes L,J y mañanas M,J,S
  avail('u_int4', 0, '14:00', '19:00'),
  avail('u_int4', 1, '07:00', '12:00'),
  avail('u_int4', 3, '07:00', '12:00'),
  avail('u_int4', 3, '14:00', '19:00'),
  avail('u_int4', 5, '08:00', '13:00'),
];

// Helper para construir solicitudes con fechas relativas
interface SeedReq {
  studentId: string;
  interpreterId?: string;
  subject: string;
  dateOffset: number; // días desde hoy
  startTime: string;
  endTime: string;
  location: string;
  status: ServiceRequest['status'];
  observations?: string;
  rejectionReason?: string;
  service?: { attended: boolean; realStart: string; realEnd: string; obs?: string };
  cancelReason?: string;
  cancelledBy?: string;
}

function buildRequest(r: SeedReq): ServiceRequest {
  const date = dateFromOffset(r.dateOffset);
  const createdAt = dateFromOffset(r.dateOffset - 3) + 'T10:00:00';
  return {
    id: uid('req'),
    studentId: r.studentId,
    subject: r.subject,
    date,
    startTime: r.startTime,
    endTime: r.endTime,
    location: r.location,
    observations: r.observations,
    status: r.status,
    interpreterId: r.interpreterId,
    rejectionReason: r.rejectionReason,
    serviceRecord: r.service
      ? {
          studentAttended: r.service.attended,
          realStart: r.service.realStart,
          realEnd: r.service.realEnd,
          observations: r.service.obs,
          registeredAt: dateFromOffset(r.dateOffset) + 'T20:00:00',
        }
      : undefined,
    createdAt,
    cancelledAt: r.status === 'cancelled' ? dateFromOffset(r.dateOffset - 1) + 'T15:00:00' : undefined,
    cancelReason: r.cancelReason,
    cancelledBy: r.cancelledBy,
  };
}

const subjects = [
  'Cálculo Diferencial',
  'Programación I',
  'Física Mecánica',
  'Ingeniería de Software',
  'Estadística',
  'Inglés I',
  'Conferencia de bienestar',
  'Tutoría',
];

const locations = [
  'Bloque 3 – Salón 305',
  'Bloque 1 – Salón 102',
  'Auditorio Principal',
  'Biblioteca – Sala 2',
  'Bloque 4 – Salón 410',
  'Laboratorio de Informática – Lab 2',
];

// Solicitudes: ~25 repartidas en todos los estados
const seedReqs: SeedReq[] = [
  // Pendientes próximas
  { studentId: 'u_stu1', subject: 'Cálculo Diferencial', dateOffset: 2, startTime: '08:00', endTime: '10:00', location: 'Bloque 3 – Salón 305', status: 'pending', observations: 'Clase magistral.' },
  { studentId: 'u_stu2', subject: 'Programación I', dateOffset: 3, startTime: '14:00', endTime: '16:00', location: 'Laboratorio de Informática – Lab 2', status: 'pending' },
  // Pendiente SIN intérpretes disponibles (sábado tarde — nadie cubre)
  { studentId: 'u_stu3', subject: 'Conferencia de bienestar', dateOffset: 4, startTime: '16:00', endTime: '18:00', location: 'Auditorio Principal', status: 'pending', observations: 'Conferencia abierta al público.' },
  { studentId: 'u_stu4', subject: 'Tutoría', dateOffset: 5, startTime: '10:00', endTime: '11:00', location: 'Biblioteca – Sala 2', status: 'pending' },

  // Asignadas sin confirmar (intérprete aún no acepta)
  { studentId: 'u_stu1', interpreterId: 'u_int1', subject: 'Física Mecánica', dateOffset: 1, startTime: '07:00', endTime: '09:00', location: 'Bloque 1 – Salón 102', status: 'assigned' },
  { studentId: 'u_stu2', interpreterId: 'u_int2', subject: 'Ingeniería de Software', dateOffset: 2, startTime: '13:00', endTime: '15:00', location: 'Bloque 4 – Salón 410', status: 'assigned' },
  { studentId: 'u_stu3', interpreterId: 'u_int3', subject: 'Estadística', dateOffset: 1, startTime: '08:00', endTime: '10:00', location: 'Bloque 3 – Salón 305', status: 'assigned' },

  // Confirmadas para hoy y mañana (fecha ya llegó o próxima)
  { studentId: 'u_stu1', interpreterId: 'u_int1', subject: 'Cálculo Diferencial', dateOffset: 0, startTime: '08:00', endTime: '10:00', location: 'Bloque 3 – Salón 305', status: 'confirmed' },
  { studentId: 'u_stu2', interpreterId: 'u_int2', subject: 'Inglés I', dateOffset: 0, startTime: '14:00', endTime: '16:00', location: 'Bloque 1 – Salón 102', status: 'confirmed' },
  { studentId: 'u_stu3', interpreterId: 'u_int4', subject: 'Programación I', dateOffset: 1, startTime: '14:00', endTime: '17:00', location: 'Laboratorio de Informática – Lab 2', status: 'confirmed' },
  { studentId: 'u_stu4', interpreterId: 'u_int3', subject: 'Física Mecánica', dateOffset: 1, startTime: '08:00', endTime: '11:00', location: 'Bloque 4 – Salón 410', status: 'confirmed' },

  // 12 prestadas en los dos meses anteriores (con horas reales)
  { studentId: 'u_stu1', interpreterId: 'u_int1', subject: 'Cálculo Diferencial', dateOffset: -2, startTime: '08:00', endTime: '10:00', location: 'Bloque 3 – Salón 305', status: 'served', service: { attended: true, realStart: '08:05', realEnd: '10:00', obs: 'Normal.' } },
  { studentId: 'u_stu2', interpreterId: 'u_int2', subject: 'Ingeniería de Software', dateOffset: -5, startTime: '13:00', endTime: '15:00', location: 'Bloque 4 – Salón 410', status: 'served', service: { attended: true, realStart: '13:00', realEnd: '15:00' } },
  { studentId: 'u_stu3', interpreterId: 'u_int3', subject: 'Estadística', dateOffset: -9, startTime: '08:00', endTime: '10:00', location: 'Bloque 3 – Salón 305', status: 'served', service: { attended: true, realStart: '08:00', realEnd: '09:50' } },
  { studentId: 'u_stu4', interpreterId: 'u_int4', subject: 'Programación I', dateOffset: -12, startTime: '14:00', endTime: '17:00', location: 'Laboratorio de Informática – Lab 2', status: 'served', service: { attended: true, realStart: '14:00', realEnd: '17:00' } },
  { studentId: 'u_stu1', interpreterId: 'u_int1', subject: 'Física Mecánica', dateOffset: -16, startTime: '07:00', endTime: '09:00', location: 'Bloque 1 – Salón 102', status: 'served', service: { attended: true, realStart: '07:10', realEnd: '09:00' } },
  { studentId: 'u_stu2', interpreterId: 'u_int2', subject: 'Inglés I', dateOffset: -20, startTime: '14:00', endTime: '16:00', location: 'Bloque 1 – Salón 102', status: 'served', service: { attended: true, realStart: '14:00', realEnd: '16:00' } },
  { studentId: 'u_stu3', interpreterId: 'u_int3', subject: 'Cálculo Diferencial', dateOffset: -25, startTime: '08:00', endTime: '10:00', location: 'Bloque 3 – Salón 305', status: 'served', service: { attended: true, realStart: '08:00', realEnd: '10:00' } },
  { studentId: 'u_stu4', interpreterId: 'u_int4', subject: 'Tutoría', dateOffset: -30, startTime: '10:00', endTime: '11:00', location: 'Biblioteca – Sala 2', status: 'served', service: { attended: false, realStart: '10:00', realEnd: '10:15', obs: 'El estudiante no asistió.' } },
  { studentId: 'u_stu1', interpreterId: 'u_int1', subject: 'Estadística', dateOffset: -38, startTime: '08:00', endTime: '10:00', location: 'Bloque 3 – Salón 305', status: 'served', service: { attended: true, realStart: '08:00', realEnd: '10:00' } },
  { studentId: 'u_stu2', interpreterId: 'u_int2', subject: 'Programación I', dateOffset: -44, startTime: '13:00', endTime: '16:00', location: 'Laboratorio de Informática – Lab 2', status: 'served', service: { attended: true, realStart: '13:00', realEnd: '16:00' } },
  { studentId: 'u_stu3', interpreterId: 'u_int3', subject: 'Física Mecánica', dateOffset: -52, startTime: '08:00', endTime: '11:00', location: 'Bloque 4 – Salón 410', status: 'served', service: { attended: true, realStart: '08:00', realEnd: '11:00' } },
  { studentId: 'u_stu4', interpreterId: 'u_int4', subject: 'Ingeniería de Software', dateOffset: -60, startTime: '14:00', endTime: '17:00', location: 'Bloque 4 – Salón 410', status: 'served', service: { attended: true, realStart: '14:00', realEnd: '17:00' } },

  // 2 canceladas
  { studentId: 'u_stu2', interpreterId: 'u_int1', subject: 'Cálculo Diferencial', dateOffset: -3, startTime: '08:00', endTime: '10:00', location: 'Bloque 3 – Salón 305', status: 'cancelled', cancelReason: 'El estudiante canceló la clase.', cancelledBy: 'student' },
  { studentId: 'u_stu3', subject: 'Inglés I', dateOffset: -7, startTime: '14:00', endTime: '16:00', location: 'Bloque 1 – Salón 102', status: 'cancelled', cancelReason: 'No había intérprete disponible y se reprogramó.', cancelledBy: 'coordinator' },

  // 1 rechazada con motivo (vuelve a Pendiente → la dejamos como pending con rejectionReason)
  { studentId: 'u_stu4', subject: 'Conferencia de bienestar', dateOffset: 6, startTime: '16:00', endTime: '18:00', location: 'Auditorio Principal', status: 'pending', rejectionReason: 'El intérprete tiene un compromiso personal en esa franja.', observations: 'Conferencia abierta.' },
];

const requests = seedReqs.map(buildRequest);

// Notificaciones iniciales para cada usuario (algunas leídas, otras no)
function notif(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  daysAgo: number,
  read: boolean,
  emailSent: boolean,
  relatedRequestId?: string
): Notification {
  return {
    id: uid('nt'),
    userId,
    type,
    title,
    message,
    read,
    emailSent,
    createdAt: dateFromOffset(-daysAgo) + 'T09:00:00',
    relatedRequestId,
  };
}

const reqFor = (i: number) => requests[i]?.id;

const notifications: Notification[] = [
  // Coordinadora
  notif('u_coord', 'request_created', 'Nueva solicitud creada', 'Valentina Morales solicitó intérprete para Cálculo Diferencial.', 0, false, true, reqFor(0)),
  notif('u_coord', 'request_created', 'Nueva solicitud creada', 'Santiago Herrera solicitó intérprete para Programación I.', 0, false, true, reqFor(1)),
  notif('u_coord', 'request_assigned', 'Solicitud asignada', 'Se asignó a Andrés Restrepo para Física Mecánica.', 1, true, true, reqFor(4)),
  notif('u_coord', 'request_rejected', 'Asignación rechazada', 'Un intérprete rechazó una asignación con motivo.', 2, true, true),
  notif('u_coord', 'service_registered', 'Servicio registrado', 'Andrés Restrepo registró el servicio de Cálculo Diferencial.', 2, true, false, reqFor(11)),

  // Intérprete Andrés
  notif('u_int1', 'request_assigned', 'Nueva asignación', 'Te asignaron Física Mecánica el ' + new Date().toLocaleDateString('es-CO') + ' a las 07:00.', 1, false, true, reqFor(4)),
  notif('u_int1', 'request_confirmed', 'Solicitud confirmada', 'Confirmaste Cálculo Diferencial para hoy.', 0, true, false, reqFor(7)),
  notif('u_int1', 'service_registered', 'Servicio registrado', 'Registraste el servicio de Cálculo Diferencial.', 2, true, false, reqFor(11)),

  // Intérprete Paula
  notif('u_int2', 'request_assigned', 'Nueva asignación', 'Te asignaron Ingeniería de Software.', 1, false, true, reqFor(5)),
  notif('u_int2', 'request_confirmed', 'Solicitud confirmada', 'Confirmaste Inglés I para hoy.', 0, true, false, reqFor(8)),

  // Intérprete Juan Camilo
  notif('u_int3', 'request_assigned', 'Nueva asignación', 'Te asignaron Estadística.', 1, false, true, reqFor(6)),

  // Intérprete Natalia
  notif('u_int4', 'request_confirmed', 'Solicitud confirmada', 'Confirmaste Programación I para mañana.', 0, false, true, reqFor(9)),

  // Estudiantes
  notif('u_stu1', 'request_assigned', 'Intérprete asignado', 'Andrés Restrepo fue asignado a tu solicitud de Física Mecánica.', 1, false, true, reqFor(4)),
  notif('u_stu1', 'request_created', 'Solicitud creada', 'Tu solicitud de Cálculo Diferencial fue registrada como Pendiente.', 3, true, true, reqFor(0)),
  notif('u_stu1', 'service_registered', 'Servicio prestado', 'Se registró el servicio de Cálculo Diferencial (2,00 h).', 2, true, false, reqFor(11)),

  notif('u_stu2', 'request_created', 'Solicitud creada', 'Tu solicitud de Programación I fue registrada.', 3, true, true, reqFor(1)),

  notif('u_stu3', 'request_cancelled', 'Solicitud cancelada', 'Tu solicitud de Inglés I fue cancelada: no había intérprete disponible.', 7, true, true),

  notif('u_stu4', 'request_rejected', 'Asignación rechazada', 'El intérprete rechazó tu solicitud de Conferencia de bienestar. Motivo: compromiso personal.', 2, false, true),
];

// Correos simulados (uno por cada notificación con emailSent)
const emails: SentEmail[] = notifications
  .filter((n) => n.emailSent)
  .map((n) => {
    const user = users.find((u) => u.id === n.userId)!;
    return {
      id: uid('em'),
      to: user.email,
      subject: n.title,
      body: n.message + '\n\nEste es un correo simulado por SeñaConecta.',
      sentAt: n.createdAt,
      notificationId: n.id,
    };
  });

// Calcular horas reales para validación
void timeToMinutes;

export function buildSeedData(): AppData {
  return {
    users,
    requests,
    availabilities,
    notifications,
    emails,
    seededAt: new Date().toISOString(),
  };
}

export { DEMO_PASSWORD_HASH };
