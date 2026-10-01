import { useState } from 'react'
import { WorkoutsTable } from '@/components/workouts'
import { Button, Card, EmptyState, Text, Toast } from '@/components/ui'
import { useClientWorkouts } from '@/hooks/useClientWorkouts'

export interface ClientWorkoutsPanelProps {
  clientId: string
  onOpenSession: (sessionId: string) => void
}

function formatUpdatedLabel(lastSyncedAt: Date | null, sessionCount: number) {
  if (sessionCount === 0) return 'Aún no hay entrenamientos registrados.'
  if (!lastSyncedAt) {
    return `Actualizado · ${sessionCount} entrenamiento${sessionCount === 1 ? '' : 's'}`
  }
  const seconds = Math.max(0, Math.round((Date.now() - lastSyncedAt.getTime()) / 1000))
  if (seconds < 60) return 'Actualizado hace unos segundos'
  return `Actualizado · ${sessionCount} entrenamiento${sessionCount === 1 ? '' : 's'}`
}

function formatSyncToast(newCount: number) {
  if (newCount <= 0) return 'No hay entrenamientos nuevos.'
  if (newCount === 1) return '1 entrenamiento nuevo sincronizado desde la app'
  return `${newCount} entrenamientos nuevos sincronizados desde la app`
}

export function ClientWorkoutsPanel({ clientId, onOpenSession }: ClientWorkoutsPanelProps) {
  const { sessions, isLoading, isSyncing, error, lastSyncedAt, refetch, syncSessions } =
    useClientWorkouts(clientId)
  const [toast, setToast] = useState<string>()

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(undefined), 3500)
  }

  const handleSync = async () => {
    try {
      const { newCount } = await syncSessions()
      showToast(formatSyncToast(newCount))
    } catch {
      showToast('No pudimos sincronizar los entrenamientos.')
    }
  }

  if (isLoading) {
    return (
      <Card className="flex min-h-[240px] items-center justify-center">
        <Text tone="muted">Cargando entrenamientos…</Text>
      </Card>
    )
  }

  if (error && sessions.length === 0) {
    return (
      <EmptyState
        title="No pudimos cargar los entrenamientos"
        description={error}
        icon="error"
        action={{ label: 'Reintentar', onClick: () => void refetch() }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-wrap items-center justify-between gap-xl">
        <Text tone="secondary">{formatUpdatedLabel(lastSyncedAt, sessions.length)}</Text>
        <Button
          label="Registrar entrenamiento"
          icon="add"
          size="sm"
          loading={isSyncing}
          onClick={() => void handleSync()}
        />
      </div>

      {sessions.length === 0 ? (
        <Card className="flex min-h-[220px] items-center justify-center p-xl">
          <EmptyState
            title="Sin entrenamientos"
            description="Cuando el cliente registre un entrenamiento en la app, aparecerá aquí al sincronizar."
            icon="fitness_center"
          />
        </Card>
      ) : (
        <WorkoutsTable sessions={sessions} onOpenSession={onOpenSession} />
      )}

      {toast && (
        <Toast
          message={toast}
          tone={toast.startsWith('No pudimos') ? 'error' : 'info'}
          className="fixed inset-x-xl bottom-xl sm:right-10 sm:left-auto sm:bottom-8"
        />
      )}
    </div>
  )
}
