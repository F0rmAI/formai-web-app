import { IconButton, Text } from '@/components/ui'
import { TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import type { Exercise } from '@/types/exercise'
import { ExerciseStatusBadge } from './ExerciseStatusBadge'

export interface ExercisesTableProps {
  exercises: Exercise[]
  onArchive: (exercise: Exercise) => void
  onRestore: (exercise: Exercise) => void
}

export function ExercisesTable({ exercises, onArchive, onRestore }: ExercisesTableProps) {
  return (
    <div
      role="region"
      aria-label="Tabla de ejercicios desplazable"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-line-subtle bg-surface-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div role="table" aria-label="Ejercicios" className="min-w-[760px]">
        <TableRow header>
          <TableHeaderCell label="EJERCICIO" className="flex-1" />
          <TableHeaderCell label="ESTADO" className="w-[130px]" />
          <TableHeaderCell label="EQUIPO" className="w-[170px]" />
          <TableHeaderCell label="ACCIONES" className="w-[72px] justify-end" />
        </TableRow>

        {exercises.map((exercise) => (
          <TableRow key={exercise.id} className="min-h-[63px]">
            <TableCell className="flex-1">
              <Text variant="body-l-strong">{exercise.name}</Text>
              <Text variant="body-m" tone="muted">
                {exercise.muscleGroup}
              </Text>
            </TableCell>
            <TableCell className="w-[130px]">
              <ExerciseStatusBadge status={exercise.status} />
            </TableCell>
            <TableCell className="w-[170px]">
              <Text tone="secondary">{exercise.equipment ?? '—'}</Text>
            </TableCell>
            <TableCell className="w-[72px] flex-row items-center justify-end gap-md">
              {exercise.status === 'ACTIVE' ? (
                <IconButton
                  icon="archive"
                  label={`Archivar ${exercise.name}`}
                  variant="tonal"
                  onClick={() => onArchive(exercise)}
                  className="size-8 bg-transparent"
                />
              ) : (
                <IconButton
                  icon="unarchive"
                  label={`Restaurar ${exercise.name}`}
                  variant="tonal"
                  onClick={() => onRestore(exercise)}
                  className="size-8 bg-transparent"
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </div>
    </div>
  )
}
