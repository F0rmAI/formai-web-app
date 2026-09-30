import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { emailFormatError, isApiError } from '@/utils/auth-errors'

export function useForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  function updateEmail(value: string) {
    setEmail(value)
    setError(undefined)
  }

  async function submit() {
    const emailError = emailFormatError(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setLoading(true)
    setError(undefined)
    try {
      await authService.requestPasswordReset({ email: email.trim() })
      navigate('/forgot-password/sent', { state: { email: email.trim() } })
    } catch (err) {
      setError(isApiError(err) ? err.message : 'No se pudo enviar el enlace. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function resend(targetEmail: string) {
    setLoading(true)
    try {
      await authService.requestPasswordReset({ email: targetEmail })
      navigate('/forgot-password/sent', {
        replace: true,
        state: { email: targetEmail, toast: 'Nuevo enlace enviado' },
      })
    } catch (err) {
      setError(isApiError(err) ? err.message : 'No se pudo reenviar el enlace.')
    } finally {
      setLoading(false)
    }
  }

  return { email, error, loading, updateEmail, submit, resend }
}
