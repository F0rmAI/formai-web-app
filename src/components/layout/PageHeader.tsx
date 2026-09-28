import type { ReactNode } from 'react'
import { Text } from '@/components/ui'
import { cn } from '@/utils/cn'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Ruta de navegación (p. ej. "Inicio / Clientes"). */
  breadcrumb?: string
  /** Acciones a la derecha (normalmente Buttons). */
  actions?: ReactNode
  className?: string
}

/** Encabezado de página web. */
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
