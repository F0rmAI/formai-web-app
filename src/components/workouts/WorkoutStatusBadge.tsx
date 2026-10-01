import { Badge } from '@/components/ui'
import type { BadgeTone } from '@/types/ui'
import type { WorkoutSessionStatus } from '@/types/workout'

const STATUS_META: Record<WorkoutSessionStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Pendiente', tone: 'neutral' },
  COMPLETED: { label: 'Completado', tone: 'tertiary' },
  PARTIAL: { label: 'Parcial', tone: 'secondary' },
  SKIPPED: { label: 'Omitido', tone: 'neutral' },
}

export function WorkoutStatusBadge({ status }: { status: WorkoutSessionStatus }) {
  const meta = STATUS_META[status]
  return <Badge label={meta.label} tone={meta.tone} />
}
