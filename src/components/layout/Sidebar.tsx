/**
 * Sidebar layout component.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useEffect, useId, useState } from 'react'
import { Avatar, Badge, BrandLogo, IconButton, Text } from '@/components/ui'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { SidebarItem } from './SidebarItem'

/**
 * Describes one navigation entry of the sidebar.
 */
export interface SidebarNavItem {
  /** Identifier reported when the entry is selected. */
  id: string
  /** Text of the entry. */
  label: string
  /** Icon shown before the label. */
  icon: IconName
}

/**
 * Describes a group of navigation entries.
 */
export interface SidebarSection {
  /** Heading shown above the entries. */
  title?: string
  /** Entries of the section. */
  items: SidebarNavItem[]
}

/**
 * Props accepted by {@link Sidebar}.
 */
export interface SidebarProps {
  /** Role shown next to the brand, such as `Trainer`. */
  roleLabel: string
  /** Navigation sections, in order. */
  sections: SidebarSection[]
  /** Identifier of the current entry. */
  activeId: string
  /** Called with the identifier of the entry the user selects. */
  onNavigate: (id: string) => void
  /** Signed-in user shown in the footer. */
  user: { name: string; email: string; avatarUrl?: string }
  /** Called when the user signs out; the action is hidden when omitted. */
  onSignOut?: () => void
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders the main navigation with the brand, the sections and the signed-in user.
 *
 * @remarks
 * Mobile-first: a top bar with a menu button that opens the navigation as a drawer on small
 * screens, and a 264 px side column from the `lg` breakpoint. The drawer closes with `Escape`,
 * with the backdrop and after selecting an entry.
 *
 * @example
 * ```tsx
 * <Sidebar
 *   roleLabel="Trainer"
 *   sections={sections}
 *   activeId="clients"
 *   onNavigate={navigate}
 *   user={user}
 * />
 * ```
 */
export function Sidebar({ roleLabel, sections, activeId, onNavigate, user, onSignOut, className }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileNavId = useId()

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          className="fixed inset-0 z-30 cursor-default bg-surface-inverse/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          'flex h-16 w-full shrink-0 flex-col border-b border-line-subtle bg-surface-card px-xl',
          'lg:h-auto lg:w-[264px] lg:self-stretch lg:gap-md lg:border-r lg:border-b-0 lg:pt-2xl lg:pb-5',
          className,
        )}
      >
        <div className="flex h-16 w-full items-center gap-lg px-xs lg:h-auto lg:pb-xl">
          <BrandLogo />
          <Text variant="title" className="whitespace-nowrap">
            FormAI
          </Text>
          <Badge label={roleLabel} />
          <IconButton
            icon={mobileOpen ? 'close' : 'menu'}
            label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls={mobileNavId}
            onClick={() => setMobileOpen((open) => !open)}
            className="ml-auto lg:hidden"
          />
        </div>

        <nav
          id={mobileNavId}
          className={cn(
            'fixed bottom-0 left-0 top-16 w-[min(320px,calc(100vw-48px))] flex-col gap-md overflow-y-auto border-r border-line-subtle bg-surface-card px-xl py-2xl shadow-floating',
            'lg:static lg:flex lg:w-auto lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none',
            mobileOpen ? 'flex' : 'hidden',
          )}
        >
          {sections.map((section, index) => (
            <div key={section.title ?? index} className="flex flex-col gap-md">
              {section.title && (
                <Text variant="overline" tone="muted">
                  {section.title}
                </Text>
              )}
              {section.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={item.id === activeId}
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileOpen(false)
                  }}
                />
              ))}
            </div>
          ))}

          <div className="mt-auto flex items-center gap-lg border-t border-line-subtle px-xs pt-xl lg:hidden">
            <Avatar name={user.name} src={user.avatarUrl} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Text variant="body-l-strong" className="truncate">
                {user.name}
              </Text>
              <Text variant="body-m" tone="muted" className="truncate">
                {user.email}
              </Text>
            </div>
            {onSignOut && <IconButton icon="logout" label="Cerrar sesión" onClick={onSignOut} />}
          </div>
        </nav>

        <div className="hidden flex-1 lg:block" />

        <div className="hidden items-center gap-lg px-xs pt-3 lg:flex">
          <Avatar name={user.name} src={user.avatarUrl} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Text variant="body-l-strong" className="truncate">
              {user.name}
            </Text>
            <Text variant="body-m" tone="muted" className="truncate">
              {user.email}
            </Text>
          </div>
          {onSignOut && <IconButton icon="logout" label="Cerrar sesión" onClick={onSignOut} />}
        </div>
      </aside>
    </>
  )
}
