/**
 * Card with the evolution chart of one exercise.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { Card, EmptyState, LineChart, Text } from '@/components/ui'
import type { ProgressChart } from '@/types/workout'

/**
 * Props accepted by {@link ProgressChartCard}.
 */
export interface ProgressChartCardProps {
  /** Evolution of the exercise, or `null` while it loads or when the period has no exercise. */
  chart: ProgressChart | null
  /** Name of the exercise shown in the title. */
  exerciseName?: string
}

/**
 * Shows how the maximum load and the volume of one exercise evolved, or an empty state when there
 * are fewer than two sessions to compare.
 */
export function ProgressChartCard({ chart, exerciseName }: ProgressChartCardProps) {
  const points = chart?.points ?? []
  const hasEnoughData = Boolean(chart?.enoughData) && points.length > 1

  return (
    <Card className="flex flex-col gap-xl p-2xl">
      <Text as="h2" variant="title">
        Evolución{exerciseName ? ` · ${exerciseName}` : ''}
      </Text>

      {hasEnoughData ? (
        <LineChart
          label={`Evolución de la carga máxima y el volumen de ${exerciseName ?? 'el ejercicio'}`}
          series={[
            { label: 'Carga máxima (kg)', values: points.map((point) => point.maxLoadKg) },
            { label: 'Volumen (kg)', values: points.map((point) => point.volumeKg), tone: 'secondary' },
          ]}
          pointLabels={points.map((_, index) => `S${index + 1}`)}
        />
      ) : (
        <EmptyState
          title="Aún no hay datos suficientes"
          description="Este ejercicio necesita al menos dos sesiones registradas para mostrar su evolución."
          icon="query_stats"
        />
      )}
    </Card>
  )
}
