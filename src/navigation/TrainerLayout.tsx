/**
 * Frame of the pages of a signed-in trainer.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppShell, type SidebarSection } from '@/components/layout'
import { useAuth } from '@/context/useAuth'
import { ROUTES } from './routes'

/** Navigation entries of the trainer; each `id` is the path it opens. */
const sections: SidebarSection[] = [
  {
    title: 'General',
    items: [
      { id: ROUTES.clients, label: 'Clientes', icon: 'group' },
      { id: ROUTES.exercises, label: 'Ejercicios', icon: 'exercise' },
      { id: ROUTES.routines, label: 'Rutinas', icon: 'event_note' },
    ],
  },
]

/**
 * Renders the app shell around the nested routes, with the session of the trainer and the
 * navigation entry that matches the current path.
 */
export function TrainerLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const email = user?.email ?? ''
  const activeId = sections[0].items.find((item) => pathname.startsWith(item.id))?.id ?? ROUTES.clients

  return (
    <AppShell
      roleLabel="Entrenador"
      sections={sections}
      activeId={activeId}
      onNavigate={navigate}
      user={{ name: user?.fullName ?? email.split('@')[0], email }}
      onSignOut={() => void logout()}
    >
      <Outlet />
    </AppShell>
  )
}
