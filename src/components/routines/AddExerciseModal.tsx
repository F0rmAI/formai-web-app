import { useEffect, useMemo, useState } from 'react'
import { Button, ListItem, Modal, Text, TextField } from '@/components/ui'
import { exercisesService } from '@/services/exercises.service'
import type { Exercise } from '@/types/exercise'

export interface AddExerciseModalProps {
  open: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
  excludedExerciseIds?: string[]
}

export function AddExerciseModal({ open, onClose, onSelect, excludedExerciseIds = [] }: AddExerciseModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    setError(undefined)
    exercisesService
      .list({ status: 'ACTIVE' })
      .then(setExercises)
      .catch(() => setError('No pudimos cargar tus ejercicios.'))
      .finally(() => setIsLoading(false))
  }, [open])

  const filteredExercises = useMemo(() => {
    const excluded = new Set(excludedExerciseIds)
    const available = exercises.filter((exercise) => !excluded.has(exercise.id))
    const normalized = query.trim().toLowerCase()
    if (!normalized) return available
    return available.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.muscleGroup.toLowerCase().includes(normalized),
    )
  }, [exercises, excludedExerciseIds, query])

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Agregar ejercicio"
      description="Elige un ejercicio de tu catálogo para prescribirlo en esta sesión."
      icon="exercise"
      onClose={handleClose}
      className="max-w-[560px]"
    >
      <div className="mt-xl flex flex-col gap-xl">
        <TextField
          label="Buscar"
          placeholder="Nombre o grupo muscular"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          leadingIcon="search"
        />

        {isLoading && <Text tone="muted">Cargando ejercicios…</Text>}
        {error && <Text tone="error">{error}</Text>}

        {!isLoading && !error && filteredExercises.length === 0 && (
          <Text tone="secondary">No hay ejercicios disponibles para agregar.</Text>
        )}

        <div className="flex max-h-[320px] flex-col gap-md overflow-y-auto">
          {filteredExercises.map((exercise) => (
            <ListItem
              key={exercise.id}
              title={exercise.name}
              subtitle={exercise.muscleGroup}
              icon="exercise"
              onClick={() => {
                onSelect(exercise)
                handleClose()
              }}
            />
          ))}
        </div>

        <Button label="Cancelar" variant="secondary" onClick={handleClose} />
      </div>
    </Modal>
  )
}
