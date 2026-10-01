import { IconButton, Text } from '@/components/ui'
import { TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import type { Routine } from '@/types/routine'
import { RoutineStatusBadge } from './RoutineStatusBadge'

function formatSessionCount(count: number): string {
  if (count === 1) return '1 sesión'
  return `${count} sesiones`
}

export interface RoutinesTableProps {
  routines: Routine[]
  onOpen: (routine: Routine) => void
  onDuplicate: (routine: Routine) => void
  onAssign: (routine: Routine) => void
}

export function RoutinesTable({ routines, onOpen, onDuplicate, onAssign }: RoutinesTableProps) {
  return (
    <div
      role="region"
      aria-label="Tabla de rutinas desplazable"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-line-subtle bg-surface-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div role="table" aria-label="Rutinas" className="min-w-[880px]">
        <TableRow header>
          <TableHeaderCell label="RUTINA" className="flex-1" />
          <TableHeaderCell label="ESTADO" className="w-[130px]" />
          <TableHeaderCell label="SESIONES" className="w-[140px]" />
          <TableHeaderCell label="VERSIÓN" className="w-[100px]" />
          <TableHeaderCell label="ACCIONES" className="w-[120px] justify-end" />
        </TableRow>

        {routines.map((routine) => (
          <TableRow key={routine.id} className="min-h-[63px]">
            <TableCell className="flex-1">
              <button type="button" onClick={() => onOpen(routine)} className="text-left">
                <Text variant="body-l-strong">{routine.name}</Text>
                <Text variant="body-m" tone="muted">
                  Creada el {routine.createdAtLabel}
                </Text>
              </button>
            </TableCell>
            <TableCell className="w-[130px]">
              <RoutineStatusBadge status={routine.status} />
            </TableCell>
            <TableCell className="w-[140px]">
              <Text tone="secondary">{formatSessionCount(routine.sessions.length)}</Text>
            </TableCell>
            <TableCell className="w-[100px]">
              <Text tone="secondary">v{routine.currentVersion}</Text>
            </TableCell>
            <TableCell className="w-[120px] flex-row items-center justify-end gap-md">
              <IconButton
                icon="edit"
                label={`Editar ${routine.name}`}
                variant="tonal"
                onClick={() => onOpen(routine)}
                className="size-8 bg-transparent"
              />
              <IconButton
                icon="content_copy"
                label={`Duplicar ${routine.name}`}
                variant="tonal"
                onClick={() => onDuplicate(routine)}
                className="size-8 bg-transparent"
              />
              <IconButton
                icon="person_add"
                label={`Asignar ${routine.name}`}
                variant="tonal"
                onClick={() => onAssign(routine)}
                className="size-8 bg-transparent"
              />
            </TableCell>
          </TableRow>
        ))}
      </div>
    </div>
  )
}
