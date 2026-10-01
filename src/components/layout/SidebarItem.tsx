/**
 * Sidebar item layout component.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ButtonHTMLAttributes } from 'react'
import { Icon, Text } from '@/components/ui'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'

/**
 * Props accepted by {@link SidebarItem}.
 */
export interface SidebarItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon shown before the label. */
  icon: IconName
  /** Text of the entry. */
  label: string
  /**
   * Whether the entry is the current one.
   *
   * @defaultValue `false`
   */
  active?: boolean
}

/**
 * Renders one navigation entry of the sidebar.
 *
 * @example
 * ```tsx
 * <SidebarItem icon="group" label="Clients" active onClick={openClients} />
 * ```
 */
export function SidebarItem({ icon, label, active = false, type = 'button', className, ...props }: SidebarItemProps) {
  return (
    <button
      type={type}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-md px-3 py-lg text-left transition-colors md:w-full',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        active ? 'bg-primary-container' : 'bg-transparent hover:bg-surface-container-low',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={20} className={active ? 'text-primary' : 'text-content-secondary'} />
      <Text as="span" variant="label-l" tone={active ? 'primary' : 'secondary'} className="md:flex-1">
        {label}
      </Text>
    </button>
  )
}
