/**
 * Summary cards of the progress view.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { Badge, Card, ProgressBar, StatCard, Text } from '@/components/ui'
import type { ExerciseMetric, ProgressReport } from '@/types/workout'
import { formatKg, formatNumber } from '@/utils/format'

/** Formats a change with its sign, such as `+4 kg`. */
function toSigned(value: number, unit: string): string {
  return `${value > 0 ? '+' : ''}${formatNumber(value, Number.isInteger(value) ? 0 : 1)} ${unit}`
}

/**
 * Props accepted by {@link ProgressSummary}.
 */
export interface ProgressSummaryProps {
  /** Adherence of the client in the period. */
  report: ProgressReport
  /** Change of the selected exercise, or `undefined` when the period has no records. */
  metric?: ExerciseMetric
}

/**
 * Shows the adherence of a client, its sessions by status and the change in load and volume of
 * the selected exercise.
 */
export function ProgressSummary({ report, metric }: ProgressSummaryProps) {
  const trained = report.completed + report.partial
  const volumeChange =
    metric && metric.firstVolumeKg > 0
      ? Math.round(((metric.lastVolumeKg - metric.firstVolumeKg) / metric.firstVolumeKg) * 100)
      : 0

  return (
    <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 xl:grid-cols-4">
      <Card className="flex flex-col gap-md">
        <Text tone="secondary">¿Cumple su plan?</Text>
        <Text variant="display-xl">{Math.round(report.adherencePercentage)} %</Text>
        <ProgressBar value={report.adherencePercentage} label="Adherencia al plan" />
        <Text variant="body-m" tone="muted">
          {report.scheduled > 0
            ? `${trained} de ${report.scheduled} sesiones completadas`
            : 'Sin sesiones registradas en este periodo'}
        </Text>
      </Card>

      <Card className="flex flex-col gap-lg">
        <Text tone="secondary">Sesiones por estado</Text>
        <div className="flex items-center justify-between gap-md">
          <Badge label="Completadas" tone="tertiary" />
          <Text variant="title-strong">{report.completed}</Text>
        </div>
        <div className="flex items-center justify-between gap-md">
          <Badge label="Parciales" tone="secondary" />
          <Text variant="title-strong">{report.partial}</Text>
        </div>
        <div className="flex items-center justify-between gap-md">
          <Badge label="Omitidas" tone="neutral" />
          <Text variant="title-strong">{report.skipped}</Text>
        </div>
      </Card>

      <StatCard
        label="Carga máxima"
        icon="military_tech"
        value={metric ? formatNumber(metric.lastMaxLoadKg, Number.isInteger(metric.lastMaxLoadKg) ? 0 : 1) : '—'}
        unit={metric ? 'kg' : undefined}
        caption={metric ? `Primera sesión: ${formatKg(metric.firstMaxLoadKg)}` : 'Sin datos'}
        change={toSigned(metric ? metric.lastMaxLoadKg - metric.firstMaxLoadKg : 0, 'kg')}
        changeIcon="trending_up"
      />

      <StatCard
        label="Volumen"
        icon="local_fire_department"
        tone="secondary"
        value={metric ? formatNumber(metric.lastVolumeKg) : '—'}
        unit={metric ? 'kg' : undefined}
        caption={metric ? `Primera sesión: ${formatKg(metric.firstVolumeKg, 0)}` : 'Sin datos'}
        change={toSigned(volumeChange, '%')}
        changeIcon="local_fire_department"
      />
    </div>
  )
}
