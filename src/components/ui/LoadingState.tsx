/**
 * Loading state primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Props accepted by {@link LoadingState}.
 */
export interface LoadingStateProps {
  /** Text that says what is loading. */
  label: string
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders a centered progress indicator while the content of a view loads.
 *
 * @example
 * ```tsx
 * <LoadingState label="Loading clients…" />
 * ```
 */
export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex min-h-[224px] w-full flex-col items-center justify-center gap-md rounded-lg bg-surface-card p-xl shadow-card',
        className,
      )}
    >
      <Icon name="progress_activity" size={24} className="animate-spin" />
      <Text tone="muted">{label}</Text>
    </div>
  )
}
