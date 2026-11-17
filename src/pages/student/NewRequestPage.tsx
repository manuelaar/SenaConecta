import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { createRequest } from '@/services/actions';
import { isPast, isEndBeforeStart, todayStr, isPastDate } from '@/utils/date';

const SUBJECTS = [
  'Cálculo Diferencial',
  'Programación I',
  'Física Mecánica',
  'Ingeniería de Software',
  'Estadística',
  'Inglés I',
  'Conferencia de bienestar',
  'Tutoría',
  'Otra actividad',
];

const LOCATIONS = [
  'Bloque 3 – Salón 305',
  'Bloque 1 – Salón 102',
  'Auditorio Principal',
  'Biblioteca – Sala 2',
  'Bloque 4 – Salón 410',
  'Laboratorio de Informática – Lab 2',
];

export function NewRequestPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (!user) return null;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!subject) e.subject = 'Selecciona la asignatura o actividad.';
    if (!date) e.date = 'Indica la fecha.';
    if (!startTime) e.startTime = 'Indica la hora de inicio.';
    if (!endTime) e.endTime = 'Indica la hora de fin.';
    if (!location) e.location = 'Indica el lugar.';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setFormError('Faltan campos obligatorios. Revisa los marcados abajo.');
      return false;
    }
    setFormError(null);

    if (isPastDate(date)) {
      e.date = 'La fecha no puede ser en el pasado.';
      setErrors(e);
      return false;
    }
    if (isPast(date, startTime)) {
      e.startTime = 'La hora de inicio ya pasó.';
      setErrors(e);
      return false;
    }
    if (isEndBeforeStart(startTime, endTime)) {
      e.endTime = 'La hora de fin debe ser mayor que la de inicio.';
      setErrors(e);
      return false;
    }
    return true;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    createRequest({
      studentId: user!.id,
      subject,
      date,
      startTime,
      endTime,
      location,
      observations: observations || undefined,
    });
    push({
      type: 'success',
      title: 'Solicitud creada',
      message: `Tu solicitud para ${subject} quedó en estado Pendiente. Se notificó al coordinador.`,
    });
    navigate('/estudiante/solicitudes');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        icon={<Plus className="w-6 h-6" />}
        title="Nueva solicitud"
        description="Pide un intérprete de LSC para una clase o actividad"
      />

      {formError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border-2 border-cancelled-border bg-cancelled-bg p-3 text-sm text-cancelled-fg"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{formError}</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Select
            label="Asignatura o actividad"
            name="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
            placeholder="Selecciona..."
            options={SUBJECTS.map((s) => ({ value: s, label: s }))}
          />

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Fecha"
              name="date"
              type="date"
              required
              value={date}
              min={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
            <Input
              label="Hora de inicio"
              name="startTime"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={errors.startTime}
            />
            <Input
              label="Hora de fin"
              name="endTime"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              error={errors.endTime}
            />
          </div>

          <Select
            label="Lugar (bloque/salón)"
            name="location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            error={errors.location}
            placeholder="Selecciona..."
            options={LOCATIONS.map((l) => ({ value: l, label: l }))}
          />

          <Textarea
            label="Observaciones (opcional)"
            name="observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ej: Clase magistral, se necesita buena visibilidad."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/estudiante/solicitudes')}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent">
              <Plus className="w-4 h-4" />
              Guardar solicitud
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
