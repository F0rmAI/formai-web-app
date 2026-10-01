/**
 * App shell layout component.
 *
 * @author Melina
 * @packageDocumentation
 */

import type { ReactNode } from 'react'
import { Sidebar, type SidebarSection } from './Sidebar'

/**
 * Props accepted by {@link AppShell}.
 */
export interface AppShellProps {
  /** Page shown in the content area. */
  children: ReactNode
  /** Role shown next to the brand, such as `Entrenador`. */
  roleLabel: string
  /** Navigation sections of the sidebar, in order. */
  sections: SidebarSection[]
  /** Identifier of the current navigation entry. */
  activeId: string
  /** Called with the identifier of the entry the user selects. */
  onNavigate: (id: string) => void
  /** Signed-in user shown in the sidebar. */
  user: { name: string; email: string; avatarUrl?: string }
  /** Called when the user signs out. */
  onSignOut: () => void
}

/**
 * Renders the frame of the signed-in pages: the sidebar and the content area.
 *
 * @remarks
 * Mobile-first: the sidebar is a top bar with a drawer on small screens and a fixed 264 px column
 * from the `lg` breakpoint.
 *
 * @example
 * ```tsx
 * <AppShell roleLabel="Trainer" sections={sections} activeId="clients" onNavigate={go} user={user} onSignOut={signOut}>
 *   <ClientsPage />
 * </AppShell>
 * ```
 */
export function AppShell({ children, roleLabel, sections, activeId, onNavigate, user, onSignOut }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface-background">
      <Sidebar
        roleLabel={roleLabel}
        sections={sections}
        activeId={activeId}
        onNavigate={onNavigate}
        user={user}
        onSignOut={onSignOut}
        className="fixed inset-x-0 top-0 z-40 lg:inset-y-0 lg:right-auto"
      />
      <main className="min-h-screen min-w-0 flex-1 px-xl pt-[88px] pb-page-bottom sm:px-2xl lg:ml-[264px] lg:px-10 lg:pt-9">
        {children}
      </main>
    </div>
  )
}
