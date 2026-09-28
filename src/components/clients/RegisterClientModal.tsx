import { useState, type FormEvent } from 'react'
import { Button, Modal, TextField } from '@/components/ui'
import { ClientsServiceError } from '@/services/clients.service'
import type { ActivationCode, RegisterClientInput } from '@/types/client'

export interface RegisterClientModalProps {
  open: boolean
  onClose: () => void
  onRegister: (input: RegisterClientInput) => Promise<ActivationCode>
  onRegistered: (code: ActivationCode) => void
}

export function RegisterClientModal({ open, onClose, onRegister, onRegistered }: RegisterClientModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setEmailError(undefined)
    setIsSubmitting(true)
    try {
      onRegistered(await onRegister({ fullName: fullName.trim(), email: email.trim() }))
    } catch (error) {
      if (error instanceof ClientsServiceError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setEmailError(error.message)
      } else {
        setEmailError('No pudimos registrar al cliente. Inténtalo nuevamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo cliente"
      description="Registra sus datos. Generaremos un código de activación para que active su cuenta en la app."
      icon="person_add"
    >
      <form onSubmit={handleSubmit} className="mt-xl flex flex-col gap-xl">
        <TextField
          label="Nombre completo"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          leadingIcon="person"
          autoFocus
          required
        />
        <TextField
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          leadingIcon="mail"
          error={emailError}
          required
        />
        <div className="flex flex-col-reverse justify-end gap-md sm:flex-row">
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} className="w-full sm:w-auto" />
          <Button
            label="Registrar y generar código"
            icon="key"
            size="md"
            type="submit"
            loading={isSubmitting}
            disabled={!fullName.trim() || !email.trim()}
            className="w-full sm:w-auto"
          />
        </div>
      </form>
    </Modal>
  )
}
