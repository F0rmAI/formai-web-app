/**
 * Workouts tab of a client.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useNavigate } from 'react-router-dom'
import { WorkoutsTable } from '@/components/workouts'
import { Button, Card, EmptyState, LoadingState, Text } from '@/components/ui'
import { useClientOutlet } from '@/hooks/useClientOutlet'
import { useClientWorkouts } from '@/hooks/useClientWorkouts'
import { ROUTES } from '@/navigation/routes'
import { formatCount } from '@/utils/format'

/** Says how long ago the list was loaded. */
function toUpdatedLabel(lastSyncedAt: Date | null): string {
  if (!lastSyncedAt) return ''
  const minutes = Math.floor((Date.now() - lastSyncedAt.getTime()) / 60_000)
  return minutes < 1 ? 'Actualizado hace unos segundos' : `Actualizado hace ${minutes} min`
}

/**
 * Shows the workout sessions a client recorded in the mobile app and lets the trainer bring the
 * new ones, using {@link useClientWorkouts} for data and actions.
 *
 * @remarks
 * Rendered inside `ClientLayoutPage`, which loads the client.
 */
export function ClientWorkoutsPage() {
  const navigate = useNavigate()
  const { client, showToast } = useClientOutlet()
  const { sessions, isLoading, error, refetch, lastSyncedAt, sync, isSyncing } = useClientWorkouts(client.id)

  const handleSync = async () => {
    const result = await sync()
    if (!result.ok) {
      showToast(result.error.message, 'error')
      return
    }
    showToast(
      result.value > 0
        ? `${formatCount(result.value, 'entrenamiento nuevo sincronizado', 'entrenamientos nuevos sincronizados')} desde la app`
        : 'No hay entrenamientos nuevos',
      'info',
    )
  }

  if (isLoading && sessions.length === 0) return <LoadingState label="Cargando entrenamientos…" />

  if (error && sessions.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No pudimos cargar los entrenamientos"
          description={error}
          icon="error"
          action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
        />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2xl">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <Text variant="body-m" tone="muted">
          {toUpdatedLabel(lastSyncedAt)}
        </Text>
        <Button
          label="Actualizar"
          icon="refresh"
          variant="secondary"
          size="sm"
          loading={isSyncing}
          onClick={() => void handleSync()}
        />
      </div>

      {sessions.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin entrenamientos"
            description="Cuando el cliente registre un entrenamiento en la app, aparecerá aquí al sincronizar."
            icon="fitness_center"
          />
        </Card>
      ) : (
        <WorkoutsTable
          sessions={sessions}
          onOpenSession={(sessionId) => navigate(ROUTES.clientWorkout(client.id, sessionId))}
        />
      )}
    </div>
  )
}
