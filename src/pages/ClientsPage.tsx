import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader, Sidebar, type SidebarSection } from '@/components/layout'
import { Button, Card, EmptyState, Toast } from '@/components/ui'
import { useAuth } from '@/context/useAuth'
import { useEphemeralToast } from '@/hooks/useEphemeralToast'

const SECTIONS: SidebarSection[] = [
  {
    items: [
      { id: 'clients', label: 'Clientes', icon: 'group' },
      { id: 'exercises', label: 'Ejercicios', icon: 'fitness_center' },
      { id: 'routines', label: 'Rutinas', icon: 'calendar_month' },
    ],
  },
]

export function ClientsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { toast?: string } | null
  const toastMessage = useEphemeralToast(state?.toast)
  const [activeId] = useState('clients')

  useEffect(() => {
    if (state?.toast) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [state?.toast, navigate, location.pathname])

  const displayName = user?.fullName ?? user?.email?.split('@')[0] ?? 'Entrenador'

  return (
    <div className="flex min-h-dvh bg-surface-background">
      <Sidebar
        roleLabel="Entrenador"
        sections={SECTIONS}
        activeId={activeId}
        onNavigate={() => undefined}
        user={{ name: displayName, email: user?.email ?? '' }}
        onSignOut={() => {
          void logout().then(() => navigate('/login', { replace: true }))
        }}
      />

      <main className="flex min-w-0 flex-1 flex-col gap-2xl p-2xl">
        <PageHeader
          title="Clientes"
          subtitle="Gestiona a las personas que entrenas."
          actions={<Button label="Nuevo cliente" icon="person_add" size="md" disabled />}
        />

        <Card className="flex flex-1 items-center justify-center">
          <EmptyState
            icon="group"
            title="Aún no tienes clientes"
            description="Registra al primero para enviarle su código de activación."
          />
        </Card>
      </main>

      {toastMessage && (
        <div className="fixed right-2xl bottom-2xl z-50">
          <Toast message={toastMessage} tone="success" />
        </div>
      )}
    </div>
  )
}
