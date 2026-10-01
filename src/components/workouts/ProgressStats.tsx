import { Badge, Card, ProgressBar, Text } from '@/components/ui'
import type { ProgressReport } from '@/types/workout'

export interface ProgressStatsProps {
  report: ProgressReport
}

function deltaLabel(first: number, last: number, unit: string) {
  const delta = last - first
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1).replace('.', ',')} ${unit}`
}

export function ProgressStats({ report }: ProgressStatsProps) {
  const topExercise = report.exercises[0]
  const loadDelta = topExercise
    ? deltaLabel(topExercise.firstMaxLoadKg, topExercise.lastMaxLoadKg, 'kg')
    : '—'
  const volumeDelta = topExercise
    ? deltaLabel(topExercise.firstVolumeKg, topExercise.lastVolumeKg, 'kg')
    : '—'

  return (
    <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 xl:grid-cols-4">
      <Card className="flex flex-col gap-md p-lg">
        <Text variant="overline" tone="secondary">
          Adherencia
        </Text>
        <Text variant="headline">{Math.round(report.adherencePercentage)}%</Text>
        <ProgressBar value={report.adherencePercentage} label="Adherencia" />
        <Text variant="body-m" tone="muted">
          {report.completed + report.partial} de {report.scheduled} sesiones
        </Text>
      </Card>

      <Card className="flex flex-col gap-md p-lg">
        <Text variant="overline" tone="secondary">
          Sesiones por estado
        </Text>
        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between gap-md">
            <Badge label="Completadas" tone="tertiary" />
            <Text variant="body-l-strong">{report.completed}</Text>
          </div>
          <div className="flex items-center justify-between gap-md">
            <Badge label="Parciales" tone="secondary" />
            <Text variant="body-l-strong">{report.partial}</Text>
          </div>
          <div className="flex items-center justify-between gap-md">
            <Badge label="Omitidas" tone="neutral" />
            <Text variant="body-l-strong">{report.skipped}</Text>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-md p-lg">
        <Text variant="overline" tone="secondary">
          Cambio de carga
        </Text>
        <Text variant="headline">{loadDelta}</Text>
        <Text variant="body-m" tone="muted">
          {topExercise?.exerciseName ?? 'Sin ejercicio destacado'}
        </Text>
      </Card>

      <Card className="flex flex-col gap-md p-lg">
        <Text variant="overline" tone="secondary">
          Cambio de volumen
        </Text>
        <Text variant="headline">{volumeDelta}</Text>
        <Text variant="body-m" tone="muted">
          {topExercise?.exerciseName ?? 'Sin ejercicio destacado'}
        </Text>
      </Card>
    </div>
  )
}
