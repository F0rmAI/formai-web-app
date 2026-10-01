import { WorkoutDetailView } from '@/components/workouts/WorkoutDetailView'
import { Button, Card, EmptyState, Text } from '@/components/ui'
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail'

export interface ClientWorkoutDetailPanelProps {
  clientId: string
  sessionId: string
  onBackToList: () => void
}

export function ClientWorkoutDetailPanel({
  clientId,
  sessionId,
  onBackToList,
}: ClientWorkoutDetailPanelProps) {
  const { session, isLoading, error, refetch } = useWorkoutDetail(clientId, sessionId)

  if (isLoading) {
    return (
      <Card className="flex min-h-[240px] items-center justify-center">
        <Text tone="muted">Cargando entrenamiento…</Text>
      </Card>
    )
  }

  if (error || !session) {
    return (
      <div className="flex flex-col gap-xl">
        <Button label="Volver" icon="arrow_back" variant="secondary" size="sm" onClick={onBackToList} />
        <EmptyState
          title="No pudimos abrir este entrenamiento"
          description={error ?? 'El entrenamiento solicitado no está disponible.'}
          icon="error"
          action={{ label: 'Reintentar', onClick: () => void refetch() }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex items-start justify-end">
        <Button label="Volver" icon="arrow_back" variant="secondary" size="sm" onClick={onBackToList} />
      </div>
      <WorkoutDetailView session={session} />
    </div>
  )
}
