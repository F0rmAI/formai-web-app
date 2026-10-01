/**
 * Text primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ElementType, HTMLAttributes } from 'react'
import type { TextTone, TextVariant } from '@/types/ui'
import { cn } from '@/utils/cn'

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

/**
 * Props accepted by {@link Text}.
 */
export interface TextProps extends HTMLAttributes<HTMLElement> {
  /**
   * Typography style.
   *
   * @defaultValue `'body-l'`
   */
  variant?: TextVariant
  /**
   * Text color.
   *
   * @defaultValue `'default'`
   */
  tone?: TextTone
  /**
   * HTML element to render.
   *
   * @defaultValue `'p'`
   */
  as?: ElementType
}

/**
 * Renders text with a typography style and a color of the design system.
 *
 * @remarks
 * Use it instead of a raw text element so font family, weight and color stay consistent.
 *
 * @example
 * ```tsx
 * <Text variant="title" tone="secondary">
 *   Weekly summary
 * </Text>
 * ```
 */
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
