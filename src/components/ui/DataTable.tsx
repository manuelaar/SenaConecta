import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  empty?: ReactNode;
  rowKey: (row: T) => string;
}

export function DataTable<T>({ columns, data, empty, rowKey }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <>{empty ?? <p className="text-slate-500 text-center py-8">No hay datos para mostrar.</p>}</>
    );
  }

  return (
    <>
      {/* Tabla en escritorio */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn('px-4 py-3 font-semibold text-slate-600', c.className)}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={rowKey(row)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 py-3 text-slate-700', c.className)}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas en móvil */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((row) => (
          <div key={rowKey(row)} className="bg-white rounded-xl border border-slate-100 p-4 shadow-soft">
            {columns.map((c) => (
              <div key={c.key} className={cn('flex justify-between gap-3 py-1', c.hideOnMobile && 'hidden')}>
                <span className="text-xs font-semibold text-slate-500 flex-shrink-0">{c.header}</span>
                <span className="text-sm text-slate-800 text-right">{c.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
