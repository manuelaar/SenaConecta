import { useState } from 'react';
import { CalendarDays, Plus, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { WEEKDAY_LABELS, WEEKDAY_SHORT, slotsOverlap } from '@/utils/date';
import { addAvailability, deleteAvailability } from '@/services/actions';
import type { AvailabilitySlot } from '@/types';
import { cn } from '@/utils/cn';

export function AvailabilityPage() {
  const { user } = useAuth();
  const data = useAppData();
  const { push } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [day, setDay] = useState('0');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const mySlots = data.availabilities.filter((s) => s.interpreterId === user.id);

  function checkOverlap(d: number, st: string, et: string, excludeId?: string): boolean {
    return mySlots.some(
      (s) => s.dayOfWeek === d && s.id !== excludeId && slotsOverlap(s.startTime, s.endTime, st, et)
    );
  }

  function handleAdd() {
    setError('');
    if (!startTime || !endTime) { setError('Indica hora de inicio y fin.'); return; }
    if (endTime <= startTime) { setError('La hora de fin debe ser mayor que la de inicio.'); return; }
    if (checkOverlap(Number(day), startTime, endTime)) {
      setError('Esta franja se cruza con otra del mismo día.');
      return;
    }
    addAvailability(user!.id, Number(day), startTime, endTime);
    push({ type: 'success', title: 'Franja agregada', message: 'Tu disponibilidad se actualizó.' });
    setModalOpen(false);
    setStartTime(''); setEndTime(''); setError('');
  }

  function handleDelete(slot: AvailabilitySlot) {
    deleteAvailability(slot.id);
    push({ type: 'info', title: 'Franja eliminada', message: 'Se quitó la franja de disponibilidad.' });
  }

  // Horas por día para mostrar en la vista calendario
  const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7..19

  return (
    <div>
      <PageHeader
        icon={<CalendarDays className="w-6 h-6" />}
        title="Mi disponibilidad"
        description="Define las franjas en las que puedes interpretar"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Agregar franja
          </Button>
        }
      />

      {/* Vista calendario semanal */}
      <Card className="mb-6 overflow-x-auto" title="Vista semanal" icon={<CalendarDays className="w-5 h-5" />}>
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-slate-100">
            <div className="p-2 text-xs font-semibold text-slate-400">Hora</div>
            {WEEKDAY_SHORT.map((d) => (
              <div key={d} className="p-2 text-center text-xs font-semibold text-slate-600">{d}</div>
            ))}
          </div>
          <div className="relative">
            {HOURS.map((h) => (
              <div key={h} className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-slate-50 h-12">
                <div className="p-1 text-xs text-slate-400">{String(h).padStart(2, '0')}:00</div>
                {WEEKDAY_SHORT.map((_, di) => (
                  <div key={di} className="border-l border-slate-50 relative">
                    {mySlots
                      .filter((s) => s.dayOfWeek === di)
                      .map((s) => {
                        const sh = parseInt(s.startTime.slice(0, 2));
                        const sm = parseInt(s.startTime.slice(3, 5));
                        const eh = parseInt(s.endTime.slice(0, 2));
                        const em = parseInt(s.endTime.slice(3, 5));
                        const top = (sh - 7) * 48 + (sm / 60) * 48;
                        const height = ((eh - sh) + (em - sm) / 60) * 48;
                        if (sh <= h && eh >= h) {
                          return null; // se dibuja una sola vez en su hora de inicio
                        }
                        return null;
                      })}
                  </div>
                ))}
              </div>
            ))}
            {/* Bloques absolutos */}
            <div className="absolute inset-0 grid grid-cols-[60px_repeat(6,1fr)] pointer-events-none">
              <div />
              {WEEKDAY_SHORT.map((_, di) => (
                <div key={di} className="relative">
                  {mySlots
                    .filter((s) => s.dayOfWeek === di)
                    .map((s) => {
                      const sh = parseInt(s.startTime.slice(0, 2));
                      const sm = parseInt(s.startTime.slice(3, 5));
                      const eh = parseInt(s.endTime.slice(0, 2));
                      const em = parseInt(s.endTime.slice(3, 5));
                      const top = (sh - 7) * 48 + (sm / 60) * 48;
                      const height = Math.max(20, ((eh - sh) + (em - sm) / 60) * 48);
                      return (
                        <div
                          key={s.id}
                          className="absolute left-1 right-1 rounded-md bg-accent-500 text-white text-xs px-1.5 py-1 pointer-events-auto"
                          style={{ top, height }}
                          title={`${s.startTime}–${s.endTime}`}
                        >
                          <span className="font-semibold">{s.startTime}–{s.endTime}</span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Editor por día */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WEEKDAY_LABELS.map((label, di) => {
          const daySlots = mySlots.filter((s) => s.dayOfWeek === di).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <Card key={di} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800">{label}</h3>
                <button
                  onClick={() => { setDay(String(di)); setModalOpen(true); }}
                  className="text-accent-600 hover:text-accent-700"
                  aria-label={`Agregar franja el ${label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {daySlots.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">Sin franjas.</p>
              ) : (
                <ul className="space-y-2">
                  {daySlots.map((s) => {
                    const overlaps = mySlots.some(
                      (o) => o.id !== s.id && o.dayOfWeek === s.dayOfWeek && slotsOverlap(o.startTime, o.endTime, s.startTime, s.endTime)
                    );
                    return (
                      <li
                        key={s.id}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-lg border-2 px-3 py-2',
                          overlaps ? 'border-pending-border bg-pending-bg' : 'border-slate-100 bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                          <span className="font-medium">{s.startTime} – {s.endTime}</span>
                          {overlaps && (
                            <span className="inline-flex items-center gap-1 text-xs text-pending-fg font-semibold">
                              <AlertTriangle className="w-3 h-3" /> Se cruza
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(s)}
                          className="text-cancelled-fg hover:text-red-700 p-1"
                          aria-label={`Eliminar franja de ${s.startTime} a ${s.endTime}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        title="Agregar franja de disponibilidad"
        onClose={() => setModalOpen(false)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="accent" onClick={handleAdd}>Agregar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Día"
            name="day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            options={WEEKDAY_LABELS.map((l, i) => ({ value: String(i), label: l }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Hora de inicio" name="st" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} error={error || undefined} />
            <Input label="Hora de fin" name="et" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          {error && (
            <p className="text-sm text-cancelled-fg font-medium flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
