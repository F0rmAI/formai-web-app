/**
 * Toast primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { HTMLAttributes } from 'react'
import type { IconName, ToastTone } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

const toneStyles: Record<ToastTone, { icon: IconName; color: string }> = {
  info: { icon: 'info', color: 'text-primary-container' },
  success: { icon: 'check_circle', color: 'text-tertiary-container' },
  error: { icon: 'error', color: 'text-error-container' },
}

/**
 * Props accepted by {@link Toast}.
 */
export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Text of the message. */
  message: string
  /**
   * Kind of message.
   *
   * @defaultValue `'info'`
   */
  tone?: ToastTone
}

/**
 * Renders a short message over an inverse surface.
 *
 * @example
 * ```tsx
 * <Toast message="Changes saved" tone="success" />
 * ```
 */
export function Toast({ message, tone = 'info', className, ...props }: ToastProps) {
  const styles = toneStyles[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex w-full max-w-[361px] items-center gap-lg rounded-md bg-surface-inverse px-xl py-3 shadow-floating',
        className,
      )}
      {...props}
    >
      <Icon name={styles.icon} size={20} className={styles.color} />
      <Text variant="body-l-strong" tone="on-inverse" className="flex-1">
        {message}
      </Text>
    </div>
  )
}
