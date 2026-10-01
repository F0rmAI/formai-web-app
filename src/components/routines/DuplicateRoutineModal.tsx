/**
 * Modal that duplicates a routine.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { useId, useState, type FormEvent } from 'react'
import { Button, Modal, TextField } from '@/components/ui'

/**
 * Props accepted by {@link DuplicateRoutineModal}.
 */
export interface DuplicateRoutineModalProps {
  /** Name of the routine being copied, used to suggest the name of the copy. */
  routineName: string
  /** Whether the copy is being created. */
  isSubmitting: boolean
  /** Message of the failed copy, shown under the name field. */
  error: string | null
  /** Called with the name of the copy when the user submits the form. */
  onSubmit: (name: string) => void
  /** Called when the user cancels or dismisses the modal. */
  onClose: () => void
}

/**
 * Asks for the name of the copy of a routine and reports the name the user submits.
 *
 * @remarks
 * Mount it only while it is open, so the suggested name is fresh every time.
 */
export function DuplicateRoutineModal({ routineName, isSubmitting, error, onSubmit, onClose }: DuplicateRoutineModalProps) {
  const formId = useId()
  const [name, setName] = useState(`Copia de ${routineName}`)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim()) onSubmit(name.trim())
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Duplicar rutina"
      description="Ponle un nombre distinto para no confundirla con la rutina original."
      icon="content_copy"
      actions={
        <>
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} />
          <Button
            label="Duplicar"
            icon="content_copy"
            size="md"
            type="submit"
            form={formId}
            loading={isSubmitting}
            disabled={!name.trim()}
          />
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <TextField
          label="Nombre de la copia"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error ?? undefined}
          maxLength={120}
          autoFocus
        />
      </form>
    </Modal>
  )
}
