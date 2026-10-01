import { IconButton, Text, TextField } from '@/components/ui'
import type { EditorPrescribedExercise } from '@/types/routine'

export interface PrescribedExerciseRowProps {
  exercise: EditorPrescribedExercise
  onChange: (exercise: EditorPrescribedExercise) => void
  onRemove: () => void
}

export function PrescribedExerciseRow({ exercise, onChange, onRemove }: PrescribedExerciseRowProps) {
  const updateNumber = (field: 'sets' | 'reps' | 'targetLoadKg' | 'restSeconds', value: string) => {
    const parsed = field === 'targetLoadKg' ? Number.parseFloat(value) : Number.parseInt(value, 10)
    onChange({
      ...exercise,
      [field]: Number.isFinite(parsed) ? parsed : 0,
    })
  }

  return (
    <div className="flex flex-col gap-lg rounded-lg border border-line-subtle bg-surface-card p-lg">
      <div className="flex items-start justify-between gap-md">
        <div className="min-w-0 flex-1">
          <Text variant="body-l-strong">{exercise.exerciseName}</Text>
        </div>
        <IconButton
          icon="delete"
          label={`Quitar ${exercise.exerciseName}`}
          variant="tonal"
          onClick={onRemove}
          className="size-8 shrink-0 bg-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-lg sm:grid-cols-4">
        <TextField
          label="Series"
          type="number"
          min={1}
          value={String(exercise.sets)}
          onChange={(event) => updateNumber('sets', event.target.value)}
        />
        <TextField
          label="Reps"
          type="number"
          min={1}
          value={String(exercise.reps)}
          onChange={(event) => updateNumber('reps', event.target.value)}
        />
        <TextField
          label="Carga (kg)"
          type="number"
          min={0}
          step="0.5"
          value={String(exercise.targetLoadKg)}
          onChange={(event) => updateNumber('targetLoadKg', event.target.value)}
        />
        <TextField
          label="Descanso (s)"
          type="number"
          min={0}
          value={String(exercise.restSeconds)}
          onChange={(event) => updateNumber('restSeconds', event.target.value)}
        />
      </div>
    </div>
  )
}
