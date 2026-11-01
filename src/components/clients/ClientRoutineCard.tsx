/**
 * Card with the routine a client follows today.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Badge, Button, Callout, Card, EmptyState, Text } from '@/components/ui'
import type { CurrentRoutine } from '@/types/client'
import { formatCount } from '@/utils/format'
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
  /** Called when the user asks to set this client's own loads, rests and note. */
  onPersonalize: () => void
  /** Reloads the routine after a failed read. */
  onRetry: () => void
}

/**
 * Shows the current routine of a client with the trainer's note and how many prescriptions are
 * personalized, and reports when the user edits the routine, opens its versions or personalizes it.
 */
export function ClientRoutineCard({ routine, onEdit, onViewVersions, onPersonalize, onRetry }: ClientRoutineCardProps) {
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
          <Text variant="body-m" tone="secondary">
            {routine.adjustments.length === 0
              ? 'Cargas y descansos de la rutina, sin personalizar'
              : `${formatCount(routine.adjustments.length, 'ejercicio personalizado', 'ejercicios personalizados')} para este cliente`}
          </Text>
          {routine.adjustments.length > 0 && (
            <ul className="flex flex-col gap-sm">
              {routine.adjustments.map((adjustment) => {
                const session = routine.sessions.find((item) => item.order === adjustment.sessionOrder)
                const exercise = session?.exercises.find((item) => item.exerciseId === adjustment.exerciseId)
                return (
                  <li key={`${adjustment.sessionOrder}/${adjustment.exerciseId}`}>
                    <Text variant="body-m" tone="secondary">
                      {session?.label ?? `Sesión ${adjustment.sessionOrder}`} · {exercise?.exerciseName ?? 'Ejercicio'}
                      {adjustment.targetLoadKg !== null && ` · carga: ${adjustment.targetLoadKg} kg`}
                      {adjustment.restSeconds !== null && ` · descanso: ${adjustment.restSeconds} s`}
                    </Text>
                  </li>
                )
              })}
            </ul>
          )}
          {routine.note && <Callout title="Nota para el cliente" description={routine.note} tone="info" />}
          {routine.version === null && (
            <>
              <Callout title="No pudimos cargar los ejercicios de la rutina" description="Reintenta antes de personalizar; tus ajustes guardados se conservan." tone="warning" />
              <Button label="Reintentar rutina" variant="secondary" size="sm" onClick={onRetry} />
            </>
          )}
          <div className="flex flex-wrap gap-md">
            <Button label="Personalizar" icon="tune" size="sm" disabled={routine.version === null} onClick={onPersonalize} />
            <Button label="Editar rutina" icon="edit_note" variant="secondary" size="sm" onClick={onEdit} />
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
