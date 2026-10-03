/**
 * Page shown to a client account that tries to use the web platform.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout'
import { EmptyState } from '@/components/ui'
import { ROUTES } from '@/navigation/routes'

/**
 * Explains that client accounts only work in the mobile app and links back to the sign-in page.
 *
 * @remarks
 * It needs no hook: it shows fixed content. The sign-in form sends here the accounts the backend
 * rejects for the web platform.
 */
export function ClientWebGatePage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <EmptyState
        icon="smartphone"
        title="Tu cuenta es de cliente"
        description="La web de FormAI es para entrenadores. Ingresa desde la app móvil para ver tu rutina y registrar tus entrenamientos."
        action={{ label: 'Volver al inicio de sesión', icon: 'arrow_back', onClick: () => navigate(ROUTES.login) }}
      />
    </AuthLayout>
  )
}
