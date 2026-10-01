/**
 * Text field primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useId, type InputHTMLAttributes } from 'react'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Props accepted by {@link TextField}.
 */
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label shown above the field. */
  label: string
  /** Help text shown below the field. */
  helper?: string
  /** Error message; switches the field to the error state and replaces the help text. */
  error?: string
  /** Icon shown at the start of the field. */
  leadingIcon?: IconName
  /** Icon shown at the end of the field. */
  trailingIcon?: IconName
  /** Called when the trailing icon is activated, for example to toggle password visibility. */
  onTrailingIconClick?: () => void
  /** Accessible label of the trailing icon action. */
  trailingIconLabel?: string
}

/**
 * Renders a labeled text input that fills the available width.
 *
 * @example
 * ```tsx
 * <TextField label="Email" leadingIcon="mail" error={errors.email} />
 * ```
 */
export function TextField({
  label,
  helper,
  error,
  leadingIcon,
  trailingIcon,
  onTrailingIconClick,
  trailingIconLabel,
  id,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const hasError = Boolean(error)
  const message = error ?? helper

  return (
    <div className={cn('flex w-full flex-col gap-sm', className)}>
      <label htmlFor={inputId}>
        <Text as="span" variant="label-m-bold" tone="secondary">
          {label}
        </Text>
      </label>

      <div
        className={cn(
          'flex h-12 items-center gap-md overflow-hidden rounded-md bg-surface-card px-xl transition-colors',
          hasError
            ? 'border-[1.5px] border-error'
            : 'border border-line-outline focus-within:border-[1.5px] focus-within:border-primary',
        )}
      >
        {leadingIcon && (
          <Icon name={leadingIcon} size={20} className={hasError ? 'text-error' : 'text-content-muted'} />
        )}
        <input
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? messageId : undefined}
          className="min-w-0 flex-1 bg-transparent text-body-l text-content-primary outline-none placeholder:text-content-muted"
          {...props}
        />
        {trailingIcon &&
          (onTrailingIconClick ? (
            <button
              type="button"
              aria-label={trailingIconLabel}
              onClick={onTrailingIconClick}
              className="inline-flex cursor-pointer items-center justify-center"
            >
              <Icon name={trailingIcon} size={20} className="text-content-muted" />
            </button>
          ) : (
            <Icon name={trailingIcon} size={20} className="text-content-muted" />
          ))}
      </div>

      {message && (
        <div id={messageId} className="flex items-start gap-xs">
          <Icon name={hasError ? 'error' : 'info'} size={16} className={hasError ? 'text-error' : 'text-content-muted'} />
          <Text as="span" variant="body-m" tone={hasError ? 'error' : 'muted'} className="flex-1">
            {message}
          </Text>
        </div>
      )}
    </div>
  )
}
