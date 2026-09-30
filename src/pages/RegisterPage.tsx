import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button, Text, TextField } from '@/components/ui'
import { useRegister } from '@/hooks/useRegister'

export function RegisterPage() {
  const { fields, errors, loading, update, submit } = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void submit()
  }

  return (
    <AuthLayout>
      <form className="flex w-full flex-col gap-xl" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-xs">
          <Text as="h1" variant="display">
            Crea tu cuenta
          </Text>
          <Text variant="body-l" tone="secondary">
            Empieza a gestionar a tus clientes desde la web.
          </Text>
        </div>

        <TextField
          label="Nombre completo"
          type="text"
          autoComplete="name"
          leadingIcon="person"
          value={fields.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          error={errors.fullName}
          placeholder="Tu nombre"
        />

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
          autoComplete="new-password"
          leadingIcon="lock"
          trailingIcon={showPassword ? 'visibility_off' : 'visibility'}
          trailingIconLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onTrailingIconClick={() => setShowPassword((v) => !v)}
          value={fields.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          helper={errors.password ? undefined : 'Al menos 8 caracteres'}
          placeholder="••••••••••"
        />

        {errors.form && (
          <Text variant="body-m" tone="error">
            {errors.form}
          </Text>
        )}

        <Button type="submit" label="Crear cuenta" fullWidth loading={loading} />

        <Button
          type="button"
          label="Ya tengo una cuenta"
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => navigate('/login')}
        />
      </form>
    </AuthLayout>
  )
}
