/**
 * New password page, opened from the emailed link.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/layout'
import { Button, EmptyState, Text, TextField } from '@/components/ui'
import type { ForgotPasswordLocationState } from '@/hooks/useForgotPassword'
import { useResetPassword } from '@/hooks/useResetPassword'
import { ROUTES } from '@/navigation/routes'

/**
 * Shows the form that sets a new password, or the notice that the link is no longer valid, using
 * {@link useResetPassword} for the form state and the action.
 *
 * @remarks
 * Reads the token from the `token` query parameter of the emailed link.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { fields, errors, isSubmitting, isLinkExpired, update, submit } = useResetPassword(params.get('token'))
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  if (isLinkExpired) {
    const state: ForgotPasswordLocationState = { renewal: true }
    return (
      <AuthLayout>
        <EmptyState
          icon="link_off"
          title="Este enlace ya no es válido"
          description="El enlace venció o ya se usó. Solicita uno nuevo para crear tu contraseña."
          action={{
            label: 'Solicitar un nuevo enlace',
            icon: 'refresh',
            onClick: () => navigate(ROUTES.forgotPassword, { state }),
          }}
        />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <form className="flex w-full flex-col gap-xl" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-xs">
          <Text as="h1" variant="display">
            Crea una nueva contraseña
          </Text>
          <Text tone="secondary">Usa al menos 8 caracteres, con letras y números.</Text>
        </div>

        <TextField
          label="Nueva contraseña"
          type={isPasswordVisible ? 'text' : 'password'}
          autoComplete="new-password"
          leadingIcon="lock"
          trailingIcon={isPasswordVisible ? 'visibility_off' : 'visibility'}
          trailingIconLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onTrailingIconClick={() => setIsPasswordVisible((visible) => !visible)}
          value={fields.password}
          onChange={(event) => update('password', event.target.value)}
          error={errors.password}
        />
        <TextField
          label="Confirmar contraseña"
          type={isConfirmVisible ? 'text' : 'password'}
          autoComplete="new-password"
          leadingIcon="lock"
          trailingIcon={isConfirmVisible ? 'visibility_off' : 'visibility'}
          trailingIconLabel={isConfirmVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onTrailingIconClick={() => setIsConfirmVisible((visible) => !visible)}
          value={fields.confirmPassword}
          onChange={(event) => update('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
        />

        <Button type="submit" label="Guardar contraseña" fullWidth loading={isSubmitting} />
      </form>
    </AuthLayout>
  )
}
