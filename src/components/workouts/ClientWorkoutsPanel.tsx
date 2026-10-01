import { WorkoutsTable } from '@/components/workouts'
import { Button, Card, EmptyState, Text } from '@/components/ui'
import { useClientWorkouts } from '@/hooks/useClientWorkouts'

export interface ClientWorkoutsPanelProps {
  clientId: string
  onOpenSession: (sessionId: string) => void
}

export function ClientWorkoutsPanel({ clientId, onOpenSession }: ClientWorkoutsPanelProps) {
  const { sessions, pendingSession, isLoading, error, refetch } = useClientWorkouts(clientId)

  if (isLoading) {
    return (
      <Card className="flex min-h-[240px] items-center justify-center">
        <Text tone="muted">Cargando entrenamientos…</Text>
      </Card>
    )
  }

  if (error) {
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
        <Text tone="secondary">
          {sessions.length === 0
            ? 'Aún no hay entrenamientos registrados.'
            : `Actualizado · ${sessions.length} entrenamiento${sessions.length === 1 ? '' : 's'}`}
        </Text>
        <Button
          label="Registrar entrenamiento"
          icon="add"
          size="sm"
          disabled={!pendingSession}
          onClick={() => {
            if (pendingSession) onOpenSession(pendingSession.id)
          }}
        />
      </div>

      {sessions.length === 0 ? (
        <Card className="flex min-h-[220px] items-center justify-center p-xl">
          <EmptyState
            title="Sin entrenamientos"
            description="Cuando haya una sesión pendiente programada para este cliente, podrás registrar las series desde aquí."
            icon="fitness_center"
          />
        </Card>
      ) : (
        <>
          {!pendingSession && (
            <Text tone="muted">
              No hay sesión pendiente para registrar. Las sesiones se programan con la rutina asignada.
            </Text>
          )}
          <WorkoutsTable sessions={sessions} onOpenSession={onOpenSession} />
        </>
      )}
    </div>
  )
}
