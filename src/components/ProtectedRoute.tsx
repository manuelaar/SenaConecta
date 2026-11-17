import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  role: Role;
  children: ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const { push } = useToast();
  const location = useLocation();
  const warned = useRef(false);

  useEffect(() => {
    if (user && user.role !== role && !warned.current) {
      warned.current = true;
      push({
        type: 'warning',
        title: 'Acceso restringido',
        message: 'No tienes permiso para ver esa sección. Te redirigimos a tu panel.',
      });
    }
  }, [user, role, push]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== role) {
    const path = user.role === 'student' ? '/estudiante' : user.role === 'interpreter' ? '/interprete' : '/coordinador';
    return <Navigate to={path} replace />;
  }
  return <>{children}</>;
}
