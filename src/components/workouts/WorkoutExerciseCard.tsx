import { useState } from 'react'
import { Button, Card, Text, TextField } from '@/components/ui'
import type { RecordSetInput, WorkoutExercise, WorkoutSet } from '@/types/workout'

export interface SetSummaryTileProps {
  set: WorkoutSet
  targetReps: number
}

export function SetSummaryTile({ set, targetReps }: SetSummaryTileProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2xs rounded-md bg-surface-container px-md py-sm">
      <Text variant="overline" tone="secondary">
        Serie {set.setNumber}
      </Text>
      <Text variant="body-l-strong">{set.loadKg.toFixed(1).replace('.', ',')} kg</Text>
      <Text variant="body-m" tone="muted">
        {set.reps}/{targetReps} reps
      </Text>
    </div>
  )
}

export interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise
  editable?: boolean
  saving?: boolean
  onRecordSet?: (input: RecordSetInput) => Promise<void>
}

function nextSetNumber(exercise: WorkoutExercise) {
  if (exercise.sets.length === 0) return 1
  const max = Math.max(...exercise.sets.map((set) => set.setNumber))
  return Math.min(max + 1, exercise.targetSets)
}

export function WorkoutExerciseCard({
  exercise,
  editable = false,
  saving = false,
  onRecordSet,
}: WorkoutExerciseCardProps) {
  const upcomingSet = nextSetNumber(exercise)
  const canAddMore = exercise.sets.length < exercise.targetSets
  const [loadKg, setLoadKg] = useState(String(exercise.targetLoadKg || 0))
  const [reps, setReps] = useState(String(exercise.targetReps || 0))

  const handleSubmit = async () => {
    if (!onRecordSet || !canAddMore) return
    const load = Number(loadKg.replace(',', '.'))
    const repsValue = Number(reps)
    if (!(load >= 0) || !(repsValue > 0)) return
    await onRecordSet({
      exerciseId: exercise.exerciseId,
      setNumber: upcomingSet,
      loadKg: load,
      reps: repsValue,
    })
  }

  return (
    <Card className="flex flex-col gap-md p-lg">
      <div className="flex flex-wrap items-baseline justify-between gap-md">
        <Text variant="body-l-strong">{exercise.exerciseName}</Text>
        <Text variant="body-m" tone="muted">
          Objetivo · {exercise.targetSets}×{exercise.targetReps} · {exercise.targetLoadKg} kg
        </Text>
      </div>
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

      {editable && canAddMore && onRecordSet && (
        <div className="mt-sm flex flex-col gap-md border-t border-line-subtle pt-md">
          <Text variant="label-m-bold" tone="secondary">
            Registrar serie {upcomingSet}
          </Text>
          <div className="grid grid-cols-1 gap-md sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <TextField
              label="Carga (kg)"
              type="number"
              min={0}
              step="0.5"
              value={loadKg}
              onChange={(event) => setLoadKg(event.target.value)}
            />
            <TextField
              label="Repeticiones"
              type="number"
              min={1}
              step="1"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
            <Button
              label="Registrar serie"
              icon="add"
              size="md"
              loading={saving}
              onClick={() => void handleSubmit()}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      )}
    </Card>
  )
}
