import type { HTMLAttributes } from 'react'
import { Text } from '@/components/ui'
import { cn } from '@/utils/cn'

export interface TableRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Fila de encabezado (fondo surface/container-low). */
  header?: boolean
}

/** Fila de tabla web. Las columnas se definen con TableCell / TableHeaderCell. */
export function TableRow({ header = false, className, ...props }: TableRowProps) {
  return (
    <div
      role="row"
      className={cn(
        'flex w-full items-center gap-xl border-b border-line-subtle px-xl',
        header ? 'bg-surface-container-low py-lg' : 'bg-surface-card py-3',
        className,
      )}
      {...props}
    />
  )
}

/** Celda de datos. Usa `className` para el ancho (p. ej. `w-[300px]` o `flex-1`). */
export function TableCell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="cell" className={cn('flex min-w-0 flex-col items-start gap-2xs', className)} {...props} />
}

export interface TableHeaderCellProps extends HTMLAttributes<HTMLDivElement> {
  label: string
}

/** Celda de encabezado (overline muted). */
export function TableHeaderCell({ label, className, ...props }: TableHeaderCellProps) {
  return (
    <div role="columnheader" className={cn('flex min-w-0', className)} {...props}>
      <Text as="span" variant="overline" tone="muted" className="whitespace-nowrap">
        {label}
      </Text>
    </div>
  )
}
