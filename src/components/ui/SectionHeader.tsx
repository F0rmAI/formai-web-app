import { cn } from '@/utils/cn'
import { Badge } from './Badge'
import { Text } from './Text'

export interface SectionHeaderProps {
  title: string
  /** Texto del Badge contador (p. ej. "14 entrenamientos"). */
  count?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

/** Encabezado de sección con contador y acción opcionales. */
export function SectionHeader({ title, count, actionLabel, onAction, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex w-full items-center gap-md', className)}>
      <Text as="h2" variant="title" className="whitespace-nowrap">
        {title}
      </Text>
      {count && <Badge label={count} />}
      <span className="flex-1" />
      {actionLabel && (
        <button type="button" onClick={onAction} className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-primary">
          <Text as="span" variant="label-m-bold" tone="primary-bright">
            {actionLabel}
          </Text>
        </button>
      )}
    </div>
  )
}
