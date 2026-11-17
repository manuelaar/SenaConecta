import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Mail } from 'lucide-react';
import type { Notification } from '@/types';
import { useAppData } from '@/hooks/useAppData';
import { markAllNotificationsRead } from '@/services/actions';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

export function NotificationBell() {
  const data = useAppData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const myNotifs = user
    ? data.notifications
        .filter((n) => n.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const unread = myNotifs.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificaciones${unread > 0 ? `, ${unread} sin leer` : ''}`}
        aria-expanded={open}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 bg-cancelled-fg text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
            aria-hidden="true"
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-card border border-slate-100 z-[100] overflow-hidden"
          role="dialog"
          aria-label="Notificaciones"
        >
          <header className="flex items-center justify-between p-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm">Notificaciones</h2>
            {unread > 0 && (
              <button
                onClick={() => markAllNotificationsRead(user.id)}
                className="text-xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas como leídas
              </button>
            )}
          </header>
          <div className="max-h-96 overflow-y-auto">
            {myNotifs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No tienes notificaciones.</p>
            ) : (
              myNotifs.slice(0, 20).map((n) => <NotifItem key={n.id} n={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifItem({ n }: { n: Notification }) {
  return (
    <div
      className={cn(
        'p-3 border-b border-slate-50 last:border-0 flex gap-2',
        !n.read && 'bg-accent-50/40'
      )}
    >
      <div className="flex-1">
        <p className={cn('text-sm', !n.read ? 'font-bold text-slate-800' : 'text-slate-700')}>
          {n.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <time className="text-xs text-slate-400">
            {new Date(n.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
          </time>
          {n.emailSent && (
            <span className="inline-flex items-center gap-1 text-xs text-accent-600 font-medium">
              <Mail className="w-3 h-3" aria-hidden="true" />
              También enviado por correo
            </span>
          )}
        </div>
      </div>
      {!n.read && (
        <span className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0 mt-1.5" aria-label="Sin leer" />
      )}
    </div>
  );
}
