import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Button } from './Button'
import { Icon } from './Icon'
import { Text } from './Text'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: IconName
  action?: { label: string; icon?: IconName; onClick: () => void }
  className?: string
}

/** Estado vacío centrado con acción opcional. */
export function EmptyState({ title, description, icon = 'inbox', action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex w-full flex-col items-center gap-lg px-xl py-2xl text-center', className)}>
      <span className="flex size-16 items-center justify-center rounded-lg bg-primary-container">
        <Icon name={icon} size={24} />
      </span>
      <Text variant="title">{title}</Text>
      {description && (
        <Text variant="body-l" tone="secondary">
          {description}
        </Text>
      )}
      {action && <Button label={action.label} icon={action.icon} size="md" onClick={action.onClick} />}
    </div>
  )
}
