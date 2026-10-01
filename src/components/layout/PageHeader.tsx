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
 * Mobile-first: actions go below the titles on small screens and to the right from the `md`
 * breakpoint.
 *
 * @example
 * ```tsx
 * <PageHeader title="Clients" subtitle="People you train." actions={<Button label="New client" />} />
 * ```
 */
export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex w-full flex-col gap-xl md:flex-row md:items-end md:justify-between md:gap-2xl', className)}>
      <div className="flex min-w-0 flex-col gap-xs md:flex-1">
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
      {actions && <div className="flex shrink-0 flex-wrap items-start gap-md">{actions}</div>}
    </header>
  )
}
