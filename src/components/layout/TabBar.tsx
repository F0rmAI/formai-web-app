/**
 * Tab bar layout component.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Props accepted by {@link TabBar}.
 */
export interface TabBarProps {
  /** Accessible name of the group of tabs. */
  label: string
  /** Tabs of the bar, as `TabItem` elements. */
  children: ReactNode
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders the row of tabs that switches between the sections of a page.
 *
 * @remarks
 * Mobile-first: the row scrolls sideways when the tabs do not fit.
 *
 * @example
 * ```tsx
 * <TabBar label="Client sections">
 *   <TabItem label="Profile" active />
 *   <TabItem label="Workouts" />
 * </TabBar>
 * ```
 */
export function TabBar({ label, children, className }: TabBarProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('flex w-full gap-2xl overflow-x-auto border-b border-line-subtle', className)}
    >
      {children}
    </div>
  )
}
