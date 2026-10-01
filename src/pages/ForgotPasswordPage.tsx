/**
 * Password recovery page.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout'
import { Button, Text, TextField } from '@/components/ui'
import { useForgotPassword } from '@/hooks/useForgotPassword'
import { ROUTES } from '@/navigation/routes'

/**
 * Shows the form that asks for a link to set a new password, using {@link useForgotPassword} for
 * the form state and the action.
 *
 * @remarks
 * Only reachable without a session; the route guard redirects a signed-in trainer to the clients page.
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { email, error, isSubmitting, updateEmail, submit } = useForgotPassword()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <AuthLayout>
      <form className="flex w-full flex-col gap-xl" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-xs">
          <Text as="h1" variant="display">
            Recupera tu acceso
          </Text>
          <Text tone="secondary">Te enviaremos un enlace para crear una nueva contraseña.</Text>
        </div>

        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          leadingIcon="mail"
          value={email}
          onChange={(event) => updateEmail(event.target.value)}
          error={error}
        />

        <Button type="submit" label="Enviar enlace" fullWidth loading={isSubmitting} />
        <Button
          label="Volver al inicio de sesión"
          icon="arrow_back"
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => navigate(ROUTES.login)}
        />
      </form>
    </AuthLayout>
  )
}
