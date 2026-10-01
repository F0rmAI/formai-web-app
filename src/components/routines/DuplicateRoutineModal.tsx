import { useEffect, useState, type FormEvent } from 'react'
import { Button, Modal, TextField } from '@/components/ui'
import { routinesService } from '@/services/routines.service'
import type { Routine } from '@/types/routine'

export interface DuplicateRoutineModalProps {
  routine: Routine | null
  onClose: () => void
  onDuplicated: (routine: Routine) => void
}

export function DuplicateRoutineModal({ routine, onClose, onDuplicated }: DuplicateRoutineModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (routine) setName(`Copia de ${routine.name}`)
  }, [routine])

  const handleClose = () => {
    if (isSubmitting) return
    setError(undefined)
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!routine) return
    if (!name.trim()) {
      setError('Escribe un nombre para la copia.')
      return
    }
    setIsSubmitting(true)
    setError(undefined)
    try {
      const duplicated = await routinesService.duplicate(routine.id, { name: name.trim() })
      onDuplicated(duplicated)
    } catch {
      setError('No pudimos duplicar esta rutina. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={Boolean(routine)}
      title="Duplicar rutina"
      description="Se creará un borrador editable sin clientes asignados."
      icon="content_copy"
      onClose={handleClose}
    >
      <form className="mt-xl flex flex-col gap-xl" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <TextField
          label="Nombre de la copia"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error}
        />
        <div className="flex gap-md">
          <Button label="Cancelar" variant="secondary" className="flex-1" onClick={handleClose} disabled={isSubmitting} />
          <Button label="Duplicar" className="flex-1" type="submit" loading={isSubmitting} />
        </div>
      </form>
    </Modal>
  )
}
