/**
 * Hook of the new password form.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/navigation/routes'
import { ApiError } from '@/services/api-client'
import { authService } from '@/services/auth.service'
import { passwordError } from '@/utils/validation'
import type { ToastLocationState } from './useToast'

/** Values of the new password form. */
interface ResetFields {
  password: string
  confirmPassword: string
}

/** Messages of the new password form, per field. */
type ResetErrors = Partial<Record<keyof ResetFields, string>>

/**
 * Holds the new password form and saves the password with the token of the emailed link.
 *
 * @remarks
 * On success it navigates to the sign-in page, which confirms the change. A missing, expired or
 * used token sets `isLinkExpired`.
 *
 * @param token - Token carried by the emailed link, or `null` when the link has none.
 * @returns The `fields` and their `errors`, the `isSubmitting` state, `isLinkExpired`, `update` to
 * change a field and `submit` to send the form.
 *
 * @example
 * ```tsx
 * const { fields, errors, isLinkExpired, update, submit } = useResetPassword(token);
 * ```
 */
export function useResetPassword(token: string | null) {
  const navigate = useNavigate()
  const [fields, setFields] = useState<ResetFields>({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<ResetErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLinkExpired, setIsLinkExpired] = useState(!token)

  function update(field: keyof ResetFields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  async function submit() {
    if (!token) return

    const invalid: ResetErrors = {
      password: passwordError(fields.password),
      confirmPassword: fields.password === fields.confirmPassword ? undefined : 'Las contraseñas no coinciden',
    }
    if (invalid.password || invalid.confirmPassword) {
      setErrors(invalid)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    try {
      await authService.resetPassword({ token, password: fields.password })
      const state: ToastLocationState = { toast: 'Contraseña actualizada' }
      navigate(ROUTES.login, { replace: true, state })
    } catch (error) {
      // A locally valid password makes a 422 indicate an invalid, expired or used token.
      if (error instanceof ApiError && error.status === 422) {
        setIsLinkExpired(true)
      } else if (error instanceof ApiError && error.status === 400) {
        setErrors({ confirmPassword: 'Completa los campos obligatorios e inténtalo de nuevo.' })
      } else {
        setErrors({ confirmPassword: 'No pudimos guardar la contraseña. Inténtalo de nuevo.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { fields, errors, isSubmitting, isLinkExpired, update, submit }
}
