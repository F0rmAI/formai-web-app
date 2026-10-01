/**
 * Select field primitive of the design system.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useId, type SelectHTMLAttributes } from 'react'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Describes one option of a select field.
 *
 * @typeParam T - Union of the option values.
 */
export interface SelectOption<T extends string> {
  /** Text shown for the option. */
  label: string
  /** Value reported when the option is selected. */
  value: T
}

/**
 * Props accepted by {@link SelectField}.
 *
 * @typeParam T - Union of the option values.
 */
export interface SelectFieldProps<T extends string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  /** Label shown above the field. */
  label: string
  /** Value of the selected option. */
  value: T
  /** Options shown, in order. */
  options: SelectOption<T>[]
  /** Called with the value of the option the user selects. */
  onChange: (value: T) => void
  /**
   * Icon shown at the start of the field.
   *
   * @defaultValue `'filter_list'`
   */
  icon?: IconName
  /** Option shown while no value is selected; it cannot be chosen. */
  placeholder?: string
  /** Error message; switches the field to the error state. */
  error?: string
}

/**
 * Renders a labeled single-choice field that opens the native list of options.
 *
 * @typeParam T - Union of the option values.
 *
 * @example
 * ```tsx
 * <SelectField label="Status" value={status} options={statusOptions} onChange={setStatus} />
 * ```
 */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  icon = 'filter_list',
  placeholder,
  error,
  id,
  className,
  ...props
}: SelectFieldProps<T>) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={cn('flex w-full flex-col gap-sm', className)}>
      <label htmlFor={selectId}>
        <Text as="span" variant="label-m-bold" tone="secondary">
          {label}
        </Text>
      </label>
      <div
        className={cn(
          'relative flex h-12 items-center rounded-md bg-surface-card px-xl',
          error ? 'border-[1.5px] border-error' : 'border border-line-outline focus-within:border-[1.5px] focus-within:border-primary',
        )}
      >
        <Icon name={icon} size={20} className={error ? 'text-error' : 'text-content-muted'} />
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          aria-invalid={Boolean(error) || undefined}
          className="h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent px-md pr-8 text-body-l text-content-primary outline-none"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="expand_more" size={20} className="pointer-events-none absolute right-xl text-content-muted" />
      </div>
      {error && (
        <div className="flex items-start gap-xs">
          <Icon name="error" size={16} className="text-error" />
          <Text variant="body-m" tone="error">
            {error}
          </Text>
        </div>
      )}
    </div>
  )
}
