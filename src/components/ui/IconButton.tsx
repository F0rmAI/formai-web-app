/**
 * Icon button primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ButtonHTMLAttributes } from 'react'
import type { IconButtonVariant, IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'

/**
 * Props accepted by {@link IconButton}.
 */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon shown inside the button. */
  icon: IconName
  /** Accessible label, required because there is no visible text. */
  label: string
  /**
   * Visual style.
   *
   * @defaultValue `'tonal'`
   */
  variant?: IconButtonVariant
}

/**
 * Renders a circular 40 px button that shows only an icon.
 *
 * @example
 * ```tsx
 * <IconButton icon="tune" label="Filters" onClick={openFilters} />
 * ```
 */
export function IconButton({ icon, label, variant = 'tonal', type = 'button', className, ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[filter,opacity]',
        'enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        variant === 'tonal' ? 'bg-surface-container' : 'bg-surface-card shadow-raised',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={20} className={variant === 'tonal' ? 'text-primary' : 'text-content-primary'} />
    </button>
  )
}
