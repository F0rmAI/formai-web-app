/**
 * Modal that renames a client.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useId, useState, type FormEvent } from 'react'
import { Button, Modal, TextField } from '@/components/ui'

/** Props accepted by {@link EditClientNameModal}. */
export interface EditClientNameModalProps {
  /** Current full name. */
  fullName: string
  /** Whether the rename is being sent. */
  isSubmitting: boolean
  /** Message of the failed rename. */
  error: string | null
  /** Called with the new name. */
  onSubmit: (fullName: string) => void
  /** Called when the user cancels or dismisses the modal. */
  onClose: () => void
}

/** Shows a single-field form for changing the client's name. */
export function EditClientNameModal({ fullName, isSubmitting, error, onSubmit, onClose }: EditClientNameModalProps) {
  const formId = useId()
  const [name, setName] = useState(fullName)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim())
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar nombre"
      icon="edit"
      actions={
        <>
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} />
          <Button label="Guardar nombre" type="submit" form={formId} size="md" loading={isSubmitting} disabled={!name.trim()} />
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <TextField
          label="Nombre completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          autoFocus
          required
          error={error ?? undefined}
        />
      </form>
    </Modal>
  )
}
