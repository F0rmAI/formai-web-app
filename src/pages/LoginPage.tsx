import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button, Text, TextField, Toast } from '@/components/ui'
import { useEphemeralToast } from '@/hooks/useEphemeralToast'
import { useLogin } from '@/hooks/useLogin'

export function LoginPage() {
  const { fields, errors, loading, update, submit } = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { toast?: string } | null
  const toastMessage = useEphemeralToast(state?.toast)

  useEffect(() => {
    if (state?.toast) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [state?.toast, navigate, location.pathname])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void submit()
  }

  return (
    <AuthLayout>
      <form className="flex w-full flex-col gap-xl" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-xs">
          <Text as="h1" variant="display">
            Bienvenida de nuevo
          </Text>
          <Text variant="body-l" tone="secondary">
            Ingresa a tu panel de entrenador.
          </Text>
        </div>

        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          leadingIcon="mail"
          value={fields.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          placeholder="tu@correo.com"
        />

        <TextField
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          leadingIcon="lock"
          trailingIcon={showPassword ? 'visibility_off' : 'visibility'}
          trailingIconLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onTrailingIconClick={() => setShowPassword((v) => !v)}
          value={fields.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          placeholder="••••••••••"
        />

        {errors.form && (
          <Text variant="body-m" tone="error">
            {errors.form}
          </Text>
        )}

        <Button
          type="button"
          label="¿Olvidaste tu contraseña?"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => navigate('/forgot-password')}
        />

        <Button type="submit" label="Iniciar sesión" fullWidth loading={loading} />

        <div className="flex flex-col gap-xs">
          <Button
            type="button"
            label="Crear una cuenta de entrenador"
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => navigate('/register')}
          />
          <Button
            type="button"
            label="¿Eres cliente? Entra desde la app"
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => navigate('/access-app')}
          />
        </div>
      </form>

      {toastMessage && (
        <div className="fixed right-2xl bottom-2xl z-50">
          <Toast message={toastMessage} tone="success" />
        </div>
      )}
    </AuthLayout>
  )
}
