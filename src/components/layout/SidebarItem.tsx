import type { ButtonHTMLAttributes } from 'react'
import { Icon, Text } from '@/components/ui'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'

export interface SidebarItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName
  label: string
  active?: boolean
}

/** Ítem de navegación del sidebar web. */
export function SidebarItem({ icon, label, active = false, type = 'button', className, ...props }: SidebarItemProps) {
  return (
    <button
      type={type}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-lg text-left transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        active ? 'bg-primary-container' : 'bg-transparent hover:bg-surface-container-low',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={20} className={active ? 'text-primary' : 'text-content-secondary'} />
      <Text as="span" variant="label-l" tone={active ? 'primary' : 'secondary'} className="flex-1">
        {label}
      </Text>
    </button>
  )
}
