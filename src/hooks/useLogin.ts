import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { emailFormatError, isApiError } from '@/utils/auth-errors'

interface LoginFields {
  email: string
  password: string
}

interface LoginErrors {
  email?: string
  password?: string
  form?: string
}

export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [fields, setFields] = useState<LoginFields>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)

  function update<K extends keyof LoginFields>(key: K, value: LoginFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
  }

  async function submit() {
    const emailError = emailFormatError(fields.email)
    const passwordError = fields.password ? undefined : 'Ingresa tu contraseña'
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError })
      return
    }

    setLoading(true)
    setErrors({})
    try {
      await login({ email: fields.email.trim(), password: fields.password })
      navigate('/clients', { replace: true })
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        setErrors({ password: 'Credenciales inválidas' })
      } else if (isApiError(error) && error.status === 403) {
        navigate('/access-app', { replace: true })
      } else if (isApiError(error) && error.status === 429) {
        setErrors({ form: error.message })
      } else if (isApiError(error)) {
        setErrors({ form: error.message })
      } else {
        setErrors({ form: 'No se pudo iniciar sesión. Inténtalo de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return { fields, errors, loading, update, submit }
}
