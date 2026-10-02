/**
 * Table of the clients list.
 *
 * @author Melina
 * @packageDocumentation
 */

import { Table, TableAction, TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import { Text } from '@/components/ui'
import type { ClientSummary } from '@/types/client'
import { ClientStatusBadge } from './ClientStatusBadge'

/**
 * Props accepted by {@link ClientsTable}.
 */
export interface ClientsTableProps {
  /** Clients to list, already filtered. */
  clients: ClientSummary[]
  /** Called with the id of the client the user opens. */
  onOpenClient: (clientId: string) => void
  /** Called with the client whose expired activation code the user wants to regenerate. */
  onRegenerateCode: (client: ClientSummary) => void
}

/**
 * Lists clients in a table and reports which one the user opens or regenerates the code for.
 */
export function ClientsTable({ clients, onOpenClient, onRegenerateCode }: ClientsTableProps) {
  return (
    <Table label="Clientes">
      <TableRow header>
        <TableHeaderCell label="Cliente" />
        <TableHeaderCell label="Estado" width="md" />
        <TableHeaderCell label="Rutina vigente" width="lg" />
        <TableHeaderCell label="Último entrenamiento" width="lg" />
        <TableHeaderCell label="Acciones" width="sm" alignEnd />
      </TableRow>

      {clients.map((client) => (
        <TableRow key={client.id}>
          <TableCell>
            <Text variant="body-l-strong">{client.fullName}</Text>
            <Text variant="body-m" tone="muted">
              {client.email ?? 'Aún sin correo'}
            </Text>
          </TableCell>
          <TableCell width="md" label="Estado">
            <ClientStatusBadge status={client.status} />
          </TableCell>
          <TableCell width="lg" label="Rutina vigente">
            <Text tone="secondary">{client.currentRoutine ?? (client.status === 'INACTIVE' ? '—' : 'Sin rutina')}</Text>
          </TableCell>
          <TableCell width="lg" label="Último entrenamiento">
            <Text tone="secondary">{client.lastWorkout ?? '—'}</Text>
          </TableCell>
          <TableCell width="sm" actions>
            {client.status === 'INVITATION_EXPIRED' && (
              <TableAction
                icon="key"
                label={`Regenerar código de ${client.fullName}`}
                onClick={() => onRegenerateCode(client)}
              />
            )}
            <TableAction
              icon="chevron_right"
              label={`Abrir ficha de ${client.fullName}`}
              onClick={() => onOpenClient(client.id)}
            />
          </TableCell>
        </TableRow>
      ))}
    </Table>
  )
}
