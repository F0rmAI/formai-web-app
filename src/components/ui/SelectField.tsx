import { useId, type SelectHTMLAttributes } from 'react'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

export interface SelectOption<T extends string> {
  label: string
  value: T
}

export interface SelectFieldProps<T extends string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  icon?: IconName
  error?: string
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  icon = 'filter_list',
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
