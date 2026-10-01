/**
 * Section header primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { cn } from '@/utils/cn'
import { Badge } from './Badge'
import { Text } from './Text'

/**
 * Props accepted by {@link SectionHeader}.
 */
export interface SectionHeaderProps {
  /** Title of the section. */
  title: string
  /** Text of the counter badge, such as `14 workouts`. */
  count?: string
  /** Label of the action shown at the end. */
  actionLabel?: string
  /** Called when the action is activated. */
  onAction?: () => void
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders a section heading with an optional counter and action.
 *
 * @example
 * ```tsx
 * <SectionHeader title="Recent workouts" count="14 workouts" actionLabel="See all" onAction={openAll} />
 * ```
 */
export function SectionHeader({ title, count, actionLabel, onAction, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex w-full items-center gap-md', className)}>
      <Text as="h2" variant="title" className="whitespace-nowrap">
        {title}
      </Text>
      {count && <Badge label={count} />}
      <span className="flex-1" />
      {actionLabel && (
        <button type="button" onClick={onAction} className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-primary">
          <Text as="span" variant="label-m-bold" tone="primary-bright">
            {actionLabel}
          </Text>
        </button>
      )}
    </div>
  )
}
