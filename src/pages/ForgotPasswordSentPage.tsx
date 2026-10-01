import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button, EmptyState, Toast } from '@/components/ui'
import { useEphemeralToast } from '@/hooks/useEphemeralToast'
import { useForgotPassword } from '@/hooks/useForgotPassword'

export function ForgotPasswordSentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { email?: string; toast?: string } | null
  const email = state?.email
  const toastMessage = useEphemeralToast(state?.toast)
  const { loading, resend } = useForgotPassword()

  useEffect(() => {
    if (state?.toast) {
      navigate(location.pathname, { replace: true, state: { email } })
    }
  }, [state?.toast, navigate, location.pathname, email])

  return (
    <AuthLayout>
      <div className="flex w-full flex-col gap-xl">
        <EmptyState
          icon="mark_email_read"
          title="Revisa tu correo"
          description={
            email
              ? `Si existe una cuenta con ${email}, enviamos un enlace para restablecer la contraseña.`
              : 'Si existe una cuenta con ese correo, enviamos un enlace para restablecer la contraseña.'
          }
        />

        <Button
          type="button"
          label="Volver al inicio de sesión"
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => navigate('/login')}
        />

        {email && (
          <Button
            type="button"
            label="Reenviar enlace"
            variant="secondary"
            size="md"
            fullWidth
            loading={loading}
            onClick={() => void resend(email)}
          />
        )}
      </div>

      {toastMessage && (
        <div className="fixed right-2xl bottom-2xl z-50">
          <Toast message={toastMessage} tone="success" />
        </div>
      )}
    </AuthLayout>
  )
}
