import { Badge } from '@/components/ui'
import type { ExerciseStatus } from '@/types/exercise'

const statusPresentation: Record<ExerciseStatus, { label: string; tone: 'tertiary' | 'neutral' }> = {
  ACTIVE: { label: 'Activo', tone: 'tertiary' },
  ARCHIVED: { label: 'Archivado', tone: 'neutral' },
}

export interface ExerciseStatusBadgeProps {
  status: ExerciseStatus
}

export function ExerciseStatusBadge({ status }: ExerciseStatusBadgeProps) {
  const presentation = statusPresentation[status]
  return <Badge label={presentation.label} tone={presentation.tone} />
}
