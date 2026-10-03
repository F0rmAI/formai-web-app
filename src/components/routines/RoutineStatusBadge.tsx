/**
 * Status badge of a routine.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { Badge } from '@/components/ui'
import type { RoutineStatus } from '@/types/routine'
import type { BadgeTone } from '@/types/ui'

/** Label and tone shown for each routine status. */
const statusPresentation: Record<RoutineStatus, { label: string; tone: BadgeTone }> = {
  DRAFT: { label: 'Borrador', tone: 'neutral' },
  ACTIVE: { label: 'Vigente', tone: 'tertiary' },
  CLOSED: { label: 'Cerrada', tone: 'neutral' },
}

/**
 * Props accepted by {@link RoutineStatusBadge}.
 */
export interface RoutineStatusBadgeProps {
  /** Status to show. */
  status: RoutineStatus
}

/**
 * Shows the status of a routine as a badge.
 */
export function RoutineStatusBadge({ status }: RoutineStatusBadgeProps) {
  const { label, tone } = statusPresentation[status]
  return <Badge label={label} tone={tone} />
}
