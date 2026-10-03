/**
 * Table of the workout sessions of a client.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { Table, TableAction, TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import { Text } from '@/components/ui'
import type { WorkoutSessionSummary } from '@/types/workout'
import { formatDate, formatKg, formatTime } from '@/utils/format'
import { WorkoutStatusBadge } from './WorkoutStatusBadge'

/**
 * Props accepted by {@link WorkoutsTable}.
 */
export interface WorkoutsTableProps {
  /** Sessions to list, newest first. */
  sessions: WorkoutSessionSummary[]
  /** Called with the id of the session the user opens. */
  onOpenSession: (sessionId: string) => void
}

/**
 * Lists the workout sessions of a client in a table and reports which one the user opens.
 */
export function WorkoutsTable({ sessions, onOpenSession }: WorkoutsTableProps) {
  return (
    <Table label="Entrenamientos">
      <TableRow header>
        <TableHeaderCell label="Fecha" />
        <TableHeaderCell label="Estado" width="md" />
        <TableHeaderCell label="Sesión" width="lg" />
        <TableHeaderCell label="Volumen" width="lg" />
        <TableHeaderCell label="Acciones" width="sm" alignEnd />
      </TableRow>

      {sessions.map((session) => {
        const date = formatDate(session.scheduledFor, 'weekday')
        return (
          <TableRow key={session.id}>
            <TableCell>
              <Text variant="body-l-strong">{date}</Text>
              <Text variant="body-m" tone="muted">
                {session.finishedAt ? `Finalizó a las ${formatTime(session.finishedAt)}` : 'Sin registros'}
              </Text>
            </TableCell>
            <TableCell width="md" label="Estado">
              <WorkoutStatusBadge status={session.status} />
            </TableCell>
            <TableCell width="lg" label="Sesión">
              <Text tone="secondary">{session.dayLabel}</Text>
            </TableCell>
            <TableCell width="lg" label="Volumen">
              <Text tone="secondary">{formatKg(session.totalVolumeKg, 0)}</Text>
            </TableCell>
            <TableCell width="sm" actions>
              <TableAction
                icon="chevron_right"
                label={`Abrir entrenamiento del ${date}`}
                onClick={() => onOpenSession(session.id)}
              />
            </TableCell>
          </TableRow>
        )
      })}
    </Table>
  )
}
