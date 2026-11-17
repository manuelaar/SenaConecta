// Utilidades de fecha y hora para SeñaConecta

// Devuelve la fecha relativa en formato YYYY-MM-DD
export function dateFromOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

// Combina fecha YYYY-MM-DD + hora HH:mm en un objeto Date
export function combineDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

// ¿La fecha/hora ya pasó?
export function isPast(date: string, time: string): boolean {
  return combineDateTime(date, time).getTime() < Date.now();
}

export function isPastDate(date: string): boolean {
  return combineDateTime(date, '00:00').getTime() < new Date(`${todayStr()}T00:00:00`).getTime();
}

// ¿horaFin <= horaInicio?
export function isEndBeforeStart(start: string, end: string): boolean {
  return end <= start;
}

// Solapamiento de franjas (en minutos del día)
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function slotsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aS = timeToMinutes(aStart);
  const aE = timeToMinutes(aEnd);
  const bS = timeToMinutes(bStart);
  const bE = timeToMinutes(bEnd);
  return aS < bE && bS < aE;
}

// Formato legible de fecha en español de Colombia
export function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const s = d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  // Solo la primera letra en mayúscula: "Miércoles, 18 de noviembre de 2026"
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(t: string): string {
  return t;
}

// Duración en horas entre dos horas HH:mm
export function durationHours(start: string, end: string): number {
  return (timeToMinutes(end) - timeToMinutes(start)) / 60;
}

// Formatear horas con 2 deciales (sin colas)
export function fmtHours(h: number): string {
  return h.toFixed(2).replace('.', ',') + ' h';
}

// Día de la semana 0=Lun..5=Sáb a partir de un YYYY-MM-DD
export function weekdayIndexFromDate(dateStr: string): number {
  const d = new Date(`${dateStr}T00:00:00`);
  // JS: 0=Dom..6=Sáb → Lun=0..Sáb=5. El domingo devuelve 6: como nadie
  // registra disponibilidad ese día, no aparece ningún intérprete disponible.
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

export const WEEKDAY_LABELS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ¿la fecha está dentro de las próximas 48 horas?
export function isWithin48Hours(dateStr: string, start: string): boolean {
  const target = combineDateTime(dateStr, start).getTime();
  const now = Date.now();
  return target >= now && target <= now + 48 * 60 * 60 * 1000;
}

// ¿la fecha es en el mes actual?
export function isThisMonth(dateStr: string): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

// ¿está en el rango [start, end] inclusive?
export function isInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}

// ID único simple
export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

// Hash SHA-256 con Web Crypto
export async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
