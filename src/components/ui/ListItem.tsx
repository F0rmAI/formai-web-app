import type { ButtonHTMLAttributes } from 'react'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { Text } from './Text'

export interface ListItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  title: string
  subtitle?: string
  icon?: IconName
  /** Texto de un Badge primary a la derecha. */
  badge?: string
  showChevron?: boolean
}

/** Fila de lista navegable. */
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
