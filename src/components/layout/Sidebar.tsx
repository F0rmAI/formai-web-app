/**
 * Sidebar layout component.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

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
 * Mobile-first: a full-width block with wrapping entries on small screens, and a 264 px side column
 * from the `md` breakpoint.
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
  return (
    <aside
      className={cn(
        'flex w-full flex-col gap-md border-b border-line-subtle bg-surface-card px-xl pt-xl pb-xl',
        'md:w-[264px] md:shrink-0 md:self-stretch md:border-r md:border-b-0 md:pt-2xl md:pb-5',
        className,
      )}
    >
      <div className="flex items-center gap-lg px-xs md:pb-xl">
        <BrandLogo />
        <Text variant="title" className="whitespace-nowrap">
          FormAI
        </Text>
        <Badge label={roleLabel} />
      </div>

      <nav className="flex flex-col gap-md">
        {sections.map((section, index) => (
          <div key={section.title ?? index} className="flex flex-row flex-wrap items-center gap-md md:flex-col md:items-stretch">
            {section.title && (
              <Text variant="overline" tone="muted" className="w-full">
                {section.title}
              </Text>
            )}
            {section.items.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={item.id === activeId}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="hidden md:block md:flex-1" />

      <div className="flex items-center gap-lg px-xs md:pt-3">
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
  )
}
