/**
 * Detail page of one workout session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useNavigate, useParams } from 'react-router-dom'
import { WorkoutExerciseCard, WorkoutStatusBadge } from '@/components/workouts'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, EmptyState, LoadingState } from '@/components/ui'
import { useClientDetail } from '@/hooks/useClientDetail'
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail'
import { ROUTES } from '@/navigation/routes'
import { formatDate, formatKg, formatTime } from '@/utils/format'

/** Renders the detail of one session; it is keyed by session so its state never leaks to another. */
function WorkoutDetail({ clientId, sessionId }: { clientId: string; sessionId: string }) {
  const navigate = useNavigate()
  const { client } = useClientDetail(clientId)
  const { session, isLoading, error, refetch } = useWorkoutDetail(clientId, sessionId)
  const backButton = (
    <Button
      label="Volver"
      icon="arrow_back"
      variant="secondary"
      size="md"
      onClick={() => navigate(ROUTES.clientWorkouts(clientId))}
    />
  )
  const breadcrumb = `Clientes / ${client?.fullName ?? '…'} / Entrenamientos`

  if (!session) {
    return (
      <>
        <PageHeader breadcrumb={breadcrumb} title="Entrenamiento" actions={backButton} />
        <div className="mt-2xl">
          {isLoading ? (
            <LoadingState label="Cargando entrenamiento…" />
          ) : (
            <Card>
              <EmptyState
                title="No pudimos abrir este entrenamiento"
                description={error ?? 'El entrenamiento solicitado no está disponible.'}
                icon="error"
                action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
              />
            </Card>
          )}
        </div>
      </>
    )
  }

  const subtitle = [
    formatDate(session.scheduledFor, 'full'),
    formatTime(session.finishedAt),
    formatKg(session.totalVolumeKg, 0),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <PageHeader breadcrumb={breadcrumb} title={session.dayLabel} subtitle={subtitle} actions={backButton} />

      <div className="mt-xl flex flex-wrap gap-md">
        <WorkoutStatusBadge status={session.status} withIcon />
        <Badge label={`Rutina · versión ${session.routineVersion}`} tone="neutral" icon="history" />
      </div>

      <div className="mt-2xl grid grid-cols-1 gap-xl lg:grid-cols-2">
        {session.exercises.map((exercise) => (
          <WorkoutExerciseCard key={exercise.exerciseId} exercise={exercise} />
        ))}
      </div>

      {session.exercises.length === 0 && (
        <Card>
          <EmptyState title="Sin ejercicios registrados" icon="fitness_center" />
        </Card>
      )}
    </>
  )
}

/**
 * Shows one workout session of a client with the sets recorded for each exercise, using
 * {@link useWorkoutDetail} for the session and {@link useClientDetail} for the client name.
 *
 * @remarks
 * Requires an authenticated session; the route guard redirects otherwise. The page is read-only:
 * workouts are recorded by the client in the mobile app.
 */
export function ClientWorkoutDetailPage() {
  const { clientId = '', sessionId = '' } = useParams()
  return <WorkoutDetail key={sessionId} clientId={clientId} sessionId={sessionId} />
}
