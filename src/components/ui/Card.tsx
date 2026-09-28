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

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation
}

/** Superficie base (surface/card, radio lg, padding xl). */
export function Card({ elevation = 'card', className, ...props }: CardProps) {
  return <div className={cn('rounded-lg bg-surface-card p-xl', elevationClass[elevation], className)} {...props} />
}
