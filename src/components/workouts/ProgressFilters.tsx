/**
 * Period and exercise filters of the progress view.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { SelectField, type SelectOption } from '@/components/ui'
import type { ExerciseMetric, ProgressWeeks } from '@/types/workout'

/** Options of the period filter; the value is the number of weeks as text. */
const periodOptions: SelectOption<string>[] = [
  { value: '4', label: 'Últimas 4 semanas' },
  { value: '8', label: 'Últimas 8 semanas' },
  { value: '12', label: 'Últimas 12 semanas' },
]

/**
 * Props accepted by {@link ProgressFilters}.
 */
export interface ProgressFiltersProps {
  /** Length of the selected period, in weeks. */
  weeks: ProgressWeeks
  /** Identifier of the selected exercise; empty when the period has none. */
  exerciseId: string
  /** Exercises recorded in the period. */
  exercises: ExerciseMetric[]
  /** Called with the period the user selects. */
  onWeeksChange: (weeks: ProgressWeeks) => void
  /** Called with the identifier of the exercise the user selects. */
  onExerciseChange: (exerciseId: string) => void
}

/**
 * Shows the period and exercise filters of the progress view and reports their changes.
 */
export function ProgressFilters({ weeks, exerciseId, exercises, onWeeksChange, onExerciseChange }: ProgressFiltersProps) {
  const exerciseOptions = exercises.map((exercise) => ({ value: exercise.exerciseId, label: exercise.exerciseName }))

  return (
    <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
      <SelectField
        label="Periodo"
        value={String(weeks)}
        options={periodOptions}
        onChange={(value) => onWeeksChange(Number(value) as ProgressWeeks)}
        icon="date_range"
      />
      <SelectField
        label="Ejercicio"
        value={exerciseId}
        options={exerciseOptions}
        onChange={onExerciseChange}
        icon="fitness_center"
        placeholder="Sin ejercicios en el periodo"
        disabled={exercises.length === 0}
      />
    </div>
  )
}
