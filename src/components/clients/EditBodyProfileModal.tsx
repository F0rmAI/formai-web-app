import { useState, type FormEvent } from 'react'
import { Button, Modal, SelectField, TextField } from '@/components/ui'
import type { BodyProfile, UpdateBodyProfileInput } from '@/types/client'

const goalOptions = [
  { value: 'Hipertrofia', label: 'Hipertrofia' },
  { value: 'Fuerza', label: 'Fuerza' },
  { value: 'Acondicionamiento', label: 'Acondicionamiento' },
  { value: 'Pérdida de peso', label: 'Pérdida de peso' },
]

export interface EditBodyProfileModalProps {
  open: boolean
  profile: BodyProfile
  onClose: () => void
  onSave: (input: UpdateBodyProfileInput) => Promise<void>
}

export function EditBodyProfileModal({ open, profile, onClose, onSave }: EditBodyProfileModalProps) {
  const [goal, setGoal] = useState(profile.goal || 'Hipertrofia')
  const [weight, setWeight] = useState(String(profile.weight || ''))
  const [height, setHeight] = useState(String(profile.height || ''))
  const [restrictions, setRestrictions] = useState(profile.restrictions)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const numericWeight = Number(weight.replace(',', '.'))
  const numericHeight = Number(height.replace(',', '.'))
  const weightError = weight && numericWeight <= 0 ? 'El peso debe ser mayor que 0 kg.' : undefined
  const heightError = height && (numericHeight < 100 || numericHeight > 250)
    ? 'La estatura debe estar entre 100 y 250 cm.'
    : undefined

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (weightError || heightError || !weight || !height) return
    setIsSubmitting(true)
    try {
      await onSave({ goal, weight: numericWeight, height: numericHeight, restrictions: restrictions.trim() })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar ficha física"
      description="Estos datos se consideran de salud y solo los ven tú y tu cliente."
      icon="assignment_ind"
    >
      <form onSubmit={handleSubmit} className="mt-xl flex flex-col gap-xl">
        <SelectField label="Objetivo" value={goal} options={goalOptions} onChange={setGoal} icon="flag" />
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
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
        <div className="flex flex-col-reverse justify-end gap-md sm:flex-row">
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} className="w-full sm:w-auto" />
          <Button
            label="Guardar ficha"
            icon="save"
            size="md"
            type="submit"
            loading={isSubmitting}
            disabled={!weight || !height || Boolean(weightError) || Boolean(heightError)}
            className="w-full sm:w-auto"
          />
        </div>
      </form>
    </Modal>
  )
}
