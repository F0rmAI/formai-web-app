import { Badge } from '@/components/ui'
import type { RoutineStatus } from '@/types/routine'

const statusPresentation: Record<RoutineStatus, { label: string; tone: 'tertiary' | 'primary' | 'neutral' }> = {
  DRAFT: { label: 'Borrador', tone: 'neutral' },
  ACTIVE: { label: 'Activa', tone: 'primary' },
  CLOSED: { label: 'Cerrada', tone: 'neutral' },
}

export interface RoutineStatusBadgeProps {
  status: RoutineStatus
}

export function RoutineStatusBadge({ status }: RoutineStatusBadgeProps) {
  const presentation = statusPresentation[status]
  return <Badge label={presentation.label} tone={presentation.tone} />
}
