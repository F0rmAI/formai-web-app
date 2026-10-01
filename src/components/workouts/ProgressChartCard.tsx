import { Card, EmptyState, Text } from '@/components/ui'
import type { ProgressChart } from '@/types/workout'

export interface ProgressChartCardProps {
  chart: ProgressChart | null
  exerciseName?: string
  hasPeriodData: boolean
}

export function ProgressChartCard({ chart, exerciseName, hasPeriodData }: ProgressChartCardProps) {
  const points = chart?.points ?? []
  const enoughData = Boolean(chart?.enoughData && points.length > 1)
  const maxLoad = Math.max(...points.map((point) => point.maxLoadKg), 1)
  const width = 560
  const height = 160
  const padding = 16

  const polyline = points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2)
      const y = height - padding - (point.maxLoadKg / maxLoad) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <Card className="flex flex-col gap-lg p-xl">
      <Text variant="title">
        Evolución{exerciseName ? ` · ${exerciseName}` : ''}
      </Text>

      {!hasPeriodData || !enoughData ? (
        <EmptyState
          title="Datos insuficientes"
          description="Cambia el rango de fechas o el ejercicio para ver la evolución de carga."
          icon="show_chart"
          className="py-2xl"
        />
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Evolución de carga máxima de ${exerciseName ?? 'ejercicio'}`}
            className="h-40 w-full min-w-[280px]"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polyline}
              className="text-primary"
            />
            {points.map((point, index) => {
              const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2)
              const y = height - padding - (point.maxLoadKg / maxLoad) * (height - padding * 2)
              return <circle key={`${point.date}-${index}`} cx={x} cy={y} r="4" className="fill-primary" />
            })}
          </svg>
          <div className="mt-md flex justify-between gap-md">
            <Text variant="caption" tone="muted">
              {points[0]?.date}
            </Text>
            <Text variant="caption" tone="muted">
              {points.at(-1)?.date}
            </Text>
          </div>
        </div>
      )}
    </Card>
  )
}
