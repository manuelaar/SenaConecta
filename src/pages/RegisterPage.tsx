import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandHelping, UserPlus, AlertCircle, GraduationCap, Languages, ShieldCheck } from 'lucide-react';
import { AuroraBackground } from '@/components/fx/AuroraBackground';
import { useAuth, homePathFor } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Role } from '@/types';
import { ROLE_LABELS } from '@/types';
import { cn } from '@/utils/cn';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!role) {
      setError('Selecciona un rol.');
      return;
    }
    setLoading(true);
    const res = await register({ fullName, email, password, role });
    setLoading(false);
    if (res.ok) {
      navigate(homePathFor(role));
    } else {
      setError(res.error || 'No se pudo registrar.');
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
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-white glass-dark hover:bg-white/10 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-glow border border-white/60 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-slate-800 text-center">Crear cuenta</h1>
            <p className="text-sm text-slate-500 text-center mt-1">
              Regístrate con tu correo institucional
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
                label="Nombre completo"
                name="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Valentina Morales"
                autoComplete="name"
              />
              <Input
                label="Correo institucional"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@universidad.edu.co"
                hint="Debe terminar en @universidad.edu.co"
                autoComplete="email"
              />
              <Input
                label="Contraseña"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint="Mínimo 8 caracteres"
                autoComplete="new-password"
              />

              <fieldset>
                <legend className="text-sm font-semibold text-slate-700 mb-2">Rol</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['student', 'interpreter', 'coordinator'] as const).map((r) => {
                    const Icon = r === 'student' ? GraduationCap : r === 'interpreter' ? Languages : ShieldCheck;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        aria-pressed={role === r}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-lg border-2 text-center transition-colors',
                          role === r
                            ? 'border-accent-500 bg-accent-50 text-accent-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        )}
                      >
                        <Icon className="w-6 h-6" aria-hidden="true" />
                        <span className="text-xs font-semibold">{ROLE_LABELS[r]}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <Button type="submit" size="lg" disabled={loading} className="w-full">
                <UserPlus className="w-5 h-5" />
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </AuroraBackground>
  );
}
