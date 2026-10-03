/**
 * Card with the recorded sets of one exercise.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { Card, Icon, Text } from '@/components/ui'
import type { WorkoutExercise } from '@/types/workout'
import { formatKg } from '@/utils/format'

/**
 * Props accepted by {@link WorkoutExerciseCard}.
 */
export interface WorkoutExerciseCardProps {
  /** Exercise with the sets the client recorded. */
  exercise: WorkoutExercise
}

/**
 * Shows one exercise of a workout session with the load and repetitions of each recorded set.
 */
export function WorkoutExerciseCard({ exercise }: WorkoutExerciseCardProps) {
  return (
    <Card className="flex flex-col gap-lg">
      <Text as="h2" variant="body-l-strong">
        {exercise.exerciseName}
      </Text>

      {exercise.sets.length === 0 ? (
        <Text variant="body-m" tone="muted">
          Sin series registradas
        </Text>
      ) : (
        <ul className="flex flex-wrap gap-md">
          {exercise.sets.map((set) => (
            <li
              key={set.setNumber}
              className="flex min-w-0 flex-1 flex-col items-center gap-2xs rounded-md border border-line-subtle bg-surface-container-low p-lg"
            >
              <span className="flex items-center gap-xs">
                <Text as="span" variant="label-m-bold" tone="primary">
                  Serie {set.setNumber}
                </Text>
                <Icon name="check" size={16} />
              </span>
              <Text as="span" variant="body-l-strong">
                {formatKg(set.loadKg)}
              </Text>
              <Text as="span" variant="body-m" tone="secondary">
                {set.reps} reps
              </Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
