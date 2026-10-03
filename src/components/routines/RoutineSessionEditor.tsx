/**
 * Card that edits one session of the routine form.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { Button, Card, IconButton, SelectField, type SelectOption, Text, TextField } from '@/components/ui'
import type { EditorExercise, EditorSession } from '@/types/routine'
import { fieldKey } from '@/utils/routine-editor'

/** Number fields of an exercise row, with their label and keyboard. */
const numberFields = [
  { field: 'sets', label: 'Series', inputMode: 'numeric' },
  { field: 'reps', label: 'Repeticiones', inputMode: 'numeric' },
  { field: 'targetLoadKg', label: 'Carga (kg)', inputMode: 'decimal' },
  { field: 'restSeconds', label: 'Descanso (s)', inputMode: 'numeric' },
] as const

/**
 * Props accepted by {@link RoutineSessionEditor}.
 */
export interface RoutineSessionEditorProps {
  /** Position of the session in the week, starting at `1`. */
  position: number
  /** Session being edited. */
  session: EditorSession
  /** Exercises the trainer can prescribe. */
  exerciseOptions: SelectOption<string>[]
  /** Validation messages keyed by `localId` and field name. */
  errors: Record<string, string>
  /** Called with the new name of the session. */
  onLabelChange: (label: string) => void
  /** Called with the row and the fields that changed. */
  onExerciseChange: (exerciseLocalId: string, patch: Partial<EditorExercise>) => void
  /** Called when the user adds an exercise row. */
  onAddExercise: () => void
  /** Called with the row the user removes. */
  onRemoveExercise: (exerciseLocalId: string) => void
}

/**
 * Shows one session of the routine form with its exercise rows and reports every change.
 */
export function RoutineSessionEditor({
  position,
  session,
  exerciseOptions,
  errors,
  onLabelChange,
  onExerciseChange,
  onAddExercise,
  onRemoveExercise,
}: RoutineSessionEditorProps) {
  return (
    <Card className="flex flex-col gap-xl p-2xl">
      <Text as="h2" variant="title">
        Sesión {position} · {session.label || 'Sin nombre'}
      </Text>

      <TextField
        label="Nombre de la sesión"
        value={session.label}
        onChange={(event) => onLabelChange(event.target.value)}
        error={errors[fieldKey(session.localId, 'label')]}
        maxLength={120}
      />

      {session.exercises.map((exercise) => (
        <div key={exercise.localId} className="flex items-start gap-md">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-md lg:grid-cols-12">
            <SelectField
              label="Ejercicio"
              value={exercise.exerciseId}
              options={exerciseOptions}
              onChange={(exerciseId) => onExerciseChange(exercise.localId, { exerciseId })}
              icon="fitness_center"
              placeholder="Elige un ejercicio"
              error={errors[fieldKey(exercise.localId, 'exerciseId')]}
              className="col-span-2 lg:col-span-4"
            />
            {numberFields.map(({ field, label, inputMode }) => (
              <TextField
                key={field}
                label={label}
                inputMode={inputMode}
                value={exercise[field]}
                onChange={(event) => onExerciseChange(exercise.localId, { [field]: event.target.value })}
                error={errors[fieldKey(exercise.localId, field)]}
                className="lg:col-span-2"
              />
            ))}
          </div>
          {session.exercises.length > 1 && (
            <IconButton
              icon="delete"
              label="Quitar ejercicio"
              onClick={() => onRemoveExercise(exercise.localId)}
              className="mt-2xl"
            />
          )}
        </div>
      ))}

      <Button
        label="Agregar ejercicio"
        icon="add"
        variant="ghost"
        size="sm"
        onClick={onAddExercise}
        className="self-start"
      />
    </Card>
  )
}
