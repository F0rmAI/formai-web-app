import { ProgressChartCard, ProgressFilters, ProgressStats } from '@/components/workouts'
import { Card, EmptyState, Text } from '@/components/ui'
import { useClientProgress, type ProgressPeriod } from '@/hooks/useClientProgress'

export interface ClientProgressPanelProps {
  clientId: string
}

export function ClientProgressPanel({ clientId }: ClientProgressPanelProps) {
  const {
    period,
    setPeriod,
    exerciseId,
    setExerciseId,
    report,
    chart,
    isLoading,
    error,
    refetch,
  } = useClientProgress(clientId)

  if (isLoading && !report) {
    return (
      <Card className="flex min-h-[240px] items-center justify-center">
        <Text tone="muted">Cargando progreso…</Text>
      </Card>
    )
  }

  if (error && !report) {
    return (
      <EmptyState
        title="No pudimos cargar el progreso"
        description={error}
        icon="error"
        action={{ label: 'Reintentar', onClick: () => void refetch() }}
      />
    )
  }

  const exerciseOptions =
    report?.exercises.map((item) => ({
      value: item.exerciseId,
      label: item.exerciseName,
    })) ?? []

  const selectedExerciseName = report?.exercises.find((item) => item.exerciseId === exerciseId)?.exerciseName

  return (
    <div className="flex flex-col gap-xl">
      <ProgressFilters
        period={period}
        onPeriodChange={(value: ProgressPeriod) => setPeriod(value)}
        exerciseId={exerciseId}
        exerciseOptions={exerciseOptions}
        onExerciseChange={setExerciseId}
      />

      {report ? (
        <>
          <ProgressStats report={report} />
          <ProgressChartCard
            chart={chart}
            exerciseName={selectedExerciseName}
            hasPeriodData={report.hasData}
          />
        </>
      ) : (
        <EmptyState
          title="Sin datos de progreso"
          description="Cuando haya sesiones en el periodo seleccionado, verás adherencia y evolución aquí."
          icon="monitoring"
        />
      )}
    </div>
  )
}
