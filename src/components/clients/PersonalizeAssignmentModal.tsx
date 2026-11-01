/**
 * Modal that personalizes the current assignment of a client.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useId, useState, type FormEvent } from 'react'
import { Button, Callout, Modal, Text, TextField } from '@/components/ui'
import type { PersonalizeAssignmentInput } from '@/types/client'
import type { PrescriptionAdjustment, RoutineSession } from '@/types/routine'

/** Values typed for one exercise of a session; empty keeps the routine's. */
interface AdjustmentDraft {
  load: string
  rest: string
}

/** Identifies an exercise within a session. */
function toKey(sessionOrder: number, exerciseId: string): string {
  return `${sessionOrder}/${exerciseId}`
}

/** Starts the form from the adjustments already saved. */
function toDrafts(adjustments: PrescriptionAdjustment[]): Record<string, AdjustmentDraft> {
  return Object.fromEntries(
    adjustments.map((adjustment) => [
      toKey(adjustment.sessionOrder, adjustment.exerciseId),
      {
        load: adjustment.targetLoadKg === null ? '' : String(adjustment.targetLoadKg),
        rest: adjustment.restSeconds === null ? '' : String(adjustment.restSeconds),
      },
    ]),
  )
}

/** Reads a typed value: `null` when empty, `NaN` when it is not a number of zero or more. */
function toValue(text: string, integer = false): number | null {
  const trimmed = text.trim().replace(',', '.')
  if (!trimmed) return null
  const value = Number(trimmed)
  return Number.isFinite(value) && value >= 0 && (!integer || Number.isSafeInteger(value)) ? value : Number.NaN
}

/**
 * Props accepted by {@link PersonalizeAssignmentModal}.
 */
export interface PersonalizeAssignmentModalProps {
  /** Sessions of the routine's current version, with the routine's prescriptions. */
  sessions: RoutineSession[]
  /** Note saved for the client, or `null`. */
  note: string | null
  /** Adjustments saved for the client. */
  adjustments: PrescriptionAdjustment[]
  /** Whether the personalization is being saved. */
  isSubmitting: boolean
  /** Message of the failed save. */
  error: string | null
  /** Called with the note and the adjustments when the user saves. */
  onSubmit: (input: PersonalizeAssignmentInput) => void
  /** Called when the user cancels or dismisses the modal. */
  onClose: () => void
}

/**
 * Shows the routine's exercises with the routine's target load and rest, and lets the trainer set
 * this client's own values and a note, without changing the routine for other clients.
 *
 * @remarks
 * Mount it only while it is open, so the form starts from the saved values every time.
 */
export function PersonalizeAssignmentModal({
  sessions,
  note: savedNote,
  adjustments,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: PersonalizeAssignmentModalProps) {
  const formId = useId()
  const [note, setNote] = useState(savedNote ?? '')
  const [drafts, setDrafts] = useState<Record<string, AdjustmentDraft>>(() => toDrafts(adjustments))

  const entries = sessions.flatMap((session) =>
    session.exercises.map((exercise) => ({ session, exercise, key: toKey(session.order, exercise.exerciseId) })),
  )
  const isValid = entries.length > 0 && note.length <= 500 && entries.every(({ key }) => {
    const draft = drafts[key]
    return !draft || (!Number.isNaN(toValue(draft.load)) && !Number.isNaN(toValue(draft.rest, true)))
  })

  const change = (key: string, field: keyof AdjustmentDraft, value: string) =>
    setDrafts((current) => ({ ...current, [key]: { ...(current[key] ?? { load: '', rest: '' }), [field]: value } }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!isValid || isSubmitting) return
    const changed = entries.flatMap(({ session, exercise, key }) => {
      const draft = drafts[key]
      const targetLoadKg = draft ? toValue(draft.load) : null
      const rest = draft ? toValue(draft.rest, true) : null
      if (targetLoadKg === null && rest === null) return []
      return [{
        sessionOrder: session.order,
        exerciseId: exercise.exerciseId,
        targetLoadKg,
        restSeconds: rest,
      }]
    })
    onSubmit({ note: note.trim(), adjustments: changed })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Personalizar para este cliente"
      description="Ajusta la carga objetivo y el descanso solo para este cliente. La rutina no cambia para los demás; deja vacío para usar el valor de la rutina."
      icon="tune"
      actions={
        <>
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} />
          <Button
            label="Guardar personalización"
            icon="save"
            size="md"
            type="submit"
            form={formId}
            loading={isSubmitting}
            disabled={!isValid}
          />
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-xl">
        {error && <Callout title={error} tone="warning" />}
        <TextField
          multiline
          label="Nota para el cliente (opcional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          leadingIcon="sticky_note_2"
          helper="La verá en su app junto a la rutina."
          maxLength={500}
        />
        {sessions.map((session) => (
          <div key={session.order} className="flex flex-col gap-md">
            <Text variant="label-m">{session.label}</Text>
            {session.exercises.map((exercise) => {
              const key = toKey(session.order, exercise.exerciseId)
              const draft = drafts[key] ?? { load: '', rest: '' }
              return (
                <div key={key} className="flex flex-col gap-sm">
                  <Text variant="body-m">
                    {exercise.exerciseName} · {exercise.sets} × {exercise.reps}
                  </Text>
                  <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
                    <TextField
                      label="Carga objetivo (kg)"
                      value={draft.load}
                      onChange={(event) => change(key, 'load', event.target.value)}
                      inputMode="decimal"
                      placeholder={String(exercise.targetLoadKg)}
                      helper={`Rutina: ${exercise.targetLoadKg} kg`}
                      error={Number.isNaN(toValue(draft.load)) ? 'Debe ser un número de 0 o más' : undefined}
                    />
                    <TextField
                      label="Descanso (s)"
                      value={draft.rest}
                      onChange={(event) => change(key, 'rest', event.target.value)}
                      inputMode="numeric"
                      placeholder={String(exercise.restSeconds)}
                      helper={`Rutina: ${exercise.restSeconds} s`}
                      error={Number.isNaN(toValue(draft.rest, true)) ? 'Debe ser un entero de 0 o más' : undefined}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </form>
    </Modal>
  )
}
