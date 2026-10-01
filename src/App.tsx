/**
 * Root component of the app.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { GuestOnly, RequireAuth } from '@/components/auth/RequireAuth'
import { AppShell, type AppShellNavId } from '@/components/layout'
import { AuthProvider } from '@/context/AuthProvider'
import { useAuth } from '@/context/useAuth'
import { ClientDetailPage, type ClientDetailTab } from '@/pages/ClientDetailPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { ClientWebGatePage } from '@/pages/ClientWebGatePage'
import { ExercisesPage } from '@/pages/ExercisesPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { RoutineEditorPage } from '@/pages/RoutineEditorPage'
import { RoutinesPage } from '@/pages/RoutinesPage'
import { ForgotPasswordSentPage } from '@/pages/ForgotPasswordSentPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

function navIdFromPath(pathname: string): AppShellNavId {
  if (pathname.startsWith('/exercises')) return 'exercises'
  if (pathname.startsWith('/routines')) return 'routines'
  return 'clients'
}

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const displayName = user?.fullName ?? user?.email?.split('@')[0] ?? 'Entrenador'

  return (
    <AppShell
      activeId={navIdFromPath(location.pathname)}
      onNavigate={(id) => {
        if (id === 'clients') navigate('/clients')
        if (id === 'exercises') navigate('/exercises')
        if (id === 'routines') navigate('/routines')
      }}
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

function RoutineEditorRoute() {
  const { routineId } = useParams<{ routineId: string }>()

  if (!routineId) return <Navigate to="/routines" replace />

  return <RoutineEditorPage routineId={routineId} />
}

/**
 * Mounts the providers and the routes of the app.
 */
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
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/routines" element={<RoutinesPage />} />
              <Route path="/routines/new" element={<RoutineEditorPage />} />
              <Route path="/routines/:routineId" element={<RoutineEditorRoute />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="*" element={<Navigate to="/clients" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
