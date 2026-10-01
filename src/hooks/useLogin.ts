/**
 * Hook of the sign-in form.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { ROUTES } from '@/navigation/routes'
import { ApiError } from '@/services/api-client'
import { emailFormatError } from '@/utils/validation'

/** Values of the sign-in form. */
interface LoginFields {
  email: string
  password: string
}

/** Messages of the sign-in form, per field. */
type LoginErrors = Partial<Record<keyof LoginFields, string>>

/**
 * Holds the sign-in form and signs the trainer in.
 *
 * @remarks
 * On success it navigates to the clients page. An account that belongs to the mobile app is sent
 * to the page that explains it.
 *
 * @returns The `fields` and their `errors`, the `isSubmitting` state, `update` to change a field
 * and `submit` to send the form.
 *
 * @example
 * ```tsx
 * const { fields, errors, isSubmitting, update, submit } = useLogin();
 * ```
 */
export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [fields, setFields] = useState<LoginFields>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update(field: keyof LoginFields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }))
    setErrors({})
  }

  async function submit() {
    const emailError = emailFormatError(fields.email)
    const passwordError = fields.password ? undefined : 'Ingresa tu contraseña'
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError })
      return
    }

    setIsSubmitting(true)
    setErrors({})
    try {
      await login({ email: fields.email.trim(), password: fields.password })
      navigate(ROUTES.clients, { replace: true })
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0
      if (status === 403) {
        navigate(ROUTES.clientGate, { replace: true })
      } else if (status === 429) {
        setErrors({ password: 'Tu cuenta está bloqueada por varios intentos fallidos. Inténtalo en 15 minutos.' })
      } else if (status === 400 || status === 401) {
        setErrors({ password: 'Correo o contraseña incorrectos. Inténtalo de nuevo.' })
      } else {
        setErrors({ password: 'No pudimos iniciar sesión. Inténtalo de nuevo.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { fields, errors, isSubmitting, update, submit }
}
