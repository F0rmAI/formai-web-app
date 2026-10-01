/**
 * Page header layout component.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ReactNode } from 'react'
import { Text } from '@/components/ui'
import { cn } from '@/utils/cn'

/**
 * Props accepted by {@link PageHeader}.
 */
export interface PageHeaderProps {
  /** Title of the page. */
  title: string
  /** Supporting text shown below the title. */
  subtitle?: string
  /** Navigation path, such as `Home / Clients`. */
  breadcrumb?: string
  /** Elements shown at the end, usually buttons. */
  actions?: ReactNode
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders the heading of a page with optional breadcrumb, subtitle and actions.
 *
 * @remarks
 * Mobile-first: actions go below the titles on small screens and to the right from the `sm`
 * breakpoint.
 *
 * @example
 * ```tsx
 * <PageHeader title="Clients" subtitle="People you train." actions={<Button label="New client" />} />
 * ```
 */
export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex w-full flex-col items-stretch gap-xl sm:flex-row sm:items-end sm:justify-between sm:gap-2xl', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        {breadcrumb && (
          <Text variant="label-m" tone="muted">
            {breadcrumb}
          </Text>
        )}
        <Text as="h1" variant="display">
          {title}
        </Text>
        {subtitle && (
          <Text variant="body-l" tone="secondary">
            {subtitle}
          </Text>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-start gap-md [&>*]:flex-1 sm:shrink-0 sm:[&>*]:flex-none">
          {actions}
        </div>
      )}
    </header>
  )
}
