/**
 * Status badge of a workout session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { Badge } from '@/components/ui'
import type { BadgeTone, IconName } from '@/types/ui'
import type { WorkoutSessionStatus } from '@/types/workout'

/** Label, tone and icon shown for each session status. */
const statusPresentation: Record<WorkoutSessionStatus, { label: string; tone: BadgeTone; icon: IconName }> = {
  PENDING: { label: 'Pendiente', tone: 'primary', icon: 'schedule' },
  COMPLETED: { label: 'Completada', tone: 'tertiary', icon: 'check' },
  PARTIAL: { label: 'Parcial', tone: 'secondary', icon: 'timelapse' },
  SKIPPED: { label: 'Omitida', tone: 'neutral', icon: 'remove' },
}

/**
 * Props accepted by {@link WorkoutStatusBadge}.
 */
export interface WorkoutStatusBadgeProps {
  /** Status to show. */
  status: WorkoutSessionStatus
  /**
   * Shows the icon of the status before the label.
   *
   * @defaultValue `false`
   */
  withIcon?: boolean
}

/**
 * Shows the status of a workout session as a badge.
 */
export function WorkoutStatusBadge({ status, withIcon = false }: WorkoutStatusBadgeProps) {
  const { label, tone, icon } = statusPresentation[status]
  return <Badge label={label} tone={tone} icon={withIcon ? icon : undefined} />
}
