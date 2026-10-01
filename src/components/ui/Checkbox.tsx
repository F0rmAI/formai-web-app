/**
 * Checkbox primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useId } from 'react'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Props accepted by {@link Checkbox}.
 */
export interface CheckboxProps {
  /** Text shown next to the box. */
  label: string
  /** Whether the box is checked. */
  checked: boolean
  /** Called with the new checked state. */
  onChange: (checked: boolean) => void
  /**
   * Blocks interaction.
   *
   * @defaultValue `false`
   */
  disabled?: boolean
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders a checkbox with its label.
 *
 * @example
 * ```tsx
 * <Checkbox label="I accept the terms" checked={accepted} onChange={setAccepted} />
 * ```
 */
export function Checkbox({ label, checked, onChange, disabled = false, className }: CheckboxProps) {
  const id = useId()

  return (
    <label
      htmlFor={id}
      className={cn('flex cursor-pointer items-start gap-lg', disabled && 'cursor-not-allowed opacity-50', className)}
    >
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          'flex size-[22px] shrink-0 items-center justify-center rounded-sm transition-colors',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
          checked ? 'bg-primary' : 'border-[1.5px] border-line-outline bg-surface-card',
        )}
      >
        {checked && <Icon name="check" size={16} className="text-content-on-primary" />}
      </span>
      <Text as="span" variant="body-l" className="flex-1">
        {label}
      </Text>
    </label>
  )
}
