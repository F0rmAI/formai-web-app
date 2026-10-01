/**
 * Card primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { HTMLAttributes } from 'react'
import type { Elevation } from '@/types/ui'
import { cn } from '@/utils/cn'

const elevationClass: Record<Elevation, string> = {
  none: '',
  card: 'shadow-card',
  soft: 'shadow-soft',
  raised: 'shadow-raised',
  floating: 'shadow-floating',
}

/**
 * Props accepted by {@link Card}.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Shadow level.
   *
   * @defaultValue `'card'`
   */
  elevation?: Elevation
}

/**
 * Renders the base surface: card background, large radius and standard padding.
 *
 * @example
 * ```tsx
 * <Card elevation="soft">{children}</Card>
 * ```
 */
export function Card({ elevation = 'card', className, ...props }: CardProps) {
  return <div className={cn('rounded-lg bg-surface-card p-xl', elevationClass[elevation], className)} {...props} />
}
