/**
 * Hook of the sign-up form.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { ROUTES } from '@/navigation/routes'
import { ApiError } from '@/services/api-client'
import { firstName } from '@/utils/format'
import { emailFormatError, passwordError } from '@/utils/validation'
import type { ToastLocationState } from './useToast'

/** Values of the sign-up form. */
interface RegisterFields {
  fullName: string
  email: string
  password: string
}

/** Messages of the sign-up form, per field. */
type RegisterErrors = Partial<Record<keyof RegisterFields, string>>

/**
 * Holds the sign-up form and creates the trainer account.
 *
 * @remarks
 * On success the account is signed in and the clients page shows a welcome message.
 *
 * @returns The `fields` and their `errors`, the `isSubmitting` state, `update` to change a field
 * and `submit` to send the form.
 *
 * @example
 * ```tsx
 * const { fields, errors, isSubmitting, update, submit } = useRegister();
 * ```
 */
export function useRegister() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fields, setFields] = useState<RegisterFields>({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update(field: keyof RegisterFields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  async function submit() {
    const invalid: RegisterErrors = {
      fullName: fields.fullName.trim() ? undefined : 'Ingresa tu nombre completo',
      email: emailFormatError(fields.email),
      password: passwordError(fields.password),
    }
    if (invalid.fullName || invalid.email || invalid.password) {
      setErrors(invalid)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    try {
      const fullName = fields.fullName.trim()
      await register({ fullName, email: fields.email.trim(), password: fields.password })
      const state: ToastLocationState = { toast: `Cuenta creada. ¡Bienvenida a FormAI, ${firstName(fullName)}!` }
      navigate(ROUTES.clients, { replace: true, state })
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0
      if (status === 409) {
        setErrors({ email: 'Este correo no está disponible. Usa otro o inicia sesión.' })
      } else if (status === 422) {
        setErrors({ password: 'Debe tener mínimo 8 caracteres e incluir letras y números.' })
      } else {
        setErrors({ password: 'No pudimos crear la cuenta. Inténtalo de nuevo.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { fields, errors, isSubmitting, update, submit }
}
