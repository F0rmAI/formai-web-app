/**
 * List item primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ButtonHTMLAttributes } from 'react'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Props accepted by {@link ListItem}.
 */
export interface ListItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Main text. */
  title: string
  /** Secondary text shown below the title. */
  subtitle?: string
  /** Icon shown in the leading tile. */
  icon?: IconName
  /** Text of a primary badge shown at the end. */
  badge?: string
  /**
   * Shows a chevron to signal navigation.
   *
   * @defaultValue `true`
   */
  showChevron?: boolean
}

/**
 * Renders a list row that the user can activate.
 *
 * @example
 * ```tsx
 * <ListItem icon="fitness_center" title="Day A" subtitle="4 exercises" badge="Today" onClick={open} />
 * ```
 */
export function ListItem({
  title,
  subtitle,
  icon,
  badge,
  showChevron = true,
  type = 'button',
  className,
  ...props
}: ListItemProps) {
  return (
    <button
      type={type}
      className={cn(
        'flex w-full cursor-pointer items-center gap-xl rounded-lg bg-surface-card p-xl text-left shadow-card transition-colors',
        'hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-container">
          <Icon name={icon} size={20} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-2xs">
        <Text as="span" variant="body-l-strong" className="truncate">
          {title}
        </Text>
        {subtitle && (
          <Text as="span" variant="body-m" tone="secondary" className="truncate">
            {subtitle}
          </Text>
        )}
      </span>
      {badge && <Badge label={badge} />}
      {showChevron && <Icon name="chevron_right" size={20} className="text-content-subtle" />}
    </button>
  )
}
