/**
 * Assignment history shown on a client's profile.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Badge, Card, EmptyState, Text } from '@/components/ui'
import type { ClientAssignment } from '@/types/client'
import { formatTrainingDays } from '@/utils/training-days'

/** Props accepted by the assignment history. */
export interface ClientAssignmentHistoryProps {
  /** Assignments from newest to oldest. */
  assignments: ClientAssignment[]
}

/** Shows every assignment and its scheduled weekdays. */
export function ClientAssignmentHistory({ assignments }: ClientAssignmentHistoryProps) {
  return (
    <Card className="flex flex-col gap-xl p-2xl">
      <Text as="h2" variant="title">Historial de asignaciones</Text>
      {assignments.length === 0 ? (
        <EmptyState title="Sin asignaciones" description="Este cliente aún no ha tenido una rutina asignada." icon="history" />
      ) : (
        <ul className="flex flex-col gap-lg">
          {assignments.map((assignment, index) => (
            <li key={`${assignment.routineId}-${assignment.startDate}-${index}`} className="flex flex-col gap-sm border-b border-line-subtle pb-lg">
              <div className="flex flex-wrap items-center gap-md">
                <Text variant="body-l-strong">{assignment.routineName}</Text>
                {assignment.current && <Badge label="Vigente" tone="tertiary" />}
              </div>
              <Text variant="body-m" tone="secondary">
                {assignment.startDate} — {assignment.endDate ?? 'Vigente'}
              </Text>
              <Text variant="body-m" tone="secondary">Días de entrenamiento: {formatTrainingDays(assignment.trainingDays)}</Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
