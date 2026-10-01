import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { isApiError, passwordLengthError } from '@/utils/auth-errors'

type ResetPhase = 'form' | 'expired'

interface ResetFields {
  password: string
  confirmPassword: string
}

interface ResetErrors {
  password?: string
  confirmPassword?: string
  form?: string
}

export function useResetPassword(token: string | null) {
  const navigate = useNavigate()
  const [fields, setFields] = useState<ResetFields>({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<ResetErrors>({})
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<ResetPhase>(token ? 'form' : 'expired')

  function update<K extends keyof ResetFields>(key: K, value: ResetFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
  }

  async function submit() {
    if (!token) {
      setPhase('expired')
      return
    }

    const passwordError = passwordLengthError(fields.password)
    const confirmError =
      fields.password === fields.confirmPassword ? undefined : 'Las contraseñas no coinciden'
    if (passwordError || confirmError) {
      setErrors({ password: passwordError, confirmPassword: confirmError })
      return
    }

    setLoading(true)
    setErrors({})
    try {
      await authService.resetPassword({ token, password: fields.password })
      navigate('/login', { replace: true, state: { toast: 'Contraseña actualizada' } })
    } catch (error) {
      if (isApiError(error) && error.status === 422) {
        const detail = error.message.toLowerCase()
        if (detail.includes('password') || detail.includes('8')) {
          setErrors({ password: 'Al menos 8 caracteres' })
        } else {
          setPhase('expired')
        }
      } else if (isApiError(error)) {
        setErrors({ form: error.message })
      } else {
        setErrors({ form: 'No se pudo guardar la contraseña. Inténtalo de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return { fields, errors, loading, phase, update, submit }
}
