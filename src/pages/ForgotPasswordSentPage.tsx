/**
 * Confirmation page of the password recovery.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useNavigate } from 'react-router-dom'
import { AuthLayout, ToastViewport } from '@/components/layout'
import { Button, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/navigation/routes'

/**
 * Tells the trainer to look for the emailed link, using {@link useToast} to confirm that a new
 * link was sent when the previous one had expired.
 *
 * @remarks
 * The message is the same whether the email is registered or not, so the page never reveals which
 * emails have an account.
 */
export function ForgotPasswordSentPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  return (
    <AuthLayout>
      <EmptyState
        icon="mark_email_read"
        title="Revisa tu correo"
        description="Si el correo está registrado, recibirás un enlace para crear una nueva contraseña. Vence en 30 minutos y solo puede usarse una vez."
      />
      <Button
        label="Volver al inicio de sesión"
        icon="arrow_back"
        variant="ghost"
        size="md"
        fullWidth
        onClick={() => navigate(ROUTES.login)}
      />
      <ToastViewport message={toast?.message} tone={toast?.tone} />
    </AuthLayout>
  )
}
