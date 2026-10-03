/**
 * Filter bar layout components.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Props accepted by {@link FilterBar}.
 */
export interface FilterBarProps {
  /** Fields of the bar, each one wrapped in a {@link FilterField}. */
  children: ReactNode
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders the row of search and filter fields shown above a list.
 *
 * @remarks
 * Mobile-first: fields stack on small screens and line up, aligned to the end, from `sm`.
 *
 * @example
 * ```tsx
 * <FilterBar>
 *   <FilterField grow>
 *     <TextField label="Search" />
 *   </FilterField>
 *   <FilterField>
 *     <SelectField label="Status" value={status} options={options} onChange={setStatus} />
 *   </FilterField>
 * </FilterBar>
 * ```
 */
export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div className={cn('flex w-full flex-col gap-xl sm:flex-row sm:items-end sm:justify-end', className)}>
      {children}
    </div>
  )
}

/**
 * Props accepted by {@link FilterField}.
 */
export interface FilterFieldProps {
  /** Field to place in the bar. */
  children: ReactNode
  /**
   * Makes the field take the remaining width; without it the field is 240 px wide.
   *
   * @defaultValue `false`
   */
  grow?: boolean
}

/**
 * Sizes one field of a {@link FilterBar}.
 *
 * @example
 * ```tsx
 * <FilterField grow>
 *   <TextField label="Search" />
 * </FilterField>
 * ```
 */
export function FilterField({ children, grow = false }: FilterFieldProps) {
  return <div className={cn('w-full', grow ? 'sm:min-w-0 sm:flex-1' : 'sm:w-[240px] sm:shrink-0')}>{children}</div>
}
