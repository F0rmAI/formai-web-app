/**
 * Table of the routines list.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { Table, TableAction, TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import { Text } from '@/components/ui'
import type { Routine } from '@/types/routine'
import { formatCount } from '@/utils/format'
import { RoutineStatusBadge } from './RoutineStatusBadge'

/** Says how many clients follow a routine today. */
function toClients(routine: Routine): string {
  if (routine.assignedClients.length > 0) return formatCount(routine.assignedClients.length, 'cliente', 'clientes')
  return routine.status === 'CLOSED' ? '—' : 'Sin clientes'
}

/**
 * Props accepted by {@link RoutinesTable}.
 */
export interface RoutinesTableProps {
  /** Routines to list. */
  routines: Routine[]
  /** Called with the routine the user wants to edit; closed routines cannot be edited. */
  onEdit: (routine: Routine) => void
}

/**
 * Lists routines in a table and reports which one the user edits.
 */
export function RoutinesTable({ routines, onEdit }: RoutinesTableProps) {
  return (
    <Table label="Rutinas">
      <TableRow header>
        <TableHeaderCell label="Rutina" />
        <TableHeaderCell label="Estado" width="md" />
        <TableHeaderCell label="Sesiones" width="lg" />
        <TableHeaderCell label="Clientes" width="lg" />
        <TableHeaderCell label="Acciones" width="sm" alignEnd />
      </TableRow>

      {routines.map((routine) => (
        <TableRow key={routine.id}>
          <TableCell>
            <Text variant="body-l-strong">{routine.name}</Text>
            <Text variant="body-m" tone="muted">
              Versión {routine.currentVersion} · creada el {routine.createdAtLabel}
            </Text>
          </TableCell>
          <TableCell width="md" label="Estado">
            <RoutineStatusBadge status={routine.status} />
          </TableCell>
          <TableCell width="lg" label="Sesiones">
            <Text tone="secondary">
              {formatCount(routine.sessions.length, 'sesión por semana', 'sesiones por semana')}
            </Text>
          </TableCell>
          <TableCell width="lg" label="Clientes">
            <Text tone="secondary">{toClients(routine)}</Text>
          </TableCell>
          <TableCell width="sm" actions>
            {routine.status !== 'CLOSED' && (
              <TableAction icon="edit" label={`Editar ${routine.name}`} onClick={() => onEdit(routine)} />
            )}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  )
}
