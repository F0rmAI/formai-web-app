/**
 * Table layout components: container, row, cells, row link and row action.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { Icon, Text } from '@/components/ui'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'

/**
 * Column widths available for a table cell.
 *
 * @remarks
 * - `fill`: takes the remaining width; use it for the main column.
 * - `sm`: 72 px, for the actions column.
 * - `md`: 130 px, for a status badge or a short value.
 * - `lg`: 170 px, for a name or a date.
 */
export type TableColumnWidth = 'fill' | 'sm' | 'md' | 'lg'

/** Classes applied to each column width; they only apply once the row lays out as columns. */
const widthClass: Record<TableColumnWidth, string> = {
  fill: 'md:flex-1',
  sm: 'md:w-[72px] md:shrink-0',
  md: 'md:w-[130px] md:shrink-0',
  lg: 'md:w-[170px] md:shrink-0',
}

/**
 * Props accepted by {@link Table}.
 */
export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the table, such as `Clientes`. */
  label: string
}

/**
 * Renders the card that contains the rows of a table.
 *
 * @example
 * ```tsx
 * <Table label="Clients">
 *   <TableRow header>
 *     <TableHeaderCell label="Client" width="fill" />
 *   </TableRow>
 * </Table>
 * ```
 */
export function Table({ label, className, ...props }: TableProps) {
  return (
    <div
      role="table"
      aria-label={label}
      className={cn('w-full overflow-hidden rounded-lg bg-surface-card shadow-card', className)}
      {...props}
    />
  )
}

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
 * heading rows are hidden on small screens, where each cell shows its own label.
 *
 * @example
 * ```tsx
 * <TableRow>
 *   <TableCell width="fill" label="Client">{name}</TableCell>
 * </TableRow>
 * ```
 */
export function TableRow({ header = false, className, ...props }: TableRowProps) {
  return (
    <div
      role="row"
      className={cn(
        'w-full gap-md border-b border-line-subtle px-xl last:border-b-0 md:flex-row md:items-center md:gap-xl',
        header
          ? 'hidden bg-surface-container-low py-lg md:flex'
          : 'flex flex-col items-stretch bg-surface-card py-3 md:min-h-[63px]',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Props accepted by {@link TableCell}.
 */
export interface TableCellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the column.
   *
   * @defaultValue `'fill'`
   */
  width?: TableColumnWidth
  /** Column title shown above the value on small screens, where the heading row is hidden. */
  label?: string
  /**
   * Lays out the content in a row aligned to the end; use it for the actions column.
   *
   * @defaultValue `false`
   */
  actions?: boolean
}

/**
 * Renders a data cell.
 *
 * @example
 * ```tsx
 * <TableCell width="md" label="Status">
 *   <Badge label="Active" />
 * </TableCell>
 * ```
 */
export function TableCell({ width = 'fill', label, actions = false, className, children, ...props }: TableCellProps) {
  return (
    <div
      role="cell"
      className={cn(
        'flex min-w-0 gap-2xs',
        actions ? 'flex-row items-center gap-md md:justify-end' : 'flex-col items-start',
        widthClass[width],
        className,
      )}
      {...props}
    >
      {label && (
        <Text as="span" variant="overline" tone="muted" className="md:hidden">
          {label}
        </Text>
      )}
      {children}
    </div>
  )
}

/**
 * Props accepted by {@link TableHeaderCell}.
 */
export interface TableHeaderCellProps extends HTMLAttributes<HTMLDivElement> {
  /** Column title. */
  label: string
  /**
   * Width of the column; it must match the width of its data cells.
   *
   * @defaultValue `'fill'`
   */
  width?: TableColumnWidth
  /**
   * Aligns the title to the end; use it for the actions column.
   *
   * @defaultValue `false`
   */
  alignEnd?: boolean
}

/**
 * Renders a heading cell.
 *
 * @example
 * ```tsx
 * <TableHeaderCell label="Status" width="md" />
 * ```
 */
export function TableHeaderCell({ label, width = 'fill', alignEnd = false, className, ...props }: TableHeaderCellProps) {
  return (
    <div
      role="columnheader"
      className={cn('flex min-w-0', widthClass[width], alignEnd && 'justify-end', className)}
      {...props}
    >
      <Text as="span" variant="overline" tone="muted" className="whitespace-nowrap">
        {label}
      </Text>
    </div>
  )
}

/**
 * Props accepted by {@link TableAction}.
 */
export interface TableActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon of the action. */
  icon: IconName
  /** Accessible label, required because there is no visible text. */
  label: string
}

/**
 * Renders an icon-only action of a table row, without a container.
 *
 * @example
 * ```tsx
 * <TableAction icon="chevron_right" label="Open client" onClick={open} />
 * ```
 */
export function TableAction({ icon, label, type = 'button', className, ...props }: TableActionProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors',
        'enabled:hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:outline-primary',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={20} className="text-content-secondary" />
    </button>
  )
}

/**
 * Renders the main content of a row as a control that opens the item of the row.
 *
 * @example
 * ```tsx
 * <TableCell>
 *   <TableRowLink onClick={open}>
 *     <Text variant="body-l-strong">{name}</Text>
 *   </TableRowLink>
 * </TableCell>
 * ```
 */
export function TableRowLink({ type = 'button', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        'flex w-full min-w-0 cursor-pointer flex-col items-start gap-2xs rounded-sm text-left',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className,
      )}
      {...props}
    />
  )
}
