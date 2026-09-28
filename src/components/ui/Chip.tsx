import type { ButtonHTMLAttributes } from 'react'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  selected?: boolean
  icon?: IconName
}

/** Chip seleccionable. */
export function Chip({ label, selected = false, icon, type = 'button', className, ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-9 shrink-0 cursor-pointer items-center gap-sm rounded-full px-xl transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50',
        selected ? 'bg-primary' : 'bg-surface-container hover:bg-surface-container-high',
        className,
      )}
      {...props}
    >
      {icon && (
        <Icon name={icon} size={16} className={selected ? 'text-content-on-primary' : 'text-content-secondary'} />
      )}
      <Text as="span" variant="body-l-strong" tone={selected ? 'on-primary' : 'secondary'} className="whitespace-nowrap">
        {label}
      </Text>
    </button>
  )
}
