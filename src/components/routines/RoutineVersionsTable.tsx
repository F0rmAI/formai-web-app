/**
 * Table of the version history of a routine.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Table, TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import { Badge, Text } from '@/components/ui'
import type { RoutineVersion } from '@/types/routine'
import { formatCount } from '@/utils/format'

/** Summarizes what a version contains: its sessions and its prescribed exercises. */
function toSummary(version: RoutineVersion): string {
  const exercises = version.sessions.reduce((total, session) => total + session.exercises.length, 0)
  const content = `${formatCount(version.sessions.length, 'sesión', 'sesiones')} · ${formatCount(exercises, 'ejercicio', 'ejercicios')}`
  return version.number === 1 ? `Rutina creada · ${content}` : content
}

/**
 * Props accepted by {@link RoutineVersionsTable}.
 */
export interface RoutineVersionsTableProps {
  /** Versions to list, newest first. */
  versions: RoutineVersion[]
  /** Number of the version the clients follow today. */
  currentVersion: number
}

/**
 * Lists the saved versions of a routine with their author and date, marking the current one.
 */
export function RoutineVersionsTable({ versions, currentVersion }: RoutineVersionsTableProps) {
  return (
    <Table label="Historial de versiones">
      <TableRow header>
        <TableHeaderCell label="Versión" />
        <TableHeaderCell label="Estado" width="md" />
        <TableHeaderCell label="Autor" width="lg" />
        <TableHeaderCell label="Fecha" width="lg" />
      </TableRow>

      {versions.map((version) => (
        <TableRow key={version.number}>
          <TableCell>
            <Text variant="body-l-strong">Versión {version.number}</Text>
            <Text variant="body-m" tone="muted">
              {toSummary(version)}
            </Text>
          </TableCell>
          <TableCell width="md" label="Estado">
            {version.number === currentVersion ? (
              <Badge label="Vigente" tone="tertiary" />
            ) : (
              <Badge label="Anterior" tone="neutral" />
            )}
          </TableCell>
          <TableCell width="lg" label="Autor">
            <Text tone="secondary">{version.author}</Text>
          </TableCell>
          <TableCell width="lg" label="Fecha">
            <Text tone="secondary">{version.changedAtLabel}</Text>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  )
}
