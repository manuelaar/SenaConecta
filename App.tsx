import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { HandHelping } from 'lucide-react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { FontSizeProvider } from '@/context/FontSizeContext';
import { AppLayout } from '@/components/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AboutPage } from '@/pages/AboutPage';

import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { NewRequestPage } from '@/pages/student/NewRequestPage';
import { MyRequestsPage } from '@/pages/student/MyRequestsPage';

import { InterpreterDashboard } from '@/pages/interpreter/InterpreterDashboard';
import { AvailabilityPage } from '@/pages/interpreter/AvailabilityPage';
import { AssignmentsPage } from '@/pages/interpreter/AssignmentsPage';
import { RegisterServicePage } from '@/pages/interpreter/RegisterServicePage';
import { MyServicesPage } from '@/pages/interpreter/MyServicesPage';

import { CoordinatorDashboard } from '@/pages/coordinator/CoordinatorDashboard';
import { PendingRequestsPage } from '@/pages/coordinator/PendingRequestsPage';
import { AllRequestsPage } from '@/pages/coordinator/AllRequestsPage';
import { InterpretersPage } from '@/pages/coordinator/InterpretersPage';
import { ReportsPage } from '@/pages/coordinator/ReportsPage';
import { MailboxPage } from '@/pages/coordinator/MailboxPage';

export default function App() {
  return (
    <FontSizeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/acerca" element={<AboutLayout><AboutPage /></AboutLayout>} />

              {/* Estudiante */}
              <Route path="/estudiante" element={<ProtectedRoute role="student"><AppLayout /></ProtectedRoute>}>
                <Route index element={<StudentDashboard />} />
                <Route path="nueva" element={<NewRequestPage />} />
                <Route path="solicitudes" element={<MyRequestsPage />} />
                <Route path="acerca" element={<AboutPage />} />
              </Route>

              {/* Intérprete */}
              <Route path="/interprete" element={<ProtectedRoute role="interpreter"><AppLayout /></ProtectedRoute>}>
                <Route index element={<InterpreterDashboard />} />
                <Route path="disponibilidad" element={<AvailabilityPage />} />
                <Route path="asignaciones" element={<AssignmentsPage />} />
                <Route path="registrar" element={<RegisterServicePage />} />
                <Route path="servicios" element={<MyServicesPage />} />
                <Route path="acerca" element={<AboutPage />} />
              </Route>

              {/* Coordinador */}
              <Route path="/coordinador" element={<ProtectedRoute role="coordinator"><AppLayout /></ProtectedRoute>}>
                <Route index element={<CoordinatorDashboard />} />
                <Route path="pendientes" element={<PendingRequestsPage />} />
                <Route path="solicitudes" element={<AllRequestsPage />} />
                <Route path="interpretes" element={<InterpretersPage />} />
                <Route path="reportes" element={<ReportsPage />} />
                <Route path="correos" element={<MailboxPage />} />
                <Route path="acerca" element={<AboutPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </FontSizeProvider>
  );
}

// El "Acerca de" público se muestra sin el layout del panel
function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600">
            <HandHelping className="w-6 h-6" aria-hidden="true" />
            <span className="font-bold">SeñaConecta</span>
          </Link>
        </div>
      </header>
      <div className="py-6">{children}</div>
    </div>
  );
}
