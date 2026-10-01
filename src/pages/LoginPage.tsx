/**
 * Sign-in page.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout, ToastViewport } from '@/components/layout'
import { Button, Text, TextField } from '@/components/ui'
import { useLogin } from '@/hooks/useLogin'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/navigation/routes'

/**
 * Shows the sign-in form of the trainer, using {@link useLogin} for the form state and the action.
 *
 * @remarks
 * Only reachable without a session; the route guard redirects a signed-in trainer to the clients page.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { fields, errors, isSubmitting, update, submit } = useLogin()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <AuthLayout>
      <form className="flex w-full flex-col gap-xl" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-xs">
          <Text as="h1" variant="display">
            Bienvenida de nuevo
          </Text>
          <Text tone="secondary">Ingresa a tu panel de entrenador.</Text>
        </div>

        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          leadingIcon="mail"
          value={fields.email}
          onChange={(event) => update('email', event.target.value)}
          error={errors.email}
        />
        <TextField
          label="Contraseña"
          type={isPasswordVisible ? 'text' : 'password'}
          autoComplete="current-password"
          leadingIcon="lock"
          trailingIcon={isPasswordVisible ? 'visibility_off' : 'visibility'}
          trailingIconLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onTrailingIconClick={() => setIsPasswordVisible((visible) => !visible)}
          value={fields.password}
          onChange={(event) => update('password', event.target.value)}
          error={errors.password}
        />

        <Button
          label="¿Olvidaste tu contraseña?"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => navigate(ROUTES.forgotPassword)}
        />
        <Button type="submit" label="Iniciar sesión" fullWidth loading={isSubmitting} />

        <div className="flex flex-col gap-xs">
          <Button
            label="Crear una cuenta de entrenador"
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => navigate(ROUTES.register)}
          />
          <Button
            label="¿Eres cliente? Entra desde la app"
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => navigate(ROUTES.clientGate)}
          />
        </div>
      </form>

      <ToastViewport message={toast?.message} tone={toast?.tone} />
    </AuthLayout>
  )
}
