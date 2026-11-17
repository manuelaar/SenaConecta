import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, User } from '@/types';
import { getData, getSession, saveData, setSession } from '@/services/storage';
import { sha256 } from '@/utils/date';
import { uid } from '@/utils/date';

interface AuthResult {
  ok: boolean;
  error?: string;
  role?: Role;
}

export function homePathFor(role: Role): string {
  return role === 'student' ? '/estudiante' : role === 'interpreter' ? '/interprete' : '/coordinador';
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginAs: (userId: string) => void;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // La sesión se lee de forma síncrona en el primer render para que
  // recargar la página (F5) o abrir un enlace directo no saque al usuario.
  const [user, setUser] = useState<User | null>(() => {
    const s = getSession();
    if (!s) return null;
    return getData().users.find((x) => x.id === s.userId) ?? null;
  });

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const data = getData();
    const u = data.users.find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!u) return { ok: false, error: 'No existe una cuenta con ese correo.' };
    const hash = await sha256(password);
    if (hash !== u.passwordHash) return { ok: false, error: 'La contraseña es incorrecta.' };
    setSession({ userId: u.id });
    setUser(u);
    return { ok: true, role: u.role };
  }, []);

  const loginAs = useCallback((userId: string) => {
    const u = getData().users.find((x) => x.id === userId);
    if (u) {
      setSession({ userId: u.id });
      setUser(u);
    }
  }, []);

  const register = useCallback(
    async (input: { fullName: string; email: string; password: string; role: Role }): Promise<AuthResult> => {
      const email = input.email.trim().toLowerCase();
      if (!email.endsWith('@universidad.edu.co')) {
        return { ok: false, error: 'El correo debe ser institucional (terminar en @universidad.edu.co).' };
      }
      if (input.password.length < 8) {
        return { ok: false, error: 'La contraseña debe tener mínimo 8 caracteres.' };
      }
      const data = getData();
      if (data.users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
      }
      const hash = await sha256(input.password);
      const u: User = {
        id: uid('u'),
        fullName: input.fullName.trim(),
        email,
        passwordHash: hash,
        role: input.role,
        createdAt: new Date().toISOString(),
      };
      const next = { ...data, users: [...data.users, u] };
      saveData(next);
      setSession({ userId: u.id });
      setUser(u);
      return { ok: true, role: u.role };
    },
    []
  );

  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, loginAs, register, logout }),
    [user, login, loginAs, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
