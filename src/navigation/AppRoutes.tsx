/**
 * Route tree of the app.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientLayoutPage } from '@/pages/ClientLayoutPage'
import { ClientProfilePage } from '@/pages/ClientProfilePage'
import { ClientProgressPage } from '@/pages/ClientProgressPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { ClientWebGatePage } from '@/pages/ClientWebGatePage'
import { ClientWorkoutDetailPage } from '@/pages/ClientWorkoutDetailPage'
import { ClientWorkoutsPage } from '@/pages/ClientWorkoutsPage'
import { ExercisesPage } from '@/pages/ExercisesPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ForgotPasswordSentPage } from '@/pages/ForgotPasswordSentPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { RoutineEditorPage } from '@/pages/RoutineEditorPage'
import { RoutinesPage } from '@/pages/RoutinesPage'
import { GuestOnly, RequireAuth } from './RouteGuards'
import { ROUTES } from './routes'
import { TrainerLayout } from './TrainerLayout'

/**
 * Renders the page that matches the current path.
 *
 * @remarks
 * Access pages are only reachable without a session and trainer pages only with one; the page that
 * sets a new password is always reachable, because it is opened from an emailed link. Unknown
 * paths go to the clients page.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.forgotPasswordSent} element={<ForgotPasswordSentPage />} />
        <Route path={ROUTES.clientGate} element={<ClientWebGatePage />} />
      </Route>

      <Route path={ROUTES.passwordReset} element={<ResetPasswordPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<TrainerLayout />}>
          <Route path={ROUTES.clients} element={<ClientsPage />} />
          <Route path={ROUTES.clientWorkout(':clientId', ':sessionId')} element={<ClientWorkoutDetailPage />} />
          <Route path={ROUTES.client(':clientId')} element={<ClientLayoutPage />}>
            <Route index element={<ClientProfilePage />} />
            <Route path="workouts" element={<ClientWorkoutsPage />} />
            <Route path="progress" element={<ClientProgressPage />} />
          </Route>
          <Route path={ROUTES.exercises} element={<ExercisesPage />} />
          <Route path={ROUTES.routines} element={<RoutinesPage />} />
          <Route path={ROUTES.routineNew} element={<RoutineEditorPage />} />
          <Route path={ROUTES.routineEdit(':routineId')} element={<RoutineEditorPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.clients} replace />} />
    </Routes>
  )
}
