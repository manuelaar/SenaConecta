import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandHelping, LogIn, AlertCircle, Zap } from 'lucide-react';
import { AuroraBackground } from '@/components/fx/AuroraBackground';
import { useAuth, homePathFor } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROLE_LABELS } from '@/types';

export function LoginPage() {
  const { login, loginAs } = useAuth();
  const data = useAppData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      navigate(res.role ? homePathFor(res.role) : '/');
    } else {
      setError(res.error || 'No se pudo iniciar sesión.');
    }
  }

  function quickLogin(role: 'student' | 'interpreter' | 'coordinator') {
    const u = data.users.find((x) => x.role === role);
    if (u) {
      loginAs(u.id);
      navigate(homePathFor(role));
    }
  }

  return (
    <AuroraBackground className="min-h-screen flex flex-col">
      <header className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-gold-300 to-accent-300 flex items-center justify-center">
              <HandHelping className="w-6 h-6 text-night" aria-hidden="true" />
            </span>
            <span className="font-display font-bold text-lg">SeñaConecta</span>
          </Link>
          <Link
            to="/registro"
            className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-white glass-dark hover:bg-white/10 transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-glow border border-white/60 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-slate-800 text-center">Iniciar sesión</h1>
            <p className="text-sm text-slate-500 text-center mt-1">
              Ingresa con tu correo institucional
            </p>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-lg border-2 border-cancelled-border bg-cancelled-bg p-3 text-sm text-cancelled-fg"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
              <Input
                label="Correo institucional"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@universidad.edu.co"
                autoComplete="email"
              />
              <Input
                label="Contraseña"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" size="lg" disabled={loading} className="w-full">
                <LogIn className="w-5 h-5" />
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </form>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent-500" aria-hidden="true" />
              <h2 className="font-bold text-slate-700 text-sm">Acceso rápido de demostración</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Entra directamente con un usuario de ejemplo para explorar el sistema.
            </p>
            <div className="flex flex-col gap-2">
              {(['student', 'interpreter', 'coordinator'] as const).map((r) => {
                const u = data.users.find((x) => x.role === r);
                return (
                  <button
                    key={r}
                    onClick={() => quickLogin(r)}
                    className="text-left px-4 py-2.5 rounded-lg border-2 border-slate-200 hover:border-accent-500 hover:bg-accent-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-slate-800">{ROLE_LABELS[r]}</p>
                    <p className="text-xs text-slate-500">{u?.email}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </AuroraBackground>
  );
}
