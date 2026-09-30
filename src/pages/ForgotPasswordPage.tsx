import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button, Text, TextField } from '@/components/ui'
import { useForgotPassword } from '@/hooks/useForgotPassword'

export function ForgotPasswordPage() {
  const { email, error, loading, updateEmail, submit } = useForgotPassword()
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
            Recuperar contraseña
          </Text>
          <Text variant="body-l" tone="secondary">
            Te enviaremos un enlace a tu correo para crear una nueva.
          </Text>
        </div>

        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          leadingIcon="mail"
          value={email}
          onChange={(e) => updateEmail(e.target.value)}
          error={error}
          placeholder="tu@correo.com"
        />

        <Button type="submit" label="Enviar enlace" fullWidth loading={loading} />

        <Button
          type="button"
          label="Volver al inicio de sesión"
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => navigate('/login')}
        />
      </form>
    </AuthLayout>
  )
}
