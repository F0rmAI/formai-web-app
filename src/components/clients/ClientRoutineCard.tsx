/**
 * Card with the routine a client follows today.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Badge, Button, Card, EmptyState, Text } from '@/components/ui'
import type { CurrentRoutine } from '@/types/client'
import { formatTrainingDays } from '@/utils/training-days'

/**
 * Props accepted by {@link ClientRoutineCard}.
 */
export interface ClientRoutineCardProps {
  /** Routine followed today, or `null` when the client has none. */
  routine: CurrentRoutine | null
  /** Called when the user asks to edit the routine. */
  onEdit: () => void
  /** Called when the user asks for the version history of the routine. */
  onViewVersions: () => void
}

/**
 * Shows the current routine of a client and reports when the user edits it or opens its versions.
 */
export function ClientRoutineCard({ routine, onEdit, onViewVersions }: ClientRoutineCardProps) {
  return (
    <Card className="flex flex-col gap-xl p-2xl">
      <div className="flex items-center justify-between gap-xl">
        <Text as="h2" variant="title">
          Rutina vigente
        </Text>
        {routine && <Badge label="Vigente" tone="tertiary" />}
      </div>

      {routine ? (
        <>
          <Text variant="headline">{routine.name}</Text>
          <Text variant="body-m" tone="secondary">
            Asignada desde el {routine.assignedSince}
            {routine.version !== null && ` · versión ${routine.version}`}
          </Text>
          <Text variant="body-m" tone="secondary">Días de entrenamiento: {formatTrainingDays(routine.trainingDays)}</Text>
          <div className="flex flex-wrap gap-md">
            <Button label="Editar rutina" icon="edit_note" size="sm" onClick={onEdit} />
            <Button label="Ver versiones" icon="history" variant="secondary" size="sm" onClick={onViewVersions} />
          </div>
        </>
      ) : (
        <EmptyState
          title="Sin rutina vigente"
          description="Asígnale una rutina para que la vea en su app."
          icon="event_busy"
        />
      )}
    </Card>
  )
}
