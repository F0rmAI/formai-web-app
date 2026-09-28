import { Avatar, Badge, BrandLogo, IconButton, Text } from '@/components/ui'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { SidebarItem } from './SidebarItem'

export interface SidebarNavItem {
  id: string
  label: string
  icon: IconName
}

export interface SidebarSection {
  title?: string
  items: SidebarNavItem[]
}

export interface SidebarProps {
  /** Rol mostrado junto a la marca (p. ej. "Entrenador", "Administrador"). */
  roleLabel: string
  sections: SidebarSection[]
  activeId: string
  onNavigate: (id: string) => void
  user: { name: string; email: string; avatarUrl?: string }
  onSignOut?: () => void
  className?: string
}

/** Sidebar web (264 px): marca + rol, secciones de navegación y usuario. */
export function Sidebar({ roleLabel, sections, activeId, onNavigate, user, onSignOut, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex w-[264px] shrink-0 flex-col self-stretch gap-md border-r border-line-subtle bg-surface-card px-xl pt-2xl pb-5',
        className,
      )}
    >
      <div className="flex items-center gap-lg px-xs pb-xl">
        <BrandLogo />
        <Text variant="title" className="whitespace-nowrap">
          FormAI
        </Text>
        <Badge label={roleLabel} />
      </div>

      <nav className="flex flex-col gap-md">
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
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-lg px-xs pt-3">
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
