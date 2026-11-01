/**
 * Modal that adds an exercise to the catalog.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useId, useState, type FormEvent } from 'react'
import { Button, Modal, SelectField, TextField } from '@/components/ui'
import type { CreateExerciseInput } from '@/types/exercise'

/**
 * Props accepted by {@link CreateExerciseModal}.
 */
export interface CreateExerciseModalProps {
  /** Standard muscle groups served by the backend, in display order. */
  muscleGroups: string[]
  /** Whether the exercise is being saved. */
  isSubmitting: boolean
  /** Message of the failed save, shown under the name field. */
  error: string | null
  /** Called with the data of the exercise when the user submits the form. */
  onSubmit: (input: CreateExerciseInput) => void
  /** Called when the user cancels or dismisses the modal. */
  onClose: () => void
}

/**
 * Shows the form that adds an exercise to the catalog and reports the data the user submits.
 *
 * @remarks
 * Mount it only while it is open, so the form starts empty every time.
 */
export function CreateExerciseModal({ muscleGroups, isSubmitting, error, onSubmit, onClose }: CreateExerciseModalProps) {
  const formId = useId()
  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [equipment, setEquipment] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ name: name.trim(), muscleGroup, equipment: equipment.trim() || undefined })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Nuevo ejercicio"
      description="Solo para ejercicios que no estén en el catálogo global. Quedará disponible para tus rutinas."
      icon="exercise"
      actions={
        <>
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} />
          <Button
            label="Guardar ejercicio"
            icon="save"
            size="md"
            type="submit"
            form={formId}
            loading={isSubmitting}
            disabled={!name.trim() || !muscleGroup}
          />
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-xl">
        <TextField
          label="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          leadingIcon="edit"
          error={error ?? undefined}
          maxLength={120}
          autoFocus
          required
        />
        <SelectField
          label="Grupo muscular"
          value={muscleGroup}
          options={muscleGroups.map((group) => ({ value: group, label: group }))}
          onChange={setMuscleGroup}
          icon="accessibility_new"
          placeholder="Elige un grupo muscular"
          required
        />
        <TextField
          label="Equipo o máquina (opcional)"
          value={equipment}
          onChange={(event) => setEquipment(event.target.value)}
          leadingIcon="fitness_center"
          maxLength={120}
        />
      </form>
    </Modal>
  )
}
