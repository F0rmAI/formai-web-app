import type { ButtonHTMLAttributes } from 'react'
import type { ButtonSize, ButtonVariant, IconName, TextTone } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary-bright shadow-glow-primary',
  accent: 'bg-secondary shadow-glow-secondary',
  secondary: 'border border-line-subtle bg-surface-card shadow-card',
  ghost: 'bg-transparent',
  danger: 'bg-error',
}

const sizeClass: Record<ButtonSize, string> = {
  lg: 'h-14 rounded-md px-2xl',
  md: 'h-12 rounded-md px-2xl',
  sm: 'h-8 rounded-full px-xl',
}

const labelTone: Record<ButtonVariant, TextTone> = {
  primary: 'on-primary',
  accent: 'on-primary',
  secondary: 'default',
  ghost: 'primary-bright',
  danger: 'on-primary',
}

const iconColor: Record<ButtonVariant, string> = {
  primary: 'text-content-on-primary',
  accent: 'text-content-on-primary',
  secondary: 'text-primary',
  ghost: 'text-primary-bright',
  danger: 'text-content-on-primary',
}

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  /** Por defecto `primary` (color principal del design system). */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Ícono a la izquierda del texto. */
  icon?: IconName
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  icon,
  fullWidth = false,
  loading = false,
  disabled,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const iconName = loading ? 'progress_activity' : icon

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-md whitespace-nowrap transition-[filter,opacity]',
        'enabled:hover:brightness-95 enabled:active:brightness-90 disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        variantClass[variant],
        sizeClass[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {iconName && (
        <Icon
          name={iconName}
          size={size === 'sm' ? 16 : 20}
          className={cn(iconColor[variant], loading && 'animate-spin')}
        />
      )}
      <Text as="span" variant="label-l" tone={labelTone[variant]}>
        {label}
      </Text>
    </button>
  )
}
