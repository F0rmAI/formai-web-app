/**
 * Status badge of a client.
 *
 * @author Melina
 * @packageDocumentation
 */

import { Badge } from '@/components/ui'
import type { ClientStatus } from '@/types/client'
import type { BadgeTone } from '@/types/ui'

/** Label and tone shown for each client status. */
const statusPresentation: Record<ClientStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: 'Activo', tone: 'tertiary' },
  INVITED: { label: 'Código enviado', tone: 'primary' },
  INVITATION_EXPIRED: { label: 'Código vencido', tone: 'secondary' },
  INACTIVE: { label: 'Inactivo', tone: 'neutral' },
}

/**
 * Props accepted by {@link ClientStatusBadge}.
 */
export interface ClientStatusBadgeProps {
  /** Status to show. */
  status: ClientStatus
}

/**
 * Shows the status of a client as a badge.
 */
export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const { label, tone } = statusPresentation[status]
  return <Badge label={label} tone={tone} />
}
