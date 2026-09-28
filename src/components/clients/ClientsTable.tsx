import { Icon, IconButton, Text } from '@/components/ui'
import { TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import type { ClientSummary } from '@/types/client'
import { ClientStatusBadge } from './ClientStatusBadge'

export interface ClientsTableProps {
  clients: ClientSummary[]
  onOpenClient: (clientId: string) => void
  onRegenerateCode: (client: ClientSummary) => void
}

export function ClientsTable({ clients, onOpenClient, onRegenerateCode }: ClientsTableProps) {
  return (
    <div
      role="region"
      aria-label="Tabla de clientes desplazable"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-line-subtle bg-surface-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div role="table" aria-label="Clientes" className="min-w-[880px]">
        <TableRow header>
          <TableHeaderCell label="CLIENTE" className="flex-1" />
          <TableHeaderCell label="ESTADO" className="w-[130px]" />
          <TableHeaderCell label="RUTINA VIGENTE" className="w-[170px]" />
          <TableHeaderCell label="ÚLTIMO ENTRENAMIENTO" className="w-[170px]" />
          <TableHeaderCell label="ACCIONES" className="w-[72px] justify-end" />
        </TableRow>

        {clients.map((client) => (
          <TableRow key={client.id} className="min-h-[63px]">
            <TableCell className="flex-1">
              <Text variant="body-l-strong">{client.fullName}</Text>
              <Text variant="body-m" tone="muted">
                {client.email}
              </Text>
            </TableCell>
            <TableCell className="w-[130px]">
              <ClientStatusBadge status={client.status} />
            </TableCell>
            <TableCell className="w-[170px]">
              <Text tone="secondary">{client.currentRoutine ?? 'Sin rutina'}</Text>
            </TableCell>
            <TableCell className="w-[170px]">
              <Text tone="secondary">{client.lastWorkout ?? '—'}</Text>
            </TableCell>
            <TableCell className="w-[72px] flex-row items-center justify-end gap-md">
              {client.status === 'INVITATION_EXPIRED' && (
                <IconButton
                  icon="key"
                  label={`Regenerar código de ${client.fullName}`}
                  variant="tonal"
                  onClick={() => onRegenerateCode(client)}
                  className="size-8 bg-transparent"
                />
              )}
              <button
                type="button"
                aria-label={`Abrir ficha de ${client.fullName}`}
                onClick={() => onOpenClient(client.id)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"
              >
                <Icon name="chevron_right" size={20} className="text-content-subtle" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </div>
    </div>
  )
}
