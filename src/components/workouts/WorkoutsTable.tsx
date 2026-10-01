import { Icon, Text } from '@/components/ui'
import { TableCell, TableHeaderCell, TableRow } from '@/components/layout'
import type { WorkoutSessionSummary } from '@/types/workout'
import { WorkoutStatusBadge } from './WorkoutStatusBadge'

export interface WorkoutsTableProps {
  sessions: WorkoutSessionSummary[]
  onOpenSession: (sessionId: string) => void
}

function formatScheduledFor(value: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatVolume(value: number) {
  return `${value.toFixed(0)} kg`
}

export function WorkoutsTable({ sessions, onOpenSession }: WorkoutsTableProps) {
  return (
    <div
      role="region"
      aria-label="Tabla de entrenamientos desplazable"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-line-subtle bg-surface-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div role="table" aria-label="Entrenamientos" className="min-w-[640px]">
        <TableRow header>
          <TableHeaderCell label="FECHA" className="flex-1" />
          <TableHeaderCell label="DÍA" className="w-[140px]" />
          <TableHeaderCell label="ESTADO" className="w-[130px]" />
          <TableHeaderCell label="VOLUMEN" className="w-[120px]" />
          <TableHeaderCell label="ACCIONES" className="w-[72px] justify-end" />
        </TableRow>

        {sessions.map((session) => (
          <TableRow key={session.id} className="min-h-[63px]">
            <TableCell className="flex-1">
              <Text variant="body-l-strong">{formatScheduledFor(session.scheduledFor)}</Text>
            </TableCell>
            <TableCell className="w-[140px]">
              <Text tone="secondary">{session.dayLabel}</Text>
            </TableCell>
            <TableCell className="w-[130px]">
              <WorkoutStatusBadge status={session.status} />
            </TableCell>
            <TableCell className="w-[120px]">
              <Text tone="secondary">{formatVolume(session.totalVolumeKg)}</Text>
            </TableCell>
            <TableCell className="w-[72px] flex-row items-center justify-end">
              <button
                type="button"
                aria-label={`Abrir entrenamiento del ${formatScheduledFor(session.scheduledFor)}`}
                onClick={() => onOpenSession(session.id)}
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
