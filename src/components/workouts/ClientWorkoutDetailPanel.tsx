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
  const {
    session,
    isLoading,
    error,
    actionError,
    isSaving,
    recordSet,
    finishSession,
    refetch,
  } = useWorkoutDetail(clientId, sessionId)

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
        <Button label="Volver a entrenamientos" icon="arrow_back" variant="secondary" size="sm" onClick={onBackToList} />
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
      <Button
        label="Volver a entrenamientos"
        icon="arrow_back"
        variant="secondary"
        size="sm"
        onClick={onBackToList}
        className="self-start"
      />
      <WorkoutDetailView
        session={session}
        saving={isSaving}
        actionError={actionError}
        onRecordSet={async (input) => {
          await recordSet(input)
        }}
        onFinish={async (confirmPartial) => {
          await finishSession(confirmPartial)
        }}
      />
    </div>
  )
}
