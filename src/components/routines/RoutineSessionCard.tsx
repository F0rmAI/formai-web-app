/**
 * Read-only card of one session of a routine.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Card, Icon, Text } from '@/components/ui'
import type { RoutineSession } from '@/types/routine'
import { formatKg } from '@/utils/format'

/**
 * Props accepted by {@link RoutineSessionCard}.
 */
export interface RoutineSessionCardProps {
  /** Session to show. */
  session: RoutineSession
}

/**
 * Shows one session of a routine with the prescription of each exercise.
 */
export function RoutineSessionCard({ session }: RoutineSessionCardProps) {
  return (
    <Card className="flex flex-col gap-lg">
      <Text as="h2" variant="body-l-strong">
        {session.label}
      </Text>
      <ul className="flex flex-col gap-lg">
        {session.exercises.map((exercise) => (
          <li key={exercise.exerciseId} className="flex items-start gap-md">
            <Icon name="fitness_center" size={16} className="text-content-secondary" />
            <Text as="span" variant="body-m" tone="secondary">
              {exercise.exerciseName} · {exercise.sets} × {exercise.reps} · {formatKg(exercise.targetLoadKg)} ·{' '}
              {exercise.restSeconds} s
            </Text>
          </li>
        ))}
      </ul>
    </Card>
  )
}
