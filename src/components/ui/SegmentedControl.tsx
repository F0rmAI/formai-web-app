/**
 * Segmented control primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { SegmentOption } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Text } from './Text'

/**
 * Props accepted by {@link SegmentedControl}.
 *
 * @typeParam T - Union of the option values.
 */
export interface SegmentedControlProps<T extends string> {
  /** Options shown, in order. */
  options: SegmentOption<T>[]
  /** Value of the selected option. */
  value: T
  /** Called with the value of the option the user selects. */
  onChange: (value: T) => void
  /** Accessible label of the group. */
  label?: string
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders a single-choice selector with all options visible.
 *
 * @typeParam T - Union of the option values.
 *
 * @example
 * ```tsx
 * <SegmentedControl options={periods} value={period} onChange={setPeriod} />
 * ```
 */
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
