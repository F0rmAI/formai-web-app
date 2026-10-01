import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button, EmptyState, Text, TextField } from '@/components/ui'
import { useResetPassword } from '@/hooks/useResetPassword'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { fields, errors, loading, phase, update, submit } = useResetPassword(token)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void submit()
  }

  if (phase === 'expired') {
    return (
      <AuthLayout>
        <div className="flex w-full flex-col gap-xl">
          <EmptyState
            icon="link_off"
            title="Enlace vencido"
            description="Este enlace ya no es válido. Pide uno nuevo para continuar."
            action={{
              label: 'Pedir nuevo enlace',
              onClick: () => navigate('/forgot-password'),
            }}
          />
          <Button
            type="button"
            label="Volver al inicio de sesión"
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => navigate('/login')}
          />
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <form className="flex w-full flex-col gap-xl" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-xs">
          <Text as="h1" variant="display">
            Nueva contraseña
          </Text>
          <Text variant="body-l" tone="secondary">
            Elige una contraseña segura para tu cuenta.
          </Text>
        </div>

        <TextField
          label="Nueva contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          leadingIcon="lock"
          trailingIcon={showPassword ? 'visibility_off' : 'visibility'}
          trailingIconLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onTrailingIconClick={() => setShowPassword((v) => !v)}
          value={fields.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          helper={errors.password ? undefined : 'Al menos 8 caracteres'}
        />

        <TextField
          label="Confirmar contraseña"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          leadingIcon="lock"
          trailingIcon={showConfirm ? 'visibility_off' : 'visibility'}
          trailingIconLabel={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onTrailingIconClick={() => setShowConfirm((v) => !v)}
          value={fields.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
        />

        {errors.form && (
          <Text variant="body-m" tone="error">
            {errors.form}
          </Text>
        )}

        <Button type="submit" label="Guardar contraseña" fullWidth loading={loading} />
      </form>
    </AuthLayout>
  )
}
