import type { ReactNode } from 'react'
import { Sidebar, type SidebarSection } from './Sidebar'

const trainerSections: SidebarSection[] = [
  {
    title: 'GENERAL',
    items: [
      { id: 'clients', label: 'Clientes', icon: 'group' },
      { id: 'exercises', label: 'Ejercicios', icon: 'exercise' },
      { id: 'routines', label: 'Rutinas', icon: 'calendar_month' },
    ],
  },
]

export interface AppShellProps {
  children: ReactNode
  onNavigateToClients: () => void
  user?: { name: string; email: string; avatarUrl?: string }
  onSignOut?: () => void
}

export function AppShell({ children, onNavigateToClients, user, onSignOut }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface-background">
      <Sidebar
        roleLabel="Entrenador"
        sections={trainerSections}
        activeId="clients"
        onNavigate={(id) => {
          if (id === 'clients') onNavigateToClients()
        }}
        user={user ?? { name: 'Entrenador', email: '' }}
        onSignOut={onSignOut}
        className="fixed inset-x-0 top-0 z-40 lg:inset-y-0 lg:right-auto"
      />
      <main className="min-h-screen min-w-0 flex-1 px-xl pt-[88px] pb-page-bottom sm:px-2xl lg:ml-[264px] lg:px-10 lg:pt-9">
        {children}
      </main>
    </div>
  )
}
