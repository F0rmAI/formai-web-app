import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { GuestOnly, RequireAuth } from '@/components/auth/RequireAuth'
import { AppShell } from '@/components/layout'
import { AuthProvider } from '@/context/AuthProvider'
import { useAuth } from '@/context/useAuth'
import { ClientDetailPage, type ClientDetailTab } from '@/pages/ClientDetailPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { ClientWebGatePage } from '@/pages/ClientWebGatePage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ForgotPasswordSentPage } from '@/pages/ForgotPasswordSentPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const displayName = user?.fullName ?? user?.email?.split('@')[0] ?? 'Entrenador'

  return (
    <AppShell
      onNavigateToClients={() => navigate('/clients')}
      user={{ name: displayName, email: user?.email ?? '' }}
      onSignOut={() => {
        void logout().then(() => navigate('/login', { replace: true }))
      }}
    >
      <Outlet />
    </AppShell>
  )
}

function ClientDetailRoute({ tab = 'ficha' }: { tab?: ClientDetailTab }) {
  const { clientId, sessionId } = useParams<{ clientId: string; sessionId?: string }>()
  const navigate = useNavigate()

  if (!clientId) return <Navigate to="/clients" replace />

  return (
    <ClientDetailPage
      clientId={clientId}
      tab={tab}
      sessionId={sessionId}
      onBack={() => navigate('/clients')}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/sent" element={<ForgotPasswordSentPage />} />
            <Route path="/access-app" element={<ClientWebGatePage />} />
          </Route>

          <Route path="/password-reset" element={<ResetPasswordPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/:clientId" element={<ClientDetailRoute tab="ficha" />} />
              <Route path="/clients/:clientId/workouts" element={<ClientDetailRoute tab="entrenamientos" />} />
              <Route
                path="/clients/:clientId/workouts/:sessionId"
                element={<ClientDetailRoute tab="entrenamientos" />}
              />
              <Route path="/clients/:clientId/progress" element={<ClientDetailRoute tab="progreso" />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="*" element={<Navigate to="/clients" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
