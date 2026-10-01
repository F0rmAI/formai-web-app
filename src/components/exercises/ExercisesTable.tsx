/**
 * Table of the exercise catalog.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { Table, TableAction, TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import { Text } from '@/components/ui'
import type { Exercise } from '@/types/exercise'
import { formatCount } from '@/utils/format'
import { ExerciseStatusBadge } from './ExerciseStatusBadge'

/** Says in how many routines an exercise is prescribed. */
function toUsage(exercise: Exercise): string {
  if (exercise.routineCount === 0) return 'Sin uso'
  const usage = `En ${formatCount(exercise.routineCount, 'rutina', 'rutinas')}`
  return exercise.status === 'ARCHIVED' ? `${usage} · histórico` : usage
}

/**
 * Props accepted by {@link ExercisesTable}.
 */
export interface ExercisesTableProps {
  /** Exercises to list, already filtered. */
  exercises: Exercise[]
  /** Called with the exercise the user wants to archive. */
  onArchive: (exercise: Exercise) => void
  /** Called with the exercise the user wants to restore. */
  onRestore: (exercise: Exercise) => void
}

/**
 * Lists the exercises of the catalog in a table and reports which one the user archives or restores.
 */
export function ExercisesTable({ exercises, onArchive, onRestore }: ExercisesTableProps) {
  return (
    <Table label="Ejercicios">
      <TableRow header>
        <TableHeaderCell label="Ejercicio" />
        <TableHeaderCell label="Estado" width="md" />
        <TableHeaderCell label="Equipo" width="lg" />
        <TableHeaderCell label="Uso en rutinas" width="lg" />
        <TableHeaderCell label="Acciones" width="sm" alignEnd />
      </TableRow>

      {exercises.map((exercise) => (
        <TableRow key={exercise.id}>
          <TableCell>
            <Text variant="body-l-strong">{exercise.name}</Text>
            <Text variant="body-m" tone="muted">
              {exercise.muscleGroup}
            </Text>
          </TableCell>
          <TableCell width="md" label="Estado">
            <ExerciseStatusBadge status={exercise.status} />
          </TableCell>
          <TableCell width="lg" label="Equipo">
            <Text tone="secondary">{exercise.equipment ?? '—'}</Text>
          </TableCell>
          <TableCell width="lg" label="Uso en rutinas">
            <Text tone="secondary">{toUsage(exercise)}</Text>
          </TableCell>
          <TableCell width="sm" actions>
            {exercise.status === 'ACTIVE' ? (
              <TableAction icon="archive" label={`Archivar ${exercise.name}`} onClick={() => onArchive(exercise)} />
            ) : (
              <TableAction icon="unarchive" label={`Restaurar ${exercise.name}`} onClick={() => onRestore(exercise)} />
            )}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  )
}
