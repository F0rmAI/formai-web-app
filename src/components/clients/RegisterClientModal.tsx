/**
 * Modal that registers a client.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useId, useState, type FormEvent } from 'react'
import { Button, Modal, TextField } from '@/components/ui'
import type { RegisterClientInput } from '@/types/client'

/**
 * Props accepted by {@link RegisterClientModal}.
 */
export interface RegisterClientModalProps {
  /** Whether the registration is being sent. */
  isSubmitting: boolean
  /** Message of the failed registration, shown under the name field. */
  error: string | null
  /** Called with the name when the user submits the form. */
  onSubmit: (input: RegisterClientInput) => void
  /** Called when the user cancels or dismisses the modal. */
  onClose: () => void
}

/**
 * Shows the form that registers a client and reports the data the user submits.
 *
 * @remarks
 * Mount it only while it is open, so the form starts empty every time.
 */
export function RegisterClientModal({ isSubmitting, error, onSubmit, onClose }: RegisterClientModalProps) {
  const formId = useId()
  const [fullName, setFullName] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ fullName: fullName.trim() })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Nuevo cliente"
      description="Registra su nombre y comparte el código de activación. El cliente elegirá su correo al activar su cuenta en la app."
      icon="person_add"
      actions={
        <>
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} />
          <Button
            label="Registrar y generar código"
            size="md"
            type="submit"
            form={formId}
            loading={isSubmitting}
            disabled={!fullName.trim()}
          />
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-xl">
        <TextField
          label="Nombre completo"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          leadingIcon="person"
          autoComplete="off"
          autoFocus
          maxLength={120}
          error={error ?? undefined}
          required
        />
      </form>
    </Modal>
  )
}
