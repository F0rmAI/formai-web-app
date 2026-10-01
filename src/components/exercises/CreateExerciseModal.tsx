import { useState, type FormEvent } from 'react'
import { Button, Modal, TextField } from '@/components/ui'
import { ExercisesServiceError } from '@/services/exercises.service'
import type { CreateExerciseInput, Exercise } from '@/types/exercise'

export interface CreateExerciseModalProps {
  open: boolean
  onClose: () => void
  onCreate: (input: CreateExerciseInput) => Promise<Exercise>
  onCreated: (exercise: Exercise) => void
}

export function CreateExerciseModal({ open, onClose, onCreate, onCreated }: CreateExerciseModalProps) {
  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [equipment, setEquipment] = useState('')
  const [nameError, setNameError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = () => {
    setName('')
    setMuscleGroup('')
    setEquipment('')
    setNameError(undefined)
  }

  const handleClose = () => {
    if (isSubmitting) return
    reset()
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setNameError(undefined)
    setIsSubmitting(true)
    try {
      const created = await onCreate({
        name: name.trim(),
        muscleGroup: muscleGroup.trim(),
        equipment: equipment.trim() || undefined,
      })
      reset()
      onCreated(created)
    } catch (error) {
      if (error instanceof ExercisesServiceError && error.code === 'NAME_ALREADY_EXISTS') {
        setNameError(error.message)
      } else {
        setNameError('No pudimos guardar el ejercicio. Inténtalo nuevamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo ejercicio"
      description="Añádelo a tu catálogo para usarlo al armar rutinas."
      icon="exercise"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="mt-xl flex flex-col gap-xl">
        <TextField
          label="Nombre"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            if (nameError) setNameError(undefined)
          }}
          leadingIcon="fitness_center"
          error={nameError}
          autoFocus
          required
          maxLength={120}
        />
        <TextField
          label="Grupo muscular"
          value={muscleGroup}
          onChange={(event) => setMuscleGroup(event.target.value)}
          leadingIcon="accessibility_new"
          required
          maxLength={60}
        />
        <TextField
          label="Equipo o máquina (opcional)"
          value={equipment}
          onChange={(event) => setEquipment(event.target.value)}
          leadingIcon="manufacturing"
          maxLength={120}
        />
        <div className="flex flex-col-reverse justify-end gap-md sm:flex-row">
          <Button
            label="Cancelar"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          />
          <Button
            label="Guardar ejercicio"
            icon="check"
            size="md"
            type="submit"
            loading={isSubmitting}
            disabled={!name.trim() || !muscleGroup.trim()}
            className="w-full sm:w-auto"
          />
        </div>
      </form>
    </Modal>
  )
}
