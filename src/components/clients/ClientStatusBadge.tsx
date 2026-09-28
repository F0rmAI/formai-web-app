import { Badge } from '@/components/ui'
import type { ClientStatus } from '@/types/client'

const statusPresentation: Record<ClientStatus, { label: string; tone: 'primary' | 'secondary' | 'tertiary' | 'neutral' }> = {
  ACTIVE: { label: 'Activo', tone: 'tertiary' },
  INVITED: { label: 'Código enviado', tone: 'primary' },
  INVITATION_EXPIRED: { label: 'Código vencido', tone: 'secondary' },
  INACTIVE: { label: 'Inactivo', tone: 'neutral' },
}

export interface ClientStatusBadgeProps {
  status: ClientStatus
}

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const presentation = statusPresentation[status]
  return <Badge label={presentation.label} tone={presentation.tone} />
}
