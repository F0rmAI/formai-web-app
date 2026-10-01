/**
 * Icon primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { HTMLAttributes } from 'react'
import type { IconName, IconSize } from '@/types/ui'
import { cn } from '@/utils/cn'

/**
 * Props accepted by {@link Icon}.
 */
export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Ligature name of the icon, such as `bolt`. */
  name: IconName
  /**
   * Size in pixels.
   *
   * @defaultValue `20`
   */
  size?: IconSize
  /** Accessible label; when omitted the icon is decorative. */
  label?: string
}

/**
 * Renders a Material Symbols Rounded icon, using the primary color by default.
 *
 * @example
 * ```tsx
 * <Icon name="bolt" size={24} />
 * ```
 */
export function Icon({ name, size = 20, label, className, style, ...props }: IconProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('material-symbols-rounded shrink-0 select-none text-primary', className)}
      style={{
        fontSize: size,
        width: size,
        height: size,
        lineHeight: `${size}px`,
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  )
}
