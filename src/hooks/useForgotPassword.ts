/**
 * Hook of the password recovery form.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/navigation/routes'
import { authService } from '@/services/auth.service'
import { emailFormatError } from '@/utils/validation'
import type { ToastLocationState } from './useToast'

/**
 * Navigation state that tells the recovery form it was opened from an expired link.
 */
export interface ForgotPasswordLocationState {
  /** Whether the trainer is asking for a link again. */
  renewal?: boolean
}

/**
 * Holds the recovery form and asks the backend to email a link to set a new password.
 *
 * @remarks
 * On success it navigates to the confirmation page; when the form was opened from an expired
 * link, that page also says that a new link was sent.
 *
 * @returns The `email` typed and its `error`, the `isSubmitting` state, `updateEmail` to change
 * the field and `submit` to send the form.
 *
 * @example
 * ```tsx
 * const { email, error, isSubmitting, updateEmail, submit } = useForgotPassword();
 * ```
 */
export function useForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const isRenewal = Boolean((location.state as ForgotPasswordLocationState | null)?.renewal)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateEmail(value: string) {
    setEmail(value)
    setError(undefined)
  }

  async function submit() {
    const invalid = emailFormatError(email)
    if (invalid) {
      setError(invalid)
      return
    }

    setIsSubmitting(true)
    setError(undefined)
    try {
      await authService.requestPasswordReset(email.trim())
      const state: ToastLocationState = isRenewal ? { toast: 'Te enviamos un nuevo enlace' } : {}
      navigate(ROUTES.forgotPasswordSent, { state })
    } catch {
      setError('No pudimos enviar el enlace. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { email, error, isSubmitting, updateEmail, submit }
}
