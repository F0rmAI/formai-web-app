import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { EmptyState } from '@/components/ui'

export function ClientWebGatePage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <EmptyState
        icon="smartphone"
        title="Tu cuenta es de cliente"
        description="La web de FormAI es para entrenadores. Ingresa desde la app móvil para ver tu rutina y registrar tus entrenamientos."
        action={{
          label: 'Volver al inicio de sesión',
          icon: 'arrow_back',
          onClick: () => navigate('/login'),
        }}
      />
    </AuthLayout>
  )
}
