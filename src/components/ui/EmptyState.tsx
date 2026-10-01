/**
 * Empty state primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Button } from './Button'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Props accepted by {@link EmptyState}.
 */
export interface EmptyStateProps {
  /** Main message. */
  title: string
  /** Supporting text shown below the title. */
  description?: string
  /**
   * Icon shown in the tile.
   *
   * @defaultValue `'inbox'`
   */
  icon?: IconName
  /** Button shown below the text. */
  action?: { label: string; icon?: IconName; onClick: () => void }
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders a centered empty state with an optional action.
 *
 * @example
 * ```tsx
 * <EmptyState icon="event_busy" title="No routine yet" description="It will show up here." />
 * ```
 */
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
