/**
 * Progress tab of a client.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { ProgressChartCard, ProgressFilters, ProgressSummary } from '@/components/workouts'
import { Card, EmptyState, LoadingState } from '@/components/ui'
import { useClientOutlet } from '@/hooks/useClientOutlet'
import { useClientProgress } from '@/hooks/useClientProgress'

/**
 * Shows the adherence of a client in a period and the evolution of one exercise, using
 * {@link useClientProgress} for data and filters.
 *
 * @remarks
 * Rendered inside `ClientLayoutPage`, which loads the client.
 */
export function ClientProgressPage() {
  const { client } = useClientOutlet()
  const { weeks, setWeeks, exerciseId, setExerciseId, report, chart, isLoading, error, refetch } = useClientProgress(
    client.id,
  )

  if (!report) {
    if (isLoading) return <LoadingState label="Cargando progreso…" />
    return (
      <Card>
        <EmptyState
          title="No pudimos cargar el progreso"
          description={error ?? undefined}
          icon="error"
          action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
        />
      </Card>
    )
  }

  const metric = report.exercises.find((exercise) => exercise.exerciseId === exerciseId)

  if (!report.hasData) {
    return <Card><EmptyState title="Sin datos en el periodo" description="Aún no hay entrenamientos para mostrar en este periodo." icon="show_chart" /></Card>
  }

  return (
    <div className="flex flex-col gap-2xl">
      <ProgressFilters
        weeks={weeks}
        exerciseId={exerciseId}
        exercises={report.exercises}
        onWeeksChange={setWeeks}
        onExerciseChange={setExerciseId}
      />
      <ProgressSummary report={report} metric={metric} />
      <ProgressChartCard chart={chart} exerciseName={metric?.exerciseName} />
    </div>
  )
}
