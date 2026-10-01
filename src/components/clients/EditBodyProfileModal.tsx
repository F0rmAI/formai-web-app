/**
 * Modal that edits the body profile of a client.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useId, useState, type FormEvent } from 'react'
import { Button, Callout, Modal, SelectField, type SelectOption, TextField } from '@/components/ui'
import type { BodyProfile, UpdateBodyProfileInput } from '@/types/client'

/** Training goals a client can have. */
const GOALS = ['Hipertrofia', 'Fuerza', 'Acondicionamiento', 'Pérdida de peso']

/** Reads a decimal typed with a comma or a dot. */
function toNumber(value: string): number {
  return Number(value.replace(',', '.'))
}

/**
 * Props accepted by {@link EditBodyProfileModal}.
 */
export interface EditBodyProfileModalProps {
  /** Current profile, used as the initial values of the form. */
  profile: BodyProfile
  /** Whether the profile is being saved. */
  isSubmitting: boolean
  /** Message of the failed save. */
  error: string | null
  /** Called with the new values when the user submits a valid form. */
  onSubmit: (input: UpdateBodyProfileInput) => void
  /** Called when the user cancels or dismisses the modal. */
  onClose: () => void
}

/**
 * Shows the form of the body profile, validates its ranges and reports the values the user submits.
 *
 * @remarks
 * Mount it only while it is open, so the form starts from the current profile every time.
 */
export function EditBodyProfileModal({ profile, isSubmitting, error, onSubmit, onClose }: EditBodyProfileModalProps) {
  const formId = useId()
  const [goal, setGoal] = useState(profile.goal || GOALS[0])
  const [weight, setWeight] = useState(profile.weight ? String(profile.weight).replace('.', ',') : '')
  const [height, setHeight] = useState(profile.height ? String(profile.height) : '')
  const [restrictions, setRestrictions] = useState(profile.restrictions)

  // A goal saved before the list changed is kept as an option so it is not lost on save.
  const goalOptions: SelectOption<string>[] = [...new Set([goal, ...GOALS])].map((value) => ({ value, label: value }))
  const weightError = weight && !(toNumber(weight) > 0) ? 'El peso debe ser mayor que 0 kg.' : undefined
  const heightError =
    height && !(toNumber(height) >= 100 && toNumber(height) <= 250)
      ? 'La estatura debe estar entre 100 y 250 cm.'
      : undefined
  const isValid = Boolean(weight && height) && !weightError && !heightError

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!isValid) return
    onSubmit({ goal, weight: toNumber(weight), height: toNumber(height), restrictions: restrictions.trim() })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar ficha física"
      description="Estos datos se consideran de salud y solo los ven tú y tu cliente."
      icon="monitor_weight"
      actions={
        <>
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} />
          <Button
            label="Guardar ficha"
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
        <SelectField label="Objetivo" value={goal} options={goalOptions} onChange={setGoal} icon="flag" />
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
          <TextField
            label="Peso corporal (kg)"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            inputMode="decimal"
            leadingIcon="monitor_weight"
            error={weightError}
          />
          <TextField
            label="Estatura (cm)"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            inputMode="numeric"
            leadingIcon="height"
            error={heightError}
          />
        </div>
        <TextField
          label="Lesiones o restricciones"
          value={restrictions}
          onChange={(event) => setRestrictions(event.target.value)}
          leadingIcon="healing"
        />
      </form>
    </Modal>
  )
}
