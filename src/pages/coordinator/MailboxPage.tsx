import { useMemo, useState } from 'react';
import { Mail, Search, Inbox } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

export function MailboxPage() {
  const data = useAppData();
  const [search, setSearch] = useState('');
  const [openEmail, setOpenEmail] = useState<string | null>(null);

  const emails = useMemo(() => {
    const s = search.trim().toLowerCase();
    return [...data.emails]
      .filter(
        (e) =>
          !s ||
          e.to.toLowerCase().includes(s) ||
          e.subject.toLowerCase().includes(s) ||
          e.body.toLowerCase().includes(s)
      )
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  }, [data.emails, search]);

  const current = emails.find((e) => e.id === openEmail);

  return (
    <div>
      <PageHeader
        icon={<Mail className="w-6 h-6" />}
        title="Bandeja de correos simulados"
        description="Registro de los correos que SeñaConecta enviaría a los usuarios"
      />

      <Card className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por destinatario, asunto o contenido..."
            aria-label="Buscar correos"
            className="w-full rounded-lg border-2 border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-accent-500"
          />
        </div>
      </Card>

      <Card>
        {emails.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-7 h-7" />}
            title="Sin correos"
            description="No hay correos simulados que coincidan con la búsqueda."
          />
        ) : (
          <ul className="divide-y divide-slate-50">
            {emails.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => setOpenEmail(e.id)}
                  className="w-full text-left p-4 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{e.subject}</p>
                      <p className="text-sm text-slate-500 mt-0.5">Para: {e.to}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{e.body}</p>
                    </div>
                    <time className="text-xs text-slate-400 flex-shrink-0">
                      {new Date(e.sentAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </time>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={!!current}
        title={current?.subject || ''}
        onClose={() => setOpenEmail(null)}
        size="md"
      >
        {current && (
          <div>
            <div className="border-b border-slate-100 pb-3 mb-3">
              <p className="text-sm text-slate-500">
                <span className="font-semibold">Para:</span> {current.to}
              </p>
              <p className="text-sm text-slate-500">
                <span className="font-semibold">Enviado:</span>{' '}
                {new Date(current.sentAt).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{current.body}</pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
