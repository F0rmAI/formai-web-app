/**
 * Sign-up page.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout'
import { Button, Text, TextField } from '@/components/ui'
import { useRegister } from '@/hooks/useRegister'
import { ROUTES } from '@/navigation/routes'

/**
 * Shows the form that creates a trainer account, using {@link useRegister} for the form state and
 * the action.
 *
 * @remarks
 * Only reachable without a session; the route guard redirects a signed-in trainer to the clients page.
 */
export function RegisterPage() {
  const navigate = useNavigate()
  const { fields, errors, isSubmitting, update, submit } = useRegister()
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
            Crea tu cuenta
          </Text>
          <Text tone="secondary">Empieza a gestionar a tus clientes en minutos.</Text>
        </div>

        <TextField
          label="Nombre completo"
          autoComplete="name"
          leadingIcon="person"
          value={fields.fullName}
          onChange={(event) => update('fullName', event.target.value)}
          error={errors.fullName}
        />
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
          autoComplete="new-password"
          leadingIcon="lock"
          trailingIcon={isPasswordVisible ? 'visibility_off' : 'visibility'}
          trailingIconLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onTrailingIconClick={() => setIsPasswordVisible((visible) => !visible)}
          value={fields.password}
          onChange={(event) => update('password', event.target.value)}
          error={errors.password}
          helper="Mínimo 8 caracteres, con letras y números."
        />

        <Button type="submit" label="Crear cuenta" fullWidth loading={isSubmitting} />
        <Button label="Ya tengo una cuenta" variant="ghost" size="md" fullWidth onClick={() => navigate(ROUTES.login)} />
      </form>
    </AuthLayout>
  )
}
