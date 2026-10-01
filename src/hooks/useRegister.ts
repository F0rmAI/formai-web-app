import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { emailFormatError, isApiError, passwordLengthError } from '@/utils/auth-errors'

interface RegisterFields {
  fullName: string
  email: string
  password: string
}

interface RegisterErrors {
  fullName?: string
  email?: string
  password?: string
  form?: string
}

export function useRegister() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fields, setFields] = useState<RegisterFields>({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [loading, setLoading] = useState(false)

  function update<K extends keyof RegisterFields>(key: K, value: RegisterFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
  }

  async function submit() {
    const next: RegisterErrors = {
      fullName: fields.fullName.trim() ? undefined : 'Ingresa tu nombre completo',
      email: emailFormatError(fields.email),
      password: passwordLengthError(fields.password),
    }
    if (next.fullName || next.email || next.password) {
      setErrors(next)
      return
    }

    setLoading(true)
    setErrors({})
    try {
      await register({
        fullName: fields.fullName.trim(),
        email: fields.email.trim(),
        password: fields.password,
      })
      navigate('/clients', { replace: true, state: { toast: 'Cuenta creada' } })
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setErrors({ email: 'Este correo ya está registrado' })
      } else if (isApiError(error) && error.status === 422) {
        setErrors({ password: 'Al menos 8 caracteres' })
      } else if (isApiError(error)) {
        setErrors({ form: error.message })
      } else {
        setErrors({ form: 'No se pudo crear la cuenta. Inténtalo de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return { fields, errors, loading, update, submit }
}
