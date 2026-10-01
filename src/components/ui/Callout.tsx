/**
 * Callout primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { CalloutTone, IconName, TextTone } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

const toneStyles: Record<CalloutTone, { container: string; title: TextTone; description: string }> = {
  info: { container: 'bg-surface-container-high', title: 'default', description: 'text-content-secondary' },
  warning: {
    container: 'bg-secondary-container',
    title: 'accent',
    description: 'text-secondary-on-container-variant',
  },
}

/**
 * Props accepted by {@link Callout}.
 */
export interface CalloutProps {
  /** Main message. */
  title: string
  /** Supporting text shown below the title. */
  description?: string
  /**
   * Kind of notice.
   *
   * @defaultValue `'info'`
   */
  tone?: CalloutTone
  /**
   * Icon shown before the title.
   *
   * @defaultValue `'warning'`
   */
  icon?: IconName
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders a highlighted notice.
 *
 * @example
 * ```tsx
 * <Callout tone="warning" title="Keep your back straight" description="Lower the load if you cannot." />
 * ```
 */
export function Callout({ title, description, tone = 'info', icon = 'warning', className }: CalloutProps) {
  const styles = toneStyles[tone]

  return (
    <div className={cn('flex w-full flex-col gap-xs rounded-lg p-xl', styles.container, className)}>
      <div className="flex items-center gap-md">
        <Icon name={icon} size={20} className="text-secondary-text" />
        <Text variant="body-l-strong" tone={styles.title} className="flex-1">
          {title}
        </Text>
      </div>
      {description && (
        <Text variant="body-l" className={styles.description}>
          {description}
        </Text>
      )}
    </div>
  )
}
