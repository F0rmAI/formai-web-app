/**
 * Table layout components: row, data cell and heading cell.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { HTMLAttributes } from 'react'
import { Text } from '@/components/ui'
import { cn } from '@/utils/cn'

/**
 * Props accepted by {@link TableRow}.
 */
export interface TableRowProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Renders the row as a table heading.
   *
   * @defaultValue `false`
   */
  header?: boolean
}

/**
 * Renders one row of a table.
 *
 * @remarks
 * Mobile-first: cells stack on small screens and line up in columns from the `md` breakpoint;
 * heading rows are hidden on small screens.
 *
 * @example
 * ```tsx
 * <TableRow>
 *   <TableCell className="md:w-[300px]">{name}</TableCell>
 * </TableRow>
 * ```
 */
export function TableRow({ header = false, className, ...props }: TableRowProps) {
  return (
    <div
      role="row"
      className={cn(
        'w-full gap-md border-b border-line-subtle px-xl md:flex-row md:items-center md:gap-xl',
        header ? 'hidden bg-surface-container-low py-lg md:flex' : 'flex flex-col items-start bg-surface-card py-3',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Renders a data cell; set its width with `className`.
 */
export function TableCell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="cell" className={cn('flex min-w-0 flex-col items-start gap-2xs', className)} {...props} />
}

/**
 * Props accepted by {@link TableHeaderCell}.
 */
export interface TableHeaderCellProps extends HTMLAttributes<HTMLDivElement> {
  /** Column title. */
  label: string
}

/**
 * Renders a heading cell.
 */
export function TableHeaderCell({ label, className, ...props }: TableHeaderCellProps) {
  return (
    <div role="columnheader" className={cn('flex min-w-0', className)} {...props}>
      <Text as="span" variant="overline" tone="muted" className="whitespace-nowrap">
        {label}
      </Text>
    </div>
  )
}
