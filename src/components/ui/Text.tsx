import type { ElementType, HTMLAttributes } from 'react'
import type { TextTone, TextVariant } from '@/types/ui'
import { cn } from '@/utils/cn'

/** Tamaño/interlineado/tracking salen de tokens.css; el peso se fija aquí. */
const textVariantClass: Record<TextVariant, string> = {
  'display-xl': 'text-display-xl font-extrabold',
  display: 'text-display font-extrabold',
  headline: 'text-headline font-bold',
  title: 'text-title font-semibold',
  'title-strong': 'text-title-strong font-extrabold',
  'label-l': 'text-label-l font-bold',
  'body-l-strong': 'text-body-l-strong font-semibold',
  'body-l': 'text-body-l font-normal',
  'label-m': 'text-label-m font-semibold',
  'label-m-bold': 'text-label-m-bold font-bold',
  'body-m': 'text-body-m font-normal',
  overline: 'text-overline font-bold uppercase',
  caption: 'text-caption font-normal',
}

const textToneClass: Record<TextTone, string> = {
  default: 'text-content-primary',
  secondary: 'text-content-secondary',
  muted: 'text-content-muted',
  subtle: 'text-content-subtle',
  'on-primary': 'text-content-on-primary',
  'on-inverse': 'text-content-on-inverse',
  primary: 'text-primary',
  'primary-bright': 'text-primary-bright',
  accent: 'text-secondary-text',
  tertiary: 'text-tertiary',
  error: 'text-error',
}

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  tone?: TextTone
  /** Etiqueta HTML a renderizar (por defecto `p`). */
  as?: ElementType
}

export function Text({
  variant = 'body-l',
  tone = 'default',
  as: Component = 'p',
  className,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(textVariantClass[variant], textToneClass[tone], className)}
      {...props}
    />
  )
}
