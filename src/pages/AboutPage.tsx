import { HandHelping, Check, X, Info } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        icon={<Info className="w-6 h-6" />}
        title="Acerca de SeñaConecta"
        description="Propósito y alcance del sistema"
      />

      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-600 text-accent-300 flex items-center justify-center" aria-hidden="true">
            <HandHelping className="w-7 h-7" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Propósito</h2>
            <p className="text-slate-600 mt-2">
              SeñaConecta centraliza la solicitud, asignación y registro de intérpretes de
              Lengua de Señas Colombiana (LSC) en la universidad. Busca que ninguna solicitud
              se pierda, que los horarios de los intérpretes no se crucen, y que la Oficina de
              Inclusión cuente con datos para planear contrataciones y servicios.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Check className="w-5 h-5 text-confirmed-fg" aria-hidden="true" />
            Lo que incluye
          </h2>
          <ul className="mt-4 space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-confirmed-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Solicitud de intérpretes por parte de estudiantes sordos.
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-confirmed-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Administración de disponibilidad semanal de intérpretes.
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-confirmed-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Asignación y confirmación de solicitudes.
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-confirmed-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Registro del servicio prestado (asistencia y horas reales).
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-confirmed-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Notificaciones visuales y correos simulados a los involucrados.
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-confirmed-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Reportes por rango de fechas, intérprete y estudiante con exportación a CSV.
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-confirmed-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Accesibilidad WCAG 2.1 nivel AA: todo visual, alto contraste, navegación por teclado.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <X className="w-5 h-5 text-cancelled-fg" aria-hidden="true" />
            Lo que no incluye
          </h2>
          <ul className="mt-4 space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-cancelled-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Interpretación en vivo o por video llamada.
            </li>
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-cancelled-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Pagos, honorarios o nómina de intérpretes.
            </li>
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-cancelled-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Integración con el sistema académico (registro de notas, matrícula, horarios oficiales).
            </li>
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-cancelled-fg mt-1 flex-shrink-0" aria-hidden="true" />
              Aplicación móvil nativa (es una aplicación web responsiva).
            </li>
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <p className="text-sm text-slate-500 text-center">
          SeñaConecta es un sistema de demostración. Los datos se guardan únicamente en tu
          navegador y pueden restablecerse desde el menú de usuario.
        </p>
      </Card>
    </div>
  );
}
