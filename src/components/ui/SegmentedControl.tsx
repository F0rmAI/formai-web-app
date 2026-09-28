import type { SegmentOption } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Text } from './Text'

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Texto accesible del grupo. */
  label?: string
  className?: string
}

/** Selector de periodo u opción única. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex items-center gap-xs rounded-full bg-surface-container-low p-xs', className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-9 cursor-pointer items-center justify-center rounded-full px-xl transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              selected ? 'bg-surface-card shadow-card' : 'bg-transparent',
            )}
          >
            <Text
              as="span"
              variant={selected ? 'label-l' : 'body-l-strong'}
              tone={selected ? 'primary' : 'secondary'}
              className="whitespace-nowrap"
            >
              {option.label}
            </Text>
          </button>
        )
      })}
    </div>
  )
}
