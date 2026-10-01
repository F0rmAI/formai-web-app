import { Card, Icon, Text } from '@/components/ui'
import type { WorkoutExercise, WorkoutSet } from '@/types/workout'

export interface SetSummaryTileProps {
  set: WorkoutSet
  targetReps: number
}

export function SetSummaryTile({ set, targetReps }: SetSummaryTileProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2xs rounded-md bg-surface-container px-md py-sm">
      <div className="flex items-center justify-between gap-sm">
        <Text variant="overline" tone="secondary">
          Serie {set.setNumber}
        </Text>
        <Icon name="check_circle" size={16} className="text-tertiary" />
      </div>
      <Text variant="body-l-strong">{formatKg(set.loadKg)} kg</Text>
      <Text variant="body-m" tone="muted">
        {set.reps}/{targetReps} reps
      </Text>
    </div>
  )
}

function formatKg(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',')
}

export interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise
}

export function WorkoutExerciseCard({ exercise }: WorkoutExerciseCardProps) {
  return (
    <Card className="flex flex-col gap-md p-lg">
      <Text variant="body-l-strong">{exercise.exerciseName}</Text>
      <div className="flex flex-wrap gap-sm">
        {exercise.sets.length > 0 ? (
          exercise.sets.map((set) => (
            <SetSummaryTile key={set.setNumber} set={set} targetReps={exercise.targetReps} />
          ))
        ) : (
          <Text variant="body-m" tone="muted">
            Sin series registradas
          </Text>
        )}
      </div>
    </Card>
  )
}
