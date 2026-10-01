/**
 * Status badge of an exercise.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { Badge } from '@/components/ui'
import type { ExerciseStatus } from '@/types/exercise'
import type { BadgeTone } from '@/types/ui'

/** Label and tone shown for each exercise status. */
const statusPresentation: Record<ExerciseStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: 'Activo', tone: 'tertiary' },
  ARCHIVED: { label: 'Archivado', tone: 'neutral' },
}

/**
 * Props accepted by {@link ExerciseStatusBadge}.
 */
export interface ExerciseStatusBadgeProps {
  /** Status to show. */
  status: ExerciseStatus
}

/**
 * Shows the status of an exercise as a badge.
 */
export function ExerciseStatusBadge({ status }: ExerciseStatusBadgeProps) {
  const { label, tone } = statusPresentation[status]
  return <Badge label={label} tone={tone} />
}
